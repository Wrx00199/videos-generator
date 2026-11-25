# Blender stage, part 1: render setup, toon materials, ink outlines, geometry helpers.
# The 3D world is built from simple shapes in three.js Y-up coordinates (under ROOT) so the camera plan from the browser
# drops straight in. Characters stay 2D cards; everything else is real 3D.
# Run (after build.py):  blender -b -P scene.py -- --data data --out frames --frames 0-449 [--engine EEVEE|CYCLES|WORKBENCH] [--scale 1.0] [--samples 16] [--resume]
#              demo:     blender -b -P scene.py -- --demo --out demo        (no browser export needed: renders 3 stills of the example set)
import bpy, bmesh, json, math, os, sys, random
from mathutils import Vector, Quaternion, Matrix

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(k, d):
    return argv[argv.index(k) + 1] if k in argv else d
DATA = os.path.abspath(arg('--data', 'out')); OUT = os.path.abspath(arg('--out', 'frames'))
ENGINE = arg('--engine', 'EEVEE'); SCALE = float(arg('--scale', '1')); SAMPLES = int(arg('--samples', '16'))
spec = arg('--frames', '0-449'); FR = []
for part in spec.split(','):
    if '-' in part: a, b = map(int, part.split('-')); FR += list(range(a, b + 1))
    else: FR.append(int(part))
RESUME = '--resume' in argv
INKX = float(arg('--ink', '2.6'))
os.makedirs(OUT, exist_ok=True)
DEMO = '--demo' in argv
FRAMES = [] if DEMO else json.load(open(os.path.join(DATA, 'frames.json')))
ASPECT = arg('--aspect', '9:16')   # 9:16 Shorts or 16:9 longform

bpy.ops.wm.read_factory_settings(use_empty=True)
S = bpy.context.scene
S.render.resolution_x, S.render.resolution_y = (int(1080 * SCALE), int(1920 * SCALE)) if ASPECT == '9:16' else (int(1920 * SCALE), int(1080 * SCALE))
S.render.fps = 30
S.render.image_settings.file_format = 'JPEG'; S.render.image_settings.quality = 95
S.view_settings.view_transform = 'Standard'; S.view_settings.look = 'None'; S.view_settings.exposure = 0.45
if ENGINE == 'WORKBENCH':   # fast motion proxy for the QA gate only
    S.render.engine = 'BLENDER_WORKBENCH'; S.display.shading.light = 'STUDIO'; S.display.shading.color_type = 'TEXTURE'
    S.display.render_aa = 'OFF'
elif ENGINE == 'CYCLES':
    S.render.engine = 'CYCLES'; S.cycles.samples = SAMPLES; S.cycles.use_denoising = True
    try:
        pref = bpy.context.preferences.addons['cycles'].preferences; pref.compute_device_type = 'CUDA'; pref.get_devices()
        for d in pref.devices: d.use = True
        S.cycles.device = 'GPU' if any(d.type != 'CPU' for d in pref.devices) else 'CPU'
    except Exception: S.cycles.device = 'CPU'
else:
    try: S.render.engine = 'BLENDER_EEVEE'
    except TypeError: S.render.engine = 'BLENDER_EEVEE_NEXT'   # Blender 4.2
    ee = S.eevee
    for k, v in [('taa_render_samples', SAMPLES), ('use_shadows', True), ('use_raytracing', True), ('shadow_ray_count', 2), ('shadow_step_count', 6), ('use_gtao', True)]:
        try: setattr(ee, k, v)
        except Exception: pass
    if '--lite' in argv:   # Linux/RX550: sem raytracing/AO, sombra mínima
        for k, v in [('use_raytracing', False), ('use_gtao', False), ('shadow_ray_count', 1), ('shadow_step_count', 2)]:
            try: setattr(ee, k, v)
            except Exception: pass
    try: ee.ray_tracing_options.resolution_scale = '2'
    except Exception: pass

def hexc(h, a=1.0):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c) + (a,)   # sRGB -> linear

# ---------------- world light ----------------
W = bpy.data.worlds.new('W'); S.world = W; W.use_nodes = True
bg = W.node_tree.nodes['Background']; bg.inputs[0].default_value = hexc('#c9b8b0'); bg.inputs[1].default_value = 0.5

