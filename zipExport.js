'use strict';
/**
 * Εξαγωγή σε ZIP για παράδοση εργασίας. Καθαρή λογική με Node (χωρίς Electron), ώστε να δοκιμάζεται απευθείας.
 *
 *  - Αρχεία (το τρέχον ή όλα τα ανοιχτά): μπαίνουν με τις διαδρομές τους ως προς τον κοινό τους φάκελο, ώστε να μένουν
 *    σωστοί οι σύνδεσμοι μεταξύ τους (π.χ. index.html και css/style.css).
 *  - Φάκελος: όλα τα αρχεία του, μαζί με τους υποφακέλους, μέσα σε έναν φάκελο με το ίδιο όνομα στο ZIP.
 */
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const SKIP_DIRS = new Set(['.git', 'node_modules', '.vscode', '__macosx', '$recycle.bin']);
const SKIP_FILES = /^(thumbs\.db|desktop\.ini|\.ds_store)$|^~\$|\.part$/i;
const MAX_FILES = 5000;
const MAX_BYTES = 300 * 1024 * 1024;

/** Όλα τα αρχεία ενός φακέλου (και των υποφακέλων του): [{ abs, rel, size }]· σφάλμα αν είναι υπερβολικά πολλά/μεγάλα. */
function listFolderFiles(dir) {
  const out = [];
  let bytes = 0;
  const walk = (current, relBase) => {
    const entries = fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const abs = path.join(current, entry.name);
      const rel = relBase ? relBase + '/' + entry.name : entry.name;
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name.toLowerCase())) walk(abs, rel);
      } else if (entry.isFile() && !SKIP_FILES.test(entry.name)) {
        const size = fs.statSync(abs).size;
        bytes += size;
        out.push({ abs, rel, size });
        if (out.length > MAX_FILES) throw new Error(`Ο φάκελος έχει πάνω από ${MAX_FILES} αρχεία`);
        if (bytes > MAX_BYTES) throw new Error(`Ο φάκελος είναι μεγαλύτερος από ${Math.round(MAX_BYTES / 1024 / 1024)} MB`);
      }
    }
  };
  walk(dir, '');
  return out;
}

const sameSegment = (a, b) => (process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b);

/** Ο κοινός φάκελος μιας λίστας αρχείων, ή '' αν δεν έχουν κοινό (π.χ. διαφορετικοί δίσκοι). */
function commonDir(files) {
  if (!files.length) return '';
  const split = files.map((f) => path.dirname(path.resolve(f)).split(/[\\/]+/));
  const first = split[0];
  let n = first.length;
  for (const parts of split.slice(1)) {
    let i = 0;
    while (i < n && i < parts.length && sameSegment(parts[i], first[i])) i++;
    n = i;
  }
  if (n === 0) return '';
  const joined = first.slice(0, n).join(path.sep);
  return /^[a-z]:$/i.test(joined) ? joined + path.sep : joined;
}

/**
 * Οι εγγραφές του ZIP: [{ abs, name }].
 * request: { mode: 'files', files: [διαδρομές] } ή { mode: 'folder', folder }
 */
function zipEntries(request) {
  if (request.mode === 'folder') {
    const folder = path.resolve(request.folder);
    const root = path.basename(folder) || 'ergasia';
    return listFolderFiles(folder).map((f) => ({ abs: f.abs, name: root + '/' + f.rel }));
  }
  const files = [...new Set((request.files || []).map((f) => path.resolve(f)))].filter((f) => fs.existsSync(f) && fs.statSync(f).isFile());
  const base = commonDir(files);
  const used = new Set();
  return files.map((abs) => {
    let name = base ? path.relative(base, abs).split(path.sep).join('/') : path.basename(abs);
    // χωρίς κοινό φάκελο δύο αρχεία μπορεί να έχουν το ίδιο όνομα: το δεύτερο παίρνει αριθμό
    if (used.has(name.toLowerCase())) {
      const ext = path.extname(name);
      let i = 2;
      while (used.has(`${name.slice(0, name.length - ext.length)} (${i})${ext}`.toLowerCase())) i++;
      name = `${name.slice(0, name.length - ext.length)} (${i})${ext}`;
    }
    used.add(name.toLowerCase());
    return { abs, name };
  });
}

/** Ο φάκελος που προτείνεται για την αποθήκευση του ZIP (δίπλα στον φάκελο της εργασίας, όχι μέσα του). */
function suggestedZipDir(request) {
  if (request.mode === 'folder') return path.dirname(path.resolve(request.folder));
  return commonDir((request.files || []).map((f) => path.resolve(f))) || path.dirname(path.resolve((request.files || [])[0] || '.'));
}

/** Γράφει το ZIP στο outPath. Το ίδιο το ZIP δεν μπαίνει ποτέ μέσα στον εαυτό του. Επιστρέφει { count, bytes }. */
async function writeZip(entries, outPath) {
  const zip = new JSZip();
  const target = path.resolve(outPath).toLowerCase();
  let count = 0;
  for (const entry of entries) {
    if (path.resolve(entry.abs).toLowerCase() === target) continue;
    zip.file(entry.name, fs.readFileSync(entry.abs), { date: fs.statSync(entry.abs).mtime });
    count++;
  }
  const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  fs.writeFileSync(outPath, buffer);
  return { count, bytes: buffer.length };
}

module.exports = { listFolderFiles, commonDir, zipEntries, suggestedZipDir, writeZip };
