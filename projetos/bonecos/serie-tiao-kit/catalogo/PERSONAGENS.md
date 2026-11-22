# Elenco — Aventuras do Tião (catálogo vivo)

Regras: nomes brasileiros e engraçados; nada copiado de obra/pessoa real (paródia = só a IDEIA de um tipo, nunca nome, rosto, logo ou bordão do famoso). Voz fixa por personagem em `vozes.json`. Desenho no rig (`../rig.js`, `SPEC`/`tripulacao()`); entra na FOLHA_MODELO antes do 1º storyboard em que aparece.
Status: **pronto** = desenhado no rig + voz; **voz** = só voz; **ideia** = falta desenhar (desenhar no episódio que estrear ou num lote de "pacote").

## Protagonista e tripulação recorrente

Tião é o único personagem fixo da série. A tripulação entra quando a história pede.
| id | nome | quem é | jeito de falar | status |
|---|---|---|---|---|
| tiao | Tião | cozinheiro baixinho, bonzinho, sempre se ferra e salva o dia sem querer | simpático, ingênuo, rápido | pronto |
| cap | Capitão | mandão, dramático, medroso escondido; grita muito (grito com vento!) | rouco, exagerado | pronto |
| mar1 | Beto | marujo agitado e medroso | empolgado, atropela palavras | pronto |
| mar2 | Zeca | marujo lerdo, dorme em pé | devagar, "ué?" | pronto |
| papagaio | Pirata (o papagaio) | fofoqueiro, repete o que não devia | agudo, repete palavras | pronto |

## Recorrentes (já desenhados)
| id | nome | papel | status |
|---|---|---|---|
| ruiva | Capitã Ruiva | rival esperta e debochada (navio preto/roxo) | pronto |
| riv1, riv2 | piratas da Ruiva | capangas trapalhões | pronto (sem voz própria: usar `mar1`/`mar2` com estilo trocado ou narrador) |
| barbacoral | Capitão Barbacoral | gigante temido d'Os Bravos do Coral | pronto |
| coral1, coral2 | brutamontes do Coral | gigantes que não falam (só "HUM") | pronto |

## Novos (estrear um por episódio quando a história pedir)
| id | nome | conceito | visual | status |
|---|---|---|---|---|
| caramelo | **Sr. Caramelo** | vira-lata caramelo MILIONÁRIO que faz desafios malucos com prêmio absurdo ("quem ficar mais tempo no barril ganha um navio!"). Paródia do TIPO "youtuber de desafio", sem nome/bordão de ninguém | cachorro caramelo de palito, óculos escuros, cordão de ouro com osso, chapéu de capitão branco, iate dourado | voz · desenhar |
| cotinha | Dona Cotinha | dona da taverna do Porto da Vila, brava e carinhosa, rival de cozinha do Tião | coque, avental verde | voz · desenhar |
| bento | Seu Bento | pescador velhinho que conta as LENDAS (abre episódio de mistério) | chapéu de palha, barba branca | voz · desenhar |
| nico | Nico | grumete criança, curioso, faz a pergunta que o público faria | boné | voz · desenhar |
| polvo | Seu Tentáculo | o polvo/"Kraken" do V3, guloso e educado | já existe (lib_v3) | voz `criatura` |
| tenaz | Tenaz | caranguejo da ilha que belisca nariz | já existe (`caranguejo()`) | sem fala |
| sereia | Iara da Lagoa | ideia p/ lenda brasileira (inspirada no folclore, desenho nosso) | — | ideia |
| boto | Boto Bacana | ideia p/ episódio de festa/mistério no rio (folclore) | — | ideia |
| fantasma | Capitão Assombrado | navio fantasma de Bermudas; fantasma que tem medo de tudo | — | ideia |

## Como cada um ganha foco
- Todo episódio escolhe **1 coadjuvante/antagonista com foco**: close próprio, 2–3 falas, reação forte, momento de vilão/herói. Variar quem é (registrar em `HISTORIAS.md`, coluna "foco").
- Antagonista tem motivo engraçado e infantil (inveja da sopa, quer o chapéu, quer ganhar o desafio). Sem violência real: canhão dá "PUF" de fumaça, ninguém se machuca de verdade.

