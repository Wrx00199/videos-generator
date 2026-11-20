# regras.md — LER ANTES DE QUALQUER VÍDEO (roteirista, storyboard, revisor, produtor, subagentes)

## Como esta lista cresce (formato Morgs)
A cada correção do Filippe ou do revisor:
1. Descobrir POR QUE errou (causa, não sintoma).
2. Escrever UMA regra curta no formato "Quando X, faça Y / nunca Z", com data.
3. Salvar aqui (e no KIT se for do Tião). Regra repetida = promover para NUNCA PODE.
Antes de criar vídeo: ler este arquivo inteiro. Regra nova só entra se evitar um erro real e checável.

## Princípio: MODELAR, não criar do zero
- Pegar vídeo de referência bom e preservar: gancho (traduzido), ordem dos beats, viradas, zooms, câmera, tipo de cenário/animação/infográfico, ritmo.
- Mudar só: fala (PT-BR com humor BR, não literal) e protagonista = Tião, sempre presente. Sem copiar arte nem voz. Nome de personagem do original é opcional.
- Todo beat: tensão → corte/suspense → cena de impacto em AÇÃO. Roteiro "slide" (só informa "próxima hora: X") é reprovado.

## NUNCA PODE ACONTECER (vídeo)
1. Vídeo duplicado ou cópia do anterior (fala, roteiro, timeline).
2. Texto fora de encaixe, cortado ou sobreposto.
3. Voz bugada (corte, robô, trecho repetido, vozes trocadas).
4. Tela preta.
5. Silêncio ou quadro congelado > 3 s (checar com `ffmpeg blackdetect/silencedetect/freezedetect`, não por LLM).
6. Bug de animação (membro atravessando objeto, flutuando, pose quebrada).
7. Personagem fora de lugar ou faltando (Tião ausente = reprovado).
8. Sincronia labial errada.
9. Preço fora de reais; fato inventado sem marcar como piada.

## NUNCA PODE ACONTECER (processo)
1. Mais de 1 ffmpeg/render ao mesmo tempo (PC fraco: 1 por vez; guarda por hook).
2. Consertar várias coisas de uma vez: 1 correção → re-render só dela.
3. Várias skills ou agentes rodando juntos; subagente dentro de subagente; mais de 1 subagente por vez.
4. Subagente sem modelo explícito, ou em Opus por padrão (usar haiku/sonnet; opus só roteiro, se justificar).
5. Gastar voz/render antes do LIBERA do diretor-retencao.
6. Postar (Tião nunca posta; Filippe posta). Segredo/chave em arquivo versionado ou em resposta.
7. Apagar projeto/original de outro trabalho; reaproveitar análise/roteiro/voz de outro vídeo.
8. Declarar "pronto" sem verificação por comando (checagens baratas antes de qualquer LLM).
9. Ler arquivo grande ou imagem inteira sem necessidade (grep antes; recorte em vez de print).

## Cada papel tem o seu "não pode"
- **Roteirista:** não escrever beat que só informa; não criar estrutura do zero quando há referência; não omitir o Tião; todo beat com tensão→corte→impacto.
- **Storyboard:** não aprovar plano sem ação visível que ilustre a fala; não deixar cena sem câmera definida; plano estático > 3 s precisa de justificativa.
- **Revisor (independente):** não editar o vídeo que julga; não aprovar com média < 8 ou nota < 7; ler código E imagem; dar ordem de correção específica, 1 por vez; não repetir elogio genérico.
- **Produtor/subagentes:** não mudar o esqueleto aprovado; não rodar 2 renders; não gastar cota de voz fora do plano; reportar erro com o texto exato; não tocar em pasta de outro vídeo.

## Regras aprendidas (acrescentar abaixo, mais nova primeiro)
- 20/11 — ep.38 (7,4) e ep.39 (6,6) caíram por roteiro "slide". Regra: modelar um vídeo de referência e exigir impacto em ação em cada beat.
- 20/11 — Molde de estrutura/câmera/legenda do estilo ricksclips (gancho→setup→zombador→método→"you see"→payoff; câmera sempre em movimento; número falado vira objeto): ver `referencias/base/MOLDE_RICKSCLIPS.md`. Roteiro e storyboard seguem essa tabela de tempos.
- 20/11 — Bike/objeto que a ficha cita e o motor não tinha: conferir `rg -l` no motor ANTES de aprovar a ficha; faltou `bicicleta` (criada no pacote trem). Ficha lista cenário + personagem + OBJETO.
- 20/11 — Render de teste de cenário: 1 processo só, vários quadros na mesma chamada (`portao_trem.sh "1,2,3"`), contact sheet reduzida (`ffmpeg xstack` a 270 px) em vez de ler stills grandes.
- 20/11 — Story de teste precisa exportar `shotAt`, `LIGHTS`, `lightFor` (main.js importa); copiar o modelo de `story_cenarios.js`.
- 20/11 — Crítico reprovou (5,8) roteiro copiado da ficha: a ficha dá estrutura, não texto final. Quando a fala só explica (física), cortar a resposta em duas e pôr piada a cada ≤8 s; paga a promessa do apostador na última fala com as mesmas palavras.
- 20/11 — Voz do apostador bloqueada (PROHIBITED_CONTENT) com estilo 'rouca de bar + gargalhada de zombaria'. Estilo de voz: tom neutro 'convencido, provocador, voz grave e clara'; nada de rouco/risada maligna. Falta só a fala bloqueada: o script refaz só ela (1 chamada).
- 20/11 — Filippe reprovou o ep.40 v1 (bike enfiada na caixa/trilho, gigante com a cabeça cortada, 'boné voa' sem voar) que eu enviei sabendo da reprovação do revisor. Regras: (1) NUNCA enviar vídeo com revisão reprovada sem avisar e sem corrigir antes; (2) revisor/eu assistimos quadros em ≥360 px de cada plano, não só miniatura 270 px; (3) objeto citado na fala tem que aparecer de verdade (boné/sapato = props que voam); (4) 'gigante' do rig estoura o cartão e corta a cabeça: usar `barbacoral` para grandão; (5) objeto sobre trilho precisa de y das tábuas (0,22) e distância do vagão.
- 20/11 — MODELAR = fidelidade ≥85% ao original (ordem, sentido, piada, ritmo); idioma e algumas palavras mudam, a estrutura não. O ep.40 v1/v2 caiu pra ~50% porque os agentes (crítico/retenção) 'melhoraram' o texto com piadas inventadas (VIP, boné voa, 'tapa na cara'). Regra: crítico e retenção só SUGEREM; roteiro final = tradução adaptada frase a frase da fala original (`referencias/base/<id>.json` beats[].fala); todo revisor recebe original + versão nossa e dá % por beat e geral.
- 20/11 — Pés do boneco: se a perna fica atrás da bike, o pé some. Boneco na frente da bike (z +0,1), pés no círculo do pedal com a MESMA fase da bike (`pedal` no cenário = t*7); testar com recorte dos pés em ≥420 px.
- 20/11 — TTS Gemini bloqueia (PROHIBITED_CONTENT) a frase 'antes de o trem sair da estação'; reescrever ('assim que esse trem sair') resolve.
