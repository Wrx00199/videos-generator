# Estúdio de Vídeo — guia de 1 página

Estúdio local de vídeos curtos verticais PT-BR (canal dark/faceless; primeiro nicho: GTA 6, lançamento 19/11/2026).
Dono: Filippe. Regras de voz e execução: as globais (`~/.claude/CLAUDE.md`). Este projeto começou do zero em 2026-11-14;
o projeto antigo (`/media/wr/HDD/Gon/venice-gang`) é só consulta — não copiar contexto nem skills de lá.

## O que ele faz
1. **Clone/modelagem** de vídeo viral → skill `estudio-clone`.
2. **Recorte de lives** de streamers → skill `estudio-lives` (esboço, falta construir).
3. **Motion/VFX/infográfico** → skill `estudio-motion` (escolhe o motor).

## Pastas
- `projetos/<AAAA-MM-DD>-<slug>/` — um vídeo por pasta (original, rea/, fala.json, ficha.md, roteiro.md, voz/, visual/, final.mp4, portao.md).
- `projetos/referencias.csv` — planilha de virais pesquisados. `projetos/frases-usadas.txt` — humor já usado.
- `ferramentas/` — `voz.mjs` (Fenrir), `stt.py` (faster-whisper CPU, tempo por palavra), `rea-video/` (desmontar vídeo, venv Python 3.12), `pixelfx/`, `remotion-skills/`.
- `estilos/` — biblioteca de identidade visual: um cartão por estilo (números medidos, visual, fórmula de roteiro, prompt base, ideias de vídeo). Modelo: `_modelo.md`.
- `ferramentas/medir_estilo.py` — mede o estilo em números (câmera movendo %, cortes, luz, palavras/s) e compara original × clone.
- `ferramentas/pesquisar.py` + `nichos/<nicho>.json` — pesquisador de virais por nicho (YouTube): `python3 ferramentas/pesquisar.py gta6`. Nichos prontos: gta6, superpoderes; modelo `_modelo.json`.
- `marca/` — capa do Jason com charuto, logo do perfil (sixstars redonda), logo WR.
- `_tmp/` — lixo de teste, pode apagar.

## Regras
- Nada é postado sem o Filippe aprovar cada vídeo.
- Chaves só em `/media/wr/HDD/Gon/venice-gang/.env` (o `voz.mjs` lê de lá via `ESTUDIO_ENV`). Nunca mostrar; só os 4 últimos caracteres.
- Trailer do GTA 6: só em teste, salvo liberação do Filippe por vídeo. Áudio final sem inglês. Não reaproveitar áudio/música do original.
- PC fraco (Ryzen 3 3200G, 8 GB, RX 550, sem NVIDIA): no máximo 2 vídeos em paralelo; não encher o HD de mídia (apagar `original.mp4` e intermediários depois de aprovado).
- Subagente sempre com modelo explícito (haiku pesquisa, sonnet mecânico, opus roteiro/portão). Orquestração: subagentes + Workflow nativo; sem frameworks externos (ruflo/crewAI avaliados e descartados).

## Medido nesta máquina (2026-11-14)
voz Fenrir 6,7 s de fala em 5 s · stt small 6,7 s em 14 s · rea-video 10 s de vídeo em 66 s / 350 MB ·
hyperframes 6,8 s em 18 s (draft) · pixelfx 1,2 s/efeito · claude-drawing 3 camadas em 11 s · huashu filme 10 s em 93 s.
