"""Mede a assinatura visual de um vídeo em NÚMEROS (para copiar um estilo ou comparar clone x original).

Uso (Python do rea-video, que já tem OpenCV):
  ferramentas/rea-video/.venv/bin/python -I ferramentas/medir_estilo.py VIDEO.mp4 [--fala fala.json] [--json saida.json]
  ferramentas/rea-video/.venv/bin/python -I ferramentas/medir_estilo.py ORIGINAL.mp4 CLONE.mp4   # compara lado a lado

Mede (amostra a 15 fps, quadro reduzido a 270 px de largura — leve em CPU):
  camera_movendo_%   quadros com deslocamento global > 0.15 px (correlação de fase)
  desloc_medio_px    deslocamento médio por quadro (escala 1080p) quando a câmera move
  movimento_seg_med  duração média de um movimento contínuo de câmera
  cortes, cortes_min, plano_medio_s
  parado_%           tempo em trechos >= 0.5 s sem mudança nenhuma (freeze = bug, salvo se pedido)
  brilho, contraste, saturacao (0-255), quente_frio (média R-B; >0 quente)
  palavras_s         só com --fala (JSON do stt.py)
"""
from __future__ import annotations

import argparse
import json
import sys

import cv2
import numpy as np

FPS_AMOSTRA = 15
LARG = 270


def medir(caminho: str, fala: str | None = None) -> dict:
    cap = cv2.VideoCapture(caminho)
    if not cap.isOpened():
        sys.exit(f"não abri {caminho}")
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    passo = max(1, round(fps / FPS_AMOSTRA))
    larg_orig = cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 1080
    escala = (1080 if larg_orig <= 1080 else larg_orig) / LARG  # deslocamento reportado em px de 1080
    ant = None
    janela = None
    desloc, mudanca, cortes_idx = [], [], []
    brilho, contraste, sat, qf = [], [], [], []
    i = n = 0
    while True:
        ok, q = cap.read()
        if not ok:
            break
        if i % passo:
            i += 1
            continue
        i += 1
        h = int(q.shape[0] * LARG / q.shape[1])
        p = cv2.resize(q, (LARG, h), interpolation=cv2.INTER_AREA)
        cinza = cv2.cvtColor(p, cv2.COLOR_BGR2GRAY).astype(np.float32)
        hsv = cv2.cvtColor(p, cv2.COLOR_BGR2HSV)
        brilho.append(float(cinza.mean()))
        contraste.append(float(cinza.std()))
        sat.append(float(hsv[..., 1].mean()))
        qf.append(float(p[..., 2].mean() - p[..., 0].mean()))
        if ant is not None:
            if janela is None:
                janela = cv2.createHanningWindow(cinza.shape[::-1], cv2.CV_32F)
            # cópias: o phaseCorrelate aplica a janela no buffer de entrada
            (dx, dy), resp = cv2.phaseCorrelate(ant.copy(), cinza.copy(), janela)
            dif = float(np.abs(cinza - ant).mean())
            mudanca.append(dif)
            # corte: diferença grande e correlação fraca
            if dif > 28 and resp < 0.2:
                cortes_idx.append(n)
                desloc.append(0.0)
            else:
                # fluxo óptico: mediana pega movimento de câmera (pan E zoom), ignora objeto pequeno se mexendo
                fl = cv2.calcOpticalFlowFarneback(ant.astype(np.uint8), cinza.astype(np.uint8), None, 0.5, 2, 13, 2, 5, 1.1, 0)
                mag = np.hypot(fl[..., 0], fl[..., 1])
                desloc.append(float(np.median(mag)) * escala)
        ant = cinza
        n += 1
    cap.release()
    dur = n / FPS_AMOSTRA
    d = np.array(desloc) if desloc else np.zeros(1)
    movendo = d > 0.15  # limiar em px de 1080
    # duração dos movimentos contínuos
    segs, atual = [], 0
    for m in movendo:
        if m:
            atual += 1
        elif atual:
            segs.append(atual); atual = 0
    if atual:
        segs.append(atual)
    # trechos parados (>= 0.5 s sem mudança)
    parado = 0
    corrida = 0
    for v in mudanca:
        if v < 0.6:
            corrida += 1
        else:
            if corrida >= FPS_AMOSTRA / 2:
                parado += corrida
            corrida = 0
    if corrida >= FPS_AMOSTRA / 2:
        parado += corrida
    r = {
        "video": caminho,
        "duracao_s": round(dur, 1),
        "camera_movendo_%": round(100 * float(movendo.mean()), 1),
        "desloc_medio_px": round(float(d[movendo].mean()) if movendo.any() else 0.0, 2),
        "movimento_seg_med": round((sum(segs) / len(segs)) / FPS_AMOSTRA, 2) if segs else 0.0,
        "cortes": len(cortes_idx),
        "cortes_min": round(len(cortes_idx) / dur * 60, 1) if dur else 0,
        "plano_medio_s": round(dur / (len(cortes_idx) + 1), 2),
        "parado_%": round(100 * parado / max(1, len(mudanca)), 1),
        "brilho": round(float(np.mean(brilho)), 1),
        "contraste": round(float(np.mean(contraste)), 1),
        "saturacao": round(float(np.mean(sat)), 1),
        "quente_frio": round(float(np.mean(qf)), 1),
    }
    if fala:
        f = json.load(open(fala, encoding="utf-8"))
        pal = f.get("palavras") or []
        if pal:
            falado = pal[-1]["fim"] - pal[0]["ini"]
            r["palavras_s"] = round(len(pal) / falado, 2) if falado > 0 else None
    return r


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("videos", nargs="+")
    ap.add_argument("--fala")
    ap.add_argument("--json")
    a = ap.parse_args()
    res = [medir(v, a.fala if len(a.videos) == 1 else None) for v in a.videos]
    if a.json:
        json.dump(res if len(res) > 1 else res[0], open(a.json, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    chaves = [k for k in res[0] if k != "video"]
    print(f"{'métrica':20}" + "".join(f"{('ORIGINAL' if j == 0 else 'CLONE') if len(res) == 2 else 'valor':>12}" for j in range(len(res))))
    for k in chaves:
        print(f"{k:20}" + "".join(f"{str(x.get(k)):>12}" for x in res))


if __name__ == "__main__":
    main()
