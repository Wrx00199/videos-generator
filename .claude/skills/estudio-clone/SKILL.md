---
name: estudio-clone
description: (PAUSADO desde 23/11 — só usar se o Filippe pedir explicitamente; GTA agora é clipar lives em estudio-lives.) Modela uma referência de vídeo curto em versão própria PT-BR preservando o esqueleto, os beats e o ritmo; coordena análise, roteiro, narração, edição, identidade e revisão. Usar para “clona esse”, “modela esse vídeo” ou preparar a produção de uma referência escolhida. Pesquisa é tarefa do olheiro; streamer pertence a estudio-lives.
---
# Estúdio · Modelagem de vídeo

## Contrato editorial
Preservar **função e ordem dos beats, gancho, escalada, viradas, pagamento, final e ritmo**. Reescrever fala, título, card, textos de tela, legenda e CTA; inglês vira tradução adaptada com narração PT-BR própria. Não criar vídeo genérico sobre o mesmo assunto.

Cada execução é nova. Não reutilizar análise, roteiro, voz, timeline ou edição de vídeos anteriores e não pular etapas porque arquivos existem. Reutilizar ferramentas, componentes ajustáveis e assets fixos da marca não autoriza reciclar conteúdo editorial.

## Responsabilidades sem sobreposição
- **Olheiro:** pesquisa e filtra referências, fora da produção. Referências de Gon são família de estilos, não padrão obrigatório.
- **rea-video / espelho:** extraem evidências; não escrevem o novo vídeo nem decidem o que é verdade.
- **Roteirista:** interpreta evidências, preserva o esqueleto e escreve a versão própria.
- **Motion:** fabrica peças que a timeline pede. **B-roll:** encontra material de apoio com procedência. Nenhum substitui esta coordenação.
- **Produtor:** executa timeline e valida técnica. **Revisor independente:** compara original × resultado e julga a modelagem.

## Material permitido
- Referência do clone sem pessoa/rosto real; personagem de jogo não é pessoa real. Detector de rosto é triagem, não prova: conferir quadros dos planos.
- **Sem trailer/teaser como footage**, inclusive para preencher espaço ou acelerar. Clipes de streamer são exclusivos de `estudio-lives`, não b-roll do clone.
- Material visual do original não é liberado automaticamente: registrar o que é, origem, trecho e motivo de uso; só usar material permitido para este projeto e sem camadas editoriais/áudio copiados. Nunca inventar/desenhar gameplay do GTA 6.
- Cada substituto deve mostrar a mesma ação/ideia que sustenta o beat. Se isso for inviável, registrar impedimento; não quebrar o esqueleto em silêncio.
- Fonte com texto queimado sobre a ação exige alternativa limpa, recorte que preserve a ação ou substituição equivalente. Cobrir tudo com uma caixa não resolve por padrão.

