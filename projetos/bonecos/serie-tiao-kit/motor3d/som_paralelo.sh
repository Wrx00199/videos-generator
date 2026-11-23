#!/bin/bash
# som_paralelo.sh — dispara som+mix em background enquanto o render corre
# Uso: bash som_paralelo.sh <pasta_ep>
# Chamar DEPOIS de iniciar o render.mjs em background, ANTES de esperar o render terminar.
# Exemplo de uso no fluxo:
#   node render.mjs ../frames "0-N" &
#   RENDER_PID=$!
#   bash ../som_paralelo.sh ../..
#   wait $RENDER_PID
#   bash finish.sh ../frames ../som/mix.wav ../final.mp4

EP="$1"
SOM_DIR="$EP/som"
mkdir -p "$SOM_DIR"

echo "[som] iniciando som_tiao.py..."
python3 "$(dirname "$0")/audio/som_tiao.py" "$EP" > "$SOM_DIR/som.log" 2>&1
if [ $? -ne 0 ]; then echo "[som] ERRO em som_tiao.py — ver $SOM_DIR/som.log"; exit 1; fi

echo "[som] iniciando mix_tiao.py..."
python3 "$(dirname "$0")/mix_tiao.py" "$EP" >> "$SOM_DIR/som.log" 2>&1
if [ $? -ne 0 ]; then echo "[som] ERRO em mix_tiao.py — ver $SOM_DIR/som.log"; exit 1; fi

echo "[som] PRONTO — $SOM_DIR/mix.wav"
