# Cenários — catálogo vivo

**Política (decisão Gon, 15/11): catálogo construído ANTES, em pacotes, mas só com história na fila.**
- Por quê: cenário feito na correria do episódio é onde nascem as pontas soltas (pedra riscada, bote faltando pedaço, baú vazado no V4). Feito antes, passa pelo portão de arte com calma e o episódio só USA.
- Mas nada de construir 10 cenários "pra estoque": cenário sem roteiro esperando vira código morto. Regra: sempre **1–2 cenários prontos à frente** dos roteiros da fila.
- Pacote = cenário + luz/clima + 2–4 objetos amarrados + paleta de som + (se a lenda pedir) 1 personagem novo. Cada pacote passa no `diretor-arte-bonecos` (média ≥ 6,5) e no auditor (`render.mjs --auditar`) antes de entrar como **pronto**.
- Cenário pronto fica no `motor3d/mundo.js` (função própria + coordenadas exportadas) e ganha 1 still em `referencia/cenarios/<id>.jpg`.

## Prontos no motor
| id | cenário | luzes | objetos amarrados |
|---|---|---|---|
| navio | convés, cozinha, rede, casco, mar com ondas (liso → tempestade) | dia, dourado, noite, cozinha, tempestade, batalha | panela (`stirPot`), rede (`deitaNaRede`), canhões, corda |
| ilha | Ilha das Palmeiras: praia, palmeira, pedra (lisa desde 15/11), buracos, baú, bote | dia, dourado | pá (`cava`), baú (abre/brilho), pegadas |
| batalha | navio rival (frotas `ruiva`, `coral`), canhões, abordagem | batalha, tempestade + relâmpago | `disparaCanhao`, `balancaNaCorda`, `duelo` |

## CATÁLOGO DE CENÁRIOS DE AVENTURA (16/11) — o vídeo só ESCOLHE; código em `motor3d/cenarios.js`
Ligar no story: `worldAt: () => ({ cenario: '<id>', <id>: {…opções} })` + `luz('<luz>')`. O mar/navio somem sozinhos. Pé no chão: `boneco(W, id, pose, ORIGEM.<id>.x + dx, ORIGEM.<id>.z + dz, t)` (`ORIGEM` vem de `cenarios.js`; `W.chao` já resolve). Câmera segura: `camCen('<id>', 'geral'|'medio'|'close', dx?, dz?)`. Quadro de teste: `motor3d/story_cenarios.js` (copiar o motor p/ pasta temporária, trocar story.js, `node render.mjs <saida> "0,1,2"`; `--auditar` deve dar zero aviso). Still: `catalogo/cenarios/<id>.jpg`.

### espaco — Espaço sideral (pronto 16/11)
- **Chamar:** `cenario: 'espaco'`, luz `'espaco'`. Opções: `espaco: { foguete: { fogo: 0..1, y: metros } }` (fogo liga a chama; `y` > 0 = foguete levantando do chão).
- **O que tem:** asteroide-palco lilás (raio 9 m, topo plano y=0 com crateras), céu estrelado com nebulosa, planeta listrado com anel (fundo, esquerda-cima), planeta azul-verde (direita-cima), lua, 6 asteroides flutuantes que balançam, foguete do Tião (branco/vermelho, pousado torto, ~3,4 m), bandeirinha vermelha com estrela, 5 cristais que pulsam (ciano/rosa/amarelo), sol frio de cima-esquerda (sombra azul-violeta).
- **Coordenadas (dx,dz do centro):** foguete (-4,4; -3,0), bandeira (3,9; -3,8), cristais (4,2..5,7; -0,4..-1,6), crateras do piso em ~(-2..3; 0..3) (só pintadas, pé em cima ok). Piso útil: círculo de raio 8 m.
- **Câmeras (offsets):** geral `[0.3,2.0,6.4]→[0,1.5,0] fov 52` (dupla em x ∈ [-0,9; +0,9], z 0..1,2); médio `[0.1,1.6,4.9] fov 46` (dupla em x ∈ [-0,5; +0,6]); close `[0.6,1.5,3.0] fov 40` (1 boneco). Para ver foguete/cristais: `dx` -2,6 / +4 em `camCen`.
- **NÃO fazer:** boneco com |x| > 1,2 do centro na câmera geral (acusa "colado na borda"); câmera abaixo de y = 0,8 ou atrás de z = -6 (entra na cratera/rocha); câmera de cima olhando o chão (aparece a borda do asteroide e o vazio); pôr o navio/mar junto (cenário não mistura); sombra fica comprida porque o sol é baixo-lateral: não aproximar o boneco do foguete (<1 m) sem conferir; luz `dia` aqui estraga o clima.

