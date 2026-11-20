# MISSÃO AUTÔNOMA (Filippe dormindo) — leia inteiro, depois siga CONTINUAR

Dono: Filippe. Criada 20/11/2026 (~04:55 BRT). Português BR. Respostas curtas (ele lê no celular). Persona/regras: `/home/wr/.claude/CLAUDE.md` + `CLAUDE.md` da pasta. Memórias do projeto: `/home/wr/.claude/projects/-media-wr-HDD-Estudio-de-video/memory/` (ler as `tiao-*`, `bonecos-*`, `serie-tiao-*`, `painel-gta6-meta-only`, `sem-rosto-no-clone`, `clona-edicao-nao-conteudo`).

## Autonomia
Decidir sozinho, SEM perguntar. Escolher, anotar a escolha no estado e seguir. Erro/bloqueio: tentar alternativa permitida; se esgotar, registrar em "Pendências p/ Filippe" e passar à próxima tarefa.

## Proibido (mesmo autônomo)
- Postar/publicar qualquer vídeo, entrar em login/senha, gastar dinheiro, aceitar termos, criar conta.
- Apagar: originais, `projetos/`, `prontos/`, pastas do Filippe. Só temporário próprio (`_tmp`) e lixo inequívoco.
- Subir segredo (`.env`, chaves GEMINI/GitHub/etc.) ao GitHub. Antes de todo push: grep por `AIza`, `gho_`, `GEMINI_API_KEY=`, `sk-`, `token`.
- Repostar vídeo alheio. Modelar = refazer edição própria (regra `clona-edicao-nao-conteudo`, `sem-rosto-no-clone`).
- Mexer em janelas do Chrome do xCloud (`chrome-xcloud-nao-mexer`): preferir curl/yt-dlp/ffmpeg sem janela.

## PC fraco (Ryzen 3 3200G, RX550, 8 GB, Linux) — não explodir
- UM render pesado por vez. `nice -n 15` + `ionice -c3`. Antes de render: RAM livre ≥ 1,5 GB (`free -m`), senão esperar/abortar.
- Nunca dois processos pesados (render + clipador/whisper) juntos. Painel 7777 fica de pé (leve).
- Disco: não baixar mídia grande sem necessidade; apagar só o próprio `_tmp` ao fim da etapa.

## Orçamento do limite (Pro). Medir com `mcp__ccd_session_mgmt__get_usage` (carregar via ToolSearch) no início e a cada etapa
- PARAR em ≥ 95% do limite de 5 h **ou** ≥ 75% do semanal (semanal já estava em 27% em 20/11). Parar = terminar a etapa mínima, salvar estado, commit+push, liberar lock, encerrar.
- Economia: grep antes de ler; não reler após editar; imagem só em recorte, print inteiro só na revisão final; subagente só p/ saída volumosa (haiku busca/log, sonnet edição mecânica, opus lógica); 1 subagente por tarefa; não delegar o pequeno. Preferir código/JSON/ffmpeg a IA. Opus advisor 1–2 vezes por sessão (antes de fechar arquitetura, antes de entregar).
- Registrar no estado: % de uso ao começar e ao parar cada sessão.

## Estado, lock e não duplicar
- Estado vivo: `_estado/MISSAO-ESTADO.md` (checklist `[ ]`/`[x]`, decisões, medições, pendências, % de uso). Atualizar a cada etapa. Continuar SEMPRE do primeiro `[ ]`. Nunca refazer `[x]` (só se teste falhar).
- Lock: `_estado/missao.lock` com `{sessao, hora_iso}`; atualizar a cada ~10 min. Ao iniciar: se lock com < 25 min de idade → outra sessão ativa → ENCERRAR sem fazer nada. Sessão que termina apaga o lock.
- Parada manual do Filippe: se `_estado/missao.json` tiver `"ativo": false` → encerrar.
- Git: commit pequeno por etapa; push em `main`. Mensagem em pt-br. Fim do commit com a linha de coautoria que o sistema pedir.

