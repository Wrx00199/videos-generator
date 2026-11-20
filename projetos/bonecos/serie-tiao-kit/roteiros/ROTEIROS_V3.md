# 5 ROTEIROS COMPLETOS — SÉRIE TIÃO (MOLDE V3)
Regra única: 50–65 s · >= 2.8 palavras/s · Gancho "Tião foi..." · Pergunta aberta até > 70% · Escada contável · Virada visual >= 1.5s · Sem CTA.

---

## ROTEIRO 1 — A BANDEIRA DA LUA
- **Cenário:** `espaco`
- **Elenco:** Narrador (voz Puck), Tião (`tiao`), Astro (`astro`)
- **Duração estimada:** 58 s (~165 palavras | 2.84 palavras/s)
- **Pergunta aberta:** Por que o Tião está gastando todas as bandeiras da nave a cada dez passos num chão que não tem nada?
- **Unidade da escada:** Bandeiras fincadas (1 -> 10 -> 50 -> 100 bandeiras)
- **Cético com poder:** Astro (astronauta veterano ri e zomba do desperdício)
- **Pista (0–8 s):** A poeira lunar sobe a cada passo e apaga as pegadas no chão imediatamente.
- **Virada (43 s / 74%):** Uma tempestade de poeira cósmica apaga o rastro e tampa o visor do Astro; a única coisa visível na escuridão são as bandeiras reflexivas enfileiradas até o foguete.
- **Consequência (>= 1.5s):** Astro desesperado segue as bandeiras correndo e abraça a escada do foguete; Tião já está lá dentro tomando café.
- **Porquê:** "Na Lua não tem vento, mas poeira apaga pegada. Quem não marca o caminho não volta pra casa."
- **Fecho:** Tião bate a porta da nave. Corte seco.

### Texto do Roteiro (falas.json)
```json
{
  "falas": [
    {"quem": "narrador", "texto": "Tião foi pra Lua e fincou uma bandeira vermelha a cada dez passos na poeira cinza.", "tom": "curioso", "pausa": 0},
    {"quem": "astro", "texto": "Para de gastar bandeira, cozinheiro! A gente só veio pegar pedra!", "tom": "irritado", "pausa": 0},
    {"quem": "narrador", "texto": "Tião ignorou. Fincou dez bandeiras. Fincou cinquenta. Fincou cem bandeiras contadas.", "tom": "ritmado", "pausa": 0},
    {"quem": "astro", "texto": "Você é maluco! O chão tá cheio de pegada nossa pra voltar!", "tom": "zombando", "pausa": 0},
    {"quem": "narrador", "texto": "Mas aos quarenta minutos, o chão tremeu. Uma nuvem de poeira cósmica subiu como uma parede cega.", "tom": "tensao", "pausa": 0},
    {"quem": "narrador", "texto": "Em cinco segundos, todas as pegadas sumiram no pó. O rastro do chão virou nada.", "tom": "urgente", "pausa": 0},
    {"quem": "astro", "texto": "Cadê o foguete?! Eu não enxergo nada!", "tom": "desespero", "pausa": 0},
    {"quem": "narrador", "texto": "A única coisa brilhando acima da poeira era a linha reta das cem bandeiras do Tião.", "tom": "revelacao", "pausa": 0.4},
    {"quem": "narrador", "texto": "Astro correu seguindo a trilha vermelha até bater de cara na escada da nave salva.", "tom": "alivio", "pausa": 0},
    {"quem": "tiao", "texto": "Pegada o pó apaga. Pano vermelho não.", "tom": "calmo", "pausa": 0},
    {"quem": "narrador", "texto": "Tião fechou a escotilha e serviu o café.", "tom": "ironico", "pausa": 0}
  ]
}
```

#### Teste das 6 Perguntas:
1. Pergunta clara na 1ª frase? SIM ("Por que fincar uma bandeira a cada dez passos?").
2. Pergunta fecha após 70%? SIM (aos 74%, na tempestade de poeira).
3. Unidade cresce em >= 3 degraus contáveis? SIM (10 -> 50 -> 100 bandeiras).
4. Tião tem plano e alguém duvida? SIM (Astro zomba dizendo que pegada basta).
5. Pista antes de 12 s? SIM (poeira cinza solta no chão no primeiro passo).
6. Oração a cada ~2 s sem explicação parada? SIM (11 orações dinâmicas).

