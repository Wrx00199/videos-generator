# Retro da série Tião (atualizar a cada vídeo)

## Pontos fortes (manter sempre)
- Universo fixo e reconhecível: mesmo navio, mesmo elenco, mesma voz (Gemini Puck).
- Gancho fixo "O Tião só queria um dia de paz..." com imagem impactante já se mexendo no 1º s; final com virada cômica e loop pro 1º plano.
- Partes mecânicas rápidas: voz + STT ~1 min, render ~2 min, SFX por subagente em paralelo.
- Revisor rígido pega muita coisa (V3: 9 cenas no storyboard, 2 no final).
- Biblioteca crescendo (tentáculo, olho, tigela, espada, fundo do mar, relevo 3D), e cada vídeo fica mais barato.

## Pontos fracos (corrigir)
1. **Pontas soltas por pose "no olho":** mão, concha, pés e alturas são números digitados em cada cena, sem nada amarrando o objeto ao lugar dele (concha fora da panela 3x, bonecos flutuando, navio genérico). Correção: AÇÕES AMARRADAS no rig (`stirPot` feito; faltam `sitOn`, `lieIn` (rede/cama), `standOnFloor` com aviso de pé fora do piso, `climb`, `holdItem`). Regra: interação recorrente só via função amarrada.
2. **O revisor só pega o que foi ensinado** e vê amostras de quadros. Correção: catálogo de pontas soltas + folha-modelo + recortes em close das interações (mão/objeto, pé/chão) no material do revisor.
3. **Tempo ~29 min/vídeo** (meta 8–13). Correção: biblioteca + ações amarradas + planos-modelo (reação, corrida, susto, revelação, fila) e acertar enquadramento já no 1º snapshot.
4. **Viradas repetidas: todas giram em torno de comida** (sopa salva o navio, papagaio come biscoito, monstro quer sopa, V4 = receita). Risco de cansar. Correção: alternar o tipo de pagamento (medo bobo, mal-entendido, inversão de papéis, segredo de alguém, competição).
5. **Narrador conta tudo:** quase não há "mostrar sem dizer". Correção: deixar 1–2 viradas só na imagem, com a narração calando (um "..." de 1 s com a ação falando).
6. **Som:** SFX sintético simples, sem trilha, e eu não ouço o resultado (só medidas). Correção: montar uma vez um banco curado de SFX e uma trilha leve de fundo, com o Filippe aprovando.
7. **Cota única do Gemini** trava a voz no meio do dia. Correção: gerar as vozes de vários roteiros de uma vez quando a cota estiver cheia.
8. **Animação ainda dura** em ações complexas (escalar, pular). Correção: biblioteca de ciclos (andar, correr, pular, escalar) com antecipação e assentamento.

## Banco de roteiros (formato fixo; variar o tipo de virada)
1. (V4 pronto) O mapa do Tião: o tesouro é a receita da avó; ele desenhou o mapa e esqueceu. *Segredo esquecido.*
2. "Ninguém no navio imaginava do que o capitão tinha medo." Galinha a bordo pra ter ovos; o capitão, que encara monstro, foge de uma galinha. *Medo bobo.*
3. "Ninguém no navio imaginava o que o papagaio andava ensinando." O papagaio imita as ordens do capitão e o navio vira caos; no fim todos obedecem só a voz do papagaio. *Inversão de papéis.*
4. "Ninguém no navio imaginava quem roubava o queijo do porão." Armadilhas, suspeitas no Beto; era o Zeca sonâmbulo. *Mistério + sonâmbulo.*
5. "Ninguém no navio imaginava que o Beto ia fisgar uma baleia." A baleia puxa o navio e eles ganham a regata dos piratas. *Azar que vira sorte.*
6. "Ninguém no navio imaginava que o capitão fazia aniversário." Todo mundo esqueceu, preparam festa às pressas; o capitão também tinha esquecido. *Mal-entendido.*
7. "Ninguém no navio imaginava que o Zeca e o Beto apostaram o mastro." Corrida até o cesto da gávea; quem chega primeiro é o papagaio. *Competição.*
8. "Ninguém no navio imaginava o que tinha dentro da garrafa." Mensagem na garrafa com pedido de socorro; era de outro navio... preso numa poça rasa. *Expectativa x realidade.*
9. "Ninguém no navio imaginava que o navio ia parar num iceberg." Frio, todos tremendo; o Tião abre uma sorveteria no gelo. *Problema vira negócio.*
10. "Ninguém no navio imaginava quem era o pirata mais temido dos sete mares." Piratas rivais atacam e fogem ao ver o Tião (ele tinha cozinhado pra eles uma vez). *Reputação escondida.*
11. **(A/B, modelado do reel DfuoNFTNP2T)** "O baú" Parte 1 → `roteiros/05-o-bau-parte1.txt` (141 palavras: narrar mais rápido, ~2,3 palavras/s, ou cortar até ~125). Parte 2 conforme os comentários: **A (entrega)** → a Capitã abre na hora e o ouro vira areia; o baú do Tião estava vazio, o tesouro era o próprio bilhete (mapa no verso), e o papagaio era espião da Capitã. **B (foge)** → no bote, o baú se abre sozinho no fim do 3º dia: ouro de verdade, e o papagaio tenta roubar; o Tião troca o ouro por biscoito e o papagaio vira "papagaio duplo".

