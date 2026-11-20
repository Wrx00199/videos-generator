"""Importa a coleta de TikTok/Instagram (feita no navegador logado) para projetos/referencias.csv.

Fluxo atual:
  1. node ferramentas/coletar_social.mjs --nicho gta6
  2. ferramentas/rea-video/.venv/bin/python -I ferramentas/importar_social.py gta6 --manifesto <manifesto impresso>
Arquivos legados podem ser passados explicitamente, sem --manifesto.

Linha da coleta: [id, @, seguidores, views, likes, coments, shares, salvos, criado_unix, dur_s, legenda]
Instagram às vezes não dá views (só likes): aí views = likes * 20 (estimativa marcada no motivo).
Miniatura: oEmbed público (1 requisição por vídeo, só dos que passaram no filtro) -> rosto (YuNet) + mosaico.
"""
from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
import math
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pesquisar as P  # noqa: E402  (CAMPOS, RAIZ, mosaico, modelo YuNet)

UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36"}


def link(rede: str, uid: str, autor: str) -> str:
    if rede == "tiktok":
        return f"https://www.tiktok.com/@{autor}/video/{uid}"
    return f"https://www.instagram.com/reel/{uid}/"


def miniatura(rede: str, url: str) -> str | None:
    if rede != "tiktok":
        return None  # Instagram: o coletor já manda a URL da capa no campo 11, se houver
    try:
        q = "https://www.tiktok.com/oembed?" + urllib.parse.urlencode({"url": url})
        with urllib.request.urlopen(urllib.request.Request(q, headers=UA), timeout=15) as r:
            return json.load(r).get("thumbnail_url")
    except Exception:
        return None


def tem_rosto(url: str | None) -> bool | None:
    if not url:
        return None
    import cv2
    import numpy as np
    modelo = P.RAIZ / "ferramentas" / "modelos" / "face_detection_yunet_2023mar.onnx"
    try:
        raw = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=15).read()
    except Exception:
        return None
    img = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        return None
    h, w = img.shape[:2]
    _, fs = cv2.FaceDetectorYN.create(str(modelo), "", (w, h), 0.8).detect(img)
    return fs is not None and any(f[3] >= h * .08 for f in fs)