## Repositório (Filippe autorizou criar)
- `gh` já logado como `Wrx00199`. Criar PRIVADO `Wrx00199/videos-generator` (nome do projeto: "Videos Generator"). Pasta local = a própria `/media/wr/HDD/Estudio de video` (`git init`, remote origin) para NÃO duplicar.
- `.gitignore` por allowlist: ignora tudo e libera só código/docs: `CLAUDE.md`, `AGENTS.md`, `PROMPT-INICIAL.md`, `.claude/`, `ferramentas/`, `config/` (sem segredos), `docs/`, `docs-painel/`, `estilos/`, `nichos/`, `marca/` (só json/txt; sem binários grandes), `tests/`, `testes-painel/`, `package*.json`, `_estado/` (sem lock), README. Ignorar: `projetos/`, `prontos/`, `referencias/` (mídia), `node_modules/`, `_tmp*`, `.env`, `*.mp4 *.mov *.wav *.mp3 *.png` grandes, `banco/` se tiver dados pessoais (conferir).
- `README.md` para QUALQUER IA/aparelho (Claude Code inclusive no celular): o que é, como rodar o painel (`PORTA_PAINEL=7777 node ferramentas/painel/servidor.mjs`), estrutura, regras, como continuar (esta missão). `AGENTS.md` já existe: manter coerente.
- Pasta `/media/wr/HDD/painelgta` (repo antigo só de cortes, colaborador svtheus) NÃO mexer nele.

## Contas (para o painel)
- Six Stars: Instagram+Facebook `six_starsbr`, nicho GTA 6 (TikTok opcional, desligado).
- Aventuras do Tião: YouTube `aventurasdotiao` (grafia pedida: "aventuras do tião" com 2 "o" no final do handle YouTube; anotar e deixar editável), TikTok `aventurasdotião` com 1 "o". Tião: Filippe posta MANUAL (só YouTube talvez por API grátis depois).
- Futuras: TikTok alemão (idiomas; Filippe faz fora), outros nichos (receitas, finanças, vídeos longos). Estrutura nasce preparada; nichos só no FIM.
- Cadência: Tião 2 vídeos/dia; GTA 3–4/dia, clipes mais impactantes, menos genéricos, + memes/carrossel.

# CONTINUAR — ordem de trabalho (Filippe: "foca mais no Tião; seja rígido; revise de verdade; teste")
**Fase 0 — Setup (1ª sessão, curto):** lock, `get_usage`, repo+.gitignore+README+push, criar `_estado/MISSAO-ESTADO.md` e `missao.json {"ativo":true}`. Remover do `/home/wr/.claude/CLAUDE.md` as 2 linhas mortas (`D/economia-memoria`, `Backup/.claude/projects`) — D e Backup foram apagados por ele.
**Fase 1 — Tião (maior parte do esforço):**
 a) Ler `.claude/skills/estudio-bonecos`, `.claude/agents/*bonecos*`, `projetos/bonecos/serie-tiao-kit/`, últimos 2 episódios em `prontos/3D/Aventuras do Tião/` e referências em `referencias/`. Diagnosticar plano a plano onde está mais fraco que a referência (usar `diretor-arte-bonecos` com recortes, não print inteiro).
 b) Regra nova: **modelar a referência plano a plano** (mesmo esqueleto, mesmo cenário/infográfico/motion/câmera o mais próximo possível; fala reescrita PT-BR; Tião é o protagonista). Criar a **ficha de modelagem obrigatória** (por plano: cenário, infográfico, motion, câmera, ação do Tião) e **revisor rígido** que reprova se cenário/motion for mais pobre que a referência. Atualizar skill+agentes. Erro vira regra no KIT.
 c) **Cenários Blender** (só cenários; personagens 2D animados por código): TESTAR 1 quadro (EEVEE vs Cycles baixo sample) na RX550 e medir tempo/RAM antes de prometer. Se viável: biblioteca de cenários (`projetos/bonecos/cenarios/` com contagem de uso: fixos da série vs. reaproveitáveis 3x espaçados), parallax em camadas + câmera animada. Se inviável: fallback (imagem/código) e registrar a medição.
 d) **Olheiro autônomo de bonecos** (ATUALIZADO pelo Filippe: NÃO precisa de aprovação dele; decida sozinho): varrer YouTube Shorts + Instagram (TikTok de apoio) por vídeos 2D/3D de bonecos/animação que estão BOMBANDO (BR e gringo, tanto faz; sem pessoa real). Para cada um útil: salvar em `referencias/<data>-<slug>/` (ficha curta + folha de quadros pequena, não vídeo pesado), nota de "modelável" e **como adaptar pro Tião** (cenário, gancho, ritmo, o que muda). Atualizar `referencias/INDICE_ESTILO_TIAO.md`. Usar essas referências nos episódios (Fase 1e). Fazer isso de novo a cada sessão (leve, 1 busca, subagente haiku) para a série não envelhecer.
 e) Produzir **até 4 episódios** do Tião que passem no revisor rígido (gancho de curiosidade+zombaria+payoff; molde v5/“E se…”; ≥60 s; 2 séries/dia conforme memórias). Entregar em `prontos/3D/Aventuras do Tião/` com marca "para-aprovar" no nome da pasta/arquivo. NÃO postar. Respeitar PC e orçamento.
