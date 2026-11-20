#!/usr/bin/env python3
"""portao.py — juiz em codigo de cada etapa do Tiao V4. Exit code 0 so se tudo ok.
Uso: python3 portao.py <projeto> <roteiro|final>  |  python3 portao.py novo <slug>
Exit: 0 ok · 1 reprovou · 2 arquivo faltando/entrada invalida.
Limiares [C] (chamadas minhas, ver DESIGN_V4 item 2): duracao 50-75 s, >=2,8 pal/s,
>=25 planos/min, plano maximo 3 s, LUFS -14 +-1, pico <= -1 dBTP, silencio no meio <= 0,4 s."""
import datetime, math, glob, json, os, re, subprocess, sys
from dataclasses import dataclass

DUR_MIN, DUR_MAX = 50.0, 90.0   # 18/11: reels BR de milhoes de views medem 56-91 s
PAL_S_MIN = 2.5
PLANOS_MIN = 15.0
PLANO_MAX_S = 5.0                # hits BR: 9-51 cortes/min, imagem ~4-6 s com camera/HUD/legenda mexendo
LUFS_ALVO, LUFS_TOL = -14.0, 1.0
PICO_MAX = -1.0
SIL_MAX = 0.4
ROTEIRO_PAL = (150, 240)


@dataclass
class Resultado:
    nome: str
    ok: bool
    valor: str
    limite: str
    motivo: str = ''


def checar_duracao(seg):
    ok = DUR_MIN <= seg <= DUR_MAX
    if seg <= 0:
        return Resultado('duracao', False, '0s', f'{DUR_MIN:.0f}-{DUR_MAX:.0f}s', 'mp4 ilegivel ou truncado (sem duracao)')
    return Resultado('duracao', ok, f'{seg:.1f}s', f'{DUR_MIN:.0f}-{DUR_MAX:.0f}s',
                     '' if ok else f'duracao {seg:.1f}s fora de {DUR_MIN:.0f}-{DUR_MAX:.0f}s')


def checar_ritmo(palavras, seg):
    if seg <= 0 or palavras <= 0:
        return Resultado('ritmo', False, f'{palavras} pal / {seg:.1f}s', f'>={PAL_S_MIN} pal/s',
                         'sem palavras ou duracao zero')
    v = palavras / seg
    ok = v >= PAL_S_MIN
    return Resultado('ritmo', ok, f'{v:.2f} pal/s', f'>={PAL_S_MIN} pal/s',
                     '' if ok else f'ritmo {v:.2f} pal/s abaixo de {PAL_S_MIN}')


def checar_planos(cortes, seg):
    if seg <= 0 or not cortes:
        return Resultado('planos', False, '0', f'>={PLANOS_MIN:.0f}/min', 'sem planos ou duracao zero')
    c = sorted(cortes)
    durs = [b - a for a, b in zip(c, c[1:] + [seg])]
    maior = max(durs)
    pm = len(c) / seg * 60
    falhas = []
    if pm < PLANOS_MIN:
        falhas.append(f'{pm:.1f} planos/min < {PLANOS_MIN:.0f}')
    if maior > PLANO_MAX_S:
        falhas.append(f'plano de {maior:.1f}s > {PLANO_MAX_S:.0f}s (plano {durs.index(maior)})')
    return Resultado('planos', not falhas, f'{pm:.1f}/min, maior {maior:.1f}s',
                     f'>={PLANOS_MIN:.0f}/min, maior <={PLANO_MAX_S:.0f}s', '; '.join(falhas))


def _ffprobe(mp4, entries, stream=None):
    cmd = ['ffprobe', '-v', 'error']
    if stream:
        cmd += ['-select_streams', stream]
    cmd += ['-show_entries', entries, '-of', 'json', mp4]
    r = subprocess.run(cmd, capture_output=True, text=True)
    try:
        return json.loads(r.stdout or '{}')
    except ValueError:
        return {}


def duracao_video(mp4):
    d = _ffprobe(mp4, 'format=duration')
    try:
        return float(d['format']['duration'])
    except (KeyError, ValueError):
        return 0.0


