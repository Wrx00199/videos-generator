#!/usr/bin/env python3
"""cobertura.py <projeto> — todo personagem/objeto citado numa fala tem de aparecer em plano daquela fala (±1). Exit 1 se faltar."""
import json, re, sys
P = sys.argv[1].rstrip('/')
falas = json.load(open(P + '/falas.json'))
plan = json.load(open(P + '/plano.json')) if __import__('os').path.exists(P + '/plano.json') else {}
js = open(P + '/web/story.js', encoding='utf-8').read()
# palavra PT -> padroes aceitos no trecho do plano
D = {'gorila': ["'gorila'"], 'jato': ["'jato'"], 'iate': ["'iate'"], 'mansão': ["'mansao'"], 'mansao': ["'mansao'"], 'piscina': ["'piscina'"],
     'raposa': ["'raposa'"], 'cachorro': ["'cachorro'", "'raposa'"], 'balão': ["'balao'"], 'shopping': ["'shopping'"], 'moeda': ["'moeda'"],
     'notas': ["'notas'"], 'relógio': ["'relogio'"], 'pão': ["'pao'", "PÃO"], 'capitão': ["'cap'", "'gorila'"], 'padeiro': ["'mar1'"], 'caixa': ["'caixa'"]}
planos = {}
for m in re.finditer(r"\n\s*T\((\d+),[^\n]*", js):
    planos.setdefault(int(m.group(1)), []).append(m.group(0))
falhas = []
for i, f in enumerate(falas['falas']):
    txt = f['texto'].lower()
    trecho = ' '.join(l for k in (i - 1, i, i + 1) for l in planos.get(k, []))
    if i not in planos: falhas.append(f'fala {i}: sem plano'); continue
    for w, pats in D.items():
        if w in txt and not any(p in trecho for p in pats): falhas.append(f"fala {i}: cita '{w}' e nenhum plano mostra")
    ps = planos[i]
    if len(ps) > 1 and len({re.search(r"T\(\d+,\s*[\d.]+,\s*'[^']*',\s*'([^']*)'", p).group(1) if re.search(r"T\(\d+,\s*[\d.]+,\s*'[^']*',\s*'([^']*)'", p) else str(k) for k, p in enumerate(ps)}) < 2:
        falhas.append(f'fala {i}: planos seguidos sem mudar de câmera')
for pers in falas.get('personagens', []):
    if f"'{pers}'" not in js and f'{pers}(' not in js: falhas.append(f"personagem '{pers}' nunca aparece")
for x in falhas: print('REPROVA cobertura:', x)
print('OK cobertura' if not falhas else f'{len(falhas)} falha(s)'); sys.exit(1 if falhas else 0)
