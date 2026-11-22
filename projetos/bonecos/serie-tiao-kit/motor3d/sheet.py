#!/usr/bin/env python3
"""Monta uma folha de quadros com uma guia opcional de composição vertical."""
import argparse
from pathlib import Path
from PIL import Image, ImageDraw

cli = argparse.ArgumentParser(description=__doc__)
cli.add_argument('quadros', type=Path)
cli.add_argument('saida')
cli.add_argument('colunas', type=int, nargs='?', default=7)
cli.add_argument('--area-segura', action='store_true', help='marca o retângulo de revisão sem alterar os quadros')
a = cli.parse_args()
quadros = sorted(a.quadros.glob('f*.jpg'))
if not quadros or a.colunas < 1:
    cli.error('informe uma pasta com quadros JPEG e pelo menos uma coluna')

largura, altura = 270, 480
colunas = min(a.colunas, len(quadros))
linhas = (len(quadros) + colunas - 1) // colunas
folha = Image.new('RGB', (largura * colunas, altura * linhas))
for i, quadro in enumerate(quadros):
    with Image.open(quadro) as fonte:
        img = fonte.convert('RGB').resize((largura, altura))
    if a.area_segura:
        guia = tuple(round(v) for v in (.08 * largura, .10 * altura, .92 * largura, .80 * altura))
        desenho = ImageDraw.Draw(img)
        desenho.rectangle(guia, outline='#231832', width=4)
        desenho.rectangle(guia, outline='#64ffdb', width=2)
    folha.paste(img, ((i % colunas) * largura, (i // colunas) * altura))
folha.save(a.saida, quality=88)
print(a.saida, len(quadros))
