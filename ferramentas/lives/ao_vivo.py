#!/usr/bin/env python3
"""Robô de live: grava uma live EM ANDAMENTO em segmentos e transforma os momentos quentes em cortes verticais.

Uso (com o python do ambiente do clipper):
  projetos/lives/clipper/ambiente/bin/python ferramentas/lives/ao_vivo.py LINK [--seg 300] [--max 1]

Fluxo por segmento completo: áudio -> escuta (whisper) -> picos de volume + reação -> momento -> corte 1080x1920
(câmera em cima, jogo embaixo, legenda palavra a palavra) -> projetos/lives/fila/ (aguarda sua aprovação).
Usa as funções da skill-clips (ouvir.py / cortar.py) sem alterar o código dela.
"""
import argparse
import os
import re
import shutil
import signal
import subprocess
import sys
import threading
import time
from datetime import datetime
from pathlib import Path

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parents[1]
os.environ.setdefault("CLIPPER_GTA6_HOME", str(RAIZ / "projetos" / "lives" / "clipper"))
sys.path.insert(0, str(AQUI / "skill-clips" / "scripts"))

import json  # noqa: E402

import comum  # noqa: E402
import cortar  # noqa: E402
from comum import TRABALHO, gravar_json, hms, ler_json, rodar, slug, ytdlp  # noqa: E402

IDENT = ler_json(RAIZ / "marca" / "identidade.json", {})
FONTE = AQUI / "skill-clips" / "fontes" / "Montserrat-ExtraBold.ttf"

FILA = RAIZ / "projetos" / "lives" / "fila"
REACAO = re.compile(r"(meu deus|caralho|porra|n[ãa]o acredito|que isso|mds|kkk+|ha(ha)+|nossa|cara+lho|"
                    r"oh my god|what the|no way|holy|wtf|insane|crazy|let'?s go|bro what|ai meu|socorro|pqp|"
                    r"olha isso|gente|mano|velho)", re.I)


def log(*a):
    print(datetime.now().strftime("%H:%M:%S"), *a, flush=True)


# ------------------------------------------------------------------ live: metadados e gravação
def ler_meta(url):
    r = subprocess.run(ytdlp() + ["-J", "--no-playlist", "--no-warnings", url], capture_output=True, text=True)
    if r.returncode != 0:
        motivo = comum.motivo_trancada(r.stderr)
        sys.exit(f"NÃO DÁ PRA LER A LIVE: {motivo or r.stderr[-400:]}")
    return json.loads(r.stdout)


def links_do_stream(url):
    # só formato COMBINADO (áudio+vídeo no mesmo stream): dois inputs separados no ffmpeg com -c copy dessincronizam
    fmt = "b[height<=1080]/best[height<=1080]/b" if "twitch.tv" in url else "b[height<=720]/best[height<=720]/b"
    r = subprocess.run(ytdlp() + ["-f", fmt, "-g", "--no-playlist", "--no-warnings", url],
                       capture_output=True, text=True)
    return [l for l in r.stdout.split() if l.startswith("http")][:2]


def comando_gravacao(links, saida):
    cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y"]
    twitch = any(("ttvnw" in l or "live-video.net" in l) for l in links)  # -reconnect quebra o HLS da Twitch ("Error when loading first segment")
    for l in links:
        if not twitch:
            cmd += ["-reconnect", "1", "-reconnect_streamed", "1", "-reconnect_delay_max", "10"]
        cmd += ["-i", l]
    if len(links) == 2:
        cmd += ["-map", "0:v:0", "-map", "1:a:0"]
    elif not twitch:
        cmd += ["-map", "0:v:0?", "-map", "0:a:0?"]
    return cmd + ["-c", "copy", "-f", "mpegts", str(saida)]


