#!/usr/bin/env python3
"""conferir_fala.py <audio> "<texto>" — STT local (stt.py) e cobertura das palavras do texto.
Imprime {"cobertura": x}; exit 0 se >=0,70, 1 se menor, 2 se entrada/STT invalidos."""
import json, os, re, subprocess, sys, unicodedata
from collections import Counter

MINIMO = 0.70
STT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'ferramentas', 'stt.py')


def _norm(t):
    t = unicodedata.normalize('NFD', t.lower())
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn')
    return re.findall(r'[a-z0-9]+', t)


def cobertura(ref, hip):
    r, h = _norm(ref), Counter(_norm(hip))
    if not r:
        return 0.0
    ach = 0
    for w in r:
        if h[w] > 0:
            h[w] -= 1
            ach += 1
    return ach / len(r)


def sobras(ref, hip, minimo=5):
    """Palavras OUVIDAS que nao estao no roteiro, na PONTA (inicio/fim) da fala, com >= `minimo` letras.
    Pega o TTS lendo o campo `tom`/rotulo em voz alta ('Sombrio. Dia 6...'). Lista vazia = ok."""
    r, h = set(_norm(ref)), _norm(hip)
    ini = []
    for w in h:
        if w in r: break
        ini.append(w)
    fim = []
    for w in reversed(h[len(ini):]):
        if w in r: break
        fim.append(w)
    return [w for w in ini + fim[::-1] if len(w) >= minimo]


def main(argv):
    if len(argv) != 3 or not os.path.isfile(argv[1]) or not argv[2].strip():
        print('uso: conferir_fala.py <audio> "<texto>"', file=sys.stderr)
        return 2
    r = subprocess.run([sys.executable, STT, argv[1], 'pt'], capture_output=True, text=True)
    try:
        hip = json.loads(r.stdout)['texto']
    except (ValueError, KeyError):
        print('STT falhou: ' + r.stderr[-200:], file=sys.stderr)
        return 2
    c = cobertura(argv[2], hip)
    ex = sobras(argv[2], hip)
    print(json.dumps({'cobertura': round(c, 3), 'sobras': ex}))
    return 0 if (c >= MINIMO and not ex) else 1


if __name__ == '__main__':
    sys.exit(main(sys.argv))
