# ep61: palco do sorteio na praça (frente da prefeitura), globo com bolinhas, ventilador, balança, fusca-prêmio, noite.
SG = grp('sorteio', (12.6, 0, -2.2), parent=ST)
obj('palco', g_rbox(3.6, 0.6, 2.2, 0.05, 2), mat_toon('#8a5a34'), (0, 0.3, 0), parent=SG, ink=0.01)
for i in range(9): obj('tabua', g_box(3.58, 0.015, 0.02), mat_toon('#5c3a22'), (0, 0.605, -1.0 + i * 0.25), parent=SG, ink=0)
obj('saia_palco', g_box(3.62, 0.5, 0.03), mat_toon('#c23b32'), (0, 0.3, 1.11), parent=SG, ink=0.004)
for k in range(8): obj('gomo', g_box(0.42, 0.06, 0.035), mat_toon('#f2d24a'), (-1.6 + k * 0.45, 0.56, 1.12), parent=SG, ink=0)
obj('degrau1', g_box(0.8, 0.2, 0.35), mat_toon('#6e4a2c'), (-1.3, 0.1, 1.3), parent=SG, ink=0.005)
obj('degrau2', g_box(0.8, 0.4, 0.3), mat_toon('#6e4a2c'), (-1.3, 0.2, 1.0), parent=SG, ink=0.005)
# faixa no alto
for sx in (-1, 1): obj('mastro', g_cyl(0.04, 0.05, 4.2, 8), mat_toon('#2c2a33'), (sx * 1.7, 2.1 + 0.6, -0.9), parent=SG, ink=0.004)
obj('faixa', g_plane(3.3, 0.7), mat_tex('pl_sorteio', unlit=True), (0, 4.3, -0.88), parent=SG, ink=0.006)
# mesa + globo (gaiola de anéis) + ventilador + tubo de saída
obj('mesa', g_box(1.0, 0.06, 0.7), mat_toon('#f6efe2'), (0.2, 1.4, -0.2), parent=SG, ink=0.006)
for sx in (-1, 1):
    for sz in (-1, 1): obj('pe', g_cyl(0.025, 0.025, 0.8, 6), mat_toon('#2c2a33'), (0.2 + sx * 0.45, 1.0, -0.2 + sz * 0.3), parent=SG, ink=0.002, share='pe')
GLOBE = grp('globo', (0.2, 2.05, -0.2), parent=SG)
GM = mat_toon('#d9a32e', 0.25, 0.7)
for k in range(4): obj('anel', g_torus(0.5, 0.018, 40, 6), GM, (0, 0, 0), (0, k * math.pi / 4, P2), GLOBE, ink=0.003, share='anel')
obj('equador', g_torus(0.5, 0.02, 40, 6), GM, (0, 0, 0), (0, 0, 0), GLOBE, ink=0.003)
obj('eixo', g_cyl(0.03, 0.03, 1.2, 8), mat_toon('#2c2a33'), (0, 2.05, -0.2), (0, 0, P2), SG, ink=0.003)
obj('manivela', g_box(0.04, 0.3, 0.04), mat_toon('#c23b32'), (0.82, 2.05, -0.2), parent=SG, ink=0.003)
FAN = grp('fan', (0.2, 1.55, -0.2), parent=SG)
obj('fancaixa', g_torus(0.2, 0.02, 24, 6), mat_toon('#6b6f78'), (0, 0, 0), (0, 0, 0), FAN, ink=0.003)
FANB = grp('fanb', (0, 0.02, 0), parent=FAN)
for k in range(3): obj('pa', g_box(0.34, 0.01, 0.07), mat_toon('#b9bec8'), (0, 0, 0), (0, k * 2.09, 0.25), FANB, ink=0.002, share='pa')
obj('tubo', g_cyl(0.07, 0.07, 0.7, 12), mat_toon('#9fd6f5', 0.08, 0.6, '#9fd6f5', 0.15), (0.2, 2.85, -0.2), parent=SG, ink=0.004)
BALLS = []
for k in range(10):
    n = k + 1; b = obj(f'bola{n}', g_sphere(0.075, 14, 10), mat_tex(f'bola{n}', rough=0.3), (0, 0, 0), parent=GLOBE, ink=0.003)
    BALLS.append(b)
