#!/usr/bin/env python3
"""Som da serie Tiao: eventos JSON + secoes de trilha -> music.wav, sfx.wav, mar.wav (48 kHz, estereo, 24 bit).

uso: python3 som_tiao.py eventos.json saida_dir

eventos.json:
 {"duracao": 40.5, "seed": 404,
  "eventos": [{"t": 0.6, "tipo": "paf", "nivel": 0, "pan": 0, "n": 4, "dt": 0.4}, ...],   # nivel em dB (0 = padrao)
  "trilha": {"secoes": [{"nome": "...", "ini": 0, "fim": 6.9, "tipo": "leve|caca|tensao|caixinha|sepia|esparso|retorno"}],
             "paradas": [[28.2, 29.8]],          # silencio TOTAL da musica
             "acorde_final": 39.6},
  "mar": {"nivel_db": 0}}
Tipos de SFX: ver GER (dicionario no fim das funcoes). Trilha 100% sintetizada, melodia original.
"""
import json
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dsp as D
import instruments as I
import sfx_gen as G
from dsp import SR, ns, tt, rng, lp, hp, bp, pan, place, st, fades, phase, colored, shape

# ------------------------------------------------------------------ SFX
def _pk(x, a=0.6):
    return x * a / (np.abs(x).max() + 1e-9)


def _noise(r, n):
    return r.standard_normal(n)


def g_paf(r):
    t = tt(0.35)
    n = _noise(r, len(t))
    return _pk(bp(n, 300, 5000, 1) * np.exp(-t / 0.035) + 1.2 * np.exp(-t / 0.07) * np.sin(phase(140 * (1 + 0.5 * np.exp(-t / 0.02)))))


def g_boing(r):
    t = tt(0.7)
    f = 230 * (1 + 0.7 * np.exp(-t / 0.18) * np.cos(2 * np.pi * 8 * t))
    y = np.sin(phase(f)) + 0.35 * np.sin(2 * phase(f))
    return fades(_pk(y * np.exp(-t / 0.22) * (1 - np.exp(-t / 0.004))), 0.002, 0.05)


def g_rede(r):
    return _pk(G.creak(1.6, r, 40, 65, scale=0.7), 0.4)


def g_whoosh(r):
    return _pk(G.whoosh(0.7, r, peak=0.2, f_lo=300, f_hi=2600, tail=0.25), 0.5)


def g_whoosh_memoria(r):
    return _pk(G.whoosh(1.0, r, peak=0.45, f_lo=200, f_hi=1500, width=1.0, tail=0.3), 0.5)


def _glock_seq(notes, r, vel=0.5, gap=0.09):
    buf = np.zeros((2, ns(1.8 + gap * len(notes))))
    for i, f in enumerate(notes):
        place(buf, I.glock(f, vel, r, 1.4), i * gap)
    return buf


def g_brilho(r):
    return _pk(_glock_seq([1568, 2093, 2637, 3136], r, 0.5, 0.07), 0.35)


def g_brilho_fino(r):
    return _pk(_glock_seq([3136, 3951], r, 0.4, 0.12), 0.3)


def g_remo(r):
    dur = 1.6
    n = ns(dur)
    t = tt(dur)
    y = G.bubbles(dur, r, 25, 300, 1800, (0.01, 0.04)) * 0.8
    y += lp(colored(n, r, 0.8), 900) * 0.5 * (0.5 + 0.5 * np.sin(2 * np.pi * 1.6 * t)) ** 2
    return _pk(fades(y, 0.05, 0.3), 0.4)


def g_bote_areia(r):
    dur = 1.0
    t = tt(dur)
    n = _noise(r, len(t))
    y = lp(n, 1200) * (np.exp(-t / 0.25) * (1 - np.exp(-t / 0.02))) + 1.5 * np.sin(phase(70 * (1 + 0.3 * np.exp(-t / 0.05)))) * np.exp(-t / 0.1)
    y += bp(n, 1500, 5000, 1) * np.clip(t / 0.15, 0, 1) * np.exp(-t / 0.4) * 0.3
    return _pk(fades(y, 0.005, 0.1), 0.5)


def g_pa(r):
    dur = 0.32
    t = tt(dur)
    n = _noise(r, len(t))
    y = bp(n, 500, 3500, 1) * np.clip(t / 0.05, 0, 1) * np.exp(-t / 0.08) * 0.6
    y += np.sin(phase(95 * (1 + 0.4 * np.exp(-t / 0.03)))) * np.exp(-(np.maximum(t - 0.08, 0)) / 0.05) * (t > 0.07)
    return _pk(fades(y, 0.003, 0.05), 0.5)


