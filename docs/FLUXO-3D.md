# Fluxo de vídeo 3D

## Perfis

`estudio-motion` atende projetos 3D gerais. Um perfil de série define elenco, linguagem visual e regras próprias. `CLAUDE.md` e `AGENTS.md` descrevem como escolher o perfil pela linguagem do pedido. A entrada do repositório reúne os fluxos compartilhados.

## Integrações selecionadas

| Fonte | O que entrou | Próximo teste ou uso |
| --- | --- | --- |
| [Awesome Claude Video Skills](https://github.com/zhuyansen/awesome-claude-video-skills/blob/93fc8b84/data/skills.json) | Catálogo de fontes por finalidade nesta página e na [auditoria](AUDITORIA-ESTUDIO-2026-11-22.md). Pesquise pelo problema, confira a licença da entrada e selecione peça avulsa. | Shorts e personagens no fluxo 3D. Mapas, explicadores e gráficos para motion. |
| [Digital Samba](https://github.com/digitalsamba/claude-code-video-toolkit/blob/5430de72/docs/agent-video-jobs.md) | Registro local `estado-render.json` no diretório de quadros. Tem PID, etapa, último sinal, quantidade de quadros e estado terminal. | Exibir esse estado no painel e retomar com verificação de versão dos insumos. Um processo encerrado à força pode deixar o último sinal desatualizado. |
| [Claude Animation Skills](https://github.com/artemnovitckii/claude-animation-skills/tree/86f70106) | Adaptação da ideia de folhas com área segura. `sheet.py <quadros> <folha.jpg> 4 --area-segura` marca a zona interna de revisão. | Testar mapa, gráfico ou peça low-poly em uma produção que peça esses elementos. |

As integrações acima adaptam práticas e ferramentas ao motor local. A licença de um componente deve ser conferida antes de importar código ou mídia de um projeto externo.

## Provas por lote

1. **Rosto e cabelo.** Frente e 3/4. Veja linha do cabelo, olhos, queixo, contraste e silhueta. A [folha de rostos](../_estado/prova-elenco-civil/folha-rostos.jpg) e a [folha com guias](../_estado/prova-elenco-civil/folha-area-segura.jpg) são a primeira amostra.
2. **Posição e mobiliário.** Inclua um quadro intencionalmente ruim para comprovar que a auditoria acusa. Acompanhe a trajetória completa quando um ator caminha perto do móvel.
3. **Animação e contato.** Capture começo, meio e fim do movimento. Compare mão e alça, pé e apoio, deslocamento, giro e continuidade entre cortes.
4. **Câmera e luz.** Confira abertura, virada e payoff no enquadramento vertical. Verifique se o objeto de interesse continua visível mesmo no plano mais escuro.

O [story da prova](../_estado/prova-elenco-civil/story.js) guarda entrada boa e defeitos deliberados. Ele usa a cópia de trabalho do motor gerada por `novo_ep.sh`. Os quadros 91 e 92 testam interseção com a mesa e giro extremo. Os quadros 93–96 isolam quatro retratos. Compare uma folha antes e depois por lote. A revisão final cobre o arquivo atual na qualidade de entrega.

## Movimento e contato

Use `andarRota` para indicar destino e número de passos de cada trecho. A passada acompanha a distância no cenário. Use `Pz.chapeuNaMao()` para prender o bicorne à mão e desativar o chapéu da cabeça. `Pz.sentar(progresso)` inclina o tronco e dobra joelhos ao longo da transição. Ajuste a cadeira para o quadril tocar o assento e o pé alcançar o chão. Confira o antes, o contato e a posição final. A [prova de movimento](../_estado/prova-movimento-3d/prova.mp4) reúne a rota de dez passos e três à esquerda, o chapéu e a cadeira.

Para outros objetos, `Pz.segurar` parte de uma pega afastada do tronco. Para apontar, passe `progresso` de 0 a 1 para levantar a mão em arco na direção do alvo. A cozinha fornece a posição e a direção da cadeira por `w.cen.lista.cozinha.assento(lado)`. Use essa direção ao chamar `Pz.sentar`. A [prova de contatos](../_estado/prova-contatos-3d/prova.mp4) mostra duas pegas, o gesto e a nova posição de sentar. O teste também verifica um mapa e as duas mãos.
