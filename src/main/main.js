const path = require('path');
const { app, BrowserWindow, ipcMain, Menu, powerMonitor } = require('electron');
const { createLumiWindow } = require('./lumi-window');
const { openActivity } = require('./activity-window');
const { Scheduler } = require('./scheduler');
const { Rotation } = require('./rotation');
const { walkToCenter, returnHome } = require('./intervention');
const { createStore } = require('./store');
const { dentroDoExpediente } = require('./expediente');
const { convites, falinhas, RODIZIO } = require('../shared/content');

const TICK_MS = 5000;
const INVITE_TIMEOUT_MS = 2 * 60_000;
// Sem interação entre 1 e 15 min: o Lumi acena para chamar atenção.
// Acima de 15 min a pessoa saiu de verdade — não adianta acenar.
// LUMI_DEV_WAVE=10 → começa a acenar após 10s (para testar).
const WAVE_MIN_IDLE_S =
  Number(process.env.LUMI_DEV_WAVE) > 0 ? Number(process.env.LUMI_DEV_WAVE) : 60;
const WAVE_MAX_IDLE_S = 15 * 60;

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

const store = createStore(path.join(app.getPath('userData'), 'lumi-dados.json'));
let perfil = store.get('perfil', null);

// Prioridade do ritmo: env de dev > perfil salvo > padrão 50
function ritmoInicial() {
  if (process.env.LUMI_DEV_INTERVAL) return resolveIntervalMinutes();
  if (perfil && Number.isFinite(Number(perfil.ritmoMin)) && perfil.ritmoMin > 0) {
    return perfil.ritmoMin;
  }
  return 50;
}

let lumiWin = null;
let activityWin = null;
let intervaloAtual = ritmoInicial(); // minutos (ajustável no menu)
const scheduler = new Scheduler({ intervalMinutes: intervaloAtual });
// Rodízio da fase 3 (canônico em content.js): pílula a cada 4 convites
const rotation = new Rotation(RODIZIO, store.get('rotacaoIndex', 0));
let currentTipo = null;
let inviteTimeout = null;
let waving = false;

// Falinhas: conversa espontânea ~1x/hora (45-75 min), fora de convites.
// LUMI_DEV_FALINHA=20 → primeira em 20s e a cada ~60s (para testar).
const DEV_FALINHA_S = Number(process.env.LUMI_DEV_FALINHA) > 0
  ? Number(process.env.LUMI_DEV_FALINHA)
  : 0;
const FALINHA_DURATION_MS = 8000;
let nextFalinhaAt = Date.now() + (DEV_FALINHA_S
  ? DEV_FALINHA_S * 1000
  : (5 + Math.random() * 5) * 60_000); // primeira: 5-10 min após abrir
let ultimaFalinha = null;

function agendaProximaFalinha() {
  nextFalinhaAt = Date.now() + (DEV_FALINHA_S
    ? 60_000
    : (45 + Math.random() * 30) * 60_000);
}

function periodoDoDia() {
  const h = new Date().getHours();
  if (h < 12) return 'manha';
  if (h < 18) return 'tarde';
  return 'noite';
}

function pickFalinha() {
  const periodo = periodoDoDia();
  const opcoes = falinhas.filter(
    (f) => (!f.periodo || f.periodo === periodo) && f.texto !== ultimaFalinha
  );
  const escolhida = pick(opcoes.length ? opcoes : falinhas);
  ultimaFalinha = escolhida.texto;
  return escolhida.texto.replaceAll('{nome}', (perfil && perfil.nome) || 'você');
}
// Enquanto o Lumi está atravessando a tela (1,8s), o estado final da
// travessia ("idle") chega atrasado e engoliria um aceno enviado no meio.
let walkUntil = 0;

