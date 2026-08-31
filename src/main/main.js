const { app, ipcMain } = require('electron');
const { createLumiWindow } = require('./lumi-window');

let lumiWin = null;

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.whenReady().then(() => {
    lumiWin = createLumiWindow();

    ipcMain.on('set-ignore-mouse', (_e, ignore) => {
      if (lumiWin) lumiWin.setIgnoreMouseEvents(ignore, { forward: true });
    });
  });

  app.on('window-all-closed', () => {
    app.quit();
  });
}