class Gravador(threading.Thread):
    """Grava a live em arquivos de `seg` segundos de RELÓGIO REAL (o corte por timestamp do ffmpeg se perde na
    Twitch: os timestamps do stream pulam e ele para de fechar segmentos). Um ffmpeg por segmento."""

    def __init__(self, url, grav, seg, n0):
        super().__init__(daemon=True)
        self.url, self.grav, self.seg = url, grav, seg
        self.n_atual, self.fim, self.parar, self.proc = n0, False, False, None

    def run(self):
        curtos = falhas = 0
        while not self.parar:
            links = links_do_stream(self.url)
            if not links:
                falhas += 1
                log(f"não consegui o link do stream ({falhas})")
                if falhas >= 5:
                    break
                time.sleep(10)
                continue
            falhas = 0
            t0 = time.time()
            self.proc = subprocess.Popen(comando_gravacao(links, self.grav / f"seg_{self.n_atual:05d}.ts"),
                                         stdout=subprocess.DEVNULL)
            if self.n_atual == 0 or curtos:
                log("gravando…")
            try:
                self.proc.wait(timeout=self.seg)
            except subprocess.TimeoutExpired:
                self.proc.terminate()
                try:
                    self.proc.wait(15)
                except subprocess.TimeoutExpired:
                    self.proc.kill()
            if time.time() - t0 < 20:  # saiu cedo: stream caiu ou live acabou
                curtos += 1
                if curtos >= 3 and ler_meta(self.url).get("live_status") != "is_live":
                    log("live acabou")
                    break
                if curtos >= 8:
                    break
                time.sleep(5)
            else:
                curtos = 0
            self.n_atual += 1
        self.fim = True


def numeros(grav):
    return sorted(int(p.stem.split("_")[1]) for p in grav.glob("seg_*.ts"))


def duracao(arq):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(arq)],
                       capture_output=True, text=True)
    try:
        return float(r.stdout.strip())
    except ValueError:
        return 0.0


# ------------------------------------------------------------------ cortar do arquivo gravado (em vez de baixar)
def trecho_local(pasta, url, s, e, destino):
    origem = Path((pasta / "origem.txt").read_text().strip())
    rodar(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{s:.2f}", "-i", origem, "-t", f"{e - s:.2f}",
           "-c:v", "libx264", "-preset", "veryfast", "-crf", "17", "-c:a", "aac", "-b:a", "192k", destino])


cortar.baixar_trecho = trecho_local  # a skill baixaria da live inteira; aqui o corte sai do segmento gravado

_achar_camera = cortar.achar_camera


def achar_camera_segura(video):
    """A skill às vezes toma um rosto do jogo por câmera do streamer (jogo em cima e embaixo).
    Caixinha de câmera fica no canto/borda; rosto no centro da tela é personagem do jogo."""
    W, H, r = _achar_camera(video)
    if r is None:
        return W, H, None
    cx, cy = (r[0] + r[2] / 2) / W, (r[1] + r[3] / 2) / H
    if 0.28 < cx < 0.72 and 0.28 < cy < 0.72:
        log(f"câmera descartada (rosto no centro da tela: {cx:.2f},{cy:.2f}): usando tela inteira")
        return W, H, None
    return W, H, r


cortar.achar_camera = achar_camera_segura

GANCHOS = ["OLHA O QUE {N} ACHOU NO GTA 6", "A REAÇÃO DO {N} NO GTA 6", "{N} NÃO ACREDITOU NO GTA 6",
           "{N} SURTOU NO GTA 6", "O QUE ACONTECEU COM O {N} NO GTA 6"]


def gancho(nome, n):
    """Gancho do projeto ('Olha o que X achou no GTA 6'): a frase transcrita pelo whisper erra demais pra ir no vídeo."""
    return GANCHOS[n % len(GANCHOS)].format(N=(nome or "STREAMER").upper())


