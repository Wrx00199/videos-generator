# Kit da série "Tião, o cozinheiro do navio" — REGRAS

Só regras e catálogo. O FLUXO (passos, comandos, tempos) está na skill `.claude/skills/estudio-bonecos/SKILL.md`.
**Roteiro e ritmo: molde v3** (seção "Roteiro e ritmo" abaixo; diagnóstico e evidência em `MOLDE_V3.md`; histórico em `GANCHO.md`). Pontos fortes/fracos e tempos: `RETRO.md`. Andamento: `ESTADO.md`.
**Catálogo (15/11):** elenco + vozes `catalogo/PERSONAGENS.md` e `catalogo/vozes.json`; cenários e pacotes `catalogo/CENARIOS.md`; estilos, formato de fala, durações e fila de roteiros `catalogo/HISTORIAS.md`.

**Cenários de aventura (16/11):** `motor3d/cenarios.js` + `catalogo/CENARIOS.md` (seção "CATÁLOGO DE CENÁRIOS DE AVENTURA"). Prontos: `espaco`, `brinquedo`, `cidade`, `bermudas`, `maia`, `amazonia`; efeitos em `motor3d/efeitos.js` (tornado, furacão, chuva, terremoto, tsunami, meteoro, raios); elenco de aventura em `catalogo/PERSONAGENS.md` (15 personagens novos: heróis, vilões, alienígenas, gigante, mutante, monstro, robô, folclore) (cada um com câmeras e lista "NÃO fazer"; stills em `catalogo/cenarios/`). O vídeo só escolhe (`worldAt: cenario:'<id>'`), não reconstrói.

## Universo
> **Conceito (Filippe, 15/11 noite): tipo Rick and Morty — o Tião vai pra aventuras loucas e diferentes a cada vídeo** (planeta, época, jogo…), com personagens e cenários novos. O navio e o elenco abaixo continuam valendo (pode ter vídeo no barco, tripulação junto), mas não limitam a série.
> **Regra fixa:** o Tião SEMPRE usa o chapéu de cozinheiro (em qualquer aventura/roupa). Os outros personagens podem trocar de roupa conforme a aventura.

- Navio pirata (casco vermelho, faixa branca, escotilhas amarelas, amurada verde-água, velas listradas vermelho/branco, bandeira vermelha). Comparar todo plano com `referencia/FOLHA_MODELO.jpg`.
- Elenco fixo, mesmo desenho sempre (cabeça redonda branca, contorno grosso, membros de palito):
  - **Tião** (`tiao`): cozinheiro, o menor, chapéu de chef, avental branco. Protagonista.
  - **Capitão** (`cap`): casaca azul, bicorne, bigode.
  - **Beto** (`mar1`): bandana vermelha, camiseta listrada laranja.
  - **Zeca** (`mar2`): gorro, colete verde.
  - **Pirata** (o papagaio): verde/amarelo, cabeça vermelha, cauda azul/vermelha. Na narração dizer "o papagaio" (não "o Pirata").
- Cada vídeo = história ÚNICA; fixos só navio e elenco. Cenário segue a história (ilha, porto, fundo do mar...).
- Mundo ampliado (só se a história pedir; máx. 1–2 novos por vídeo, entram na FOLHA_MODELO): Ilha das Palmeiras, Porto da Vila, navio rival (preto, velas roxas), fundo do mar, Ilha Gelada, caverna do tesouro. **Já construídos no motor 3D:** Ilha das Palmeiras, navio rival + batalha naval (canhões, tiros, corda, duelo, luz tempestade/batalha, transição "acordou do sonho"); Capitã Ruiva e piratas `riv1`/`riv2`; tripulação temida "Os Bravos do Coral" (Capitão Barbacoral e dois brutamontes gigantes, navio azul-petróleo de velas mostarda); mar com ondas animadas (calmo a tempestade). Nova tripulação rival = `tripulacao()` no rig + `FROTAS` no mundo (ver `motor3d/LEIA.md`). Só personagens NOSSOS: nada copiado de outra obra (nome, desenho, roupa). Folha: `referencia/FOLHA_MODELO_batalha.jpg`. Recorrentes: Dona Cotinha (taverna, coque, avental verde), Capitã Ruiva (tricorne vermelho, tapa-olho), Nico (grumete, boné), Seu Bento (pescador, chapéu de palha, barba branca), o Polvo do V3, Tenaz (caranguejo da ilha).

## Regras do Filippe (obrigatórias)
- Animação REAL (membros/ações), nunca slideshow; câmera não substitui animação.
- **Duração 50–75 s** (molde v3, 16/11; antes 70–120 s). **Legenda:** só a palavra a palavra do kit (`legenda.py`), em TESTE (ligada no piloto 10; vira padrão ou sai depois de medir); nenhum outro tipo de legenda. Vídeo longo (5–10 min) só depois, como minissérie.
- **Vozes:** UMA voz conduz ~75% do texto: o narrador de fora (Gemini **Puck**) ou o próprio Tião em 1ª pessoa (testar os dois). Outros personagens: 3–5 falas curtas, cada um com a PRÓPRIA voz (`catalogo/vozes.json`) via `vozes_elenco.mjs` (1 chamada por personagem → 2–3 chamadas por vídeo). Uma chave por vez; próxima só no 429. Nunca mostrar chave. Nada de Kokoro/Piper.
- **Público infantil:** humor de meme, sem palavrão, sem violência real. Personagens com nomes brasileiros engraçados; paródia só do TIPO, nunca nome/rosto/bordão de famoso.
- **Foco variado:** todo episódio dá foco a 1 coadjuvante/antagonista (close, falas, reação), não só ao Tião.
- **Gancho:** a 1ª frase começa com "Tião foi…" (narrador) ou "Eu fui…" (Tião narrando) + ato ou regra estranha com algo em jogo; quadro 0 já mostra o objeto-chave em movimento. Fecho: corte seco ou callback da 1ª frase com sentido novo. **Sem CTA.** Estrutura completa na seção "Roteiro e ritmo (molde v3)".
- Portão automático (auditoria de enquadramento + planos) antes do render; **UMA passada** do revisor no final, sem re-render (o que reprovar vira regra no kit para o próximo).
- Entrega: só o MP4 em `prontos/3D/Aventuras do Tião/<data>-<slug>.mp4` (cada série/canal com a própria subpasta). Nunca publicar. Um render por vez. Não refazer vídeo antigo sem pedido.

