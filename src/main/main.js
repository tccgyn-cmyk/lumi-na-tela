const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, ipcMain, Menu, powerMonitor, shell, nativeImage, clipboard } = require('electron');
const { createLumiWindow } = require('./lumi-window');
const { openActivity } = require('./activity-window');
const { openPainel } = require('./painel-window');
const { dadosDoPainel } = require('./painel-data');
const { Scheduler } = require('./scheduler');
const { Rotation } = require('./rotation');
const { walkToCenter, returnHome } = require('./intervention');
const { createStore } = require('./store');
const { dentroDoExpediente } = require('./expediente');
const { ancoraDevida, precisaAcolher } = require('./checkin-rules');
const { checarTelaCheia } = require('./fullscreen');
const { ctaDevido } = require('./cta-rules');
const { iniciarConteudoRemoto } = require('./remoto');
const { diaISO } = require('../shared/dias');
const {
  convites,
  falinhas,
  RODIZIO,
  tagsCheckin,
  acolhimento,
  produtos,
  ctas,
} = require('../shared/content');

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
let painelWin = null;
let intervaloAtual = ritmoInicial(); // minutos (ajustável no menu)
const scheduler = new Scheduler({ intervalMinutes: intervaloAtual });
// Rodízio da fase 3 (canônico em content.js): pílula a cada 4 convites
const rotation = new Rotation(RODIZIO, store.get('rotacaoIndex', 0));
let currentTipo = null;
let inviteTimeout = null;
let waving = false;

let checkinAtivo = null; // âncora em andamento ('chegada'|'saida') ou null
let checkinTimeout = null;

let ctaAtivo = null; // chave do produto em exibição
let ctaTimeout = null;
const CTA_DURATION_MS = 25_000;

let emTelaCheia = false;
let checandoTelaCheia = false;
let tickCount = 0;

// Até quando o balão está ocupado por uma fala (falinha/acolhimento).
// Nenhum outro dono do balão pode assumir antes disso.
let bolhaOcupadaAte = 0;

function estadoDoDia() {
  const hoje = diaISO(Date.now());
  let dia = store.get('diaAtual', null);
  if (!dia || dia.dia !== hoje) {
    dia = { dia: hoje, firstActiveMs: null, feitos: {} };
    store.set('diaAtual', dia);
  }
  return dia;
}

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
  if (checkinAtivo) return; // check-in ativo: o balão pertence a ele
  if (ctaAtivo) return; // CTA ativo: o balão pertence a ele
  if (!lumiAlive() || currentTipo) return;
  if (Date.now() < walkUntil) return; // espera a travessia terminar
  if (Date.now() < bolhaOcupadaAte) return;
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
  if (checkinAtivo) return; // check-in ativo: o balão pertence a ele
  if (ctaAtivo) return; // CTA ativo: o balão pertence a ele
  if (!lumiAlive() || currentTipo || waving) return;
  if (activityWin && !activityWin.isDestroyed()) return;
  if (!dentroDoExpediente(Date.now(), perfil?.expediente)) return;
  const now = Date.now();
  if (now < walkUntil || now < nextFalinhaAt) return;
  if (now < bolhaOcupadaAte) return;
  if (idleSeconds > 45) return; // só com a pessoa ali, ativa
  if (now < scheduler.silencedUntil) return; // em atendimento: silêncio total
  // Não puxa papo se um convite está a menos de 5 min de acontecer
  if (scheduler.intervalMs - scheduler.activeMs < 5 * 60_000) return;
  agendaProximaFalinha();
  bolhaOcupadaAte = Date.now() + FALINHA_DURATION_MS + 1000;
  lumiWin.webContents.send('lumi-state', { state: 'talking', message: pickFalinha() });
  setTimeout(() => {
    if (perfil && !currentTipo && !checkinAtivo && lumiAlive()) {
      lumiWin.webContents.send('lumi-state', { state: 'idle' });
    }
  }, FALINHA_DURATION_MS);
}

