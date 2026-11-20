# Estúdio de Vídeo — Codex

Siga o `CLAUDE.md` desta pasta como guia do projeto. As skills locais em `.claude/skills/` também são instruções do projeto para Codex: leia a skill relevante antes de atuar.

- Modelar/clonar vídeo: `.claude/skills/estudio-clone/SKILL.md`.
- Fabricar peça visual/motion: `.claude/skills/estudio-motion/SKILL.md`.
- Achar asset de apoio: `.claude/skills/estudio-brolls/SKILL.md`.
- Recortar streamer/live: `.claude/skills/estudio-lives/SKILL.md` (esboço separado).

Não depender de funções nativas dos Workflows do Claude (`agent`, `parallel`, `phase`): usar os scripts locais e ferramentas disponíveis no runtime atual. A revisão editorial é de alguém que não produziu o vídeo; não declarar independência se foi autorrevisão.

Não reutilizar resultados editoriais entre vídeos. Não pular etapas por existência de arquivo. Preservar trabalhos anteriores e abrir nova execução. Identidade vem somente de `marca/identidade.json`. Sem trailer, sem pessoa real no clone, sem gameplay inventada. Se material necessário não atende às regras, registrar impedimento e escolher substituto que preserve a função do plano; não fingir que uma imagem genérica resolve.

- Série Tião (bonecos 3D): comece por `projetos/bonecos/serie-tiao-kit/CONTINUAR_AQUI.md` (estado, regras, pendências e ordem do trabalho); fluxo em `.claude/skills/estudio-bonecos/SKILL.md`.
