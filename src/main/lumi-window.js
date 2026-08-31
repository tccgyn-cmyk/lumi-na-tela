const { BrowserWindow, screen } = require('electron');
const path = require('path');

const WIN_W = 260;
const WIN_H = 250;

function homePosition() {
  const { workArea } = screen.getPrimaryDisplay();
  return {
    x: workArea.x + workArea.width - WIN_W - 16,
    y: workArea.y + workArea.height - WIN_H,
  };
}

function createLumiWindow() {
  const { x, y } = homePosition();
  const win = new BrowserWindow({
    width: WIN_W,
    height: WIN_H,
    x,
    y,
    transparent: true,
    frame: false,
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload-lumi.js'),
    },
  });
  win.setAlwaysOnTop(true, 'screen-saver');
  if (process.platform === 'darwin') {
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: false });
  }
  win.loadFile(path.join(__dirname, '../renderer/lumi/index.html'));
  win.setIgnoreMouseEvents(true, { forward: true });
  return win;
}

module.exports = { createLumiWindow, homePosition, WIN_W, WIN_H };
