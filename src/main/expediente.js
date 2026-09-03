// expediente: { inicio: 'HH:MM', fim: 'HH:MM' } | { turnos: true } | null
function parseHHMM(s) {
  const [h, m] = String(s).split(':').map(Number);
  return h * 60 + m;
}

function dentroDoExpediente(nowMs, expediente) {
  if (!expediente || expediente.turnos) return true;
  const d = new Date(nowMs);
  const agora = d.getHours() * 60 + d.getMinutes();
  const ini = parseHHMM(expediente.inicio);
  const fim = parseHHMM(expediente.fim);
  if (!Number.isFinite(ini) || !Number.isFinite(fim) || ini === fim) return true;
  if (ini < fim) return agora >= ini && agora < fim;
  // Turno que vira a noite (ex.: 19:00-07:00)
  return agora >= ini || agora < fim;
}

module.exports = { dentroDoExpediente };