**Fase 2 — GTA 6 gringo/autenticidade:** olheiro acha 3–5 vídeos gringos (Twitter/IG/YT) de GTA 6 sem pessoa real e fortes; escolher 1–2 e MODELAR (estudio-clone: preserva gancho/beats/ritmo, refaz fala/texto/marca; sem trailer como footage). Clipes mais impactantes: gate de nota alta no clipador (item 2 de `ferramentas/painel/ESTADO.md`) se couber. Meme/carrossel só se sobrar orçamento.
**Fase 3 — Painel:** multi-conta conforme combinado: seletor de conta (canto superior direito), sidebar com botão hambúrguer animado, engrenagem Configurações (cofre de chaves que valida sem mostrar valor, saúde do PC com CPU/RAM/disco/GPU lendo `/sys/class/drm/card*/device/gpu_busy_percent`), cadastro de conta sem código (nome, nicho, plataformas, pasta de saída, legenda-modelo, horários, tipo de produção), Revisão por conta com legenda EDITÁVEL (salvar → vale ao aprovar), botão copiar legenda + abrir página de upload, calendário/aviso “faltou vídeo hoje”, placar por conta, fila única de render (1 pesado por vez; leve/média/pesada), colar link de referência → subagente haiku analisa → fica “pendente de aprovação”, etiqueta de nicho (GTA/Tião/…), acesso pelo celular na rede local com senha (desligado por padrão; avisar IP), modo de postagem por conta manual/chrome/api (api só guarda config). Painel NÃO gasta IA. Visual: preto + dourado vibrante + branco. LOGOS: já feitos (3 SVGs + `comparar.html` em `marca/propostas-logo/`; Gemini de imagem deu 429 nas 3 chaves, free tier sem cota de imagem). NÃO refazer; só refinar se o Filippe pedir; NÃO aplicar definitivo (ele escolhe); usar provisória. Testar `node testes/smoke.mjs` e abrir o painel de verdade (navegador embutido, não o Chrome do xCloud) para revisar o layout.
**Fase 4 — Final:** estrutura p/ outros nichos (cadastro de nicho: receitas, finanças, idiomas/alemão molde “como se fala X”, vídeos longos), biblioteca de assets reaproveitáveis, saída em Drive (só campo/placeholder; rclone exige login dele). Revisar skills fracas, bugs, testes. Atualizar README.
**Sempre ao encerrar (qualquer sessão):** estado atualizado, push feito, lock apagado, e `_estado/RELATORIO-MANHA.md` (curto, p/ celular: o que ficou pronto, onde estão os vídeos para aprovar, o que ele precisa decidir, % de uso). Se a missão toda terminar: `"ativo": false` em `missao.json`.

## Nota 20/11 (sessão do painel)
- A tarefa agendada ANTIGA `tiao-piloto-automatico` (16:30/21:30) foi PAUSADA (enabled=false) porque duplicava a Fase 1e e usava o molde antigo sem a FICHA_MODELAGEM, disputando render e limite com esta missão. Ao concluir a Fase 1e (episódios aprovados pelo revisor rígido com a ficha), registre no RELATORIO-MANHA que ela pode ser reativada (o Filippe reativa no app; sessão agendada não consegue mexer em agendamentos).
- `clipes-piloto-automatico` (17:10/22:10) continua ativa: ela espera render alheio via pgrep. Antes de render, rode você também `pgrep -af 'render.mjs|ffmpeg|chromium'` e espere.
- Teste do agendamento OK (20/11 05:0x): a tarefa `videos-generator-continuar` encerrou sozinha ao ver o lock fresco.

