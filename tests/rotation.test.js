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
});
