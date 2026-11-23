#!/usr/bin/env python3
"""Valida as etapas do Tião.
Uso: python3 portao.py <projeto> <roteiro|voz|prova|final|entrega>
     python3 portao.py novo <slug>
Exit: 0 ok · 1 reprovou · 2 arquivo faltando ou entrada inválida."""
import datetime, math, glob, json, os, re, subprocess, sys
from dataclasses import dataclass
from pathlib import Path

DUR_MIN, DUR_MAX = 60.0, 90.0
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
    limite = f'>={PLANOS_MIN:.0f}/min, maior <={PLANO_MAX_S:.0f}s'
    if not _numero(seg) or seg <= 0 or not cortes:
        return Resultado('planos', False, '0', limite, 'sem planos ou duracao invalida')
    anterior = -1
    for i, corte in enumerate(cortes):
        if not _numero(corte) or not 0 <= corte < seg:
            return Resultado('planos', False, 'invalido', limite, f'plano {i}: inicio fora de [0, {seg}) ou nao finito')
        if i == 0 and corte != 0:
            return Resultado('planos', False, 'invalido', limite, 'primeiro plano precisa comecar em 0s')
        if corte <= anterior:
            return Resultado('planos', False, 'invalido', limite, f'plano {i}: inicio repetido ou fora de ordem')
        anterior = corte
    durs = [b - a for a, b in zip(cortes, [*cortes[1:], seg])]
    maior = max(durs)
    pm = len(cortes) / seg * 60
    falhas = []
    if pm < PLANOS_MIN:
        falhas.append(f'{pm:.1f} planos/min < {PLANOS_MIN:.0f}')
    if maior > PLANO_MAX_S:
        falhas.append(f'plano de {maior:.1f}s > {PLANO_MAX_S:.0f}s (plano {durs.index(maior)})')
    return Resultado('planos', not falhas, f'{pm:.1f}/min, maior {maior:.1f}s',
                     limite, '; '.join(falhas))


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
        with open(p, encoding='utf-8') as arquivo:
            return json.load(arquivo)
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
                     '' if ok else f'{palavras} palavras fora de {lo}-{hi} (cabe em 60–90 s)')


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
# "pista_palavra" (palavra que aparece na fala da pista E na da virada). Ver MOLDES_ROTEIRO.md.
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
    for i in range(2, len(planos)):
        t = planos[i - 2:i + 1]
        if all(isinstance(p, dict) for p in t) and len({(p.get('cenario'), p.get('luz')) for p in t}) == 1:
            falhas.append(f'3 planos seguidos com mesmo cenario+luz (planos {i - 2} a {i}); trocar cenario ou luz')
            break
    dist = len(set(cams))
    if dist < CAMERAS_MIN:
        falhas.append(f'so {dist} cameras distintas (min {CAMERAS_MIN})')
    dur = max(float(p.get('fim', 0)) for p in planos)
    if not isinstance(planos, list) or any(not isinstance(p, dict) for p in planos):
        planos = []
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


# --- prop da virada desligado ate a virada (ep.39: spoiler do payoff no cenario fixo) ---
def checar_prop_virada(proj):
    """plano_beats.json pode declarar props_virada=[{nome, visivel_desde, virada_em}] (segundos).
    Reprova se o prop aparece antes da virada. Sem declaracao = passa (regra: declare todo prop da virada)."""
    p = os.path.join(proj, 'plano_beats.json')
    lim = 'prop da virada visivel_desde >= virada_em'
    if not os.path.isfile(p):
        return Resultado('prop_virada', True, 'sem plano_beats.json', lim, '')
    try:
        beats = json.load(open(p, encoding='utf-8'))
        decl = [(b.get('beat'), x) for b in beats if isinstance(b, dict) for x in (b.get('props_virada') or [])]
        falhas = []
        for beat, x in decl:
            if float(x['visivel_desde']) < float(x['virada_em']) - 0.05:
                falhas.append(f"beat {beat}: '{x.get('nome')}' visivel em {x['visivel_desde']}s, antes da virada ({x['virada_em']}s)")
    except (ValueError, KeyError, TypeError, AttributeError):
        return Resultado('prop_virada', False, 'plano_beats.json ilegivel', lim, 'props_virada precisa de nome/visivel_desde/virada_em')
    return Resultado('prop_virada', not falhas, f'{len(decl)} prop(s) declarado(s)', lim, '; '.join(falhas))


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
        decidido = any(os.path.isfile(os.path.join(d, nome)) for nome in ('APROVADO_FILIPPE', 'REJEITADO_FILIPPE'))
        if os.path.isfile(os.path.join(d, 'final.mp4')) and not decidido:
            pend.append(nome)
    return Resultado('trava_lote', not pend, ', '.join(pend) or 'nenhum', 'sem episodio pendente',
                     '' if not pend else f'episodio sem decisao do Filippe: {", ".join(pend)}')


