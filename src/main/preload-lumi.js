const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('lumiAPI', {
  setIgnoreMouse: (ignore) => ipcRenderer.send('set-ignore-mouse', ignore),
  openMenu: () => ipcRenderer.send('lumi-menu'),
  respond: (answer) => ipcRenderer.send('intervention-response', answer),
  onboardingDone: (perfil) => ipcRenderer.send('onboarding-done', perfil),
  onState: (cb) => ipcRenderer.on('lumi-state', (_e, s) => cb(s)),
});