def g_womp(r):
    a = I.brass(196, 0.28, 0.6, r, "soft")
    b = I.brass(165, 0.7, 0.6, r, "soft", fall=1.8)
    buf = np.zeros((2, ns(1.5)))
    place(buf, a, 0.0)
    place(buf, b, 0.32)
    return _pk(buf, 0.45)


def g_pop(r, f=700, dur=0.12):
    t = tt(dur)
    return _pk(np.sin(phase(f * (1 + 2.0 * (1 - np.exp(-t / 0.012))))) * np.exp(-t / 0.025) * (1 - np.exp(-t / 0.001)), 0.5)


def g_pop_coracao(r):
    buf = np.zeros((2, ns(1.0)))
    place(buf, g_pop(r, 900, 0.14), 0.0)
    place(buf, I.glock(1568, 0.4, r, 0.9), 0.04, 0.5)
    return _pk(buf, 0.4)


def g_nhac(r):
    dur = 0.35
    t = tt(dur)
    n = _noise(r, len(t))
    y = bp(n, 1500, 7000, 1) * np.exp(-t / 0.006) * 1.0
    y += bp(n, 300, 1500, 1) * (t > 0.05) * np.exp(-np.maximum(t - 0.05, 0) / 0.03) * 0.7
    y += G.clink(r, None, 0.1, 0.7)[: len(t)] * 0.0 if False else 0
    return _pk(fades(y, 0.001, 0.05), 0.55)


def g_tremor(r):
    dur = 0.6
    t = tt(dur)
    y = lp(_noise(r, len(t)), 220) * np.exp(-t / 0.25) * (0.6 + 0.4 * np.sin(2 * np.pi * 28 * t))
    return _pk(fades(y, 0.01, 0.1), 0.45)


def g_papel(r):
    dur = 0.4
    n = ns(dur)
    t = tt(dur)
    env = np.exp(-t / 0.12) * (0.4 + 0.6 * np.abs(lp(_noise(r, n), 300)) / (np.abs(lp(_noise(r, n), 300)).max() + 1e-9) * 3)
    y = hp(_noise(r, n), 2500) * np.clip(env, 0, 1) * np.clip(t / 0.01, 0, 1)
    return _pk(fades(y, 0.005, 0.08), 0.35)


def g_tontura(r):
    dur = 1.5
    t = tt(dur)
    f = 700 + 300 * np.sin(2 * np.pi * 3.2 * t) + 150 * t
    y = np.sin(phase(f)) * np.sin(np.pi * t / dur) ** 1.5
    return _pk(fades(y, 0.02, 0.1), 0.3)


def g_passos(r):
    return _pk(G.stroll_step(r, 0.7), 0.5)


def g_tchac(r):
    dur = 0.4
    t = tt(dur)
    n = _noise(r, len(t))
    y = bp(n, 800, 6000, 1) * np.exp(-t / 0.012) * 1.2 + 1.4 * np.sin(phase(110 * (1 + 0.5 * np.exp(-t / 0.02)))) * np.exp(-t / 0.08)
    y += lp(n, 900) * np.exp(-t / 0.15) * 0.4
    return _pk(fades(y, 0.001, 0.08), 0.6)


def g_puxao(r):
    dur = 0.9
    t = tt(dur)
    n = _noise(r, len(t))
    y = bp(n, 400, 3500, 1) * np.clip(t / 0.35, 0, 1) ** 2 * np.exp(-np.maximum(t - 0.4, 0) / 0.18) * 0.8
    y += np.sin(phase(80 * (1 + 0.2 * np.exp(-np.maximum(t - 0.4, 0) / 0.05)))) * (t > 0.4) * np.exp(-np.maximum(t - 0.4, 0) / 0.1)
    return _pk(fades(y, 0.01, 0.15), 0.55)


def g_tim(r):
    buf = np.zeros((2, ns(2.2)))
    place(buf, I.glock(2093, 0.6, r, 1.8), 0.0)
    place(buf, I.glock(3136, 0.35, r, 1.5), 0.0)
    return _pk(buf, 0.4)


def g_rangido(r):
    return _pk(G.creak(1.2, r, 22, 48, scale=0.55, shape_pts=[(0, 0), (0.2, 0.8), (0.6, 1), (1, 0)]), 0.45)


