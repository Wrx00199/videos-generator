#!/usr/bin/env python3
"""regen_meta_ep.py <proj> — depois de nova voz: copia tempos_ft.js -> web/tempos.js e regera marcas.json (sol/pedrinhas), plano.json, cenas.json, contadores.json e som/eventos.json de tempos do ep. 37 (formato T(i, fr, cen, cam) do story.js). Cameras custom viram o nome do banco mais proximo."""
import re, json, sys, shutil
P = sys.argv[1]
shutil.copy(P + '/tempos_ft.js', P + '/web/tempos.js')
t = open(P + '/tempos_ft.js').read(); FT = json.loads(re.search(r'FT = (\[.*?\]);', t).group(1)); DUR = float(re.search(r'DUR = ([\d.]+)', t).group(1))
at = lambda i, f=0: round(FT[i][0] + f * (FT[i][1] - FT[i][0]), 3)
s = open(P + '/web/story.js').read()
MAP = {'camQ0': 'contra_plongee', 'camLat': 'travelling_lateral', 'camLat2': 'corte_transversal'}
pl = []
for m in re.finditer(r"^\s*T\((\d+), ([\d.]+), '(\w+)', ('?\w+'?)", s, re.M):
    cam = m.group(4).strip("'"); pl.append((at(int(m.group(1)), float(m.group(2))), MAP.get(cam, cam), m.group(3)))
plano = [{'ini': a, 'fim': (pl[k + 1][0] if k + 1 < len(pl) else DUR), 'camera': c, 'cenario': cen} for k, (a, c, cen) in enumerate(pl)]
json.dump(plano, open(P + '/plano.json', 'w')); json.dump([[x['ini'], x['fim'], 'p%02d' % (k + 1)] for k, x in enumerate(plano)], open(P + '/cenas.json', 'w'))
sol = [[0, 0, 0, .95], [at(5), 1, 1, .85], [at(6), 3, 10, .7], [at(8), 5, 100, .5], [at(12), 7, 1000, .3], [at(14), 7, 1000, .1], [at(15), 7, 1000, .05]]
json.dump({'SOL': [[round(a, 2), b, c, d] for a, b, c, d in sol]}, open(P + '/marcas.json', 'w'))
json.dump([{'t0': 0, 't1': DUR, 'rotulo': 'PEDRINHAS', 'valores': [[round(a, 2), c] for a, b, c, d in sol]}], open(P + '/contadores.json', 'w'))
ev = [(0.15, 'whoosh', -8), (at(0, .55), 'brilho', -5), (at(1, .36), 'whoosh', -6), (at(1, .42), 'paf', -3), (at(1, .8), 'womp', -6), (at(2, .1), 'pop', -8), (at(4, .1), 'pop', -6), (at(5, .05), 'tique', -4), (at(6, .05), 'tique', -4, 3, 0.18), (at(7, .3), 'grilo', -12), (at(8, .7), 'estalo', -3), (at(8, .78), 'tremor', -8), (at(9, .4), 'tchac', -3), (at(10, .05), 'puxao', -5), (at(10, .45), 'rangido', -6), (at(11, .1), 'womp', -8), (at(12, .1), 'tique', -5, 14, 0.1), (at(13, .2), 'pop', -7), (at(14, .5), 'womp', -4), (at(15, .7), 'tim', -4), (at(16, .1), 'tchac', -2), (at(16, .22), 'whoosh', -4), (at(16, .4), 'tremor', -6), (at(17, .0), 'boom', -4), (at(17, .5), 'tim', -3), (at(18, .1), 'brilho', -8), (at(20, .4), 'pop', -6), (at(21, .05), 'pop', -6)]
E = []
for e in ev:
    d = {'t': round(e[0], 2), 'tipo': e[1], 'nivel': e[2]}
    if len(e) > 3: d['n'] = e[3]; d['dt'] = e[4]
    E.append(d)
cfg = {'duracao': DUR, 'seed': 3737, 'eventos': E, 'trilha': {'secoes': [{'nome': 'a', 'ini': 0, 'fim': at(12), 'tipo': 'leve'}, {'nome': 'b', 'ini': at(12), 'fim': at(14, .75), 'tipo': 'tensao'}, {'nome': 'c', 'ini': round(at(15, 1.0) + 0.35, 2), 'fim': at(18), 'tipo': 'caca'}, {'nome': 'd', 'ini': at(18), 'fim': round(DUR - 0.2, 2), 'tipo': 'caixinha'}], 'paradas': [[at(14, .75), round(at(15, 1.0) + 0.35, 2)]], 'acorde_final': round(DUR - 1.2, 2)}, 'mar': {'nivel_db': -90}}
json.dump(cfg, open(P + '/som/eventos.json', 'w'), indent=1); print('DUR', DUR, 'planos', len(plano))