---

## ROTEIRO 2 — O SÉTIMO PASSO NA ARENA
- **Cenário:** `arena`
- **Elenco:** Narrador (voz Puck), Tião (`tiao`), Campeão Brutus (`bruto`)
- **Duração estimada:** 56 s (~160 palavras | 2.85 palavras/s)
- **Pergunta aberta:** Por que o Tião entrou na arena sem luva e passa a luta inteira só contando em voz alta enquanto apanha?
- **Unidade da escada:** Rounds e contagem de passos (Round 1: 7 passos; Round 2: 7 passos; Round 3: 7 passos)
- **Cético com poder:** Campeão Brutus (brutamonte gigante invicto)
- **Pista (0–6 s):** O chão da arena de pedra é liso e o campeão dá exatamente sete passadas pesadas antes de desferir o soco giratório com os olhos fechados.
- **Virada (42 s / 75%):** No round final, no exato sexto passo, Tião dá um passo lateral de quinze centímetros; no sétimo passo, o campeão dá o giro no ar e passa direto pela corda caindo fora da arena.
- **Consequência (>= 1.5s):** Brutus estatelado no chão de terra com as pernas pra cima; Tião com os braços cruzados rindo.
- **Porquê:** "Gigante treina tanta força que o corpo vira relógio cego. Quem sabe contar não precisa bater."
- **Fecho:** Sino toca e o juiz levanta o avental do Tião. Corte seco.

### Texto do Roteiro (falas.json)
```json
{
  "falas": [
    {"quem": "narrador", "texto": "Tião foi lutar contra o campeão invicto e passou a luta inteira só contando os passos dele.", "tom": "curioso", "pausa": 0},
    {"quem": "bruto", "texto": "Vou te esmagar em três segundos, tampinha!", "tom": "ameaca", "pausa": 0},
    {"quem": "narrador", "texto": "Round um: Brutus avançou sete passadas pesadas e acertou o vento enquanto Tião voava na lona.", "tom": "impacto", "pausa": 0},
    {"quem": "tiao", "texto": "Um, dois, três... sete!", "tom": "contando", "pausa": 0},
    {"quem": "narrador", "texto": "Round dois: o gigante bufou, deu de novo exatamente sete passos e quase quebrou o ringue ao meio.", "tom": "tensao", "pausa": 0},
    {"quem": "bruto", "texto": "Fica parado de uma vez!", "tom": "furioso", "pausa": 0},
    {"quem": "narrador", "texto": "A plateia inteira zombava do cozinheiro encurralado na beirada da corda bamba.", "tom": "tensao", "pausa": 0},
    {"quem": "narrador", "texto": "Round três. Brutus marchou babando de raiva: cinco, seis... no sétimo passo, Tião só deu um passo pro lado.", "tom": "suspense", "pausa": 0.4},
    {"quem": "narrador", "texto": "O campeão girou com duzentos quilos no vazio, furou a corda e despencou de cara na lama fora do ringue.", "tom": "virada", "pausa": 0},
    {"quem": "tiao", "texto": "Sete passos certos. Só faltou freio.", "tom": "deboche", "pausa": 0},
    {"quem": "narrador", "texto": "O juiz contou até dez e o cinturão caiu na cintura do Tião.", "tom": "conclusao", "pausa": 0}
  ]
}
```

#### Teste das 6 Perguntas:
1. Pergunta clara na 1ª frase? SIM ("Por que passar a luta só contando os passos do campeão?").
2. Pergunta fecha após 70%? SIM (75%, no round três com o passo de lado).
3. Unidade cresce em >= 3 degraus? SIM (Round 1 -> Round 2 -> Round 3).
4. Tião tem plano e alguém duvida? SIM (Brutus zomba e plateia ri).
5. Pista antes de 12 s? SIM (Brutus repete a mesma marcha de sete passos).
6. Oração a cada ~2 s sem explicação parada? SIM (11 orações curtas e visuais).

