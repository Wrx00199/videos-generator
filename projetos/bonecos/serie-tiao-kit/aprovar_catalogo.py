#!/usr/bin/env python3
"""aprovar_catalogo.py — audita personagens e cenarios do motor 3D e grava catalogo/aprovados.json.
Renderiza 1 quadro de teste por item (UM por vez, nice/ionice) numa pasta de trabalho temporaria
(nada do kit e alterado), roda o auditor de texto do motor e checagens de pixel.
Uso: python3 aprovar_catalogo.py [--saida catalogo/aprovados.json] [--work DIR] [--so ids,separados] [--fotos DIR]
Formato: {"personagens":{id:{"ok":bool,"falhas":[str]}},"cenarios":{...}}"""
import json, os, re, subprocess, sys

KIT = os.path.dirname(os.path.abspath(__file__))
MOTOR = os.path.join(KIT, 'motor3d')
PARCEIRO = {'cyberpunk': 'robo', 'apocalipse': 'zumbi', 'cemiterio': 'vampiro', 'parque': 'palhaco', 'dojo': 'panda',
            'fundomar': 'peixeman', 'nuvens': 'heroi', 'arena': 'gorila', 'floresta': 'curupira',
            'bermudas': 'barao', 'navioberm': 'tonho', 'maia': 'glorp', 'amazonia': 'curupira', 'sala': 'cap', 'cozinha': 'cap', 'quarto': 'cap', 'fachada': 'cap',
            'obra_azul': 'barao', 'obra_vermelha': 'barao', 'escritorio': 'barao', 'skyline': 'barao', 'rua': 'barao', 'redacao': 'barao', 'noite': 'barao', 'predio_topo': 'cap'}
CEN_TESTE_PERSONAGEM = 'dojo'


def checar_elenco(falas_json, aprovados):
    """Resultado do portao: reprova personagem/cenario fora da lista ou com ok:false."""
    from portao import Resultado
    d = falas_json
    if isinstance(d, str):
        d = json.load(open(d, encoding='utf-8'))
    falhas = []
    pers = aprovados.get('personagens', {})
    cens = aprovados.get('cenarios', {})
    for p in d.get('personagens', []):
        e = pers.get(p)
        if e is None:
            falhas.append(f'personagem {p} fora do catalogo aprovado')
        elif not e.get('ok'):
            falhas.append(f"personagem {p} reprovado: {'; '.join(e.get('falhas', [])) or 'sem motivo'}")
    c = d.get('cenario')
    if c:
        e = cens.get(c)
        if e is None:
            falhas.append(f'cenario {c} fora do catalogo aprovado')
        elif not e.get('ok'):
            falhas.append(f"cenario {c} reprovado: {'; '.join(e.get('falhas', [])) or 'sem motivo'}")
    elif 'cenario' not in d:
        falhas.append('falas.json sem campo cenario')
    return Resultado('elenco', not falhas, f"{len(d.get('personagens', []))} personagem(ns), cenario {c}",
                     'tudo em aprovados.json com ok:true', '; '.join(falhas))


STORY_JS = """// GERADO por aprovar_catalogo.py (harness de auditoria; nao e episodio)
import { camFromKeys } from './motion.js';
import { luz } from './luzes.js';
import { boneco } from './acoes.js';
import { ORIGEM, camCen } from './cenarios.js';
const ITENS = __ITENS__;
export const FPS = 30, TOTAL = ITENS.length;
export const SHOTS = ITENS.map((it, i) => ({ id: it.k + '-' + it.id, a: i, b: i, ...it }));
export const shotAt = (f) => SHOTS[Math.min(f, SHOTS.length - 1)];
export const LIGHTS = {};
export const lightFor = (S) => luz(S.cen);
const O = (S) => ORIGEM[S.cen];
const camBase = (S) => {
  if (S.k === 'cen') return camCen(S.cen, 'geral', 0, 0);
  const o = O(S), s = S.esc, d = 3.3 * s + 0.7, ly = 0.62 * s + 0.2;
  return { pos: [o.x + 0.3, o.y + ly + 0.1, o.z + 0.5 + d], look: [o.x, o.y + ly, o.z + 0.5], fov: 40 };
};
export const camAt = (f) => { const c = camBase(shotAt(f)); return camFromKeys([{ f, ...c }, { f: f + 1, ...c }], f); };
export const dofAt = (f) => { const c = camBase(shotAt(f)); return { focus: Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), cinf: 12 }; };
export const worldAt = (f) => ({ cenario: shotAt(f).cen, apocalipse: { grade: false } });   // V4: portao/placa do apocalipse tapava os bonecos na camera geral
const POSE = { eye: 'wide', mouth: 'smile', brow: 0.2, aR: [0.3, 0.15], aL: [-0.3, 0.15], f: 1 };
export const actorsAt = (f, T, W) => {
  const S = shotAt(f), t = f / 30, o = O(S), tint = luz(S.cen).tint;
  const X = (a) => ({ tint, ...a });
  if (S.k === 'cen') return [
    X(boneco(W, 'tiao', { ...POSE, eye: 'happy', mouth: 'grin', aR: [2.5, -0.2] }, o.x - 0.65, o.z + 0.9, t)),
    X(boneco(W, S.par, { ...POSE, eye: 'wide', mouth: 'o', f: -1 }, o.x + 0.7, o.z + 0.4, t)),
  ];
  return [X(boneco(W, S.id, { ...POSE, ...(S.pose || {}) }, o.x, o.z + 0.5, 2.0))];
};
export const fxAt = () => [];
"""


