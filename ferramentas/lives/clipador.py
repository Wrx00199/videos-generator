#!/usr/bin/env python3
"""Clipador de lives (offline): segmento gravado (.ts) -> clipes verticais 1080x1920 em duas versões.

Uso (python do venv do clipper):
  clipador.py SEG.ts --streamer "Alanzoka" --canal alanzoka [--max 2] [--min-calor 10] [--saida DIR]

Pipeline: áudio 16k -> idioma por janelas de 4 s (só PT conta como voz do streamer) -> whisper tiny (pt) filtrado
-> calor por segundo (volume + risada + xingamento, SÓ onde há fala PT) -> melhor trecho 25-50 s -> trecho crf 14
-> palavras com whisper small (filtra janelas não-PT, alucinação) -> layout (câmera larga em cima / jogo embaixo)
-> duas versões: *_ig.mp4 (logo + @nick) e *_tiktok.mp4 (limpa), crf 18, uma geração de re-encode só.
Reprova (não gera) se faltar fala PT ou reação.
"""
import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import time
from pathlib import Path

import numpy as np

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parents[1]
os.environ.setdefault("CLIPPER_GTA6_HOME", str(RAIZ / "projetos" / "lives" / "clipper"))
sys.path.insert(0, str(AQUI / "skill-clips" / "scripts"))
import cortar  # noqa: E402  (achar_camera)

IDENT = json.loads((RAIZ / "marca" / "identidade.json").read_text())
FONTE_DIR = AQUI / "skill-clips" / "fontes"
FONTE = FONTE_DIR / "Montserrat-ExtraBold.ttf"
SAIDA_PADRAO = RAIZ / "projetos" / "lives" / "clipes"
FILA = RAIZ / "projetos" / "lives" / "fila"
L, A = 1080, 1920
CAM_H = 640
JOGO_H = 700  # jogo (câmera remendada) logo abaixo do rosto
SR = 16000
JAN = 4  # s por janela de idioma

REACAO = re.compile(r"(k{3,}|\bha(ha)+|\brs{2,}|meu deus|caralh|porra|\bpqp\b|n[ãa]o acredito|que isso|mds\b|nossa|"
                    r"socorro|ai meu|puta que|\bfod|merda|bosta|cacete|\bai ai|\bnoo+\b|"
                    r"\bn[ãa]o+\b.*\bn[ãa]o+\b|que merda|desgra[çc]a|filho da|\bmorr|explod)", re.I)
RISADA = re.compile(r"(k{3,}|\bha(ha)+|\bhe(he)+|\brs{2,}|risada)", re.I)
XINGA = re.compile(r"(caralh|porra|\bpqp\b|puta|\bfod|merda|bosta|cacete|desgra[çc]a|filho da)", re.I)
PT_COMUM = set("que não nao é de a o e um uma eu tu você voce ele ela mas pra para com isso aí ai tá ta cara mano "
               "meu minha da do na no os as foi vai vou tem já ja só so aqui lá la muito mais ou se por como "
               "então entao agora gente olha velho tô to né ne pô po".split())


# ----------------------------------------------------------------- perfil de desempenho (PC forte x fraco)
def ram_gb():
    try:
        if sys.platform.startswith("linux"):
            for l in open("/proc/meminfo"):
                if l.startswith("MemTotal"):
                    return int(l.split()[1]) / 1e6
        if sys.platform == "darwin":
            return int(subprocess.run(["sysctl", "-n", "hw.memsize"], capture_output=True, text=True).stdout) / 1e9
        if sys.platform == "win32":
            import ctypes

            class M(ctypes.Structure):
                _fields_ = [("l", ctypes.c_ulong), ("m", ctypes.c_ulong), ("total", ctypes.c_ulonglong), ("a", ctypes.c_ulonglong), ("b", ctypes.c_ulonglong),
                            ("c", ctypes.c_ulonglong), ("d", ctypes.c_ulonglong), ("e", ctypes.c_ulonglong), ("f", ctypes.c_ulonglong)]
            m = M()
            m.l = ctypes.sizeof(M)
            ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(m))
            return m.total / 1e9
    except Exception:
        pass
    return 8.0


# qualidade: PC forte | equilibrado: 4 núcleos/8 GB (padrão validado) | leve: 2 núcleos ou pouca RAM (menos picos, janelas menores, encode mais barato)
PERFIS = {
    "qualidade": dict(preset="veryfast", crf="20", realce=True, picos=4, raio=45, idioma="completo"),
    "equilibrado": dict(preset="veryfast", crf="20", realce=True, picos=3, raio=45, idioma="hibrido"),
    "leve": dict(preset="ultrafast", crf="24", realce=False, picos=2, raio=30, idioma="hibrido"),
}


def perfil_auto():
    n, ram = os.cpu_count() or 2, ram_gb()
    return "qualidade" if (n >= 8 and ram >= 12) else "equilibrado" if (n >= 4 and ram >= 6) else "leve"


def perfil_escolhido():
    """Ordem: variável CLIPPER_PERFIL > config/desempenho.json > automático (pelo hardware)."""
    nome = os.environ.get("CLIPPER_PERFIL", "")
    if nome not in PERFIS:
        try:
            nome = json.loads((RAIZ / "config" / "desempenho.json").read_text()).get("perfil", "auto")
        except Exception:
            nome = "auto"
    return perfil_auto() if nome not in PERFIS else nome


PERFIL_NOME = perfil_escolhido()
PERFIL = PERFIS[PERFIL_NOME]


