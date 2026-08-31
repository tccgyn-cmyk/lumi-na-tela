const { BrowserWindow, screen } = require('electron');
const path = require('path');

const WIN_W = 260;
const WIN_H = 320;

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
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload-lumi.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.setAlwaysOnTop(true, 'floating');
  if (process.platform === 'darwin') {
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: false });
  }
  win.once('ready-to-show', () => win.showInactive());
  win.loadFile(path.join(__dirname, '../renderer/lumi/index.html')).catch((err) => {
    console.error('[lumi] falha ao carregar janela', err);
    win.destroy();
  });
  win.setIgnoreMouseEvents(true, { forward: true });

  const reposition = () => {
    if (win.isDestroyed()) return;
    const { x: nx, y: ny } = homePosition();
    win.setPosition(nx, ny);
  };
  screen.on('display-metrics-changed', reposition);
  screen.on('display-added', reposition);
  screen.on('display-removed', reposition);
  win.on('closed', () => {
    screen.removeListener('display-metrics-changed', reposition);
    screen.removeListener('display-added', reposition);
    screen.removeListener('display-removed', reposition);
  });

  return win;
}

module.exports = { createLumiWindow, homePosition, WIN_W, WIN_H };
