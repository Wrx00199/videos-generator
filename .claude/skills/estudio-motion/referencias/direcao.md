# Direção de motion — regras que funcionam

Fonte: playbook de @flxrnc (40 filmes com Fable 5.2, nov/2026) + tutorial de @mariagpts_ (estilo 2D em mundo 3D).
As lições valem para qualquer modelo.

## 1. Modelo
- Tarefa mecânica em script ou lote: fixar o modelo (`claude -p --model sonnet`).

## 2. Número no lugar de adjetivo
| Não escrever | Escrever |
|---|---|
| premium | roughness 0.38, clearcoat 0.35 |
| frio/quente | key 3200 K, rim 7500 K |
| moderno | 35 mm, f/2.8, corte no beat |
| suave | cubic-bezier(0.16, 1, 0.3, 1) |
| saltitante | spring, damping 0.5, 2 quiques |
| cortes rápidos | quadros por beat = fps × 60 / BPM |

## 3. Tempos que soam "desenhados"
- Entrada `cubic-bezier(0.16,1,0.3,1)`; saída `cubic-bezier(0.7,0,0.84,0)` e 40–50% mais curta; pop `cubic-bezier(0.34,1.56,0.64,1)`.
- Feedback de UI 100–200 ms; revelação do herói 600–900 ms.
- Stagger: letra 1 quadro, palavra 60–120 ms, item de lista 40–80 ms. Próximo movimento começa em 30–50% do anterior.
- Squash/stretch: agachar 1.2×0.75, impulso 0.85×1.28, pouso 1.25×0.75 (volume constante). Braço atrasa 4 quadros, cabelo/gravata 6.
- Mola em **forma fechada** (função de t), nunca acumulando estado: o render pula para o quadro 300 e tem que dar igual.

## 4. O relógio primeiro
- Arquivo de tempo (`timing.json`: beats, palavras da voz, eventos) é o mestre. Todo movimento e som lê dele.
  Som de impacto cai 1 quadro depois do evento visual.
- Definir "pronto" no pedido: "pronto = MP4 renderizado e todas as medições do QA dentro do alvo, com os números".

## 5. QA mede movimento (still mente)
- Corrigir enquadramento em stills ANTES do render completo (still custa segundos; render, minutos).
- Freeze: `ffmpeg -i final.mp4 -vf freezedetect=n=0.003:d=0.5 -an -f null - 2>&1 | grep freeze_` — todo freeze não pedido é bug.
- Estilo em número: item 9 do portão do `estudio-clone` (`medir_estilo.py`).
  Quando não parecer: não dizer "ficou feio"; dizer "o original tem câmera movendo em 93% dos quadros, o nosso 75%".
- Herói nunca vira ponto: largura mínima em px por plano (ex.: ≥170 px a 1080p), medida pelo agente.
- Quem revisa não é quem fez (subagente revisor separado), e tenta quebrar.
- No fim, alguém aperta play com som.

## 6. Prompt
- Poucas regras, boas. Nada de CAPS/"NUNCA" em excesso; o modelo segue regra ao pé da letra.
- Linha "Proibido:" nomeando os clichês (gradiente roxo, orbs de brilho, lens flare, caixas e rótulos não pedidos).
- "Só o texto listado aqui aparece na tela." Evita legenda/subtítulo extra.
- Projetar a colisão fora (faixas separadas, objetos atrás) em vez de corrigir depois.
- Câmera: "sem zoom para fingir energia; corta no beat; um ângulo bonito segura um beat inteiro" — salvo se o estilo medido pedir push lento contínuo.

## 7. Loop e exportação
- Loop: renderizar quadros 0..N-1 (o N é o 0 de novo). Áudio −14 LUFS, pico ≤ −2 dBTP medido DEPOIS do AAC.
- H.264 High, yuv420p, faststart.

## 8. Ferramentas citadas (não instaladas; avaliar se precisar)
motion2code (refaz movimento de referência em SVG+GSAP e confere quadro a quadro), librosa (achar o beat),
Blender headless por script (`blender -b --factory-startup -P x.py`) para mascote/figurino 3D.
