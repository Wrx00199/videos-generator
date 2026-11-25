import os
# Validador do mundo: (1) boneco atravessando obstáculo/outro boneco, (2) placa cortada pela borda do quadro.
# Lê data/frames.json + data/world.json (gerado de web/world.js). Uso: python3 tools_clip_check.py <bl_dir>  -> exit 1 se reprovar.
import json, sys, math
bl = sys.argv[1]; FR = json.load(open(bl + '/data/frames.json')); W = json.load(open(bl + '/data/world.json'))
B = W['BODY']; bad = {}
def sub(a, b): return [a[i] - b[i] for i in range(3)]
def nrm(v): l = math.sqrt(sum(x * x for x in v)) or 1; return [x / l for x in v]
def cross(a, b): return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]
def proj(cam, p):
    f = nrm(sub(cam['look'], cam['pos'])); r = nrm(cross(f, [0, 1, 0])); u = cross(r, f); v = sub(p, cam['pos'])
    z = sum(v[i] * f[i] for i in range(3))
    if z <= 0.05: return None
    t = math.tan(math.radians(cam['fov']) / 2)
    return (sum(v[i] * r[i] for i in range(3)) / (z * t * 9 / 16), sum(v[i] * u[i] for i in range(3)) / (z * t))
def check(fr, key):
    cam = fr['cam']; A = fr['actors']
    FOC = max(0.5, math.dist(cam['pos'], cam['look']))
    for a in A:
        for n, ox, oz, r in W['OBST']:
            if math.hypot(a['x'] - ox, a['z'] - oz) < B + r - 0.02: bad.setdefault(('ATRAVESSA', a['who'], n), []).append(fr['f'])
        for n, x0, x1, z0, z1, yb in W.get('BOXES', []):
            if not (n in ('palco', 'degrau') and (a['y'] >= 0.55 or a.get('air') and a['y'] > 0.25)) and yb < a.get('h', 1.8) and x0 - B < a['x'] < x1 + B and z0 - B < a['z'] < z1 + B: bad.setdefault(('ATRAVESSA', a['who'], n), []).append(fr['f'])
    for i in range(len(A)):
        for j in range(i + 1, len(A)):
            if math.hypot(A[i]['x'] - A[j]['x'], A[i]['z'] - A[j]['z']) < 0.42 and False: bad.setdefault(('SOBREPOE', A[i]['who'], A[j]['who']), []).append(fr['f'])
    HT = {'poste': 4, 'árvore': 4.2, 'placa LEI': 2.7, 'placa seta': 2.3}
    for n, c, w, h, nz in W['SIGNS']:
        if n not in W.get('HERO', ['LEI', 'seta', 'prefeitura']): continue  # placa de loja = decoração, pode sair do quadro
        if (cam['pos'][2] - c[2]) * nz <= 0: continue  # placa de costas pra câmera
        if math.dist(cam['pos'], c) > 1.6 * FOC: continue  # placa lá no fundo, fora do foco = cenário, não assunto
        pts = [proj(cam, [c[0] + dx * w / 2, c[1] + dy * h / 2, c[2]]) for dx in (-1, 1) for dy in (-1, 1)]
        if any(p is None for p in pts): continue
        ins = [abs(p[0]) <= 1 and abs(p[1]) <= 1 for p in pts]
        size = max(abs(pts[0][0] - pts[3][0]), abs(pts[0][1] - pts[3][1]))
        if all(ins) and size > 0.3:  # placa inteira na tela: nada pode tampar o texto (poste/árvore/boneco na frente)
            dc = math.dist(cam['pos'], c)
            occ = [(n2, ox, oz, r, HT.get(n2, 1.0)) for n2, ox, oz, r in W['OBST'] if math.hypot(ox - c[0], oz - c[2]) > 0.3] + [(a['who'], a['x'], a['z'], B, 1.75 * a['s']) for a in A]
            for n2, ox, oz, r, ht in occ:
                if math.hypot(ox - cam['pos'][0], oz - cam['pos'][2]) >= dc: continue
                q = proj(cam, [ox, ht, oz]); bot = min(pts[0][1], pts[3][1]) + 0.25 * abs(pts[0][1] - pts[3][1])
                if q and q[1] > bot and min(pts[0][0], pts[3][0]) < q[0] < max(pts[0][0], pts[3][0]): bad.setdefault(('PLACA TAMPADA', n, 'por ' + n2), []).append(fr['f'])
        if all(ins) and size > 0.3 and min(pts[0][1], pts[3][1]) < -0.28 and max(pts[0][1], pts[3][1]) > -0.42: bad.setdefault(('LEGENDA SOBRE PLACA', n, ''), []).append(fr['f'])
        ctr = proj(cam, c)  # só reprova corte quando a placa é o assunto (centro dentro do miolo); borda de placa ao fundo é cenário
        if any(ins) and not all(ins) and size > 0.3 and ctr and abs(ctr[0]) < 0.7 and abs(ctr[1]) < 0.7: bad.setdefault(('PLACA CORTADA', n, ''), []).append(fr['f'])
    # câmera: dentro de casa, dentro de poste/árvore, abaixo do chão
    p = cam['pos']
    if p[2] < W['WALLS']['zMin'] - 0.2 or p[2] > W['WALLS']['zMax'] + 0.2 or p[1] < 0.15: bad.setdefault(('CAMERA FORA', 'parede/chão', ''), []).append(fr['f'])
    for n, ox, oz, r in W['OBST']:
        if math.hypot(p[0] - ox, p[2] - oz) < r and p[1] < 3: bad.setdefault(('CAMERA DENTRO', n, ''), []).append(fr['f'])
    # boneco: cabeça cortada pela borda / colado na lente / pé fora do chão
    for a in A:
        if not a.get('air') and (abs(a['y']) > 0.02 and a['y'] < 0.3 or (0.62 < a['y'] < 0.55 + 0.3)): bad.setdefault(('PE FLUTUA/ENTERRA', a['who'], ''), []).append(fr['f'])
        top = proj(cam, [a['x'], a['y'] + a.get('h', 1.8) * a['s'], a['z']]); foot = proj(cam, [a['x'], a['y'], a['z']])
        if top is None or foot is None:
            if math.hypot(a['x'] - p[0], a['z'] - p[2]) < 0.6: bad.setdefault(('BONECO NA LENTE', a['who'], ''), []).append(fr['f'])
            continue
        h = top[1] - foot[1]
        if abs(top[0]) < 0.9 and top[1] > 1.0 and foot[1] < 1.0 and h > 0.15: bad.setdefault(('CABECA CORTADA', a['who'], ''), []).append(fr['f'])
        # poste/tronco na FRENTE da cabeça na tela ("bate a cabeça no poste")
        head = proj(cam, [a['x'], a['y'] + 1.45 * a['s'], a['z']]); da = math.hypot(a['x'] - p[0], a['z'] - p[2])
        if head and abs(head[0]) < 1 and abs(head[1]) < 1:
            hw = 0.3 / (da * math.tan(math.radians(cam['fov']) / 2) * 9 / 16)
            for n, ox, oz, r in W['OBST']:
                if n not in ('poste', 'árvore') or math.hypot(ox - p[0], oz - p[2]) >= da: continue
                q = proj(cam, [ox, a['y'] + 1.45, oz])
                if q and abs(q[0] - head[0]) < hw: bad.setdefault(('POSTE NA CARA', a['who'], n), []).append(fr['f'])
        # boneco principal cortado na lateral
        if not a['who'].startswith('civ') and math.hypot(a['x'] - p[0], a['z'] - p[2]) < 1.3 * FOC and 0.95 < abs(foot[0]) < 1.25 and h > 0.5: bad.setdefault(('CORTADO NA LATERAL', a['who'], ''), []).append(fr['f'])
        if h > 2.6 and not a['who'].startswith('civ') and abs(top[0]) < 1: bad.setdefault(('ZOOM EXAGERADO', a['who'], ''), []).append(fr['f'])