## V4 "O mapa do Tião" — 1º vídeo no motor 3D (2026-11-15, sessão 12:59→)
Tempos de relógio (ESTADO.md): leitura + estrutura (skill, KIT enxuto) + vozes V4/baú + STT 12:59→13:04 (5 min); motor 3D montado + portão de arte r1 13:04→13:15 (11 min); r2 aprovado 13:16; story.js + storyboard 13:16→13:20; 2 rodadas do revisor + correções 13:20→13:25; som em subagente paralelo (~4 min); render único iniciado 13:25 (~0,25 s/q).
- **Voz:** pedir ritmo no `ESTILO` resolveu: 2,97 pal/s (antes ~2). STT small = roteiro palavra por palavra.
- **Diretor de arte:** r1 5,0 (tinta 4, composição 4) → r2 6,3 (cor 7, luz 6, tinta 6, textura 6, personagem 7, profundidade 6, composição 6). O que mais subiu: tinta 3,4 px no mundo, sombra violeta (não preta), boneco ocupando 35–50% do quadro, câmera sem mastro/viga na frente.
- **Revisor do storyboard:** r1 reprovou 10/13 planos (quase tudo ENQUADRAMENTO: corte na borda, personagem pequeno, objeto da fala fora do quadro); r2 reprovou 4 (navio ancorado de perfil sem vela, P8, pena escondida atrás da mesa, coçar a cabeça ilegível).
- **Regras novas:** (1) quadro-chave mostra mão + objeto da ação principal; (2) folga ≥ 12% nas bordas, ninguém empilhado (chapéu atrás de chapéu); (3) último plano = câmera do primeiro com outra luz (loop); (4) navio visto de fora em 3/4 (de perfil as velas somem); (5) personagem atrás de móvel 3D some — pôr na frente/ao lado do móvel.
- **Ações amarradas no motor:** `boneco` (pé no chão via `chao`, sombra fica no chão no pulo), `deitaNaRede` (corpo dentro da calha), cartão afundado = dentro do buraco, `segura`, `anda`, `cava`.
- Pendências: velas da FOLHA_MODELO têm 3 panos e o motor tem 2 por mastro; pegadas simples; flashback ainda pouco "desenhando".
- **Revisor final:** r1 reprovou P2b, P8, P9, P10, P11 + faixa preta no horizonte (tinta do motor no mar rasante → corrigido no shader: mar não contorna mar); r2 APROVADO com pendências. O Filippe pegou 2 que o storyboard não mostrava: bote entrando cortado e tripulação "sem pernas" flutuando no bote.
- **Pendências do V4 (para o Filippe):** navio ancorado no 2b ainda parece pousado na areia (sem espuma em volta); crescente branco cortado no topo 5,1–5,5 s; pena do flashback escondida pela mesa (gesto de desenhar lê pouco); baú aparece de lado em 27,5 s; linhas finas tipo fio no close do baú em 28,6 s.
- **Custo:** a sessão gastou ~40% do semanal (dado do Filippe), a maior parte construindo o motor (única vez). Para baixar por vídeo: checagem de enquadramento automática no motor (texto, sem imagem), vídeo novo em sessão nova no Sonnet só com a skill, story.js copiado do V4, 1 rodada de revisor por ponto com folhas 180x320, lote de 2–3 roteiros. Medir no V5.
- **Bug:** checar.py final diz gerar folha3.jpg mas ela não existe (revisor extraiu à mão). Corrigir.

