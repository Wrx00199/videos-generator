#!/usr/bin/env python3
"""Estilos de texto do HyperFrames (estilos/<id>/): checar, renderizar, lote.

  estilos.py checar <id|todos>          # style.json x index.html + lint + validate + check (tudo limpo)
  estilos.py render <id> [--saida mp4]  # 720p, 24 fps, draft, 1 worker, SEMPRE com --variables
  estilos.py lote <id>                  # --batch com estilos/<id>/lote.json (N variações do mesmo index.html)

Regra de render: lint/validate limpos antes; um render por vez (1 worker, batch-concurrency 1).
Nenhum estilo 3D (o 3D do Tião é o motor3d). Saída: videos/estilos/.
"""
import json, os, re, subprocess, sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ESTILOS = RAIZ / 'estilos'
SAIDA = RAIZ / 'videos' / 'estilos'
IDS = ['terminal', 'colagem', 'keynote', 'sticker', 'pixel', 'backrooms']
ENV = {**os.environ, 'HYPERFRAMES_CACHE_DIR': os.environ.get('HYPERFRAMES_CACHE_DIR', str(Path.home() / '.nexo/cache')),
       'PUPPETEER_CACHE_DIR': os.environ.get('PUPPETEER_CACHE_DIR', str(Path.home() / '.nexo/cache'))}
RENDER = {'res': '720p', 'fps': 24, 'qualidade': 'draft', 'workers': 1}


def hf(args, cwd, capturar=True):
    return subprocess.run(['npx', 'hyperframes', *args], cwd=cwd, env=ENV, capture_output=capturar, text=True)


def carregar(id_):
    d = ESTILOS / id_
    if not (d / 'style.json').is_file():
        raise SystemExit(f'ERRO: {d}/style.json não existe')
    return d, json.loads((d / 'style.json').read_text(encoding='utf-8'))


def contrato(id_):
    """Erros de contrato entre style.json e index.html (lista vazia = ok)."""
    d, st = carregar(id_)
    erros = []
    html = (d / 'index.html').read_text(encoding='utf-8')
    if re.search(r'\b(3d|three)\b', json.dumps(st, ensure_ascii=False).lower()) or re.search(r'three\.js|webgl', html.lower()):
        erros.append('estilo 3D não é permitido aqui')
    m = re.search(r"data-composition-variables='(\[.*?\])'", html, re.S)
    if not m:
        return erros + ['index.html sem data-composition-variables']
    decl = {v['id']: v for v in json.loads(m.group(1))}
    var = {v['id']: v for v in st.get('variables', [])}
    if decl != var:
        erros.append(f'variables do style.json diferem do index.html: {sorted(set(decl) ^ set(var)) or "valores"}')
    if not st.get('catalogo'):
        erros.append('style.json sem blocos do catálogo (campo catalogo)')
    slots = st.get('slots', [])
    if not slots:
        erros.append('style.json sem slots')
    for s in slots:
        if s.get('variavel') not in var:
            erros.append(f"slot {s.get('id')} aponta para variável inexistente {s.get('variavel')}")
        elif f'data-var-text="{s["variavel"]}"' not in html:
            erros.append(f"slot {s.get('id')}: index.html não usa data-var-text=\"{s['variavel']}\"")
    for v in var.values():
        if v['type'] == 'string' and len(v['default']) > next((s['max_chars'] for s in slots if s['variavel'] == v['id']), 10**9):
            erros.append(f"default de {v['id']} passa de max_chars")
    f = st.get('formato', {})
    if (f.get('largura'), f.get('altura'), f.get('duracao'), f.get('fps')) != (1080, 1920, 5, 24):
        erros.append('formato deve ser 1080x1920, 5 s, 24 fps')
    if st.get('render') != {'resolucao': '720p', 'fps': 24, 'qualidade': 'draft', 'workers': 1, 'variables': True}:
        erros.append('render deve ser 720p/24fps/draft/1 worker/variables')
    lote = d / 'lote.json'
    if not lote.is_file():
        erros.append('falta lote.json (3 variações)')
    else:
        linhas = json.loads(lote.read_text(encoding='utf-8'))['rows']
        if len(linhas) != 3 or len({l['name'] for l in linhas}) != 3:
            erros.append('lote.json precisa de 3 linhas com name único')
        for l in linhas:
            extra = set(l) - set(var)
            falta = set(var) - set(l)
            if extra or falta:
                erros.append(f"linha {l.get('name')} do lote: sobra {sorted(extra)} falta {sorted(falta)}")
            for s in slots:
                if len(str(l.get(s['variavel'], ''))) > s['max_chars']:
                    erros.append(f"linha {l.get('name')}: {s['variavel']} passa de {s['max_chars']} caracteres")
    return erros