# ---------------- materials ----------------
MATS = {}
def mat_toon(col, rough=0.62, spec=0.18, emit=None, emit_s=0.0):
    key = ('t', col, rough, spec, emit, emit_s)
    if key in MATS: return MATS[key]
    m = bpy.data.materials.new('m_' + col); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = hexc(col); b.inputs['Roughness'].default_value = rough
    try: b.inputs['Specular IOR Level'].default_value = spec
    except Exception: pass
    if emit: b.inputs['Emission Color'].default_value = hexc(emit); b.inputs['Emission Strength'].default_value = emit_s
    MATS[key] = m; return m
def mat_emit(col, s=3.0):
    key = ('e', col, s)
    if key in MATS: return MATS[key]
    m = bpy.data.materials.new('e_' + col); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    o = nt.nodes.new('ShaderNodeOutputMaterial'); e = nt.nodes.new('ShaderNodeEmission'); e.inputs[0].default_value = hexc(col); e.inputs[1].default_value = s
    nt.links.new(e.outputs[0], o.inputs[0]); MATS[key] = m; return m
IMGS = {}
def img(path):
    if path not in IMGS: IMGS[path] = bpy.data.images.load(path, check_existing=True)
    return IMGS[path]
def mat_tex(name, rep=(1, 1), alpha=False, unlit=False, rough=0.62):
    key = ('x', name, rep, alpha, unlit)
    if key in MATS: return MATS[key]
    m = bpy.data.materials.new('x_' + name); m.use_nodes = True; nt = m.node_tree
    p = os.path.join(DATA, 'tex', name + '.png')
    if not os.path.exists(p): return mat_toon('#d9a32e' if name == 'coin' else '#8fbf6a' if name == 'bill' else '#e9e1d2')
    t = nt.nodes.new('ShaderNodeTexImage'); t.image = img(p)
    if rep != (1, 1):
        tc = nt.nodes.new('ShaderNodeTexCoord'); mp = nt.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (rep[0], rep[1], 1)
        nt.links.new(tc.outputs['UV'], mp.inputs[0]); nt.links.new(mp.outputs[0], t.inputs[0])
    b = nt.nodes['Principled BSDF']; nt.links.new(t.outputs['Color'], b.inputs['Base Color']); b.inputs['Roughness'].default_value = rough
    if unlit: nt.links.new(t.outputs['Color'], b.inputs['Emission Color']); b.inputs['Emission Strength'].default_value = 0.12
    if alpha:
        nt.links.new(t.outputs['Alpha'], b.inputs['Alpha'])
        try: m.surface_render_method = 'DITHERED'
        except Exception: pass
    MATS[key] = m; return m
def mat_fade(col, emit=False):
    m = bpy.data.materials.new('f_' + col); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = hexc(col); b.inputs['Roughness'].default_value = 0.8
    if emit: b.inputs['Emission Color'].default_value = hexc(col); b.inputs['Emission Strength'].default_value = 1.2
    try: m.surface_render_method = 'BLENDED'
    except Exception: pass
    return m
def set_alpha(m, a): m.node_tree.nodes['Principled BSDF'].inputs['Alpha'].default_value = max(0.0, min(1.0, a))
# ink outline (inverted hull): dark where the hull faces away from us, invisible where it faces us
INK = bpy.data.materials.new('ink'); INK.use_nodes = True; nt = INK.node_tree; nt.nodes.clear()
_o = nt.nodes.new('ShaderNodeOutputMaterial'); _e = nt.nodes.new('ShaderNodeEmission'); _e.inputs[0].default_value = hexc('#1c1410'); _e.inputs[1].default_value = 1.0
_t = nt.nodes.new('ShaderNodeBsdfTransparent'); _g = nt.nodes.new('ShaderNodeNewGeometry'); _mx = nt.nodes.new('ShaderNodeMixShader')
nt.links.new(_g.outputs['Backfacing'], _mx.inputs[0]); nt.links.new(_e.outputs[0], _mx.inputs[1]); nt.links.new(_t.outputs[0], _mx.inputs[2]); nt.links.new(_mx.outputs[0], _o.inputs[0])
try: INK.surface_render_method = 'DITHERED'
except Exception: pass
INK.use_backface_culling = False
try: INK.use_backface_culling_shadow = True
except Exception: pass

