#!/usr/bin/env python3
"""
contador.py — contador na tela ("dopamina de progresso") em .ass, SEM mexer no render 3D.
Gera uma plaquinha de cantos arredondados no TOPO (rótulo pequeno + número grande, DejaVu Sans Bold, cores do tema:
ameixa #241726 + amarelo #FFF020) que dá um "pulo" (escala) quando o número muda. Pode virar um .ass próprio
(2º `subtitles=`) ou ser MESCLADO na legenda palavra a palavra (`--com-legenda`), saindo um .ass único.

USO
  python3 contador.py <saida.ass> '<json>' [--com-legenda legenda.ass] [--tamanho 118] [--y 215] [--fonte "DejaVu Sans"]
  (o json pode ser um caminho de arquivo, ou '-' para ler do stdin)

JSON: lista de contadores (ou {"contadores":[...]}). Cada um é UM destes formatos (tempos em segundos do vídeo):
  1) contagem   {"t0":0,"t1":8,"rotulo":"MONSTROS","de":10,"ate":200,"conta":1.4}
       sobe de `de` até `ate` em `conta` s (padrão min(1.6, t1-t0), curva suave) e fica em `ate` até t1; pulo no começo e na chegada.
  2) por tempo  {"t1":30,"rotulo":"DIA","valores":[[0,5],[10,15],[20,30]]}      (valor pode ser texto: [[0,"10 mil"]])
       a cada mudança dá um pulo. Para "MONSTROS 10 → 50 → 200": valores [[0,10],[6,50],[12,200]] (t1 = quando some). Com "contar":0.5 cada
       troca numérica vira uma contagem rápida de 0,5 s em vez de salto seco.
  3) fixo       {"t0":3,"t1":9,"rotulo":"LATAS","valor":10000}                      -> "10.000" (milhar pt-BR), pulo ao entrar
  Opcionais em qualquer um: "prefixo":"+", "sufixo":" mil", "fmt":"int"|"milhar"(padrão)|"txt", "cor":"FFF020" (RGB do número), "y":215, "pop":false.

QUEIMAR (1080x1920, 1 passada):
  # só o contador
  ffmpeg -i video.mp4 -vf "subtitles=contador.ass" -c:a copy saida.mp4
  # contador + legenda num arquivo só
  python3 contador.py tudo.ass contadores.json --com-legenda legenda.ass && ffmpeg -i video.mp4 -vf "subtitles=tudo.ass" -c:a copy saida.mp4
  # ou dois filtros:  -vf "subtitles=legenda.ass,subtitles=contador.ass"
"""
import argparse, json, os, re, sys

DEJAVU_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
PLUM_BGR = "261724"      # #241726 (ass usa BGR)
CREAM_BGR = "E6F6FB"     # #FBF6E6
AMARELO_RGB = "FFF020"   # igual ao destaque da legenda (&H0020F0FF)


def bgr(rgb):
    rgb = rgb.lstrip("#").upper()
    return rgb[4:6] + rgb[2:4] + rgb[0:2]


def t_ass(s):
    s = max(0.0, s); cs = int(round(s * 100))
    return f"{cs // 360000:d}:{(cs // 6000) % 60:02d}:{(cs // 100) % 60:02d}.{cs % 100:02d}"


def milhar(n):
    return f"{int(round(n)):,}".replace(",", ".")


def fmt_val(v, c):
    f = c.get("fmt", "milhar")
    pre, suf = c.get("prefixo", ""), c.get("sufixo", "")
    if isinstance(v, str) or f == "txt":
        return f"{pre}{v}{suf}"
    return f"{pre}{int(round(v)) if f == 'int' else milhar(v)}{suf}"


class Medidor:
    """largura do texto: PIL com DejaVu Bold; sem PIL, estimativa (0,66 em)."""
    def __init__(self):
        try:
            from PIL import ImageFont
            self.F = ImageFont.truetype(DEJAVU_BOLD, 100)
        except Exception:
            self.F = None

    def w(self, texto, size):
        if self.F is not None:
            return self.F.getlength(texto) * size / 100.0
        return len(texto) * size * 0.66


