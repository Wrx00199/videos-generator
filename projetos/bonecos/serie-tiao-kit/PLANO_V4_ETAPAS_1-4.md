# Tião V4 — Plano das etapas 1–4 (kit) 

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Barrar em código os bugs que o lote 14–28 deixou passar, antes de qualquer episódio novo.
**Architecture:** `portao.py` (script puro, exit code 0/1) vira o juiz de cada etapa; voz ganha rotação das 5 chaves com parada total; catálogo aprovado e banco de 8 câmeras alimentam as checagens. Motor Three.js fica; só se audita.
**Tech Stack:** Python 3 (`unittest` da stdlib, pytest não está instalado), Node 24 (`node:test`), ffmpeg/ffprobe, faster-whisper (`ferramentas/stt.py`).
**Spec:** `projetos/bonecos/serie-tiao-kit/DESIGN_V4_PORTOES.md` (a etapa 5, episódio novo, é outro plano depois de aprovada a etapa 4).

## Global Constraints
- Raiz: `/media/wr/HDD/Estudio de video` (kit em `projetos/bonecos/serie-tiao-kit/`). Sem git: antes de editar arquivo existente, `cp X X.bak_v4`.
- Duração 50–75 s; ≥2,8 palavras/s; ≥25 planos/min; nenhum plano parado >3 s; LUFS -14 ±1; pico ≤ -1 dBTP; silêncio no meio da fala ≤0,4 s; STT ≥70% por fala; vídeo 1080x1920.
- Um render por vez, `nice -n 19` + `ionice -c3`. Chaves Gemini `GEMINI_API_KEY_1`…`_5` em `.env`; nunca imprimir valor (só `…<4 últimos>`).
- Exit code é a verdade: relatório de agente não conta. Nada publicado.
- Canal PT-BR; sem palavrão.

## Review Focus
1. Vídeo sem faixa de áudio → reprova (não "passa por não medir").
2. Roteiro/`falas.json` vazio ou fala com 0 s → erro claro, sem divisão por zero.
3. Chave ausente/inválida no `.env` → pula para a próxima, sem vazar valor; todas falham → exit 3.
4. Silêncio no meio da fala deve ser preservado ao aparar pontas (já trocou falas de lugar antes).
5. Projeto sem `cenas.json` → mensagem pedindo o arquivo, não stack trace.

## Estrutura de arquivos
- Create `portao.py` (CLI + checagens), `tests/test_portao.py`
- Create `aparar_pontas.py`, `conferir_fala.py`, `tests/test_voz_ferramentas.py`
- Modify `../../ferramentas/voz.mjs`, `../../ferramentas/tts_config.mjs`; Create `tests/voz.test.mjs`
- Create `aprovar_catalogo.py`, `catalogo/aprovados.json`, `AUDITORIA_MOTOR_18-11.md`
- Create `motor3d/cameras.js`; Modify `portao.py` (variedade)
- Create `render_leve.sh`; Modify `KIT.md`, `.claude/skills/estudio-bonecos/SKILL.md`, `.claude/agents/revisor-bonecos.md`

