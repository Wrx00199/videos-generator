# Benchmark Tião — O barulho da cozinha

Vídeo original de teste, 15 s, em `panela-teste.mp4`. Roteiro, plano, voz e storyboard foram produzidos nesta execução. O kit montou a pasta de render e o FFmpeg montou a saída H.264/AAC de 360×640. O arquivo tem 30 fps de contêiner e 6 imagens únicas de render por segundo. A voz de teste veio do Kokoro local.

| O que foi medido | Tempo |
| --- | ---: |
| Do primeiro arquivo do teste ao MP4, incluindo espera, correções e tentativas interrompidas | 6 min 11 s |
| TTS local na narração final | 17,95 s |
| Inicialização e render de quatro quadros a 1080×1920 | 19,27 s |
| Só o processamento de quadro a 1080×1920 nessa amostra | 3,71 s/quadro |
| Só o processamento dos trechos finais a 360×640, sombras desligadas e menos amostras de antialias | 0,62–0,73 s/quadro |
| Montagem e codificação do MP4 | 1,53 s |

Os tempos de quadro comparam dois perfis usados neste teste, com mudanças simultâneas de resolução, sombras e antialias. O ganho é de prévia e não é medida de render final em 1080p. Próximo teste de velocidade pode isolar resolução, sombras e GPU em uma amostra fixa antes de alterar o motor do canal.

O storyboard renderizado em `storyboard-renderizado.jpg` mostra Tião, Capitão e marinheiro no catálogo, poses distintas e o gato na revelação. O Capitão saiu da abertura quando a primeira composição o sobrepunha ao Tião. O teste ainda tem fundo desfocado, baixa cadência de animação e abertura simples. O teste cobre roteiro, plano, voz, render, montagem e checagem visual pontual. Ficam pendentes o portão de um episódio na duração de produção, voz Gemini, a revisão editorial independente e a aprovação do operador.
