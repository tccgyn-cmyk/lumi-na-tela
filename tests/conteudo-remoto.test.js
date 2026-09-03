import { describe, it, expect } from 'vitest';
// require (nao import) de proposito: conteudo-remoto.js e content.js sao
// modulos CommonJS, exatamente como serao carregados pelo processo principal
// do Electron em producao. Usar import ESM aqui faria o Vite/vite-node
// carregar uma segunda instancia de content.js via seu proprio grafo SSR,
// divergente da instancia que aplicarRemoto muta por dentro via require() —
// um artefato só deste ambiente de teste que faria o teste de "mesma
// referencia" falhar por engano.
const { validarRemoto, aplicarRemoto } = require('../src/shared/conteudo-remoto.js');
const { falinhas, pilulas } = require('../src/shared/content.js');

describe('validarRemoto', () => {
  it('aceita json com pelo menos uma chave conhecida e bem formada', () => {
    expect(validarRemoto({ falinhas: [{ texto: 'oi' }] })).toBe(true);
    expect(
      validarRemoto({ pilulas: [{ id: 'x', titulo: 't', texto: 'tx' }] })
    ).toBe(true);
  });

  it('rejeita formas invalidas', () => {
    expect(validarRemoto(null)).toBe(false);
    expect(validarRemoto([])).toBe(false);
    expect(validarRemoto({})).toBe(false);
    expect(validarRemoto({ falinhas: [] })).toBe(false);
    expect(validarRemoto({ falinhas: [{ semTexto: 1 }] })).toBe(false);
    expect(validarRemoto({ pilulas: [{ id: 'x' }] })).toBe(false);
    expect(validarRemoto({ ctas: [{ produto: 'nao-existe', texto: 'x' }] })).toBe(false);
    expect(validarRemoto({ desconhecida: [1] })).toBe(false);
  });

  it('rejeita textos alem dos limites de layout', () => {
    expect(validarRemoto({ falinhas: [{ texto: 'x'.repeat(201) }] })).toBe(false);
    expect(
      validarRemoto({ pilulas: [{ id: 'a', titulo: 't', texto: 'x'.repeat(321) }] })
    ).toBe(false);
  });

  it('rejeita chaves herdadas como produto (prototype pollution)', () => {
    expect(validarRemoto({ ctas: [{ produto: '__proto__', texto: 'x' }] })).toBe(false);
    expect(validarRemoto({ ctas: [{ produto: 'constructor', texto: 'x' }] })).toBe(false);
  });
});

describe('aplicarRemoto', () => {
  it('substitui o conteudo DENTRO do array exportado (mesma referencia)', () => {
    const backup = [...falinhas];
    const ref = falinhas; // referencia pré-existente, como a do main.js
    try {
      expect(aplicarRemoto({ falinhas: [{ texto: 'nova falinha remota' }] })).toBe(true);
      expect(ref.length).toBe(1);
      expect(ref[0].texto).toBe('nova falinha remota');
    } finally {
      falinhas.splice(0, falinhas.length, ...backup);
    }
  });

  it('json invalido nao muta nada', () => {
    const antes = pilulas.length;
    expect(aplicarRemoto({ pilulas: [{ id: 'so-id' }] })).toBe(false);
    expect(pilulas.length).toBe(antes);
  });
});
