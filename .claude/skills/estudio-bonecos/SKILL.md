---
name: estudio-bonecos
description: Produz e verifica Aventuras do Tião. Em pedidos de vídeo ou cena, Tião, Tiao, Tinhão e Tinhao acionam este perfil. Use para roteiro, personagem, animação, render e entrega da série.
---

# Aventuras do Tião (kit V6)

Leia `projetos/bonecos/serie-tiao-kit/CONTINUAR_AQUI.md`, `KIT.md` e `docs/tiao/PRODUCAO-V6.md`. Use o kit fixo e modele a função dos beats com referências conferidas. Cada episódio tem história, falas e encenação próprias.

1. **Roteiro.** Escolha um molde e itens do catálogo. 60–90 s com ação e pergunta concreta desde a abertura. Declare os beats e a prova visual de cada fala conforme o contrato V6. Rode `portao.py <proj> roteiro` antes da voz. Confira se os degraus pioram a situação, se a pista aparece e se o pagamento resolve a promessa.
2. **Prova.** Com tempos provisórios, confira abertura, pista, virada, pagamento e o gesto de maior risco. O plano contém o motivo de cada enquadre/corte. Rode a auditoria sem imagem e confira os quadros de risco e a lista NÃO PODE do KIT. Peça a revisão editorial antes da voz conforme o guia V6. Se reprovar, ajuste o trecho e mostre a prova corrigida.
3. **Voz e render.** `voz_fala.py` + `montar_dialogo.py` + STT bruto do diálogo em `voz/stt.json`. Ajuste o plano aos tempos reais, exporte `cenas.json` e valide com `portao.py <proj> prova`. Renderize com `TIAO_GPU=vulkan bash render_leve.sh <proj>` e monte com `montar_final.sh`. Um render por vez.
4. **Aceite.** `portao.py <proj> final` + `revisor-bonecos` com os critérios V6. Filippe aprova antes de `prontos/` e Drive1.

Cronometre do início ao MP4 revisado, com esperas. Bug de motor se corrige no kit com teste.
