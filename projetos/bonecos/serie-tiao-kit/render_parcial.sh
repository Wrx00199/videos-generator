#!/usr/bin/env bash
# render_parcial.sh <projeto> <quadro_ini> <quadro_fim>  — re-renderiza SO um trecho (passo 2) numa pasta temporaria e copia com o nome certo f(quadro/2).
# (render.mjs numera pelo indice da lista: "a-b" direto em frames/ sobrescreve o comeco do video; ver KIT.md "BUG de montagem")
set -e; P="${1:?}"; A=$(( ${2:?} / 2 * 2 )); Bq="${3:?}"
while pgrep -f "^[n]ode render.mjs|ms-playwright/[c]hromium" >/dev/null; do sleep 10; done
T="$P/frames_tmp"; rm -rf "$T"; mkdir -p "$T"
(cd "$P/web" && nice -n 19 node render.mjs ../frames_tmp "$A-$Bq" 2 0.92 2>&1 | grep -v 404 | tail -1)
i=0; for q in $(seq $A 2 $Bq); do n=$(printf "%04d" $((q/2))); cp "$T/f$(printf '%04d' $i).jpg" "$P/frames/f$n.jpg"; i=$((i+1)); done
rm -rf "$T"; echo "parcial ok $A-$Bq"
