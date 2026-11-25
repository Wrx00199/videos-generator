# Molde ricksclips (digest dos prompts dos tweets caesarscales 2119747660966195394 e whothefukboris 2118781966602686492; texto completo em tweets.json)
Fonte: prompts "leaked" por criadores que dizem ter recriado o estilo do Ricks Clips (35 mi views no short VS1Z_Q-Klt8). Números são do prompt, não medidos por nós.

## Esqueleto (55-70 s, 150-200 palavras; Boris: 45-60 s a ~230 wpm)
0-4s GANCHO: um ato que não faz sentido, motivo escondido; cabe em 1 quadro e já acontece no frame 0.
4-12s SETUP: quem, onde, o que está em jogo, com 1 número exato.
12-20s O ZOMBADOR: fala citada de piada contra o herói, close grande.
20-40s O MÉTODO: fica mais estranho em degraus; 1 inserto close por degrau (a prova).
40-50s "YOU SEE,": o truque explicado com algo do cotidiano do espectador (cena própria: corte, sonho, maquete).
50-62s PAYOFF + TWIST: mostrado, não explicado; última fala = maior revelação, chama de volta o gancho; quadro final segura 1 s.
Roteiro: jeito de criança contando pro amigo ("e", "então"), uma comparação engraçada, sem datas/jargão, vírgulas em vez de pontos (a voz "reseta" após ponto). No máx. 1-2 nomes.

## Câmera e edição (números do prompt Boris)
- ~2,6 cortes por 10 s (2,1-3,9); plano mediano ~2,5 s; nunca 2 cortes a <0,4 s.
- Câmera se move em 86% dos quadros; push-in padrão (~x1,28 em 1,35 s, mais rápido na palavra-chave); nunca parada.
- Junções: 77% dissolve de 6 quadros com as 2 câmeras ainda em movimento; 1 em 9 zoom-através (porta/tela/olho); corte seco <5%; no máx. 1 whip.
- Payoff = maior enquadramento do vídeo (revelação vindo na lente). Objeto-chave ocupa 0,45-0,7 da largura; rosto acima da faixa de legenda.
- Todo número falado vira OBJETO na cena (tela, placa, contador) e sobe na palavra. Sem HUD/setas/adesivos flutuando; texto só em objetos reais.
- Legenda 1-2 palavras, fonte arredondada bold, branca com contorno grosso, terço inferior, sem ponto final.
- Animação: antecipação 2-6 quadros, ação na palavra, overshoot 5-15%, assentar; paradas "vivas" (piscar a cada 1,5-4 s). Adereço só mexe se a mão mexe; nada aparece/some do nada.
- Som: SFX em toda ação visível; voz mediana -15 dB; ambiente por lugar -30 dB; encurtar silêncios >0,25 s para 0,12 s; nunca mudar o tom da voz.
- Sincronizar corte/rosto/gesto/SFX a índice de PALAVRA (whisper word timestamps), nunca a segundo fixo.

## Proibido no molde
Vídeo/imagem de IA, modelo 3D baixado, logo real, câmera parada, rosto cortado pela metade, fundo vazio, voz esticada/sussurrada, motion blur, profundidade de campo, mão atravessando objeto.

## Como usar no Tião
Escolher a história (verdadeira, pouco conhecida, "parece ridículo → quem riu é o bobo"), escrever beats com segundos e mostrar roteiro+beats ANTES de construir; modelar o ritmo/estrutura acima; fala PT-BR com humor BR; Tião é o herói ou o narrador presente em toda cena.

## MEDIDO 24/11 (VS1Z_Q-Klt8, ffmpeg + 32 quadros vistos)
- Cortes secos: 0–1 por vídeo (3 vídeos). Mas enquadramento muda a cada ~2 s via câmera viajando/dissolve.
- 96% dos quadros com movimento; mudança média por segundo 2–17 (YDIF), nunca parado.
- ~10 cenários/lugares em 64 s; luz muda (dia, pôr do sol, noite, explosão).
- Ângulos: plongée, contra-plongée, dentro do objeto, reflexo, plano geral com multidão, close extremo de objeto.
- Insertos de mecanismo (4 quadros seguidos só no objeto) = prova visual.
- Personagem: boneco cabeça redonda simples (igual ao Tião). O "tempero" é cenário+câmera, não FX.

## PADRÃO 6 VÍDEOS (24/11) — medido com ffmpeg + whisper small + folha de 24 quadros cada
Vídeos: A=VS1Z_Q-Klt8 (dragões/jarra), B=7xS87iActkU (ferrovia 39 pés), C=nzbkkEZFM8g (móveis 1 polegada), D=7dGWuCeZ8Ic (túnel cadeia→banco), E=NpRAk-5VKlo (privada espacial), F=QlDPMzGmYac (montanha-russa, 13 mi). Dados brutos: scratchpad/rk5.

