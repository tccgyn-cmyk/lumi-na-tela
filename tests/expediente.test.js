import { describe, it, expect } from 'vitest';
import { dentroDoExpediente } from '../src/main/expediente.js';

const as = (h, m = 0) => new Date(2026, 8, 2, h, m).getTime();

describe('expediente', () => {
  const comercial = { inicio: '08:00', fim: '18:00' };

  it('dentro e fora do horario comercial', () => {
    expect(dentroDoExpediente(as(10), comercial)).toBe(true);
    expect(dentroDoExpediente(as(7, 59), comercial)).toBe(false);
    expect(dentroDoExpediente(as(18, 0), comercial)).toBe(false);
    expect(dentroDoExpediente(as(8, 0), comercial)).toBe(true);
  });

  it('turno noturno que vira o dia (19h-07h)', () => {
    const noturno = { inicio: '19:00', fim: '07:00' };
    expect(dentroDoExpediente(as(23), noturno)).toBe(true);
    expect(dentroDoExpediente(as(3), noturno)).toBe(true);
    expect(dentroDoExpediente(as(12), noturno)).toBe(false);
  });

  it('turnos variados e ausencia de config liberam sempre', () => {
    expect(dentroDoExpediente(as(3), { turnos: true })).toBe(true);
    expect(dentroDoExpediente(as(3), null)).toBe(true);
    expect(dentroDoExpediente(as(3), undefined)).toBe(true);
  });
});
