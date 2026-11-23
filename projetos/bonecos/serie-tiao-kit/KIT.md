# KIT V6 — Aventuras do Tião (fixo desde 23/11/2026)

**Regra-mãe:** o roteiro se adapta ao kit. Episódio NÃO cria cenário, personagem, roupa nem gesto novo. O kit só cresce numa rodada separada, testada no banco de animações e aprovada pelo Filippe olhando a folha. Não se clona vídeo: referências viram só moldes de roteiro (`MOLDES_ROTEIRO.md`).

## Universo
- Tião: cozinheiro baixinho do navio, chapéu de chef, **único personagem branco**. Bonzinho, se ferra e salva o dia sem querer.
- Gancho fixo de abertura: "Tião foi…" / "E se o Tião…", dito no 0 s, com ação já acontecendo.
- Duração: 60–90 s. Narrador único (voz `narrador`) + falas curtas dos personagens.
- Séries: A = "E se o Tião tivesse o poder X"; B = aventura histórica/ficcional. Sem guerra atual, sem pessoa real, sem marca/obra de terceiros.

## Catálogo FIXO
**Cenários** (`catalogo/aprovados.json` → `cenarios`; código em `motor3d/cenarios*.js`):
navio (navioberm, bermudas), cozinha, sala, quarto, fachada, rua, cidade, skyline, predio_topo, escritorio, redacao, obra_azul, obra_vermelha, noite, floresta, amazonia, maia, dojo, arena, parque, cemiterio, cyberpunk, apocalipse, espaco, nuvens, fundomar, brinquedo.
Reusar o mesmo cenário em episódios espaçados é normal (ver `catalogo/USO_CENARIOS.md`).

**Personagens** (`motor3d/elenco.js`; vozes fixas em `catalogo/vozes.json`):
- Tião (`tiao`, variações `tiao4k` chamuscado, `tiaosuper`).
- Tripulação: `cap` Capitão, `mar1` Beto, `mar2` Zeca.
- Rivais: `ruiva` + `riv1`/`riv2`, `barbacoral` + `coral1`/`coral2`.
- Civis genéricos coloridos: `vizinha`, `feirante`, `balconista`, `carteiro`, `tonho`, `dede`, `chiquinha`, `lucia`, `apostador`.
- Fantasia: `bruxa`, `tigresa`, `raposa` e as criaturas de `aprovados.json`.
Variação permitida sem rodada de kit: cor de roupa/chapéu (`hatCol`, `body`) e acessórios que já existem no rig. Nada além disso.

**Gestos** (`motor3d/Pz.js`, provados em `_estado/banco-animacoes/folha_v6.jpg`):
andar/`andarRota`, `correr`, `sentar(progresso)` (de frente, cadeira virada pra câmera), `chapeuNaMao({progresso, chapeu})` (Tião usa `chapeu:'chapeuChef'`), `apontar(alvo, pos, {mao, progresso})` (mão do lado do alvo), `segurar(item, {lado, mostra})`, `falar`, `pensar`, `olhar`, `susto`, `recuar`, `comemorar`, `idle`.
Gesto fora da lista = vira corte, close de objeto ou reação. Nunca pose digitada à mão.

**Props de mão:** os de `prop()` em `motor3d/elenco.js` (glass, ladle, map, lantern, sword, shovel, recipe, quill, bicorne, chapeuChef, abridorLata, latinha…).

## Produção (tempo padrão; não pode crescer)
1. Escolher molde em `MOLDES_ROTEIRO.md` + cenários/personagens do catálogo → `falas.json` + `plano.json` (cada plano com `cenario`, `luz`, `ini`, `fim`). `python3 portao.py <proj> roteiro`.
2. `bash novo_ep.sh <proj>`; copiar `story.js` para `<proj>/web/`. Auditoria sem imagem: `cd <proj>/web && node render.mjs --auditar "0-N" 2`.
3. Voz: `voz_fala.py` (uma chamada por fala, confere STT) + `montar_dialogo.py`.
4. Render: `TIAO_GPU=vulkan bash render_leve.sh <proj>` (um por vez) → `montar_final.sh`.
5. `python3 portao.py <proj> final` + `revisor-bonecos` (uma passada) → Filippe aprova → só então `prontos/3D/Aventuras do Tião/` e Drive1.
Cronometrar do início ao MP4 revisado, com esperas.

## NÃO PODE (prints em `docs/tiao/nao-pode/`)
1. Bola/objeto preto ou qualquer coisa tampando a cena ou o rosto.
2. Cena escura demais (ilegível no celular).
3. Plano vazio, sem ator ou sem ação; tela parada > 1,5 s.
4. Braço bugado (cotovelo espetado, cruzando o peito), membro atravessando objeto, boneco flutuando, pé fora do chão.
5. Boneco ou objeto-chave cortado na borda sem intenção.
6. Fala cita algo que não aparece; verbo de movimento sem movimento na tela.
7. Objeto surge/some na mão entre cortes sem gesto.
8. Comida nojenta/cabeça em panela no terror; HUD genérico sem tema.
Bug de motor se corrige no kit (`motor3d/`), com teste em `tests/`, nunca só no episódio.