def g_pena(r):
    dur = 1.8
    n = ns(dur)
    t = tt(dur)
    env = np.zeros(n)
    for s in range(7):
        a = r.uniform(0.05, dur - 0.4)
        env += np.exp(-0.5 * ((t - a - 0.12) / 0.07) ** 2) * r.uniform(0.5, 1)
    y = bp(_noise(r, n), 2500, 7000, 1) * np.clip(env, 0, 1)
    return _pk(fades(y, 0.02, 0.1), 0.25)


def g_gaivota(r):
    dur = 1.2
    t = tt(dur)
    y = np.zeros_like(t)
    for t0, f0 in ((0.0, 1900), (0.45, 1700)):
        u = np.clip((t - t0) / 0.35, 0, 1)
        f = f0 * (1 - 0.45 * u ** 0.7) * (1 + 0.04 * np.sin(2 * np.pi * 38 * t))
        a = np.where((t >= t0) & (t < t0 + 0.4), np.sin(np.pi * np.clip((t - t0) / 0.4, 0, 1)) ** 0.8, 0)
        y += a * (np.sin(phase(f)) + 0.4 * np.sin(2 * phase(f)) + 0.15 * np.sin(3 * phase(f)))
    y += 0.05 * bp(_noise(r, len(t)), 1500, 4500, 1) * (np.abs(y) > 0.05)
    return _pk(fades(y, 0.01, 0.1), 0.3)


def g_grilo(r):
    return _pk(G.crickets(1.6, r, 1), 0.2)



def g_boom(r):
    """estrondo de explosao: queda grave + ruido grave + estalo inicial + cauda"""
    t = tt(2.2)
    n = _noise(r, len(t))
    f = 28 + 70 * np.exp(-t / 0.18)
    y = 1.6 * np.sin(phase(f)) * np.exp(-t / 0.6)
    y += lp(n, 380) * np.exp(-t / 0.45) * 1.2
    y += bp(n, 900, 6000, 1) * np.exp(-t / 0.05) * 0.9
    y += lp(_noise(r, len(t)), 140) * np.exp(-t / 1.0) * 0.5
    return _pk(fades(y, 0.001, 0.4), 0.85)


def g_zumbido(r):
    t = tt(2.5)
    y = np.sin(phase(np.full(len(t), 3100.0))) * 0.25 + np.sin(phase(np.full(len(t), 3140.0))) * 0.2
    return _pk(fades(y * np.exp(-t / 1.1), 0.05, 0.6), 0.25)


def g_tique(r):
    """tique-taque: dois clicks secos de relogio (tic grave, tac mais agudo)"""
    t = tt(0.3)
    n = _noise(r, len(t))
    tic = bp(n, 2200, 6500, 1) * np.exp(-t / 0.006) + 0.7 * np.sin(phase(np.full(len(t), 1450.0))) * np.exp(-t / 0.012)
    return _pk(fades(tic, 0.0005, 0.02), 0.5)


def g_chiado_s(r):
    """chiado de gas que cresce (5 s)"""
    t = tt(5.0)
    n = _noise(r, len(t))
    env = (t / 5.0) ** 2.2 * (0.9 + 0.1 * np.sin(2 * np.pi * 7 * t))
    return _pk(hp(n, 2500) * env * 0.6 + bp(n, 900, 2500, 1) * env * 0.4, 0.5)


def g_chiado_f(r):
    """chiado firme (4 s, entrada e saida suaves)"""
    t = tt(4.0)
    n = _noise(r, len(t))
    env = (0.85 + 0.15 * np.sin(2 * np.pi * 5 * t))
    return _pk(fades(hp(n, 2500) * env * 0.6 + bp(n, 900, 2500, 1) * env * 0.4, 0.15, 0.15), 0.5)


def g_batida(r):
    """batida na porta de madeira"""
    t = tt(0.5)
    n = _noise(r, len(t))
    y = np.sin(phase(150 * (1 + 0.3 * np.exp(-t / 0.03)))) * np.exp(-t / 0.07) * 1.3
    y += bp(n, 400, 2500, 1) * np.exp(-t / 0.02) * 0.9 + lp(n, 300) * np.exp(-t / 0.1) * 0.4
    return _pk(fades(y, 0.0008, 0.05), 0.7)


def g_estalo(r):
    """estalo de fogo/gas acendendo"""
    t = tt(0.4)
    n = _noise(r, len(t))
    return _pk(fades(hp(n, 1200) * np.exp(-t / 0.03) + lp(n, 500) * np.exp(-t / 0.12) * 0.5, 0.001, 0.05), 0.5)


