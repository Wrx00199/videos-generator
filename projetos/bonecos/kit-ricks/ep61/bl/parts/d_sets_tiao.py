# Cenário fixo: RUA DA CIDADE (catálogo do Tião). Eixo da rua em X; casas do fundo em z=-6, da frente em z=+6 (viradas), prefeitura no fundo em x=16.
import random
RND = random.Random(11)
SETS, SET_X, SET_LOOK = {}, {}, {}
SET_X['street'] = 0; ST = grp('set_street'); SETS['street'] = ST
SET_LOOK['street'] = ('#bcd6ee', 0.85, 3.0, (1.0, 0.93, 0.82))
WHITE = mat_toon('#f4efe4', 0.5); DARK = mat_toon('#3a2a22'); WOOD = mat_toon('#8a5a34', 0.7); GLASS = mat_toon('#9fc6d8', 0.15, 0.6, '#cfe8f2', 0.25)
ROOFC = ['#7a3b2e', '#4f5866', '#6b4a3a', '#8a5a3a']
# chão
obj('rua', g_plane(80, 9.6), mat_tex('asfalto', rep=(8, 1)), (6, 0, 0), (-P2, 0, 0), ST, ink=0)
for zs in (-1, 1):
    obj('calc', g_box(80, 0.16, 2.2), mat_tex('calcada', rep=(40, 1)), (6, 0.08, zs * 5.9), parent=ST, ink=0.004)
    obj('meiofio', g_box(80, 0.18, 0.14), mat_toon('#d9d0c0'), (6, 0.09, zs * 4.82), parent=ST, ink=0.004)
obj('grama', g_plane(140, 80), mat_toon('#9cb86a', 0.95), (6, -0.01, -30), (-P2, 0, 0), ST, ink=0)

def janela(par, x, y, z, w=0.62, h=0.82, cort=None):
    g = grp('jan', (x, y, z), parent=par)
    obj('vid', g_box(w, h, 0.04), GLASS, (0, 0, 0), parent=g, ink=0)
    for dy in (-h / 2 - 0.04, h / 2 + 0.04): obj('mh', g_box(w + 0.16, 0.08, 0.08), WHITE, (0, dy, 0.03), parent=g, ink=0.004, share='mh%d' % int(w * 100))
    for dx in (-w / 2 - 0.03, w / 2 + 0.03): obj('mv', g_box(0.07, h + 0.1, 0.08), WHITE, (dx, 0, 0.03), parent=g, ink=0.004, share='mv%d' % int(h * 100))
    obj('cruz', g_box(0.035, h, 0.05), WHITE, (0, 0, 0.03), parent=g, ink=0, share='cz%d' % int(h * 100))
    obj('cruzh', g_box(w, 0.035, 0.05), WHITE, (0, 0.05, 0.03), parent=g, ink=0, share='ch%d' % int(w * 100))
    obj('peit', g_box(w + 0.24, 0.07, 0.16), WHITE, (0, -h / 2 - 0.1, 0.07), parent=g, ink=0.004, share='pt%d' % int(w * 100))
    if cort: obj('cort', g_box(w * 0.42, h * 0.8, 0.02), mat_toon(cort), (-w * 0.27, 0.02, 0.025), parent=g, ink=0)
    return g