# ---------------- geometry (built in three.js Y-up coordinates under a root rotated +90 deg on X) ----------------
ROOT = bpy.data.objects.new('ROOT', None); S.collection.objects.link(ROOT); ROOT.rotation_euler = (math.pi / 2, 0, 0)
def grp(name, loc=(0, 0, 0), rot=(0, 0, 0), parent=None):
    e = bpy.data.objects.new(name, None); S.collection.objects.link(e); e.parent = parent or ROOT; e.rotation_mode = 'ZYX'; e.location = loc; e.rotation_euler = rot; return e
def bm_rotx(bm, ang): bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(ang, 3, 'X'))
def g_box(w, h, d):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0, calc_uvs=True); bmesh.ops.scale(bm, vec=(w, h, d), verts=bm.verts); return bm
def g_cyl(rt, rb, h, seg=20, caps=True):
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=caps, cap_tris=False, segments=seg, radius1=rb, radius2=rt, depth=h, calc_uvs=True); bm_rotx(bm, -math.pi / 2); return bm
def g_sphere(r, u=16, v=10):
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=u, v_segments=v, radius=r, calc_uvs=True); return bm
def g_plane(w, h):
    bm = bmesh.new(); vs = [bm.verts.new(p) for p in [(-w / 2, -h / 2, 0), (w / 2, -h / 2, 0), (w / 2, h / 2, 0), (-w / 2, h / 2, 0)]]
    f = bm.faces.new(vs); uv = bm.loops.layers.uv.new()
    for l, c in zip(f.loops, [(0, 0), (1, 0), (1, 1), (0, 1)]): l[uv].uv = c
    return bm
def g_circle(r, seg=48):
    bm = bmesh.new(); uv = bm.loops.layers.uv.new(); c = bm.verts.new((0, 0, 0)); ring = [bm.verts.new((math.cos(a) * r, math.sin(a) * r, 0)) for a in [i / seg * 2 * math.pi for i in range(seg)]]
    for i in range(seg):
        f = bm.faces.new([c, ring[i], ring[(i + 1) % seg]])
        for l in f.loops: x, y, _ = l.vert.co; l[uv].uv = (0.5 + x / (2 * r), 0.5 + y / (2 * r))
    return bm
def g_ring(ri, ro, seg=32):
    bm = bmesh.new(); A = [bm.verts.new((math.cos(i / seg * 2 * math.pi) * ri, math.sin(i / seg * 2 * math.pi) * ri, 0)) for i in range(seg)]
    B = [bm.verts.new((math.cos(i / seg * 2 * math.pi) * ro, math.sin(i / seg * 2 * math.pi) * ro, 0)) for i in range(seg)]
    for i in range(seg): bm.faces.new([A[i], B[i], B[(i + 1) % seg], A[(i + 1) % seg]])
    return bm
def g_torus(R, r, tseg=32, rseg=8, arc=2 * math.pi):
    bm = bmesh.new(); closed = arc >= 2 * math.pi - 1e-6; n = tseg if closed else tseg + 1; rows = []
    for i in range(n):
        a = i / tseg * arc; row = []
        for j in range(rseg):
            b = j / rseg * 2 * math.pi; row.append(bm.verts.new(((R + r * math.cos(b)) * math.cos(a), (R + r * math.cos(b)) * math.sin(a), r * math.sin(b))))
        rows.append(row)
    for i in range(tseg if closed else tseg):
        A, B = rows[i], rows[(i + 1) % n]
        for j in range(rseg): bm.faces.new([A[j], B[j], B[(j + 1) % rseg], A[(j + 1) % rseg]])
    return bm
def g_cone(r, h, seg=12, open_end=False):
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=not open_end, cap_tris=True, segments=seg, radius1=r, radius2=0.0, depth=h); bm_rotx(bm, -math.pi / 2); return bm
def g_octa(r):
    bm = bmesh.new(); P = [(r, 0, 0), (-r, 0, 0), (0, r, 0), (0, -r, 0), (0, 0, r), (0, 0, -r)]; v = [bm.verts.new(p) for p in P]
    for a, b, c in [(0, 2, 4), (2, 1, 4), (1, 3, 4), (3, 0, 4), (2, 0, 5), (1, 2, 5), (3, 1, 5), (0, 3, 5)]: bm.faces.new([v[a], v[b], v[c]])
    return bm
