---
name: estudio-bonecos
description: Produz e verifica Aventuras do Tião. Em pedidos de vídeo ou cena, Tião, Tiao, Tinhão e Tinhao acionam este perfil. Use para roteiro, personagem, animação, render e entrega da série.
---

# Aventuras do Tião

Leia primeiro o topo de `projetos/bonecos/serie-tiao-kit/CONTINUAR_AQUI.md` e os trechos pertinentes do kit. Use a referência para estudar gancho, escalada e virada. Crie premissa, falas, encenação, imagens e áudio próprios. Tião e seu chapéu são recorrentes. Coadjuvantes entram pela função na história. Em cenas comuns, prefira civis com traços distintos. Crie e teste um personagem quando o catálogo não servir. Capitão e tripulantes entram quando a história pede.

1. **Roteiro e plano.** Episódio publicável de 60–90 s. Escolha uma ação legível no começo. Escreva `falas.json`, `plano.json` e a ficha de modelagem da execução. Rode `portao.py <proj> roteiro`. Para iniciar um projeto, use `portao.py novo <slug>`, com `ESTUDIO_RAIZ` se o checkout só tiver código. Mostre o storyboard ao Filippe.
2. **Prova visual.** Renderize uma folha pequena com os instantes de risco: ação, contato, entrada/saída, maior sobreposição e payoff. Veja o quadro real. Confira rosto e chapéu, pés no chão, mãos no objeto, distância dos móveis, silhueta, contraste e continuidade. Veja alguns quadros seguidos para provar o deslocamento e o ritmo. O cartão 2D usa frente, perfil desenhado ou pose em 3/4. Uma volta completa exige rig volumétrico ou troca de poses por corte. Ajuste o trecho e repita a prova antes do render longo.
3. **Voz e montagem.** Use vozes de catálogo e confira o texto por fala, sem cortar pelo silêncio do meio. Se o Gemini falhar, registre o erro real. Renderize um trabalho por vez com `render_leve.sh`. Faça correções parciais quando possível. Preserve os arquivos originais e o trabalho em andamento.
4. **Validação e aceite.** Rode `portao.py <proj> final`. O `revisor-bonecos` lê a folha e a prova atual em uma revisão independente. Guarde o resultado e peça aprovação ao Filippe antes de promover para `prontos/`. `APROVADO_FILIPPE` e `REJEITADO_FILIPPE` encerram pendência de fila. Publicação e sincronização dependem da autorização correspondente.

**Economia.** Atue no episódio e versão indicados. Use só os arquivos pertinentes e uma folha por rodada. Consulte revisões passadas se comprovarem a causa. Cronometre roteiro, prova, voz, render e montagem, com o total incluindo espera e retrabalho. Prévia reduzida mede a prévia. A velocidade de produção se mede em um episódio de 60 s ou mais na qualidade de entrega. Registre evidências e pendências no handoff existente.

**Lotes de regressão.** Teste uma família de cada vez: rosto/cabelo, posição e mobiliário, animação e contato, câmera e luz. Valide retratos femininos com o traço `feminina: true` no rig, que desativa a faixa cinza e o reflexo inferior de queixo. Confira topo do cabelo em frente e 3/4. Registre o caso testado e a imagem de prova antes de passar para o próximo lote.

**Movimento.** Use `andarRota` para trajeto com viradas e passos contados. Confira a posição do ator no cenário além da pose de cada passada. Para o bicorne na mão, use `Pz.chapeuNaMao()` e confira o ponto de pega. Para sentar, use `Pz.sentar(progresso)` e confira joelhos, apoio no assento e pés. Veja o trecho em andamento, além dos quadros parados.