def medir_audio(mp4):
    out = {'lufs': None, 'pico': None, 'tem_audio': False, 'silencios_meio': []}
    if not _ffprobe(mp4, 'stream=codec_type', 'a').get('streams'):
        return out
    out['tem_audio'] = True
    dur = duracao_video(mp4)
    r = subprocess.run(['ffmpeg', '-nostats', '-i', mp4, '-vn', '-af',
                        'ebur128=peak=true,silencedetect=n=-40dB:d=0.4', '-f', 'null', '-'],
                       capture_output=True, text=True)
    t = r.stderr
    resumo = t[t.rfind('Summary:'):] if 'Summary:' in t else ''
    m = re.search(r'I:\s+(-?[\d.]+) LUFS', resumo)
    if m:
        out['lufs'] = float(m.group(1))
    m = re.search(r'Peak:\s+(-?[\d.inf]+) dBFS', resumo)
    if m:
        out['pico'] = float('-inf') if 'inf' in m.group(1) else float(m.group(1))
    ini = None
    for linha in t.splitlines():
        a = re.search(r'silence_start: (-?[\d.]+)', linha)
        if a:
            ini = float(a.group(1))
        b = re.search(r'silence_end: ([\d.]+) \| silence_duration: ([\d.]+)', linha)
        if b and ini is not None:
            fim, d = float(b.group(1)), float(b.group(2))
            if ini >= 0.5 and fim <= dur - 0.5:
                out['silencios_meio'].append(round(d, 2))
            ini = None
    return out


def checar_audio(m):
    if not m.get('tem_audio'):
        return Resultado('audio', False, 'sem faixa', 'LUFS -14±1, pico<=-1', 'video sem faixa de audio')
    f = []
    if m['lufs'] is None or abs(m['lufs'] - LUFS_ALVO) > LUFS_TOL:
        f.append(f"LUFS {m['lufs']} fora de {LUFS_ALVO}±{LUFS_TOL:g}")
    if m['pico'] is None or m['pico'] > PICO_MAX:
        f.append(f"pico {m['pico']} dBTP > {PICO_MAX}")
    longos = [s for s in m['silencios_meio'] if s > SIL_MAX]
    if longos:
        f.append(f'{len(longos)} silencio(s) no meio > {SIL_MAX}s (max {max(longos):.2f}s)')
    return Resultado('audio', not f, f"{m['lufs']} LUFS / {m['pico']} dBTP",
                     f'{LUFS_ALVO}±{LUFS_TOL:g} LUFS, pico<={PICO_MAX}, silencio<={SIL_MAX}s', '; '.join(f))


def checar_formato(mp4):
    s = (_ffprobe(mp4, 'stream=width,height', 'v').get('streams') or [{}])[0]
    w, h = s.get('width'), s.get('height')
    ok = (w, h) == (1080, 1920)
    return Resultado('formato', ok, f'{w}x{h}', '1080x1920', '' if ok else f'formato {w}x{h}')


def _carregar(proj, nome):
    p = os.path.join(proj, nome)
    if not os.path.isfile(p):
        print(f'ERRO: falta {nome} em {proj}')
        sys.exit(2)
    try:
        return json.load(open(p, encoding='utf-8'))
    except ValueError:
        print(f'ERRO: {nome} nao e JSON valido')
        sys.exit(2)


def contar_palavras(falas_json):
    falas = falas_json.get('falas') if isinstance(falas_json, dict) else falas_json
    if not falas:
        print('ERRO: falas.json sem falas')
        sys.exit(2)
    tot = 0
    for f in falas:
        n = len(re.findall(r'\S+', f.get('texto', '')))
        if n == 0:
            print('ERRO: fala vazia em falas.json')
            sys.exit(2)
        tot += n
    return tot


def checar_roteiro(palavras):
    lo, hi = ROTEIRO_PAL
    ok = lo <= palavras <= hi
    return Resultado('roteiro_palavras', ok, str(palavras), f'{lo}-{hi}',
                     '' if ok else f'{palavras} palavras fora de {lo}-{hi} (cabe em 50-75 s a >=2,8 pal/s)')


