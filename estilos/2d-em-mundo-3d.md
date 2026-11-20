# 2D em mundo 3D (história narrada)

- Origem: shorts virais de história; método publicado por @mariagpts_ (X, 13/11/2026). O canal original tinha
  29 mi de views num short e mais de 200 mi nos 80 últimos.
- Serve para: curiosidade e história contada ("o cara que…"). No GTA 6: lendas e mistérios do mapa, história de Vice City,
  "o que aconteceria se…".

## Assinatura em números (do tutorial, não medido por nós; medir 2 originais antes de clonar)
- Câmera movendo em ~93% dos quadros. A versão 1 deles tinha 75% e parecia "parada"; a v3 chegou a 83%.
- Movimentos longos (>2 s), deslizando. Push lento em toda pausa. 12 de 20 vídeos têm 1 corte ou nenhum: a câmera **viaja** até o próximo momento.
- Mais escuro e mais contrastado que o "natural". A v1 clara parecia "piquenique".
- Fala com ~4 palavras/s e praticamente sem silêncio.

## Visual
- Personagens planos 2D, mas iluminados pela luz do mundo: pega key light e projetam sombra real.
- Mundo em geometria 3D de verdade, contornado com tinta preta tipo quadrinho.
- Cores supersaturadas: luz quente, sombra azul fria.
- A luz segue a história: quente e clara na apresentação, azul noite profundo quando começa a explicação.
- Fundo com desfoque (o olho vai pro personagem). Multidão = milhares de sprites desenhados por código.
- Números discretos no alto do quadro. Nada de caixas ou destaques tipo "apresentação de escola".

## Roteiro (fórmula dos 20 analisados)
1. Paradoxo na primeiríssima frase, sem intro ("Enterraram um homem vivo com um sino amarrado no dedo").
2. Escala. 3. Virada com a razão verdadeira, quase sempre introduzida por **"E se…"** (14 de 20).
4. Remate + última linha surpresa.
Antes de escrever, checar cada fato.

## Medido aqui (2026-11-15)
Motor `cartoon-short-kit` (three.js em Chromium headless, tinta + desfoque + gradação) rodou nesta máquina com a RX 550 a **0,27 s/quadro em 1080x1920** (55 s ≈ 7–8 min). Material, valores medidos e receita em `referencias/LEIA-ME.md` e `referencias/2026-11-15-aiplaybook-stickman/RESUMO_APLICAVEL.md`.

## Como fazemos aqui
three.js (cena 3D, sprites 2D com sombra) renderizado quadro a quadro. Precisa medir fps no PC (RX 550); alternativa
mais leve: camadas pintadas (claude-drawing) + parallax no Huashu/HyperFrames. Voz Fenrir acelerada (~4 palavras/s).
Prompt base: "Cena 3D com contorno preto de quadrinho, personagens 2D planos iluminados pela key light e com sombra
projetada; saturação alta, key 3200 K quente, sombras 7500 K azuis; câmera sempre em movimento (alvo ≥90% dos quadros,
movimentos ≥2 s com cubic-bezier(0.16,1,0.3,1)), viaja entre momentos em vez de cortar; fundo com DOF; só o texto
listado aparece; proibido: caixas, rótulos, lens flare."

## Ideias de vídeo neste estilo
- "Um homem roubou um banco em Vice City… e devolveu o dinheiro no dia seguinte. E se…" (lenda/easter egg do GTA 6, checar fatos)
- A história real de Miami que inspirou um local do mapa.
