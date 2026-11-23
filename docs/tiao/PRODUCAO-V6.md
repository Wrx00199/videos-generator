# Tião V6 — roteiro, edição e prova

## O que aconteceu no ep. 43

O arquivo final tem 65,23 s e 1080×1920. A revisão anterior registrou cerca de 14,5 min de ponta a ponta. Os logs disponíveis não permitem atribuir esse total a cada etapa.

| Evidência | Consequência |
| --- | --- |
| O portão anterior aceitou o roteiro. Contou cinco degraus pela presença de “Dia N”, inclusive repetições do mesmo dia, e exigiu uma pergunta no fim. | O teste aprovava marcas de texto. A escalada, o sentido da pista e a conclusão continuavam sem prova. |
| A vizinha primeiro elogia, depois condena. A virada explica que o Tião projetava o medo. Nenhum detalhe específico e visível liga as duas coisas, e a torta não aparece na prova final. | O espectador recebe uma explicação tardia para uma pergunta que a imagem já tinha deixado confusa. |
| Aos ~20 s, a legenda fala da torta e o quadro mostra um rosto parcial. Aos ~33 s, corta a vizinha. Aos ~40 s, Tião fica na rua enquanto o texto diz que saiu. A auditoria sem imagem confirmou corte lateral no Tião e recorte do chapéu nos quadros 590, 680 e 1910. | O vídeo tem a resolução certa. Parte da informação essencial ficou fora do quadro ou fora da ação. |
| O story fatiou a duração das falas em trechos de ~2 s e alternou três tipos de enquadre com push-in repetido. O piloto bateu 31,3 planos/min no portão antigo. | O volume de cortes já estava lá. Faltava ligar os cortes à entrada de uma informação, a uma reação ou a uma mudança de intenção. |
| STT local dos WAVs originais `narrador_9.wav` e `narrador_10.wav` reconheceu a mesma revelação. A fala 9 deveria tratar da cozinha apagada. O STT do diálogo confirma ambas. | A duplicata já estava na voz disponível para a montagem. A legenda a acompanhou. A origem exata da troca do WAV na geração anterior ainda é desconhecida. |
| Earshot mediu −14,0 LUFS e −1,1 dBTP. | Volume geral dentro do alvo. Checar ruídos, transições e sincronismo exige olhar os segundos correspondentes e ouvir a mixagem. |

A edição de que o Filippe está falando é **montagem, timing e enquadramento**. O close marca a reação que muda o sentido da fala. O detalhe dá informação que o plano aberto esconde. O corte seco funciona quando se entende o que mudou. A passagem entre dias precisa de um sinal legível de tempo ou lugar. O efeito só entra se cumprir essa função.

Um vídeo barato pode ter desenho tosco e ainda deixar claras a ação, a ameaça e a piada. Cabeça ou pista cortadas, boca mexendo durante pensamento e voz duplicada atingem a compreensão. A comparação com vídeos virais não permite estimar o tempo de bastidor ou a probabilidade de viralizar. A hipótese a testar é que usar a mesma linguagem de edição reduz decisões por episódio e deixa o tempo disponível para reescrever o que enfraquece a história.

## Quem passa o quê

| Etapa | Entrada e decisão | Saída para a próxima etapa |
| --- | --- | --- |
| Olheiro, fora da fila de render | Começa em `referencias_moldes.csv` e nos links já salvos. Usa as rotas de coleta existentes se faltar um exemplo. Registra origem, data, duração e métricas observadas. Para deduzir timing, abre a referência e confere imagem e fala. | Link, timestamps e função dos beats. Título, thumb e views servem para triagem. Se a referência ficar inacessível, o que depende de conferência fica como hipótese. |
| Análise da referência | Reconstroi a pergunta que o vídeo abre, a consequência de cada degrau, o detalhe que volta e o que o último plano resolve. Anota o instante em que corte ou zoom muda o que o público sabe. `extrair_ref.py`, FFmpeg ou o espelho do clone ajudam quando faltam quadros ou texto. | Um molde funcional e exemplos com tempo. Para Tião, usar estrutura, timing e função de edição com premissa, falas, encenação e assets próprios. |
| Roteirista | Começa pela situação, pela pista e pela resolução que o kit pode mostrar. Depois escreve as falas. Cada degrau muda a situação. Cada linha tem imagem, ação ou reação observável, inclusive quando a voz é interna. | `falas.json` V6. Antes da voz, o portão verifica estrutura e catálogo. A leitura editorial decide se a pista realmente explica a virada, o gancho cria uma pergunta concreta e o pagamento fecha a promessa. |
| Montagem e prova visual | Planeja revelação, reação e continuidade da ação. Uma cozinha e dois personagens bastam quando a história funciona ali. Testa a abertura, a pista, a virada e o pagamento em quadros 9:16. Amostra início, meio e fim de zooms e o gesto mais arriscado. | `plano.json` e storyboard com o que cada plano mostra. Cenas e personagens do kit. Pose ou objeto indisponível volta para reescrita. Uma nova peça de arte entra em rodada própria do kit. |
| Voz e sincronismo | Gera WAV por fala com as vozes fixas. STT local confere conteúdo antes de aceitar o WAV. A montagem junta os WAVs, e uma transcrição local do diálogo fornece tempos das palavras para a legenda. | WAV por fala, diálogo, STT bruto em `voz/stt.json`, tempos, legenda ASS. Repetição ou divergência volta só para a fala ou para a montagem que falhou. Diálogo anima a boca do próprio falante enquanto fala. Narração e pensamento mantêm a boca sem animação de fala. |
| Produção e revisão | Usa o plano aprovado e as câmeras do kit. Roda auditoria de pose e enquadramento e abre os quadros de risco. Portão confere plano e diálogo antes do render completo. | MP4, verificação técnica e parecer editorial separado. Parecer aponta beat, segundo, defeito e correção. Reprovação visual volta para a edição/cena afetada e passa por nova prova. Aceite de postagem é do Filippe. |