## Ajustes do Filippe (20/11, depois de dormir ele lê o relatório)
- Referências NÃO esperam aprovação: decidir e usar sozinho (o "pendente de aprovação" vale só p/ coisas que mudam dinheiro/postagem).
- Ordem final: Tião (estrutura, gancho, roteiro, cenários, personagens, bom pra caramba) → clipes/GTA 6 (impacto, menos genérico) → painel (integrar a skill de design disponível, ex. `artifact-design`/skills de frontend/`huashu-art-motion`, para o visual; preto, dourado vibrante, branco) → nichos → **Fase 5**.
- **Fase 5 — REVIEW GERAL (no final, antes de parar de vez):** (a) rodar todos os testes (`node testes/smoke.mjs`, tests/, portões do Tião) e abrir o painel de verdade; listar e corrigir erros importantes; (b) revisar skills/agentes fracos e docs desatualizadas; (c) **economia de tokens**: medir o gasto por fase pelo `get_usage` (antes/depois), achar o que mais gasta (arquivos grandes relidos, subagentes desnecessários, imagem), cortar; (d) **economia do PC**: RAM/CPU/GPU/disco durante render e clipador (`/sys/class/drm/card*/device/gpu_busy_percent`, `free -m`), achar gargalo, ajustar nice/perfil; (e) varredura de segredos antes do push final; (f) registrar tudo em `docs/REVIEW_GERAL.md` e no RELATORIO-MANHA.
- Extras de bom senso: log de aprendizados (erro novo vira regra no KIT e no Second Brain); backup do estado no repo a cada etapa; limpeza de intermediários só com simulação; checagem de espaço em disco antes de render (`df`), abortando se < 20 GB livres.

## Autonomia ampliada + pedidos finais do Filippe (20/11)
- **Repo:** `Wrx00199/videos-generator` já existe (PRIVADO, push feito). Continue commitando por etapa.
- **Integrar ferramentas:** tem autonomia TOTAL para integrar app, skill, pacote ou repo que melhore a operação (o tweet do flxrnc lista 18: blender-skills, librosa, Openverse, reanimate, WhisperX etc.). Regras: fonte oficial/reconhecida (npm, pip, GitHub conhecido, flatpak), ler README e código antes, instalar em venv/projeto (nunca global sem necessidade), sem chave em lugar errado, medir RAM/tempo; se pesar no PC, descartar e registrar.
- **Pré-mortem:** antes de cada etapa, listar 3 riscos prováveis (RAM, voz sem cota, render que trava, arquivo grande, git com segredo, lock órfão) e já prevenir; todo erro novo vira regra em `serie-tiao-kit/KIT.md` + `docs/`.
- **Velocidade do Tião:** meta de um episódio com portão aprovado em tempo razoável (cronometrar roteiro→voz→render→revisão; **TETO 12–13 min de relógio por episódio (roteiro→voz→render→revisão→acabamento) com o PC livre; ideal bem menos; NUNCA 30 min**. Atualizado pelo Filippe 20/11; não prometer 1 min). Cortar etapa só se não perder qualidade; cachear voz/cenário repetidos; medir onde o tempo vai e atacar o maior pedaço.
- **Pastas:** NÃO criar pastas novas à toa. Organizar o estúdio com poucos níveis (`prontos/`, `referencias/`, `projetos/`, `_estado/`, `marca/`, `docs/`); documentar o mapa em `docs/PASTAS.md`. Mover só dentro do estúdio, com `docs/MOVIMENTOS.log` (origem→destino) para desfazer; NUNCA apagar. Os vídeos vão para o Drive do Filippe: deixe a saída padronizada por conta/série (`prontos/<conta>/<série>/`) e um campo "pasta de saída" configurável (rclone/Drive só quando ele fizer login).
- **Pasta Gon antiga** (`/media/wr/HDD/Gon`, 8,5 GB; tem `CLAUDE.md`, `BRIEF_FABLE_V6.md`, `PROMPT_MESTRE_V5.md`, `analise-videos-instagram.md`, `Estilo de video`, `projeto-gta6`, `recuperado`, `backups`): SOMENTE LEITURA. Garimpar com subagente haiku (grep/ls, sem ler tudo) o que for útil e ainda não está no estúdio (ideias, estilos, roteiros, prompts, análises). Resumir em `docs/GARIMPO_GON.md` (o que serve, onde está, como aplicar). Implementar o que for barato e valioso. Não apagar nada; o Filippe decide depois.
- **Ideias contínuas:** a cada fase, gerar 3–5 ideias novas (roteiros, estilos, formatos, ganchos, séries) para Tião e cortes/memes, registrar em `docs/IDEIAS.md` com nota de impacto×custo, e implementar as de maior retorno e menor custo.
- **Clonagem de outros tipos** (modelar vídeos de outros formatos): só depois de Tião e painel prontos e se sobrar orçamento; reaproveitar `estudio-clone`.

