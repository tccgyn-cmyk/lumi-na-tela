import { describe, it, expect } from 'vitest';
import { Scheduler } from '../src/main/scheduler.js';

const TICK = 5000; // 5s por tick, como no app real
const MIN = 60_000;

function runTicks(s, { count, startMs = 0, idleSeconds = 0 }) {
  let last = null;
  for (let i = 1; i <= count; i++) {
    last = s.tick(startMs + i * TICK, idleSeconds, TICK);
  }
  return last;
}

describe('Scheduler', () => {
  it('dispara intervencao apos acumular o tempo ativo configurado', () => {
    const s = new Scheduler({ intervalMinutes: 50 });
    // 50 min = 600 ticks de 5s; o último tick deve disparar
    const result = runTicks(s, { count: 600 });
    expect(result).toBe('intervention-due');
  });

  it('nao dispara antes do tempo', () => {
    const s = new Scheduler({ intervalMinutes: 50 });
    const result = runTicks(s, { count: 599 });
    expect(result).toBeNull();
  });

  it('nao acumula tempo enquanto o usuario esta ocioso', () => {
    const s = new Scheduler({ intervalMinutes: 50, idleThresholdSeconds: 300 });
    const result = runTicks(s, { count: 1000, idleSeconds: 600 });
    expect(result).toBeNull();
  });

  it('pausa na ociosidade e retoma de onde parou', () => {
    const s = new Scheduler({ intervalMinutes: 50, idleThresholdSeconds: 300 });
    runTicks(s, { count: 300 });                                  // 25 min ativos
    runTicks(s, { count: 500, startMs: 300 * TICK, idleSeconds: 600 }); // almoço
    const result = runTicks(s, { count: 300, startMs: 800 * TICK });    // +25 min
    expect(result).toBe('intervention-due');
  });

  it('adiar (snooze) segura o disparo ate expirar', () => {
    const s = new Scheduler({ intervalMinutes: 50 });
    runTicks(s, { count: 599 });
    s.snooze(599 * TICK, 10); // adia 10 min
    // Durante o snooze, mesmo passando do limite, não dispara
    const during = runTicks(s, { count: 100, startMs: 599 * TICK });
    expect(during).toBeNull();
    // Depois que o snooze expira, dispara no próximo tick
    const after = s.tick(599 * TICK + 11 * MIN, 0, TICK);
    expect(after).toBe('intervention-due');
  });

  it('silenciar (em atendimento) segura o disparo ate expirar', () => {
    const s = new Scheduler({ intervalMinutes: 50 });
    s.silence(0, 60);
    const during = runTicks(s, { count: 700 });
    expect(during).toBeNull();
    const after = s.tick(61 * MIN + 700 * TICK, 0, TICK);
    expect(after).toBe('intervention-due');
  });

  it('reseta o contador apos disparar', () => {
    const s = new Scheduler({ intervalMinutes: 50 });
    runTicks(s, { count: 600 }); // dispara
    const next = runTicks(s, { count: 599, startMs: 600 * TICK });
    expect(next).toBeNull();
  });
});
