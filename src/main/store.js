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
    // Arquivo corrompido: preserva como .bak (sem sobrescrever um .bak
    // anterior, que pode ser o último backup bom) e recomeça limpo
    try {
      if (!fs.existsSync(`${filePath}.bak`)) {
        fs.renameSync(filePath, `${filePath}.bak`);
      } else {
        fs.rmSync(filePath, { force: true });
      }
    } catch (_renameErr) {
      /* se nem isso der, seguimos com dados vazios */
    }
    data = {};
  }

  function persist() {
    // Escrita atômica: tmp + rename, para nunca deixar JSON truncado
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      const tmp = `${filePath}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
      fs.renameSync(tmp, filePath);
    } catch (err) {
      // Falha de I/O (ex.: antivírus segurando o arquivo) não pode derrubar
      // o app — seguimos com o estado em memória e tentamos no próximo set
      console.error('[lumi] falha ao persistir dados', err);
    }
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
