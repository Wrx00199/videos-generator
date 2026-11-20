# Diagnóstico da frente de bonecos (série Tião) — 2026-11-15

## Horrível (atacar primeiro)
1. **Tempo e cota:** V3 levou 29 min líquidos (meta 8–13) e a sessão seguinte queimou horas em retoques um a um. Causas: planos escritos do zero, 4 renders completos só para conferir correção, regras descobertas depois do vídeo pronto.
2. **Pontas soltas recorrentes:** concha fora da panela (3x), bonecos flutuando na linha parede/chão, navio sem velas. Causa: mão, pé e objeto posicionados com número digitado em cada cena; só `stirPot` é amarrado.
3. **Visual chapado:** tentamos imitar com gradiente em canvas uma referência que é mundo 3D com tinta, luz e desfoque de lente. O passe de "relevo" melhorou pouco. O motor certo existe e roda aqui (0,27 s/quadro com a RX 550).
4. **Som:** SFX sintético simples, sem trilha, -18,8 LUFS (referência: -14, trilha contínua ~10 LU abaixo da voz, parada seca na virada). Ninguém ouve o resultado; só medidas.
5. **Ritmo da fala:** ~2 palavras/s; a referência fala 3,5–4,1 sem pausas. O vídeo fica arrastado mesmo com corte rápido.
6. **Estrutura do kit bagunçada:** `rig_e_exemplo.js` (legado) + `rig.js` + `lib_v3.js` + `parte1/parte2` por projeto; regras espalhadas e repetidas em KIT, GANCHO, RETRO, ESTADO e memória; a série não tem skill própria (cada sessão relê tudo).

## A melhorar
- `revisor-bonecos` foi escrito mas **nunca rodou**; `checar.py` só foi testado no modo `final`.
- Ações amarradas faltando: sentar, deitar, pé no chão com aviso, escalar, segurar.
- Animação dura (sem antecipação/assentamento; câmera com cortes secos em vez de glide).
- Viradas sempre de comida; narrador conta tudo.
- Cota única do Gemini trava a voz no meio do dia (gerar em lote com cota cheia).
- V4 parado: roteiro e tabela prontos, sem voz.

## Bom / razoável (manter)
- Identidade: navio, elenco, voz Puck, gancho fixo ("O Tião só queria um dia de paz...") e CTA fixo.
- Mecânica rápida: voz + STT ~1 min, render HyperFrames ~2 min, checagem automática 50 s.
- Revisor independente pega muito; catálogo de pontas soltas e folha-modelo existem.
- Biblioteca de objetos (tentáculo, olho, tigela, espada, fundo do mar), banco de 11 roteiros, formato A/B modelado.
- Pastas organizadas (`prontos/`, `referencias/`, `projetos/gta6|bonecos`), testes do estúdio passando (22 Python + 3 Node).

## Sobre o repo e o kit de referência
- **Vale adotar o motor do `cartoon-short-kit`** (three.js em Chromium, tinta, desfoque, gradação, texturas pintadas): é exatamente o visual da referência, é MIT, e rodou aqui. Os personagens do kit são cartões com canvas 2D → dá para desenhar o NOSSO Tião/elenco nesses cartões e manter a identidade.
- **Vale adotar o áudio do repo** (`templates/audio/`: SFX por evento, trilha sintetizada, mix com ducking e loudness) e o método de "look-match" (medir referência, notas /10 por área, lista de correções numerada).
- **Não vale:** Remotion (bundle de 1,3 GB por render, encheu 60 GB de disco no relato deles), export 2K, grão de filme, "Opus max" para cada conferência.
- Custo: construir o mundo do navio em 3D uma vez (convés, cozinha, mar, casco) e render de ~7–8 min por vídeo de 55 s (contra 2 min hoje).
