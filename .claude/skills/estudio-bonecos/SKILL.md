---
name: estudio-bonecos
description: Produz e verifica Aventuras do Tião. Em pedidos de vídeo ou cena, Tião, Tiao, Tinhão e Tinhao acionam este perfil. Use para roteiro, personagem, animação, render e entrega da série.
---

# Aventuras do Tião (kit V6)

Leia `projetos/bonecos/serie-tiao-kit/CONTINUAR_AQUI.md` e `KIT.md`. **Kit fixo: o roteiro se adapta ao kit.** Não clonar vídeo, não criar cenário/personagem/gesto no meio do episódio. Referências só via `MOLDES_ROTEIRO.md`.

1. **Roteiro.** Escolha um molde e só itens do catálogo. 60–90 s, gancho "Tião foi…/E se o Tião…" no 0 s. Escreva `falas.json` e `plano.json` (cada plano com `cenario`, `luz`, `ini`, `fim`). Rode `portao.py <proj> roteiro`.
2. **Prova.** Auditoria sem imagem (`node render.mjs --auditar`) e uma folha pequena dos quadros de risco. Confira a lista NÃO PODE do KIT.
3. **Voz e render.** `voz_fala.py` + `montar_dialogo.py`; `TIAO_GPU=vulkan bash render_leve.sh <proj>`; `montar_final.sh`. Um render por vez.
4. **Aceite.** `portao.py <proj> final` + `revisor-bonecos` (uma passada). Filippe aprova antes de `prontos/` e Drive1.

Cronometre do início ao MP4 revisado, com esperas. Bug de motor se corrige no kit com teste.
