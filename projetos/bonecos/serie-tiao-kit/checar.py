#!/usr/bin/env python3
"""Checagem automática da série Tião — prepara o material do revisor (v2, 15/11).

Uso:
  python3 projetos/bonecos/serie-tiao-kit/checar.py <projeto> storyboard   # motor 3D: começo/meio/fim de cada cena + auditoria
  python3 projetos/bonecos/serie-tiao-kit/checar.py <projeto> final [mp4]  # vídeo pronto: tudo abaixo -> revisao/
<projeto> = pasta com web/ (motor 3D) ou anim/ (legado), roteiro.txt (ou falas.json), cenas.json [[ini,fim,"rótulo"],...] e final.mp4.

O que o modo final entrega (por que: o revisor antigo via 8 quadros de 160 px por cena e não enxergava braço/pedra):
  1. auditoria.txt  — auditor do motor (pose quebrada, boneco cortado/colado na borda, pequeno demais), por quadro, SEM imagem.
  2. saltos.txt     — "pulos" dentro do mesmo plano (mudança brusca entre quadros que não é corte): água/membro/objeto estalando.
  3. cNN.jpg        — 1 imagem por cena: 3 quadros nítidos (início/meio/fim, 360x640) lado a lado.
  4. tiraNN.jpg     — movimento: 8 quadros pequenos por cena (para ver se algo entra cortado/some).
  5. suspeitos.jpg  — até 8 quadros grandes (540x960) dos pontos que a auditoria/saltos acusaram.
  6. medidas.txt    — duração, tela parada, loudness, STT x roteiro, resumo de tudo acima.
"""
import shutil, difflib, glob, json, os, re, subprocess, sys, unicodedata

R = '/media/wr/HDD/Estudio de video'
proj, modo = os.path.abspath(sys.argv[1]), sys.argv[2]
cenas = json.load(open(os.path.join(proj, 'cenas.json')))
run = lambda *a, **k: subprocess.run(list(a), capture_output=True, text=True, **k)
web = os.path.join(proj, 'web')
FPS = 30


def norm(t):
    t = unicodedata.normalize('NFD', t.lower()); t = ''.join(c for c in t if unicodedata.category(c) != 'Mn')
    return re.findall(r"[a-z0-9]+", t)


def texto_roteiro():
    fj = os.path.join(proj, 'falas.json')
    if os.path.exists(fj): return ' '.join(x['texto'] for x in (lambda d: d['falas'] if isinstance(d, dict) else d)(json.load(open(fj))))
    return open(os.path.join(proj, 'roteiro.txt')).read()


