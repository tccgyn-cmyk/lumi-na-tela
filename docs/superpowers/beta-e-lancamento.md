# Beta e lançamento — checklist

## Antes de qualquer coisa (aprovações do Roberto)
- [ ] Textos aprovados em `src/shared/content.js`: micro-pausas, exercícios, convites, falinhas, pílulas, CTAs, acolhimento
- [ ] Visual do story de compartilhamento aprovado
- [ ] Decisão da teleconsulta maximizada (manter só tela cheia / suprimir maximizadas)
- [ ] Roteiros de teste manual das Fases 3 e 4 executados
- [ ] Merge de `fase-3` + `fase-4` + `fase-5` em `main`

## Configurar o GitHub (passo manual do Roberto, ~10 min, uma vez só)
1. Criar conta em github.com (se ainda não tiver)
2. Criar repositório **público** chamado `lumi-na-tela`
3. Me avisar o nome de usuário — eu configuro o resto (remote, campo `repository` no package.json, URL do conteúdo remoto no `src/main/remoto.js`, push e tag)

> Por que público: GitHub Releases (instaladores + auto-update) e GitHub raw (conteúdo remoto) funcionam de graça e sem token em repositório público. O valor do produto está no conteúdo, na marca e na distribuição — não no código.

## Publicar a primeira versão
- [ ] `git tag v0.1.0 && git push origin main --tags`
- [ ] Aguardar o CI buildar Windows + macOS e criar a Release
- [ ] Baixar o instalador da Release num computador limpo e testar (aviso SmartScreen: "Mais informações" → "Executar assim mesmo")
- [ ] Testar o auto-update: instalar v0.1.0, publicar v0.1.1, abrir o app e conferir a atualização

## Atualizar conteúdo sem lançar versão
- Editar `conteudo/conteudo.json` direto no site do GitHub → commit → todos os apps pegam em até 24h
- Regras: pílulas com `id` único, textos dentro dos limites (pílula ≤320, falinha ≤200, CTA ≤200), produto do CTA existente. Conteúdo inválido é ignorado pelo app (ninguém quebra).

## Beta (5-10 pessoas do público)
- [ ] Convidar pelo Instagram/WhatsApp: estudantes + profissionais, incluindo 1-2 de plantão noturno
- [ ] Mandar: link do instalador + 3 pedidos ("usa por 5 dias úteis", "anota o que te incomodou", "me conta se o Lumi ajudou em algum momento real")
- [ ] Colher feedback num grupo de WhatsApp
- [ ] Perguntas-chave: o ritmo das pausas incomodou? Alguma interrupção em hora errada? O check-in virou hábito? Alguém compartilhou pílula?

## Critérios para lançamento público
- [ ] Nenhum beta relatou o Lumi atrapalhando atendimento/apresentação
- [ ] Pelo menos metade dos betas chegou ao 5º dia com o app aberto
- [ ] Landing page no ar com captura de e-mail (sub-projeto)
- [ ] Instagram: post/reels de lançamento com o story de pílula como demonstração
