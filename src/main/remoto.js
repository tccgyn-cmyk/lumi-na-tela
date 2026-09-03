const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const { aplicarRemoto } = require('../shared/conteudo-remoto');

// Conteúdo oficial: o arquivo conteudo/conteudo.json do repositório.
// O Roberto edita no site do GitHub e todos os apps atualizam em até 24h.
// LUMI_CONTEUDO_URL=... sobrescreve para testes.
const URL_CONTEUDO =
  process.env.LUMI_CONTEUDO_URL ||
  'https://raw.githubusercontent.com/tccgyn-cmyk/lumi-na-tela/main/conteudo/conteudo.json';
const INTERVALO_MS = 24 * 60 * 60_000;

function caminhoCache() {
  return path.join(app.getPath('userData'), 'conteudo-remoto.json');
}

function aplicarCache() {
  try {
    const json = JSON.parse(fs.readFileSync(caminhoCache(), 'utf8'));
    return aplicarRemoto(json);
  } catch (_err) {
    return false; // sem cache ou cache inválido: segue o conteúdo embutido
  }
}

async function atualizarRemoto() {
  if (!URL_CONTEUDO) return false;
  try {
    const resp = await fetch(URL_CONTEUDO, { signal: AbortSignal.timeout(10_000) });
    if (!resp.ok) return false;
    const json = await resp.json();
    if (!aplicarRemoto(json)) return false;
    try {
      fs.writeFileSync(caminhoCache(), JSON.stringify(json));
    } catch (err) {
      console.error('[lumi] falha ao gravar cache de conteúdo', err);
    }
    console.log('[lumi] conteúdo remoto aplicado');
    return true;
  } catch (_err) {
    return false; // sem internet / fora do ar: segue o que já temos
  }
}

function iniciarConteudoRemoto() {
  aplicarCache(); // último conteúdo válido conhecido, imediato
  atualizarRemoto(); // tenta a versão mais nova em background
  setInterval(atualizarRemoto, INTERVALO_MS);
}

module.exports = { iniciarConteudoRemoto };
