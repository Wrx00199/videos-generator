#!/usr/bin/env python3
"""Extração por PROGRAMA de um vídeo de referência (0 token de LLM).

Uso: python3 ferramentas/extrair_ref.py <url-youtube> [--folha 12] [--limiar 0.3] [--manter]
Faz: yt-dlp (metadados + legenda; vídeo 360p), ffmpeg (cortes de plano via scene score + folha de quadros),
     stt.py local (faster-whisper) só se não houver legenda.
Grava referencias/base/<id>.json (beats com tempo, fala e nº de planos) + <id>_folha.jpg e atualiza _indice.json.
O resumo por LLM (haiku) é passo separado e opcional: lê só o JSON e a folha.
"""
import argparse, json, re, shutil, subprocess, sys, tempfile, time
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
BASE = RAIZ / "referencias" / "base"
T = {}

def sh(cmd, **k):
    return subprocess.run(cmd, capture_output=True, text=True, **k)

def tempo(nome):
    class C:
        def __enter__(s): s.t = time.time()
        def __exit__(s, *a): T[nome] = round(time.time() - s.t, 1)
    return C()

def ts(s):  # 00:00:01.500 -> seg
    h, m, x = s.split(":"); return int(h) * 3600 + int(m) * 60 + float(x)

def ler_vtt(p):
    """VTT (auto-legenda do YouTube repete linhas): devolve [{ini,fim,texto}] sem duplicatas."""
    out, ult = [], ""
    for bloco in re.split(r"\n\n+", p.read_text(encoding="utf-8", errors="ignore")):
        m = re.search(r"(\d+:\d+:\d+\.\d+) --> (\d+:\d+:\d+\.\d+)", bloco)
        if not m: continue
        linhas = [re.sub(r"<[^>]+>", "", l).strip() for l in bloco.splitlines()[1:] if "-->" not in l]
        txt = " ".join(l for l in linhas if l).strip()
        if txt and txt != ult:
            out.append({"ini": round(ts(m[1]), 2), "fim": round(ts(m[2]), 2), "texto": txt}); ult = txt
    # auto-legenda: cada cue repete o fim do anterior; remove prefixo repetido
    lim, prev = [], ""
    for c in out:
        t = c["texto"]
        if prev and t.startswith(prev): t = t[len(prev):].strip()
        prev = c["texto"]
        if t: lim.append({**c, "texto": t})
    return lim

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url"); ap.add_argument("--folha", type=int, default=12)
    ap.add_argument("--limiar", type=float, default=0.15); ap.add_argument("--manter", action="store_true")
    a = ap.parse_args()
    t0 = time.time(); BASE.mkdir(parents=True, exist_ok=True)
    tmp = Path(tempfile.mkdtemp(prefix="ref_"))
    try:
        with tempo("metadados"):
            r = sh(["yt-dlp", "--js-runtimes", "node", "--no-playlist", "--dump-json", "--skip-download", a.url])
            if r.returncode: sys.exit("yt-dlp metadados falhou: " + r.stderr[-400:])
            m = json.loads(r.stdout); vid = m["id"]
        with tempo("download"):
            r = sh(["yt-dlp", "--no-playlist", "--js-runtimes", "node", "-f", "bv*[height<=720][vcodec^=avc1]+ba/bv*[height<=720]+ba/b[height<=720]/b", "--merge-output-format", "mkv", "-o", str(tmp / "v.%(ext)s"), a.url])
            vids = [p for p in tmp.glob("v.*") if p.suffix in (".mp4", ".webm", ".mkv")]
            if not vids: sys.exit("download falhou: " + r.stderr[-400:])
            video = vids[0]
            # legenda separada e tolerante (YouTube dá 429 fácil; sem legenda cai no whisper local)
            for lang in ("pt,pt-orig", "en,en-orig"):
                sh(["yt-dlp", "--js-runtimes", "node", "--no-playlist", "--skip-download", "--write-subs", "--write-auto-subs",
                    "--sub-langs", lang, "--sub-format", "vtt", "-o", str(tmp / "v.%(ext)s"), a.url])
                if list(tmp.glob("v.*.vtt")): break
                time.sleep(6)  # 429: espera antes da próxima tentativa
        dur = float(sh(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(video)]).stdout)
        with tempo("cortes"):
            e = sh(["ffmpeg", "-hide_banner", "-i", str(video), "-an", "-vf", f"select='gt(scene,{a.limiar})',showinfo", "-f", "null", "-"]).stderr
            cortes = [round(float(x), 2) for x in re.findall(r"pts_time:([\d.]+)", e)]
        with tempo("folha"):
            n = a.folha; cols = 4; rows = -(-n // cols)
            fj = BASE / f"{vid}_folha.jpg"
            sh(["ffmpeg", "-y", "-hide_banner", "-i", str(video), "-an", "-vf",
                f"fps={n/dur:.5f},scale=180:-1,tile={cols}x{rows}", "-frames:v", "1", "-q:v", "5", str(fj)])
        legendas = sorted(tmp.glob("v.*.vtt")); fonte = "legenda"
        with tempo("fala"):
            if legendas:
                pref = sorted(legendas, key=lambda p: (not p.name.split(".")[-2].startswith("pt"),))[0]
                idioma = pref.name.split(".")[-2]; fala = ler_vtt(pref)
            elif dur > 900:  # whisper em CPU fraca: não transcrever tutorial longo sem legenda
                fonte = "sem_fala"; idioma = None; fala = []
            else:
                fonte = "whisper"
                r = sh([sys.executable, str(RAIZ / "ferramentas" / "stt.py"), str(video), "auto"])
                j = json.loads(r.stdout); idioma = j["idioma"]; fala = j["segmentos"]
        # beats = trechos entre cortes, fundindo planos < 2,5 s no vizinho
        lim = [0.0] + cortes + [round(dur, 2)]
        seg = []
        for i in range(len(lim) - 1):
            ini, fim = lim[i], lim[i + 1]
            if seg and fim - ini < 2.5 and False: pass
            seg.append([ini, fim, 1])
        fund = []
        for s in seg:
            if fund and (fund[-1][1] - fund[-1][0] < 2.5):
                fund[-1][1] = s[1]; fund[-1][2] += 1
            else: fund.append(s[:])
        beats = []
        def add(ini, fim, nplanos, sub):
            txt = " ".join(c["texto"] for c in fala if ini <= (c["ini"] + c["fim"]) / 2 < fim)
            beats.append({"n": len(beats) + 1, "ini": round(ini, 2), "fim": round(fim, 2), "dur": round(fim - ini, 2),
                          "planos": nplanos, "por_fala": sub, "fala": txt})
        for ini, fim, nplanos in fund:
            if fim - ini <= 8:
                add(ini, fim, nplanos, False); continue
            # plano longo (câmera contínua): subdivide por fim de frase/legenda em trechos de ~3-6 s
            cues = [c for c in fala if ini <= (c["ini"] + c["fim"]) / 2 < fim]
            cur = ini
            for c in cues:
                if c["fim"] - cur >= 3 and (re.search(r"[.!?…]$", c["texto"]) or c["fim"] - cur >= 6):
                    add(cur, min(c["fim"], fim), 1, True); cur = c["fim"]
            if fim - cur > 0.5 or cur == ini: add(cur, fim, 1, True)
        palavras = sum(len(c["texto"].split()) for c in fala)
        out = {"id": vid, "url": a.url, "titulo": m.get("title"), "canal": m.get("channel") or m.get("uploader"),
               "views": m.get("view_count"), "data": m.get("upload_date"), "duracao_s": round(dur, 1),
               "idioma_fala": idioma, "fonte_fala": fonte, "n_cortes": len(cortes),
               "cortes_por_min": round(len(cortes) / dur * 60, 1), "palavras_por_s": round(palavras / dur, 2),
               "cortes_s": cortes, "beats": beats, "folha": fj.name,
               "descricao": (m.get("description") or "")[:500], "tempos_s": T}
        (BASE / f"{vid}.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
        idx = BASE / "_indice.json"
        ind = json.loads(idx.read_text()) if idx.exists() else {}
        ind[vid] = {k: out[k] for k in ("titulo", "canal", "views", "duracao_s", "n_cortes", "cortes_por_min", "idioma_fala", "url")}
        idx.write_text(json.dumps(ind, ensure_ascii=False, indent=1))
        if a.manter: shutil.copy(video, BASE / f"{vid}.mp4")
        T["total"] = round(time.time() - t0, 1)
        out["tempos_s"] = T; (BASE / f"{vid}.json").write_text(json.dumps(out, ensure_ascii=False, indent=1))
        print(json.dumps({"id": vid, "dur": out["duracao_s"], "cortes": len(cortes), "beats": len(beats), "fala": fonte, "tempos_s": T}, ensure_ascii=False))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

main()