def raiz_dados(env=None, kit=None):
    """Resolve a raiz dos episódios. Um checkout só com código precisa de ESTUDIO_RAIZ."""
    env = os.environ.get('ESTUDIO_RAIZ') if env is None else env
    raiz = os.path.abspath(env or os.path.join(kit or KIT, '..', '..', '..'))
    base = os.path.join(raiz, 'projetos', 'bonecos')
    if not os.path.isdir(base):
        return None, f'{base} nao existe. Defina ESTUDIO_RAIZ com a pasta dos episodios.'
    if not env and not any(re.match(r'\d{4}-\d{2}-\d{2}-', n) for n in os.listdir(base)):
        return None, f'Sem episodios em {base}. Defina ESTUDIO_RAIZ com a pasta dos episodios.'
    return raiz, ''


def criar_projeto(raiz, slug, hoje=None, corte=None, fluxo='legado'):
    if fluxo == 'legado':
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
    with open(os.path.join(p, 'portao', 'estado.json'), 'w', encoding='utf-8') as arquivo:
        json.dump({'criado': hoje, 'fluxo': fluxo, 'etapas': {}}, arquivo)
    return p


def imprimir(rs):
    for r in rs:
        print(f"{'OK     ' if r.ok else 'REPROVA'} {r.nome:<16} {r.valor:<28} [{r.limite}] {r.motivo}")
    ok = all(r.ok for r in rs)
    print('PASSOU' if ok else 'REPROVOU')
    return ok


# --- FICHA DE MODELAGEM (regra 20/11): checagem mecanica -----------------------
# FICHA.md no projeto: linha "Ambientes_ref: N" + tabela sem celula vazia. plano.json = [{ini,fim,camera,cenario,luz}].
# Contrato mecanico (sem executar JS): story.js exporta PORTAO_BEATS como array
# JSON literal, um registro por beat. Plano: beat, ini/fim (segundos absolutos),
# props_citados:[id], verbos:[{palavra,ini,fim}] (tempos da palavra na fala).
# Story: beat, ini/fim, cenario, camera, acao, fala, oclusao (fracao 0..1),
# props:[{id,bbox:[x0,y0,x1,y1]}] (coordenadas normalizadas da caixa INTEIRA),
# acoes:[{verbo,ini,fim}] (intervalo em que a acao e visivel).
# Oclusao e o maximo por plano; bbox deve envolver o movimento inteiro do prop.
# Sao evidencias declaradas pelo produtor/motor, nao medidas de pixels do render.
# Ausencia de evidencia reprova; [] explicito permite plano sem props/verbos.
def _numero(v):
    return isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(v)


def _intervalo(d):
    return (isinstance(d, dict) and _numero(d.get('ini')) and _numero(d.get('fim'))
            and 0 <= d['ini'] < d['fim'])


def _indice_beats(dados, origem):
    if not isinstance(dados, list) or not dados:
        raise ValueError(f'{origem} sem lista de beats')
    out = {}
    for d in dados:
        if not isinstance(d, dict) or not isinstance(d.get('beat'), (str, int)) or isinstance(d['beat'], bool):
            raise ValueError(f'{origem} com beat ausente/invalido')
        k = str(d['beat']).strip()
        if not k or k in out:
            raise ValueError(f'{origem} com beat vazio/duplicado: {k}')
        out[k] = d
    return out


def _ficha_beats(txt):
    linhas = [[c.strip() for c in l.strip().strip('|').split('|')]
              for l in txt.splitlines() if l.strip().startswith('|')
              and not re.match(r'^\s*\|[\s:|-]+\|?\s*$', l)]
    if not linhas:
        raise ValueError('FICHA sem tabela')
    cab = linhas[0]
    colunas = {'beat': '#', 't': 't', 'cenario': 'Cenário NOSSO',
               'camera': 'Câmera REF', 'acao': 'Ação do Tião', 'fala': 'Fala PT-BR'}
    idx = {}
    for campo, prefixo in colunas.items():
        matches = [i for i, c in enumerate(cab) if c == prefixo or c.startswith(prefixo + ' ')]
        if len(matches) != 1:
            raise ValueError(f'FICHA sem coluna unica {prefixo}')
        idx[campo] = matches[0]
    dados = []
    for linha in linhas[1:]:
        if len(linha) != len(cab) or any(not c for c in linha):
            raise ValueError('FICHA com linha incompleta')
        d = {k: linha[i] for k, i in idx.items()}
        tempo = re.fullmatch(r'(\d+(?:[.,]\d+)?)\s*(?:s\s*)?[-–—]\s*(\d+(?:[.,]\d+)?)s?', d.pop('t'))
        if not tempo:
            raise ValueError(f'FICHA beat {d["beat"]}: t deve ser inicio-fim em segundos')
        d['ini'], d['fim'] = [float(x.replace(',', '.')) for x in tempo.groups()]
        d['camera'] = d['camera'].split('→')[-1].strip()
        dados.append(d)
    return _indice_beats(dados, 'FICHA')