def g_tube(pts, r, seg=8):
    bm = bmesh.new(); rings = []
    for i, p in enumerate(pts):
        p = Vector(p); d = (Vector(pts[min(i + 1, len(pts) - 1)]) - Vector(pts[max(i - 1, 0)])).normalized()
        up = Vector((0, 0, 1)) if abs(d.z) < 0.9 else Vector((1, 0, 0)); n1 = d.cross(up).normalized(); n2 = d.cross(n1)
        rings.append([bm.verts.new(p + (n1 * math.cos(j / seg * 6.283) + n2 * math.sin(j / seg * 6.283)) * r) for j in range(seg)])
    for i in range(len(rings) - 1):
        for j in range(seg): bm.faces.new([rings[i][j], rings[i + 1][j], rings[i + 1][(j + 1) % seg], rings[i][(j + 1) % seg]])
    return bm
MESHES = {}
def obj(name, bm, mats, loc=(0, 0, 0), rot=(0, 0, 0), parent=None, ink=0.012, share=None, smooth=False, shadow=True):
    if share and share in MESHES: me = MESHES[share]
    else:
        me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
        if smooth:
            for p in me.polygons: p.use_smooth = True
        for m in (mats if isinstance(mats, list) else [mats]): me.materials.append(m)
        if ink: me.materials.append(INK)
        if share: MESHES[share] = me
    o = bpy.data.objects.new(name, me); S.collection.objects.link(o); o.parent = parent or ROOT; o.rotation_mode = 'ZYX'; o.location = loc; o.rotation_euler = rot
    if ink:
        md = o.modifiers.new('ink', 'SOLIDIFY'); md.thickness = ink * INKX; md.offset = 1.0; md.use_flip_normals = True; md.use_rim = False
        md.material_offset = len(me.materials) - 1
    if not shadow:
        try: o.visible_shadow = False
        except Exception: pass
    return o
def mesh_from(bm, name='tmp'): return bm
R = random.Random(11).random
P2 = math.pi / 2


# Blender stage, part 2: reusable props (rooms, lamps, desks, shelves, books, rounded boxes, a cartoon car).
DARKW = mat_toon('#2a1d16')
def sign_mat(name, lines, bg, fg, w=1024, h=320, border='#f0c75a'):
    # signs are generated by the exporter (tex/<name>.png); fall back to a solid colour
    p = os.path.join(DATA, 'tex', name + '.png')
    return mat_tex(name, unlit=True) if os.path.exists(p) else mat_toon(bg)
def room(parent, w, d, h, wallmat, floormat, ceilcol='#3a2a2a', ink_trim='#e0b04a'):
    obj('fl', g_plane(w, d), floormat, (0, 0, 0), (-P2, 0, 0), parent, ink=0)
    obj('wb', g_plane(w, h), wallmat, (0, h / 2, -d / 2), (0, 0, 0), parent, ink=0)
    obj('wl', g_plane(d, h), wallmat, (-w / 2, h / 2, 0), (0, P2, 0), parent, ink=0)
    obj('wr', g_plane(d, h), wallmat, (w / 2, h / 2, 0), (0, -P2, 0), parent, ink=0)
    obj('NOCEIL', g_plane(w, d), mat_toon(ceilcol), (0, h, 0), (P2, 0, 0), parent, ink=0)
    obj('bb', g_box(w, 0.18, 0.06), mat_toon(ink_trim), (0, 0.09, -d / 2 + 0.03), parent=parent, ink=0.006)
def lamp(parent, x, y, z, energy=80, col=(1.0, 0.88, 0.7), r=0.3):
    L = bpy.data.lights.new('pl', 'POINT'); L.energy = energy; L.color = col; L.shadow_soft_size = r
    lo = bpy.data.objects.new('pl', L); S.collection.objects.link(lo); lo.parent = parent; lo.location = (x, y, z); return lo
def desk(parent, x, z, col='#8a5a34', w=1.0, d=0.6, h=0.72):
    g = grp('desk', (x, 0, z), parent=parent); obj('top', g_box(w, 0.05, d), mat_toon(col), (0, h, 0), parent=g, ink=0.008)
    for sx in (-1, 1):
        for sz in (-1, 1): obj('leg', g_box(0.05, h, 0.05), mat_toon('#4a3020'), (sx * (w / 2 - 0.05), h / 2, sz * (d / 2 - 0.05)), parent=g, ink=0.004)
    return g
