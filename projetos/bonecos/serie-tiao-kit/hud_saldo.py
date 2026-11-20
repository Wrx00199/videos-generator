#!/usr/bin/env python3
"""hud_saldo.py <marcas.json> <saida.mov> <duracao_s> — HUD tematico de dinheiro (serie A): cartao de banco verde com moeda e SALDO que rola.
marcas.json: {"SAL": [[t, valor], ...]} (valor em reais; rola em 0,7 s de cada marca ate a seguinte; <=1 real fica vermelho/piscando).
Saida: .mov qtrle com alfa, faixa y=110..380 de 1080x1920 (overlay em y=110)."""
import json, math, subprocess, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W, FPS, SS = 1080, 30, 2; Y0, Y1 = 110, 450
SAL = json.load(open(sys.argv[1]))['SAL']; dur = float(sys.argv[3]); N = int(dur * FPS) + 1
F = lambda s: ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', s * SS)
def sm(x): x = max(0, min(1, x)); return x * x * x * (x * (x * 6 - 15) + 10)
def valor(t):
    v = SAL[0][1]
    for i in range(1, len(SAL)):
        t0, v1 = SAL[i]
        if t >= t0 + 0.7: v = v1
        elif t >= t0:
            u = sm((t - t0) / 0.7); a = SAL[i - 1][1] if i else v1
            v = a * math.exp(math.log(max(a, 0.01)) * 0 ) if False else (a + (v1 - a) * u); break
        else: break
    return v
def fmt(v):
    v = max(0, v); r = round(v, 2); i = int(r); c = int(round((r - i) * 100))
    return 'R$ ' + f'{i:,}'.replace(',', '.') + f',{c:02d}'
def delta_at(t):
    for i in range(1, len(SAL)):
        t0, v1 = SAL[i]
        if t0 <= t < t0 + 1.6: return v1 - SAL[i - 1][1], (t - t0) / 1.6
    return 0, 1
def frame(t):
    v = valor(t); im = Image.new('RGBA', (W * SS, (Y1 - Y0) * SS), (0, 0, 0, 0)); d = ImageDraw.Draw(im, 'RGBA')
    ent = sm(t / 0.5); oy = (1 - ent) * -140
    x0, x1, y0, y1 = 90, 990, 20 + oy, 230 + oy
    crit = v <= 1.0; pisca = crit and int(t * 4) % 2 == 0
    base = (200, 40, 40) if crit and not pisca else (24, 130, 70)
    d.rounded_rectangle([x0 * SS + 6, y0 * SS + 14, x1 * SS + 6, y1 * SS + 14], 36 * SS, fill=(0, 0, 0, 120))
    d.rounded_rectangle([x0 * SS, y0 * SS, x1 * SS, y1 * SS], 36 * SS, fill=base + (255,), outline=(14, 60, 36, 255), width=6)
    # sem faixa de brilho: barra inteira de uma cor so (Filippe: ep.34 parecia meio pintada)
    # moeda
    cx, cy = x0 + 82, int((y0 + y1) // 2)
    d.ellipse([(cx - 52) * SS, (cy - 52) * SS, (cx + 52) * SS, (cy + 52) * SS], fill=(214, 150, 50, 255), outline=(110, 70, 20, 255), width=6)
    d.ellipse([(cx - 38) * SS, (cy - 38) * SS, (cx + 38) * SS, (cy + 38) * SS], fill=(244, 196, 90, 255))
    fm = F(58); d.text((cx * SS, cy * SS), '$', font=fm, fill=(150, 96, 20, 255), anchor='mm')
    d.text(((x0 + 170) * SS, (y0 + 36) * SS), 'SALDO', font=F(30), fill=(220, 255, 230, 230), anchor='lm')
    s = fmt(v); size = 84 if len(s) <= 15 else 72
    dx = 4 * math.sin(t * 60) if crit and pisca else 0
    d.text(((x0 + 170) * SS + dx * SS, (y0 + 128) * SS), s, font=F(size), fill=(255, 255, 255, 255), anchor='lm', stroke_width=3 * SS // 2, stroke_fill=(10, 50, 30, 255))
    dl, u = delta_at(t)
    if abs(dl) > 0.004 and u < 1:
        txt = ('-' if dl < 0 else '+') + fmt(abs(dl)).replace('R$ ', 'R$ ').split(',')[0]
        col = (255, 70, 70, 255) if dl < 0 else (90, 255, 140, 255); a = int(255 * min(1, (1 - u) * 2.2))
        yy = (y1 + 50 + 36 * u) * SS; dd = ImageDraw.Draw(im, 'RGBA')
        dd.rounded_rectangle([(W // 2 - 260) * SS, yy - 34 * SS, (W // 2 + 260) * SS, yy + 34 * SS], 30 * SS, fill=(20, 20, 24, int(a * 0.75)))
        dd.text((W // 2 * SS, yy), txt, font=F(46), fill=col[:3] + (a,), anchor='mm', stroke_width=2 * SS // 2, stroke_fill=(0, 0, 0, a))
    return im.resize((W, Y1 - Y0), Image.LANCZOS)
ff = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{W}x{Y1 - Y0}', '-r', str(FPS), '-i', '-', '-c:v', 'qtrle', sys.argv[2]], stdin=subprocess.PIPE)
for n in range(N): ff.stdin.write(frame(n / FPS).tobytes())
ff.stdin.close(); ff.wait(); print('ok', N)
