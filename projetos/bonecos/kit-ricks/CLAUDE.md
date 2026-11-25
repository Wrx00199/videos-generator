# Kit híbrido do Tião — referência grudada (carrega sozinho em todo trabalho aqui)

Antes de escrever roteiro, story.js ou câmera de QUALQUER vídeo, abrir e olhar (não só citar):
1. `ricksclips-style/reference/ricks-study/` (sheets/, *_sheet.jpg, chars.jpg) — o padrão visual do Rick.
2. `ref/MOLDE_RICKSCLIPS.md` e `ref/ANALISE_BRUTA_RICKS.md` — tempos, ganchos, esqueleto medidos.
3. `CHECKLIST_KIT.md` — regras + críticas do Filippe (manda sobre o kit quando ele criticou).

Portão de referência (antes do render 1080):
- Folha de contatos do nosso vídeo LADO A LADO com uma folha do Rick (`ricks-study/sheets`). Se o nosso estiver mais pobre (cenário, cor, densidade, número de personagens, tamanho da cabeça) ou mais frenético, corrige antes.
- `tools_clip_check.py` OK e `qa_motion.py` PASS (cv2 está em `~/.local/ocr-venv/bin/python`).

Motor: Blender EEVEE + `web/story.js` (sem HyperFrames, sem Remotion). Render na Vast via `render_vast.sh`, Stop logo após.

Comparar ESTILO, nunca tema (Filippe 25/11): pegar 2–3 folhas de `ricks-study/sheets/` de temas DIFERENTES e conferir só zoom, movimento e velocidade de câmera, tempo segurando cada alvo, estilo das cenas, transições e ritmo. O tema da referência é irrelevante; o conteúdo nunca é copiado.
