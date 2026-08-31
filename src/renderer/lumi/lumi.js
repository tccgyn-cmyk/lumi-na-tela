const lumiEl = document.getElementById('lumi');
const bubble = document.getElementById('bubble');
const bubbleText = document.getElementById('bubble-text');
const bubbleActions = document.getElementById('bubble-actions');
const eyesEl = document.querySelector('.eyes');

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

// Piscar controlado por JS: evita manter uma animação CSS infinita rodando sempre.
function scheduleBlink() {
  const delay = 4000 + Math.random() * 3000;
  setTimeout(() => {
    if (eyesEl) {
      eyesEl.classList.add('blinking');
      setTimeout(() => eyesEl.classList.remove('blinking'), 200);
    }
    scheduleBlink();
  }, delay);
}
scheduleBlink();

// Menu de contexto no clique direito do Lumi
lumiEl.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  window.lumiAPI.openMenu();
});

// Estados vindos do processo principal
window.lumiAPI.onState((s) => {
  if (s.state) lumiEl.dataset.state = s.state;
  if (s.state === 'invite') {
    bubbleText.textContent = s.message || '';
    bubble.classList.remove('hidden');
    bubbleActions.classList.remove('hidden');
  } else {
    bubble.classList.add('hidden');
    bubbleActions.classList.add('hidden');
  }
});

document.getElementById('btn-accept').addEventListener('click', () => window.lumiAPI.respond('accept'));
document.getElementById('btn-snooze').addEventListener('click', () => window.lumiAPI.respond('snooze'));
document.getElementById('btn-dismiss').addEventListener('click', () => window.lumiAPI.respond('dismiss'));
