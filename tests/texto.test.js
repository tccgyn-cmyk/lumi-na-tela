import { describe, it, expect } from 'vitest';
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
