const GRACE_AFTER_SILENCE_MS = 5 * 60_000;

class Scheduler {
  constructor({ intervalMinutes = 50, idleThresholdSeconds = 300, idleResetMinutes = 15 } = {}) {
    const mins = Number(intervalMinutes);
    if (!Number.isFinite(mins) || mins <= 0) {
      throw new TypeError(`intervalMinutes inválido: ${intervalMinutes}`);
    }
    this.intervalMs = mins * 60_000;
    this.idleThresholdMs = idleThresholdSeconds * 1000;
    this.idleResetMs = idleResetMinutes * 60_000;
    this.activeMs = 0;
    this.snoozedUntil = 0;
    this.silencedUntil = 0;
  }

  /**
   * Chamado a cada tick do relógio do app.
   * @param {number} nowMs timestamp atual
   * @param {number} idleSeconds segundos de ociosidade do sistema
   * @param {number} elapsedMs quanto tempo passou desde o último tick
   * @returns {'intervention-due'|null}
   */
  tick(nowMs, idleSeconds, elapsedMs) {
    const idleMs = idleSeconds * 1000;
    if (idleMs >= this.idleThresholdMs) {
      // Pausa curta (ex.: reunião) só pausa o contador; pausa longa
      // (ex.: almoço) já foi descanso de verdade — zera o contador.
      if (idleMs >= this.idleResetMs) this.activeMs = 0;
      return null;
    }
    this.activeMs += elapsedMs;
    if (nowMs < this.snoozedUntil) return null;
    if (this.silencedUntil > 0) {
      if (nowMs < this.silencedUntil) return null;
      // "Em atendimento" acabou de expirar: dá uma folga antes de intervir,
      // em vez de disparar no mesmo instante.
      this.activeMs = Math.min(
        this.activeMs,
        Math.max(0, this.intervalMs - GRACE_AFTER_SILENCE_MS)
      );
      this.silencedUntil = 0;
    }
    if (this.activeMs >= this.intervalMs) {
      this.activeMs = 0;
      return 'intervention-due';
    }
    return null;
  }

  snooze(nowMs, minutes) {
    this.snoozedUntil = nowMs + minutes * 60_000;
  }

  silence(nowMs, minutes) {
    this.silencedUntil = nowMs + minutes * 60_000;
  }
}

module.exports = { Scheduler };
