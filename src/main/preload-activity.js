const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('activityAPI', {
  onData: (cb) => ipcRenderer.on('activity-data', (_e, item) => cb(item)),
  done: () => ipcRenderer.send('activity-done'),
});