def marca(entrada, saida):
    """Logo e nick da marca (marca/identidade.json) no canto superior direito."""
    logo = RAIZ / IDENT.get("logo", "")
    nick = "@" + IDENT.get("nick", "").lstrip("@")
    if not logo.exists() or not IDENT.get("nick"):
        shutil.copy(entrada, saida)
        return
    fc = (f"[1:v]scale=130:-1[l];[0:v][l]overlay=W-w-40:70[v];"
          f"[v]drawtext=fontfile={FONTE}:text='{nick}':fontsize=38:fontcolor=white:borderw=4:bordercolor=black:"
          f"x=W-tw-40:y=70+130+10[o]")
    rodar(["ffmpeg", "-y", "-loglevel", "error", "-i", entrada, "-i", logo, "-filter_complex", fc,
           "-map", "[o]", "-map", "0:a?", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
           "-c:a", "copy", "-movflags", "+faststart", saida])


# ------------------------------------------------------------------ pontuação do segmento
def achar_momento(pasta, dur, minimo_calor, janela=45):
    import numpy as np
    trans = ler_json(pasta / "transcricao.json", {}).get("segmentos", [])
    volume = ler_json(pasta / "volume.json", [])
    n = int(dur) + 2
    calor = np.zeros(n)
    for s, ex in volume:
        if s < n:
            calor[int(s)] += ex
    palavras = np.zeros(n)
    for s, e, t in trans:
        if s < n:
            calor[int(s)] += 5 * len(REACAO.findall(t))
            for k in range(int(s), min(n, int(e) + 1)):
                palavras[k] += len(t.split()) / max(1.0, e - s)
    if n <= janela + 10:
        return None, 0.0
    soma = np.convolve(calor, np.ones(janela), "valid")
    # o pico precisa cair longe das bordas do segmento: o corte (-18 s / +27 s) não pode vazar pro segmento vizinho
    melhor, melhor_i = 0.0, None
    for i in range(len(soma)):
        pico = i + janela // 2
        if pico < 20 or pico > dur - 30:
            continue
        if soma[i] > melhor and palavras[i:i + janela].sum() >= 8:
            melhor, melhor_i = float(soma[i]), i
    if melhor_i is None or melhor < minimo_calor:
        return None, melhor
    pico = melhor_i + int(np.argmax(calor[melhor_i:melhor_i + janela]))
    s, e = max(0, pico - 18), min(dur, pico + 27)
    return {"inicio": s, "fim": e, "calor": melhor, "pico": pico}, melhor


from limpar import limpar_gravacao


def processar(url, meta, grav, n, args, base):
    """Segmento gravado -> mesmo analisador do clipador (picos com fala PT, nota de relevância, render rápido) -> fila de revisão."""
    import clipador
    arq = grav / f"seg_{n:05d}.ts"
    dur = duracao(arq)
    nome = f"{base}-s{n:05d}"
    pasta = TRABALHO / nome
    if (pasta / "processado").exists():
        return
    pasta.mkdir(parents=True, exist_ok=True)
    if dur < 90:
        log(f"seg {n}: só {dur:.0f}s, pulei")
        (pasta / "processado").write_text("curto")
        return
    t0 = time.time()
    nome_live = meta.get("uploader") or meta.get("channel") or ""
    canal = slug(nome_live or base, 30)
    log(f"seg {n}: {hms(dur)} gravados, analisando…")
    try:
        feitos = clipador.gerar(arq, nome_live or canal, canal, args.max, 60.0, pasta / "clipes", nota_min=args.nota_min, sempre_melhor=args.sempre_melhor)
    except Exception as e:  # um segmento ruim não derruba a gravação
        log(f"seg {n}: falhou ao analisar/montar: {e}")
        feitos = []
    if not feitos:
        log(f"seg {n}: sem momento relevante (nota mínima {args.nota_min}) [{time.time() - t0:.0f}s]")
    for nome_arq, nota in clipador.enviar_para_fila(feitos, nome_live, url, f"s{n:05d}"):
        log(f"seg {n}: NA FILA -> {nome_arq} (nota {nota}) [{time.time() - t0:.0f}s no total]")
    (pasta / "processado").write_text("ok")
    if not args.manter_gravacao:
        arq.unlink(missing_ok=True)
        (pasta / "audio16k.wav").unlink(missing_ok=True)