def auditar():
    """Auditor do motor (render.mjs --auditar): texto, ~3 s para o vídeo todo."""
    if not os.path.isdir(web): return ['(sem web/: auditoria do motor indisponível)'], []
    ult = int(cenas[-1][1] * FPS) - 1
    r = run('node', 'render.mjs', '--auditar', f'0-{ult}', '2', cwd=web, timeout=600)
    if r.returncode or 'ERR ' in r.stdout: sys.exit('ERRO: a página do motor quebrou (sintaxe?) — nada foi auditado:\n' + '\n'.join(l for l in r.stdout.splitlines() if l.startswith('ERR'))[:600])
    lin = [l for l in r.stdout.splitlines() if l and not l.startswith('PAGE')]
    quadros = []
    for l in lin:
        m = re.search(r'quadros ([\d,\-]+)', l)
        if m and ('cortado' in l or 'espetado' in l or 'sumir' in l or 'topo' in l):
            a = m.group(1).split(',')[0].split('-'); quadros.append((int(a[0]) + int(a[-1])) // 2)
    return lin or ['auditoria: nenhum problema de pose/enquadramento'], quadros


def grade(srcs, dst, cols, w, h, rot=None):
    args = []
    for f in srcs: args += ['-i', f]
    n = len(srcs); rows = (n + cols - 1) // cols
    if rot: rot = [str(r).replace(':', ' -').replace("'", '').replace('%', ' por cento').replace('\\', '') for r in rot]   # ':' e aspas quebravam o drawtext (folha da cena sumia sem erro)
    fc = ''.join(f'[{i}]scale={w}:{h}' + (f",drawtext=text='{rot[i]}':x=8:y=8:fontsize=26:fontcolor=yellow:box=1:boxcolor=black@0.7" if rot else '') + f'[v{i}];' for i in range(n))
    lay = '|'.join(f'{(i % cols) * w}_{(i // cols) * h}' for i in range(n))
    fc += ''.join(f'[v{i}]' for i in range(n)) + (f'xstack=inputs={n}:layout={lay}:fill=black' if n > 1 else 'null')
    run('ffmpeg', '-loglevel', 'error', '-y', *args, '-filter_complex', fc, '-frames:v', '1', '-update', '1', dst)


# ---------------- storyboard (motor 3D) ----------------
if modo == 'storyboard':
    sb = os.path.join(proj, 'storyboard'); os.makedirs(sb, exist_ok=True)
    aud, _ = auditar()
    if os.path.isdir(web):
        qs = []
        for a, b, _r in cenas:
            fa, fb = int(a * FPS), int(b * FPS) - 1
            qs += [fa + 4, (fa + fb) // 2, fb - 4]
        shutil.rmtree(os.path.join(sb, 'q'), ignore_errors=True)   # nunca reaproveitar quadro velho (V5: página quebrada deixou o storyboard antigo)
        r = run('node', 'render.mjs', os.path.join(sb, 'q'), ','.join(map(str, qs)), cwd=web, timeout=900)
        if r.returncode: sys.exit('ERRO no render do storyboard:\n' + r.stdout[-600:])
        for i, (a, b, rot) in enumerate(cenas, 1):
            fr = qs[(i - 1) * 3:(i) * 3]
            grade([os.path.join(sb, 'q', f'f{x:04d}.jpg') for x in fr], os.path.join(sb, f'c{i:02d}.jpg'), 3, 360, 640,
                  [f'{i} {rot[:18]} ini', f'{i} meio', f'{i} fim'])
    else:   # legado HyperFrames
        ts = [round((c[0] + c[1]) / 2, 2) for c in cenas]; an = os.path.join(proj, 'anim')
        run('npx', '--yes', 'hyperframes@0.9.52', 'snapshot', '--at', ','.join(map(str, ts)), cwd=an, timeout=400)
        d = max(glob.glob(os.path.join(an, '.hyperframes/artifacts/snapshots/*/')), key=os.path.getmtime)
        fr = sorted(glob.glob(d + 'frame-*.png'), key=lambda p: int(re.search(r'frame-(\d+)', p).group(1)))[:len(ts)]
        for i, f in enumerate(fr, 1): grade([f], os.path.join(sb, f'c{i:02d}.jpg'), 1, 360, 640, [str(i)])
    open(os.path.join(sb, 'auditoria.txt'), 'w').write('\n'.join(aud))
    print(f'storyboard: {len(cenas)} cenas -> {sb}/cNN.jpg (início/meio/fim)'); print('\n'.join(aud[:20]))
    sys.exit(0)

# ---------------- final ----------------
mp4 = os.path.abspath(sys.argv[3]) if len(sys.argv) > 3 else os.path.join(proj, 'final.mp4'); rv = os.path.join(proj, 'revisao'); os.makedirs(rv, exist_ok=True)
for f in glob.glob(os.path.join(rv, '*.jpg')): os.remove(f)
dur = float(run('ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4).stdout.strip())
ext = lambda t, dst, w=360: run('ffmpeg', '-loglevel', 'error', '-y', '-ss', f'{max(0, t):.3f}', '-i', mp4, '-frames:v', '1', '-vf', f'scale={w}:-2', dst)

# 3 e 4: quadros nítidos e tiras de movimento por cena
for i, (a, b, rot) in enumerate(cenas, 1):
    ts = [a + 0.12, (a + b) / 2, b - 0.12]; tmp = []
    for k, t in enumerate(ts):
        d = os.path.join(rv, f'_t{k}.jpg'); ext(t, d); tmp.append(d)
    grade(tmp, os.path.join(rv, f'c{i:02d}.jpg'), 3, 360, 640, [f'{i} {rot[:18]} {ts[0]:.1f}s', f'{ts[1]:.1f}s', f'{ts[2]:.1f}s'])
    sel = '+'.join(f'eq(n\\,{int((a + (b - a) * (k + .5) / 8) * FPS)})' for k in range(8))
    run('ffmpeg', '-loglevel', 'error', '-y', '-i', mp4, '-vf', f"select='{sel}',scale=135:240,drawbox=y=ih*0.88:w=iw:h=1:color=red@0.6,tile=8x1", '-frames:v', '1', '-fps_mode', 'passthrough', os.path.join(rv, f'tira{i:02d}.jpg'))
for f in glob.glob(os.path.join(rv, '_t*.jpg')): os.remove(f)

# 1: auditoria do motor
aud, q_aud = auditar()

# 2: saltos dentro do plano (diferença entre quadros vizinhos muito acima da mediana do plano, longe dos cortes)
cortes = [int(c[0] * FPS) for c in cenas]
r = run('ffmpeg', '-hide_banner', '-i', mp4, '-vf', "scale=180:320,select='gte(scene,0)',metadata=print:key=lavfi.scene_score", '-an', '-f', 'null', '-')
sc = [float(x) for x in re.findall(r'scene_score=([\d.]+)', r.stderr)]
saltos = []
for i, (a, b, rot) in enumerate(cenas, 1):
    fa, fb = int(a * FPS) + 3, int(b * FPS) - 3
    seg = sorted(sc[fa:fb]) or [0]; med = seg[len(seg) // 2]
    for n in range(fa, min(fb, len(sc))):
        if sc[n] > max(0.12, med * 6) and all(abs(n - c) > 3 for c in cortes):
            saltos.append((n, i, rot, sc[n]))
lin_s = [f'quadro {n} ({n / FPS:.2f}s) cena {i} "{rot}": salto {s:.2f}' for n, i, rot, s in saltos] or ['nenhum salto dentro de plano']

# 5: suspeitos (auditoria + saltos), quadros grandes para o revisor olhar de perto
susp = sorted(set(q_aud + [n for n, *_ in saltos]))[:8]
if susp:
    tmp = []
    for k, n in enumerate(susp):
        d = os.path.join(rv, f'_s{k}.jpg'); ext(n / FPS, d, 540); tmp.append(d)
    grade(tmp, os.path.join(rv, 'suspeitos.jpg'), 4, 405, 720, [f'q{n} {n / FPS:.1f}s' for n in susp])
    for f in tmp: os.remove(f)

# 6: medidas
fz = run('ffmpeg', '-hide_banner', '-i', mp4, '-vf', 'freezedetect=n=0.003:d=1.5', '-map', '0:v', '-f', 'null', '-').stderr
freezes = re.findall(r'freeze_start: ([\d.]+)', fz)
eb = run('ffmpeg', '-hide_banner', '-i', mp4, '-af', 'ebur128', '-f', 'null', '-').stderr
lufs = re.findall(r'I:\s+(-?[\d.]+) LUFS', eb); lufs = lufs[-1] if lufs else '?'
wav = os.path.join(rv, 'audio.wav'); run('ffmpeg', '-loglevel', 'error', '-y', '-i', mp4, '-ac', '1', '-ar', '16000', wav)
stt = json.loads(run('python3', os.path.join(R, 'ferramentas/stt.py'), wav, 'pt', 'small', timeout=900).stdout)
os.remove(wav)
ref, hyp = norm(texto_roteiro()), norm(stt['texto'])
sm = difflib.SequenceMatcher(a=ref, b=hyp)
dif = [f"{op}: roteiro '{' '.join(ref[i1:i2])}' / ouvido '{' '.join(hyp[j1:j2])}'" for op, i1, i2, j1, j2 in sm.get_opcodes() if op != 'equal']
open(os.path.join(rv, 'auditoria.txt'), 'w').write('\n'.join(aud))
open(os.path.join(rv, 'saltos.txt'), 'w').write('\n'.join(lin_s))
lin = [f'duração {dur:.2f} s (alvo 70–120)', f'tela parada >1,5 s: {freezes or "nenhuma"}', f'loudness integrada {lufs} LUFS (ideal -16 a -13)',
       f'STT small x roteiro: {sm.ratio() * 100:.0f}% igual; diferenças: {len(dif)}', *dif[:15],
       f'AUDITORIA DO MOTOR ({len(aud)} grupos):', *aud[:25], f'SALTOS DENTRO DO PLANO ({len(saltos)}):', *lin_s[:12],
       f'imagens: c01..c{len(cenas):02d}.jpg (3 quadros nítidos/cena), tira01..: movimento, ' + ('suspeitos.jpg' if susp else 'sem suspeitos'),
       'linha vermelha nas tiras = zona segura de baixo (botões do app)']
open(os.path.join(rv, 'medidas.txt'), 'w').write('\n'.join(lin))
print('\n'.join(lin))
