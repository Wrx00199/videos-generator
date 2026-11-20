#!/bin/bash
cd "/media/wr/HDD/Estudio de video"
PY=projetos/lives/clipper/ambiente/bin/python
T=projetos/lives/clipper/trabalho
touch /tmp/up/marca_ciclo 2>/dev/null
sleep ${1:-540}
for d in $T/bistecone-138851451-gravacao $T/gabepeixe-138852945-gravacao; do
  for s in $(find $d -name 'seg_*.ts' -newer /tmp/up/marca_ciclo -size +60M 2>/dev/null | sort); do
    nice -n 19 ionice -c3 $PY ferramentas/lives/achar.py $s --n 2 --saida /tmp/ach.jsonl 2>&1 | grep -E "score [4-9][0-9]\." | cut -c1-320 | sed "s|^|$(basename $d|cut -c1-6) |"
  done
done
for c in bistecone gabepeixe; do curl -s -m 20 -A "Mozilla/5.0" "https://kick.com/api/v2/channels/$c/clips?sort=date&time=day" | python3 -c "
import sys,json
for x in sorted(json.load(sys.stdin).get('clips',[]),key=lambda x:-x['views'])[:2]:
  if x['views']>=8: print('VIRAL $c',x['views'],x['duration'],x['created_at'][11:16],x['title'][:40])"; done
date +%T