GER = {"boom": g_boom, "zumbido": g_zumbido, "tique": g_tique, "chiado_s": g_chiado_s, "chiado_f": g_chiado_f, "batida": g_batida, "estalo": g_estalo, "paf": g_paf, "boing": g_boing, "rede": g_rede, "whoosh": g_whoosh, "whoosh_memoria": g_whoosh_memoria,
       "brilho": g_brilho, "brilho_fino": g_brilho_fino, "remo": g_remo, "bote_areia": g_bote_areia, "pa": g_pa,
       "womp": g_womp, "pop": g_pop, "pop_coracao": g_pop_coracao, "nhac": g_nhac, "tremor": g_tremor,
       "papel": g_papel, "tontura": g_tontura, "passos": g_passos, "tchac": g_tchac, "puxao": g_puxao,
       "tim": g_tim, "rangido": g_rangido, "pena": g_pena, "gaivota": g_gaivota, "grilo": g_grilo}


def gerar_sfx(ev, dur, seed):
    buf = np.zeros((2, ns(dur)))
    for i, e in enumerate(ev):
        tipo = e["tipo"]
        if tipo not in GER:
            raise SystemExit(f"tipo de SFX desconhecido: {tipo}")
        g = D.dbg(e.get("nivel", 0.0))
        n_rep, dt = int(e.get("n", 1)), float(e.get("dt", 0.4))
        for k in range(n_rep):
            r = rng(seed * 1000 + i * 31 + k)
            x = GER[tipo](r)
            if "dur" in e:  # corta o SFX no instante pedido (silencio total depois)
                x = fades(x[..., : ns(float(e["dur"]))], 0.0, 0.03)
            p = float(e.get("pan", 0.0)) + (r.uniform(-0.08, 0.08) if n_rep > 1 else 0)
            x = pan(x, p) if x.ndim == 1 else x
            place(buf, x, e["t"] + k * dt, g * (1.0 - 0.06 * k * (n_rep > 1) * r.uniform(0, 1)))
    return buf


# ------------------------------------------------------------------ mar (cama continua)
def gerar_mar(dur, seed):
    r = rng(seed + 7)
    n = ns(dur)
    t = tt(dur)
    out = np.zeros((2, n))
    for ch in range(2):
        base = bp(colored(n, r, 1.0), 90, 1600, 1)
        sw = 0.5 + 0.5 * np.sin(2 * np.pi * (t / 7.3) + ch * 0.9 + 0.3)
        out[ch] = base * (0.35 + 0.65 * sw ** 1.5)
        out[ch] += hp(colored(n, r, 0.3), 3500) * 0.05 * sw ** 3  # espuma
    return fades(out, 0.4, 0.4)


# ------------------------------------------------------------------ trilha
def m2f(m):
    return I.m2f(m)


CHORDS = {"D": (50, 57, 62, 66, 69), "G": (43, 55, 59, 62, 67), "A": (45, 57, 61, 64, 69), "Bm": (47, 54, 59, 62, 66)}
PROG_A = ["D", "G", "A", "D"]
PROG_B = ["Bm", "G", "A", "D"]
# melodia original (D maior): (batida, duracao em batidas, MIDI)
FRASE_A = [(0, 1, 78), (1, .5, 81), (1.5, .5, 79), (2, 1, 78), (3, 1, 76),
           (4, 1, 74), (5, .5, 76), (5.5, .5, 78), (6, 2, 79),
           (8, 1.5, 81), (9.5, .5, 79), (10, 1, 78), (11, 1, 76),
           (12, 3, 74)]
FRASE_B = [(0, 1, 74), (1, .5, 76), (1.5, .5, 78), (2, 1, 81), (3, 1, 78),
           (4, 1, 79), (5, 1, 76), (6, 2, 74),
           (8, 1, 76), (9, .5, 78), (9.5, .5, 79), (10, 1, 81), (11, 1, 83),
           (12, 3, 81)]
CAIXA = [74, 78, 81, 78, 76, 79, 83, 79, 74, 78, 81, 86, 85, 81, 78, 74]


class Faixa:
    def __init__(self, dur, bpm, seed):
        self.buf = np.zeros((2, ns(dur)))
        self.dur, self.bt = dur, 60.0 / bpm
        self.r = rng(seed)

    def put(self, x, t, p=0.0, g=1.0, lim=None):
        if lim is not None:
            x = x[..., : ns(max(lim - t, 0))]
        place(self.buf, pan(x, p) if x.ndim == 1 else x, t, g)

    def bar_chord(self, t):
        return None


