# Lumi na Tela — Design do MVP Desktop

**Data:** 2026-08-31
**Autor:** Roberto Ribeiro (PsicoLabs) + Claude
**Status:** Aprovado para planejamento de implementação

## 1. Visão geral

Lumi é um app gratuito para desktop (Windows e Mac) com um personagem — um axolote fofinho — que mora num canto da tela enquanto profissionais de saúde trabalham no computador. Em intervalos inteligentes, o Lumi interrompe gentilmente para atividades de saúde mental: micro-pausas físicas, respiração guiada, check-in emocional e pílulas de psicoeducação.

**Papel no negócio:** produto de entrada gratuito do funil PsicoLabs. Captura e-mail no download (landing page, sub-projeto separado) e conduz naturalmente ao Método Arquitetura do Encontro Hospitalar (R$67), ConectaDig e livro.

**Público:** estudantes e profissionais de saúde que passam o dia no computador (prontuários, relatórios, teleconsulta).

**Inspiração:** Furever Dock (pet interativo no desktop), adaptado para autocuidado de profissionais de saúde.

**Decisões-chave já tomadas:**
- Plataforma: desktop primeiro (Windows + Mac). Mobile fica para sub-projeto futuro.
- Personagem: axolote (símbolo de regeneração), carismático, estilo pet virtual.
- Comportamento: **híbrido** — mora ancorado num canto (discreto); na hora da intervenção atravessa a tela e chama o usuário.
- Tecnologia: **Electron** (janela transparente madura, um código para Win+Mac, desenvolvimento rápido; aceito o custo de ~90MB de download).
- Funil: e-mail para baixar (landing page) + CTAs dentro do app + conteúdo assinado compartilhável.

## 2. Experiência do usuário

### 2.1 Primeiro uso (onboarding)
- Lumi se apresenta com 3-4 balões de fala curtos, no tom de voz da marca (descontraído, próximo, "Showww").
- Pergunta: nome, profissão (médico, enfermeiro, psicólogo, estudante, outro), horário típico de expediente.
- Sem cadastro ou login — o e-mail já foi capturado no download.

### 2.2 Modo normal (99% do tempo)
- Lumi fica no canto escolhido pelo usuário (padrão: inferior direito): respira, pisca, cochila, reage ao mouse por cima.
- Zero interrupção fora dos momentos de intervenção.

### 2.3 Intervenções
- Gatilho padrão: a cada **50 minutos de uso ativo contínuo** do computador (configurável: 30/50/60/90 min). Tempo ocioso curto (5-15 min, ex.: reunião rápida) pausa o contador; ocioso longo (15+ min, ex.: almoço) **zera** o contador — a pessoa acabou de descansar, não faz sentido pedir pausa logo ao voltar.
- Ao expirar o modo "Em atendimento", o Lumi espera uma folga de ~5 minutos antes de intervir (nunca "pula" na pessoa no segundo em que o silêncio acaba).
- Momento da intervenção: o Lumi acorda, atravessa a tela nadando, e chama o usuário com um balão. O usuário pode aceitar, adiar ("daqui a 10 min") ou dispensar.
- Rodízio equilibrado entre 4 tipos:
  1. **Micro-pausa física** — alongar, beber água, olhar para longe (regra 20-20-20). ~10 variações.
  2. **Respiração/regulação** — cartão com exercício guiado de 1-3 min; o Lumi anima junto (infla/desinfla). 6 exercícios: respiração diafragmática, 4-7-8, grounding 5-4-3-2-1, defusão da ACT, escaneamento corporal rápido, pausa 20-20-20.
  3. **Check-in emocional** — "como você tá agora?" com escala de carinhas (5 níveis) + tag opcional (plantão puxado, caso difícil, dia bom...). Máximo 2x/dia. Alimenta o painel semanal.
  4. **Pílula de psicoeducação** — dica curta (ACT, DBT, TCC, autocuidado do profissional de saúde), assinada "@robertoribeiropsi", com botão "Compartilhar" que gera imagem bonita para stories.

### 2.4 Controle do usuário
- Botão "Em atendimento": silencia por 30/60/120 min.
- Configurações: canto da tela, frequência, horário de expediente, ativar/desativar cada tipo de intervenção.
- Supressão automática quando um app está em tela cheia (apresentação, vídeo, teleconsulta maximizada).

### 2.5 Vínculo e recompensa
- Sequências ("3 dias seguidos cuidando de você, showww!") com celebração do Lumi.
- Painel semanal: pausas feitas, humor registrado, sequência atual.

