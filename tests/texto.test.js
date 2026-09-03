import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { quebrarLinhas } from '../src/shared/texto.js';

// medidor de teste: largura = numero de caracteres
const porChar = (s) => s.length;

describe('quebrarLinhas', () => {
  it('quebra respeitando a largura maxima', () => {
    expect(quebrarLinhas('um dois tres quatro', 8, porChar)).toEqual([
      'um dois',
      'tres',
      'quatro',
    ]);
  });

  it('linha unica quando cabe', () => {
    expect(quebrarLinhas('oi mundo', 20, porChar)).toEqual(['oi mundo']);
  });

  it('palavra maior que a largura fica sozinha na linha', () => {
    expect(quebrarLinhas('a palavraenorme b', 6, porChar)).toEqual([
      'a',
      'palavraenorme',
      'b',
    ]);
  });

  it('texto vazio vira lista vazia', () => {
    expect(quebrarLinhas('', 10, porChar)).toEqual([]);
    expect(quebrarLinhas('   ', 10, porChar)).toEqual([]);
  });
});

it('texto-bridge.js espelha exatamente a implementacao compartilhada', () => {
  const fonte = fs.readFileSync('src/shared/texto.js', 'utf8');
  const bridge = fs.readFileSync('src/renderer/activity/texto-bridge.js', 'utf8');
  const corpo = fonte.slice(fonte.indexOf('function quebrarLinhas'), fonte.indexOf('\nmodule.exports'));
  expect(bridge).toContain(corpo.trim());
});