## REGRAS DE SUBAGENTES (nunca violar)
1. Só use subagente para isolar saída volumosa (busca ampla, logs, pesquisa) ou revisão independente. Tarefa pequena ou que depende do contexto da conversa: faça você mesmo.
2. Máximo 2 subagentes simultâneos. Um por tarefa. Nunca subagente dentro de subagente. Nunca em loop automático.
3. Modelo explícito em toda chamada: `haiku` busca/leitura/log/resumo; `sonnet` edição mecânica/teste/docs; `opus` lógica de projeto; `fable` só em arquitetura ou bug travado 2 vezes.
4. Brief curto: arquivos, objetivo, critério de pronto, e o que NÃO fazer. Peça resposta curta (resumo, não dump).
5. Subagente NÃO posta, NÃO apaga, NÃO instala nada, NÃO mexe em git/push, NÃO roda render pesado, NÃO toca em `.env`/chaves, NÃO abre o Chrome do xCloud, NÃO muda lock/estado/agendamentos. Só você faz commit, push, estado e lock.
6. Nunca dois processos pesados ao mesmo tempo (render, whisper, ffmpeg longo): subagente que precise de render pede a você e espera.
7. Relatório de subagente não é prova: confira o resultado (teste, trecho do arquivo, imagem em recorte) antes de marcar `[x]`.
8. Subagente que falha: não repita igual. Reduza o escopo, troque o modelo ou faça você mesmo. Máx. 1 retentativa.
9. Revisor de vídeo (`revisor-bonecos`) e crítico de roteiro: uma passada por episódio; correções novas vão para o produtor, não para nova rodada de revisor, salvo reprovação.
10. Antes de spawnar: confira `get_usage`; acima de 85% do limite de 5h, não spawne subagente novo.

## FILTRO RÍGIDO DO OLHEIRO (Filippe, 20/11) — vale p/ toda busca de referência
Aceitar SOMENTE vídeo **animado 2D ou 3D** (bonecos, personagens, cenário desenhado/renderizado), de **qualquer nicho/idioma**, que seja **viral** (views muito acima da média do canal ou surto recente; registrar views, idade, canal) e **modelável** por nós (motor 2D em mundo 3D + cenário; dá pra refazer o esqueleto: gancho, beats, cenário, ritmo).
REJEITAR sem exceção: live-action, pessoa real (streamer, IShowSpeed, reação, vlog, dança, "tipo Índia"), meme com rosto real, compilado de clipes, jogo gravado, slideshow/imagem estática, anime ripado, infantil comercial/canção de ninar (CoComelon-like), IA genérica sem personagem, vídeo sem narrativa.
Checar de verdade: baixar 1 folha de ~6 quadros pequenos (recorte) por candidato ANTES de aceitar (título/miniatura não bastam; a coleta de 20/11 foi frouxa: "quadros não conferidos"). Reavaliar `referencias/PENDENTES_BONECOS_20-11.md` com esse filtro: descartar o que for stickman fraco/pessoa real/meme; manter só o que passar.
Cada aceito vira ficha curta com: viralidade, tipo (2D/3D), por que é modelável, custo no nosso motor, e como adaptar pro Tião (cenário, gancho, o que muda). Meta: lista curta e forte (5–10), não longa e frouxa.