def books(parent, x, y, z, n=8, w=0.9):
    cols = ['#b8282b', '#2a4f9c', '#2fa35a', '#e0b04a', '#8a3fd1', '#c98a3a', '#1f6f73']
    for i in range(n): hgt = 0.22 + (i * 37 % 9) / 60; obj('bk', g_box(w / n * 0.9, hgt, 0.18), mat_toon(cols[i % len(cols)]), (x - w / 2 + (i + 0.5) * w / n, y + hgt / 2, z), parent=parent, ink=0.004)
def shelf(parent, x, z, ry=0.0, rows=4, w=1.4):
    g = grp('shelf', (x, 0, z), (0, ry, 0), parent); obj('frame', g_box(w, 2.2, 0.32), mat_toon('#5a3420'), (0, 1.1, -0.04), parent=g, ink=0.01)
    for r in range(rows): obj('board', g_box(w - 0.08, 0.04, 0.3), mat_toon('#8a5a34'), (0, 0.3 + r * 0.5, 0.0), parent=g, ink=0); books(g, 0, 0.32 + r * 0.5, 0.02, 7 + r, w - 0.2)
    return g

# ---- rounded / tapered boxes for the car and props ----
def g_rbox(w, h, d, r=0.05, seg=3, top_x=1.0, top_z=1.0, top_dz=0.0):
    bm = g_box(w, h, d)
    for v in bm.verts:
        if v.co.y > 0: v.co.x *= top_x; v.co.z = v.co.z * top_z + top_dz
    if r > 0:
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=r, segments=seg, profile=0.5, affect='EDGES', clamp_overlap=True)
    return bm
def tire(parent, loc, R_=0.34, white=True):
    w = grp('wheel', loc, parent=parent)
    obj('tyre', g_torus(R_ - 0.1, 0.11, 28, 10), mat_toon('#1a1418', 0.8), (0, 0, 0), (0, P2, 0), w, ink=0.008, smooth=True)
    if white: obj('ww', g_torus(R_ - 0.13, 0.035, 28, 6), mat_toon('#f6f3ee'), (0.075, 0, 0), (0, P2, 0), w, ink=0)
    obj('hub', g_cyl(R_ - 0.17, R_ - 0.17, 0.16, 20), mat_toon('#e8edf2', 0.15, 0.95), (0, 0, 0), (0, 0, P2), w, ink=0.004)
    obj('hubs', g_box(0.18, 0.04, 0.03), mat_toon('#d8282f'), (0.085, 0, 0), parent=w, ink=0)   # makes the spin visible
    return w