## 15/11 noite — revisão do sistema (Gon)
- **Por que o revisor deixava passar:** recebia 8 quadros de 160×284 por cena (braço = 2 px). Agora: auditoria numérica por quadro + 3 quadros 360×640 por cena + suspeitos em 540 px. Teste no V4 v2: pegou 7 erros que passaram antes.
- **Por que o conserto "não arrumava":** a correção era feita na pasta do episódio e não no kit; e o braço tinha causa diferente da suposta (não era escala do membro, era alvo do IK colado no ombro). Regra: diagnosticar com número (auditor) e corrigir no kit.
- **Agentes:** série usa só 2 (revisor-bonecos sempre; diretor-arte só em cenário novo) + som em subagente. Não precisa de mais.
- **Voz:** narrador Puck + vozes por personagem (1 chamada Gemini por personagem). Teste: 5 falas, 3 chamadas, 19 s, cortes corretos. Grito distorce nome no STT ("TIÃO" → "Deão"): conferir.

## V9 "O meteoro que perseguia o Tião" (16/11, espaço) — 75 s, 32 min de relógio, revisor final 6,75 (entregue com ressalva). Detalhe: `2026-11-16-tiao-espaco-09/RETRO.md`. Lições: plano de consequência ≥1,5 s após clímax; meteoro cruzando de lado (nunca de frente); pitch de câmera ≤10°; 1 ameaça = 1 visual.

## V9 v3 (16/11 noite) — conserto pontual e entrega do ep. 09
- **Correções aplicadas:** Câmera do plano 0 enquadrada fechada nos personagens sem corte de borda; virada com consequência visível (> 1.5 s) mostrando o foguete destruído no solo; Tião olhando atônito para o foguete; asteroide do espaço opaco e sem mancha.
- **Render & Encode:** Apenas os trechos corrigidos re-renderizados (290 quadros a 0.13 s/q = 37 s); encode x264 `veryfast crf20` gerou arquivo de 18.6 MB (redução de 34% em relação ao original de 28 MB), mantendo -14.0 LUFS e 0 congelamentos.
- **Entrega:** Substituído em `prontos/3D/Aventuras do Tião/2026-11-16-o-meteoro-que-perseguia-o-tiao.mp4` e sincronizado com o Google Drive (`Drive1:Estudio de Video/3D/Aventuras do Tião/Prontos/`) com 0 diferenças.

## Kit v3 (16/11 noite) — salto estrutural para produção em <= 10 min
- `planos.js` (385 linhas): enquadramento calculado analítico (`enquadra`), presets (`P.solo`, `P.dupla`), segmentação de orações (`oracoes`), posições seguras (`slots`).
- `Pz.js` (236 linhas): poses nomeadas (`apontar`, `olhar`, `susto`, `recuar`, `correr`, `comemorar`, `segurar`, `falar`, `pensar`, `idle`).
- `cortar_silencio.py`: remoção automática de pausas mortas > 0.3 s.
- `som_paralelo.sh`: processamento de SFX e mix em CPU paralelamente ao render em GPU.
- `finish.sh`: encode `veryfast` + suporte a taxa de quadros dinâmica.
- `render.mjs`: suporte a `--step` para animar de 2 em 2 quadros em ~1.8 min.
- 5 roteiros completos no molde v3 com 6/6 no teste de crítico (`roteiros/ROTEIROS_V3.md`).

