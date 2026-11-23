---
name: estudio-motion
description: Motion graphics, infográficos animados, VFX e cenas desenhadas para vídeo vertical — escolhe o motor certo (HyperFrames, Huashu Art Motion, Claude Drawing, pixelfx, Remotion) e entrega MP4/PNG com alpha pronto para montar. Usar para "faz um infográfico animado", "anima isso", "efeito de explosão", "cena estilo Vice City".
---

# Estúdio · Motion

Fabrica peças visuais solicitadas pela timeline.

Medições históricas em CPU de 2026-11-14; não são promessa de tempo de produção.

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
- Identidade em `marca/identidade.json`: nick e cores por caractere, logo e capa do Jason. Entregar capa separada, sem intro. Cartão de estilo orienta mecanismo, não substitui identidade nem impõe o mesmo visual a todas as referências.
- Clone não usa trailer/teaser, pessoa real nem gameplay inventada. Lives é outra frente. Cada produção tem peças/editorial novos; componentes de código podem ser reutilizados.
- Montagem simples suportada vai pelo montador local/FFmpeg; usar motor de animação apenas para a peça que o exigir. Um render por vez.
- Fonte com acento PT-BR: conferir ã/ç/õ em todo texto (Huashu precisa do setup acima).
- Animação de personagem por código fica dura (teste Vice City): para personagem, usar imagem pronta
  (gerada/desenhada) e animar câmera, parallax e efeitos — não o corpo.
- Câmera: seguir `referencias/direcao.md` §6 e o cartão do estilo.
- Antes de entregar: QA de `referencias/direcao.md` §5, depois 3 quadros reduzidos (início/meio/fim) e o áudio, se houver.
- three.js: não testado nesta máquina; medir fps numa cena simples antes de usar em vídeo.
- B-roll/footage de apoio com origem registrada: skill `estudio-brolls` (`ferramentas/brolls.py`).
