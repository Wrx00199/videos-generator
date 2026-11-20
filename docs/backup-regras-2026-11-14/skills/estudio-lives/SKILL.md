---
name: estudio-lives
description: Recorta momentos de lives de streamers jogando GTA 6 (Davy Jones, Kai Cenat, Speed, Coringa, Yuri22, Bistecone) em shorts verticais PT-BR com gancho tipo "Olha o que o Davy Jones achou no GTA 6". Usar para "corta a live de X", "acha os melhores momentos".
---

# Estúdio · Lives  (ESBOÇO — ainda não testado; construir no projeto novo)

1. Baixar VOD (`yt-dlp`, Twitch/YouTube/Kick) só áudio primeiro: `-f ba -o live.m4a`.
2. Picos: chat (`chat-downloader` → mensagens/min, risadas "KKKK", "LMAO", clips) + áudio (ffmpeg `astats` volume por 1 s).
   Candidato = pico de chat E de áudio no mesmo minuto.
3. Baixar só os trechos candidatos (`yt-dlp --download-sections "*HH:MM:SS-HH:MM:SS"`), 30–60 s cada.
4. Vertical: rosto da facecam em cima + gameplay embaixo (ou crop central) — ffmpeg.
5. Fala em inglês: legenda PT-BR queimada (nunca deixar sem tradução); fala em PT: legenda palavra a palavra (`ferramentas/stt.py`).
6. Gancho de texto nos 2 s iniciais + logo `marca/`. Portão igual ao `estudio-clone`. Creditar o streamer na descrição.
