# Auditoria do gerador de episódios (Tião) — 16/11

Só leitura. Marcação: [M] = medido agora ou lido no código; [H] = hipótese/estimativa não medida.
Medições feitas numa cópia do `web/` do ep. 09 em pasta temporária (nada do kit foi alterado).

## 0. Medidas rápidas [M]
| Item | Resultado |
|---|---|
| `--auditar` do vídeo todo (2253 q, passo 2) | 4,4 s, 7 grupos de aviso (mesmos de `storyboard/auditoria.txt`) |
| Render 1080x1920, 120 q consecutivos (2 trechos) | 0,13 s/q (bate com o RETRO). Vídeo de 75 s = 2253 q ≈ 4,9 min |
| Render 540x960 (mesmo trecho) | 0,09 s/q → só ~30 % mais rápido com 1/4 dos pixels. Logo o custo NÃO é só preenchimento de tela |
| `som_tiao.py` (eventos do ep. 09) | 31 s (CPU) |
| `mix_tiao.py` (75 s) | 74 s (CPU), -14,03 LUFS |
| ffmpeg x264 1080p crf18 `medium` | ≈ 1x tempo real (20 s de vídeo = 21 s) → ~75 s para o ep.; `veryfast crf20` = 8,5 s por 20 s → ~32 s |
| Relógio do ep. 09 (mtime) | 12:29 início; `voz/falas_tempos.json` 12:32:54; `story.js` final 12:56:28; render 12:56→12:59; mp4 12:59 (o RETRO diz 13:01). Ou seja ~24 min entre voz pronta e render começando = story + auditoria + 2 revisões [M pelas datas; a divisão interna é inferência] |
| Máquina | 4 núcleos, 7,8 GB, ~2,4 GB livres durante a medição (sessão do Claude aberta) |

Conclusão de custo: o motor NÃO é o gargalo de tempo do episódio; o gargalo é a autoria do `story.js` + ciclos de revisão. Mesmo assim só o render+som+encode já dão ~9–10 min de máquina se rodados em série (ver seção 4).

## 1. FUROS da estrutura (obrigam trabalho manual / tentativa e erro)

**1.1 Câmera é número digitado, sem relação com os bonecos**
- `motor3d/epi.js:18-23` `camBase`: `close` = `{x,z,alt,dist}` e `cm` = pos/look/fov absolutos; nada calcula distância a partir do tamanho do boneco. `cenarios.js:13-34` só tem 3 presets fixos (`geral/medio/close`) por cenário, e `cenarios.js:33` copia os do `espaco` para 12 cenários (não foram calibrados para eles).
- `epi.js:25-30` `camAt`: a câmera tem só 2 chaves (início/fim do plano) e `push` empurra para o ponto de olhar. Se o boneco anda (`x:(c)=>lerp(...)`, story.js:30,35,37,61) a câmera não segue.
- `story.js:17-20` (ep. 09): `UP`, `WD`, `MD`, `CL` são helpers LOCAIS do episódio, reinventados a cada vez e fora do kit. Cada plano tem x do boneco e x da câmera escritos separados (ex.: `WD(4.2)` com Astro em 3,2 / Tião em 3,95 / Zorbina em 4,8, story.js:54-57). Isso é a origem dos "colado/cortado na borda" (auditoria 182-236, 564-662, 916-1024, 1044-1166, 1244-1282, 1400-1440).
- `epi.js:20` o `close` usa `lado` 0,35 fixo e fov 40: a 3 m a largura visível é ~1,2 m; um boneco com braços abertos (bb largo) não cabe. O motor nunca avisa antes de renderizar qual `dist` caberia.
- Câmera "UP" (inclinar pra cima, story.js:17) corta cabeça/chapéu; o RETRO virou regra "pitch ≤ 10°" mas isso é regra de texto, não limite no código.

**1.2 A auditoria mede mas não conserta**
- `main.js:204-220` `auditaAtor` calcula x0/x1/y0/y1 na tela de cada boneco (já grava `AUDN`/`medidas` em `auditoria.json`, `render.mjs:22`) e `medidas_ep.py` imprime por plano. Falta o passo 3: transformar a medida em correção (`dx`, `dist`). Hoje o humano lê `[+0.80,+0.96]!!` e chuta de novo — é o ciclo tentativa-e-erro do ep. 09.
- Limiar fixo 0,84 (`main.js:216`) aplica o mesmo "colado" a braço aberto (gesto) e a corpo; o revisor teve que "aceitar colado em braços abertos" à mão (`revisao_final.md:15`). Falta separar corpo (tronco) de extremidade (braço).
- `render.mjs:17-25` só roda com Chromium+WebGL; não há versão sem GPU, mas 4,4 s é barato, então o problema não é custo e sim não fechar o laço.