## ELENCO DE AVENTURA (16/11) — todos desenhados no rig (`rig.js` `NOVOS`) e na folha `catalogo/cenarios/personagens_novos.jpg`; voz em `vozes.json`
Traços novos do rig: `capa`, `emblema` [raio|estrela|escudo], `mascara`, `oculos`, `pele`, `antenas`, `olho3`, `chifres`, `presas`, `espinhos`, `pelo`, `capacete`; chapéus `cartola`, `bruxa`, `fogo`, `coroa`. Gigante/anão = só `s`. Depois de mexer: `bash motor3d/gerar_elenco.sh`.
| id | nome | tipo | visual | voz |
|---|---|---|---|---|
| heroi | Capitão Pamonha | super-herói | traje vermelho, capa amarela, máscara azul, raio | Orus |
| lucia | Relâmpago Lúcia | super-heroína | traje azul, capa roxa, tranças loiras, máscara, estrela | Aoede |
| zegelo | Zé Gelo | super-herói | azul-gelo, capa azul, óculos, escudo | Charon |
| tiaosuper | Super Tião | herói | Tião + capa vermelha + estrela (chapéu de chef SEMPRE) | (voz do Tião) |
| barao | Barão Sombra | vilão | cartola roxa, capa, bigode, presas | Rasalgethi |
| drgambi | Dr. Gambiarra | vilão/cientista | jaleco claro, óculos vermelhos, cabelo grisalho | Iapetus |
| bruxa | Dona Cacilda | vilã/bruxa | pele verde, chapéu pontudo, tranças verdes | Despina |
| glorp | Glorp | alienígena | verde, 2 antenas rosas, 3º olho | Zephyr |
| zorbina | Zorbina | alienígena | roxa, antenas amarelas, cílios | Callirrhoe |
| astro | Astronauta Neto | astronauta | traje branco, capacete bolha, estrela laranja | Achird |
| gigante | Gigante Bolotão | gigante (s 1,7) | marrom listrado, bigode | Achernar |
| mutante | Gosmildo | mutante | verde, espinhos, 3 olhos, presas | Pulcherrima |
| monstro | Monstro Bolotinha | monstro (s 1,55) | roxo peludo, chifres, presas | Sadaltager |
| robo | Robô Lata-Velha | robô | cinza com listras, antena, óculos | Algieba |
| curupira | Curupira | folclore | marrom, cabelo de fogo | Autonoe |
Uso: `boneco(W, '<id>', pose, x, z, t)` como qualquer personagem. Tamanho na tela: gigante/monstro pedem câmera mais aberta (folga ≥ 12% nas bordas). Sem voz gerada ainda (só o mapeamento).

**Atualização 16/11 (Filippe: "não quero que sejam iguais ao boneco, quero diferentes, mais realistas/bonitos"):** os 14 personagens acima NÃO usam mais o corpo de palito. Têm anatomia própria (`SPEC.an` no `rig.js`): tronco (`v` herói, `bruto` ogro/monstro, `pera`, `fino`, `caixa` robô, `astro`), cabeça (`queixo`, `bruta`, `alongada`, `pontuda`, `caixa`, `oval`), braços/pernas grossos com luva/bota/garra, mãos e pés de verdade, e detalhes (`feio`: verrugas, cicatriz, presas, sobrancelha pesada, olho maior, olhos extras, nariz de bruxa). O Gigante agora é um ogro verde feio, o Monstro é peludo com chifres, os heróis têm corpo musculoso, os aliens têm cabeça grande e olhos pretos. Só Tião/Super Tião mantêm o estilo palito (identidade da série). Para criar outro: copiar uma linha de `NOVOS` e mudar `an`. Folha: `catalogo/cenarios/personagens_novos.jpg`.

### BICHOS LUTADORES (16/11) — estilo Kung Fu Panda, desenho nosso; anatomia `an` + traços de bicho (`orelhas`, `manchaOlho`, `focinho` [redondo|longo|bico], `rajasCara`, `cauda`, `casco`, `crista`, `faixa`, deco `listras`/`quimono`/`barrigaClara`)
| id | nome | papel | visual | voz |
|---|---|---|---|---|
| panda | Mestre Pancadão | panda mestre de karatê, calmo | gordo, quimono branco + faixa preta, manchas nos olhos | Sulafat |
| tigresa | Tigresa Rajada | lutadora séria | laranja listrada, colete vermelho, rabo | Vindemiatrix |
| coelho | Coelho Ninja Zé Pulo | ninja agitado | orelhas longas, faixa vermelha na testa, rabo fofo | Sadachbia |
| tartaruga | Vovó Tartaruga Sábia | mentora lenta | casco verde, barriga creme, bico | Gacrux |
| jacare | Jacaré Dentão | valentão do rio | focinho longo, dentes, rabo | Alnilam |
| gorila | Gorilão Zen | gigante pacífico (s 1,3 — mais alto corta a cabeça no cartão) | preto, braços enormes, sobrancelha pesada | Charon |
| raposa | Raposa Ladina | trapaceira | laranja, focinho branco, rabo com ponta branca | Kore |
| galo | Galo Garnizé | boxeador brigão | crista, bico, luvas vermelhas, rabo azul | Orus |
Folha: `catalogo/cenarios/bichos.jpg`.

