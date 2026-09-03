# Lumi na Tela — Design da Fase 5 (lançamento)

**Data:** 2026-09-03
**Status:** Em execução (escopo aprovado na spec-mãe de 2026-08-31; "pode seguir" do Roberto em 2026-09-03)
**Base:** branch `fase-5` sobre `fase-4`.

## Escopo

1. **Identidade do app**: ícone (gerado do sprite oficial), nome "Lumi na Tela", metadados.
2. **Instalador Windows** (NSIS .exe) via electron-builder, buildado e verificado localmente.
3. **Auto-update** via electron-updater + GitHub Releases — código pronto e protegido (só roda empacotado; falha silenciosa se o repositório ainda não existir).
4. **CI GitHub Actions**: push de tag `v*` builda Windows E macOS e anexa os instaladores numa Release (resolve o build de Mac sem ter um Mac).
5. **Conteúdo remoto ligado**: `conteudo/conteudo.json` versionado no repositório; o app baixa do GitHub raw. Roberto edita o arquivo no site do GitHub → todos os apps atualizam em até 24h.
6. **Roteiro de beta** (5-10 pessoas do público) e checklist de lançamento.

## Decisões

- **Assinatura de código: adiada** (decisão da spec-mãe). O instalador sem assinatura mostra o aviso SmartScreen do Windows; a landing page ensinará "Mais informações → Executar assim mesmo". Certificados (~US$100+/ano Windows, US$99/ano Apple) ficam para quando houver tração.
- **Repositório GitHub**: privado não funciona para auto-update/raw sem token — será **público** (código aberto não é problema: o valor está no conteúdo e na marca; e o repositório público habilita GitHub raw + Releases de graça). Precisa de conta GitHub do Roberto e de um passo manual dele (instalar GitHub CLI ou criar o repositório pelo site).
- **macOS**: buildado somente via CI (sem Mac local). Sem assinatura Apple, o usuário de Mac precisa do clique-direito → Abrir; documentado na landing.

## Fora do escopo

Landing page (sub-projeto seguinte), assinatura de código, loja (Microsoft Store).
