# Histórias, estilos e formatos — banco vivo

> Histórico. A produção atual segue o [V7](../../../../docs/tiao/PRODUCAO-V7.md).

Fixos de todo episódio (molde v3, `KIT.md` seção "Roteiro e ritmo"): abre com "Tião foi…" (ou "Eu fui…") + ato/regra estranha com aposta, objeto-chave em movimento no quadro 0; fecha em corte seco ou callback da 1ª frase, sem CTA. Tema: viagem (cada episódio = 1 cenário do catálogo).
Cada episódio tem roteiro PRÓPRIO. Só herda contexto quando é **continuação** (Parte 2, minissérie) — aí o roteiro novo começa com 1 frase de "no episódio anterior".
Público: crianças e família. Humor de meme, bobo e rápido; **sem palavrão**, sem humilhação, sem violência real.

## Formato de fala (molde v3, 16/11)
- **Uma voz conduz ~75% do texto**: narrador de fora (Puck) ou o Tião em 1ª pessoa. Outros personagens: 3–5 falas curtas com a própria voz (`vozes_elenco.mjs`), de preferência o cético zombando.
- Fala de personagem = curta (≤ 10 palavras), soa falada, tem emoção marcada (`tom`).
- Grito importante ganha o efeito de **grito com vento** (`rajada()` + `vento` no ouvinte: chapéu voa/treme).
- Pelo menos 1 virada SÓ na imagem (narrador cala, a ação fala).
- **Fato real no fim (opcional, forte):** quando a história se apoia numa curiosidade verdadeira (a referência fecha com "marinheiros levavam óleo pra isso mesmo"), o narrador fecha com ela antes do fecho. Dá autenticidade e valor educativo (bom contra "conteúdo inautêntico"). Só fato conferido, nunca inventado.

## Estilos (alternar; nunca 2 iguais seguidos)
| estilo | como fica | som | exemplo |
|---|---|---|---|
| comédia/treta | mal-entendido, competição, castigo | pizzicato, boing | papagaio manda no navio |
| aventura | lugar novo, perigo, resgate | épico leve | tempestade nas Bermudas |
| mistério | quem fez? pista no 1º terço, revelação | caixinha de música, eco | quem rouba o queijo |
| tensão | relógio correndo, ameaça crescente | coração, grave | onda maior que o mastro |
| terror leve | lenda contada pelo Seu Bento, escuro, susto quebrado por piada | sussurro, trovão | navio fantasma que tem medo do Tião |
| desafio (Sr. Caramelo) | prova maluca com prêmio absurdo, eliminação | placar, plateia | último a sair do barril ganha um iate |

## Durações
- **Curto (padrão): 50–75 s, ≥ 2,8 palavras/s** → 150–210 palavras no total, sem ar morto. Mais tempo = mais um degrau da escada, não enrolação.
- **Longo (depois):** 5–10 min = minissérie colada (3–5 atos), feita só quando o curto estiver aprovado em série.
- Partes: episódio que termina em gancho ("Parte 2 amanhã") só se a Parte 2 já tiver roteiro.

## Lendas e lugares (aventura/mistério; folclore e mitos do mar, sempre desenho nosso)
Triângulo das Bermudas · Kraken (Seu Tentáculo) · Navio Fantasma · Mar dos Sargaços (navio preso em alga) · Ilha da Páscoa (cabeças de pedra que espirram) · Iara · Boto · Mapa do Tesouro Amaldiçoado · Farol que pisca sozinho · Baleia-ilha.

## Fila atual
Roteiros no molde v3: pasta `roteiros/` do kit (lote de 16/11) e banco de premissas no `CONTINUAR_AQUI.md`. A tabela abaixo é a fila ANTIGA (pré-molde): só serve como banco de ideias; cada uma teria de ser reescrita com gancho "Tião foi…" e passar no teste de 6 perguntas.

## Fila antiga (pré-molde v3)
| # | título | estilo | foco (coadjuvante) | virada | status |
|---|---|---|---|---|---|
| 0 | O último minuto (V5, em produção) | tensão/loop | Beto | a explosão começa no fogão do próprio Tião; loop 4.000 na porta | roteiro + plano prontos; vozes parciais |
| 1 | Tempestade nas Bermudas | tensão/aventura | Capitão | o "monstro" da neblina é o navio fantasma pedindo receita de sopa pra não ter medo | ideia (Filippe) |
| 2 | O desafio do Sr. Caramelo | desafio/comédia | Sr. Caramelo | Tião vence sem querer porque dormiu no barril | ideia |
| 3 | Quem roubou o queijo? | mistério | Zeca | Zeca sonâmbulo | banco RETRO |
| 4 | O medo do Capitão | comédia | Capitão | capitão que encara monstro foge de galinha | banco RETRO |
| 5 | A batalha do ronco | aventura | Capitã Ruiva | era sonho; canhão = ronco | roteiro pronto (06) |
| 6 | O papagaio capitão | treta | papagaio | todos obedecem o papagaio | banco RETRO |
| 7 | O farol que pisca | terror leve | Seu Bento | quem pisca é o Nico com lanterna, mas no fim o farol pisca sozinho (gancho p/ parte 2) | ideia |
