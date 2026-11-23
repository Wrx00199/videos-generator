#!/usr/bin/env bash
# montar_final.sh <projeto> [overlay.mov y]  (HUD_OFF="ini:fim" esconde o overlay nesse intervalo, ex. flashback)  — quadros + mix -> sem_legenda.mp4 -> final.mp4 (HUD em overlay opcional + legenda.ass).
set -eo pipefail; P="${1:?projeto}"; OV="${2:-}"; Y="${3:-0}"; K="$(dirname "$0")"
PERFIL=$(python3 "$K/portao.py" "$P" perfil)
F="$P/final.mp4"
if [ "$PERFIL" = v7 ]; then
  if [ -n "$OV" ]; then
    echo "V7: coloque elementos visuais da série na versão submetida à revisão." >&2
    exit 2
  fi
  exec 9>>"/tmp/tinhao-render-$UID.lock"
  flock 9
  python3 "$K/portao.py" "$P" prova
  VERSAO=$(python3 "$K/editorial.py" "$P" montagem)
  if [ ! -f "$P/frames/versao-v7.txt" ] || [ "$(cat "$P/frames/versao-v7.txt")" != "$VERSAO" ]; then
    echo "Quadros de outra versão; execute render_leve.sh." >&2
    exit 1
  fi
  F=$(mktemp "$P/.final-v7-XXXXXXXX.mp4")
  trap 'rm -f -- "$F"' EXIT
fi
bash "$K/motor3d/finish.sh" "$P/frames" "$P/som/mix.wav" "$P/sem_legenda.mp4" | tee "$P/montar.log"
ACAB=$(python3 -c "import json;d=json.load(open('$K/../../../config/filtros.json')).get('tiao',{});print(d['vf'] if d.get('ligado') else 'null')" 2>/dev/null || echo null)
FC="[0:v]subtitles=$P/legenda.ass,$ACAB[v]"; IN=(-i "$P/sem_legenda.mp4")
if [ -n "$OV" ]; then IN+=(-i "$P/$OV"); EN=""; [ -n "${HUD_OFF:-}" ] && EN=":enable='not(between(t,${HUD_OFF%%:*},${HUD_OFF##*:}))'"
  FC="[0:v][1:v]overlay=0:$Y:shortest=1$EN,subtitles=$P/legenda.ass,$ACAB[v]"; fi
ffmpeg -v error -y "${IN[@]}" -filter_complex "$FC" -map "[v]" -map 0:a -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -c:a copy -movflags +faststart "$F"
if [ "$PERFIL" = v7 ]; then
  python3 "$K/editorial.py" "$P" final --versao "$VERSAO" --selar-final "$F"
fi
ffprobe -v error -show_entries format=duration -show_entries stream=width,height -of compact "$P/final.mp4"; echo MONTADO | tee -a "$P/montar.log"
