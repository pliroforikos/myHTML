const { app, BrowserWindow, ipcMain, dialog, shell, Menu, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Συγχρονισμός θέματος με τα Windows 11
nativeTheme.themeSource = 'dark';

let mainWindow;

function createWindow() {
  const iconPath = path.join(__dirname, 'src', 'assets', 'icon.png');
  const windowConfig = {
    width: 1366,
    height: 860,
    minWidth: 960,
    minHeight: 600,
    title: 'EduHTML Studio - Εκπαιδευτικός HTML & CSS Editor (Windows 11)',
    backgroundColor: '#0f172a',
    autoHideMenuBar: true, // Απόκρυψη της γκρι γραμμής μενού των Windows για καθαρή εμφάνιση
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
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
          label: 'Σχετικά με το EduHTML Studio',
          click: () => mainWindow.webContents.send('menu:about')
        },
        {
          label: 'Εργαλεία Προγραμματιστή (DevTools)',
          accelerator: 'F12',
          click: () => mainWindow.webContents.toggleDevTools()
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
    hideBeginnerControls: false
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

ipcMain.handle('app:getVersion', () => {
  return app.getVersion();
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
  
  const fileName = defaultPath ? path.basename(defaultPath) : 'index.html';
  const targetDefault = path.join(baseDir, fileName);

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
      const htmlContent = (typeof payload === 'string') ? payload : (payload && payload.content ? payload.content : '');
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eduhtml-'));
      const tempFile = path.join(tempDir, 'preview.html');
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

// Συγχρονισμός θέματος τίτλου Windows 11
ipcMain.handle('theme:set', (event, theme) => {
  nativeTheme.themeSource = theme;
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