## FILTRO DE ACABAMENTO (qualidade visual) — pedido do Filippe, 20/11
Todo vídeo renderizado passa por um **filtro de acabamento** para ficar mais bonito: primeiro o **Tião** (prioridade, entra na Fase 1 antes do episódio 1e), depois os **clipes de GTA 6**. Regras:
- Ajuste sutil e rápido: leve contraste/saturação e curva de cor (look "cinema" quente), nitidez leve, vinheta suave, grão fino opcional; sem estragar legenda, HUD ou cor da marca.
- Custo barato: preferir `ffmpeg` (um passe final, `nice -n 15`, sem render extra) ou o próprio estágio final do render; medir o tempo extra por vídeo e registrar; se passar de ~10% do tempo do episódio, simplificar.
- Look separado por série/conta (Tião; GTA clipes) em arquivo de config (`config/filtros.json` ou equivalente), com opção ligar/desligar por conta no painel (Fase 3). Padrão: ligado.
- Checar com recorte antes/depois (não print inteiro) e deixar o revisor julgar se ficou mais bonito sem perder legibilidade. Usar a skill `media-use` (color grades/looks) se ajudar.
- Aplicar em TODO render daqui pra frente (episódios Tião e clipes) e registrar no KIT.
- Postagem continua com o Filippe (não tentar postar).

## QUALIDADE DO TIÃO + TEMPO (Filippe, 20/11)
- Qualidade final MUITO boa em vários aspectos (cenário rico e trocando por beat, personagens, luz, roteiro/gancho, voz, legenda, ritmo, acabamento). Nada de entregar na pressa: o revisor rígido lê código E imagem (recortes) e reprova o que estiver fraco.
- Tempo: teto 12–13 min por episódio, ideal menos. Cronometre cada etapa e registre em `docs/TEMPO_EPISODIO.md`. Se estourar: atacar o maior pedaço (render: resolução/quadros/cache de cena, voz em lote, pular passos redundantes do portão que o código já checa mecanicamente), SEM tirar revisão nem baixar a qualidade; se não der pra caber nos 13 min com qualidade, registrar o gargalo exato e a proposta, e mesmo assim entregar o episódio bom.
- Revisão: portão mecânico (código) primeiro, depois UMA passada do revisor com imagem em recorte; correções vão pro produtor.

## ENTREGA FINAL (Filippe, 20/11 — SUBSTITUI "para-aprovar/não postar" do Tião e dos clipes)
- **Tião: NÃO postar.** Ao terminar cada episódio (portão final + revisor rígido ok): `rclone copyto <proj>/final.mp4 "Drive1:Estudio de Video/3D/Aventuras do Tião/<nome-da-pasta-do-ep>.mp4"` (remote `Drive1` testado e funcionando em 20/11; pasta já existe). Manter cópia local em `prontos/3D/Aventuras do Tião/`. Conferir upload com `rclone lsl`/`size`. Registrar no estado "no Drive". Só vídeos finais, nada de intermediário. Falha de rclone: tentar 1 vez, depois registrar e seguir (não parar a missão). Nunca mostrar segredo.
- **Clipes de GTA 6:** se realmente forem bons (passam no portão de impacto/nota alta e no revisor), pode seguir o procedimento já autorizado pelo Filippe (`lives-postagem-procedimento-chrome`, legenda fixa do Meta `marca/legenda-meta.txt`): no máx. 3 por dia, só Instagram/Facebook @six_starsbr, nunca digitar senha, sem login = parar e salvar no Drive 1 (`Drive1:Estudio de Video/Gta 6/`). Não mexer em janela do Chrome do xCloud (se não der pra evitar, só salvar no Drive). Clipe fraco ou duvidoso: não posta, só guarda.
- Rede social do Tião (YouTube/TikTok): sempre manual pelo Filippe.

## PENSAR E OTIMIZAR (Filippe, 20/11)
- O teto de tempo do episódio (12–13 min de produção) é LIMITE MÁXIMO, não obrigação de gastar tudo. Se enxergar como otimizar ou melhorar qualquer parte (roteiro, cenário, render, voz, revisão, ordem das etapas), FAÇA, sem pedir licença: pense antes de executar (o que pode ser mais rápido, mais bonito ou mais forte?), teste, meça e registre o ganho em `docs/IDEIAS.md`/KIT. Nunca otimize cortando qualidade ou revisão.
- (Nota: o Filippe falou "3 minutos é o prazo máximo" por voz, provável "13 min" mal ouvido ou duração do vídeo. Mantenha: produção ≤12–13 min e duração do vídeo conforme memórias do Tião, 60–120 s. Se for duração, o limite é 3 min de vídeo final, nunca maior.)