**1.3 `cenas.json` x `SHOTS` são duas fontes de verdade**
- `cenas_ep.py` lê `story.js` com regex exata `\{ (?:de: N|t0: X)`; falha em silêncio se o plano estiver escrito `{de:` / multilinha, ignora `pre` (`epi.js:14`), e quando o plano tem `de:` e `t0:` juntos (story.js:70,71) pega o `de` e não o `t0`. Além disso `t0: T_DESVIO` é variável e não é parseável.
- [M] Neste episódio o `cenas.json` NÃO veio do script: tem 16 entradas por FALA (ex. `[4.254,7.621]` e depois `[7.921,...]`, com buracos de pausa) enquanto `story.js` tem 18 planos. Então `checar.py` (`checar.py:21,110`) olha por fala, não por plano; os cortes reais em 11,4 / 54,6 / 58,0 s não estão em `cortes` e geram falso "salto" (o revisor teve que escrever "saltos intencionais" em `revisao_final.md:15`), e planos curtos dentro de uma fala não têm folha própria.
- Por isso o revisor do storyboard (`revisao_storyboard.md`) viu "13 = 16 mesmo close" só depois de olhar a folha: não há checagem automática de plano duplicado/parecido.

**1.4 Poses por número**
- `rig.js:306` DEF: `aR:[ang,?]` em radianos soltos (`[2.7,-0.2]`, `[-1.6,0.2]`, story.js:29,43,56). Só existem `walk, clap, cheer, laugh` (`rig.js:803-805`), e `E.walk` é a única usada no ep. 09. Não existem poses nomeadas: apontar para um ponto do mundo, susto, recuar, segurar, comemorar, olhar para um objeto. `apontar` obriga calcular ângulo na mão (revisão do storyboard: "Astro aponta para a Zorbina e não para os cristais").
- `acoes.js` tem ações amarradas (canhão, duelo, corda, mastro) mas nenhuma de "apontar/olhar para ponto P", que é a mais usada em diálogo. O guia manda "nunca digitar mão à mão" (`KIT.md:73`) mas o ep. 09 digitou todas (story.js:29-83).
- Nada de camada de vida (respirar/balançar/olhar) automática em `epi.js`: boneco sem `p` explícito fica estático — o revisor: "Tião e Neto quase estáticos nos gerais" (`revisao_final.md:9`). `c.b()` (`epi.js:35`) só dá boca.
- Boneco acima do chão exige `y` + `apoio` (`acoes.js:26`) — correto, mas cada plano repete.

**1.5 Props na mão / objetos**
- `segura(pose,item,lado,a,s)` (`acoes.js:34`) funciona, mas depende de nome de item fixo no rig e de ângulo `a` digitado. Sem preset "segurar objeto para mostrar à câmera".
- Objeto de cena (foguete, cristais) só tem estados de 1–2 números: `foguete:{y,fogo}`, `cristais:0..1` (`cenarios.js:120-121`). Não existe estado "destruído / fumaça / cratera". O revisor reprovou a virada por isso (`revisao_final.md:7,21`): o motor não tem como mostrar a consequência sem escrever estado novo no cenário (trabalho G por vez).

**1.6 Efeitos**
- `efeitos.js:88-91` meteoro: `de`/`ate` livres, cauda = 3 cones + esfera; a direção vem de `ate-de`. No ep. 09 `A0=[8,15,-20]`→`AA=[2.5,3,-10]` (story.js:6) anda quase só em +z (para a câmera) → visto de frente é um disco chapado sem cauda [M pelo código; o RETRO e o LEIA já registraram]. Não há helper `meteoroLateral(origem,alvo,camera)` que force trajetória perpendicular à câmera, nem verificação no auditor.
- Impacto `imp` (`efeitos.js:66,90`) = esfera amarela que cresce e some = "clarão chapado". Sem plano de consequência embutido.
- Asteroide translúcido perto de Saturno (`cenarios.js:94`, "asteroides flutuantes") lê como mancha — defeito do cenário que reaparece em TODO episódio de espaço até ser consertado.
- Efeitos de câmera (`shake`, `flash`) são tuplas posicionais `[f0,f1,k]` por plano (`epi.js:27-29`): sem nome, fácil errar a ordem.

