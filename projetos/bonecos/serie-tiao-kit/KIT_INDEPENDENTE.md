# Kit do estilo Tião — independente de IA (16/11)

Serve para qualquer pessoa ou agente (Claude, Codex, Antigravity, o próprio Filippe) fazer vídeo no estilo "bonecos 2D em mundo 3D rico" SEM depender de achismo. Tudo aqui é regra escrita + medida por script. Referências guardadas em `referencias/` (índice: `referencias/INDICE_ESTILO_TIAO.md`).

## 1. O que a referência faz (visto nas folhas de quadros, não opinião)
Vídeo de referência de 65 s (ricksclips3000, 20+ milhões de views): cada 2 s é OUTRA imagem.
1. **O cenário é o astro.** Salão do trono, pátio com mil soldados, portão da cidade, colina no pôr do sol. Luz de cinema, profundidade, muito detalhe. O boneco é pequeno, "tempero".
2. **Objeto herói em close.** A jarra de bronze e o dragão dourado ocupam a tela inteira em vários planos. A história é sobre o OBJETO, não sobre o boneco falando.
3. **Lugar novo a cada poucos planos** (4–6 locais por vídeo) e o mesmo lugar volta com câmera diferente.
4. **Câmera nunca para**: dolly, órbita, subida. Nenhum plano estático.
5. **A imagem mostra o que a voz diz**, no mesmo segundo ("a jarra" = jarra na tela).
6. **O boneco é de 1 pose forte**: expressão grande (olho, boca, sobrancelha), não gesto de braço.

## 2. Por que os nossos ficam sem graça (medido)
- Ep. 13 (Lua): o mesmo pedaço de chão lilás + planeta em todos os 22 planos; a bandeira, a poeira e o foguete que o roteiro cita NÃO aparecem. Régua: 6,2/10.
- Ep. 10 (Apocalipse): 2 bonecos pequenos num fundo escuro com bolas de bokeh que parecem mancha. Régua: 4,7/10.
- Ep. 11 (Arena): bonecos parados, plateia chapada. A régua deu 9,7 por ENGANO (a plateia piscando conta como movimento); julgar por olho.
- Referências na régua: 9,1 a 9,7.

## 3. As 7 regras (tudo o que o vídeo precisa ter; o crítico e o revisor reprovam sem elas)
1. **Cada oração tem um EVENTO VISUAL** escrito na planilha de planos (coluna "o que acontece na tela"). Narrar sem mostrar é proibido.
2. **1 objeto herói** por vídeo, modelado grande, em close ≥ 3 vezes (antes, durante, depois/destruído).
3. **≥ 4 locais ou pontos de vista bem diferentes** (ex.: chão, céu, interior da nave, detalhe do objeto). Nunca 2 planos vizinhos com a mesma composição.
4. **Câmera sempre em movimento** (push, órbita, travelling junto de quem corre). Zero plano estático.
5. **Cenário com luz e profundidade**: primeiro plano, meio, fundo; névoa/poeira/partícula. Sem bolas translúcidas, sem faixa de cor chapada.
6. **Boneco com expressão grande e UMA ação por plano** (correr, apontar, cair, segurar). Dois bonecos "de pé conversando" em 2 planos seguidos = reprova.
7. **Consequência visível** ≥ 1,5 s depois do clímax (objeto destruído, trilha brilhando, comida servida).

## 4. Planilha de planos (o formato que obriga a mostrar)
Uma linha por oração. Sem preencher a coluna 4 e a 5, a linha não vale.
```
# | fala (resumo)        | local/ponto de vista     | o que ACONTECE na tela (evento)          | câmera (movimento)      | prop em quadro
1 | Tião foi pra Lua...  | chão, visão baixa        | bandeira vermelha cravada na poeira, sobe poeira | dolly lateral seguindo a bandeira | bandeira
2 | Para de gastar...    | astro de perto           | astro chuta a poeira e aponta pra fila de bandeiras | push no rosto        | bandeira ao fundo
```
Teste rápido: cubra a coluna "fala" e leia só a coluna 4. Se a história continua entendível, o vídeo MOSTRA. Se não, está só narrando.

## 5. Régua automática (sem IA): `serie-tiao-kit/medir_dopamina.py <video.mp4>`
Mede imagem nova a cada 2 s, movimento, cortes por minuto, pares quase iguais. Meta: nota ≥ 8. Roda em ~3 s.
Limite: mede MUDANÇA, não SENTIDO. Fundo piscando engana (ep. 11). Por isso vale junto com a regra 1 (planilha) e com olhar uma folha de quadros.

## 6. Ordem de trabalho (independe de quem faz)
1. Roteiro no molde v3 (`KIT.md`, seção Roteiro e ritmo) → passa nas 6 perguntas.
2. Planilha de planos (seção 4) → teste de cobrir a coluna "fala".
3. Garantir que objeto herói, cenário e efeitos da planilha EXISTEM no motor (render de 1 quadro de cada). Se não existem, criar antes (limite 1 por vídeo).
4. Voz → corte de silêncio → render de 2 em 2 quadros → legenda do TEXTO DO ROTEIRO (nunca do STT cru).
5. `medir_dopamina.py` ≥ 8 + olhar 1 folha de quadros + revisor independente (uma passada). Abaixo de 8: não entrega, anota o que faltou e corrige no kit.