def checar_planos_mecanicos(proj):
    limites = {'oclusao': '<25% por plano', 'props': 'area>=15%, margem>=8%, inteiro',
               'verbos': 'acao visivel ate o fim da palavra', 'ficha_story': 'FICHA = plano = story por beat'}
    falhas = {k: [] for k in limites}
    try:
        pb = os.path.join(proj, 'plano_beats.json')  # 1 registro por beat (plano.json fica 1 por plano p/ variedade)
        with open(pb if os.path.isfile(pb) else os.path.join(proj, 'plano.json'), encoding='utf-8') as fp:
            planos = _indice_beats(json.load(fp), 'plano_beats.json' if os.path.isfile(pb) else 'plano.json')
        js_path = os.path.join(proj, 'web', 'story.js')
        if not os.path.isfile(js_path):
            js_path = os.path.join(proj, 'story.js')
        with open(js_path, encoding='utf-8') as fp:
            js = fp.read()
        # JSONDecoder delimita o array, inclusive com strings contendo ];.
        declaracoes = list(re.finditer(r'^\s*export\s+const\s+PORTAO_BEATS\s*=\s*', js, re.M))
        if len(declaracoes) != 1:
            raise ValueError('story.js precisa de export const PORTAO_BEATS = [JSON]')
        trecho = js[declaracoes[0].end():]
        dados, fim = json.JSONDecoder().raw_decode(trecho)
        if not trecho[fim:].lstrip().startswith(';'):
            raise ValueError('PORTAO_BEATS deve ser JSON literal terminado por ;')
        story = _indice_beats(dados, 'story.js')
        with open(os.path.join(proj, 'FICHA.md'), encoding='utf-8') as fp:
            ficha = _ficha_beats(fp.read())
    except (OSError, ValueError) as e:
        return [Resultado(k, False, 'sem evidencia valida', lim, str(e)) for k, lim in limites.items()]
    if planos.keys() != story.keys() or planos.keys() != ficha.keys():
        for k in falhas:
            falhas[k].append('beats ausentes/extras entre plano.json, story.js e FICHA')
    for beat, p in planos.items():
        s, f = story.get(beat), ficha.get(beat)
        if s is None or f is None:
            continue
        label = f'beat {beat}'
        if not _intervalo(p) or not _intervalo(s) or not _intervalo(f):
            for k in falhas:
                falhas[k].append(f'{label}: intervalo invalido')
            continue
        for campo in ('ini', 'fim', 'cenario', 'camera'):
            if p.get(campo) != s.get(campo) or f.get(campo) != s.get(campo) or s.get(campo) in (None, ''):
                falhas['ficha_story'].append(f'{label}: {campo} diverge na FICHA/plano/story')
        for campo in ('acao', 'fala'):
            if not isinstance(s.get(campo), str) or not s[campo].strip() or f[campo] != s[campo].strip():
                falhas['ficha_story'].append(f'{label}: {campo} diverge na FICHA/story')
        o = s.get('oclusao')
        if not _numero(o) or not 0 <= o < .25:
            falhas['oclusao'].append(f'{label}: oclusao {o} (precisa 0 <= fracao < 0.25)')
        citados, props = p.get('props_citados'), s.get('props')
        if (not isinstance(citados, list) or any(not isinstance(x, str) or not x.strip() for x in citados)
                or not isinstance(props, list) or any(not isinstance(x, dict) for x in props)):
            falhas['props'].append(f'{label}: props_citados/props ausentes ou invalidos')
        else:
            for nome in citados:
                encontrados = [x for x in props if x.get('id') == nome]
                box = encontrados[0].get('bbox') if len(encontrados) == 1 else None
                if not isinstance(box, list) or len(box) != 4 or not all(_numero(v) for v in box):
                    falhas['props'].append(f'{label}: prop {nome} sem bbox unica valida')
                    continue
                x0, y0, x1, y1 = box
                if not (.08 <= x0 < x1 <= .92 and .08 <= y0 < y1 <= .92):
                    falhas['props'].append(f'{label}: prop {nome} cortado/sem margem de 8%')
                if (x1-x0)*(y1-y0) < .15 - 1e-12:
                    falhas['props'].append(f'{label}: prop {nome} area <15%')
        verbos, acoes = p.get('verbos'), s.get('acoes')
        if (not isinstance(verbos, list) or not isinstance(acoes, list)
                or any(not _intervalo(a) or not isinstance(a.get('verbo'), str) for a in acoes)):
            falhas['verbos'].append(f'{label}: verbos/acoes ausentes ou invalidos')
        else:
            for v in verbos:
                if (not _intervalo(v) or not isinstance(v.get('palavra'), str) or not v['palavra'].strip()
                        or not p['ini'] <= v['ini'] < v['fim'] <= p['fim']):
                    falhas['verbos'].append(f'{label}: palavra sem intervalo valido no plano')
                    continue
                palavra = v['palavra'].casefold()
                if not re.search(r'(?<!\w)' + re.escape(palavra) + r'(?!\w)', (s['fala'] if isinstance(s.get('fala'), str) else '').casefold()):
                    falhas['verbos'].append(f'{label}: verbo {palavra} ausente da fala')
                if not any(a['verbo'].casefold() == palavra and s['ini'] <= a['ini'] <= v['fim']
                           and a['fim'] >= v['ini'] and a['fim'] <= s['fim'] for a in acoes):
                    falhas['verbos'].append(f'{label}: {palavra} sem acao visivel ate {v["fim"]}s')
    return [Resultado(k, not falhas[k], f'{len(planos)} plano(s)', lim, '; '.join(falhas[k]))
            for k, lim in limites.items()]


