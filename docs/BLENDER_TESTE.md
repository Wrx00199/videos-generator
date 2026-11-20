# Teste Blender (20/11, Blender 5.3 flatpak, RX550 + Ryzen 3 3200G, 8 GB)
Cena simples (plano + 12 cubos + 1 luz, 1080x1920, 1 quadro), `flatpak run ... blender -b`:
- EEVEE (16 amostras): 7,4 s/quadro (12,5 s com start do Blender).
- Cycles CPU (24 amostras): 47,7 s/quadro.
RAM do Blender não medida direto (o /usr/bin/time mede o wrapper do flatpak); RAM livre do PC ficou ≥4 GB disponível durante o teste.
Conclusão: viável para CENÁRIOS ESTÁTICOS/parallax em camadas (renderizar poucos quadros por cenário e reaproveitar em vários episódios), NÃO para animar o vídeo inteiro por quadro (80 s × 30 fps × 7 s = horas). Cenário real tem mais malha/luz: esperar 2–4× o tempo. Próximo passo: 1 cenário do Tião (ex. sala) modelado em Blender, 3 camadas PNG com alpha (fundo/meio/frente) + câmera parallax no motor 2D.
Scripts: /tmp só (descartável).
