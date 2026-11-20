#!/bin/bash
# uso (de qualquer pasta): bash portao_trem.sh "0,1"  -> stills em /tmp/trem_still/ (1 render por vez; checar free -m antes)
K="$(cd "$(dirname "$0")" && pwd)"; W=/tmp/trem_web; mkdir -p $W /tmp/trem_still
for f in "$K"/*.js "$K"/index.html "$K"/render.mjs "$K"/package.json; do cp "$f" $W/ 2>/dev/null; done
cp $W/story_trem.js $W/story.js
ln -sfn "$K/lib" $W/lib; ln -sfn "$K/node_modules" $W/node_modules; ln -sfn "$K/assets" $W/assets
cd $W && node render.mjs /tmp/trem_still "$1"