def predio(x, z, rot, w, h, tex, roof, andares=2, loja=None, toldo=None):
    g = grp('predio', (x, 0, z), (0, rot, 0), ST)
    d = 3.2
    obj('massa', g_box(w, h, d), mat_toon('#a89884'), (0, h / 2, -d / 2), parent=g, ink=0.016)
    obj('fach', g_plane(w, h), mat_tex(tex, rep=(w / 2.5, h / 2.5)), (0, h / 2, 0.006), parent=g, ink=0)
    for sx in (-1, 1): obj('quina', g_box(0.14, h, 0.14), WHITE, (sx * w / 2, h / 2, 0.02), parent=g, ink=0.006)
    obj('corn', g_box(w + 0.3, 0.22, 0.4), WHITE, (0, h + 0.05, 0.08), parent=g, ink=0.008)
    obj('corn2', g_box(w + 0.1, 0.1, 0.25), mat_toon(roof), (0, h + 0.2, 0.05), parent=g, ink=0.006)
    obj('telh', g_box(w + 0.2, 0.9, d + 0.2), mat_toon(roof, 0.8), (0, h + 0.45, -d / 2), parent=g, ink=0.012)
    obj('chamine', g_box(0.35, 0.9, 0.35), mat_tex('tijolo'), (w * 0.28, h + 1.1, -d * 0.6), parent=g, ink=0.008)
    andar = h / andares
    for a in range(1, andares):
        obj('faixa', g_box(w, 0.09, 0.08), WHITE, (0, a * andar, 0.04), parent=g, ink=0.004)
        nj = max(2, int(w / 1.1))
        for i in range(nj):
            jx = -w / 2 + (i + 0.5) * w / nj
            janela(g, jx, a * andar + andar * 0.55, 0.03, cort=RND.choice([None, '#e8d27a', '#c96a6a', '#7aa7c9']))
            if RND.random() < 0.4: obj('vaso', g_box(0.5, 0.14, 0.18), mat_toon('#a0522d'), (jx, a * andar + andar * 0.12, 0.16), parent=g, ink=0.004)
    # térreo: porta com moldura + vitrine
    obj('porta', g_box(0.8, 1.6, 0.06), WOOD, (-w * 0.25, 0.8, 0.03), parent=g, ink=0.006)
    obj('pmold', g_box(1.0, 0.12, 0.1), WHITE, (-w * 0.25, 1.66, 0.05), parent=g, ink=0.004)
    obj('mac', g_sphere(0.04, 8, 6), mat_toon('#d9a32e', 0.3, 0.6), (-w * 0.25 + 0.28, 0.85, 0.08), parent=g, ink=0)
    janela(g, w * 0.18, 1.0, 0.03, w=min(1.4, w * 0.35), h=1.0)
    obj('degrau', g_box(1.1, 0.12, 0.4), mat_toon('#cfc4b2'), (-w * 0.25, 0.06, 0.2), parent=g, ink=0.004)
    if toldo:
        t = obj('toldo', g_box(w * 0.55, 0.05, 1.0), mat_tex(toldo, rep=(2, 1)), (w * 0.18, 1.78, 0.5), (-0.35, 0, 0), g, ink=0.006)
        obj('saia', g_plane(w * 0.55, 0.18), mat_tex(toldo, rep=(2, 1)), (w * 0.18, 1.55, 0.98), parent=g, ink=0)
    if loja: obj('placa', g_plane(min(w * 0.8, 2.4), 0.55), mat_tex(loja, unlit=True), (0, andar * 0.88 + 0.1, 0.08), parent=g, ink=0.006)
    return g

def varanda(par, w, x=0):
    g = grp('var', (x, 0, 0.2), parent=par)
    obj('piso', g_box(w, 0.14, 1.1), WOOD, (0, 0.07, 0.55), parent=g, ink=0.006)
    for i in range(int(w / 0.3) + 1): obj('balaus', g_box(0.04, 0.5, 0.04), WHITE, (-w / 2 + i * 0.3, 0.39, 1.06), parent=g, ink=0.002, share='bal')
    obj('corrim', g_box(w, 0.06, 0.08), WHITE, (0, 0.66, 1.06), parent=g, ink=0.003)
    for sx in (-1, 1): obj('poste', g_box(0.1, 2.0, 0.1), WHITE, (sx * w / 2, 1.0, 1.06), parent=g, ink=0.004)
    return g