## Roteiro e ritmo (molde v3 — regra única, 16/11)
Fonte da evidência: `MOLDE_V3.md` (~25 shorts de 9 canais). Roteirista, crítico e revisor seguem ESTA seção.
- **50–75 s · ≥ 2,8 palavras/s sem ar morto (pausa > 0,3 s só no suspense) · 1 plano por oração (25+ planos/min; mediana de plano ≤ 2,6 s).**
- Beats (tempos para 60 s; vídeo maior estica a escada e mantém a virada depois de 70%):
  1. **0–4 s GANCHO** "Tião foi [lugar/ato louco] e [regra ou gesto estranho com aposta]". Quadro 0 = objeto-chave em movimento.
  2. **4–10 s SETUP** onde estamos, quem manda (o cético com poder) e o que está em jogo. A pista aparece nítida aqui (antes de 12 s).
  3. **10–36 s ESCADA** 3–4 degraus de 6–8 s: a MESMA unidade cresce e dá para contar. O cético zomba 2–3 vezes. Um falso alívio no meio.
  4. **36–43 s PIOR MOMENTO** parece que o Tião errou; todos contra ele.
  5. **43–50 s VIRADA** (depois de 70%), mostrada em imagem, com ≥ 1,5 s de consequência no objeto afetado.
  6. **50–58 s PORQUÊ** o mecanismo em 1–2 frases.
  7. **58–60 s FECHO** corte seco ou callback da 1ª frase. Sem CTA.
- Proibido: explicar antes da virada; personagem contar o que a imagem pode mostrar; duas orações seguidas no mesmo plano parado; a frase antiga "O Tião só queria um dia de paz…"; CTA no fim.
- Viagem = 1 cenário do catálogo + a regra estranha daquele lugar. Só o que o motor já tem. Objeto de payoff aparece ≥ 2 vezes antes da virada e tem estado "depois" pronto (`destruido`).
- **Teste de 6 perguntas (crítico; reprova com 1 "não"):** 1) depois da 1ª frase dá para dizer a pergunta do vídeo? 2) a pergunta só fecha depois de 70%? 3) tem uma unidade que cresce em ≥ 3 degraus contáveis? 4) o Tião tem um plano e alguém com poder duvida dele (ou o gancho é paradoxo/mito/"e se" forte o bastante)? 5) a virada usa pista mostrada antes de 12 s e muda o sentido do que vimos? 6) tem oração a cada ~2 s, sem explicação parada?
- **Revisor (uma passada):** "eu ficaria até o fim?" + mediana de plano + evento no quadro 0 + consequência ≥ 1,5 s depois do clímax.

## Agentes obrigatórios (16/11)
- Régua de retenção: `DOPAMINA_UNIVERSAL.md` (alavancas, Mapa de dopamina, checklist de reprovação).
- Nunca produzir episódio sozinho: cada etapa abaixo é feita pelo agente dela (`.claude/agents/`), não pelo agente principal.
- Ordem fixa: `roteirista-bonecos` (falas.json + NOTAS.md + MAPA_DOPAMINA.md) → `critico-roteiro` (critica.md) → `diretor-retencao` (retencao.md, LIBERA/DEVOLVE) → só então voz e render → `revisor-bonecos` (veredito).
- Voz/Gemini e render só depois do LIBERA do diretor-retencao. Sem LIBERA, nada gasta cota.
- Todo subagente é chamado com modelo explícito na chamada (roteirista, crítico, diretor-retencao e revisor: `opus`).

