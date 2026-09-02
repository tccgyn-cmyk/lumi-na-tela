# Lumi na Tela — Design da Fase 3 (coração terapêutico)

**Data:** 2026-09-02
**Autor:** Roberto Ribeiro (PsicoLabs) + Claude
**Status:** Aprovado pelo Roberto em 2026-09-02
**Base:** complementa a spec 2026-08-31 (Fases 1-2 já em `main`)

## Escopo da Fase 3

1. Onboarding conversacional
2. Check-in emocional ancorado (chegada + fim da tarde)
3. Pílulas de psicoeducação no rodízio
4. Painel semanal
5. Persistência local de preferências e registros
6. Supressão em tela cheia

Fora do escopo: CTAs de funil e imagem de compartilhamento (Fase 4 — o botão "Compartilhar" da pílula entra na Fase 4; na Fase 3 a pílula é só leitura), instaladores (Fase 5).

## 1. Onboarding (primeira abertura)

Fluxo em balões de fala do próprio Lumi, com botões/campo no balão. Sem cadastro, sem e-mail (capturado na landing page). Total ~60s:

1. Lumi chega no canto, acena: "Oi! Eu sou o Lumi 💛 Vim morar aqui na sua tela pra cuidar de quem cuida."
2. **Nome:** "Como posso te chamar?" (campo de texto curto)
3. **Profissão:** botões — Medicina / Enfermagem / Psicologia / Estudante / Outra área da saúde
4. **Ritmo:** "Quantas pausas você quer por dia?" — Relaxado (~5/dia = 90 min) / Equilibrado (~8/dia = 60 min) / Intenso (~10/dia = 50 min)
5. **Expediente:** "Que horas você costuma trabalhar?" — início/fim (padrão 8h-18h; opção "trabalho em turnos variados" = sem restrição)
6. Fecho: "Showww, {nome}! Qualquer coisa é só clicar em mim. Boa jornada! ✨"

Regras:
- Onboarding roda apenas quando não há perfil salvo; refazível pelo menu ("Recomeçar apresentação").
- Fora do expediente configurado: sem convites, sem falinhas, sem check-in (Lumi fica quieto; aceno continua).
- O nome passa a ser usado nas falinhas e convites quando fizer sentido ("Bora, {nome}?").

## 2. Check-in emocional

- **Âncoras:** (a) chegada — primeiros 30 min de uso do dia; (b) fim da tarde — primeira oportunidade após 16h. Máximo 1 de cada por dia.
- Formato: balão/cartão com 5 carinhas (1 = muito mal … 5 = muito bem) + tags opcionais (Plantão puxado / Caso difícil / Dia bom / Cansaço / Equipe boa / Outro) + botão "Pular".
- Duração-alvo: 15 s. Pular não pune; não insiste no mesmo dia.
- Registro local: data, âncora (chegada/saída), nota, tags.
- Ética: se a média de chegada OU saída ficar ≤ 2 por 3 dias seguidos, o Lumi acolhe com mensagem cuidadosa indicando ajuda profissional e o CVV (188). Nunca diagnóstico.

## 3. Pílulas de psicoeducação

- ~30 pílulas: ACT, DBT, TCC e autocuidado do profissional de saúde, no tom da marca, assinadas "@robertoribeiropsi".
- **Todo texto aprovado pelo Roberto antes de entrar.**
- Entram no rodízio de convites com peso: 1 pílula a cada 3-4 convites (~1-2/dia). Rodízio vira: micro-pausa → respiração → micro-pausa → pílula → … (determinístico, sem repetir pílula recente).
- Cartão de pílula: título, texto (2-4 frases), assinatura. Fase 3 = leitura + "Concluído"; botão Compartilhar chega na Fase 4.

## 4. Painel semanal

- Abrir: clique esquerdo no Lumi (novo) ou item "Meu painel" no menu.
- Conteúdo: sequência atual ("N dias seguidos cuidando de você"), pausas aceitas na semana (barras por dia), humor chegada×saída por dia (duas linhas de carinhas), destaque simples gerado por regra ("Quinta foi seu dia mais pesado").
- Janela ~420x520, mesma identidade visual do cartão de atividade.

## 5. Persistência local

- Arquivo JSON em `app.getPath('userData')` (ex.: `lumi-dados.json`), gravado a cada mudança relevante e carregado no arranque.
- Guarda: perfil (nome, profissão, ritmo, expediente), estado do rodízio, histórico de check-ins, contadores de pausas por dia, sequência, última pílula/falinha exibida.
- Nada sai da máquina. Sem telemetria.
- Robustez: arquivo corrompido → renomeia para `.bak` e recomeça limpo (sem crash).

## 6. Supressão em tela cheia

- A cada tick, o app detecta se a janela em foco está em tela cheia (apresentação, vídeo, teleconsulta maximizada).
- Em tela cheia: Lumi fica invisível, convites/falinhas/check-ins são segurados (contam como adiados, não perdidos); ao sair, volta com folga de ~1 min.

## Critérios de aceite (resumo)

- Primeira abertura roda onboarding completo; segunda abertura vai direto pro canto com o nome lembrado.
- Ritmo escolhido sobrevive a fechar/abrir o app.
- Check-in aparece na chegada e após as 16h, no máximo 1 de cada, com registro persistido.
- Pílula aparece a cada 3-4 convites e nunca em sequência imediata.
- Painel mostra dados reais da semana corrente.
- Em tela cheia nada aparece; ao sair, o fluxo retoma.
- `npm test` cobre: regras de âncora do check-in, peso do rodízio com pílula, persistência (ida e volta), expediente e sequência.
