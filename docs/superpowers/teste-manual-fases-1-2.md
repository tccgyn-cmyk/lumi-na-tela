# Roteiro de teste manual — Fases 1-2

Rodar antes de considerar as Fases 1-2 concluídas. Para acelerar os testes, use o intervalo de desenvolvimento de 1 minuto (PowerShell):

```powershell
$env:LUMI_DEV_INTERVAL='1'; npm start
```

> Avisos: (1) o app não aparece na barra de tarefas — para sair, use o clique direito no Lumi → "Sair do Lumi" (Gerenciador de Tarefas é o plano B); (2) todos os textos em português (micro-pausas, exercícios, convites, falinhas, pílulas) são rascunhos pendentes de aprovação do Roberto.

## Lumi vivo
- [ ] Lumi (criaturinha de luz com jaleco) aparece no canto inferior direito, sobre todas as janelas
- [ ] Respira suavemente e pisca de tempos em tempos
- [ ] Passar o mouse por cima faz a chama tremeluzir e os brilhos piscarem
- [ ] Ficar 1+ min sem mexer no mouse/teclado: o Lumi começa a acenar com os bracinhos; ao voltar a mexer, ele para
- [ ] Falinha: com `$env:LUMI_DEV_FALINHA='15'`, um balão de conversa (sem botões) aparece após ~15s e some sozinho em ~8s
- [ ] Menu "Ritmo das pausas" muda o intervalo dos convites (testar 30 vs 90)
- [ ] Cliques FORA do Lumi passam para a janela de trás — testar clicando num texto atrás dele, inclusive nos cantos vazios do retângulo dele (a aura não pode "comer" cliques)
- [ ] Clique direito no Lumi abre o menu (Pausar agora / Em atendimento / Voltar ao normal / Sair)

## Cérebro
- [ ] Após 1 min de uso ativo, o Lumi atravessa a tela nadando e convida com o balão
- [ ] Durante a travessia (antes do balão aparecer), cliques ainda passam para a janela de trás
- [ ] Ficar 5+ min sem tocar no computador NÃO conta como tempo ativo — use `$env:LUMI_DEV_INTERVAL='8'` neste item (com intervalo de 1 min o convite dispara antes de a ociosidade contar)
- [ ] "Em atendimento 30 min" segura os convites
- [ ] "Em atendimento" escolhido COM um convite na tela também dispensa o balão
- [ ] "Voltar ao normal" cancela o silêncio, mas o próximo convite ainda espera alguns minutos (não "pula" na hora)
- [ ] "Daqui a 10 min" adia de verdade (com intervalo de 1 min: o convite volta ~10 min depois, não 1 min)
- [ ] Sem resposta por 2 min, o Lumi dispensa sozinho e volta pro canto
- [ ] Clicar em qualquer área vazia da janela do convite (fora do Lumi e do balão) dispensa o convite
- [ ] "Agora não" dispensa e o Lumi volta pro canto

## Atividades
- [ ] Micro-pausa: cartão claro (creme/verde-água) centralizado com título + texto + "Concluído ✨" fecha
- [ ] Esc também fecha o cartão
- [ ] Respiração diafragmática: círculo dourado cresce/encolhe no ritmo 4s/6s por 6 ciclos, termina em "Prontinho! Showww 💛"
- [ ] Exercício com passos (grounding/defusão): lista numerada legível
- [ ] Rodízio alterna micro-pausa ↔ exercício de regulação
- [ ] Aceitar 3+ convites seguidos: quando o MESMO tipo repete (ex.: duas micro-pausas), o conteúdo é diferente
- [ ] Com um cartão aberto, NENHUM convite novo aparece (esperar 1+ min com o cartão aberto)

## Robustez
- [ ] `npm test` passa (18 testes)
- [ ] App usa < 5% CPU parado no canto (conferir no Gerenciador de Tarefas)
- [ ] Mudar a resolução da tela / conectar segundo monitor: Lumi volta pro canto certo
- [ ] Fechar pelo menu "Sair do Lumi" encerra o processo completamente (sem electron.exe sobrando)