### brinquedo — Brinquedolândia (pronto 16/11)
- **Chamar:** `cenario: 'brinquedo'`, luz `'brinquedo'`. Opções: `brinquedo: { trem: 0|1 (padrão 1, trem circulando), bola: 0|1 (padrão 1, bola quicando) }`.
- **O que tem:** quarto de criança em escala de brinquedo: tapete de EVA em quadrados vermelho/azul/amarelo/verde (2 m cada), parede com papel de estrelas/nuvens + rodapé vermelho, 3 blocos ABC empilhados (esq., dx -2,6 z -6), bola de praia que quica (dx 2,0 z -5,0), trilho oval com trem de brinquedo (locomotiva azul/vermelha + 2 vagões, atrás, z -7 a -14), urso de pelúcia gigante sentado ao fundo (dx 1,8 z -17,5, cabeça balança). Luz de frente, sombra lilás.
- **Câmeras:** mesmas de `espaco` (geral `[0.3,2.0,6.4] fov 52`, médio `[0.1,1.6,4.9] fov 46`, close `[0.6,1.5,3.0] fov 40`). Dupla no geral: x ∈ [-0,9; +0,9]; médio: x ∈ [-0,5; +0,6]. `dx` +2,4 mostra bola/trem melhor.
- **NÃO fazer:** boneco em x 1..3 com z < -3 (a bola quica atrás/na frente dele e some atrás do Capitão); câmera acima de y 4 (aparece o fim do tapete e o vazio); câmera atrás de z -4 (entra no trilho/blocos); atravessar o trilho a pé sem pisar nos dormentes não é problema (chão é plano), mas pé em cima do bloco exige y manual com `apoio`; luz `noite`/`dia` não combinam.

### cidade — Cidade do Caos (pronto 16/11)
- **Chamar:** `cenario: 'cidade'`, luz `'cidade'` (fim de tarde laranja-rosa). Opções: `cidade: { hidrante: 0..1 (padrão 1, jato d'água), fumaca: 0..1 (padrão 1, bueiro) }`.
- **O que tem:** rua estreita (asfalto x ±5 com faixa amarela e faixa de pedestre em z -3,4, calçadas até ±8), prédios coloridos e tortos dos dois lados até z -62, prédio do fim com letreiro "CIDADE DO CAOS", carros (táxi amarelo em dx 2,4 z -9,5; vermelho em dx -2,9 z -13,5; carro azul EMPILHADO em cima do verde em dx 3 z -17,5), poste torto com balões (dx -4,4 z -6,5), semáforo maluco que cicla (dx 4,5 z -4,8), hidrante jorrando (dx -2,5 z -4,6), bueiro soltando fumaça (dx 1,4 z -7,4), 4 cones, fios cruzando a rua.
- **Câmeras:** mesmas de `espaco`/`brinquedo`. Zona segura dos bonecos: z entre -3 e +5, |x| < 1,2. Para ver o fundo, empurrar boneco e câmera juntos (`dz` -3: bonecos em z ≈ -2).
- **CAOS (16/11, pedido do Filippe):** prédio PEGANDO FOGO (esq., z -5..-14: chamas nas janelas, fumaça preta subindo, brilho laranja; opção `fogo: 0..1`), prédio DESTRUÍDO (dir., z 1..-8: fachada rachada, pedaços tombados, entulho na calçada, poeira), ASSALTO AO BANCO (esq., z 3,6..-5: letreiro BANCO, vitrine quebrada, sirene piscando, saco de dinheiro com $ e moedas no chão, carro de fuga roxo com porta aberta em dx -3,4 z -3,8). Ladrão/polícia/bombeiro: **personagens ainda NÃO existem** (só cenário); o assalto hoje se faz com o elenco atual.
- **Câmeras do caos** (lateral, porque o retrato estreito não enxerga as fachadas olhando a rua): `camCen('cidade','fogo')` (bonecos em x -3,6 e -3,0, z 0,6 e 0,1), `'ruina'` (x 3,6 e 4,6, z 0,2 e -0,3), `'banco'` (x -5,3 e -6,2, z 1,2 e 1,7). Foco de lente = distância dos bonecos (~5,6), não a do olhar. Still: `catalogo/cenarios/cidade_caos.jpg`.
- **NÃO fazer:** boneco entre z -6 e -10 com x 0,5..3,5 (entra no táxi/bueiro/fumaça — vira ponta solta); câmera fora da rua (x > 4, entra na calçada/poste); câmera olhando para trás (+z): lá não tem fundo construído além dos prédios; câmera acima de y 8 (vê o topo dos prédios cortado). Letra do letreiro é parte do cenário, não trocar texto sem refazer a textura.

