#!/usr/bin/env bash
# voz_ep.sh <projeto>  — voz (fala a fala, 5 chaves) -> atempo 1,22 + pontas -> dialogo -> conferir -> tempos_ft.js -> STT -> legenda.ass. Exit 3 = cota esgotada.
set -e; P="${1:?projeto}"; K="$(cd "$(dirname "$0")" && pwd)"; cd "$(dirname "$K")/.."; ROOT="$PWD"; cd "$K/.."
cd "$K/.."; B="$PWD"; P="$B/$P"; mkdir -p "$P/voz"
node "$K/vozes_elenco.mjs" "$P/falas.json" "$P/voz" --por-fala > "$P/voz.log" 2>&1 || { status=$?; tail -3 "$P/voz.log"; exit "$status"; }
mkdir -p "$P/voz_original"
for f in "$P"/voz/_por_personagem/*_[0-9]*.wav; do b=$(basename "$f"); case $b in sil_*) continue;; esac; [ -e "$P/voz_original/$b" ] && continue; cp "$f" "$P/voz_original/$b"; ffmpeg -y -v error -i "$f" -filter:a atempo=1.22 /tmp/_t.wav && python3 "$K/aparar_pontas.py" /tmp/_t.wav "$P/voz/_por_personagem/$b"; done
node "$K/vozes_elenco.mjs" "$P/falas.json" "$P/voz" --montar | tail -1
python3 - "$P" <<'PY'
import json,subprocess,sys
P=sys.argv[1]; t=json.load(open(P+'/voz/falas_tempos.json')); ft=[[round(x['ini'],3),round(x['fim'],3)] for x in t]
dur=float(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',P+'/voz/dialogo.wav'],capture_output=True,text=True).stdout)
open(P+'/tempos_ft.js','w').write('export const FT = '+json.dumps(ft)+';\nexport const DUR = %.2f;\n'%round(dur+0.4,2)); print('FT ok',round(dur,1),'s')
PY
python3 "$B/../../ferramentas/stt.py" "$P/voz/dialogo.wav" pt small > "$P/palavras.json" 2>/dev/null
python3 "$K/corrigir_legenda.py" "$P/palavras.json" "$P/falas.json" "$P/palavras_roteiro.json" | tail -1
python3 "$K/legenda.py" "$P/palavras_roteiro.json" "$P/legenda.ass" | tail -1