# balança da padaria no canto do palco
BAL = grp('balanca', (-0.9, 0.6, -0.4), parent=SG)
obj('bbase', g_rbox(0.5, 0.12, 0.35, 0.03, 2), mat_toon('#e8e2d6'), (0, 0.06, 0), parent=BAL, ink=0.005)
obj('bcol', g_box(0.08, 0.5, 0.08), mat_toon('#e8e2d6'), (0, 0.37, -0.12), parent=BAL, ink=0.003)
obj('bvisor', g_cyl(0.16, 0.16, 0.05, 24), mat_toon('#f6efe2'), (0, 0.66, -0.1), (P2, 0, 0), BAL, ink=0.004)
obj('bmostrador', g_plane(0.26, 0.26), mat_tex('balanca', unlit=True), (0, 0.66, -0.07), parent=BAL, ink=0)
BPONT = obj('bponteiro', g_box(0.012, 0.11, 0.005), mat_toon('#c23b32'), (0, 0.66, -0.06), parent=BAL, ink=0)
obj('bprato', g_cyl(0.16, 0.13, 0.03, 20), mat_toon('#b9bec8', 0.2, 0.8), (0, 0.14, 0.04), parent=BAL, ink=0.004)
BALLB = obj('bola_peso', g_sphere(0.075, 14, 10), mat_tex('bola4', rough=0.3), (0, 0.24, 0.04), parent=BAL, ink=0.003)
# fusca-prêmio com laço + placa
PRIZE, PWHEELS = make_car(SG, body='#e0483c', roof='#f6efe0', loc=(-3.2, 0, 2.6), ry=-0.5)
obj('laco', g_torus(0.28, 0.07, 20, 8), mat_toon('#f2d24a'), (0, 1.55, -0.25), (P2, 0, 0), PRIZE, ink=0.004)
obj('laco2', g_torus(0.28, 0.07, 20, 8), mat_toon('#f2d24a'), (0, 1.55, -0.25), (P2, P2, 0), PRIZE, ink=0.004)
obj('fita', g_box(1.6, 0.02, 0.12), mat_toon('#f2d24a'), (0, 1.42, -0.25), parent=PRIZE, ink=0)
PP = grp('pl_premio_g', (-2.6, 0, -0.4), parent=SG)
obj('ppost', g_cyl(0.035, 0.035, 2.0, 8), mat_toon('#6b6f78'), (0, 1.0, -0.07), parent=PP, ink=0.003)
obj('pplaca', g_plane(1.0, 0.5), mat_tex('pl_premio', unlit=True), (0, 2.15, 0.03), parent=PP, ink=0.006)
obj('pfundo', g_box(1.02, 0.52, 0.03), mat_toon('#2e2420'), (0, 2.15, 0), parent=PP, ink=0.004)
# placar do sobrinho
PL = grp('placar', (2.1, 0, 0.3), parent=SG)
obj('plpost', g_cyl(0.035, 0.035, 1.6, 8), mat_toon('#6b6f78'), (0, 0.8, -0.07), parent=PL, ink=0.003)
obj('plplaca', g_plane(0.9, 0.7), mat_tex('pl_placar', unlit=True), (0, 1.85, 0.03), parent=PL, ink=0.006)
obj('plfundo', g_box(0.92, 0.72, 0.03), mat_toon('#2e2420'), (0, 1.85, 0), parent=PL, ink=0.004)
# lanterna (feixe 3D + luz spot), só na madrugada
LANT = grp('lant', (0, 0, 0), parent=FXG)
# feixe visível removido (virava triângulo branco na frente da lente, folha 25/11); fica só a luz spot
_spl = bpy.data.lights.new('lantL', 'SPOT'); _spl.energy = 140; _spl.spot_size = 0.6; _spl.color = (1, 0.95, 0.75)
LANTL = bpy.data.objects.new('lantL', _spl); S.collection.objects.link(LANTL)
# noite = mesma rua, outra luz
SETS['night'] = ST; SET_X['night'] = 0; SET_LOOK['night'] = ('#41508a', 0.55, 0.9, (0.6, 0.7, 1.0))
_anim_street = animate_sets
def animate_sets(f, setname):
    _anim_street(f, 'street')
    S.view_settings.exposure = -0.7 if setname == 'night' else 0.45   # noite de verdade (folha 25/11: estava de dia)
    st = BYF.get(f, {}) if 'BYF' in globals() else {}; fx = st.get('fx') or {}
    t = f / 30.0; spin = fx.get('spin', 0.0)
    GLOBE.rotation_euler = (spin * t * 6.0, 0, 0)
    FANB.rotation_euler = (0, spin * t * 40.0, 0)
    up = fx.get('pula'); pn = fx.get('pn', 4)
    for k, b in enumerate(BALLS):
        a = k * 2.4 + t * (3.0 * spin + 0.3)
        b.location = (0.3 * math.cos(a), -0.32 + 0.12 * abs(math.sin(a * 1.7)) * (1 + 2 * spin), 0.3 * math.sin(a))
        if up is not None and k == pn - 1:
            b.location = (0, -0.3 + 1.25 * min(1.0, up), 0)  # sobe pelo tubo
    w = fx.get('peso')
    show(BALLB, w is not None)
    if w is not None: BPONT.rotation_euler = (0, 0, -w * 2.4)
    l = fx.get('lant'); show(LANT, l is not None); LANTL.hide_render = l is None
    if l:
        LANT.location = tuple(l['p']); LANT.rotation_euler = (0, 0, l.get('r', -1.2))
        LANTL.location = B(l['p']); LANTL.rotation_euler = (math.radians(90) + 0.6, 0, math.radians(-90) + l.get('r', -1.2) * 0.0)
    for wl in PWHEELS: wl.rotation_euler = (fx.get('roda', 0.0), 0, 0)
