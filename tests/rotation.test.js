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
});