def checar_ficha(proj):
    lim = 'FICHA completa; cenarios>=max(3,0.8*ref); >=3 luzes; HUD<90% do tempo; oclusao/props/verbos/FICHA-story por beat'
    fp = os.path.join(proj, 'FICHA.md')
    if not os.path.isfile(fp):
        return checar_kit_v6(proj)
    with open(fp, encoding='utf-8') as arq:
        txt = arq.read()
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
        with open(os.path.join(proj, 'plano.json'), encoding='utf-8') as arq:
            planos = json.load(arq)
    except (OSError, ValueError):
        planos = []
    if not isinstance(planos, list) or any(not isinstance(p, dict) for p in planos):
        planos = []
    if any(not isinstance(p.get(k), str) or not p[k].strip()
           for p in planos for k in ('cenario', 'luz')):
        f.append('cenario/luz ausente ou invalido no plano.json')
    cen = len({p['cenario'] for p in planos if isinstance(p.get('cenario'), str) and p['cenario'].strip()})
    luz = {p['luz'] for p in planos if isinstance(p.get('luz'), str) and p['luz'].strip()}
    need = max(3, math.ceil(0.8 * ref))
    if cen < need:
        f.append(f'{cen} cenario(s) distintos < {need} (ref {ref})')
    if len(luz) < 3:
        f.append(f'{len(luz)} luz(es) distinta(s) no plano.json (min 3; campo "luz" por plano)')
    ev = eventos_hud(proj) or []
    seg = max([p['fim'] for p in planos if _numero(p.get('fim'))] + [0])
    if ev and seg:
        ints = sorted((a, b) for a, b, _, _ in ev); tot = 0; ult = 0
        for a, b in ints:
            a = max(a, ult)
            if b > a:
                tot += b - a; ult = b
        if tot / seg >= 0.9:
            f.append(f'HUD cobre {tot / seg:.0%} do video (max 90%)')
    f.extend(f'{r.nome}: {r.motivo}' for r in checar_planos_mecanicos(proj) if not r.ok)
    return Resultado('ficha', not f, f'{cen} cenarios, {len(luz)} luzes', lim, '; '.join(f))


