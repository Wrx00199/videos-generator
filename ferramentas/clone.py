#!/usr/bin/env python3
"""Clonador local: iniciar ORIGINAL --slug NOME; analisar PASTA; voz PASTA; validar PASTA; montar PASTA.
Análise editorial e timeline são feitas pelo agente seguindo estudio-clone; este executor não as inventa.
"""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import time
import uuid
from pathlib import Path
from estudio_contrato import ass_legendas, validar_timeline

RAIZ=Path(__file__).resolve().parents[1]
FF='/usr/bin/ffmpeg' if Path('/usr/bin/ffmpeg').exists() else 'ffmpeg'

def ler(p): return json.loads(Path(p).read_text(encoding='utf-8'))
def gravar(p,d):
    p=Path(p); tmp=p.with_suffix(p.suffix+'.partial')
    tmp.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8'); tmp.replace(p)
def hash_arq(p):
    h=hashlib.sha256()
    with Path(p).open('rb') as f:
        for b in iter(lambda:f.read(1<<20),b''): h.update(b)
    return h.hexdigest()
def rodar(args,cwd=None,timeout=300):
    r=subprocess.run(args,cwd=cwd,capture_output=True,text=True,timeout=timeout)
    if r.returncode: raise RuntimeError(f'{Path(args[0]).name}: {r.stderr[-1800:]}')
    return r.stdout

def probe(p):
    return json.loads(rodar(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)],timeout=30))
def duracao(p): return float(probe(p)['format']['duration'])
def hook(pasta,etapa,ok,**info):
    with (pasta/'hooks.jsonl').open('a',encoding='utf-8') as f:
        f.write(json.dumps({'etapa':etapa,'ok':ok,'em':dt.datetime.now().astimezone().isoformat(),**info},ensure_ascii=False)+'\n')

def iniciar(original,slug,projetos=None,inicio_unix=None):
    original=Path(original).resolve()
    if not original.is_file(): raise ValueError(f'original local não existe: {original}')
    slug=re.sub('[^a-z0-9]+','-',slug.lower()).strip('-')[:60]
    if not slug: raise ValueError('slug vazio')
    base=Path(projetos) if projetos else RAIZ/'projetos'/'gta6'
    base.mkdir(parents=True,exist_ok=True)
    pasta=base/f'{dt.datetime.now().astimezone():%Y-%m-%d}-{slug}-{uuid.uuid4().hex[:8]}'
    pasta.mkdir()
    t=time.time() if inicio_unix is None else inicio_unix
    if not isinstance(t,(int,float)) or not 0<t<=time.time(): raise ValueError('inicio_unix deve ser o instante real de recebimento, no passado')
    try:
        shutil.copy2(original,pasta/'original.mp4')
        (pasta/'visual').mkdir();(pasta/'voz').mkdir()
        gravar(pasta/'execucao.json',{'id':pasta.name,'inicio_unix':t,'original_sha256':hash_arq(pasta/'original.mp4'),'status':'iniciado','etapas_s':{},'resolucao':ler(RAIZ/'marca/identidade.json')['resolucao']})
        hook(pasta,'iniciar',True,original_sha256=hash_arq(pasta/'original.mp4'))
    except Exception as e:
        hook(pasta,'iniciar',False,erro=str(e)); raise
    return pasta

