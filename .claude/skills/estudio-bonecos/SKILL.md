---
name: estudio-bonecos
description: Produz um episódio da série "Aventuras do Tião" (bonecos 2D em mundo 3D): roteiro com falas → vozes por personagem → plano → auditoria + storyboard → revisor → render → checagem + revisor final (nota por parte) → prontos. Usar para "faz um vídeo do Tião", "próximo episódio", "nova aventura", "cria cenário/personagem novo pro Tião".
---

# Série Tião — fluxo único (v3, 16/11)

## V4 (18/11/2026) — ORDEM OBRIGATÓRIA COM PORTÃO EM CÓDIGO (vale sobre o resto abaixo)
Quem decide é o **exit code do `portao.py`** (`KIT/portao.py`), não relatório de agente. Sem `portao` ok não existe próxima etapa. **1 episódio por vez**: `python3 KIT/portao.py novo <slug>` só cria projeto se o anterior tem `APROVADO_FILIPPE`.
Quem trabalha: **você (orquestrador) escreve roteiro, produz e corrige**; o **único agente é `revisor-bonecos`** (rígido, lê código E imagem). Os outros agentes antigos (roteirista-bonecos, critico-roteiro, diretor-retencao, diretor-arte-bonecos) estão **aposentados do fluxo** (propostos para remoção em `AUDITORIA_FLUXO_18-11.md`; não apagados).
**V5 (19/11):** roteiro novo usa `KIT/MOLDE_V5_HISTORIA.md` (gancho em cena com número, pista plantada que paga na virada, fecho específico; `"molde":"v5"` no `falas.json` liga 3 checagens a mais no portão). Vale sobre o item 1 abaixo.
**V6 (20/11):** antes do roteiro/storyboard, preencher `FICHA_MODELAGEM.md` (kit) plano a plano a partir da referência; revisor reprova cenário/paleta/props/câmera mais pobres que a ref.
Ordem:
1. **Roteiro** (você, molde V4: `KIT/DIAGNOSTICO_E_MOLDE_V4_18-11.md`): `falas.json` com `formato` (e_se | o_que_aconteceria | se_voce | desafio | tiao_foi | fato_estranho; ver adendo dos reels BR no DIAGNOSTICO_E_MOLDE_V4), escada numerada (≥3 degraus "Hora/Dia/Problema N" no texto e no HUD único), fecho com pergunta/escolha ao público, `virada` (índice da fala), `personagens` (com tiao, só do catálogo aprovado), `cenario`. Narrador + no máximo 1 voz. → `python3 KIT/portao.py <proj> roteiro` tem que passar (exit 0).
2. **Filippe aprova o roteiro/storyboard** (uma vez).
3. **Voz**: `voz.mjs` (5 chaves; exit 3 = cota esgotada → PARAR e avisar, nunca entregar cortado) → `aparar_pontas.py` (só pontas) → `conferir_fala.py` por fala (≥70%).
4. **Plano**: `plano.json` = `[{ini,fim,camera,cenario}]` com câmeras do banco `motor3d/cameras.js` (abertura_push, close_reacao, detalhe_objeto, corte_transversal, travelling_lateral, plongee, orbita, whip_pan); sem repetir em seguida; ≥5 câmeras; ≥3 ambientes em ≥60 s. `eye` só `dot|wide|happy|shut|smug|x`.
5. **Render** só por `bash KIT/render_leve.sh <proj>` (nice/ionice, um por vez, avisa início e fim).
6. **`python3 KIT/portao.py <proj> final`** (duração 50–90 s, ritmo, planos, áudio, formato, HUD, olhos, elenco, variedade). Reprovou → corrige e roda de novo (1 lote de correção). Só com exit 0 chama o revisor.
7. **`revisor-bonecos`**, uma passada, sobre a saída do portão + código + folha reduzida (4 quadros por cena). Se o portão reprovou, a nota não existe.
8. **Você** confere a saída do portão e a folha reduzida (autoauditoria mínima) → **Filippe assiste** → `APROVADO_FILIPPE`. Nada publicado sem ele.
Economia: modelo barato em tarefa mecânica; imagem só reduzida; sem re-render de rotina; erro novo vira regra no `KIT.md` e checagem no `portao.py`. Meta: ≤ 10 min por vídeo, cronometrado ponta a ponta.

Regras, checklist e pontas soltas: `projetos/bonecos/serie-tiao-kit/KIT.md` (ler uma vez). Molde: `KIT.md` seção "Roteiro e ritmo" e `DOPAMINA_UNIVERSAL.md`.
Catálogo: `KIT/catalogo/` — `PERSONAGENS.md`, `vozes.json`, `CENARIOS.md`, `HISTORIAS.md` (estilos, formato de fala, durações, fila).
Kit = `projetos/bonecos/serie-tiao-kit/` (abaixo `KIT/`). Projeto = `projetos/bonecos/<data>-tiao-<slug>-NN/` (execução nova; roteiro sempre novo, só continuação herda contexto).
Erros e correções viram padrão: no `KIT.md` (Pontas soltas/Checklist) E no Second Brain (`04 - Projetos/Conteúdo/Estúdio de Vídeo/Estado e pendências.md`).