def carregar_coletas(coletas: list[str], manifesto: str | None = None) -> list[dict]:
    """Manifesto delimita a execução; arquivos legados só entram quando explícitos."""
    fontes = [(Path(p), None, None) for p in coletas]
    if manifesto:
        if coletas:
            raise ValueError("use --manifesto ou arquivos explícitos, sem misturar")
        mp = Path(manifesto).resolve()
        m = json.loads(mp.read_text(encoding="utf-8"))
        if not m.get("execucao") or not isinstance(m.get("arquivos"), list):
            raise ValueError("manifesto inválido")
        fontes = []
        for item in m["arquivos"]:
            p = Path(item["arquivo"])
            if not p.is_absolute():
                p = mp.parent / p
            fontes.append((p, m["execucao"], item["status"]))
    saida = []
    for p, execucao, status in fontes:
        c = json.loads(p.read_text(encoding="utf-8"))
        if isinstance(c, str):
            c = json.loads(c)  # formato legado explicitamente solicitado
        if not isinstance(c, dict):
            raise ValueError(f"coleta inválida: {p}")
        if execucao and (c.get("execucao") != execucao or c.get("status") != status):
            raise ValueError(f"coleta não pertence à execução/status do manifesto: {p}")
        estado = c.get("status")
        if estado in ("bloqueado", "erro") or c.get("bloq") or c.get("erro"):
            print(f"Coleta recusada ({estado or 'bloqueio/erro'}): {p}")
            continue
        if estado not in (None, "ok", "vazio"):
            raise ValueError(f"status desconhecido: {estado}")
        if c.get("plataforma") not in ("tiktok", "instagram") or not isinstance(c.get("linhas"), list):
            raise ValueError(f"plataforma/linhas inválidas: {p}")
        if estado == "vazio" and c["linhas"]:
            raise ValueError(f"coleta vazia contém linhas: {p}")
        for linha in c["linhas"]:
            if not isinstance(linha, list) or len(linha) < 11:
                raise ValueError(f"linha inválida: {p}")
        saida.append(c)
    return saida


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("nicho")
    ap.add_argument("coletas", nargs="*")
    ap.add_argument("--manifesto", help="importa somente arquivos desta execução")
    ap.add_argument("--mosaico", type=int, default=0)
    ap.add_argument("--top", type=int, default=20)
    a = ap.parse_args()
    if not a.coletas and not a.manifesto:
        ap.error("informe arquivos explícitos ou --manifesto")
    if a.top < 0 or a.mosaico < 0:
        ap.error("--top e --mosaico devem ser positivos ou zero")
    coletas = carregar_coletas(a.coletas, a.manifesto)
    cfg = json.loads((P.RAIZ / "nichos" / f"{a.nicho}.json").read_text(encoding="utf-8"))
    excl = {c.strip().lower() for c in cfg.get("excluir_canais", [])}
    excl_t = [t.lower() for t in cfg.get("excluir_titulo", [])]
    hoje = dt.date.today()
    novas: dict[str, dict] = {}
    for c in coletas:
        rede = c["plataforma"]
        for l in c["linhas"]:
            uid, autor, segs, views, likes, coms, shares, salvos, criado, dur, leg = l[:11]
            if (autor or "").strip().lower() in excl or any(t in (leg or "").lower() for t in excl_t):
                continue
            motivos = []
            if not views:
                views = likes * 20
                motivos.append("views estimadas (likes x20)")
            data = dt.datetime.fromtimestamp(criado).date()
            dias = max(1, (hoje - data).days)
            vdia, surto = views / dias, (views / segs if segs else 0)
            novas[uid] = {
                "id": uid, "nicho": cfg["nome"], "plataforma": rede, "link": link(rede, uid, autor),
                "titulo": (leg or "").encode("utf-16", "surrogatepass").decode("utf-16", "replace").replace("\n", " "), "canal": autor, "inscritos": segs, "data": data.isoformat(),
                "dias": dias, "duracao_s": dur, "formato": "short", "idioma": "", "views": views,
                "views_dia": round(vdia), "surto": round(surto, 2),
                "engaj_%": round(100 * (likes + coms + shares + salvos) / views, 2) if views else 0,
                "nota": round(math.log10(vdia + 1) * (1 + min(surto, 5)), 2), "termo": f"{rede}:{c.get('termo', '')}",
                "candidato": "sim", "motivo": "; ".join(motivos), "rosto": "", "visto_em": hoje.isoformat(),
                "_capa": l[11] if len(l) > 11 else None,
            }
    cands = sorted(novas.values(), key=lambda r: r["nota"], reverse=True)
    if not cands:
        print("Nenhum vídeo válido nesta execução; referencias.csv preservado.")
        return
    # rosto + miniatura só para o topo (poucas requisições, com pausa)
    for r in cands[: max(a.top, a.mosaico)]:
        r["_capa"] = r["_capa"] or miniatura(r["plataforma"], r["link"])
        f = tem_rosto(r["_capa"])
        r["rosto"] = "" if f is None else ("1/1" if f else "0/1")
        r["_thumbs"] = [r["_capa"]] if r["_capa"] else None
        time.sleep(0.5)

    csv_p = P.RAIZ / "projetos" / "referencias.csv"
    antigos: dict[str, dict] = {}
    if csv_p.exists():
        with csv_p.open(encoding="utf-8") as f:
            antigos = {r["id"]: r for r in csv.DictReader(f)}
    for r in cands:
        if r["id"] in antigos:
            antigos[r["id"]].update({k: r[k] for k in ("views", "views_dia", "surto", "engaj_%", "nota", "dias", "visto_em", "rosto")})
        else:
            antigos[r["id"]] = r
    todos = sorted(antigos.values(), key=lambda r: float(r.get("nota") or 0), reverse=True)
    # grava em arquivo temporário e troca no fim: erro no meio não trunca a planilha
    tmp = csv_p.with_suffix(".csv.tmp")
    with tmp.open("w", encoding="utf-8", errors="replace", newline="") as f:
        w = csv.DictWriter(f, fieldnames=P.CAMPOS, extrasaction="ignore")
        w.writeheader()
        w.writerows(todos)
    tmp.replace(csv_p)
    print(f"{len(cands)} vídeos importados de {len(coletas)} coletas | planilha {len(todos)} linhas")
    print(f"  # {'nota':>5} {'views':>9} {'v/dia':>8} {'surto':>6} {'rosto':>5} {'dur':>4}  rede  @ | legenda")
    for i, r in enumerate(cands[: a.top], 1):
        print(f"{i:>3} {r['nota']:>5} {r['views']:>9} {r['views_dia']:>8} {r['surto']:>6} {r['rosto']:>5} {r['duracao_s']:>4}  "
              f"{r['plataforma'][:2]} @{r['canal'][:20]} | {r['titulo'][:45]}  {r['link']}")
    if a.mosaico:
        P.mosaico(cands[: a.mosaico], P.RAIZ / "projetos" / f"_mosaico-{cfg['nome']}-social.jpg")


if __name__ == "__main__":
    main()
