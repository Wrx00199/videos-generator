---
name: estudio-bonecos
description: Produz e verifica Aventuras do Tião (Nexo V8). Em pedidos de vídeo ou cena, Tião, Tiao, Tinhão e Tinhao acionam este perfil.
---

# Aventuras do Tião — Nexo V8 (estilo RicksClips)

## Identidade fixa (NUNCA violar)
- **Tião:** rosto branco + **barba cinza característica** (`barbaCinza: 1`), **100% livre de roupa, profissão e cenário**.
- **Variantes prontas no `rig.js`:** `tiao_base`, `tiao_jaqueta`, `tiao_terno`, `tiao_soldado`, `tiao_astro`.
- **PROIBIDO:** usar o `tiao` cozinheiro legado ou reciclar tripulação do navio (`cap`, `mar1`, `mar2`, `ruiva`, `barbacoral`, `tonho`, `dede`, `chiquinha`) fora de histórias náuticas.
- **Tom:** público geral (7 a 70 anos), histórias inteligentes/curiosas estilo `@RicksClips3000`. **Nunca infantil.**

## Regra 1:1 (Narração = Ação Física na Tela)
- Toda frase narrada precisa ter **ação física correspondente na tela** (`andar`, `correr`, `apontar`, `susto`, `recuar`, `comemorar`, `pensar`, `falar`, `segurar`, `disparar`) + **enquadramento/zoom motivado** (`estab`, `medio`, `close`, `punch_in`, `zoom_out`, `dramatico`, `tremor`).
- Proibido boneco estátua por beat inteiro ou câmera repetida 3x seguidas.

## Comando único de produção
```bash
python3 projetos/bonecos/serie-tiao-kit/diretor_tiao.py <episodio.json> --rapido
```
- Valida o JSON antes de gastar cota ou GPU.
- Gera vozes limpas no Gemini TTS (`Fenrir`, velocidade natural — sem `atempo` robótico), legenda sincronizada (máx 3 palavras, margem segura), render no `motor3d` (`TIAO_GPU=vulkan`) e MP4 final `-14 LUFS`.
- Um render por vez. Publicação só com aprovação do Filippe.
