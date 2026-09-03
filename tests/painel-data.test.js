import { describe, it, expect } from 'vitest';
import { dadosDoPainel, sequenciaAtual } from '../src/main/painel-data.js';

const hoje = new Date(2026, 8, 4, 17, 0).getTime(); // sexta, 4 de setembro de 2026

describe('sequenciaAtual', () => {
  it('conta dias consecutivos com pausa, terminando hoje', () => {
    const pausas = { '2026-09-02': 3, '2026-09-03': 1, '2026-09-04': 2 };
    expect(sequenciaAtual(pausas, hoje)).toBe(3);
  });

  it('hoje ainda sem pausa nao quebra a sequencia de ontem', () => {
    const pausas = { '2026-09-02': 3, '2026-09-03': 1 };
    expect(sequenciaAtual(pausas, hoje)).toBe(2);
  });

  it('buraco no meio quebra', () => {
    const pausas = { '2026-09-01': 2, '2026-09-03': 1, '2026-09-04': 1 };
    expect(sequenciaAtual(pausas, hoje)).toBe(2);
  });

  it('sem nada, zero', () => {
    expect(sequenciaAtual({}, hoje)).toBe(0);
  });
});

describe('dadosDoPainel', () => {
  it('monta 7 dias com pausas e humor por ancora', () => {
    const dados = dadosDoPainel(
      {
        pausasPorDia: { '2026-09-04': 2, '2026-09-03': 1 },
        checkins: [
          { dia: '2026-09-04', ancora: 'chegada', nota: 4 },
          { dia: '2026-09-04', ancora: 'saida', nota: 2 },
        ],
      },
      hoje
    );
    expect(dados.pausas).toHaveLength(7);
    expect(dados.pausas[6]).toEqual({ dia: '2026-09-04', pausas: 2 });
    expect(dados.humor[6]).toEqual({ dia: '2026-09-04', chegada: 4, saida: 2 });
    expect(dados.humor[5].chegada).toBeNull();
    expect(dados.sequencia).toBe(2);
    expect(typeof dados.destaque).toBe('string');
    expect(dados.destaque.length).toBeGreaterThan(0);
  });

  it('destaque aponta o dia de saida mais pesado quando ha saida <= 2', () => {
    const dados = dadosDoPainel(
      {
        pausasPorDia: {},
        checkins: [
          { dia: '2026-09-03', ancora: 'saida', nota: 1 },
          { dia: '2026-09-04', ancora: 'saida', nota: 4 },
        ],
      },
      hoje
    );
    expect(dados.destaque).toContain('Quinta'); // 3 de setembro de 2026 é quinta
  });
});
