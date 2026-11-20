# Card de notícia (manchete fixa + janela)

- Origem: https://www.tiktok.com/@azexsgta6/video/7707659019250371860 · visto em 14/11/2026 · ~850 mil views em 1 dia (notícia quente + card legível sem som)
- Serve para: notícia curta de GTA 6 (anúncio, data, novidade oficial), 20–30 s.

## Assinatura em números (medir_estilo.py)
| câmera movendo % | movimento seg | cortes/min | plano médio s | brilho | contraste | saturação | quente-frio | palavras/s |
|---|---|---|---|---|---|---|---|---|
| 4,2 | 0,21 | 38 | 1,5 | 121 | 60,5 | 110 | +8 | 2,47 |

## Visual
- Card branco arredondado fixo do 1º ao último quadro, a ~16–30% da altura: tag colorida no topo ("GTA 6 NEWS"), título caixa-alta preto, linha com nome em cor de destaque, linha com data, "Fonte: …" pequeno.
- Janela 16:9 no meio (~33–66% da altura); fundo = a mesma imagem ampliada e desfocada.
- Câmera parada; o ritmo vem do corte (plano médio 1,5 s). Ding quando o card entra, click/ding nos cortes, flash branco no meio.
- Fecha segurando 5 s numa arte-chave.

## Roteiro (fórmula)
Manchete no card desde 0 s; voz confirma a manchete na 1ª frase; 2–3 detalhes curiosos em sequência rápida; uma piada; fecha com data + pergunta curta.

## Como fazemos aqui
HyperFrames 1080x1920: card nosso (cores da marca, não magenta/branco do original) + janela com desenho/motion nosso (Claude Drawing, pixelfx) + fundo desfocado do próprio visual. Nada de filmagem do GTA 6.
Prompt base: "Short vertical 1080x1920 30fps; card de notícia fixo no topo (25% da altura, cantos 24px, tag colorida), janela 16:9 central com ilustração cartoon própria, fundo = ilustração ampliada com blur 40px; troca de ilustração a cada 1,5 s com click; ding na entrada do card; flash branco 0,3 s no meio; final segura 2–5 s."

## Ideias de vídeo neste estilo
- Rádios novas do GTA 6 anunciadas (ondas sonoras desenhadas).
- Data de pré-venda / edição especial (infográfico de preço).
