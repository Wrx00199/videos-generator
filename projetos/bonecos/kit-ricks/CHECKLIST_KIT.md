# Checklist único — Tião no kit híbrido (Caesar)

Base: `ricksclips-style/RULEBOOK.md` (manda em caso de conflito) + docs/01, 04, 07, 08 do kit.
Apoio: nossas medições do Rick (`ref/ANALISE_BRUTA_RICKS.md`, `ref/MOLDE_RICKSCLIPS.md`, de d08eb61) só onde não brigam com o kit.
NÃO vale aqui: `docs/tiao/CHECKLIST.md` nem regras do nosso 2D (decisão do Filippe, 24/11).

## Adaptações do estúdio (fixas)
- Língua PT-BR, voz Gemini Fenrir (`ferramentas/voz.mjs`). ElevenLabs só se o Filippe mandar (B11/C12 do kit vira opcional).
- Narração em 3ª pessoa: boca do personagem fechada, exceto fala citada (kit B: "mouth flaps on quoted lines").
- Tião = estilo travado do kit (`rick.js`): cabeça branca redonda, barba cinza `beard`, roupa muda por episódio. Elenco novo a cada vídeo (D19).
- Tema: kit quer história com pessoa + truque + virada (A1–A2). Mantém a lane do kit (golpes, loterias, brechas, assaltos), contada com o Tião.
- Render: 540x960, EEVEE 4 samples, `--lite`, upscale lanczos 1080 (medido ≈ 1080/16 a olho). Um render por vez.

## A. Ideia e título
- [ ] História com pessoa + truque + virada; nunca explicação de escola (A1)
- [ ] 3 títulos no padrão de hit, escolher o mais impossível (A3); conferir se não está batido (A4)

## B. Roteiro
- [ ] Frase 1 = gancho de 8–20 palavras (~3 s), ação + detalhe absurdo, triple hook (B5)
- [ ] Esqueleto: gancho → "Sabe," contexto → zombaria citada → escalada com marcador de tempo → "Peraí…?" → virada → "Sabe," + 1 analogia do dia a dia → imagem final que chama o gancho. Sem CTA (B6)
- [ ] Piada a cada ~10 s; números exatos; presente (B7)
- [ ] 145–250 palavras, 40–65 s (B8). Apoio Rick: medido 204–237 palavras, "you see" cedo (10–18 s)
- [ ] Toda oração é atuável: verbo que o personagem faz ou coisa que a câmera mostra (B9)

## C. Áudio
- [ ] Voz: 1 take, tighten só silêncio, nunca cortar palavra (C13); compressão ~3:1 (C14)
- [ ] Música REAL nova a cada vídeo, ~20 dB abaixo da voz, muda na virada (C15, regra 50, log de músicas)
- [ ] SFX reais ~8 por 10 s, ~12 dB abaixo da voz; whoosh em movimento de câmera (C16)
- [ ] Master -14 LUFS, pico -2 dBTP, termina ~0,3 s após a última palavra (C17)

## D. Personagens
- [ ] Rosto BRANCO PURO em toda cena (card sem luz) (D20); brilho de rosto 0,4 (D22)
- [ ] 3+ personagens em ≥25% dos quadros; alguém pra reagir em todo plano (D21)
- [ ] SÓ personagens são 2D; moeda, fumaça, suor, placa, "!" = 3D com contorno (D22b)
- [ ] Expressão muda a cada 0,3–0,8 s; olhos mexem; pisca (E24-B)

## E. Movimento
- [ ] Linha do tempo palavra a palavra: toda oração = ação + movimento de câmera (E23)
- [ ] Todo plano com ≥4 das 7 camadas, sempre A ou D + F (ambiente vivo) + G (paralaxe com primeiro plano) (E24)
- [ ] Algo novo a cada ~1 s (E25); nada de balanço procedural no lugar de atuação (E26)
- [ ] Todo substantivo/verbo tem visual; ideia abstrata vira objeto com etiqueta (E27)

## F. Câmera
- [ ] Voo contínuo: câmera mexe em ≥83% dos quadros, entra rápido (0,3–0,6 s) e deriva com roll ±1–3°, tremor no impacto (F28)
- [ ] Composição nova a cada ≤2,2 s por movimento; corte seco ≤2 por vídeo (F29)
- [ ] Rodar as transições do kit (dissolve 6–10 q em movimento, pull-back, tilt-up, orbit, wipe, atravessar porta…) (F30)
- [ ] Alternar macro → geral → rosto; nunca 2 médios seguidos; cabeça típica pequena (~7% da largura) (F31)
- [ ] Nenhum quadro só de pé/perna/chapéu; nada cortado ou com zoom exagerado; look no rosto (y 1,55–1,6 m em pé) (F32, doc01)
- [ ] Câmera sempre dentro do cenário (regra 51)

## G. Mundo
- [ ] Claro (≈0,64), ≥4 famílias de cor por quadro (G34–35)
- [ ] Cenário 3D denso com contorno, fundo com DOF, nunca vazio (G36, regra 49: arquitetura, chão texturizado com tralha 3D, props em todo canto, algo vivo, névoa, luz da história)
- [ ] 3–6 placas/etiquetas no mundo com piada ou fato (G37); texto só em objeto real
- [ ] Legenda 1–2 palavras, Lilita One, branca com contorno, y≈1250–1350 (G38)
- [ ] Apoio Rick: 7–12 lugares por vídeo e luz/hora mudando

## H. Estrutura na tela
- [ ] Quadro 0 = gancho acontecendo, câmera já rápida, 2º impacto até 2,5 s; nunca plano de estabelecimento (H39)
- [ ] "Sabe," = explicação física (mecanismo, demonstração, mergulho na coisa), nunca cabeça falante (H40)
- [ ] Final = maior espetáculo do vídeo + reação/placa irônica, corte 0,3 s após a última palavra (H41)

