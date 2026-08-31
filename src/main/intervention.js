const { screen } = require('electron');
const { WIN_W, homePosition } = require('./lumi-window');

function animateTo(win, targetX, durationMs, done) {
  const [startX, y] = win.getPosition();
  const steps = Math.max(1, Math.round(durationMs / 16));
  let i = 0;
  const timer = setInterval(() => {
    i += 1;
    if (win.isDestroyed()) {
      clearInterval(timer);
      return;
    }
    const x = Math.round(startX + (targetX - startX) * (i / steps));
    win.setPosition(x, y);
    if (i >= steps) {
      clearInterval(timer);
      if (done) done();
    }
  }, 16);
}

// Lumi nada até o centro da tela e faz o convite
function walkToCenter(win, message, tipo) {
  if (win.isDestroyed()) return;
  const { workArea } = screen.getPrimaryDisplay();
  const targetX = workArea.x + Math.round(workArea.width / 2 - WIN_W / 2);
  win.webContents.send('lumi-state', { state: 'walking' });
  animateTo(win, targetX, 1800, () => {
    if (win.isDestroyed()) return;
    win.webContents.send('lumi-state', { state: 'invite', message, tipo });
  });
}

// Lumi volta pro cantinho dele
function returnHome(win) {
  if (win.isDestroyed()) return;
  const { x } = homePosition();
  win.webContents.send('lumi-state', { state: 'walking' });
  animateTo(win, x, 1800, () => {
    if (win.isDestroyed()) return;
    win.webContents.send('lumi-state', { state: 'idle' });
  });
}

module.exports = { walkToCenter, returnHome };
