const { app, ipcMain, BrowserWindow } = require('electron');
const { createLumiWindow } = require('./lumi-window');

let lumiWin = null;

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.whenReady().then(() => {
    if (process.platform === 'darwin' && app.dock) app.dock.hide();

    lumiWin = createLumiWindow();
    lumiWin.on('closed', () => {
      lumiWin = null;
    });

    ipcMain.on('set-ignore-mouse', (e, ignore) => {
      const win = BrowserWindow.fromWebContents(e.sender);
      if (win === lumiWin && win && !win.isDestroyed()) {
        win.setIgnoreMouseEvents(Boolean(ignore), { forward: true });
      }
    });
  }).catch((err) => {
    console.error(err);
    app.quit();
  });

  app.on('window-all-closed', () => {
    app.quit();
  });
}
