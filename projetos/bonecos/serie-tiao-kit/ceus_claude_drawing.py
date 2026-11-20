"""Céus pintados com Claude Drawing (FlatVector) para o vídeo do papagaio.
Placas 1680x1200: o horizonte fica na base da placa; o canvas estica por cima do mar."""
import os, sys
sys.path.insert(0, '/home/wr/.claude/skills/claude-drawing/lib')
from flatvector import FlatVector, mix, hexc
W, H = 1680, 1200
def plate(out, top, bot, sun, sunc, cloudc, belly, hill, seed):
    fv = FlatVector(W, H, seed=seed)
    fv.backdrop(hexc(top))
    n = 9
    for i in range(n):                       # faixas planas de céu (degradê em degraus, estilo flat)
        y0 = H * (0.18 + 0.82 * i / n)
        fv.fill(fv.rect(-20, y0, W + 20, H + 20), mix(hexc(top), hexc(bot), (i + 1) / n), lift=0, texture=.6, shadow=0)
    if sun:
        x, y, r = sun
        fv.glow(x, y, r * 2.6, r * 2.6, hexc(sunc), rings=5, alpha=.16)
        fv.fill(fv.circle(x, y, r), hexc(sunc), lift=0, shadow=0)
    for cx, cy, w, s in [(260, 300, 360, 1), (1180, 220, 420, 2), (760, 520, 300, 3), (1460, 640, 260, 4), (140, 760, 240, 5)]:
        fv.cloud(cx, cy, w, colour=hexc(cloudc), belly=hexc(belly), seed=s)
    fv.fill(fv.profile([(-20, H - 40), (200, H - 110), (420, H - 70), (560, H - 30), (1100, H - 30), (1300, H - 120), (1520, H - 150), (1700, H - 60)], bottom=H + 20), hexc(hill), lift=4, shadow=.25)
    fv.save(out)
a = 'anim/assets/'
os.makedirs(a, exist_ok=True)
plate(a + 'ceu_dia.png', '#3f9be6', '#d6f0ff', (1350, 330, 90), '#fff2b8', '#ffffff', '#cfe0f2', '#6f9fcc', 3)
plate(a + 'ceu_tarde.png', '#3c3f8f', '#ffb36b', (900, 1010, 150), '#ffe08a', '#ffc6a0', '#c27a8e', '#7a4f7c', 5)
print('ok')