**1.7 Som**
- `som/eventos.json` é escrito à mão em segundos absolutos (ep. 09: 200+ linhas de JSON, `som_tiao.py:1-17`). Não deriva de `SHOTS` (corte→whoosh, fx.meteoro→tremor/estrondo, flash→impacto, silêncio nos "só imagem"). Se o plano muda de tempo, o som não acompanha.
- `mix_tiao.py` leva 74 s [M] e `som_tiao.py` 31 s [M], em Python/CPU, sem cache; mexer num evento refaz tudo.
- Trilha por seção (`leve|caça|tensão…`) também é lista manual.

**1.8 Voz / tempos**
- `epi.js:14` `st()`: plano = fala `de` (granularidade FALA) ou `t0` em segundos digitado. Para 1 plano por oração é preciso `t0` à mão para cada oração. O dado existe (`palavras.json` com `w/ini/fim`, usado por `alinhar_stt.py`) mas ninguém o corta por pontuação.
- `vozes_elenco.mjs:30-35,60-63`: 1 chamada TTS por personagem; se o nº de silêncios internos ≠ nº de falas cai para fala-a-fala (mais chamadas/cota, e `cortar_stt.py`/`alinhar_stt.py` são passos manuais para remendar). "Tião" ouvido como "tiam" é problema de TTS+STT, não do motor — mas não há grafia fonética no `falas.json` para forçar.
- `FT` por fala (`tempos_ft.js`) e `cenas.json` e `falas_tempos.json` são 3 arquivos derivados à mão.

**1.9 Procedimento / cópia do motor**
- `novo_ep.sh` copia TODO o motor para cada `web/` (612 KB, `novo_ep.sh:3-4`). Correção feita no kit não chega a episódios antigos e vice-versa (o `KIT.md:61` já registrou o caso do baú/bote).
- `LEIA.md:33-39` (receita "Novo vídeo") lista menos arquivos que `novo_ep.sh` (falta `cenarios.js`, `cenarios2.js`, `efeitos.js`, `epi.js`) — duas receitas divergentes.
- `render.mjs` não tem como renderizar pulando quadros no `finish.sh` (nomes `f%04d`), nem pipe direto para o ffmpeg: grava 2253 JPEG (~530 MB, q0,96) e depois reencoda.
- `checar.py final`: um ffmpeg por quadro por cena (3+1 por cena), `scene` score do vídeo inteiro, freezedetect, ebur128 e STT `small` [H: 1–3 min no total; não medi]. Não há modo "rápido".

## 2. O que falta para o story.js ficar quase mecânico: API de planos-modelo

Ideia: o `story.js` passa a ser uma LISTA de chamadas curtas (uma por oração). O kit calcula câmera, posições e poses; o humano/LLM só escolhe tipo de plano, quem fala e o gesto. Novo arquivo `motor3d/planos.js` (hipótese de desenho; nada foi implementado).

### 2.1 Peças