## (SUBSTITUÍDO pela seção V4 acima; só histórico) Agentes antigos (nunca produzir sozinho; molde v3 + dopamina, 16/11)
Regra do Filippe: o vídeo tem que dar vontade de assistir até o fim (gancho, retenção, dopamina). Quem faz sozinho, faz fraco. Cada etapa tem seu agente, com modelo explícito:
1. **`roteirista-bonecos`** (opus): roteiro no molde + Mapa de dopamina (segundo → fala → o que a TELA mostra → alavanca psicológica → piada). Fonte: `serie-tiao-kit/DOPAMINA_UNIVERSAL.md`, `MOLDE_V3.md`, `KIT.md` seção "Roteiro e ritmo".
2. **`critico-roteiro`** (opus): teste de 6 perguntas + checklist de dopamina; reprova com 1 "não". Uma rodada.
3. **`diretor-retencao`** (opus): lê roteiro + planilha de planos e diz onde a atenção cai, com a correção exata. Só depois disso gasta voz e render.
4. **Produção** (você orquestra; sonnet para som, edição mecânica e testes): voz → corte de silêncio → planilha de planos → motor (`planos.js`, `Pz.js`, props, contador) → render de 2 em 2 quadros → legenda do TEXTO DO ROTEIRO (`corrigir_legenda.py` + `legenda.py`), contador (`contador.py`).
5. **`revisor-bonecos`** (opus): UMA passada sobre as folhas do `checar.py` (nunca só a auditoria de texto) + `medir_dopamina.py` ≥ 8. `diretor-arte-bonecos` (sonnet) só quando nasce cenário novo.
Economia: subagente só para saída volumosa; auditoria por TEXTO antes de imagem; um render por vez; código do motor por grep.

## Passos
1. **Roteiro** (agentes 1–3). 50–75 s ≈ 150–210 palavras, ≥ 2,8 palavras/s. `falas.json`: `{"falas":[{"quem","texto","tom","pausa"}]}`; UMA voz conduz ~75%; 3–5 falas curtas de outros; gancho "Tião foi…"/"Eu fui…"; sem CTA. Gerar `roteiro.txt`.
2. **Vozes:** `node KIT/vozes_elenco.mjs <proj>/falas.json <proj>/voz` (1 chamada Gemini por personagem; 429 = próxima chave só então). Depois `python3 KIT/cortar_silencio.py` (alvo ≥ 2,8 palavras/s).
3. **STT:** `python3 ferramentas/stt.py <proj>/voz/dialogo.wav pt small > <proj>/palavras.json`. A LEGENDA usa o texto do roteiro: `python3 KIT/corrigir_legenda.py palavras.json falas.json palavras_roteiro.json` → `legenda.py`.
4. **Planilha de planos** `<proj>/PLANO.md` (formato do `KIT_INDEPENDENTE.md` seção 4): 1 linha por oração com a coluna "o que ACONTECE na tela". Teste: cubra a coluna "fala"; a história tem que continuar entendível. Tudo que a fala cita aparece em quantidade (50 armas = paredão com 50). Quem anda se desloca. Rosto sempre livre.
5. **Cena no motor** (`KIT/motor3d/LEIA.md`): `bash novo_ep.sh`, `story.js` com travelling (`cam.mv`), foco no ator, helpers do kit. Cenário/prop novo antes, 1 por vídeo no máximo.
6. **Auditoria (texto) + folha:** `cd <proj>/web && node render.mjs --auditar "0-<N-1>" 2`; renderizar 1 quadro por plano e olhar UMA folha. Agente 3 vê a folha antes do render completo.
7. **Som** (subagente sonnet, paralelo): `KIT/motor3d/audio/`, -14 a -15 LUFS.
8. **Render** (background, um por vez, de 2 em 2 quadros): `node render.mjs ../frames "0-<N-1>" 2 0.92`, montar com ffmpeg (`-framerate 15 ... fps=30`, `subtitles=`), x264 veryfast crf20.
9. **Final:** `python3 KIT/checar.py <proj> final` + `python3 KIT/medir_dopamina.py final.mp4` (≥ 8) → `revisor-bonecos` (uma passada). Reprovou: anota, corrige no kit, segue.
10. **Entrega:** `prontos/3D/Aventuras do Tião/<data>-<slug>.mp4` + cópia rclone `Drive1:Estudio de Video/3D/Aventuras do Tião/Prontos/` (0 diferenças). SÓ depois do OK do Filippe. Nunca publicar.
11. **Fechar:** RETRO (tempos, notas, régua), `KIT.md` regra nova de cada erro, `ESTADO.md`, Second Brain.

## Pronto =
MP4 em `prontos/3D/Aventuras do Tião/`, 50–75 s, aprovado pelo `revisor-bonecos` (média ≥ 8), gancho e final fixos, vozes por personagem, sem CTA, legenda palavra a palavra (opcional, configurada em legenda.py), -14 LUFS, auditoria sem corte/espetado, RETRO/ESTADO/Second Brain atualizados.
