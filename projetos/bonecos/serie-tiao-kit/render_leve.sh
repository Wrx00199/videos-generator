#!/usr/bin/env bash
# render_leve.sh <projeto> [frames "0-N" | auto] [passo=2] [qualidade=0.92]  (--dry so imprime o comando)
# Render de prioridade baixa (nice 19 + ionice idle), UM por vez, avisa inicio e fim com duracao.
set -u
DRY=0; ARGS=()
for a in "$@"; do [ "$a" = "--dry" ] && DRY=1 || ARGS+=("$a"); done
PROJ="${ARGS[0]:-}"; SPEC="${ARGS[1]:-auto}"; STEP="${ARGS[2]:-2}"; Q="${ARGS[3]:-0.92}"
[ -d "$PROJ/web" ] || { echo "ERRO: $PROJ/web nao existe (rode novo_ep.sh antes)"; exit 2; }
if [ "$SPEC" = "auto" ]; then
  N=$(grep -oE 'TOTAL *= *[0-9]+' "$PROJ/web/story.js" 2>/dev/null | grep -oE '[0-9]+' | head -1)
  [ -n "$N" ] || { echo "ERRO: nao achei TOTAL em web/story.js; passe o intervalo, ex.: \"0-1799\""; exit 2; }
  SPEC="0-$((N-1))"
fi
CMD=(nice -n 19 ionice -c3 node render.mjs ../frames "$SPEC" "$STEP" "$Q")
if [ "$DRY" = 1 ]; then echo "(cd $PROJ/web && ${CMD[*]})"; exit 0; fi
# regra do Filippe (19/11): outra sessao (clipes) roda no mesmo PC; espera render/ffmpeg/chromium alheios acabarem
W=0; while pgrep -f "^[n]ode render.mjs|ms-playwright/[c]hromium" >/dev/null; do [ $W -eq 0 ] && echo "aguardando outro render (node/chromium) acabar..."; W=1; sleep 15; done   # ffmpeg leve da sessao de clipes (nice 19) NAO bloqueia
T0=$(date +%s); echo "[INICIO $(date +%H:%M)] $PROJ quadros $SPEC passo $STEP"
(cd "$PROJ/web" && "${CMD[@]}"); RC=$?
T1=$(date +%s); D=$((T1-T0)); echo "[FIM $(date +%H:%M), duracao $((D/60))m$((D%60))s, codigo $RC]"
exit $RC
