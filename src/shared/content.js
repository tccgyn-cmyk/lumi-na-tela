const microPausas = [
  { titulo: 'Regra 20-20-20', texto: 'A cada 20 minutos, olhe para algo a 20 passos de distância por 20 segundos. Seus olhos agradecem, showww!' },
  { titulo: 'Hora da água', texto: 'Quando foi seu último gole de água? Levanta, enche a garrafa e hidrata esse cérebro que cuida de tanta gente.' },
  { titulo: 'Espreguiça braba', texto: 'Braços pro alto, alonga o corpo inteiro como se tivesse acabado de acordar. Pode fazer barulhinho, ninguém tá julgando.' },
  { titulo: 'Ombros soltos', texto: 'Sobe os ombros até as orelhas, segura 3 segundos... e soltaaa. Repete 3 vezes. A tensão do plantão não merece morar aí.' },
  { titulo: 'Pescoço livre', texto: 'Devagarinho: orelha no ombro direito, depois no esquerdo. 15 segundos de cada lado. Sem pressa, sem dor.' },
  { titulo: 'Caminhadinha', texto: 'Levanta e dá uma volta de 2 minutos. Vale ir até a janela, o corredor ou a cozinha. O prontuário te espera.' },
  { titulo: 'Mãos que trabalham', texto: 'Abre e fecha as mãos 10 vezes, depois gira os punhos. Quem digita e examina o dia todo merece esse carinho.' },
  { titulo: 'Postura de gente', texto: 'Pés no chão, coluna ereta, ombros relaxados. Ajusta a cadeira se precisar. Seu corpo é seu instrumento de trabalho.' },
  { titulo: 'Olhar pro longe', texto: 'Vai até a janela e observa o ponto mais distante que conseguir por 30 segundos. Tela de perto o dia todo cansa demais.' },
  { titulo: 'Respiro de pé', texto: 'Levanta, planta os dois pés no chão e respira fundo 3 vezes de olhos abertos. Pronto: recalibrou.' },
];

const exercicios = [
  {
    id: 'diafragmatica',
    titulo: 'Respiração diafragmática',
    descricao: 'Mão na barriga. Vamos respirar fundo juntos — o Lumi infla com você.',
    respiracao: { inspirar: 4, segurar: 0, expirar: 6, pausa: 0, ciclos: 6 },
  },
  {
    id: '478',
    titulo: 'Respiração 4-7-8',
    descricao: 'Inspira em 4, segura em 7, solta em 8. Ótima pra desacelerar depois de um caso difícil.',
    respiracao: { inspirar: 4, segurar: 7, expirar: 8, pausa: 0, ciclos: 4 },
  },
  {
    id: 'grounding',
    titulo: 'Grounding 5-4-3-2-1',
    descricao: 'Um exercício pra voltar pro aqui e agora quando a cabeça tá a mil.',
    passos: [
      'Note 5 coisas que você consegue VER ao seu redor.',
      'Note 4 coisas que você consegue TOCAR agora.',
      'Note 3 sons que você consegue OUVIR.',
      'Note 2 cheiros que você consegue SENTIR.',
      'Note 1 sabor na sua boca.',
      'Respira fundo. Você está aqui, agora. 💛',
    ],
  },
  {
    id: 'defusao',
    titulo: 'Nomeie o pensamento (ACT)',
    descricao: 'Um truque da ACT pra dar um passo atrás dos pensamentos difíceis.',
    passos: [
      'Perceba o pensamento que está te incomodando agora.',
      'Agora reformule: "Estou tendo o pensamento de que..." e complete.',
      'Mais um passo: "Eu percebo que estou tendo o pensamento de que..."',
      'Sentiu a distância? Você não É o pensamento — você o observa.',
    ],
  },
  {
    id: 'escaneamento',
    titulo: 'Escaneamento corporal rápido',
    descricao: 'Um minuto pra checar como seu corpo está carregando o dia.',
    passos: [
      'Feche os olhos ou suavize o olhar.',
      'Leve a atenção pro topo da cabeça... testa... mandíbula. Solta a mandíbula.',
      'Desça pelos ombros... braços... mãos. Onde tem tensão, respira pra lá.',
      'Peito... barriga... pernas... pés no chão.',
      'Abra os olhos. Como está seu corpo agora?',
    ],
  },
  {
    id: 'pausa-visual',
    titulo: 'Pausa 20-20-20 guiada',
    descricao: 'Descanso ativo pros seus olhos, guiado pelo Lumi.',
    passos: [
      'Olhe para o ponto mais distante que conseguir (janela ajuda!).',
      'Mantenha o olhar lá por 20 segundos, piscando naturalmente.',
      'Agora feche os olhos por 5 segundos.',
      'Prontinho! Seus olhos renovados pra próxima rodada.',
    ],
  },
];

const convites = {
  'micro-pausa': [
    'Ei! Você tá firme aí há um tempão. Bora dar uma pausinha?',
    'Psiu! Seu corpo tá pedindo um alongamento. Topa?',
    'Quem cuida de todo mundo também precisa de pausa. Vem comigo?',
    'Hora de levantar dessa cadeira, vai por mim. Bora?',
  ],
  respiracao: [
    'Que tal respirar fundo comigo? Só uns minutinhos.',
    'Bora acalmar a mente um pouquinho? Eu respiro junto!',
    'Momento Lumi: uma respirada pra recarregar. Topa?',
    'Pausa pra respirar? Eu te guio, é rapidinho.',
  ],
};

module.exports = { microPausas, exercicios, convites };
