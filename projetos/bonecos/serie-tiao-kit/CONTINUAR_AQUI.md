# Série Tião — CONTINUAR AQUI (V6, 23/11/2026)

Para qualquer agente (Claude, Codex). Responda ao Filippe em PT-BR, curto (ele lê no celular). Nunca publique; nunca mostre chave; um render por vez.

## Como funciona agora
- **Kit fixo:** `KIT.md` (cenários, personagens, gestos, NÃO PODE). O roteiro se adapta ao kit.
- **Moldes de roteiro:** `MOLDES_ROTEIRO.md` (+ `referencias_moldes.csv`). Não clonar vídeo.
- **Gestos aprovados:** banco em `_estado/banco-animacoes/` (`folha_v6.jpg`). Gesto novo só por rodada de kit + OK do Filippe.
- **Erros proibidos com print:** `docs/tiao/nao-pode/`.
- **Testes:** `python3 -m unittest discover -s tests -p 'test_*.py'` e `node --test tests/*.mjs` (aqui no kit).

## Estado
- 23/11: faxina (docs velhos, .bak → `Drive1:Estudio de Video/Arquivo/`), banco V6 (sentar de frente, chapéu animado, apontar sem cruzar).
- Vídeos antigos (eps. 1–41) foram apagados do Drive; as pastas de projeto antigas em `projetos/bonecos/20*` ficam só como consulta.
- Piloto V6: ver seção "Piloto" abaixo quando existir.

## Regras que não mudam
Tião único branco, chapéu de chef; vozes fixas `catalogo/vozes.json`; um render por vez (Ryzen 3 3200G, RX 550, 8 GB; `TIAO_GPU=vulkan`); correção vai no kit com teste; entrega só com OK do Filippe.
