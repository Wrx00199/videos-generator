#!/usr/bin/env python3
# resume web/auditoria.json por plano: x0/x1/y0 na tela (-1..1) por ator; marca |x|>0.93 (corte). uso: medidas_ep.py <proj>  (rodar --auditar antes)
import json,sys
p=sys.argv[1]; C=json.load(open(p+'/cenas.json')); M=json.load(open(p+'/web/auditoria.json'))['medidas']
for k,(a,b,l) in enumerate(C):
    fa,fb=int(a*30),int(b*30); rows={}
    for m in M:
        if fa<=m['f']<fb: rows.setdefault(m['quem'],[]).append(m)
    out=[]
    for q,r in rows.items():
        x0=min(x['x0'] for x in r); x1=max(x['x1'] for x in r); y0=min(x['y0'] for x in r); y1=max(x['y1'] for x in r)
        flag='!!' if x0<-0.93 or x1>0.93 or y0<-0.93 else ''
        out.append(f'{q}[{x0:+.2f},{x1:+.2f} y{y0:+.2f}..{y1:+.2f}]{flag}')
    print(k,l,' '.join(out))
