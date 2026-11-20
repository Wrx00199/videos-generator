# Auditoria do fluxo: skills, agentes, economia (Task 7, 18/11/2026)

**Nada foi apagado nem desativado.** Só listei e propus. Marcação: [F] medido · [H] hipótese · [C] chamada minha.

## 1. Skills [F]
- 25 skills com `SKILL.md` nas pastas do estúdio e global; **só 1 é do Tião: `estudio-bonecos`**. As descrições de todas entram no contexto de toda sessão (≈9,3 mil caracteres só dessas 25; as de plugins como superpowers, huashu, hypit e orca somam mais e eu não medi).
- A maior de longe: `claude-drawing` (2.968 caracteres de descrição, global). Depois `pixelfx` (789) e `earshot` (598).
- O Tião não usa: claude-drawing, pixelfx, remotion, hypit, huashu, hyperframes*, rea-video, estudio-clone/brolls/lives/motion (são outras frentes).

| Skill | Situação | Proposta |
|---|---|---|
| estudio-bonecos | usada | manter (reescrita com o fluxo V4) |
| earshot | usada só se o revisor ouvir a voz | manter só para o revisor conferir voz/áudio [C] |
| claude-drawing | nunca usada no Tião | tirar da invocação automática (a descrição de 3 mil caracteres paga todo chat); testar 1 fundo em camadas só se você pedir |
| pixelfx, remotion, hypit, huashu-art-motion | fora do fluxo | desligar a invocação automática no projeto do Tião |
| hyperframes (3), rea-video, estudio-motion | outras frentes (clone/motion) | manter, mas não carregar no fluxo do Tião |
| estudio-clone / brolls / lives | outras frentes | manter |

Como cortar sem apagar: marcar `disable-model-invocation` ou mover para uma pasta desativada. Preciso do seu OK e de qual jeito você prefere.

## 2. Agentes (9 em `.claude/agents`) [F]
Tião usava 5 papéis, 4 deles em opus: `roteirista-bonecos`, `critico-roteiro`, `diretor-retencao`, `revisor-bonecos` (+ `diretor-arte-bonecos` quando nasce cenário). Isso é muito token e foi o que **não barrou os bugs**: o revisor era por prompt.
- Sua decisão (outro chat): **orquestrador faz tudo + 1 revisor rígido que lê código e imagem**. Apliquei isso na skill e no `revisor-bonecos.md` (com backup `.bak_v4`).
- Proposta de aposentadoria (não apagados): `critico-roteiro`, `diretor-retencao`, `diretor-arte-bonecos`, `roteirista-bonecos` do fluxo do Tião. O que eles checavam estruturalmente agora é código (`portao.py roteiro`). A qualidade criativa do roteiro passa a depender de mim; **risco [H]**: roteiro era o ponto mais fraco e eu não tenho um crítico independente. Mitigação: o revisor lê o `falas.json` e responde "eu ficaria até o fim?".
- Manter para as outras frentes: `olheiro`, `roteirista`, `produtor`, `revisor` (clone).
- Modelo: revisor em opus (decisão única que pesa); resto do trabalho mecânico em sonnet/haiku.

## 3. Economia [F/C]
- Portão em código custa zero token; agente só depois dele passar.
- Revisor visual: 1 passada, folha reduzida (4 quadros por cena).
- Render só por `render_leve.sh` (nice/ionice, um por vez, tempo registrado).
- Meta de 10 min **não medida**: ainda não há episódio V4. Render de 1800 quadros a passo 2 ≈ 0,13 s/quadro ≈ 2–4 min [medição de 16/11]; voz, som e revisão somam o resto.

## 4. Partes chatas / lixo achadas (ordem de impacto)
1. **Revisor por prompt "não barra"** → resolvido com `portao.py` (36 testes). Falta ligar o `checar.py` antigo (STT x roteiro, saltos) ao portão: hoje são dois juízes.
2. **`vozes_elenco.mjs` só usava 1 chave e parava no 429** (é o script que o fluxo usa para as vozes por personagem). Corrigi: gira as 5 chaves, sai com código 3 só quando todas acabam. Testado com 1 fala real. `voz_puck.mjs` ainda usa 1 chave (não mexi; não está no fluxo).
3. **`eye:'look'` sem olho** (159 usos) → portão + rig cai em `dot`.
4. **`elenco.js` ≠ `rig.js`** (bruto e gerente só no elenco): rodar `gerar_elenco.sh` apaga. Migrar para o rig.
5. **Ep. 29 com `final.mp4` truncado** (sem moov, 24 MB): o lote não validou o arquivo; o portão reprova.
6. **`cenas.json` por fala × `SHOTS` por plano** (duas verdades; auditoria de 16/11). Para o portão V4, `cenas.json` = lista de planos reais; precisa gerar do `plano.json` em vez de regex em `story.js`.
7. **Voz crua com muito ar**: 17 palavras = 16 s no teste. Depende de `cortar_silencio.py`, que já trocou falas de lugar antes (ver Review Focus 4 do plano). Usar só `aparar_pontas.py` (testado: preserva o meio) e deixar o ritmo para o roteiro.
8. **51 arquivos `.bak*` no kit** e 9 em outras pastas: ruído. Proposta: mover para `_bak/` com seu OK.
9. **`tests/test_tts_config.mjs` já falhava** (espera ordem de chaves legada). Atualizar ou remover.
10. **Skills e agentes sobrando** (seções 1 e 2): custo fixo de contexto.
11. **Catálogo**: `lucia` sem cabelo no topo e cenário `apocalipse` com a placa tapando (aguardam seu OK para consertar); personagens genéricos/pouco variados e poucos novos (pedido seu, ver `AUDITORIA_MOTOR_18-11.md`).

## 5. O que preciso de você (uma coisa por vez)
a) OK para desativar a invocação automática das skills não usadas e aposentar os 4 agentes (ou diga quais ficam).
b) OK para mover os `.bak*` para `_bak/`.
c) Se o motor segue e se posso consertar `lucia` e `apocalipse` agora.
d) 3–5 links de vídeos "E se…/O que aconteceria se…" que você curte, para eu transcrever e medir (a pesquisa web só trouxe blog de ferramenta, fraca).
