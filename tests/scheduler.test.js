import { describe, it, expect } from 'vitest';
import { Scheduler } from '../src/main/scheduler.js';

const TICK = 5000; // 5s por tick, como no app real
const MIN = 60_000;

// Roda ticks consecutivos e coleta TODOS os disparos (não só o último)
function runTicks(s, { count, startMs = 0, idleSeconds = 0 }) {
  const fires = [];
  for (let i = 1; i <= count; i++) {
    const nowMs = startMs + i * TICK;
    if (s.tick(nowMs, idleSeconds, TICK) === 'intervention-due') fires.push(nowMs);
  }
  return fires;
}

describe('Scheduler', () => {
  it('dispara exatamente uma vez apos acumular o tempo ativo configurado', () => {
    const s = new Scheduler({ intervalMinutes: 50 });
    const fires = runTicks(s, { count: 600 }); // 50 min em ticks de 5s
    expect(fires).toEqual([600 * TICK]);
  });

  it('nao dispara antes do tempo', () => {
    const s = new Scheduler({ intervalMinutes: 50 });
    expect(runTicks(s, { count: 599 })).toEqual([]);
  });

  it('rejeita intervalos invalidos na construcao', () => {
    expect(() => new Scheduler({ intervalMinutes: 'abc' })).toThrow(TypeError);
    expect(() => new Scheduler({ intervalMinutes: 0 })).toThrow(TypeError);
    expect(() => new Scheduler({ intervalMinutes: -5 })).toThrow(TypeError);
    // Faixas de ociosidade incoerentes (reset <= pausa) também são rejeitadas
    expect(
      () => new Scheduler({ idleThresholdSeconds: 1200, idleResetMinutes: 15 })
    ).toThrow(TypeError);
  });

  it('nao acumula tempo em ociosidade curta (pausa, nao reset)', () => {
    const s = new Scheduler({ intervalMinutes: 50, idleThresholdSeconds: 300 });
    // 10 min ociosos: abaixo do limite de reset (15 min) — só pausa
    expect(runTicks(s, { count: 1000, idleSeconds: 600 })).toEqual([]);
  });

  it('pausa na ociosidade curta e retoma de onde parou', () => {
    const s = new Scheduler({ intervalMinutes: 50, idleThresholdSeconds: 300 });
    runTicks(s, { count: 300 });                                        // 25 min ativos
    runTicks(s, { count: 120, startMs: 300 * TICK, idleSeconds: 600 }); // 10 min fora
    const fires = runTicks(s, { count: 300, startMs: 420 * TICK });     // +25 min
    expect(fires.length).toBe(1);
  });

  it('ociosidade longa (almoco) zera o contador', () => {
    const s = new Scheduler({ intervalMinutes: 50, idleThresholdSeconds: 300 });
    runTicks(s, { count: 480 });                                          // 40 min ativos
    runTicks(s, { count: 12, startMs: 480 * TICK, idleSeconds: 1200 });   // 20 min fora: reset
    // Voltou do almoço: precisa dos 50 min completos de novo
    expect(runTicks(s, { count: 599, startMs: 492 * TICK })).toEqual([]);
    expect(runTicks(s, { count: 1, startMs: 1091 * TICK }).length).toBe(1);
  });

  it('adiar (snooze) apos um disparo reagenda para ~10 min, nao para o intervalo cheio', () => {
    const s = new Scheduler({ intervalMinutes: 50 });
    expect(runTicks(s, { count: 600 }).length).toBe(1); // dispara aos 50 min
    s.snooze(600 * TICK, 10);
    const fires = runTicks(s, { count: 240, startMs: 600 * TICK }); // +20 min
    expect(fires.length).toBe(1);
    expect(fires[0]).toBeGreaterThanOrEqual(600 * TICK + 10 * MIN);
    expect(fires[0]).toBeLessThanOrEqual(600 * TICK + 10 * MIN + 2 * TICK);
  });

  it('voltar ao normal (silence 0) cancela o silencio sem aplicar folga', () => {
    const s = new Scheduler({ intervalMinutes: 50 });
    s.silence(0, 60);
    runTicks(s, { count: 100 });          // ~8 min silenciado
    s.silence(100 * TICK, 0);             // cancela
    const fires = runTicks(s, { count: 500, startMs: 100 * TICK });
    expect(fires.length).toBe(1);
    expect(fires[0]).toBe(600 * TICK);
  });

  it('voltar ao normal apos silencio longo mantem a folga de 5 min', () => {
    const s = new Scheduler({ intervalMinutes: 50 });
    s.silence(0, 120);
    const during = runTicks(s, { count: 720 }); // 60 min trabalhando silenciado
    expect(during).toEqual([]);
    s.silence(720 * TICK, 0); // cancela manualmente
    const fires = runTicks(s, { count: 120, startMs: 720 * TICK }); // +10 min
    expect(fires.length).toBe(1);
    expect(fires[0]).toBeGreaterThanOrEqual(720 * TICK + 5 * MIN);
    expect(fires[0]).toBeLessThanOrEqual(720 * TICK + 5 * MIN + 2 * TICK);
  });

  it('silenciar (em atendimento) segura o disparo e da folga de 5 min ao expirar', () => {
    const s = new Scheduler({ intervalMinutes: 50 });
    s.silence(0, 60);
    // 66 min de uso ativo continuo com ticks realistas (nowMs e elapsedMs coerentes)
    const fires = runTicks(s, { count: 792 });
    // Nada dispara durante os 60 min de silencio; ao expirar, a folga de
    // 5 min segura o disparo ate ~65 min (não no instante da expiração)
    expect(fires.length).toBe(1);
    expect(fires[0]).toBeGreaterThanOrEqual(60 * MIN + 5 * MIN);
    expect(fires[0]).toBeLessThanOrEqual(60 * MIN + 5 * MIN + 2 * TICK);
  });

  it('permite mudar o ritmo em tempo de execucao', () => {
    const s = new Scheduler({ intervalMinutes: 50 });
    runTicks(s, { count: 360 }); // 30 min ativos
    s.setIntervalMinutes(30);    // usuário escolheu ritmo mais curto
    const fires = runTicks(s, { count: 12, startMs: 360 * TICK }); // +1 min
    expect(fires.length).toBe(1); // 30 min acumulados >= novo intervalo de 30
    expect(() => s.setIntervalMinutes('abc')).toThrow(TypeError);
    expect(() => s.setIntervalMinutes(0)).toThrow(TypeError);
  });

  it('reseta o contador apos disparar', () => {
    const s = new Scheduler({ intervalMinutes: 50 });
    runTicks(s, { count: 600 }); // dispara
    expect(runTicks(s, { count: 599, startMs: 600 * TICK })).toEqual([]);
  });
});