def analisar(pasta,completo=False):
    t=time.monotonic()
    if completo and (pasta/'analise.json').is_file() and not (pasta/'rea').exists():
        dest=pasta/'tentativas'/f'analise-enxuta-{uuid.uuid4().hex[:8]}'
        dest.mkdir(parents=True)
        for nome in ('analise.json','fala.json','fala.wav','quadros.jpg'):
            if (pasta/nome).exists():shutil.move(str(pasta/nome),str(dest/nome))
    if any((pasta/x).exists() for x in ('analise.json','espelho.json','fala.json','rea','quadros.jpg')):
        raise ValueError('análise já existe: inicie execução nova; nenhuma saída antiga será usada')
    if completo:
        py=RAIZ/'ferramentas/rea-video/.venv/bin/python'
        rodar([str(py),str(RAIZ/'ferramentas/espelho.py'),str(pasta)],timeout=660)
        return
    dados=probe(pasta/'original.mp4'); dur=float(dados['format']['duration'])
    if not 0<dur<=180: raise ValueError('rota curta: original precisa ter até 180 s')
    # Detecção de cortes é candidata, não classificação narrativa; agente confere quadros/áudio.
    r=subprocess.run([FF,'-v','info','-i',str(pasta/'original.mp4'),'-an','-vf',"scale=160:-2,select='gt(scene,0.28)',showinfo",'-f','null','-'],capture_output=True,text=True,timeout=90)
    if r.returncode: raise RuntimeError(r.stderr[-1200:])
    cortes=sorted(set(round(float(x),3) for x in re.findall(r'pts_time:([\d.]+)',r.stderr) if 0<float(x)<dur))
    passo=dur/12
    rodar([FF,'-v','error','-i',str(pasta/'original.mp4'),'-vf',f"fps=1/{passo},scale=180:-2,drawtext=text='%{{pts\\:hms}}':fontsize=14:fontcolor=white:box=1:boxcolor=black@0.7:x=5:y=5,tile=4x3",'-frames:v','1',str(pasta/'quadros.jpg')],timeout=90)
    fala=None
    if any(s['codec_type']=='audio' for s in dados['streams']):
        rodar([FF,'-v','error','-i',str(pasta/'original.mp4'),'-vn','-ac','1','-ar','16000',str(pasta/'fala.wav')],timeout=45)
        texto=rodar([sys.executable,str(RAIZ/'ferramentas/stt.py'),str(pasta/'fala.wav'),'auto','small'],timeout=180)
        fala=json.loads(texto); gravar(pasta/'fala.json',fala)
    gravar(pasta/'analise.json',{'duracao_s':dur,'cortes_candidatos_s':cortes,'fala':fala,'quadros':'quadros.jpg','aviso':'Análise enxuta: cortes são candidatos. Agente deve ver cortes/trechos, textos e camadas; usar --completo quando faltar evidência. Não classifica trailer, pessoa ou fatos automaticamente.','tempo_s':round(time.monotonic()-t,2)})

def carregar(pasta, sem_palavras=False):
    meta=ler(pasta/'execucao.json');d=ler(pasta/'timeline.json')
    erros=validar_timeline(d, sem_palavras=sem_palavras)
    if erros: raise ValueError('\n'.join(erros))
    if d.get('execucao_id')!=meta['id']: erros.append('timeline de outra execução')
    atual=hash_arq(pasta/'original.mp4')
    if atual!=meta['original_sha256'] or d.get('original_sha256')!=atual: erros.append('original mudou ou timeline de outro vídeo')
    identidade=ler(RAIZ/'marca/identidade.json')
    for nome in ('logo','capa'):
        if not (RAIZ/identidade[nome]).is_file(): erros.append(f'asset de marca ausente: {nome}')
    for b in d.get('beats',[]):
        f=(pasta/b.get('fonte','')).resolve()
        if not f.is_relative_to((pasta/'visual').resolve()) or not f.is_file(): erros.append(f'fonte ausente/fora de visual/: {b.get("id")}')
        elif f.suffix.lower() not in ('.png','.jpg','.jpeg','.webp'):
            inicio=b.get('inicio_fonte_s',0)
            if not isinstance(inicio,(int,float)) or inicio<0 or inicio+b['fim']-b['ini']>duracao(f)+.08: erros.append(f'fonte curta demais/offset inválido: {b.get("id")}')
    voz=pasta/'voz/narracao.mp3'
    if not voz.is_file(): erros.append('sem voz/narracao.mp3')
    elif duracao(voz)>d.get('duracao_s',0)+.08: erros.append('voz ultrapassa duração do vídeo')
    for som in ([d['musica']] if d.get('musica') else [])+d.get('sfx',[]):
        if not isinstance(som,dict): erros.append('som inválido'); continue
        arquivo=(pasta/str(som.get('fonte',''))).resolve()
        if not arquivo.is_relative_to((pasta/'audio').resolve()) or not arquivo.is_file(): erros.append('som precisa estar em audio/ desta execução')
        db=som.get('volume_db',-20)
        if not isinstance(db,(int,float)) or not -40<=db<=0: erros.append('volume_db do som inválido')
        when=som.get('tempo',0)
        if not isinstance(when,(int,float)) or not 0<=when<d['duracao_s']: erros.append('tempo do SFX inválido')
    if erros: raise ValueError('\n'.join(erros))
    return meta,d,identidade