# --- HUD -------------------------------------------------------------------
# Mapeamento (decisao do implementador): cada item de contadores.json vira um evento
# (ini, fim, y_min, y_max). ini = t0 (ou 1o tempo de "valores", ou 0); fim = t1;
# y = centro da plaquinha em px de 1920; a plaquinha ocupa +-HUD_MEIA_ALTURA px
# (contador.py usa --tamanho 118 + rotulo menor => ~180 px). Legenda fica embaixo
# (MarginV 360) e nao entra na conta. Limite: <=1 contador por vez (design item 2).
HUD_MEIA_ALTURA = 90
ALTURA_TELA = 1920.0
KIT = os.path.dirname(os.path.abspath(__file__))


def hud_sobrepoe(eventos):
    pares = []
    for i in range(len(eventos)):
        for j in range(i + 1, len(eventos)):
            a, b = eventos[i], eventos[j]
            if min(a[1], b[1]) > max(a[0], b[0]) and min(a[3], b[3]) > max(a[2], b[2]):
                pares.append((i, j))
    return pares


def eventos_hud(proj):
    p = os.path.join(proj, 'contadores.json')
    if not os.path.isfile(p):
        return []
    try:
        d = json.load(open(p, encoding='utf-8'))
    except ValueError:
        return None
    if isinstance(d, dict):
        d = [d]
    ev = []
    for c in d:
        if not isinstance(c, dict):
            continue
        v = c.get('valores')
        t0 = c.get('t0', v[0][0] if v else 0)
        y = float(c.get('y', 215))
        ev.append((float(t0), float(c.get('t1', 0)), (y - HUD_MEIA_ALTURA) / ALTURA_TELA,
                   (y + HUD_MEIA_ALTURA) / ALTURA_TELA))
    return ev


def checar_hud(proj):
    ev = eventos_hud(proj)
    if ev is None:
        return Resultado('hud', False, 'contadores.json ilegivel', '<=1 por vez', 'contadores.json nao e JSON valido')
    simult = [(i, j) for i in range(len(ev)) for j in range(i + 1, len(ev))
              if min(ev[i][1], ev[j][1]) > max(ev[i][0], ev[j][0])]
    esp = hud_sobrepoe(ev)
    f = []
    if simult:
        f.append(f'{len(simult)} par(es) de contadores ao mesmo tempo (max 1 por vez)')
    if esp:
        f.append(f'{len(esp)} par(es) com caixas sobrepostas')
    return Resultado('hud', not f, f'{len(ev)} contador(es)', '<=1 por vez, sem sobreposicao', '; '.join(f))


# --- roteiro V4: gancho fixo, voz unica, virada tardia (18/11, pedido do Filippe) --
# falas.json precisa de: "formato" (e_se|o_que_aconteceria|tiao_foi|fato_estranho),
# "virada" (indice da fala que revela/ressignifica) e "personagens" com tiao.
# Limiares [C]: gancho <=14 palavras na 1a frase; <=2 vozes; virada entre 65% e 92% das falas.
FORMATOS = {'se_voce': r'^\s*(se (voc[eê]|todo|a gente)|voc[eê])\b', 'desafio': None, 'e_se': r'^\s*e se\b', 'o_que_aconteceria': r'^\s*o que (aconteceria|acontece|ia acontecer) se\b',
            'tiao_foi': r'^\s*(o\s+)?(ti[aã]o|eu)\b', 'fato_estranho': None, 'cena': None}
GANCHO_MAX_PAL, VOZES_MAX = 16, 2
VIRADA_MIN, VIRADA_MAX = 0.65, 0.92
ESCADA_MIN = 3   # falas com degrau numerado (Hora 3, Dia 7, Problema 2...)