```js
// 1) segmentação: 1 plano por oração a partir de voz/falas_tempos.json + palavras.json
oracoes(falas, palavras, { minDur: 1.2, maxDur: 3.2 })
  // -> [{ i:0, fala:0, quem:'astro', t0:0, t1:2.1, texto:'Tião, corre!' }, ...]
  // corta por . ! ? e vírgula longa; funde orações < minDur; parte > maxDur no meio de palavra-pausa.
  // saída também vai para cenas.json (mesma fonte) e para som (cortes).

// 2) medidas dos bonecos (já existem: E.auditaPose -> bb em unidades do rig; escala SPEC.s)
medida(n, pose) -> { l, r, topo, base }      // metros, em relação ao pé

// 3) auto-enquadramento: dado quem aparece e onde, devolve a câmera que cabe com folga
enquadra(atores, { tipo:'close'|'medio'|'geral'|'over', margem: 0.12, fov: 46, alt: 'rosto'|'corpo', lado: 0, yaw: 0 })
  // atores = [{n, x, z, pose}] ; usa medida() + projeção pinhole analítica:
  // largura visível = 2*d*tan(hfov/2); d = max(largura_total/(2*tan(hfov/2)*(1-2*margem)), altura/(...)); centro = ponto médio das caixas
  // -> { cm:{pos,look,fov} } ; garante pitch <= 10° e nunca olha por baixo do cenário.

// 4) slots de posição seguros por cenário (relativos ao centro de interesse do cenário)
slots(cenario, 'dupla'|'trio'|'solo'|'estab') -> [{x,z}...]   // validados uma vez por cenário (pé no piso, sem sobrepor chapéu)

// 5) poses nomeadas (retorno = objeto de pose; aceitam alvo no mundo)
Pz.apontar(alvoXYZ, { mao:'R' })      Pz.olhar(alvoXYZ)           Pz.susto(k)        Pz.recuar(k)
Pz.correr(t)    Pz.comemorar(t)      Pz.falar(t, {gesto:'leve'})  Pz.segurar(item, { mostra:true })
Pz.pensar()     Pz.cair()            Pz.idle(t, seed)   // respirar/balançar: aplicado automaticamente a quem não tem pose

// 6) presets de plano (cada um devolve um SHOT do epi.js; já chama enquadra + slots)
P.solo(quem, o, { pose, ang:'frontal'|'tres-quartos', push:0.08 })
P.dupla(a, b, o, { fala:'a'|'b', pose_a, pose_b })
P.trio(a, b, c, o)
P.reacao(quem, o, { pose:'susto' })              // close curto 0,8-1,2 s
P.objeto(alvoNome|xyz, o, { fx })                // cutaway de objeto/consequência (min 1,5 s se for clímax)
P.estab(o, { dx, ang })                          // estabelecimento: geral com bonecos pequenos mas dentro de 12%
P.ombro(a, b, o)                                 // over-shoulder: b em primeiro plano, a em 3/4
P.fx(nome, params, o)                            // meteoro lateral, tremor, etc. com direção validada
// o = a oração: { t0, t1, i, quem } vinda de oracoes()
```

Todos os presets herdam o contexto `c` do `epi.js` (`c.t, c.u, c.a(i), c.b(i)`) e recebem `ator.x` como slot; o humano só passa `{pose}`.

### 2.2 Validação automática no mesmo passo
- `enquadra` devolve também `folga` por ator; se < margem, afasta (`dist`) ou recentra. `--auditar` vira "gate": falha se sobrar aviso de "cortado/espetado".
- `P.objeto` e `P.fx('meteoro')` ganham verificação: ângulo do vetor de trajetória em relação ao eixo da câmera ≥ 50° (senão vira disco) e duração mínima de 1,5 s quando `clímax:true`.
- Duplicados: comparar (tipo, quem, ângulo) de planos vizinhos e acusar "13 = 16" sem renderizar.

### 2.3 Exemplo: 6 planos (cenário `espaco`, trecho do gancho do ep. 09)

```js
import { episodio } from './epi.js';
import { oracoes, P, Pz } from './planos.js';
const O = oracoes(FALAS, PALAVRAS);                  // 1 por oração
const CRI = [4.9, 0, 0.3], FOG = [-4.4, 1.5, -6];
export const EP = episodio({ cen:'espaco', luzId:'espaco', FT, DUR, shots: [
  P.estab(O[0], { fx: P.meteoroLateral({ de:[-8,14,-12], ate:[8,6,-12] }) }),         // 0,0-1,6  meteoro cruza de lado
  P.solo('astro', O[1], { pose: Pz.apontar([2,12,-12]), ang:'3/4' }),                 // "Tião, corre!"
  P.reacao('tiao', O[2], { pose: Pz.susto(1) }),                                       // "Atrás de mim?"
  P.dupla('tiao','astro', O[3], { fala:'tiao', pose_a: Pz.correr, pose_b: Pz.apontar(FOG) }),
  P.objeto(FOG, O[4], { efeito: 'cauda-lenta' }),                                      // cutaway foguete (setup do payoff)
  P.ombro('astro','tiao', O[5], { pose_a: Pz.olhar(CRI) }),
]});
```
Cada linha ≈ 1 oração; o LLM escreve isso a partir do roteiro sem digitar x/câmera/ângulos de braço.

### 2.3b Esforço
- `oracoes()` + sincronização com cenas.json/som: P (2–3 h de trabalho humano; 1 sessão do LLM)
- `medida()` + `enquadra()` (analítico, testado contra `AUDN`): M
- `Pz.*` (10 poses nomeadas, validar visualmente numa folha): M
- `slots()` por cenário (espaco, cidade, brinquedo primeiro): M
- presets `P.*` + gate de duplicidade/direção: M
- estados de "consequência" nos cenários (foguete destruído, cratera, fumaça, objeto apagado): G por cenário (ver 1.5)