function lumiAlive() {
  return lumiWin && !lumiWin.isDestroyed();
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function updateAttentionWave(idleSeconds) {
  if (!perfil) return; // onboarding ativo: o balão pertence a ele
  if (!lumiAlive() || currentTipo) return;
  if (Date.now() < walkUntil) return; // espera a travessia terminar
  const foraDoExpediente = !dentroDoExpediente(Date.now(), perfil?.expediente);
  const shouldWave =
    !foraDoExpediente && idleSeconds >= WAVE_MIN_IDLE_S && idleSeconds < WAVE_MAX_IDLE_S;
  if (shouldWave !== waving) {
    waving = shouldWave;
    console.log(`[lumi] aceno ${shouldWave ? 'ligado' : 'desligado'} (${idleSeconds}s sem interação)`);
    lumiWin.webContents.send('lumi-state', {
      state: shouldWave ? 'waving' : 'idle',
    });
  }
}

function maybeFalinha(idleSeconds) {
  if (!perfil) return; // onboarding ativo: o balão pertence a ele
  if (!lumiAlive() || currentTipo || waving) return;
  if (activityWin && !activityWin.isDestroyed()) return;
  if (!dentroDoExpediente(Date.now(), perfil?.expediente)) return;
  const now = Date.now();
  if (now < walkUntil || now < nextFalinhaAt) return;
  if (idleSeconds > 45) return; // só com a pessoa ali, ativa
  if (now < scheduler.silencedUntil) return; // em atendimento: silêncio total
  // Não puxa papo se um convite está a menos de 5 min de acontecer
  if (scheduler.intervalMs - scheduler.activeMs < 5 * 60_000) return;
  agendaProximaFalinha();
  lumiWin.webContents.send('lumi-state', { state: 'talking', message: pickFalinha() });
  setTimeout(() => {
    if (!currentTipo && lumiAlive()) {
      lumiWin.webContents.send('lumi-state', { state: 'idle' });
    }
  }, FALINHA_DURATION_MS);
}

function triggerIntervention() {
  if (!perfil) return; // onboarding ativo: o balão pertence a ele
  if (currentTipo || !lumiAlive()) return;
  if (activityWin && !activityWin.isDestroyed()) return; // atividade em andamento
  if (!dentroDoExpediente(Date.now(), perfil?.expediente)) return;
  currentTipo = rotation.next();
  store.set('rotacaoIndex', rotation.i);
  waving = false; // a travessia substitui o aceno; o tick seguinte reavalia
  walkUntil = Date.now() + 2000;
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
    waving = false;
    walkUntil = Date.now() + 2000;
    returnHome(lumiWin);
  }
  if (answer === 'snooze') {
    scheduler.snooze(Date.now(), 10);
  }
  if (answer === 'accept') {
    if (activityWin && !activityWin.isDestroyed()) activityWin.close();
    const win = openActivity(tipo);
    activityWin = win;
    win.on('closed', () => {
      if (activityWin === win) activityWin = null;
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

      lumiWin.webContents.once('did-finish-load', () => {
        if (!perfil && lumiAlive()) {
          lumiWin.setIgnoreMouseEvents(false); // pinada durante o onboarding
          lumiWin.webContents.send('lumi-state', { state: 'onboarding' });
        }
      });

      ipcMain.on('set-ignore-mouse', (e, ignore) => {
        const win = BrowserWindow.fromWebContents(e.sender);
        if (win === lumiWin && win && !win.isDestroyed()) {
          if (currentTipo) return; // convite ativo: janela pinada interativa
          if (!perfil) return; // onboarding ativo: janela pinada
          win.setIgnoreMouseEvents(Boolean(ignore), { forward: true });
        }
      });

      ipcMain.on('onboarding-done', (e, dados) => {
        const win = BrowserWindow.fromWebContents(e.sender);
        if (!win || win !== lumiWin || win.isDestroyed()) return;
        const ritmo = [50, 60, 90].includes(Number(dados?.ritmoMin)) ? Number(dados.ritmoMin) : 60;
        const expediente =
          dados?.expediente?.turnos === true
            ? { turnos: true }
            : {
                inicio: typeof dados?.expediente?.inicio === 'string' ? dados.expediente.inicio : '08:00',
                fim: typeof dados?.expediente?.fim === 'string' ? dados.expediente.fim : '18:00',
              };
        perfil = {
          nome: String(dados?.nome || '').slice(0, 30),
          profissao: String(dados?.profissao || '').slice(0, 40),
          ritmoMin: ritmo,
          expediente,
        };
        store.set('perfil', perfil);
        if (!process.env.LUMI_DEV_INTERVAL) {
          intervaloAtual = ritmo;
          scheduler.setIntervalMinutes(ritmo);
        }
        win.setIgnoreMouseEvents(true, { forward: true });
        win.webContents.send('lumi-state', { state: 'idle' });
      });

      ipcMain.on('intervention-response', (e, answer) => {
        const win = BrowserWindow.fromWebContents(e.sender);
        if (!win || win !== lumiWin || win.isDestroyed()) return;
        handleResponse(answer);
      });

      ipcMain.on('activity-done', (e) => {
        const win = BrowserWindow.fromWebContents(e.sender);
        if (win && !win.isDestroyed() && win !== lumiWin) win.close();
      });

      ipcMain.on('lumi-menu', (e) => {
        const win = BrowserWindow.fromWebContents(e.sender);
        if (!win || win !== lumiWin || win.isDestroyed()) return;
        const menu = Menu.buildFromTemplate([
          { label: 'Pausar agora', click: () => triggerIntervention() },
          { type: 'separator' },
          {
            label: 'Ritmo das pausas',
            submenu: [30, 50, 60, 90].map((min) => ({
              label: `A cada ${min} minutos`,
              type: 'radio',
              checked: intervaloAtual === min,
              click: () => {
                intervaloAtual = min;
                scheduler.setIntervalMinutes(min);
                perfil = { ...(perfil || {}), ritmoMin: min };
                store.set('perfil', perfil);
              },
            })),
          },
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
          {
            label: 'Recomeçar apresentação',
            click: () => {
              perfil = null;
              store.set('perfil', null);
              if (lumiAlive()) {
                lumiWin.setIgnoreMouseEvents(false);
                lumiWin.webContents.send('lumi-state', { state: 'onboarding' });
              }
            },
          },
          { type: 'separator' },
          { label: 'Sair do Lumi', click: () => app.quit() },
        ]);
        menu.popup({ window: win });
      });

      setInterval(() => {
        const idleSeconds = powerMonitor.getSystemIdleTime();
        const due = scheduler.tick(Date.now(), idleSeconds, TICK_MS);
        if (due) triggerIntervention();
        updateAttentionWave(idleSeconds);
        maybeFalinha(idleSeconds);
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