## Portão (nada renderiza em 1080 sem isso — regra 48)
- [ ] Still do meio de CADA plano visto em folha de contatos (I43)
- [ ] Proxy do vídeo inteiro (Workbench 540 ou EEVEE lite) passa `tools/study/qa_motion.py`: ≥95% movendo, ≤4,5% morto, morto ≤0,7 s, área ≥30%, composição ≤2,2 s, ≤2 cortes
- [ ] Cada cenário comparado lado a lado com `reference/celyxi/` e quadros do Rick
- [ ] QA ffmpeg do estúdio: sem preto, congelado ou silêncio
- [ ] Nome de saída nunca sobrescreve (_v2, _v3)
- [ ] `python3 tools_clip_check.py <bl>` = OK: nenhum boneco/chapéu atravessa poste, árvore, placa ou prop (crítica Filippe 25/11, piloto v2 tinha 18 casos)
- [ ] Placas legíveis inteiras no quadro, texto sem cortar (crítica 25/11)
- [ ] Vídeo de entrega = 60 s; teste curto só se o Filippe pedir

## Honestidade sobre a RX 550 (medido 24/11)
- Aguenta: EEVEE 540 lite ≈ 0,19 s/quadro só cenário, 0,47 com cards e dissolves → 60 s ≈ 15 min de render. 1080/16 nativo = 3,3 s/q (≈ 100 min/60 s): possível de madrugada, mas sem ganho visível.
- Risco: cenário denso da regra 49 (centenas de objetos, névoa volumétrica, DOF) vai subir o tempo e a VRAM de 2 GB. Medir cada cenário novo com 3 stills antes; se passar de ~1,5 s/q em 540, cortar névoa volumétrica/AO e usar DOF do próprio EEVEE com 4 samples.
- Não aguenta bem: Cycles (sem CUDA, só CPU = lento demais); raytracing do EEVEE Next em 1080.
- O gargalo real não é a GPU: é escrever `story.js` com 7 camadas por plano e construir cenário rico. Isso é trabalho de Claude/IA, não de render.

## Teste15 contra este checklist (honesto)
Passou: pipeline completo, 0 corte seco, morto ≤0,7 s, legenda/voz ok.
Reprovou no `qa_motion.py`: movendo 82% (meta 95), área em movimento 11,5% (meta 30), composição a cada 7 s (meta 2,2).
Também falha: sem música/SFX, cenário do demo é pobre (regra 49), sem placas, 1–3 personagens, sem paralaxe de primeiro plano, plano de estabelecimento no quadro 0.
Conclusão: o motor serve; o nível Rick depende de cenário e direção, não da placa.

## Catálogo automático de erros (tools_clip_check.py, roda em TODO vídeo antes do render)
Física/corpo: ATRAVESSA (poste, árvore, placa, prop, palco), PE FLUTUA/ENTERRA, POSTE NA CARA, GRUDADOS (2 bonecos viram borrão), contato entre bonecos só por rota planejada.
Câmera: CAMERA DENTRO (obstáculo), CAMERA FORA (parede/chão), BONECO NA LENTE, ZOOM EXAGERADO, CABECA CORTADA, CORTADO NA LATERAL.
Placas: PLACA CORTADA (quando é o assunto), PLACA TAMPADA, LEGENDA SOBRE PLACA.
Atuação: BONECO CONGELADO (mesma pose >0,8 s), SURGE DO NADA (boneco teleporta >0,4 m ou some/aparece no meio do quadro; pulo de verdade = marcar `air` no story.js).
Câmera contínua: CAMERA PULOU (>0,9 m num quadro). Empurrão da câmera parte do quadro anterior e tem limite de velocidade (ep61 tinha 60 teleportes que ninguém via no export).
Câmera calma (crítica Filippe 25/11 ep61 "rápido pra krl"): CAMERA CORRIDA = giro >40°/s ou avanço >0,9× distância/s por ≥5 quadros; FOCO CURTO = trocar de alvo antes de 1,2 s. Regra de direção: 1 alvo por plano, deriva lenta (az ≤15°), troca de personagem só no corte/dissolve. Vale acima do F28/F29 do kit.
Comparação ep61 x Rick (25/11): o Rick troca de LUGAR e LUZ (salão, cidade, pôr do sol, noite, cela, corte do subsolo); ep61 ficou numa praça só e com 4 closes do globo. Próximo vídeo: ≥5 lugares/luzes e nunca 2 closes do mesmo objeto seguidos.
Passagem rápida: corte/zoom/poste/legenda só reprova se durar ≥3 quadros seguidos.
Ritmo/movimento: qa_motion.py (≥95% movendo, composição ≤2,2 s, ≤2 cortes, morto ≤0,7 s).
Regra: erro novo apontado pelo Filippe vira checagem aqui, nunca correção pontual.
Vídeo final: `python3 tools_video_check.py <mp4> --words work/words.json --ass captions.ass --roteiro roteiro.txt [--voz --musica]` = OK: resolução/duração, tela preta, imagem congelada, volume -14 LUFS, pico, silêncio no meio, voz pulou/inventou palavra ou não começa pelo gancho, final arrastado/cortado, legenda fora de sincronia/sobreposta/longa/faltando, música alta demais. (Já pegou legenda dessincronizada no piloto v2.)
Pendente (pedido 25/11): módulo QUEBRA = objeto quebrando com física real (Blender rigid body + pedaços pré-fraturados), testado num objeto antes de entrar em vídeo.
