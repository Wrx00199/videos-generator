# Estado da missão (atualizar a cada etapa; continuar do primeiro [ ])
Criado 20/11/2026 ~04:55 BRT. Uso ao criar: 5h=3%, semanal=27%.
- [x] Fase 0: lock, repo Wrx00199/videos-generator (privado), .gitignore allowlist, README, push, limpar 2 linhas mortas do CLAUDE.md global
- [x] Fase 1a: diagnóstico Tião vs referência
- [x] Fase 1b: ficha de modelagem + revisor rígido + regras no KIT
- [x] Fase 1c (PARCIAL): Blender bloqueado→pendência; fallback = motor3d; registro de uso de cenários feito (catalogo/USO_CENARIOS.md)
- [x] Fase 1d: olheiro de bonecos (pendentes de aprovação)
- [x] Fase 1b2 (PRIORIDADE, antes de mais episódios): skill `estudio-revisor-shorts` + calibração + atualizar revisor
- [~] Fase 1e: ep.39 FEITO (PARA-APROVAR local, rev 6,57→ordens 1–7 aplicadas, portão ok, não subiu ao Drive). ep.38 FEITO (para-aprovar; rev2 7,75, ordens aplicadas, sem 3ª revisão). FALTA ep.39+ (ver PRÓXIMOS PASSOS abaixo)
- [~] Fase 2 (refs escolhidas em referencias/GTA6_GRINGOS_20-11.md; falta modelar/produzir 1–2 + gate de impacto do clipador): modelar 1–2 vídeos gringos de GTA 6 + gate de impacto
- [ ] Fase 3: painel multi-conta + visual preto/dourado/branco + 3 logos WR
- [ ] Fase 4: nichos, assets, README final, revisão de skills
- [ ] Fase 5: REVIEW GERAL (testes, bugs, economia de tokens e de PC, segredos, docs/REVIEW_GERAL.md)
## Decisões / medições / pendências p/ Filippe
- S1 início 04:5x: uso 5h=4%, sem=27%. Repo privado Wrx00199/videos-generator criado e pushado; .gitignore allowlist (venv, skill-clips .git aninhado e mídia fora). CLAUDE.md global limpo.
- 1c: Blender NÃO instalado (só flatpak disponível; ~1 GB de download de fora = não baixei sem OK). Medição adiada. Alternativa: variar cenários no motor3d existente (já 3D). PENDÊNCIA Filippe: autorizar `flatpak --user install flathub org.blender.Blender` p/ teste EEVEE na RX550.
- Diagnóstico: gap = 1 cenário/paleta única vs ~8 da ref; regra FICHA_MODELAGEM criada (docs/tiao/).
- 1b reforçada: portao.py final agora tem checar_ficha (FICHA.md completa, cenários>=max(3,0.8*ref), >=3 luzes no plano.json campo 'luz', HUD<90%). Testada sintético ok. Código do kit (sem .bak/mídia) agora versionado.
- Decisão 1e: referência = nzbk (ricksclips, ladrão que move móveis) ou feijão J_qUwuh3_hw, mapeando planos p/ cenários EXISTENTES (max 1 novo). NUNCA criar APROVADO_FILIPPE; `portao novo` trava (ep.37 sem aprovação) → criar projeto à mão com marcador PARA_APROVAR (missão noturna substitui etapa 2 de aprovação do roteiro).
- TODO antes do relatório: rodar pesquisar --mosaico e rever RioClips (rosto 2/3 pode ser falso positivo).
- Pacote CASA (sala/cozinha/quarto/fachada) criado e testado em stills (cenarios4.js, luzes casa_*), mapeia a ref nzbk. Próximo: FICHA + falas do ep.38 'ladrão de móveis' e storyboard.
- 20/11 ~06h: MISSAO-NOITE ganhou regras novas (subagentes max 2, filtro rígido olheiro, Fase 5 review, autonomia p/ ferramentas). Refs: lista ACEITOS_BONECOS (sem esperar aprovação). Blender continua NÃO instalado: autorização extra está só no arquivo (não em chat) e é download ~1GB → deixei como pendência Filippe. Ep.38 (casa assombrada): falas v2 pós-crítica passam portão roteiro; voz pronta (81 s); story.js em mãos do subagente opus.
- Ep.38: crítico (reprovou v1, aplicada reescrita), voz Gemini Fenrir/Puck narrador 81 s, story.js (subagente opus, 42 planos), plano.json passa ficha, som mix -14 LUFS; render completo iniciado 05:25 (render_leve). Próximo: montar, portão final, revisor-bonecos.
- Ep.38 v2: aplicadas ordens do revisor 1ª rodada (noite, câmera, props); portão final PASSOU; 2º revisor em curso (REVISAO2.md). 1ª nota 6,1.
- Ep.38 ENTREGUE como PARA-APROVAR: prontos/3D/Aventuras do Tião/38 - A Casa Assombrada (PARA-APROVAR).mp4. Revisor rígido: 1ª 6,1 → 2ª 7,75 (REPROVA por pouco); depois apliquei as 8 ordens + selo, portão final PASSOU, folha conferida por mim; SEM 3ª revisão (orçamento). Tempos: roteiro+crítico ~25 min, voz ~3 min, story.js (subagente) ~30 min c/ 2 rodadas, render 2,5 min, revisões ~5 min cada. Total ~2 h (meta 25 min não batida: gargalo = storyboard em código + correções).
- Regras novas a automatizar no portão (pendente): oclusão por plano, prop citado ≥15% da área e 100% dentro do quadro c/ margem 8%, verbo em quadro até fim da palavra, FICHA×story.js por beat.

