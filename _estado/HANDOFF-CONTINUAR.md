
## Worker krill-2 (21/11 12:50) — resultado honesto
- Item 0: NÃO precisou de código. O portão já lê projeto/fiel/final.mp4 (=v4, 83,8 s); confirmado por ffprobe + `portao.py "$EP" final`.
- Baseline portão no v4 (rodado agora): REPROVA em ritmo (2,15 pal/s < 2,5), áudio (5 silêncios > 0,4 s, máx 0,47), elenco (soldado_quepe/atirador/trincheira fora do aprovados.json), variedade (câmera cartao repetida 6-7; planos 2-4 mesmo cenário+luz), ficha (3 cenários < 9; plano.json sem beats). planos/duração/LUFS/formato OK.
- NADA foi editado nem renderizado. Motivo: todo item restante (A–F) exige edição do motor 3D + render de ~84 s + revisão visual; não consigo ler o % do limite semanal daqui, e fazer isso às cegas arrisca queimar limite sem prova. Retomar com chat que enxergue o /usage.
- Não cadastrei elenco (sem aprovação visual real) nem afrouxei o portão.
- Próximo passo sugerido: lote único (planos 25→17 via cenas.json/plano.json, silêncios ≤0,4 s via plano_fala, cenário/luz nos planos 2-4) → 1 render → portão + comparar_quadros.