def sh(cmd, cwd=None, check=True):
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if check and r.returncode != 0:
        raise RuntimeError(f"{' '.join(cmd[:3])} falhou: {r.stderr[-400:]}{r.stdout[-400:]}")
    return r


def listar():
    js = ("const e=await import('%s/elenco.js');const c=await import('%s/cenarios.js');"
          "console.log(JSON.stringify({p:Object.fromEntries(Object.entries(e.SPEC).map(([k,v])=>[k,v.s??1])),c:Object.keys(c.ORIGEM)}))") % (MOTOR, MOTOR)
    r = sh(['node', '--input-type=module', '-e', js])
    d = json.loads(r.stdout)
    return d['p'], d['c']


def montar_web(work, itens):
    web = os.path.join(work, 'web')
    os.makedirs(web, exist_ok=True)
    for n in os.listdir(MOTOR):
        if '.bak' in n or n == 'story.js' or n.startswith('story_'):
            continue
        dst = os.path.join(web, n)
        if not os.path.lexists(dst):
            os.symlink(os.path.join(MOTOR, n), dst)
    open(os.path.join(web, 'story.js'), 'w').write(STORY_JS.replace('__ITENS__', json.dumps(itens)))
    return web


VARIANTES = {'wide': {'eye': 'wide'}, 'shut': {'eye': 'shut'}, 'semlegs': {'eye': 'wide', 'legs': 0}}


def montar_itens(pers, cens):
    itens = [{'k': 'cen', 'id': c, 'cen': c, 'par': PARCEIRO.get(c, 'cap')} for c in cens]
    for p, esc in pers.items():
        for v, pose in VARIANTES.items():
            itens.append({'k': 'per', 'id': p, 'var': v, 'cen': CEN_TESTE_PERSONAGEM, 'esc': esc, 'pose': pose})
    return itens


def expandir(txt):
    out = set()
    for parte in txt.split(','):
        a, _, b = parte.partition('-')
        out.update(range(int(a), int(b or a) + 1))
    return out


def auditar_motor(web, n):
    r = sh(['nice', '-n', '19', 'ionice', '-c3', 'node', 'render.mjs', '--auditar', f'0-{n - 1}'], cwd=web, check=False)
    avisos = {}
    for l in r.stdout.splitlines():
        m = re.match(r'(\S+) \| (.+?) :: quadros ([\d,\-]+)$', l.strip())
        if m:
            for f in expandir(m.group(3)):
                avisos.setdefault(f, []).append(f'{m.group(2)}')
    med = {}
    try:
        for m in json.load(open(os.path.join(web, 'auditoria.json')))['medidas']:
            med.setdefault(m['f'], []).append(m)
    except (OSError, ValueError, KeyError):
        pass
    return avisos, med, r.stdout + r.stderr


def renderizar(web, fotos, n):
    os.makedirs(fotos, exist_ok=True)
    r = sh(['nice', '-n', '19', 'ionice', '-c3', 'node', 'render.mjs', fotos, f'0-{n - 1}', '1', '0.92'], cwd=web, check=False)
    erros = [l for l in r.stdout.splitlines() if l.startswith(('ERR', 'page error'))]
    return erros


LIM_OLHO_PX, LIM_PERNA_PX, LIM_ALTURA = 120, 150, 0.12


def _img(fotos, f):
    import numpy as np
    from PIL import Image
    return np.asarray(Image.open(os.path.join(fotos, f'f{f:04d}.jpg')).convert('RGB')).astype(int)


def _caixa(m, w, h):
    x0, x1 = (m['x0'] + 1) / 2 * w, (m['x1'] + 1) / 2 * w
    y0, y1 = (1 - m['y1']) / 2 * h, (1 - m['y0']) / 2 * h
    return max(0, int(x0)), min(w, int(x1)), max(0, int(y0)), min(h, int(y1))


def _difere(a, b, caixa):
    import numpy as np
    x0, x1, y0, y1 = caixa
    if x1 <= x0 or y1 <= y0:
        return 0
    return int((np.abs(a[y0:y1, x0:x1] - b[y0:y1, x0:x1]).max(axis=2) > 40).sum())


