# Roteiro de teste manual — Fase 4 (funil)

Modo rápido (PowerShell) — liga o CTA sem esperar 3 dias/48h e acelera os convites:

```powershell
$env:LUMI_DEV_CTA='1'; $env:LUMI_DEV_INTERVAL='1'; npm start
```

> Avisos: (1) sem `LUMI_DEV_CTA`, o CTA de verdade só aparece a partir do 3º dia de uso e no máximo 1 a cada 2 dias — é o comportamento certo de produção; (2) o conteúdo remoto vem DESLIGADO por padrão (a URL oficial será definida na Fase 5) — sem a env `LUMI_CONTEUDO_URL` ele não faz nada, e isso é o esperado; (3) os textos dos CTAs são rascunhos pendentes de aprovação do Roberto.

## CTA do funil
- [ ] Com o modo rápido, em alguns minutos o Lumi puxa um balão de produto com botões "Ver 🔗" e "Agora não"
- [ ] "Ver 🔗" abre o navegador na página certa do produto
- [ ] Na URL aberta aparece `utm_source=lumi` (produtos próprios; Amazon e Instagram não têm)
- [ ] "Agora não" fecha o balão e o Lumi volta ao normal
- [ ] Clicar fora do balão também dispensa
- [ ] Dois CTAs seguidos nunca são do mesmo produto
- [ ] Sem resposta por ~25s, o balão some sozinho
- [ ] "Em atendimento" com CTA na tela dispensa o balão
- [ ] Fechar e reabrir SEM `LUMI_DEV_CTA`: nenhum CTA aparece de imediato (cadência real respeitada)

## Compartilhar pílula
- [ ] Aceitar um convite de pílula (ou esperar o rodízio): cartão mostra o botão "Compartilhar 📸"
- [ ] Clicar: botão vira "Gerando... 🎨" e depois "Copiado e salvo em Imagens/Lumi ✨"
- [ ] O arquivo `pilula-<id>-<data>.png` está na pasta Imagens/Lumi
- [ ] A imagem: story vertical, cartão branco com título verde-água + texto legível + "— @robertoribeiropsi", Lumi no canto inferior direito, "feito com Lumi 💛" no rodapé
- [ ] Ctrl+V num chat/editor de imagem cola o story (área de transferência funcionou)
- [ ] Compartilhar de novo funciona (botão reabilita)

## Conteúdo remoto (teste opcional, de desenvolvedor)
- [ ] Rodar com `$env:LUMI_CONTEUDO_URL='https://localhost:9/nada.json'` (URL quebrada): app funciona 100% normal, sem erros — fail-open confirmado
- [ ] (Avançado) Servir localmente um JSON `{"falinhas":[{"texto":"falinha remota de teste 123"}]}` e apontar a env pra ele: com `LUMI_DEV_FALINHA='15'`, a falinha exibida é a remota

## Regressões (Fase 3 continua ok)
- [ ] Convite de pausa, check-in, falinha e painel seguem funcionando normalmente
- [ ] CTA nunca aparece por cima de convite/check-in (e vice-versa)
- [ ] `npm test` passa (71 testes)
- [ ] "Sair do Lumi" encerra tudo
