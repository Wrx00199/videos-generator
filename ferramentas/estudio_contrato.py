"""Contrato do clonador e composição ASS: stdlib, sem chamadas externas."""
import math
import re
import textwrap
from pathlib import PurePosixPath

TIPOS = {'motion', 'infografico', 'imagem_oficial', 'gameplay_verificado', 'broll_aprovado'}

def numero(x):
    return isinstance(x, (int, float)) and not isinstance(x, bool) and math.isfinite(x)

def normalizar(s):
    return re.findall(r'\w+', str(s).casefold(), re.UNICODE)

def validar_timeline(d, sem_palavras=False):
    erros=[]
    if not isinstance(d, dict): return ['timeline precisa ser objeto']
    if d.get('versao') != 1: erros.append('versao deve ser 1')
    if not d.get('execucao_id'): erros.append('sem execucao_id')
    if not re.fullmatch('[a-f0-9]{64}', str(d.get('original_sha256',''))): erros.append('hash do original inválido')
    dur=d.get('duracao_s')
    if not numero(dur) or not 0 < dur <= 180: return erros+['duração inválida (0–180 s)']
    ref=d.get('referencia', {})
    if not isinstance(ref,dict) or ref.get('pessoa_real') is not False or ref.get('trailer') is not False or not ref.get('verificado_por'):
        erros.append('referência requer verificação explícita: sem pessoa real e sem trailer')
    beats=d.get('beats',[])
    if not isinstance(beats,list) or not beats: return erros+['sem beats']
    fim=0; ids=[]; falas=[]
    for i,b in enumerate(beats):
        if not isinstance(b,dict): erros.append(f'beat {i} inválido'); continue
        ids.append(b.get('id'))
        a,z=b.get('ini'),b.get('fim')
        if not numero(a) or not numero(z) or not 0 <= a < z <= dur or abs(a-fim)>0.00001:
            erros.append(f'beat {i}: intervalo inválido, lacuna ou sobreposição')
        if numero(z): fim=z
        if not b.get('funcao') or b.get('funcao')!=b.get('funcao_original'): erros.append(f'beat {i}: função do original alterada/ausente')
        if not isinstance(b.get('tipo_fonte'),str) or b.get('tipo_fonte') not in TIPOS: erros.append(f'beat {i}: fonte não permitida; trailer/streamer não pertencem ao clone')
        if b.get('layout','cheio') not in ('cheio','janela','tres_faixas'): erros.append(f'beat {i}: layout não suportado; renderize peça por motion')
        for campo in ('crop','area_visual'):
            if campo in b:
                box=b[campo]
                if not isinstance(box,list) or len(box)!=4 or not all(numero(v) for v in box) or not (0<=box[0]<1 and 0<=box[1]<1 and 0<box[2]<=1-box[0] and 0<box[3]<=1-box[1]): erros.append(f'beat {i}: {campo} inválido')
        for campo in ('card_pos','legenda_pos'):
            if campo in b:
                pos=b[campo]
                if not isinstance(pos,list) or len(pos)!=2 or not all(numero(v) for v in pos) or not (.15<=pos[0]<=.78 and .25<=pos[1]<=.70): erros.append(f'beat {i}: {campo} fora da zona segura')
        fonte=PurePosixPath(str(b.get('fonte','')))
        if fonte.is_absolute() or '..' in fonte.parts or not fonte.parts or fonte.parts[0]!='visual': erros.append(f'beat {i}: fonte deve estar em visual/ desta execução')
        if not str(b.get('texto_tela','')).strip(): erros.append(f'beat {i}: sem texto novo')
        if not isinstance(b.get('fala'),str) or not b.get('fala','').strip(): erros.append(f'beat {i}: sem fala nova')
        if len(str(b.get('texto_tela',''))) > 100: erros.append(f'beat {i}: texto longo demais para o card (100 caracteres)')
        falas.append(str(b.get('fala','')))
        if numero(a) and numero(z) and (abs(a*30-round(a*30))>0.001 or abs(z*30-round(z*30))>0.001): erros.append(f'beat {i}: alinhar limites à grade de 30 fps')
    if abs(fim-dur)>0.00001: erros.append('beats não cobrem a duração')
    if any(not isinstance(x,str) or not x for x in ids) or len(set(str(x) for x in ids))!=len(ids): erros.append('ids de beats vazios/duplicados')
    g=d.get('gancho',{})
    if not isinstance(g,dict) or not g.get('promessa') or g.get('pagamento_beat') not in ids or not g.get('escolhido'):
        erros.append('gancho precisa de promessa, escolhido e beat de pagamento existente')
    if sem_palavras: return erros
    palavras=d.get('palavras',[])
    if not isinstance(palavras,list) or not palavras: return erros+['sem timestamps reais da voz']
    ultimo=0
    for i,p in enumerate(palavras):
        if not isinstance(p,dict): erros.append(f'palavra {i}: inválida'); continue
        a,z=p.get('ini'),p.get('fim')
        if not numero(a) or not numero(z) or not 0<=a<z<=dur or a<ultimo-.03: erros.append(f'palavra {i}: timestamp inválido')
        if numero(z): ultimo=z
    if normalizar(' '.join(str(p.get('w','')) for p in palavras if isinstance(p,dict)))!=normalizar(' '.join(falas)):
        erros.append('legenda diverge da fala escrita; revisar transcrição')
    return erros

def escapar_ass(s):
    return str(s).replace('\\','／').replace('{','(').replace('}',')').replace('\r',' ').replace('\n',' ')

def tc(s):
    n=round(s*100)
    return f'{n//360000}:{n//6000%60:02}:{n//100%60:02}.{n%100:02}'

def ass_legendas(d, identidade):
    head='''[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Legenda,Noto Sans,66,&H00FFFFFF,&H0000FFFF,&H00120B16,&H80000000,-1,0,0,0,100,100,0,0,1,4,1,5,90,150,0,1
Style: Card,Noto Sans,72,&H00FFFFFF,&H00FFFFFF,&H00120B16,&H80000000,-1,0,0,0,100,100,0,0,1,4,1,8,90,150,440,1
Style: Marca,Noto Sans,36,&H00FFFFFF,&H00FFFFFF,&H00120B16,&H80000000,-1,0,0,0,100,100,0,0,1,2,0,8,50,150,345,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
    linhas=[head]
    def evento(a,b,style,text,layer=1): linhas.append(f'Dialogue: {layer},{tc(a)},{tc(b)},{style},,0,0,0,,{text}\n')
    # Marca: nick colorido no canto inferior direito, conforme pedido do Filippe
    nick=escapar_ass(identidade['nick'])
    if nick.lower().endswith('br'): nick=nick[:-2]+r'{\c&H00FFFF&}'+nick[-2]+r'{\c&H00FF00&}'+nick[-1]+r'{\c&HFFFFFF&}'
    evento(0,d['duracao_s'],'Marca',r'{\pos(960,1840)}'+nick)
    # Apenas Card por beat (sem legenda palavra-a-palavra para evitar duplicação visual)
    for b in d['beats']:
        x,y=b.get('card_pos',[.5,.18]);pos=r'{\pos('+f'{round(x*1080)},{round(y*1920)}'+')}'
        texto=r'\N'.join(escapar_ass(l) for l in textwrap.wrap(b['texto_tela'],width=20))
        evento(b['ini'],b['fim'],'Card',pos+texto)
    return ''.join(linhas)
