import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createStore } from '../src/main/store.js';

let dir;
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lumi-store-'));
});

describe('store', () => {
  it('grava e le de volta apos reabrir (persistencia real)', () => {
    const file = path.join(dir, 'dados.json');
    const s1 = createStore(file);
    s1.set('perfil', { nome: 'Roberto', ritmoMin: 60 });
    const s2 = createStore(file);
    expect(s2.get('perfil').nome).toBe('Roberto');
  });

  it('retorna fallback quando a chave nao existe', () => {
    const s = createStore(path.join(dir, 'dados.json'));
    expect(s.get('inexistente', 42)).toBe(42);
    expect(s.get('inexistente')).toBeUndefined();
  });

  it('arquivo corrompido vira .bak e o store recomeca limpo, sem lancar', () => {
    const file = path.join(dir, 'dados.json');
    fs.writeFileSync(file, '{isso nao é json');
    const s = createStore(file);
    expect(s.get('qualquer', 'ok')).toBe('ok');
    expect(fs.existsSync(file + '.bak')).toBe(true);
    s.set('a', 1); // e continua gravável
    expect(createStore(file).get('a')).toBe(1);
  });

  it('cria diretorios que nao existem ao gravar', () => {
    const file = path.join(dir, 'sub', 'fundo', 'dados.json');
    const s = createStore(file);
    s.set('x', true);
    expect(fs.existsSync(file)).toBe(true);
  });

  it('segunda corrupcao nao sobrescreve o .bak anterior', () => {
    const file = path.join(dir, 'dados.json');
    fs.writeFileSync(file, 'lixo-1');
    createStore(file); // vira .bak
    const bakAntes = fs.readFileSync(file + '.bak', 'utf8');
    fs.writeFileSync(file, 'lixo-2');
    createStore(file); // NAO pode sobrescrever o .bak
    expect(fs.readFileSync(file + '.bak', 'utf8')).toBe(bakAntes);
  });

  it('nao deixa arquivo .tmp para tras apos gravar', () => {
    const file = path.join(dir, 'dados.json');
    const s = createStore(file);
    s.set('a', 1);
    expect(fs.existsSync(file + '.tmp')).toBe(false);
    expect(JSON.parse(fs.readFileSync(file, 'utf8')).a).toBe(1);
  });
});
