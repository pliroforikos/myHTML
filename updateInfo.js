'use strict';
/**
 * Ενημερώσεις από το GitHub: καθαρή λογική, χωρίς Electron (δοκιμάζεται απευθείας με node).
 *  - Ποια είναι η τελευταία έκδοση (πρώτα από το latest.yml του release, που δεν μετράει στο όριο αιτήσεων του API
 *    του GitHub, γιατί σε σχολικό εργαστήριο όλοι οι υπολογιστές βγαίνουν από την ίδια διεύθυνση IP· μετά από το API).
 *  - Σημειώσεις έκδοσης σε απλό κείμενο.
 *  - Λήψη αρχείου με πρόοδο, έλεγχο μεγέθους και αθροίσματος (sha256) και μετονομασία μόνο όταν είναι ολόκληρο.
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const crypto = require('crypto');

const USER_AGENT = 'EduHTML-Studio-Updater';
const MAX_REDIRECTS = 5;

/** Αριθμοί μιας έκδοσης: «v1.7.0» → [1, 7, 0]. Επιστρέφει null αν δεν μοιάζει με έκδοση. */
function parseVersion(v) {
  const m = /^v?(\d+(?:\.\d+)*)/.exec(String(v || '').trim());
  return m ? m[1].split('.').map(Number) : null;
}

/** 1 αν a > b, -1 αν a < b, 0 αν ίσες (ή αν κάποια δεν είναι έκδοση). */
function compareVersions(a, b) {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  if (!pa || !pb) return 0;
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0;
    const y = pb[i] || 0;
    if (x !== y) return x > y ? 1 : -1;
  }
  return 0;
}

const MAX_NOTES = 2000;

/**
 * Σημειώσεις του release (markdown) σε απλό κείμενο για το παράθυρο ενημέρωσης: χωρίς σύμβολα markdown, χωρίς το τμήμα
 * «Λήψη Αρχείων» και τις οδηγίες εγκατάστασης (τα αρχεία κατεβαίνουν από την ίδια την εφαρμογή).
 */
