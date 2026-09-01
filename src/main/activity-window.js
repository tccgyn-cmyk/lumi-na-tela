const { BrowserWindow } = require('electron');
const path = require('path');
const { microPausas, exercicios } = require('../shared/content');

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function pickContent(tipo) {
  if (tipo === 'micro-pausa') {
    return { tipo, ...pick(microPausas) };
  }
  return { tipo, ...pick(exercicios) };
}

function openActivity(tipo) {
  const item = pickContent(tipo);
  const win = new BrowserWindow({
    width: 400,
    height: 480,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload-activity.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.once('ready-to-show', () => win.show());
  win
    .loadFile(path.join(__dirname, '../renderer/activity/index.html'))
    .catch((err) => {
      console.error('[lumi] falha ao carregar cartão de atividade', err);
      win.destroy();
    });
  win.webContents.on('did-finish-load', () => {
    win.webContents.send('activity-data', item);
  });
  return win;
}

module.exports = { openActivity };
