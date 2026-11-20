#!/usr/bin/env bash
# acabamento.sh <entrada.mp4> <saida.mp4> [serie=tiao]  — passe único de cor/nitidez/vinheta (config/filtros.json). Áudio copiado.
set -e; IN="$1"; OUT="$2"; S="${3:-tiao}"; R="$(cd "$(dirname "$0")/.." && pwd)"
VF=$(python3 -c "import json,sys;d=json.load(open('$R/config/filtros.json')).get('$S',{});print(d['vf'] if d.get('ligado') else '')")
if [ -z "$VF" ]; then cp "$IN" "$OUT"; echo "acabamento desligado ($S)"; exit 0; fi
T0=$(date +%s); nice -n 15 ffmpeg -v error -y -i "$IN" -vf "$VF" -c:v libx264 -preset veryfast -crf 19 -pix_fmt yuv420p -c:a copy -movflags +faststart "$OUT"
echo "acabamento $S: $(( $(date +%s)-T0 )) s"
