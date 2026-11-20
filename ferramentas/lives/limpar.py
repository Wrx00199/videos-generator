#!/usr/bin/env python3
"""Limpa o disco (projetos/lives/clipper/trabalho). Por padrão só MOSTRA o que apagaria; --apagar apaga de verdade.
Regras de segurança:
 - segmento bruto (seg_N.ts em <live>-gravacao) só é apagado se o <live>-sNNNNN/processado existir (já analisado);
   segmento ainda não processado NUNCA é apagado, por mais velho que seja;
 - pastas de gravação em andamento (arquivo mexido há menos de --min-parado min) ficam intactas;
 - pastas de trabalho de segmentos processados (clipes já copiados pra fila) saem depois de --horas.
Uso:  limpar.py [--horas 24] [--apagar]
Também importável: limpar_gravacao(grav, base, apagar=True) apaga só segmentos já processados dessa gravação."""
import argparse, shutil, time
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
TRAB = RAIZ / "projetos" / "lives" / "clipper" / "trabalho"


def _proc(trab, base, n):
    return (trab / f"{base}-s{n:05d}" / "processado").exists()


def limpar_gravacao(grav, base, apagar=True, trab=None, min_parado=0):
    """Segmentos brutos já processados dessa gravação. Devolve (arquivos, bytes)."""
    trab = trab or grav.parent
    qtd = tot = 0
    for f in sorted(grav.glob("seg_*.ts")):
        try:
            n = int(f.stem.split("_")[1])
        except ValueError:
            continue
        if not _proc(trab, base, n):
            continue  # ainda não analisado: preservar
        if min_parado and time.time() - f.stat().st_mtime < min_parado * 60:
            continue
        qtd += 1
        tot += f.stat().st_size
        if apagar:
            f.unlink(missing_ok=True)
    return qtd, tot


def varrer(horas=24, apagar=False, trab=None, min_parado=10, log=print):
    trab = trab or TRAB
    corte = time.time() - horas * 3600
    total = 0
    for d in sorted(trab.iterdir() if trab.exists() else []):
        if not d.is_dir():
            continue
        arqs = [f for f in d.rglob("*") if f.is_file()]
        ult = max((f.stat().st_mtime for f in arqs), default=d.stat().st_mtime)
        if d.name.endswith("-gravacao"):
            q, t = limpar_gravacao(d, d.name[:-len("-gravacao")], apagar, trab, min_parado)
            if q:
                total += t
                log(("APAGANDO " if apagar else "apagaria  ") + f"{d.name}: {q} segmentos processados  {t / 1e9:.2f} GB")
            left = [f for f in d.glob("seg_*.ts")]
            if apagar and not left and ult < corte:
                shutil.rmtree(d, ignore_errors=True)
            continue
        if ult > corte:
            continue
        if "-s" in d.name and not (d / "processado").exists():
            continue  # segmento sem marca de processado: não mexer
        t = sum(f.stat().st_size for f in arqs)
        total += t
        log(("APAGANDO " if apagar else "apagaria  ") + f"{d.name}  {t / 1e9:.2f} GB")
        if apagar:
            shutil.rmtree(d, ignore_errors=True)
    return total


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--horas", type=float, default=24)
    ap.add_argument("--apagar", action="store_true")
    a = ap.parse_args()
    total = varrer(a.horas, a.apagar)
    print(f"total: {total / 1e9:.1f} GB " + ("liberados" if a.apagar else "(simulação: rode com --apagar)"))
