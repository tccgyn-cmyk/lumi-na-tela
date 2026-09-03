const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('activityAPI', {
  onData: (cb) => ipcRenderer.on('activity-data', (_e, item) => cb(item)),
  done: () => ipcRenderer.send('activity-done'),
  compartilhar: (dataUrl, id) => ipcRenderer.send('compartilhar-pilula', dataUrl, id),
  onCompartilhado: (cb) => ipcRenderer.on('pilula-compartilhada', (_e, ok) => cb(ok)),
});
