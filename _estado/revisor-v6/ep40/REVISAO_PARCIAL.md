# REVISAO_TESTE ep.40 trem-bike (ref BDhG_VplvzA) — revisor v6, 1 passada
Portão mecânico (`portao.py <pasta> final`): NÃO RODOU. Erro: "falta cenas.json em .../2026-11-20-tiao-trem-bike-40" (exit 2; o episódio não tem cenas.json). Registrado, tudo que dependia dele = NÃO VISTO; segui o resto a pedido.

## PLANOS (copiado de PLANOS.md; script, não anulo)
| critério | % | detalhe | |
|---|---|---|---|
| n_planos | 73% | orig 30 x nosso 22 | FALHA |
| duracao_media | 69% | 2.27s x 3.31s | FALHA |
| duracao_mediana | 72% | 2.21s x 3.06s | FALHA |
| plano_mais_longo | 63% | 4.26s x 6.80s | FALHA |
| alinhamento_cortes | 40% | 12/30 cortes com par ±0.75s | FALHA |
| ritmo_por_terco | 62% | orig 26/24/29 x nosso 17/15/20 /min | FALHA |
Geral 63%. PLANOS: FALHA.

## Cobertura
44 quadros de INDICE.txt (22 planos) abertos em 5 lotes (montagem 340 px) + `_folha.jpg` do original. Nenhum NÃO VISTO de quadro. Recortes de pé/mão: 2 tentados, errei o recorte (inúteis); julguei por quadros 540 px (p15 close mostra pé no pedal).

## Checklist
| # | item | veredito | prova |
|---|---|---|---|
| 1 | Contato/animação | FALHA | p19 65.5 s: Tião na bike sem mão no guidão (braço solto), bike parada, nada de impacto na caixa; p20 67.6 s: tripulação de braço esticado no ar, ninguém agarra Tião/bike (bike só ao fundo). p16 55.6-57.8 s "se arrasta": Tião deitado igual nos 3 quadros, sem ser jogado pra trás nem rastejar |
| 2 | Legenda | NÃO VISTO | zona segura e rosto livres nos 44 quadros (fica na faixa verde/chão), mas sincronia depende de áudio; p07 21.7 s legenda de 2 linhas sobe e quase encosta no mostrador |
| 3 | Voz | NÃO VISTO | sem portão e sem áudio |
| 4 | Cenário | FALHA | p12 38.9-41.7 s nevasca: casas/pinheiros "colados" e flutuando, neve só pontos, sem chão de neve contínuo; p13-p14 fundo borrado no meio (blur estranho) |
| 5 | Enquadramento | FALHA | p02 (3.0-9.8 s, 6.8 s): câmera parada igual 3 quadros, Tião ~25% da altura; p12 5.6 s parado; p17 3.6 s parado (só contador muda); p20 67.6 s Tião cortado atrás de 2 figuras |
| 6 | Personagens | FALHA (suspeita) | "maquinista" p17/p18 e o "capitão/tripulação" p20 usam bicorne+casaco azul e rig do catálogo (Capitão `cap`, PERSONAGENS.md l.10): papel novo = personagem novo; "gigante" p12 tem chapéu com pena igual ao do apostador (mesmo rig, roupa nova) e nem é gigante. Tião aparece: PASSA |
| 7 | Original × nosso | FALHA | cortes/tipos do original ausentes: zombador em close grande (orig 12-15 s) vs nosso médio de 2 personagens p04; close na roda/pé do escorrego (orig 25-31 s) vs lateral igual p09; nevasca "atrás do grandão" (orig casal andando atrás) vs dois parados de frente p12; cabine do orig tem 4 planos (57-61 s) vs 1 nosso p17; piadas/props inventados ("NÃO É BOMBA", "VIP", cronômetro 00:58, número "KMH"); PLANOS < 85% em 6/6. Texto: tradução adaptada fiel (ordem e piadas do orig) = ok |
| 8 | Completude | FALHA | "escorregar. Um pé, dois" p09-p10 29.9-32 s: Tião não escorrega em nenhum quadro (pé firme, mesma pose), vai direto ao apostador; "vapor pra sacudir" p08 24.2 s: só traços de vento, sem vapor; "freia cedo" p17-18: maquinista só parado, sem alavanca/freio; "bate na caixa" p19: sem batida |
| 9 | Cobertura | PASSA | todos os 22 planos abertos |

## Notas (aplicáveis; voz e sound = N/A sem medida)
1 Gancho 6 (Tião pedala já em 0 s e caixa legível, mas trem quase fora do quadro; 24 palavras > 16) | 2 Retenção 4 (6.8 s sem mudança; 3 planos pradaria iguais seguidos p07-p09) | 3 Roteiro 6 (fiel; virada/bolha em 43 s = 59% < 70%) | 4 Cenário 7 | 5 Personagem 5 (boneco 25% em p02; poses repetidas; sem verbo da fala) | 6 Câmera 4 | 7 Luz 7 | 8 Motion/HUD 6 (VIP e cronômetro flutuando) | 10 Legenda 7 | 12 Originalidade 6 (mesma premissa e virada) | 13 Celular 7 | 14 Lacunas 4 (4 lacunas listadas no item 7).
Média 5,75 | menor nota 4.

## Eu ficaria até o fim?
Não. Sairia em ~9 s: depois do gancho o plano de 6,8 s quase parado e a seguir pradaria repetida; só o close do p15 e a cabine (p17) quebram.

## Ordens (da que mais sobe a nota)
1. CÂMERA p02 (3.0-9.8 s): cortar em 3 planos (travelling lateral, insert close na caixa, Tião grande); hoje 1 plano parado de 6,8 s. Meta: ≥ 2,5 cortes na janela.
2. CÂMERA/CENA p04 (12.5-15.6 s): zombador em close grande do apostador, como o original; hoje médio de 2.
3. POSE p09-p10 (28-32 s): animar o escorrego (pé sai do pedal, bike inclina, 2 quadros distintos) + close na roda/pé.
4. CENA p12 (37.5-43.1 s): gigante realmente maior (≥1,6× Tião), Tião andando atrás, neve soprando; quebrar em 2 planos; rig novo, sem pena do apostador.
5. POSE p16 (54.5-58.8 s): Tião jogado pra trás fora da bolha e voltando (3 poses diferentes) em vez de parado inclinado.
6. CENA p17 (58.8-62.4 s): 3-4 cortes de cabine (rosto, alavanca/freio, janela com trilho), maquinista novo (não bicorne do capitão).
7. POSE p19-p20 (64-68 s): mão no guidão, impacto na caixa (tremor+poeira), tripulação segura bike e Tião de fato (contato de mão).
8. ROTEIRO/SOM: cortar piadas/props inventados (NÃO É BOMBA, VIP, 00:58) ou justificar contra o original; rodar portão (criar cenas.json) para liberar itens 2-3.
Erros NOVOS: (a) episódio sem cenas.json trava o portão: o produtor deve gerá-lo antes da revisão. (b) Pose "mesma inclinação" em planos de verbo diferente (escorrega, arrasta): regra geral — cada verbo da fala exige pose distinta em ≥ 2 quadros.

VEREDITO: REPROVADO
