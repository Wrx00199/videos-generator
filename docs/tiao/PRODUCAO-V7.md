# Tião V7

Cada episódio começa com uma ideia que vale testar e passa por uma prova em movimento antes da geração de voz. O portão verifica a versão dos arquivos e os pareceres. A compreensão, a graça e o contato físico são julgados na tela.

## Escrever a partir da montagem

1. Escolha uma referência vista em quadro na [curadoria do Filippe](../../referencias/2026-11-23-curadoria-tinhao.md). Anote nos cortes que ensinam algo os segundos, o que o espectador sabia antes, o que a imagem revela e o que o faz esperar pelo próximo plano. Ricks mostra o mecanismo em ação. Knox encadeia escolhas e efeitos comparáveis. Stick Happens paga a pergunta inicial com uma reversão. See Through Works prova a mudança com o mesmo objeto em duas condições.
2. Separe o que vem da montagem da referência daquilo que você inventou para o Tião. Cruze a situação inicial, o mecanismo da piada e a virada com os episódios existentes. Se o núcleo coincidir, mude a história. Use personagens aprovados que tenham função na cena. Civis cabem quando a história é do cotidiano. Use a tripulação quando sua relação importa.
3. Abra uma execução com `portao.py novo <slug>`. Escreva `falas.json` com `molde: v7`, personagens e cenários aprovados. Use os campos `tipo`, `quem`, `texto` e `visual` do [contrato de dados V6](PRODUCAO-V6.md). Marque os índices de fala de gancho, pista, virada e pagamento em `beats`. A quantidade de degraus, o tempo total e o número de cortes servem à história.
4. Use `novo_ep.sh` e prepare `web/story.js` com tempos provisórios. Em `plano.json`, associe os intervalos a falas e registre cenário, luz, câmera e a informação que motiva o corte. Prove pelo menos um efeito físico em movimento. Nos cartões essenciais passe `objetoProva` e `bb: [x0,x1,y0,y1]` nas unidades de desenho do cartão. A auditoria mede enquadramento da caixa. Confira contato, oclusão, leitura e continuidade no vídeo.

## Prévia e duas avaliações antes da voz

A partir da raiz, use `K=projetos/bonecos/serie-tiao-kit` e `P` com o caminho do episódio.

```bash
python3 "$K/portao.py" "$P" roteiro
TIAO_GPU=vulkan python3 "$K/previa.py" "$P"
python3 "$K/editorial.py" "$P" frio
```

A prévia usa o próprio motor, com 540 × 960 a 10 fps. Para episódio longo, indique `--trecho INICIO:FIM` em quadros de 30 fps, fim exclusivo. Pode repetir a opção em ordem. Inclua abertura, causa, consequência e pagamento na ordem em que o público os vê. Preserve o tempo do gesto e a reação. Se a história pedir texto, ele pode entrar na própria prévia como parte do que o público vê.

- **A frio.** Envie só uma cópia da prévia em nome neutro a um revisor independente que desconheça a sinopse, o roteiro e a virada. Peça que descreva o que tenta fazer cada personagem, o que causa o próximo efeito, o que fecha a pergunta e onde a cena perde a graça. Se a leitura divergir da intenção, localize o primeiro segundo em que isso acontece e reescreva ou descarte a ideia. Reapresente a prova para alguém a quem a virada ainda não tenha sido explicada.
- **Atuação e montagem.** Depois do parecer a frio, confira com revisor independente a continuidade do gesto e do enquadramento, a pista inteira durante o corte, apoio, mãos, objetos, boca em narração ou pensamento e identidade. Mesmo um objeto totalmente fora de quadro pode impedir a compreensão da ação. Dê o segundo e a menor correção verificável em cada devolução.
- **Registro.** Guarde o digest impresso pelo comando antes de enviar. Registre cada decisão com `editorial.py "$P" ETAPA --versao DIGEST --parecer ARQUIVO.json`. Para `frio` inclua `abertura`, `causa`, `consequencia`, `pagamento` e `graca`. Para `montagem` inclua `enquadramento`, `contato`, `movimento`, `boca` e `identidade`. Todos exigem também `autor`, `revisor`, `decisao` (`aprovado` ou `reprovado`) e `evidencia` com tempos observados. Preserve a mídia da decisão no episódio. Parecer anterior permanece no histórico. Confirme a independência na sessão de revisão. O registro local compara os nomes declarados.

