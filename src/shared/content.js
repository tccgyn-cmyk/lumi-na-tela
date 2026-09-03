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
  pilula: [
    'Tenho uma dica rapidinha do Roberto pra você. Quer ver?',
    'Pílula do Lumi: 30 segundos de conhecimento que cuida. Bora?',
    'Aprendi uma coisa boa com o Roberto. Te conto?',
    'Hora de uma pílula de psicoeducação. É rapidinho, topa?',
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
  { texto: 'Tô de olho em você, {nome}... do jeito mais fofo possível. 👀💛' },
  { texto: '{nome}, já te disseram hoje que seu trabalho importa? Então tá dito.' },
];

// Pílulas de psicoeducação — ACT, DBT, TCC e autocuidado do profissional
// de saúde. TODO TEXTO PASSA PELA APROVAÇÃO DO ROBERTO ANTES DO LANÇAMENTO.
// Assinatura (@robertoribeiropsi) é adicionada pela UI, não pelo texto.
const pilulas = [
  { id: 'descompressao', titulo: 'Fechar o capítulo', texto: 'Entre um paciente e outro, 3 respirações conscientes já dizem pro teu corpo: "esse capítulo fechou". Isso é regulação, não frescura.' },
  { id: 'nome-emocao', titulo: 'Nomear acalma', texto: 'Nomear o que você sente ("isso é frustração") reduz a intensidade da emoção. A ciência chama de rotulagem afetiva. Testa no próximo plantão.' },
  { id: 'defusao', titulo: 'Pensamento não é fato', texto: '"Eu sou incompetente" é só uma frase que a mente produz no cansaço. Nota, agradece a mente e segue. Isso é defusão, direto da ACT.' },
  { id: 'valores', titulo: 'Bússola de valores', texto: 'Dia pesado? Lembra POR QUE você escolheu a saúde. Agir guiado por valores, mesmo cansado, é o que a ACT chama de vida com sentido.' },
  { id: 'autocompaixao', titulo: 'Fala contigo direito', texto: 'Você falaria com um colega do jeito que fala com você mesmo quando erra? Autocompaixão não é moleza — é o que sustenta carreira longa.' },
  { id: 'limites', titulo: 'Dizer não é técnica', texto: 'Dizer "não consigo agora" é habilidade clínica. Quem não aprende a dizer não, um dia o corpo diz por ele.' },
  { id: 'freio-fisiologico', titulo: 'Freio de mão do corpo', texto: 'Expirar mais longo do que inspirar ativa o freio do corpo (o parassimpático). 4 segundos entrando, 6 saindo. Farmacologia gratuita.' },
  { id: 'pequenas-vitorias', titulo: 'O viés do fim do dia', texto: 'Teu cérebro registra melhor o que deu errado — é viés, não verdade. Antes de sair, nomeia 1 coisa que deu certo hoje.' },
  { id: 'corpo-instrumento', titulo: 'Manutenção do instrumento', texto: 'Na saúde, teu corpo é teu instrumento de trabalho. Hidratar, alongar e pausar é manutenção de equipamento, não luxo.' },
  { id: 'presenca', titulo: '30 segundos de presença', texto: 'Escuta de qualidade não exige mais tempo — exige presença. Meio minuto de atenção plena antes de entrar no quarto muda o encontro.' },
  { id: 'ruminacao', titulo: 'Horário de preocupação', texto: 'Levando o plantão pra casa na cabeça? Marca um "horário de preocupação" de 15 min. Fora dele, devolve o pensamento pra lá. TCC pura.' },
  { id: 'validacao', titulo: 'Validar não é concordar', texto: 'Validar é dizer "faz sentido você sentir isso". Funciona com paciente, com colega — e com você mesmo. Presente da DBT.' },
  { id: 'perfeccionismo', titulo: 'Bom o suficiente', texto: '"Bom o suficiente" salva mais vidas que "perfeito e esgotado". Perfeccionismo clínico não é padrão de qualidade, é fator de risco.' },
  { id: 'micro-recuperacao', titulo: 'Férias não bastam', texto: 'Recuperação não acontece só nas férias. Micro-pausas ao longo do dia previnem mais o esgotamento do que uma semana de praia por ano.' },
  { id: 'emocao-onda', titulo: 'Emoção é onda', texto: 'Emoção sobe, atinge o pico e desce sozinha em poucos minutos — se você não alimentar. Surfa a onda em vez de afundar com ela. (DBT)' },
  { id: 'luto-profissional', titulo: 'Dor que é humanidade', texto: 'Perder paciente dói. Isso não é fraqueza técnica, é humanidade. Dor reconhecida vira memória; dor engolida vira sintoma.' },
  { id: 'comparacao', titulo: 'Matemática injusta', texto: 'Comparar teu bastidor com o palco dos outros é conta que nunca fecha. Compara você de hoje com você de ontem — essa é a métrica justa.' },
  { id: 'sono', titulo: 'Sono é conduta', texto: 'Sono é quando teu cérebro consolida o que aprendeu e limpa o estresse do dia. Proteger teu sono é proteger tua conduta clínica.' },
  { id: 'antes-da-noticia', titulo: 'Âncora antes da notícia', texto: 'Antes de dar uma notícia difícil, uma respiração profunda te ancora. Paciente sente quando você está inteiro na sala.' },
  { id: 'pedir-ajuda', titulo: 'Supervisão é potência', texto: 'Supervisão e terapia não são pra quem "não dá conta" — são pra quem quer dar conta por muitos anos. Os melhores têm as duas.' },
  { id: 'cafe-mindful', titulo: 'Mindfulness de cafezinho', texto: 'Transforma o café num exercício: 30 segundos sentindo o cheiro, o calor, o gosto. Atenção plena não precisa de almofada.' },
  { id: 'gentileza-equipe', titulo: 'Clima emocional', texto: 'Gentileza com a equipe regula o clima emocional do setor inteiro. Cuidar do colega também é cuidado com o paciente.' },
  { id: 'protocolo-do-erro', titulo: 'Protocolo emocional do erro', texto: 'Errou? Respira, corrige o que dá, aprende o que fica e larga o resto. Culpa que não vira aprendizado é só peso.' },
  { id: 'corpo-avisa', titulo: 'O corpo avisa antes', texto: 'Mandíbula travada, ombro alto, respiração curta: teu corpo avisa antes da mente. Fazer o escaneamento é ler o próprio prontuário.' },
  { id: 'ritual-de-saida', titulo: 'Ritual de fim de plantão', texto: 'Lavar as mãos devagar, trocar de roupa, uma música no caminho. Teu cérebro precisa de um sinal claro de "acabou por hoje".' },
  { id: 'autocuidado-etica', titulo: 'Autocuidado é ética', texto: 'Autocuidado em quem cuida não é egoísmo — é ética profissional. Ninguém oferece por muito tempo o que não tem.' },
  { id: 'aceitacao', titulo: 'Acompanhar o incontrolável', texto: 'Tem dor que não se resolve, se acompanha. Aceitar o que não controlamos libera energia pro que controlamos. Sabedoria da ACT.' },
  { id: 'tres-respiros', titulo: 'Regra dos 3 respiros', texto: 'Antes de responder mensagem difícil, atender chamada tensa ou entrar em sala pesada: três respiros. Simples assim, funciona assim.' },
  { id: 'gratidao-especifica', titulo: 'Gratidão com detalhe', texto: 'Gratidão genérica pouco muda; específica transforma: "sou grato à colega que segurou minha barra às 15h". O detalhe é o que o cérebro grava.' },
  { id: 'voce-importa', titulo: 'Não esquece', texto: 'Quantas pessoas já respiraram melhor porque você existe na profissão? Pois é. Não esquece disso na quinta-feira difícil.' },
];

const tagsCheckin = ['Plantão puxado', 'Caso difícil', 'Dia bom', 'Cansaço', 'Equipe boa', 'Outro'];

const acolhimento =
  'Percebi uns dias difíceis seguidos por aqui. Você merece o mesmo cuidado que oferece — conversar com alguém de confiança ou um profissional ajuda de verdade. E se apertar, o CVV escuta 24h: ligue 188. 💛';

// Padrão canônico do rodízio de convites (pílula a cada 4 convites).
// main.js e os testes derivam daqui — nunca duplicar esta lista.
const RODIZIO = ['micro-pausa', 'respiracao', 'micro-pausa', 'pilula'];

module.exports = { microPausas, exercicios, convites, falinhas, pilulas, tagsCheckin, acolhimento, RODIZIO };
