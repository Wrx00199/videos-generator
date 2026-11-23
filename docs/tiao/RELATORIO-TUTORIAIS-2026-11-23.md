# Tutoriais × Estúdio — 23/11/2026

Fontes: transcrições automáticas do YouTube.
1. Lufd9aG1_VA, "O Jeito Certo de Postar Shorts Feitos com IA" (até 4:10, antes da venda da comunidade).
2. OtbLL6OBNE4, "How to Make Viral Animated Shorts Using Claude". Skill grátis: github.com/mromidev/claude-animated-shorts, que já está em `referencias/2026-11-15-aiplaybook-stickman/`.
3. WTqUoZt4k8g, "You Will Never Make Shorts like RicksClips" (até 6:50, antes da venda de US$2).

## 1. Postagem e métricas (vídeo 1)
- O 1º quadro é a capa no feed: rosto enchendo a tela, já reagindo, com o título em cima. A retenção foi de 63,8 % para 82,2 %.
- Tirar o "se inscreve" do meio do vídeo, porque derrubava a curva. No fim, pedir um comentário de UMA palavra: 2 comentários viraram 2.800.
- Título: "E se" + quem + ideia, até 50 caracteres, uma palavra em MAIÚSCULA, sem hashtag.
- Capa de série fixa (mesmo fundo, 2 linhas, boneco em choque), enviada pelo Studio do PC. Ela aparece na aba Shorts, na busca e nos sugeridos.
- Descrição e tags em branco no Short de história (95 % das views vêm do feed). Preencher o "vídeo relacionado".
- Marcar "IA realista" só se houver pessoa ou lugar real alterado.
- Agendar sempre no mesmo horário.
- Depois de 48 h, olhar: % que continuou assistindo (meta 75 %), duração média e o segundo exato em que a curva cai. Esses números decidem o próximo vídeo.
- Teste do substituível: se o vídeo pudesse sair em outro canal sem ninguém notar, não serve.

## 2. Produção (vídeo 2)
- Medir 20 vídeos de referência a 30 fps com ferramenta (folha de contato, fase de câmera, brilho, saturação), e não pedir opinião. "Não dá pra recriar opinião, dá pra recriar número."
- Roteiro em fórmula única: paradoxo na 1ª frase, escalada em 3–4 degraus, quebra, "Felizmente… / Infelizmente…", "You see" + analogia do dia a dia, consequência e callback.
- Narrador ÚNICO, cerca de 3,7 palavras/s, sem silêncio.
- Fatos reais checados (a melhor piada saiu de um fato: rio de 2 pés).
- Câmera quase sem corte: 12 de 20 têm 0–1 corte. Ela desliza 18–40 quadros e faz um push-in lento constante.
- A luz acompanha a história: dia quente na montagem, azul noite na explicação.
- Toda a animação é cronometrada pela palavra (words.json). A reação cai 0–3 quadros antes da palavra.
- Quadros parados primeiro, render depois. Folha lado a lado com a referência e nota por área.
- Com vários agentes, cada um é dono dos próprios arquivos.

## 3. Originalidade (vídeo 3)
- A mesma ideia funciona; o mesmo vídeo fica invisível (cópias tiveram 12 views, a versão própria teve 11 mi).
- Os padrões do Ricks: título curto que abre uma pergunta, tema real com motivo escondido, personagens simples e fixos, sempre a mesma voz calma de narrador.
- Teste: sem som e sem nome, alguém reconhece que o vídeo é seu?

## Comparação com o Tião atual
| Tutorial | Tião hoje |
|---|---|
| Narrador único, contínuo | Diálogo com várias vozes e falas curtas soltas |
| Fato real com causa física visível | Premissa inventada ("chapéu lê pensamento") que o motor não consegue mostrar |
| Fórmula fixa de roteiro | Molde trocado 4× (V4→V7) |
| Câmera desliza, quase sem corte | `portao.py checar_variedade` REPROVA câmera repetida e exige ≥N câmeras e ambientes |
| Tempo da imagem preso à palavra | Encenação antes da voz, tempos provisórios, voz encaixada depois |
| Medição com número contra a referência | Pareceres de IA em JSON ("a frio") |
| Juiz final = métrica da postagem | Nenhum vídeo postado nem medido, nenhum dado de retenção |
| 1º quadro = rosto reagindo + título | Não está regrado |
| Fim = comentário de 1 palavra | Não existe |
| Capa de série fixa | Não existe para o Tinhão (identidade não confirmada) |

## Diagnóstico
Medimos o processo, não o público. A gente pega regras de vídeos de outros e transforma em portão, e o portão ficou contra a própria referência (força cortes). O roteiro é diálogo e não narração. E o ciclo nunca fecha com post + 48 h + curva.

## Novo estúdio (proposta)
Mantém:
- Motor 3D (`motor3d/`, que já deriva do repo mromi).
- `voz.mjs`/Fenrir, `stt.py`, `legenda.py`, `montar_final.sh`.
- QA técnico de arquivo (formato, volume, quadro preto ou congelado).
- O catálogo de personagens.

Corta ou arquiva:
- V4–V7 e `MOLDES_ROTEIRO`.
- `editorial.py`, pareceres a frio por IA e digest.
- `checar_variedade`, regras de nº de câmeras e cenários.
- Os 1.000 linhas do `portao.py`, reduzidas a ~100 de QA técnico.

Fluxo novo:
1. Tema: fato real ou "E se" com causa física visível, mais o teste do substituível.
2. Roteiro de narrador único na fórmula (gancho-paradoxo → escalada → quebra → "Sabe por quê?" → analogia → callback), 55–70 s, ~3,5 palavras/s. O Filippe aprova o texto.
3. Voz primeiro, depois words.json, e a animação presa às palavras.
4. Câmera deslizando, poucos cortes, luz seguindo a história, 1º quadro = Tião reagindo + título.
5. Quadros parados lado a lado com a referência (números), render e QA técnico.
6. Postar agendado com título ≤50, capa de série e CTA de 1 palavra.
7. Em 48 h: retenção, duração média e ponto de queda. O próximo vídeo muda o que caiu.
