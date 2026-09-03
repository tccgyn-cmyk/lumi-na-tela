const { BrowserWindow } = require('electron');
const path = require('path');

function openPainel(dados) {
  const win = new BrowserWindow({
    width: 420,
    height: 560,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    center: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload-painel.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win
    .loadFile(path.join(__dirname, '../renderer/painel/index.html'))
    .catch((err) => {
      console.error('[lumi] falha ao carregar painel', err);
      win.destroy();
    });
  win.webContents.once('did-finish-load', () => {
    win.webContents.send('painel-data', dados);
    win.show();
  });
  return win;
}

module.exports = { openPainel };
