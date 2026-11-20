#!/usr/bin/env python3
"""Trilha SFX sintetizada (numpy + ffmpeg) - 50,1 s, 44,1 kHz mono."""
import subprocess, os, tempfile, wave
import numpy as np

SR = 44100
DUR = 50.1
N = int(round(DUR * SR))
OUT = "/media/wr/HDD/Estudio de video/projetos/bonecos/2026-11-15-bonecos-papagaio-02/anim/assets/sfx_mix.mp3"
rng = np.random.default_rng(7)
mix = np.zeros(N)

def T(d): return np.arange(int(d * SR)) / SR
def env(n, a=0.005, r=0.05):
    e = np.ones(n); na, nr = max(1, int(a*SR)), max(1, int(r*SR))
    na, nr = min(na, n), min(nr, n)
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr)
    return e
def expenv(d, k): return np.exp(-k * T(d))
def noise(d): return rng.standard_normal(int(d * SR))
def fft_filter(x, lo=None, hi=None):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1/SR)
    m = np.ones_like(f)
    if lo: m *= 1/(1+(lo/np.maximum(f, 1e-3))**4)
    if hi: m *= 1/(1+(f/hi)**4)
    return np.fft.irfft(X*m, len(x))
def lp(x, hi): return fft_filter(x, None, hi)
def bp(x, lo, hi): return fft_filter(x, lo, hi)
def add(t, s, g=1.0):
    i = int(t * SR)
    if i >= N: return
    s = s[:N - i]; mix[i:i+len(s)] += s * g
def sweep(d, f0, f1, vib=0, vibf=0):
    t = T(d); f = f0 + (f1 - f0) * t / d
    if vib: f = f * (1 + vib * np.sin(2*np.pi*vibf*t))
    return np.sin(2*np.pi*np.cumsum(f)/SR)

# ---- blocos ----
def rumble():
    d = 0.4; x = lp(noise(d), 120)*4 + sweep(d, 55, 40)*0.8
    x *= np.sin(np.pi*T(d)/d)**2; return x*0.5
def boing():
    d = 0.5; t = T(d); f = 300 + 250*np.sin(2*np.pi*14*t)*np.exp(-5*t) + 100*np.exp(-4*t)
    x = np.sin(2*np.pi*np.cumsum(f)/SR) * np.exp(-5*t) * env(len(t), .003, .05); return x*0.5
def thump(d=0.15, f0=120, f1=45, g=1.0, damp=25):
    t = T(d); return sweep(d, f0, f1) * np.exp(-damp*t) * env(len(t), .002, .02) * g
def pop():
    d = 0.12; t = T(d); return sweep(d, 500, 1200) * np.exp(-35*t) * env(len(t), .001, .01) * 0.6
def puff(d=0.25, g=0.5):
    x = lp(noise(d), 2500) * np.exp(-14*T(d)) * env(int(d*SR), .003, .03)
    x = x*g; th = thump(0.1, 160, 70, 0.3); x[:len(th)] += th
    return x
def whoosh(d, f0=500, f1=2500, g=0.5, peak=0.5):
    n = int(d*SR); x = noise(d)
    # banda varrendo via mistura de blocos filtrados
    out = np.zeros(n); k = 8
    cents = np.geomspace(f0, f1, k)
    pos = np.linspace(0, 1, n)
    for i, c in enumerate(cents):
        b = bp(x, c*0.6, c*1.5)
        w = np.exp(-((pos - i/(k-1))**2)/(2*0.12**2))
        out += b*w
    sh = np.sin(np.pi*np.clip(pos/ (peak*2) if False else pos, 0, 1))**1.5
    return out * sh * g * 2
def creak(d, f0=300, f1=500, g=0.35, rough=60):
    t = T(d); f = f0 + (f1-f0)*t/d + 25*np.sin(2*np.pi*7*t) + 30*rng.standard_normal(1)
    ph = 2*np.pi*np.cumsum(f)/SR
    x = np.sign(np.sin(ph)) * 0.4 + np.sin(ph*2)*0.3 + np.sin(ph)*0.3
    x *= (0.6 + 0.4*np.sign(np.sin(2*np.pi*rough*t))) * (0.7+0.3*np.sin(2*np.pi*9*t))
    x = bp(x, 200, 1800)
    return x * env(len(t), .03, .08) * g
def step(g=0.5, f=180, d=0.09):
    n = int(d*SR); t = T(d)
    return (lp(noise(d), 1400)*0.7 + sweep(d, f, f*0.5)*0.6) * np.exp(-40*t) * env(n, .001, .01) * g