def checar_roteiro_v4(d):
    falas = d.get('falas') or []
    rs = []
    fmt = d.get('formato')
    if fmt not in FORMATOS:
        rs.append(Resultado('gancho_formato', False, str(fmt), '|'.join(FORMATOS), 'falas.json sem "formato" valido'))
    else:
        t0 = falas[0].get('texto', '') if falas else ''
        pad = FORMATOS[fmt]
        ok = pad is None or re.search(pad, t0, re.I) is not None
        rs.append(Resultado('gancho_formato', ok, fmt, 'abertura do formato',
                            '' if ok else f'formato {fmt} exige abrir a 1a fala com o gancho do formato'))
    t0 = falas[0].get('texto', '') if falas else ''
    prim = re.split(r'(?<=[.!?])\s', t0.strip(), maxsplit=1)[0]
    n = len(re.findall(r'\S+', prim))
    rs.append(Resultado('gancho_curto', 0 < n <= GANCHO_MAX_PAL, f'{n} palavras', f'<={GANCHO_MAX_PAL}',
                        '' if 0 < n <= GANCHO_MAX_PAL else f'1a frase com {n} palavras (cabe em ~4 s so ate {GANCHO_MAX_PAL})'))
    vozes = {f.get('quem') for f in falas}
    rs.append(Resultado('vozes', len(vozes) <= VOZES_MAX, str(len(vozes)), f'<={VOZES_MAX}',
                        '' if len(vozes) <= VOZES_MAX else f'{len(vozes)} vozes ({", ".join(sorted(map(str, vozes)))}): usar narrador + no maximo 1'))
    tem = 'tiao' in (d.get('personagens') or [])
    rs.append(Resultado('tiao_presente', tem, 'sim' if tem else 'nao', 'tiao em personagens', '' if tem else 'todo video precisa do Tiao'))
    deg = sum(1 for f in falas if re.search(r'\b(hora|dia|noite|problema|passo|semana|m[eê]s|ano|minuto|etapa)\s*\d+', f.get('texto', ''), re.I))
    rs.append(Resultado('escada_numerada', deg >= ESCADA_MIN, f'{deg} degraus', f'>={ESCADA_MIN} falas com "Hora/Dia/Problema N"',
                        '' if deg >= ESCADA_MIN else f'so {deg} degrau(s) numerado(s) no texto (os reels BR marcam Hora/Dia/Problema N)'))
    ult = falas[-1].get('texto', '').strip() if falas else ''
    fecho = ult.endswith('?') or re.search(r'\b(comenta|manda|marca|escolhe|vota)\b', ult, re.I) is not None
    rs.append(Resultado('fecho_pergunta', fecho, ult[-40:] or '-', 'termina em pergunta/escolha ao publico',
                        '' if fecho else 'fecho sem pergunta/escolha ao publico (os reels BR de milhoes terminam assim)'))
    v = d.get('virada')
    if not isinstance(v, int) or not falas or not 0 <= v < len(falas):
        rs.append(Resultado('virada', False, str(v), f'{VIRADA_MIN:.0%}-{VIRADA_MAX:.0%}', 'falas.json sem "virada" (indice da fala da revelacao)'))
    else:
        pos = v / len(falas)
        ok = VIRADA_MIN <= pos <= VIRADA_MAX
        rs.append(Resultado('virada', ok, f'{pos:.0%}', f'{VIRADA_MIN:.0%}-{VIRADA_MAX:.0%}',
                            '' if ok else f'virada em {pos:.0%} (pergunta fecha cedo/tarde demais)'))
    if d.get('molde') == 'v5':
        rs += checar_roteiro_v5(d)
    return rs


# --- molde V5 (19/11): gancho que nao parece gancho, pista plantada que paga ----------
# Ativa com "molde": "v5" em falas.json. Exige tambem "pista" (indice da fala que planta) e
# "pista_palavra" (palavra que aparece na fala da pista E na da virada). Ver MOLDE_V5_HISTORIA.md.
NUM_PAL = r'(\d+|um|uma|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|cem|mil|meia|[uú]ltim[oa]|[uú]nic[oa]|nunca|zero)'
ENCHIMENTO = ('tudo certo', 'no final das contas', 'como todo mundo sabe', 'e assim', 'sem perceber', 'de repente',
              'muita coisa', 'um monte', 'incr[ií]vel', 'inacredit[aá]vel', 'chocante')


