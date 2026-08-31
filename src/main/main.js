const { app, BrowserWindow, ipcMain, Menu, powerMonitor } = require('electron');
const { createLumiWindow } = require('./lumi-window');
const { Scheduler } = require('./scheduler');
const { Rotation } = require('./rotation');

const TICK_MS = 5000;

// LUMI_DEV_INTERVAL=1 npm start → intervalo de 1 min para testar.
// Valor inválido cai no padrão (o Scheduler rejeita, então validamos aqui).
function resolveIntervalMinutes() {
  const raw = process.env.LUMI_DEV_INTERVAL;
  if (!raw) return 50;
  const mins = Number(raw);
  if (!Number.isFinite(mins) || mins <= 0) {
    console.warn(`[lumi] LUMI_DEV_INTERVAL inválido (${raw}); usando 50 min`);
    return 50;
  }
  return mins;
}

let lumiWin = null;
const scheduler = new Scheduler({ intervalMinutes: resolveIntervalMinutes() });
const rotation = new Rotation(['micro-pausa', 'respiracao']);

function triggerIntervention() {
  const tipo = rotation.next();
  // Na Task 8 isto vira a travessia + balão. Por enquanto, log:
  console.log(`[lumi] intervenção devida: ${tipo}`);
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app
    .whenReady()
    .then(() => {
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

      ipcMain.on('lumi-menu', (e) => {
        const win = BrowserWindow.fromWebContents(e.sender);
        if (!win || win !== lumiWin || win.isDestroyed()) return;
        const menu = Menu.buildFromTemplate([
          { label: 'Pausar agora', click: () => triggerIntervention() },
          { type: 'separator' },
          {
            label: 'Em atendimento',
            submenu: [30, 60, 120].map((min) => ({
              label: `${min} minutos`,
              click: () => scheduler.silence(Date.now(), min),
            })),
          },
          { label: 'Voltar ao normal', click: () => scheduler.silence(Date.now(), 0) },
          { type: 'separator' },
          { label: 'Sair do Lumi', click: () => app.quit() },
        ]);
        menu.popup({ window: win });
      });

      setInterval(() => {
        const due = scheduler.tick(
          Date.now(),
          powerMonitor.getSystemIdleTime(),
          TICK_MS
        );
        if (due) triggerIntervention();
      }, TICK_MS);
    })
    .catch((err) => {
      console.error('[lumi] falha na inicialização', err);
      app.quit();
    });

  app.on('window-all-closed', () => {
    app.quit();
  });
}
