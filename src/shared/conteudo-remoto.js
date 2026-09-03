const conteudo = require('./content');

// Chaves que o conteúdo remoto pode substituir. Estruturais (RODIZIO,
// exercicios com animação, acolhimento) ficam de fora de propósito.
const CHAVES_ATUALIZAVEIS = ['falinhas', 'pilulas', 'microPausas', 'ctas'];

const formas = {
  falinhas: (i) => Boolean(i) && typeof i.texto === 'string' && i.texto.length > 0,
  pilulas: (i) =>
    Boolean(i) &&
    typeof i.id === 'string' &&
    typeof i.titulo === 'string' &&
    typeof i.texto === 'string',
  microPausas: (i) =>
    Boolean(i) &&
    typeof i.id === 'string' &&
    typeof i.titulo === 'string' &&
    typeof i.texto === 'string',
  ctas: (i) =>
    Boolean(i) &&
    typeof i.texto === 'string' &&
    typeof i.produto === 'string' &&
    Boolean(conteudo.produtos[i.produto]), // só produtos da allowlist embutida
};

function validarRemoto(json) {
  if (!json || typeof json !== 'object' || Array.isArray(json)) return false;
  let algumaConhecida = false;
  for (const chave of Object.keys(json)) {
    if (!CHAVES_ATUALIZAVEIS.includes(chave)) return false;
    if (!Array.isArray(json[chave]) || json[chave].length === 0) return false;
    if (!json[chave].every(formas[chave])) return false;
    algumaConhecida = true;
  }
  return algumaConhecida;
}

// Substitui o conteúdo DENTRO dos arrays exportados (mutação em lugar):
// todos os módulos que já têm a referência enxergam a atualização.
function aplicarRemoto(json) {
  if (!validarRemoto(json)) return false;
  for (const chave of Object.keys(json)) {
    const alvo = conteudo[chave];
    alvo.splice(0, alvo.length, ...json[chave]);
  }
  return true;
}

module.exports = { validarRemoto, aplicarRemoto, CHAVES_ATUALIZAVEIS };
