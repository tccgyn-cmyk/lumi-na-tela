const microPausas = [
  { id: '20-20-20', titulo: 'Regra 20-20-20', texto: 'A cada 20 minutos, olhe para algo a 20 passos de distância por 20 segundos. Seus olhos agradecem, showww!' },
  { id: 'agua', titulo: 'Hora da água', texto: 'Quando foi seu último gole de água? Levanta, enche a garrafa e hidrata esse cérebro que cuida de tanta gente.' },
  { id: 'espreguica', titulo: 'Espreguiça braba', texto: 'Braços pro alto, alonga o corpo inteiro como se tivesse acabado de acordar. Pode fazer barulhinho, ninguém tá julgando.' },
  { id: 'ombros', titulo: 'Ombros soltos', texto: 'Sobe os ombros até as orelhas, segura 3 segundos... e soltaaa. Repete 3 vezes. A tensão do plantão não merece morar aí.' },
  { id: 'pescoco', titulo: 'Pescoço livre', texto: 'Devagarinho: orelha no ombro direito, depois no esquerdo. 15 segundos de cada lado. Sem pressa, sem dor.' },
  { id: 'caminhada', titulo: 'Caminhadinha', texto: 'Levanta e dá uma volta de 2 minutos. Vale ir até a janela, o corredor ou a cozinha. O prontuário te espera.' },
  { id: 'maos', titulo: 'Mãos que trabalham', texto: 'Abre e fecha as mãos 10 vezes, depois gira os punhos. Quem digita e examina o dia todo merece esse carinho.' },
  { id: 'postura', titulo: 'Postura de gente', texto: 'Pés no chão, coluna ereta, ombros relaxados. Ajusta a cadeira se precisar. Seu corpo é seu instrumento de trabalho.' },
  { id: 'olhar-longe', titulo: 'Olhar pro longe', texto: 'Vai até a janela e observa o ponto mais distante que conseguir por 30 segundos. Tela de perto o dia todo cansa demais.' },
  { id: 'respiro-pe', titulo: 'Respiro de pé', texto: 'Levanta, planta os dois pés no chão e respira fundo 3 vezes de olhos abertos. Pronto: recalibrou.' },
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
    'Que tal uma pausa pra acalmar a mente? Eu te acompanho.',
    'Bora fazer um exercício rapidinho de regulação? Eu vou junto!',
    'Momento Lumi: vamos baixar a rotação um pouquinho? Topa?',
    'Uns minutinhos pra cuidar da mente? Eu te guio, é rapidinho.',
  ],
};

// Falinhas: conversa espontânea do Lumi (balão sem botões, some sozinho).
// periodo: 'manha' | 'tarde' | 'noite' — sem periodo = vale a qualquer hora.
const falinhas = [
  { periodo: 'manha', texto: 'Bom dia! Bora cuidar de gente hoje? Eu cuido de você. 💛' },
  { periodo: 'manha', texto: 'Chegou! Já tomou um café e respirou fundo? ☀️' },
  { periodo: 'manha', texto: 'Dia novo, plantão novo. Tô contigo! ✨' },
  { periodo: 'manha', texto: 'Bom dia! Lembra: você não precisa dar conta de tudo antes do almoço. 😄' },
  { periodo: 'tarde', texto: 'Boa tarde! Metade do dia já foi — você tá indo showww. 👏' },
  { periodo: 'tarde', texto: 'Aquela hora da tarde, né? Segura firme que eu tô aqui. ☕' },
  { periodo: 'tarde', texto: 'Boa tarde! Já comeu direito hoje ou tá adiando? 👀' },
  { periodo: 'tarde', texto: 'Reta final do dia chegando. Um passo de cada vez. 💪' },
  { periodo: 'noite', texto: 'Boa noite! Quem trabalha a essa hora merece o dobro de carinho. 🌙' },
  { periodo: 'noite', texto: 'Plantão noturno? Respira comigo que a madrugada passa. 🌟' },
  { periodo: 'noite', texto: 'Fim de expediente chegando? Já pensa numa coisa boa pra fazer por você. 🌙' },
  { texto: 'Você já bebeu água ou tá vivendo de café? ☕😄' },
  { texto: 'Ombros relaxados? Mandíbula solta? Só conferindo. 👀' },
  { texto: 'Quem cuida de você enquanto você cuida de todo mundo? Eu! 💛' },
  { texto: 'Showww, mais um dia ajudando gente. Isso não é pouco.' },
  { texto: 'Pisca duas vezes se você esqueceu de almoçar. 😅' },
  { texto: 'Sabia que pausas curtas melhoram até a memória? Ciência, viu?' },
  { texto: 'Seu paciente sente quando você tá bem. Cuidar de você também é técnica.' },
  { texto: 'Alonga esse pescoço rapidinho. Confia. 🙆' },
  { texto: 'Tá tudo bem não estar 100% o tempo todo. Ninguém tá.' },
  { texto: 'Respirar fundo 3 vezes já muda o corpo. Quando quiser, me chama.' },
  { texto: 'Postura de super-herói: pés no chão, coluna reta. Testa aí. 🦸' },
  { texto: 'Você é o profissional que muita gente esperou a vida toda encontrar.' },
  { texto: 'Momento gratidão: pensa numa coisa boa de hoje. Achou? Showww.' },
  { texto: 'Olha pra longe por 20 segundos. Seus olhos agradecem. 🪟' },
  { texto: 'Se hoje tá pesado, lembra: você já atravessou 100% dos seus dias difíceis.' },
  { texto: 'Hidratação não é frescura, é protocolo. 💧' },
  { texto: 'Eu vi você aí, focado. Orgulho define. 💪' },
  { texto: 'Um plantão de cada vez. Uma pausa de cada vez.' },
  { texto: 'Café é combustível, mas pausa é manutenção. ⛽' },
];

module.exports = { microPausas, exercicios, convites, falinhas };
