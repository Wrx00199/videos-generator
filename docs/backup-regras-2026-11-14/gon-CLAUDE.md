# Pasta do Gon

Regras de voz e execução: as globais (`~/.claude/CLAUDE.md`).

## Retomar o projeto GTA 6 BR (Venice Gang)
- Estado, decisões e pendências: `/media/wr/HDD/Second Brain/04 - Projetos/Conteúdo/GTA 6 BR/Estado e pendências.md`. Consultar esse estado quando a tarefa for deste projeto, seguindo as regras e o índice pertinente do cofre; não abrir para pedidos independentes.
- Código: `/media/wr/HDD/Gon/venice-gang` (subir painel e escritório: `/media/wr/HDD/Gon/subir.sh`). Painel `http://127.0.0.1:7777`, escritório 3D `http://localhost:4700`, wa-capture `127.0.0.1:7790`.
- Chaves ficam só em `/media/wr/HDD/Gon/venice-gang/.env`. Nunca mostrar, só os 4 últimos caracteres.
- Nada é postado sem o Filippe aprovar cada vídeo.

## Linux (Mint) e economia neste projeto
- Node, ffmpeg, edge-tts e Chromium do Playwright em `~/.local` (PATH no `.bashrc`).
- Não varrer `venice-gang/{node_modules,_cache,_saida,_tmp,_pesquisa}` nem mídia por busca ampla: `ls`, `find -newer` e abrir só o arquivo que decide a dúvida. `.env`: só chave por nome, 4 últimos caracteres.
- Frame/imagem só quando a dúvida for visual; antes, ler `ficha.json`, `spec.json`, `_estado/<id>.json` e `logs/AAAA-MM-DD.log` (tail).
- Texto grande colado: processar uma vez, gravar a decisão no cofre e não repetir de volta.
- Uma etapa do pipeline por vez.
- Prompt mestre e especificação recuperados do Windows: `/media/wr/HDD/Gon/recuperado/`.
