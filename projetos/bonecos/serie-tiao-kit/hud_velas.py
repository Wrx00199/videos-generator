#!/usr/bin/env python3
"""hud_velas.py <marcas.json> <saida.mov> <duracao_s> — HUD tematico do terror das Bermudas (ep. 33): sete velas numa tabua de navio.
Cada vela apaga (fumaca + brasa) e volta a acender nos tempos de marcas.json (OUT/RELUZ); a do Tiao (indice 4) tem aro dourado e chama azul antes de apagar.
Sai um .mov qtrle com alfa (1080x1920 so a faixa y=140..460 e o resto transparente) para `overlay` no ffmpeg."""
import json, math, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter

W, H, FPS, SS = 1080, 1920, 30, 2
BANDA = (105, 470)          # faixa vertical desenhada
m = json.load(open(sys.argv[1])); OUT, RELUZ, AZUL = m['OUT'], m['RELUZ'], m['AZUL']
dur = float(sys.argv[3]); N = int(dur * FPS) + 1
XS = [W / 2 + (i - 3) * 118 for i in range(7)]; YB = 330     # y da tabua (base das velas)

def sm(x): x = max(0, min(1, x)); return x * x * x * (x * (x * 6 - 15) + 10)
def vela(i, t): return 1.0 if t < OUT[i] else (1 - sm((t - OUT[i]) / 0.5) if t < RELUZ[i] else sm((t - RELUZ[i]) / 0.9))

def glow(r, cor):
    g = Image.new('RGBA', (r * 2, r * 2), (0, 0, 0, 0)); d = ImageDraw.Draw(g)
    for k in range(r, 0, -2): d.ellipse([r - k, r - k, r + k, r + k], fill=cor + (int(70 * (1 - k / r) ** 2),))
    return g.filter(ImageFilter.GaussianBlur(3))
G_OR, G_AZ = glow(70 * SS, (255, 170, 60)), glow(70 * SS, (90, 160, 255))

def chama(d, cx, cy, s, azul, fl):
    pts = [(cx, cy - 46 * s * fl), (cx + 13 * s, cy - 14 * s), (cx + 10 * s, cy + 4 * s), (cx, cy + 9 * s), (cx - 10 * s, cy + 4 * s), (cx - 13 * s, cy - 14 * s)]
    pts = [(x * SS, y * SS) for x, y in pts]
    ext, med, nuc = ((60, 120, 255), (130, 190, 255), (235, 250, 255)) if azul else ((255, 120, 20), (255, 200, 70), (255, 250, 210))
    d.polygon(pts, fill=ext + (255,))
    d.polygon([(cx * SS + (x - cx * SS) * .62, cy * SS + (y - cy * SS) * .62 + 5 * SS) for x, y in pts], fill=med + (255,))
    d.polygon([(cx * SS + (x - cx * SS) * .3, cy * SS + (y - cy * SS) * .3 + 8 * SS) for x, y in pts], fill=nuc + (255,))

