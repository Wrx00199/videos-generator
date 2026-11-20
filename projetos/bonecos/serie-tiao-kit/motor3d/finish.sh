#!/usr/bin/env bash
# Quadros + mix (já em -14 LUFS pelo mix_tiao.py) -> MP4 + QA.
# Uso: bash finish.sh <pasta_quadros> <mix.wav> <saida.mp4>
set -e; Q="${1:?quadros}"; A="${2:?mix.wav}"; F="${3:?saida.mp4}"
FPS=30
if [ -f "$Q/step.info" ]; then
  FPS=$(grep -o '"framerate":[0-9.]*' "$Q/step.info" | cut -d: -f2)
fi
ffmpeg -v error -y -framerate "$FPS" -i "$Q/f%04d.jpg" -i "$A" -map 0:v:0 -map 1:a:0 -r 30 -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "$F"
ffprobe -v error -show_entries format=duration -show_entries stream=width,height,r_frame_rate -of compact "$F"
echo "--- QA (vazio = sem preto/congelado >= 1,5 s)"; ffmpeg -i "$F" -vf "freezedetect=n=0.0005:d=1.5,blackdetect=d=0.1" -an -f null - 2>&1 | grep -E "freeze_start|black_start" || true
ffmpeg -i "$F" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tail -2
