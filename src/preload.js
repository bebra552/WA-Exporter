const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadWhatsApp: () => ipcRenderer.invoke('load-whatsapp'),
  injectScript: (windowId) => ipcRenderer.invoke('inject-script', windowId),
  exportCsv: (data, filename) => ipcRenderer.invoke('export-csv', data, filename)
});
