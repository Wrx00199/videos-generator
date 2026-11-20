#!/bin/bash
# Corte rápido (sem Whisper, 1 passada, 720x1280): rapido.sh ORIGEM INICIO DUR "GANCHO" nome [pasta_saida]
# ORIGEM = .ts/.mp4 (gravação ou clipe da plataforma). Gera nome_ig.mp4 (logo+@) e nome_tiktok.mp4 (sem marca).
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$1"; SS="$2"; DUR="$3"; HOOK="$4"; NOME="$5"; OUT="${6:-$RAIZ/prontos/Gta 6/Lives BR/$(date +%F)-rapidos}"
mkdir -p "$OUT"; F="$RAIZ/ferramentas/lives/skill-clips/fontes/Montserrat-ExtraBold.ttf"; LOGO="$RAIZ/marca/sixstars_br_redondo.png"
H=$(echo "$HOOK" | sed "s/'//g; s/:/ -/g" | fold -s -w 22)
DT="drawtext=fontfile=$F:text='$H':fontsize=34:fontcolor=black:box=1:boxcolor=yellow:boxborderw=14:x=(w-text_w)/2:y=150:line_spacing=6:enable='lt(t,4)'"
nice -n 5 ffmpeg -nostdin -v error -y -ss "$SS" -t "$DUR" -i "$SRC" -i "$LOGO" -filter_complex "
[0:v]split=2[s1][s2];
[s1]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,boxblur=18:3,eq=brightness=-0.12[bg];
[s2]scale=720:-2,eq=contrast=1.05:saturation=1.1[fg];
[bg][fg]overlay=0:(H-h)/2,split=2[v1][v2];
[v1]$DT[vt];
[v2]$DT[vi0];[1:v]scale=90:90[lg];[vi0][lg]overlay=24:24,drawtext=fontfile=$F:text='@six_starsbr':fontsize=28:fontcolor=white:borderw=3:bordercolor=black:x=124:y=50[vi]
" -map "[vt]" -map 0:a -c:v libx264 -preset veryfast -crf 23 -r 30 -pix_fmt yuv420p -c:a aac -b:a 128k "$OUT/${NOME}_tiktok.mp4" \
  -map "[vi]" -map 0:a -c:v libx264 -preset veryfast -crf 23 -r 30 -pix_fmt yuv420p -c:a aac -b:a 128k "$OUT/${NOME}_ig.mp4" && echo "OK $OUT/$NOME"