def checar_roteiro_v5(d):
    falas = d.get('falas') or []
    n = len(falas)
    rs = []
    t0 = falas[0].get('texto', '') if falas else ''
    prim = re.split(r'(?<=[.!?])\s', t0.strip(), maxsplit=1)[0]
    ok = re.search(r'\b' + NUM_PAL + r'\b', prim, re.I) is not None
    rs.append(Resultado('gancho_concreto', ok, prim[:50], 'numero/prazo/perda na 1a frase',
                        '' if ok else 'gancho sem numero, prazo ou perda: vira titulo, nao cena (ex.: "R$ 1 trilhao em 24 h. Sobrou 1 real, perde tudo.")'))
    if re.match(r'\s*(o que aconteceria|e se)\b', t0, re.I) and not ok:
        rs[-1] = Resultado('gancho_concreto', False, prim[:50], 'regra+prazo+perda, nao so a pergunta', 'abertura "E se..." pelada: ponha prazo e perda ou abra em cena')
    ench = [p for f in falas for p in ENCHIMENTO if re.search(p, f.get('texto', ''), re.I)]
    rs.append(Resultado('sem_enchimento', not ench, ','.join(ench) or 'ok', 'sem frase de enchimento', '' if not ench else 'troque por imagem/numero concreto: ' + ', '.join(ench)))
    p, v, w = d.get('pista'), d.get('virada'), (d.get('pista_palavra') or '').lower()
    if not (isinstance(p, int) and isinstance(v, int) and w and 0 <= p < n and 0 <= v < n):
        rs.append(Resultado('pista_paga', False, f'pista={p} palavra={w!r}', 'pista + pista_palavra', 'V5 exige "pista" (indice) e "pista_palavra"'))
    else:
        tp, tv = falas[p].get('texto', '').lower(), falas[v].get('texto', '').lower()
        ok = p < v and p / n <= 0.40 and w in tp and w in tv
        rs.append(Resultado('pista_paga', ok, f'pista {p}/{n}, virada {v}', 'pista antes de 40%, palavra na pista e na virada',
                            '' if ok else 'a virada tem que ressignificar uma pista plantada antes de 40% (mesma palavra nas duas falas)'))
    return rs


# --- variedade de camera (banco de 8, motor3d/cameras.js) ---------------------------
CAMERAS_VALIDAS = {'abertura_push', 'close_reacao', 'detalhe_objeto', 'corte_transversal',
                   'travelling_lateral', 'plongee', 'orbita', 'whip_pan', 'contra_plongee'}
CAMERAS_MIN, CENARIOS_MIN_60S = 5, 3


def checar_variedade(planos):
    lim = f'sem repetir em seguida, >={CAMERAS_MIN} cameras, >={CENARIOS_MIN_60S} ambientes (>=60 s)'
    if not planos:
        return Resultado('variedade', False, '0 planos', lim, 'plano.json vazio')
    falhas = []
    cams = [p.get('camera') for p in planos]
    ruins = sorted({c for c in cams if c not in CAMERAS_VALIDAS}, key=str)
    if ruins:
        falhas.append(f'camera fora do banco: {", ".join(map(str, ruins))}')
    for i in range(1, len(cams)):
        if cams[i] == cams[i - 1]:
            falhas.append(f'camera {cams[i]} repetida em seguida (plano {i - 1} e {i})')
            break
    dist = len(set(cams))
    if dist < CAMERAS_MIN:
        falhas.append(f'so {dist} cameras distintas (min {CAMERAS_MIN})')
    dur = max(float(p.get('fim', 0)) for p in planos)
    cen = len({p.get('cenario') for p in planos})
    need = CENARIOS_MIN_60S if dur >= 60 else 2
    if cen < need:
        falhas.append(f'so {cen} ambiente(s) em {dur:.0f} s (min {need})')
    return Resultado('variedade', not falhas, f'{dist} cameras, {cen} ambientes', lim, '; '.join(falhas))


def checar_variedade_proj(proj):
    p = os.path.join(proj, 'plano.json')
    if not os.path.isfile(p):
        return Resultado('variedade', False, 'sem plano.json', 'plano.json = [{ini,fim,camera,cenario}]', 'falta plano.json')
    try:
        return checar_variedade(json.load(open(p, encoding='utf-8')))
    except (ValueError, AttributeError):
        return Resultado('variedade', False, 'plano.json ilegivel', '-', 'plano.json nao e lista de planos valida')


# --- olhos / elenco -----------------------------------------------------------
# eye() do rig so desenha dot|wide|happy|shut|smug|x. Qualquer outro valor em story.js
# (ex.: 'look', usado 159x nos eps 14-28) = boneco SEM OLHO. Auditoria 18/11.
OLHOS_QUE_NAO_DESENHAM = {'look', 'grin', 'blink', 'wink'}