def make_car(parent, body='#3fc1c9', roof='#f6efe0', loc=(0, 0, 0), ry=0.0):
    car = grp('car', loc, (0, ry, 0), parent)
    B_ = mat_toon(body, 0.28, 0.55); RF = mat_toon(roof, 0.3, 0.4); CH = mat_toon('#eef3f8', 0.12, 0.95); GL = mat_toon('#9fd6f5', 0.08, 0.6, '#9fd6f5', 0.25)
    obj('body', g_rbox(1.9, 0.55, 4.7, 0.16, 4), B_, (0, 0.6, 0), parent=car, ink=0.016)
    obj('belt', g_rbox(1.94, 0.06, 4.5, 0.02, 2), CH, (0, 0.74, 0), parent=car, ink=0)
    obj('cabin', g_rbox(1.66, 0.5, 2.2, 0.08, 3, 0.9, 0.72), GL, (0, 1.1, -0.25), parent=car, ink=0.012)
    obj('roof', g_rbox(1.56, 0.08, 1.72, 0.04, 2), RF, (0, 1.37, -0.25), parent=car, ink=0.01)
    for sx in (-1, 1):
        obj('pillar', g_box(0.06, 0.48, 0.1), RF, (sx * 0.74, 1.1, -0.27), (0.0, 0, 0), car, ink=0.004)
        obj('fin', g_rbox(0.16, 0.34, 1.2, 0.05, 2, 0.6, 0.6, -0.25), B_, (sx * 0.84, 0.92, -1.75), parent=car, ink=0.008)
        obj('tail', g_sphere(0.07, 10, 8), mat_emit('#ff3a3a', 4), (sx * 0.84, 0.95, -2.37), parent=car, ink=0.003)
        obj('hlr', g_torus(0.11, 0.025, 20, 6), CH, (sx * 0.66, 0.7, 2.36), parent=car, ink=0)
        obj('hl', g_sphere(0.1, 12, 10), mat_emit('#fff6c8', 3), (sx * 0.66, 0.7, 2.33), parent=car, ink=0.003)
        obj('stripe', g_box(0.02, 0.1, 2.6), CH, (sx * 0.96, 0.55, 0.2), parent=car, ink=0)
    for z in (2.42, -2.42): obj('bump', g_rbox(2.0, 0.16, 0.16, 0.06, 3), CH, (0, 0.4, z), parent=car, ink=0.006)
    obj('grille', g_box(1.1, 0.22, 0.04), mat_toon('#2a2a30'), (0, 0.58, 2.36), parent=car, ink=0.004)
    for i in range(5): obj('gbar', g_box(1.08, 0.025, 0.03), CH, (0, 0.5 + i * 0.04, 2.38), parent=car, ink=0)
    obj('orn', g_cone(0.04, 0.16, 8), CH, (0, 0.92, 2.15), (P2 * 0.9, 0, 0), car, ink=0.002)
    obj('ant', g_cyl(0.006, 0.006, 0.8, 4), CH, (0.8, 1.2, 1.2), (0.25, 0, 0), car, ink=0)
    wheels = [tire(car, (sx * 0.86, 0.34, z)) for sx in (-1, 1) for z in (1.45, -1.45)]
    return car, wheels


# Blender stage, part 3: 3D FX pool (coins, bills, smoke puffs, sweat drops, shock rings, sparks, a fly). Hidden until a shot uses them.
FXG = grp('FXG')
COINM = [mat_toon('#d9a32e', 0.3, 0.6), mat_tex('coin', rough=0.3)]
COINS = []
for i in range(64):
    o = obj('coin', g_cyl(0.065, 0.065, 0.014, 22), COINM, parent=FXG, ink=0.004, share='coin')
    COINS.append({'o': o, 'r': [R() for _ in range(5)]})
# put the $ texture on the coin caps only (faces whose normal points along the axis)
me = MESHES['coin']
for p in me.polygons: p.material_index = 1 if abs(p.normal.y) > 0.9 else 0
BILLS = [{'o': obj('bill', g_plane(0.2, 0.094), mat_tex('bill'), parent=FXG, ink=0, share='bill'), 'r': [R() for _ in range(4)]} for i in range(12)]
PUFFS = []
for i in range(26):
    m = mat_fade('#f1eadf'); o = obj('puff', g_sphere(1.0, 14, 10), m, parent=FXG, ink=0.0, smooth=True, shadow=False); PUFFS.append({'o': o, 'm': m, 'r': [R(), R(), R()]})
SMOKE, SLAMP, CRASHP = PUFFS[:6], PUFFS[6:14], PUFFS[14:26]
SW = mat_toon('#8fd4ff', 0.15, 0.7)
SWEAT = []
for i in range(2):
    g = grp('drop', parent=FXG); obj('dr', g_sphere(0.03, 12, 10), SW, parent=g, ink=0.004, smooth=True); obj('dc', g_cone(0.029, 0.06, 12), SW, (0, 0.04, 0), parent=g, ink=0.004); SWEAT.append(g)
RINGS = []
for i in range(4):
    m = mat_fade('#7af0ff', emit=True); RINGS.append({'o': obj('ring', g_torus(1.0, 0.06, 40, 8, math.pi * 0.9), m, parent=FXG, ink=0, shadow=False), 'm': m})
