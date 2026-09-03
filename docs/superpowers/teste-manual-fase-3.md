# Roteiro de teste manual — Fase 3

Preparação: feche o Lumi. Para simular a primeira abertura, apague o arquivo de dados (PowerShell):

```powershell
Remove-Item "$env:APPDATA\lumi-na-tela\lumi-dados.json" -ErrorAction SilentlyContinue
```

Modo rápido: `$env:LUMI_DEV_INTERVAL='1'; npm start`

> Avisos: (1) com o app aberto, existe UM processo `powershell.exe` filho do Lumi — é a sonda de tela cheia, esperado; (2) em computadores corporativos/hospitalares com antivírus gerenciado, a sonda pode ser bloqueada — nesse caso a supressão de tela cheia simplesmente não atua (o resto do app funciona normal); (3) no Mac ainda não há supressão de tela cheia; (4) todos os textos (pílulas, falinhas, convites, acolhimento) são rascunhos pendentes de aprovação do Roberto.

## Onboarding
- [ ] Primeira abertura: Lumi pergunta nome (campo), profissão, ritmo e expediente em balões
- [ ] Fecho usa o nome ("Showww, {nome}!")
- [ ] Fechar e reabrir o app: onboarding NÃO repete e o Lumi vai direto pro canto
- [ ] Menu → "Recomeçar apresentação" roda o fluxo de novo — inclusive se clicado com um convite ou check-in na tela (eles somem e o onboarding assume)

## Persistência
- [ ] Escolher ritmo "Relaxado" no onboarding, fechar, reabrir: menu "Ritmo das pausas" mostra 90 marcado
- [ ] Mudar o ritmo pelo menu, fechar, reabrir: escolha mantida
- [ ] Corromper o `lumi-dados.json` (escrever "xxx" nele) e abrir: app funciona, arquivo `.bak` criado

## Check-in
- [ ] Entre 2 e 30 min após começar a usar no dia: check-in de chegada aparece (5 carinhas)
- [ ] Escolher carinha → tags aparecem → "Pronto 💛" fecha
- [ ] "Pular" fecha sem insistir no mesmo dia
- [ ] Depois das 16h E com 4+ horas de jornada: check-in de fim de dia aparece uma única vez
- [ ] O balão do check-in cabe inteiro na janela (pergunta visível no topo)

## Pílulas
- [ ] No rodízio, a cada 4 convites um é pílula (cartão com texto + "— @robertoribeiropsi")
- [ ] Duas pílulas seguidas nunca são a mesma

## Painel
- [ ] Clique esquerdo no Lumi abre o painel
- [ ] Menu → "Meu painel" também abre (e não abre duplicado)
- [ ] Sequência, barras de pausas e carinhas refletem o uso real
- [ ] Esc e botão "Fechar" fecham
- [ ] Durante um convite ou check-in, o clique no Lumi NÃO abre o painel

## Expediente
- [ ] Configurar expediente que exclui o horário atual (Recomeçar apresentação → turno oposto): sem convites nem falinhas; aceno continua
- [ ] Voltar ao expediente correto: convites voltam

## Tela cheia
- [ ] Vídeo do YouTube em TELA CHEIA (tecla F) por 1 minuto: Lumi some em até ~10s
- [ ] Sair da tela cheia: Lumi volta e fica ~1 min quieto antes de puxar papo
- [ ] Janela apenas MAXIMIZADA (navegador normal): Lumi NÃO some — comportamento atual; ver decisão pendente abaixo
- [ ] Apresentação do PowerPoint (F5): Lumi some durante o slideshow

> Decisão pendente do Roberto: teleconsulta rodando em janela MAXIMIZADA (não tela cheia) hoje NÃO é suprimida — o Lumi pode aparecer durante a consulta. Suprimir toda janela maximizada silenciaria o Lumi para quem trabalha sempre maximizado. Alternativas: manter como está, suprimir maximizadas também, ou detectar apps específicos (Zoom/Meet/Teams) no futuro.

## Robustez
- [ ] `npm test` passa (54 testes)
- [ ] App usa < 5% CPU parado no canto (Gerenciador de Tarefas, alguns minutos observando)
- [ ] "Sair do Lumi" encerra tudo — sem `electron.exe` nem o `powershell.exe` da sonda sobrando
