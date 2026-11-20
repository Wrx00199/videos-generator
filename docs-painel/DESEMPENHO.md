# Desempenho: o que foi medido (Ryzen 3 3200G, RX 550 2 GB, 8 GB RAM, Linux)

Medidas com a máquina quieta, salvo indicação. Segmento de 8–10 min de live, 1 clipe.

## Onde o tempo vai (análise de 8 min, perfil equilibrado, antes da otimização do idioma)
- Ler áudio + achar picos + checar fala PT dos picos: ~3 s
- **Detecção de idioma por janela de 4 s: ~42 s (66 chamadas × 0,64 s)** ← maior parte
- Transcrição whisper tiny (240 s de áudio): ~8 s
- Corte + palavras (whisper small no clipe) + checagens: ~25 s
- Render (28 s de vídeo, veryfast): ~40 s

## O que foi feito
1. **Picos primeiro** (escuta só ±45 s dos 3 maiores picos, e só se o streamer falar PT ao redor): análise 218 s → ~65 s.
2. **Idioma híbrido** (padrão): sem texto transcrito = sem fala; texto com 3+ palavras comuns de PT = PT; só o ambíguo passa pelo detector. Análise 65 s → ~33 s em teste; nos 4 segmentos testados os candidatos principais coincidiram na maioria (não há "gabarito": a calibração real virá do que você aprova/recusa na Revisão). `--completo`/perfil `qualidade` mantêm o detector em todas as janelas.
3. Sem versão TikTok por padrão, render `veryfast`, corte sem reencode, sem detecção de câmera inútil: render 98 s → ~40 s.
4. Perfis `qualidade` / `equilibrado` / `leve` (automático pelo hardware). `leve`: ~40% menos CPU; com 1 núcleo ainda sai clipe em ~2,4 min.

## Ideias testadas e descartadas
- **GPU RX 550 (Vulkan) no whisper.cpp (tiny):** 240 s de áudio em 5,2–7,6 s vs 7,3–7,8 s na CPU (faster-whisper int8) → só ~1–1,4× mais rápido no relógio, porém usa ~4× menos CPU (4,7 s vs 17–18 s). Como a transcrição é só ~8 s do total e a detecção de idioma teria que ser reescrita, **não compensa integrar** agora. Útil só para liberar CPU quando se vigia várias lives. Placa NVIDIA (CUDA/NVENC) não foi testada.
- **GPU para render (VAAPI):** a mistura (GPU decodifica/codifica, CPU filtra) fica ~35% mais lenta no relógio e só poupa ~22% de CPU; tudo na GPU fica mais lenta ainda.
- **Modelo maior:** base é 3,4× e small 5× mais lentos que tiny, sem achar mais termos de jogo.
- **Detector de pico alternativo** (faixa da voz, base de 5 min da skill): precisão equivalente (~52–59%), velocidade irrelevante (<0,2 s).
- **Idioma só por texto:** concordância de 76% com o detector real — por isso o híbrido mantém o detector nos casos ambíguos.

## Custo em IA
O pipeline (painel, `ao_vivo.py`, `vod.py`, `clipador.py`) **não chama nenhuma IA/API paga**: é ffmpeg + yt-dlp + whisper local. Gerar cortes não gasta tokens nem limite de assinatura; gasta só CPU, disco e tempo.

## Limitações conhecidas
- Detecção de momentos só para lives em **português** (whisper `pt`, regex de reação em PT). Inglês exigiria idioma parametrizado, regex em inglês e um jeito de separar a voz do streamer do áudio do jogo (NPCs falam inglês).
- Windows: ajustado (caminhos no ffmpeg, instalador, processos via PowerShell), **mas não testado**.