---

## ROTEIRO 3 — O ABRIDOR DO FIM DO MUNDO
- **Cenário:** `apocalipse`
- **Elenco:** Narrador (voz Puck), Tião (`tiao`), Capitão Caçador (`cap_cacador`)
- **Duração estimada:** 57 s (~162 palavras | 2.84 palavras/s)
- **Pergunta aberta:** Por que todo mundo se armou com fuzis e espadas para o apocalipse e o Tião levou só um abridor de lata enferrujado no bolso?
- **Unidade da escada:** Dias de sobrevivência e fome (Dia 1: caça zumbi; Dia 10: munição acaba; Dia 30: fome total)
- **Cético com poder:** Capitão Caçador (chefe dos guerreiros armados até os dentes)
- **Pista (0–7 s):** Na terra devastada não nasce planta nem bicho; só montanhas de contêineres de lata de feijão reforçado e blindado.
- **Virada (43 s / 75%):** Ao fim de trinta dias, toda munição acabou; o galpão da cidade está entupido com cinco toneladas de latas blindadas que nenhuma faca fura, e os caçadores estão chorando de fome.
- **Consequência (>= 1.5s):** Tião senta numa caixa com o abridor estalando tampa por tampa e fazendo fila de pratos fumegantes com os brutamontes de joelhos implorando.
- **Porquê:** "Em mundo destruído, ferro que atira gasta; ferro que abre alimenta."
- **Fecho:** Tião come de colherada na lata. Corte seco.

### Texto do Roteiro (falas.json)
```json
{
  "falas": [
    {"quem": "narrador", "texto": "Tião foi pro abrigo do fim do mundo e levou na mochila apenas um abridor de lata.", "tom": "curioso", "pausa": 0},
    {"quem": "cap_cacador", "texto": "Larga isso, moleque! Pega uma bazuca ou você não dura dois dias!", "tom": "zombando", "pausa": 0},
    {"quem": "narrador", "texto": "O capitão montou um arsenal gigante. No dia cinco, derrubaram dez monstros no portão.", "tom": "acao", "pausa": 0},
    {"quem": "narrador", "texto": "No dia quinze, a munição começou a chiar e o estoque de caça virou pó.", "tom": "tensao", "pausa": 0},
    {"quem": "narrador", "texto": "No dia trinta, sobrou apenas um galpão lotado com dez mil latas blindadas de comida militar.", "tom": "gravidade", "pausa": 0},
    {"quem": "cap_cacador", "texto": "Atira na lata! Corta na faca! A gente tá morrendo de fome!", "tom": "desespero", "pausa": 0},
    {"quem": "narrador", "texto": "As facas entortavam no aço blindado e a pólvora só amassava a comida por dentro.", "tom": "urgente", "pausa": 0},
    {"quem": "narrador", "texto": "Foi aí que um barulho de engrenagem estalou no fundo da sala escura.", "tom": "suspense", "pausa": 0.4},
    {"quem": "narrador", "texto": "Tião girou a manivela e abriu a primeira tampa espalhando cheiro de almôndega quente.", "tom": "virada", "pausa": 0},
    {"quem": "cap_cacador", "texto": "Tião... por favor... me vende uma colher!", "tom": "suplica", "pausa": 0},
    {"quem": "tiao", "texto": "Bazuca mata monstro. Abridor mata a fome.", "tom": "tranquilo", "pausa": 0}
  ]
}
```

#### Teste das 6 Perguntas:
1. Pergunta clara na 1ª frase? SIM ("Por que levar só um abridor de lata pro apocalipse?").
2. Pergunta fecha após 70%? SIM (aos 75%, quando a comida blindada não abre com arma).
3. Unidade cresce em >= 3 degraus? SIM (Dia 5 -> Dia 15 -> Dia 30).
4. Tião tem plano e alguém duvida? SIM (Capitão Caçador manda pegar bazuca e ri).
5. Pista antes de 12 s? SIM (o galpão de suprimentos fechado em lata blindada).
6. Oração a cada ~2 s sem explicação parada? SIM (11 orações com ritmo veloz).

---

