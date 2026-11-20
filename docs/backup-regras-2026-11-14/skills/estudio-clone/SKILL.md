---
name: estudio-clone
description: Clona/modela um vídeo de referência (YouTube, TikTok, IG, X) em vídeo vertical PT-BR próprio — mesmo esqueleto, gancho, ritmo e estilo de voz; texto reescrito, visuais trocados, marca própria. Também pesquisa virais e monta a planilha de referências. Usar para "clona esse", "modela esse vídeo", "acha virais de GTA 6".
---

# Estúdio · Clone (modelagem)

**Modelar ≠ copiar.** Fica: estrutura, gancho, ordem das ideias, ritmo de corte, tom da voz, tipo de infográfico.
Muda: texto (traduzido + reescrito), cores (marca), visuais (material novo ou feito por nós), logo própria.
Tudo de um vídeo fica em `projetos/<AAAA-MM-DD>-<slug>/`. Nada é postado sem o Filippe aprovar.

## Etapas (uma por vez; cada uma grava seu arquivo — se o arquivo existe, pula)

| # | Etapa | Como | Grava |
|---|---|---|---|
| 1 | Baixar | `yt-dlp -f "bv*[height<=1080]+ba/b" --merge-output-format mp4 -o original.mp4 <url>` | `original.mp4` |
| 2 | Desmontar | `ferramentas/rea-video/.venv/bin/rea-video decompose original.mp4 -o rea` (~1 min por 10 s de vídeo, ~350 MB RAM); ler `rea/VIDEO.md` (não o JSON cru) | `rea/` |
| 3 | Ouvir | `ffmpeg -i original.mp4 -vn -ac 1 -ar 16000 fala.wav` → `python3 ferramentas/stt.py fala.wav auto small > fala.json` | `fala.json` |
| 3b | Medir estilo | `ferramentas/rea-video/.venv/bin/python -I ferramentas/medir_estilo.py original.mp4 --fala fala.json --json estilo.json`; se o estilo é novo, criar o cartão em `estilos/<nome>.md` (modelo `estilos/_modelo.md`); se já existe, ler o cartão | `estilo.json` |
| 4 | Ficha | Juntar 2+3 numa tabela de beats: tempo, fala original, o que aparece, tipo (filmagem / infográfico / texto / efeito), por que prende | `ficha.md` |
| 5 | Roteiro | Reescrever cada beat em PT-BR (ver `referencias/roteiro.md`); mesma duração ±15% | `roteiro.md` |
| 6 | Voz | por beat: `node ferramentas/voz.mjs --arquivo beatN.txt --saida voz/beatN.mp3` (Fenrir, ~5 s cada); depois juntar e transcrever com `stt.py` para tempo por palavra | `voz/`, `voz.json` |
| 7 | Visual | por beat, decidir: material filmado (ver Material), infográfico/motion → skill `estudio-motion`, efeito → pixelfx | `visual/` |
| 8 | Montar | composição HyperFrames 1080x1920 30 fps: visuais + voz + legenda palavra a palavra (de `voz.json`) + logo `marca/` | `final.mp4` |
| 9 | Portão | checklist abaixo; mostrar ao Filippe; só ele aprova | `portao.md` |

## Material filmado (o gargalo histórico)
- Regra: o plano novo tem que **mostrar a mesma coisa** que o plano original mostra (mesmo assunto, mesma ação). Se não achou, troca por infográfico/motion — nunca encher com qualquer coisa.
- Trailer oficial do GTA 6: **liberado só em teste**. Em vídeo para postar, só se o Filippe liberar aquele vídeo.
- Fontes: screenshots oficiais, clipes de streamers (via `estudio-lives`), imagens geradas (Gemini) ou desenhadas (claude-drawing).
- Proibido: fala em inglês no áudio final, reaproveitar áudio/música do original.

## Portão (reprova se falhar qualquer um)
1. Gancho nos 2 primeiros segundos tão forte quanto o original. 2. Cada beat do original tem correspondente.
3. Visual bate com a fala em todo beat. 4. Legenda sincronizada, sem erro de português.
5. Áudio: voz −14 LUFS aprox., sem clipping; sem inglês. 6. Marca presente; cores diferentes do original.
7. Diferença anti-repost: nenhum plano copiado inteiro do original. 8. Humor/frases não repetem vídeos anteriores.
9. Números batem: `medir_estilo.py original.mp4 final.mp4` — câmera movendo, plano médio, brilho/contraste a ±15% do original;
   `freezedetect` sem freeze não pedido. Divergência é corrigida citando o número, não "ficou feio".
Revisor do portão é um subagente que NÃO montou o vídeo.

## Orquestração
Etapas 2 e 3 rodam em paralelo; 6 e 7 em paralelo por beat. Use subagentes com modelo explícito: haiku para pesquisa/resumo,
sonnet para montagem mecânica, opus para roteiro e portão. Máximo 2 vídeos ao mesmo tempo (8 GB de RAM).
Para lote, a ferramenta Workflow nativa do Claude Code (só quando o Filippe pedir orquestração).

## Pesquisa de virais (planilha)
`python3 ferramentas/pesquisar.py <nicho> [--janela hoje|semana|mes] [--top 20]` — lê `nichos/<nicho>.json`
(termos, hashtags, canais, filtros), busca no YouTube sem API (~75 s, ~220 MB) e grava/atualiza `projetos/referencias.csv`
(views/dia, surto = views/inscritos, engajamento, nota, candidato + motivo). Nicho novo: copiar `nichos/_modelo.json`.
Shorts de verdade vêm de `hashtags` e `canais` (a busca por termo traz quase só vídeo horizontal).
Depois: o agente vê os 10 melhores candidatos (título, 3 quadros) e preenche a coluna de gancho/formato/clonável.
TikTok/IG/X: ainda manual pelo navegador (não automatizado).
