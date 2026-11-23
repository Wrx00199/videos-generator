#!/usr/bin/env python3
"""ep46: words.json (palavras do ROTEIRO com tempos da voz), legenda.ass (titulo + 1-2 palavras) e som/eventos.json (SFX em toda acao visivel + ronco no payoff)."""
import difflib, json, math, re, subprocess, sys
from pathlib import Path
P = Path(__file__).resolve().parent
K = P.parent / 'serie-tiao-kit'
DUR = 68.4
B = json.loads((P / 'voz/beats_t.json').read_text())
stt = json.loads((P / 'voz/stt.json').read_text())['palavras']
beats = [re.sub(r'^\d+\. ', '', l) for l in (P / 'ROTEIRO.md').read_text().split('\n') if l.strip()]
n = lambda s: re.sub(r'[^a-zà-ú0-9]', '', s.lower())
ref = [w for b in beats for w in b.split()]
sm = difflib.SequenceMatcher(None, [n(w) for w in ref], [n(w['w']) for w in stt], autojunk=False)
m = {}
for a, b, sz in sm.get_matching_blocks():
    for t in range(sz): m[a + t] = b + t
tempo = [None] * len(ref)
for r, h in m.items(): tempo[r] = (stt[h]['ini'], stt[h]['fim'])
# preenche palavras sem par interpolando entre vizinhas
i = 0
while i < len(ref):
    if tempo[i] is None:
        j = i
        while j < len(ref) and tempo[j] is None: j += 1
        a = tempo[i - 1][1] if i > 0 else 0.0
        b = tempo[j][0] if j < len(ref) else B[-1][1]
        for k in range(i, j):
            tempo[k] = (a + (b - a) * (k - i) / (j - i), a + (b - a) * (k - i + 1) / (j - i))
        i = j
    else: i += 1
words = [{'w': w, 'ini': round(t[0], 3), 'fim': round(t[1], 3)} for w, t in zip(ref, tempo)]
(P / 'voz/words.json').write_text(json.dumps(words, ensure_ascii=False, indent=1))

# ---- legenda ASS: titulo no quadro 0 + 1-2 palavras por vez, sem ponto final
def hms(s): return f"{int(s // 3600)}:{int(s % 3600 // 60):02d}:{s % 60:05.2f}"
head = """[Script Info]
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Leg,DejaVu Sans,78,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,8,2,2,40,40,330,1
Style: Tit,DejaVu Sans,84,&H0020D8FF,&H0020D8FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,9,3,8,50,50,150,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
ev = [f"Dialogue: 1,{hms(0)},{hms(2.8)},Tit,,0,0,0,,O JARRO QUE AVISOU\\NUM IMPÉRIO"]
clean = lambda w: re.sub(r'[.,;:!?]+$', '', w).upper()
i = 0
while i < len(words):
    grupo = words[i:i + 2]
    if len(grupo) == 2 and len(clean(grupo[0]['w'])) + len(clean(grupo[1]['w'])) > 14: grupo = grupo[:1]
    ini = grupo[0]['ini']
    fim = words[i + len(grupo)]['ini'] if i + len(grupo) < len(words) else grupo[-1]['fim'] + 0.3
    fim = min(fim, grupo[-1]['fim'] + 0.5)
    ev.append(f"Dialogue: 0,{hms(ini)},{hms(max(fim, ini + 0.15))},Leg,,0,0,0,,{' '.join(clean(g['w']) for g in grupo)}")
    i += len(grupo)
(P / 'legenda.ass').write_text(head + '\n'.join(ev) + '\n', encoding='utf-8')

# ---- SFX presos nas acoes (tempos espelham web/story.js)
sm_ = lambda x: min(1, max(0, x)) ** 2 * (3 - 2 * min(1, max(0, x)))
def inv(y):
    lo, hi = 0.0, 1.0
    for _ in range(40):
        mid = (lo + hi) / 2
        if sm_(mid) < y: lo = mid
        else: hi = mid
    return lo
E_ = []
add = lambda t, tipo, nivel=0, **k: E_.append({'t': round(t, 3), 'tipo': tipo, 'nivel': nivel, **k})
add(0.15, 'pop', -2)                       # beat 1: Tião encaixa a bola
cortes = [B[1][0], 9.6, B[2][0], 18.2, B[3][0], 24.6, B[4][0], B[5][0], 40.2, B[6][0], 50.0, B[7][0], 57.4, B[8][0]]   # mesmos cortes de web/story.js
for t in cortes: add(t - 0.05, 'whoosh', -6)
add(B[1][0] + 0.4, 'nhac', -4); add(B[1][0] + 1.3, 'nhac', -5)     # corte gargalha
add(B[2][0] + 0.6, 'batida', -4)                                    # imperador cruza os braços
def queda_som(ini, fim, pan=0.0, forte=False):
    """queda = assobio curto (whoosh baixo) do começo ao fim da queda + 'tim' quando a bola entra na boca do sapo"""
    add(ini, 'whoosh', -10, pan=pan); add(fim, 'tim', 0 if forte else -2, pan=pan)
queda_som(19.0, 19.9)                                               # beat 3: 1 bola cai e nada
add(B[3][0] + 0.9, 'nhac', -4); add(B[3][0] + 1.8, 'nhac', -5)      # riram mais
for k in range(6): add(24.8 + k * 1.05, 'passos', -6, n=2, dt=0.3)   # beat 4: Tião arrasta o pote morro acima
for k in range(4): add(24.6 + k * 1.7, 'rangido', -5)                # ARRASTO do pote no chão
queda_som(32.6, 33.4, -0.2); queda_som(34.4, 35.2, 0.2)             # beat 5: uma bola, depois outra
add(B[5][0] + 0.1, 'passos', -4, n=6, dt=0.25)                      # corre pros portões
for mm in range(2, 8): queda_som(36.4 + 2.0 * inv((mm - 1) / 6) - 0.35, 36.4 + 2.0 * inv((mm - 1) / 6), (-1) ** mm * 0.3)   # as oito de uma vez
add(40.6, 'nhac', -4); add(B[6][0] + 0.6, 'nhac', -5)               # guardas riem
add(55.5, 'tremor', -4)                                             # tranco
for mm in range(8):                                                 # beat 8: uma bola por vez, cada uma na boca do sapo
    ini = 57.4 + (5.2 * inv(mm / 8) if mm else 0.0); fim = 57.4 + 5.2 * inv((mm + 1) / 8)
    queda_som(ini, fim, (-1) ** mm * 0.3, forte=(mm == 0))
    if mm in (0, 3, 7): add(ini, 'estalo', -4)
add(61.6, 'tremor', 0)
add(62.6, 'boom', 0); add(64.7, 'boom', -2)                         # RONCO do payoff: terremoto
add(64.6, 'tremor', 0); add(66.2, 'tremor', -3)
E_.sort(key=lambda e: e['t'])
cfg = dict(duracao=DUR, seed=4646, mar=dict(nivel_db=-100), eventos=E_,
           trilha=dict(bpm=104, secoes=[dict(ini=0, fim=DUR, tipo='esparso')], rebaixes=[[61.4, 64.6, -5]]))
(P / 'som').mkdir(exist_ok=True)
(P / 'som/eventos.json').write_text(json.dumps(cfg, ensure_ascii=False, indent=1))
print(len(words), 'palavras;', len(E_), 'eventos SFX')
