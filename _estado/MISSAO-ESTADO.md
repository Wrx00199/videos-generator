# Estado da missão (atualizar a cada etapa; continuar do primeiro [ ])
Criado 20/11/2026 ~04:55 BRT. Uso ao criar: 5h=3%, semanal=27%.
- [x] Fase 0: lock, repo Wrx00199/videos-generator (privado), .gitignore allowlist, README, push, limpar 2 linhas mortas do CLAUDE.md global
- [x] Fase 1a: diagnóstico Tião vs referência
- [x] Fase 1b: ficha de modelagem + revisor rígido + regras no KIT
- [x] Fase 1c (PARCIAL): Blender bloqueado→pendência; fallback = motor3d; registro de uso de cenários feito (catalogo/USO_CENARIOS.md)
- [x] Fase 1d: olheiro de bonecos (pendentes de aprovação)
- [ ] Fase 1b2 (PRIORIDADE, antes de mais episódios): skill `estudio-revisor-shorts` + calibração + atualizar revisor
- [ ] Fase 1e: até 4 episódios Tião aprovados pelo revisor (para-aprovar, sem postar)
- [ ] Fase 2: modelar 1–2 vídeos gringos de GTA 6 + gate de impacto
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
