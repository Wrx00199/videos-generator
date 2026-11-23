"""Pareceres sobre a prévia e o MP4 do V7."""
import argparse
import hashlib
import json
import os
import shutil
import sys
import tempfile
from pathlib import Path

from portao import Resultado

CAMPOS = {
    'frio': ('abertura', 'causa', 'consequencia', 'pagamento', 'graca'),
    'montagem': ('enquadramento', 'contato', 'movimento', 'boca', 'identidade'),
    'final': ('historia', 'montagem', 'audio', 'identidade'),
}


def ler_json(arquivo):
    return json.loads(arquivo.read_text(encoding='utf-8'))


def sha(arquivo):
    with arquivo.open('rb') as entrada:
        return hashlib.file_digest(entrada, 'sha256').hexdigest()


def assinatura(projeto, arquivos):
    registro = [(str(p.relative_to(projeto)), sha(p)) for p in sorted(arquivos)]
    return hashlib.sha256(json.dumps(registro).encode()).hexdigest()


def gravar_json(arquivo, dados):
    with tempfile.NamedTemporaryFile(dir=arquivo.parent, encoding='utf-8', mode='w', delete=False) as saida:
        parcial = Path(saida.name)
        try:
            json.dump(dados, saida, ensure_ascii=False, indent=2)
            saida.write('\n')
            saida.close()
            parcial.replace(arquivo)
        finally:
            parcial.unlink(missing_ok=True)


def fontes(projeto):
    web = projeto / 'web'
    obrigatorios = [projeto / n for n in ('falas.json', 'plano.json', 'web/story.js')]
    arquivos = set(obrigatorios)
    for arquivo in web.rglob('*'):
        relativo = arquivo.relative_to(web)
        if relativo.parts[0] != 'node_modules' and arquivo.is_file() and arquivo.suffix in (
            '.js', '.mjs', '.html', '.css', '.json', '.png', '.jpg', '.jpeg', '.webp', '.glb', '.svg',
        ) and arquivo.name != 'auditoria.json':
            arquivos.add(arquivo)
    lib = web / 'lib'
    if lib.is_dir():
        arquivos.update(p for p in lib.rglob('*') if p.is_file())
    return assinatura(projeto, arquivos)


def versao(projeto, etapa):
    projeto = Path(projeto)
    origem = fontes(projeto)
    midia = projeto / ('final.mp4' if etapa == 'final' else 'previa.mp4')
    video = sha(midia)
    if etapa == 'final':
        registro = ler_json(projeto / 'final-origem.json')
        if registro != {'montagem': versao(projeto, 'montagem'), 'video': video}:
            raise ValueError('o MP4 final não veio da versão atual da montagem')
    else:
        registro = ler_json(projeto / 'previa-origem.json')
        if registro != {'fontes': origem, 'video': video}:
            raise ValueError('a prévia precisa ser refeita com os arquivos atuais')
    return hashlib.sha256(f'{origem}:{video}'.encode()).hexdigest()


def selar_final(projeto, video, esperado):
    if versao(projeto, 'montagem') != esperado:
        raise ValueError('versão alterada durante a montagem')
    sha_video = sha(video)
    video.replace(projeto / 'final.mp4')
    gravar_json(projeto / 'final-origem.json', {'montagem': esperado, 'video': sha_video})


def validar_parecer(etapa, parecer):
    campos = ('autor', 'revisor', 'decisao', 'evidencia', *CAMPOS[etapa])
    if not isinstance(parecer, dict) or any(
        not isinstance(parecer.get(k), str) or not parecer[k].strip() for k in campos
    ):
        raise ValueError('preencha o parecer: ' + ', '.join(campos))
    if parecer['autor'].strip().casefold() == parecer['revisor'].strip().casefold():
        raise ValueError('o parecer exige um revisor diferente do autor')
    if parecer['decisao'] not in ('aprovado', 'reprovado'):
        raise ValueError('decisão deve ser aprovado ou reprovado')


def registrar(projeto, etapa, esperado, parecer):
    projeto = Path(projeto)
    validar_parecer(etapa, parecer)
    if versao(projeto, etapa) != esperado:
        raise ValueError('a versão atual difere da versão enviada ao revisor')
    pasta = projeto / 'pareceres'
    pasta.mkdir(exist_ok=True)
    nome = 'final.mp4' if etapa == 'final' else 'previa.mp4'
    arquivo = pasta / f'midia-{esperado}.mp4'
    if not arquivo.exists():
        with tempfile.NamedTemporaryFile(dir=pasta) as copia:
            shutil.copyfile(projeto / nome, copia.name)
            if sha(Path(copia.name)) != sha(projeto / nome) or versao(projeto, etapa) != esperado:
                raise ValueError('a mídia mudou durante o registro')
            try:
                os.link(copia.name, arquivo)
            except FileExistsError:
                pass
    with (pasta / f'{etapa}-{esperado}.json').open('x', encoding='utf-8') as saida:
        json.dump({**parecer, 'etapa': etapa, 'versao': esperado}, saida, ensure_ascii=False, indent=2)
        saida.write('\n')


def revisao(projeto, etapa):
    projeto = Path(projeto)
    motivo = ''
    digest = 'sem versão'
    try:
        digest = versao(projeto, etapa)
        pasta = projeto / 'pareceres'
        parecer = ler_json(pasta / f'{etapa}-{digest}.json')
        validar_parecer(etapa, parecer)
        if parecer.get('versao') != digest or parecer.get('etapa') != etapa:
            raise ValueError('parecer associado a outra versão ou etapa')
        if parecer['decisao'] != 'aprovado':
            motivo = f'reprovado por {parecer["revisor"]}: {parecer["evidencia"]}'
    except FileNotFoundError:
        motivo = 'falta a mídia, sua origem ou o parecer desta versão'
    except (OSError, ValueError) as erro:
        motivo = str(erro)
    return Resultado(f'editorial_{etapa}', not motivo, digest, 'parecer independente vigente', motivo)


def main():
    cli = argparse.ArgumentParser(description=__doc__)
    cli.add_argument('projeto', type=Path)
    cli.add_argument('etapa', choices=CAMPOS)
    cli.add_argument('--parecer', type=Path)
    cli.add_argument('--versao', help='assinatura obtida antes de enviar a mídia')
    cli.add_argument('--selar-final', type=Path, metavar='MP4_TEMPORARIO')
    args = cli.parse_args()
    try:
        if args.selar_final:
            if args.etapa != 'final' or not args.versao or args.parecer:
                cli.error('--selar-final exige etapa final e --versao da montagem')
            selar_final(args.projeto, args.selar_final, args.versao)
        elif args.parecer:
            if not args.versao:
                cli.error('--parecer exige --versao')
            registrar(args.projeto, args.etapa, args.versao, ler_json(args.parecer))
        else:
            print(versao(args.projeto, args.etapa))
    except (OSError, ValueError) as erro:
        sys.exit(str(erro))


if __name__ == '__main__':
    main()
