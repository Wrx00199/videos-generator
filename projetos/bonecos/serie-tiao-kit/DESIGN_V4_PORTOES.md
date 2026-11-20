# Tião V4 — portões em código, catálogo aprovado, banco de câmeras (design, 18/11/2026)

Status: AGUARDA APROVAÇÃO DO FILIPPE. Nada foi construído.
Fonte: conversa de 18/11 + medições nos eps 14–28 + comparação com a referência GM9UKnZ6JFw (sino do túmulo) e o 10b.
Marcação: [F] medido · [H] hipótese · [C] chamada minha (corrigível).

## 1. Intenção e porquê
Os vídeos do Tião estão fracos e o último lote (eps 14–28, feito no Antigravity com o limite do outro Claude zerado) saiu com bugs visíveis. Filippe quer: (a) vídeo que qualquer pessoa queira ver até o fim, (b) visual limpo, com poucos bugs de animação, (c) workflow que gaste pouco do limite de 5 h e do semanal, (d) no máximo ~10 min por vídeo (passar um pouco com qualidade é aceitável), (e) caminho para ficar automático depois.

## 2. O que a análise mostrou
- [F] Referência do sino: ~21 composições distintas em 60 s, corte transversal, close de rosto, certidão em close, cenário trocando de cor por cena, legenda pequena de uma palavra, zero HUD. O 10b: cenário único marrom, 2 bonecos parados, contador + legenda em 3 linhas. O ep. 27: HUD duplicado e sobreposto, boneco minúsculo, Tião e esqueleto alternando na mesma pose, Tião sem olho e sem perna.
- [F] Duração dos eps 14–28: 75–139 s; 9 de 15 passam de 100 s (molde diz 50–75 s). Áudio existe em todos (-14 a -18 LUFS; 21–28 mais baixos que a referência, -14).
- [F] Já existem `checar.py`, `render.mjs --auditar` e o agente `revisor-bonecos`. O lote os ignorou: revisor por prompt "não barra" porque o agente decide seguir.
- [H] Áudio cortado/estranho dos eps 21–28 pode ser cota de voz estourando no meio do lote. Confirmar ouvindo (earshot).
- [F] `voz.mjs` usa uma chave só. Filippe tem 5 chaves Gemini e autorizou usar todas com as mesmas vozes.

## 3. Objetivos / não-objetivos / anti-objetivos
Objetivos: portão que realmente bloqueia; catálogo de personagens e cenários aprovados uma vez; variedade de plano parecida com a referência; voz resistente à cota; primeiro episódio novo, do zero, passando em tudo e cronometrado.
Não-objetivos: igualar o acabamento do Rick's Clips (impossível na RX 550); editar ou salvar os eps 14–28 (Filippe decidiu: refazer do zero); publicar; trocar de motor agora; gravar a tela em tempo real; instalar VoiceStudio ou OpenWhispr.
Anti-objetivos (seria falha mesmo "funcionando"): lote de vários vídeos de uma vez; vídeo com visual inventado na hora; nota de IA tratada como aprovação; render que trava o PC do Filippe; mais agentes ou mais regras que gastem o limite sem barrar bug.

## 4. Restrições
Linux, Ryzen 3 3200G, RX 550, 7,7 GB de RAM. Um render por vez, com `nice`/`ionice`, avisando início e fim. Canal PT-BR. Sem palavrão. Nada publicado sem aprovação. Chaves nunca aparecem. Cada vídeo começa execução nova (não reaproveitar roteiro/voz/timeline de outro).

## 5. Abordagens consideradas
A. Manter o motor 3D e trocar o processo (portões em código). Barato, usa o que existe.
B. Cenário pintado por IA com parallax (imagem em camadas + movimento de câmera). Bonito rápido, mas o personagem perde consistência e gasta cota do Gemini. Descartada por ora.
C. A + banco de 8 composições de câmera nomeadas. **Escolhida pelo Filippe em 18/11.** O motor continua, mas a 1ª etapa é auditá-lo: se a auditoria achar defeito estrutural, volta à conversa em vez de remendar.