## Voz, render e entrega

```bash
python3 "$K/portao.py" "$P" voz
# Gere e confira cada WAV com voz_fala.py, em voz/_por_personagem/<quem>_<i>.wav.
python3 "$K/montar_dialogo.py" "$P"
python3 ferramentas/stt.py "$P/voz/dialogo.wav" pt small > "$P/voz/stt.json"
python3 "$K/legenda.py" "$P/voz/stt.json" "$P/legenda.ass"
python3 "$K/portao.py" "$P" prova
TIAO_GPU=vulkan bash "$K/render_leve.sh" "$P"
# Gere som/mix.wav com a rota do kit e confira os efeitos no trecho editado.
bash "$K/montar_final.sh" "$P"
python3 "$K/portao.py" "$P" final
```

O portão de voz trava WAV novo até passar nas duas avaliações. Mantenha ou ajuste o ritmo à gravação real e exporte os cortes para `cenas.json`. Alterações de roteiro, plano, gesto ou tempo em `web/` pedem nova prova e novos pareceres antes do render integral. `montar_dialogo.py` escreve os tempos medidos em `tempos_ft.js`. Atualize `web/tempos.js` quando a encenação depender deles. `render_leve.sh` prepara quadros novos e vincula o lote à versão revista. As rotas de voz em lote por personagem, substituição parcial de quadros e overlay de conta ficam reservadas ao legado.

No MP4, o QA verifica formato, saturação, volume e sequência declarada de cortes e vozes. Abra o vídeo no tamanho de celular e confira em movimento com e sem áudio os marcos da história. Ouça os diálogos e efeitos no contexto. Registre em `final` um parecer independente com `historia`, `montagem`, `audio` e `identidade` mais os campos comuns. Execute `portao.py "$P" entrega`. Apresente o primeiro piloto completo ao Filippe para julgamento de gosto. Identidade de outra conta reprova. Sem identidade do Tinhão confirmada, entregue sem marca de conta. Publicação exige aceite do Filippe.

## Efeito na estrutura do estúdio

| Área | O que já existia | Alteração no V7 |
| --- | --- | --- |
| Referências | Moldes V6 e curadoria com timestamps | Os moldes viram acervo. O episódio registra o que cada corte da referência ensina e comprova a própria encenação. |
| Narrativa | Campos de beats, prova por fala e parecer pré-voz | Reaproveita os dados. Retira contagens fixas de duração e degraus da rota ativa. A visão a frio vem antes da explicação e exige um trecho em movimento. |
| Atuação | Banco de câmeras e gestos, auditor de pose e enquadre dos atores | Reusa a projeção do auditor com caixas de objetos-chave. Decisão de contato e legibilidade usa vídeo real. |
| Voz e montagem | TTS por fala, comparação de STT, validação de plano e exportação de cortes, renderer e FFmpeg | Acrescenta exigência de parecer vigente na entrada de voz/render e separa quadros de versões diferentes. Retira o overlay genérico da finalização V7. |
| QA e operação | Portões técnicos, rubricas V4/V5/V6, trava de lote por data e aceite do Filippe para publicação | Separa parecer narrativo, montagem e QA. O bloqueio por data sai da abertura V7. O primeiro piloto completo segue para gosto do Filippe. |
| Anexos | Skill e ZIP com motor, exemplo romano e utilitários | A leitura reforça provar legibilidade com montagem em movimento e confirmar os tempos de voz. O kit local já tem equivalentes de render, folha, sincronismo e finalização. Nenhum script recebido foi executado. |

A auditoria de código incluiu os pontos de entrada `novo_ep.sh`, `portao.py`, `voz_fala.py`, `voz_ep.sh`, `vozes_elenco.mjs`, `render_leve.sh`, `render_parcial.sh` e `montar_final.sh`. Os testes e comportamentos legados seguem disponíveis para interpretar os episódios anteriores. Os workflows `clone-*` pertencem à frente de clone. Os dados de Six Stars seguem no perfil daquela conta.
