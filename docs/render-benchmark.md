# Benchmark de render (HyperFrames 0.9.48, Linux)

PC: Ryzen 3 3200G, 8 GB, RX 550. Composição de teste: 1080x1920, 30 s, 2 vídeos (janela 16:9 + fundo
pré-desfocado), card com contorno, legenda palavra a palavra (13 grupos), logo, áudio. Teste em `_tmp/bench-render/`.

**Aviso: medidas CONTAMINADAS por carga.** Durante todo o teste o PC estava com load average ~10-13, Firefox,
apps Electron e 2-3 GB de swap em uso. Variação entre rodadas iguais passa de 2x. Use como ordem de grandeza.

| Config (cache de frames off) | Tempo | RAM pico (árvore) | Arquivo | Obs |
|---|---|---|---|---|
| 1080p draft, padrão (auto = 1 worker, modo baixa memória) | 154 s | 1,25 GB | 11,8 MB | |
| 1080p draft, 1 worker explícito | 149 s | 1,35 GB | 11,8 MB | melhor medido |
| 1080p draft, 2 workers | 208 s | 1,77 GB | 11,8 MB | pior: swap subiu para 3,3 GB |
| 1080p draft, 3 e 4 workers | não medido | | | cancelado por ordem do coordenador |
| 720p draft CPU (`--resolution 720p`) | 350 s | 1,29 GB | 6,6 MB | contaminado (carga) |
| 720p draft + `--gpu` | 204 s | 1,30 GB | 6,6 MB | arquivo idêntico: a flag não surtiu efeito (ver abaixo) |
| 1080p draft + `--gpu` | cancelado | | | |
| looks/delivery, camada fixa | não medido | | | |

Nota: baixa memória é auto-ligado em PCs <= 8 GB e já fixa 1 worker; `--no-low-memory-mode -w 2` piora.
Cada render gasta ~17 s só extraindo frames dos vídeos; reuso do cache ajuda quando a fonte repete.

## GPU (VAAPI)
- `h264_vaapi` funciona, mas só com `/usr/bin/ffmpeg`. O ffmpeg de `~/.local/bin` (o do PATH, usado pelo
  HyperFrames) aborta com `libva ... vaMapBuffer2`. Por isso o `--gpu` do HyperFrames não mudou nada.
- Teste isolado: 5 s re-encodados por vaapi em ~1 s. O gargalo do render é a captura de quadros no Chrome (CPU),
  não o encode; ganho de GPU esperado pequeno. Não medido de ponta a ponta.

## Qualidade
Quadro 540 px do 1080p draft (~2,9 Mbps): texto nítido, contorno limpo, sem serrilhado visível. Só esse foi
conferido; 720p não foi olhado.

## Camada fixa (card/legenda com alpha + composição no ffmpeg)
Não testada (parada pedida). Hipótese: compensa pouco, pois o custo é captura por quadro do Chrome, que a
legenda animada ainda exige; só tiraria a decodificação dos 2 vídeos.

## render.mjs
`node ferramentas/render.mjs <pasta> --saida final.mp4 [--res 720|1080] [--qualidade draft|looks|delivery] [--vaapi]`
Padrão: 1 worker, draft, cache off. `--vaapi` re-encoda pela GPU e cai em libx264. Não testado de ponta a ponta.
