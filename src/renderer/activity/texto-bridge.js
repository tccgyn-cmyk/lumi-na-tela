// Ponte: expõe quebrarLinhas do módulo compartilhado para a página
// (mesma implementação de src/shared/texto.js — mantida em sincronia pelo
// teste tests/texto.test.js; o renderer sandboxed não usa require)
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