def checar_kit_v6(proj):
    """V6 (23/11): sem ficha de clone. Episodio usa so o kit fixo (KIT.md); confere plano.json e HUD."""
    lim = 'V6: cenario/luz por plano; cenarios do kit; HUD<90% do tempo'
    f = []
    try:
        with open(os.path.join(proj, 'plano.json'), encoding='utf-8') as arq:
            planos = json.load(arq)
    except (OSError, ValueError):
        return Resultado('kit', False, 'sem plano.json', lim, 'falta plano.json valido')
    if not isinstance(planos, list) or not planos or any(not isinstance(p, dict) for p in planos):
        return Resultado('kit', False, 'plano.json invalido', lim, 'plano.json precisa ser lista de planos')
    if any(not isinstance(p.get(k), str) or not p[k].strip() for p in planos for k in ('cenario', 'luz')):
        f.append('cenario/luz ausente no plano.json')
    cen = {p.get('cenario') for p in planos}
    ev = eventos_hud(proj) or []
    seg = max([p['fim'] for p in planos if _numero(p.get('fim'))] + [0])
    if ev and seg:
        ints = sorted((a, b) for a, b, _, _ in ev); tot = 0; ult = 0
        for a, b in ints:
            a = max(a, ult)
            if b > a:
                tot += b - a; ult = b
        if tot / seg >= 0.9:
            f.append(f'HUD cobre {tot / seg:.0%} do video (max 90%)')
    return Resultado('kit', not f, f'{len(cen)} cenario(s), {len(planos)} plano(s)', lim, '; '.join(f))


def etapa_roteiro(proj):
    fj = _carregar(proj, 'falas.json')
    if eh_v7(proj, fj):
        if not isinstance(fj, dict) or fj.get('molde') != 'v7':
            return [Resultado('roteiro_v7', False, '', 'molde v7', 'a execução foi aberta em V7')]
        return [checar_roteiro_kit(fj)]
    if isinstance(fj, dict) and fj.get('molde') == 'v6':
        return [checar_roteiro_kit(fj)]
    return [checar_roteiro(contar_palavras(fj)), checar_elenco_proj(proj)] + checar_roteiro_v4(fj)


GESTOS_V6 = frozenset((
    'andarRota', 'correr', 'sentar', 'chapeuNaMao', 'apontar', 'segurar',
    'falar', 'pensar', 'olhar', 'susto', 'recuar', 'comemorar', 'idle',
))


def eh_v7(proj, roteiro=None):
    """Reconhece o perfil declarado ou a execução aberta pelo novo scaffold."""
    if isinstance(roteiro, dict) and roteiro.get('molde') == 'v7':
        return True
    estado = os.path.join(proj, 'portao', 'estado.json')
    if not os.path.isfile(estado):
        return False
    with open(estado, encoding='utf-8') as arquivo:
        return json.load(arquivo).get('fluxo') == 'v7'


