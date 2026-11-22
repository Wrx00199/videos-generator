# Estúdio de Vídeo 3D

Estúdio local de vídeos verticais em PT-BR. Suporta animação 2D em cenários 3D, motion graphics e edição de material existente. Os perfis dos projetos definem estilo, elenco e critérios de revisão. No computador do estúdio roda um render pesado por vez.

## Para qualquer IA / aparelho (Claude Code, Codex, celular)
1. Leia `CLAUDE.md` (regras do projeto) e `AGENTS.md`.
2. Skills em `.claude/skills/` (`estudio-clone`, `estudio-bonecos`, `estudio-lives`, `estudio-motion`, `estudio-brolls`), agentes em `.claude/agents/`.
3. Veja [ferramentas, provas e integrações 3D](docs/FLUXO-3D.md) para escolher o caminho do trabalho atual.

## Painel
```bash
PORTA_PAINEL=7777 node ferramentas/painel/servidor.mjs
node testes-painel/smoke.mjs
```

## Estrutura
- `ferramentas/` scripts (clone.py, voz.mjs, render.mjs, painel, lives...)
- `marca/` identidade (json/txt); `nichos/`, `estilos/`, `config/`, `docs/`
- Os kits e as provas pequenas selecionadas são versionados. O acervo integral de `projetos/`, `prontos/`, `referencias/`, `banco/` e os arquivos `.env` ficam locais.

## Segredos
Chaves ficam em `.env` local (nunca no git). Voz: `GEMINI_API_KEY_1` (`_2`/`_3` quando a cota acabar).

## Regras-chave
Modelar = preservar esqueleto/ritmo, reescrever fala/texto/marca. Sem pessoa real no clone, sem trailer como footage. Publicação só com aprovação do Filippe.