function releaseNotesToText(body) {
  const lines = String(body || '').replace(/\r/g, '').split('\n');
  const out = [];
  let skipping = false;
  for (const raw of lines) {
    const heading = /^#{1,6}\s+(.*)$/.exec(raw);
    if (heading) skipping = /Λήψη\s+Αρχείων|Οδηγός\s+Εγκατάστασης/i.test(heading[1]);
    if (skipping) continue;
    if (/^\s*📖/.test(raw) || /^\s*\|/.test(raw) || /^\s*(?:---+|___+|\*\*\*+)\s*$/.test(raw)) continue;
    let line = raw.replace(/\s+$/, '');
    if (heading) {
      if (out.length && out[out.length - 1] !== '') out.push('');
      line = heading[1];
    } else {
      line = line.replace(/^(\s*)[-*+]\s+/, '$1• ').replace(/^\s*>\s?/, '');
    }
    // Τα τμήματα κώδικα (`…`) προστατεύονται: μέσα τους μένουν ως έχουν ετικέτες HTML όπως το <img src="">
    // (η εφαρμογή διδάσκει HTML, οπότε οι σημειώσεις τις αναφέρουν συχνά), και βγαίνουν χωρίς τα backticks.
    const codeSpans = [];
    line = line
      .replace(/`([^`]+)`/g, (_, code) => `\u0000${codeSpans.push(code) - 1}\u0000`)
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/<\/?[a-z][^>]*>/gi, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/\u0000(\d+)\u0000/g, (_, i) => codeSpans[Number(i)]);
    if (line === '' && (out.length === 0 || out[out.length - 1] === '')) continue;
    out.push(line);
  }
  while (out.length && out[out.length - 1] === '') out.pop();
  const text = out.join('\n');
  if (text.length <= MAX_NOTES) return text;
  const cut = text.slice(0, MAX_NOTES);
  return cut.slice(0, Math.max(cut.lastIndexOf('\n'), MAX_NOTES / 2)).trimEnd() + '\n…';
}

/** Από την απάντηση του GitHub (releases/latest ή releases/tags/…) κρατά ό,τι χρειάζεται η εφαρμογή. */
function parseRelease(json) {
  if (!json || typeof json !== 'object' || json.draft || json.prerelease || !parseVersion(json.tag_name)) return null;
  return {
    version: parseVersion(json.tag_name).join('.'),
    name: json.name || json.tag_name,
    notes: releaseNotesToText(json.body),
    url: json.html_url || '',
    assets: (json.assets || []).map((a) => ({
      name: a.name,
      size: a.size || 0,
      url: a.browser_download_url || '',
      digest: a.digest || '', // «sha256:…» (το δίνει το GitHub για νέα αρχεία)
    })),
  };
}

/** Η έκδοση που γράφει το latest.yml (το αρχείο που φτιάχνει το electron-builder και διαβάζει ο electron-updater). */
function parseLatestYml(text) {
  const m = /^version:\s*['"]?([0-9][^'"\s]*)['"]?\s*$/m.exec(String(text || ''));
  return m ? m[1] : null;
}

/** GET που ακολουθεί ανακατευθύνσεις. Επιστρέφει το σώμα ως κείμενο· σφάλμα αν δεν υπάρχει σύνδεση ή δεν είναι 200. */
function getText(url, { timeoutMs = 10000, accept = '*/*', redirects = 0 } = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https:') ? https : http;
    const req = lib.get(url, { headers: { 'User-Agent': USER_AGENT, Accept: accept } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        if (redirects >= MAX_REDIRECTS) return reject(new Error('Πολλές ανακατευθύνσεις'));
        const next = new URL(res.headers.location, url).toString();
        getText(next, { timeoutMs, accept, redirects: redirects + 1 }).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { body += c; });
      res.on('end', () => resolve(body));
    });
    req.setTimeout(timeoutMs, () => req.destroy(new Error('Λήξη χρόνου αναμονής')));
    req.on('error', reject);
  });
}

async function getJson(url, timeoutMs) {
  return JSON.parse(await getText(url, { timeoutMs, accept: 'application/vnd.github+json' }));
}

/**
 * Η τελευταία δημοσιευμένη έκδοση ως «1.7.0», ή null αν δεν υπάρχει release.
 * ep: { webBase, apiBase, owner, repo }
 */
async function fetchLatestVersion(ep) {
  try {
    const yml = await getText(`${ep.webBase}/${ep.owner}/${ep.repo}/releases/latest/download/latest.yml`);
    const v = parseLatestYml(yml);
    if (v) return v;
  } catch (_) {
    // το release δεν έχει latest.yml ή δεν απαντά: δοκιμάζουμε το API
  }
  const rel = parseRelease(await getJson(`${ep.apiBase}/repos/${ep.owner}/${ep.repo}/releases/latest`));
  return rel ? rel.version : null;
}

/**
 * Σημειώσεις και αρχεία του release της έκδοσης version. Δεν πετά ποτέ σφάλμα: αν το API δεν απαντά (π.χ. όριο
 * αιτήσεων) επιστρέφει ό,τι χρειάζεται για να προχωρήσει η ενημέρωση, χωρίς σημειώσεις.
 */
async function fetchRelease(ep, version) {
  const fallback = {
    version,
    name: `v${version}`,
    notes: '',
    url: `${ep.webBase}/${ep.owner}/${ep.repo}/releases/tag/v${version}`,
    assets: [],
  };
  try {
    const rel = parseRelease(await getJson(`${ep.apiBase}/repos/${ep.owner}/${ep.repo}/releases/tags/v${version}`));
    return rel ? { ...fallback, ...rel } : fallback;
  } catch (_) {
    return fallback;
  }
}

/** Το sha256 (δεκαεξαδικό) από μια τιμή «sha256:…» του GitHub, ή '' αν δεν υπάρχει. */
function sha256Of(digest) {
  const m = /^sha256:([0-9a-f]{64})$/i.exec(String(digest || ''));
  return m ? m[1].toLowerCase() : '';
}

/**
 * Κατεβάζει το url στο dest. Γράφει πρώτα σε προσωρινό αρχείο και το μετονομάζει μόνο αν το αρχείο είναι ολόκληρο
 * (μέγεθος, sha256 αν δίνεται) και είναι εκτελέσιμο των Windows (αρχίζει από «MZ»), ώστε μια σελίδα σφάλματος ή ένα
 * μισοκατεβασμένο αρχείο να μην εμφανιστεί ποτέ ως νέα έκδοση.
 * opts: { size, sha256, onProgress(percent), timeoutMs }
 */
function downloadFile(url, dest, opts = {}) {
  return new Promise((resolve, reject) => {
    const part = `${dest}.part`;
    let settled = false;
    let redirects = 0;
    let activeReq = null;

    const finish = (err) => {
      if (settled) return;
      settled = true;
      if (err) {
        try { if (activeReq) activeReq.destroy(); } catch (_) { /* ήδη κλειστό */ }
        try { fs.rmSync(part, { force: true }); } catch (_) { /* δεν υπάρχει */ }
        reject(err);
      } else {
        resolve(dest);
      }
    };

    const get = (u) => {
      const lib = u.startsWith('https:') ? https : http;
      const req = lib.get(u, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/octet-stream' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          if (++redirects > MAX_REDIRECTS) return finish(new Error('Πολλές ανακατευθύνσεις'));
          return get(new URL(res.headers.location, u).toString());
        }
        if (res.statusCode !== 200) {
          res.resume();
          return finish(new Error(`HTTP ${res.statusCode}`));
        }
        const total = Number(res.headers['content-length']) || opts.size || 0;
        const hash = crypto.createHash('sha256');
        const out = fs.createWriteStream(part);
        let got = 0;
        let lastPercent = -1;
        let complete = false;

        res.on('data', (chunk) => {
          got += chunk.length;
          hash.update(chunk);
          if (total && opts.onProgress) {
            const percent = Math.min(100, Math.floor((got / total) * 100));
            if (percent !== lastPercent) {
              lastPercent = percent;
              opts.onProgress(percent);
            }
          }
        });
        res.on('end', () => { complete = true; });
        res.on('error', finish);
        out.on('error', finish);
        out.on('close', () => {
          if (settled) return;
          if (!complete) return finish(new Error('Η λήψη διακόπηκε'));
          if (opts.size && got !== opts.size) return finish(new Error(`Λάθος μέγεθος αρχείου (${got} αντί για ${opts.size} bytes)`));
          if (total && got !== total) return finish(new Error('Η λήψη δεν ολοκληρώθηκε'));
          if (opts.sha256 && hash.digest('hex') !== opts.sha256.toLowerCase()) return finish(new Error('Το άθροισμα ελέγχου (sha256) δεν ταιριάζει'));
          try {
            const fd = fs.openSync(part, 'r');
            const head = Buffer.alloc(2);
            fs.readSync(fd, head, 0, 2, 0);
            fs.closeSync(fd);
            if (head.toString('latin1') !== 'MZ') return finish(new Error('Το αρχείο δεν είναι εκτελέσιμο των Windows'));
            fs.renameSync(part, dest);
          } catch (e) {
            return finish(e);
          }
          finish(null);
        });
        res.pipe(out);
      });
      activeReq = req;
      req.setTimeout(opts.timeoutMs || 30000, () => req.destroy(new Error('Λήξη χρόνου αναμονής')));
      req.on('error', finish);
    };
    get(url);
  });
}

module.exports = {
  parseVersion, compareVersions, releaseNotesToText, parseRelease, parseLatestYml,
  getText, getJson, fetchLatestVersion, fetchRelease, sha256Of, downloadFile,
};