def checar_roteiro_kit(d):
    """Confere a estrutura declarada e a compatibilidade com o kit antes da voz."""
    v7 = d.get('molde') == 'v7'
    nome = 'roteiro_v7' if v7 else 'roteiro_v6'
    limite = 'beats em ordem; cada fala tem tipo e prova visual do kit'
    falas = d.get('falas')
    if not isinstance(falas, list) or not falas or any(not isinstance(f, dict) for f in falas):
        return Resultado(nome, False, 'falas inválidas', limite, 'falas precisa ser lista de objetos')
    with open(os.path.join(KIT, 'catalogo', 'aprovados.json'), encoding='utf-8') as arquivo:
        catalogo = json.load(arquivo)
    with open(os.path.join(KIT, 'catalogo', 'vozes.json'), encoding='utf-8') as arquivo:
        vozes = json.load(arquivo)
    falhas = []
    aprovados = {}
    for campo in ('personagens', 'cenarios'):
        valores = d.get(campo)
        permitidos = {nome for nome, item in catalogo[campo].items() if item.get('ok') is True}
        if not isinstance(valores, list) or not valores or any(
            not isinstance(nome, str) or nome not in permitidos for nome in valores
        ):
            falhas.append(f'{campo}: declare apenas itens aprovados')
            valores = []
        aprovados[campo] = set(valores)
    if 'tiao' not in aprovados['personagens']:
        falhas.append('personagens: falta tiao')

    for i, fala in enumerate(falas):
        tipo, quem, texto = (fala.get(k) for k in ('tipo', 'quem', 'texto'))
        if not isinstance(texto, str) or not texto.strip():
            falhas.append(f'fala {i}: falta texto')
        if tipo == 'narracao':
            if quem != 'narrador':
                falhas.append(f'fala {i}: narração usa a voz narrador')
        elif tipo in ('dialogo', 'pensamento'):
            if (not isinstance(quem, str) or quem not in aprovados['personagens']
                    or quem not in vozes['personagens']):
                falhas.append(f'fala {i}: voz de personagem fora do elenco fixo')
        else:
            falhas.append(f'fala {i}: declare tipo dialogo, narracao ou pensamento')
        visual = fala.get('visual')
        if not isinstance(visual, dict):
            falhas.append(f'fala {i}: falta visual (ator, gesto, cenario, prova)')
            continue
        ator, gesto, cenario, prova = (visual.get(k) for k in ('ator', 'gesto', 'cenario', 'prova'))
        if not isinstance(ator, str) or ator not in aprovados['personagens']:
            falhas.append(f'fala {i}: ator visual fora do elenco declarado')
        if not isinstance(cenario, str) or cenario not in aprovados['cenarios']:
            falhas.append(f'fala {i}: cenário visual fora do kit declarado')
        if not isinstance(gesto, str) or gesto not in GESTOS_V6:
            falhas.append(f'fala {i}: gesto fora do kit: {gesto}')
        if gesto == 'falar' and (tipo != 'dialogo' or quem != ator):
            falhas.append(f'fala {i}: gesto falar só no diálogo do ator que fala')
        if not isinstance(prova, str) or not prova.strip():
            falhas.append(f'fala {i}: descreva o que o espectador vai ver em visual.prova')

    beats = d.get('beats')
    if v7:
        campos = ('gancho', 'pista', 'virada', 'pagamento')
        marcos = [beats.get(k) for k in campos] if isinstance(beats, dict) else []
        if (len(marcos) != len(campos)
                or any(type(i) is not int or not 0 <= i < len(falas) for i in marcos)
                or not 0 == marcos[0] <= marcos[1] < marcos[2] <= marcos[3]):
            falhas.append('marque gancho em 0 e ordene pista, virada e pagamento')
    elif not isinstance(beats, dict):
        falhas.append('beats: declare gancho, promessa, escada, pista, virada e pagamento')
    else:
        marcos = [beats.get('gancho'), beats.get('promessa')]
        escada = beats.get('escada')
        if isinstance(escada, list) and 3 <= len(escada) <= 4:
            marcos.extend(escada)
        else:
            falhas.append('escada: declare 3 ou 4 índices de falas')
        marcos.extend((beats.get('virada'), beats.get('pagamento')))
        validos = all(type(i) is int and 0 <= i < len(falas) for i in marcos)
        if not validos or marcos[0] != 0 or any(a >= b for a, b in zip(marcos[1:], marcos[2:])):
            falhas.append('beats: gancho em 0; promessa, escada, virada e pagamento em ordem')
        pista = beats.get('pista')
        if type(pista) is not int or not validos or not 0 <= pista < marcos[-2]:
            falhas.append('pista: marque a fala que planta a pista antes da virada')
    return Resultado(nome, not falhas, f'{len(falas)} fala(s)', limite, '; '.join(falhas))


def checar_roteiro_v6(d):
    return checar_roteiro_kit(d)