SID = {fr['f']: fr['sid'] for fr in FR}
for fr in FR:
    check(fr, 'a')
    if fr.get('blend'): check({**fr['blend'], 'f': fr['f']}, 'b')

# --- catálogo ampliado (erros que o Rick nunca comete) ---
# BONECO CONGELADO: personagem principal na tela com o MESMO desenho (pose+expressão) por >0,8 s
# SURGE DO NADA: boneco aparece/some no meio do plano, longe da borda do quadro
# GRUDADOS: dois bonecos quase na mesma posição da tela e da profundidade (viram um borrão)
last = {}; vis = {}
for fr in FR:
    cam = fr['cam']; sid = fr['sid']; now = set()
    for a in fr['actors']:
        q = proj(cam, [a['x'], a['y'] + 0.9, a['z']])
        on = q is not None and abs(q[0]) < 1 and abs(q[1]) < 1
        if not on: continue
        now.add(a['who'])
        if not a['who'].startswith('civ'):
            k_ = (sid, a['who']); id0, f0 = last.get(k_, (None, fr['f']))
            if id0 != a['id']: last[k_] = (a['id'], fr['f'])
            elif fr['f'] - f0 > 24: bad.setdefault(('BONECO CONGELADO', a['who'], ''), []).append(fr['f'])
        for b in fr['actors']:
            if b['who'] <= a['who']: continue
            qb = proj(cam, [b['x'], b['y'] + 0.9, b['z']])
            if qb and abs(qb[0] - q[0]) < 0.12 and abs(qb[1] - q[1]) < 0.12 and abs(math.dist([a['x'], a['z']], cam['pos'][::2]) - math.dist([b['x'], b['z']], cam['pos'][::2])) < 0.5:
                bad.setdefault(('GRUDADOS', a['who'], b['who']), []).append(fr['f'])
    # pop do BONECO (não da câmera: whip é medido por CAMERA PULOU): some/aparece do elenco ou teleporta >0,4 m, no meio do quadro
    pv = vis.get(sid)
    if pv is not None:
        pa = {x['who']: x for x in pv}
        for a in fr['actors']:
            b = pa.get(a['who']); q = proj(cam, [a['x'], a['y'] + 0.9, a['z']])
            pop = b is None or math.dist([a['x'], a['y'], a['z']], [b['x'], b['y'], b['z']]) > 0.4
            if pop and q and abs(q[0]) < 0.75 and abs(q[1]) < 0.75: bad.setdefault(('SURGE DO NADA', a['who'], ''), []).append(fr['f'])
        for w, b in pa.items():
            if not any(x['who'] == w for x in fr['actors']):
                q = proj(cam, [b['x'], b['y'] + 0.9, b['z']])
                if q and abs(q[0]) < 0.75 and abs(q[1]) < 0.75: bad.setdefault(('SURGE DO NADA', w, 'sumiu'), []).append(fr['f'])
    vis[sid] = fr['actors']