// LUMI_DEV_CTA=1 ignora a cadência (para testar)
function maybeCta(idleSeconds) {
  if (!perfil || !lumiAlive() || currentTipo || checkinAtivo || waving || ctaAtivo) return;
  if (activityWin && !activityWin.isDestroyed()) return;
  const now = Date.now();
  if (now < walkUntil || now < bolhaOcupadaAte) return;
  if (idleSeconds > 45) return;
  if (now < scheduler.silencedUntil) return;
  if (!dentroDoExpediente(now, perfil?.expediente)) return;
  if (scheduler.intervalMs - scheduler.activeMs < 5 * 60_000) return;
  if (
    process.env.LUMI_DEV_CTA !== '1' &&
    !ctaDevido(now, {
      primeiroDiaUso: store.get('primeiroDiaUso', null),
      ultimoCtaMs: store.get('ultimoCtaMs', 0),
    })
  ) {
    return;
  }
  const ultimo = store.get('ultimoCtaProduto', null);
  const opcoes = ctas.filter((c) => c.produto !== ultimo);
  const cta = pick(opcoes.length ? opcoes : ctas);
  ctaAtivo = cta.produto;
  store.set('ultimoCtaMs', now);
  store.set('ultimoCtaProduto', cta.produto);
  bolhaOcupadaAte = now + CTA_DURATION_MS + 1000;
  lumiWin.setIgnoreMouseEvents(false); // botões do CTA precisam de clique
  lumiWin.webContents.send('lumi-state', { state: 'cta', message: cta.texto });
  ctaTimeout = setTimeout(() => finalizarCta('timeout'), CTA_DURATION_MS);
}

function finalizarCta(resp) {
  if (!ctaAtivo) return;
  const produto = ctaAtivo;
  ctaAtivo = null;
  clearTimeout(ctaTimeout);
  ctaTimeout = null;
  bolhaOcupadaAte = 0;
  if (resp === 'ver' && produtos[produto]) {
    // Allowlist: só URLs do mapa embutido chegam aqui
    shell.openExternal(produtos[produto].url).catch((err) => {
      console.error('[lumi] falha ao abrir link', err);
    });
  }
  if (lumiAlive()) {
    lumiWin.setIgnoreMouseEvents(true, { forward: true });
    lumiWin.webContents.send('lumi-state', { state: 'idle' });
  }
}

function triggerIntervention() {
  if (!perfil) return false; // onboarding ativo: o balão pertence a ele
  if (checkinAtivo) return false; // check-in ativo: o balão pertence a ele
  if (ctaAtivo) return false; // CTA ativo: o balão pertence a ele
  if (currentTipo || !lumiAlive()) return false;
  if (activityWin && !activityWin.isDestroyed()) return false; // atividade em andamento
  if (!dentroDoExpediente(Date.now(), perfil?.expediente)) return false;
  if (Date.now() < bolhaOcupadaAte) return false;
  currentTipo = rotation.next();
  store.set('rotacaoIndex', rotation.i);
  waving = false; // a travessia substitui o aceno; o tick seguinte reavalia
  walkUntil = Date.now() + 2000;
  walkToCenter(lumiWin, pick(convites[currentTipo]), currentTipo);
  inviteTimeout = setTimeout(() => handleResponse('timeout'), INVITE_TIMEOUT_MS);
  return true;
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
    const pausasPorDia = store.get('pausasPorDia', {});
    const hoje = diaISO(Date.now());
    pausasPorDia[hoje] = (pausasPorDia[hoje] || 0) + 1;
    store.set('pausasPorDia', pausasPorDia);
    if (activityWin && !activityWin.isDestroyed()) activityWin.close();
    const win = openActivity(tipo);
    activityWin = win;
    win.on('closed', () => {
      if (activityWin === win) activityWin = null;
    });
  }
}

