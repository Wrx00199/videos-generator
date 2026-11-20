#!/usr/bin/env python3
"""Mix da serie Tiao.
uso: python3 mix_tiao.py narracao.mp3 palavras.json som_dir [duracao=40.5]
Le som_dir/{music,sfx,mar}.wav; escreve som_dir/mix.wav (-14 LUFS, TP <= -1 dBTP) e som_dir/medidas/{voz,trilha}_final.wav.
Niveis (LU, BS.1770 integrado): voz = referencia; trilha -10 (medida com o duck de -3 dB nas palavras); sfx = nivel ingenuo (integrado = voz) -6;
mar -30. Voz intocada (so ganho mestre comum). Limitador look-ahead em 4x oversampling.
"""
import json
import os
import subprocess
import sys
import tempfile

import numpy as np
from scipy import signal
from scipy.ndimage import minimum_filter1d, uniform_filter1d

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dsp as D
from dsp import SR, ns

ALVO_LUFS, TETO_TP = -14.0, -1.2
DUCK_DB, ATQ, REL = -3.0, 0.04, 0.18


def lufs(x):
    return D.integrated(x)


def carregar_voz(mp3, n):
    with tempfile.TemporaryDirectory() as td:
        w = os.path.join(td, "v.wav")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", mp3, "-ar", str(SR), "-ac", "1", "-c:a", "pcm_s24le", w], check=True)
        x = D.read_wav(w)[0]
    x = D.st(x)
    out = np.zeros((2, n))
    m = min(n, x.shape[1])
    out[:, :m] = x[:, :m]
    return out


def duck_env(palavras, n):
    """ganho (linear) da trilha: -3 dB durante as palavras, ataque 40 ms / release 180 ms"""
    from scipy.ndimage import binary_closing
    a = np.zeros(n)
    for p in palavras:
        a[ns(p["ini"]):ns(p["fim"]) + 1] = 1.0
    a = binary_closing(a > 0, structure=np.ones(ns(0.25))).astype(float)  # fecha vaos < 0,25 s
    y = np.zeros(n)
    s = 0.0
    ca, cr = np.exp(-1 / (ATQ * SR)), np.exp(-1 / (REL * SR))
    for i in range(n):
        c = ca if a[i] > s else cr
        s = c * s + (1 - c) * a[i]
        y[i] = s
    return 10 ** (DUCK_DB * y / 20)


def limitar(x, teto_db):
    """limitador look-ahead 5 ms, pico verdadeiro via 4x oversampling"""
    teto = 10 ** (teto_db / 20)
    up = signal.resample_poly(x, 4, 1, axis=-1)
    pk = np.abs(up).max(0)
    gr = np.minimum(1.0, teto / (pk + 1e-12))
    la = ns(0.005) * 4
    gr = minimum_filter1d(gr, 2 * la + 1)
    gr = uniform_filter1d(gr, la + 1)
    gr = np.minimum(gr, 1.0)
    return x * gr[::4][: x.shape[1]][None, :] if len(gr[::4]) >= x.shape[1] else x


def main():
    if len(sys.argv) < 4:
        raise SystemExit(__doc__)
    mp3, pal_json, sd = sys.argv[1:4]
    dur = float(sys.argv[4]) if len(sys.argv) > 4 else 40.5
    n = ns(dur)
    pal = json.load(open(pal_json))["palavras"]
    voz = carregar_voz(mp3, n)
    mus = D.st(D.read_wav(os.path.join(sd, "music.wav"))[0])[:, :n]
    sfx = D.st(D.read_wav(os.path.join(sd, "sfx.wav"))[0])[:, :n]
    mar = D.st(D.read_wav(os.path.join(sd, "mar.wav"))[0])[:, :n]
    Lv = lufs(voz)
    env = duck_env(pal, n)[None, :]
    mus = mus * D.dbg(Lv - 10 - lufs(mus * env))  # -10 LU medido JA com o duck
    mus_duck = mus * env
    sfx = sfx * D.dbg(Lv - 6 - lufs(sfx))
    Lm = lufs(mar)
    mar = mar * D.dbg(Lv - 30 - Lm) if np.isfinite(Lm) and Lm > -70 else mar * 0   # cenário sem mar (espaço): nivel_db muito baixo = cama zerada
    soma = voz + mus_duck + sfx + mar
    # ganho mestre ate -14 LUFS, limitador, e re-ajuste fino (iterativo)
    g = D.dbg(ALVO_LUFS - lufs(soma))
    for _ in range(6):
        y = limitar(soma * g, TETO_TP)
        erro = ALVO_LUFS - lufs(y)
        if abs(erro) < 0.05:
            break
        g *= D.dbg(erro)
    mix = limitar(soma * g, TETO_TP)
    os.makedirs(os.path.join(sd, "medidas"), exist_ok=True)
    D.write_wav(os.path.join(sd, "mix.wav"), mix, 24)
    D.write_wav(os.path.join(sd, "medidas", "voz_final.wav"), voz * g, 24)
    D.write_wav(os.path.join(sd, "medidas", "trilha_final.wav"), mus_duck * g, 24)
    print(f"mix: {mix.shape[1]/SR:.2f}s  {lufs(mix):.2f} LUFS  TP {D.true_peak(mix):.2f} dBTP  ganho mestre {20*np.log10(g):.2f} dB")
    print(f"voz {lufs(voz*g):.2f} LUFS | trilha (com duck) {lufs(mus_duck*g):.2f} LUFS | trilha sem duck {lufs(mus*g):.2f}")


if __name__ == "__main__":
    main()
