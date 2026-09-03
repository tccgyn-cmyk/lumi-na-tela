import { describe, it, expect } from 'vitest';
import { ancoraDevida, precisaAcolher } from '../src/main/checkin-rules.js';

const as = (h, m = 0) => new Date(2026, 8, 2, h, m).getTime();

describe('ancoraDevida', () => {
  it('chegada: entre 2 e 30 min apos o primeiro uso do dia', () => {
    const first = as(8, 0);
    const estado = { firstActiveMs: first, feitos: {} };
    expect(ancoraDevida(as(8, 1), estado)).toBeNull(); // cedo demais (assentando)
    expect(ancoraDevida(as(8, 10), estado)).toBe('chegada');
    expect(ancoraDevida(as(8, 31), estado)).toBeNull(); // janela passou
  });

  it('chegada feita nao repete', () => {
    const estado = { firstActiveMs: as(8, 0), feitos: { chegada: true } };
    expect(ancoraDevida(as(8, 10), estado)).toBeNull();
  });

  it('saida: primeira oportunidade apos as 16h, uma vez', () => {
    const estado = { firstActiveMs: as(8, 0), feitos: { chegada: true } };
    expect(ancoraDevida(as(15, 59), estado)).toBeNull();
    expect(ancoraDevida(as(16, 5), estado)).toBe('saida');
    expect(
      ancoraDevida(as(17, 0), { firstActiveMs: as(8, 0), feitos: { chegada: true, saida: true } })
    ).toBeNull();
  });

  it('chegada tarde (comecou 17h) tem prioridade sobre a saida', () => {
    const estado = { firstActiveMs: as(17, 0), feitos: {} };
    expect(ancoraDevida(as(17, 10), estado)).toBe('chegada');
  });

  it('sem primeiro uso registrado, nada e devido', () => {
    expect(ancoraDevida(as(10), { firstActiveMs: null, feitos: {} })).toBeNull();
    expect(ancoraDevida(as(10), null)).toBeNull();
  });
});

describe('precisaAcolher', () => {
  const dia = (n) => `2026-09-0${n}`;
  const reg = (d, ancora, nota) => ({ dia: d, ancora, nota });
  const hoje = new Date(2026, 8, 3, 17, 0).getTime(); // 3 de setembro

  it('3 dias seguidos com chegada <= 2 aciona acolhimento', () => {
    const regs = [reg(dia(1), 'chegada', 2), reg(dia(2), 'chegada', 1), reg(dia(3), 'chegada', 2)];
    expect(precisaAcolher(regs, hoje)).toBe(true);
  });

  it('um dia bom no meio quebra a regra', () => {
    const regs = [reg(dia(1), 'chegada', 2), reg(dia(2), 'chegada', 4), reg(dia(3), 'chegada', 1)];
    expect(precisaAcolher(regs, hoje)).toBe(false);
  });

  it('dias sem registro nao contam como ruins', () => {
    const regs = [reg(dia(1), 'chegada', 1), reg(dia(3), 'chegada', 1)];
    expect(precisaAcolher(regs, hoje)).toBe(false);
  });

  it('saida baixa tambem aciona, independente da chegada', () => {
    const regs = [
      reg(dia(1), 'saida', 1), reg(dia(2), 'saida', 2), reg(dia(3), 'saida', 1),
      reg(dia(3), 'chegada', 5),
    ];
    expect(precisaAcolher(regs, hoje)).toBe(true);
  });
});