## ESTILO ACEITO NO OLHEIRO — correção do Filippe (20/11, vale sobre o filtro rígido)
- ACEITAR só personagens **estilizados**: bonequinho de massinha/claymation, stickman, boneco 2D/3D cartoon simples (olhos grandes, formas básicas), no estilo do Tião/ricksclips.
- REJEITAR 3D **realista** (humano realista, proporção/pele/rosto realistas, "parece pessoa", estilo Pixar-realista, unreal/cinematic humano, personagem de jogo fotorrealista), mesmo que seja animado e viral. Cenário bonito 3D pode ser realista; o PERSONAGEM tem que ser estilizado.
- Reavaliar a lista aceita (`referencias/` + `PENDENTES_BONECOS_20-11.md`) com essa regra e remover o que for realista. Se um storyboard/ficha citar vídeo de 3D realista como referência, trocar por um estilizado.

## ESCOPO DA REVISÃO (Filippe, 20/11)
Revisar/diagnosticar SOMENTE o ÚLTIMO episódio pronto (e o que estiver em produção), nunca todos os antigos: apontar sem dó o que está fraco/errado/feio e como melhorar, comparando com vídeos de criadores maiores e famosos do mesmo estilo (referências salvas ou do olheiro). Episódios antigos só entram se o Filippe pedir. Não gastar limite revisando o acervo.

## PONTO DE RETOMADA E CONTEXTO (Filippe, 20/11) — obrigatório
- Mantenha em `_estado/MISSAO-ESTADO.md` a seção **"PONTO DE RETOMADA"** (sobrescrever, não acumular): fase e item, episódio/projeto em andamento, **etapa exata** (ex.: "ep.38: falas ok, voz ok, FALTA render → comando `...`"), artefatos já prontos (não refazer), próximo comando e riscos. Atualize ao fim de CADA etapa e ANTES de qualquer render longo, comando demorado ou subagente.
- Ao retomar (sessão nova ou vigia): leia o PONTO DE RETOMADA primeiro e continue dali; confira os artefatos no disco (falas.json, voz, legenda, plano, mp4) e NÃO refaça o que existe e passou no portão.
- **Contexto:** não deixe a sessão inchar. Quando o contexto passar de ~55–60% (confira `get_usage` com `session: self`) e uma etapa acabar: grave o PONTO DE RETOMADA, faça commit/push, apague o lock, abra uma sessão NOVA (`start_session`, fresh, mesmo brief: "leia `_estado/MISSAO-NOITE.md` e continue do PONTO DE RETOMADA") e encerre a atual. A sessão nova cria o lock. Nunca duas ativas.
- Ao parar por limite (95% de 5h / 75% semanal): grave o PONTO DE RETOMADA com a etapa exata, commit/push, apague o lock, atualize RELATORIO-MANHA e encerre. O vigia (a cada 2 h, minuto 10) abre a próxima sessão após o reset.

## LIMITE SEMANAL = 75% (Filippe, 20/11) e NÃO PARAR
- Substitui todo "70%": parar só em 95% do limite de 5h ou 75% do semanal.
- **Não termine e pare.** Ao concluir a última fase, entre em **modo melhoria contínua**: revisar tudo de novo, achar furos, ideias novas (docs/IDEIAS.md), testar, produzir mais episódios/clipes bons, otimizar tempo/PC/tokens, atualizar README. Só pare por limite (95% 5h / 75% semanal) ou `"ativo": false`.
- Ao parar por limite, o PONTO DE RETOMADA diz o próximo passo de melhoria; o vigia retoma.

