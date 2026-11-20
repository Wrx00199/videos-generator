#!/usr/bin/env python3
"""Corta um vídeo OFFLINE (VOD/replay/vídeo gravado) de Twitch, Kick ou YouTube.
Baixa em janelas de N minutos (só o trecho, não o vídeo todo), analisa cada janela com o MESMO analisador do robô ao vivo
(picos com fala PT, nota de relevância, render rápido) e manda os melhores para a fila de revisão do painel.

Uso (python do ambiente do clipper):
  vod.py LINK [--inicio MIN] [--fim MIN] [--janela 10] [--max 1] [--nota-min 45]
Sem --fim: vai até 60 min depois do início (ou o fim do vídeo). Nada é apagado fora da própria pasta de trabalho."""
import argparse
import json
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parents[1]
sys.path.insert(0, str(AQUI))
sys.path.insert(0, str(AQUI / "skill-clips" / "scripts"))
import clipador  # noqa: E402

TRAB = RAIZ / "projetos" / "lives" / "clipper" / "trabalho"
LINK_OK = re.compile(r"^https://((www|m)\.)?(twitch\.tv|kick\.com|youtube\.com|youtu\.be|clips\.twitch\.tv)/", re.I)


def ytdlp():
    pasta = Path(sys.executable).parent
    exe = pasta / ("yt-dlp.exe" if sys.platform == "win32" else "yt-dlp")
    return [str(exe)] if exe.exists() else [sys.executable, "-m", "yt_dlp"]


def log(*a):
    print(time.strftime("%H:%M:%S"), *a, flush=True)


def info(url):
    r = subprocess.run(ytdlp() + ["-J", "--no-playlist", "--no-warnings", url], capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit("não consegui ler o vídeo: " + (r.stderr.strip().splitlines() or ["erro"])[-1][:200])
    return json.loads(r.stdout)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("link")
    ap.add_argument("--inicio", type=float, default=0, help="minuto inicial")
    ap.add_argument("--fim", type=float, default=None, help="minuto final (padrão: início + 60)")
    ap.add_argument("--janela", type=float, default=10, help="minutos por janela")
    ap.add_argument("--max", type=int, default=1, help="clipes por janela")
    ap.add_argument("--nota-min", type=int, default=45)
    ap.add_argument("--sempre-melhor", action="store_true")
    a = ap.parse_args()
    if not LINK_OK.match(a.link):
        raise SystemExit("link não suportado (por enquanto só Twitch, Kick e YouTube)")
    meta = info(a.link)
    if meta.get("live_status") == "is_live":
        raise SystemExit("esse link está AO VIVO: use o modo ao vivo (ao_vivo.py)")
    nome_live = meta.get("uploader") or meta.get("channel") or ""
    dur_min = (meta.get("duration") or 0) / 60
    ini = a.inicio
    fim = a.fim if a.fim is not None else ini + 60
    if dur_min:
        fim = min(fim, dur_min)
    if fim <= ini:
        raise SystemExit("intervalo vazio")
    log(f"{nome_live}: '{(meta.get('title') or '')[:60]}' — analisando de {ini:.0f} a {fim:.0f} min em janelas de {a.janela:.0f} min")
    base = re.sub(r"[^a-z0-9]+", "-", (nome_live or "vod").lower()).strip("-")[:20]
    pasta = TRAB / f"vod-{base}-{int(time.time())}"
    pasta.mkdir(parents=True, exist_ok=True)
    t = ini
    total = 0
    while t < fim - 0.5:
        e = min(t + a.janela, fim)
        prefixo = f"janela_{int(t):04d}"
        log(f"baixando minutos {t:.0f}–{e:.0f}…")
        r = subprocess.run(ytdlp() + ["-f", "b[height<=720]/best[height<=720]/b", "--no-playlist", "--no-warnings", "-q",
                                      "--download-sections", f"*{int(t * 60)}-{int(e * 60)}", "-o", str(pasta / (prefixo + ".%(ext)s")), a.link],
                           capture_output=True, text=True)
        arq = next(iter(sorted(pasta.glob(prefixo + ".*"))), None)
        if r.returncode != 0 or arq is None:
            log(f"  falhou o download da janela ({(r.stderr.strip().splitlines() or ['?'])[-1][:120]}); pulando")
            t = e
            continue
        try:
            feitos = clipador.gerar(arq, nome_live or base, base, a.max, 60.0, pasta / "clipes", nota_min=a.nota_min, sempre_melhor=a.sempre_melhor)
        except Exception as ex:
            log(f"  falhou ao analisar: {ex}")
            feitos = []
        for nome, nota in clipador.enviar_para_fila(feitos, nome_live, a.link, f"v{int(t):04d}"):
            total += 1
            log(f"  NA FILA -> {nome} (nota {nota})")
        arq.unlink(missing_ok=True)  # janela bruta não é mais necessária
        t = e
    log(f"pronto: {total} clipe(s) na fila de revisão")
    shutil.rmtree(pasta / "clipes", ignore_errors=True)


if __name__ == "__main__":
    main()
