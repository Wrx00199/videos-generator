# Molde V5: gancho que não parece gancho + história de verdade (19/11/2026)

Pedido do Filippe: short que dá vontade de assistir, gancho forte que nem se percebe, narrativa boa.
Base: ep. 31 (sete dias acordado), `DIAGNOSTICO_E_MOLDE_V4`, reels BR, `DOPAMINA_UNIVERSAL`. [C] = minha chamada, não medida.

## Por que o ep. 31 é fraco (lido no roteiro) [C]
1. Gancho é título: "O que aconteceria se o Tião ficasse acordado por sete dias?". O espectador reconhece o formato e já sabe o fim (alucina, dorme). O portão V4 obrigava essa abertura nua.
2. Narrador faz relatório: "Dia 1. Ele cozinha sem parar e tá cheio de energia. Tudo certo." Zero imagem, zero tensão, "tudo certo" é enchimento.
3. Aposta pequena e sem rosto: "lavar o acampamento". Ninguém torce.
4. Virada é explicada por um terceiro ("o Capitão chega e conta"). Não tem pista plantada: o espectador não pode dizer "eu devia ter visto".
5. Degraus todos iguais (narrador conta o dia). Falta resultado diferente em cada um.
6. Fecho "e você aguentaria? Comenta" é genérico, não nasce da história.

## Regras V5 (o que muda)
1. **Gancho = cena já acontecendo, com número/prazo/perda, sem anunciar.** Abrir no auge e voltar ("flash-forward"): "O Tião não dorme há seis dias, e tem outro Tião sentado do lado dele." Pergunta nasce sozinha (quem é aquele?). Proibido abrir com "E se / O que aconteceria se" pelado. Regra+prazo+perda dos reels BR também vale ("R$ 1 trilhão em 24 h. Sobrou 1 real, perde tudo.").
2. **Aposta concreta e engraçada**: o que se perde tem imagem ("lavar o acampamento com escova de dente").
3. **Pista plantada antes de 40%**, mostrada em imagem (close ≥ 1 s) e dita de passagem: "o reflexo sorri um segundo atrasado". A virada reusa a MESMA palavra e muda o sentido dela. O portão confere (`pista`, `pista_palavra`).
4. **Cada degrau muda de TIPO**, não só de número: Dia 1 graça + pista; Dia 3 falha cômica; Dia 5 falso alívio (companhia); Dia 6 tentação (decisão); Dia 7 relógio. Narrador descreve o que a tela MOSTRA, em ação ("sai do panelão, senta do lado dele"), nunca estado ("está cansado").
5. **Uma decisão do Tião** no meio (tentação) para ele ter querer e escolha, não só sofrer.
6. **Virada mostrada, não contada**: acontece na tela e ressignifica a pista. Nada de personagem que chega só para explicar.
7. **Fecho = imagem final irônica + pergunta específica** sobre a decisão da história ("Se o seu reflexo oferecesse dormir por você, você aceitava? A ou B"), não "comenta aí".
8. Enchimento banido no portão: "tudo certo", "de repente", "incrível", "muita coisa".

## Como usar
`falas.json` com `"molde":"v5"`, `"pista":<índice>`, `"pista_palavra":"<palavra>"`, `formato` novo `cena` (ou outro). `python3 KIT/portao.py <proj> roteiro` agora roda 3 checagens a mais (`gancho_concreto`, `sem_enchimento`, `pista_paga`). Sem `molde` v5 o portão fica como V4 (episódios velhos não quebram).
Limite honesto: o portão só mede estrutura. Se é engraçado e surpreende, quem julga é o `revisor-bonecos` em texto e o Filippe.

## Exemplo reescrito (mesma premissa do ep. 31)
`roteiros/V5_exemplo_sete_dias.json`: 233 palavras, gancho em cena, reflexo atrasado plantado no Dia 1 e pago na virada (o reflexo copiava com 1 s de atraso, então o Tião dormiu primeiro). Passa no portão. Não foi renderizado nem aprovado.

## Premissas novas no mesmo molde (só ideia)
- **A sopa que rendia** (Banco V4 nº 2): "Toda noite some um marinheiro da jangada, e a sopa do Tião sobe um dedo." Pista: régua pintada no panelão. Virada: o Capitão dorme na sopa para fugir do frio.
- **O Capitão come o chapéu** (Banco V4 nº 1): "Tem uma panela amarrada no mastro, e o Capitão jurou comer o chapéu se o raio cair duas vezes." Pista: o chapéu some do barril. Virada: ele está na panela.
- **A fila do pão** [ideia nova]: "O Tião está há nove horas na fila da padaria e a fila não anda, porque o último da fila é o primeiro." Pista: o relógio da padaria parado. Virada: a fila é um círculo e o Tião é o atendente.

## Duas séries, 2 vídeos por dia (decisão do Filippe, 19/11)
Meta: postar 2/dia, um de cada. Mesma régua V5 (gancho em cena com número, pista que paga, fecho específico), identidade visual do Tião.
- **Série A, "E se…" de poder** (modelo dos reels BR): o Tião (ou "você") ganha um poder: super força, poder de fogo, voar, ler mente, ficar invisível. Escada Dia/Hora com o poder dando um problema novo a cada degrau. Cenário simples, 1 poder por vídeo.
- **Série B, aventura histórica/ficcional** (mistura A + viagem): o Tião cai num lugar/época: Egito Antigo, Grécia Antiga, Rússia em 1900, Triângulo das Bermudas, ou mundo de desenho/filme/série. Regra+prazo+perda: "O Tião caiu no Egito de 2.500 anos atrás e tem 3 dias pra provar que não é deus, ou vira múmia."
- **Regra de IP (KIT):** mundo de obra famosa só como paródia do TIPO (ilha de piratas, escola de bruxos, reino no fundo do mar), nunca nome, rosto, logo ou bordão. Personagem real ou histórico famoso também fica de fora, usar arquétipo (faraó, czar, general).
- **Guerra atual (Ucrânia/Rússia hoje): fora.** Humor com guerra em curso é de mau gosto e arrisca monetização. Ucrânia só em ângulo histórico longe disso (cossacos, 1600).
- Gargalo de 2/dia: tempo de montagem (~20–30 min hoje) e cota de voz. Ver automação do `story.js`.
