#!/bin/bash
# Render remoto na Vast. Uso: ./render_vast.sh "ssh -p PORTA root@IP" <bl_dir> <saida_local> [N_processos=4]
# Instala Blender 4.2 se faltar, envia bl/, renderiza em N processos paralelos NA GPU, baixa os quadros.
# IMPORTANTE: sem __EGL_VENDOR_LIBRARY_FILENAMES o Blender cai no Mesa (CPU) e fica 2x+ mais lento (medido 25/11).
set -e
SSHCMD="$1"; BL="$2"; OUT="$3"; N="${4:-4}"
PORT=$(echo "$SSHCMD" | grep -oP '(?<=-p )\d+'); HOST=$(echo "$SSHCMD" | grep -oP 'root@[\w.-]+')
S="ssh -i $HOME/.ssh/vast_ed25519 -o StrictHostKeyChecking=accept-new -p $PORT $HOST"
$S 'test -x /root/blender-4.2.3-linux-x64/blender || (cd /root && wget -q https://download.blender.org/release/Blender4.2/blender-4.2.3-linux-x64.tar.xz && tar xf blender-4.2.3-linux-x64.tar.xz && rm blender-4.2.3-linux-x64.tar.xz && apt-get install -y -qq libxi6 libxxf86vm1 libxfixes3 libxrender1 libgl1 libxkbcommon0 libsm6 >/dev/null)'
rsync -az --delete -e "ssh -i $HOME/.ssh/vast_ed25519 -p $PORT" "$BL/" $HOST:/root/bl/
TOTAL=$(python3 -c "import json;print(len(json.load(open('$BL/data/frames.json'))))")
$S "cd /root/bl; rm -rf /root/out; export __EGL_VENDOR_LIBRARY_FILENAMES=/usr/share/glvnd/egl_vendor.d/10_nvidia.json; s=\$(date +%s);
for i in \$(seq 0 $((N-1))); do a=\$(( i*$TOTAL/$N )); b=\$(( (i+1)*$TOTAL/$N - 1 )); /root/blender-4.2.3-linux-x64/blender -b -P scene.py -- --data data --out /root/out --frames \$a-\$b --samples 4 --scale 0.5 --lite > /root/log_\$i 2>&1 & done; wait; echo render_s=\$(( \$(date +%s)-s )); ls /root/out | wc -l"
mkdir -p "$OUT"; rsync -az -e "ssh -i $HOME/.ssh/vast_ed25519 -p $PORT" $HOST:/root/out/ "$OUT/"
