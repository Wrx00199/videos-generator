#!/usr/bin/env bash
# render_leve.sh <projeto> [frames "0-N" | auto] [passo=2] [qualidade=0.92]  (--dry so imprime o comando)
# Render de prioridade baixa (nice 19 + ionice idle), UM por vez, avisa inicio e fim com duracao.
set -u
DRY=0; ARGS=()
for a in "$@"; do [ "$a" = "--dry" ] && DRY=1 || ARGS+=("$a"); done
PROJ="${ARGS[0]:-}"; PEDIDO="${ARGS[1]:-auto}"; SPEC="$PEDIDO"; STEP="${ARGS[2]:-2}"; Q="${ARGS[3]:-0.92}"
[ -d "$PROJ/web" ] || { echo "ERRO: $PROJ/web nao existe (rode novo_ep.sh antes)"; exit 2; }
K="$(cd -- "$(dirname -- "$0")" && pwd -P)"
PERFIL=$(python3 "$K/portao.py" "$PROJ" perfil) || exit $?
if [ "$PERFIL" = v7 ]; then
  COMPLETO=$(python3 "$K/portao.py" "$PROJ" quadros) || exit $?
  [ "$SPEC" != auto ] || SPEC="$COMPLETO"
  if [ "$SPEC" != "$COMPLETO" ]; then
    echo "V7: render integral usa $COMPLETO. Para prova curta, use previa.py." >&2
    exit 2
  fi
fi
if [ "$SPEC" = "auto" ]; then
  N=$(grep -oE 'TOTAL *= *[0-9]+' "$PROJ/web/story.js" 2>/dev/null | grep -oE '[0-9]+' | head -1)
  [ -n "$N" ] || { echo "ERRO: nao achei TOTAL em web/story.js; passe o intervalo, ex.: \"0-1799\""; exit 2; }
  SPEC="0-$((N-1))"
fi
CMD=(nice -n 19 ionice -c3 node render.mjs)
if [ "$DRY" = 1 ]; then echo "(cd $PROJ/web && ${CMD[*]} ../frames $SPEC $STEP $Q)"; exit 0; fi
if [ "$PERFIL" != v7 ] && [ -f "$PROJ/falas.json" ]; then
  python3 "$K/portao.py" "$PROJ" prova || exit $?
fi
exec 9>>"/tmp/tinhao-render-$UID.lock"
flock 9 || exit $?
# regra do Filippe (19/11): outra sessao (clipes) roda no mesmo PC; espera render/ffmpeg/chromium alheios acabarem
W=0; while pgrep -f "^[n]ode render.mjs|ms-playwright/[c]hromium" >/dev/null; do [ $W -eq 0 ] && echo "aguardando outro render (node/chromium) acabar..."; W=1; sleep 15; done   # ffmpeg leve da sessao de clipes (nice 19) NAO bloqueia
T0=$(date +%s); echo "[INICIO $(date +%H:%M)] $PROJ quadros $SPEC passo $STEP"
if [ "$PERFIL" = v7 ]; then
  # Cada versão usa uma pasta de quadros nova. Preserve renders de versões anteriores.
  VERSAO=$(python3 "$K/editorial.py" "$PROJ" montagem) || exit $?
  python3 "$K/portao.py" "$PROJ" prova || exit $?
  SPEC=$(python3 "$K/portao.py" "$PROJ" quadros) || exit $?
  if [ "$PEDIDO" != auto ] && [ "$PEDIDO" != "$SPEC" ]; then
    echo "O intervalo mudou para $SPEC durante a espera." >&2
    exit 1
  fi
  ATUAL=$(python3 "$K/editorial.py" "$PROJ" montagem) || exit $?
  [ "$VERSAO" = "$ATUAL" ] || { echo "Versão alterada antes do render." >&2; exit 1; }
  TEMP=$(mktemp -d "$PROJ/.render-v7-XXXXXXXX") || exit $?
  DESTINO=$(cd -- "$TEMP" && pwd -P)
  (cd "$PROJ/web" && env -u WEB -u HASH -u RESUME TIAO_TOTAL="$((${SPEC#0-} + 1))" "${CMD[@]}" "$DESTINO" "$SPEC" "$STEP" "$Q")
  RC=$?
  if [ "$RC" = 0 ]; then
    python3 "$K/portao.py" "$PROJ" prova || exit $?
    ATUAL=$(python3 "$K/editorial.py" "$PROJ" montagem) || exit $?
    [ "$VERSAO" = "$ATUAL" ] || { echo "Versão alterada durante o render." >&2; exit 1; }
    printf '%s\n' "$VERSAO" > "$TEMP/versao-v7.txt" || exit $?
    if [ -e "$PROJ/frames" ]; then
      ANTERIOR=$(mktemp -d "$PROJ/.render-anterior-XXXXXXXX") || exit $?
      mv -- "$PROJ/frames" "$ANTERIOR/frames" || exit $?
    fi
    mv -- "$TEMP" "$PROJ/frames" || exit $?
  fi
else
  (cd "$PROJ/web" && "${CMD[@]}" ../frames "$SPEC" "$STEP" "$Q"); RC=$?
fi
T1=$(date +%s); D=$((T1-T0)); echo "[FIM $(date +%H:%M), duracao $((D/60))m$((D%60))s, codigo $RC]"
exit $RC
