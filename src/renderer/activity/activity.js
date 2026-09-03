const tituloEl = document.getElementById('titulo');
const descricaoEl = document.getElementById('descricao');
const breathArea = document.getElementById('breath-area');
const circle = document.getElementById('circle');
const breathLabel = document.getElementById('breath-label');
const passosEl = document.getElementById('passos');
const textoEl = document.getElementById('texto');
const btnShare = document.getElementById('btn-share');
let itemAtual = null;
let shareGuard = null;

window.activityAPI.onData((item) => {
  tituloEl.textContent = item.titulo || '';
  if (item.tipo === 'pilula') {
    textoEl.textContent = item.texto || '';
    textoEl.classList.remove('hidden');
    document.getElementById('assinatura').classList.remove('hidden');
    itemAtual = item;
    btnShare.classList.remove('hidden');
    return;
  }
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

// ===== Story compartilhável (1080x1920) =====
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function desenharLinhas(ctx, linhas, x, y, alturaLinha) {
  for (const linha of linhas) {
    ctx.fillText(linha, x, y);
    y += alturaLinha;
  }
  return y;
}

function gerarStory(item, done) {
  const c = document.createElement('canvas');
  c.width = 1080;
  c.height = 1920;
  const ctx = c.getContext('2d');
  const medir = (s) => ctx.measureText(s).width;

  // Mede o conteúdo ANTES de desenhar: o cartão abraça o texto
  ctx.font = 'bold 58px "Segoe UI", "Helvetica Neue", Arial, sans-serif';
  const linhasTitulo = quebrarLinhas(item.titulo, 780, medir);
  ctx.font = '44px "Segoe UI", "Helvetica Neue", Arial, sans-serif';
  const linhasTexto = quebrarLinhas(item.texto, 780, medir);

  const alturaConteudo =
    linhasTitulo.length * 72 + 60 + linhasTexto.length * 62 + 20 + 60; // título + respiro + texto + respiro + assinatura
  const cardH = alturaConteudo + 220; // padding interno
  const cardTop = Math.max(
    180,
    Math.min(Math.round((1580 - cardH) / 2) + 160, 1470 - cardH)
  );

  const fundo = ctx.createLinearGradient(0, 0, 0, 1920);
  fundo.addColorStop(0, '#fdf8e8');
  fundo.addColorStop(1, '#dff0ec');
  ctx.fillStyle = fundo;
  ctx.fillRect(0, 0, 1080, 1920);

  ctx.fillStyle = '#ffffff';
  roundRect(ctx, 90, cardTop, 900, cardH, 48);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = '#3f9e94';
  ctx.font = 'bold 58px "Segoe UI", "Helvetica Neue", Arial, sans-serif';
  let y = desenharLinhas(ctx, linhasTitulo, 540, cardTop + 130, 72);

  ctx.fillStyle = '#3a3a3a';
  ctx.font = '44px "Segoe UI", "Helvetica Neue", Arial, sans-serif';
  y = desenharLinhas(ctx, linhasTexto, 540, y + 60, 62);

  ctx.fillStyle = '#3f9e94';
  ctx.font = 'italic 40px "Segoe UI", "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('— @robertoribeiropsi', 540, y + 20);

  ctx.fillStyle = '#b09a55';
  ctx.font = '34px "Segoe UI", "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('feito com Lumi 💛', 540, 1830);

  const img = new Image();
  img.onload = () => {
    // Proporção real do personagem (sprite alto e fino)
    const alturaLumi = 280;
    const larguraLumi = Math.round((alturaLumi * img.width) / img.height);
    ctx.drawImage(img, 1080 - 100 - larguraLumi, 1920 - 150 - alturaLumi, larguraLumi, alturaLumi);
    done(c.toDataURL('image/png'));
  };
  img.onerror = () => done(c.toDataURL('image/png'));
  img.src = '../lumi/img/idle.png';
}

btnShare.addEventListener('click', () => {
  if (!itemAtual) return;
  btnShare.disabled = true;
  btnShare.textContent = 'Gerando... 🎨';
  shareGuard = setTimeout(() => {
    btnShare.disabled = false;
    btnShare.textContent = 'Compartilhar 📸';
  }, 10_000);
  gerarStory(itemAtual, (dataUrl) => {
    window.activityAPI.compartilhar(dataUrl, itemAtual.id);
  });
});

window.activityAPI.onCompartilhado((ok) => {
  clearTimeout(shareGuard);
  btnShare.textContent = ok
    ? 'Copiado e salvo em Imagens/Lumi ✨'
    : 'Ops, não consegui 😢 Tenta de novo?';
  btnShare.disabled = false;
});
