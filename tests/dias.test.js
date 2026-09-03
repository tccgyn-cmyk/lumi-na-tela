import { describe, it, expect } from 'vitest';
import { diaISO, ultimosDias } from '../src/shared/dias.js';

describe('dias', () => {
  it('formata dia local como YYYY-MM-DD', () => {
    const ms = new Date(2026, 8, 2, 15, 30).getTime(); // 2 de setembro de 2026
    expect(diaISO(ms)).toBe('2026-09-02');
  });

  it('lista os ultimos N dias, do mais antigo ao mais recente', () => {
    const ms = new Date(2026, 8, 2, 12, 0).getTime();
    expect(ultimosDias(ms, 3)).toEqual(['2026-08-31', '2026-09-01', '2026-09-02']);
  });

  it('vira mes e ano corretamente', () => {
    const ms = new Date(2026, 0, 1, 12, 0).getTime();
    expect(ultimosDias(ms, 2)).toEqual(['2025-12-31', '2026-01-01']);
  });
});
