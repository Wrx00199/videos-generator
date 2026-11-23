#!/usr/bin/env bash
# render_parcial.sh <projeto> <quadro_ini> <quadro_fim>  — re-renderiza SO um trecho (passo 2) numa pasta temporaria e copia com o nome certo f(quadro/2).
# (render.mjs numera pelo indice da lista: "a-b" direto em frames/ sobrescreve o comeco do video; ver KIT.md "BUG de montagem")
set -e; P="${1:?}"; A=$(( ${2:?} / 2 * 2 )); Bq="${3:?}"
K="$(dirname "$0")"
PERFIL=$(python3 "$K/portao.py" "$P" perfil)
if [ "$PERFIL" = v7 ]; then
  echo "Para corrigir o V7, use previa.py e render_leve.sh com a versão revista." >&2
  exit 2
fi
exec 9>>"/tmp/tinhao-render-$UID.lock"
flock 9
while pgrep -f "^[n]ode render.mjs|ms-playwright/[c]hromium" >/dev/null; do sleep 10; done
T="$P/frames_tmp"; rm -rf "$T"; mkdir -p "$T"
(cd "$P/web" && nice -n 19 node render.mjs ../frames_tmp "$A-$Bq" 2 0.92 2>&1 | grep -v 404 | tail -1)
i=0; for q in $(seq $A 2 $Bq); do n=$(printf "%04d" $((q/2))); cp "$T/f$(printf '%04d' $i).jpg" "$P/frames/f$n.jpg"; i=$((i+1)); done
rm -rf "$T"; echo "parcial ok $A-$Bq"