def tiktok_ativo():
    """TikTok é opcional: config/contas.json -> tiktok.ativo (padrão: desligado). Flags --tiktok / --sem-tiktok sobrepõem."""
    try:
        return bool(json.loads((RAIZ / "config" / "contas.json").read_text()).get("tiktok", {}).get("ativo"))
    except Exception:
        return False


def ffp(p):
    """Caminho para dentro de filtro do ffmpeg: barras normais e ':' escapado (no Windows 'C:\\pasta' quebra o filtergraph)."""
    return str(p).replace("\\", "/").replace(":", "\\:")


def log(*a):
    print(time.strftime("%H:%M:%S"), *a, flush=True)


def sh(cmd, **k):
    return subprocess.run([str(c) for c in cmd], check=True, **k)


def wav(origem, destino, ss=None, t=None):
    cmd = ["ffmpeg", "-nostdin", "-y", "-loglevel", "error"]
    if ss is not None:
        cmd += ["-ss", f"{ss:.2f}"]
    cmd += ["-i", origem]
    if t is not None:
        cmd += ["-t", f"{t:.2f}"]
    cmd += ["-vn", "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"]
    r = subprocess.run([str(c) for c in cmd], capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype=np.int16).astype(np.float32) / 32768


_modelos = {}


def modelo(nome):
    from faster_whisper import WhisperModel
    if nome not in _modelos:
        _modelos[nome] = WhisperModel(nome, device="cpu", compute_type="int8", cpu_threads=max(1, min(4, (os.cpu_count() or 2) - 1)))
    return _modelos[nome]


# ----------------------------------------------------------------- idioma por janelas
def janelas_pt(audio, nome="tiny", tamanho=JAN, ativas=None):
    """Devolve (pt[bool por janela], falando[bool]). PT = idioma detectado 'pt' com prob >= 0.5 e há voz.
    `ativas` (set de índices de janela) limita a detecção às regiões que importam (modo rápido)."""
    m = modelo(nome)
    n = len(audio) // (SR * tamanho)
    rms = np.array([np.sqrt(np.mean(audio[i * SR * tamanho:(i + 1) * SR * tamanho] ** 2) + 1e-9) for i in range(n)])
    db = 20 * np.log10(rms + 1e-9)
    limiar = min(max(-50.0, np.percentile(db, 15) + 6), -38.0)
    pt = np.zeros(n, bool)
    prob = np.zeros(n)
    for i in range(n):
        if db[i] < limiar or (ativas is not None and i not in ativas):
            continue
        a = audio[i * SR * tamanho:(i + 1) * SR * tamanho]
        lang, p, todas = m.detect_language(a)
        pp = dict(todas).get("pt", 0.0)
        prob[i] = pp
        pt[i] = pp >= 0.35
    return pt, prob, db


def janelas_pt_hibrido(audio, segs, ativas, nome="tiny", tamanho=JAN, minimo_comuns=3):
    """Idioma por janela, chamando o detector (caro: 0,6 s por chamada) só quando precisa:
    sem texto transcrito = sem fala (não é PT); texto com várias palavras comuns de PT = PT; o resto (ambíguo) passa pelo detector."""
    n = len(audio) // (SR * tamanho)
    rms = np.array([np.sqrt(np.mean(audio[i * SR * tamanho:(i + 1) * SR * tamanho] ** 2) + 1e-9) for i in range(n)])
    db = 20 * np.log10(rms + 1e-9)
    limiar = min(max(-50.0, np.percentile(db, 15) + 6), -38.0)
    pt = np.zeros(n, bool)
    prob = np.zeros(n)
    m = None
    chamadas = 0
    for i in sorted(ativas):
        if i >= n or db[i] < limiar:
            continue
        a0, a1 = i * tamanho, (i + 1) * tamanho
        textos = [g.text for g in segs if g.end > a0 and g.start < a1 and not lixo(g)]
        if not textos:
            continue
        comuns = sum(1 for w in re.findall(r"\w+", " ".join(textos).lower()) if w in PT_COMUM)
        if comuns >= minimo_comuns:
            pt[i], prob[i] = True, 0.9
            continue
        m = m or modelo(nome)
        _, _, todas = m.detect_language(audio[a0 * SR:a1 * SR])
        chamadas += 1
        prob[i] = dict(todas).get("pt", 0.0)
        pt[i] = prob[i] >= 0.35
    return pt, prob, db


