const { ultimosDias } = require('../shared/dias');

const ASSENTAR_MS = 2 * 60_000; // não aborda nos primeiríssimos minutos
const JANELA_CHEGADA_MS = 30 * 60_000;
const HORA_SAIDA = 16;

// estado: { firstActiveMs: number|null, feitos: { chegada?: bool, saida?: bool } }
// Retorna 'chegada' | 'saida' | null
function ancoraDevida(nowMs, estado) {
  if (!estado || !estado.firstActiveMs) return null;
  const feitos = estado.feitos || {};
  const desdePrimeiroUso = nowMs - estado.firstActiveMs;
  if (!feitos.chegada && desdePrimeiroUso >= ASSENTAR_MS && desdePrimeiroUso <= JANELA_CHEGADA_MS) {
    return 'chegada';
  }
  // A saída independe de a chegada ter acontecido
  if (!feitos.saida && new Date(nowMs).getHours() >= HORA_SAIDA) return 'saida';
  return null;
}

// registros: [{ dia: 'YYYY-MM-DD', ancora: 'chegada'|'saida', nota: 1..5 }]
// true se ALGUMA âncora ficou com todas as notas <= 2 nos últimos 3 dias,
// com registro presente nos 3 dias.
function precisaAcolher(registros, nowMs) {
  const dias = ultimosDias(nowMs, 3);
  for (const ancora of ['chegada', 'saida']) {
    const porDia = dias.map((d) =>
      registros.filter((r) => r.dia === d && r.ancora === ancora).map((r) => r.nota)
    );
    const todosBaixos = porDia.every((notas) => notas.length > 0 && notas.every((n) => n <= 2));
    if (todosBaixos) return true;
  }
  return false;
}

module.exports = { ancoraDevida, precisaAcolher };
