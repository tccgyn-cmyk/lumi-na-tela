# Teste rápido do Roberto — Fases 3 e 4 em ~15 minutos

Os itens essenciais que a automação NÃO cobre (olhos humanos). Roteiros completos: teste-manual-fase-3.md e teste-manual-fase-4.md.

**Preparação** (PowerShell na pasta do projeto — simula primeira vez + tudo acelerado):

```powershell
Remove-Item "$env:APPDATA\lumi-na-tela\lumi-dados.json" -ErrorAction SilentlyContinue; $env:LUMI_DEV_INTERVAL='1'; $env:LUMI_DEV_CTA='1'; $env:LUMI_DEV_FALINHA='20'; npm start
```

## Os 12 itens que valem ouro (na ordem em que vão acontecer)

1. [ ] **Onboarding**: Lumi pergunta nome → profissão → ritmo → expediente; fecho usa seu nome
2. [ ] **Falinha** (~20s depois): balão sem botões aparece e some sozinho
3. [ ] **Check-in de chegada** (2-3 min depois): carinhas → tags → "Pronto 💛" fecha; balão inteiro visível
4. [ ] **Convite de pausa** (~1 min de uso ativo): Lumi atravessa, balão com 3 botões, "Bora!" abre o cartão
5. [ ] **Pílula** (4º convite): cartão com assinatura @robertoribeiropsi
6. [ ] **Compartilhar 📸** na pílula: vira "Copiado e salvo" → arquivo em Imagens/Lumi → Ctrl+V cola em algum lugar
7. [ ] **CTA** (alguns minutos): balão de produto → "Ver 🔗" abre o navegador NO LINK CERTO do produto
8. [ ] **Painel**: clique esquerdo no Lumi → sequência, pausas e humor aparecem com dados reais
9. [ ] **Tela cheia**: YouTube em tela cheia (F) 1 min → Lumi some; sair → volta
10. [ ] **Persistência**: fechar o app, reabrir → sem onboarding, ritmo lembrado, painel com os dados
11. [ ] **Aura**: em fundo escuro, o brilho do Lumi aparece inteiro (sem corte à direita)
12. [ ] **Sair do Lumi** encerra tudo (sem electron.exe no Gerenciador de Tarefas)

**Se os 12 passarem**: Fases 3 e 4 validadas — marca no beta-e-lancamento.md e libera os betas. Qualquer falha: me conta o número do item + o que aconteceu.
