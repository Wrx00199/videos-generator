#!/usr/bin/env python3
"""Portão técnico: duração, áudio (pico/clipping), tela congelada/preta, montagem de 6 quadros, texto da legenda.
Uso: revisar.py PASTA_DO_CLIPE  -> imprime relatório e grava montagem.jpg (olhar a imagem!)."""
import json, re, subprocess, sys
from pathlib import Path
p = Path(sys.argv[1])
meta = json.loads((p / "meta.json").read_text())
for v in ("tiktok", "ig"):
    f = next(p.glob(f"*_{v}.mp4"), None)
    if not f:
        print(v, "AUSENTE"); continue
    dur = float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",f],capture_output=True,text=True).stdout)
    r = subprocess.run(["ffmpeg","-i",f,"-af","volumedetect","-vf","freezedetect=n=0.003:d=2,blackdetect=d=0.5","-f","null","-"],capture_output=True,text=True).stderr
    mx = re.findall(r"max_volume: (-?[\d.]+)", r); mean = re.findall(r"mean_volume: (-?[\d.]+)", r)
    fr = re.findall(r"freeze_duration: ([\d.]+)", r); bl = re.findall(r"black_duration:([\d.]+)", r)
    print(f"{v}: {dur:.1f}s (ok 20-60={20<=dur<=60}) max {mx} mean {mean} congelado {fr} preto {bl}")
    if v == "tiktok":
        ts = [0.5] + [dur*k/5 for k in range(1,5)] + [dur-0.7]
        cmd = ["ffmpeg","-y","-loglevel","error"]
        for t in ts: cmd += ["-ss",f"{t:.2f}","-i",str(f)]
        fc = "".join(f"[{i}:v]scale=360:-2[s{i}];" for i in range(6)) + "".join(f"[s{i}]" for i in range(6)) + "hstack=inputs=6[o]"
        cmd += ["-filter_complex",fc,"-map","[o]","-frames:v","1",str(p/"montagem.png")]
        subprocess.run(cmd, check=True)
print("TEXTO:", meta.get("texto")); print("gancho:", meta.get("gancho"), "| camera:", meta.get("camera"))