### 2.6 Funil (dentro do app)
- CTAs contextuais: no máximo **1 a cada 2-3 dias**, em tom natural do Lumi, apontando para Método (R$67), ConectaDig, livro (R$37) ou Instagram @robertoribeiropsi.
- Pílulas compartilháveis com assinatura — incentivo orgânico ao Instagram.

### 2.7 Ética e segurança
- Aviso visível no app: "O Lumi é autocuidado, não substitui terapia."
- Se o check-in registrar humor muito baixo por 3+ dias seguidos, o Lumi acolhe e indica ajuda profissional, incluindo CVV (188).

## 3. Arquitetura técnica

**Stack:** Electron (processo principal em Node.js + janelas em HTML/CSS/JS).

### 3.1 Componentes

| Componente | Responsabilidade |
|---|---|
| **Janela do Lumi** | Janela transparente, sem bordas, always-on-top, click-through fora do corpo do personagem. Renderiza o Lumi e balões de fala. |
| **Motor de animação** | Sprites/vetor com estados: idle (respirando), cochilando, andando, acenando, respirando-junto, comemorando, reação ao hover. |
| **Agendador (cérebro)** | Mede uso ativo (detecção de ociosidade do sistema), respeita expediente configurado, detecta tela cheia e suprime, sorteia o tipo de intervenção no rodízio, aplica regras (check-in máx. 2x/dia, CTA máx. 1 a cada 2-3 dias). |
| **Janela de atividade** | Cartão flutuante com o exercício/check-in/pílula. Gera imagem de compartilhamento localmente. |
| **Painel + configurações** | Resumo semanal e ajustes. |
| **Módulo de conteúdo** | Carrega conteúdo de arquivo JSON remoto (hospedado em psicolabs.com.br) com fallback para cópia embutida. Permite atualizar pílulas/CTAs sem lançar versão nova. |
| **Armazenamento local** | Preferências, check-ins, histórico de pausas, sequências — tudo local (electron-store ou equivalente). |

### 3.2 Privacidade
- Nenhum dado do usuário sai do computador. Sem analytics de conteúdo emocional. Argumento de marketing: "o Lumi não te vigia".
- Única chamada de rede: baixar o arquivo de conteúdo e checar atualização do app.

### 3.3 Distribuição
- Instaladores: Windows (.exe/NSIS) e macOS (.dmg), com atualização automática (electron-updater + GitHub Releases ou equivalente).
- Assinatura de código: decisão adiada para a fase de lançamento (Apple US$99/ano; certificado Windows ~US$100+/ano). Lançamento sem assinatura é possível com instruções na landing page.

## 4. Conteúdo (dia 1)

- ~30 pílulas de psicoeducação — rascunhos gerados no tom de voz da marca; **revisão e aprovação obrigatória do Roberto antes de entrar no app**.
- 6 exercícios de regulação (lista na seção 2.3).
- ~10 variações de micro-pausa física.
- ~8 CTAs de funil.
- Textos do Lumi (balões, celebrações, onboarding) no tom da marca: descontraído, motivacional, sem formalidade, com "Showww".

## 5. Erros e casos-limite

- **Sem internet:** app 100% funcional com conteúdo embutido.
- **Múltiplos monitores:** Lumi fica no monitor principal (MVP).
- **Desempenho:** meta < 5% CPU em idle; animações otimizadas.
- **Crash:** app reabre no estado normal sem perder dados (persistência a cada evento relevante).
- **Tela cheia:** intervenções seguradas até sair da tela cheia; contam como adiadas, não perdidas.

## 6. Testes

- Testes automatizados no agendador e regras (rodízio, limites diários, silêncio, expediente, ociosidade).
- Roteiro de teste manual do visual/animações antes de cada versão.
- Beta: Roberto como testador nº 1 + 5-10 pessoas do público-alvo antes do lançamento público.

## 7. Fases de construção

1. **Fase 1 — Lumi vivo:** axolote animado no canto, estados básicos, reação ao mouse.
2. **Fase 2 — Cérebro:** agendador, travessia da tela, micro-pausas e respiração guiada.
3. **Fase 3 — Conteúdo completo:** check-in de humor, pílulas, painel semanal, configurações, onboarding.
4. **Fase 4 — Funil:** CTAs, imagem de compartilhamento, conteúdo remoto atualizável.
5. **Fase 5 — Lançamento:** instaladores, auto-update, beta, decisão de assinatura de código.

## 8. Fora do escopo deste projeto (sub-projetos futuros)

- Landing page com captura de e-mail (usar skill de página de vendas).
- Versão mobile do Lumi (companheiro por notificações/widget).
- Relatório semanal por e-mail.
- Sincronização entre dispositivos / conta de usuário.
