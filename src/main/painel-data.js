const { diaISO, ultimosDias, DIA_MS } = require('../shared/dias');

function sequenciaAtual(pausasPorDia, nowMs) {
  let seq = 0;
  let cursor = nowMs;
  // hoje sem pausa ainda não quebra a sequência — começa a contar de ontem
  if (!(pausasPorDia[diaISO(cursor)] > 0)) cursor -= DIA_MS;
  while (pausasPorDia[diaISO(cursor)] > 0) {
    seq += 1;
    cursor -= DIA_MS;
  }
  return seq;
}

const NOMES_DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

function destaqueDaSemana(pausas, humor) {
  const comSaida = humor.filter((h) => h.saida !== null);
  if (comSaida.length >= 2) {
    const pior = comSaida.reduce((a, b) => (b.saida < a.saida ? b : a));
    if (pior.saida <= 2) {
      const nome = NOMES_DIAS[new Date(`${pior.dia}T12:00:00`).getDay()];
      return `${nome} foi seu dia mais pesado. Que tal se preparar com carinho pro próximo?`;
    }
  }
  const total = pausas.reduce((s, p) => s + p.pausas, 0);
  if (total > 0) return `Você fez ${total} pausa${total > 1 ? 's' : ''} esta semana. Showww!`;
  return 'Semana começando — bora cuidar de você?';
}

// entrada: { pausasPorDia: {dia: n}, checkins: [{dia, ancora, nota}] }
function dadosDoPainel({ pausasPorDia = {}, checkins = [] }, nowMs) {
  const dias = ultimosDias(nowMs, 7);
  const pausas = dias.map((dia) => ({ dia, pausas: pausasPorDia[dia] || 0 }));
  const humor = dias.map((dia) => {
    const notaDe = (ancora) => {
      const doDia = checkins.filter((c) => c.dia === dia && c.ancora === ancora);
      return doDia.length ? doDia[doDia.length - 1].nota : null;
    };
    return { dia, chegada: notaDe('chegada'), saida: notaDe('saida') };
  });
  return {
    sequencia: sequenciaAtual(pausasPorDia, nowMs),
    pausas,
    humor,
    destaque: destaqueDaSemana(pausas, humor),
  };
}

module.exports = { dadosDoPainel, sequenciaAtual };