## REVISOR ESPECIALISTA (prioridade ALTA — fazer logo depois da Fase 1b, antes de mais episódios)
O revisor precisa ser RICO e especialista em vídeo curto vertical e em vídeo com personagens estilizados 2D/3D. Criar/atualizar:
1. **Skill `estudio-revisor-shorts`** (em `.claude/skills/`): rubrica com NOTAS 0–10 por aspecto: gancho (3 s), retenção/ritmo (mediana de plano, eventos por segundo), roteiro/virada/payoff, cenário (riqueza, troca por beat, props), personagem (design, expressão, atuação), câmera/enquadramento, luz/cor/acabamento, motion/infográfico/HUD, voz/mixagem, legenda, sound design/música, originalidade/autenticidade, legibilidade no celular, comparação com criadores maiores. Cada aspecto com critérios observáveis, exemplos de bom/ruim tirados das referências salvas e erros que o Filippe já pegou (KIT). Aprova só com média ≥ 8 e nenhum aspecto < 7; explica o PORQUÊ e dá ordens de correção específicas.
2. **Calibrar** a rubrica: pontuar 2–3 referências fortes (devem dar ≥ 8) e o ep.37 (deve dar baixo); ajustar até a régua separar bem. Registrar a calibração em `docs/tiao/CALIBRACAO_REVISOR.md`.
3. Atualizar `revisor-bonecos` (e `diretor-arte-bonecos`/`critico-roteiro` se couber) para usar a skill. Revisor continua com 1 passada por episódio, imagens só em recorte.
4. Criar OUTRAS skills que melhorem estrutura/funções (ex.: `estudio-olheiro-animado` com o filtro rígido, `estudio-acabamento` para o filtro de cor, `estudio-retomada` com o procedimento de ponto de retomada) se reduzirem gasto de contexto ou erro. Skill curta, com gatilho claro; não duplicar o que já existe.

## OTIMIZAÇÃO EM TUDO, O TEMPO TODO (Filippe, 20/11) — não só na Fase 5
Em toda etapa pergunte: dá pra ficar mais RÁPIDO, mais SIMPLES, mais LEVE pro PC e mais BARATO em tokens, sem perder qualidade? Se sim, faça, meça antes/depois e registre (`docs/IDEIAS.md`, KIT). Exemplos: cache (voz, cenário, frames), resolução/quadros do render só onde importa, ffmpeg em vez de IA, código em vez de subagente, ler com grep em vez de abrir arquivo grande, lote em vez de uma chamada por item, perfis leve/equilibrado/qualidade, nice/ionice, limpar intermediários (com simulação), UI do painel sem polling pesado. Cada otimização precisa ter número (tempo, RAM, tokens) e não pode cortar revisão nem qualidade.

## ECONOMIA DO LIMITE SEMANAL (Filippe, 20/11) — pedido final
Prioridade máxima junto com a qualidade: NÃO estourar o semanal (corte 75%). Medidas:
- Delegue trabalho MECÂNICO ao Codex (`codex exec "<pedido>"`, CLI em ~/.local/bin): scripts, refatoração isolada, testes, docs, geração de imagem/asset. Brief curto, confira o resultado (teste/trecho) antes de dar como feito. Codex gasta outro limite, não o do Claude.
- Use skill/script curto quando repetir 2+ vezes o mesmo procedimento (retomada, olheiro, acabamento, portão): menos contexto reaprendido por sessão.
- Meça `get_usage` ao início e ao fim de cada etapa e registre o custo em % por etapa no estado; etapa que gastar muito, simplifique antes de repetir.
- Sessão nova quando o contexto passar de ~55%; evite reler arquivos grandes; imagem só em recorte; sem subagente para o que cabe em poucas chamadas.
- Se o semanal passar de ~65%, entre em modo econômico: só etapas de alto valor (episódio do Tião, revisor), sem exploração nova, sem subagente opus.

## ARRUMAR OS BOTS EXISTENTES (Filippe, 20/11)
- **Bot de lives/clipes (radar + clipador + ao_vivo)**: na Fase 2, depois do gate de impacto, revisar e consertar: calibrar a nota mínima de relevância com as decisões aprova/recusa da Revisão (hoje nenhum trecho passa), gate de pico de áudio antes da análise pesada (medir em ~6 segmentos de nota conhecida), lacunas entre segmentos, lives em inglês, deduplicação, custo de CPU/RAM (um por vez). Rodar teste real em live ao vivo curta e medir. Resultado: clipes mais impactantes e menos genéricos, PC leve.
- **Bot de referência do Tião (olheiro)**: já na Fase 1d (filtro rígido, estilizado, viral, modelável, quadros conferidos); consertar o que falhar (coleta frouxa, Instagram/TikTok não coletados, falso positivo de rosto) e rodar leve a cada sessão.
- Cada bot: teste, medição de tempo/RAM, registro em `docs/` e no KIT.
