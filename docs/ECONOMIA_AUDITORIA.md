# Auditoria de economia (20/11) — medida com get_usage
Antes: semanal 51%, 5h 17%. Este chat: 96k tokens de contexto (10% de 1M) com só leitura inicial.

## Custo fixo por turno (medido neste chat)
- System tools 16,6k + MCP tools 13,8k + System prompt 11,3k + Skills 9,9k + Memória/CLAUDE.md 3,8k = ~55k antes da 1ª mensagem. O vídeo em si custa o que vier depois disso.
- Lista de ferramentas "deferred" (Figma, docs, Chrome, sidebar etc.) só entra como nome, mas cada conector ativo ainda pesa.

## O que dá pra desligar nas sessões de PRODUÇÃO (proposta — NÃO desliguei nada seu)
Conectores/MCP que o Tião não usa: Figma (weave/shaders/código), Docs (1a59…), claude-in-chrome (só lives), mcp-registry, scheduled-tasks, ccd_sidebar/window/host (deixar só session), Browser integrado (deixar só se for ver preview), easel/visualize.
Como: no app, por sessão, `mcp__ccd_connectors__set_session_connector_enabled` (reversível, só na sessão) — ou me diga "desliga X" que eu faço.
Skills globais (~/.claude/skills): hyperframes×3 e rea-video/earshot/remotion/pixelfx existem em DOBRO (global + projeto). Sugestão: manter só a do projeto (tira ~1–3k/turno). claude-drawing pesa 321 MB em disco (não em token). Plugins ligados: codex e superpowers (superpowers injeta ~2k de texto no início de cada sessão; manter se gostar).
Modelo padrão global é `fable`: o mais caro. Para produção, usar sonnet/haiku (`/model`).

## Hooks criados (custam 0 token — são scripts que o Claude Code roda antes da ferramenta)
Um hook é um comando seu que o Claude Code executa automaticamente em eventos (antes de rodar Bash, ao iniciar etc.).
Se o script sair com código 2, a ação é bloqueada e a mensagem de erro vai pro agente. Nada disso passa por LLM.
- `.claude/hooks/guarda_render.py` (Bash): bloqueia ffmpeg/render.mjs/hyperframes render/blender se já houver um rodando (testado: bloqueia com 1 rodando, libera sem nenhum).
- `.claude/hooks/guarda_subagente.py` (Agent): bloqueia subagente sem `model` haiku/sonnet explícito (testado: opus → bloqueado, haiku → ok).
Registrados em `.claude/settings.json` do projeto (vale só aqui; entram em sessões novas).

## Outras regras de economia já nas regras.md/KIT
Subagentes Opus→Sonnet/Haiku; 1 subagente por vez; checagens por comando antes de LLM; sessão nova com <15% de contexto.
