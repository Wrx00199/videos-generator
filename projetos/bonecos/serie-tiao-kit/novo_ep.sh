#!/bin/bash
# uso: novo_ep.sh <pasta_ep>  (copia motor3d p/ web, linka lib/node_modules, tempos_ft.js -> web/tempos.js)
P="$1"; K=serie-tiao-kit/motor3d; mkdir -p $P/web
for f in main.js mundo.js acoes.js elenco.js luzes.js motion.js paint.js toon.js index.html render.mjs sheet.py package.json cenarios.js cenarios2.js cenarios3.js efeitos.js epi.js planos.js Pz.js cameras.js; do cp $K/$f $P/web/; done
ln -sfn "$PWD/$K/lib" $P/web/lib; ln -sfn "$PWD/$K/node_modules" $P/web/node_modules
cp $P/tempos_ft.js $P/web/tempos.js