# fileira do fundo (z=-6.9, virada pra rua) e da frente (z=+6.9, de costas pra câmera padrão)
FUNDO = [(-12, 3.0, 4.6, 'sid_azul', 'pl_barb', 'toldo_az'), (-8.6, 3.4, 5.6, 'sid_amar', None, None), (-4.9, 3.6, 4.8, 'sid_verm', 'pl_pad', 'toldo_vb'),
         (-1.2, 3.4, 6.0, 'sid_verde', None, None), (2.4, 3.4, 5.2, 'sid_creme', 'pl_bar', 'toldo_vd'), (6.0, 3.2, 4.4, 'sid_rosa', None, None),
         (9.4, 3.2, 5.4, 'tijolo', None, 'toldo_vb')]
for i, (x, w, h, tx, lj, td) in enumerate(FUNDO):
    p = predio(x, -6.9, 0, w, h, tx, ROOFC[i % 4], 2, lj, td)
    if lj is None and td is None: varanda(p, w * 0.7)
FRENTE = [(-10, 3.4, 5.0, 'sid_verde'), (-6.3, 3.6, 4.4, 'tijolo'), (-2.5, 3.4, 5.4, 'sid_azul'), (1.2, 3.6, 4.6, 'sid_amar'), (5.0, 3.6, 5.2, 'sid_verm'), (8.8, 3.4, 4.4, 'sid_creme')]
for i, (x, w, h, tx) in enumerate(FRENTE): predio(x, 6.9, math.pi, w, h, tx, ROOFC[(i + 2) % 4], 2, None, 'toldo_vd' if i % 2 else None)

# PREFEITURA no fim da rua (x=16), larga, com colunas, frontão e relógio
PF = grp('prefeitura', (16, 0, -7.4), parent=ST)
obj('pmassa', g_box(7.5, 6.2, 4), mat_tex('tijolo', rep=(3, 2)), (0, 3.1, -2), parent=PF, ink=0.016)
obj('pfach', g_plane(7.5, 6.2), mat_tex('tijolo', rep=(4, 3)), (0, 3.1, 0.006), parent=PF, ink=0)
obj('escada', g_box(4.2, 0.3, 1.6), mat_toon('#e6dccb'), (0, 0.15, 0.8), parent=PF, ink=0.006)
obj('escada2', g_box(3.6, 0.3, 1.0), mat_toon('#e6dccb'), (0, 0.45, 0.5), parent=PF, ink=0.006)
for cx in (-1.6, -0.55, 0.55, 1.6): obj('col', g_cyl(0.16, 0.19, 3.2, 14), WHITE, (cx, 2.2, 1.1), parent=PF, ink=0.006, smooth=True, share='col')
obj('vigaf', g_box(4.2, 0.4, 0.5), WHITE, (0, 3.95, 1.1), parent=PF, ink=0.008)
fr = bmesh.new(); vs = [fr.verts.new(v) for v in [(-2.3, 0, 0), (2.3, 0, 0), (0, 1.2, 0)]]; fr.faces.new(vs)
obj('frontao', fr, WHITE, (0, 4.15, 1.2), parent=PF, ink=0.01)
obj('pplaca', g_plane(3.6, 1.05), mat_tex('pl_pref', unlit=True), (0, 4.85, 0.03), parent=PF, ink=0.006)
TORRE = grp('torre', (0, 6.2, -1.2), parent=PF)
obj('tbase', g_box(2.0, 2.2, 2.0), mat_toon('#efe2c4'), (0, 1.1, 0), parent=TORRE, ink=0.012)
obj('trel', g_circle(0.8), mat_tex('relogio', unlit=True), (0, 1.25, 1.02), parent=TORRE, ink=0.006)
PONT = obj('pont', g_box(0.05, 0.6, 0.03), DARK, (0, 1.25, 1.06), parent=TORRE, ink=0)
obj('tteto', g_cone(1.5, 1.4, 4), mat_toon('#4f5866'), (0, 2.9, 0), (0, math.pi / 4, 0), TORRE, ink=0.01)
obj('mastro', g_cyl(0.03, 0.03, 1.4, 6), DARK, (0, 4.2, 0), parent=TORRE, ink=0.003)
BAND = obj('bandeira', g_plane(0.8, 0.5), mat_toon('#3f8f5a'), (0.42, 4.6, 0), parent=TORRE, ink=0.004)
for jx in (-2.8, 2.8):
    for jy in (1.6, 4.0): janela(PF, jx, jy, 0.03, w=0.8, h=1.1, cort='#e8d27a')