## Checklist do revisor (erros que o Filippe já pegou)
1. Deitado DENTRO da rede/cama; nenhum membro atravessando tecido/objeto.
2. Objeto em balão de pensamento cabe inteiro, bom tamanho; balão simétrico.
3. Nada aparecendo onde não devia (pé embaixo de barril, corpo saindo da rede, membro na parede).
4. Pose natural para a ação: escalar = mãos no mastro; segurar = objeto NA MÃO; mexer panela = concha DENTRO da panela, para baixo.
5. Escala consistente (papagaio, colher, panela, fogão); Tião baixinho usa caixote.
6. Bicho voando = voo de verdade (corpo inclinado, asas batendo, arco).
7. Objetos com volume (vidro com conteúdo e brilho, metal com reflexo, madeira com veio).
8. Ação bate com a fala do momento; STT bate com o roteiro e não confunde.
9. Sem tela parada > 1,5 s, ninguém cortado na borda sem intenção (o portão do motor acusa por plano). Legenda só a palavra a palavra do kit, quando ligada.
10. **Gancho** (regra nº 1): quadro 0 já com o objeto-chave em movimento (evento, não cenário); "Tião foi…"/"Eu fui…" começando no 0 s. Reprova cenário vazio, plano geral parado, título.
11. **Identidade:** navio/elenco iguais à FOLHA_MODELO e reconhecíveis em todo plano (de fora ou embaixo d'água = navio inteiro com velas). O que a fala cita aparece. "Um espectador saberia que é o navio/personagem da série só por esse quadro?"
12. **Cenário bonito** (V4+): luz definida, sombra de contato, textura pintada, profundidade (névoa/desfoque). Reprova chapado ou com cara de rascunho.
13. **Plano com movimento** (entra/sai/anda/pula): conferir COMEÇO, MEIO e FIM — nada entra cortado na borda (Filippe pegou o bote do V4 entrando cortado; o storyboard de 1 quadro não mostrava).
14. Quadro-chave mostra a mão e o objeto da ação principal; folga ≥ 12% nas bordas; ninguém empilhado (chapéu atrás de chapéu).
15. **Falas:** cada personagem com sua voz, fala curta e com emoção; STT de cada fala bate (grito pode distorcer nome: conferir).
16. **Fluidez:** nenhum "salto" dentro do plano (água/membro/objeto estalando) — `checar.py` lista os quadros.
17. **Retenção visual e multi-zona (Show, Don't Tell — 16/11):** O espectador assiste pelo olho, o áudio é só o reforço. O que a narração cita DEVE aparecer na tela: se a fala cita monstros, portão, faca entortando, fuzil atirando, latas blindadas ou comida quente, esses objetos e zonas DEVEM ser mostrados nos planos correspondentes com props reais na mão e câmeras explorando diferentes partes do cenário. Proibido vídeo de cenário fixo com dois bonecos parados batendo boca sem props ou acontecimentos visuais.
O revisor recebe a FOLHA_MODELO, explica o PORQUÊ de cada problema e julga primeiro "eu ficaria até o fim?". Nota por parte (8 partes); aprova com média ≥ 8 e nenhuma parte < 7. **Uma passada só**: reprovou, anota no RETRO, corrige no kit e segue (sem re-render do episódio, salvo defeito grave que o Filippe pedir).

## Pontas soltas: NUNCA podem ocorrer
Ponta solta = algo que o espectador estranharia no mundo do desenho. **Portão automático (15/11):** `cd <proj>/web && node render.mjs --auditar "0-<N-1>" 2` (≈3 s, sem imagem) acusa braço dobrado com cotovelo espetado, mão que não alcança o objeto, boneco cortado/colado na borda, cabeça cortada no topo e boneco pequeno demais. **Zero aviso de "cortado"/"espetado" antes de renderizar** (ou justificar no PLANO.md: saída de quadro intencional). Já aconteceu: bonecos flutuando na frente do fogão (V3), navio embaixo d'água sem velas (V3), braço atravessando a rede, pés embaixo do barril, concha fora da panela (V1/V2), bote do V4 entrando cortado e tripulação "sem pernas" flutuando acima da borda do bote (corrigido: pose sentado com quadril no banco), **braço do capitão com cotovelo espetado pra cima atrás do chapéu (V4: alvo do IK colado no ombro; coçar cabeça = mão DO LADO da cabeça, ex. `ik:[-98,-268]`)**, **pedra com cara de domo de arame (V4: geometria facetada risca cada face na tinta; usar `pedraLisa()`/esfera indexada, nunca Icosahedron)**.
1. **Apoio e física:** tudo apoiado (pé no chão com sombra de contato; objeto na mão/mesa/chão). Ninguém flutua, nada atravessa nada.
2. **Profundidade:** mais ao fundo = menor e mais distante; a frente cobre o fundo.
3. **Identidade:** navio, elenco e objetos iguais à FOLHA_MODELO.
4. **Continuidade:** o que mudou fica mudado; ninguém troca de lado sem motivo; luz/clima não mudam sozinhos; objeto não some/aparece entre cortes.
5. **Lógica:** causa visível e alcance possível; olha para onde está a coisa; expressão combina.
6. **Leitura no celular:** nada importante na borda; objeto-chave grande.
7. **Tempo:** gancho no 1º segundo, nada parado > 1,5 s, ação na palavra.
**Regra de correção (15/11):** bug de cenário/objeto/ação se corrige NO KIT (`motor3d/`, `rig.js`), não só na pasta do episódio — senão volta no próximo vídeo (aconteceu: o conserto do baú/bote/pedra do V4 ficou só no V4). Depois de corrigir: `bash gerar_elenco.sh` se mexeu no rig, e anotar aqui + Second Brain.
8. **Geometria:** nada facetado/riscado/vazado (objeto curvo = geometria indexada com normais suaves; tampa/meia-casca = `DoubleSide`); nada "faltando pedaço" visto de qualquer ângulo usado.
9. **Fala de movimento = movimento visível:** cada verbo de deslocamento da fala ("três pra esquerda", "pula", "corre") tem movimento distinto na tela (V4 P7).
10. **Objeto muda de mão/lugar só com gesto:** quem pega, pega na tela (≥ 6 quadros com a mão em contato); nada surge na mão entre cortes (pá e mapa no V4).
11. **Revelar objeto = trajetória:** baú/objeto-chave sai do lugar em arco, com contato, nunca "teleporta" num puxão de 0,5 s.
12. **Profundidade de pé:** personagem do fundo não tem o pé encostando na borda de objeto da frente (Zeca "em cima" da tampa no V4); separar ≥ 1 corpo ou pôr atrás.
13. **Quadro cheio:** grupo no terço central, área vazia (areia/céu sem nada) < 30% do quadro.
14. **2ª reprovação do mesmo plano = simplificar** (close do objeto, gesto mais simples), não repetir o mesmo pedido; flashback precisa de gesto legível, sépia não é ação.
15. **Braço natural (V5, Filippe):** braço "bugado" (cotovelo pra cima/pra dentro, palito em zigue-zague) é proibido em qualquer vídeo. O rig (`armG` no `rig.js`) já escolhe o cotovelo pra baixo/pra fora, estica alvo colado no ombro e limita a dobra a 110°; braço de esforço (erguer, agarrar) prefira ângulo direto (`aR: [2.9, -0.2]`) a IK chutado.
16. **Fogo tem cara de fogo (V5, Filippe):** chama = várias línguas, base larga, quadros alternando (kit: `TEX.chama`/`chamaAzul`, 3 quadros), tamanho da boca do fogão; nunca um cartão único gigante (virou "cebola"). Troca de cor é seca (laranja → azul), sem mistura rosa.
17. **Câmera de convés DENTRO do navio** (z entre -2,45 e 2,45): de fora, a amurada tapa metade do quadro. Grupo grande no convés = aproximar os bonecos, não abrir fov além de ~70.
18. **Acertar câmera por número:** `render.mjs --auditar` grava `medidas` (x0/x1/ytop de cada boneco na tela, -1..1) em `auditoria.json`; corrigir pelo número, não no chute.
**Regra estrutural:** interação recorrente (mexer panela, segurar, sentar, deitar, escalar, ficar em pé) só com função AMARRADA do motor, que calcula a pose a partir do objeto. Nunca digitar à mão a posição de mão/concha/pé. Antes do revisor, o produtor responde as 7 perguntas para cada quadro-chave.

## Padrão visual (V4+): "2D em mundo 3D com tinta"
- Bonecos: mesmo desenho, tinta ameixa `#241726` mais grossa embaixo/à direita, gradiente leve no tronco, sombra de contato, pegam a cor da luz (dourado/noite). Cabeça branca nunca brilha.
- Cenário: luz por momento (dia, dourado, noite), sombra azul-violeta (não preta), texturas pintadas (tábua com fresta, casco vivo), névoa = cor do horizonte, desfoque de lente só em close/médio, vinheta leve. Valores medidos em `referencias/2026-11-15-aiplaybook-stickman/RESUMO_APLICAVEL.md` (material de estudo).
- Câmera em glide contínuo (push lento em toda pausa), tremor curto no impacto, corte seco só em salto de lugar/tempo.

## Já produzidos (não repetir história)
- `2026-11-15-o-cozinheiro-tiao` — Tião desprezado salva o navio na tempestade com sopa de peixe.
- `2026-11-15-o-papagaio-do-capitao` — papagaio some; estava na cozinha comendo biscoito.
- `2026-11-15-o-monstro-do-mar` (V3) — tentáculo à noite; monstro devolve a tigela vazia e entra na fila da janta.
- `2026-11-15-o-mapa-do-tiao` (V4, motor 3D) — mapa do tesouro na ilha; o baú tem a receita da avó, e foi o Tião que desenhou o mapa e esqueceu.
- `2026-11-16-o-meteoro-que-perseguia-o-tiao` (ep. 09, espaço, 75 s) — Astro apaga o farol dos cristais e o meteoro da família da Zorbina cai no foguete do Tião.
- (roteiro pronto, sem voz/vídeo) `roteiros/06-batalha-sonho.txt` — Capitã Ruiva ataca pela receita da sopa; era sonho do Tião e o "canhão" era o ronco dele.

## Lições técnicas que valem para qualquer motor
- **Voz (V5):** tom com "rouco" fez o Gemini bloquear a fala (PROHIBITED_CONTENT) 3x; usar "cansado, sério, devagar". Uma chave por vez (Filippe): só passar pra `_2`/`_3` quando a anterior der 429, nunca rodízio automático. Fala bloqueada não derruba as outras (`vozes_elenco.mjs` lista as faltantes). Corte por silêncio erra fala com reticências: conferir por STT de cada bruto e recortar à mão; depois `vozes_elenco.mjs <falas> <voz> --montar` (só monta, 0 chamadas).
- **Peças novas do motor ANTES/EM PARALELO com a voz** (Filippe, V5): cenário, personagem e prop novos se constroem enquanto a voz espera cota; nunca esperar a voz pra começar o motor.
- Sobrancelha: bravo = ponta interna desce; susto = sobrancelha alta + olho arregalado (errei no V3: Tião bravo na surpresa).
- Espada/objeto longo: inclinar para longe da cabeça; objeto perdido sai do rosto antes do quadro-chave.
- Grupo espiando: lado a lado, menor, mais ao fundo, folga ≥ 100 px da borda.
- Ação fora de quadro: dar reação + câmera + efeito, nunca tela parada.
- Plano embaixo d'água: navio inteiro reconhecível, não casco genérico.
- STT `base` erra muito: conferir com `small`.
- Nome trocado sem cota: recortar a palavra de outro trecho da mesma gravação (atrim + acrossfade) e conferir no STT.

## Legado (canvas 2D + HyperFrames, V1–V3; só consulta/plano B)
`rig.js` (rig com relevo, `stirPot`, `holdBowl`, `toBody/toWorld`), `lib_v3.js` (tentáculo, olho, tigela, espada, fundo do mar), `fim.js`, `planos_*.js`, `index_modelo.html`; `rig_e_exemplo.js` é só exemplo de planos (17 planos do papagaio). Montagem antiga: `cat rig.js lib_v3.js planos_cabecalho.js <planos>.js fim.js > anim.js` e `node ferramentas/render.mjs`. Biblioteca do V3 em `2026-11-15-tiao-monstro-03/anim/parte2.js`.

- **Personagens novos (16/11):** nada de acessório flutuando, sobrancelha só onde faz sentido, pés de frente — regras em `catalogo/PERSONAGENS.md` (fim da seção Terror). Conferir a folha inteira (zoom) antes de entregar.
- Cenários extra (16/11): cyberpunk, apocalipse, cemiterio, parque, dojo, fundomar, nuvens, arena, floresta → `catalogo/CENARIOS.md` (seção EXTRA), módulo `motor3d/cenarios2.js`.
- Monstros (zumbi, vampiro, palhaço, lobisomem, sombra, esqueleto) têm UMA boca animável: pose `mouth` flat/smile/frown/wavy/smug = fechada; qualquer outra + `mo` = aberta.

- **Ep. 09 (16/11):** (a) todo clímax visual tem plano de consequência do objeto afetado ≥ 1,5 s antes de cortar; (b) uma ameaça = um visual só; (c) meteoro cruza o céu de lado (de frente vira disco laranja sem cauda); (d) câmera inclinada pra cima (pitch > 10°) tira os bonecos do quadro; (e) espaço sem mar: `"mar":{"nivel_db":-90}` no eventos.json (mix zera a cama); silêncio de vácuo antes do impacto vira silêncio total conferido com silencedetect; (f) cristais do espaço: `espaco:{cristais:0..1,pulso:vel}`; (g) 3 bonecos lado a lado: câmera `cm` pos z≈7,3, fov 54 (WD).


## Regras V4 (18/11/2026) — 1 linha cada, checadas por `portao.py`
- `eye` só vale `dot|wide|happy|shut|smug|x`; `look/grin/blink/wink` não desenhavam (boneco sem olho). O rig agora cai em `dot`, mas o portão reprova.
- Todo vídeo: duração 50–90 s, ≥2,5 pal/s, ≥15 planos/min, nenhum plano >5 s (afrouxado 18/11 pelos 5 reels BR), áudio -14 LUFS ±1, pico ≤ -1 dBTP, 1080x1920, com faixa de áudio.
- No máximo 1 contador/HUD por vez e sem sobreposição de caixas (`contadores.json`).
- Só personagem e cenário de `catalogo/aprovados.json` com `ok:true` (regenerar com `aprovar_catalogo.py`; veredito visual em `catalogo/revisao_visual.json`).
- Roteiro: `formato` (e_se | o_que_aconteceria | se_voce | desafio | tiao_foi | fato_estranho), regra+prazo+perda na 1ª frase quando for desafio, 1ª frase ≤16 palavras, narrador + ≤1 voz, Tião presente, escada numerada (Hora/Dia/Problema N), `virada` entre 65% e 92%, **fecho com pergunta ou escolha ao público** (revoga o 'sem CTA' do v3), 150–240 palavras.
- Cenário `apocalipse`: sempre `apocalipse:{grade:false}` no worldAt (a placa do portão tapa os bonecos).
- Câmera só do banco de 8 (`motor3d/cameras.js`), nunca igual em planos seguidos, ≥5 distintas, ≥3 ambientes em ≥60 s; alvo medido por `caixaDe(bb)`, folga ≥12%.
- Voz: 5 chaves em rotação (`voz.mjs`); exit 3 = parar. Corte de silêncio só nas pontas (`aparar_pontas.py`); STT por fala ≥70% (`conferir_fala.py`).
- Render só por `render_leve.sh` (nice/ionice, um por vez). 1 episódio por vez (`portao.py novo`, `APROVADO_FILIPPE`).
- Personagem feminino: usar `makeup` ou `semRelevoQueixo:1` (o cinza do queixo lê como barba).
- `gerar_elenco.sh` apaga `bruto` e `gerente` (só existem no elenco.js): não rodar até migrar para o rig.js.
- Escada numerada: pelo menos 3 falas com degrau marcado no texto e na tela ("Hora 3", "Dia 7", "Problema 2"), com HUD ÚNICO (`contador.py`, valores por tempo: ex. "HORA 12 · R$ 70 bi") mudando a cada degrau; legenda palavra a palavra com a palavra-chave colorida (`legenda.py`). Checado por `portao.py roteiro` (`escada_numerada`).

## Lições do ep. 31 "7 dias acordado" (18/11/2026, 1º vídeo pelo fluxo V4 completo) — checado em código quando marcado [código]
- [código] **TTS lê o campo `tom` em voz alta** ("esterioso", "Sombrio" abriam as falas 6 e 9). `conferir_fala.py` agora devolve `sobras` (palavra ≥5 letras ouvida e fora do roteiro na PONTA da fala) e reprova; teste em `tests/test_voz_ferramentas.py`. Preferir falas SEM `tom` para narrador. Sem tom a voz fica ~7% mais lenta (2,49 pal/s): escrever mais curto ou usar `atempo`.
- [código] `vozes_elenco.mjs --por-fala`: o corte por silêncio do lote casou a CONTAGEM mas errou os limites (fala 3 com 11,8 s). Verificar cada fala por STT; se duvidar, `--por-fala` (1 chamada/fala).
- Cota Gemini: as 5 chaves esgotaram na 2ª geração do dia. Voz v1 foi reaproveitada cortando só a palavra vazada (mantendo a duração com `adelay` para não mudar os tempos). Cada geração extra custa cota: acertar o texto ANTES da 1ª voz.
- **O portão só mede estrutura; o revisor reprovou (5,1) um vídeo que passou em tudo**: a imagem não mostrava o que a fala dizia (reflexo/panelão/fogão inexistentes). Regra: todo substantivo-chave das falas da virada e do fecho precisa existir como objeto de cena no `story.js` ANTES de gerar voz e render; o objeto da virada aparece em quadro antes de 30% do vídeo.
- Cenário tem clima: arco-íris/nuvens nos dias de medo contradiz a fala. Medo = cemitério/noite; o delírio pode ser o quarto de brinquedos.
- Props novos sem 3D: cartão `objeto()` desenhado com `E.ell/E.fs` (panelão, cebola em `web/story.js`), estado por chave quantizada.
- `epi.js` não usa o banco de câmeras: `story.js` próprio avalia `CAMERAS[nome](caixa,u)` POR QUADRO (lerp de 2 chaves quebra whip_pan e órbita). Caixas pequenas (h ≈1,2–1,4 m) deixam o Tião maior no quadro; corte_transversal esconde um dos dois atores quando estão em linha no eixo x.
- Tempos: render leve 1078 quadros = 2m30s; o gargalo do cronômetro foi montar o story à mão (~25 min), não o render.

## Lições do ep. 32 "Bermudas: a sopa" (19/11/2026, molde V5, 1º com cenário 3D com relevo)
- **Cenário `navioberm`** (`motor3d/cenarios3.js`): deck/amuradas/barris/caixotes com RELEVO (`bumpMap` pintado junto com o veio da madeira, `madeira(seed, rx, ry)`), panelão 3D (`Lathe`) com SOPA de comida (caldo pintado + cenoura/batata/ervilha em 3D flutuando + bolhas, nível `sopa` 0..1, `tampa` 0..1, `treme`, `vapor`, `fogo`), névoa em camadas (planos com máscara radial, `nevoa`), lua, navio fantasma (`fantX`), cadeira (`cadeira:{x,z,ry}`, `corda:1`), balde (`balde:{x,z}`). Luz `navioberm`. `POT = (0.95, 0.35)` local.
- **Relevo/ambiente = regra do Filippe**: nada de objeto "pintado só com rabisco"; comida com cor de comida; madeira com veio, junta e prego; sombra de contato; névoa.
- `THREE.Sprite` vira MANCHA PRETA na passada de tinta (ink) do `main.js`: vapor/halo = planos `Mesh` cruzados com `userData.ndSkip`.
- Plano de névoa/halo precisa de máscara de borda (alfa 0 nas bordas) senão aparece o retângulo.
- Câmera do banco: `abertura_push`/`travelling_lateral` em caixa larga (>3 m) vão pra DENTRO/ATRÁS da parede (distância sai da caixa). Para grupo largo usar câmera manual (`cm`) a 8–10 m. `orbita` em objeto perto da amurada sai do casco: usar `detalhe_objeto`/`plongee`.
- Barril/caixote entre a câmera e o alvo escondem o objeto (balde atrás de barris): checar o plano em still.
- Voz: estilo "suspense/voz baixa" no `elenco.narrador.estilo` deu SAFETY (bloqueio) e 1,5 pal/s; voltar ao estilo padrão. Sem `tom`; velocidade com `atempo 1.22` por fala + `aparar_pontas` + `vozes_elenco.mjs --montar` (2,2 -> 2,9 pal/s, sem gastar cota). O lote falha com SAFETY às vezes e cai em fala a fala (14 chamadas).
- Personagens novos aprovados (`rig.js`, grupo `bermu`): `tonho` (gordão bigodudo), `dede` (grumete magrelo), `chiquinha` (marujinha de tranças). `novo_ep.sh` agora copia `cenarios3.js` e `cameras.js`.
- Projeto criado à mão (o `portao.py novo` travava por falta de `APROVADO_FILIPPE` do ep. 31): o Filippe mandou fazer o B direto.

## Feedback do Filippe sobre o ep. 32 (19/11) — REGRAS NOVAS
- Série B de suspense/terror = terror de verdade (mistério, sumiço, vulto, rangido). SEM comida/sopa/panela como centro; exemplo de relevo que ele deu não é pedido de tema.
- Personagem dentro de objeto (cabeça no panelão) lê como bug, não como virada. Nunca esconder tripulante dentro de recipiente.
- HUD 'HORA N' genérico (pílula amarela). Próximo episódio: desenhar contador temático (ex.: relógio/lua/vela que apaga), sem mexer na regra de 1 contador.
- Antes de gastar voz+render: mostrar a premissa em 3 linhas no estado; tema escolhido por mim deve ser o que ele pediu (suspense/terror), não o mais fácil de animar.

## Entrega no Drive (ordem do Filippe, 19/11)
- Ao terminar um episódio (portão final ok + revisor), enviar o MP4 para o Google Drive: `rclone copyto <proj>/final.mp4 "Drive1:Estudio de Video/3D/Aventuras do Tião/<nome-da-pasta-do-ep>.mp4"` (remote Drive1, pasta já existe). Manter cópia local. Registrar no estado "no Drive, aguardando OK".
- Isso NÃO é publicação em rede social: TikTok/IG/FB continuam só com OK dele.

## Melhoria contínua (ordem do Filippe, 19/11)
- Cada episódio tem de ser melhor que o anterior: raciocinar antes (roteiro, retenção, beleza/harmonia), buscar referências/ideias novas, criar personagens e cenários ANTES do episódio que os usa. Autenticidade: algo que a maioria dos canais não faria. Anotar 1 aprendizado por episódio no Second Brain.
- Publicação: só com OK dele; vídeos do Tião saem antes dos clipes (clipes mais tarde).

## Postagem e Codex (ordem do Filippe, 19/11 11:40) — substitui "só com OK"
- Tião: postar no YouTube Shorts (canal dele) via claude-in-chrome após portão final + revisor, sem OK extra; 1º do dia ~12:30, 2º à noite (~19:30). Nunca digitar senha; sem login = parar e anotar. TikTok sem API/login: não tentar (ele posta à mão).
- Delegar trabalho mecânico ao Codex: `codex exec "<pedido>"` (~/.local/bin/codex), conferir o resultado.

## CORREÇÃO (19/11 11:50): Tião NÃO posta no YouTube (sem login/API; rclone é só Drive). Só guardar no Drive; ele posta à mão. Vale acima da seção anterior.

## Lições do ep. 33 "Bermudas: as sete velas" (19/11/2026, série B terror, 1º com tema de verdade) — revisor 6,1 na 1ª versão
- **Terror com luz de dia não assusta**: série terror usa luz `navioterror` (azul-escuro, `luzes.js`) + `nevoaCor`/`luaCor` azuis no `navioberm`; flashback no `fundoescuro` (nunca o cenário alegre do catálogo sem tintura). Lanternas `escuro` ≥0,55 desde o início.
- **Pista falada tem que estar EM QUADRO no mesmo segundo** (pegadas molhadas ficaram minúsculas no 1º render; agora pegadas 0,3x0,6 com contorno claro e plongée sobre elas). Candidato a checagem no portão (plano da fala `pista`).
- **Virada mostrada**: pés + poça + pegadas saindo do boneco, câmera manual baixa de lado (vela fora do eixo). Cabeça de boneco não pode ficar na faixa do HUD (topo ~22%).
- **HUD temático** = `hud_velas.py` (PIL → .mov qtrle com alfa, overlay em y=105; vela apaga com fumaça/brasa e reacende; vela do Tião com aro dourado e chama azul). `contadores.json` continua existindo só para o portão (rótulo VELAS). `montar_final.sh <proj> hud_velas.mov 105` (`HUD_OFF="ini:fim"` esconde o overlay no flashback).
- Cenário `navioberm`: `semPanela:true` tira o panelão; novos estados `velas[7]`, `fumaca[7]`, `azul[7]`, `pegadas 0..1`, `poca{x,z,r}`, `vulto{x,z,op,s,ry}`, `escuro`, `nevoaCor`, `luaCor`. Velas e fila usam espaçamento 0,62 m (câmera ≥8 m para os 7 caberem).
- Fila larga de 7 em retrato: boneco ≈15% da altura; push-in corta as pontas (auditoria). Usar push só até z≈8.
- O `HORA N` da narração é exigido pelo portão (escada_numerada) mas o revisor leu como cacoete do ep. 32: avaliar trocar o regex do portão por "Primeira vela/Dia N/Problema N" e regravar. **Pendente**, não feito (gasta cota de voz).
- Voz do narrador no estilo padrão: 2,17 pal/s; `atempo 1.22` por fala + `aparar_pontas` + `--montar` → 2,80 pal/s sem gastar cota. STT acusa "sobras" falsas (soprar/vez Tião) <0,78: ouvir/olhar o texto antes de regravar.
- Armadilhas de fluxo: `render_leve.sh auto` só acha `TOTAL = <número>` literal (passar "0-N"); `pgrep -f nome` dentro de `bash -c` casa com ele mesmo (loop infinito): esperar por arquivo marcador (grep -q FIM render.log).

## Regras do Filippe (19/11 noite)
- Bug de pose/frame parado (Tião voando como foto): QA de TODOS os planos antes do revisor; sem amostra.
- Roteiro/estrutura antes de beleza; copiar esqueleto de referências boas. Alvo: 10+ episódios aprovados acumulados.

- Infográfico (ep.34): sempre completo, destacado, bonito; componente reutilizável criado via Codex/Gemini.

## Ep. 33 reprovado (19/11): zero tensão
- "Vela apaga, personagem some" repetido = sem terror. Tensão = construção em camadas, zoom lento, silêncio, consequência vista, virada que reinterpreta pista, sound design. Usar referências e rodar critico-roteiro + diretor-retencao antes de voz/render.

## Lições do ep. 34 "R$ 50 milhões e 1 centavo" (19/11/2026, série A dinheiro) — revisor 6,1 na 1ª versão
- **Cartão de prop (`objeto`) é uma janela de ±222 unidades (≈1,3 m, 333 un/m)**: desenho maior é cortado (a mansão só mostrava a porta). Objeto largo = várias janelas lado a lado: `strip(k, x, z, [offs])` + `faixa()` (story do ep. 34). Prop animável: `sc` (escala) no estado → "puf"; `y` pode ser função.
- Prop citado na fala tem que estar DENTRO do quadro (relógio 11:57 ficou fora do OBJ, jato atrás da nuvem, moeda do "1" cortada). Cenário com elemento na frente (banco de nuvens do `nuvens`) exige câmera acima dele (box y≈1,7). Revisor pede checar isso no portão.
- Fala de sumiço/transformação: mostrar o objeto em quadro ANTES e o efeito na palavra (puf com escala→0 em 0,45 s), e o HUD só zera depois (HUD vermelho em 0,00 antes da regra disparar confunde).
- ROSTO(y=1,42): com y=1,3 o chapéu do capitão entrava sob o HUD do topo.
- HUD de dinheiro: `hud_saldo.py` (cartão de banco verde, saldo rola em 0,7 s, ≤R$1 vermelho/pisca). Marcas em `marcas.json` {SAL:[[t,valor]]}. `montar_final.sh <proj> hud_saldo.mov 110`.
- `voz_ep.sh <proj>` automatiza voz (fala a fala) → atempo 1,22 + pontas → dialogo → tempos_ft.js → STT → legenda. Texto "Ele conta devagar, bem devagar, com o relógio quase na meia-noite" foi bloqueado (PROHIBITED_CONTENT): reescrever a fala e rodar de novo, ele reusa as outras.
- Planos > 5 s reprovam no portão: dividir antes do render (conferir plano.json: max, câmeras repetidas em seguida).

## DNA da referência (Filippe, 19/11 madrugada) — MODELO PRINCIPAL
Short J_qUwuh3_hw: prisioneiro põe feijão na parede, riem dele, feijão incha, parede explode, ele foge.
Esqueleto: gancho que dá CURIOSIDADE (ato estranho com propósito escondido) -> zombaria/dúvida -> tensão de esperar o porquê -> payoff inesperado que faz o personagem parecer genial. Cenário lindo pesa mais que personagem (2D simples). Não precisa ser terror. Modelar o esqueleto, mudar falas/premissa.
Infográfico/HUD: barra pintada inteira, uniforme (ep.34 saiu meio verde/meio outra cor).

## Direção: muitas cenas, ação mostrada (Filippe, 19/11 madrugada)
- Cada beat = plano próprio com ação visível; evento-chave (sumiço) em 3 tempos: aproximação (push-in), ato (mão/sombra/puxão), consequência. Nada de câmera presa e 'some da tela'.
- Storyboard com coluna 'o que aparece' por frase; QA confere frase a frase. Erros bestas repetidos viram checagem automática no portão. 1 melhoria mensurável por episódio, antes/depois no KIT.

- LEIA serie-tiao-kit/PENDENCIAS_FILIPPE.md no início de cada episódio e a cada retomada.

## Regras de TENSÃO (terror/suspense) — Filippe reprovou o ep. 33 ("zero tensão, vela apaga, some e acabou") — 19/11/2026
- **Nunca "apaga e some" repetido.** Cada degrau muda de TIPO e piora: pista → som/voz → objeto se mexe → quase-pegar → falso alívio → virada. A SOMA se vê/sente: aproximação → push-in lento → silêncio → susto (estalo/tremor) → consequência na tela.
- **Algo a perder + alguém de quem se importa** antes do perigo (Beto real preso no porão). O espectador percebe algo pequeno ao fundo ANTES do personagem (poça sob o falso Beto desde o 1º quadro).
- **Silêncio é ferramenta:** `pausa` 0,9–1,2 s na fala do susto e `paradas` na trilha (música some) antes do estalo; batida cardíaca (`batida`) acelera por degrau; stinger `estalo+tremor` no susto/virada.
- **Câmera:** push-in lento (cm manual, plano de 3–4,5 s) em rosto/alçapão; close extremo no olho parado; plano longo no sorriso. HUD temático que participa (relógio de bordo avança por degrau e pulsa vermelho em bpm crescente: `hud_relogio.py`).
- **Pista inocente:** a pista não pode gritar "é ele" (o crítico pegou "o Beto não pisca" entregando o monstro): esconder com álibi ("nem pisca, de medo") e a voz errada vira a suspeita. Virada reinterpreta a pista + fecho que dá calafrio (o salvo "pisca devagar demais").
- Rodar `critico-roteiro` (sonnet, 1 passada) ANTES de voz; aplicar só reescritas concretas.
- Vozes Gemini: "sem cota" nas 5 chaves em rajada era LIMITE POR MINUTO, não diário: esperar ~60 s e rodar `voz_ep.sh` de novo (reaproveita o que já saiu); em 19/11 passou na 2ª tentativa.
- `render_leve.sh` agora espera outro render/ffmpeg/chromium (regra do Filippe; a sessão de clipes roda no mesmo PC).

## BUG de montagem: re-render parcial sobrescreve o começo do vídeo (achado em 19/11 no ep. 35; explica o "Tião voando parado" no ep. 33)
- `render.mjs <saida> "a-b" 2` numera as imagens pelo ÍNDICE da lista (f0000, f0001…), não pelo número do quadro. Re-render parcial como `"1300-1384"` grava f0000–f0042 e SOBRESCREVE o início do vídeo com quadros do meio (spoiler/frame errado no começo; no ep. 33 virou "Tião voando como foto parada").
- Regra: re-render parcial só com intervalo que comece em 0, ou renderizar numa pasta separada e copiar renomeando `f(quadro/2)`; na dúvida, render completo (≈4 min). Depois de qualquer re-render: extrair os quadros 0–5 do final.mp4 e comparar com o plano 1.
- QA do Filippe/revisor (19/11): folha de TODOS os planos (início/meio/fim) antes do revisor; degrau que a fala cita nunca em plano geral minúsculo; fecho não pode desfazer a consequência; HUD até o fecho (relógio congelado >10 s é falha); rastro legível em 360 px.

## Lições do ep. 36 (troco v2)
- Objeto citado na fala (mansão, piscina, jato, iate) em plano geral fica minúsculo: usar BX com largura ≤2,2 m e altura de câmera baixa; cenário que não contém o que a fala cita (nuvens p/ jato) → cidade.
- Valor no objeto = número dito na fala ("R$ 3" no cartão, não "1").
- Placa A/B: ≤4 palavras, fs ≥64, margem de 5% nas bordas.
- Papel novo (padeiro, gorila capitão) precisa de 1 acessório que o identifique (ainda pendente: quepe do gorila; piscina com gorila até o peito exige prop em 2 camadas).
- Re-render parcial: sempre via render_parcial.sh; montar_final.sh recebe o .mov relativo à pasta do projeto.

## DNA da referência (Filippe, vale acima de tudo) — Short J_qUwuh3_hw (feijão na parede)
Prisioneiro põe feijão na parede, todos riem, o feijão incha, a parede explode e ele foge.
1. GANCHO de curiosidade/intriga ("por que ele faz isso?"): ato estranho com propósito escondido, vale p/ criança e velho.
2. Todos zombam/duvidam; a tensão é esperar o porquê (ato repetido/zombado, tensão crescendo).
3. PAYOFF inesperado que faz o personagem parecer GENIAL (planejou tudo) e explica o ato.
4. CENÁRIO LINDO é o que mais pesa; personagem 2D simples e bonito.
5. NÃO precisa ser terror: molde = gancho misterioso → ato repetido/zombado → tensão → virada que explica. Muda só falas/narrador/premissa. Terror só se couber.
Crítico e diretor-retencao devem reprovar premissa sem "ato estranho + zombaria + payoff genial".
HUD de saldo: barra INTEIRA de uma cor só, uniforme e destacada (nunca meio/meio).

## Lições do ep. 37 (19/11 noite, piloto automático)
- `aprovar_catalogo.py --so <id>` sobrescrevia `catalogo/aprovados.json` inteiro (perdeu o catálogo). Corrigido: com `--so` agora mescla. Refeito completo: 53/53 personagens e 16/16 cenários ok (inclui `rei`).
- Gemini bloqueou (PROHIBITED_CONTENT) a fala de "ronca/cochila" mesmo com 3 reescritas, em todas as chaves; passou com texto neutro ("Hora 4. Ele descansa um pouco, encostado na pedra."). Ao bloquear, trocar a estrutura da frase, não só o verbo.
- Objeto-herói com rosto (cabeça de pedra) tem que olhar para a câmera (`ry: 0`); de perfil lia como barril/vaso.
- Close do gigante: caixa do rosto tem que ser larga (w ≥ 1,2; h ≥ 1,3) senão o auditor acusa cabeça cortada. Plano com 2 atores distantes em z (rei z -8 e Tião z -1) = plano de um ator só, não wide.
- Novo no banco de câmeras: `contra_plongee` (câmera baixa, gancho de escala). Novo HUD: `hud_sol.py` (sol descendo + contador de pedrinhas). Mix: `som_tiao.py` + `mix_tiao.py` (duração = DUR exata) — `som_paralelo.sh` está desatualizado.

## REGRA 20/11 — Modelagem plano a plano (ficha obrigatória)
Ver `FICHA_MODELAGEM.md` e `DIAGNOSTICO_REF_vs_TIAO_20-11.md`. Sem FICHA completa não há storyboard; revisor reprova cenário/paleta/props mais pobres que a referência. Um cenário único para o vídeo todo reprova.
