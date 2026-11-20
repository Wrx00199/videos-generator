#!/usr/bin/env python3
# alinha falas.json com palavras.json (STT do dialogo.wav) -> voz/falas_tempos.json corrigido (guarda o antigo em falas_tempos_corte.json). uso: alinhar_stt.py <proj>
import json,sys,re,unicodedata,difflib,shutil,os
p=sys.argv[1]
nz=lambda s:re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFD',s.lower()).encode('ascii','ignore').decode())
falas=json.load(open(p+'/falas.json'))['falas']; W=json.load(open(p+'/palavras.json'))['palavras']
st=[nz(w['w']) for w in W]; sc=[];own=[]
for i,f in enumerate(falas):
    for t in f['texto'].split():
        if nz(t): sc.append(nz(t)); own.append(i)
m=difflib.SequenceMatcher(None,sc,st,autojunk=False)
ini={};fim={}
for a,b,n in m.get_matching_blocks():
    for k in range(n):
        i=own[a+k]; w=W[b+k]; ini[i]=min(ini.get(i,99999),w['ini']); fim[i]=max(fim.get(i,0),w['fim'])
out=[]
for i,f in enumerate(falas):
    if i not in ini: print('SEM MATCH',i,f['texto']); continue
    out.append({'i':i,'quem':f['quem'],'ini':ini[i],'fim':fim[i],'texto':f['texto']})
for x in out:
    n=len(x['texto'].split()); d=x['fim']-x['ini']; print(x['i'],x['quem'],round(x['ini'],1),round(x['fim'],1),'!!' if d/n>0.8 or d/n<0.2 else '')
tp=p+'/voz/falas_tempos.json'
if not os.path.exists(p+'/voz/falas_tempos_corte.json'): shutil.copy(tp,p+'/voz/falas_tempos_corte.json')
json.dump(out,open(tp,'w'),ensure_ascii=False,indent=1)