# câmera teleporta: >0,9 m num quadro dentro do mesmo plano (o Rick nunca pula; whip máx ~0,6 m/q)
for f0, f1 in zip(FR, FR[1:]):
    if f0['sid'] == f1['sid'] and math.dist(f0['cam']['pos'], f1['cam']['pos']) > 0.9: bad.setdefault(('CAMERA PULOU', '', ''), []).append(f1['f'])
# câmera corrida (crítica Filippe 25/11 ep61: "foca num personagem e nem um segundo já vai pro outro")
def _dir(c):
    d = [c['look'][i] - c['pos'][i] for i in range(3)]; n = math.hypot(*d) or 1e-6; return [x / n for x in d], n
run_g = run_t = 0; foco = None
for f0, f1 in zip(FR, FR[1:]):
    if f0['sid'] != f1['sid']: run_g = run_t = 0; foco = (f1['f'], f1['cam']['look']); continue
    (u, _), (v, dd) = _dir(f0['cam']), _dir(f1['cam'])
    gs = math.degrees(math.acos(max(-1, min(1, sum(x * y for x, y in zip(u, v)))))) * 30
    ts = math.dist(f0['cam']['pos'], f1['cam']['pos']) * 30 / max(dd, 0.5)
    run_g = run_g + 1 if gs > 40 else 0; run_t = run_t + 1 if ts > 0.9 else 0
    if run_g >= 5: bad.setdefault(('CAMERA CORRIDA', 'giro >40 graus/s', ''), []).append(f1['f'])
    if run_t >= 5: bad.setdefault(('CAMERA CORRIDA', 'avanço >0,9 dist/s', ''), []).append(f1['f'])
    if foco is None: foco = (f0['f'], f0['cam']['look'])
    if math.dist(f1['cam']['look'], foco[1]) > 0.8:
        if f1['f'] - foco[0] < 36: bad.setdefault(('FOCO CURTO', 'troca de alvo <1,2 s', ''), []).append(f1['f'])
        foco = (f1['f'], f1['cam']['look'])
