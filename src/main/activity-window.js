const { BrowserWindow } = require('electron');
const path = require('path');
const { microPausas, exercicios } = require('../shared/content');

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const lastIds = {};

function pickContent(tipo) {
  const list = tipo === 'micro-pausa' ? microPausas : exercicios;
  let item = pick(list);
  if (list.length > 1 && item.id === lastIds[tipo]) {
    item = pick(list);
  }
  lastIds[tipo] = item.id;
  return { tipo, ...item };
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
    center: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload-activity.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.webContents.once('did-finish-load', () => {
    win.webContents.send('activity-data', item);
    win.show();
  });
  win
    .loadFile(path.join(__dirname, '../renderer/activity/index.html'))
    .catch((err) => {
      console.error('[lumi] falha ao carregar cartão de atividade', err);
      win.destroy();
    });
  return win;
}

module.exports = { openActivity };