### CRIATURAS BIZARRAS (16/11) — estilo Gravity Falls / Rick and Morty: feio/estranho, mas bem desenhado. Folha: `catalogo/cenarios/criaturas.jpg`
| id | nome | o que é | voz |
|---|---|---|---|
| molengo | Bubu Molengo | criatura abobada: cabeça pequena, olhos vesgos desiguais, língua e baba | Erinome |
| olhao | Olhão | ciclope laranja, 1 olho enorme, dentes tortos, braços mínimos | Iapetus |
| gosma | Seu Gosma | blob de gosma verde sem pernas, bolhas, olhos desiguais | Pulcherrima |
| gnomo | Gnomo Zé Barbicha | gnomo pequeno (s 0,74), gorro vermelho, barbona branca | Schedar |
| mariposa | Homem-Mariposa | asas com olhos, olhos vermelhos, antenas | Callirrhoe |
| peixeman | Sr. Escamas | homem-peixe azul de terno, olhos saltados, beiços | Algieba |
| sapao | Seu Sapão | sapo gigante verde, olhos de cima, verrugas | Alnilam |
Ajuste 16/11: olhos do Panda agora brancos com pupila (`olhos:'bicho'`; antes sumiam na mancha preta); mãos/patas dos personagens com anatomia própria ganharam dedos. Novos tipos de olho no rig: `bicho`, `ciclope`, `molenga`, `saltado`, `croc`, `alien`, `visor`.

### TERROR / ESTRANHOS (16/11) — folha `catalogo/cenarios/terror.jpg` (infantil: assustador mas engraçado, sem sangue)
| id | nome | o que é | voz |
|---|---|---|---|
| palhaco | Palhaço Risonho | palhaço sinistro: sorriso pintado enorme, nariz vermelho, roupa de bolinhas, sapatão | Zubenelgenubi |
| esqueleto | Seu Ossada | esqueleto com costelas, olhos vazios com ponto vermelho | Umbriel |
| zumbi | Zumbi Mofado | morto-vivo verde, costuras, peito rasgado, olho caído | Enceladus |
| vampiro | Conde Sanguessuga | pálido, capa vinho, olhos vermelhos brilhando, presas | Rasalgethi |
| abobora | Abóbora Assombrada | cabeça de abóbora com rosto aceso, corpo de espantalho | Laomedeia |
| sombra | A Sombra | blob escuro com olhos brilhando e sorriso de dentes | Alnilam |
| magrelo | Seu Magrelo | alto (s 1,6), sem rosto, terno preto e gravata vermelha | Charon |
| lobisomem | Lobisomem Peludo | lobo em pé, focinho com presas, olhos amarelos | Sadaltager |
**REGRAS DO RIG (erros que o Filippe pegou, 16/11 — valem para todo personagem novo):** (1) nada flutua: acessório de cabeça (orelha, antena, chifre, tufo, chapéu, verruga) usa a âncora `cabXf` que segue topo e largura da cabeça do personagem; nunca coordenada fixa de cabeça redonda; (2) sobrancelha é POR PERSONAGEM (`an.sobr:false` desliga; panda, olhão, mariposa, peixe, sapo, jacaré, gorila, robô, alienígenas, bichos NÃO têm); (3) toda folha nova: ver o quadro inteiro e procurar pontinho/traço solto antes de entregar; (4) pés de frente (`legAn` com lado).

## Tripulação das Bermudas (19/11, pronto no rig, grupo `bermu`)
| id | nome | quem é | visual | status |
|---|---|---|---|---|
| tonho | Tonho | marujo gordão e bigodudo | gorro azul, listras vermelhas, escala 1,12 | pronto (sem voz própria) |
| dede | Dedé | grumete magrelo | bandana laranja, listras verdes, escala 0,88 | pronto (sem voz própria) |
| chiquinha | Chiquinha | marujinha de tranças | bandana verde, vestido azul, tranças castanhas | pronto (sem voz própria) |

## Civis em teste

| ID | Papel e aparência | Estado |
|---|---|---|
| `vizinha` | Roupa ameixa, cabelo escuro e pele quente. Pode entrar em histórias cotidianas. | Protótipo no rig e no motor. |
| `feirante` | Camisa verde, óculos, bigode e proporções adultas. Pode entrar em histórias cotidianas. | Protótipo no rig e no motor. |

Prova local em `_estado/prova-elenco-civil/`. Uma estreia com fala ainda exige voz definida e validação de catálogo.
