"""Pesquisador de virais por nicho (YouTube, sem API, via yt-dlp).

Uso:
  python3 ferramentas/pesquisar.py gta6                 # usa nichos/gta6.json
  python3 ferramentas/pesquisar.py gta6 --janela hoje   # sobrescreve a janela (hora|hoje|semana|mes|ano)
  python3 ferramentas/pesquisar.py gta6 --top 20

Nicho novo: copiar nichos/_modelo.json para nichos/<nome>.json e trocar termos/filtros.
Saída: projetos/referencias.csv (acumulativa, sem duplicar id; atualiza views) + top no terminal.

Colunas de nota:
  views_dia   views / dias desde o upload
  surto       views / inscritos do canal (>1 = passou a própria base: o FORMATO viralizou, não o canal)
  engaj_%     (likes + comentários) / views
  nota        log10(views_dia) * (1 + min(surto, 5)) — ordena candidatos
O "clonável" final é decisão do agente/Filippe; aqui só marca 'candidato' por filtros objetivos.

Sem rosto: o canal é faceless. Clone NUNCA usa referência com pessoa real (esquete, vlog, cosplay, react).
Rodar com o Python do rea-video (tem OpenCV) para ligar o filtro:
  ferramentas/rea-video/.venv/bin/python ferramentas/pesquisar.py gta6
Ele baixa 3 quadros do vídeo (25/50/75%) e marca a coluna 'rosto' (n/3 quadros com rosto grande).
O detector NÃO separa gente real de personagem do jogo (GTA tem rosto realista), então não reprova sozinho:
--mosaico grava projetos/_mosaico-<nicho>.jpg (3 quadros dos N melhores, numerados) e o agente veta no olho;
canal vetado vai para "excluir_canais" do nicho (fica vetado para sempre). Esquete/vlog/react/cosplay = veto.
Nicho de cortes de live pode desligar com "permitir_rosto": true no json.
"""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
import math
import subprocess
import time
import sys
import urllib.parse
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
import os
# Login do Filippe no Firefox (ele loga uma vez; mesmo esquema do bot antigo). ESTUDIO_COOKIES=nenhum desliga.
COOKIES = os.environ.get("ESTUDIO_COOKIES", "firefox")
COOKIES = "" if COOKIES == "nenhum" else COOKIES
# solver JS oficial do yt-dlp: sem ele o YouTube só entrega storyboard ("n challenge solving failed")
JS = ["--js-runtimes", "node", "--remote-components", "ejs:github"]
# filtro do YouTube: data de upload + duração curta (< 4 min)
SP = {"hora": "EgQIARgB", "hoje": "EgQIAhgB", "semana": "EgQIAxgB", "mes": "EgQIBBgB", "ano": "EgQIBRgB"}
CAMPOS = ["id", "nicho", "plataforma", "link", "titulo", "canal", "inscritos", "data", "dias", "duracao_s", "formato",
          "idioma", "views", "views_dia", "surto", "engaj_%", "nota", "termo", "candidato", "motivo", "rosto", "visto_em"]


def ytdlp(args: list[str], timeout: int = 120) -> dict | None:
    # ritmo educado: muitas consultas seguidas fazem o YouTube pedir login ("confirm you're not a bot")
    extra = ["--cookies-from-browser", COOKIES] if COOKIES else []
    r = subprocess.run(["yt-dlp", "--no-warnings", "--sleep-requests", "1", *extra, *JS, "-J", *args], capture_output=True, text=True, timeout=timeout)
    if "not a bot" in r.stderr:
        sys.exit("YouTube pediu login (anti-robô). Conferir se o Firefox está logado no YouTube; senão esperar algumas horas.")
    if r.returncode != 0 or not r.stdout.strip():
        return None
    return json.loads(r.stdout)


def buscar(termo: str, janela: str, n: int) -> list[dict]:
    url = "https://www.youtube.com/results?" + urllib.parse.urlencode({"search_query": termo, "sp": SP[janela]})
    d = ytdlp(["--flat-playlist", "--playlist-end", str(n), url]) or {}
    return [dict(e, _termo=termo) for e in d.get("entries") or [] if e.get("id")]


