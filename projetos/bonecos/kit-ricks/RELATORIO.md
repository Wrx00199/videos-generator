# Kit ricksclips-style no Linux — relatório (24/11)

PC: Ryzen 3 3200G, RX 550 2 GB (radeonsi, GPU confirmada), 8 GB. Blender 4.2.3, Node 26, Python 3.12, ffmpeg.

## O que foi ajustado pro Linux
- `blender/parts/a_lib.py`: Blender 4.2 chama o motor de `BLENDER_EEVEE_NEXT` (o kit quebrava) → fallback. Nova flag `--lite` (sem raytracing/AO, sombra mínima).
- `tools/timing.py`: Whisper era `base.en` (inglês) e caía calado no tempo proporcional → agora `small` + `pt`, áudio entregue via ffmpeg (PyAV 19 quebra o faster-whisper).
- venv próprio em `kit-ricks/.venv` (numpy, soundfile, faster-whisper). Playwright 1.49.1 local em `teste15/bl` (Chromium já em cache).
- .bat → comandos abaixo (render tem `--resume`: pode parar e continuar).

## Tempo por quadro (demo, média de 5 quadros)
| Config | s/quadro | 60 s (1800 q) |
|---|---|---|
| 1080x1920, EEVEE 16 samples (padrão do kit) | 3,31 | 99 min |
| 540x960, 16 samples | 0,81 | 24 min |
| 540x960, 4 samples | 0,27 | 8 min |
| **540x960, 4 samples, --lite + upscale lanczos** | **0,19** | **6 min** |
| 1080, 8 samples, --lite | 0,83 | 25 min |
| Workbench 540 | 0,05 | 1,5 min (cinza, só pra conferir movimento) |
Visual do 540 lite com upscale ≈ igual ao 1080/16 (comparado lado a lado). Workbench não serve pra entrega.

## Teste 15 s ponta a ponta (`teste15/out/teste15.mp4`, 14 s)
| Etapa | Tempo máquina |
|---|---|
| Voz Fenrir (voz.mjs) | 10 s |
| Tighten 1.1x | 1 s |
| Whisper PT (timing) | 14 s |
| Legenda .ass | <1 s |
| Export story → cards/câmeras (Chromium) | 13 s |
| Render Blender 420 q (com dissolves) | 3 min 19 s (0,47 s/q) |
| Upscale + glow + legenda + encode | 30 s |
| **Total máquina** | **~4,5 min** |

## Projeção 60 s
Máquina: voz+timing ~1 min, export ~1 min, render ~14 min (0,47 s/q real com personagens), encode ~2 min → **~18–20 min**, sem madrugada.
O gargalo é humano/IA: escrever `story.js` (planos, câmera, poses por frase) e montar cenário.

## Onde dá pra ser mais ágil
1. Catálogo de cenários fixos (abaixo) — cenário é o que mais custa.
2. Gerador de `story.js` a partir do roteiro amarrado (frase → ação da biblioteca → câmera), igual à regra do CLAUDE.md.
3. Stills de 3 quadros por plano (`--frames 60,210,360`, ~2 s) antes do render inteiro.
4. Personagem: `rick.js` já tem 20+ expressões, poses de braço, walk, props, chapéus. Tião = `{outfit, beard:'#b4afa6', hairStyle:'bald'}`.

## Catálogo proposto (cada um 1 vez em `parts/d_sets_*.py`, X próprio)
rua (pronto no kit) · casa/sala (escritório do kit vira base) · prefeitura · bar/boteco · delegacia · hospital · mercado · escola · praia · floresta · deserto · castelo · nave/lab · ônibus por dentro.
Cada cenário: 3 câmeras padrão (geral, média, close) + vida em movimento (`animate_sets`).

## Pendências do teste
- Música/SFX não mixados (só voz). Kit pede música −15 dB e SFX −11..−17.
- Bonecos ficaram grandes perto das casas e pernas compridas: calibrar escala do card.
- Plano 2 com dissolve longo e carro passando: direção, não bloqueio.

## Comandos (de `teste15/bl`)
```
node export.mjs data
python3 build.py
blender -b -P scene.py -- --data data --out frames --frames 0-419 --samples 4 --scale 0.5 --lite --resume
```

## Piloto v2 (25/11) — rua rica do catálogo + câmera Rick
- Cenário fixo `teste15/bl/parts/d_sets_tiao.py` (13 prédios texturizados, prefeitura c/ relógio, placas, tralha, névoa, pássaros, bandeirinhas) + `web/textures.js`.
- Render 420 q, 540 lite 4 samples: **9 min 38 s (1,37 s/q)**; mix+upscale+legenda 34 s. Projeção 60 s ≈ 42 min.
- qa_motion: **PASS em tudo** (movendo 99,8%, área 60%, composição 1,0 s, 0 cortes). ffmpeg: sem preto/congelado/silêncio.
- Otimizar sem perder qualidade: reaproveitar a cena (cenário fixo = 0 trabalho no próximo), `share=` nas malhas repetidas, cards em cache (1076 cards → reutilizar por chave), renderizar à noite em lote. Próximo ganho real: instâncias (collection instance) para janelas/balaústres.
- Falhas conhecidas: frontão da prefeitura branco atravessando no push final, 1 s de parede vazia em 11 s, sem glow no rosto.
