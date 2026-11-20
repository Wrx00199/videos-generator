#!/usr/bin/env python3
# gera cenas.json (segundos) a partir dos {de:N} de web/story.js e de web/tempos.js. uso: cenas_ep.py <proj>
import json,sys,re
p=sys.argv[1]
t=open(p+'/web/tempos.js').read(); FT=json.loads(re.search(r'FT = (\[.*?\]);',t).group(1)); DUR=float(re.search(r'DUR = ([\d.]+)',t).group(1))
src=open(p+'/web/story.js').read(); de=[];st=[]
for m in re.finditer(r'\{ (?:de: (\d+)|t0: ([\d.]+))',src):
    if m.group(1) is not None: d=int(m.group(1)); de.append(d); st.append(0 if d==0 else round(FT[d][0],2))
    else: de.append('t'+m.group(2)); st.append(float(m.group(2)))
json.dump([[st[k],(st[k+1] if k+1<len(st) else DUR),'fala '+str(de[k])] for k in range(len(de))],open(p+'/cenas.json','w'))
print(len(de),'cenas')
