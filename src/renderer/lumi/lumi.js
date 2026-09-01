const lumiEl = document.getElementById('lumi');
const bubble = document.getElementById('bubble');
const bubbleText = document.getElementById('bubble-text');
const bubbleActions = document.getElementById('bubble-actions');
const spriteEl = document.getElementById('lumi-sprite');

// Poses do personagem (imagens reais) por estado
const SPRITES = {
  idle: 'img/idle.png',
  blink: 'img/idle-piscar.png',
  talking: 'img/idle.png',
  walking: 'img/idle.png',
  waving: 'img/acena.png',
  invite: 'img/acena.png',
  breathing: 'img/respira.png',
  celebrate: 'img/comemora.png',
};

// Pré-carrega as poses para a troca ser instantânea
for (const src of new Set(Object.values(SPRITES))) {
  const im = new Image();
  im.src = src;
}

function setPose(state) {
  lumiEl.dataset.state = state;
  spriteEl.src = SPRITES[state] || SPRITES.idle;
}

// Click-through dinâmico: só captura o mouse sobre o Lumi ou o balão.
// Envia IPC apenas quando o estado muda (evita tempestade de mensagens).
let ignoring = true;

function setIgnore(next) {
  if (next === ignoring) return;
  ignoring = next;
  window.lumiAPI.setIgnoreMouse(next);
}

document.addEventListener('mousemove', (e) => {
  const interactive = e.target instanceof Element ? e.target.closest('#lumi, #bubble') : null;
  setIgnore(!interactive);
});

// Redes de segurança contra ficar "preso" no modo interativo
document.addEventListener('mouseleave', () => setIgnore(true));
document.addEventListener('mouseout', (e) => {
  if (e.relatedTarget === null) setIgnore(true);
});
window.addEventListener('blur', () => setIgnore(true));

// Piscar de verdade: alterna para o quadro de olhos fechados por um instante
function scheduleBlink() {
  const delay = 3500 + Math.random() * 3500;
  setTimeout(() => {
    if (lumiEl.dataset.state === 'idle') {
      spriteEl.src = SPRITES.blink;
      setTimeout(() => {
        if (lumiEl.dataset.state === 'idle') spriteEl.src = SPRITES.idle;
      }, 170);
    }
    scheduleBlink();
  }, delay);
}
scheduleBlink();

// Micro-gesto periódico: de tempos em tempos o Lumi dá uma espremidinha simpática
function scheduleGesto() {
  const delay = 9000 + Math.random() * 6000;
  setTimeout(() => {
    if (lumiEl.dataset.state === 'idle') {
      spriteEl.classList.add('gesto');
      setTimeout(() => spriteEl.classList.remove('gesto'), 320);
    }
    scheduleGesto();
  }, delay);
}
scheduleGesto();

// Menu de contexto no clique direito do Lumi
lumiEl.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  window.lumiAPI.openMenu();
});

// Estados vindos do processo principal
window.lumiAPI.onState((s) => {
  ignoring = null; // main pinou/despinou por fora; força o próximo envio
  if (s.state) setPose(s.state);
  if (s.state === 'invite') {
    bubbleText.textContent = s.message || '';
    bubble.classList.remove('hidden');
    bubbleActions.classList.remove('hidden');
  } else if (s.state === 'talking') {
    // Falinha: balão sem botões, o main esconde sozinho depois de uns segundos
    bubbleText.textContent = s.message || '';
    bubble.classList.remove('hidden');
    bubbleActions.classList.add('hidden');
  } else {
    bubble.classList.add('hidden');
    bubbleActions.classList.add('hidden');
  }
});

document.getElementById('btn-accept').addEventListener('click', () => window.lumiAPI.respond('accept'));
document.getElementById('btn-snooze').addEventListener('click', () => window.lumiAPI.respond('snooze'));
document.getElementById('btn-dismiss').addEventListener('click', () => window.lumiAPI.respond('dismiss'));

// Janela pinada interativa durante o convite: clique fora do Lumi/balão dispensa
document.addEventListener('mousedown', (e) => {
  const inside = e.target instanceof Element && e.target.closest('#lumi, #bubble');
  if (!inside && lumiEl.dataset.state === 'invite') window.lumiAPI.respond('dismiss');
});