def caixa_arredondada(w, h, r):
    k = 0.5523 * r
    f = lambda v: f"{v:.0f}"
    return (f"m {f(r)} 0 l {f(w - r)} 0 b {f(w - r + k)} 0 {f(w)} {f(r - k)} {f(w)} {f(r)} "
            f"l {f(w)} {f(h - r)} b {f(w)} {f(h - r + k)} {f(w - r + k)} {f(h)} {f(w - r)} {f(h)} "
            f"l {f(r)} {f(h)} b {f(r - k)} {f(h)} 0 {f(h - r + k)} 0 {f(h - r)} "
            f"l 0 {f(r)} b 0 {f(r - k)} {f(r - k)} 0 {f(r)} 0")


def segmentos(c):
    """-> lista de (ta, tb, texto, pop). Aceita os 3 formatos."""
    if "valores" in c:
        vs = sorted(c["valores"], key=lambda p: p[0]); t1 = c.get("t1")
        if t1 is None:
            raise ValueError("contador 'valores' precisa de t1 (quando some)")
        seg = []; cont = float(c.get("contar", 0))
        for i, (t, v) in enumerate(vs):
            fim = vs[i + 1][0] if i + 1 < len(vs) else t1
            if fim <= t:
                raise ValueError(f"tempos fora de ordem em 'valores' ({t} >= {fim})")
            ant = vs[i - 1][1] if i else None
            if cont > 0 and i and isinstance(v, (int, float)) and isinstance(ant, (int, float)):
                seg += conta(t, min(t + cont, fim), ant, v, c, pop_fim=True, pop_ini=False)
                if t + cont < fim:
                    seg.append((t + cont, fim, fmt_val(v, c), False))
            else:
                seg.append((t, fim, fmt_val(v, c), True))
        return seg
    if "valor" in c:
        return [(c["t0"], c["t1"], fmt_val(c["valor"], c), True)]
    if "de" in c and "ate" in c:
        t0, t1 = c["t0"], c["t1"]
        dur = float(c.get("conta", min(1.6, t1 - t0)))
        seg = conta(t0, min(t0 + dur, t1), c["de"], c["ate"], c, pop_fim=True, pop_ini=True)
        if t0 + dur < t1:
            seg.append((t0 + dur, t1, fmt_val(c["ate"], c), False))
        return seg
    raise ValueError("contador sem 'valores', 'valor' ou 'de'/'ate'")


def conta(ta, tb, de, ate, c, pop_fim, pop_ini, taxa=15):
    n = max(1, int(round((tb - ta) * taxa))); seg = []; ult = None
    for i in range(n):
        a, b = ta + (tb - ta) * i / n, ta + (tb - ta) * (i + 1) / n
        u = (i + 1) / n; v = de + (ate - de) * (1 - (1 - u) ** 3)       # ease-out: acelera e freia na chegada
        txt = fmt_val(ate if i == n - 1 else v, c)
        pop = (pop_ini and i == 0) or (pop_fim and i == n - 1)
        if seg and txt == ult:
            seg[-1] = (seg[-1][0], b, txt, seg[-1][3] and not pop_fim or pop); continue
        seg.append((a, b, txt, pop)); ult = txt
    return seg


def pulo(ms=90):
    # 100% -> 128% -> 93% -> 100% (sobe rápido, passa do ponto e assenta)
    return (f"\\fscx100\\fscy100\\t(0,{ms},\\fscx128\\fscy128)\\t({ms},{ms * 2 + 40},\\fscx93\\fscy93)"
            f"\\t({ms * 2 + 40},{ms * 3 + 80},\\fscx100\\fscy100)")