**Nomes no estúdio.** Clonar é tentar reproduzir a execução de uma referência plano a plano. Modelar é reaproveitar a função e a ordem de beats, ritmo e lógica dos cortes numa execução própria. Reescrever é mudar a história ou as falas. O Tião usa modelagem de estrutura e roteiro próprio, com o kit fixo. A rota de clone em `ferramentas/clone.py` continua disponível no código e pausada no fluxo. Uma única referência pode ensinar um molde. Cada episódio ainda precisa de sua própria prova de tela.

## Contrato e comandos

Em `falas.json`, use `"molde": "v6"`, listas de `personagens` e `cenarios`, e os marcos em `beats`. Por exemplo, `{"gancho":0,"promessa":0,"escada":[1,2,3],"pista":1,"virada":4,"pagamento":5}`. São índices de fala a partir de zero. Coloque a pista cedo o suficiente para que o espectador a veja antes da revelação. Dias numerados e pergunta para o público podem ser escolhas do roteiro.

Cada fala tem `quem`, `tipo` (`dialogo`, `narracao` ou `pensamento`), `texto` e `visual`. Exemplo de visual: `{"ator":"tiao","gesto":"chapeuNaMao","cenario":"cozinha","prova":"Tião segura o chapéu longe da cabeça; o carteiro olha para ele."}`. Declare a prova como algo observável. O portão confere o gesto de catálogo e o elenco declarado. A prova visual detecta objetos e acontecimentos prometidos apenas em texto.

Cada plano tem `ini`, `fim`, `fala`, `cenario`, `luz`, `camera` e `motivo`. Exemplo de motivo: “Cortar da mão no chapéu para o carteiro desviando o olhar quando ele ouve a pergunta”. Marque virada e cortes pelo momento de informação na fala e na imagem. Configure `web/story.js` para executar as mesmas decisões de `plano.json`. Exporte os cortes reais do story para `cenas.json` como pares `[ini,fim]`. Em stories estáticos com `{ de: N }` ou `{ t0: SEGUNDOS }`, `cenas_ep.py` pode extrair as marcas. Confirme a exportação se o story montar os planos dinamicamente.

Da raiz do estúdio, com `PROJ` apontando para o episódio e `KIT=projetos/bonecos/serie-tiao-kit`:

```bash
python3 "$KIT/portao.py" "$PROJ" roteiro
# Depois do aceite da história e da prova visual inicial, gerar WAVs com voz_fala.py.
python3 "$KIT/montar_dialogo.py" "$PROJ"
python3 ferramentas/stt.py "$PROJ/voz/dialogo.wav" pt > "$PROJ/voz/stt.json"
python3 "$KIT/legenda.py" "$PROJ/voz/stt.json" "$PROJ/legenda.ass"
python3 "$KIT/portao.py" "$PROJ" prova
```

O scaffold `novo_ep.sh` exige `tempos_ft.js`. Para prova antes de gerar voz, use tempos provisórios e substitua pelos reais saídos de `montar_dialogo.py`. Depois de preparar o story, rode `node render.mjs --auditar` na pasta `web` com o intervalo de quadros da timeline. O resumo pode listar erros mesmo com código de saída 0. Abra a folha de risco e trate os avisos antes de rodar `render_leve.sh`. Gere a mixagem com a rota existente em `motor3d/audio/`, então use `montar_final.sh` e `portao.py <projeto> final`.

No celular, conferir pés enterrados ou virados, braço/contato, chapéu ou rosto cortado, boca em off, gesto sem intenção, salto de ação, fala repetida, som estranho, legenda adiantada/atrasada ou tapando informação e preenchimento 9:16. Um MP4 vertical pode conter uma composição cortada. Medição técnica do áudio não substitui escuta da edição. A automação desta rodada cobre estrutura declarada, câmera, intervalos, divergência de cortes e repetição reconhecida no STT. A conferência de pixels, atuação e sentido da história depende da prova e da revisão.

## Medição e escala

Registrar minutos de pesquisa usada no episódio, roteiro, prova, TTS/STT, render/mix, revisão, espera e retrabalho. O cronômetro termina com MP4 revisado. Comparar custo e taxa de aprovação de pilotos completos do mesmo perfil. O benchmark anterior de 15 s levou 6min11s até o arquivo e serve como medida técnica, com escopo diferente do episódio de 65 s.

Economizar primeiro no trabalho descartado. Conferir poucos quadros antes de pagar voz e render, gerar de novo só o WAV que falhou e reaproveitar o STT do diálogo para a legenda. O STT por fala testa o WAV certo, e o do diálogo testa a sequência e fornece tempos. Se a medição mostrar que carregar Whisper por fala custa tempo relevante, testar uma execução local que mantenha o mesmo modelo carregado durante o lote e compare taxa de erro e segundos por episódio.

Para ganhar escala, reaproveitar componentes e um repertório curto de encenações testadas. Fazer um piloto aceito, repetir a mesma rota em alguns episódios e medir quantos saem sem correção importante e em quanto tempo. Outros nichos podem consumir os mesmos contratos de referências, áudio e revisão técnica, com perfis próprios de roteiro, assets e render. O indicador de produção é vídeo publicável por hora, junto com defeitos que escaparam e tempo até a aprovação.
