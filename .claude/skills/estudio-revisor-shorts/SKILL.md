---
name: estudio-revisor-shorts
description: Rubrica de revisão rígida de short vertical com personagens estilizados 2D/3D (Tião, ricksclips-like). Notas 0–10 por aspecto, aprova média ≥8 e nenhum <7, com ordens de correção específicas. Usar ao revisar um episódio pronto (1 passada) ou calibrar contra referência.
---
# Revisor de shorts

Para Aventuras do Tião com `"molde": "v6"` em `falas.json`, aplique a seção **Revisão editorial V6** de `docs/tiao/PRODUCAO-V6.md`. A rubrica abaixo se aplica à revisão legada e à calibração contra referência.

## Rubrica legada (v1, 20/11)
Uma passada por episódio. Primeiro o portão mecânico (`portao.py final` exit 0); sem ele não há nota. Imagem só em folha reduzida (1 quadro/2 s, ~150 px) + recortes (~300 px) onde houver dúvida. Compare sempre com a referência salva (sheet_*.png da pasta em `referencias/`) e diga se o NOSSO plano é mais pobre.
Ler: falas.json, FICHA.md, MAPA_DOPAMINA.md, web/story.js, REVISAO anterior (verifique ordem por ordem: plano + tempo em que aparece no render novo; ordem sem prova = não aplicada).

## Aspectos (nota 0–10 cada; critério observável)
1. **Gancho (0–3 s)**: o protagonista FAZ o ato no quadro 0 (verbo em movimento) e o objeto-chave aparece legível até 1,5 s; pergunta nasce sozinha; ≤16 palavras. Personagem parado narrando de frente = ≤5.
2. **Retenção/ritmo**: mudança visual (composição, fundo/ambiente novo ou câmera que revela outro espaço) a cada ≤4 s; corte seco dentro do mesmo fundo não conta. ≤5 se 3 planos seguidos repetem fundo e luz ou há trecho de 8 s sem mudança.
3. **Roteiro/virada/payoff**: pista plantada <40% e paga em imagem; virada depois de 70% (≤7 se antes); cético com frase citável; fecho específico. ≤5 se adivinhável pelo título.
4. **Cenário**: ambientes distintos ≥80% da ref (≥3 paletas), props legíveis, luz coerente com a hora (noite = janela escura). ≤5 com 1 cenário/1 cor.
5. **Personagem/atuação**: design distinto por papel, expressão e pose com a fala (verbo visível até o fim da palavra), pé no chão, nada flutuando. Boneco ≥35% da altura só nos planos COM fala/ação do personagem (plano de objeto/paisagem que mostra o substantivo da fala é isento); aberto só 1 a cada 6.
6. **Câmera/enquadramento**: tipo igual ao da ref no beat, ≥5 câmeras, sem oclusão (≥25% do quadro tapado = reprova o plano), prop citado inteiro no quadro com margem ≥8%.
7. **Luz/cor/acabamento**: contraste/saturação, vinheta, nada estourado/preto sem leitura; à noite protagonista e prop citado legíveis a 150 px (chapéu/rosto contra o fundo; não tingir o personagem inteiro de azul/preto). Look consistente por série.
8. **Motion/infográfico/HUD**: HUD só se a ref usar; senão a informação vai em prop diegético (placa, jornal, calendário). Legível; HUD fixo >90% do tempo = ≤4.
9. **Voz/mixagem (medidas)**: LUFS −14±1, pico ≤−1 dBTP, palavras/s do portão, pausas; pronúncia = "não verificado" (o revisor não ouve). Não entra com nota inventada: use só se medido.
10. **Legenda**: palavra a palavra do TEXTO do roteiro, zona segura, não tapa rosto; rótulo de degrau (Noite/Hora/Dia N) na mesma linha.
11. **Sound design/música (medidas)**: onsets de SFX a ±0,2 s dos eventos do MAPA e queda da música ≥6 dB na virada (ler som/eventos.json e stems). Sem medida = N/A.
12. **Originalidade/autenticidade**: checklist (reprova sozinho): Tião com chapéu de chef, sem pessoa real/marca/logo WR. Nota: reescreveu premissa e falas ou copiou? mesma premissa e mesma virada da ref = máx. 7.
13. **Legibilidade no celular**: 150 px de largura ainda se entende (prop, rosto, texto).
14. **Lacunas vs criador maior**: cite 1 beat em que a ref mostra algo (close, mudança de lugar, objeto em quantidade) que nós não mostramos; ≥3 lacunas = ≤6.

## Veredito
Média dos aspectos aplicáveis (N/A sai da média; refs sem 12 e 14 = média dos 12) e menor nota. **APROVA** só com média ≥8 e nenhuma <7. Senão REPROVA com ≤8 ordens, da que mais sobe a nota à que menos, cada uma com plano, tempo (s) e correção exata. Ressalvas que não reprovam ficam separadas. Termine com "Eu ficaria até o fim? em que segundo sairia?".
Erros novos viram regra: listar no fim ("Erros NOVOS") para o produtor gravar no KIT e propor checagem no portão.
Calibração v1 (20/11): refs ricksclips 8,75 e 8,42; ep.37 5,79; ep.38 7,36 (docs/tiao/CALIBRACAO_REVISOR.md). Ajustes 1–11 da calibração já aplicados acima. Reavaliar com 1 ref nova a cada 5 episódios.