### LUGARES DE LENDA/MUNDO (16/11): bermudas, maia, amazonia — ligar igual aos outros (`cenario:'<id>'`, luz `'<id>'`, `camCen('<id>','geral'|'medio'|'close')`, mesmas câmeras do espaço, dupla em x ∈ [-0,9; +0,9]). Still: `catalogo/cenarios/lugares_bermudas_maia_amazonia.jpg`.
- **bermudas** — Triângulo das Bermudas. Jangada de destroços (piso r 6 m) no mar escuro com ondas, neblina verde, navio fantasma translúcido ao fundo (dx -7, z -24), bússola gigante maluca flutuando (dx 2,2, y 4,3, z -9; é de propósito, mas parece relógio: desligar com `bermudas:{bussola:0}` quando o cenário só serve de mar/céu aberto; outras opções `bussolaLouca:0|1`, `mar:amplitude`), lanterna verde piscando (dx -2,2 z -3,6, com luz), mastro quebrado com vela rasgada, barris boiando. NÃO fazer: boneco fora do círculo da jangada (|x|,|z| > 5,5 = cai na água); luz `dia` só para teste de efeitos (o clima é a luz `bermudas`, neblina densa); câmera acima de y 5 vê o fim do mar.
- **maia** — Cidade Maia. Praça de pedra com lajotas, pirâmide escalonada com escadaria e templo (z -20, 5 degraus, frisos de grega), calendário de pedra em pedestal (dx -4,4 z -5), duas cabeças de pedra gigantes (dx 7,2 z -6 e dx -8 z -12), 4 tochas com fogo (ligam sozinhas), selva em volta; luz tarde dourada. NÃO fazer: boneco em z < -5 (sobe na escada/tocha); tornado/efeito em z -20 (fica dentro da pirâmide: pôr atrás em z < -40); trocar os ornamentos por símbolos reais de religião (são só grega e círculos).
- **amazonia** — Amazônia. Jangada de troncos amarrados no rio (11x8 m, piso y 0), cabana de palha, remo, cesto de frutas, vitórias-régias com flor, árvores gigantes com raízes e cipós nos dois lados, raios de sol na névoa. NÃO fazer: boneco fora da jangada (x ±5, z ±3,8); câmera olhando para trás (+z, não existe); efeito grande (tornado/tsunami) atrás das árvores — elas tapam: use `cenario:'bermudas'` + luz `dia` para céu aberto.

## EFEITOS VISUAIS (16/11) — `motor3d/efeitos.js`, ligam em `worldAt: { fx: {...} }` (coords ABSOLUTAS: `ORIGEM.<cenario>.x/z` + offset). Still: `catalogo/cenarios/efeitos.jpg`
| chave | opções | o que faz |
|---|---|---|
| `tornado` | `{pos:[x,z], k:0..1, esc}` | funil cinza-lilás girando (44 m × `esc`), nuvem escura no topo, 26 destroços orbitando, poeira na base, balanço |
| `furacao` | `{pos:[x,z], k}` | espiral gigante de nuvens com olho no céu (y 70) + parede de nuvem cilíndrica (60–80 m); pôr `pos` a ~90 m atrás da câmera-alvo (z -90) |
| `chuva` | `{pos:[x,z], k, tipo}` | `tipo`: `'chuva'` (riscos azuis), `'acida'` (chuva VERDE + poças borbulhando no chão), `'neve'` (flocos balançando), `'granizo'` (bolinhas rápidas) — 24×14×24 m; `k` = densidade |
| `terremoto` | `{pos:[x,z], k}` | rachadura que cresce, pedras caindo, poeira; `tremor(f, k)` (exportado de `efeitos.js`) devolve `{dx,dy}` p/ somar na câmera |
| `tsunami` | `{pos:[x,z], k:0..1, ry}` | parede d'água com crista de espuma (70×26 m) vinda de -z para a câmera; `k` = progresso (0,6 ≈ a 34 m) |
| `meteoro` | `{de:[x,y,z], ate:[x,y,z], k:0..1,3}` | bola de fogo com rastro; `k` > 1 = explosão no impacto |
| `raios` | `[{pos:[x,z], f0}]` | raio do céu ao chão por 7 quadros; somar `relampago(f,[f0])` da luz no flash |
Receita: efeito grande precisa de céu aberto (`cenario:'bermudas'` + luz `dia`, câmera `{pos:[0.3,2,6.4], look:[0,9,-30], fov:66}`); chuva/furacão com luz `tempestade`/`bermudas`. Teste dos 5: `motor3d/story_cenarios.js` (quadros 15–19).
**Som (fazer na produção do vídeo, não está no motor):** tornado = vento grave contínuo + estalos de madeira; furacão = vento + chuva forte; terremoto = estrondo grave + pedras; tsunami = rugido crescente + estouro; meteoro = assobio descendente + explosão; raio = estalo seco ~0,3 s depois do clarão. `audio/som_tiao.py` já gera música/sfx/mar por eventos.

