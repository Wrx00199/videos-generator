---
name: estudio-brolls
description: Acha, pré-visualiza, aprova e baixa só o trecho de b-roll/asset (YouTube, Wikimedia Commons, NASA) com procedência registrada. Usar quando um vídeo (clone, autoral "meio a meio", outros nichos) precisa de imagem de apoio, cutaway ou footage; "acha um b-roll de X".
---
# Estúdio: b-roll com procedência
Escopo: curadoria de imagem/vídeo de apoio com procedência. Não analisa o esqueleto, escreve roteiro, narra ou monta o vídeo. Clipe de streamer pertence a `estudio-lives`, não a este banco.

Ferramenta: `python3 ferramentas/brolls.py` (ideias do repo get-brolls, MIT, reescritas). Trabalho em `_tmp/brolls/<assunto>/`; banco em `banco/broll/<assunto>/`.

## Fluxo
1. `buscar "<assunto>" --fontes youtube,commons,nasa --n 8` (`--cc` = só Creative Commons no YouTube) → `candidatos.json`. YouTube ~17 s por candidato (login do Firefox + solver JS); cache diário.
2. `previa <pasta|candidatos.json> --max 6` (use `--ids` e `--janela ID=1:20-1:24` para refinar). Folha de quadros com TIMECODE + GIF + marca PESSOA, sem baixar o vídeo (storyboard do YouTube; Commons baixa 1 transcode pequeno). Olhar a folha antes de aprovar.
3. `revisar <pasta> --abrir` → HTML local: aprovar/recusar, ajustar início/fim → "Gerar decisoes.json" → `importar decisoes.json`.
4. `baixar <pasta>` → só o trecho aprovado (≤8 s, mudo, mp4) + `ORIGEM.md` + `banco/ORIGEM.jsonl`. `verificar` confere sha256 e acusa arquivo sem procedência. `semear` registra sfx/música a partir de `banco/LICENCAS.md`.

## Regras
- Para o clone: sem pessoa real, trailer/teaser ou gameplay inventada; obedecer `estudio-clone`. A opção técnica `--permitir-pessoa` não autoriza pessoa no clone; streamer é outra frente.
- Não buscar assets por padrão em cada vídeo nem reciclar b-roll de produção anterior: solicitar material novo apenas quando a timeline realmente precisar, com origem e função registradas. Cache técnico da busca não é autorização de reutilizar um asset editorial.
- Sem música/áudio de terceiro: o download sai sem áudio.
- Procedência obrigatória: todo arquivo novo em `banco/` entra em `ORIGEM.jsonl`; CC-BY exige creditar o autor.
- Licença vermelha (YouTube padrão = risco alto): `baixar` pula; só com `--aceito-risco` e ok do Filippe.
- Aprovação é do Filippe (ou de quem ele indicar), nunca autoaprovar. Nada pago: Pexels/Pixabay (chave grátis no `.env`, `--fontes pexels`) ficam desligados, só com pedido dele.
- PC fraco: `nice` já embutido; não rodar junto de render pesado; no máximo 6 prévias por vez.
- Commons devolve 429 se abrir muitas conexões: não repetir em rajada, esperar.
