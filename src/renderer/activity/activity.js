const tituloEl = document.getElementById('titulo');
const descricaoEl = document.getElementById('descricao');
const breathArea = document.getElementById('breath-area');
const circle = document.getElementById('circle');
const breathLabel = document.getElementById('breath-label');
const passosEl = document.getElementById('passos');
const textoEl = document.getElementById('texto');

window.activityAPI.onData((item) => {
  tituloEl.textContent = item.titulo || '';
  if (item.tipo === 'micro-pausa') {
    textoEl.textContent = item.texto || '';
    textoEl.classList.remove('hidden');
    return;
  }
  descricaoEl.textContent = item.descricao || '';
  if (item.respiracao) {
    breathArea.classList.remove('hidden');
    runBreath(item.respiracao);
  } else if (item.passos) {
    passosEl.classList.remove('hidden');
    passosEl.textContent = '';
    for (const passo of item.passos) {
      const li = document.createElement('li');
      li.textContent = passo;
      passosEl.appendChild(li);
    }
  }
});

function runBreath(r) {
  const fases = [
    ['Inspira...', r.inspirar, 'grow'],
    ['Segura', r.segurar, 'grow'],
    ['Solta...', r.expirar, 'shrink'],
    ['Pausa', r.pausa, 'shrink'],
  ].filter((f) => f[1] > 0);

  let ciclo = 0;
  let i = 0;

  function step() {
    if (ciclo >= r.ciclos) {
      breathLabel.textContent = 'Prontinho! Showww 💛';
      circle.style.transitionDuration = '0.6s';
      circle.className = 'circle shrink';
      return;
    }
    const [texto, segundos, classe] = fases[i];
    breathLabel.textContent = `${texto} (${segundos}s)`;
    circle.style.transitionDuration = `${segundos}s`;
    circle.className = `circle ${classe}`;
    setTimeout(() => {
      i = (i + 1) % fases.length;
      if (i === 0) ciclo += 1;
      step();
    }, segundos * 1000);
  }
  step();
}

document.getElementById('btn-done').addEventListener('click', () => {
  window.activityAPI.done();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') window.activityAPI.done();
});
