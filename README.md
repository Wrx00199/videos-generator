# Estudio de videos

Estúdio local de vídeos curtos verticais PT-BR (nichos: GTA 6 / Six Stars, série "Aventuras do Tião", outros no futuro). Roda em PC fraco (Ryzen 3 3200G, RX550, 8 GB, Linux): **um render pesado por vez**.

## Para qualquer IA / aparelho (Claude Code, Codex, celular)
1. Leia `CLAUDE.md` (regras do projeto) e `AGENTS.md`.
2. Skills em `.claude/skills/` (`estudio-clone`, `estudio-bonecos`, `estudio-lives`, `estudio-motion`, `estudio-brolls`), agentes em `.claude/agents/`.
3. Missão autônoma em andamento: `_estado/MISSAO-NOITE.md` (regras) e `_estado/MISSAO-ESTADO.md` (checklist; continuar do primeiro `[ ]`). Lock: `_estado/missao.lock`; parada: `_estado/missao.json` com `"ativo": false`.

## Painel
```bash
PORTA_PAINEL=7777 node ferramentas/painel/servidor.mjs
node testes-painel/smoke.mjs
```

## Estrutura
- `ferramentas/` scripts (clone.py, voz.mjs, render.mjs, painel, lives...)
- `marca/` identidade (json/txt); `nichos/`, `estilos/`, `config/`, `docs/`
- Não versionados (só locais): `projetos/`, `prontos/`, `referencias/`, `banco/`, mídia, `.env`

## Segredos
Chaves ficam em `.env` local (nunca no git). Voz: `GEMINI_API_KEY_1` (`_2`/`_3` quando a cota acabar).

## Regras-chave
Modelar = preservar esqueleto/ritmo, reescrever fala/texto/marca. Sem pessoa real no clone, sem trailer como footage. Publicação só com aprovação do Filippe.