def eh_pt(pt, t0, t1, tamanho=JAN):
    i0, i1 = int(t0 // tamanho), int(max(t0, t1 - 1e-3) // tamanho)
    return any(pt[i] for i in range(max(0, i0), min(len(pt), i1 + 1)))


def transcrever(audio, nome, palavras=False):
    m = modelo(nome)
    segs, _ = m.transcribe(audio, language="pt", vad_filter=True, beam_size=1, condition_on_previous_text=False,
                           word_timestamps=palavras, no_speech_threshold=0.5)
    return list(segs)


def picos(audio, n=3, sep=95, com_score=False):
    """Os n maiores picos de volume/variação (mesma conta do achar.py): score = dB acima da mediana de 60 s + 1,5 * variação.
    com_score=True devolve [(segundo, score)] (usado na triagem por volume)."""
    n_s = len(audio) // SR
    x = audio[: n_s * SR].reshape(n_s, SR)
    db = 20 * np.log10(np.sqrt((x ** 2).mean(1)) + 1e-6)
    suave = lambda v, k: np.convolve(np.pad(v, (k // 2, k - 1 - k // 2), mode="edge"), np.ones(k) / k, mode="valid")
    p = np.pad(db, 30, mode="edge")
    base = np.array([np.median(p[i:i + 61]) for i in range(n_s)])
    score = suave(db - base, 3) + 1.5 * suave(np.abs(np.diff(db, prepend=db[0])), 5)
    achados = []
    for i in np.argsort(-score):
        if len(achados) >= n:
            break
        if all(abs(int(i) - u) >= sep for u in achados):
            achados.append(int(i))
    if com_score:
        return [(i, float(score[i])) for i in achados]
    return achados  # em ordem de score (maior primeiro)


def voz_pt(audio, p, nome="tiny"):
    """O streamer fala PT ao redor do pico? (pico só de áudio do jogo — NPC em inglês, música, explosão — não vale a análise)"""
    a = audio[int(max(0, p - 4) * SR):int((p + 4) * SR)]
    if len(a) < SR * 2:
        return False
    _, _, todas = modelo(nome).detect_language(a)
    return dict(todas).get("pt", 0.0) >= 0.35


class _Seg:
    """Segmento do whisper com o tempo deslocado para o relógio do segmento inteiro."""
    def __init__(self, g, off):
        self.start, self.end, self.text = g.start + off, g.end + off, g.text
        self.avg_logprob, self.no_speech_prob, self.compression_ratio = g.avg_logprob, g.no_speech_prob, g.compression_ratio


def transcrever_regioes(audio, regioes, nome="tiny"):
    out = []
    for a, b in regioes:
        for g in transcrever(audio[int(a * SR):int(b * SR)], nome):
            out.append(_Seg(g, a))
    return out


# ----------------------------------------------------------------- relevância do trecho (nota 0-100)
GTA_TERMOS = re.compile(r"(gta|rockstar|vice city|\bvice\b|l[uú]cia|jason|pol[ií]cia|viatura|helic[oó]ptero|\bcarro|\bmoto\b|avi[aã]o|\bbarco|lancha|\btiro|atirou|explo|\bmorr|\bpreso|assalt|roub|jac[aá]r|tubar|praia|\bmapa|\bbug\b|glitch|f[ií]sica|gr[aá]fico|\bnpc|persegu|fuga|bateu|capot|pulou|mergulh|bomba|\barma\b|sniper|\brpg|nossa|caraca|olha (isso|s[oó]|a[ií])|que isso|n[aã]o acredito|ficou doido|surtou)", re.I)
IDLE_FIM = re.compile(r"(tchau|boa noite|vou dormir|\bdorm|amanh[aã]|\bsono\b|cansad[oa]|at[eé] (amanh[aã]|mais|logo)|valeu galera|obrigad[oa] (pelo|pela|por)|j[aá] volto|vou ali|\bpausa|beber [aá]gua|banheiro|live (acaba|acabou)|encerrar|fim da live|inscri|\bsub\b|doa[cç]|\bpix\b|\bdrops?\b|c[oó]digo|sorteio|patrocin)", re.I)
NOTA_MIN = 45


def movimento(ts, ini, fim):
    """Atividade visual 0-1: diferença entre quadros-chave (≈0,5 s por trecho de 40 s). Parado/menu ≈ 0; ação ≈ 1."""
    r = subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-skip_frame", "nokey", "-ss", f"{ini:.1f}", "-t", f"{fim - ini:.1f}", "-i", str(ts),
                        "-an", "-fps_mode", "passthrough", "-vf", "scale=96:54,format=gray", "-f", "rawvideo", "-"], capture_output=True)
    if r.returncode != 0 or len(r.stdout) < 54 * 96 * 3:
        return 0.0
    f = np.frombuffer(r.stdout, dtype=np.uint8)[: len(r.stdout) // (54 * 96) * 54 * 96].reshape(-1, 54 * 96).astype(np.int16)
    return float(np.clip(np.median(np.abs(np.diff(f, axis=0)).mean(1)) / 20, 0, 1))


def nota_trecho(texto, eventos, mov):
    """Relevância 0-100: reação real (risada/xingo/grito) + assunto de jogo/ação + movimento na tela + empolgação; menos fim de live/papo/anúncio."""
    ris = sum(1 for _, tp in eventos if tp == "risada")
    xin = sum(1 for _, tp in eventos if tp == "xingo")
    rea = sum(1 for _, tp in eventos if tp == "reacao")
    reac = min(30, 10 * ris + 4 * xin + 5 * rea)
    termos = {m.group(0).lower() for m in GTA_TERMOS.finditer(texto)}
    jogo = min(35, 9 * len(termos))
    acao = round(20 * mov)
    exc = min(5, 2 * texto.count("!"))
    pen = min(60, 30 * len(IDLE_FIM.findall(texto)))
    n = int(max(0, min(100, reac + jogo + acao + exc - pen)))
    if jogo == 0:
        n = min(n, 40)  # reação sem assunto de jogo/ação é papo ou risada à toa: nunca passa da nota mínima
    return n, {"reacao": reac, "jogo": jogo, "acao": acao, "empolgacao": exc, "penalidade": -pen, "termos": sorted(termos)[:6]}


def avaliar(ts, cands, segs, pt, ev, nota_min, max_clipes):
    """Dá nota a cada candidato (calor sozinho não prova que o momento presta). Devolve (escolhidos, todos_com_nota)."""
    todos = []
    for s, e, c in cands:
        texto = " ".join(g.text.strip() for g in segs if s <= g.start <= e and not lixo(g) and eh_pt(pt, g.start, g.end))
        n, det = nota_trecho(texto, [x for x in ev if s <= x[0] <= e], movimento(ts, s, e))
        todos.append({"nota": n, "ini": s, "fim": e, "calor": c, "det": det, "texto": texto})
        log(f"  cand {int(s)}-{int(e)}s nota {n} (reação {det['reacao']}, jogo {det['jogo']}{det['termos']}, ação {det['acao']}, empolg. {det['empolgacao']}, pen. {det['penalidade']})")
    todos.sort(key=lambda x: -x["nota"])
    ok = [(x["ini"], x["fim"], x["calor"]) for x in todos if x["nota"] >= nota_min][:max_clipes]
    return ok, todos


def lixo(seg):
    """Alucinação típica: baixa confiança, repetição, texto sem nenhuma palavra comum de PT."""
    t = seg.text.strip().lower()
    if not t:
        return True
    if seg.avg_logprob < -1.0 or seg.no_speech_prob > 0.6 or seg.compression_ratio > 2.2:
        return True
    ws = re.findall(r"\w+", t)
    if len(ws) >= 4 and len(set(ws)) <= len(ws) / 3:
        return True
    return False


# ----------------------------------------------------------------- calor / reação
def calor_segmento(audio, segs, pt, db):
    """Calor por segundo: volume acima do normal + risada/xingamento/reação, só onde há fala PT."""
    n = len(audio) // SR
    sec_db = np.array([20 * np.log10(np.sqrt(np.mean(audio[i * SR:(i + 1) * SR] ** 2)) + 1e-9) for i in range(n)])
    base = np.median(sec_db[sec_db > np.percentile(sec_db, 25)])
    exc = np.clip(sec_db - base, 0, None)
    calor = np.zeros(n)
    pt_s = np.array([eh_pt(pt, i, i + 1) for i in range(n)])
    falas = np.zeros(n)
    eventos = []  # (t, tipo)
    for s in segs:
        if lixo(s) or not eh_pt(pt, s.start, s.end):
            continue
        t = s.text
        a, b = int(s.start), min(n - 1, int(s.end))
        palavras = re.findall(r"\w+", t.lower())
        for k in range(a, b + 1):
            falas[k] += 1
        r = len(REACAO.findall(t))
        if r:
            calor[a:b + 1] += 6 * min(r, 3)
            eventos.append((s.start, "reacao"))
        if RISADA.search(t):
            calor[a:b + 1] += 8
            eventos.append((s.start, "risada"))
        if XINGA.search(t):
            calor[a:b + 1] += 6
            eventos.append((s.start, "xingo"))
        if t.rstrip().endswith("!") and len(palavras) <= 8:
            calor[a:b + 1] += 3
    # volume só conta onde tem voz PT em volta (explosão do jogo não é reação do streamer)
    perto = np.convolve(falas > 0, np.ones(5), "same") > 0
    calor += np.where(perto & pt_s, exc * 0.6, 0)
    return calor, falas, exc, eventos


def escolher_trecho(calor, falas, exc, dur, minimo, n_max, usados, ev=()):
    """Janela de 40 s com mais calor; precisa de fala PT e pelo menos uma reação clara; devolve [(ini, fim, calor)]."""
    J = 40
    res = []
    c = calor.copy()
    for _ in range(n_max):
        if len(c) <= J:
            break
        soma = np.convolve(c, np.ones(J), "valid")
        achou = None
        for i in np.argsort(-soma):
            if soma[i] < minimo:
                break
            pico = i + int(np.argmax(c[i:i + J]))
            if pico < 8 or pico > dur - 14:
                continue
            if falas[i:i + J].sum() < 14:        # fala PT suficiente
                continue
            if (c[i:i + J] >= 6).sum() < 2:      # reação de verdade (não 1 pico solto)
                continue
            fortes = [t for t, tp in ev if i <= t <= i + J and tp in ("risada", "xingo", "reacao")]
            if len(fortes) < 2 and not (exc[i:i + J].max() >= 12 and fortes):
                continue                         # só conversa: sem risada/xingo/grito
            achou = (int(i), int(pico), float(soma[i]))
            break
        if not achou:
            break
        i, pico, calor_v = achou
        reag = np.where(c[i:i + J] >= 6)[0] + i
        ini = max(0, int(reag[0]) - 6)
        fim = min(dur, max(ini + 22, int(reag[-1]) + 6))
        fim = min(fim, ini + 60)
        res.append((float(ini), float(fim), calor_v))
        c[max(0, i - 40):i + J + 40] = 0
    return res


# ----------------------------------------------------------------- câmera / layout
def camera(video):
    """Rosto do streamer na caixinha de câmera (canto). 24 quadros, limiar baixo; rosto no centro = personagem."""
    import cv2
    from comum import YUNET
    cap = cv2.VideoCapture(str(video))
    W, H = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 1
    esc = 1280 / W
    det = cv2.FaceDetectorYN.create(str(YUNET), "", (1280, int(H * esc)), 0.6)
    caixas = []
    for k in range(24):
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(n * (k + 0.5) / 24))
        ok, q = cap.read()
        if not ok:
            continue
        _, rostos = det.detect(cv2.resize(q, (1280, int(H * esc))))
        for r in rostos if rostos is not None else []:
            x, y, w, h = [v / esc for v in r[:4]]
            cx, cy = (x + w / 2) / W, (y + h / 2) / H
            if h > H * 0.04 and h < H * 0.25 and not (0.28 < cx < 0.72 and 0.28 < cy < 0.72):
                caixas.append([x, y, w, h])
    cap.release()
    if len(caixas) < 4:
        return W, H, None
    c = np.array(caixas)
    centros = c[:, :2] + c[:, 2:] / 2
    med = np.median(centros, axis=0)
    perto = c[np.linalg.norm(centros - med, axis=1) < W * 0.06]
    if len(perto) < 4:
        return W, H, None
    return W, H, np.median(perto, axis=0)


def dims(video):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", str(video)],
                       capture_output=True, text=True)
    w, h = r.stdout.strip().split(",")[:2]
    return int(w), int(h)


def filtro(W, H, rosto, ass, marca, tiktok=False):
    sai = "hqdn3d=1.2:1.2:2:2,unsharp=5:5:0.6:5:5:0.0,eq=contrast=1.04:saturation=1.08" if PERFIL["realce"] else "null"
    if rosto is None:
        # sem câmera: jogo em tela cheia no meio (fundo desfocado), legenda embaixo
        base = (f"[0:v]split=2[a][b];[a]scale={L // 4}:{A // 4}:force_original_aspect_ratio=increase:flags=bilinear,"
                f"crop={L // 4}:{A // 4},boxblur=8:2,scale={L}:{A}:flags=bicubic[bg];[b]scale={L}:-2:flags=lanczos,{sai}[fg];"
                f"[bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1,format=yuv420p[base]")
    else:
        fx, fy, fw, fh = rosto
        cw = min(W, max(fw * 3.1, 300))  # tight: só o rosto, sem pegar o jogo em volta
        ch = cw * CAM_H / L
        if ch > H:
            ch, cw = H, H * L / CAM_H
        cx = min(max(fx + fw / 2 - cw / 2, 0), W - cw)
        cy = min(max(fy + fh * 0.40 - ch * 0.40, 0), H - ch)  # olhos a ~40% da faixa
        def p(v):
            return int(v) // 2 * 2
        # jogo SEM a câmera: remenda o canto da câmera com o pedaço vizinho espelhado (borda suavizada)
        cxc, cyc = fx + fw / 2, fy + fh / 2
        dir_ = 1 if cxc > W / 2 else -1
        x0 = max(cxc - fw * 1.7, 0) if dir_ == 1 else 0
        x1 = W if dir_ == 1 else min(cxc + fw * 1.7, W)
        pw = min(x1 - x0, W - (x1 - x0))
        x0 = x1 - pw if dir_ == 1 else 0
        baixo = cyc > H / 2
        y0 = max(fy - fh * 0.7, 0) if baixo else 0
        y1 = H if baixo else min(fy + fh * 1.7, H)
        ph = y1 - y0
        sx = x0 - pw if dir_ == 1 else x1  # vizinho do lado de dentro do jogo
        sy = y0
        F = 48
        ax = f"min(1,X/{F})" if dir_ == 1 else f"min(1,({p(pw)}-X)/{F})"
        ay = f"min(1,Y/{F})" if baixo else f"min(1,({p(ph)}-Y)/{F})"
        gw = W * min(1.0, (L / JOGO_H) / (W / H) ** -1 if False else 1.0)
        gh = H
        gwc = min(W, H * L / JOGO_H)  # recorte central 
        gxc = (W - gwc) / 2
        base = (f"[0:v]split=3[a][b][c];[a]crop={p(cw)}:{p(ch)}:{p(cx)}:{p(cy)},scale={L}:{CAM_H}:flags=lanczos,{sai},"
                f"setsar=1[cam];[b]split=2[b1][b2];[b2]crop=8:{p(ph)}:{p(x0 - 8) if dir_ == 1 else p(x1)}:{p(sy)},scale={p(pw)}:{p(ph)}:flags=bilinear,boxblur=6:2,format=yuva420p,"
                f"geq=lum='lum(X,Y)':cb='cb(X,Y)':cr='cr(X,Y)':a='255*{ax}*{ay}'[rem];"
                f"[b1][rem]overlay={p(x0)}:{p(y0)}:format=auto,crop={p(gwc)}:{p(gh)}:{p(gxc)}:0,scale={L}:{JOGO_H}:flags=lanczos,{sai},setsar=1[jogo];"
                f"[c]scale={L}:{A}:force_original_aspect_ratio=increase:flags=lanczos,crop={L}:{A},boxblur=30:3[bg];"
                f"[bg][cam]overlay=0:0[t1];[t1][jogo]overlay=0:{CAM_H},setsar=1,format=yuv420p[base]")
    leg = f"[base]ass={ass}:fontsdir={ffp(FONTE_DIR)}[tk]"
    if not marca:
        return f"{base};{leg}", None
    nick = "@" + IDENT["nick"].lstrip("@")
    logo = RAIZ / IDENT["logo"]
    divide = "[tk]split=2[tk1][tk2];[2:v]scale=130:-1[l];[tk2][l]" if tiktok else "[2:v]scale=130:-1[l];[tk][l]"
    return (f"{base};{leg};{divide}overlay=W-w-40:70[ig0];"
            f"[ig0]drawtext=fontfile={ffp(FONTE)}:text='{nick}':fontsize=38:fontcolor=white:borderw=4:bordercolor=black:"
            f"x=W-tw-40:y=70+130+10[ig]"), logo


def tempo_ass(t):
    t = max(0.0, t)
    return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"


PESADO = re.compile(r"(caralh\w*|porra|put[ao]s?|fod\w*|merd\w*|bost\w*|viad\w*|desgra[çc]\w*|cacete|cu\b|buceta|pqp)", re.I)


def mascarar(m):
    w = m.group(0)
    return w[0] + "*" * (len(w) - 1)


def limpo(t):
    return PESADO.sub(mascarar, re.sub(r"[{}\\]", "", t)).strip()


def escrever_ass(caminho, gancho, palavras, dur, com_camera):
    y_gancho = CAM_H + JOGO_H + 70 if com_camera else 380
    y_leg = 1700 if com_camera else 1500
    cab = ["[Script Info]", "ScriptType: v4.00+", f"PlayResX: {L}", f"PlayResY: {A}", "WrapStyle: 0", "",
           "[V4+ Styles]",
           "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, "
           "Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, "
           "MarginL, MarginR, MarginV, Encoding",
           "Style: Gancho,Montserrat ExtraBold,58,&H00000000,&H00FFFFFF,&H0000E5FF,&H00000000,0,0,0,0,100,100,0,0,3,16,0,5,60,60,0,1",
           "Style: Leg,Montserrat ExtraBold,92,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,9,4,5,40,40,0,1",
           "", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
    ev = [f"Dialogue: 1,{tempo_ass(0.2)},{tempo_ass(min(dur, 3.8))},Gancho,,0,0,0,,{{\\pos(540,{y_gancho})}}{limpo(gancho).upper()}"]
    grupos = [palavras[i:i + 2] for i in range(0, len(palavras), 2)]
    for g, grupo in enumerate(grupos):
        prox = grupos[g + 1][0][0] if g + 1 < len(grupos) else dur
        for k, (s, e, _) in enumerate(grupo):
            fim = grupo[k + 1][0] if k + 1 < len(grupo) else min(prox, e + 0.35)
            fim = max(fim, s + 0.12)
            txt = " ".join(("{\\1c&H00E5FF&}" if j == k else "{\\1c&HFFFFFF&}") + limpo(w).upper()
                           for j, (_, _, w) in enumerate(grupo))
            ev.append(f"Dialogue: 0,{tempo_ass(s)},{tempo_ass(fim)},Leg,,0,0,0,,{{\\pos(540,{y_leg})}}{txt}")
    Path(caminho).write_text("\n".join(cab + ev) + "\n", encoding="utf-8")


# ----------------------------------------------------------------- palavras do clipe
def palavras_clipe(trecho, dur):
    audio = wav(trecho, None)
    pt, prob, db = janelas_pt(audio, "tiny", 3)
    segs = transcrever(audio, "small", palavras=True)
    pal, bons = [], 0
    for s in segs:
        if lixo(s) or not eh_pt(pt, s.start, s.end, 3):
            continue
        ws = [(w.start, w.end, w.word.strip(), w.probability) for w in (s.words or [])
              if w.word.strip() and w.probability >= 0.3]
        if not ws:
            continue
        pal += ws
        bons += 1
    while pal and pal[-1][3] < 0.55:  # cauda duvidosa (palavra cortada/alucinada no fim): fora
        pal.pop()
    pal = [(a, b, w) for a, b, w, _ in pal]
    texto = " ".join(w for _, _, w in pal)
    comuns = sum(1 for w in re.findall(r"\w+", texto.lower()) if w in PT_COMUM)
    return pal, texto, pt, audio, comuns


def enviar_para_fila(feitos, nome_live, url, tag):
    """Copia os clipes prontos (versão IG e, se ligada, TikTok) para a fila de revisão do painel, com legenda e nota. Devolve os nomes."""
    import shutil
    from datetime import datetime
    FILA.mkdir(parents=True, exist_ok=True)
    nomes = []
    slug = re.sub(r"[^a-z0-9]+", "-", (nome_live or "live").lower()).strip("-")[:20] or "live"
    for p in feitos:
        ig = next(Path(p).glob("*_ig.mp4"), None)
        if not ig:
            continue
        try:
            cm = json.loads((Path(p) / "meta.json").read_text())
        except Exception:
            cm = {}
        novo = FILA / f"{datetime.now().strftime('%Y%m%d-%H%M%S')}-{slug}-{tag}-{ig.name}"
        shutil.copy(ig, novo)
        tt = next(Path(p).glob("*_tiktok.mp4"), None)  # só existe se o TikTok estiver ligado (opcional)
        if tt:
            shutil.copy(tt, novo.with_name(novo.name.replace("_ig.mp4", "_tiktok.mp4")))
        post = f"Olha o que rolou na live {('do ' + nome_live) if nome_live else ''} no GTA 6 😳 #gta6 #gtavi #gta #cortes #streamer"
        novo.with_suffix(".txt").write_text(f"{cm.get('gancho', '')}\n\n{post}\n\nCorte da live de {nome_live}: {url}\n", encoding="utf-8")
        novo.with_suffix(".json").write_text(json.dumps({"nota": cm.get("nota"), "nota_detalhe": cm.get("nota_detalhe"), "gravado_em": cm.get("gravado_em"), "abaixo_min": cm.get("abaixo_min", False),
                                                          "streamer": nome_live}, ensure_ascii=False))
        nomes.append((novo.name, cm.get("nota")))
    return nomes


# ----------------------------------------------------------------- principal
def gerar(ts, streamer, canal, max_clipes, min_calor, saida, gancho_n=0, ver=False, forcar=None, gancho_fixo=None,
          rapido=True, npicos=None, tiktok=None, nota_min=NOTA_MIN, sempre_melhor=False):
    ts = Path(ts)
    tiktok = tiktok_ativo() if tiktok is None else tiktok
    saida = Path(saida)
    saida.mkdir(parents=True, exist_ok=True)
    t0 = time.time()
    usados_pk, notas = set(), {}
    npicos = npicos or PERFIL["picos"]
    raio = PERFIL["raio"]
    log(f"  perfil: {PERFIL_NOME} (preset {PERFIL['preset']}, {npicos} picos, ±{raio}s)")
    audio = wav(ts, None)
    dur = len(audio) / SR
    if forcar:
        trechos = [(forcar[0], min(dur, forcar[0] + forcar[1]), 0.0)]
        segs, ev = [], []
        pt = np.ones(int(dur // JAN) + 1, bool)
        log(f"{ts.name}: trecho forçado {trechos[0][:2]}")
    else:
        log(f"{ts.name}: {dur:.0f}s, detectando idioma por janelas…")
    if forcar:
        pass
    else:
      if rapido:
          # picos primeiro: idioma e whisper só em ±45 s dos maiores picos. Se nenhum trecho tiver nota boa, 2ª rodada com mais picos.
          pk_bruto = picos(audio, npicos * 3, max(60, 2 * raio + 5))
          pk_all = [p for p in pk_bruto if voz_pt(audio, p)]
          log(f"  picos com fala PT do streamer: {len(pk_all)} de {len(pk_bruto)} {sorted(pk_all)}")
          pt = db = None
          segs = []
          todos = []
          for ate in (npicos, npicos * 2):
              novos = [p for p in pk_all[:ate] if p not in usados_pk]
              if not novos:
                  break
              usados_pk.update(novos)
              regioes = []
              for p in sorted(novos):
                  a, b = max(0, p - raio), min(dur, p + raio)
                  if regioes and a <= regioes[-1][1]:
                      regioes[-1] = (regioes[-1][0], b)
                  else:
                      regioes.append((a, b))
              ativas = {i for a, b in regioes for i in range(int(a // JAN), int(b // JAN) + 1)}
              log(f"  modo rápido: picos em {sorted(int(p) for p in novos)}s, escutando {sum(b - a for a, b in regioes):.0f}s de {dur:.0f}s")
              novas = transcrever_regioes(audio, regioes, "tiny")
              segs += novas
              if os.environ.get("CLIPPER_IDIOMA", PERFIL["idioma"]) == "hibrido":
                  pt_n, prob, db = janelas_pt_hibrido(audio, novas, ativas)   # detector só nas janelas ambíguas (~10x menos chamadas)
              else:
                  pt_n, prob, db = janelas_pt(audio, "tiny", JAN, ativas)
              pt = pt_n if pt is None else (pt | pt_n)
              calor, falas, exc, ev = calor_segmento(audio, segs, pt, db)
              cands = escolher_trecho(calor, falas, exc, dur, min_calor, max(4, max_clipes * 3), [], ev)
              trechos, todos = avaliar(ts, cands, segs, pt, ev, nota_min, max_clipes)
              if trechos:
                  break
              log("  nenhum trecho com nota suficiente nesta rodada" + (" — ampliando a busca" if ate == npicos else ""))
          notas = {(x["ini"], x["fim"]): x for x in todos} if pk_all else {}
      else:
          pt, prob, db = janelas_pt(audio, "tiny")
          segs = transcrever(audio, "tiny")
          calor, falas, exc, ev = calor_segmento(audio, segs, pt, db)
          cands = escolher_trecho(calor, falas, exc, dur, min_calor, max(4, max_clipes * 3), [], ev)
          trechos, todos = avaliar(ts, cands, segs, pt, ev, nota_min, max_clipes)
          notas = {(x["ini"], x["fim"]): x for x in todos}
      log(f"  janelas PT: {int(pt.sum())}/{len(pt)}")
      log(f"  {len(segs)} falas, {len(trechos)} trecho(s) candidato(s) [{time.time() - t0:.0f}s]")
    if not trechos and sempre_melhor and notas:
        # entrega o MELHOR candidato mesmo abaixo da nota mínima (marcado) para a pessoa julgar; os portões de fala PT/imagem parada continuam valendo
        top = max(notas.values(), key=lambda x: x["nota"])
        if top["nota"] >= 10:
            trechos = [(top["ini"], top["fim"], top["calor"])]
            top["abaixo_min"] = True
            log(f"  nada passou da nota {nota_min}: entregando o melhor candidato (nota {top['nota']}), marcado como abaixo do mínimo")
    if ver:
        for x in notas.values():
            log(f"  CAND {int(x['ini'])}-{int(x['fim'])}s nota {x['nota']} calor {x['calor']:.0f}: {x['texto'][:400]}")
        return []
    feitos = []
    for k, (s, e, c) in enumerate(trechos):
        cid = f"{canal}-{ts.parent.name[-6:]}-{ts.stem[-5:]}-{int(s):04d}"
        pasta = saida / cid
        pasta.mkdir(exist_ok=True)
        trecho = pasta / "trecho.mp4"
        # corte sem reencode (o render final reencoda uma vez só); começa no keyframe anterior (≲2 s antes de `s`)
        sh(["ffmpeg", "-nostdin", "-y", "-loglevel", "error", "-ss", f"{s:.2f}", "-i", ts, "-t", f"{e - s + 2:.2f}",
            "-c", "copy", "-avoid_negative_ts", "make_zero", trecho])
        d = e - s
        pal, texto, ptc, aud_c, comuns = palavras_clipe(trecho, d)
        nt = notas.get((s, e))
        meta = {"id": cid, "origem": str(ts), "inicio": s, "fim": e, "calor": c, "streamer": streamer, "canal": canal,
                "palavras": len(pal), "texto": texto, "nota": nt["nota"] if nt else None, "nota_detalhe": nt["det"] if nt else None,
                "gravado_em": int(ts.stat().st_mtime * 1000), "abaixo_min": bool(nt and nt.get("abaixo_min"))}
        chato = len(re.findall(r"(c[oó]digo|gift|\bsubs?\b|inscri|doa[çc]|\bpix\b|sorteio|patrocin|\bdrops?\b|\bchat\b)", texto.lower()))
        fr = subprocess.run(["ffmpeg", "-nostdin", "-i", str(trecho), "-vf", "scale=320:-2,freezedetect=n=0.004:d=1.5", "-an", "-f", "null", "-"],
                            capture_output=True, text=True).stderr
        congelado = sum(float(x) for x in re.findall(r"freeze_duration: ([\d.]+)", fr))
        meta["congelado_s"] = congelado
        if chato >= 2 or congelado > 0.35 * d:
            meta["status"] = f"reprovado: {'leitura de chat/código/sub' if chato >= 2 else 'imagem parada (menu/loading)'}"
            (pasta / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1))
            log(f"  {cid}: REPROVADO (chato={chato}, parado={congelado:.0f}s)")
            continue
        if len(pal) < 15 or comuns < 6:
            meta["status"] = "reprovado: pouca fala PT do streamer"
            (pasta / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1))
            log(f"  {cid}: REPROVADO (palavras PT {len(pal)}, comuns {comuns})")
            continue
        if pal and pal[-1][1] + 1.2 < d and pal[-1][1] + 1.2 >= 25:
            d = pal[-1][1] + 1.2  # termina logo depois da última fala boa (sem frase cortada)
        W, H = dims(trecho)
        rosto = None  # câmera já aparece na live: mostra a live inteira, sem faixa separada (por isso não detectamos mais o rosto)
        gancho = gancho_fixo or GANCHOS[(gancho_n + k) % len(GANCHOS)].format(N=streamer.upper())
        ass = pasta / "legenda.ass"
        escrever_ass(ass, gancho, pal, d, rosto is not None)
        fcg, logo = filtro(W, H, rosto, ass.name, True, tiktok)
        cmd = ["ffmpeg", "-nostdin", "-y", "-loglevel", "error", "-i", "trecho.mp4", "-i", "trecho.mp4", "-i", logo,
               "-filter_complex", fcg + ";[tk1]null[tkout]"]
        af = "loudnorm=I=-16:TP=-1.5:LRA=11"
        enc = ["-c:v", "libx264", "-preset", PERFIL["preset"], "-crf", PERFIL["crf"], "-maxrate", "7M", "-bufsize", "14M", "-r", "30", "-c:a", "aac", "-b:a", "192k",
               "-af", af, "-t", f"{d:.2f}", "-movflags", "+faststart"]
        cmd = ["ffmpeg", "-nostdin", "-y", "-loglevel", "error", "-i", "trecho.mp4", "-i", "trecho.mp4", "-i", str(logo),
               "-filter_complex", fcg]
        if tiktok:  # TikTok opcional: versão limpa (sem logo/@) quando ligada na aba Contas ou com --tiktok
            cmd += ["-map", "[tk1]", "-map", "0:a", *enc, f"{cid}_tiktok.mp4"]
        cmd += ["-map", "[ig]", "-map", "0:a", *enc, f"{cid}_ig.mp4"]
        log(f"  {cid}: {s:.0f}-{e:.0f}s, calor {c:.0f}, {len(pal)} palavras, câmera={'sim' if rosto is not None else 'não'}; renderizando…")
        sh(cmd, cwd=pasta)
        meta["status"] = "gerado (aguarda portão)"
        meta["camera"] = rosto is not None
        meta["gancho"] = gancho
        (pasta / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1))
        trecho.unlink(missing_ok=True)
        feitos.append(pasta)
        log(f"  {cid}: PRONTO [{time.time() - t0:.0f}s]")
    return feitos


GANCHOS = ["OLHA O QUE {N} ACHOU NO GTA 6", "A REAÇÃO DO {N} NO GTA 6", "{N} NÃO ACREDITOU NO GTA 6",
           "{N} SURTOU NO GTA 6", "O QUE ACONTECEU COM O {N} NO GTA 6"]

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("ts")
    ap.add_argument("--streamer", required=True)
    ap.add_argument("--canal", required=True)
    ap.add_argument("--max", type=int, default=2)
    ap.add_argument("--min-calor", type=float, default=60.0)
    ap.add_argument("--saida", default=str(SAIDA_PADRAO))
    ap.add_argument("--gancho-n", type=int, default=0)
    ap.add_argument("--ver", action="store_true", help="só lista candidatos com a transcrição")
    ap.add_argument("--inicio", type=float, help="força o início (s) do trecho")
    ap.add_argument("--dur", type=float, default=45.0)
    ap.add_argument("--gancho", help="texto do gancho (honesto, descreve o clipe)")
    ap.add_argument("--completo", action="store_true", help="analisa o segmento inteiro (lento, ~2x); padrão: só ao redor dos picos")
    ap.add_argument("--nota-min", type=int, default=NOTA_MIN, help="nota mínima de relevância (0-100) para virar clipe")
    ap.add_argument("--sempre-melhor", action="store_true", help="se nada passar da nota mínima, entrega o melhor candidato marcado como 'abaixo do mínimo'")
    ap.add_argument("--perfil", choices=["auto", *PERFIS], help="desempenho: auto (pelo hardware), qualidade, equilibrado ou leve (PC fraco)")
    ap.add_argument("--picos", type=int, default=None, help="quantos picos analisar no modo rápido")
    g = ap.add_mutually_exclusive_group()
    g.add_argument("--tiktok", dest="tiktok", action="store_true", default=None, help="gera também a versão limpa para TikTok (padrão: segue config/contas.json)")
    g.add_argument("--sem-tiktok", dest="tiktok", action="store_false", help="não gera a versão TikTok, mesmo se ligada na config")
    a = ap.parse_args()
    if a.perfil:
        os.environ["CLIPPER_PERFIL"] = a.perfil
        PERFIL_NOME = perfil_escolhido()
        PERFIL = PERFIS[PERFIL_NOME]
    gerar(a.ts, a.streamer, a.canal, a.max, a.min_calor, a.saida, a.gancho_n, a.ver, (a.inicio, a.dur) if a.inicio is not None else None, a.gancho,
          rapido=not a.completo, npicos=a.picos, tiktok=a.tiktok, nota_min=a.nota_min, sempre_melhor=a.sempre_melhor)
