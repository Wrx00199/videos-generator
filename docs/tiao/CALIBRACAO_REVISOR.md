# Calibração do revisor (estudio-revisor-shorts v1), 20/11
Material: folhas de 150 px (1 quadro a cada 2,5 s, em grade), uma tira dos primeiros 4 s (2 quadros/s), ebur128 e detector de cena do ffmpeg, e o `portao.py final` (só lê) em C e D.
A = ricksclips nzbkkEZFM8g (58 s), B = ricksclips 7xS87iActkU (65 s), C = ep.37 plano-secreto (76,5 s), D = ep.38 casa-assombrada (81,5 s).
N/A em A e B: o 12 (Tião/marca) e o 14 ("nós vs. o canal grande") não se aplicam a uma referência. No 4, o "≥80% da ref" compararia a ref com ela mesma, então A e B foram julgados pela parte absoluta (≥3 paletas, props, luz). No 8, o "só onde a ref tem" também compara a ref com ela mesma.
"lit." = a nota que o texto atual da rubrica daria se aplicado ao pé da letra (ver Ajustes 1 e 2).

| # | Aspecto | A | B | C | D |
|---|---|---|---|---|---|
| 1 | Gancho | 9 | 9 | 4 | 6 |
| 2 | Retenção/ritmo | 9 (lit. ≤5) | 8 (lit. ≤5) | 5 (lit. 8) | 7 |
| 3 | Roteiro/virada | 9 | 10 | 7 | 8 |
| 4 | Cenário | 9 | 8 | 4 | 8 |
| 5 | Personagem/atuação | 9 | 8 (lit. 6) | 5 | 7 |
| 6 | Câmera | 9 | 9 | 5 | 7 |
| 7 | Luz/cor | 9 | 9 | 6 | 6 |
| 8 | Motion/HUD | 9 | 8 | 4 | 8 |
| 9 | Voz/mix (não verificado) | 8 | 8 | 8 | 8 |
| 10 | Legenda | 8 | 8 | 8 | 9 |
| 11 | Sound design (não verificado) | 8 | 8 | 8 | 8 |
| 12 | Originalidade | N/A | N/A | 8 | 7 |
| 13 | Legibilidade 150 px | 9 | 8 | 5 | 7 |
| 14 | vs. criador maior | N/A | N/A | 4 | 7 |
| | **Média** | **8,75** (12 aspectos) | **8,42** (12) | **5,79** | **7,36** |
| | Média sem 9 e 11 | 8,90 | 8,50 | 5,42 | 7,25 |
| | **Menor nota** | 8 | 8 | 4 | 6 |
| | **Veredito** | APROVA | APROVA | REPROVADO PELO PORTÃO (sem FICHA.md); notas só para calibrar | REPROVA (média < 8; 1 e 7 < 7) |

Medidas: LUFS/pico A -14,1/-2,1 · B -14,1/-2,2 · C -14,0/-1,2 · D -14,0/-1,1. Cortes detectados (cena > 0,12): A 1, B 8, C 78, D 109. O portão mede C com 30,6 planos/min e D com 32,4/min.
Resultado: a rubrica separa os quatro como o esperado (A, B ≥ 8 > D 7,4 > C 5,8). A margem entre D e as refs é de 1,1 ponto.
Porquês curtos:
- A: assaltante entrando no quadro 0; casa de noite, sala, cozinha, quarto e fachada de dia; virada (comprador = ele) em ~85%.
- B: serra a fresta no quadro 0; pista no 0 s paga com o calor; cético citável ("até suas frestas sabem que você errou").
- C: Tião parado narrando na frente da cabeça (0–3 s); um pátio maia laranja o vídeo inteiro (só uma floresta aos 22–25 s); contador fixo 100% do tempo; Tião minúsculo aos 2,5, 12,5, 27,5 e 50 s.
- C, o que salva: o roteiro (pista da pedrinha aos 5 s, paga na virada).
- C, portão: a regra da FICHA é de 20/11 e o ep.37 é de 19/11, então essa reprovação vem em parte da data da regra.
- D: 5 ambientes, props bons (caderninho, placas), nenhum HUD fixo.
- D, defeitos: noite lamacenta (Tião azul aos 0–4 s, quase preto aos 22,5 e 42,5 s, o chapéu branco some); o gancho não mostra o móvel; cerca tapando a placa (67 s); virada em 64–69%.
- D, enredo: quase o mesmo de A (móvel 1 dedo, polícia ri, venda barata, comprador é ele). Modelar é permitido, mas tira ponto no 12.
- Coerência: D dá 7,36 aqui e deu 7,75 na REVISAO2 (outra régua, 8 partes). Os dois reprovam.

