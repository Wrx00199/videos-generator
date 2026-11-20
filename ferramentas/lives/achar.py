#!/usr/bin/env python3
"""Acha picos de áudio (relativos ao entorno) num segmento .ts e transcreve (whisper tiny) só ao redor deles.
Uso (python do venv do clipper): achar.py SEG.ts [--n 4] [--saida achados.jsonl]
Score = volume 1 s (dB) menos mediana de 60 s, suavizado 3 s. Sem transcrição de segmento inteiro."""
import argparse, json, subprocess, sys, os
from pathlib import Path
import numpy as np
sys.path.insert(0, str(Path(__file__).resolve().parent))
import clipador as C

ap = argparse.ArgumentParser()
ap.add_argument("ts"); ap.add_argument("--n", type=int, default=4)
ap.add_argument("--saida", default=None); ap.add_argument("--antes", type=float, default=22); ap.add_argument("--depois", type=float, default=14)
a = ap.parse_args()
ts = Path(a.ts)
aud = C.wav(ts, None)                       # 16 kHz mono float
sr = C.SR
n = len(aud) // sr
x = aud[: n * sr].reshape(n, sr)
db = 20 * np.log10(np.sqrt((x ** 2).mean(1)) + 1e-6)
def uniform_filter1d(v, k):
    return np.convolve(np.pad(v, (k // 2, k - 1 - k // 2), mode="edge"), np.ones(k) / k, mode="valid")
def median_filter(v, size, mode=None):
    h = size // 2; p = np.pad(v, h, mode="edge")
    return np.array([np.median(p[i:i + size]) for i in range(len(v))])
base = median_filter(db, size=61, mode="nearest")
sc = uniform_filter1d(db - base, 3)
# variação (risada/grito = energia que oscila): desvio em 5 s
var = uniform_filter1d(np.abs(np.diff(db, prepend=db[0])), 5)
score = sc + 1.5 * var
usados = []
cands = []
for i in np.argsort(-score):
    if len(cands) >= a.n: break
    if any(abs(i - u) < 45 for u in usados): continue
    usados.append(i)
    cands.append(int(i))
out = []
for i in sorted(cands):
    s = max(0, i - a.antes); e = min(n, i + a.depois)
    sub = aud[int(s * sr): int(e * sr)]
    # whisper tiny direto no trecho (modelo do clipador)
    segs = C.transcrever(sub, "tiny")
    tx = " | ".join(f"[{s + g.start:.0f}] {g.text.strip()}" for g in segs)
    out.append({"seg": str(ts), "pico": i, "score": round(float(score[i]), 1), "db": round(float(db[i]), 1), "janela": [round(s), round(e)], "texto": tx})
    print(f"{ts.name} pico {i}s score {score[i]:.1f} db {db[i]:.0f}: {tx[:600]}", flush=True)
if a.saida:
    with open(a.saida, "a") as f:
        for o in out: f.write(json.dumps(o, ensure_ascii=False) + "\n")