def analisar_personagem(pid, idx, avisos, med, fotos):
    """idx = {'wide':f,'shut':f,'semlegs':f}. Devolve lista de falhas (strings)."""
    falhas = []
    fw = idx['wide']
    for a in avisos.get(fw, []):
        falhas.append(f'auditor do motor: {a}')
    ms = [m for m in med.get(fw, []) if m.get('quem') == pid]
    if not ms:
        return falhas + ['sem medida de tela (personagem nao apareceu)']
    A, B, C = _img(fotos, fw), _img(fotos, idx['shut']), _img(fotos, idx['semlegs'])
    h, w = A.shape[:2]
    cx = _caixa(ms[0], w, h)
    altura = (cx[3] - cx[2]) / h
    if altura < LIM_ALTURA:
        falhas.append(f'pequeno demais na tela ({altura:.0%} da altura)')
    cabeca = (cx[0], cx[1], cx[2], cx[2] + int((cx[3] - cx[2]) * 0.6))
    pernas = (cx[0], cx[1], cx[2] + int((cx[3] - cx[2]) * 0.5), cx[3] + int(h * 0.02))
    eo, pe = _difere(A, B, cabeca), _difere(A, C, pernas)
    if eo < LIM_OLHO_PX:
        falhas.append(f'olhos nao detectados (diferenca wide/shut = {eo}px)')
    if pe < LIM_PERNA_PX:
        falhas.append(f'pernas/pes nao detectados (diferenca com/sem pernas = {pe}px)')
    return falhas


def analisar_cenario(cid, f, avisos, med, fotos):
    import numpy as np
    falhas = [f'auditor do motor: {a}' for a in avisos.get(f, [])]
    im = _img(fotos, f)
    lum = im.mean(axis=2)
    if lum.std() < 12:
        falhas.append('quadro quase uniforme (cenario nao desenhou?)')
    if lum.mean() < 20:
        falhas.append('quadro quase todo preto')
    quem = {m.get('quem') for m in med.get(f, [])}
    if 'tiao' not in quem:
        falhas.append('Tiao nao apareceu no quadro de teste')
    return falhas


def main(argv):
    import argparse, shutil, tempfile
    ap = argparse.ArgumentParser()
    ap.add_argument('--saida', default=os.path.join(KIT, 'catalogo', 'aprovados.json'))
    ap.add_argument('--work', default=None)
    ap.add_argument('--so', default=None, help='ids separados por virgula')
    ap.add_argument('--fotos', default=None, help='copia as fotos de teste para esta pasta')
    a = ap.parse_args(argv[1:])
    pers, cens = listar()
    if a.so:
        so = set(a.so.split(','))
        pers = {k: v for k, v in pers.items() if k in so}
        cens = [c for c in cens if c in so]
    itens = montar_itens(pers, cens)
    work = a.work or tempfile.mkdtemp(prefix='aprovar_catalogo_')
    web = montar_web(work, itens)
    n = len(itens)
    print(f'{n} quadros de teste ({len(cens)} cenarios, {len(pers)} personagens x 3 variantes); trabalho em {work}')
    avisos, med, _ = auditar_motor(web, n)
    fotos = os.path.join(work, 'fotos')
    erros = renderizar(web, fotos, n)
    if erros:
        print('ERRO de render:', *erros[:5], sep='\n  ')
        return 2
    res = {'personagens': {}, 'cenarios': {}}
    for i, it in enumerate(itens):
        if it['k'] == 'cen':
            f = analisar_cenario(it['id'], i, avisos, med, fotos)
            res['cenarios'][it['id']] = {'ok': not f, 'falhas': f}
    por = {}
    for i, it in enumerate(itens):
        if it['k'] == 'per':
            por.setdefault(it['id'], {})[it['var']] = i
    for pid, idx in por.items():
        f = analisar_personagem(pid, idx, avisos, med, fotos)
        res['personagens'][pid] = {'ok': not f, 'falhas': f, 'escala': pers[pid]}
    exc = os.path.join(KIT, 'catalogo', 'revisao_visual.json')
    if os.path.isfile(exc):   # veredito humano/visual (design: feminino, rival feio...) prevalece e soma falhas
        for tipo, d in json.load(open(exc, encoding='utf-8')).items():
            for k, v in d.items():
                alvo = res.get(tipo, {}).get(k)
                if alvo is None:
                    continue
                aceita = tuple(v.get('aceita', []))
                auto = [x for x in alvo['falhas'] if not (aceita and x.startswith(aceita))]
                alvo['falhas'] = auto + v.get('falhas', [])
                alvo['ok'] = not alvo['falhas']
                if v.get('nota'):
                    alvo['nota'] = v['nota']
    if a.so and os.path.isfile(a.saida):   # --so = parcial: mescla no arquivo existente (nunca sobrescrever o catalogo inteiro)
        ant = json.load(open(a.saida, encoding='utf-8'))
        for tipo in ('personagens', 'cenarios'):
            ant.setdefault(tipo, {}).update(res[tipo])
        res = ant
    os.makedirs(os.path.dirname(a.saida), exist_ok=True)
    json.dump(res, open(a.saida, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    if a.fotos:
        shutil.copytree(fotos, a.fotos, dirs_exist_ok=True)
    ok_p = sum(v['ok'] for v in res['personagens'].values())
    ok_c = sum(v['ok'] for v in res['cenarios'].values())
    print(f"personagens {ok_p}/{len(res['personagens'])} ok · cenarios {ok_c}/{len(res['cenarios'])} ok -> {a.saida}")
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