def wood_hit(g=0.6, f=220):
    d = 0.2; t = T(d)
    x = sum(np.sin(2*np.pi*f*r*t)*a for r, a in [(1, 1), (1.6, .5), (2.3, .3)]) * np.exp(-28*t)
    return (x + lp(noise(d), 3000)*np.exp(-80*t)*0.5) * env(len(t), .001, .02) * g
def rustle(d, g=0.3):
    n = int(d*SR); x = bp(noise(d), 1500, 6000)
    am = np.abs(lp(noise(d), 25)); am /= am.max()+1e-9
    return x * am**1.5 * env(n, .02, .08) * g * 2
def apple(g=0.35):
    d = 0.1; t = T(d); return (sweep(d, 260, 160)*np.exp(-45*t) + lp(noise(d), 2000)*np.exp(-90*t)*.3) * env(len(t), .001, .01) * g
def bubbles(d, g=0.2):
    out = np.zeros(int(d*SR)); t0 = 0.0
    while t0 < d - 0.1:
        bd = rng.uniform(0.03, 0.07); f = rng.uniform(300, 900); tt = T(bd)
        b = sweep(bd, f, f*1.6) * np.exp(-40*tt) * env(len(tt), .002, .01) * rng.uniform(.3, 1)
        i = int(t0*SR); out[i:i+len(b)] += b[:len(out)-i]
        t0 += rng.exponential(0.09)
    out += lp(noise(d), 300) * 0.15
    return out * g * env(len(out), .3, .3)
def clink(g=0.3):
    d = 0.5; t = T(d)
    x = sum(np.sin(2*np.pi*f*t)*a*np.exp(-k*t) for f, a, k in [(2400, 1, 9), (3700, .5, 13), (5300, .3, 18)])
    return x * env(len(t), .001, .05) * g
def waves(d, g=0.3):
    n = int(d*SR); x = bp(noise(d), 150, 3000); pos = np.arange(n)/SR
    am = 0.5 + 0.5*np.sin(2*np.pi*pos/5.7 - 1.5)
    return x * (0.15 + 0.85*am**2) * env(n, 1.0, 1.0) * g * 1.8
def gull(g=0.2):
    d = 0.7; t = T(d)
    f = 1500 + 700*np.sin(np.pi*np.clip(t/0.6, 0, 1)) * 1 - 500*(t/d)**2
    f = f*(1+0.04*np.sin(2*np.pi*35*t))
    ph = 2*np.pi*np.cumsum(f)/SR
    x = np.sin(ph) + 0.4*np.sin(2*ph) + 0.2*np.sin(3*ph)
    am = (0.6+0.4*np.sin(2*np.pi*11*t))
    return lp(x*am, 6000) * np.sin(np.pi*t/d)**1.2 * g
def sigh(d=0.9, g=0.3):
    n = int(d*SR); x = bp(noise(d), 500, 3500)
    return x * np.sin(np.pi*T(d)/d)**2 * g * 2