obj('pporta', g_box(1.3, 2.2, 0.06), WOOD, (0, 1.7, 0.03), parent=PF, ink=0.006)
# bandeirinhas de festa atravessando a rua
BANDS = []
for k, bx in enumerate((-7, -1, 5, 11)):
    for i in range(14):
        t = i / 13; z = -5.0 + t * 10.0; y = 4.0 - 0.7 * math.sin(t * math.pi)
        b = obj('bandi', g_cone(0.16, 0.32, 3), mat_toon(['#d23c35', '#f2d24a', '#3f6fb0', '#3f8f5a', '#f6efe2'][(i + k) % 5]), (bx, y, z), (math.pi, P2, 0), ST, ink=0.003)
        BANDS.append((b, i * 0.7 + k))
    obj('fio', g_cyl(0.008, 0.008, 10, 4), DARK, (bx, 3.85, 0), (P2, 0, 0), ST, ink=0)
# postes, árvores, tralha 3D na calçada
for i in range(8):
    for zs in (-1, 1):
        x = -12 + i * 3.6 + (1.8 if zs > 0 else 0); lp = grp('lamp', (x, 0, zs * 5.0), parent=ST)
        obj('post', g_cyl(0.05, 0.07, 3.0, 10), mat_toon('#2c2a33'), (0, 1.5, 0), parent=lp, ink=0.005, share='post')
        obj('braco', g_box(0.5, 0.05, 0.05), mat_toon('#2c2a33'), (0.2 * -zs, 2.95, 0), parent=lp, ink=0.003, share='braco')
        obj('bulb', g_sphere(0.13, 12, 10), mat_emit('#fff1c4', 2.0), (0.42 * -zs, 2.85, 0), parent=lp, ink=0.004, share='bulb')
TREES = []
for x in (-10.4, -3.1, 4.3, 11.5):
    tr_ = grp('arv', (x, 0, -5.2), parent=ST)
    obj('tronco', g_cyl(0.1, 0.15, 1.8, 8), mat_toon('#6a4428'), (0, 0.9, 0), parent=tr_, ink=0.006, share='tronco')
    c = grp('copa', (0, 2.3, 0), parent=tr_); TREES.append(c)
    for j, (dx, dy, r) in enumerate([(0, 0, 0.75), (-0.45, -0.2, 0.55), (0.45, -0.15, 0.55), (0, 0.45, 0.5)]):
        obj('folha', g_sphere(r, 14, 10), mat_toon(['#4f9a45', '#5fae52', '#468a3e'][j % 3]), (dx, dy, 0), parent=c, ink=0.01, smooth=True)
def barril(x, z):
    b = grp('barril', (x, 0, z), parent=ST); obj('bc', g_cyl(0.26, 0.24, 0.7, 14), WOOD, (0, 0.35, 0), parent=b, ink=0.006, smooth=True, share='barril')
    for y in (0.12, 0.58): obj('aro', g_torus(0.262, 0.02, 20, 4), DARK, (0, y, 0), parent=b, ink=0, share='aro')
for x, z in [(-6.0, -5.5), (-5.5, -5.4), (3.5, -5.5), (12.6, -5.6), (-2.0, 5.6), (7.0, 5.5)]: barril(x, z)
for x, z in [(-1.0, -5.6), (8.0, -5.5), (-8.0, 5.6)]:
    obj('caixote', g_box(0.55, 0.45, 0.55), mat_toon('#b07a46'), (x, 0.22, z), (0, RND.random(), 0), ST, ink=0.006, share='cx')
    obj('caixote2', g_box(0.45, 0.38, 0.45), mat_toon('#c48a52'), (x + 0.1, 0.64, z), (0, RND.random(), 0), ST, ink=0.006, share='cx2')
