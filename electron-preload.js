const { contextBridge, ipcMain } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  checkBackend: () => ipcRenderer.invoke('check-backend'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version')
});
