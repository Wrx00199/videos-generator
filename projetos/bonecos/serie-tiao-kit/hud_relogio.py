#!/usr/bin/env python3
"""hud_relogio.py <marcas.json> <saida.mov> <duracao_s> — HUD de terror: relogio de bordo de latao que avanca a cada degrau.
marcas.json: {"RELOGIO": [[t, minutos_depois_das_3h], ...], "PULSO": [[t, bpm], ...]} (o brilho vermelho pulsa no bpm; sobe com o medo).
Saida: .mov qtrle com alfa, faixa y=110..400 (overlay em y=110)."""
import json, math, subprocess, sys
from PIL import Image, ImageDraw
W, FPS, SS = 1080, 30, 2; Y0, Y1 = 110, 400
M = json.load(open(sys.argv[1])); REL = M['RELOGIO']; PUL = M.get('PULSO', [[0, 60]]); dur = float(sys.argv[3]); N = int(dur * FPS) + 1
def sm(x): x = max(0, min(1, x)); return x * x * (3 - 2 * x)
def minutos(t):
    m = REL[0][1]
    for i in range(1, len(REL)):
        t0, v = REL[i]
        if t >= t0 + 0.35: m = v
        elif t >= t0:
            u = (t - t0) / 0.35; a = REL[i - 1][1]; m = a + (v - a) * (sm(u) + 0.12 * math.sin(u * math.pi * 3) * (1 - u)); break
        else: break
    return m
def bpm(t):
    b = PUL[0][1]
    for t0, v in PUL:
        if t >= t0: b = v
    return b
def frame(t):
    im = Image.new('RGBA', (W * SS, (Y1 - Y0) * SS), (0, 0, 0, 0)); d = ImageDraw.Draw(im, 'RGBA')
    cx, cy, R = W // 2, 140, 110
    ph = (t * bpm(t) / 60.0) % 1.0; beat = max(0, 1 - ph * 3.2) ** 2          # batida: pico logo apos o tempo 0
    for k in range(10, 0, -1): d.ellipse([(cx - R - 14 * k * (0.4 + beat)) * SS, (cy - R - 14 * k * (0.4 + beat)) * SS, (cx + R + 14 * k * (0.4 + beat)) * SS, (cy + R + 14 * k * (0.4 + beat)) * SS], fill=(220, 30, 30, int(7 * (0.3 + beat) * (11 - k) / 10 * 3)))
    d.ellipse([(cx - R + 7) * SS, (cy - R + 11) * SS, (cx + R + 7) * SS, (cy + R + 11) * SS], fill=(0, 0, 0, 130))
    d.ellipse([(cx - R) * SS, (cy - R) * SS, (cx + R) * SS, (cy + R) * SS], fill=(168, 126, 48, 255), outline=(60, 40, 14, 255), width=8)
    d.ellipse([(cx - R + 14) * SS, (cy - R + 14) * SS, (cx + R - 14) * SS, (cy + R - 14) * SS], fill=(236, 226, 196, 255), outline=(90, 62, 24, 255), width=5)
    for i in range(12):
        a = i * math.pi / 6; r0, r1 = R - 24, R - (40 if i % 3 == 0 else 32)
        d.line([(cx + math.sin(a) * r0) * SS, (cy - math.cos(a) * r0) * SS, (cx + math.sin(a) * r1) * SS, (cy - math.cos(a) * r1) * SS], fill=(40, 28, 14, 255), width=(7 if i % 3 == 0 else 4) * SS // 2)
    m = minutos(t); am = (m % 60) * math.pi / 30; ah = (3 + m / 60) * math.pi / 6
    tr = 0.03 * math.sin(t * 40) * min(1, bpm(t) / 120)
    d.line([cx * SS, cy * SS, (cx + math.sin(ah + tr) * 52) * SS, (cy - math.cos(ah + tr) * 52) * SS], fill=(30, 20, 12, 255), width=11 * SS // 2)
    d.line([cx * SS, cy * SS, (cx + math.sin(am + tr) * 78) * SS, (cy - math.cos(am + tr) * 78) * SS], fill=(30, 20, 12, 255), width=7 * SS // 2)
    d.ellipse([(cx - 9) * SS, (cy - 9) * SS, (cx + 9) * SS, (cy + 9) * SS], fill=(190, 40, 40, 255), outline=(40, 20, 12, 255), width=3)
    return im.resize((W, Y1 - Y0), Image.LANCZOS)
ff = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{W}x{Y1 - Y0}', '-r', str(FPS), '-i', '-', '-c:v', 'qtrle', sys.argv[2]], stdin=subprocess.PIPE)
for n in range(N): ff.stdin.write(frame(n / FPS).tobytes())
ff.stdin.close(); ff.wait(); print('ok', N)
