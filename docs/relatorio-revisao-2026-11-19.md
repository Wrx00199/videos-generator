# Relatório de revisão — painel + bot de cortes (19/11/2026)

PC de teste: Ryzen 3 3200G (4 núcleos), 8 GB RAM, sem GPU útil. Medi com o Firefox aberto (consumindo ~75% de CPU durante o teste), então os tempos são de um PC "ocupado" — o cenário real de uso.

## 1. Tempos medidos (não estimados)

### Painel / APIs
| Função | Tempo |
|---|---|
| Varredura completa de lives (Twitch+Kick+YouTube, em paralelo) | 0,9 s |
| — só Twitch / só Kick / 1 busca YouTube | 0,37 s / 0,06 s / 0,53 s |
| Ao vivo (cache de 45 s) | 0,01 s |
| Revisão (25 clipes + `ps`) | 0,05 s |
| Placar, Meta, Contas, Saúde | ≤ 0,02 s |

O painel não é o gargalo. Custo de rede: ~4 MB/min (3 buscas do YouTube de 1,2 MB cada, a cada 60 s).

### Bot (1 segmento de 10 min, 1080p, 601 MB, live da Alanzoka)
| Etapa | Tempo |
|---|---|
| `achar.py` (picos de volume + whisper só ao redor) | 30 s (10 s de CPU) |
| `clipador.py --ver` (só achar candidatos, sem render) | 194 s |
| ↳ detecção de idioma por janelas de 4 s (151 janelas) | ~100 s |
| ↳ whisper tiny no segmento inteiro | ~100–118 s |
| Corte + whisper small (palavras) + checagens | 54 s |
| Render (2 versões: tiktok + ig, preset medium) de 22 s de vídeo | 98 s |
| **Total, 10 min de live → 1 clipe de 22 s** | **403 s (6,7 min)**, pico 1,3 GB RAM |

Capacidade hoje: ~2,5 minutos de live analisados por minuto de relógio → bate com o limite prático de 2 lives. (Conta feita a partir dos tempos acima; é por isso que o painel limita a 2 gravações.)

## 2. O que está errado ou desperdiçando

Ordem por impacto.

1. **Duas passadas de whisper no segmento inteiro** (idioma + transcrição) = ~210 s dos 403 s. O `achar.py` já acha os picos em 30 s; o clipador ignora isso e analisa tudo.
2. **Sempre renderiza a versão TikTok**, que está pausada: o ffmpeg gera 2 saídas em `preset medium`. Metade do custo de render é jogada fora.
3. **Câmera detectada e descartada**: `camera(trecho)` roda e na linha seguinte `rosto = None`. Só `W, H` são usados — dá pra pegar do `ffprobe`.
4. **Reencode extra do trecho** (`crf 14 veryfast`) antes do render final: uma geração de vídeo a mais.
5. **Dois caminhos de código com qualidade diferente**: `ao_vivo.py` (ao vivo) usa whisper `base` no segmento todo e o detector antigo; `clipador.py` (offline) tem filtro de idioma PT e de reação. O que sai de cada um não é igual.
6. **Falha de segurança no painel**: nenhum POST confere a origem. Testei: um POST com `Origin: evil.example` chegou na validação (HTTP 400 "link inválido"), não foi barrado. Qualquer site que você abrir poderia mandar o painel gravar uma live ou mudar `contas.json`/decisões.
7. **Buracos na gravação**: a cada segmento o `ao_vivo.py` chama `yt-dlp -g` de novo antes do próximo ffmpeg (alguns segundos sem gravar). Não medi o buraco; é hipótese pela leitura do código.
8. **41 GB em `clipper/trabalho`** (segmentos brutos, ~5 GB por live). Sem política de limpeza.
9. **Limite de 2 gravações vive só na memória** do servidor: reiniciar o painel zera a conta enquanto as gravações (desacopladas) continuam. E "gravando" no card é palpite por data de pasta (30 min).
10. **Windows (amigo)**: o painel usa `ps` e `loadavg`, que não existem lá. Resultado: sempre mostra "Robô parado" e CPU "–". Linux/Mac OK.
11. **Rede frágil**: Kick (API não oficial) e Twitch (Client-ID público do site) podem mudar sem aviso; hoje só aparece "✕ erro" na fonte.
12. Revisão relista as pastas a cada 4 s e `aoVivo` chama a mesma listagem a cada varredura: ok com 25 clipes, cresce linearmente.
13. Sem teste automatizado de nenhuma parte.

## 3. Correções e otimizações (com ganho esperado)

Estimativas são contas em cima dos tempos medidos; confirmar depois de aplicar.

