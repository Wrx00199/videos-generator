# Handoff para o Novo Chat — Série "Aventuras do Tião" (16/11 noite)

Este documento foi preparado diretamente para o agente que assumir a próxima sessão com o Filippe. Leia com atenção antes de executar qualquer comando.

---

## 1. O Que Aconteceu e Por Que o Vídeo Ficou Ruim (Diagnóstico Brutal)

Na sessão anterior, o agente tentou consertar o Episódio 10 ("O Abridor do Fim do Mundo", cenário `apocalipse`) **trabalhando sozinho (solo)** em vez de orquestrar a **equipe de subagentes especializados** do projeto. 

O resultado foi uma entrega com erros visuais amadores que o Filippe pegou imediatamente:
1. **Pilastra gigante no meio da tela tapando os personagens:**
   - Foi adicionada uma barricada com postes de ferro em `z = 4.5`.
   - Nos planos da rua (plano 11 e 14), a câmera foi posicionada em `z = 5.6` olhando para os atores em `z = 0.35`.
   - A câmera disparando de `z = 5.6` para `z = 0.35` ficou **atrás do poste do portão**, gerando um poste preto vertical gigante cortando o meio da lente e tapando o Tião e o Capitão.
   - *Regra violada:* Checklist do Revisor nº 12: *"câmera sem mastro/viga na frente"*.
2. **Atalho falso de "monstros" (Bolas vermelhas flutuantes):**
   - Em vez de instanciar os **personagens reais do catálogo** (o projeto já tem zumbi, vampiro, sombra, ogro gigante e monstros em `catalogo/PERSONAGENS.md` e `rig.js`), foram colocadas esferas 3D vermelhas genéricas flutuando no vazio atrás de uma grade.
   - *Regra violada:* `AGENTS.md`: *"Não fingir que uma imagem genérica resolve."*
3. **Falta de armas e props de verdade:**
   - O roteiro citava um arsenal de 50 armas e fuzis, mas a cena tinha apenas o capitão com um traço de fuzil solto, sem armas espalhadas, sem caixas de munição militar reais e sem impacto.
4. **Burlar a Revisão Independente:**
   - Não foi rodado o agente `revisor-bonecos` com o script oficial `checar.py` (que extrai as imagens reais `cNN.jpg` e `suspeitos.jpg` para inspeção visual). O agente solo apenas rodou a auditoria de texto (que só checa caixas 2D de atores e não vê postes na frente da lente) e declarou pronto.

---

## 2. A Estrutura de Agentes Obrigatória (Nunca Trabalhe Solo)

O projeto exige que cada função seja exercida pelo seu agente especializado:
1. **Roteirista (`.claude/agents/roteirista-bonecos.md`):** Roteiro no Molde v3 (50–75 s, >= 2.8 pal/s, gancho no frame 0, escada com unidade crescente, virada > 70%).
2. **Crítico de Roteiro (`.claude/agents/critico-roteiro.md`):** Aplica o Teste de 6 Perguntas (reprova com 1 "NÃO").
3. **Diretor de Cena / Arte (`.claude/agents/diretor-arte-bonecos.md`):** Garante composição, folha-modelo, iluminação, props físicos e **profundidade limpa sem vigas na frente da câmera**.
4. **Revisor Independente (`.claude/agents/revisor-bonecos.md`):** 
   - Roda `python3 serie-tiao-kit/checar.py final <pasta_ep>`
   - Inspeciona com olhos de diretor as imagens geradas (`suspeitos.jpg`, `cNN.jpg`)
   - Avalia as 8 notas (mínimo média 8.0, nenhuma < 7.0 para aprovar) e responde: *"Eu ficaria até o fim?"*.

---

## 3. O Que Está Pronto e Preservado no HD

- **Regras Unificadas:** `KIT.md`, `GANCHO.md`, `catalogo/HISTORIAS.md` e skills atualizadas para o Molde v3. Cópias `.bak_v3` salvas.
- **5 Roteiros Molde v3 Prontos:** Em `projetos/bonecos/serie-tiao-kit/roteiros/ROTEIROS_V3.md`.
- **Catálogo de 45 Personagens Reais:** Em `catalogo/PERSONAGENS.md` e `motor3d/rig.js` (incluindo monstros de verdade como `zumbi`, `ogro`, `vampiro`, `lobo`, `sombra`).
- **Episódio 09 Consertado e Entregue no Drive:** `prontos/3D/Aventuras do Tião/2026-11-16-o-meteoro-que-perseguia-o-tiao.mp4` (18.6 MB, -14 LUFS, 0 diferenças no Drive1).
- **Pasta do Episódio 10:** `projetos/bonecos/2026-11-16-tiao-apocalipse-10/` (áudio cortado a 2.99 wps e legendas `.ass` já prontos).

---

## 4. O Que Deve Ser Feito no Novo Chat

1. **Decisão com o Filippe sobre o Cenário do Piloto:**
   - **Opção A:** Arrumar de verdade o Ep. 10 (`apocalipse`): remover a viga/poste da frente da câmera em `story.js` e `cenarios2.js`, colocar os **monstros reais do catálogo** (zumbis/ogros de verdade) e caixas de armas de verdade.
   - **Opção B:** Produzir o Piloto no cenário **Arena** (Roteiro 2: "O Sétimo Passo na Arena"), que já tem o ringue, arquibancada, o campeão Robô Lata-Velha e monstros prontos sem risco de oclusão de prédios.
2. **Rodar a Equipe de Agentes:**
   - Invocar o `diretor-arte-bonecos` e o `revisor-bonecos` usando `invoke_subagent` com o prompt do papel.
3. **Checagem Visual Obrigatória com `checar.py`:**
   - Gerar as folhas com `python3 checar.py` e fazer o revisor inspecionar as imagens antes de qualquer entrega.
4. **Render e Entrega:**
   - Render com `--step 2` (2 min na RX 550) + áudio -14 a -15 LUFS + legenda dinâmica `.ass`.
   - Copiar para `prontos/3D/Aventuras do Tião/` e sincronizar via rclone (`Drive1:Estudio de Video/3D/Aventuras do Tião/Prontos/`).
