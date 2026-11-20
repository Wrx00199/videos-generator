#!/usr/bin/env python3
"""Troca o texto do STT (erros: 'Tion', 'bindadas') pelo texto do ROTEIRO, mantendo os tempos de cada palavra.
Uso: python3 corrigir_legenda.py <palavras.json> <falas.json> <saida.json>   (depois: legenda.py <saida.json> <x.ass>)"""
import json, sys, re, difflib, unicodedata
def norm(w): return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFD', w.lower()).encode('ascii', 'ignore').decode())
stt = json.load(open(sys.argv[1]))
if isinstance(stt, dict): stt = stt.get('palavras', [])
falas = json.load(open(sys.argv[2]))['falas']
rot = [t for f in falas for t in f['texto'].split()]
a = [norm(w['w']) for w in stt]; b = [norm(t) for t in rot]
out = [dict(w) for w in stt]
for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
    if tag in ('equal', 'replace') and i2 > i1:
        n1, n2 = i2 - i1, j2 - j1
        if n1 == n2:
            for k in range(n1): out[i1 + k]['w'] = rot[j1 + k]
        elif n2 == 0:
            for k in range(n1): out[i1 + k]['w'] = ''
        else:  # tamanhos diferentes: 1ª palavra do STT leva o trecho todo do roteiro, o resto some (tempo vai pra ela)
            out[i1]['w'] = ' '.join(rot[j1:j2]); out[i1]['fim'] = out[i2 - 1]['fim']
            for k in range(1, n1): out[i1 + k]['w'] = ''
out = [w for w in out if w['w']]
json.dump(out, open(sys.argv[3], 'w'), ensure_ascii=False)
trocas = len(stt) - len(out); print(f'{len(out)} palavras, {trocas} palavras do STT fundidas/removidas; texto = roteiro')