## 6. Design (chamadas do Filippe = [Filippe]; minhas = [C])
1. **Portão em código** [Filippe aprovou a ideia; forma é [C]]. `portao.py` roda por etapa e devolve `passou/reprovou` + motivo. O fluxo só avança se passou. Estado em `<projeto>/portao/estado.json`. Trava de lote: não existe segundo episódio em andamento sem arquivo `APROVADO_FILIPPE` no anterior. Relatório de agente não conta; só a saída do script.
2. **Checagens automáticas (sem token)** [C]: duração 50–75 s; ≥2,8 palavras/s; planos/min ≥ 25; nenhum plano > 3 s parado; nenhum enquadramento repetido em planos seguidos; ≤1 elemento de HUD por vez e sem sobreposição de caixas; texto de legenda = texto do roteiro; LUFS -14 (±1) e pico ≤ -1 dBTP; silêncio no meio da fala ≤ 0,4 s; STT de cada fala ≥ 70% do texto; personagem só se estiver em `aprovados.json`; auditoria `--auditar` sem pose quebrada, personagem cortado ou pequeno demais; rosto livre.
3. **Catálogo aprovado** [Filippe: "aprovar uma vez, usar sempre"]. Auditar os ~15 cenários e ~70 personagens existentes com render de teste (olhos, pernas, rosto livre, escala). Marcar em `catalogo/aprovados.json`. Os que falharem vão para uma lista de conserto no motor; o vídeo só usa aprovados. Novos personagens/cenários entram pela mesma ficha, 1–2 por vídeo no máximo.
4. **Banco de 8 composições de câmera** [C]: abertura com push, close de reação, detalhe de objeto, corte transversal, travelling lateral, plongée, órbita, whip-pan. O storyboard é uma lista de planos com a composição escolhida; o portão confere variedade.
5. **Voz** [Filippe: 5 chaves]: `voz.mjs` com rotação automática entre as 5 chaves, mesma voz por personagem. Se todas falharem, o fluxo PARA e avisa (nunca entrega mudo/cortado). Corte de silêncio só nas pontas de cada fala, nunca no meio. Mix a -14 LUFS.
6. **Roteiro** [Filippe: aventura é livre, só precisa do Tião]. Formatos: viagem louca, "e se" (ex.: R$ 1 milhão pra todo mundo num universo paralelo), Tião leva algo moderno a uma época (IA e dinheiro na Grécia antiga). Molde v3 (gancho em ≤4 s, pergunta aberta até ≥70%, escada, virada mostrada, fim seco). 5 roteiros em lote só em texto, crítico em texto, Filippe escolhe 1.
7. **Render** [Filippe]: prioridade baixa, um por vez, aviso de início/fim. Sem gravação de tela.
8. **Economia** [C]: roteirista com modelo forte; crítico e checagem em texto com modelo barato ou script; revisor visual 1 única passada com folha reduzida (4 quadros por cena + recortes), nunca imagem inteira; sem re-render de rotina; correção em lote único. Erro novo vira regra no `KIT.md` e checagem no `portao.py`.
9. **Cronômetro** ponta a ponta no 1º episódio (voz, render, revisão, esperas e correções), reportado sem promessa. Meta 10 min; passar um pouco com qualidade é aceitável [Filippe].
10. **Registro** no Second Brain ao fim de cada etapa (resultado, decisões, pendências).

## 7. Ordem de trabalho
1. Auditoria do motor + `aprovados.json` + lista de conserto (só leitura e render de teste).
2. `portao.py` com as checagens do item 2 e a trava de lote.
3. Rotação das 5 chaves em `voz.mjs` + conferência STT + parada total se faltar voz.
4. Banco de 8 câmeras e conferência de variedade.
5. 5 roteiros em texto → Filippe escolhe 1 → storyboard → voz → 1 render → revisão → Filippe assiste.
Gate de Filippe: ele aprova o roteiro/storyboard (uma vez) e assiste o vídeo final. Sem outros "ok".

## 8. Fica para quem constrói
Limiares finos das checagens, nomes de arquivo, formato do `estado.json`, como medir "rosto livre" e "sobreposição de HUD" sem imagem, o que fazer com personagem reprovado (consertar x aposentar).

## 9. Chamadas minhas para conferir
Limiares numéricos do item 2; as 8 composições do item 4; só 1–2 personagens/cenários novos por vídeo; revisor visual em 4 quadros por cena; parar o fluxo (e não degradar) quando as chaves acabarem; auditar o motor antes de qualquer remendo.
