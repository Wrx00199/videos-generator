#!/usr/bin/env python3
"""B-roll / asset do estúdio: achar, prever, revisar, baixar só o trecho e registrar procedência.

Ideias do repo get-brolls (MIT), reescritas para o nosso estúdio (Linux, PC fraco). Melhorias: prévia sem baixar o
vídeo (storyboard do YouTube / seek por HTTP), janela sugerida automática, filtro de rosto, revisão em HTML estático,
download só do trecho aprovado, sem áudio, procedência em JSONL com sha256 e `verificar`.

  buscar "<assunto>" [--fontes youtube,commons,nasa[,pexels,pixabay]] [--n 8] [--cc]
  previa <candidatos.json> [--max 6] [--janela ID=INI-FIM] [--gif-s 4]
  revisar <candidatos.json> [--abrir]          # gera revisar.html; no HTML: aprovar/recusar -> decisoes.json
  importar <decisoes.json> [--max-s 8] [--permitir-pessoa]
  baixar <candidatos.json> [--projeto X] [--aceito-risco]
  verificar                                    # confere sha256 e acha arquivo sem procedência
  semear                                       # procedência de banco/sfx e banco/musica a partir de banco/LICENCAS.md

Trabalho em `_tmp/brolls/<assunto>/` (apagável); banco final em `banco/broll/<assunto>/`.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import html
import importlib.util
import json
import os
import re
import subprocess
import sys
import tempfile
import time
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
BANCO = RAIZ / "banco"
TRAB = RAIZ / "_tmp" / "brolls"
ORIGEM = BANCO / "ORIGEM.jsonl"
VENV_PY = RAIZ / "ferramentas" / "rea-video" / ".venv" / "bin" / "python"  # tem OpenCV (o python3 do sistema não tem)
MODELO = RAIZ / "ferramentas" / "modelos" / "face_detection_yunet_2023mar.onnx"
UA = "EstudioBrolls/1.0 (uso local)"
NICE = ["nice", "-n", "19"]  # PC fraco, quase sempre com render rolando
FONTES_OK = ["youtube", "commons", "nasa"]
FONTES_CHAVE = {"pexels": "PEXELS_API_KEY", "pixabay": "PIXABAY_API_KEY"}  # opcionais, desligadas por padrão
CC_SP = "EgIwAQ%3D%3D"  # filtro "Creative Commons" da busca do YouTube


# ---------------------------------------------------------------- utilidades
def die(msg: str):
    sys.exit(f"brolls: {msg}")


def slug(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:60] or "assunto"


def agora() -> str:
    return dt.datetime.now().astimezone().isoformat(timespec="seconds")


def tempo(v) -> float:
    """'83', '1:23', '1:02:03' ou número -> segundos."""
    if isinstance(v, (int, float)):
        return float(v)
    p = [float(x) for x in str(v).strip().split(":")]
    return sum(x * 60 ** i for i, x in enumerate(reversed(p)))


def tc(s: float) -> str:
    s = int(round(s))
    return f"{s // 60:02d}:{s % 60:02d}" if s < 3600 else f"{s // 3600}:{s % 3600 // 60:02d}:{s % 60:02d}"


def sha256(p: Path) -> str:
    h = hashlib.sha256()
    with p.open("rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""):
            h.update(b)
    return h.hexdigest()


def pesq():
    """Reaproveita ytdlp()/COOKIES/JS de pesquisar.py (mesmo login do Firefox, mesmo solver JS)."""
    spec = importlib.util.spec_from_file_location("pesquisar", RAIZ / "ferramentas" / "pesquisar.py")
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def http(url: str, headers: dict | None = None, timeout: int = 25, metodo: str = "GET") -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA, **(headers or {})}, method=metodo)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def http_json(url: str, headers: dict | None = None) -> dict:
    return json.loads(http(url, headers))


def env_chave(nome: str) -> str | None:
    if os.environ.get(nome):
        return os.environ[nome]
    f = RAIZ / ".env"
    if f.exists():
        for ln in f.read_text(encoding="utf-8", errors="ignore").splitlines():
            if ln.startswith(nome + "="):
                return ln.split("=", 1)[1].strip().strip("'\"") or None
    return None


def cache(chave: str, fn):
    """Cache diário em _tmp/brolls/cache/<data>/: mesma busca no mesmo dia não bate de novo na rede."""
    d = TRAB / "cache" / dt.date.today().isoformat()
    p = d / (hashlib.sha1(chave.encode()).hexdigest()[:20] + ".json")
    if p.exists():
        return json.loads(p.read_text(encoding="utf-8"))
    r = fn()
    d.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(r, ensure_ascii=False), encoding="utf-8")
    return r


def projeto_atual() -> str:
    partes = Path.cwd().parts
    if "projetos" in partes and partes.index("projetos") + 1 < len(partes):
        resto = partes[partes.index("projetos") + 1:]
        if resto[0] in ("gta6", "bonecos") and len(resto) > 1:
            return resto[1]
        return resto[0]
    return os.environ.get("ESTUDIO_PROJETO", "-")


def carregar(p) -> tuple[Path, dict]:
    p = Path(p)
    if p.is_dir():
        p = p / "candidatos.json"
    if not p.exists():
        die(f"não achei {p}")
    return p, json.loads(p.read_text(encoding="utf-8"))


def salvar(p: Path, d: dict) -> None:
    tmp = p.with_suffix(".tmp")
    tmp.write_text(json.dumps(d, ensure_ascii=False, indent=1), encoding="utf-8")
    tmp.replace(p)


def risco_de(licenca: str) -> str:
    l = licenca.lower()
    return "baixo" if any(k in l for k in ("public domain", "domínio público", "cc0", "cc by", "creative commons", "pd-", "nasa")) else "alto"


# ---------------------------------------------------------------- fontes
def f_youtube(termo: str, n: int, cc: bool) -> list[dict]:
    P = pesq()
    q = {"search_query": termo}
    if cc:
        q["sp"] = urllib.parse.unquote(CC_SP)
    d = P.ytdlp(["--flat-playlist", "--playlist-end", str(n), "https://www.youtube.com/results?" + urllib.parse.urlencode(q)]) or {}
    out = []
    for e in (d.get("entries") or [])[:n]:
        if not e.get("id"):
            continue
        time.sleep(2)  # ritmo calmo entre consultas (anti-robô)
        try:
            i = P.ytdlp(["--skip-download", f"https://www.youtube.com/watch?v={e['id']}"], timeout=100) or {}
        except subprocess.TimeoutExpired:
            i = {}
        if i.get("is_live"):
            continue
        sbs = [f for f in i.get("formats") or [] if f.get("format_note") == "storyboard" and f.get("fragments")]
        sb = max(sbs, key=lambda f: f.get("width") or 0, default=None)
        lic = i.get("license") or ""
        out.append({
            "id": f"yt-{e['id']}", "ref": e["id"], "fonte": "youtube", "titulo": i.get("title") or e.get("title"),
            "autor": i.get("channel") or i.get("uploader") or e.get("channel"), "link": f"https://www.youtube.com/watch?v={e['id']}",
            "duracao_s": i.get("duration") or e.get("duration"), "licenca": lic or "YouTube padrão (não livre)", "licenca_url": "",
            "risco": "baixo" if "creative commons" in lic.lower() else "alto", "miniatura": i.get("thumbnail"),
            "sb": ({k: sb.get(k) for k in ("width", "height", "rows", "columns")}
                   | {"fragments": [{"url": x["url"], "duration": x["duration"]} for x in sb["fragments"]]}) if sb else None,
            "sb_em": time.time(),
        })
    return out


def _tira_html(s: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", s or "")).strip()


def derivados(url: str, alturas) -> list[str]:
    """Versões que o próprio Commons transcodifica (vp9 e vp8): leves e sem o limite 429 dos originais grandes."""
    m = re.match(r"(https://upload\.wikimedia\.org/wikipedia/commons)/(\w/\w\w)/([^/]+)$", url)
    if not m:
        return []
    base = f"{m[1]}/transcoded/{m[2]}/{m[3]}/{m[3]}"
    return [f"{base}.{h}p.{c}" for h in alturas for c in ("vp9.webm", "webm")]


def f_commons(termo: str, n: int) -> list[dict]:
    q = urllib.parse.urlencode({"action": "query", "generator": "search", "gsrnamespace": 6, "gsrsearch": f"{termo} filetype:video",
                                "gsrlimit": n * 2, "prop": "imageinfo", "iiprop": "url|extmetadata|size|mime|mediatype",
                                "iiurlwidth": 320, "format": "json"})
    pgs = sorted((http_json("https://commons.wikimedia.org/w/api.php?" + q).get("query") or {}).get("pages", {}).values(),
                 key=lambda p: p.get("index", 0))
    out = []
    for p in pgs:
        ii = (p.get("imageinfo") or [{}])[0]
        if ii.get("mediatype") != "VIDEO":
            continue
        m = ii.get("extmetadata") or {}
        v = lambda k: _tira_html((m.get(k) or {}).get("value", ""))
        lic = v("LicenseShortName") or "desconhecida"
        url = ii["url"].split("?")[0]
        out.append({
            "id": f"cm-{p['pageid']}", "ref": str(p["pageid"]), "fonte": "commons", "titulo": p["title"].removeprefix("File:"),
            "autor": v("Artist") or "?", "link": ii.get("descriptionurl"), "duracao_s": ii.get("duration"),
            "licenca": lic, "licenca_url": v("LicenseUrl"), "risco": risco_de(lic), "miniatura": ii.get("thumburl"),
            "download_url": url, "preview_url": url, "atribuicao": v("AttributionRequired").lower() == "true",
            "largura": ii.get("width"), "altura": ii.get("height"),
        })
        if len(out) >= n:
            break
    return out


def _ffprobe_dur(url: str) -> float | None:
    try:
        r = subprocess.run(["ffprobe", "-v", "error", *ua_args(url), "-show_entries", "format=duration", "-of", "csv=p=0", url],
                           capture_output=True, text=True, timeout=30)
        return float(r.stdout.strip())
    except Exception:
        return None


def f_nasa(termo: str, n: int) -> list[dict]:
    d = http_json("https://images-api.nasa.gov/search?" + urllib.parse.urlencode({"q": termo, "media_type": "video", "page_size": n}))
    out = []
    for it in (d.get("collection") or {}).get("items", [])[:n]:
        dd = it["data"][0]
        try:
            arqs = http_json(urllib.parse.quote(it["href"].replace("http://", "https://"), safe=":/"))
        except Exception:
            continue
        pick = lambda *suf: next((a.replace("http://", "https://") for s in suf for a in arqs if a.endswith(s)), None)
        prev, full = pick("~mobile.mp4", "~small.mp4", "~medium.mp4"), pick("~large.mp4", "~medium.mp4", "~orig.mp4")
        if not (prev and full):
            continue
        out.append({
            "id": "nasa-" + hashlib.sha1(dd["nasa_id"].encode()).hexdigest()[:8], "ref": dd["nasa_id"], "fonte": "nasa",
            "titulo": dd.get("title"), "autor": dd.get("secondary_creator") or dd.get("center") or "NASA",
            "link": "https://images.nasa.gov/details/" + urllib.parse.quote(dd["nasa_id"]), "duracao_s": _ffprobe_dur(prev),
            "licenca": "NASA (uso geral permitido; checar crédito de terceiros)",
            "licenca_url": "https://www.nasa.gov/nasa-brand-center/images-and-media/",
            "risco": "baixo", "miniatura": pick("~thumb.jpg"), "preview_url": prev, "download_url": full, "atribuicao": False,
        })
    return out


def f_pexels(termo: str, n: int) -> list[dict]:  # opcional, não testado (sem chave)
    k = env_chave("PEXELS_API_KEY") or die("PEXELS_API_KEY ausente no .env (fonte opcional)")
    d = http_json("https://api.pexels.com/videos/search?" + urllib.parse.urlencode({"query": termo, "per_page": n}), {"Authorization": k})
    out = []
    for v in d.get("videos", []):
        fs = sorted([f for f in v["video_files"] if f.get("file_type") == "video/mp4"], key=lambda f: f.get("width") or 0)
        if fs:
            out.append({"id": f"px-{v['id']}", "ref": str(v["id"]), "fonte": "pexels", "titulo": v.get("url", "").rstrip("/").split("/")[-1],
                        "autor": v["user"]["name"], "link": v["url"], "duracao_s": v.get("duration"),
                        "licenca": "Pexels License (livre, sem crédito obrigatório)", "licenca_url": "https://www.pexels.com/license/",
                        "risco": "baixo", "miniatura": v.get("image"), "preview_url": fs[0]["link"],
                        "download_url": next((f["link"] for f in fs if (f.get("width") or 0) >= 1080), fs[-1]["link"]), "atribuicao": False})
    return out


def f_pixabay(termo: str, n: int) -> list[dict]:  # opcional, não testado (sem chave)
    k = env_chave("PIXABAY_API_KEY") or die("PIXABAY_API_KEY ausente no .env (fonte opcional)")
    d = http_json("https://pixabay.com/api/videos/?" + urllib.parse.urlencode({"key": k, "q": termo, "per_page": max(n, 3)}))
    out = []
    for h in d.get("hits", [])[:n]:
        vs = h["videos"]
        out.append({"id": f"pb-{h['id']}", "ref": str(h["id"]), "fonte": "pixabay", "titulo": h.get("tags"), "autor": h.get("user"),
                    "link": h["pageURL"], "duracao_s": h.get("duration"), "licenca": "Pixabay Content License (livre; sem revenda isolada)",
                    "licenca_url": "https://pixabay.com/service/license-summary/", "risco": "baixo", "miniatura": "",
                    "preview_url": (vs.get("tiny") or vs["small"])["url"], "download_url": (vs.get("large") or vs["medium"])["url"],
                    "atribuicao": False})
    return out


def cmd_buscar(a) -> None:
    fontes = [f.strip() for f in a.fontes.split(",") if f.strip()]
    for f in fontes:
        if f not in FONTES_OK + list(FONTES_CHAVE):
            die(f"fonte desconhecida: {f} (válidas: {', '.join(FONTES_OK + list(FONTES_CHAVE))})")
    fns = {"youtube": lambda: f_youtube(a.assunto, a.n, a.cc), "commons": lambda: f_commons(a.assunto, a.n),
           "nasa": lambda: f_nasa(a.assunto, a.n), "pexels": lambda: f_pexels(a.assunto, a.n), "pixabay": lambda: f_pixabay(a.assunto, a.n)}
    cands: list[dict] = []
    for f in fontes:
        t0 = time.time()
        try:
            r = cache(f"{f}|{a.assunto}|{a.n}|{a.cc}", fns[f])
        except SystemExit as e:  # YouTube pediu login: segue com as outras fontes
            print(f"! {f}: {e}", file=sys.stderr)
            continue
        except Exception as e:
            print(f"! {f}: {type(e).__name__}: {e}", file=sys.stderr)
            continue
        print(f"{f}: {len(r)} candidatos ({time.time() - t0:.1f}s)")
        cands += r
    d = TRAB / slug(a.assunto)
    d.mkdir(parents=True, exist_ok=True)
    antigo = {}
    if (d / "candidatos.json").exists():  # preserva decisões/prévias de uma busca anterior
        antigo = {c["id"]: c for c in json.loads((d / "candidatos.json").read_text(encoding="utf-8")).get("candidatos", [])}
    for c in cands:
        c.update({k: v for k, v in antigo.get(c["id"], {}).items()
                  if k in ("status", "inicio", "fim", "nota", "janela", "janela_origem", "pessoa", "rostos", "previa_jpg", "previa_gif", "aprovado_por")})
        c.setdefault("status", "novo")
    salvar(d / "candidatos.json", {"assunto": a.assunto, "slug": slug(a.assunto), "buscado_em": agora(), "candidatos": cands})
    for i, c in enumerate(cands, 1):
        dur = tc(c["duracao_s"]) if c.get("duracao_s") else "?"
        print(f"{i:02d} {c['fonte']:8} {dur:>8}  {(c['licenca'] or '')[:28]:28} {(c['titulo'] or '')[:50]}  {c['link']}")
    print(f"-> {d / 'candidatos.json'}")
    off = [f"{f} ({k})" for f, k in FONTES_CHAVE.items() if f not in fontes]
    if off:
        print("opcionais desligadas (chave grátis no .env, não testadas): " + ", ".join(off))


# ---------------------------------------------------------------- prévia
def _cv():
    try:
        import cv2
        import numpy as np
        return cv2, np
    except ImportError:
        if VENV_PY.exists() and Path(sys.executable) != VENV_PY:
            os.execv(str(VENV_PY), [str(VENV_PY), "-I", *sys.argv])
        die("OpenCV ausente (usar ferramentas/rea-video/.venv/bin/python)")


class Rostos:
    """YuNet (mesmo modelo e limiar do pesquisar.rostos): rosto vale se tiver >= 10% da altura do quadro."""

    def __init__(self):
        self.cv2, self.np = _cv()
        self.det = self.cv2.FaceDetectorYN.create(str(MODELO), "", (320, 180), 0.8) if MODELO.exists() else None

    def tem(self, img) -> bool:
        if self.det is None:
            return False
        h, w = img.shape[:2]
        if w < 320:  # quadro de storyboard é minúsculo: amplia antes
            img = self.cv2.resize(img, (320, int(h * 320 / w)))
            h, w = img.shape[:2]
        self.det.setInputSize((w, h))
        _, fs = self.det.detect(img)
        return fs is not None and any(f[3] >= h * .10 for f in fs)

    def nota(self, img) -> float:
        g = self.cv2.cvtColor(self.cv2.resize(img, (160, max(1, int(img.shape[0] * 160 / img.shape[1])))), self.cv2.COLOR_BGR2GRAY)
        nitidez = min(self.cv2.Laplacian(g, self.cv2.CV_64F).var() / 300, 1)
        return .7 * nitidez + .3 * (1 - min(abs(float(g.mean()) - 120) / 120, 1))


def _decod(raw: bytes):
    cv2, np = _cv()
    return cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)


def quadros_youtube(c: dict, k: int) -> list[tuple[float, object]]:
    """k quadros espalhados pelo vídeo inteiro a partir do storyboard do YouTube: zero download de vídeo."""
    if not c.get("sb") or time.time() - c.get("sb_em", 0) > 7200:  # URLs do storyboard expiram: refaz o detalhe
        info = pesq().ytdlp(["--skip-download", c["link"]], timeout=100) or {}
        sbs = [f for f in info.get("formats") or [] if f.get("format_note") == "storyboard" and f.get("fragments")]
        if not sbs:
            return []
        sb = max(sbs, key=lambda f: f.get("width") or 0)
        c["sb"] = {k_: sb.get(k_) for k_ in ("width", "height", "rows", "columns")} | {"fragments": [{"url": x["url"], "duration": x["duration"]} for x in sb["fragments"]]}
        c["sb_em"] = time.time()
    sb, dur = c["sb"], float(c["duracao_s"])
    por_frag, imgs = sb["rows"] * sb["columns"], {}
    ini, ts = 0.0, []  # (tempo, índice do fragmento, posição no fragmento)
    for fi, fr in enumerate(sb["fragments"]):
        passo = fr["duration"] / por_frag
        ts += [(ini + j * passo, fi, j) for j in range(por_frag) if ini + j * passo < dur]
        ini += fr["duration"]
    out = []
    for i in range(k):
        t, fi, j = min(ts, key=lambda x: abs(x[0] - (i + .5) / k * dur))
        if fi not in imgs:
            imgs[fi] = _decod(http(sb["fragments"][fi]["url"]))
        r, col = divmod(j, sb["columns"])
        w, h = sb["width"], sb["height"]
        q = imgs[fi][r * h:(r + 1) * h, col * w:(col + 1) * w]
        if q.size:
            out.append((t, q))
    return out


def quadros_http(url: str, dur: float, k: int) -> list[tuple[float, object]]:
    """k quadros por seek HTTP (ffmpeg lê só o pedaço preciso): para commons/nasa/stock."""
    out = []
    for i in range(k):
        t = (i + .5) / k * dur
        r = subprocess.run(NICE + ["ffmpeg", "-v", "error", *ua_args(url), "-ss", f"{t:.2f}", "-i", url, "-frames:v", "1", "-vf", "scale=320:-2",
                                   "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True, timeout=90)
        img = _decod(r.stdout) if r.stdout else None
        if img is not None:
            out.append((t, img))
        if url.startswith("http"):
            time.sleep(1.5)  # Wikimedia devolve 429 se abrir conexões em rajada
    return out


def folha(quadros, janela, destino: Path) -> None:
    """Folha de contato 4 colunas com TIMECODE em cada quadro; borda verde nos quadros dentro da janela."""
    cv2, np = _cv()
    tw, th, cols = 240, 135, 4
    tiles = []
    for t, img in quadros:
        q = cv2.resize(img, (tw, th))
        if janela[0] - 1.5 <= t <= janela[1] + 1.5:
            cv2.rectangle(q, (0, 0), (tw - 1, th - 1), (0, 220, 0), 4)
        cv2.putText(q, tc(t), (6, th - 8), cv2.FONT_HERSHEY_SIMPLEX, .6, (0, 0, 0), 4)
        cv2.putText(q, tc(t), (6, th - 8), cv2.FONT_HERSHEY_SIMPLEX, .6, (255, 255, 255), 1)
        tiles.append(q)
    while len(tiles) % cols:
        tiles.append(np.zeros((th, tw, 3), np.uint8))
    cv2.imwrite(str(destino), np.vstack([np.hstack(tiles[i:i + cols]) for i in range(0, len(tiles), cols)]), [cv2.IMWRITE_JPEG_QUALITY, 80])


def secao_youtube(link: str, a: float, b: float, saida: Path, fmt: str) -> Path:
    """Baixa SÓ [a,b] segundos (yt-dlp --download-sections); devolve o arquivo gerado."""
    P = pesq()
    ck = ["--cookies-from-browser", P.COOKIES] if P.COOKIES else []
    saida.parent.mkdir(parents=True, exist_ok=True)
    r = subprocess.run(NICE + ["yt-dlp", "--no-warnings", "--sleep-requests", "1", *ck, *P.JS, "--download-sections", f"*{a:.2f}-{b:.2f}",
                               "-f", fmt, "-o", str(saida) + ".%(ext)s", link], capture_output=True, text=True, timeout=240)
    if "not a bot" in r.stderr:
        die("YouTube pediu login (anti-robô). Conferir o Firefox logado; senão esperar.")
    ach = [p for p in saida.parent.glob(saida.name + ".*") if not p.name.endswith((".part", ".ytdl"))]
    if r.returncode or not ach:
        raise RuntimeError("yt-dlp: " + (r.stderr.strip().splitlines() or ["sem saída"])[-1][:200])
    return ach[0]


def ua_args(u: str) -> list[str]:
    return ["-user_agent", UA] if u.startswith("http") else []


def head_len(url: str) -> int | None:
    """Tamanho em bytes se a URL existe (HEAD), senão None."""
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA}, method="HEAD")
        with urllib.request.urlopen(req, timeout=15) as r:
            return int(r.headers.get("Content-Length") or 0)
    except Exception:
        return None


def derivado_local(c: dict, alturas, max_mb: int, destino: Path) -> Path | None:
    """Commons: baixa UM transcode pequeno inteiro (1 GET só). O ffmpeg abrindo/seekando por HTTP faz várias
    requisições e o Wikimedia devolve 429; um GET único é educado e o resto é local."""
    for u in derivados(c["download_url"], alturas):
        n = head_len(u)
        if n and n <= max_mb * 1e6:
            destino.parent.mkdir(parents=True, exist_ok=True)
            with urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": UA}), timeout=60) as r, destino.open("wb") as f:
                while b := r.read(1 << 20):
                    f.write(b)
            c["url_usada"] = u
            return destino
    return None


def _ff(args: list[str], timeout: int = 300) -> None:
    """ffmpeg com nice; em falha, levanta com a última linha do stderr (útil p/ 429/404)."""
    r = subprocess.run(NICE + ["ffmpeg", "-v", "error", *args], capture_output=True, text=True, timeout=timeout)
    if r.returncode:
        raise RuntimeError("ffmpeg: " + (r.stderr.strip().splitlines() or ["?"])[-1][:200])


def url_viva(c: dict) -> str:
    """Primeira URL de prévia que responde (HEAD): commons tenta transcodes leves antes do original."""
    cands = (derivados(c["download_url"], (360, 480, 240)) if c["fonte"] == "commons" else []) + [c["preview_url"]]
    for u in cands:
        try:
            http(u, metodo="HEAD", timeout=15)
            return u
        except Exception:
            continue
    return c["preview_url"]


def previa_um(c: dict, d: Path, gif_s: float, janela_manual, R: Rostos) -> dict:
    t0 = time.time()
    dur = float(c.get("duracao_s") or 0)
    fonte_prev = None
    if c["fonte"] == "youtube":
        quadros = quadros_youtube(c, 12)
    else:
        fonte_prev = str(derivado_local(c, (360, 480, 240), 40, d / "_prev.webm") or url_viva(c)) if c["fonte"] == "commons" else url_viva(c)
        if not dur:
            dur = c["duracao_s"] = _ffprobe_dur(fonte_prev) or 0
        quadros = quadros_http(fonte_prev, dur, 12) if dur else []
    if not quadros or not dur:
        raise RuntimeError("sem quadros/duração")
    t_quadros = time.time() - t0
    com_rosto = [R.tem(img) for _, img in quadros]
    notas = [R.nota(img) - (1 if r else 0) for (_, img), r in zip(quadros, com_rosto)]
    L = min(gif_s, dur)
    if janela_manual:
        a, b = janela_manual
        origem = "manual"
    else:
        tbest = quadros[max(range(len(quadros)), key=notas.__getitem__)][0]
        a = max(0.0, min(tbest - L / 2, dur - L))
        b, origem = a + L, "auto"
    b = min(b, a + 5, dur)  # prévia nunca passa de 5 s
    # clipe curto (só o trecho) -> GIF; os quadros dele também entram no filtro de rosto (resolução maior)
    t1 = time.time()
    for p in d.glob("_clip*"):
        p.unlink()
    if c["fonte"] == "youtube":
        arq = secao_youtube(c["link"], a, b, d / "_clip", "bv*[height<=360]/bv*[height<=480]/worst[height>=144]/worst")
    else:
        arq = d / "_clip.mp4"
        _ff(["-y", *ua_args(fonte_prev), "-ss", f"{a:.2f}", "-t", f"{b - a:.2f}", "-i", fonte_prev, "-an", "-vf", "scale=-2:360",
             "-c:v", "libx264", "-preset", "veryfast", "-crf", "30", str(arq)])
    gif = d / "previas" / f"{c['id']}.gif"
    gif.parent.mkdir(exist_ok=True)
    _ff(["-y", "-i", str(arq), "-t", f"{b - a:.2f}", "-vf",
         "fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=96[p];[s1][p]paletteuse", "-loop", "0", str(gif)], 120)
    cv2, _ = _cv()
    cap = cv2.VideoCapture(str(arq))
    n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    for f in (.2, .5, .8):
        if n:
            cap.set(cv2.CAP_PROP_POS_FRAMES, int(n * f))
            ok, im = cap.read()
            if ok:
                com_rosto.append(R.tem(im))
    cap.release()
    arq.unlink(missing_ok=True)
    (d / "_prev.webm").unlink(missing_ok=True)
    folha(quadros, (a, b), d / "previas" / f"{c['id']}.jpg")
    k = sum(com_rosto)
    print(f"   {c['id']}: quadros {t_quadros:.1f}s, trecho+gif {time.time() - t1:.1f}s, rostos {k}/{len(com_rosto)}")
    return {"janela": [round(a, 1), round(b, 1)], "janela_origem": origem, "pessoa": bool(k >= 2 or k >= .25 * len(com_rosto)),
            "rostos": f"{k}/{len(com_rosto)}", "previa_jpg": f"previas/{c['id']}.jpg", "previa_gif": f"previas/{c['id']}.gif"}


def cmd_previa(a) -> None:
    _cv()  # reexec no python do venv se faltar OpenCV
    p, dados = carregar(a.candidatos)
    man = {}
    for j in a.janela or []:
        i, _, r = j.partition("=")
        x, _, y = r.partition("-")
        man[i] = (tempo(x), tempo(y))
    R = Rostos()
    alvo = [c for c in dados["candidatos"] if c.get("status") != "recusado" and (not a.ids or c["id"] in a.ids.split(",")) and (c["id"] in man or not (a.so_novos and c.get("previa_jpg")))][: a.max]
    t0 = time.time()
    for c in alvo:
        try:
            c.update(previa_um(c, p.parent, min(a.gif_s, 5), man.get(c["id"]), R))
            if c["status"] == "novo":
                c["status"] = "previa"
        except Exception as e:
            print(f"   {c['id']}: falhou ({type(e).__name__}: {str(e)[:160]})", file=sys.stderr)
    salvar(p, dados)
    print(f"previa: {len(alvo)} candidatos em {time.time() - t0:.1f}s; pessoa em: " + (", ".join(c["id"] for c in alvo if c.get("pessoa")) or "nenhum"))


# ---------------------------------------------------------------- revisão
PAGINA = """<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Revisar b-rolls: __ASSUNTO__</title><style>
body{font:15px system-ui;background:#111;color:#eee;margin:auto;padding:12px;max-width:1100px}
h1{font-size:18px}.c{background:#1c1c1c;border-radius:8px;padding:10px;margin:12px 0;border-left:6px solid #555}
.c.aprovar{border-color:#2ecc71}.c.recusar{border-color:#e74c3c}img{max-width:100%;border-radius:4px}
.b{display:inline-block;padding:1px 7px;border-radius:9px;font-size:12px;margin-right:4px;background:#333}
.alto,.pessoa{background:#a33}.baixo{background:#264}a{color:#8cf}input[type=text]{width:70px;background:#000;color:#eee;border:1px solid #444}
textarea.n{width:100%;background:#000;color:#eee;border:1px solid #444}.r label{margin-right:14px;font-size:16px}
button{font-size:16px;padding:10px 16px;margin:6px 0}textarea#o{width:100%;height:110px;background:#000;color:#9f9}
.m{color:#aaa;font-size:13px}</style>
<h1>Revisar b-rolls: __ASSUNTO__</h1>
<p class="m">Regras: sem pessoa real (salvo corte de live), sem música/áudio de terceiro (o download sai mudo), licença vermelha = risco. Ajuste início/fim olhando o TIMECODE da folha (borda verde = janela sugerida).</p>
<div id="l"></div><button id="g">Gerar decisoes.json</button> <span id="s" class="m"></span>
<textarea id="o" readonly placeholder="o JSON aparece aqui (e baixa como decisoes.json). Depois: python3 ferramentas/brolls.py importar ~/Downloads/decisoes.json"></textarea>
<script>
const D=__DADOS__;const K="brolls-"+D.slug;let E={};try{E=JSON.parse(localStorage.getItem(K)||"{}")}catch(e){}
const tc=s=>{s=Math.round(s);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};
const L=document.getElementById("l");
D.candidatos.forEach(c=>{const e=E[c.id]||{};const st=e.d||(c.status=="aprovado"?"aprovar":c.status=="recusado"?"recusar":"pendente");
const j=c.janela||[c.inicio||0,c.fim||0];const div=document.createElement("div");div.className="c "+st;div.id=c.id;
div.innerHTML=`<b>${c.id}</b> ${c.titulo||""}<br><span class="m">${c.autor||""} | ${c.fonte} | ${c.duracao_s?tc(c.duracao_s):"?"} | <a href="${c.link}" target="_blank" rel="noopener">link</a></span><br>
<span class="b ${c.risco}">${c.licenca}</span>${c.pessoa?'<span class="b pessoa">PESSOA ('+c.rostos+')</span>':""}${c.atribuicao?'<span class="b">creditar autor</span>':""}<br>
${c.previa_gif?`<img src="${c.previa_gif}" loading="lazy"> <img src="${c.previa_jpg}" loading="lazy">`:'<span class="m">sem prévia (rode: brolls.py previa)</span>'}<br>
<div class="r"><label><input type="radio" name="d_${c.id}" value="aprovar" ${st=="aprovar"?"checked":""}> aprovar</label>
<label><input type="radio" name="d_${c.id}" value="recusar" ${st=="recusar"?"checked":""}> recusar</label>
<label><input type="radio" name="d_${c.id}" value="pendente" ${st=="pendente"?"checked":""}> pendente</label></div>
início <input type="text" class="i" value="${e.i||(c.inicio!=null?c.inicio:j[0])}"> fim <input type="text" class="f" value="${e.f||(c.fim!=null?c.fim:j[1])}">
<textarea class="n" rows="1" placeholder="onde vai usar / nota">${e.n||c.nota||""}</textarea>`;L.appendChild(div)});
function ler(){return D.candidatos.map(c=>{const d=document.getElementById(c.id);const r=d.querySelector("input[type=radio]:checked");
return{id:c.id,decisao:r?r.value:"pendente",inicio:d.querySelector(".i").value,fim:d.querySelector(".f").value,nota:d.querySelector(".n").value}})}
document.addEventListener("input",()=>{const m={};ler().forEach(v=>{m[v.id]={d:v.decisao,i:v.inicio,f:v.fim,n:v.nota};
document.getElementById(v.id).className="c "+v.decisao});try{localStorage.setItem(K,JSON.stringify(m))}catch(e){}});
document.getElementById("g").onclick=()=>{const j=JSON.stringify({assunto:D.assunto,slug:D.slug,por:"revisar.html",gerado_em:new Date().toISOString(),decisoes:ler()},null,1);
document.getElementById("o").value=j;const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([j],{type:"application/json"}));a.download="decisoes.json";a.click();
document.getElementById("s").textContent="baixado: decisoes.json (aprovados: "+ler().filter(v=>v.decisao=="aprovar").length+")"};
</script></html>"""


def cmd_revisar(a) -> None:
    p, dados = carregar(a.candidatos)
    j = json.dumps({k: dados[k] for k in ("assunto", "slug", "candidatos")}, ensure_ascii=False).replace("</", "<\\/")
    out = p.parent / "revisar.html"
    out.write_text(PAGINA.replace("__ASSUNTO__", html.escape(dados["assunto"])).replace("__DADOS__", j), encoding="utf-8")
    print(f"revisar: {out}")
    if a.abrir:
        subprocess.Popen(["xdg-open", str(out)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def cmd_importar(a) -> None:
    dec = json.loads(Path(a.decisoes).read_text(encoding="utf-8"))
    p, dados = carregar(Path(a.candidatos) if a.candidatos else TRAB / dec.get("slug", slug(dec.get("assunto", ""))))
    por_id = {c["id"]: c for c in dados["candidatos"]}
    cont = {"aprovado": 0, "recusado": 0, "pendente": 0}

    def pend(i, why):
        print(f"! {i}: {why}; ficou pendente", file=sys.stderr)
        cont["pendente"] += 1

    for x in dec["decisoes"]:
        c = por_id.get(x["id"])
        if not c:
            print(f"! id desconhecido: {x['id']}", file=sys.stderr)
        elif x["decisao"] == "recusar":
            c.update(status="recusado", nota=x.get("nota", ""))
            cont["recusado"] += 1
        elif x["decisao"] != "aprovar":
            cont["pendente"] += 1
        else:
            try:
                ini, fim = tempo(x["inicio"]), tempo(x["fim"])
            except ValueError:
                pend(x["id"], "tempo inválido")
                continue
            if not 0 <= ini < fim or fim - ini > a.max_s:
                pend(x["id"], f"trecho {ini}-{fim} inválido ou maior que {a.max_s}s")
            elif c.get("duracao_s") and fim > float(c["duracao_s"]) + .5:
                pend(x["id"], "fim passa da duração")
            elif c.get("pessoa") and not a.permitir_pessoa:
                pend(x["id"], "tem pessoa real (só corte de live: --permitir-pessoa)")
            else:
                c.update(status="aprovado", inicio=ini, fim=fim, nota=x.get("nota", ""), aprovado_por=dec.get("por", "revisar.html"), aprovado_em=agora())
                cont["aprovado"] += 1
    salvar(p, dados)
    print(f"importar: {cont} -> {p}")


# ---------------------------------------------------------------- baixar / procedência
def ler_origem() -> list[dict]:
    return [json.loads(l) for l in ORIGEM.read_text(encoding="utf-8").splitlines() if l.strip()] if ORIGEM.exists() else []


def gravar_origem(entradas: list[dict]) -> None:
    ORIGEM.parent.mkdir(parents=True, exist_ok=True)
    tmp = ORIGEM.with_suffix(".tmp")
    tmp.write_text("".join(json.dumps(e, ensure_ascii=False) + "\n" for e in sorted(entradas, key=lambda e: e["arquivo"])), encoding="utf-8")
    tmp.replace(ORIGEM)


def escrever_origem_md(pasta: str) -> None:
    """ORIGEM.md legível na pasta (broll/<assunto>, sfx, musica), regenerado do JSONL."""
    es = [e for e in ler_origem() if e["arquivo"].startswith(pasta + "/")]
    if not es:
        return
    L = [f"# Origem dos arquivos de banco/{pasta}", "Gerado por ferramentas/brolls.py a partir de banco/ORIGEM.jsonl (não editar à mão).", ""]
    for e in es:
        L.append(f"## {Path(e['arquivo']).name}")
        L.append(f"- fonte: {e['fonte']} | licença: {e['licenca']} (risco {e.get('risco', '?')})")
        if e.get("link"):
            L.append(f"- link: {e['link']}")
        if e.get("autor"):
            L.append(f"- autor: {e['autor']}" + ("  (CREDITAR no vídeo)" if e.get("atribuicao") else ""))
        if e.get("trecho"):
            L.append(f"- trecho: {tc(e['trecho'][0])} a {tc(e['trecho'][1])} do original (sem áudio)")
        L.append(f"- sha256: {e['sha256']} | {e['bytes']} bytes | registrado {e['registrado_em']}" + (f" | projeto {e['projeto']}" if e.get("projeto") else ""))
        if e.get("descricao"):
            L.append(f"- obs: {e['descricao']}")
        L.append("")
    (BANCO / pasta / "ORIGEM.md").write_text("\n".join(L), encoding="utf-8")


def cortar_para_banco(c: dict, a: float, b: float, destino: Path) -> None:
    destino.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="brolls-") as td:
        if c["fonte"] == "youtube":
            entrada = ["-i", str(secao_youtube(c["link"], a, b, Path(td) / "raw", "bv*[height<=1080]/b[height<=1080]/bv*/b"))]
            urls = [None]
        else:  # original primeiro; se o servidor negar (429 em arquivo grande), cai para o transcode mais alto
            urls = [c["download_url"]] + (derivados(c["download_url"], (1080, 720, 480)) if c["fonte"] == "commons" else [])
        for k, u in enumerate(urls):
            ent = entrada if u is None else ["-user_agent", UA, "-ss", f"{a:.2f}", "-i", u]
            try:  # normaliza: mp4 h264 mudo, duração exata (trecho curto, custo desprezível)
                _ff(["-y", *ent, "-t", f"{b - a:.2f}", "-an", "-c:v", "libx264", "-preset", "veryfast",
                     "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(destino)])
                c["url_usada"] = u or c["link"]
                return
            except RuntimeError as e:
                if k < len(urls) - 1:
                    print(f"   {c['id']}: {str(e)[:70]}; tentando derivado", file=sys.stderr)
                    continue
                loc = derivado_local(c, (720, 480, 360), 80, Path(td) / "d.webm") if c["fonte"] == "commons" else None
                if not loc:
                    raise
                _ff(["-y", "-ss", f"{a:.2f}", "-i", str(loc), "-t", f"{b - a:.2f}", "-an", "-c:v", "libx264", "-preset", "veryfast",
                     "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(destino)])
                return


def cmd_baixar(a) -> None:
    p, dados = carregar(a.candidatos)
    aprov = [c for c in dados["candidatos"] if c.get("status") == "aprovado"]
    if not aprov:
        die("nenhum candidato aprovado (revisar -> importar)")
    proj, pasta = a.projeto or projeto_atual(), f"broll/{dados['slug']}"
    for c in aprov:
        if c.get("risco") == "alto" and not a.aceito_risco:
            print(f"! {c['id']}: licença '{c['licenca']}' (risco alto). Pulei; só com --aceito-risco e ok do Filippe.", file=sys.stderr)
            continue
        ini, fim = float(c["inicio"]), float(c["fim"])
        rel = f"{pasta}/{c['id']}_{int(round(ini))}-{int(round(fim))}s.mp4"
        t0 = time.time()
        try:
            cortar_para_banco(c, ini, fim, BANCO / rel)
        except Exception as e:
            print(f"! {c['id']}: falhou ({type(e).__name__}: {str(e)[:160]})", file=sys.stderr)
            continue
        f = BANCO / rel
        lic = c["licenca"].lower()
        ent = {"arquivo": rel, "tipo": "broll", "assunto": dados["assunto"], "id": c["id"], "fonte": c["fonte"], "link": c["link"],
               "titulo": c.get("titulo"), "autor": c.get("autor"), "licenca": c["licenca"], "licenca_url": c.get("licenca_url", ""),
               "risco": c.get("risco"), "atribuicao": bool(c.get("atribuicao")) or "creative commons" in lic or "cc by" in lic,
               "url_usada": c.get("url_usada"), "trecho": [ini, fim], "sem_audio": True, "pessoa": bool(c.get("pessoa")), "aprovado_por": c.get("aprovado_por"),
               "sha256": sha256(f), "bytes": f.stat().st_size, "registrado_em": agora(), "projeto": proj}
        gravar_origem([e for e in ler_origem() if e["arquivo"] != rel] + [ent])
        c["arquivo"] = rel
        print(f"baixar: {rel} ({f.stat().st_size / 1e6:.2f} MB, {time.time() - t0:.1f}s)")
    escrever_origem_md(pasta)
    salvar(p, dados)


def cmd_verificar(a) -> None:
    ent, ruim, ok = ler_origem(), 0, 0
    for e in ent:
        f = BANCO / e["arquivo"]
        if not f.exists():
            print(f"FALTA {e['arquivo']}")
            ruim += 1
        elif sha256(f) != e["sha256"]:
            print(f"ALTERADO {e['arquivo']}")
            ruim += 1
        else:
            ok += 1
    reg = {e["arquivo"] for e in ent}
    for pasta in ("broll", "sfx", "musica"):
        for f in sorted((BANCO / pasta).rglob("*")) if (BANCO / pasta).exists() else []:
            r = f.relative_to(BANCO).as_posix()
            if f.is_file() and f.name not in ("ORIGEM.md", "LICENCAS.md") and not f.name.startswith(".") and r not in reg:
                print(f"SEM PROCEDENCIA {r}")
                ruim += 1
    print(f"verificar: {ok} ok, {ruim} problemas, {len(ent)} entradas")
    sys.exit(1 if ruim else 0)


def cmd_semear(a) -> None:
    """Procedência de sfx/musica a partir de banco/LICENCAS.md (linhas '- pasta/arq.wav, outro.wav: descrição')."""
    lic = BANCO / "LICENCAS.md"
    if not lic.exists():
        die("sem banco/LICENCAS.md")
    texto = lic.read_text(encoding="utf-8")
    data = (re.search(r"em (\d{4}-\d{2}-\d{2})", texto) or [None, None])[1]
    atual, novos = {e["arquivo"]: e for e in ler_origem()}, 0
    for ln in texto.splitlines():
        m = re.match(r"-\s+(.+?):\s+(.+)$", ln)
        if not m:
            continue
        desc, pasta = m[2], None
        for tok in (t.strip() for t in m[1].split(",")):
            if "/" in tok:
                pasta, tok = tok.rsplit("/", 1)
            f = BANCO / pasta / tok if pasta else None
            if not f or not f.is_file():
                print(f"! LICENCAS cita {tok} mas o arquivo não existe", file=sys.stderr)
                continue
            propria = any(k in desc.lower() for k in ("sintetizado", "síntese", "sintese", "original nosso"))
            rel = f"{pasta}/{tok}"
            atual[rel] = {"arquivo": rel, "tipo": pasta, "fonte": "síntese local (ffmpeg/numpy)" if propria else "ver LICENCAS.md", "link": "",
                          "autor": "estúdio", "licenca": "própria (síntese local, sem amostra de terceiros)" if propria else "ver banco/LICENCAS.md",
                          "risco": "baixo" if propria else "alto", "atribuicao": False, "sha256": sha256(f), "bytes": f.stat().st_size,
                          "registrado_em": agora(), "criado_em": data, "projeto": None, "descricao": desc}
            novos += 1
    gravar_origem(list(atual.values()))
    for pasta in ("sfx", "musica"):
        escrever_origem_md(pasta)
    print(f"semear: {novos} entradas -> {ORIGEM}")


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = ap.add_subparsers(dest="cmd", required=True)
    b = sp.add_parser("buscar")
    b.add_argument("assunto")
    b.add_argument("--fontes", default="youtube,commons,nasa", help="youtube,commons,nasa (sem chave); pexels,pixabay opcionais (chave no .env)")
    b.add_argument("--n", type=int, default=8)
    b.add_argument("--cc", action="store_true", help="YouTube: só Creative Commons")
    b.set_defaults(f=cmd_buscar)
    v = sp.add_parser("previa")
    v.add_argument("candidatos")
    v.add_argument("--max", type=int, default=6)
    v.add_argument("--gif-s", type=float, default=4)
    v.add_argument("--janela", action="append", help="ID=INI-FIM (segundos ou mm:ss), repetível")
    v.add_argument("--ids", help="só estes ids (separados por vírgula)")
    v.add_argument("--so-novos", action="store_true", help="pula quem já tem prévia")
    v.set_defaults(f=cmd_previa)
    r = sp.add_parser("revisar")
    r.add_argument("candidatos")
    r.add_argument("--abrir", action="store_true")
    r.set_defaults(f=cmd_revisar)
    i = sp.add_parser("importar")
    i.add_argument("decisoes")
    i.add_argument("--candidatos")
    i.add_argument("--max-s", type=float, default=8)
    i.add_argument("--permitir-pessoa", action="store_true")
    i.set_defaults(f=cmd_importar)
    d = sp.add_parser("baixar")
    d.add_argument("candidatos")
    d.add_argument("--projeto")
    d.add_argument("--aceito-risco", action="store_true", help="permite licença de risco alto (ex.: YouTube padrão), só com ok do Filippe")
    d.set_defaults(f=cmd_baixar)
    sp.add_parser("verificar").set_defaults(f=cmd_verificar)
    sp.add_parser("semear").set_defaults(f=cmd_semear)
    a = ap.parse_args()
    a.f(a)


if __name__ == "__main__":
    main()
