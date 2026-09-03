// Fluxo de onboarding no balão do Lumi. A janela chega pinada interativa
// pelo main; ao final enviamos o perfil e o main volta ao normal.
(() => {
  const bubbleText = document.getElementById('bubble-text');
  const onboard = document.getElementById('onboard');
  const input = document.getElementById('onboard-input');
  const buttons = document.getElementById('onboard-buttons');

  const perfil = { nome: '', profissao: '', ritmoMin: 60, expediente: { inicio: '08:00', fim: '18:00' } };

  function pergunta(texto, { campo = false, opcoes = [] } = {}) {
    bubbleText.textContent = texto;
    onboard.classList.remove('hidden');
    buttons.textContent = '';
    input.classList.toggle('hidden', !campo);
    if (campo) {
      input.value = '';
      input.focus();
    }
    for (const op of opcoes) {
      const b = document.createElement('button');
      b.textContent = op.rotulo;
      if (op.primario) b.classList.add('primario');
      b.addEventListener('click', op.acao);
      buttons.appendChild(b);
    }
  }

  function passoNome() {
    pergunta('Oi! Eu sou o Lumi 💛 Vim morar aqui na sua tela pra cuidar de quem cuida. Como posso te chamar?', {
      campo: true,
      opcoes: [{ rotulo: 'Pronto!', primario: true, acao: () => {
        perfil.nome = input.value.trim().slice(0, 30);
        passoProfissao();
      } }],
    });
  }

  function passoProfissao() {
    const ops = ['Medicina', 'Enfermagem', 'Psicologia', 'Estudante', 'Outra área da saúde'];
    pergunta(`${perfil.nome ? perfil.nome + ', que' : 'Que'} área é a sua?`, {
      opcoes: ops.map((p) => ({ rotulo: p, acao: () => { perfil.profissao = p; passoRitmo(); } })),
    });
  }

  function passoRitmo() {
    pergunta('Quantas pausas você quer por dia?', {
      opcoes: [
        { rotulo: 'Relaxado (~5/dia)', acao: () => { perfil.ritmoMin = 90; passoExpediente(); } },
        { rotulo: 'Equilibrado (~8/dia)', primario: true, acao: () => { perfil.ritmoMin = 60; passoExpediente(); } },
        { rotulo: 'Intenso (~10/dia)', acao: () => { perfil.ritmoMin = 50; passoExpediente(); } },
      ],
    });
  }

  function passoExpediente() {
    pergunta('Que horas você costuma trabalhar? (fora desse horário eu fico quietinho)', {
      opcoes: [
        { rotulo: '8h às 18h', primario: true, acao: () => fechar({ inicio: '08:00', fim: '18:00' }) },
        { rotulo: '7h às 19h', acao: () => fechar({ inicio: '07:00', fim: '19:00' }) },
        { rotulo: 'Turnos variados', acao: () => fechar({ turnos: true }) },
      ],
    });
  }

  function fechar(expediente) {
    perfil.expediente = expediente;
    onboard.classList.add('hidden');
    input.classList.add('hidden');
    bubbleText.textContent = `Showww${perfil.nome ? ', ' + perfil.nome : ''}! Qualquer coisa é só clicar em mim. Boa jornada! ✨`;
    setTimeout(() => window.lumiAPI.onboardingDone(perfil), 2600);
  }

  window.addEventListener('lumi-estado', (e) => {
    if (e.detail.state === 'onboarding') passoNome();
  });
})();
