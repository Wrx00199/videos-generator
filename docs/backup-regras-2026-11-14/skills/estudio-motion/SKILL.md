---
name: estudio-motion
description: Motion graphics, infográficos animados, VFX e cenas desenhadas para vídeo vertical — escolhe o motor certo (HyperFrames, Huashu Art Motion, Claude Drawing, pixelfx, Remotion) e entrega MP4/PNG com alpha pronto para montar. Usar para "faz um infográfico animado", "anima isso", "efeito de explosão", "cena estilo Vice City".
---

# Estúdio · Motion

PC: Ryzen 3 3200G, 8 GB, RX 550 — tudo abaixo roda em CPU. Medido em 2026-11-14.

| Precisa de | Motor | Velocidade medida | Saída |
|---|---|---|---|
| Infográfico, título, lower-third, legenda animada, montagem final | **hyperframes** (HTML + GSAP, render quadro a quadro) | `npx hyperframes` 0.9.47: 6,8 s de vídeo em 18 s (draft, 240 MB); avisa "BeginFrame did not run" → usa captura mais lenta, instalar chrome-headless-shell se ficar lento | MP4 |
| Texto cinético, explainer com "papel", animação artística | **huashu-art-motion** (global) — rodar `~/.local/share/hypit-ptbr/huashu-ptbr/setup-projeto.sh <pasta>` antes (acentos PT) | ~15 s por clipe de 7,5 s; filme 10 s vertical em 93 s | MP4 |
| Ilustração/cenário pintado (synthwave, cyberpunk, 80+ estilos) | **claude-drawing** (global) | 3 camadas 1080x1920 em ~11 s | PNG (camadas p/ parallax) |
| Efeito: explosão, faísca, moeda, transição, impacto | **pixelfx** (`ferramentas/pixelfx`, `node tools/render.mjs <id> --sheet`) | 1,2 s por efeito, 92 MB | sprite PNG / MP4 |
| Vídeo React programático, captions avançadas | **remotion** (router oficial) | não medido aqui | MP4 |

## Antes de animar
- Ler `referencias/direcao.md` (números no lugar de adjetivos, easing, molas, relógio primeiro, QA de movimento).
- Se o pedido cita um estilo, ler o cartão em `estilos/` (identidade visual, números, prompt base, ideias).
  Estilo novo que deu certo vira cartão novo (modelo `estilos/_modelo.md`).

## Regras
- Cores e logo da marca em `marca/`. Paleta do original é sempre trocada.
- Fonte com acento PT-BR: conferir ã/ç/õ em todo texto (Huashu precisa do setup acima).
- Animação de personagem por código fica dura (teste Vice City): para personagem, usar imagem pronta
  (gerada/desenhada) e animar câmera, parallax e efeitos — não o corpo.
- Câmera: movimento com easing e acompanhando a ação; parado mais de 2 s só com motivo.
- Antes de entregar: ver 3 quadros (início/meio/fim) e o áudio, se houver.
- three.js: não testado nesta máquina; medir fps numa cena simples antes de usar em vídeo.
