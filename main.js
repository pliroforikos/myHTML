const { app, BrowserWindow, ipcMain, dialog, shell, Menu, nativeTheme, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const Themes = require('./src/js/themes');
const { Updater } = require('./updater');
const { computeImageSrc } = require('./imagePath');

// Στα Windows και στο Linux η κεφαλίδα της εφαρμογής (ύψος 46px, δες style.css) παίρνει τη θέση της γραμμής τίτλου.
// Τα κουμπιά του παραθύρου (ελαχιστοποίηση, μεγιστοποίηση, κλείσιμο) τα βάζει το σύστημα πάνω δεξιά, με χρώματα που
// ορίζει η εφαρμογή ώστε να ταιριάζουν με το χρώμα της κεφαλίδας.
const CUSTOM_HEADER = process.platform === 'win32' || process.platform === 'linux';
const HEADER_HEIGHT = 46;
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

// Συγχρονισμός θέματος με τα Windows 11
nativeTheme.themeSource = 'dark';

let mainWindow;

function createWindow() {
  const settings = loadSettings();
  const theme = Themes.get(settings.theme);
  nativeTheme.themeSource = theme.dark ? 'dark' : 'light';
  const overlay = settings.headerOverlay || {};

  const iconPath = path.join(__dirname, 'src', 'assets', 'icon.png');
  const windowConfig = {
    width: 1366,
    height: 860,
    minWidth: 960,
    minHeight: 600,
    title: 'EduHTML Studio - Εκπαιδευτικός HTML & CSS Editor (Windows 11)',
    backgroundColor: theme.window,
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

  if (CUSTOM_HEADER) {
    windowConfig.titleBarStyle = 'hidden';
    windowConfig.titleBarOverlay = {
      color: HEX_COLOR.test(overlay.color) ? overlay.color : theme.window,
      symbolColor: HEX_COLOR.test(overlay.symbolColor) ? overlay.symbolColor : (theme.dark ? '#dfe1e5' : '#1b1c1f'),
      height: HEADER_HEIGHT
    };
  }

  mainWindow = new BrowserWindow(windowConfig);
  mainWindow.maximize(); // Πάντα άνοιγμα σε πλήρη οθόνη (Maximized)
  // Με τη δική μας κεφαλίδα δεν φαίνεται γραμμή μενού των Windows· οι συντομεύσεις του μενού μένουν ενεργές
  if (CUSTOM_HEADER) mainWindow.setMenuBarVisibility(false);

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  setupMenu();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupMenu() {
  const isMac = process.platform === 'darwin';
  const currentTheme = Themes.get(loadSettings().theme);
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
        },
        {
          label: 'Εισαγωγή εικόνας...',
          accelerator: 'CmdOrCtrl+Shift+P',
          click: () => mainWindow.webContents.send('menu:insertImage')
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
        {
          label: 'Θέμα εμφάνισης',
          submenu: Themes.LIST.flatMap((t, i, all) => [
            ...(i > 0 && all[i - 1].group !== t.group ? [{ type: 'separator' }] : []),
            {
              label: t.label,
              type: 'radio',
              checked: currentTheme.id === t.id,
              click: () => mainWindow && mainWindow.webContents.send('menu:setTheme', t.id)
            }
          ])
        },
        {
          label: 'Αλλαγή φωτεινό ↔ σκοτεινό',
          accelerator: 'CmdOrCtrl+Shift+T',
          click: () => mainWindow && mainWindow.webContents.send('menu:toggleTheme')
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
    autoUpdateCheck: true,   // έλεγχος για νέα έκδοση κατά την εκκίνηση
    theme: Themes.DEFAULT_ID, // ένα από τα θέματα του src/js/themes.js
    headerColor: 'theme',    // χρώμα κεφαλίδας: 'theme' (ίδιο με το θέμα), προκαθορισμένο ή #rrggbb
    headerColor2: '',        // δεύτερο χρώμα της διαβάθμισης· κενό = ένα χρώμα
    headerDir: 'right'       // κατεύθυνση της διαβάθμισης: right, left, down, diag
  };
  try {
    const sPath = getSettingsPath();
    if (fs.existsSync(sPath)) {
      const data = JSON.parse(fs.readFileSync(sPath, 'utf-8'));
      const merged = { ...defaults, ...data };
      merged.theme = Themes.get(merged.theme).id; // παλιά ονόματα θεμάτων (dark-charcoal, light-gray…) → φωτεινό/σκοτεινό
      for (const old of ['accent', 'lastDarkTheme', 'lastLightTheme']) delete merged[old]; // δεν χρησιμοποιούνται πια
      return merged;
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

// Επιλογή εικόνας για το <img src="">. baseDir: ο φάκελος της σελίδας (ή ο φάκελος εργασίας αν δεν έχει αποθηκευτεί).
ipcMain.handle('dialog:pickImage', async (event, baseDir) => {
  const settings = loadSettings();
  const startDir = (baseDir && fs.existsSync(baseDir))
    ? baseDir
    : ((settings.saveDirectory && fs.existsSync(settings.saveDirectory)) ? settings.saveDirectory : defaultWebpagesDir);

  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Επιλογή εικόνας',
    defaultPath: startDir,
    properties: ['openFile'],
    filters: [
      { name: 'Εικόνες', extensions: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico', 'avif'] },
      { name: 'Όλα τα αρχεία', extensions: ['*'] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) return null;
  const filePath = result.filePaths[0];
  return { filePath, ...computeImageSrc(baseDir || '', filePath) };
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
  // Τα χρώματα των κουμπιών του παραθύρου τα αποθηκεύει μόνο το titlebar:overlay (η σελίδα μπορεί να στείλει παλιά τιμή)
  const patch = { ...newSettings };
  delete patch.headerOverlay;
  const updated = { ...current, ...patch };
  saveSettings(updated);
  if (newSettings && 'theme' in newSettings && mainWindow) {
    setupMenu(); // ώστε το μενού «Θέμα εμφάνισης» να δείχνει το τρέχον θέμα
  }
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
    } else {
      // Το περιεχόμενο (HTML + ενσωματωμένο CSS) γράφεται σε ΠΡΟΣΩΡΙΝΟ αρχείο στον φάκελο temp του συστήματος.
      // Το αρχείο του χρήστη δεν τροποποιείται ποτέ και δεν δημιουργούνται βοηθητικά αρχεία στον φάκελο εργασίας του.
      // Οι σχετικές διαδρομές εικόνων επιλύονται μέσω του <base href> που έχει ήδη προστεθεί στο περιεχόμενο.
      const htmlContent = (typeof payload === 'string') ? payload : (payload && payload.content ? payload.content : '');
      const previewDir = path.join(os.tmpdir(), 'eduhtml-studio-preview');
      fs.mkdirSync(previewDir, { recursive: true });
      const tempFile = path.join(previewDir, 'preview.html');
      fs.writeFileSync(tempFile, htmlContent, 'utf-8');
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
  nativeTheme.themeSource = Themes.get(theme).dark ? 'dark' : 'light';
});

// Χρώματα των κουμπιών του παραθύρου (ελαχιστοποίηση, μεγιστοποίηση, κλείσιμο) πάνω στην κεφαλίδα
ipcMain.on('titlebar:overlay', (event, color, symbolColor) => {
  if (!CUSTOM_HEADER || !HEX_COLOR.test(color) || !HEX_COLOR.test(symbolColor)) return;
  const current = loadSettings();
  saveSettings({ ...current, headerOverlay: { color, symbolColor } }); // για την επόμενη εκκίνηση, χωρίς αναλαμπή
  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      mainWindow.setTitleBarOverlay({ color, symbolColor, height: HEADER_HEIGHT });
    } catch (err) {
      console.warn('titleBarOverlay:', err.message);
    }
  }
});

// --- Ενημερώσεις από το GitHub, μέσα από την εφαρμογή (δες updater.js και updateInfo.js) ---
const updater = new Updater({
  owner: 'pliroforikos',
  repo: 'myHTML',
  getWin: () => mainWindow,
  currentVersion: getApplicationVersion
});
updater.register();

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
