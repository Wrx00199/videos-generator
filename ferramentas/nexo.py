#!/usr/bin/env python3
"""Orquestrador Nexo — estúdio multi-canal e multi-estilo ponta a ponta.

Comandos:
  nexo.py estilos
  nexo.py outliers [--nicho gta6] [--limit 50]
  nexo.py cacar <nicho> [--janela semana] [--top 15]
  nexo.py produzir --estilo <id> --vars '<json>' [--texto '<fala>'] [--voz Fenrir] [--canal <id>] [--resolucao 720p] [--qualidade draft] [--job-id <id>]
  nexo.py lote --estilo <id> --arquivo <lote.json> [--canal <id>] [--job-id <id>]

Regras:
  - 1 render por vez (1 worker, batch-concurrency 1) para proteger CPU/8 GB RAM.
  - Valida contrato e slots ANTES de chamar TTS ou renderizar.
  - Cada execução gera pasta própria em videos/nexo/ (nunca sobrescreve).
  - Nunca imprime segredos/chaves de API.
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import re
import shutil
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ESTILOS_DIR = RAIZ / "estilos"
VIDEOS_ESTILOS = RAIZ / "videos" / "estilos"
VIDEOS_NEXO = RAIZ / "videos" / "nexo"
ESTADO_DIR = RAIZ / "_estado"
JOBS_FILE = ESTADO_DIR / "nexo-jobs.json"
REF_CSV = RAIZ / "projetos" / "referencias.csv"
NICHOS_DIR = RAIZ / "nichos"

ENV = {
    **os.environ,
    "HYPERFRAMES_CACHE_DIR": os.environ.get("HYPERFRAMES_CACHE_DIR", str(Path.home() / ".nexo/cache")),
    "PUPPETEER_CACHE_DIR": os.environ.get("PUPPETEER_CACHE_DIR", str(Path.home() / ".nexo/cache")),
}


def slugify(txt: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9]+", "-", (txt or "video").lower()).strip("-")
    return (s[:36] or "video")


def ler_jobs() -> list[dict]:
    if not JOBS_FILE.is_file():
        return []
    try:
        return json.loads(JOBS_FILE.read_text(encoding="utf-8"))
    except Exception:
        return []


def salvar_job(job: dict) -> None:
    ESTADO_DIR.mkdir(parents=True, exist_ok=True)
    jobs = ler_jobs()
    idx = next((i for i, j in enumerate(jobs) if j.get("id") == job["id"]), None)
    if idx is None:
        jobs.insert(0, job)
    else:
        jobs[idx] = job
    jobs = jobs[:100]
    tmp = JOBS_FILE.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(jobs, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(JOBS_FILE)


def listar_estilos() -> list[dict]:
    out = []
    for st_file in sorted(ESTILOS_DIR.glob("*/style.json")):
        try:
            st = json.loads(st_file.read_text(encoding="utf-8"))
        except Exception:
            continue
        id_ = st.get("id") or st_file.parent.name
        preview = VIDEOS_ESTILOS / f"{id_}.mp4"
        lote_f = st_file.parent / "lote.json"
        lote_rows = []
        if lote_f.is_file():
            try:
                lote_rows = json.loads(lote_f.read_text(encoding="utf-8")).get("rows", [])
            except Exception:
                pass
        out.append({
            "id": id_,
            "nome": st.get("nome", id_),
            "motor": "hyperframes",
            "descricao": st.get("descricao", ""),
            "formato": st.get("formato", {}),
            "slots": st.get("slots", []),
            "variables": st.get("variables", []),
            "tem_preview": preview.is_file(),
            "preview_rel": f"videos/estilos/{id_}.mp4" if preview.is_file() else None,
            "lote_exemplo": lote_rows,
        })
    out.append({
        "id": "tiao_3d",
        "nome": "Tião 3D (Motor3D)",
        "motor": "motor3d",
        "descricao": "Série 3D estilizada do Tião (Three.js Toon + kit de 40 personagens e 28 cenários).",
        "formato": {"largura": 1080, "altura": 1920, "duracao": 55, "fps": 30},
        "slots": [],
        "variables": [],
        "tem_preview": (RAIZ / "videos" / "ep46" / "ep46-720p.mp4").is_file(),
        "preview_rel": "videos/ep46/ep46-720p.mp4" if (RAIZ / "videos" / "ep46" / "ep46-720p.mp4").is_file() else None,
        "lote_exemplo": [],
    })
    return out


def listar_outliers(nicho: str | None = None, limit: int = 50) -> dict:
    nichos = sorted(
        p.stem for p in NICHOS_DIR.glob("*.json") if not p.stem.startswith("_")
    )
    itens = []
    if REF_CSV.is_file():
        with REF_CSV.open("r", encoding="utf-8", errors="replace", newline="") as f:
            for row in csv.DictReader(f):
                if nicho and row.get("nicho") != nicho:
                    continue
                try:
                    nota = float(row.get("nota") or 0)
                except ValueError:
                    nota = 0.0
                row["_nota"] = nota
                itens.append(row)
    itens.sort(key=lambda r: r["_nota"], reverse=True)
    for r in itens:
        r.pop("_nota", None)
    return {"nichos": nichos, "total": len(itens), "itens": itens[:limit]}


def validar_vars(estilo_id: str, vars_in: dict) -> tuple[Path, dict, dict, list[str]]:
    d = ESTILOS_DIR / estilo_id
    st_file = d / "style.json"
    if not st_file.is_file():
        return d, {}, {}, [f"Estilo '{estilo_id}' não encontrado"]
    st = json.loads(st_file.read_text(encoding="utf-8"))
    erros = []
    merged = {}
    for v in st.get("variables", []):
        vid = v["id"]
        val = vars_in.get(vid, v.get("default", ""))
        if val is None:
            val = v.get("default", "")
        val = str(val).strip()
        if v.get("type") == "color" and not re.match(r"^#[0-9a-fA-F]{6}$", val):
            erros.append(f"Cor inválida em '{vid}': use formato #RRGGBB")
        merged[vid] = val
    for s in st.get("slots", []):
        vid = s["variavel"]
        val = merged.get(vid, "")
        if s.get("obrigatorio") and not val:
            erros.append(f"Campo obrigatório vazio: {vid}")
        if len(val) > s.get("max_chars", 999):
            erros.append(f"Campo '{vid}' passou do limite ({len(val)}/{s['max_chars']} caracteres)")
    return d, st, merged, erros


def ffprobe_duracao(arquivo: Path) -> float:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(arquivo)],
        capture_output=True, text=True,
    )
    try:
        return round(float(r.stdout.strip()), 2)
    except Exception:
        return 0.0


def cmd_produzir(args) -> int:
    t0 = time.monotonic()
    job_id = args.job_id or f"nexo-{int(time.time())}-{slugify(args.estilo)}"
    try:
        vars_in = json.loads(args.vars) if args.vars else {}
    except json.JSONDecodeError as e:
        print(json.dumps({"ok": False, "erro": f"JSON inválido em --vars: {e}"}, ensure_ascii=False))
        return 2

    job = {
        "id": job_id,
        "tipo": "video",
        "estilo": args.estilo,
        "canal": args.canal or "nexo",
        "status": "validando",
        "etapa": "Validando variáveis e estilo",
        "criado_em": datetime.now().isoformat(timespec="seconds"),
        "atualizado_em": datetime.now().isoformat(timespec="seconds"),
        "vars": vars_in,
        "tem_voz": bool(args.texto and args.texto.strip()),
        "tempos_s": {},
        "arquivo": None,
        "erro": None,
    }
    salvar_job(job)

    d, st, merged, erros = validar_vars(args.estilo, vars_in)
    if erros:
        job["status"] = "erro"
        job["erro"] = "; ".join(erros)
        job["atualizado_em"] = datetime.now().isoformat(timespec="seconds")
        salvar_job(job)
        print(json.dumps({"ok": False, "job_id": job_id, "erro": job["erro"]}, ensure_ascii=False))
        return 1

    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    nome_slug = slugify(merged.get("name") or merged.get("headline") or args.estilo)
    out_dir = VIDEOS_NEXO / f"{ts}-{args.estilo}-{nome_slug}"
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "vars.json").write_text(json.dumps(merged, ensure_ascii=False, indent=2), encoding="utf-8")

    # 1) Voz opcional via Gemini TTS
    voz_mp3 = None
    if args.texto and args.texto.strip():
        job["status"] = "voz"
        job["etapa"] = "Gerando narração (Gemini TTS)"
        job["atualizado_em"] = datetime.now().isoformat(timespec="seconds")
        salvar_job(job)
        t_voz = time.monotonic()
        voz_mp3 = out_dir / "voz.mp3"
        r_voz = subprocess.run(
            ["node", str(RAIZ / "ferramentas" / "voz.mjs"), "--texto", args.texto.strip(), "--saida", str(voz_mp3), "--voz", args.voz],
            cwd=RAIZ, capture_output=True, text=True,
        )
        job["tempos_s"]["voz"] = round(time.monotonic() - t_voz, 2)
        if r_voz.returncode != 0 or not voz_mp3.is_file():
            msg = (r_voz.stderr or r_voz.stdout or "Falha no Gemini TTS").strip()[-300:]
            job["status"] = "erro"
            job["erro"] = f"TTS falhou (exit {r_voz.returncode}): {msg}"
            job["atualizado_em"] = datetime.now().isoformat(timespec="seconds")
            salvar_job(job)
            print(json.dumps({"ok": False, "job_id": job_id, "erro": job["erro"]}, ensure_ascii=False))
            return 1

    # 2) Render HyperFrames (1 worker, cache ~/.nexo/cache)
    job["status"] = "renderizando"
    job["etapa"] = f"Renderizando {args.estilo} ({args.resolucao}, 24fps, 1 worker)"
    job["atualizado_em"] = datetime.now().isoformat(timespec="seconds")
    salvar_job(job)
    t_ren = time.monotonic()
    bruto_mp4 = out_dir / ("bruto.mp4" if voz_mp3 else "final.mp4")
    r_hf = subprocess.run(
        [
            "npx", "hyperframes", "render", ".",
            "-o", str(bruto_mp4.resolve()),
            "--resolution", args.resolucao,
            "--fps", "24",
            "-q", args.qualidade,
            "-w", "1",
            "--frames-cache-dir", "off",
            "--strict-variables",
            "--quiet",
            "--variables", json.dumps(merged, ensure_ascii=False),
        ],
        cwd=d, env=ENV, capture_output=True, text=True,
    )
    job["tempos_s"]["render"] = round(time.monotonic() - t_ren, 2)
    if r_hf.returncode != 0 or not bruto_mp4.is_file():
        msg = (r_hf.stderr or r_hf.stdout or "Falha no HyperFrames").strip()[-400:]
        job["status"] = "erro"
        job["erro"] = f"Render falhou (exit {r_hf.returncode}): {msg}"
        job["atualizado_em"] = datetime.now().isoformat(timespec="seconds")
        salvar_job(job)
        print(json.dumps({"ok": False, "job_id": job_id, "erro": job["erro"]}, ensure_ascii=False))
        return 1

    final_mp4 = out_dir / "final.mp4"

    # 3) Mix de áudio com FFmpeg se houver voz
    if voz_mp3:
        job["status"] = "mixando"
        job["etapa"] = "Mixando narração no MP4 (FFmpeg)"
        job["atualizado_em"] = datetime.now().isoformat(timespec="seconds")
        salvar_job(job)
        t_mix = time.monotonic()
        dur_v = ffprobe_duracao(bruto_mp4)
        dur_a = ffprobe_duracao(voz_mp3)
        dur_alvo = max(dur_v, dur_a)
        vf = f"tpad=stop_mode=clone:stop_duration={max(0.0, dur_alvo - dur_v):.2f}" if dur_a > dur_v + 0.05 else "null"
        r_ff = subprocess.run(
            [
                "ffmpeg", "-y", "-loglevel", "error",
                "-i", str(bruto_mp4),
                "-i", str(voz_mp3),
                "-vf", vf,
                "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p",
                "-c:a", "aac", "-b:a", "192k",
                "-t", f"{dur_alvo:.2f}",
                "-movflags", "+faststart",
                str(final_mp4),
            ],
            capture_output=True, text=True,
        )
        job["tempos_s"]["mix"] = round(time.monotonic() - t_mix, 2)
        if r_ff.returncode != 0 or not final_mp4.is_file():
            job["status"] = "erro"
            job["erro"] = f"Mix FFmpeg falhou: {(r_ff.stderr or '')[-300:]}"
            job["atualizado_em"] = datetime.now().isoformat(timespec="seconds")
            salvar_job(job)
            print(json.dumps({"ok": False, "job_id": job_id, "erro": job["erro"]}, ensure_ascii=False))
            return 1

    if args.saida:
        destino = Path(args.saida)
        destino.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(final_mp4, destino)
        final_mp4 = destino

    dur_final = ffprobe_duracao(final_mp4)
    job["tempos_s"]["total"] = round(time.monotonic() - t0, 2)
    job["status"] = "concluido"
    job["etapa"] = "Pronto"
    job["duracao_s"] = dur_final
    try:
        job["arquivo"] = str(final_mp4.resolve().relative_to(RAIZ.resolve()))
    except ValueError:
        job["arquivo"] = str(final_mp4.resolve())
    job["atualizado_em"] = datetime.now().isoformat(timespec="seconds")
    salvar_job(job)

    print(json.dumps({
        "ok": True,
        "job_id": job_id,
        "arquivo": job["arquivo"],
        "duracao_s": dur_final,
        "tempos_s": job["tempos_s"],
        "estilo": args.estilo,
        "canal": job["canal"],
    }, ensure_ascii=False))
    return 0


def cmd_lote(args) -> int:
    t0 = time.monotonic()
    job_id = args.job_id or f"nexo-lote-{int(time.time())}-{slugify(args.estilo)}"
    arq = Path(args.arquivo)
    if not arq.is_file():
        print(json.dumps({"ok": False, "erro": f"Arquivo de lote não existe: {arq}"}, ensure_ascii=False))
        return 2
    dados = json.loads(arq.read_text(encoding="utf-8"))
    rows = dados.get("rows", [])
    if not rows:
        print(json.dumps({"ok": False, "erro": "lote.json sem rows"}, ensure_ascii=False))
        return 2

    job = {
        "id": job_id,
        "tipo": "lote",
        "estilo": args.estilo,
        "canal": args.canal or "nexo",
        "status": "validando",
        "etapa": f"Validando lote ({len(rows)} vídeos)",
        "criado_em": datetime.now().isoformat(timespec="seconds"),
        "atualizado_em": datetime.now().isoformat(timespec="seconds"),
        "total_lote": len(rows),
        "arquivos": [],
        "tempos_s": {},
        "erro": None,
    }
    salvar_job(job)

    valid_rows = []
    for i, row in enumerate(rows):
        d, _, merged, erros = validar_vars(args.estilo, row)
        if erros:
            job["status"] = "erro"
            job["erro"] = f"Linha {i+1} ({row.get('name', '?')}): " + "; ".join(erros)
            job["atualizado_em"] = datetime.now().isoformat(timespec="seconds")
            salvar_job(job)
            print(json.dumps({"ok": False, "job_id": job_id, "erro": job["erro"]}, ensure_ascii=False))
            return 1
        valid_rows.append(merged)

    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    out_dir = VIDEOS_NEXO / f"{ts}-lote-{args.estilo}"
    out_dir.mkdir(parents=True, exist_ok=True)
    lote_limpo = out_dir / "lote.json"
    lote_limpo.write_text(json.dumps({"rows": valid_rows}, ensure_ascii=False, indent=2), encoding="utf-8")

    job["status"] = "renderizando"
    job["etapa"] = f"Renderizando lote de {len(valid_rows)} vídeos (1 por vez)"
    job["atualizado_em"] = datetime.now().isoformat(timespec="seconds")
    salvar_job(job)

    r_hf = subprocess.run(
        [
            "npx", "hyperframes", "render", ".",
            "--batch", str(lote_limpo.resolve()),
            "--output", str((out_dir / "{name}.mp4").resolve()),
            "--batch-concurrency", "1",
            "--resolution", args.resolucao,
            "--fps", "24",
            "-q", args.qualidade,
            "-w", "1",
            "--frames-cache-dir", "off",
            "--strict-variables",
            "--quiet",
        ],
        cwd=d, env=ENV, capture_output=True, text=True,
    )
    job["tempos_s"]["total"] = round(time.monotonic() - t0, 2)
    if r_hf.returncode != 0:
        job["status"] = "erro"
        job["erro"] = f"Lote falhou (exit {r_hf.returncode}): {(r_hf.stderr or r_hf.stdout)[-400:]}"
        job["atualizado_em"] = datetime.now().isoformat(timespec="seconds")
        salvar_job(job)
        print(json.dumps({"ok": False, "job_id": job_id, "erro": job["erro"]}, ensure_ascii=False))
        return 1

    arqs = [str(p.resolve().relative_to(RAIZ.resolve())) for p in sorted(out_dir.glob("*.mp4"))]
    job["status"] = "concluido"
    job["etapa"] = f"Lote pronto ({len(arqs)} vídeos)"
    job["arquivos"] = arqs
    job["arquivo"] = arqs[0] if arqs else None
    job["atualizado_em"] = datetime.now().isoformat(timespec="seconds")
    salvar_job(job)
    print(json.dumps({"ok": True, "job_id": job_id, "arquivos": arqs, "tempos_s": job["tempos_s"]}, ensure_ascii=False))
    return 0


def cmd_cacar(args) -> int:
    nicho_f = NICHOS_DIR / f"{args.nicho}.json"
    if not nicho_f.is_file():
        print(json.dumps({"ok": False, "erro": f"Nicho '{args.nicho}' não encontrado em nichos/"}, ensure_ascii=False))
        return 2
    r = subprocess.run(
        [sys.executable, str(RAIZ / "ferramentas" / "pesquisar.py"), args.nicho, "--janela", args.janela, "--top", str(args.top)],
        cwd=RAIZ, capture_output=True, text=True,
    )
    if r.returncode != 0:
        print(json.dumps({"ok": False, "erro": (r.stderr or r.stdout)[-400:]}, ensure_ascii=False))
        return 1
    out = listar_outliers(args.nicho, args.top)
    print(json.dumps({"ok": True, **out}, ensure_ascii=False))
    return 0


def main() -> int:
    p = argparse.ArgumentParser(description="Orquestrador Nexo")
    sub = p.add_subparsers(dest="cmd", required=True)

    sub.add_parser("estilos")

    po = sub.add_parser("outliers")
    po.add_argument("--nicho", default=None)
    po.add_argument("--limit", type=int, default=50)

    pc = sub.add_parser("cacar")
    pc.add_argument("nicho")
    pc.add_argument("--janela", default="semana")
    pc.add_argument("--top", type=int, default=15)

    pp = sub.add_parser("produzir")
    pp.add_argument("--estilo", required=True)
    pp.add_argument("--vars", default="{}")
    pp.add_argument("--texto", default="")
    pp.add_argument("--voz", default="Fenrir")
    pp.add_argument("--canal", default="nexo")
    pp.add_argument("--resolucao", default="720p", choices=["720p", "1080p"])
    pp.add_argument("--qualidade", default="draft", choices=["draft", "standard"])
    pp.add_argument("--saida", default=None)
    pp.add_argument("--job-id", default=None)

    pl = sub.add_parser("lote")
    pl.add_argument("--estilo", required=True)
    pl.add_argument("--arquivo", required=True)
    pl.add_argument("--canal", default="nexo")
    pl.add_argument("--resolucao", default="720p", choices=["720p", "1080p"])
    pl.add_argument("--qualidade", default="draft", choices=["draft", "standard"])
    pl.add_argument("--job-id", default=None)

    args = p.parse_args()
    if args.cmd == "estilos":
        print(json.dumps(listar_estilos(), ensure_ascii=False, indent=2))
        return 0
    if args.cmd == "outliers":
        print(json.dumps(listar_outliers(args.nicho, args.limit), ensure_ascii=False, indent=2))
        return 0
    if args.cmd == "cacar":
        return cmd_cacar(args)
    if args.cmd == "produzir":
        return cmd_produzir(args)
    if args.cmd == "lote":
        return cmd_lote(args)
    return 2


if __name__ == "__main__":
    sys.exit(main())
