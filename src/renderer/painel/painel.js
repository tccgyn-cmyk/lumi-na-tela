const ROTULOS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const CARINHAS = [null, '😞', '😕', '😐', '🙂', '😄'];

function rotuloDo(diaISO) {
  return ROTULOS[new Date(`${diaISO}T12:00:00`).getDay()];
}

window.painelAPI.onData((dados) => {
  document.getElementById('seq-num').textContent = String(dados.sequencia);
  document.getElementById('seq-texto').textContent =
    dados.sequencia === 1 ? 'dia cuidando de você' : 'dias seguidos cuidando de você';

  const barras = document.getElementById('barras');
  barras.textContent = '';
  const max = Math.max(1, ...dados.pausas.map((p) => p.pausas));
  for (const p of dados.pausas) {
    const barra = document.createElement('div');
    barra.className = 'barra';
    const valor = document.createElement('div');
    valor.className = 'valor';
    valor.textContent = p.pausas > 0 ? String(p.pausas) : '';
    const coluna = document.createElement('div');
    coluna.className = 'coluna';
    coluna.style.height = `${Math.round((p.pausas / max) * 60)}px`;
    const rotulo = document.createElement('div');
    rotulo.className = 'rotulo';
    rotulo.textContent = rotuloDo(p.dia);
    barra.append(valor, coluna, rotulo);
    barras.appendChild(barra);
  }

  const humor = document.getElementById('humor');
  humor.textContent = '';
  for (const h of dados.humor) {
    const dia = document.createElement('div');
    dia.className = 'dia';
    const chegada = document.createElement('span');
    chegada.textContent = h.chegada ? CARINHAS[h.chegada] : '·';
    const saida = document.createElement('span');
    saida.textContent = h.saida ? CARINHAS[h.saida] : '·';
    const rotulo = document.createElement('div');
    rotulo.className = 'rotulo';
    rotulo.textContent = rotuloDo(h.dia);
    dia.append(chegada, saida, rotulo);
    humor.appendChild(dia);
  }

  document.getElementById('destaque').textContent = dados.destaque;
});

document.getElementById('btn-fechar').addEventListener('click', () => window.painelAPI.fechar());
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') window.painelAPI.fechar();
});
