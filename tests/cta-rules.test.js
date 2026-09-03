import { describe, it, expect } from 'vitest';
import { ctaDevido } from '../src/main/cta-rules.js';

const as = (dia, h) => new Date(2026, 8, dia, h, 0).getTime(); // setembro/2026
const H48 = 48 * 60 * 60_000;

describe('ctaDevido', () => {
  it('nada antes do 3o dia de uso', () => {
    const estado = { primeiroDiaUso: '2026-09-01', ultimoCtaMs: 0 };
    expect(ctaDevido(as(1, 10), estado)).toBe(false); // dia 0
    expect(ctaDevido(as(3, 10), estado)).toBe(false); // dia 2
    expect(ctaDevido(as(4, 10), estado)).toBe(true);  // dia 3
  });

  it('minimo de 48h entre CTAs', () => {
    const base = as(10, 10);
    const estado = { primeiroDiaUso: '2026-09-01', ultimoCtaMs: base };
    expect(ctaDevido(base + H48 - 60_000, estado)).toBe(false);
    expect(ctaDevido(base + H48 + 60_000, estado)).toBe(true);
  });

  it('sem primeiro dia registrado, nunca', () => {
    expect(ctaDevido(as(10, 10), { primeiroDiaUso: null, ultimoCtaMs: 0 })).toBe(false);
    expect(ctaDevido(as(10, 10), null)).toBe(false);
  });
});