def gerar(contadores, tam, y_pad, fonte, W=1080, H=1920):
    med = Medidor(); estilo = (f"Style: Contador,{fonte},{tam},&H00FFFFFF,&H0020F0FF,&H00{PLUM_BGR},&H80000000,"
                               f"-1,0,0,0,100,100,0,0,1,7,0,5,40,40,40,1")
    eventos = []
    for c in contadores:
        seg = segmentos(c)
        rot = str(c.get("rotulo", "")).upper(); tam_rot = int(tam * 0.38)
        cor_num = bgr(c.get("cor", AMARELO_RGB)); cy = c.get("y", y_pad)
        textos = [s[2] for s in seg]
        wn = max(med.w(t, tam) for t in textos); wr = med.w(rot, tam_rot) if rot else 0
        w = int(max(wn, wr) + 2 * 0.42 * tam + 8); h = int((tam_rot * 1.25 if rot else 0) + tam * 1.12 + 0.42 * tam)
        w = max(w, int(tam * 2.2)); cx = int(c.get("x", W // 2)); r = int(h * 0.28)
        # centro da plaquinha em (cx, cy): cy é a posição do centro. Texto em 2 linhas centralizado no mesmo ponto.
        caixa = caixa_arredondada(w, h, r)
        for ta, tb, txt, pop in seg:
            if tb <= ta:
                continue
            anim = pulo() if (pop and c.get("pop", True)) else ""
            pos = f"\\an5\\pos({cx},{cy})"
            ini, fim = t_ass(ta), t_ass(tb)
            eventos.append(f"Dialogue: 5,{ini},{fim},Contador,,0,0,0,,{{{pos}\\bord6\\shad0\\1c&H{PLUM_BGR}&\\3c&H{bgr(AMARELO_RGB)}&\\1a&H18&{anim}\\p1}}{caixa}{{\\p0}}")
            corpo = (f"{{\\fs{tam_rot}\\1c&H{CREAM_BGR}&\\bord4}}{rot}\\N" if rot else "") + f"{{\\fs{tam}\\1c&H{cor_num}&\\bord7}}{txt}"
            eventos.append(f"Dialogue: 6,{ini},{fim},Contador,,0,0,0,,{{{pos}\\3c&H{PLUM_BGR}&\\shad0{anim}}}{corpo}")
    return estilo, eventos


CAB = """[Script Info]
Title: Contador Tião
ScriptType: v4.00+
WrapStyle: 2
ScaledBorderAndShadow: yes
YCbCr Matrix: None
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
{estilo}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""


def mesclar(legenda_path, estilo, eventos):
    txt = open(legenda_path, encoding="utf-8").read()
    if "[Events]" not in txt:
        raise ValueError("legenda sem [Events]: " + legenda_path)
    cab, ev = txt.split("[Events]", 1)
    # estilo novo logo depois do último "Style:" da legenda
    linhas = cab.rstrip("\n").split("\n"); idx = max(i for i, l in enumerate(linhas) if l.startswith("Style:"))
    linhas.insert(idx + 1, estilo)
    return "\n".join(linhas) + "\n\n[Events]" + ev.rstrip("\n") + "\n" + "\n".join(eventos) + "\n"


def main():
    ap = argparse.ArgumentParser(description="Contador na tela em .ass", formatter_class=argparse.RawDescriptionHelpFormatter, epilog=__doc__)
    ap.add_argument("saida"); ap.add_argument("json")
    ap.add_argument("--com-legenda", help="legenda.ass existente: gera UM .ass com legenda + contador")
    ap.add_argument("--tamanho", type=int, default=118, help="fonte do número (rótulo = 38%%)")
    ap.add_argument("--y", type=int, default=215, help="centro vertical da plaquinha (px de 1920)")
    ap.add_argument("--fonte", default="DejaVu Sans")
    a = ap.parse_args()
    try:
        src = sys.stdin.read() if a.json == "-" else (open(a.json, encoding="utf-8").read() if os.path.isfile(a.json) else a.json)
        dados = json.loads(src)
        if isinstance(dados, dict):
            dados = dados.get("contadores", [dados])
        estilo, eventos = gerar(dados, a.tamanho, a.y, a.fonte)
        if not eventos:
            raise ValueError("nenhum evento gerado")
        saida = mesclar(a.com_legenda, estilo, eventos) if a.com_legenda else CAB.format(estilo=estilo) + "\n".join(eventos) + "\n"
    except (ValueError, KeyError, TypeError, json.JSONDecodeError, OSError) as e:
        print(f"contador.py: erro: {e!r}", file=sys.stderr); sys.exit(2)
    with open(a.saida, "w", encoding="utf-8") as f:
        f.write(saida)
    print(f"Contador ASS gerado: {len(eventos) // 2} trechos -> {a.saida}" + (" (mesclado com a legenda)" if a.com_legenda else ""))


if __name__ == "__main__":
    main()