---
### Task 1: `portao.py` — checagens de mídia e roteiro
**Files:** Create `portao.py`; Test `tests/test_portao.py`
**Interfaces — Produces:**
`@dataclass Resultado(nome:str, ok:bool, valor:str, limite:str, motivo:str)`;
`checar_duracao(seg:float)->Resultado`; `checar_ritmo(palavras:int, seg:float)->Resultado`; `checar_planos(cortes:list[float], seg:float)->Resultado` (planos/min e maior plano); `medir_audio(mp4:str)->dict{lufs,pico,tem_audio,silencios_meio:list[float]}`; `checar_audio(m:dict)->Resultado`; `checar_formato(mp4:str)->Resultado` (1080x1920); CLI `python3 portao.py <projeto> <etapa>` com etapas `roteiro|final`, imprime tabela e sai 0 só se todos `ok`.
- [ ] **Step 1: testes** (`unittest`): `checar_duracao(57.2).ok`; `checar_duracao(127.8).ok is False` e `checar_duracao(49.9).ok is False`; `checar_ritmo(0, 10)` → `ok False` sem exceção; `checar_ritmo(168, 57.2)` ok (2,94); `checar_planos([0,2,4.5,9], 9)` → reprova por plano de 4,5 s; `medir_audio` num wav senoidal gerado por ffmpeg → `tem_audio True`; num mp4 sem áudio → `tem_audio False` e `checar_audio` reprova (Review Focus 1).
- [ ] **Step 2:** rodar `python3 -m unittest tests.test_portao -v` → FALHA (módulo não existe).
- [ ] **Step 3:** implementar acima. Medição via `ffmpeg ebur128=peak=true` e `silencedetect=n=-40dB:d=0.4`; `silencios_meio` ignora o primeiro/último 0,5 s.
- [ ] **Step 4:** CLI `final` lê `final.mp4`, `falas.json` (palavras = soma das falas), `cenas.json` (`[[ini,fim,rótulo]]`; ausente → exit 2 com "falta cenas.json", Review Focus 5). 
- [ ] **Step 5: calibração real:** `python3 portao.py ../2026-11-17-tiao-furacao-29 final` e no ep 27 (`2026-11-17-tiao-trem-fantasma-27`) → ambos devem **reprovar** por duração; `/home/wr/Downloads/final_10b_v2.mp4` deve passar duração/formato. Ajustar só limiares que o spec marca como [C].
- [ ] **Step 6:** testes passam; `cp` não necessário (arquivo novo).

### Task 2: HUD sem sobreposição + trava de lote
**Files:** Modify `portao.py`; Test `tests/test_portao.py`; Create `portao/CORTE.txt` (conteúdo `2026-11-18`)
**Interfaces — Produces:** `hud_sobrepoe(eventos:list[tuple[float,float,float,float]])->list[tuple[int,int]]` (cada evento = `(ini_s, fim_s, y_min, y_max)` em fração 0–1 da altura; devolve pares que se cruzam no tempo **e** no espaço); `checar_hud(proj)->Resultado` (≤1 elemento por vez); `trava_lote(raiz:str)->Resultado` (reprova se existe projeto em `projetos/bonecos/` com data ≥ `CORTE.txt`, com `final.mp4` e sem arquivo `APROVADO_FILIPPE`); CLI `portao.py novo <slug>` só cria a pasta se `trava_lote` ok.
- [ ] **Step 1:** ler o formato de `projetos/bonecos/2026-11-17-tiao-trem-fantasma-27/contadores.json` e `legenda.ass`; mapear para `eventos` (decisão do implementador, anotar no cabeçalho do arquivo).
- [ ] **Step 2: testes:** `hud_sobrepoe([(0,3,.05,.15),(1,2,.08,.18)]) == [(0,1)]`; sem cruzamento no tempo → `[]`; o `contadores.json` do ep 27 → `checar_hud(...).ok is False` (é o bug visto: título duplicado); `trava_lote` num diretório temporário com projeto 2026-11-19 com `final.mp4` sem aprovação → reprova; com `APROVADO_FILIPPE` → ok; projetos antigos (14–28) **não** travam.
- [ ] **Step 3:** rodar e ver falhar; **Step 4:** implementar; **Step 5:** rodar e ver passar.

