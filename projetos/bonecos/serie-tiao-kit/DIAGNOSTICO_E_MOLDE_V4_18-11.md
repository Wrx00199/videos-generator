# Por que o Tião é fraco e o molde V4 (18/11/2026)

Marcação: [F] medido · [H] hipótese · [C] chamada minha. Base: sino do túmulo (GM9UKnZ6JFw) transcrito e medido agora; eps 27 e 15; MOLDE_V3 e análises dos 8 canais; pedido do Filippe de 18/11; busca web (fontes de blog de ferramenta, fracas; só confirmam: pergunta no 1º segundo, arco de história, 1 batida a cada 2–4 s).

## O que o sino faz [F]
- 59,6 s, **um narrador só**, 220 palavras = **3,7 palavras/s**, sem ar morto.
- Gancho em 1 frase com imagem: "Enterraram um homem vivo com um sino amarrado no dedo."
- Escada: sino toca → vizinho acha que é vento → rua toda na varanda → médico "ele está morto, eu assinei".
- **Virada que muda o sentido do começo** aos ~70%: a mulher não está na varanda porque conhece o toque ("três curtos, um longo"). Final sombrio e seco (a casa é toda dela).
- Cada frase é uma imagem nova (certidão, varanda, pá na porta). Zero HUD.

## O que o Tião faz (ep. 27 e 15) [F]
- **Ep. 27**: dois bonecos gritando (Tião × esqueleto), 286 palavras em 127 s = 2,24 pal/s. Não há pergunta que alguém queira ver respondida: é "mais pressão, mais PSI" até estourar. Escada existe (PSI), mas não é história. Sem virada que reinterprete nada.
- **Ep. 15**: narrador + 4 vozes, 80 s. Escada boa (noite 1, 2, 3) mas piada e monstro genéricos; resposta aberta pouco tempo.
- Visual: 1 cenário parado, HUD duplicado, Tião sem olho (`eye:'look'`), plano de até 10 s.
- **Causa-raiz do processo**: o molde v3 já dizia tudo isso, mas ninguém **barrava**. Agora barra em código.

## Molde V4: gancho fixo + Tião sempre [C]
O Filippe quer o pegada dos canais de "E se…?" e "O que aconteceria se…?" e menos "Tião esquisito demais". Proposta: o Tião vira o **cobaia/herói da premissa** e **um narrador conta**.

Formatos (campo `formato` em `falas.json`; o portão confere a abertura):
1. `e_se`: "E se o Tião ganhasse R$ 1 bilhão amanhã?" Escada: dia 1 / semana 1 / mês 1 (a cada degrau o resultado MUDA e aparece em imagem).
2. `o_que_aconteceria`: "O que aconteceria se um raio caísse no Tião?" Escada: segundos → minutos → horas, com fato real por trás.
3. `tiao_foi`: "O Tião foi parar…" (viagem/época, como já tínhamos) com aposta clara.
4. `fato_estranho`: lenda/fato bizarro com o Tião dentro (modelo sino do túmulo).

Esqueleto: 0–4 s gancho (pergunta ou ato estranho + imagem); 4–15 s regra do jogo; 3–5 degraus; **virada em 65–92%** que muda o sentido de uma pista (campo `virada` = índice da fala); fim seco (callback ou consequência). 2,8–3,7 pal/s; ≥25 planos/min; **narrador + no máximo 1 voz**; nada de CTA.
Tião: chapéu de cozinheiro e olhos expressivos (reação em close a cada degrau). Humor vem da situação, não de gritaria.

## Portão de roteiro (já em `portao.py roteiro`, 28 testes) [F]
`formato` válido e abertura do formato · 1ª frase ≤14 palavras · ≤2 vozes · Tião presente · `virada` entre 65% e 92% · 140–230 palavras · elenco aprovado. O ep. 27 reprova em 4 (formato, gancho 15 palavras, virada, palavras).

## Limites [H]
- Os checks de roteiro só medem estrutura. Se a história é boa continua dependendo do roteirista e do seu olho (e do crítico em texto).
- Não existe benchmark oficial de "boa retenção"; só dá para medir os próprios vídeos no Studio.
- Pesquisa web fraca: nenhuma fonte primária. Sugestão: o Filippe mandar 3–5 links de "E se…" que ele gosta, que eu transcrevo e meço como fiz com o sino.


## ADENDO — 5 reels BR que o Filippe mandou (baixados em `referencias/2026-11-18-reels-br-e-se/`, medidos 18/11) [F]
| reel | duração | palavras/s | gancho |
|---|---|---|---|
| R$ 1 trilhão em 24 h (pipoqueiro) | 56 s | 3,2 | "R$ 1 trilhão pra gastar em 24 horas. Se sobrar 1 real, perde tudo." |
| Presidente por 1 dia | 60 s | 3,0 | "Se você ganhar [a presidência] hoje, a primeira coisa que ia descobrir não é o poder. É a conta." |
| Todo mundo cego, só você enxerga | 82 s | 2,7 | "Se todo mundo ficar cego e só você enxergar, não conte." |
| Mega da Virada (R$ 1 bi sozinho) | 91 s | 2,2 | "Você acabou de ganhar sozinho a mega da virada. E o seu problema começa agora." |
| 5º reel (122 s) | 122 s | sem faixa de áudio no download | só olhei os quadros |
**O que todos fazem e eu não tinha:**
1. **Regra + prazo + perda na 1ª frase** ("24 horas", "se sobrar 1 real perde tudo", "90 dias", "até meia-noite"). Dá aposta e relógio.
2. **Escada numerada na tela**: "Hora 1 / 3 / 6 / 12 / 20 / 23", "Problema 1, 2, 3", "Dia 3", com número que sobe (10 milhões → 11 bilhões → 70 bilhões → 213 bilhões). Cada degrau muda o resultado e aparece em imagem.
3. **Virada = restrição que quebra o plano** (o Pix cai, só os cegos sabem andar sem ver, a lei decide a parte dela) aos ~70–80%.
4. **O fecho NÃO é seco: é pergunta ou escolha ao público** ("E você? O que compraria?", "Comenta A ou B", "Você conta ou mente?", "Manda pra pessoa que contaria"). Isso **revoga o "sem CTA"** do molde v3 para estes formatos: o portão agora exige fecho com pergunta/escolha.
5. Protagonista comum ("o pipoqueiro", "você"): serve de molde para o Tião ser o "cara normal que topou".
6. **HUD limpo e único** no topo (relógio da hora, saldo, aprovação %) que muda a cada degrau; legenda grande de 1–3 palavras com a palavra-chave colorida; cada frase = imagem nova; personagens 2D de contorno grosso em cenário pintado/3D escuro e brilhante.
7. **Menos cortes do que eu exigia**: 9–51 cortes/min (só o trilhão passa de 50); a imagem fica ~4–6 s com câmera lenta, HUD e legenda mexendo. Por isso afrouxei os portões [C]: duração 50–90 s, ≥2,5 pal/s, ≥15 planos/min, plano máx. 5 s, roteiro 150–240 palavras.
Novos formatos aceitos no portão: `se_voce` ("Se você…/Você acabou de…") e `desafio` (regra+prazo+perda). Gancho de até 16 palavras.
Limite: são 4 reels com áudio de milhões de views; não sei a retenção real de nenhum. Os números de view vieram do Filippe, não medi.