## Próximos pacotes (ordem sugerida; cada um destrava vários roteiros)
| id | cenário | estilo | por que primeiro | objetos/efeitos novos |
|---|---|---|---|---|
| bermudas | Triângulo das Bermudas: mar em tempestade, neblina verde, bússola girando, navio fantasma ao fundo | tensão/mistério leve | pedido do Filippe; reaproveita mar/tempestade/relâmpago que já existem | neblina volumétrica barata (planos com alpha), bússola maluca, luz verde pulsando |
| porto | Porto da Vila: cais, taverna da Dona Cotinha, barracas | comédia/treta | casa de vários coadjuvantes; episódios de competição de comida | balcão, barril, plaquinhas |
| iate | Iate dourado do Sr. Caramelo | desafio/comédia | estreia do Sr. Caramelo; minissérie de desafios | piscina de moedas, palco, placar |
| gelo | Ilha Gelada | aventura/comédia | roteiro 9 do banco (sorveteria no gelo) | gelo escorregadio, pinguins de palito |
| fundo | Fundo do mar (já existe no legado 2D, portar ao 3D) | mistério | Seu Tentáculo, Iara | bolhas, raios de luz, algas |
| caverna | Caverna do tesouro | terror leve | lendas de tesouro amaldiçoado | tochas, eco, morcegos |

## Paleta de som por estilo (trilha e SFX; mix -14 LUFS, voz por cima)
- **Comédia:** pizzicato, tuba, "boing", corte seco na piada.
- **Tensão:** grave contínuo, batida de coração, vento, rangido de madeira; silêncio antes do susto.
- **Mistério:** caixinha de música desafinada, eco, gotas.
- **Terror leve (infantil):** sussurro sem palavras, sino distante, trovão — susto sempre quebrado por piada em ≤ 3 s.

## CENÁRIOS EXTRA (16/11) — módulo `motor3d/cenarios2.js`
Chamar: `worldAt → { cenario: '<id>' }` + luz com o mesmo nome (`light:'<id>'`). Cams: `geral` / `medio` / `close` (padrão). Personagem fica perto do centro (retrato estreito ~±5 m). Fundo visual só até z≈-60; NÃO colocar personagem fora de x±4.
- **cyberpunk** — rua molhada, prédios com janelas neon, letreiros (BAR/RAMEN/NEON…), holograma de anéis ao fundo, carros voadores, vapor. Luzes rosa/ciano pulsando. NÃO: luz `dia`; não usar fumaça de fogo.
- **apocalipse** — cidade destruída: prédios tortos/quebrados, carros capotados, fogueiras animadas, entulho, poste caído, fumaça. NÃO: gente passeando; combina com zumbi/mutante.
- **cemiterio** — lápides, cruzes, grade de ferro, árvores secas, mausoléu, lua enorme, castelo no morro ao fundo (janelas acesas), morcegos, lanterna tremendo. NÃO: tirar a lua do enquadramento do fundo; combina com vampiro/esqueleto/sombra.
- **parque** — parque de diversões abandonado ao pôr do sol: roda-gigante girando, carrossel, tenda de circo, placa torta, balões. Combina com palhaço/magrelo.
- **dojo** — pátio de pedra, dojo vermelho/madeira, torii, bambuzal, cerejeira, lanternas, boneco de treino, pétalas caindo. Combina com panda/tigresa.
- **fundomar** — fundo do mar: coral, algas balançando, naufrágio, baú de tesouro, bolhas, peixes, raios de luz. Névoa azul curta. NÃO: fx de chuva/fogo.
- **nuvens** — reino das nuvens: chão de nuvem, castelo branco/azul/dourado, arco-íris, ilhas flutuantes. Luz muito clara; combina com herói. NÃO: câmera olhando pra baixo (vazio).
- **arena** — ringue azul com estrela, cordas, arquibancada com torcida, placa ARENA, holofotes. Combina com gorila/herói/robô.
- **floresta** — pinheiros e árvores, trilha de terra, cogumelos, samambaias, tronco caído, raios de sol, borboletas. Combina com curupira/raposa.
Teste: `story_cenarios.js` frames 22–30 (Tião + 1 personagem); auditor sem avisos. Stills em `catalogo/cenarios/novos_*.jpg`.