for x in (-4.0, 6.8): obj('banco', g_box(1.4, 0.08, 0.4), WOOD, (x, 0.45, -5.3), parent=ST, ink=0.005); obj('bpes', g_box(1.3, 0.45, 0.3), DARK, (x, 0.22, -5.3), parent=ST, ink=0.004)
HID = grp('hidrante', (1.0, 0, -5.2), parent=ST); obj('h1', g_cyl(0.12, 0.14, 0.55, 12), mat_toon('#d23c35', 0.4), (0, 0.27, 0), parent=HID, ink=0.005, smooth=True); obj('h2', g_sphere(0.13, 12, 8), mat_toon('#d23c35', 0.4), (0, 0.56, 0), parent=HID, ink=0.005, smooth=True)
obj('lixo', g_cyl(0.22, 0.2, 0.75, 14), mat_toon('#4f6b5a'), (-11.0, 0.37, -5.4), parent=ST, ink=0.006, smooth=True)
# placa da lei no meio da calçada (poste + placa) e seta
LEI = grp('lei', (1.6, 0, -4.6), parent=ST)
obj('lpost', g_cyl(0.04, 0.04, 2.0, 8), mat_toon('#6b6f78'), (0, 1.0, -0.07), parent=LEI, ink=0.004)
obj('lplaca', g_plane(0.9, 0.9), mat_tex('pl_lei', unlit=True), (0, 2.2, 0.03), parent=LEI, ink=0.006)
obj('lfundo', g_box(0.92, 0.92, 0.03), mat_toon('#2e2420'), (0, 2.2, 0), parent=LEI, ink=0.004)
SETA = grp('seta', (-7.5, 0, -4.7), parent=ST); obj('spost', g_cyl(0.04, 0.04, 2.2, 8), mat_toon('#6b6f78'), (0, 1.1, -0.07), parent=SETA, ink=0.004)
obj('splaca', g_plane(1.1, 0.37), mat_tex('pl_seta', unlit=True), (0, 2.1, 0.03), parent=SETA, ink=0.006)
# carro estacionado do lado da frente (não cruza a ação)
CAR, WHEELS = make_car(ST, loc=(-4.5, 0, 4.1), ry=P2)
# fundo distante: morros, caixa d'água, névoa em camadas
for i in range(7): obj('morro', g_sphere(1, 16, 10), mat_toon(['#8fae7a', '#9cb88a', '#a7c299'][i % 3], 0.95), (-24 + i * 9, -1.5, -26 - (i % 3) * 5), parent=ST, ink=0.0, smooth=True).scale = (7, 4 + (i % 2) * 2, 3)
CX = grp('caixadagua', (-14, 0, -16), parent=ST)
for sx in (-0.7, 0.7):
    for sz in (-0.7, 0.7): obj('perna', g_cyl(0.06, 0.06, 6, 6), WOOD, (sx, 3, sz), parent=CX, ink=0.004, share='perna')
obj('tanque', g_cyl(1.2, 1.2, 1.8, 18), mat_toon('#9a6a44'), (0, 6.9, 0), parent=CX, ink=0.01); obj('tteto2', g_cone(1.35, 0.8, 18), mat_toon('#5c4a3e'), (0, 8.2, 0), parent=CX, ink=0.008)
for zz, a in ((-12, 0.7), (-20, 1.0)): obj('nevoa', g_plane(120, 10), mat_tex('nevoa', alpha=True, unlit=True), (6, 3.5, zz), parent=ST, ink=0, shadow=False)
CLOUDS = []
for i in range(6):
    c = grp('nuvem', (-20 + i * 9, 13 + (i % 3), -30), parent=ST); CLOUDS.append(c)
    for j in range(4): obj('nuv', g_sphere(1.6 - j * 0.2, 14, 10), mat_toon('#fbf8f2', 0.9), (j * 1.5 - 2.2, (j % 2) * 0.6, 0), parent=c, ink=0.008, smooth=True, share='nuv%d' % j)
