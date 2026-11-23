# Estúdio de Vídeo — Codex

Siga o `CLAUDE.md` desta pasta como guia do projeto. As skills locais em `.claude/skills/` também são instruções do projeto para Codex: leia a skill relevante antes de atuar.

- Modelar/clonar vídeo: PAUSADO desde 23/11 (`estudio-clone`). GTA 6 = clipar lives (`estudio-lives`). Tião = produção V7 (`estudio-bonecos`).
- Fabricar peça visual/motion: `.claude/skills/estudio-motion/SKILL.md`.
- Achar asset de apoio: `.claude/skills/estudio-brolls/SKILL.md`.
- Recortar streamer/live: `.claude/skills/estudio-lives/SKILL.md` (esboço separado).

Não depender de funções nativas dos Workflows do Claude (`agent`, `parallel`, `phase`): usar os scripts locais e ferramentas disponíveis no runtime atual. A revisão editorial é de alguém que não produziu o vídeo; não declarar independência se foi autorrevisão.

Não reutilizar resultados editoriais entre vídeos. Não pular etapas por existência de arquivo. Preservar trabalhos anteriores e abrir nova execução. Identidade vem do perfil da série. `marca/identidade.json` é da conta Six Stars. Tinhão usa exclusivamente a própria identidade confirmada pelo Filippe. Sem trailer, sem pessoa real no clone, sem gameplay inventada. Se material necessário não atende às regras, registrar impedimento e escolher substituto que preserve a função do plano; não fingir que uma imagem genérica resolve.

- Pedidos de vídeo ou cena com Tião, Tiao, Tinhão ou Tinhao usam o perfil da série e `.claude/skills/estudio-bonecos/SKILL.md`. Comece pelo topo de `projetos/bonecos/serie-tiao-kit/CONTINUAR_AQUI.md`. Pedidos 3D gerais seguem `estudio-motion` e o estilo indicado no pedido.

- Para triagem de mídia no Codex, consulte só os campos necessários com `ffprobe -v error -of json -show_entries stream=index,codec_type,codec_name,width,height,pix_fmt,avg_frame_rate,sample_rate,channels:format=duration,size ARQUIVO`. Ao diagnosticar `hooks.jsonl` do clone, traga a etapa e o resultado do último evento e as falhas com erro completo. Mantenha a saída integral em arquivo e execute as validações e a revisão completas.
