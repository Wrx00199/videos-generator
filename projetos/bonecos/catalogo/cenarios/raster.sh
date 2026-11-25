#!/bin/bash
# uso: ./raster.sh egito_obra_far egito_obra_mid ...   (sem args = todos os svg de _svg/). Um chrome por vez.
cd "$(dirname "$0")"; CH=$(ls -d ~/.nexo/cache/chrome/chrome-headless-shell/*/chrome-headless-shell-linux64 | tail -1)/chrome-headless-shell
[ $# -eq 0 ] && set -- $(ls _svg/*.svg | xargs -n1 basename | sed 's/\.svg$//')
for f in "$@"; do
  timeout 180 "$CH" --no-sandbox --hide-scrollbars --screenshot="$PWD/$f.png" --default-background-color=00000000 --window-size=1800,1920 --force-device-scale-factor=1 "file://$PWD/_svg/$f.svg" 2>&1 | grep -E "rror" | grep -v dbus
  echo "ok $f"
done
