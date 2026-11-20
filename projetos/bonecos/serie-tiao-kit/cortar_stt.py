#!/usr/bin/env python3
# refaz os cortes <quem>_<i>.wav de cada personagem pelo STT do bruto <quem>.wav. uso: cortar_stt.py <proj>; depois: vozes_elenco.mjs falas.json voz --montar
import json,sys,re,unicodedata,difflib,subprocess
from faster_whisper import WhisperModel
p=sys.argv[1]; pp=p+'/voz/_por_personagem'
nz=lambda s:re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFD',s.lower()).encode('ascii','ignore').decode())
falas=json.load(open(p+'/falas.json'))['falas']
m=WhisperModel('small',device='cpu',compute_type='int8',cpu_threads=3)
for quem in dict.fromkeys(f['quem'] for f in falas):
    segs,_=m.transcribe(f'{pp}/{quem}.wav',language='pt',word_timestamps=True,beam_size=1)
    W=[w for s in segs for w in s.words]; st=[nz(w.word) for w in W]
    sc=[];own=[]
    for i,f in enumerate(falas):
        if f['quem']!=quem: continue
        for t in f['texto'].split():
            if nz(t): sc.append(nz(t)); own.append(i)
    mt=difflib.SequenceMatcher(None,sc,st,autojunk=False); ini={};fim={}
    for a,b,n in mt.get_matching_blocks():
        for k in range(n):
            i=own[a+k]; ini[i]=min(ini.get(i,1e9),W[b+k].start); fim[i]=max(fim.get(i,0),W[b+k].end)
    ids=sorted(set(own))
    for j,i in enumerate(ids):
        if i not in ini: print('SEM MATCH',quem,i); continue
        a=max(0,ini[i]-0.12); b=fim[i]+0.25
        if j+1<len(ids) and ids[j+1] in ini: b=min(b,(fim[i]+ini[ids[j+1]])/2+0.05)
        subprocess.run(['ffmpeg','-y','-loglevel','error','-i',f'{pp}/{quem}.wav','-ss',f'{a:.3f}','-to',f'{b:.3f}','-ar','24000','-ac','1',f'{pp}/{quem}_{i}.wav'])
        print(quem,i,round(a,2),round(b,2))