## 3. Capacidade de ritmo (25–34 planos/min)

- O custo por quadro [M] é independente do nº de planos: 0,13 s/q a 1080p com 17 planos; cortar mais NÃO encarece o render. Mais planos em outros cenários também é barato (cada cenário é um grupo em `ORIGEM` ligado/desligado, `cenarios.js:10,410`) [H: sem medir troca frequente].
- Efeito colateral real: o cartão do boneco é redesenhado quando a pose muda (`acoes.js:28`, chave com `q(t,1)` = 10 Hz). Mais planos = mais poses distintas = mais `draw` do canvas 1200x2000 + upload de textura [H: é parte dos 0,09 s que não somem a 540p; não perfilei].
- Resolução menor [M]: 540x960 → 0,09 s/q (−30 %). Ganho pequeno; 720x1280 deve ficar ~0,11 [H]. A resolução está cravada em `main.js:7,10` e `render.mjs:11` e `index.html`: precisa virar parâmetro (`SCALE`).
- Mais rápido de verdade [H, não medido]: (a) renderizar só quadros pares (`step 2`, "animar de 2 em 2", legítimo em cartoon) e duplicar no ffmpeg → ~2,5 min a 1080p; (b) pipe de JPEG/PNG direto para ffmpeg em vez de 2253 arquivos; (c) `veryfast` no x264 (−40 s).
- Paralelo: 4 núcleos mas 1 GPU RX 550 e 7,8 GB (≈2,4 GB livres medidos). Duas instâncias Chromium+WebGL 1080x1920 disputam a mesma GPU/VRAM e RAM; ganho esperado baixo e risco de swap [H]. A regra "um render por vez" deve ficar. O que PODE rodar em paralelo com o render é CPU não-gráfica: `som_tiao.py` + `mix_tiao.py` (105 s no total [M]), STT, ffmpeg de áudio [H que não atrapalha o render; não testei concorrência].
- Gargalo real a 25–34 planos/min: autoria (seção 1) e revisão por folha (1 miniatura por plano). A folha precisa de ~1 quadro por plano: 36 quadros = ~5 s de render [M, extrapolando 0,13 s/q].

## 4. Orçamento realista para ≤ 10 min

Etapas para um episódio de 75 s com ~35 planos, depois de implementar a lista de mudanças (seção 4.2):

| Etapa | Hoje (ep. 09) | Meta com o kit novo | Base |
|---|---|---|---|
| Roteiro + 1 crítica | ~3–4 min (junto com a voz) | 1:30 (sem rodada de reescrita) | [H] |
| Voz TTS + alinhamento por palavra | ~1–2 min | 1:15 (STT de palavras automático, `oracoes()`) | [H] |
| `story.js` | ~20+ min | 1:30–2:00 (35 linhas de `P.*`) | [H]; hoje [M por mtime] |
| Auditoria + auto-enquadramento | 4,4 s mas várias rodadas à mão | 0:15 (1 passada, gate) | [M] 4,4 s |
| Folha de storyboard + 1 revisor (em paralelo com som) | 2 revisões + re-render | 1:30 (1 passada, só gate crítico) | [H] |
| Som (eventos auto + som + mix) | manual + 105 s | 1:45 de CPU, em PARALELO com o render | [M] |
| Render | 4,9 min | 2:30 (2 em 2 quadros) ou 4:50 (1080p cheio) | [M] / [H] |
| Encode + checagem final automática | 1:15 + ~2–3 min | 0:30 pipe+veryfast + 1:00 | [M]/[H] |
| **Soma, com sobreposição** | **32 min** | **≈ 8:30–10:30** | [H] |

Fatores: só fecha 10 min com (a) render em 15 q/s únicos ou 720p, (b) som em paralelo ao render, (c) ZERO re-render, (d) UMA passada do revisor. Se o dono exigir 1080p a 30 q/s únicos, o render sozinho é 4,9 min e o total passa de 10.

### 4.1 O que NÃO cabe em 10 min
- Duas rodadas de revisor + re-render (cada re-render parcial já custa 1–2 min; o ep. 09 teve 2 parciais).
- Cenário/prop/estado novo (foguete destruído, personagem novo): G — fica FORA do ciclo de 10 min; precisa existir no kit antes.
- Regravar uma fala (TTS: "Tião"→"tiam") e remixar: +1–2 min e consome cota Gemini.
- Roteiro + crítico + reescrita em lote (2 passadas).
- Nota ≥ 8 do revisor numa única passada: o motor ainda perde pontos em clareza de virada (5,0) e continuidade (6,0) — esses dependem de roteiro/consequência, não só de enquadramento.