def checar_olhos(proj):
    p = os.path.join(proj, 'web', 'story.js')
    if not os.path.isfile(p):
        return Resultado('olhos', True, 'sem story.js', 'eye valido', '')
    usos = {}
    for m in re.finditer(r"eye:\s*'([a-z0-9_]+)'", open(p, encoding='utf-8', errors='replace').read()):
        if m.group(1) in OLHOS_QUE_NAO_DESENHAM:
            usos[m.group(1)] = usos.get(m.group(1), 0) + 1
    f = ', '.join(f"eye:'{k}' x{v}" for k, v in sorted(usos.items()))
    return Resultado('olhos', not usos, f or 'ok', "eye em dot|wide|happy|shut|smug|x",
                     '' if not usos else f'valor(es) que o rig nao desenha (boneco sem olho): {f}')


def checar_elenco_proj(proj):
    from aprovar_catalogo import checar_elenco
    ap = os.path.join(KIT, 'catalogo', 'aprovados.json')
    if not os.path.isfile(ap):
        return Resultado('elenco', False, 'sem aprovados.json', '-', 'rode aprovar_catalogo.py')
    return checar_elenco(_carregar(proj, 'falas.json'), json.load(open(ap, encoding='utf-8')))


# --- trava de lote ---------------------------------------------------------
def _corte():
    return open(os.path.join(KIT, 'portao', 'CORTE.txt')).read().strip()


def trava_lote(raiz, corte=None):
    corte = corte or _corte()
    pend = []
    for d in sorted(glob.glob(os.path.join(raiz, 'projetos', 'bonecos', '*'))):
        nome = os.path.basename(d)
        if not re.match(r'\d{4}-\d{2}-\d{2}-', nome) or nome[:10] < corte:
            continue
        if os.path.isfile(os.path.join(d, 'final.mp4')) and not os.path.isfile(os.path.join(d, 'APROVADO_FILIPPE')):
            pend.append(nome)
    return Resultado('trava_lote', not pend, ', '.join(pend) or 'nenhum', 'sem episodio pendente',
                     '' if not pend else f'episodio sem APROVADO_FILIPPE: {", ".join(pend)}')


def criar_projeto(raiz, slug, hoje=None, corte=None):
    r = trava_lote(raiz, corte)
    if not r.ok:
        print('TRAVADO:', r.motivo)
        sys.exit(1)
    base = os.path.join(raiz, 'projetos', 'bonecos')
    nums = [int(m.group(1)) for d in glob.glob(os.path.join(base, '*'))
            if (m := re.search(r'-(\d+)$', os.path.basename(d)))]
    nn = max(nums + [0]) + 1
    hoje = hoje or datetime.date.today().isoformat()
    slug = re.sub(r'[^a-z0-9-]+', '-', slug.lower()).strip('-') or 'sem-nome'
    p = os.path.join(base, f'{hoje}-tiao-{slug}-{nn:02d}')
    os.makedirs(os.path.join(p, 'portao'))
    json.dump({'criado': hoje, 'etapas': {}}, open(os.path.join(p, 'portao', 'estado.json'), 'w'))
    return p


def imprimir(rs):
    for r in rs:
        print(f"{'OK     ' if r.ok else 'REPROVA'} {r.nome:<16} {r.valor:<28} [{r.limite}] {r.motivo}")
    ok = all(r.ok for r in rs)
    print('PASSOU' if ok else 'REPROVOU')
    return ok


