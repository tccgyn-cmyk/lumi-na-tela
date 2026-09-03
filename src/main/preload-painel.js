const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('painelAPI', {
  onData: (cb) => ipcRenderer.on('painel-data', (_e, dados) => cb(dados)),
  fechar: () => ipcRenderer.send('painel-fechar'),
});
