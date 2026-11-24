#!/usr/bin/env python3
"""revisor_visual.py — Portão automático pré-render do Tião 3D (Nexo V8).

Renderiza 3 quadros por cena (início 15%, meio 50%, fim 85%) ANTES do render completo,
verifica automaticamente quadros pretos ou cenas congeladas (sem movimento entre início e fim)
e gera a folha de contato completa para conferência visual.

Uso:
  python3 projetos/bonecos/serie-tiao-kit/motor3d/revisor_visual.py <pasta_episodio>
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path
import numpy as np
from PIL import Image


def main() -> int:
    if len(sys.argv) < 2:
        print("Uso: revisor_visual.py <pasta_episodio>", file=sys.stderr)
        return 2
    proj = Path(sys.argv[1]).resolve()
    tempos = proj / "web" / "tempos.js"
    if not tempos.is_file():
        print(f"ERRO: falta {tempos}", file=sys.stderr)
        return 2
    txt = tempos.read_text(encoding="utf-8")
    ft = json.loads(re.search(r"FT = (\[.*\]);", txt).group(1))
    fps = 24
    story_txt = (proj / "web" / "story.js").read_text(encoding="utf-8")
    m_fps = re.search(r"export const FPS\s*=\s*(\d+)", story_txt)
    if m_fps:
        fps = int(m_fps.group(1))

    trios = []
    todos = []
    for idx, (a, b) in enumerate(ft):
        f1 = max(0, round((a + (b - a) * 0.15) * fps))
        f2 = max(f1 + 1, round((a + (b - a) * 0.50) * fps))
        f3 = max(f2 + 1, round((a + (b - a) * 0.85) * fps))
        trios.append((idx + 1, f1, f2, f3))
        todos.extend([f1, f2, f3])

    out_dir = proj / "stills_revisao"
    out_dir.mkdir(parents=True, exist_ok=True)
    for old in out_dir.glob("*.jpg"):
        old.unlink()

    env = {**os.environ, "TIAO_GPU": "vulkan", "WEB": str((proj / "web").resolve())}
    r = subprocess.run(
        ["node", "render.mjs", str(out_dir), ",".join(map(str, todos)), "1", "85"],
        cwd=proj / "web", env=env, capture_output=True, text=True,
    )
    if r.returncode != 0:
        print("REPROVADO: render de revisão falhou:", r.stderr or r.stdout, file=sys.stderr)
        return 1

    falhas = []
    for cena_n, f1, f2, f3 in trios:
        imgs = []
        for f in (f1, f2, f3):
            p = out_dir / f"f{f:04d}.jpg"
            if not p.is_file():
                falhas.append(f"Cena {cena_n}: frame {f} não foi gerado")
                continue
            arr = np.asarray(Image.open(p).convert("RGB"), dtype=np.float32) / 255.0
            luma = float(arr.mean())
            if luma < 0.03:
                falhas.append(f"Cena {cena_n} (f{f}): quadro preto (luma={luma:.3f})")
            imgs.append(arr)
        if len(imgs) == 3:
            diff_im = float(np.abs(imgs[2] - imgs[0]).mean())
            if diff_im < 0.004:
                falhas.append(f"Cena {cena_n}: cena congelada/estática entre início e fim (diff={diff_im:.4f})")

    folha = out_dir / "folha_revisao_3x.jpg"
    subprocess.run([sys.executable, "sheet.py", str(out_dir), str(folha), "6"], cwd=proj / "web", check=True)
    res = {"ok": not falhas, "cenas": len(trios), "quadros": len(todos), "folha": str(folha), "falhas": falhas}
    print(json.dumps(res, ensure_ascii=False, indent=2))
    return 0 if not falhas else 1


if __name__ == "__main__":
    sys.exit(main())