- **navioberm** (19/11) — Navio do Tião nas Bermudas à noite: deck com relevo, panelão 3D com sopa, névoa em camadas, lua, navio fantasma. Estados em `motor3d/cenarios3.js`. Estreou no ep. 32. Câmera manual para grupos largos.

## PACOTE CASA (20/11/2026) — `motor3d/cenarios4.js`: sala, cozinha, quarto, fachada
Chamar: `cenario: 'sala'|'cozinha'|'quarto'|'fachada'`, luz `casa_dia | casa_noite | casa_quarto | casa_tarde`, câmeras `camCen(id,'geral'|'medio'|'close')`. Still: `catalogo/cenarios/casa.jpg` (testado 20/11, 0,22 s/quadro).
- **sala**: papel listrado, 2 janelas com céu, 3 quadros, tapete, sofá (+almofadas), mesa de centro, estante com livros, TV, abajur (luz), vaso com flores, gato. Opções `{abajur:0|1, gato:0|1, moveis:{sofa:dx, mesa:dx, estante:dx, tv:dx}}`.
- **cozinha**: xadrez turquesa/branco, geladeira, balcão + armários, mesa redonda + 2 cadeiras, janela, relógio, calendário, gato. `moveis:{geladeira, balcao, mesa}`.
- **quarto**: papel estrelas azul, cama (travesseiros, coberta), criado-mudo + abajur, armário, janela noturna com lua, tapete, urso. `{abajur, teto, moveis:{cama, criado, armario}}`.
- **fachada** (exterior): casa azul-água com telhado vermelho, porta, 2 janelas com floreiras, cerca, 2 árvores, arbustos, caixa de correio, placa (`placa:1` = placa "VENDE" em branco/vermelho), gato.
- Gag "mover 1 dedo": `moveis.<item> = 0.03` por plano, acumular.
- Pendente (melhorar): luz de teto faz mancha no alto do quadro; fachada mostra telhado cortado no geral.

