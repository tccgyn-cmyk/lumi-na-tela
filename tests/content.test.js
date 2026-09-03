import { describe, it, expect } from 'vitest';
import { microPausas, exercicios, convites, falinhas, pilulas, tagsCheckin, acolhimento } from '../src/shared/content.js';

describe('Conteúdo', () => {
  it('tem pelo menos 10 micro-pausas com titulo e texto', () => {
    expect(microPausas.length).toBeGreaterThanOrEqual(10);
    for (const m of microPausas) {
      expect(m.id).toBeTruthy();
      expect(m.titulo).toBeTruthy();
      expect(m.texto).toBeTruthy();
    }
    expect(new Set(microPausas.map((m) => m.id)).size).toBe(microPausas.length);
  });

  it('tem 6 exercicios, cada um com titulo e passos ou respiracao', () => {
    expect(exercicios.length).toBe(6);
    for (const e of exercicios) {
      expect(e.titulo).toBeTruthy();
      expect(Boolean(e.passos) || Boolean(e.respiracao)).toBe(true);
      if (e.respiracao) {
        expect(e.respiracao.inspirar).toBeGreaterThan(0);
        expect(e.respiracao.expirar).toBeGreaterThan(0);
        expect(e.respiracao.ciclos).toBeGreaterThan(0);
      }
    }
  });

  it('tem convites para cada tipo de atividade', () => {
    expect(convites['micro-pausa'].length).toBeGreaterThanOrEqual(3);
    expect(convites['respiracao'].length).toBeGreaterThanOrEqual(3);
  });

  it('tem falinhas suficientes, com texto e periodos validos', () => {
    expect(falinhas.length).toBeGreaterThanOrEqual(25);
    const periodosValidos = ['manha', 'tarde', 'noite', undefined];
    for (const f of falinhas) {
      expect(f.texto).toBeTruthy();
      expect(periodosValidos).toContain(f.periodo);
    }
    // Cada período do dia tem pelo menos 3 opções próprias
    for (const p of ['manha', 'tarde', 'noite']) {
      expect(falinhas.filter((f) => f.periodo === p).length).toBeGreaterThanOrEqual(3);
    }
  });

  it('todo tipo do rodizio tem convites', () => {
    for (const t of ['micro-pausa', 'respiracao', 'pilula']) {
      expect(Array.isArray(convites[t]) && convites[t].length > 0).toBe(true);
    }
  });

  it('tem pelo menos 28 pilulas com id, titulo e texto unicos', () => {
    expect(pilulas.length).toBeGreaterThanOrEqual(28);
    for (const p of pilulas) {
      expect(p.id).toBeTruthy();
      expect(p.titulo).toBeTruthy();
      expect(p.texto).toBeTruthy();
      expect(p.texto.length).toBeLessThanOrEqual(320);
    }
    expect(new Set(pilulas.map((p) => p.id)).size).toBe(pilulas.length);
  });

  it('tem tags de check-in e mensagem de acolhimento com CVV', () => {
    expect(tagsCheckin.length).toBeGreaterThanOrEqual(5);
    expect(acolhimento).toContain('188');
  });
});