function maybeCheckin(idleSeconds) {
  if (!lumiAlive() || currentTipo || checkinAtivo || waving || ctaAtivo) return;
  if (activityWin && !activityWin.isDestroyed()) return;
  const now = Date.now();
  if (now < walkUntil) return;
  if (now < bolhaOcupadaAte) return;
  if (idleSeconds > 45) return;
  if (now < scheduler.silencedUntil) return;
  if (!dentroDoExpediente(now, perfil?.expediente)) return;
  if (!perfil) return; // sem onboarding, sem check-in

  const dia = estadoDoDia();
  // "Chegada" = primeira atividade ELEGÍVEL do dia (dentro do expediente,
  // fora de silêncio): um plantão que começa em "Em atendimento" só marca
  // a chegada quando o silêncio termina — comportamento intencional.
  if (dia.firstActiveMs === null) {
    dia.firstActiveMs = now;
    store.set('diaAtual', dia);
  }
  const ancora = ancoraDevida(now, dia);
  if (!ancora) return;

  checkinAtivo = ancora;
  lumiWin.setIgnoreMouseEvents(false);
  lumiWin.webContents.send('lumi-state', { state: 'checkin', ancora, tags: tagsCheckin });
  checkinTimeout = setTimeout(() => finalizarCheckin({ ancora, skip: true }), 60_000);
}

function finalizarCheckin(resp) {
  if (!checkinAtivo) return;
  const ancora = checkinAtivo;
  checkinAtivo = null;
  clearTimeout(checkinTimeout);
  checkinTimeout = null;

  const dia = estadoDoDia();
  dia.feitos[ancora] = true;
  store.set('diaAtual', dia);

  if (!resp.skip && Number.isInteger(resp.nota) && resp.nota >= 1 && resp.nota <= 5) {
    const checkins = store.get('checkins', []);
    checkins.push({
      dia: dia.dia,
      ancora,
      nota: resp.nota,
      tags: Array.isArray(resp.tags) ? resp.tags.slice(0, 6).map(String) : [],
    });
    store.set('checkins', checkins);

    // Acolhimento: no máximo 1 a cada 3 dias
    const ultimo = store.get('ultimoAcolhimento', 0);
    if (precisaAcolher(checkins, Date.now()) && Date.now() - ultimo > 3 * 86_400_000) {
      store.set('ultimoAcolhimento', Date.now());
      setTimeout(() => {
        if (lumiAlive() && !currentTipo && !checkinAtivo) {
          bolhaOcupadaAte = Date.now() + 15_000;
          lumiWin.webContents.send('lumi-state', { state: 'talking', message: acolhimento });
          setTimeout(() => {
            if (perfil && !currentTipo && !checkinAtivo && lumiAlive()) {
              lumiWin.webContents.send('lumi-state', { state: 'idle' });
            }
          }, 14_000);
        }
      }, 1200);
    }
  }

  if (lumiAlive()) {
    lumiWin.setIgnoreMouseEvents(true, { forward: true });
    lumiWin.webContents.send('lumi-state', { state: 'idle' });
  }
}