def checar_prova_v6(proj, roteiro, duracao=None, cenas=None):
    from conferir_fala import MINIMO, repeticoes, similaridade

    resultado = checar_roteiro_kit(roteiro)
    if not resultado.ok:
        return [resultado]
    falas = roteiro['falas']
    planos = _carregar(proj, 'plano.json')
    if cenas is None:
        cenas = _carregar(proj, 'cenas.json')
    stt_nome = os.path.join('voz', 'stt.json')
    stt = _carregar(proj, stt_nome)
    dialogo = os.path.join(proj, 'voz', 'dialogo.wav')
    falhas = []
    vistos = set()
    fim_anterior = 0
    fala_anterior = -1
    if not isinstance(planos, list) or not planos:
        falhas.append('plano.json precisa ser uma lista não vazia')
        planos = []
    for i, plano in enumerate(planos):
        if not isinstance(plano, dict) or not _intervalo(plano):
            falhas.append(f'plano {i}: intervalo inválido')
            continue
        if abs(plano['ini'] - fim_anterior) > .001:
            falhas.append(f'plano {i}: buraco ou sobreposição na montagem')
        fim_anterior = plano['fim']
        fala = plano.get('fala')
        if type(fala) is not int or not 0 <= fala < len(falas):
            falhas.append(f'plano {i}: índice de fala inválido')
        else:
            if fala < fala_anterior:
                falhas.append(f'plano {i}: falas fora da ordem do diálogo')
            fala_anterior = fala
            if plano.get('cenario') == falas[fala]['visual']['cenario']:
                vistos.add(fala)
        if plano.get('cenario') not in roteiro['cenarios']:
            falhas.append(f'plano {i}: cenário fora da lista declarada')
        camera = plano.get('camera')
        if not isinstance(camera, str) or camera not in CAMERAS_VALIDAS:
            falhas.append(f'plano {i}: câmera fora do banco: {camera}')
        if any(not isinstance(plano.get(k), str) or not plano[k].strip() for k in ('luz', 'motivo')):
            falhas.append(f'plano {i}: declare luz e motivo editorial do enquadre ou corte')
    faltam = sorted(set(range(len(falas))) - vistos)
    if faltam:
        falhas.append(f'falas sem plano no cenário declarado: {faltam}')
    if duracao is not None and abs(fim_anterior - duracao) > .1:
        falhas.append('duração do MP4 diverge do fim do plano (tolerância 100 ms)')
    if (not isinstance(cenas, list) or len(cenas) != len(planos)
            or any(not isinstance(cena, list) or len(cena) < 2 or not _intervalo(plano)
                   or any(not _numero(t) or abs(t - plano[k]) > 1 / 30 + .001
                          for t, k in zip(cena, ('ini', 'fim')))
                   for cena, plano in zip(cenas, planos))):
        falhas.append('cenas exportadas divergem dos cortes declarados (tolerância de 1 quadro)')

    esperado = ' '.join(f['texto'] for f in falas)
    transcrito = stt.get('texto', '') if isinstance(stt, dict) else ''
    transcrito = transcrito if isinstance(transcrito, str) else ''
    score = similaridade(esperado, transcrito)
    repetidos = repeticoes(esperado, transcrito)
    erro_voz = ''
    if not os.path.isfile(dialogo) or os.path.getmtime(dialogo) > os.path.getmtime(os.path.join(proj, stt_nome)):
        erro_voz = 'voz/dialogo.wav ausente ou mais recente que o STT; transcreva o diálogo atual'
    elif repetidos:
        erro_voz = f'trechos repetidos: {repetidos[:3]}'
    elif score < MINIMO:
        erro_voz = 'similaridade baixa com a sequência do diálogo'
    versao = 'v7' if roteiro.get('molde') == 'v7' else 'v6'
    return [
        Resultado(f'plano_{versao}', not falhas, f'{len(planos)} plano(s)', 'planos ligados às falas e com motivo', '; '.join(falhas)),
        Resultado(f'voz_{versao}', not erro_voz, f'similaridade {score:.0%}', f'>={MINIMO:.0%}, sem bloco excedente', erro_voz),
    ]


def etapa_voz(proj):
    from editorial import revisao

    rs = etapa_roteiro(proj)
    if all(r.ok for r in rs):
        rs.extend(revisao(proj, etapa) for etapa in ('frio', 'montagem'))
    return rs


def checar_voz_final(proj, mp4, roteiro):
    from conferir_fala import MINIMO, repeticoes, similaridade
    from editorial import gravar_json, ler_json, versao

    limite = f'STT do MP4, >= {MINIMO:.0%}, sem repetição excedente'
    try:
        digest = versao(proj, 'final')
        cache = Path(proj) / 'stt-final.json'
        dados = ler_json(cache) if cache.is_file() else {}
        if dados.get('versao') != digest:
            cli = Path(KIT).parents[2] / 'ferramentas' / 'stt.py'
            resultado = subprocess.run([sys.executable, str(cli), mp4, 'pt', 'small'],
                                       capture_output=True, text=True)
            if resultado.returncode:
                raise ValueError('o STT local do MP4 falhou: ' + resultado.stderr.strip())
            if versao(proj, 'final') != digest:
                raise ValueError('a versão mudou durante o STT')
            dados = {'versao': digest, 'transcricao': json.loads(resultado.stdout)}
            gravar_json(cache, dados)
        texto = dados['transcricao']['texto']
        esperado = ' '.join(f['texto'] for f in roteiro['falas'])
        score = similaridade(esperado, texto)
        repetidos = repeticoes(esperado, texto)
        motivo = f'trechos repetidos: {repetidos[:3]}' if repetidos else ''
        if score < MINIMO and not motivo:
            motivo = 'o áudio do MP4 diverge da sequência pretendida'
        return Resultado('voz_mp4', not motivo, f'{score:.0%}', limite, motivo)
    except (OSError, ValueError, KeyError, TypeError) as erro:
        return Resultado('voz_mp4', False, '', limite, str(erro))


