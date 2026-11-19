'use strict';
/**
 * Ενημέρωση της εφαρμογής από το GitHub (releases), μέσα από την ίδια την εφαρμογή.
 *
 * Ο έλεγχος για νέα έκδοση γίνεται για όλους. Η εγκατάσταση εξαρτάται από το πώς εγκαταστάθηκε η εφαρμογή:
 *  - «setup»  (Setup.exe, ανά χρήστη): κατεβαίνει η ενημέρωση με τον electron-updater (διαφορική, με έλεγχο sha512),
 *             εγκαθίσταται σιωπηλά και η εφαρμογή ξεκινά ξανά. Χρειάζονται το latest.yml και το .blockmap στο release.
 *  - «portable» (φορητή έκδοση): κατεβαίνει η νέα φορητή έκδοση (.exe) δίπλα στην τρέχουσα και ξεκινά από εκεί.
 *  - «msi»    (εγκατάσταση για όλους τους χρήστες, χρειάζεται διαχειριστή) και σε λειτουργία ανάπτυξης:
 *             ανοίγει η σελίδα λήψης του release.
 *
 * Καταστάσεις που στέλνονται στο παράθυρο (κανάλι 'update'):
 *   { state: 'available', version, notes, url, kind, canInstall }
 *   { state: 'downloading', version, percent, kind }
 *   { state: 'ready', version, kind, file? }
 *   { state: 'none', current }                 (μόνο στον χειροκίνητο έλεγχο)
 *   { state: 'error', error, url, phase }      phase: 'check' | 'download' | 'launch'
 */