### Task 3: voz — rotação das 5 chaves, pontas, conferência
**Files:** Modify `ferramentas/tts_config.mjs`, `ferramentas/voz.mjs` (backup `.bak_v4`); Create `aparar_pontas.py`, `conferir_fala.py`; Test `tests/voz.test.mjs`, `tests/test_voz_ferramentas.py`
**Interfaces — Produces:**
`chavesTts(env):string[]` (de `GEMINI_API_KEY_1`…`_5`, ignora vazias); `async girarChaves(chaves:string[], tentar:(chave:string)=>Promise<T>):Promise<{ok:true,valor:T,usada:number}|{ok:false,erro:'cota_esgotada'}>` (quota/429 → próxima; outro erro → propaga); `voz.mjs` sai com código 3 e JSON `{"erro":"cota_esgotada"}` quando `ok:false`;
`aparar_pontas.py <in.wav> <out.wav>` (remove só silêncio inicial/final, deixa 0,05 s); `conferir_fala.py <audio> "<texto>"` imprime `{"cobertura":float}` e sai 0 se ≥0,70.
- [ ] **Step 1: testes node:test:** `girarChaves(['a','b','c'], f)` com `f` lançando 429 em `a` e `b` → usa `c`, `usada===2`; todas 429 → `{ok:false,erro:'cota_esgotada'}`; lista vazia → `cota_esgotada`; erro 500 não gira. Teste de segurança: saída serializada nunca contém o texto da chave (Review Focus 3).
- [ ] **Step 2: testes python:** wav gerado = 1 s silêncio + 1 s tom + 1 s silêncio + 1 s tom + 1 s silêncio → `aparar_pontas` mantém o silêncio do meio (duração de saída ≈ 3,1 s) (Review Focus 4); `conferir_fala` com transcrição simulada (função `cobertura(ref,hip)->float` testada isolada): `cobertura("o tião foi à lua","tião foi lua")==0.6` reprova, idêntico → 1.0.
- [ ] **Step 3:** rodar `node --test tests/voz.test.mjs` e unittest → FALHAM. **Step 4:** implementar; `voz.mjs` usa `girarChaves` (a ordem hoje privilegia `_2`/`_3`; passar a ordem 1→5) e continua com a voz/estilo fixos do arquivo. **Step 5:** passam; teste real: 1 fala curta de 3 s com `voz.mjs`, medir com `conferir_fala.py` (gasta 1 chamada de cota).

### Task 4: auditoria do motor e catálogo aprovado (PARADA OBRIGATÓRIA)
**Files:** Create `aprovar_catalogo.py`, `catalogo/aprovados.json`, `AUDITORIA_MOTOR_18-11.md`; Modify `portao.py`
**Interfaces — Produces:** `aprovados.json` = `{"personagens":{id:{"ok":bool,"falhas":[str]}},"cenarios":{id:{...}}}`; `checar_elenco(falas_json:str, aprovados:dict)->Resultado` (reprova personagem ou cenário fora da lista ou `ok:false`).
- [ ] **Step 1:** ler `motor3d/LEIA.md` e como `render.mjs --auditar` é chamado (ver `AUDITORIA_GERADOR_16-11.md`). 
- [ ] **Step 2:** `aprovar_catalogo.py` renderiza 1 quadro de teste por cenário e por personagem (olhos presentes, pernas/pés com sombra, escala, rosto livre, não cortado), com `nice`, **um por vez**, e preenche `aprovados.json`. Teste unitário: `checar_elenco` com id ausente reprova; id com `ok:false` reprova; id aprovado passa.
- [ ] **Step 2b (adendo do Filippe, 18/11):** a auditoria também olha **qualidade de design**, não só bug: (a) personagem feminino precisa ler como feminino — o relevo cinza do queixo parece barba e estragou a capitã ruiva (cabelo, roupa, maquiagem e tom de pele já foram trocados antes); criar opção do rig que desliga o relevo de queixo e checar com render de teste; (b) personagens gigantes (escala) funcionam e entram no catálogo com escala própria; (c) elenco rival feio = marcar `ok:false` com a falha em palavras; (d) nomes e humor BR (ex.: Beto, Senhor Caramelo, moeda "tinhão"). Paródia só de TIPO (ex.: bilionário de desafio); nome, rosto, marca ou obra real nunca (regra do projeto).
- [ ] **Step 3:** escrever `AUDITORIA_MOTOR_18-11.md` (curto): o que falha, quantos, causa provável, esforço de conserto. Incluir o caso do Tião sem olho/perna do ep 27.
- [ ] **Step 4: PARAR e mostrar o resumo ao Filippe.** Se houver defeito estrutural (muitos reprovados no mesmo ponto do rig), voltar à conversa antes de seguir; senão consertar os reprovados mais usados e reauditar.

