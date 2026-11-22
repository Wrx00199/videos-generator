# Etapa 2 — relatório (início 04:56, parada 05:03; teto era 06:26)
## Feito (verificado)
- ferramentas/comparar_planos.py (krill, não commitado): ep.40 geral 63%, 6/6 critérios FALHA (meta 85%). Quadros 540px por plano em ep40/quadros_planos.
- .claude/agents/revisor-shorts.md (Sonnet) + checklist PASSA/FALHA v2 na skill estudio-revisor-shorts (editada, não commitada).
- Teste 1: REPROVADO (ep40/REVISAO_TESTE.md, última linha `VEREDITO: REPROVADO`, 8 ordens de correção).
## Furos do teste 1 (a corrigir antes do teste 2)
1. portao.py não rodou: ep.40 não tem cenas.json → voz/legenda ficaram NÃO VISTO.
2. Subagente olhou montagens de 340px, não 540px; recortes de pé/mão saíram errados.
3. REVISAO_PARCIAL.md gravado só no fim, não por lote (instrução existe, o agente não cumpriu).
4. revisor-shorts só aparece como tipo de agente em sessão nova (já aparece agora).
## Pendente, precisa do Filippe
- Aposentar (mover p/ _aposentados com ok): revisor-bonecos.md. Revisor.md (clone GTA 6) sugiro manter.
- estudio-bonecos/SKILL.md ainda manda chamar revisor-bonecos (V4/V5): só troco depois do ok.
- Teste 2 (episódio novo): referência sugerida U9GsR_Mphpo (Historically, 83,8s, 25 cortes). Pela skill, o roteiro precisa da aprovação dele antes de voz/render.

## Rodada 5 do storyboard ep.41 (06:4x)
REPROVADO, média 6,8 (menor 6), PLANOS 98% PASSA. Ordens da rodada 3: 5 aplicadas, 4 parciais, 2 não. Pendências (REVISAO_SB.md): mira pl4 sem rosto visível; mão da vara pl11 (~240 px); panela tapando rosto pl16; mão/janela pl13; bordas <8% (pl5, pl8, pl13, panela); tronco pl10; Tião pl2 correndo.
Parado aqui por regra (teto de rodadas). Voz/render NÃO feitos; nada subiu ao Drive (sem APROVADO). entregar_drive.sh criado (não apaga). Adendos A (teste cego) e B (aprendizado) pendentes.

## Rodada 6 (revisão do storyboard após a correção "rodada 5")
REPROVADO, média 6,8 (menor 6), PLANOS 98% PASSA. Ordens: 1 aplicada, 6 parciais, 1 não. Parei por regra (rodada 5 era a última liberada). Voz/render NÃO feitos.
Pendências: p10 (luz, quepe ~180 px, furo só no 2º, tronco legível), p15 explosão do avião, p13 clarão na janela e vara na mão, p4 2º quadro igual ao 1º e "1916" a 15 px do aro, panela a 15-20 px da borda (67-76 s), p14 quadros quase idênticos 7,4 s, p16 78,3 s cético, balão 07 no fim (p12), Tião p2 ≥28%.

## Após a revisão 6 (sem nova revisão)
Correções diretas aplicadas (pl10 quepe/furo/luz, pl13 panela na mão, pl14 q27 câmera medio2, pl15 explosão, pl16 cético, mira cy 440, barril em quadro com medio2). auto_borda.py agora mede props (panela, vara via userData.auditProp); 0 violações. NÃO revisado de novo, NÃO aprovado. Voz/render não feitos (limite do Filippe: só após aprovar storyboard).

## Vídeo real ep.41 (liberado pelo Filippe, 21/11)
Voz Puck+Sadachbia (catálogo), render 2m16s (1181 quadros, passo 2), pico RAM usada ~3,6 GB. Revisão final: REPROVADO, média 6,2, menor 5, PLANOS 78%. Entregue em prontos/ como NAO-APROVADO-PELO-REVISOR. Detalhes: projetos/bonecos/2026-11-21-tiao-atirador-trincheira-41/REVISAO_FINAL.md