def _voz(pasta):
    d=ler(pasta/'timeline.json'); beats=d.get('beats',[])
    erros=validar_timeline(d,sem_palavras=True)
    if erros: raise ValueError('\n'.join(erros))
    meta=ler(pasta/'execucao.json')
    if d['execucao_id']!=meta['id'] or d['original_sha256']!=meta['original_sha256'] or hash_arq(pasta/'original.mp4')!=meta['original_sha256']:
        raise ValueError('timeline/original de outra execução; TTS não executado')
    texto=' '.join(b['fala'] for b in beats)
    alvo=pasta/'voz/narracao.mp3'
    if alvo.exists(): raise ValueError('voz já existe; não sobrescrever: nova execução para nova produção')
    (pasta/'voz').mkdir(exist_ok=True)
    (pasta/'voz/fala.txt').write_text(texto,encoding='utf-8')
    t=time.monotonic()
    retorno=rodar(['node',str(RAIZ/'ferramentas/voz.mjs'),'--arquivo',str(pasta/'voz/fala.txt'),'--saida',str(alvo)],timeout=140)
    dados=json.loads(retorno)
    gravar(pasta/'voz/geracao.json',{'duracao_s':dados['duracao_s'],'tempo_s':round(time.monotonic()-t,2),'tempos_s':dados.get('tempos_s',{})})
    if dados['duracao_s']>d['duracao_s']+.08: raise ValueError('voz longa demais: revisar fala antes de renderizar; não congelar imagem nem cortar palavras')
    fala=json.loads(rodar([sys.executable,str(RAIZ/'ferramentas/stt.py'),str(alvo),'pt','small'],timeout=180))
    gravar(pasta/'voz.json',fala)
    d['palavras']=fala['palavras']; gravar(pasta/'timeline.json',d)

def filtro_ass(nome):
    # nomes relativos fixos gerados internamente; cwd evita escaping de caminhos com espaços.
    return f"ass=filename={nome}"

