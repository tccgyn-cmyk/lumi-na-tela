const lumiEl = document.getElementById('lumi');
const bubble = document.getElementById('bubble');
const bubbleText = document.getElementById('bubble-text');
const bubbleActions = document.getElementById('bubble-actions');

// Click-through dinâmico: só captura o mouse sobre o Lumi ou o balão.
// Envia IPC apenas quando o estado muda (evita tempestade de mensagens).
let ignoring = true;

function setIgnore(next) {
  if (next === ignoring) return;
  ignoring = next;
  window.lumiAPI.setIgnoreMouse(next);
}

document.addEventListener('mousemove', (e) => {
  const interactive = e.target.closest('#lumi, #bubble');
  setIgnore(!interactive);
});

// Redes de segurança contra ficar "preso" no modo interativo
document.addEventListener('mouseleave', () => setIgnore(true));
document.addEventListener('mouseout', (e) => {
  if (e.relatedTarget === null) setIgnore(true);
});

// Menu de contexto no clique direito do Lumi
lumiEl.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  window.lumiAPI.openMenu();
});

// Estados vindos do processo principal
window.lumiAPI.onState((s) => {
  if (s.state) lumiEl.dataset.state = s.state;
  if (s.state === 'invite') {
    bubbleText.textContent = s.message;
    bubble.classList.remove('hidden');
    bubbleActions.classList.remove('hidden');
  } else {
    bubble.classList.add('hidden');
  }
});

document.getElementById('btn-accept').addEventListener('click', () => window.lumiAPI.respond('accept'));
document.getElementById('btn-snooze').addEventListener('click', () => window.lumiAPI.respond('snooze'));
document.getElementById('btn-dismiss').addEventListener('click', () => window.lumiAPI.respond('dismiss'));
