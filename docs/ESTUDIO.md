# Estúdio de Vídeo 3D — inventário e arquitetura

Fonte única do estúdio em série. O painel é o produto: canal → pauta → molde → produzir → pacote de publicação.
Este arquivo nasce da Fase 0 (inventário real, 23/11/2026, branch `estudio-serie`). Decisões novas entram na seção **Decisões** no fim.

**Regra de ouro:** nenhum texto livre chega no render. Tudo vem de JSON validado; faltou dado → o validador acusa e o render para.

## 1. Grafo real (o que existe hoje)

```
Roteiro (falas.json, à mão/agente)           catalogo/{aprovados,vozes}.json
        │                                                │
        ▼                                                ▼
portao.py roteiro ── regras V4/V5/V6/V7 ──►  voz_ep.sh ──► vozes_elenco.mjs (por fala, Gemini TTS, 5 chaves)
        │                                      │ atempo 1.22 + aparar_pontas.py + montar → voz/dialogo.wav
        │                                      ▼
        │                          tempos_ft.js  (FT=[ini,fim] por fala, DUR)  ← stt.py → palavras.json → legenda.py → legenda.ass
        ▼
novo_ep.sh <proj>  copia motor3d/* → <proj>/web/ + tempos_ft.js→web/tempos.js + symlink lib/ e node_modules/
        │
<proj>/web/story.js (À MÃO por episódio: SHOTS, camAt, worldAt, actorsAt, fxAt, dofAt, lightFor)
        │  usa Pz, acoes.js (boneco/andar/andarRota/segura), cenarios*.js (ORIGEM/CAMS), luzes.js, efeitos.js, planos.js
        ▼
web/index.html → main.js (three.js toon) ──window.renderFrame(f)──► render.mjs (Playwright+Chromium, TIAO_GPU=vulkan)
        │  grava JPG f%04d.jpg + estado-render.json (status, pid, inicio, ultimo_sinal, total, salvos, reaproveitados, ultimo_quadro)
        │  RESUME=1 pula quadros já existentes; --auditar "a-b" [passo] → auditoria.json (pose/borda)
        ▼
finish.sh <quadros> <mix.wav> <out.mp4>  (ffmpeg libx264 crf20 + QA freeze/black/LUFS)   montar_final.sh / render_leve.sh / render_parcial.sh
        ▼
portao.py final|entrega + editorial.py (revisão) → prontos/<série>/ (somente MP4)
```

Pastas: `projetos/bonecos/serie-tiao-kit/` (kit, motor, portão, catálogo) · `projetos/bonecos/<data>-tiao-<slug>-NN/` (episódio) · `prontos/3D/Aventuras do Tião/` · `videos/` (MP4 recente versionado; antigos no Drive1).
Raiz `package.json`: só `playwright`. Testes: `npm test` (python unittest em `tests/` + `node --test tests/test_*.mjs`); testes do kit em `serie-tiao-kit/tests/`; painel: `node testes-painel/smoke.mjs`.

## 2. Componentes e assinaturas

### Motor (`serie-tiao-kit/motor3d/`, 7,9 mil linhas JS) — só aditivo
| Arquivo | Papel / API |
|---|---|
| `main.js`, `toon.js`, `toonbase.js`, `paint.js`, `index.html` | renderer toon 1080×1920; `window.renderFrame(f)`, `window.TOTAL`, `window.ready/err`, `window.auditFrame(f)`. Lê o `story.js` do diretório. |
| `story.js` (por episódio) | contrato: `FPS, TOTAL, SHOTS, shotAt(f), camAt(f)→{pos,look,fov}, dofAt(f)→{focus,cinf}, worldAt(f), actorsAt(f,T,W)→[ator], fxAt(), lightFor(S), LIGHTS` |
| `mundo.js` | navio/mar/cozinha/ilha; `DECK, COZ, ILHA`, `build()`, `chao(x,z)` |
| `cenarios.js`…`cenarios7.js` | cenários do catálogo; `ORIGEM[id]` (Vector3 do palco), `CAMS[id].{geral,medio,close}`, `RAIO` |
| `Pz.js` | poses: `Pz.sentar(p,{perfil})`, `chapeuNaMao({lado,progresso,chapeu})`, `apontar(alvoXYZ,bonecoXZ,{mao,progresso})`, `olhar(alvo,xz)`, `susto(k)`, `recuar(k)`, `correr(t)`, `comemorar(t)`, `segurar(item,{lado,mostra,s,subir})`, `falar({gesto})`, `pensar()`, `idle(t,seed)`, `passo(fase,amp)`, `maoDe`, `propNaCara`, `PROP_BOX` |
| `acoes.js` | `boneco(W,n,pose,x,z,t,extra)`, `segura(pose,item,lado,a,s)`, `andar(n,de,ate,{t0,vel,amp,corre,p})`, `andarRota(n,origem,trechos,o)`, `fila(n,x0,z0,passo,o)`, `anda`, `cava`, `deitaNaRede`, `caranguejo`, `objeto`, `rajada`, `duelo`, `amarradoNoMastro`, `LIMITE_CARTAO` |
| `epi.js` | `episodio({cen,FT,DUR,shots,luzId})`, reexporta `boneco, anda, andar, fila, E, Pz, ORIGEM, tremor`, `sm`, `lerp` |
| `planos.js` | `enquadra(atores,{fov,margem,alt})`, `slots(cenario,tipo)` (solo/dupla/trio/estab; cenários espaco/cidade/arena/apocalipse), `P.solo/P.dupla`, `oracoes(falas,palavras,opts)` |
| `cameras.js` | `CAMERAS`, `NOMES`, `enquadra(al,fov)`, `caixaDe(bb,x,z,chao,parte)`, `UNIDADE_M` |
| `luzes.js`, `efeitos.js`, `motion.js` | `luz(id,opts)`; `tremor(f,k)`, `construirEfeitos`; `camFromKeys(keys,f)`, `acordaDoSonho` |
| `elenco.js` | GERADO de `../rig.js` por `gerar_elenco.sh`; `E`, `prop()` |
| `render.mjs` | `node render.mjs <outdir|--auditar> <"a-b,c"> [passo] [qualidade]`; env `TIAO_GPU=vulkan`, `RESUME=1`, `TIAO_TOTAL`, `WEB`, `SEQ`, `CHROME` |
| `sheet.py` | `sheet.py <quadros> <folha.jpg> [colunas] [--area-segura]` |
| `finish.sh` | quadros + mix → MP4 + QA |

