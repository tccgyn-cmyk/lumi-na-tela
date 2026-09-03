# Lumi na Tela — Design da Fase 4 (funil)

**Data:** 2026-09-03
**Autor:** Roberto Ribeiro (PsicoLabs) + Claude
**Status:** Aprovado pelo Roberto em 2026-09-03
**Base:** complementa as specs de 2026-08-31 (Fases 1-2) e 2026-09-02 (Fase 3). Branch `fase-4` sobre `fase-3` (merge de ambas quando o Roberto validar o teste manual).

## Escopo

1. CTAs contextuais do funil
2. Imagem compartilhável da pílula (story 1080×1920)
3. Conteúdo remoto atualizável (mecanismo pronto, hospedagem na Fase 5)

Fora do escopo: landing page de download (sub-projeto), instaladores/GitHub (Fase 5).

## 1. CTAs do funil

- Formato: falinha com botão — balão do Lumi com texto curto + botões "Ver 🔗" e "Agora não". "Ver" abre o navegador no link do produto.
- Cadência: no máximo **1 CTA a cada 2-3 dias** (mínimo 48h desde o último), e somente a partir do **3º dia de uso** do app (vínculo antes da oferta).
- Momento: mesmas regras de respeito da falinha (nunca em silêncio/convite/check-in/atividade/tela cheia/fora do expediente; pessoa ativa no computador). Balão fica ~25s (tem botão, precisa de mais tempo que falinha).
- Rodízio de produtos sem repetição imediata, índice persistido:

| Chave | Produto | Link (com `utm_source=lumi&utm_medium=app&utm_content=cta` quando aplicável) |
|---|---|---|
| `metodo` | Método Arquitetura do Encontro Hospitalar (R$67) | https://www.encontrohospitalar.com.br/ |
| `dortotal` | Dor Total 360º | https://dortotal360.pages.dev/ |
| `convidado` | O Convidado Indesejado — A Dor | https://convidado-indesejado.netlify.app/ |
| `livro` | A Vida em um Corpo que Ensina (R$37) | https://a.co/d/0ejWHMGV (Amazon; sem UTM — link curto não aceita) |
| `instagram` | @robertoribeiropsi | https://www.instagram.com/robertoribeiropsi/ |

- ConectaDig fica **fora** até o Roberto fornecer a URL.
- Segurança: o app só abre URLs da tabela acima (allowlist embutida); nada vindo de fora decide o destino.
- Textos (~2 por produto): rascunhos no tom da marca, **aprovação do Roberto obrigatória**.
- Registro local: data do último CTA e produto (para cadência e rodízio). Sem telemetria de cliques na Fase 4.

## 2. Compartilhar pílula (decisão A1)

- Botão "Compartilhar 📸" no cartão de pílula.
- Gera PNG **1080×1920** (story): fundo na identidade do app (creme/verde-água), Lumi no canto, texto da pílula em destaque, "— @robertoribeiropsi" e "feito com Lumi 💛" discreto no rodapé.
- Ao clicar: salva em `Imagens/Lumi/pilula-<id>-<data>.png` **e** copia a imagem para a área de transferência; o cartão confirma ("Copiado e salvo em Imagens/Lumi ✨").
- Renderização local (canvas no próprio app); nenhum dado sai da máquina.
- O visual do template passa pela aprovação do Roberto antes do fim da fase.

## 3. Conteúdo remoto

- No arranque (e a cada 24h com o app aberto), o app tenta baixar `conteudo.json` de uma URL configurável.
- Chaves atualizáveis remotamente: `falinhas`, `pilulas`, `microPausas`, `ctas` (os `convites` são estruturais — acoplados ao rodízio — e ficam embutidos). Estrutura validada antes de aplicar; inválida = ignorada.
- Última versão válida fica em cache local; sem internet ou sem URL configurada, o conteúdo embutido funciona 100%.
- URL padrão: vazia (mecanismo desligado) até a Fase 5 definir a hospedagem (GitHub raw, gratuito).

## Critérios de aceite

- Nenhum CTA antes do 3º dia de uso; nunca dois em menos de 48h; produtos alternam sem repetição imediata; "Ver" abre o navegador no link certo com UTM.
- Compartilhar gera o story correto (texto da pílula legível, sem cortes), salva e copia.
- Com URL remota válida servindo um JSON de teste, as falinhas mudam sem reinstalar; com URL fora do ar, tudo segue com o conteúdo embutido.
- `npm test` cobre: regras de cadência do CTA, allowlist de URLs, validação/merge do conteúdo remoto, quebra de texto da imagem.