TAG = grp('TAG', parent=FXG)
obj('tagp', g_plane(0.3, 0.13), mat_tex('tag', alpha=True, unlit=True), (-0.15, 0, 0), parent=TAG, ink=0)
obj('tags', g_cyl(0.003, 0.003, 0.12, 4), DARKW, (0.02, 0.05, 0), (0, 0, 1.0), TAG, ink=0)
BANG = grp('BANG', parent=FXG); BM = mat_toon('#ffd84a', 0.4)
obj('bang1', g_cyl(0.07, 0.035, 0.32, 14), BM, (0, 0.2, 0), parent=BANG, ink=0.01); obj('bang2', g_sphere(0.05, 12, 10), BM, (0, -0.04, 0), parent=BANG, ink=0.01, smooth=True)
AMB = [{'o': obj('spark', g_octa(1.0), mat_emit('#fff6c8', 5), parent=FXG, ink=0, share='spark', shadow=False), 'p': ((R() - 0.5) * 5, 1.6 + R() * 3, -4 + R() * 5), 'k': R() * 6} for i in range(14)]
FLY = grp('FLY', parent=FXG); obj('flyb', g_sphere(0.018, 10, 8), mat_toon('#1a1418'), parent=FLY, ink=0.003)
WM = mat_fade('#e8f4ff'); set_alpha(WM, 0.8)
WINGS = [obj('wing', g_plane(0.03, 0.018), WM, (s * 0.016, 0.01, 0), parent=FLY, ink=0, shadow=False) for s in (-1, 1)]

# ---------------- key light ----------------
sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); S.collection.objects.link(sun)
sun.data.energy = 2.2; sun.data.color = (1.0, 0.95, 0.88); sun.data.angle = math.radians(12); sun.rotation_euler = (math.radians(38), 0, math.radians(-35))
fill = bpy.data.objects.new('fill', bpy.data.lights.new('fill', 'AREA')); S.collection.objects.link(fill)
fill.data.energy = 350; fill.data.size = 6; fill.data.color = (0.85, 0.9, 1.0); fill.location = (0, -9, 4); fill.rotation_euler = (math.radians(70), 0, 0)

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

# Blender stage, part 5: key/fill light, 2D character cards (emission + alpha, billboarded to camera), camera.
# ---------------- character cards ----------------
CM = 2.25
CARD_BM = None
CARDS = []
def card_mat(i):
    m = bpy.data.materials.new(f'card{i}'); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    o = nt.nodes.new('ShaderNodeOutputMaterial'); t = nt.nodes.new('ShaderNodeTexImage'); t.name = 'IMG'; t.interpolation = 'Linear'
    e = nt.nodes.new('ShaderNodeEmission'); tr = nt.nodes.new('ShaderNodeBsdfTransparent'); mx = nt.nodes.new('ShaderNodeMixShader')
    nt.links.new(t.outputs['Color'], e.inputs[0]); e.inputs[1].default_value = 2 ** -0.45
    nt.links.new(t.outputs['Alpha'], mx.inputs[0]); nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(e.outputs[0], mx.inputs[2]); nt.links.new(mx.outputs[0], o.inputs[0])
    try: m.surface_render_method = 'DITHERED'
    except Exception: pass
    return m
def get_card(i):
    while len(CARDS) <= i:
        k = len(CARDS); bm = g_plane(CM * 0.6, CM); bmesh.ops.translate(bm, vec=(0, CM / 2 - CM * 0.025, 0), verts=bm.verts)
        o = obj(f'card{k}', bm, card_mat(k), parent=ROOT, ink=0); CARDS.append(o)
    return CARDS[i]

# ---------------- camera ----------------
camd = bpy.data.cameras.new('cam'); cam = bpy.data.objects.new('cam', camd); S.collection.objects.link(cam); S.camera = cam
camd.sensor_fit = 'VERTICAL'; camd.clip_start = 0.05; camd.clip_end = 400; camd.dof.use_dof = True
def B(p): return Vector((p[0], -p[2], p[1]))


# Blender stage, part 6: the per-frame driver. Reads data/frames.json (exported from your story.js in the browser),
# shows the right set, moves the camera, places the character cards, renders, and mixes dissolves. Resumable.
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def show(o, v):
    o.hide_render = not v
    for c in o.children_recursive: c.hide_render = not v
