# Contrato do clonador local

Executor: `python3 ferramentas/clone.py --help`. Componentes reutilizáveis; saídas editoriais novas por vídeo. 720×1280/30 fps padrão; configurar 1080×1920 em `execucao.json.resolucao` antes do render quando solicitado. Fonte de identidade: `marca/identidade.json`.

## Uma produção

1. Recebimento do original inicia o cronômetro. URL: registrar `date +%s` ANTES do download autorizado para pasta temporária nova; passar esse valor em `iniciar ORIGINAL --slug NOME --inicio-unix VALOR`. Arquivo local: `iniciar ORIGINAL --slug NOME`. O comando imprime a pasta nova em `projetos/`; não reutilizar projetos anteriores.
2. `analisar PASTA`: duração, candidatos a cortes, tira com timecode e fala (quando houver áudio). `--completo`: usa espelho/rea-video, OCR/VLM e medidas. A rota rápida não faz OCR/VLM nem classifica a narrativa; o agente precisa ver as camadas em cada plano. Não inferir que 12 amostras representam tudo.
3. Agente escreve ficha, storyboard e `timeline.json` pelos dados desta execução; fabrica/importa fontes permitidas em `visual/`, com procedência registrada na ficha. Sem trailer, rosto real ou gameplay inventada. Não copiar camadas editoriais queimadas do original.
4. `voz PASTA`: uma geração Fenrir com fala consolidada, registra tempos API/conversão, alinha palavras reais com STT; voz longa bloqueia antes do render. Falha arquiva apenas saídas da tentativa em `tentativas/`; repetir gera novamente, sem reutilizar voz falha. Não há chamada de modelo para escrever o roteiro no executor: isso é papel do agente.
5. `validar PASTA` e `montar PASTA`: contrato, hashes, fontes, duração, ASS dinâmico, logo, nick e capa Jason separada. Mede áudio e freeze. `final.mp4` só é promovido quando QA técnico passa. Falha fica preservada em `tentativas/`; uma nova tentativa recalcula o render inteiro.
6. Revisor independente compara ORIGINAL e FINAL, escreve `portao.md` e `portao.json`, e executa `concluir PASTA`. O relógio ponta a ponta termina aqui, incluindo esperas, revisão e correções. Parecer é declaração do revisor real; nomes distintos no JSON não criam independência por si só. Não autoriza postagem.

Resultados já concluídos nunca são sobrescritos. Para mudar conteúdo depois de concluir uma etapa com sucesso, iniciar produção nova. Falhas de análise completa: usar pasta nova; nenhum resumo parcial é tratado como evidência completa.

## `timeline.json`, versão 1

```json
{
  "versao": 1,
  "execucao_id": "id exato de execucao.json",
  "original_sha256": "hash exato de execucao.json",
  "duracao_s": 4,
  "referencia": {"pessoa_real": false, "trailer": false, "verificado_por": "identidade real de quem conferiu"},
  "gancho": {"promessa": "O que mudou na cidade", "escolhido": "Olha como mudou", "pagamento_beat": "p2"},
  "beats": [
    {"id":"p1","ini":0,"fim":2,"funcao":"gancho","funcao_original":"gancho","texto_tela":"Olha como mudou","fala":"Olha como mudou","fonte":"visual/cidade.mp4","tipo_fonte":"motion","layout":"janela","crop":[0,0,1,1],"area_visual":[0,0.30,1,0.40],"card_pos":[0.47,0.25],"legenda_pos":[0.47,0.65]},
    {"id":"p2","ini":2,"fim":4,"funcao":"pagamento","funcao_original":"pagamento","texto_tela":"A cidade cresceu","fala":"A cidade cresceu","fonte":"visual/cidade.mp4","tipo_fonte":"motion","inicio_fonte_s":2,"layout":"cheio"}
  ],
  "palavras": []
}
```

`palavras` começa vazio e é preenchido por `voz` com `{w,ini,fim}`; não inventar alinhamento. O exemplo exige um vídeo de pelo menos 4 s em `visual/cidade.mp4`; não é conteúdo pronto.

- Beats contínuos, sem lacuna/sobreposição, limites na grade de 30 fps. Preservar correspondência original→novo na ficha, inclusive offsets de material; o validador não entende a narrativa por conta própria.
- Tipos permitidos: `motion`, `infografico`, `imagem_oficial`, `gameplay_verificado`, `broll_aprovado`. São declarações editoriais a verificar, não licença ou classificação automática. `gameplay_verificado` não autoriza afirmar que uma filmagem é GTA 6 sem evidência.
- Fontes precisam estar nesta execução em `visual/`. Arquivos de outras produções, caminhos externos ou links diretos não são aceitos pelo montador.
- Layouts: `cheio` preenche a tela; `janela` posiciona a fonte em fundo escuro; `tres_faixas` usa fonte nítida sobre fundo desfocado. `crop` e `area_visual` são `[x,y,largura,altura]` normalizados entre 0 e 1. A ação deve continuar visível. Posições de card/legenda são centro X/Y normalizados na zona segura. Outro estilo: fabricar peça com motion e compor, sem fingir que os três layouts cobrem toda edição.
- Card quebra em linhas; legenda realça a palavra atual em grupos de até três. QA visual ainda verifica texto longo, região da ação e ritmo. Não existe detector semântico automático de rosto/trailer/fatos/gancho.
- `freeze_intencional: true` só para still realmente previsto no storyboard; não serve para encobrir fonte curta.
- Assets novos exigem procedência na ficha; b-roll usa `brolls.py`, nunca é chamado de streamer. Música/SFX próprios opcionais: copiar para `audio/` com procedência. `musica: {fonte: "audio/trilha.wav", volume_db: -20}` e `sfx: [{fonte: "audio/impacto.wav", tempo: 1.2, volume_db: -10}]`. O motor normaliza as fontes, aplica ganho relativo à voz, posiciona SFX, mistura e normaliza a saída. Não usa áudio do original.

## Revisão e hooks

`hooks.jsonl` registra sucesso/falha, etapa e tempo. Os hooks são parte do executor local e também funcionam quando o agente é Codex. Não são hooks globais instalados no aplicativo Claude.

`portao.json` do revisor real:
```json
{"veredito":"APROVADO","produtor":"id do agente produtor","revisor":"id do agente independente","sha256":"hash atual do final.mp4"}
```

`concluir` recusa QA falho, parecer de outro arquivo, mesmo autor/revisor e alteração da timeline/identidade após render. `execucao.json.decorrido_total_s` inclui todo o intervalo; `meta_180s_atingida` só descreve esta execução, não é garantia para próximos vídeos.

## Estado de validação

Há testes locais de contrato, falhas, coleta e render sintético. Sem teste live TikTok/IG, sem nova chamada de TTS e sem demonstração de vídeo real completo em 180 s nesta etapa. Benchmark HyperFrames anterior é contaminado por carga. Medir com originais reais diferentes, sem cortar revisão ou usar resultados antigos.
