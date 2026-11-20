---
name: estudio-revisor-shorts
description: Rubrica de revisão rígida de short vertical com personagens estilizados 2D/3D (Tião, ricksclips-like). Notas 0–10 por aspecto, aprova média ≥8 e nenhum <7, com ordens de correção específicas. Usar ao revisar um episódio pronto (1 passada) ou calibrar contra referência.
---
# Revisor de shorts — rubrica (v1, 20/11)
Uma passada por episódio. Primeiro o portão mecânico (`portao.py final` exit 0); sem ele não há nota. Imagem só em folha reduzida (1 quadro/2 s, ~150 px) + recortes (~300 px) onde houver dúvida. Compare sempre com a referência salva (sheet_*.png da pasta em `referencias/`) e diga se o NOSSO plano é mais pobre.
Ler: falas.json, FICHA.md, MAPA_DOPAMINA.md, web/story.js, REVISAO anterior (verifique ordem por ordem: plano + tempo em que aparece no render novo; ordem sem prova = não aplicada).

## Aspectos (nota 0–10 cada; critério observável)
1. **Gancho (0–3 s)**: quadro 0 já mostra ato estranho/evento + objeto-chave legível; pergunta nasce sozinha; ≤16 palavras. 10 = curiosidade imediata; ≤5 = título/relato.
2. **Retenção/ritmo**: planos 25–40/min, nenhum >5 s parado, evento novo a cada ~2 s, pior momento antes da virada. ≤5 se há trecho de 8 s sem mudança.
3. **Roteiro/virada/payoff**: pista plantada <40% e paga em imagem; virada ressignifica; cético com frase citável; fecho específico. ≤5 se adivinhável pelo título.
4. **Cenário**: ambientes distintos ≥80% da ref (≥3 paletas), props legíveis, luz coerente com a hora (noite = janela escura). ≤5 com 1 cenário/1 cor.
5. **Personagem/atuação**: design distinto por papel, expressão e pose com a fala (verbo visível até o fim da palavra), boneco ≥35% da altura (aberto só 1 a cada 6), pé no chão, nada flutuando.
6. **Câmera/enquadramento**: tipo igual ao da ref no beat, ≥5 câmeras, sem oclusão (≥25% do quadro tapado = reprova o plano), prop citado inteiro no quadro com margem ≥8%.
7. **Luz/cor/acabamento**: contraste/saturação, vinheta, nada estourado/preto sem leitura; look consistente por série.
8. **Motion/infográfico/HUD**: só onde a ref tem; legível; não cobre >90% do tempo.
9. **Voz/mixagem**: -14 LUFS, pico ≤-1 dBTP, voz clara, pausas, pronúncia (STT pode errar nome, ouvir não é possível: marcar "não verificado").
10. **Legenda**: palavra a palavra do TEXTO do roteiro, zona segura, não tapa rosto, "Noite N" junto.
11. **Sound design/música**: SFX nos eventos do mapa, música com duck e parada na virada.
12. **Originalidade/autenticidade**: modela esqueleto, não copia fala/arte; Tião (chapéu de chef sempre) é o protagonista; sem pessoa real/marca.
13. **Legibilidade no celular**: 150 px de largura ainda se entende (prop, rosto, texto).
14. **Comparação com criadores maiores**: o que o canal grande faz neste beat que nós não fazemos.

## Veredito
Média das 14 e menor nota. **APROVA** só com média ≥8 e nenhuma <7. Senão REPROVA com ≤8 ordens, da que mais sobe a nota à que menos, cada uma com plano, tempo (s) e correção exata. Ressalvas que não reprovam ficam separadas. Termine com "Eu ficaria até o fim? em que segundo sairia?".
Erros novos viram regra: listar no fim ("Erros NOVOS") para o produtor gravar no KIT e propor checagem no portão.
Calibração: `docs/tiao/CALIBRACAO_REVISOR.md` (refs fortes ≥8; ep.37 baixo).