for o_ in FXG.children_recursive: o_.hide_render = True          # FX start hidden; reveal them in animate_sets
NOCEIL = [o for o in S.objects if o.name.startswith('NOCEIL')]   # ceilings stay open so the camera can look in
CS = 1.3
IMG_CACHE = {}
def apply(f, st):
    setname = st.get('set') or st['sid']
    _vis = {id(g_) for k_, g_ in SETS.items() if k_ == setname}
    for g_ in SETS.values(): show(g_, id(g_) in _vis)
    for o_ in NOCEIL: o_.hide_render = True
    c_, s_, e_, col_ = SET_LOOK[setname]; bg.inputs[0].default_value = hexc(c_); bg.inputs[1].default_value = s_; sun.data.energy = e_; sun.data.color = col_
    sx = SET_X[setname]; fill.location = (sx, -9, 4); FXG.location = (sx, 0, 0)
    animate_sets(f, setname)
    C = st['cam']; cam.location = B(C['pos']); d = B(C['look']) - B(C['pos'])
    q = d.to_track_quat('-Z', 'Y'); q = q @ Quaternion((0, 0, 1), math.radians(C.get('roll', 0))); cam.rotation_mode = 'QUATERNION'; cam.rotation_quaternion = q
    camd.angle_y = math.radians(C['fov'])
    D = st.get('dof', {'focus': 6, 'cinf': 0}); camd.dof.focus_distance = D['focus']; camd.dof.aperture_fstop = 2.2 if D.get('cinf', 0) > 5 else 4.5
    used = set()
    for i, a in enumerate(st['actors']):
        o = get_card(i); show(o, True); o.location = (a['x'], a['y'], a['z']); o.scale = (a['s'] * CS,) * 3
        o.rotation_euler = (0, math.atan2(C['pos'][0] - a['x'], C['pos'][2] - a['z']), 0)
        path = os.path.join(DATA, 'cards', f"c{a['id']}.webp")
        if path not in IMG_CACHE: IMG_CACHE[path] = bpy.data.images.load(path, check_existing=True)
        o.active_material.node_tree.nodes['IMG'].image = IMG_CACHE[path]; used.add(path)
    for j in range(len(st['actors']), len(CARDS)): show(CARDS[j], False)
    return used
if DEMO:   # no browser export: a slow orbit over each example set, 3 stills each
    FRAMES = []
    for k, (name, x0) in enumerate(SET_X.items()):
        for j, u in enumerate((0.0, 0.5, 1.0)):
            a = math.radians(-25 + 50 * u)
            FRAMES.append({'f': k * 3 + j, 'sid': name, 'set': name, 'actors': [], 'dof': {'focus': 7, 'cinf': 0},
                           'cam': {'pos': [x0 + 7 * math.sin(a), 2.0, 7 * math.cos(a) - 1], 'look': [x0, 1.4, -3], 'fov': 50, 'roll': 0}})
    FR = [fr['f'] for fr in FRAMES]
import time
BYF = {fr['f']: fr for fr in FRAMES}
def render_to(p): S.render.filepath = p; bpy.ops.render.render(write_still=True)
def mix(pa, pb, w, outp):
    import numpy as np
    A = bpy.data.images.load(pa); Bi = bpy.data.images.load(pb); n = A.size[0] * A.size[1] * 4
    a = np.empty(n, np.float32); b = np.empty(n, np.float32); A.pixels.foreach_get(a); Bi.pixels.foreach_get(b)
    A.pixels.foreach_set(a * (1 - w) + b * w); A.save_render(outp, scene=S)
    bpy.data.images.remove(A); bpy.data.images.remove(Bi)
t0 = time.time(); n = 0
for f in FR:
    outp = os.path.join(OUT, f'f{f:04d}.jpg')
    if RESUME and os.path.exists(outp): continue
    fr = BYF[f]; S.frame_set(f)
    used = apply(f, fr)
    if 'blend' in fr:     # moving dissolve between shots: render both states and mix
        ta, tb = os.path.join(OUT, '_a.jpg'), os.path.join(OUT, '_b.jpg')
        render_to(ta); used |= apply(f, fr['blend']); render_to(tb); mix(ta, tb, fr['blend']['w'], outp)
    else: render_to(outp)
    for pth in list(IMG_CACHE):
        if pth not in used: bpy.data.images.remove(IMG_CACHE.pop(pth))
    n += 1
    if n % 25 == 0: print(f'frame {f}  avg {(time.time() - t0) / n:.2f} s/frame', flush=True)
print(f'done {n} frames, {(time.time() - t0) / max(n, 1):.2f} s/frame')