## PRÓXIMOS PASSOS (sessão 1 parou ~06:15 BRT, 5h=~75%, sem=~38%; janela 5h reseta 08:50 BRT)
1. Ep.39 (Série B/E2 plano secreto): ref baixada em referencias/2026-11-20-bonecos-nico/DyJ3L6YI2oA/v.mp4 (+ transcrição pt .vtt) = 'Fala, Nico!' corrida pelo prédio mais alto (azul x vermelho, agulha de prata escondida). Ref é 3D rico: topo de obra com fita de medição/bandeirinhas azul/vermelha (infográfico de altura), mesa de desenho, skyline pôr-do-sol/noite, escritório, rua com relógio, jornal. Precisa PACOTE PREDIOS no motor3d (cenarios5.js: topo de obra, escritório/mesa, skyline) + régua de altura como HUD só onde a ref tem. Mapear planos→cenários (FICHA com Ambientes_ref), roteiro com crítico, depois fluxo igual ao ep.38 (voz_ep.sh, story.js, plano.json com luz, render_leve com TOTAL explícito '0-N', montar_final, portao final, revisor).
2. Aplicar no portão (pendente) as 4 checagens novas do revisor (oclusão, prop ≥15% e margem 8%, verbo em quadro, FICHA×story.js).
3. Fase 2: refs mapa VicePulse escolhidas MAS dependem de imagem de mapa (material não permitido/necessário a arte própria + fatos de tamanho de mapa não verificados) → impedimento registrado. Alternativas: Lugan3d '3D Los Santos before GTA VI' (modelável em motor) ou outra coleta (IG/X). Projeto aberto: projetos/gta6/2026-11-20-mapas-cabem-gta6-72558a17 (só iniciar+analisar, sem produzir).
4. Fase 3 painel (multi-conta, visual, logos WR), 4 nichos, 5 Review geral conforme MISSAO-NOITE.
5. Blender: pendente de OK do Filippe (flatpak org.blender.Blender ~1 GB).
Dicas operacionais: render_leve.sh exige TOTAL numérico → passar intervalo '0-<DUR*30>'; portao novo trava (ep.37 sem APROVADO_FILIPPE) → criar projeto à mão; cenas.json = [[ini,fim,'pNN']] derivado de plano.json; palavras para o mix = {'palavras': lista}; `find -newermt` não funciona neste ambiente (usar stat).
- S1 parou ~06:20

## PONTO DE RETOMADA (sobrescrever)
20/11 ~15:10, sessão s1c encerrando por contexto (>30%). FEITO nesta rodada: ep.38 (nota 7,4) e ep.39 (nota 6,6) no Drive1 com nota no nome; painel multi-conta na 7777 (Codex, 24 testes, conferido no navegador, commit 8ea17ae); 27 clipes GTA no Drive1:Estudio de Video/Gta 6; Blender 5.3 medido (docs/BLENDER_TESTE.md: EEVEE 7,4 s/quadro, Cycles CPU 47,7 s → só cenário estático/parallax); skill estudio-revisor-shorts v1.1 calibrada; acabamento de cor em config/filtros.json (embutido no montar_final).
PRÓXIMO: (1) bot de clipes de lives (calibrar nota mínima — sidecars de clipes aprovados/recusados NÃO guardam nota, então começar gravando nota+decisão; gate de áudio; teste real curto) e produzir clipes bons; (2) Tião de qualidade com cenário Blender estático (1 cenário em 3 camadas PNG + parallax no motor), SEM mais portões/checagens novas, ≤60 min/ep, ≤2 revisões, subir ao Drive com nota no nome; (3) Fase 4 nichos, Fase 5 review geral.
Ignorar: projetos/bonecos/2026-11-20-tiao-torre-mais-alta-39 (duplicado abandonado do ep.39; não renderizar nem apagar).
Troque de sessão com contexto >30%.