BIRDS = []
for i in range(6):
    b = grp('ave', (0, 0, 0), parent=ST); obj('acorpo', g_sphere(0.09, 10, 8), mat_toon('#2e2a2a'), parent=b, ink=0.003, share='acorpo')
    ws = [obj('asa', g_plane(0.26, 0.09), mat_toon('#2e2a2a'), (s * 0.14, 0, 0), parent=b, ink=0, share='asa') for s in (-1, 1)]
    BIRDS.append((b, ws, RND.random() * 6))

def animate_sets(f, setname):
    if setname != 'street': return
    t = f / 30.0
    for i, c in enumerate(CLOUDS): c.location = ((-20 + i * 9) + f * 0.012, c.location[1], c.location[2])
    for b, ph in BANDS: b.rotation_euler = (math.pi + 0.18 * math.sin(t * 3 + ph), P2, 0)
    for i, c in enumerate(TREES): c.rotation_euler = (0, 0, 0.025 * math.sin(t * 1.3 + i))
    BAND.rotation_euler = (0, 0.25 * math.sin(t * 4), 0); PONT.rotation_euler = (0, 0, -t * 0.5)
    for i, (b, ws, ph) in enumerate(BIRDS):
        a = t * 0.5 + ph; b.location = (2 + 9 * math.cos(a), 7.5 + 0.6 * math.sin(a * 3), -8 + 3 * math.sin(a)); b.rotation_euler = (0, -a, 0)
        for s, w in zip((-1, 1), ws): w.rotation_euler = (0, 0, s * 0.6 * math.sin(t * 14 + ph))
    for w in WHEELS: w.rotation_euler = (0, 0, 0)
    # FX vindos do story (fxAt): fumaça de chaminé sempre, choque/estrela no impacto
    st = BYF.get(f, {}) if 'BYF' in globals() else {}; fx = st.get('fx') or {}
    for k, p in enumerate(SMOKE):
        u = (t * 0.25 + k / len(SMOKE)) % 1.0; show(p['o'], True)
        p['o'].location = (-8.6 + 1.0 + u * 0.6, 6.6 + u * 2.2, -8.6); s_ = 0.15 + u * 0.45; p['o'].scale = (s_,) * 3; set_alpha(p['m'], 0.7 * (1 - u))
    hit = fx.get('hit')
    for k, p in enumerate(CRASHP):
        if hit is None: show(p['o'], False); continue
        u = min(1.0, hit['u']); r = p['r']; show(p['o'], u < 1)
        p['o'].location = (hit['x'] + (r[0] - 0.5) * 1.6 * u, 0.15 + r[1] * 0.6 * u, hit['z'] + (r[2] - 0.5) * 0.8 * u); s_ = 0.1 + 0.3 * u; p['o'].scale = (s_,) * 3; set_alpha(p['m'], 0.9 * (1 - u))
    for k, rg in enumerate(RINGS):
        if hit is None or k > 1: show(rg['o'], False); continue
        u = min(1.0, hit['u'] * 1.6 - k * 0.3); show(rg['o'], 0 < u < 1)
        rg['o'].location = (hit['x'], 1.4, hit['z'] + 0.1); rg['o'].scale = (0.2 + u * 0.9,) * 3; rg['o'].rotation_euler = (0, 0, u * 2); set_alpha(rg['m'], 1 - u)
    bg_ = fx.get('bang'); show(BANG, bg_ is not None)
    if bg_: BANG.location = tuple(bg_['p']); s_ = bg_.get('s', 1.0); BANG.scale = (s_,) * 3; BANG.rotation_euler = (0, 0, bg_.get('r', 0))
    sw = fx.get('sweat')
    for k, d in enumerate(SWEAT):
        if not sw or k > 0: show(d, False); continue
        show(d, True); d.location = (sw['p'][0], sw['p'][1] - 0.25 * (sw['u'] % 1), sw['p'][2])