| # | Mudança | Ganho esperado | Risco |
|---|---|---|---|
| A | **Picos primeiro**: rodar o `achar` (30 s), pegar os 2–3 melhores picos e fazer idioma+whisper só em ±40 s de cada | análise 218 s → ~45 s | médio: pode perder momento sem pico de volume; mitigar com 3 picos |
| B | **Parar de gerar a versão TikTok** (flag `--tiktok`, desligada) | render 98 s → ~55 s | nenhum |
| C | Render final em `veryfast` (qualidade quase igual a crf 20) | render −30–40% | baixo |
| D | Tirar `camera()` e pegar W/H do ffprobe | alguns segundos | nenhum |
| E | Trecho com `-c copy` + margem, filtro corta exato no render final | 1 encode a menos | baixo |
| F | **Origem/Host no painel**: recusar POST se `Origin` ≠ `http://127.0.0.1:PORTA` (e Host fora da lista) | fecha a falha 6 | nenhum |
| G | Contar gravações pelo `ps` (não pela memória) e marcar "gravando" por processo | fecha 9 | nenhum |
| H | Limpar segmento bruto após processar (já existe `--manter-gravacao`) + apagar `trabalho/` > 24 h | libera disco | baixo |
| I | Unificar `ao_vivo.py` para chamar o mesmo analisador do `clipador` | qualidade igual | médio (mexe no pipeline) |
| J | Painel: no Windows, usar `tasklist`/`wmic`; cache de 5 min nas buscas do YouTube | corrige 10, rede −60% | baixo |

**Efeito somado de A–E** num segmento de 10 min: ~403 s → ~135–175 s (a análise cai para 60–100 s, não 45 s como escrevi antes; corte+palavras ~35 s; render ~38 s).
**Capacidade corrigida** (conta por CPU, calibrada com o limite real de 2 lives de hoje): ~4–5 lives gravando vídeo. O "~13" que escrevi antes ignorava a disputa de CPU/RAM e está errado.
**Com áudio/rendição baixa + chat + buffer só nas quentes** (hipótese): ~20–30 lives vigiadas, 2–3 com vídeo em buffer. Banda economiza ~10–20× (Kick/YouTube só têm rendição baixa, não áudio puro; só a Twitch tem `audio_only`).

**Para ver dezenas de lives** (hipótese, exige teste): puxar só **áudio** (Twitch `audio_only`, ~50–100× menos banda que 1080p), medir pico/risada com ffmpeg, usar a velocidade do chat (`chat_kick.py` já existe) e só gravar vídeo (buffer de 90 s) nas 2–3 que dispararem. Gargalo passa de CPU de whisper para banda.

## 4. O que NÃO foi verificado
- Qualidade dos clipes depois de A–E (precisa comparar lado a lado).
- Buraco real entre segmentos (item 7).
- Tempo da `camera()` isolada.
- Comportamento sob 2 lives gravando + render ao mesmo tempo.
- Windows/Mac (só Linux).

## 5. Aplicado depois (mesmo dia) — medido no mesmo segmento
| Etapa | Antes | Depois |
|---|---|---|
| Análise (idioma + whisper) | ~218 s | 120 s (picos primeiro: escuta 235 s de 604 s) |
| Corte + palavras + checagens | 54 s | ~25 s (corte sem reencode, sem detectar câmera) |
| Render | 98 s (2 versões, medium) | 40 s (1 versão, veryfast, fundo desfocado em baixa resolução) |
| **Total do clipe** | **403 s** | **187 s** (2,2× mais rápido), RAM 1,3 → 0,96 GB |

Itens feitos: A, B (TikTok vira opção, não removido), C, D, E, F (Origin/Host), G (gravações pelo `ps`), H (`limpar.py`, simulação por padrão), J (CPU/processos multiplataforma, cache do YouTube), mais fundo desfocado leve e teste automatizado (`testes/smoke.mjs`, 7 testes passando).
Não feitos: I (unificar `ao_vivo.py` com `clipador.py`) e a fase 2 (áudio/chat/buffer).
Ressalvas: o modo rápido escolheu outro trecho que o completo (picos diferentes) — qualidade editorial dos trechos não foi comparada; o corte por copy começa até ~2 s antes do ponto escolhido; Windows não testado (processos via PowerShell não foram executados).

## 6. Relevância do clipe (feedback do Filippe: o clipe testado era fraco e antigo)
- O clipe do teste era de um segmento gravado em 18/11 (usado só para medir velocidade) e era papo de fim de live: escolhido por volume + reação (xingo/risada), que não prova que o momento presta.
- Mudanças: nota de relevância 0–100 (reação + assunto de jogo/ação + movimento da tela − fim de live/anúncio; sem assunto de jogo a nota nunca passa de 40), mínimo 45; picos só valem se o streamer fala PT ao redor (pico de áudio do jogo/NPC em inglês é descartado em ~4 s); 2ª rodada com mais picos se nada passar; `ao_vivo.py` agora usa o mesmo analisador do clipador (item I). A Revisão mostra nota e idade e ordena pelos melhores.
- A mesma frase que antes dava ~62 agora dá 0 (palavras de fim de dia: amanhã, dormir…); uma cena de perseguição com explosão simulada dá 76.
- Teste em lives de HOJE (Alanzoka e Bistecone, 8 min cada): nenhum trecho passou da nota mínima; cada segmento foi descartado em 75–110 s (antes: 187 s para fazer um clipe mesmo fraco). Não dá para concluir só com 8 min se o filtro está calibrado: um candidato de nota 41 apareceu numa execução e não na outra (variação do whisper).
- Próximo passo para calibrar: rodar 1–2 h em lives e comparar as notas com o que o Filippe aprova/recusa na Revisão (os motivos de recusa já ficam salvos).
