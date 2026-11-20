# Estado do projeto (19/11/2026) — leia isto primeiro

Fonte da verdade: este repo (`/media/wr/HDD/painelgta`, remoto `Wrx00199/painelgta`, privado; colaborador `svtheus`). O estúdio (`/media/wr/HDD/Estudio de video/ferramentas/{painel,lives}`) roda cópia: sincronizar copiando do repo depois de cada mudança.

## Como trabalhar de forma econômica
- Ler só `AGENTS.md`, este arquivo e `docs/DESEMPENHO.md`. Para código: `grep` antes de ler; `servidor.mjs`, `index.html` e `clipador.py` são grandes.
- Verificar estado com `git status -sb` e `git log --oneline -5`, não relendo pastas.
- Testes: `node testes/smoke.mjs` (13 passando). Painel: `PORTA_PAINEL=7777 node ferramentas/painel/servidor.mjs`.
- O pipeline não gasta tokens de IA (ffmpeg, yt-dlp, whisper local).

## O que existe
Painel (sidebar: Cortar por link, Ao vivo, Revisão, Fila do Meta, Placar, Contas, Marca, Ajuda), radar de lives Twitch/Kick/YouTube deduplicado por streamer, clipador (picos primeiro, nota de relevância 0–100, mínimo 45, perfis leve/equilibrado/qualidade automáticos por CPU/RAM), `ao_vivo.py` usa o mesmo analisador, `vod.py` para link offline, `limpar.py` (simulação por padrão), botão Parar, TikTok opcional (Contas), segurança Origin/Host.

## Medido no PC do Filippe (Ryzen 3 3200G, 8 GB, RX 550)
- Segmento de 10 min → 1 clipe: ~187 s (análise ~120, corte ~25, render ~40). Segmento descartado: 75–110 s.
- GPU (Vulkan whisper.cpp) = mesmo tempo da CPU, ~4× menos CPU: não integrar. Render VAAPI mais lento. Whisper base/small não melhoram. Padrão = só CPU.

## Pendências, em ordem combinada
1. ✅ FEITO (20/11): `limpar.py` reescrito: só apaga segmento bruto com marca `processado` (nunca o não analisado) e nunca gravação em andamento; `ao_vivo.py` limpa sobras a cada 10 min. Testado em pasta falsa. Simulação continua o padrão. ATENÇÃO: segmentos reais do Filippe (~50 GB, lives antigas sem pasta -sNNNNN) estão em `Estudio de video/projetos/lives/clipper/trabalho`; nunca rodar --apagar lá sem ele ver.
2. (EM ANDAMENTO) Triagem por áudio: `picos(com_score=True)` já existe no clipador; gate NÃO implementado. Medido (38 segmentos reais): extrair áudio custa 0,1–8 s (1–1,5% do tempo de 187 s); pico máximo varia de 2,7 a 45 (coringa 2,7–16, davyjones/bistecone 20–44, alanzoka/ricfazeres 27–45). Falta: rodar clipador em ~6 segmentos de nota conhecida e ver se score baixo = sem clipe, antes de fixar corte. Antes:  (volume) antes da análise pesada — ganho esperado grande, só hipótese até medir; depois chat (só Kick existe: `chat_kick.py`).
3. Benchmark na instalação que grava `config/desempenho.json`.
4. Fila única de processamento (ganha só com 2+ lives).
5. Windows nunca foi testado de verdade (amigo testa).

## Não resolvido
- Nota mínima de relevância não calibrada (nenhum trecho passou nas lives de teste); calibrar com aprova/recusa da Revisão.
- Lives em inglês não suportadas. Lacunas entre segmentos do `ao_vivo.py` não medidas.
- Site `painelgta.netlify.app` é público e antigo (só no estúdio, fora do git); decidir se remove/atualiza com o Filippe.
- Fora do projeto no PC dele: `/media/wr/HDD/whispercpp-teste` (382 MB, descartável) e pacotes apt do teste Vulkan.

## Regras do Filippe
TikTok fica opcional, nunca removido. O painel nunca posta sozinho. Sem segredos no repo. Responder curto (lê no celular).