def etapa_final(proj):
    mp4 = os.path.join(proj, 'final.mp4')
    if not os.path.isfile(mp4):
        print('ERRO: falta final.mp4')
        sys.exit(2)
    roteiro = _carregar(proj, 'falas.json')
    cenas = _carregar(proj, 'cenas.json')
    seg = duracao_video(mp4)
    if eh_v7(proj, roteiro):
        rs = etapa_roteiro(proj)
        if not all(r.ok for r in rs):
            return rs
        audio = medir_audio(mp4)
        # O silêncio deliberado pertence à revisão de montagem e som.
        audio['silencios_meio'] = []
        tecnicos = [checar_formato(mp4), checar_audio(audio), checar_hud(proj), checar_olhos(proj)]
        tecnicos.extend(checar_prova_v6(proj, roteiro, duracao=seg, cenas=cenas))
        if all(r.ok for r in tecnicos):
            tecnicos.append(checar_voz_final(proj, mp4, roteiro))
        return tecnicos
    tecnicos = [checar_duracao(seg), checar_formato(mp4), checar_audio(medir_audio(mp4)),
                checar_hud(proj), checar_olhos(proj)]
    if isinstance(roteiro, dict) and roteiro.get('molde') == 'v6':
        return tecnicos + checar_prova_v6(proj, roteiro, duracao=seg, cenas=cenas)
    cortes = [float(c[0]) for c in cenas]
    return tecnicos + [checar_ritmo(contar_palavras(roteiro), seg), checar_planos(cortes, seg), checar_elenco_proj(proj),
                       checar_variedade_proj(proj), checar_prop_virada(proj), checar_ficha(proj),
                       checar_cobertura(proj)]


def checar_cobertura(proj):
    """Todo personagem/objeto citado nas falas aparece em plano (cobertura.py); so no formato V5 (story.js com T(n,...))."""
    js = os.path.join(proj, 'web', 'story.js')
    if not os.path.exists(js) or not re.search(r"\n\s*T\(\d+,", open(js, encoding='utf-8').read()):
        return Resultado('cobertura', True, 'n/a (formato sem T(n,...))', 'citado => aparece')
    r = subprocess.run([sys.executable, next((c for c in (os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cobertura.py'), os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'projetos', 'bonecos', 'serie-tiao-kit', 'cobertura.py')) if os.path.exists(c)), 'cobertura.py'), proj], capture_output=True, text=True)
    ok = r.returncode == 0
    return Resultado('cobertura', ok, 'ok' if ok else r.stdout.strip().splitlines()[0][:90], 'citado => aparece', '' if ok else r.stdout.strip())


def main(argv):
    if len(argv) == 3 and argv[1] == 'novo':
        raiz, erro = raiz_dados()
        if erro:
            print('ERRO:', erro)
            return 2
        print(criar_projeto(raiz, argv[2], fluxo='v7'))
        return 0
    if len(argv) != 3 or argv[2] not in ('roteiro', 'voz', 'prova', 'final', 'entrega', 'perfil', 'quadros'):
        print(__doc__)
        return 2
    proj = argv[1]
    if not os.path.isdir(proj):
        print(f'ERRO: projeto {proj} nao existe')
        return 2
    if argv[2] == 'perfil':
        roteiro = _carregar(proj, 'falas.json') if os.path.isfile(os.path.join(proj, 'falas.json')) else None
        print('v7' if eh_v7(proj, roteiro) else 'legado')
        return 0
    if argv[2] == 'quadros':
        planos = _carregar(proj, 'plano.json')
        if not isinstance(planos, list) or not planos or not isinstance(planos[-1], dict) or not _intervalo(planos[-1]):
            print('ERRO: falta duração válida no plano', file=sys.stderr)
            return 2
        print(f"0-{round(planos[-1]['fim'] * 30) - 1}")
        return 0
    if argv[2] == 'voz':
        rs = etapa_voz(proj)
    elif argv[2] == 'prova':
        roteiro = _carregar(proj, 'falas.json')
        if eh_v7(proj, roteiro):
            rs = etapa_voz(proj)
            if all(r.ok for r in rs):
                rs.extend(checar_prova_v6(proj, roteiro))
        elif isinstance(roteiro, dict) and roteiro.get('molde') == 'v6':
            rs = checar_prova_v6(proj, roteiro)
        else:
            return 0
    elif argv[2] == 'entrega':
        from editorial import revisao

        rs = etapa_voz(proj)
        if all(r.ok for r in rs):
            rs.extend(etapa_final(proj))
            rs.append(revisao(proj, 'final'))
    else:
        rs = etapa_roteiro(proj) if argv[2] == 'roteiro' else etapa_final(proj)
    return 0 if imprimir(rs) else 1


if __name__ == '__main__':
    sys.exit(main(sys.argv))