def frame(t):
    im = Image.new('RGBA', (W * SS, (BANDA[1] - BANDA[0]) * SS), (0, 0, 0, 0)); d = ImageDraw.Draw(im, 'RGBA')
    oy = BANDA[0]; Y = lambda y: (y - oy) * SS
    # tabua de madeira com veio, pregos e sombra
    x0, x1, y0, y1 = XS[0] - 95, XS[6] + 95, YB, YB + 38
    d.rounded_rectangle([x0 * SS + 4, Y(y0) + 10, x1 * SS + 4, Y(y1) + 10], 16 * SS // 2, fill=(0, 0, 0, 110))
    d.rounded_rectangle([x0 * SS, Y(y0), x1 * SS, Y(y1)], 16 * SS // 2, fill=(74, 46, 24, 255), outline=(30, 18, 10, 255), width=3 * SS // 2)
    for k in range(5): d.line([x0 * SS + 20, Y(y0 + 7 + k * 6), x1 * SS - 20, Y(y0 + 9 + k * 6)], fill=(110, 72, 38, 140), width=2)
    for xx in (x0 + 18, x1 - 18): d.ellipse([xx * SS - 5, Y(y0 + 19) - 5, xx * SS + 5, Y(y0 + 19) + 5], fill=(190, 160, 90, 255))
    for i in range(7):
        v, cx = vela(i, t), XS[i]; tiao = i == 4
        s = 1.25 if tiao else 1.0; h = (96 if tiao else 84) + 6 * ((i * 5) % 3)
        if tiao: d.ellipse([(cx - 44) * SS, Y(YB - 6), (cx + 44) * SS, Y(YB + 14)], outline=(255, 205, 70, 255), width=3 * SS // 2)
        # pires + corpo da vela com derretido e brilho
        d.ellipse([(cx - 30 * s) * SS, Y(YB - 8), (cx + 30 * s) * SS, Y(YB + 8)], fill=(122, 98, 56, 255), outline=(40, 28, 14, 255), width=2)
        top = YB - h * s
        d.rounded_rectangle([(cx - 15 * s) * SS, Y(top), (cx + 15 * s) * SS, Y(YB - 2)], 6 * SS // 2, fill=(240, 228, 196, 255), outline=(60, 46, 28, 255), width=3 * SS // 2)
        d.rectangle([(cx - 9 * s) * SS, Y(top + 6), (cx - 5 * s) * SS, Y(YB - 12)], fill=(255, 255, 240, 140))
        for dx, ln in ((-9, 16), (6, 24)): d.rounded_rectangle([(cx + dx * s - 3) * SS, Y(top), (cx + dx * s + 3) * SS, Y(top + ln)], 3 * SS // 2, fill=(250, 240, 212, 255))
        d.line([cx * SS, Y(top), cx * SS, Y(top - 9)], fill=(24, 16, 12, 255), width=3)
        az = tiao and AZUL <= t < OUT[4]
        if v > 0.02:
            fl = 0.88 + 0.12 * math.sin(t * (11 + i) + i) + (0.18 if math.sin(t * 27 + i * 3) > 0.9 else 0)
            g = (G_AZ if az else G_OR); gs = g.resize((int(g.width * v), int(g.height * v)))
            im.alpha_composite(gs, (int(cx * SS - gs.width / 2), int(Y(top - 14) - gs.height / 2)))
            chama(d, cx + 1.5 * math.sin(t * 6 + i), top - 12 - oy, s * v, az, fl)
        else:
            # brasa que esfria + fumaca subindo
            e = t - OUT[i]
            if 0 <= e < RELUZ[i] - OUT[i]:
                br = max(0, 1 - e / 1.4)
                if br > 0: d.ellipse([cx * SS - 5, Y(top - 9) - 5, cx * SS + 5, Y(top - 9) + 5], fill=(255, int(120 * br), 30, int(255 * br)))
                u = min(1, e / 2.6)
                for k in range(26):
                    q = k / 25; yy = top - 10 - q * 120 * (0.4 + u); xx = cx + 16 * math.sin(q * 6 + t * 1.3 + i) * (0.4 + q)
                    a = int(150 * math.sin(math.pi * u) * (1 - q)); r = (4 + q * 10)
                    d.ellipse([(xx - r) * SS, Y(yy) - r * SS, (xx + r) * SS, Y(yy) + r * SS], fill=(190, 205, 205, max(0, a // 2)))
    return im.resize((W, BANDA[1] - BANDA[0]), Image.LANCZOS)

ff = subprocess.Popen(['ffmpeg', '-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', f'{W}x{BANDA[1] - BANDA[0]}', '-r', str(FPS), '-i', '-', '-c:v', 'qtrle', sys.argv[2]], stdin=subprocess.PIPE)
for n in range(N): ff.stdin.write(frame(n / FPS).tobytes())
ff.stdin.close(); ff.wait(); print('ok', N, 'quadros')
