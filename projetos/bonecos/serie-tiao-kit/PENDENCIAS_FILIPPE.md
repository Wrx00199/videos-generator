# PENDÊNCIAS DO FILIPPE — LEIA A CADA EPISÓDIO, marque [x] só com prova (arquivo/imagem)
- [ ] Modelar o esqueleto do Short J_qUwuh3_hw: gancho de curiosidade (ato estranho c/ propósito escondido) -> zombaria -> payoff genial; cenário lindo; terror não obrigatório (ver KIT.md 'DNA')
- [ ] Muitas cenas: cada beat = plano com ação visível; sumiço/evento em 3 tempos (push-in, ato, consequência); câmera nunca presa; coluna 'o que aparece' no storyboard e QA frase a frase
- [ ] QA de TODOS os planos antes do revisor (Tião voando/flutuando, borda cortada, legenda no rosto, objeto errado)
- [ ] Rodar critico-roteiro + diretor-retencao ANTES de voz/render
- [ ] Infográfico/HUD completo, barra pintada inteira (ep.34 saiu meio verde), componente reutilizável
- [ ] Contador temático (não 'HORA'); relevo em tudo; sem comida como tema; ninguém dentro de recipiente
- [ ] Erros bestas repetidos viram checagem automática no portão (via Codex)
- [ ] Refazer 34 (mostrar mansão/gorila/jato/rua e o sumiço) e 33 (suspense real); 35 no padrão novo
- [ ] Delegar mecânico ao Codex/Gemini; 1 melhoria mensurável por episódio (antes/depois no KIT)
- [ ] Drive só com episódio bom; Tião NÃO posta; 85% do limite = salvar estado e parar
- [ ] Pesquisar 10-15 refs de OUTROS canais (YT/IG/TikTok/X), escrever serie-tiao-kit/DNA_REFERENCIAS.md com padrões e links; modelar esqueleto de várias, nunca copiar a referência-exemplo citada
- [ ] Checagem automática no portão: todo personagem/evento/objeto citado nas falas aparece em algum plano (ep.33: 7 no roteiro, 4 na tela); cada frase tem imagem que a mostra (via Codex)
- [ ] Protagonista sempre Tião 2D; cenário lindo é prioridade; pode modelar mesma história com outras palavras; estudar TODAS as refs (cada vídeo = um canal)
- [ ] Usar skills e delegar mecânico ao Codex (Gemini opcional)

## Andamento (19/11, sessão Tião)
- HUD: removida a faixa de brilho de hud_saldo.py (era a "metade pintada"); barra uma cor só. Prova visual só no próximo render do HUD (ep. 36 no Drive ainda usa a versão antiga).
- Codex: checagem 'cobertura' no portao.py (falas ↔ story.js) — em andamento, log /tmp/codex_cobertura.log.
- Agente de pesquisa: DNA_REFERENCIAS.md (10-15 refs) — em andamento.
- KIT.md: DNA do Short do feijão gravado. 
- Regra de direção nova: 1 beat = 1 plano com ação; evento-chave em 3 tempos (push-in, ato, consequência); coluna "o que aparece" no storyboard.
- ATENÇÃO: ep. 35 e 36 já foram ao Drive ANTES dessas regras; ficam como "aguardando OK, abaixo do padrão novo".
- [x] Checagem automática de cobertura: serie-tiao-kit/cobertura.py <projeto> (falas ↔ story.js; exit 1 se citado não aparece / personagem nunca aparece / planos sem mudar câmera). Testada no ep. 36 (formato V5). Ep. 35 usa outro formato de T() → falso positivo; ainda NÃO integrada ao portao.py (Codex falhou: sem saída). RODAR manualmente antes do render dos próximos eps.
- [x] DNA_REFERENCIAS.md escrito (11 vídeos, 9 canais, só YouTube; TikTok/IG/X não coletados). 5 esqueletos prontos. Próximo roteiro DEVE usar um deles + crítico + retenção antes de voz/render.
- [ ] PRÓXIMO PASSO: roteiro novo no molde DNA (ato estranho+zombaria+payoff genial, cenário lindo), crítico+retenção, depois voz/render.

## ESTADO FINAL desta rodada (19/11) — ep. 37 "plano secreto" (cabeça de pedra de 20 t, maia)
- Pasta projetos/bonecos/2026-11-19-tiao-plano-secreto-37/: falas.json APROVADO no portão de roteiro (crítico aplicado: pedrinha, sem CTA longo, corte de palavras; retenção aplicada: "algo faz nhec", "Ele pega a concha", cortada a fala do porquê duplicado). Ainda NÃO vi 2ª revisão do crítico no texto final.
- NOTAS.md/MAPA_DOPAMINA.md são da versão antiga: o storyboard (story.js) deve seguir falas.json atual + RETENCAO.md (Q0 contra-plongée com a cabeça nítida ao fundo; sem rastro "3 m"; estilingue de brinquedo como falso palpite; gag do travesseiro de pedra 23-30 s; pausa 0,3 s depois de "Tec.").
- PRÓXIMO PASSO EXATO: (1) criar as peças do motor: cabeça de pedra que desliza (cenarios.js maia), pedrinhas em quantidade, lasca, escova, pedra quadrada, placa "20 T", contador temático (disco de pedra/sol descendo) e aprovar em etapa própria; (2) escrever web/story.js (T(n,...) 1 plano por fala, câmeras do banco); (3) rodar cobertura.py; (4) voz_ep.sh; (5) render_leve.sh; (6) montar_final.sh; (7) portao final, QA de todos os planos, revisor, Drive.
- cobertura.py já integrada ao portao.py (formato V5).
