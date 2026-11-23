#!/usr/bin/env python3
"""Renderiza a prova curta do V7 com o motor do episódio e registra sua origem."""
import argparse
import fcntl
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

from editorial import fontes, ler_json, sha
from portao import _intervalo, etapa_roteiro, imprimir

FPS = 30
PASSO = 3


def selecionar_quadros(duracao, trechos):
    intervalos = trechos or [(0, duracao)]
    anterior = 0
    total = 0
    for inicio, fim in intervalos:
        if not anterior <= inicio < fim <= duracao:
            raise ValueError('trechos devem estar em ordem, sem sobreposição e dentro do plano')
        total += len(range(inicio, fim, PASSO))
        anterior = fim
    if not 3 <= total * PASSO / FPS <= 45:
        raise ValueError('a prévia deve ter de 3 a 45 segundos; selecione trechos em quadros')
    return ','.join(f'{inicio}-{fim - 1}' for inicio, fim in intervalos), total


def renderizar(projeto, trechos):
    env = os.environ.copy()
    for chave in ('WEB', 'HASH', 'RESUME'):
        env.pop(chave, None)
    env['SEQ'] = '1'

    with open(f'/tmp/tinhao-render-{os.getuid()}.lock', 'a') as trava:
        fcntl.flock(trava, fcntl.LOCK_EX)
        with tempfile.TemporaryDirectory(dir=projeto, prefix='.previa-') as temp:
            pasta = Path(temp)
            origem = fontes(projeto)
            planos = ler_json(projeto / 'plano.json')
            if (not isinstance(planos, list) or not planos
                    or not isinstance(planos[-1], dict) or not _intervalo(planos[-1])):
                raise ValueError('plano.json precisa terminar em um intervalo válido')
            duracao = round(planos[-1]['fim'] * FPS)
            spec, total = selecionar_quadros(duracao, trechos)
            env['TIAO_TOTAL'] = str(duracao)
            subprocess.run(['nice', '-n', '19', 'ionice', '-c3', 'node', 'render.mjs',
                            str(pasta), spec, str(PASSO), '.84'],
                           cwd=projeto / 'web', env=env, check=True)
            if len(list(pasta.glob('f*.jpg'))) != total or fontes(projeto) != origem:
                raise ValueError('quadros incompletos ou fonte alterada durante a prévia')
            video = pasta / 'previa.mp4'
            subprocess.run(['ffmpeg', '-v', 'error', '-framerate', str(FPS // PASSO),
                            '-i', str(pasta / 'f%04d.jpg'), '-vf', 'scale=540:960:out_range=tv',
                            '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
                            str(video)], check=True)
            registro = pasta / 'previa-origem.json'
            registro.write_text(json.dumps({'fontes': origem, 'video': sha(video)}) + '\n')
            video.replace(projeto / video.name)
            registro.replace(projeto / registro.name)
    return projeto / 'previa.mp4'


def trecho(valor):
    try:
        inicio, fim = (int(v) for v in valor.split(':'))
    except ValueError:
        raise argparse.ArgumentTypeError('use início:fim em quadros, fim exclusivo') from None
    return inicio, fim


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('projeto', type=Path)
    cli.add_argument('--trecho', action='append', type=trecho)
    args = cli.parse_args()
    projeto = args.projeto.resolve()
    if not imprimir(etapa_roteiro(projeto)):
        return 1
    try:
        print(renderizar(projeto, args.trecho))
    except (OSError, ValueError, subprocess.CalledProcessError) as erro:
        print(f'Prévia falhou: {erro}', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
