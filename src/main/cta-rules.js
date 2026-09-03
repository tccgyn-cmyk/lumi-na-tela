const { diaISO } = require('../shared/dias');

const DIAS_MINIMOS_DE_USO = 3; // vínculo antes da oferta
const INTERVALO_MINIMO_MS = 48 * 60 * 60_000; // 1 CTA a cada 2-3 dias

function diasEntre(diaA, diaB) {
  // Meio-dia dos dois lados: imune a horário de verão
  return Math.round(
    (new Date(`${diaB}T12:00:00`) - new Date(`${diaA}T12:00:00`)) / 86_400_000
  );
}

// estado: { primeiroDiaUso: 'YYYY-MM-DD'|null, ultimoCtaMs: number }
function ctaDevido(nowMs, estado) {
  if (!estado || !estado.primeiroDiaUso) return false;
  if (diasEntre(estado.primeiroDiaUso, diaISO(nowMs)) < DIAS_MINIMOS_DE_USO) {
    return false;
  }
  return nowMs - (estado.ultimoCtaMs || 0) >= INTERVALO_MINIMO_MS;
}

module.exports = { ctaDevido, INTERVALO_MINIMO_MS };
