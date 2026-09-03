const DIA_MS = 86_400_000;

function diaISO(ms) {
  const d = new Date(ms);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dia}`;
}

// N dias terminando em nowMs, do mais antigo ao mais recente
function ultimosDias(nowMs, n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) out.push(diaISO(nowMs - i * DIA_MS));
  return out;
}

module.exports = { diaISO, ultimosDias, DIA_MS };