def _prog(i):
    return (PROG_A if (i // 4) % 2 == 0 else PROG_B)[i % 4]


def sec_ritmo(F, ini, fim, vel, tuba, brush_all, mel, perc):
    """oompah leve: baixo na 1/3, acorde na 2/4; melodia em frase A/B"""
    bt, r = F.bt, F.r
    nb = int((fim - ini) / bt)
    for b in range(nb):
        t = ini + b * bt
        bar = b // 4
        ch = CHORDS[_prog(bar)]
        beat = b % 4
        if beat in (0, 2):
            f = m2f(ch[0] if beat == 0 else ch[1] - 12 + 12)
            if tuba:
                F.put(I.brass(m2f(ch[0] - 12) if beat == 0 else m2f(ch[1] - 12), bt * 0.8, vel * 0.9, r, "tuba"), t, -0.2, 0.9, fim)
            F.put(I.pluck(m2f(ch[0] if beat == 0 else ch[1]), vel * 0.9, r, 0.6, 0.4), t, -0.3, 0.8, fim)
        else:
            for m in ch[2:4]:
                F.put(I.pluck(m2f(m), vel * 0.55, r, 0.45, 0.6), t + r.normal(0, 0.003), 0.25, 0.6, fim)
        if brush_all or beat in (1, 3):
            F.put(I.brush(vel * 0.45, r, 0.3, beat % 2 == 1), t, 0.35, 0.8, fim)
        if perc and beat == 0 and bar % 2 == 0:
            F.put(I.timpani(m2f(ch[0] - 12), vel * 0.5, r, 1.4), t, 0, 0.6, fim)
    if mel:
        ph = 0
        t0 = ini
        while t0 + 12 * bt < fim + 8 * bt:
            notes = FRASE_A if (ph % 2 == 0) else FRASE_B
            for (b0, d, m) in notes:
                t = t0 + b0 * bt
                if ini <= t < fim - 0.05:
                    F.put(I.fife(m2f(m), d * bt * 0.9, vel * 0.85, r), t, 0.15, 0.85, fim)
                    if mel == 2:
                        F.put(I.glock(m2f(m + 12), vel * 0.35, r, 0.8), t + 0.5 * bt * (b0 % 1 == 0), -0.3, 0.5, fim)
            t0 += 16 * bt
            ph += 1


def sec_tensao(F, ini, fim):
    r, bt = F.r, F.bt
    dur = fim - ini
    for f_, vel in ((m2f(38), 0.5), (m2f(45), 0.35), (m2f(39), 0.3)):
        F.put(I.pad([f_], dur, vel, r, att=1.2, rel=0.2, warm=500), ini, 0, 0.9, fim)
    for tm, v in I.snare_roll(ini, fim, 0.12, 0.85, r, 24):
        F.put(I.snare(v, r, 0.2, 1.1, 1.0, True), tm, 0.1, 0.55, fim)
    t = ini
    while t < fim:
        u = (t - ini) / dur
        F.put(I.timpani(m2f(38), 0.25 + 0.5 * u, r, 0.8), t, 0, 0.8, fim)
        t += max(0.9 - 0.45 * u, 0.4)


def sec_caixinha(F, ini, fim):
    r = F.r
    st_ = 0.5
    i = 0
    t = ini
    while t < fim + 0.2:
        F.put(I.musicbox(m2f(CAIXA[i % len(CAIXA)]), 0.55, r, 1.6), t, 0.1 * ((-1) ** i), 1.0)
        i += 1
        t += st_
    F.put(I.pad([m2f(50), m2f(57), m2f(66)], fim - ini, 0.22, r, att=0.9, rel=0.8, warm=700), ini, 0, 0.8)


def sec_sepia(F, ini, fim):
    r = F.r
    dur = fim - ini
    for ch in (("Bm",),):
        F.put(I.pad([m2f(47), m2f(54), m2f(62), m2f(66)], dur, 0.3, r, att=0.8, rel=0.8, warm=600, trem=lambda t: 0.85 + 0.15 * np.sin(2 * np.pi * 0.4 * t)), ini, 0, 1.0, fim + 0.4)
    for i, (dt_, m) in enumerate(((0.6, 74), (1.5, 71), (2.1, 66))):
        if ini + dt_ < fim:
            F.put(I.vibes(m2f(m), 0.35, r, 1.4), ini + dt_, 0.2, 0.6, fim)


def sec_esparso(F, ini, fim, vel=0.5):
    r, bt = F.r, F.bt
    t = ini
    k = 0
    for m in (50, 45, 50):
        F.put(I.pluck(m2f(m), vel * 0.8, r, 0.5, 0.4), t, -0.2, 0.7, fim)
        t += bt * (1 if k < 1 else 2)
        k += 1
    F.put(I.fife(m2f(74), bt, 0.4, r), ini + 0.2, 0.2, 0.4, fim)


def acorde_final(F, t0):
    r = F.r
    for m in (38, 50, 57, 62, 66, 69):
        pass
    F.put(I.pad([m2f(50), m2f(57), m2f(62), m2f(66), m2f(69)], 0.5, 0.55, r, att=0.03, rel=0.5, warm=1500), t0, 0, 1.0)
    F.put(I.brass(m2f(38), 0.6, 0.6, r, "tuba"), t0, -0.1, 0.8)
    F.put(I.glock(m2f(86), 0.55, r, 1.4), t0, 0.2, 0.6)
    F.put(I.pluck(m2f(62), 0.6, r, 0.9, 0.5), t0, -0.2, 0.6)


def gerar_trilha(cfg, dur, seed):
    bpm = cfg.get("bpm", 120)
    F = Faixa(dur + 1.0, bpm, seed)
    for s in cfg["secoes"]:
        ini, fim, tp = s["ini"], s["fim"], s["tipo"]
        if tp == "leve":
            sec_ritmo(F, ini, fim, 0.38, False, False, 1 if ini > 0 else 0, False)
        elif tp == "caca":
            sec_ritmo(F, ini, fim, 0.62, True, True, 2, True)
        elif tp == "tensao":
            sec_tensao(F, ini, fim)
        elif tp == "caixinha":
            sec_caixinha(F, ini, fim)
        elif tp == "sepia":
            sec_sepia(F, ini, fim)
        elif tp == "esparso":
            sec_esparso(F, ini, fim)
        elif tp == "retorno":
            sec_ritmo(F, ini, fim, 0.36, False, False, 1, False)
        else:
            raise SystemExit(f"secao desconhecida: {tp}")
    if "acorde_final" in cfg:
        acorde_final(F, cfg["acorde_final"])
    x = F.buf[:, : ns(dur)]
    # reverb curto (15% molhado)
    ir = D.make_ir(0.9, seed + 3)
    wet = D.convolve_st(x, ir)[:, : x.shape[1]]
    wet = wet * (np.abs(x).max() / (np.abs(wet).max() + 1e-9)) * 0.25
    x = x + wet
    # silencios totais (paradas) e rebaixes suaves
    g = np.ones(x.shape[1])
    n = x.shape[1]
    for a, b in cfg.get("paradas", []):
        ia, ib = ns(a), ns(b)
        g[max(ia - ns(0.006), 0):ia] = np.linspace(1, 0, ia - max(ia - ns(0.006), 0))
        g[ia:ib] = 0.0
    for a, b, db in cfg.get("rebaixes", []):  # [ini, fim, dB]: queda suave (ex.: silencio comico)
        ia, ib = ns(a), ns(b)
        c = np.ones(n)
        c[ia:ib] = D.dbg(db)
        k = ns(0.12)
        c = np.convolve(c, np.ones(k) / k, mode="same")
        g *= c
    x = x * g[None, :]
    return fades(x, 0.01, 0.06)


def main():
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    cfg = json.load(open(sys.argv[1]))
    out = sys.argv[2]
    os.makedirs(out, exist_ok=True)
    dur = cfg.get("duracao", 40.5)
    seed = cfg.get("seed", 1)
    sfx = gerar_sfx(cfg["eventos"], dur, seed)
    mar = gerar_mar(dur, seed) * D.dbg(cfg.get("mar", {}).get("nivel_db", 0))
    mus = gerar_trilha(cfg["trilha"], dur, seed)
    for nome, x in (("sfx.wav", sfx), ("mar.wav", mar), ("music.wav", mus)):
        pk = np.abs(x).max()
        if pk > 0.98:
            x = x * 0.98 / pk  # so evita clip do stem; niveis relativos sao ajustados no mix
        D.write_wav(os.path.join(out, nome), x, 24)
        print(nome, x.shape[1] / SR, "s", f"pico {20*np.log10(np.abs(x).max()+1e-12):.1f} dBFS")


if __name__ == "__main__":
    main()
