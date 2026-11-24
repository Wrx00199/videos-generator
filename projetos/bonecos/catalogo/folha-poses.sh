#!/bin/bash
# uso: folha-poses.sh <pasta-ep> -> q/poses.jpg (1 quadro no fim de cada plano) + q/acoes.json (assert numérico)
cd "$1"; CH=$(ls -d ~/.nexo/cache/chrome/chrome-headless-shell/*/chrome-headless-shell-linux64)/chrome-headless-shell; mkdir -p q/p
TS=$(node -e 'const p=require("./plano.json").PLAN;console.log(p.map(x=>(x.t0+x.dur*.55).toFixed(2)+","+(x.t0+x.dur-.02).toFixed(2)).join(" "))')
i=0; for t in $TS; do for u in ${t//,/ }; do i=$((i+1)); "$CH" --no-sandbox --hide-scrollbars --allow-file-access-from-files --virtual-time-budget=4000 --screenshot="q/p/$(printf %03d $i).png" --window-size=1080,1920 "file://$PWD/index.html?t=$u" 2>/dev/null >/dev/null; done; done
ffmpeg -v error -y -pattern_type glob -i 'q/p/*.png' -vf "scale=270:-1,tile=8x$(( (i+7)/8 ))" -frames:v 1 q/poses.jpg
"$CH" --no-sandbox --allow-file-access-from-files --virtual-time-budget=4000 --dump-dom "file://$PWD/index.html" 2>/dev/null | head -c 0
echo "folha: $i quadros"