## Ajustes propostos à rubrica (texto)
1. **Aspecto 2: trocar "planos 25–40/min" por "mudança visual a cada ≤ 4 s".** Contar composição, fundo ou ambiente novo, e movimento de câmera que revela outro espaço. Não contar corte seco. As refs têm 1 e 8 cortes detectados e mudam de quadro a cada ~2,5 s com câmera contínua e transições casadas. C tem 30,6/min e parece parado porque corta dentro do mesmo pátio. Acrescentar: "≤ 5 se 3 planos seguidos repetem o mesmo fundo e a mesma luz".
2. **Aspecto 5: "boneco ≥ 35% da altura" vale só para plano COM fala do personagem.** Plano de objeto ou paisagem que mostra o substantivo da fala está isento. Os trilhos vazios de B (47–52 s) reprovariam ao pé da letra e são bons.
3. **Aspecto 1: o protagonista FAZ o ato no quadro 0 (verbo em movimento) e o objeto-chave aparece legível até 1,5 s.** Personagem parado narrando de frente para a câmera = ≤ 5. É isso que separa A e B (assaltante entrando, serra na fresta) de C (Tião falando parado).
4. **Aspecto 3: acrescentar "virada depois de 70%" (≤ 7 se antes).** As refs viram em ~85–88%; D vira em 64–69%. Hoje isso só está no prompt do agente.
5. **Aspecto 7: acrescentar "à noite, protagonista e prop citado legíveis a 150 px".** Chapéu e rosto com contraste contra o fundo; nada de tingir o personagem inteiro de azul ou preto. Medida possível: luminância média do bbox do boneco ≥ 1,5× a do fundo. Exemplo: D aos 22,5 e 42,5 s.
6. **Aspectos 9 e 11: não diferenciam.** Os quatro vídeos levaram 8 porque o revisor não ouve, e isso segura a média de vídeo fraco (C sobe de 5,4 para 5,8).
   - Opção 1: tirar os dois da média.
   - Opção 2: trocar por medidas objetivas. No 9: LUFS, pico e pal/s, que o portão já mede. No 11: onsets de SFX a ±0,2 s dos eventos do MAPA_DOPAMINA e queda da música ≥ 6 dB na virada, medidos nas trilhas de `som/`.
7. **Aspecto 8: tirar o "só onde a ref tem" do critério geral.** Fica: "HUD só se a ref usar; senão a informação vai em prop diegético (placa, jornal, calendário)". As refs não têm HUD e usam calendário, jornal e placa. C reprova por ter contador fixo 100% do tempo.
8. **Aspecto 10: "Noite N junto" é coisa do ep.38.** Trocar por "rótulo do degrau da escada (Noite/Hora/Dia N) na mesma linha da legenda, quando houver".
9. **Aspecto 12: separar o checklist do julgamento.** O "Tião de chapéu" e o "sem pessoa real" viram checklist (sim/não, que reprova sozinho). Fica para nota só o "reescreveu premissa e falas ou copiou?", com régua explícita: mesma premissa e mesma virada da ref = máx. 7.
10. **Aspecto 14: hoje repete o 4 e o 6.** Trocar por uma lacuna concreta: "cite 1 beat em que a ref mostra algo (close, mudança de lugar, objeto em quantidade) que nós não mostramos; 3 ou mais lacunas = ≤ 6".
11. **Calibração: nota de ref com N/A = média dos demais (12 aspectos)** e registrar isso no SKILL. Rodar de novo com 1 ref nova a cada 5 episódios para ver se a régua não infla.