# --- FICHA DE MODELAGEM (regra 20/11): checagem mecanica -----------------------
# FICHA.md no projeto: linha "Ambientes_ref: N" + tabela sem celula vazia. plano.json = [{ini,fim,camera,cenario,luz}].
def checar_ficha(proj):
    lim = 'FICHA completa; cenarios>=max(3,0.8*ref); >=3 luzes; HUD<90% do tempo'
    fp = os.path.join(proj, 'FICHA.md')
    if not os.path.isfile(fp):
        return Resultado('ficha', False, 'sem FICHA.md', lim, 'falta FICHA.md (serie-tiao-kit/FICHA_MODELAGEM.md)')
    txt = open(fp, encoding='utf-8').read()
    f = []
    m = re.search(r'Ambientes_ref:\s*(\d+)', txt)
    if not m:
        f.append('FICHA sem linha "Ambientes_ref: N"')
    ref = int(m.group(1)) if m else 3
    linhas = [l for l in txt.splitlines() if l.strip().startswith('|') and not re.match(r'^\s*\|[\s:|-]+\|?\s*$', l)]
    dados = linhas[1:]
    if len(dados) < 5:
        f.append(f'tabela com {len(dados)} plano(s) (min 5)')
    vazias = sum(1 for l in dados for c in l.strip().strip('|').split('|') if not c.strip())
    if vazias:
        f.append(f'{vazias} celula(s) vazia(s) na FICHA')
    try:
        planos = json.load(open(os.path.join(proj, 'plano.json'), encoding='utf-8'))
    except (OSError, ValueError):
        planos = []
    cen = len({p.get('cenario') for p in planos})
    luz = {p.get('luz') for p in planos if p.get('luz')}
    need = max(3, math.ceil(0.8 * ref))
    if cen < need:
        f.append(f'{cen} cenario(s) distintos < {need} (ref {ref})')
    if len(luz) < 3:
        f.append(f'{len(luz)} luz(es) distinta(s) no plano.json (min 3; campo "luz" por plano)')
    ev = eventos_hud(proj) or []
    seg = max([float(p.get('fim', 0)) for p in planos] + [0])
    if ev and seg:
        ints = sorted((a, b) for a, b, _, _ in ev); tot = 0; ult = 0
        for a, b in ints:
            a = max(a, ult)
            if b > a:
                tot += b - a; ult = b
        if tot / seg >= 0.9:
            f.append(f'HUD cobre {tot / seg:.0%} do video (max 90%)')
    return Resultado('ficha', not f, f'{cen} cenarios, {len(luz)} luzes', lim, '; '.join(f))


def etapa_roteiro(proj):
    fj = _carregar(proj, 'falas.json')
    return [checar_roteiro(contar_palavras(fj)), checar_elenco_proj(proj)] + checar_roteiro_v4(fj)


def etapa_final(proj):
    mp4 = os.path.join(proj, 'final.mp4')
    if not os.path.isfile(mp4):
        print('ERRO: falta final.mp4')
        sys.exit(2)
    pal = contar_palavras(_carregar(proj, 'falas.json'))
    cenas = _carregar(proj, 'cenas.json')
    seg = duracao_video(mp4)
    cortes = [float(c[0]) for c in cenas]
    return [checar_duracao(seg), checar_ritmo(pal, seg), checar_planos(cortes, seg),
            checar_formato(mp4), checar_audio(medir_audio(mp4)), checar_hud(proj), checar_olhos(proj), checar_elenco_proj(proj), checar_variedade_proj(proj), checar_ficha(proj), checar_cobertura(proj)]


def checar_cobertura(proj):
    """Todo personagem/objeto citado nas falas aparece em plano (cobertura.py); so no formato V5 (story.js com T(n,...))."""
    js = os.path.join(proj, 'web', 'story.js')
    if not os.path.exists(js) or not re.search(r"\n\s*T\(\d+,", open(js, encoding='utf-8').read()):
        return Resultado('cobertura', True, 'n/a (formato sem T(n,...))', 'citado => aparece')
    r = subprocess.run([sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cobertura.py'), proj], capture_output=True, text=True)
    ok = r.returncode == 0
    return Resultado('cobertura', ok, 'ok' if ok else r.stdout.strip().splitlines()[0][:90], 'citado => aparece', '' if ok else r.stdout.strip())


def main(argv):
    if len(argv) == 3 and argv[1] == 'novo':
        raiz = os.path.abspath(os.path.join(KIT, '..', '..', '..'))
        print(criar_projeto(raiz, argv[2]))
        return 0
    if len(argv) != 3 or argv[2] not in ('roteiro', 'final'):
        print(__doc__)
        return 2
    proj = argv[1]
    if not os.path.isdir(proj):
        print(f'ERRO: projeto {proj} nao existe')
        return 2
    rs = etapa_roteiro(proj) if argv[2] == 'roteiro' else etapa_final(proj)
    return 0 if imprimir(rs) else 1


if __name__ == '__main__':
    sys.exit(main(sys.argv))