### Kit (`serie-tiao-kit/`)
- `portao.py <proj> roteiro|voz|prova|final|entrega|perfil|quadros` e `portao.py novo <slug>`; checagens: `checar_duracao/ritmo/planos/audio/formato`, `checar_roteiro_v4/v5/v6`, `checar_roteiro_kit`, `checar_planos_mecanicos`, `checar_ficha`, `checar_prova_v6`, `checar_voz_final`, `checar_cobertura`. Retorna `Resultado(ok,msg)`. Exit 1 se algum falha.
- `rig.js` (rig canônico dos bonecos), `catalogo/aprovados.json` (40 personagens, 28 cenários), `catalogo/vozes.json` (voz por personagem; narrador Puck), `KIT.md` (regra-mãe: o roteiro se adapta ao kit; lista NÃO PODE).
- Voz: `voz_ep.sh`, `vozes_elenco.mjs falas.json <voz/> --por-fala|--montar`, `voz_fala.py`, `aparar_pontas.py`, `montar_dialogo.py`, `conferir_fala.py`, `cortar_silencio.py`.
- Legenda/STT: `../../../ferramentas/stt.py <wav> pt small`, `corrigir_legenda.py`, `legenda.py`, `alinhar_stt.py`.
- Revisão/medidas: `editorial.py`, `medidas_ep.py`, `medir_dopamina.py`, `checar.py`, `cobertura.py`, `previa.py`, `folha_ep.py`.
- Moldes de roteiro (prosa): `MOLDES_ROTEIRO.md`, `referencias_moldes.csv`.

### Ferramentas gerais (`ferramentas/`)
- `voz.mjs --texto|--arquivo --saida x.mp3 [--voz Fenrir]` (Gemini TTS, voz padrão Fenrir; saída JSON `{saida,duracao_s,tempos_s}`; recusa sobrescrever; exit 3 = cota). Chaves em `.env`, nunca imprimir.
- `clone.py` (PAUSADO): `iniciar|molde|analisar|voz|montar|validar|concluir`. Só referência de código; não usar no estúdio de série.
- `pesquisar.py <nicho> [--janela] [--top]` → `projetos/referencias.csv` (colunas: id,nicho,plataforma,link,titulo,canal,inscritos,data,dias,duracao_s,formato,idioma,views,views_dia,surto,engaj_%,nota,termo,candidato,motivo,rosto,visto_em). Nichos em `nichos/*.json`.
- `render.mjs` na raiz de `ferramentas/` = render HyperFrames (skill reativada em `.claude/skills/hyperframes`); **o motor do Tião é motor3d**, não este.
- `painel/servidor.mjs` (HTTP, porta 7777, ~549 linhas, rotas `/api/*`) + `painel/index.html` (505 linhas, abas atuais) + `painel/dados/`.

### Estado do render
`<quadros>/estado-render.json` já é gravado pelo `render.mjs` (status em_andamento/concluido/falhou, pid, inicio, ultimo_sinal, total, salvos, reaproveitados, ultimo_quadro). O estúdio estende com etapas (voz, timeline, render, qa) em `<ep>/estado-render.json` próprio (Fase 4).

## 3. Lacunas (o que o estúdio em série precisa construir)
1. `story.js` é escrito à mão por episódio, com câmera/atores acoplados ao roteiro → falta camada de dados (canal/molde/cena/episódio) e um `story` genérico que leia `episodio.json`.
2. Cenas não existem como unidade reutilizável (só código dentro de cada story).
3. Roteiro é texto livre (`falas.json`) → falta schema/validador transversal (portao.py valida regras de roteiro V4–V7, não estrutura de dados).
4. Não há orquestrador voz→timeline→render→QA com retomada por etapa, nem pacote de publicação, nem abas de estúdio no painel.

## 4. Arquitetura-alvo (dados em `projetos/<canal>/`)
- `canal.json` identidade, elenco, voz, kit de props, estilos, formato de thumb e de título.
- `molde.json` (por canal, em `moldes/`) beats, duração, câmera, cadência, CTA.
- `cena.json` (em `cenas/`) cenário, slots de pose/prop, trajetórias, variações.
- `episodio.json` pauta, cenas escolhidas, parâmetros, fala.
Schemas em `config/schemas/`. Validador: `ferramentas/validar_episodio.py` (exit 1 reprova). Pipeline: `gerar_episodio.py` → `produzir.py` → `publicar.py`. Painel: abas Canais, Caçar, Moldes, Cenas, Produção, Fila.

## Decisões
- (F0) O estúdio reusa o `motor3d` sem alterá-lo (apenas aditivo). Um `story` genérico vai em arquivo novo no motor (aditivo) quando necessário.
- (F0) `clone.py` e `portao.py` continuam como estão; o validador novo é complementar (estrutura de dados), não substitui o portão de roteiro V7.
- (F0) O repositório é público: nenhum segredo, e só vídeo recente em `videos/`.