# ------------------------------------------------------------------ principal
def principal():
    ap = argparse.ArgumentParser()
    ap.add_argument("link")
    ap.add_argument("--seg", type=int, default=300, help="segundos por segmento gravado")
    ap.add_argument("--max", type=int, default=1, help="cortes por segmento")
    ap.add_argument("--min-calor", type=float, default=25.0, help="calor mínimo pra valer um corte")
    ap.add_argument("--modelo", default="base", help="whisper: tiny/base/small")
    ap.add_argument("--idioma", default="pt", help="língua da live (pt fixo: a detecção automática errou pra inglês)")
    ap.add_argument("--nota-min", type=int, default=45, help="nota mínima de relevância (0-100) para o corte ir pra fila")
    ap.add_argument("--sempre-melhor", action="store_true", help="se nada passar da nota mínima, manda o melhor candidato (marcado) para a fila")
    ap.add_argument("--manter-gravacao", action="store_true")
    ap.add_argument("--so-gravar", action="store_true", help="só grava os segmentos (processa depois, offline)")
    ap.add_argument("--max-seg", type=int, default=0, help="para de gravar após N segmentos (0 = sem limite)")
    args = ap.parse_args()

    meta = ler_meta(args.link)
    if meta.get("live_status") != "is_live":
        sys.exit(f"Essa não está ao vivo agora (status: {meta.get('live_status')}). "
                 "Se já acabou, use o clip normal: clip automatico LINK")
    base = slug(f"{meta.get('uploader') or meta.get('channel') or 'live'}-{meta.get('id')}", 40)
    grav = TRABALHO / f"{base}-gravacao"
    grav.mkdir(parents=True, exist_ok=True)
    log(f"live: {meta.get('title')} | {meta.get('uploader')} | segmentos de {args.seg}s | pasta {grav}")
    parar = False

    def sair(*_):
        nonlocal parar
        parar = True
    signal.signal(signal.SIGINT, sair)
    signal.signal(signal.SIGTERM, sair)

    ult_limpeza = 0.0
    nums0 = numeros(grav)
    grava = Gravador(args.link, grav, args.seg, (nums0[-1] + 1) if nums0 else 0)
    grava.start()
    while not parar:
        if args.so_gravar:
            if args.max_seg and grava.n_atual >= args.max_seg:
                grava.parar = True
                if grava.proc and grava.proc.poll() is None:
                    grava.proc.terminate()
                log("max-seg atingido, parei de gravar")
                break
            if grava.fim:
                break
            time.sleep(5)
            continue
        nums = numeros(grav)
        prontos = [n for n in nums if n < grava.n_atual or grava.fim]
        pend = [n for n in prontos if not (TRABALHO / f"{base}-s{n:05d}" / "processado").exists()]
        if pend:
            try:
                processar(args.link, meta, grav, pend[0], args, base)
            except Exception as e:  # um segmento ruim não derruba o robô
                log(f"seg {pend[0]}: erro {type(e).__name__}: {e}")
                p = TRABALHO / f"{base}-s{pend[0]:05d}"
                p.mkdir(parents=True, exist_ok=True)
                (p / "processado").write_text("erro")
            continue
        if grava.fim and not pend:
            log("gravação encerrada e tudo foi processado")
            break
        if time.time() - ult_limpeza > 600:  # a cada 10 min: sobras já processadas (ex.: seg com erro). Só apaga o que tem marca de processado.
            ult_limpeza = time.time()
            if not args.manter_gravacao:
                q, t = limpar_gravacao(grav, base, apagar=True, trab=TRABALHO, min_parado=2)
                if q:
                    log(f"limpeza: {q} segmentos brutos já processados apagados ({t / 1e9:.2f} GB)")
        time.sleep(5)
    grava.parar = True
    if grava.proc and grava.proc.poll() is None:
        grava.proc.terminate()
    log("fim")


if __name__ == "__main__":
    principal()