const { app, ipcMain, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const info = require('./updateInfo');

/**
 * Η εφαρμογή εγκαταστάθηκε με το Setup (NSIS) όταν δίπλα στο εκτελέσιμο υπάρχει ο uninstaller του, «Uninstall <όνομα>.exe».
 * Το MSI και η φορητή έκδοση δεν έχουν τέτοιο αρχείο.
 */
function hasSetupUninstaller(dir) {
  try {
    return fs.readdirSync(dir).some((name) => /^Uninstall .+\.exe$/i.test(name));
  } catch (_) {
    return false;
  }
}

class Updater {
  /**
   * opts: { owner, repo, getWin(), currentVersion() }
   * Μόνο για δοκιμές: webBase, apiBase (άλλος διακομιστής), kind (τύπος εγκατάστασης), downloadDir, configure(autoUpdater).
   */
  constructor(opts) {
    this.owner = opts.owner;
    this.repo = opts.repo;
    this.getWin = opts.getWin;
    this.currentVersion = opts.currentVersion;
    this.webBase = opts.webBase || 'https://github.com';
    this.apiBase = opts.apiBase || 'https://api.github.com';
    this.kindOverride = opts.kind || null;
    this.downloadDir = opts.downloadDir || null;
    this.configure = opts.configure || null;
    this.latest = null;
    this.state = { state: 'idle' };
    this.busy = false;
    this.au = null;
    this.downloaded = false;
    this.portableFile = null;
  }

  get endpoints() {
    return { webBase: this.webBase, apiBase: this.apiBase, owner: this.owner, repo: this.repo };
  }

  get releaseUrl() {
    return (this.latest && this.latest.url) || `${this.webBase}/${this.owner}/${this.repo}/releases/latest`;
  }

  /** 'setup' | 'portable' | 'msi' | 'dev' | 'other' */
  installKind() {
    if (this.kindOverride) return this.kindOverride;
    if (!app.isPackaged) return 'dev';
    if (process.platform !== 'win32') return 'other';
    if (process.env.PORTABLE_EXECUTABLE_FILE || process.env.PORTABLE_EXECUTABLE_DIR) return 'portable';
    const hasUninstaller = hasSetupUninstaller(path.dirname(process.execPath));
    const hasUpdateConfig = fs.existsSync(path.join(process.resourcesPath, 'app-update.yml'));
    return hasUninstaller && hasUpdateConfig ? 'setup' : 'msi';
  }

  canInstall() {
    const kind = this.installKind();
    return kind === 'setup' || kind === 'portable';
  }

  publish(state) {
    state = { current: this.currentVersion(), kind: this.installKind(), ...state };
    this.state = state;
    const win = this.getWin();
    if (win && !win.isDestroyed()) win.webContents.send('update', state);
    return state;
  }

  /** manual: ο χρήστης ζήτησε τον έλεγχο (ενημερώνεται και όταν δεν υπάρχει νέα έκδοση ή αποτύχει). */
  async check(manual = false) {
    if (this.busy || this.state.state === 'downloading' || this.state.state === 'ready') return this.state;
    this.busy = true;
    try {
      const version = await info.fetchLatestVersion(this.endpoints);
      const current = this.currentVersion();
      if (!version || info.compareVersions(version, current) <= 0) {
        this.latest = null;
        const none = { state: 'none', current };
        return manual ? this.publish(none) : none;
      }
      this.latest = await info.fetchRelease(this.endpoints, version);
      return this.publish({
        state: 'available', version, notes: this.latest.notes, url: this.latest.url, canInstall: this.canInstall(),
      });
    } catch (e) {
      const err = { state: 'error', phase: 'check', error: e.message, url: this.releaseUrl };
      return manual ? this.publish(err) : err;
    } finally {
      this.busy = false;
    }
  }

  // ------------------------------------------------------------------ Setup.exe (electron-updater)
  _autoUpdater() {
    if (this.au) return this.au;
    const { autoUpdater } = require('electron-updater');
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false; // η εγκατάσταση γίνεται μόνο όταν την ζητήσει ο χρήστης
    autoUpdater.allowDowngrade = false;
    autoUpdater.disableWebInstaller = true; // δεν χρησιμοποιούμε web installer
    autoUpdater.setFeedURL({ provider: 'github', owner: this.owner, repo: this.repo });
    autoUpdater.on('download-progress', (p) => {
      this.publish({ state: 'downloading', version: this.latest && this.latest.version, percent: Math.round(p.percent || 0) });
    });
    autoUpdater.on('update-downloaded', () => {
      this.downloaded = true;
      this.publish({ state: 'ready', version: this.latest && this.latest.version });
    });
    autoUpdater.on('error', (e) => {
      if (this.state.state === 'downloading') {
        this.publish({ state: 'error', phase: 'download', error: e && e.message, url: this.releaseUrl });
      }
    });
    if (this.configure) this.configure(autoUpdater);
    this.au = autoUpdater;
    return autoUpdater;
  }

  async _downloadSetup() {
    if (this.downloaded) return this.publish({ state: 'ready', version: this.latest.version });
    this.publish({ state: 'downloading', version: this.latest.version, percent: 0 });
    try {
      const au = this._autoUpdater();
      const result = await au.checkForUpdates();
      if (!result || !result.updateInfo || info.compareVersions(result.updateInfo.version, this.currentVersion()) <= 0) {
        throw new Error('Δεν βρέθηκε το αρχείο ενημέρωσης (latest.yml) στο release');
      }
      this.latest.version = result.updateInfo.version;
      await au.downloadUpdate();
    } catch (e) {
      return this.publish({ state: 'error', phase: 'download', error: e.message, url: this.releaseUrl });
    }
    return this.state;
  }

  // ------------------------------------------------------------------ φορητή έκδοση
  /** Το αρχείο της νέας φορητής έκδοσης: από το release ή, αν το API δεν απάντησε, με το όνομα που έχει πάντα. */
  _portableAsset() {
    const version = this.latest.version;
    const found = (this.latest.assets || []).find((a) => /portable.*\.exe$/i.test(a.name));
    if (found) return found;
    const name = `EduHTML.Studio-Portable-${version}.exe`;
    return { name, size: 0, digest: '', url: `${this.webBase}/${this.owner}/${this.repo}/releases/download/v${version}/${name}` };
  }

  /** Ο φάκελος της φορητής έκδοσης, αλλιώς ο φάκελος Λήψεις του χρήστη (αν ο πρώτος δεν γράφεται, π.χ. κλειδωμένο USB). */
  _portableTargetDir() {
    const candidates = [this.downloadDir, process.env.PORTABLE_EXECUTABLE_DIR, app.getPath('downloads')].filter(Boolean);
    for (const dir of candidates) {
      try {
        fs.mkdirSync(dir, { recursive: true });
        fs.accessSync(dir, fs.constants.W_OK);
        return dir;
      } catch (_) { /* δοκιμάζουμε τον επόμενο */ }
    }
    return null;
  }

  async _downloadPortable() {
    const version = this.latest.version;
    if (this.portableFile && fs.existsSync(this.portableFile)) {
      return this.publish({ state: 'ready', version, file: this.portableFile });
    }
    const dir = this._portableTargetDir();
    if (!dir) {
      return this.publish({ state: 'error', phase: 'download', error: 'Δεν υπάρχει φάκελος με δικαίωμα εγγραφής για τη λήψη', url: this.releaseUrl });
    }
    const asset = this._portableAsset();
    this.publish({ state: 'downloading', version, percent: 0 });
    try {
      const dest = path.join(dir, asset.name);
      await info.downloadFile(asset.url, dest, {
        size: asset.size,
        sha256: info.sha256Of(asset.digest),
        onProgress: (percent) => this.publish({ state: 'downloading', version, percent }),
      });
      this.portableFile = dest;
      return this.publish({ state: 'ready', version, file: dest });
    } catch (e) {
      return this.publish({ state: 'error', phase: 'download', error: e.message, url: this.releaseUrl });
    }
  }

  _launchPortable() {
    const file = this.portableFile;
    // Η νέα φορητή έκδοση ορίζει μόνη της τις δικές της μεταβλητές PORTABLE_*
    const env = { ...process.env };
    for (const k of Object.keys(env)) if (k.startsWith('PORTABLE_EXECUTABLE')) delete env[k];
    try {
      const child = spawn(file, [], { detached: true, stdio: 'ignore', cwd: path.dirname(file), env });
      child.once('error', (e) => this.publish({ state: 'error', phase: 'launch', error: e.message, url: this.releaseUrl, file }));
      child.once('spawn', () => {
        child.unref();
        setTimeout(() => app.quit(), 400);
      });
    } catch (e) {
      this.publish({ state: 'error', phase: 'launch', error: e.message, url: this.releaseUrl, file });
    }
  }

  // ------------------------------------------------------------------ ενέργειες του χρήστη
  /** «Ενημέρωση τώρα»: κατεβάζει (Setup, φορητή) ή ανοίγει τη σελίδα λήψης (MSI, ανάπτυξη). */
  async download() {
    if (!this.latest) return this.state;
    if (this.state.state === 'downloading') return this.state;
    const kind = this.installKind();
    if (kind === 'setup') return this._downloadSetup();
    if (kind === 'portable') return this._downloadPortable();
    shell.openExternal(this.releaseUrl);
    return this.state;
  }

  /** «Επανεκκίνηση και εγκατάσταση»: κλείνει την εφαρμογή και ξεκινά η νέα έκδοση. */
  install() {
    if (this.state.state !== 'ready') return false;
    const kind = this.installKind();
    if (kind === 'setup' && this.downloaded && this.au) {
      // σιωπηλή εγκατάσταση και αυτόματη επανεκκίνηση της εφαρμογής
      setImmediate(() => this.au.quitAndInstall(true, true));
      return true;
    }
    if (kind === 'portable' && this.portableFile) {
      this._launchPortable();
      return true;
    }
    return false;
  }

  register() {
    ipcMain.handle('update:check', (_e, manual) => this.check(!!manual));
    ipcMain.handle('update:download', () => this.download());
    ipcMain.handle('update:install', () => this.install());
    ipcMain.handle('update:state', () => this.state);
  }
}

module.exports = { Updater, hasSetupUninstaller };
