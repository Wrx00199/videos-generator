#!/usr/bin/env python3
"""QA do VÍDEO final (o que não é cenário): imagem, áudio, voz x roteiro, legenda.
Uso: python3 tools_video_check.py <video.mp4> --words work/words.json --ass captions.ass --roteiro roteiro.txt [--voz voz_tight.wav --musica musica.wav]
Sai 1 se reprovar. Cada linha = um erro com o momento (s)."""
import sys, json, re, subprocess, difflib, unicodedata
a = sys.argv; V = a[1]
opt = lambda k: a[a.index(k) + 1] if k in a else None
bad = []
def ff(args): return subprocess.run(['ffmpeg', '-hide_banner', '-nostats', *args], capture_output=True, text=True).stderr
def probe(k, sel='v:0'): return subprocess.run(['ffprobe', '-v', 'error', '-select_streams', sel, '-show_entries', k, '-of', 'csv=p=0', V], capture_output=True, text=True).stdout.strip()
norm = lambda w: re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFKD', w.lower()).encode('ascii', 'ignore').decode())
# --- imagem ---
dur = float(probe('format=duration', 'v:0') or subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', V], capture_output=True, text=True).stdout)
wh = probe('stream=width,height')
if wh != '1080,1920': bad.append(f'RESOLUCAO {wh} (quero 1080x1920)')
if not (55 <= dur <= 66): bad.append(f'DURACAO {dur:.1f}s (entrega = ~60 s)')
for m in re.finditer(r'black_start:([\d.]+) black_end:([\d.]+)', ff(['-i', V, '-vf', 'blackdetect=d=0.1:pix_th=0.08', '-an', '-f', 'null', '-'])): bad.append(f'TELA PRETA {m[1]}–{m[2]}s')
fz = re.findall(r'freeze_start: ([\d.]+)', ff(['-i', V, '-vf', 'freezedetect=n=0.002:d=0.7', '-an', '-f', 'null', '-']))
for t in fz: bad.append(f'IMAGEM CONGELADA a partir de {float(t):.2f}s (>0,7 s)')
# --- áudio do master ---
if not probe('stream=codec_name', 'a:0'): bad.append('SEM AUDIO')
else:
    e = ff(['-i', V, '-af', 'ebur128=peak=true', '-f', 'null', '-'])
    I = re.findall(r'I:\s+(-?[\d.]+) LUFS', e); P = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', e)
    if I and not (-15.5 <= float(I[-1]) <= -12.5): bad.append(f'VOLUME {I[-1]} LUFS (quero -14)')
    if P and float(P[-1]) > -1.0: bad.append(f'PICO {P[-1]} dBTP (estoura; quero <= -2)')
    for s_, e_ in re.findall(r'silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)', ff(['-i', V, '-af', 'silencedetect=n=-45dB:d=0.6', '-vn', '-f', 'null', '-'])):
        if float(s_) < dur - 0.8: bad.append(f'SILENCIO {float(s_):.2f}–{float(e_):.2f}s')
# --- voz x roteiro (voz engoliu/inventou palavra) ---
W = json.load(open(opt('--words'))) if opt('--words') else []
if W and opt('--roteiro'):
    txt = re.sub(r'\[[^\]]*\]', ' ', open(opt('--roteiro')).read())
    ro = [norm(x) for x in txt.split() if norm(x)]; vo = [norm(w['w']) for w in W if norm(w['w'])]
    sm = difflib.SequenceMatcher(None, ro, vo, autojunk=False)
    if sm.ratio() < 0.9: bad.append(f'VOZ x ROTEIRO só {sm.ratio():.0%} igual')
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag in ('delete', 'replace') and (i2 - i1) >= 3: bad.append(f'VOZ PULOU: "{" ".join(ro[i1:i2])}"')
    if vo and ro and vo[:3] != ro[:3]: bad.append('VOZ NAO COMECA PELO GANCHO')
if W:
    last = W[-1]['e']
    if dur - last > 0.7: bad.append(f'FINAL ARRASTADO {dur - last:.2f}s depois da última palavra (quero ~0,3)')
    if dur - last < 0.15: bad.append('ÚLTIMA PALAVRA CORTADA no fim')
# --- legenda ---
if opt('--ass') and W:
    ts = lambda t: (lambda h, m, s: int(h) * 3600 + int(m) * 60 + float(s))(*t.split(':'))
    C = []
    for ln in open(opt('--ass'), encoding='utf-8'):
        if ln.startswith('Dialogue:'):
            p = ln.split(',', 9); C.append((ts(p[1]), ts(p[2]), re.sub(r'\{[^}]*\}', '', p[9]).strip()))
    C.sort()
    for (s1, e1, t1), (s2, _, _) in zip(C, C[1:]):
        if s2 < e1 - 0.02: bad.append(f'LEGENDA SOBREPOSTA {s1:.2f}s'); break
    for s_, e_, t in C:
        if len(t.split()) > 2: bad.append(f'LEGENDA LONGA {s_:.2f}s "{t}" (1–2 palavras)')
        if e_ > dur + 0.05: bad.append(f'LEGENDA DEPOIS DO FIM {s_:.2f}s')
    for w in W:
        if not norm(w['w']): continue
        hit = [c for c in C if c[0] - 0.12 <= w['s'] <= c[1]]
        if not hit: bad.append(f'PALAVRA SEM LEGENDA {w["s"]:.2f}s "{w["w"]}"'); continue
        if not any(norm(w['w']) in norm(c[2]) for c in hit): bad.append(f'LEGENDA FORA DE SINCRONIA {w["s"]:.2f}s fala "{w["w"]}", tela "{hit[0][2]}"')
# --- mix voz x música (stems) ---
if opt('--voz') and opt('--musica'):
    mv = lambda f: float(re.findall(r'mean_volume: (-?[\d.]+)', ff(['-i', f, '-af', 'volumedetect', '-f', 'null', '-']))[-1])
    d = mv(opt('--voz')) - mv(opt('--musica'))
    if d < 15: bad.append(f'MUSICA ALTA: só {d:.1f} dB abaixo da voz (quero ~20)')
for b in bad[:60]: print(b)
print('OK' if not bad else f'REPROVADO: {len(bad)} erros'); sys.exit(1 if bad else 0)