def _montar(pasta):
    sem_palavras=(pasta/'voz/narracao.wav').exists()
    meta,d,marca=carregar(pasta, sem_palavras=sem_palavras)
    if (pasta/'final.mp4').exists(): raise ValueError('final já existe; preserve esta execução e inicie outra')
    w,h=meta.get('resolucao',marca['resolucao']);fps=marca['fps']
    if [w,h] not in ([720,1280],[1080,1920]): raise ValueError('resolução deve ser 720x1280 ou 1080x1920')
    ass=ass_legendas(d,marca); (pasta/'legendas.ass').write_text(ass,encoding='utf-8')
    capa_ass='\n'.join(x for x in ass.splitlines() if not x.startswith('Dialogue:') or ',Card,' in x or ',Marca,' in x)+'\n'
    (pasta/'capa.ass').write_text(capa_ass,encoding='utf-8')
    partes=[]
    for i,b in enumerate(d['beats']):
        f=pasta/b['fonte'];saida=pasta/f'_parte-{i:03}.mp4'
        if saida.exists(): raise ValueError('render parcial anterior; crie execução nova em vez de reutilizar')
        entrada=['-loop','1','-i',str(f)] if f.suffix.lower() in ('.png','.jpg','.jpeg','.webp') else ['-ss',str(b.get('inicio_fonte_s',0)),'-i',str(f)]
        crop=b.get('crop',[0,0,1,1]);cx,cy,cw,ch=crop
        pre=f'crop=iw*{cw}:ih*{ch}:iw*{cx}:ih*{cy}'
        layout=b.get('layout','cheio')
        if layout=='cheio':
            vf=pre+f',scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},setsar=1,fps={fps}'
        else:
            ax,ay,aw,ah=b.get('area_visual',[0,.30,1,.40])
            vw=max(2,round(w*aw)//2*2);vh=max(2,round(h*ah)//2*2);px=round(w*ax);py=round(h*ay)
            frente=f'scale={vw}:{vh}:force_original_aspect_ratio=decrease,pad={vw}:{vh}:(ow-iw)/2:(oh-ih)/2:color=0x120b16'
            if layout=='janela':
                vf=pre+f',{frente},pad={w}:{h}:{px}:{py}:color=0x120b16,setsar=1,fps={fps}'
            else:
                vf=pre+f',split[bg][fg];[bg]scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},boxblur=12:2[blur];[fg]{frente}[sharp];[blur][sharp]overlay={px}:{py},setsar=1,fps={fps}'
        rodar([FF,'-v','error',*entrada,'-t',str(b['fim']-b['ini']),'-an','-vf',vf,'-c:v','libx264','-preset','veryfast','-crf','20','-threads','2','-pix_fmt','yuv420p',str(saida)],timeout=180)
        partes.append(saida)
    (pasta/'partes.txt').write_text(''.join(f"file '{x.name}'\n" for x in partes),encoding='utf-8')
    # logo fixa + identidade textual + cards e legendas dinâmicas via libass.
    escala=w/1080; logo_w=round(100*escala); x=round(55*escala); y=round(245*escala)
    vf=f'[0:v]{filtro_ass("legendas.ass")}[base];[2:v]scale={logo_w}:-1[logo];[base][logo]overlay={x}:{y}:format=auto[v]'
    entradas=[FF,'-v','error','-f','concat','-safe','1','-i','partes.txt','-i','voz/narracao.mp3','-i',str(RAIZ/marca['logo'])]
    sons=([dict(d['musica'],_musica=True)] if d.get('musica') else [])+d.get('sfx',[])
    vf+=';[1:a]loudnorm=I=-14:TP=-1:LRA=7,apad[voz]';labels=['[voz]']
    for i,som in enumerate(sons,3):
        if som.get('_musica'): entradas+=['-stream_loop','-1']
        entradas+=['-i',str(pasta/som['fonte'])]
        delay=round(som.get('tempo',0)*1000)
        vf+=f';[{i}:a]loudnorm=I=-14:TP=-1:LRA=7,volume={som.get("volume_db",-20)}dB,adelay={delay}:all=1[som{i}]'
        labels.append(f'[som{i}]')
    vf+=';'+''.join(labels)+f'amix=inputs={len(labels)}:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=7[som]'
    rodar(entradas+['-filter_complex',vf,'-map','[v]','-map','[som]','-t',str(d['duracao_s']),'-c:v','libx264','-preset','veryfast','-crf','20','-threads','2','-c:a','aac','-b:a','128k','-ar','48000','-pix_fmt','yuv420p','-movflags','+faststart','final.partial.mp4'],cwd=pasta,timeout=300)
    # Capa não consome o gancho: arquivo separado para selecionar no upload.
    rodar([FF,'-v','error','-i',str(RAIZ/marca['capa']),'-vf',f'scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},{filtro_ass("capa.ass")}','-frames:v','1','capa.png'],cwd=pasta,timeout=120)
    verificar_final(pasta,d,w,h,pasta/'final.partial.mp4')
    (pasta/'final.partial.mp4').replace(pasta/'final.mp4')
    # Remover só intermediários desta execução bem-sucedida.
    for p in partes: p.unlink()

def verificar_final(pasta,d,w,h,arquivo=None):
    final=arquivo or pasta/'final.mp4'; info=probe(final)
    vs=[s for s in info['streams'] if s['codec_type']=='video']; aus=[s for s in info['streams'] if s['codec_type']=='audio']
    erros=[]
    if not vs or (vs[0]['width'],vs[0]['height'])!=(w,h): erros.append('resolução errada')
    if not aus: erros.append('sem áudio')
    for nome,streams in (('vídeo',vs),('áudio',aus)):
        try: cobertura=float(streams[0]['duration'])
        except (IndexError,KeyError,TypeError,ValueError): cobertura=0
        if abs(cobertura-d['duracao_s'])>.12: erros.append(f'cobertura do stream {nome} divergente')
    if abs(float(info['format']['duration'])-d['duracao_s'])>.12: erros.append('duração divergente')
    # Vídeo: freezedetect direto no stream (sem split/crop/scale por beat; arquivo já está renderizado)
    rv=subprocess.run([FF,'-hide_banner','-i',str(final),'-vf','freezedetect=n=0.003:d=0.5','-f','null','-'],capture_output=True,text=True,timeout=120)
    if rv.returncode: erros.append('medição de vídeo falhou')
    freezes_raw=re.findall(r'freeze_start: ([\d.]+)',rv.stderr)
    # Ignorar freeze no frame 0 (thumbnail/capa estática do original); não é bug de render
    freezes=[f for f in freezes_raw if float(f)>0.1]
    # Still intencional deve ser declarado; não fingir movimento.
    if freezes and not d.get('freeze_intencional'): erros.append('freeze detectado; revisar trechos')
    # Áudio: ebur128 separado (filter_complex de vídeo + -af ebur128 falha em alguns FFmpeg)
    ra=subprocess.run([FF,'-hide_banner','-i',str(final),'-af','ebur128=peak=true','-f','null','-'],capture_output=True,text=True,timeout=120)
    if ra.returncode: erros.append('medição de áudio falhou')
    lufs=re.findall(r'I:\s+(-?[\d.]+) LUFS',ra.stderr)
    picos=re.findall(r'Peak:\s+(-?[\d.]+) dBFS',ra.stderr)
    if not lufs or not -16<=float(lufs[-1])<=-12: erros.append('loudness fora de -16 a -12 LUFS ou não medido')
    if not picos or float(picos[-1])>-.8: erros.append('pico acima de -0,8 dBTP ou não medido')
    (pasta/'qa-ffmpeg.log').write_text(rv.stderr+'\n---AUDIO---\n'+ra.stderr,encoding='utf-8')
    gravar(pasta/'qa-tecnico.json',{'ok':not erros,'erros':erros,'lufs':float(lufs[-1]) if lufs else None,'pico_dbtp':float(picos[-1]) if picos else None,'freeze_inicio_s':freezes,'sha256':hash_arq(final),'timeline_sha256':hash_arq(pasta/'timeline.json') if (pasta/'timeline.json').exists() else None,'identidade_sha256':hash_arq(RAIZ/'marca/identidade.json'),'revisao_editorial':'PENDENTE: comparar com original; não confundir QA técnico com aprovação'})
    if erros: raise ValueError('; '.join(erros))

def _preview(pasta):
    """Gera frames estáticos de cada beat antes do render final para checagem visual rápida."""
    meta,d,marca=carregar(pasta)
    w,h=meta.get('resolucao',marca['resolucao']);fps=marca['fps']
    if [w,h] not in ([720,1280],[1080,1920]): raise ValueError('resolução deve ser 720x1280 ou 1080x1920')
    out=pasta/'_preview'; out.mkdir(exist_ok=True)
    # Limpar previews anteriores desta execução para evitar confusão.
    for p in out.glob('beat_*.png'): p.unlink()
    t=time.monotonic()
    for i,b in enumerate(d['beats']):
        f=pasta/b['fonte'];saida=out/f'beat_{i:03d}.png'
        entrada=['-loop','1','-i',str(f)] if f.suffix.lower() in ('.png','.jpg','.jpeg','.webp') else ['-ss',str(b.get('inicio_fonte_s',0)),'-i',str(f)]
        crop=b.get('crop',[0,0,1,1]);cx,cy,cw,ch=crop
        pre=f'crop=iw*{cw}:ih*{ch}:iw*{cx}:ih*{cy}'
        layout=b.get('layout','cheio')
        if layout=='cheio':
            vf=pre+f',scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},setsar=1'
        else:
            ax,ay,aw,ah=b.get('area_visual',[0,.30,1,.40])
            vw=max(2,round(w*aw)//2*2);vh=max(2,round(h*ah)//2*2);px=round(w*ax);py=round(h*ay)
            frente=f'scale={vw}:{vh}:force_original_aspect_ratio=decrease,pad={vw}:{vh}:(ow-iw)/2:(oh-ih)/2:color=0x120b16'
            if layout=='janela':
                vf=pre+f',{frente},pad={w}:{h}:{px}:{py}:color=0x120b16,setsar=1'
            else:
                vf=pre+f',split[bg][fg];[bg]scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},boxblur=12:2[blur];[fg]{frente}[sharp];[blur][sharp]overlay={px}:{py},setsar=1'
        rodar([FF,'-v','error',*entrada,'-frames:v','1','-an','-vf',vf,str(saida)],timeout=30)
    elapsed=round(time.monotonic()-t,2)
    n=len(d['beats'])
    hook(pasta,'preview',True,tempo_s=elapsed,frames=n)
    return {'ok':True,'frames':n,'pasta':str(out),'tempo_s':elapsed}


def arquivar_falha(pasta, etapa):
    nomes = ['voz', 'voz.json'] if etapa=='voz' else ['final.partial.mp4','capa.png','legendas.ass','capa.ass','partes.txt','qa-tecnico.json','qa-ffmpeg.log']
    arqs=[pasta/x for x in nomes if (pasta/x).exists()]+(list(pasta.glob('_parte-*.mp4')) if etapa=='montar' else [])
    if not arqs: return
    dest=pasta/'tentativas'/f'{etapa}-{uuid.uuid4().hex[:8]}'
    dest.mkdir(parents=True)
    for p in arqs: shutil.move(str(p),str(dest/p.name))
    if etapa=='voz': (pasta/'voz').mkdir(exist_ok=True)


def voz(pasta):
    if (pasta/'voz/narracao.mp3').exists() and (pasta/'voz.json').exists():
        raise ValueError('voz já concluída; para mudar conteúdo, use nova execução')
    arquivar_falha(pasta,'voz')
    try: _voz(pasta)
    except Exception:
        arquivar_falha(pasta,'voz'); raise


def montar(pasta):
    if (pasta/'final.mp4').exists(): raise ValueError('final já concluído; para mudar conteúdo, use nova execução')
    arquivar_falha(pasta,'montar')
    try: _montar(pasta)
    except Exception:
        arquivar_falha(pasta,'montar'); raise


def concluir(pasta):
    parecer=ler(pasta/'portao.json');qa=ler(pasta/'qa-tecnico.json');meta=ler(pasta/'execucao.json')
    atual=hash_arq(pasta/'final.mp4')
    if not qa.get('ok') or qa.get('sha256')!=atual: raise ValueError('QA técnico ausente/reprovado ou final alterado')
    if parecer.get('veredito')!='APROVADO' or not parecer.get('revisor') or not parecer.get('produtor') or parecer['revisor']==parecer['produtor']:
        raise ValueError('necessária revisão editorial aprovada por revisor distinto do produtor')
    if parecer.get('sha256')!=atual: raise ValueError('parecer pertence a outro arquivo')
    if qa.get('timeline_sha256')!=hash_arq(pasta/'timeline.json') or qa.get('identidade_sha256')!=hash_arq(RAIZ/'marca/identidade.json'):
        raise ValueError('timeline/identidade mudou após render; nova produção necessária')
    meta['status']='revisado';meta['decorrido_total_s']=round(time.time()-meta['inicio_unix'],2)
    meta['meta_180s_atingida']=meta['decorrido_total_s']<=180
    meta['publicacao_autorizada']=False
    gravar(pasta/'execucao.json',meta)
    hook(pasta,'concluir',True,total_decorrido_s=meta['decorrido_total_s'],publicacao_autorizada=False)
    return meta


MOLDES=ler(RAIZ/'ferramentas/moldes_timeline.json')

def gerar_timeline_de_molde(pasta,layout,beats_especificacao):
    """Gera timeline.json a partir de molde pré-validado. beats_especificacao é lista de dicts com:
    id, funcao, texto_tela, fala, fonte, tipo_fonte, duracao_s (ou ini/fim), inicio_fonte_s (opcional).
    Posições e layout vêm do molde; tempos são alinhados automaticamente à grade 30fps."""
    if layout not in MOLDES['layouts']: raise ValueError(f'layout desconhecido: {layout}; opções: {list(MOLDES["layouts"])}')
    m=MOLDES['layouts'][layout]
    meta=ler(pasta/'execucao.json')
    # Calcular duração total e alinhar beats à grade 30fps
    beats=[];fim_acumulado=0.0
    for i,b in enumerate(beats_especificacao):
        if 'duracao_s' in b:
            raw_dur=b['duracao_s']
            ini=fim_acumulado
            fim_raw=ini+raw_dur
        elif 'ini' in b and 'fim' in b:
            ini=float(b['ini']);fim_raw=float(b['fim'])
        else:
            raise ValueError(f'beat {i}: precisa de duracao_s ou ini+fim')
        # Alinhar fim à grade 30fps
        fim=round(fim_raw*30)/30
        if abs(ini*30-round(ini*30))>0.001: ini=round(ini*30)/30
        beat={'id':b['id'],'ini':ini,'fim':fim,'funcao':b['funcao'],'funcao_original':b['funcao'],
              'texto_tela':b['texto_tela'],'fala':b['fala'],'fonte':b['fonte'],'tipo_fonte':b['tipo_fonte'],
              'layout':m['layout'],'crop':list(m['crop']),'card_pos':list(m['card_pos']),'legenda_pos':list(m['legenda_pos'])}
        if m.get('area_visual'): beat['area_visual']=list(m['area_visual'])
        if b.get('inicio_fonte_s') is not None: beat['inicio_fonte_s']=float(b['inicio_fonte_s'])
        beats.append(beat);fim_acumulado=fim
    duracao_total=fim_acumulado
    timeline={'versao':1,'execucao_id':pasta.name,'original_sha256':meta['original_sha256'],
              'duracao_s':duracao_total,
              'referencia':{'pessoa_real':False,'trailer':False,'verificado_por':'molde'},
              'gancho':{'promessa':beats_especificacao[0].get('promessa',''),'escolhido':beats[0]['texto_tela'],'pagamento_beat':beats[-1]['id']},
              'beats':beats}
    gravar(pasta/'timeline.json',timeline)
    return timeline

def main():
    ap=argparse.ArgumentParser(description=__doc__);sp=ap.add_subparsers(dest='cmd',required=True)
    ini=sp.add_parser('iniciar');ini.add_argument('original');ini.add_argument('--slug',required=True);ini.add_argument('--inicio-unix',type=float)
    mol=sp.add_parser('molde');mol.add_argument('pasta');mol.add_argument('--layout',required=True,choices=['cheio','janela','tres_faixas']);mol.add_argument('--beats-json',required=True,help='JSON string com lista de beats')
    for n in ('analisar','voz','validar','montar','concluir','preview'):
        p=sp.add_parser(n);p.add_argument('pasta')
        if n=='analisar':p.add_argument('--completo',action='store_true')
    a=ap.parse_args()
    if a.cmd=='iniciar':
        try: print(iniciar(a.original,a.slug,inicio_unix=a.inicio_unix));return
        except (OSError,ValueError) as e: sys.exit(str(e))
    if a.cmd=='molde':
        pasta=Path(a.pasta).resolve();t=time.monotonic()
        try:
            beats=json.loads(a.beats_json)
            tl=gerar_timeline_de_molde(pasta,a.layout,beats)
            hook(pasta,'molde',True,tempo_s=round(time.monotonic()-t,2),layout=a.layout,n_beats=len(beats))
            print(json.dumps({'ok':True,'etapa':'molde','duracao_s':tl['duracao_s'],'n_beats':len(beats),'tempo_s':round(time.monotonic()-t,2)},ensure_ascii=False))
        except (OSError,ValueError,json.JSONDecodeError) as e:
            hook(pasta,'molde',False,erro=str(e),tempo_s=round(time.monotonic()-t,2));sys.exit(str(e))
        return
    pasta=Path(a.pasta).resolve();t=time.monotonic()
    try:
        if a.cmd=='analisar':analisar(pasta,a.completo)
        elif a.cmd=='voz':voz(pasta)
        elif a.cmd=='validar':carregar(pasta)
        elif a.cmd=='preview':
            res=_preview(pasta);print(json.dumps(res,ensure_ascii=False));return
        elif a.cmd=='montar':montar(pasta)
        else:
            meta=concluir(pasta);print(json.dumps({'ok':True,'status':meta['status'],'total_decorrido_s':meta['decorrido_total_s']},ensure_ascii=False));return
        meta=ler(pasta/'execucao.json');meta['etapas_s'][a.cmd]=round(meta['etapas_s'].get(a.cmd,0)+time.monotonic()-t,2)
        meta['decorrido_total_s']=round(time.time()-meta['inicio_unix'],2)
        meta['status']='aguardando_revisao_editorial' if a.cmd=='montar' else a.cmd
        gravar(pasta/'execucao.json',meta);hook(pasta,a.cmd,True,tempo_s=meta['etapas_s'][a.cmd])
        print(json.dumps({'ok':True,'etapa':a.cmd,'tempo_s':meta['etapas_s'][a.cmd],'total_decorrido_s':meta['decorrido_total_s']},ensure_ascii=False))
    except (OSError,ValueError,KeyError,TypeError,RuntimeError,subprocess.SubprocessError) as e:
        if pasta.is_dir():hook(pasta,a.cmd,False,erro=str(e),tempo_s=round(time.monotonic()-t,2))
        sys.exit(str(e))

if __name__=='__main__':main()
