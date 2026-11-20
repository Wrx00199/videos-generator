#!/usr/bin/env python3
"""Vigia sem IA: acha erro/desvio da missão. Uso: python3 ferramentas/vigia.py (imprime alertas; grava _estado/ALERTAS.md)."""
import json, os, re, shutil, subprocess, time, glob, collections
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
E = os.path.join(R, '_estado'); now = time.time(); al = []
def sh(c):
    return subprocess.run(c, shell=True, capture_output=True, text=True, cwd=R).stdout.strip()
# 1) lock x commits
try:
    lk = json.load(open(os.path.join(E, 'missao.lock'))); idade = (now - os.path.getmtime(os.path.join(E, 'missao.lock'))) / 60
    ult = int(sh('git log -1 --format=%ct') or 0); sem = (now - ult) / 60
    if idade < 25 and sem > 90: al.append(f'GIRANDO: lock fresco ({lk.get("sessao")}) mas sem commit há {sem:.0f} min. Entregue algo ou grave o ponto e pare.')
    if idade >= 25: al.append(f'LOCK VELHO ({idade:.0f} min): sessão parou/travou; o vigia deve retomar.')
except FileNotFoundError: pass
# 2) episódios duplicados (mesmo número NN)
g = collections.defaultdict(list)
for d in glob.glob(os.path.join(R, 'projetos/bonecos/*-tiao-*-[0-9][0-9]')):
    g[re.search(r'-(\d\d)$', d).group(1)].append(os.path.basename(d))
for n, ds in g.items():
    if len(ds) > 1: al.append(f'EPISÓDIO DUPLICADO {n}: {", ".join(ds)}. Use um só; marque o outro como abandonado.')
# 3) mais de um render pesado
n = len(sh("pgrep -f '[r]ender.mjs'").split())
if n > 1: al.append(f'{n} renders ao mesmo tempo: só 1 por vez.')
# 4) PC
l = shutil.disk_usage(R).free / 1e9
if l < 20: al.append(f'DISCO baixo: {l:.0f} GB livres.')
mem = {k: int(v) for k, v in re.findall(r'(\w+):\s+(\d+) kB', open('/proc/meminfo').read())}
if mem['MemAvailable'] < 800 * 1024: al.append(f'RAM disponível baixa: {mem["MemAvailable"]//1024} MB.')
# 5) trabalho x prioridade: episódio novo criado depois da repriorização, com painel (Fase 3) ainda aberto
est = open(os.path.join(E, 'MISSAO-ESTADO.md'), encoding='utf-8').read()
rep = sh("git log -1 --grep=repriorização --format=%ct")
if rep and re.search(r'- \[ \] Fase 3', est):
    novos = [os.path.basename(d) for d in glob.glob(os.path.join(R, 'projetos/bonecos/2026-*-tiao-*')) if os.path.getctime(d) > int(rep)]
    if novos: al.append(f'DESVIO: episódio novo ({", ".join(novos)}) criado depois da repriorização, com o painel (Fase 3) ainda aberto.')
# 6) vídeo pronto sem Drive (episódios em prontos sem nota no nome e sem aviso)
open(os.path.join(E, 'ALERTAS.md'), 'w', encoding='utf-8').write('# Alertas do vigia (%s)\n' % time.strftime('%d/%m %H:%M') + ('\n'.join('- ' + a for a in al) if al else '- nenhum\n'))
print('\n'.join(al) if al else 'OK: nenhum alerta')
raise SystemExit(1 if al else 0)
