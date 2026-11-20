# Handoff V4 — para o chat novo (18/11/2026)

Tudo abaixo está feito e testado (39 testes Python, 12 node). Leia só: este arquivo, `DIAGNOSTICO_E_MOLDE_V4_18-11.md` (molde + adendo dos reels BR), `KIT.md` seção "Regras V4", `.claude/skills/estudio-bonecos/SKILL.md` (ordem V4), `AUDITORIA_MOTOR_18-11.md`, `AUDITORIA_FLUXO_18-11.md`.

## Estado
- `portao.py <proj> roteiro|final` e `portao.py novo <slug>` (trava de 1 vídeo por vez; corte 2026-11-18; `APROVADO_FILIPPE`). Exit code é a verdade.
- Roteiro: `falas.json` com `formato` (e_se|o_que_aconteceria|se_voce|desafio|tiao_foi|fato_estranho), `virada` (índice), `personagens` (tiao + catálogo `catalogo/aprovados.json`), `cenario`; narrador + ≤1 voz; ≥3 degraus numerados (Hora/Dia/Problema N); 150–240 palavras; 1ª frase ≤16 palavras; fecho com pergunta/escolha ao público.
- Final: 50–90 s, ≥2,5 pal/s, ≥15 planos/min, plano ≤5 s, -14 LUFS ±1, pico ≤-1 dBTP, 1080x1920, HUD único, `eye` válido, elenco aprovado, `plano.json` com câmeras do banco `motor3d/cameras.js` (não repetir em seguida, ≥5 distintas, ≥3 ambientes em ≥60 s).
- Voz: `vozes_elenco.mjs` e `voz.mjs` giram as 5 chaves (exit 3 = cota esgotada: PARAR). `aparar_pontas.py` (só pontas), `conferir_fala.py` (≥70%). Render só por `render_leve.sh`.
- Fluxo: eu (orquestrador) escrevo/produzo; ÚNICO agente = `revisor-bonecos` (opus, lê código+imagem, só depois do portão final ok). Agentes antigos do Tião estão em `.claude/agents/_aposentados_tiao/`. Skills claude-drawing/huashu/hypit/pixelfx/remotion com `disable-model-invocation`.
- Catálogo 51/51 personagens e 15/15 cenários ok (apocalipse: sempre `apocalipse:{grade:false}`; feminino: `makeup` ou `semRelevoQueixo:1`). `gerar_elenco.sh` NÃO rodar (apaga bruto/gerente).
- Referências: sino do túmulo (Downloads), 5 reels BR em `referencias/2026-11-18-reels-br-e-se/` (+ análises antigas em `referencias/2026-11-16-*`).

## Não verificado / pendências
Retenção real; HUD "HORA 12 · R$ …" no render real; poses de ação; `.bak` não movidos; personagens mais bonitos/novos (pedido do Filippe, fora do plano); meta de 10 min nunca medida.

## Tarefa do chat novo
1. Propor 3 premissas em texto (formatos acima; ex.: "O que aconteceria se o Tião ganhasse R$ 1 bilhão?" no formato desafio); `falas.json` de cada uma passando `portao.py roteiro`; mandar ao Filippe escolher 1 (ele aprova roteiro/storyboard UMA vez).
2. Com a escolhida: `portao.py novo`, voz, plano, render leve, `portao.py final`, revisor, Filippe assiste. Cronometrar ponta a ponta (início ao MP4 revisado, com esperas e correções). Nada publicado. Um render por vez.
3. Se o fluxo falhar em algum ponto, corrigir o fluxo/portão (com teste) antes de seguir; registrar no `KIT.md` e no Second Brain (`04 - Projetos/Conteúdo/Estúdio de Vídeo/Estado e pendências.md`).