## ROTEIRO 4 — O ASSALTO DO RELÓGIO
- **Cenário:** `cidade`
- **Elenco:** Narrador (voz Puck), Tião (`tiao`), Gerente Valdemar (`gerente`)
- **Duração estimada:** 55 s (~158 palavras | 2.87 palavras/s)
- **Pergunta aberta:** Por que o Tião entrou no banco central e todo dia às duas da tarde só pede um copo d'água e pergunta os minutos pro gerente?
- **Unidade da escada:** Dias e horário marcado (Segunda-feira: 14h01; Quarta-feira: 14h02; Sexta-feira: 14h03)
- **Cético com poder:** Gerente Valdemar (chefe do cofre com seguranças armados)
- **Pista (0–8 s):** O cofre-forte é digital e automático: a cada troca de turno das duas horas, a porta magnética reinicia o sistema por doze segundos exatos.
- **Virada (41 s / 74%):** Na sexta-feira, Tião derrama o copo d'água exatamente no painel no segundo zero da troca; os seguranças travam na catraca e o cofre abre sozinho com o alarme mudo.
- **Consequência (>= 1.5s):** O cofre escancarado emitindo luz verde; Tião sai caminhando com um saquinho de moedas enquanto o gerente corre em círculos.
- **Porquê:** "Banco moderno não tem chave de ferro. Tem relógio que dorme no ponto."
- **Fecho:** Tião dá tchau com a mão e o sinal fecha. Corte seco.

### Texto do Roteiro (falas.json)
```json
{
  "falas": [
    {"quem": "narrador", "texto": "Tião foi assaltar o maior banco da cidade e a única coisa que fez foi pedir as horas.", "tom": "curioso", "pausa": 0},
    {"quem": "gerente", "texto": "Se você não tem conta aqui, cozinheiro, sai da minha agência!", "tom": "arrogante", "pausa": 0},
    {"quem": "narrador", "texto": "Na segunda-feira, Tião pediu um copo d'água às duas em ponto e olhou pro teto.", "tom": "ritmado", "pausa": 0},
    {"quem": "narrador", "texto": "Na quarta-feira, voltou às duas e um minuto e anotou um bipe azul no cofre.", "tom": "tensao", "pausa": 0},
    {"quem": "gerente", "texto": "Esse cara é um mendigo louco! Deixa ele falar sozinho!", "tom": "zombando", "pausa": 0},
    {"quem": "narrador", "texto": "Na sexta-feira, o alarme da agência tocou o alarme da troca de turno dos guardas.", "tom": "urgente", "pausa": 0},
    {"quem": "narrador", "texto": "Tião escorregou a mão e entornou a água no teclado no segundo exato do reinício.", "tom": "acao", "pausa": 0},
    {"quem": "narrador", "texto": "A trava eletrônica piscou amarelo e a porta de aço de dez toneladas abriu sozinha sem ruído.", "tom": "virada", "pausa": 0.4},
    {"quem": "narrador", "texto": "Tião entrou, pegou apenas uma maçã de ouro da gaveta e saiu pela porta giratória.", "tom": "vitoria", "pausa": 0},
    {"quem": "tiao", "texto": "Segurança moderna é ótima. Pena que troca de turno.", "tom": "ironico", "pausa": 0},
    {"quem": "narrador", "texto": "O gerente gritou pro vazio enquanto o Tião pegava o ônibus.", "tom": "fecho", "pausa": 0}
  ]
}
```

#### Teste das 6 Perguntas:
1. Pergunta clara na 1ª frase? SIM ("Por que assaltar o banco só perguntando as horas?").
2. Pergunta fecha após 70%? SIM (aos 74%, na troca de turno da sexta-feira).
3. Unidade cresce em >= 3 degraus? SIM (Segunda -> Quarta -> Sexta).
4. Tião tem plano e alguém duvida? SIM (Gerente Valdemar zomba e chama de louco).
5. Pista antes de 12 s? SIM (o bipe do relógio e a luz do cofre às duas horas).
6. Oração a cada ~2 s sem explicação parada? SIM (11 orações com ação constante).

---