function abrirPainelSemanal() {
  if (painelWin && !painelWin.isDestroyed()) {
    painelWin.focus();
    return;
  }
  const dados = dadosDoPainel(
    { pausasPorDia: store.get('pausasPorDia', {}), checkins: store.get('checkins', []) },
    Date.now()
  );
  const win = openPainel(dados);
  painelWin = win;
  win.on('closed', () => {
    if (painelWin === win) painelWin = null;
  });
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

      if (!store.get('primeiroDiaUso', null)) {
        store.set('primeiroDiaUso', diaISO(Date.now()));
      }

      iniciarConteudoRemoto();

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
          if (checkinAtivo) return; // check-in ativo: janela pinada interativa
          if (ctaAtivo) return; // CTA ativo: janela pinada interativa
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

      ipcMain.on('checkin-response', (e, resp) => {
        const win = BrowserWindow.fromWebContents(e.sender);
        if (!win || win !== lumiWin || win.isDestroyed()) return;
        finalizarCheckin(resp || { skip: true });
      });

      ipcMain.on('cta-response', (e, resp) => {
        const win = BrowserWindow.fromWebContents(e.sender);
        if (!win || win !== lumiWin || win.isDestroyed()) return;
        finalizarCta(resp === 'ver' ? 'ver' : 'nao');
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

      ipcMain.on('compartilhar-pilula', (e, dataUrl, id) => {
        const win = BrowserWindow.fromWebContents(e.sender);
        if (!win || win !== activityWin || win.isDestroyed()) return;
        try {
          if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/png;base64,')) {
            e.sender.send('pilula-compartilhada', false);
            return;
          }
          const img = nativeImage.createFromDataURL(dataUrl);
          if (img.isEmpty()) {
            e.sender.send('pilula-compartilhada', false);
            return;
          }
          clipboard.writeImage(img);
          const dir = path.join(app.getPath('pictures'), 'Lumi');
          fs.mkdirSync(dir, { recursive: true });
          const nomeId =
            String(id || 'pilula').replace(/[^a-z0-9-]/gi, '').slice(0, 40) || 'pilula';
          const arquivo = path.join(dir, `pilula-${nomeId}-${diaISO(Date.now())}.png`);
          fs.writeFileSync(arquivo, img.toPNG());
          e.sender.send('pilula-compartilhada', true);
        } catch (err) {
          console.error('[lumi] falha ao compartilhar pílula', err);
          e.sender.send('pilula-compartilhada', false);
        }
      });

      ipcMain.on('abrir-painel', (e) => {
        const win = BrowserWindow.fromWebContents(e.sender);
        if (!win || win !== lumiWin || win.isDestroyed()) return;
        if (!perfil || currentTipo || checkinAtivo) return;
        abrirPainelSemanal();
      });

      ipcMain.on('painel-fechar', (e) => {
        const win = BrowserWindow.fromWebContents(e.sender);
        if (win && win === painelWin && !win.isDestroyed()) win.close();
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
                finalizarCheckin({ skip: true });
                finalizarCta('nao');
              },
            })),
          },
          { label: 'Voltar ao normal', click: () => scheduler.silence(Date.now(), 0) },
          { type: 'separator' },
          { label: 'Meu painel', click: () => abrirPainelSemanal() },
          {
            label: 'Recomeçar apresentação',
            click: () => {
              // Cancela qualquer estado em voo antes de recomeçar
              handleResponse('dismiss'); // no-op se não há convite
              finalizarCheckin({ skip: true }); // no-op se não há check-in
              finalizarCta('nao'); // no-op se não há CTA
              perfil = null;
              store.set('perfil', null);
              // Espera a volta ao canto terminar (walk ~1.8s) para o "idle"
              // atrasado não engolir o balão do onboarding
              setTimeout(() => {
                if (!perfil && lumiAlive()) {
                  lumiWin.setIgnoreMouseEvents(false);
                  lumiWin.webContents.send('lumi-state', { state: 'onboarding' });
                }
              }, 2200);
            },
          },
          { type: 'separator' },
          { label: 'Sair do Lumi', click: () => app.quit() },
        ]);
        menu.popup({ window: win });
      });

      setInterval(() => {
        tickCount += 1;
        if (!checandoTelaCheia) {
          checandoTelaCheia = true;
          checarTelaCheia((full) => {
            checandoTelaCheia = false;
            if (full === emTelaCheia) return;
            emTelaCheia = full;
            if (!lumiAlive()) return;
            if (emTelaCheia) {
              lumiWin.hide();
            } else {
              lumiWin.showInactive();
              walkUntil = Date.now() + 60_000; // folga de 1 min ao voltar
            }
          });
        }
        if (emTelaCheia) return; // tudo congela: intervencões ficam adiadas
        const idleSeconds = powerMonitor.getSystemIdleTime();
        const due = scheduler.tick(Date.now(), idleSeconds, TICK_MS);
        if (due && !triggerIntervention()) {
          // Recusado por estado transitório (falinha, cartão aberto, fora do
          // expediente...): fica devido e tenta de novo em ~1 min
          scheduler.snooze(Date.now(), 1);
        }
        updateAttentionWave(idleSeconds);
        maybeFalinha(idleSeconds);
        maybeCheckin(idleSeconds);
        maybeCta(idleSeconds);
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
