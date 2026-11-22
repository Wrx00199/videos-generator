# Prova de movimento e contato

Prova técnica de 8,5 s em 540×960, com 10 quadros renderizados por segundo. Trechos: caminhada de dez passos em direção à câmera e três à esquerda, Capitão apresentando o bicorne na mão, vizinha dobrando os joelhos e se acomodando na cadeira ajustada para a sua altura.

O script usa o motor do kit e o cenário da cozinha. Copie `story.js` para a pasta `web/` preparada por `novo_ep.sh`. O teste Node verifica posição e direção na virada, pose de chapéu e interpolação da perna. A auditoria final passou pelos 255 quadros. A folha mostra pontos da sequência renderizada. A primeira rodada revelou foco longe do Tião e espaço entre a mão e o chapéu. A segunda ajustou os dois pontos.
