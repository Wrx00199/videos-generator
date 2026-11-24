# Nexus Studio — regras (única fonte; nada de NUCLEO/regras/PROMPT)

Estúdio local de shorts verticais PT-BR do Filippe. Linux, Ryzen 3 3200G, RX 550, 8 GB.
Executar direto; perguntar só em dinheiro, login, postar ou apagar dados do usuário.

## Canais
- **Aventuras do Tião**: Tião = personagem 2D branco com barba cinza. Roupa, lugar e elenco mudam a cada episódio. Ele NÃO é cozinheiro fixo; nada de capitão/navio/Beto de episódios antigos. Público geral (não infantil), tom RicksClips.
- **SixStarsBR** (GTA 6, cortes de live): `estudio-lives` + `marca/identidade.json`.

## Tião: método (decidido 24/11)
- Motor: **2D cut-out rico** (HyperFrames). Blender e híbrido testados e REPROVADOS em 24/11 (roteiro e personagem pioram). 3D só se o Filippe pedir.
- **Biblioteca de ações** em `projetos/bonecos/acoes/`: cada ação (parado, andar, correr, apontar, pegar, atirar, levantar mãos, sentar, cair, susto…) tem folha de poses + teste próprio aprovado. Ação sem teste aprovado não entra em vídeo.
- **Roteiro amarrado**: cada frase da narração = 1 ação da biblioteca + 1 câmera (zoom, afastar, corte). Frase sem ação visível é reprovada pelo validador antes do render.
- Narração em 3ª pessoa: boca do personagem FECHADA. Boca só abre em fala dele.
- Voz: Gemini Fenrir via `ferramentas/voz.mjs` (chaves no .env, nunca mostrar).

## Execução
- Um render por vez. Cache em `~/.nexo/cache`. QA de preto/congelado/silêncio por ffmpeg, não por opinião.
- `prontos/` = só MP4 final. Intermediário de episódio é apagado depois de aprovado.
- Arquivo pesado/antigo vai pro Drive1 (rclone), não fica no HD.
- Erro criticado pelo Filippe vira 1 linha de checagem no validador, não parágrafo novo aqui.