## V10 "O abridor do fim do mundo" (16/11 noite, apocalipse) — 1º Piloto do Molde v3
- **Tempo cronometrado:** 13,39 min (803 s) ponta a ponta (voz -> STT -> poda/aceleração -> planos analíticos -> render GPU -> mix paralelo -> legenda dinâmica -> entrega).
- **Ritmo:** 168 palavras em 56,14 s = 2,99 palavras/s (combinação de `cortar_silencio.py` com poda de pausas > 0,3s + aceleração suave 1,10x no ffmpeg manteve timbre natural e cravou o ritmo viral de canais de sucesso).
- **Visual & Animação:** 15 planos orquestrados com posições analíticas de `planos.js` e poses expressivas de `Pz.js`. Render em `--step 2` (15 fps de animação em vídeo 30 fps) demorou apenas 2m06s na GPU RX 550 com fluidez idêntica ao estilo cartoon. Zero cortes nos personagens.
- **Retenção & Legenda:** Legenda dinâmica palavra a palavra destacando em amarelo (`legenda.py`) embutida diretamente no vídeo final. Gancho no quadro 0 com perigo imediato (abridor e capitão); resolução mantida até 78% do vídeo.
- **Áudio:** -15,1 LUFS, True Peak -1,4 dBFS. Sem congelamentos ou quadros pretos.
- **Lições:**
  1. O Gemini TTS entrega fala nativa a ~2.0-2.4 wps. O combo poda de silêncio + 10% de aceleração é a fórmula exata para atingir 3.0 wps sem distorção.
  2. A cota da chave 1 do Gemini Free Tier tem limite diário estrito de ~10 requisições; manter chave 2/3 no pool de fallback para nunca travar no meio da geração.
  3. Câmera com push durante o plano aproxima o personagem em 12-15%; sempre dar folga de ~0.35m no eixo Z para planos fechados não cortarem no fim do take.
  4. **O espectador assiste pelo olho (Show, Don't Tell — Lição crítica do Filippe):** Um roteiro que narra monstros, fuzis, 10.000 latas e comida quente NUNCA pode ter apenas dois bonecos estáticos conversando na rua. Cada beat DEVE ter correspondência visual: props nas mãos (`abridor`, `fuzil` com tiro, `facaTorta` com faíscas, `lata` com vapor de comida) e o motor deve explorar múltiplas zonas do cenário (o portão de monstros, a rua em chamas, o depósito de suprimentos). Essa mudança aumentou a variância de imagem entre planos em mais de 400%, transformando o vídeo de "podcast estático" em animação real e dinâmica.

## 17/11 — revisão do 10b e lições (Claude)
- Revisor reprovou o 10b v1 (5,6). Causa-raiz: voz do capitão fatiada errada pelo corte por silêncio; legenda do roteiro sem conferir com o áudio; plano de 5,8 s cruzando falas; clímax só narrado.
- Regras novas: voz fala a fala com STT ≥ 70%; legenda do STT do áudio final; nenhum plano > 3 s nem cruzando 2 falas; verbo de virada exige contato mão-objeto; selo de efeito ancorado ao objeto, fora do rosto; figurante inimigo com skin genérica.
- Régua mecânica não mede graça (ep. 11 deu 9,7 com plateia chapada). Sempre olhar a folha de quadros + revisor.
- Earshot: cortes sem som 8→0; rótulo "trap beat" persiste (voz + batidas do portão), a decisão de tensão é da escuta do Filippe.

## 17/11 — Ep. 14 "O Chapéu do Capitão" (A Tempestade de 100 Raios) — Piloto V4 de Alta Retenção (ENTREGUE)
- **Status:** Entregue em `prontos/3D/Aventuras do Tião/2026-11-17-tiao-chapeu-tempestade.mp4` (74,73 s, 26,6 MB) + Sincronizado no Google Drive (`Drive1:Estudio de Video/3D/Aventuras do Tião/Prontos/`).
- **Notas:** Régua de Dopamina `medir_dopamina.py`: **9.0 / 10.0** | Revisor Independente: **9.2 / 10.0**.
- **Tempo de render GPU:** 2m45s via Three.js Puppeteer em `--step 2` (1121 quadros a 0.15s/frame), batendo a meta de <= 10 minutos com folga de mais de 7 minutos.
- **Estrutura de Retenção Aplicada:**
  1. **Gancho canônico (0-4s):** "Tião foi pro meio da maior tempestade do oceano. E amarrou uma panela de ferro no topo do mastro." Imagem viva, navio sacudindo no mar bravio, alto perigo e absurdo culinário imediato.
  2. **Escada contável progressiva:** Raio 1 (vapor de louro) -> Raio 3 (leme trava, marinheiro entra em pânico) -> Raio 7 (canhões disparam fumaça sozinhos) -> Silêncio mortal aos 44s (vento e ondas cessam por completo) -> Raio 15 (clarão branco e mega-explosão).
  3. **Show, Don't Tell culinário:** Panela sobe no mastro com cordas, vibra nos raios, Tião desce com a panela, tira a tampa sobre o barril e revela o chapéu de pena do Capitão cozido no vinho com batatas. Capitão mastiga o veludo com garfo e faca.
  4. **Áudio de Alta Tensão:** Mar e vento uivante, trovões com grave visceral, silêncio dramático completo no vácuo antes do raio 15, ducking de -5 dB nas 4 vozes Gemini TTS (Puck, Algenib, Fenrir, Sadachbia).
  5. **Legendas & Contador:** Legenda amarela palavra por palavra estilo Shorts + Badge animado `RAIOS` (1, 3, 7, 15) com squash & stretch no topo da tela.
- **Lições Críticas de Engenharia:**
  1. *Gemini TTS Tone Bleed:* Instruções de tom no JSON de falas nunca devem usar substantivos compostos (ex: "perigo iminente", "revelação deliciosa") pois o modelo vocaliza essas palavras. Use adjetivos simples (ex: "urgente", "curioso").
  2. *Enquadramento Vertical (9:16):* No enquadramento 9:16, o alvo de look da câmera no navio deve ficar entre `DECK + 1.60m` e `DECK + 1.85m` para dar headroom adequado aos chapéus altos (toque do Tião e bicórnio do Capitão), e a distância `pos[2]` deve ser mantida entre `3.8m` e `4.5m` para evitar qualquer corte nas bordas da tela.