### Task 5: banco de 8 câmeras e variedade de plano
**Files:** Create `motor3d/cameras.js`; Modify `portao.py`; Test `tests/test_portao.py`
**Interfaces — Produces:** `cameras.js` exporta `CAMERAS = {abertura_push, close_reacao, detalhe_objeto, corte_transversal, travelling_lateral, plongee, orbita, whip_pan}`, cada uma `(alvo, t)=>{pos,olhar,fov}`; `plano.json` do projeto = `[{ini,fim,camera,cenario}]`; `checar_variedade(planos:list[dict])->Resultado` (nenhuma `camera` igual em planos seguidos, ≥5 câmeras distintas, ≥3 cenários/ambientes distintos em ≥60 s).
- [ ] **Step 1: testes:** lista alternando 5 câmeras → ok; `[push, push, ...]` → reprova com o índice; 4 câmeras distintas → reprova.
- [ ] **Step 2:** ver falhar; **Step 3:** implementar o check; **Step 4:** ler como `epi.js` define a câmera hoje e escrever `cameras.js` com as 8 funções (mesma convenção de `enquadra`, folga ≥12% nas bordas); **Step 5:** render de teste de 1 plano por câmera numa cópia temporária (4 quadros), olhar a folha reduzida uma vez.
- [ ] **Step 6 (teste opcional pedido pelo Filippe):** 1 fundo em 3 camadas feito com claude-drawing como camada do motor; adotar só se ficar melhor que o cenário 3D atual no mesmo plano.

### Task 6: ligar tudo ao fluxo e à economia
**Files:** Create `render_leve.sh`; Modify `KIT.md`, `.claude/skills/estudio-bonecos/SKILL.md`, `.claude/agents/revisor-bonecos.md` (backup `.bak_v4`)
- [ ] **Step 1:** `render_leve.sh <projeto>` = `nice -n 19 ionice -c3 node render.mjs …`, imprime `[INÍCIO hh:mm]` e `[FIM hh:mm, duração]`.
- [ ] **Step 2:** na skill, ordem obrigatória: roteiro→`portao.py roteiro`→(Filippe)→voz→`portao.py final`→revisor→auditoria minha→Filippe; sem `portao` ok não há próxima etapa; 1 episódio por vez (`portao.py novo`).
- [ ] **Step 3:** no `revisor-bonecos.md`: só julga depois de `portao.py final` ok; folha reduzida (4 quadros por cena); modelo `opus` mantido; sem nota "inflada": se o portão reprova, a nota não existe.
- [ ] **Step 4:** registrar no `KIT.md` as regras novas (1 linha cada) e no Second Brain (`Estado e pendências.md`) o resultado da etapa; conferir o arquivo depois de escrever.
- [ ] **Step 5 (verificação final):** `python3 -m unittest discover tests -v` e `node --test tests/` verdes; `portao.py final` reprova os eps 27 e 29 e passa o 10b nas checagens de mídia.

### Task 7 (adendo do Filippe, 18/11): auditoria de skills, agentes e economia
**Files:** Create `AUDITORIA_FLUXO_18-11.md`; Modify só com OK dele.
- [ ] **Step 1:** listar skills e agentes que o estúdio carrega (`.claude/skills`, `.claude/agents`, skills globais citadas no CLAUDE.md) e marcar quais o Tião realmente usa (usadas / nunca usadas / duplicadas). Skills não usadas custam contexto em toda sessão pela descrição.
- [ ] **Step 2:** propor corte ou fusão (ex.: huashu, claude-drawing, remotion, pixelfx, hypit ficam fora do fluxo do Tião; claude-drawing só pontual). **Não apagar nada sem OK do Filippe.**
- [ ] **Step 3:** conferir agentes: manter especialistas (roteirista, produtor/render, revisor), cada um com o modelo mais barato que dê conta; revisor depois do portão; autoauditoria final mínima do orquestrador (relatório do script + folha reduzida).
- [ ] **Step 4:** lista curta "partes chatas/lixo" achadas no caminho (qualquer etapa), ordenada por impacto, para o Filippe escolher o que consertar. Uma coisa por vez; nenhum vídeo novo antes de Tasks 1–6 verdes.