def checar(id_):
    d, _ = carregar(id_)
    erros = contrato(id_)
    lint = hf(['lint', '--json'], d)
    try:
        j = json.loads(lint.stdout)
        n = j.get('errorCount', 0) + j.get('warningCount', 0)
        if lint.returncode or n:
            erros.append(f'lint não está limpo ({n} achados): rode `npx hyperframes lint` em estilos/{id_}')
    except ValueError:
        erros.append('lint sem saída JSON: ' + (lint.stdout + lint.stderr)[-200:])
    val = hf(['validate'], d)
    if val.returncode:
        erros.append('validate falhou: ' + (val.stdout + val.stderr)[-300:])
    chk = hf(['check', '--json'], d)
    try:
        j = json.loads(chk.stdout)
        achados = [f for sec in ('runtime', 'layout', 'motion', 'contrast', 'craft') for f in j.get(sec, {}).get('findings', [])
                   if f.get('severity') in ('error', 'warning')]
        if not j.get('ok') or achados:
            erros += [f"check {f['code']} {f.get('selector', '')}: {f['message'][:120]}" for f in achados] or ['check falhou']
    except ValueError:
        erros.append('check sem saída JSON')
    print(f'[{id_}] ' + ('LIMPO (contrato, lint, validate, check)' if not erros else 'REPROVADO'))
    for e in erros:
        print('  -', e)
    return not erros


def flags():
    return ['--resolution', RENDER['res'], '--fps', str(RENDER['fps']), '-q', RENDER['qualidade'], '-w', str(RENDER['workers']),
            '--frames-cache-dir', 'off', '--strict-variables', '--quiet']


def render(id_, saida=None):
    if not checar(id_):
        print('render bloqueado: corrija o estilo antes.')
        return 1
    d, st = carregar(id_)
    SAIDA.mkdir(parents=True, exist_ok=True)
    saida = Path(saida) if saida else SAIDA / f'{id_}.mp4'
    if saida.exists():
        print('ERRO: saída já existe; preserve e escolha outro nome'); return 2
    var = {v['id']: v['default'] for v in st['variables']}
    r = hf(['render', '.', '-o', str(saida.resolve()), *flags(), '--variables', json.dumps(var, ensure_ascii=False)], d, capturar=False)
    return r.returncode


def lote(id_):
    if not checar(id_):
        print('lote bloqueado: corrija o estilo antes.')
        return 1
    d, _ = carregar(id_)
    pasta = SAIDA / 'lote' / id_
    pasta.mkdir(parents=True, exist_ok=True)
    r = hf(['render', '.', '--batch', 'lote.json', '--output', str(pasta.resolve() / '{name}.mp4'), '--batch-concurrency', '1', *flags()], d, capturar=False)
    return r.returncode


def main(a):
    if len(a) < 3 or a[1] not in ('checar', 'render', 'lote'):
        print(__doc__); return 2
    alvo = IDS if a[2] == 'todos' else [a[2]]
    if a[1] == 'checar':
        return 0 if all([checar(i) for i in alvo]) else 1
    if a[1] == 'render':
        return render(a[2], a[a.index('--saida') + 1] if '--saida' in a else None)
    return lote(a[2])


if __name__ == '__main__':
    sys.exit(main(sys.argv))