def listar(url: str, n: int, rotulo: str) -> list[dict]:
    d = ytdlp(["--flat-playlist", "--playlist-end", str(n), url]) or {}
    return [dict(e, _termo=rotulo) for e in d.get("entries") or [] if e.get("id")]


def detalhar(vid: str) -> dict | None:
    try:
        return ytdlp(["--skip-download", f"https://www.youtube.com/watch?v={vid}"], timeout=90)
    except subprocess.TimeoutExpired:
        return None


def rostos(vid: str) -> int | None:
    """Quantos dos 3 quadros (25/50/75%) têm rosto real grande. None = sem OpenCV ou sem quadros."""
    try:
        import cv2
        import numpy as np
        import urllib.request
    except ImportError:
        return None
    modelo = RAIZ / "ferramentas" / "modelos" / "face_detection_yunet_2023mar.onnx"  # YuNet oficial do opencv_zoo
    if not modelo.exists():
        return None
    n = ok = 0
    for i in (1, 2, 3):
        try:
            raw = urllib.request.urlopen(f"https://i.ytimg.com/vi/{vid}/hq{i}.jpg", timeout=15).read()
        except Exception:
            continue
        img = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
        if img is None:
            continue
        ok += 1
        h, w = img.shape[:2]
        det = cv2.FaceDetectorYN.create(str(modelo), "", (w, h), 0.8)
        _, fs = det.detect(img)
        # miniatura vertical vem com tarja preta dos lados: rosto conta se tiver >= 10% da altura
        n += fs is not None and any(f[3] >= h * .10 for f in fs)
    return n if ok else None


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("nicho")
    ap.add_argument("--janela", choices=list(SP))
    ap.add_argument("--top", type=int, default=15)
    ap.add_argument("--mosaico", type=int, default=0, help="grava mosaico dos N melhores para veto visual")
    a = ap.parse_args()
    cfg_p = RAIZ / "nichos" / f"{a.nicho}.json"
    if not cfg_p.exists():
        sys.exit(f"sem {cfg_p}; copie nichos/_modelo.json")
    cfg = json.loads(cfg_p.read_text(encoding="utf-8"))
    janela = a.janela or cfg.get("janela", "semana")
    excl_c = {c.strip().lower() for c in cfg.get("excluir_canais", [])}
    excl_t = [t.lower() for t in cfg.get("excluir_titulo", [])]
    dmax, vmin = cfg.get("duracao_max_s", 90), cfg.get("min_views", 0)

    # 1) busca rasa em paralelo (4 de cada vez: PC fraco)
    n = cfg.get("por_termo", 25)
    fontes = [lambda t=t: buscar(t, janela, n) for t in cfg.get("termos", [])]
    # Shorts de verdade vêm das páginas de hashtag e da aba Shorts dos canais (a busca quase não traz Shorts)
    fontes += [lambda h=h: listar(f"https://www.youtube.com/hashtag/{h.lstrip('#').lower()}/shorts", n, "#" + h.lstrip('#')) for h in cfg.get("hashtags", [])]
    fontes += [lambda c=c: listar(c.rstrip("/") + "/shorts", n, "canal:" + c.rstrip("/").split("/")[-1]) for c in cfg.get("canais", [])]
    with ThreadPoolExecutor(4) as ex:
        listas = list(ex.map(lambda f: f(), fontes))
    vistos: dict[str, dict] = {}
    for lst in listas:
        for e in lst:
            vistos.setdefault(e["id"], e)
    brutos = len(vistos)
    # 2) pré-filtro barato (dados da busca)
    pre = [e for e in vistos.values()
           if (e.get("channel") or "").strip().lower() not in excl_c
           and not any(t in (e.get("title") or "").lower() for t in excl_t)
           # short na busca vem sem views/duração: decide depois do detalhe
           and (e.get("view_count") is None or e["view_count"] >= vmin)
           and (e.get("duration") is None or e["duration"] <= max(dmax, 240))]
    pre.sort(key=lambda e: e.get("view_count") or 0, reverse=True)
    pre = pre[: cfg.get("max_detalhar", 60)]
    # 3) detalhe (data, likes, inscritos). Cuidado com o anti-robô do YouTube: cada vídeo é 1 requisição cheia.
    #    Pula o que já foi detalhado hoje (reaproveita a planilha) e usa só 2 em paralelo com pausa.
    csv_p = RAIZ / "projetos" / "referencias.csv"
    hoje_s = dt.date.today().isoformat()
    ja = {}
    if csv_p.exists():
        with csv_p.open(encoding="utf-8") as f:
            ja = {r["id"]: r for r in csv.DictReader(f) if r.get("visto_em") == hoje_s}
    novos = [e for e in pre if e["id"] not in ja]
    print(f"detalhe: {len(pre) - len(novos)} reaproveitados de hoje, {len(novos)} novos", file=sys.stderr)

    def detalhar_calmo(e: dict):
        time.sleep(1.5)
        return e, detalhar(e["id"])
    with ThreadPoolExecutor(2) as ex:
        dets = list(ex.map(detalhar_calmo, novos))
    if novos and sum(1 for _, d in dets if d) == 0:
        sys.exit("YouTube bloqueou (anti-robô). Esperar 30-60 min antes de rodar de novo; não insistir.")

    # 3b) rosto real (só nos que passaram nos filtros baratos; 3 miniaturas cada)
    filtra_rosto = not cfg.get("permitir_rosto", False)
    if filtra_rosto:
        with ThreadPoolExecutor(4) as ex:
            n_rosto = dict(ex.map(lambda ed: (ed[0]["id"], rostos(ed[0]["id"])), [ed for ed in dets if ed[1]]))
        if all(v is None for v in n_rosto.values()):
            print("AVISO: filtro de rosto desligado (sem OpenCV). Rode com ferramentas/rea-video/.venv/bin/python", file=sys.stderr)
    else:
        n_rosto = {}

    hoje = dt.date.today()
    linhas = []
    for e, d in dets:
        if not d:
            continue
        up = d.get("upload_date")
        data = dt.datetime.strptime(up, "%Y%m%d").date() if up else None
        dias = max(1, (hoje - data).days) if data else None
        views = d.get("view_count") or 0
        segs = d.get("channel_follower_count") or 0
        dur = d.get("duration") or 0
        vdia = views / dias if dias else 0
        surto = views / segs if segs else 0
        eng = 100 * ((d.get("like_count") or 0) + (d.get("comment_count") or 0)) / views if views else 0
        vertical = (d.get("height") or 0) > (d.get("width") or 0)
        formato = "short" if (vertical or "/shorts/" in (d.get("webpage_url") or "")) and dur <= 180 else "longo" if dur > 180 else "horizontal"
        motivos = []
        if cfg.get("max_dias") and dias and dias > cfg["max_dias"]:
            motivos.append(f"{dias} dias > {cfg['max_dias']}")
        if views < vmin:
            motivos.append(f"{views} views < {vmin}")
        if dur > dmax:
            motivos.append(f"dura {dur}s > {dmax}s")
        if formato == "horizontal":
            motivos.append("horizontal")
        if d.get("live_status") not in (None, "not_live", "was_live"):
            motivos.append("ao vivo")
        nr = n_rosto.get(e["id"])
        linhas.append({
            "id": d["id"], "nicho": cfg["nome"], "plataforma": "youtube",
            "link": f"https://www.youtube.com/shorts/{d['id']}" if formato == "short" else d.get("webpage_url"),
            "titulo": (d.get("title") or "").replace("\n", " "), "canal": d.get("channel"), "inscritos": segs,
            "data": data.isoformat() if data else "", "dias": dias, "duracao_s": dur, "formato": formato,
            "idioma": d.get("language") or "", "views": views, "views_dia": round(vdia),
            "surto": round(surto, 2), "engaj_%": round(eng, 2),
            "nota": round(math.log10(vdia + 1) * (1 + min(surto, 5)), 2),
            "termo": e["_termo"], "rosto": "" if nr is None else f"{nr}/3", "candidato": "sim" if not motivos else "não", "motivo": "; ".join(motivos),
            "visto_em": hoje.isoformat(),
        })

    # reaproveitados de hoje entram como estão na planilha (números convertidos para ordenar)
    for e in pre:
        r = ja.get(e["id"])
        if r and (r.get("canal") or "").strip().lower() not in excl_c:
            linhas.append(dict(r, nota=float(r.get("nota") or 0), views=int(float(r.get("views") or 0)),
                               views_dia=int(float(r.get("views_dia") or 0)), surto=float(r.get("surto") or 0),
                               duracao_s=int(float(r.get("duracao_s") or 0)), rosto=r.get("rosto", "")))

    # 4) planilha acumulativa
    csv_p.parent.mkdir(exist_ok=True)
    antigos: dict[str, dict] = {}
    if csv_p.exists():
        with csv_p.open(encoding="utf-8") as f:
            antigos = {r["id"]: r for r in csv.DictReader(f)}
    for l in linhas:
        if l["id"] in antigos:  # mantém anotações manuais, atualiza números
            antigos[l["id"]].update({k: l[k] for k in ("views", "views_dia", "surto", "engaj_%", "nota", "dias", "visto_em", "rosto", "candidato", "motivo")})
        else:
            antigos[l["id"]] = l
    todos = sorted(antigos.values(), key=lambda r: float(r.get("nota") or 0), reverse=True)
    with csv_p.open("w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=CAMPOS, extrasaction="ignore")
        w.writeheader()
        w.writerows(todos)

    cands = sorted([l for l in linhas if l["candidato"] == "sim"], key=lambda l: l["nota"], reverse=True)
    print(f"nicho {cfg['nome']} | janela {janela} | {brutos} achados -> {len(pre)} detalhados -> {len(linhas)} ok -> {len(cands)} candidatos")
    print(f"planilha: {csv_p} ({len(todos)} linhas)")
    print(f"  # {'nota':>5} {'views':>9} {'v/dia':>8} {'surto':>6} {'rosto':>5} {'dur':>4}  canal | título")
    for i, l in enumerate(cands[: a.top], 1):
        print(f"{i:>3} {l['nota']:>5} {l['views']:>9} {l['views_dia']:>8} {l['surto']:>6} {l['rosto']:>5} {l['duracao_s']:>4}  "
              f"{(l['canal'] or '')[:22]} | {l['titulo'][:60]}  {l['link']}")
    if a.mosaico:
        mosaico(cands[: a.mosaico], RAIZ / "projetos" / f"_mosaico-{cfg['nome']}.jpg")


def mosaico(cands: list[dict], saida: Path) -> None:
    import cv2
    import numpy as np
    import urllib.request
    linhas = []
    for i, l in enumerate(cands, 1):
        qs = []
        urls = l.get("_thumbs") or [f"https://i.ytimg.com/vi/{l['id']}/hq{q}.jpg" for q in (1, 2, 3)]
        for u in (urls * 3)[:3]:
            try:
                raw = urllib.request.urlopen(u, timeout=15).read()
                img = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
            except Exception:
                img = None
            if img is not None and img.shape[1] == 480 and img.shape[0] == 360:  # miniatura YouTube: corta a tarja
                img = img[:, 120:360]
            img = np.zeros((160, 90, 3), np.uint8) if img is None else cv2.resize(img, (90, 160))
            qs.append(img)
        row = np.hstack(qs)
        cv2.putText(row, str(i), (4, 26), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 255), 2)
        linhas.append(row)
    if not linhas:
        return
    col = 5
    while len(linhas) % col:
        linhas.append(np.zeros_like(linhas[0]))
    grade = np.vstack([np.hstack(linhas[k:k + col]) for k in range(0, len(linhas), col)])
    cv2.imwrite(str(saida), grade)
    print(f"mosaico: {saida}")


if __name__ == "__main__":
    main()
