#!/usr/bin/env python3
"""hud_sol.py <marcas.json> <saida.mov> <duracao_s> — HUD tematico maia (ep. 37): placa de pedra com o sol descendo num arco entalhado
e contador de pedrinhas. marcas.json = {"SOL": [[t, hora, pedrinhas, sol(0..1)], ...]}; sol e interpolado, pedrinhas e degrau seco.
Sai .mov qtrle com alfa (1080x1920, so a faixa y=105..300 desenhada) para `overlay` no ffmpeg (montar_final.sh <proj> hud_sol.mov 0)."""
import json, math, subprocess, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS, SS = 1080, 1920, 30, 2
BANDA = (105, 310)
M = json.load(open(sys.argv[1]))['SOL']; dur = float(sys.argv[3]); N = int(dur * FPS) + 1
FONTE = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def fnt(s): return ImageFont.truetype(FONTE, int(s * SS))
def sm(x): x = max(0, min(1, x)); return x * x * x * (x * (x * 6 - 15) + 10)

def estado(t):
    sol = M[0][3]; ped = M[0][2]
    for i, m in enumerate(M):
        if t >= m[0]: ped = m[2]; sol = m[3]
        if i + 1 < len(M) and m[0] <= t < M[i + 1][0]:
            sol = m[3] + (M[i + 1][3] - m[3]) * sm((t - m[0]) / max(0.01, M[i + 1][0] - m[0]))
    return sol, ped

def pedra(d, box, r=18):
    x0, x1 = box[0] * SS, box[2] * SS; y0, y1 = (box[1] - BANDA[0]) * SS, (box[3] - BANDA[0]) * SS
    d.rounded_rectangle([x0 + 6, y0 + 10, x1 + 6, y1 + 10], r * SS, fill=(0, 0, 0, 110))
    d.rounded_rectangle([x0, y0, x1, y1], r * SS, fill=(138, 119, 92, 255), outline=(36, 23, 38, 255), width=5 * SS // 2 * 2 // 2)
    d.rounded_rectangle([x0 + 8 * SS, y0 + 8 * SS, x1 - 8 * SS, y1 - 8 * SS], (r - 6) * SS, outline=(98, 82, 62, 255), width=2 * SS)
    for k in range(7):
        xx = x0 + (k * 97 % 600) / 600 * (x1 - x0); yy = y0 + ((k * 53 + 20) % 100) / 100 * (y1 - y0)
        d.ellipse([xx - 3 * SS, yy - 2 * SS, xx + 3 * SS, yy + 2 * SS], fill=(112, 96, 72, 255))

def frame(t):
    sol, ped = estado(t)
    im = Image.new('RGBA', (W * SS, (BANDA[1] - BANDA[0]) * SS), (0, 0, 0, 0)); d = ImageDraw.Draw(im, 'RGBA')
    oy = BANDA[0]; Y = lambda y: (y - oy) * SS
    pedra(d, (150, 125, 930, 295))
    # ceu do arco: janela com gradiente que escurece quando o sol desce
    ax0, ax1, ay0, ay1 = 175, 545, 148, 268
    for k in range(ay1 - ay0):
        q = k / (ay1 - ay0); a = (1 - sol) * 0.8
        r = int(112 + (250 - 112) * q * 0.6); g = int(190 - 100 * (q + a)); b = int(235 - 190 * (q + a))
        d.rectangle([ax0 * SS, Y(ay0 + k), ax1 * SS, Y(ay0 + k + 1)], fill=(max(40, r), max(40, g), max(60, b), 255))
    # arco entalhado e sol
    cx, cy, R = (ax0 + ax1) / 2, ay1 - 8, 150
    for k in range(0, 21):
        ang = math.pi * (0.1 + 0.8 * k / 20); px, py = cx - math.cos(ang) * R, cy - math.sin(ang) * R * 0.78
        d.ellipse([(px - 3) * SS, Y(py) - 3 * SS, (px + 3) * SS, Y(py) + 3 * SS], fill=(255, 255, 255, 170))
    ang = math.pi * (0.1 + 0.8 * (1 - sol)) if False else math.pi * (0.1 + 0.8 * sol * 0 + 0)  # placeholder (nao usado)
    # posicao: sol=0.95 no alto (meio do arco), sol -> 0 desce ate o horizonte da direita
    u = 1 - sol; ang = math.pi * (0.5 - 0.42 * u); sx = cx + math.cos(ang) * R; sy = cy - math.sin(ang) * R * 0.78
    g = Image.new('RGBA', (160 * SS, 160 * SS), (0, 0, 0, 0)); gd = ImageDraw.Draw(g)
    for k in range(80, 0, -3): gd.ellipse([(80 - k) * SS, (80 - k) * SS, (80 + k) * SS, (80 + k) * SS], fill=(255, 190, 60, int(110 * (1 - k / 80) ** 2)))
    im.alpha_composite(g.filter(ImageFilter.GaussianBlur(2 * SS)), (int((sx - 80) * SS), int(Y(sy) - 80 * SS)))
    d.ellipse([(sx - 24) * SS, Y(sy) - 24 * SS, (sx + 24) * SS, Y(sy) + 24 * SS], fill=(255, 214, 70, 255), outline=(36, 23, 38, 255), width=4 * SS)
    for k in range(10):
        a2 = k * math.pi / 5 + t * 0.6; d.line([(sx + math.cos(a2) * 29) * SS, Y(sy + math.sin(a2) * 29), (sx + math.cos(a2) * 40) * SS, Y(sy + math.sin(a2) * 40)], fill=(255, 214, 70, 255), width=4 * SS // 2)
    # horizonte (chao da janela)
    d.rectangle([ax0 * SS, Y(ay1 - 8), ax1 * SS, Y(ay1)], fill=(120, 84, 48, 255))
    d.rectangle([ax0 * SS, Y(ay0), ax1 * SS, Y(ay1)], outline=(36, 23, 38, 255), width=4 * SS)
    d.text((350 * SS, Y(138)), 'POR DO SOL', font=fnt(15), fill=(255, 244, 214, 255), anchor='mm', stroke_width=3, stroke_fill=(36, 23, 38, 255)) if False else None
    # contador de pedrinhas: pedra entalhada + numero
    d.text((735 * SS, Y(155)), 'PEDRINHAS', font=fnt(30), fill=(60, 44, 30, 255), anchor='mm')
    tc = min([m[0] for m in M if m[2] == ped] or [0]); esc = 1.0 + 0.22 * max(0, min(1, 1 - (t - tc) / 0.35))
    f = fnt(98 * esc); txt = str(ped)
    d.text((735 * SS, Y(222)), txt, font=f, fill=(255, 244, 214, 255), anchor='mm', stroke_width=5 * SS // 2, stroke_fill=(36, 23, 38, 255))
    return im.resize((W, BANDA[1] - BANDA[0]), Image.LANCZOS)

ff = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{W}x{BANDA[1] - BANDA[0]}', '-r', str(FPS), '-i', '-', '-c:v', 'qtrle', sys.argv[2]], stdin=subprocess.PIPE)
for n in range(N): ff.stdin.write(frame(n / FPS).tobytes())
ff.stdin.close(); ff.wait(); print('ok', N, 'quadros')
