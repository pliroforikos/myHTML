const { app, BrowserWindow, ipcMain, dialog, shell, Menu, nativeTheme, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const https = require('https');

// Συγχρονισμός θέματος με τα Windows 11
nativeTheme.themeSource = 'dark';

let mainWindow;

function createWindow() {
  const settings = loadSettings();
  const isLight = settings.theme && settings.theme.startsWith('light');
  nativeTheme.themeSource = isLight ? 'light' : 'dark';

  const iconPath = path.join(__dirname, 'src', 'assets', 'icon.png');
  const windowConfig = {
    width: 1366,
    height: 860,
    minWidth: 960,
    minHeight: 600,
    title: 'EduHTML Studio - Εκπαιδευτικός HTML & CSS Editor (Windows 11)',
    backgroundColor: isLight ? '#f8fafc' : '#0f172a',
    autoHideMenuBar: true, // Απόκρυψη της γκρι γραμμής μενού των Windows για καθαρή εμφάνιση
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false, // Επιτρέπει φόρτωση τοπικών εικόνων και πόρων (file://) στην προεπισκόπηση
      webviewTag: true
    }
  };

  if (fs.existsSync(iconPath)) {
    windowConfig.icon = iconPath;
  }

  mainWindow = new BrowserWindow(windowConfig);
  mainWindow.maximize(); // Πάντα άνοιγμα σε πλήρη οθόνη (Maximized)

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  setupMenu();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    {
      label: 'Αρχείο',
      submenu: [
        {
          label: 'Νέο Αρχείο',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow.webContents.send('menu:new')
        },
        {
          label: 'Άνοιγμα HTML...',
          accelerator: 'CmdOrCtrl+O',
          click: () => mainWindow.webContents.send('menu:open')
        },
        { type: 'separator' },
        {
          label: 'Αποθήκευση HTML',
          accelerator: 'CmdOrCtrl+S',
          click: () => mainWindow.webContents.send('menu:save')
        },
        {
          label: 'Αποθήκευση ως...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => mainWindow.webContents.send('menu:saveAs')
        },
        { type: 'separator' },
        {
          label: 'Εξαγωγή για Παράδοση (ZIP)...',
          click: () => mainWindow.webContents.send('menu:exportZip')
        },
        { type: 'separator' },
        isMac ? { role: 'close', label: 'Κλείσιμο' } : { role: 'quit', label: 'Έξοδος' }
      ]
    },
    {
      label: 'Επεξεργασία',
      submenu: [
        { role: 'undo', label: 'Αναίρεση' },
        { role: 'redo', label: 'Επανάληψη' },
        { type: 'separator' },
        { role: 'cut', label: 'Αποκοπή' },
        { role: 'copy', label: 'Αντιγραφή' },
        { role: 'paste', label: 'Επικόλληση' },
        { role: 'selectAll', label: 'Επιλογή Όλων' },
        { type: 'separator' },
        {
          label: 'Μορφοποίηση Κώδικα (Beautify)',
          accelerator: 'Shift+Alt+F',
          click: () => mainWindow.webContents.send('menu:formatCode')
        }
      ]
    },
    {
      label: 'Προβολή & Εκτέλεση',
      submenu: [
        {
          label: 'Ανανέωση Προεπισκόπησης',
          accelerator: 'F5',
          click: () => mainWindow.webContents.send('menu:refreshPreview')
        },
        {
          label: 'Άνοιγμα στον Microsoft Edge / Εξωτερικό Browser',
          accelerator: 'CmdOrCtrl+B',
          click: () => mainWindow.webContents.send('menu:openEdge')
        },
        { type: 'separator' },
        {
          label: 'Εναλλαγή Οδηγού Εντολών',
          accelerator: 'CmdOrCtrl+G',
          click: () => mainWindow.webContents.send('menu:toggleGuide')
        },
        {
          label: 'Εναλλαγή Λειτουργίας (Αρχάριος / Προχωρημένος)',
          accelerator: 'CmdOrCtrl+M',
          click: () => mainWindow.webContents.send('menu:toggleMode')
        },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Επαναφορά Μεγέθυνσης' },
        { role: 'zoomIn', label: 'Μεγέθυνση (Zoom In)' },
        { role: 'zoomOut', label: 'Σμίκρυνση (Zoom Out)' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Πλήρης Οθόνη' }
      ]
    },
    {
      label: 'Βοήθεια',
      submenu: [
        {
          label: 'Έλεγχος για Ενημερώσεις...',
          click: () => mainWindow && mainWindow.webContents.send('menu:checkUpdates')
        },
        { type: 'separator' },
        {
          label: 'Σχετικά με το EduHTML Studio',
          click: () => mainWindow && mainWindow.webContents.send('menu:about')
        },
        {
          label: 'Εργαλεία Προγραμματιστή (DevTools)',
          accelerator: 'F12',
          click: () => mainWindow && mainWindow.webContents.toggleDevTools()
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Φάκελος mywebpages μέσα στο My Documents
const defaultWebpagesDir = path.join(app.getPath('documents'), 'mywebpages');
if (!fs.existsSync(defaultWebpagesDir)) {
  try {
    fs.mkdirSync(defaultWebpagesDir, { recursive: true });
  } catch (err) {
    console.error('Σφάλμα δημιουργίας φακέλου mywebpages:', err);
  }
}

function getSettingsPath() {
  return path.join(app.getPath('userData'), 'settings.json');
}

function loadSettings() {
  const defaults = {
    saveDirectory: defaultWebpagesDir,
    browser: 'msedge', // 'msedge' | 'chrome' | 'firefox' | 'brave' | 'default'
    hideBeginnerControls: false,
    theme: 'dark' // 'dark' | 'dark-charcoal' | 'dark-graphite' | 'dark-steel' | 'light' | 'light-gray' | 'light-warm'
  };
  try {
    const sPath = getSettingsPath();
    if (fs.existsSync(sPath)) {
      const data = JSON.parse(fs.readFileSync(sPath, 'utf-8'));
      return { ...defaults, ...data };
    }
  } catch (err) {
    console.error('Σφάλμα ανάγνωσης ρυθμίσεων:', err);
  }
  return defaults;
}

function saveSettings(settings) {
  try {
    const sPath = getSettingsPath();
    fs.writeFileSync(sPath, JSON.stringify(settings, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Σφάλμα αποθήκευσης ρυθμίσεων:', err);
    return false;
  }
}

// IPC Handlers
ipcMain.handle('dialog:openFile', async (event, filters) => {
  const settings = loadSettings();
  const baseDir = (settings.saveDirectory && fs.existsSync(settings.saveDirectory))
    ? settings.saveDirectory
    : defaultWebpagesDir;

  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Άνοιγμα Αρχείου',
    defaultPath: baseDir,
    properties: ['openFile'],
    filters: filters || [
      { name: 'Αρχεία Web', extensions: ['html', 'htm', 'css', 'txt'] },
      { name: 'Όλα τα αρχεία', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    const content = fs.readFileSync(filePath, 'utf-8');
    return { filePath, content };
  }
  return null;
});

function getApplicationVersion() {
  try {
    const pkgPath = path.join(__dirname, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      if (pkg.version) return pkg.version;
    }
  } catch (e) {
    console.warn('Could not read package.json version:', e.message);
  }
  return app.getVersion();
}

ipcMain.handle('app:getVersion', () => {
  return getApplicationVersion();
});

ipcMain.handle('settings:get', () => {
  return loadSettings();
});

ipcMain.handle('settings:save', (event, newSettings) => {
  const current = loadSettings();
  const updated = { ...current, ...newSettings };
  saveSettings(updated);
  return updated;
});

ipcMain.handle('settings:selectFolder', async (event, currentPath) => {
  const settings = loadSettings();
  const res = await dialog.showOpenDialog(mainWindow, {
    title: 'Επιλογή Προεπιλεγμένου Φακέλου Αποθήκευσης',
    defaultPath: currentPath || settings.saveDirectory || defaultWebpagesDir,
    properties: ['openDirectory', 'createDirectory']
  });
  if (!res.canceled && res.filePaths.length > 0) {
    return res.filePaths[0];
  }
  return null;
});

ipcMain.handle('dialog:saveFile', async (event, { defaultPath, content, filters }) => {
  const settings = loadSettings();
  const baseDir = (settings.saveDirectory && fs.existsSync(settings.saveDirectory))
    ? settings.saveDirectory
    : defaultWebpagesDir;
  let targetDefault;
  if (defaultPath && path.isAbsolute(defaultPath)) {
    targetDefault = defaultPath;
  } else {
    const fileName = defaultPath ? path.basename(defaultPath) : 'index.html';
    targetDefault = path.join(baseDir, fileName);
  }

  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: targetDefault,
    filters: filters || [
      { name: 'Αρχείο HTML', extensions: ['html'] },
      { name: 'Αρχείο CSS', extensions: ['css'] },
      { name: 'Όλα τα αρχεία', extensions: ['*'] }
    ]
  });

  if (!result.canceled && result.filePath) {
    fs.writeFileSync(result.filePath, content, 'utf-8');
    return { success: true, filePath: result.filePath };
  }
  return { success: false };
});

const { exec } = require('child_process');

ipcMain.handle('app:openInExternalBrowser', async (event, payload) => {
  try {
    const settings = loadSettings();
    let target = '';
    const selectedBrowser = (payload && payload.browser) ? payload.browser : (settings.browser || 'msedge');

    if (payload && payload.isUrl && payload.url) {
      target = payload.url;
    } else if (payload && payload.filePath && fs.existsSync(payload.filePath)) {
      // Αν το αρχείο έχει ήδη αποθηκευτεί, συγχρονίζουμε το τελευταίο περιεχόμενο και ανοίγουμε το πραγματικό αρχείο
      if (payload.content) {
        try {
          fs.writeFileSync(payload.filePath, payload.content, 'utf-8');
        } catch (e) {
          console.error('Σφάλμα συγχρονισμού αρχείου πριν το άνοιγμα στον browser:', e);
        }
      }
      target = payload.filePath;
    } else {
      // Αν δεν έχει αποθηκευτεί ακόμα με όνομα, το αποθηκεύουμε προσωρινά στον φάκελο εργασίας του χρήστη
      // ώστε ο browser να μπορεί να βρει τις εικόνες του
      const baseDir = (payload && payload.workingDir && fs.existsSync(payload.workingDir))
        ? payload.workingDir
        : ((settings.saveDirectory && fs.existsSync(settings.saveDirectory)) ? settings.saveDirectory : defaultWebpagesDir);

      const htmlContent = (typeof payload === 'string') ? payload : (payload && payload.content ? payload.content : '');
      let tempFile;
      try {
        if (!fs.existsSync(baseDir)) {
          fs.mkdirSync(baseDir, { recursive: true });
        }
        tempFile = path.join(baseDir, '_preview_temp.html');
        fs.writeFileSync(tempFile, htmlContent, 'utf-8');
      } catch (err) {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eduhtml-'));
        tempFile = path.join(tempDir, 'preview.html');
        fs.writeFileSync(tempFile, htmlContent, 'utf-8');
      }
      target = tempFile;
    }

    let command = '';
    switch (selectedBrowser) {
      case 'chrome':
        command = `start chrome "${target}"`;
        break;
      case 'firefox':
        command = `start firefox "${target}"`;
        break;
      case 'brave':
        command = `start brave "${target}"`;
        break;
      case 'default':
        command = '';
        break;
      case 'msedge':
      default:
        command = `start msedge "${target}"`;
        break;
    }

    if (command) {
      exec(command, (error) => {
        if (error) {
          if (payload && payload.isUrl) {
            shell.openExternal(target);
          } else {
            shell.openPath(target);
          }
        }
      });
    } else {
      if (payload && payload.isUrl) {
        await shell.openExternal(target);
      } else {
        await shell.openPath(target);
      }
    }

    return { success: true, path: target };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('app:saveFileDirect', async (event, { filePath, content }) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Window Controls (Ελαχιστοποίηση / Μεγιστοποίηση / Πλήρης Οθόνη)
ipcMain.handle('window:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('window:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('window:toggleFullScreen', () => {
  if (mainWindow) {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  }
});

// Διαχείριση Προχείρου (Clipboard)
ipcMain.handle('clipboard:readText', () => {
  return clipboard.readText();
});

ipcMain.handle('clipboard:writeText', (event, text) => {
  clipboard.writeText(text || '');
  return true;
});

// Συγχρονισμός θέματος τίτλου Windows 11
ipcMain.handle('theme:set', (event, theme) => {
  nativeTheme.themeSource = (theme && theme.startsWith('light')) ? 'light' : 'dark';
});

// Βοηθητικές συναρτήσεις ελέγχου ενημερώσεων
function parseSemver(ver) {
  if (!ver) return [0, 0, 0];
  const clean = ver.replace(/^v/i, '').trim();
  const parts = clean.split('.').map(n => parseInt(n, 10) || 0);
  while (parts.length < 3) parts.push(0);
  return parts;
}

function isNewerVersion(currentVer, remoteVer) {
  const c = parseSemver(currentVer);
  const r = parseSemver(remoteVer);
  for (let i = 0; i < 3; i++) {
    if (r[i] > c[i]) return true;
    if (r[i] < c[i]) return false;
  }
  return false;
}

function fetchJsonHttps(url) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.get({
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      headers: {
        'User-Agent': 'EduHTML-Studio-Updater',
        'Accept': 'application/vnd.github.v3+json'
      },
      timeout: 8000
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJsonHttps(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve(json);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Έλεγχος για νέα έκδοση στο αποθετήριο GitHub
ipcMain.handle('app:checkForUpdates', async () => {
  const currentVersion = getApplicationVersion();
  try {
    // 1. Δοκιμή ανάκτησης του τελευταίου release από το GitHub API
    let release = null;
    try {
      release = await fetchJsonHttps('https://api.github.com/repos/pliroforikos/myHTML/releases/latest');
    } catch (err) {
      console.warn('GitHub Releases API lookup error:', err.message);
    }

    if (release && release.tag_name) {
      const remoteVersion = release.tag_name;
      const hasUpdate = isNewerVersion(currentVersion, remoteVersion);
      return {
        success: true,
        hasUpdate: hasUpdate,
        currentVersion: currentVersion,
        latestVersion: remoteVersion,
        releaseName: release.name || remoteVersion,
        releaseNotes: release.body || '',
        publishedAt: release.published_at || '',
        downloadUrl: release.html_url || 'https://github.com/pliroforikos/myHTML/releases'
      };
    }

    // 2. Εναλλακτική ανάκτηση μέσω raw package.json στο main branch
    const remotePkg = await fetchJsonHttps('https://raw.githubusercontent.com/pliroforikos/myHTML/main/package.json');
    if (remotePkg && remotePkg.version) {
      const remoteVersion = remotePkg.version;
      const hasUpdate = isNewerVersion(currentVersion, remoteVersion);
      return {
        success: true,
        hasUpdate: hasUpdate,
        currentVersion: currentVersion,
        latestVersion: `v${remoteVersion}`,
        releaseName: `EduHTML Studio v${remoteVersion}`,
        releaseNotes: 'Νέα έκδοση διαθέσιμη στο αποθετήριο GitHub.',
        publishedAt: '',
        downloadUrl: 'https://github.com/pliroforikos/myHTML/releases'
      };
    }

    return {
      success: true,
      hasUpdate: false,
      currentVersion: currentVersion,
      latestVersion: `v${currentVersion}`
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      currentVersion: currentVersion
    };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
