#!/usr/bin/env python3
"""Régua de "dopamina" sem IA: mede o vídeo pronto (MP4) e dá nota 0-10 com números.
Uso: python3 medir_dopamina.py <video.mp4> [--json]
Mede 4 coisas (amostra 4 quadros/s, 72x128):
  1. imagem nova: % dos intervalos de 2 s em que o quadro muda de verdade (cor/composição) vs o intervalo anterior
  2. câmera/ação viva: % do tempo com movimento na imagem (diferença entre quadros vizinhos)
  3. planos: nº de cortes por minuto e mediana de duração
  4. repetição: pares de planos vizinhos quase iguais (mesma composição) e % do vídeo no mesmo "lugar" (cor dominante)
Só numpy + ffmpeg. Roda em ~3 s. Calibrado em 16/11 contra referência (ricksclips) e ep. 13 do Tião."""
import subprocess, sys, json
import numpy as np

W, H, FPS = 72, 128, 4


def quadros(path):
    cmd = ["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps={FPS},scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
    raw = subprocess.run(cmd, capture_output=True).stdout
    n = len(raw) // (W * H * 3)
    return np.frombuffer(raw[: n * W * H * 3], np.uint8).reshape(n, H, W, 3).astype(np.float32)


def hist(q):  # histograma de cor 4x4x4 normalizado
    b = (q // 64).astype(int)
    idx = b[..., 0] * 16 + b[..., 1] * 4 + b[..., 2]
    h = np.bincount(idx.ravel(), minlength=64).astype(np.float32)
    return h / h.sum()


def medir(path):
    Q = quadros(path)
    n = len(Q)
    dur = n / FPS
    # movimento entre quadros vizinhos (ignora a faixa de legenda: 70%-88% da altura)
    mask = np.ones(H, bool); mask[int(H * 0.70):int(H * 0.88)] = False
    dif = np.array([np.abs(Q[i + 1][mask] - Q[i][mask]).mean() for i in range(n - 1)])
    vivo = float((dif > 1.2).mean())
    # cortes: salto grande de histograma entre quadros vizinhos
    H_ = np.array([hist(q[mask]) for q in Q])
    salto = np.array([0.5 * np.abs(H_[i + 1] - H_[i]).sum() for i in range(n - 1)])
    cortes = [i + 1 for i in range(n - 1) if salto[i] > 0.18 or dif[i] > 22]
    cortes = [c for k, c in enumerate(cortes) if k == 0 or c - cortes[k - 1] > 2]
    lim = [0] + cortes + [n]
    durs = np.diff(lim) / FPS
    por_min = len(durs) / dur * 60
    # imagem nova a cada 2 s: compara histograma médio de janelas de 2 s e composição (miniatura 9x16)
    w = 2 * FPS
    jan = [range(i, min(i + w, n)) for i in range(0, n - w + 1, w)]
    novos = 0; pares_iguais = 0
    for a, b in zip(jan, jan[1:]):
        ha = H_[list(a)].mean(0); hb = H_[list(b)].mean(0)
        ma = Q[list(a)].mean(0)[mask][::8].ravel(); mb = Q[list(b)].mean(0)[mask][::8].ravel()
        d_cor = 0.5 * np.abs(ha - hb).sum(); d_comp = np.abs(ma - mb).mean() / 255
        if d_cor > 0.08 or d_comp > 0.10: novos += 1
        if d_cor < 0.03 and d_comp < 0.04: pares_iguais += 1
    npar = max(1, len(jan) - 1)
    # "lugar": cor dominante do vídeo todo ocupa quanto tempo
    dom = np.argmax(H_, axis=1); lugar = float(np.bincount(dom).max() / n)
    novo_pct = novos / npar
    # nota: cada eixo 0-10, média ponderada
    s_novo = np.clip((novo_pct - 0.25) / (0.80 - 0.25), 0, 1) * 10
    s_vivo = np.clip((vivo - 0.35) / (0.90 - 0.35), 0, 1) * 10
    s_plano = np.clip((por_min - 12) / (30 - 12), 0, 1) * 10
    s_rep = np.clip(1 - (pares_iguais / npar) / 0.35, 0, 1) * 10
    nota = 0.35 * s_novo + 0.25 * s_vivo + 0.2 * s_plano + 0.2 * s_rep
    return dict(video=path, dur=round(dur, 1), imagem_nova_pct=round(novo_pct * 100), movimento_pct=round(vivo * 100),
                cortes_por_min=round(por_min, 1), mediana_plano_s=round(float(np.median(durs)), 2),
                pares_iguais=pares_iguais, pares_total=npar, cor_dominante_pct=round(lugar * 100),
                notas=dict(novo=round(s_novo, 1), vivo=round(s_vivo, 1), planos=round(s_plano, 1), repeticao=round(s_rep, 1)),
                nota=round(float(nota), 1))


if __name__ == "__main__":
    r = medir(sys.argv[1])
    if "--json" in sys.argv: print(json.dumps(r, ensure_ascii=False))
    else:
        print(f"{r['video'].split('/')[-1]}  {r['dur']} s  NOTA {r['nota']}/10")
        print(f"  imagem nova a cada 2 s: {r['imagem_nova_pct']}%  (meta >= 75)  nota {r['notas']['novo']}")
        print(f"  movimento vivo:         {r['movimento_pct']}%  (meta >= 85)  nota {r['notas']['vivo']}")
        print(f"  cortes/min: {r['cortes_por_min']}  mediana de plano {r['mediana_plano_s']} s (meta 25+/min, <= 2,6 s)  nota {r['notas']['planos']}")
        print(f"  pares de 2 s quase iguais: {r['pares_iguais']}/{r['pares_total']} (meta <= 10%)  nota {r['notas']['repeticao']}")
        print(f"  cor dominante ocupa {r['cor_dominante_pct']}% do vídeo")
