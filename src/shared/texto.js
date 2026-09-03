// Quebra texto em linhas que caibam em larguraMax segundo a função medir
// (no canvas: (s) => ctx.measureText(s).width; nos testes: (s) => s.length).
function quebrarLinhas(texto, larguraMax, medir) {
  const palavras = String(texto).split(/\s+/).filter(Boolean);
  const linhas = [];
  let atual = '';
  for (const palavra of palavras) {
    const tentativa = atual ? `${atual} ${palavra}` : palavra;
    if (medir(tentativa) <= larguraMax || !atual) {
      atual = tentativa;
    } else {
      linhas.push(atual);
      atual = palavra;
    }
  }
  if (atual) linhas.push(atual);
  return linhas;
}

module.exports = { quebrarLinhas };
