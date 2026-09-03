const fs = require('fs');
const path = require('path');

// Persistência local simples: um JSON, gravação síncrona a cada set.
// Nada sai da máquina do usuário.
function createStore(filePath) {
  let data = {};
  try {
    if (fs.existsSync(filePath)) {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('formato inválido');
      }
      data = parsed;
    }
  } catch (_err) {
    // Arquivo corrompido: preserva como .bak e recomeça limpo (sem crash)
    try {
      fs.renameSync(filePath, `${filePath}.bak`);
    } catch (_renameErr) {
      /* se nem renomear der, seguimos com dados vazios */
    }
    data = {};
  }

  function persist() {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  return {
    get(key, fallback) {
      return key in data ? data[key] : fallback;
    },
    set(key, value) {
      data[key] = value;
      persist();
    },
    all() {
      return { ...data };
    },
  };
}

module.exports = { createStore };