## PACOTE PRÉDIOS (20/11/2026) — `motor3d/cenarios5.js`: obra_azul, obra_vermelha, escritorio, skyline, rua, redacao, noite
Para a referência "prédio mais alto" (corrida azul x vermelho, ep. 39). Chamar: `worldAt: { cenario: '<id>', <id>: {opções} }` + `luz('<id>')` (aliases); **para `noite` use `luz('predio_noite')`** (`luz('noite')` é a noite genérica do kit). Luzes: `predio_dia` (obra_azul), `predio_dourado` (obra_vermelha), `predio_poente` (skyline), `predio_rua` (rua), `predio_escritorio`, `predio_redacao`, `predio_noite`. Câmeras: `camCen(id,'geral'|'medio'|'close')` + extras `camCen('noite','agulha'|'tampa')`, `camCen('skyline','predios')`, `camCen('obra_azul','regua')`, `camCen('obra_vermelha','mastro')`. Still: `catalogo/cenarios/predios.jpg` (testado 20/11, 0,22 s/quadro 1080x1920, sem erro de console; aprovados.json ok:true).
- **obra_azul**: topo de prédio em obra (laje + prédio descendo), deque de tábuas, colunas/vigas I azuis com rebites, viga pendurada no cabo com gancho, andaime de tubos com tábuas, régua de andares + placa "Nº ANDAR" + seta azul, bandeirinhas azul/branco, grua amarela ao fundo com caçamba, guarda-corpo zebrado, pilha de vigas, capacete, caixa de ferramentas, balde de rebites, cone, sacos de cimento, fita métrica, marmita+garrafa, carrinho de mão, bandeira azul, cidade lá embaixo (dia azul). Opções `{andares: 87, gancho: 0..1 (viga sobe 1,2 m), bandeiras: 1|0}`.
- **obra_vermelha**: mesmo palco em vermelho (pôr do sol dourado). Opções `{andares: 86, telhado: 0..1 (telhado de telhas vermelhas fecha em 6 faixas, de trás pra frente), mastro: 0..1 (mastro sobe 0,6→7 m no fundo do deque com bandeira vermelha e bola dourada; com `telhado>=0,5` sai da cumeeira, 0,6→4 m — ver pela câmera `mastro`, de fora), gancho, bandeiras}`.
- **escritorio** (construtora, quente): parede verde com lambri, janelão com skyline (prédio azul de agulha + vermelho de telhado), relógio, placa CONSTRUTORA, prancheta inclinada com planta azul + esquadro, luminária de braço (luz), banqueta, mesa com maquete dos dois prédios, binóculo, caneca, estante com livros + globo, rolos de planta, cesto com papel amassado, planta, cabideiro com chapéu, tapete. Opções `{maquete: {azul: 0..1, vermelho: 0..1} (andares da maquete, 10 = 1), luminaria: 1|0, noite: 0|1 (janelão de noite)}`.
- **skyline** (pôr do sol laranja): terraço de lajota com parapeito de tijolo, binóculo de moeda, caixa d'água de madeira, antena de TV, chaminé, banco, vasos com flor, pombos, lampião, cidade abaixo e os DOIS prédios (azul com agulha / vermelho com telhado e bandeira) + régua gigante com setas. Opções `{hAzul: 24, hVermelho: 22 (andares 1..70; janelas não esticam; topo = -60 + 3,2·andares m), regua: 1|0}`. Prédios inteiros: câmera `predios`.
- **rua** (manhã): calçada, rua com faixa de pedestre, fachadas com toldos e letreiros (PADARIA, CAFÉ, JORNAIS, BANCO, LOJA), rua lateral com prédios dos dois lados até o prédio azul no fim, relógio de rua de 2 faces, banca de jornal com revistas, poste, semáforo, hidrante, lixeira, banco de praça, árvore em canteiro, táxi, pombos. Opções `{multidao: 0..1 (até 40 pessoinhas-ponto na calçada do fundo e na rua lateral), hora: 10.1 (ponteiros, horas decimais)}`.
- **redacao** (jornal, luz âmbar): parede de tijolo, jornal gigante "O DIÁRIO DA CIDADE" com manchete + desenho do prédio, 2 luminárias verdes pendentes (luz), mesa com máquina de escrever (folha no rolo), telefone antigo, xícara, pilha de jornais, arquivo de aço, ventilador girando, quadro de cortiça com recados, relógio, pilha amarrada no chão, cesto, cadeira. Opções `{manchete: 'ACABOU!' (curta; a fonte encolhe para caber), luminaria: 1|0}`.
- **noite** (topo do prédio azul à noite; alias de opções `S.topo_noite`): deque redondo de aço, coroa art déco (leques prata/azul), tampa de ferro redonda com rebites e alça, agulha de prata com anéis + brilho, casinha da escada com placa PROIBIDO SUBIR e luz na porta, holofote com feixe, antena com luz vermelha piscando, 2 ventilações, barril, rolo de cabo, lanterna acesa, caixa de ferramentas, bandeira azul, estrelas + lua, cidade acesa lá embaixo e feixe ao longe. Opções `{tampa: 0..1 (abre até ~110°), agulha: 0..N (topo em 2·N m acima do teto; >3 sai do quadro geral), brilho: 0..1 (padrão acompanha a agulha), holofote: 1|0}`.
- Bonecos do teste: `tiao` + `barao` (PARCEIRO no aprovar_catalogo.py). Pendente: no geral de `noite` o feixe do holofote cobre o canto esquerdo (desligar com `holofote: 0` se atrapalhar); `obra_*` mostra a grua só em parte (lança acima do quadro geral).
