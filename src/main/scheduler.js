class Scheduler {
  constructor({ intervalMinutes = 50, idleThresholdSeconds = 300 } = {}) {
    this.intervalMs = intervalMinutes * 60_000;
    this.idleThresholdMs = idleThresholdSeconds * 1000;
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
    if (idleSeconds * 1000 >= this.idleThresholdMs) return null;
    this.activeMs += elapsedMs;
    if (nowMs < this.snoozedUntil || nowMs < this.silencedUntil) return null;
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
