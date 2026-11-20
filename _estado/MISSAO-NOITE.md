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
- PARAR em ≥ 95% do limite de 5 h **ou** ≥ 70% do semanal (semanal já estava em 27% em 20/11). Parar = terminar a etapa mínima, salvar estado, commit+push, liberar lock, encerrar.
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
 d) **Bot olheiro de bonecos 2D/3D** (YouTube Shorts + Instagram primeiro; TikTok de apoio): melhorar o existente (`olheiro`), saída: lista com nota de "modelável", custo estimado, nicho; referências entram como PENDENTES de aprovação do Filippe (nunca aprovar sozinho).
 e) Produzir **até 4 episódios** do Tião que passem no revisor rígido (gancho de curiosidade+zombaria+payoff; molde v5/“E se…”; ≥60 s; 2 séries/dia conforme memórias). Entregar em `prontos/3D/Aventuras do Tião/` com marca "para-aprovar" no nome da pasta/arquivo. NÃO postar. Respeitar PC e orçamento.
**Fase 2 — GTA 6 gringo/autenticidade:** olheiro acha 3–5 vídeos gringos (Twitter/IG/YT) de GTA 6 sem pessoa real e fortes; escolher 1–2 e MODELAR (estudio-clone: preserva gancho/beats/ritmo, refaz fala/texto/marca; sem trailer como footage). Clipes mais impactantes: gate de nota alta no clipador (item 2 de `ferramentas/painel/ESTADO.md`) se couber. Meme/carrossel só se sobrar orçamento.
**Fase 3 — Painel:** multi-conta conforme combinado: seletor de conta (canto superior direito), sidebar com botão hambúrguer animado, engrenagem Configurações (cofre de chaves que valida sem mostrar valor, saúde do PC com CPU/RAM/disco/GPU lendo `/sys/class/drm/card*/device/gpu_busy_percent`), cadastro de conta sem código (nome, nicho, plataformas, pasta de saída, legenda-modelo, horários, tipo de produção), Revisão por conta com legenda EDITÁVEL (salvar → vale ao aprovar), botão copiar legenda + abrir página de upload, calendário/aviso “faltou vídeo hoje”, placar por conta, fila única de render (1 pesado por vez; leve/média/pesada), colar link de referência → subagente haiku analisa → fica “pendente de aprovação”, etiqueta de nicho (GTA/Tião/…), acesso pelo celular na rede local com senha (desligado por padrão; avisar IP), modo de postagem por conta manual/chrome/api (api só guarda config). Painel NÃO gasta IA. Visual: preto + dourado vibrante + branco. Fazer **3 variações de logo WR** profissionais (SVG, cores/estilos diferentes) em `marca/propostas-logo/` + página comparativa; NÃO aplicar definitivo (Filippe escolhe); usar provisória. Testar `node testes/smoke.mjs` e abrir o painel de verdade (navegador embutido, não o Chrome do xCloud) para revisar o layout.
**Fase 4 — Final:** estrutura p/ outros nichos (cadastro de nicho: receitas, finanças, idiomas/alemão molde “como se fala X”, vídeos longos), biblioteca de assets reaproveitáveis, saída em Drive (só campo/placeholder; rclone exige login dele). Revisar skills fracas, bugs, testes. Atualizar README.
**Sempre ao encerrar (qualquer sessão):** estado atualizado, push feito, lock apagado, e `_estado/RELATORIO-MANHA.md` (curto, p/ celular: o que ficou pronto, onde estão os vídeos para aprovar, o que ele precisa decidir, % de uso). Se a missão toda terminar: `"ativo": false` em `missao.json`.