| | dur s | cortes/10s (scene>0.08, grupo<0,5s) | % quadros YDIF>0.8 | LUFS | silêncios <-35dB | palavras (wpm) | lugares | luz muda |
|A|64,9|1,1|95,0|-14,1|0|235 (217)|~12|dia→pôr do sol→noite→explosão|
|B|65,2|2,0|98,3|-14,1|0|212 (195)|~9|dia→pôr do sol|
|C|58,4|0,9|94,7|-14,1|0|237 (243)|~9|noite→dia→fim de tarde|
|D|55,4|1,1|97,7|-14,1|0|216 (234)|~10|dia/noite/azul-cela|
|E|61,3|2,4|97,1|-14,1|0|204 (200)|~7|sempre escuro (espaço)|
|F|63,2|0,8|95,4|-14,0|1 (0,1 s)|236 (224)|~7|dia→noite→dia→explosão|
Tudo em inglês, voz começa em t=0,0. Legenda: y≈70% da altura, 1-3 palavras (média ~1,4), branca, contorno preto grosso, sem ponto final em vários.

### Padrão (>=5 de 6)
- 55-65 s, 204-237 palavras = 195-243 wpm (média ~215), frases curtas, ~13-21 frases, ~12-22 vírgulas (vírgula > ponto).
- Voz entra no frame 0 e não para: 0 silêncio <-35 dB em 6/6 (mix já normalizado em -14 LUFS integrado nos 6). Há cama sonora contínua; contagem de SFX NÃO medível por ffmpeg (voz domina).
- Movimento em 95-98% dos quadros (6/6): nunca parado; câmera sempre andando/empurrando.
- Poucos cortes secos: 0,8-2,4 por 10 s (média 1,4), mas enquadramento muda ~a cada 2 s por câmera viajando e dissolve/zoom-através (vistos em A, B, C, D, E).
- Gancho = fato absurdo na 1ª frase, sem pergunta ("He bent the loop...", "A man snuck into a house and moved everything an inch").
- "You see," aparece 1x em 6/6 (F 2x) como virada para a explicação do mecanismo, ~entre 15-25% do vídeo (logo após o gancho + setup), não aos 40 s como no molde.
- 7-12 lugares distintos por vídeo; 5/6 mudam a luz/hora do dia (E é o único sempre escuro).
- Close de rosto grande em 6/6, geral com figuração (exército A, feira F, fila de marmitas D, família C) em 4/6.
- Inserto de objeto/mecanismo em close ou dentro dele em 6/6 (pêndulo A, trilho com régua B, lente do olho-mágico C, cofre D, cano/janela E, laço F); ângulo de cima/aéreo em 5/6, contra-plongée/rente ao chão em 5/6, reflexo/lente/capacete/vidro em 4/6.
- Personagens 2D chapados (cabeça redonda grande, olhos pontos, membros-linha finos, roupa/chapéu de cor própria) sobre cenário 3D/pintado com iluminação rica (volumétrico, sol, lua, partículas).
- ~25-35% dos planos SEM personagem (só objeto, paisagem ou vista aérea).
- Elenco de 2-6 figuras com roupa-assinatura (boné listrado, chapéu-coco, uniforme) e expressões caricatas (cara de pânico, sorriso safado, óculos escuros).
- Texto só em objetos reais da cena (placar "NO GO", câmera "CAM 24", banner "OPENING TOMORROW", jornal, celular "No GPS Signal"); nada de HUD flutuante.
- Final em escala grande/destruição (terremoto A, explosão F, cidade E, trem no abismo B) e comédia de reação (gato C, cellmate D).
- Legenda no mesmo y (~70%), rosto/ação acima dela; palavra-chave grande aparece na palavra falada.

### O que contradiz o MOLDE atual
- "Cenário/personagem 2D puro e proibido modelo 3D": o cenário dos 6 é render 3D/pintado rico + personagem 2D plano. Cut-out 2D chapado não chega nesse nível sem camadas, luz e perspectiva reais.
- "~2,6 cortes/10 s": medido 0,8-2,4 (média 1,4); a sensação de troca vem de câmera/dissolve, não de cortes.
- "150-200 palavras": medido 204-237 (195-243 wpm); "Boris 230 wpm" bate, os 150-200 não.
- "Encurtar silêncios >0,25 s": os vídeos não têm silêncio algum; voz contínua e loudness -14 LUFS (não -15 só de voz).
- "YOU SEE aos 40-50 s": aparece muito antes (~10-18 s); a explicação vem cedo e o resto é escalada.
- "Proibido profundidade de campo/motion blur": A, C, D mostram fundo/primeiro plano desfocado e rastro de movimento em close; usado sem problema.
- "Tião presente em toda cena": ~1/3 dos planos não tem personagem.
- "Legenda terço inferior" é preciso: y~70% da altura (centro do 3º terço começa em 67%).
