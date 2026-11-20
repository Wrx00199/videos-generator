# Motor 3D da série Tião (base: cartoon-short-kit, MIT)

## Arquivos
- `main.js` — renderizador (toon com sombra violeta, tinta 3,4 px, DOF, gradação, vinheta, flash). Não tem mundo.
- `mundo.js` — mundos fixos: NAVIO na origem (`DECK`=2,8 m; rede `REDE`), MAR, COZINHA em `COZ` (sala fechada), ILHA em `ILHA` (palmeira `PALMA`, pedra `PEDRA`, buracos `BUR`, baú 3D, bote, navio ancorado ao fundo). `chao(x,z)` dá a altura do piso em qualquer mundo. Estado por quadro via `worldAt(f)`: `bote`, `bau{pos,ry,abre,brilho}`, `buracos{beto,zeca,tiao}`, `lampada`, `balanco`.
- MÓDULOS INDEPENDENTES: ondas valem pra QUALQUER vídeo (preset `MAR` em `luzes.js`: liso, calmo, brisa, tensao, agitado, tempestade → `worldAt: { mar: MAR.tensao }`); batalha naval só liga com `batalha: true`/`rival`/`tiros`; `tripulacao()` serve pra qualquer grupo novo de personagens (rivais, vila, porto), não só piratas.
- ONDAS (topo de `mundo.js`): `onda(x,z,t,amp)` = 3 senoides, MESMA fórmula no shader (vértices da malha densa que segue a câmera) e em JS. Amplitude = `worldAt().mar` ou `luz.ondas` (dia 0,22 … batalha 0,55, tempestade 1,3); some perto da ilha. Espuma: traços nas cristas + anel pulsando no casco de cada navio (shader). `boia(obj, x, y0, z, ry, comp, larg, t, amp)` põe casco na onda (altura, arfagem, jogo): navio, ancorado, rival e bote (`bote: {pos, ry, agua: true}`). `chao(x,z)` no convés já inclui o balanço (deckY), então boneco/rede acompanham. `W.onda(x,z)` = nível do mar no quadro (pra boiar objeto/personagem n'água). Custo medido: 0,21–0,23 s/quadro.
- TRIPULAÇÕES / GRUPOS DE PERSONAGENS (padrão): personagens em `../rig.js` com `tripulacao(id, base, membros)` (traços prontos: stripes, coat, vest, patch, hair, beard, barbona, stache, makeup (cor do batom: cílios+batom+blush), earring, vestido [corpete, saia] (blusa = body); chapéus: bandana, beanie, tricorne, chapelao, bicorne… recoloridos por `hatCol`) + navio em `mundo.js` `FROTAS[id]` (casco, velas, faixa, amurada, escotilha, bandeira de `BANDEIRAS`) → `gerar_elenco.sh`. No story: `rival: { frota: 'id', pos, ry }`. Prontas: `ruiva` (Capitã Ruiva, riv1, riv2; navio preto/roxo, caveira) e `coral` (Os Bravos do Coral, gigantes: barbacoral, coral1, coral2; navio azul-petróleo, velas mostarda/azul, bandeira coral com arpões).
- BATALHA NAVAL (no fim de `mundo.js`, `construirBatalha`): `worldAt` liga com `batalha: true` (canhões do nosso navio; ficam escondidos fora disso), `rival: {pos, ry, balanco}` (navio rival = clone do nosso: casco preto, faixa e velas roxas, bandeira de caveira 2,6x, sem rede; `chao` funciona no convés dele), `tiros: [{de:'nosso'|'rival', i, f0, alvo:{nav, p:[local]} | {mar:[x,z]}, dur?}]` → faísca no pavio 12 q antes, recuo, clarão, fumaça pintada, bala em arco, splash+anel no mar OU clarão+lascas+buraco no casco. Canhões `CANHOES` (2 por bordo, i 0–1 boreste/+z, 2–3 bombordo/−z), cano em portinhola na amurada. `W.canhao(nav,i)` dá `pavio`/`boca` no mundo; `W.corda(a,b)` estica corda no quadro.
- `elenco.js` — GERADO do rig canônico `../rig.js` por `gerar_elenco.sh` (contexto injetável, tinta ameixa). Mudou o rig → rode o script.
- `acoes.js` — ações amarradas (batalha: `disparaCanhao` = ponta do bota-fogo no ouvido do canhão, `toque` 0..1; `balancaNaCorda` = mãos na corda da âncora até as mãos, arco por cima das amuradas; `duelo` = lâminas cruzam em X com faísca, quem ataca alterna, `armaA/armaB` sword|cutlass|ladle): `boneco` (pé no chão via `chao`; y manual exige `apoio`), `segura` (objeto na mão: map, recipe, shovel, ladle, sword, lantern, spoon, glass), `deitaNaRede`, `anda`, `cava`, `caranguejo`, `objeto` (desenho livre em cartão).
- `luzes.js` — `dia`, `dourado`, `noite`, `cozinha`, `sepia`, `tempestade`, `batalha` + `relampago(f, [quadros])` (somar em `C.flash`) (inclui `tint` dos bonecos).
- `motion.js` — `camFromKeys` (glide smootherstep, push lento, `kicks` = tremor de impacto); `acordaDoSonho(f, f0)` → `{flash, roll (graus), fov}`: balanço + branco antes do corte f0, branco decai no plano real.
- `story.js` aqui é só o teste do portão (6 stills). `story_batalha.js` = portão da batalha e exemplo de uso de tudo acima (quadros 10,31,52,70,95,109 + 120 mar agitado).
- Elenco novo (rig.js): `ruiva` (Capitã Ruiva), `riv1` (bandana roxa, listrado roxo), `riv2` (gorro roxo, barba, brinco). Props: `pavio` (bota-fogo aceso, `fl`), `cutlass` (sabre). `SPEC.hatCol` recolore bandana/gorro. O de cada vídeo fica em `<proj>/web/story.js` (modelo: `projetos/bonecos/2026-11-15-tiao-ilha-04/web/story.js`).
- `audio/` — `som_tiao.py` (eventos JSON → music/sfx/mar) e `mix_tiao.py` (voz intocada, trilha −10 LU com duck nas palavras, −14 LUFS, limitador).
- `portao/` — folhas e pareceres do diretor de arte (motor: r1 5,0 → r2 6,3; batalha: r1 5,3 → r2 6,1; r3 com mar agitado em `batalha_parecer_r3.md`).

## Novidades 15/11 (Gon)
- **Auditor automático** (texto, ~3 s pro vídeo todo, sem imagem): `node render.mjs --auditar "0-<N-1>" [passo]` → `auditoria.json` + resumo. Acusa por quadro: braço dobrado com cotovelo espetado (alvo IK colado no ombro), mão que não alcança o alvo, boneco cortado/colado na borda, cabeça/chapéu cortado no topo, boneco < 12% da altura (marcar `longe: true` se for de propósito). Base: `auditaPose()` no `rig.js` (caixa + avisos) e `auditaAtor()` no `main.js` (projeção na tela). Rodar antes do storyboard e antes do render.
- **Grito com vento** (da referência): `rajada(A, B, k, t)` em `acoes.js` (linhas de vento + gotinhas da boca A até B) + pose `vento: k` no ouvinte (chapéu levanta, inclina pra trás e treme; use junto `eye:'shut'`, `lean:-0.2*k`). Exemplo: `projetos/bonecos/2026-11-15-teste-dialogo/web/story.js`. Câmera: os dois com folga, senão o chapéu sai do quadro.
- **Pedra lisa**: `pedraLisa(raio, seed, achata)` em `mundo.js` + textura `P.rocha()`. Nunca Icosahedron/Dodecahedron (facetado = tinta risca cada face).
- Baú (tampa `DoubleSide`, brilho esférico) e bote (tampas + banco) com as correções do V4 agora no kit.

## Novidades V5 (15/11 noite)
- `worldAt`: `explosao: {f0, p:[local do navio], esc}` = navio inteiro explodindo (clarão + bola de fogo pintada `TEX.bolaFogo` + 40 lascas + cogumelo de fumaça); `chamine: 0..1` = chaminé da cozinha no convés (-2,2; -1,9) soltando fumaça (faísca acima de 0,6); `fogao: {chama 0..1,6, azul 0/1, registro 0..1}` = fogo de línguas em cima do fogão (0,6 normal), botão de latão gira; `porta: 0..1` = porta da cozinha (parede x=+4,4) com contraluz quente atrás.
- Rig: `tiao4k` (Tião chamuscado: fuligem no corpo/rosto, chapéu `chefRasgado` — chapéu SEMPRE presente); props `knife` (faca) e `relogio` (relógio de bolso, `hR: {k:'relogio', a: Math.PI, s, h, m}`); `armG` = braço natural pra todos.
- Ação `amarradoNoMastro(W, n, pose, cam, t, {solta})` em `acoes.js` (3 voltas de corda 3D: canela/quadril/peito; `solta` 0..1 = corda cortada caindo). Pool de cordas: 40 segmentos/quadro.
- Tempos amarrados à voz: gerar `web/tempos.js` de `voz/falas_tempos.json` e cortar planos por `F(i)`/`Fe(i)` (modelo: `projetos/bonecos/2026-11-15-tiao-ultimo-minuto-05/web/story.js`).

## Novo vídeo
```
P=projetos/bonecos/<data>-tiao-<slug>-NN; K=projetos/bonecos/serie-tiao-kit/motor3d; mkdir -p $P/web
for f in main.js mundo.js acoes.js elenco.js luzes.js motion.js paint.js toon.js index.html render.mjs sheet.py package.json Pz.js; do cp $K/$f $P/web/; done   # (episódio em catálogo: use ../novo_ep.sh, que copia também cenarios*.js efeitos.js epi.js planos.js)
ln -sfn "$PWD/$K/lib" $P/web/lib; ln -sfn "$PWD/$K/node_modules" $P/web/node_modules
cd $P/web && node render.mjs ../sb "10,40,..."        # stills (rodar DE DENTRO de web/)
node render.mjs ../frames "0-<N-1>"                    # render (background; RESUME=1 continua)
bash ../../serie-tiao-kit/motor3d/finish.sh ../frames ../som/mix.wav ../final.mp4
```
Tempo medido: 0,21–0,3 s/quadro em 1080x1920 com a RX 550 (Chromium 1148, `--use-angle=gl`).

## Armadilhas
- Câmera é fixa no mundo: com onda forte o navio sobe/desce no quadro (plano de convés em tempestade: subir câmera junto com `W.onda(0,0)` se quiser horizonte balançando).
- Personagem feminina: `vestido` + `makeup` (`makeup` também tira o cinza-azulado do rosto, que nela lia como barba) + `hair` (casaca de botão duplo lê como roupa de homem) (cabelo cai ATRÁS dos ombros; borda perto do queixo vira "barba" — Filippe pegou na Ruiva).
- Rig gira o prop com `rotate(-a)`: ponta = mão + L·(sin a, cos a). `toBody` precisa de `x:0, y:0` na pose (senão NaN).
- Batalha: navio rival encostado em z ≈ −7,7 (abordagem); câmera de abordagem DENTRO do convés (z < 2,9) senão o canhão de boreste tapa o quadro.
- `render.mjs` serve a pasta atual: rode de dentro de `web/`.
- Pose com `undefined` num campo (ex.: `aR: undefined`) quebra o rig; use spread condicional.
- Cartão deitado: o corpo fica no centro da calha; a borda da frente da rede cobre o corpo. Câmera de fora do navio precisa ficar acima da amurada.
- Cartão afundado (y abaixo do chão) = personagem dentro do buraco: a areia esconde o corpo.
- Buraco/baú/bote usam coordenadas LOCAIS da ilha; bonecos usam coordenadas do mundo (`I.x + x`).

## Cenários do catálogo (16/11)
`cenarios.js`: `espaco`, `brinquedo`, `cidade` (+ `ORIGEM`, `CAMS`, `camCen`). Ligar com `worldAt: { cenario: 'id', id: {opções} }` + `luz('id')`; mar/navio somem sozinhos. Portão: `story_cenarios.js`. Detalhes e limites: `../catalogo/CENARIOS.md`.

`efeitos.js` (16/11): desastres naturais por `worldAt: { fx: { tornado, furacao, chuva, terremoto, tsunami, meteoro, raios } }` + `tremor()`; novos cenários `bermudas`, `maia`, `amazonia`. Elenco novo no rig (`NOVOS`). Ver `../catalogo/CENARIOS.md` e `PERSONAGENS.md`.

## Consertos 17/11 (ep. 10 apocalipse: bugs do motor)
- **Andar de verdade**: `andar('zumbi', [x0,z0], [x1,z1], { t0, vel, amp, corre, p })` (acoes.js, reexportado por epi.js) devolve o ator pronto: move x,z, ciclo `Pz.passo(fase, amp)` com fase = distância andada (pé de apoio fixo no chão, passo ≈ comprimento da perna com amp .5; zumbi arrastado: `pps:1.5, amp:.3`). `p(c)` só põe rosto/braços/props (sem `E.walk`). Ex.: `{ ...andar('cap', [2,-6], [0,-1], { t0: 0.3 }) }`. `anda(W,…,u,…)` foi corrigido igual. `E.walk` (elenco.js) continua só como animação de pernas parado no lugar.
- **Fila/horda parada**: `fila(n, x0, z0, passo, { mira:[x,z], tipos, jit, p })` → lista de atores zumbi/vampiro virados p/ `mira`: `...fila(8, -3, -7.2, 0.9, { mira: [0,0] })`. O piso do apocalipse vai de z +40 a −160, há espaço.
- **Prop fora da cara**: `Pz.segurar('abridor', { mostra: true, s: 1.4, lado: 'R' })` (mão ao lado do queixo, item para cima/fora; busca posição sem sobrepor a cabeça). Auditor (`--auditar`) agora acusa `prop X sobre a cara`; liberar de propósito (comer/beber) com `propNaCara: true` no ator. ATENÇÃO: no ep. 10 o retângulo marrom na cara do Tião no quadro 0 era a LATA do tambor do cenário (3D), não o abridor; a lata foi para a borda do tambor (`apocalipse: { lata: false | [dx,dz] }`).
- **Paredão de armas** (cenário `apocalipse`): `worldAt: () => ({ apocalipse: { armas: 50, caixasMunicao: 12, rack: { x, z, ry, esc } } })`. 50 armas (fuzis + bazucas) em 3 fileiras, 16 caixas de munição; `armas` = quantas ainda estão no rack (some em ordem embaralhada fixa: animar 50→0 esvazia). Escondido se `armas`/`caixasMunicao` não vierem. Padrão `rack.z = −2.2` (câmera atrás/dentro dele tapa o quadro).
- **Portão/placa amarela**: o gate do apocalipse (z=4,5) some sozinho quando a câmera fica a < 1,6 m do plano dele (era a "bolha amarela"/barras gigantes no quadro ~3 s do ep. 10: a placa PERIGO vista colada). `apocalipse: { grade: true|false }` força. `main.js` passa a posição da câmera ao mundo em `S.cam`.
- **Contador na tela**: `../contador.py <saida.ass> '<json>' [--com-legenda legenda.ass]` (ver cabeçalho do arquivo): `[{"t0":0,"t1":8,"rotulo":"MONSTROS","de":10,"ate":200}]` ou `valores:[[t,v],…]`, `valor`. Plaquinha arredondada no topo com pulo na mudança; mesclável com `legenda.py` num .ass só.

## PACOTE PRÉDIOS (20/11/2026) — `motor3d/cenarios5.js`: obra_azul, obra_vermelha, escritorio, skyline, rua, redacao, noite
Registrado como o pacote casa (import + ORIGEM z 24000..31200 + CAMS + `construirPredios` em `cenarios.js`; luzes `predio_*` + aliases em `luzes.js`; `noite` usa `luz('predio_noite')`). Opções e props: `../catalogo/CENARIOS.md`. Still: `catalogo/cenarios/predios.jpg` (0,22 s/quadro).