NOTES = {'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880, 'B5': 987.77, 'C6': 1046.5, 'E6': 1318.5}
def whistle(seq, total, g=0.5):
    n = int(total*SR); out = np.zeros(n); t0 = 0.0
    for name, dur in seq:
        f0 = NOTES[name]; nd = int(dur*SR); t = np.arange(nd)/SR
        f = f0*(1 + 0.012*np.sin(2*np.pi*6.5*t)*np.minimum(1, t/0.08))
        f = f * (1 + 0.04*np.exp(-t*30))  # ataque deslizando
        ph = 2*np.pi*np.cumsum(f)/SR
        x = np.sin(ph) + 0.06*np.sin(2*ph)
        x += 0.02*lp(noise(dur), 6000)  # sopro leve
        a = env(nd, .03, .04)
        i = int(t0*SR); out[i:i+nd] += (x*a)[:n-i]; t0 += dur
    return out*g
def crunch(g=0.5):
    d = 0.22; n = int(d*SR)
    out = np.zeros(n)
    for _ in range(9):
        i = int(rng.uniform(0, 0.15)*SR); cd = int(rng.uniform(.004, .012)*SR)
        c = rng.standard_normal(cd)*np.exp(-np.arange(cd)/(cd*0.3))
        out[i:i+cd] += c[:n-i]*rng.uniform(.4, 1)
    out = bp(out, 1500, 7000)
    return out*env(n, .001, .05)*g*1.5
def flaps(d, rate=14, g=0.35):
    n = int(d*SR); x = np.zeros(n); t = np.arange(n)/SR
    for k in range(int(d*rate)):
        i = int(k/rate*SR); fd = int(0.05*SR)
        b = bp(rng.standard_normal(fd), 300, 2500)*np.exp(-np.arange(fd)/(fd*0.35))
        x[i:i+fd] += b[:n-i]
    return x*g*3*env(n, .01, .05)
def slurp(g=0.35):
    d = 0.5; t = T(d); n = len(t)
    x = bp(noise(d), 800, 3500)*(0.5+0.5*np.sin(2*np.pi*18*t)) + sweep(d, 500, 1100)*0.2
    return x*np.sin(np.pi*t/d)**1.3*g*2
def squawk(g=0.45):
    d = 0.3; t = T(d); f = 900 - 500*t/d + 120*np.sin(2*np.pi*40*t)
    ph = 2*np.pi*np.cumsum(f)/SR
    x = np.sign(np.sin(ph))*0.3 + np.sin(ph) + np.sin(2*ph)*0.4
    return bp(x, 400, 4000)*env(len(t), .01, .08)*g

# ---- timeline ----
add(0.1, rumble(), 1); add(0.6, rumble(), 0.9)
add(2.3, boing()); add(2.3, thump(0.2, 140, 50, 0.9))
add(3.6, pop()); add(5.5, puff())
for ts in [7.0, 7.4, 7.8, 8.2, 8.5, 8.9, 9.3, 9.7]:
    add(ts, whoosh(0.35, 600, 3000, 0.35))
    add(ts+0.6, wood_hit(0.5, rng.choice([160, 200, 260])) if rng.random() < .5 else thump(0.2, 150, 70, 0.8, 18))
add(8.0, whoosh(1.4, 400, 1800, 0.3))
add(10.2, creak(0.7, 280, 520, 0.4))
add(11.3, creak(1.0, 700, 1100, 0.25, 40))
add(13.1, thump(0.3, 150, 50, 0.9, 12)); add(13.1, lp(noise(0.25), 800)*np.exp(-10*T(0.25))*0.4)
for k, ts in enumerate([13.4, 13.7, 13.95, 14.15, 14.3, 14.4]): add(ts, apple(0.4 - 0.03*k))
for f, ts in [(784, 14.8), (587, 15.05)]:
    t = T(0.3); add(ts, (np.sin(2*np.pi*f*t)+0.2*np.sin(4*np.pi*f*t))*np.exp(-9*t)*env(len(t), .003, .05)*0.35)
for ts in np.arange(16.0, 16.8, 0.2): add(ts, step(0.55, 200))
for ts in np.arange(17.6, 18.9, 0.2): add(ts, step(0.55, 190))
add(19.3, rustle(0.5)); add(20.0, rustle(0.6))
add(21.2, creak(1.8, 500, 900, 0.22, 45))
for ts in np.arange(21.6, 23.0, 0.35): add(ts, step(0.35, 210))
add(24.0, bubbles(4.0, 0.7))
for ts in [25.0, 26.2, 27.4]: add(ts, clink(0.35))
add(28.0, waves(5.7, 0.8))
add(29.0, gull(0.25)); add(30.5, gull(0.2))
add(32.1, sigh())
add(34.9, whistle([('E5', .18), ('G5', .18), ('C6', .2), ('B5', .15), ('A5', .15), ('G5', .15), ('E6', .35)], 1.5, 0.35))
for ts in [37.0, 37.3, 37.65, 37.95]: add(ts, step(0.18, 230, 0.07))
add(38.4, whistle([('E5', .18), ('G5', .18), ('C6', .2), ('B5', .15), ('A5', .15), ('G5', .15), ('E6', .4)], 1.6, 0.6))
for ts in [42.3, 42.65, 43.0, 43.4]: add(ts, crunch(0.5))
add(44.5, flaps(0.9, 16))
for ts in [46.3, 47.3, 48.3]: add(ts, slurp())
add(49.1, squawk()); add(49.15, flaps(0.9, 15, 0.3))

# ---- finalização ----
mix = lp(mix, 12000)
mix[:int(.005*SR)] *= np.linspace(0, 1, int(.005*SR)); mix[-int(.05*SR):] *= np.linspace(1, 0, int(.05*SR))
mix *= 10**(-5.5/20) / np.max(np.abs(mix))
pcm = (mix*32767).astype('<i2')
tmp = tempfile.mkdtemp(); wp = os.path.join(tmp, "m.wav")
with wave.open(wp, 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
os.makedirs(os.path.dirname(OUT), exist_ok=True)
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wp, "-af", f"apad=whole_dur={DUR}",
                "-t", str(DUR), "-ar", str(SR), "-ac", "1", "-c:a", "libmp3lame", "-b:a", "128k", OUT], check=True)
print("ok", OUT)