### 4.2 Lista priorizada de mudanças no kit (esforço)
1. **Auto-enquadramento + gate no auditor** (`enquadra`, `medida`; fecha o laço de `AUDN`): M — corta a maior fonte de retrabalho.
2. **`oracoes()` a partir de `palavras.json` + `cenas.json` e `eventos.json` derivados de `SHOTS`** (uma fonte de verdade): P/M.
3. **Poses nomeadas** (`apontar/olhar` com alvo no mundo, `susto`, `recuar`, `correr`, `comemorar`, `segurar`, `idle`): M.
4. **Presets de plano `P.*` + `slots()`** para os 3 cenários mais usados (espaco, cidade, brinquedo): M.
5. **Render rápido**: parâmetro de resolução e passo (2 em 2), pipe para ffmpeg, `veryfast`; SFX/mix em paralelo: P/M.
6. **`meteoroLateral()` + checagem de ângulo com a câmera + estados de consequência do cenário** (foguete destruído/fumaça, cratera): M para o meteoro, G para consequências por cenário.
7. **Som automático por plano** (corte→whoosh, fx→estrondo, "só imagem"→silêncio) e cache de `mix_tiao`: M.
8. **Corrigir o asteroide translúcido do espaço** (`cenarios.js:94`): P.
9. **Procedimento**: unificar `novo_ep.sh` e `LEIA.md`; linkar (symlink) o motor em vez de copiar, ou travar versão: P.
10. **Grafia fonética no `falas.json`** (campo `fala_tts`) para nomes que o TTS erra ("Tião"): P.
11. **Modo rápido do `checar.py`** (um quadro por plano, sem STT quando a voz é TTS conhecida): P.

## 5. Riscos de qualidade visual que são do MOTOR (se repetem entre episódios)

1. **Boneco cortado/colado**: enquadramento é de quem digita (1.1/1.2). Aparece em quase todo close/duo (ep. 09: 7 grupos de aviso). Já aconteceu também no V4 (bote entrando cortado).
2. **Ameaça/efeito que lê errado**: meteoro de frente = disco chapado; impacto = esfera/flash plano; cauda sem comprimento (`efeitos.js:64-66,88-91`). Revisor: "meteoro fantasma/disco" (`revisao_final.md:10`, `revisao_storyboard.md` ordem 8).
3. **Clímax sem "depois"**: cenário só tem estados binários (`cristais`, `foguete.y`), então a consequência (foguete destruído, fumaça) não pode ser mostrada sem código novo — revisor: clareza/virada 5,0 (`revisao_final.md:7`).
4. **Elementos de cenário ambíguos**: asteroide translúcido (`cenarios.js:94`) vira "mancha"; presets de câmera do `espaco` copiados sem calibrar para outros cenários (`cenarios.js:33`).
5. **Personagens estáticos** em gerais (sem camada idle) e braço por radiano chutado: "gente parada falando" (ep. 09, 22–48 s), `revisao_final.md:9,25`.
6. **Planos duplicados/parecidos** (13=16, virada 3=4) não são detectados pelo motor (`revisao_storyboard.md`).
7. **Sobreposição de personagens** (chapéu de um atrás do outro; Astro sobre Tião) — sem layout/colisão em `epi.js`.
8. **Objeto de payoff aparece só no corte da virada** (foguete): nada no motor obriga "mostrar ≥ 2x antes" (regra só em texto, `revisao_storyboard.md` erros novos).
9. **Cortes de áudio/voz frágeis**: voz por personagem cortada por silêncio (`vozes_elenco.mjs:60-63`); quando falha, fala-a-fala (cota) e depois remendo manual; STT ouve mal "Tião" e "mil anos" (nota de áudio 7,5).
10. **Falsos positivos do auditor/checar** (cortes intencionais, braços abertos) fazem o revisor perder tempo com ruído (1.2/1.3).

## Notas de método
- Medi só com `--auditar` e render de 4+60+120+120 quadros numa cópia em pasta temporária; não rodei `checar.py`, STT, nem render completo.
- Estimativas de tempo humano (story.js, revisor) vêm das datas dos arquivos e do RETRO; podem estar erradas por ±30 %.
