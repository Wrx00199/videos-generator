---
name: estudio-lives
description: "(Esboço: testar cada passo antes de lote.) Recorta momentos de lives de streamers jogando GTA 6 (Davy Jones, Kai Cenat, Speed, Coringa, Yuri22, Bistecone) em shorts verticais PT-BR com gancho tipo \"Olha o que o Davy Jones achou no GTA 6\". Usar para \"corta a live de X\", \"acha os melhores momentos\"."
---

# Estúdio · Lives  (ESBOÇO — ainda não testado; construir no projeto novo)

Frente separada do clonador sem rosto. Aqui “clipe” é recorte de streamer; não b-roll. Só usar quando o pedido for corte de live. Inglês no clone narrado sempre vira narração PT-BR; a exceção abaixo vale só para lives. Cada execução é nova, sem reciclar análise/voz/edição de outros vídeos. Identidade vem de `marca/identidade.json`, com nick, logo e capa separada do Jason; sem intro.

1. Baixar VOD (`yt-dlp`, Twitch/YouTube/Kick) só áudio primeiro: `-f ba -o live.m4a`.
2. Picos: chat (`chat-downloader` → mensagens/min, risadas "KKKK", "LMAO", clips) + áudio (ffmpeg `astats` volume por 1 s).
   Candidato = pico de chat E de áudio no mesmo minuto.
3. Baixar só os trechos candidatos (`yt-dlp --download-sections "*HH:MM:SS-HH:MM:SS"`), 30–60 s cada.
4. Vertical: rosto da facecam em cima + gameplay embaixo (ou crop central) — ffmpeg.
5. Fala em inglês (streamer gringo): fica o áudio original do streamer, com legenda PT-BR queimada em toda fala (decisão do Filippe, 14/11); fala em PT: legenda palavra a palavra (`ferramentas/stt.py`).
6. Gancho de texto nos 2 s iniciais + logo `marca/`. Portão: itens 1, 3, 4 e 6 do `estudio-clone`, mais volume sem clipping (a regra de "sem inglês" do clone não vale aqui). Creditar o streamer na descrição.

## Legenda do post (ordem do Filippe, 19/11 — vale sobre qualquer regra anterior)
- NÃO creditar o streamer na legenda. Sem "Crédito:".
- Legenda curta, zoeira, humana, meio idiota, como amigo comentando ("Bistecone tomou o susto da cobra", "Bistecone pegou na cobra"). Nada de frase genérica de página de cortes.
- Hashtags: #gta6 #gtavi + nome do streamer (máx. 3-4). NUNCA #engracado, #cortes ou similares.

## LEGENDA FIXA DO META (ordem do Filippe, 19/11 tarde — vale sobre as legendas casuais para IG/FB)
- TODO post no Meta (IG/FB @six_starsbr) usa SEMPRE a legenda exata de `marca/legenda-meta.txt`, sem mudar nada, sem hashtag extra. TikTok: legenda ainda a definir pelo Filippe (manter casual curta até ele mandar).

## LEGENDA FIXA DO TIKTOK (ordem do Filippe, 19/11 tarde — substitui a legenda casual no TikTok)
- TODO post no TikTok (wrx00_) usa SEMPRE a legenda exata de `marca/legenda-tiktok.txt`: `GTA 6 #gta6 #fyp #gta #rockstargames`. Sem mudar nada.
