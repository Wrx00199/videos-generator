#!/usr/bin/env python3
"""aparar_pontas.py <in.wav> <out.wav> — remove SO o silencio inicial e final (deixa 0,05 s).
Nunca mexe no silencio do meio. Exit: 0 ok · 1 audio todo silencio · 2 entrada invalida."""
import os, re, subprocess, sys

FOLGA = 0.05


def duracao(p):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p],
                       capture_output=True, text=True)
    try:
        return float(r.stdout)
    except ValueError:
        return 0.0


def limites(p, dur):
    """(inicio_fala, fim_fala) em s, ou None se tudo silencio."""
    r = subprocess.run(['ffmpeg', '-nostats', '-i', p, '-af', 'silencedetect=n=-40dB:d=0.1', '-f', 'null', '-'],
                       capture_output=True, text=True)
    sil, ini = [], None
    for l in r.stderr.splitlines():
        a = re.search(r'silence_start: (-?[\d.]+)', l)
        if a:
            ini = max(0.0, float(a.group(1)))
        b = re.search(r'silence_end: ([\d.]+)', l)
        if b and ini is not None:
            sil.append((ini, float(b.group(1)))); ini = None
    if ini is not None:
        sil.append((ini, dur))
    ini_fala, fim_fala = 0.0, dur
    for a, b in sil:
        if a <= 0.02:
            ini_fala = b
        if b >= dur - 0.02:
            fim_fala = a
    if fim_fala - ini_fala <= 0.05:
        return None
    return ini_fala, fim_fala


def main(argv):
    if len(argv) != 3 or not os.path.isfile(argv[1]):
        print('uso: aparar_pontas.py <in.wav> <out.wav> (entrada precisa existir)', file=sys.stderr)
        return 2
    dur = duracao(argv[1])
    if dur <= 0:
        print('audio ilegivel', file=sys.stderr)
        return 2
    lim = limites(argv[1], dur)
    if lim is None:
        print('audio todo silencio', file=sys.stderr)
        return 1
    a, b = max(0.0, lim[0] - FOLGA), min(dur, lim[1] + FOLGA)
    r = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-i', argv[1], argv[2]],
                       capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr, file=sys.stderr)
        return 2
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