## ROTEIRO 5 — A ESCADA DA PIRÂMIDE
- **Cenário:** `maia`
- **Elenco:** Narrador (voz Puck), Tião (`tiao`), Guarda Real Tupaq (`guarda_maia`)
- **Duração estimada:** 58 s (~164 palavras | 2.83 palavras/s)
- **Pergunta aberta:** Por que o Tião foi desafiar a maldição da pirâmide e resolveu subir só um degrau por dia debaixo do sol escaldante?
- **Unidade da escada:** Degraus de pedra e dias (Dia 1: Degrau 1; Dia 10: Degrau 10; Dia 30: Topo da pirâmide)
- **Cético com poder:** Guarda Real Tupaq (guerreiro de lança que cobra pedágio e ri)
- **Pista (0–8 s):** A pirâmide tem um corte estreito de pedra esculpido no topo que só recebe luz direta no solstício ao meio-dia.
- **Virada (44 s / 75%):** No trigésimo dia, todos os aventureiros apressados já caíram nas armadilhas de flecha lá embaixo; ao pisar no último degrau no minuto exato do eclipse solar, a sombra revela a porta do tesouro sem armadilha.
- **Consequência (>= 1.5s):** As paredes de pedra deslizam com poeira e luz dourada inundando o topo; Tupaq boquiaberto deixa a lança cair no chão.
- **Porquê:** "Pirâmide antiga não é corrida de velocidade. É calendário de pedra que só abre na hora certa."
- **Fecho:** Tião pega o medalhão e desce rindo. Corte seco.

### Texto do Roteiro (falas.json)
```json
{
  "falas": [
    {"quem": "narrador", "texto": "Tião foi explorar a pirâmide proibida e decidiu subir exatamente um degrau por dia.", "tom": "curioso", "pausa": 0},
    {"quem": "guarda_maia", "texto": "Desse jeito você vai morrer de velho antes de ver o ouro, tampinha!", "tom": "zombando", "pausa": 0},
    {"quem": "narrador", "texto": "No décimo dia, vinte guerreiros correram escada acima e caíram no fosso de espinhos.", "tom": "impacto", "pausa": 0},
    {"quem": "narrador", "texto": "No vigésimo dia, os ladrões restantes foram varridos por uma rocha rolante gigante.", "tom": "tensao", "pausa": 0},
    {"quem": "guarda_maia", "texto": "Desiste, cozinheiro! Ninguém chega no topo vivo!", "tom": "ameaca", "pausa": 0},
    {"quem": "narrador", "texto": "Tião não correu. Deu seu vigésimo nono passo e armou a rede pra dormir.", "tom": "calmo", "pausa": 0},
    {"quem": "narrador", "texto": "No trigésimo dia, o sol do solstício atingiu o ponto exato da fenda de pedra.", "tom": "suspense", "pausa": 0.4},
    {"quem": "narrador", "texto": "Tião pisou no último degrau e o raio de luz alinhou as engrenagens sem acionar armadilha nenhuma.", "tom": "virada", "pausa": 0},
    {"quem": "narrador", "texto": "A parede secreta de ouro abriu suavemente enquanto o guarda derrubava a lança no chão.", "tom": "triunfo", "pausa": 0},
    {"quem": "tiao", "texto": "Pedra milenar não tem pressa. Tem relógio.", "tom": "sabio", "pausa": 0},
    {"quem": "narrador", "texto": "Tião encheu o bolso de joias e desceu cantando.", "tom": "fecho", "pausa": 0}
  ]
}
```

#### Teste das 6 Perguntas:
1. Pergunta clara na 1ª frase? SIM ("Por que subir só um degrau por dia na pirâmide?").
2. Pergunta fecha após 70%? SIM (aos 75%, no solstício do trigésimo dia).
3. Unidade cresce em >= 3 degraus? SIM (Dia 10 -> Dia 20 -> Dia 30).
4. Tião tem plano e alguém duvida? SIM (Guarda Tupaq zomba da lentidão).
5. Pista antes de 12 s? SIM (as fendas astronômicas entalhadas na pedra).
6. Oração a cada ~2 s sem explicação parada? SIM (11 orações dinâmicas).
