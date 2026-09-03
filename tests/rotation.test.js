import { describe, it, expect } from 'vitest';
import { Rotation } from '../src/main/rotation.js';

describe('Rotation', () => {
  it('alterna os tipos em ciclo', () => {
    const r = new Rotation(['micro-pausa', 'respiracao']);
    expect(r.next()).toBe('micro-pausa');
    expect(r.next()).toBe('respiracao');
    expect(r.next()).toBe('micro-pausa');
    expect(r.next()).toBe('respiracao');
  });

  it('cicla corretamente com 3 tipos (preparo para a fase 3)', () => {
    const r = new Rotation(['a', 'b', 'c']);
    expect([r.next(), r.next(), r.next(), r.next()]).toEqual(['a', 'b', 'c', 'a']);
  });

  it('rejeita lista vazia', () => {
    expect(() => new Rotation([])).toThrow(TypeError);
    expect(() => new Rotation()).toThrow(TypeError);
  });

  it('aceita indice inicial para restaurar rodizio persistido', () => {
    const r = new Rotation(['a', 'b', 'c'], 2);
    expect(r.next()).toBe('c');
    expect(r.next()).toBe('a');
    expect(r.i).toBe(1); // indice exposto para persistencia (proximo a usar: 'b')
  });

  it('indice inicial fora da faixa e normalizado', () => {
    const r = new Rotation(['a', 'b'], 7);
    expect(r.next()).toBe('b'); // 7 % 2 = 1
  });
});
