# Cenário estático "sala" (Blender 5.x, EEVEE). Uso: blender -b -P sala.py -- saida.png
import bpy, sys, math
out = sys.argv[sys.argv.index('--')+1] if '--' in sys.argv else '/tmp/sala.png'
bpy.ops.wm.read_factory_settings(use_empty=True)
def mat(rgb, rough=0.6):
    m = bpy.data.materials.new('m'); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (*rgb,1); b.inputs['Roughness'].default_value = rough
    return m
CAM_ = {}
def box(loc, sc, rgb, rough=0.6, cam='fundo'):
    bpy.ops.mesh.primitive_cube_add(location=loc); o = bpy.context.object; o.scale = sc; o.data.materials.append(mat(rgb, rough)); CAM_[o.name]=cam; return o
box((0,0,3.95),(6,6,0.05),(0.95,0.93,0.9))  # teto
box((0,0,-0.05),(6,6,0.05),(0.55,0.36,0.22),0.4)      # piso madeira
box((0,3.0,2),(6,0.05,2),(0.93,0.82,0.62))             # parede fundo
box((-3.0,0,2),(0.05,6,2),(0.88,0.76,0.56))            # parede esquerda
box((0,2.9,1.6),(1.3,0.03,0.8),(0.55,0.8,0.95),0.1)    # janela
box((-1.6,1.9,0.4),(1.4,0.55,0.4),(0.75,0.25,0.25),cam='meio')    # sofá base
box((-1.6,2.45,0.85),(1.4,0.12,0.45),(0.7,0.2,0.2),cam='meio')    # encosto
box((1.6,1.0,0.3),(0.7,0.7,0.3),(0.45,0.3,0.18),0.3,cam='frente')   # mesinha
box((2.4,2.5,1.0),(0.5,0.3,1.0),(0.35,0.22,0.12),cam='meio')      # estante
box((-1.0,-0.6,0.01),(1.6,1.1,0.01),(0.2,0.35,0.55),0.9,cam='frente') # tapete
for loc,e in (((0,-2,3.2),90),((-2,1,2.8),40)):
    bpy.ops.object.light_add(type='AREA', location=loc); l = bpy.context.object; l.data.energy = e; l.data.size = 3
bpy.ops.object.camera_add(location=(0,-5.4,1.8), rotation=(math.radians(87),0,0)); cam = bpy.context.object; cam.data.lens = 24
bpy.context.scene.camera = cam
w = bpy.data.worlds.new('w'); w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value=(0.6,0.65,0.75,1); bpy.context.scene.world = w
s = bpy.context.scene; s.render.engine = 'BLENDER_EEVEE'; s.view_settings.view_transform = 'Standard'
s.render.resolution_x, s.render.resolution_y = 1080, 1920
s.render.film_transparent = True
s.render.image_settings.color_mode = 'RGBA'
base = out[:-4] if out.endswith('.png') else out
for camada in ('fundo','meio','frente'):
    for n,c in CAM_.items(): bpy.data.objects[n].hide_render = (c != camada)
    s.render.filepath = base + '_' + camada + '.png'
    bpy.ops.render.render(write_still=True)
