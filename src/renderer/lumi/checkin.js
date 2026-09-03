// UI do check-in emocional no balão. O main envia
// { state: 'checkin', ancora, tags: [...] } e pina a janela interativa.
(() => {
  const bubble = document.getElementById('bubble');
  const bubbleText = document.getElementById('bubble-text');
  const bloco = document.getElementById('checkin');
  const facesEl = document.getElementById('checkin-faces');
  const tagsEl = document.getElementById('checkin-tags');
  const enviarBtn = document.getElementById('checkin-enviar');
  const pularBtn = document.getElementById('checkin-pular');

  const FACES = ['😞', '😕', '😐', '🙂', '😄'];
  let ancora = null;
  let nota = null;
  let tagsMarcadas = new Set();

  function abrir(estado) {
    ancora = estado.ancora;
    nota = null;
    tagsMarcadas = new Set();
    bubbleText.textContent =
      ancora === 'chegada' ? 'Como você chega hoje?' : 'Fim de dia chegando... como você está?';
    facesEl.textContent = '';
    FACES.forEach((f, i) => {
      const b = document.createElement('button');
      b.textContent = f;
      b.addEventListener('click', () => {
        nota = i + 1;
        for (const x of facesEl.children) x.classList.remove('escolhida');
        b.classList.add('escolhida');
        montarTags(estado.tags || []);
      });
      facesEl.appendChild(b);
    });
    tagsEl.classList.add('hidden');
    enviarBtn.classList.add('hidden');
    bloco.classList.remove('hidden');
    bubble.classList.remove('hidden');
  }

  function montarTags(tags) {
    tagsEl.textContent = '';
    for (const t of tags) {
      const b = document.createElement('button');
      b.textContent = t;
      b.addEventListener('click', () => {
        if (tagsMarcadas.has(t)) tagsMarcadas.delete(t);
        else tagsMarcadas.add(t);
        b.classList.toggle('marcada');
      });
      tagsEl.appendChild(b);
    }
    tagsEl.classList.remove('hidden');
    enviarBtn.classList.remove('hidden');
  }

  function fechar() {
    bloco.classList.add('hidden');
    bubble.classList.add('hidden');
  }

  enviarBtn.addEventListener('click', () => {
    if (nota === null) return;
    window.lumiAPI.checkinResponder({ ancora, nota, tags: [...tagsMarcadas] });
    fechar();
  });
  pularBtn.addEventListener('click', () => {
    window.lumiAPI.checkinResponder({ ancora, skip: true });
    fechar();
  });

  window.addEventListener('lumi-estado', (e) => {
    if (e.detail.state === 'checkin') abrir(e.detail);
    else if (e.detail.state !== 'onboarding') bloco.classList.add('hidden');
  });
})();
