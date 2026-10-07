const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: (filters) => ipcRenderer.invoke('dialog:openFile', filters),
  saveFile: (data) => ipcRenderer.invoke('dialog:saveFile', data),
  saveFileDirect: (data) => ipcRenderer.invoke('app:saveFileDirect', data),
  openInExternalBrowser: (data) => ipcRenderer.invoke('app:openInExternalBrowser', data),
  
  // Settings & Folder Management
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  selectFolder: (currentPath) => ipcRenderer.invoke('settings:selectFolder', currentPath),

  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  toggleFullScreen: () => ipcRenderer.invoke('window:toggleFullScreen'),
  setTheme: (theme) => ipcRenderer.invoke('theme:set', theme),
  
  // Listeners from native menu
  onMenuNew: (callback) => ipcRenderer.on('menu:new', callback),
  onMenuOpen: (callback) => ipcRenderer.on('menu:open', callback),
  onMenuSave: (callback) => ipcRenderer.on('menu:save', callback),
  onMenuSaveAs: (callback) => ipcRenderer.on('menu:saveAs', callback),
  onMenuExportZip: (callback) => ipcRenderer.on('menu:exportZip', callback),
  onMenuRefreshPreview: (callback) => ipcRenderer.on('menu:refreshPreview', callback),
  onMenuOpenEdge: (callback) => ipcRenderer.on('menu:openEdge', callback),
  onMenuToggleGuide: (callback) => ipcRenderer.on('menu:toggleGuide', callback),
  onMenuToggleMode: (callback) => ipcRenderer.on('menu:toggleMode', callback),
  onMenuFormatCode: (callback) => ipcRenderer.on('menu:formatCode', callback),
  onMenuAbout: (callback) => ipcRenderer.on('menu:about', callback)
});