## Fluxo de uma referência escolhida
| Etapa | Executar | Resultado |
|---|---|---|
| 1. Execução nova | `python3 ferramentas/clone.py iniciar <original-local> --slug <slug>`; URL primeiro é baixada pelo caminho autorizado em pasta nova. Não reutilizar pastas antigas. | original e registro da execução |
| 2. Análise | `python3 ferramentas/clone.py analisar <pasta>` na rota enxuta padrão; `--completo` chama `espelho.py` quando faltar evidência. Falha interrompe. Ler resumo válido, planos e palavras; OCR/VLM não são fatos confirmados. | `analise.json` + quadros/fala; espelho/estilo na rota completa |
| 3. Evidência visual | Quadros início/meio/fim de cada plano e amostras adicionais onde o texto muda, reduzidos. Anotar fundo, texto, card, logo, transição, câmera, SFX e função. | `ficha.md`, tira de quadros |
| 4. Modelagem | Ler `referencias/roteiro.md`, `referencias/hooks.md` e `referencias/curtos.md`. Escrever cada beat novo correspondendo ao original. | `storyboard.md`, fala consolidada, `timeline.json` |
| 5. Roteiro | Mostrar ao Filippe conforme o fluxo autorizado; não inventar aprovação. Validar origem, identidade, duração, cobertura de beats e disposição antes do render. | validação e aprovação quando exigida |
| 6. Narração | `python3 ferramentas/clone.py voz <pasta>`: uma chamada Fenrir com texto consolidado por padrão. O helper é `node ferramentas/voz.mjs --arquivo <fala.txt> --saida <voz.mp3>`. Separar por beat só com necessidade registrada. Transcrever voz nova com `stt.py`. | voz e palavras sincronizadas |
| 7. Visual e montagem | Componentes ajustados ao original, não composição codificada do zero por vídeo. FFmpeg para composição suportada; motion/HyperFrames só para peças que precisem. `clone.py validar <pasta>` antes de `clone.py montar <pasta>`. | `final.mp4` e capa |
| 8. Portão | Verificação técnica e revisão editorial por agente que não montou. Correções produzem nova tentativa dentro da execução; não importar resultado de outro vídeo. | `portao.md` e métricas |

Sem ASR, stems e speakers duplicados na desmontagem: `rea-video decompose original.mp4 -o rea --no-asr --no-stems --no-speakers --ocr-lang latin`. Análise aprofundada é para informação que ainda falta; não executar múltiplos motores que extraem a mesma coisa sem motivo.

## Identidade e tempo
- Ler `marca/identidade.json`: nick e cores por caractere, logo e capa do Jason. Nick/logo presentes no vídeo sem cobrir a ação; capa entregue separadamente, nunca intro. Logo WR proibido.
- Legenda dinâmica a partir das palavras da voz realmente gerada, fonte PT-BR legível, zona segura e sem tapar o pagamento visual. Nunca fabricar timestamps.
- Voz não pode ultrapassar o material. Reescrever/ajustar fala ou visual antes do render; não completar com freeze ou cortar frase.
- 720×1280, 30 fps por padrão (1080×1920 opcional); voz alvo ~−14 LUFS, pico ≤−1 dBTP. Um render por vez neste PC.
- Meta: até 3 min **ponta a ponta**, desde receber o original até o MP4 revisado. O total inclui análise, modelagem, voz, render, revisão, esperas, falhas e correções; registrar cada parcela sem tirá-la do total. Pesquisa prospectiva fica antes de escolher a referência, mas qualquer pesquisa necessária ao vídeo conta no cronômetro dele. Não alegar meta atingida com render isolado, revisão omitida ou teste sem voz real.

## Portão
- Primeiro quadro e primeiros 2 s apresentam a promessa; cada beat original tem correspondente na ordem e com ritmo comparável.
- Promessa paga, ação principal visível, final/loop funciona; fala e texto próprios PT-BR, sem alegação inventada.
- Identidade correta e capa do Jason; sem trailer, pessoa real no clone, logo WR, áudio/música do original ou gameplay inventada.
- Legenda sincronizada (erro >0,3 s é falha), legível e dentro da zona segura; sem freeze involuntário, áudio mudo ou clipping.
- Medidas de cortes/movimento/brilho são evidência, não regra automática de ±15%. Alteração justificada que mantém função não reprova por gosto.
- Aprovação técnica não é aprovação para postar. Publicação depende do Filippe.

## Pesquisa (antes da produção)
Olheiro: `node ferramentas/coletar_social.mjs --nicho gta6 --rapido`. TikTok/IG primeiro; YouTube reserva. Importar apenas os arquivos gerados na coleta atual, não um glob de coletas antigas. Verificar mosaico e planos: sem pessoa real, anúncio ou referência que só funcione com música de terceiros. Captcha/login/bloqueio: parar a rede e reportar; não repetir nem contornar.

Contrato executável e campos suportados: `docs/contrato-timeline.md` (ler ao gerar timeline ou executar a CLI).