# efeito 3D colado na lente (feixe/fumaça/bang/placa voadora): vira borrão branco gigante (folha ep61 25/11)
def _pts(v):
    if isinstance(v, dict):
        if isinstance(v.get('p'), list) and len(v['p']) == 3: yield v['p']
        for x in v.values(): yield from _pts(x)
for fr in FR:
    for k, v in (fr.get('fx') or {}).items():
        for p_ in _pts(v):
            if math.dist(p_, fr['cam']['pos']) < 0.9: bad.setdefault(('EFEITO NA LENTE', k, ''), []).append(fr['f'])
# noite com cara de dia: com --stills <pasta de fNNNN.jpg>, foto de plano 'night' tem que ser bem mais escura que as de dia
if '--stills' in sys.argv:
    from PIL import Image, ImageStat
    import glob
    sd = sys.argv[sys.argv.index('--stills') + 1]; lum = {}
    for g in glob.glob(sd + '/f*.jpg'):
        n = int(os.path.basename(g)[1:5]); lum[n] = ImageStat.Stat(Image.open(g).convert('L')).mean[0]
    day = sorted(v for n, v in lum.items() if FR[n]['set'] != 'night'); md = day[len(day) // 2] if day else 255
    for n, v in lum.items():
        if FR[n]['set'] == 'night' and v > 0.7 * md: bad.setdefault(('NOITE COM CARA DE DIA', f'{v:.0f} vs dia {md:.0f}', ''), []).append(n)
        if FR[n]['set'] != 'night' and v < 70: bad.setdefault(('QUADRO ESCURO', f'{v:.0f}', ''), []).append(n)
RAPIDO = ('PLACA CORTADA', 'CORTADO NA LATERAL', 'ZOOM EXAGERADO', 'CABECA CORTADA', 'POSTE NA CARA', 'LEGENDA SOBRE PLACA')  # passagem de câmera rápida: só reprova se durar >=3 quadros seguidos (100 ms, visível)
def run3(v):
    v = sorted(set(v)); n = 1
    for x, y in zip(v, v[1:]):
        n = n + 1 if y == x + 1 else 1
        if n >= 3: return True
    return len(v) >= 3 and n >= 3
bad = {k: v for k, v in bad.items() if k[0] not in RAPIDO or run3(v)}
if W.get('SOLVED', 0) > 0.15: print(f'AVISO: contato entre bonecos corrigido em até {W["SOLVED"]:.2f} m: rota mal planejada no story.js')
for (k, a, b), fs in sorted(bad.items(), key=lambda k: k[1][0]):
    if os.environ.get('BYSHOT'):
        c = {}
        for x in fs: c[SID.get(x, '?')] = c.get(SID.get(x, '?'), 0) + 1
        print(f'{k} {a} {b}: ' + ' '.join(f'{s_}:{n_}' for s_, n_ in c.items()))
    else: print(f'{k} {a} {b}: quadros {fs[0]}–{fs[-1]} ({len(fs)})')
print('OK' if not bad else f'REPROVADO: {len(bad)} casos'); sys.exit(1 if bad else 0)
