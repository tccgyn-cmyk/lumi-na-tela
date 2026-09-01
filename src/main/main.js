const { app, BrowserWindow, ipcMain, Menu, powerMonitor } = require('electron');
const { createLumiWindow } = require('./lumi-window');
const { openActivity } = require('./activity-window');
const { Scheduler } = require('./scheduler');
const { Rotation } = require('./rotation');
const { walkToCenter, returnHome } = require('./intervention');
const { convites } = require('../shared/content');

const TICK_MS = 5000;
const INVITE_TIMEOUT_MS = 2 * 60_000;

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
let activityWin = null;
const scheduler = new Scheduler({ intervalMinutes: resolveIntervalMinutes() });
const rotation = new Rotation(['micro-pausa', 'respiracao']);
let currentTipo = null;
let inviteTimeout = null;

function lumiAlive() {
  return lumiWin && !lumiWin.isDestroyed();
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function triggerIntervention() {
  if (currentTipo || !lumiAlive()) return;
  currentTipo = rotation.next();
  walkToCenter(lumiWin, pick(convites[currentTipo]), currentTipo);
  inviteTimeout = setTimeout(() => handleResponse('timeout'), INVITE_TIMEOUT_MS);
}

function handleResponse(answer) {
  if (!currentTipo) return;
  const tipo = currentTipo;
  currentTipo = null;
  clearTimeout(inviteTimeout);
  inviteTimeout = null;
  if (lumiAlive()) {
    lumiWin.setIgnoreMouseEvents(true, { forward: true });
    returnHome(lumiWin);
  }
  if (answer === 'snooze') {
    scheduler.snooze(Date.now(), 10);
  }
  if (answer === 'accept') {
    if (activityWin && !activityWin.isDestroyed()) activityWin.close();
    activityWin = openActivity(tipo);
    activityWin.on('closed', () => {
      activityWin = null;
    });
  }
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
          if (currentTipo) return; // convite ativo: janela pinada interativa
          win.setIgnoreMouseEvents(Boolean(ignore), { forward: true });
        }
      });

      ipcMain.on('intervention-response', (e, answer) => {
        const win = BrowserWindow.fromWebContents(e.sender);
        if (!win || win !== lumiWin || win.isDestroyed()) return;
        handleResponse(answer);
      });

      ipcMain.on('activity-done', (e) => {
        const win = BrowserWindow.fromWebContents(e.sender);
        if (win && win === activityWin && !win.isDestroyed()) win.close();
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
              click: () => {
                scheduler.silence(Date.now(), min);
                handleResponse('dismiss');
              },
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
