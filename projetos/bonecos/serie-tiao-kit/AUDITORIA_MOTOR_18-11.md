# Auditoria do motor 3D do Tião — 18/11/2026 (Task 4)

Marcação: [F] medido agora · [H] hipótese · [C] chamada minha.
Método: `aprovar_catalogo.py` renderiza 168 quadros de teste (15 cenários + 51 personagens × 3 variantes: olho aberto, olho fechado, sem pernas), roda `render.mjs --auditar` e compara pixels (olho = diferença aberto/fechado na cabeça; perna = diferença com/sem pernas). Um render por vez, `nice`/`ionice`, ~30 s no total. Resultado em `catalogo/aprovados.json`.

## Resultado
- Personagens: **50 de 51 aprovados** · Cenários: **14 de 15 aprovados** [F].
- Reprovados: `lucia` (design: topo da cabeça pelado, cabelo só nas laterais, lê como calva com faixa) e cenário `apocalipse` (placa PERIGO/QUARENTENA do portão tapa os bonecos na câmera `geral`).
- O teste automático acusou 4 falsos problemas, todos por design e liberados em `catalogo/revisao_visual.json`: `abobora` (olhos entalhados), `sombra` e `gosma` (sem perna de propósito), `magrelo` (sem rosto de propósito, não faz expressão: só serve de vilão mudo).
- **Nada estrutural no rig/motor**: nenhum ponto do rig reprova em vários personagens. Os defeitos do lote 14–28 vieram da camada de autoria (story.js escrito à mão), não do motor.

## O que causou o Tião sem olho (ep. 27) [F]
`eye: 'look'` não existe no rig: `eye()` (elenco.js) só desenha `dot | wide | happy | shut | smug | x`. Qualquer outro valor desenha **nada** (`grin`, `blink` e `wink` também). O lote usou `eye:'look'` **159 vezes** (22 só no ep. 27), então quase todo boneco genérico (Tião, Capitão, marujos, gnomo, gerente) saiu sem olho. O auditor de pose não acusa isso (ele mede só caixa e braço).
- Conserto já feito: **portão** `checar_olhos` reprova qualquer `eye:'look|grin|blink|wink'` em `web/story.js` (o ep. 27 reprova, 22 usos).
- **Conserto feito (18/11, a pedido do Filippe)**: `face()` do rig/elenco trata valor desconhecido como `dot` (com piscada). Verificado em render: Tião, palhaço e gerente ganham olho com `eye:'look'` (diferença 2.6–3.1 mil px vs olho fechado). Capitão deu 0 só porque o quadro de teste caiu numa piscada (t fixo 2,0 s); não reverificado. Backups `rig.js.bak_v4`, `elenco.js.bak_v4`. Os vídeos já renderizados continuam como estão (refazer do zero, decisão dele).

## Tião sem perna (ep. 27) [H, não reproduzido]
No harness o Tião aparece com as duas pernas e os dois pés em todas as variantes. Não achei `legs:0` no story do ep. 27. Hipótese: perna enterrada no chão do cemitério (offset de `chao`) ou boneco pequeno demais (no storyboard ele ocupa ~12% da altura e mal se vê perna). Não consegui confirmar; o portão não pega "perna escondida pelo cenário".

## Outros achados [F]
1. **`elenco.js` ≠ `rig.js`**: `bruto` (Campeão Brutus) e `gerente` (Gerente Valdemar) existem só no `elenco.js` (editado à mão). Rodar `gerar_elenco.sh` **apaga os dois**. Cuidado: apliquei a opção nova nos dois arquivos à mão em vez de regenerar. Conserto: levar `bruto` e `gerente` para o `rig.js` (esforço baixo, ~10 min).
2. **Relevo cinza do queixo** (adendo 2b): vem do degradê do rosto (`#a9b7c9`) + uma sombra de queixo (`rgba(30,40,70,.10)`) que só somem com `makeup`. Criei a opção do rig **`semRelevoQueixo: 1`** (rosto quente, sem sombra de queixo, sem ligar batom). Testei em Tião e Capitão: o queixo fica limpo. Padrão desligado, nada existente mudou. A Ruiva e a Lúcia já usam `makeup` e estão limpas; zorbina e bruxa leem como feminino pelo traço (cílios, batom, vestido/chapéu).
3. **Gigantes funcionam**: escala própria já gravada no catálogo (`escala`): gigante 1,85, bruto 1,65, monstro 1,6, magrelo 1,6, lobisomem 1,5, tudo cabe no quadro com a câmera calculada por escala.
4. **Elenco rival** (Ruiva, riv1, riv2, Coral): nenhum feio; riv1/riv2/coral2 são figurinhas genéricas parecidas entre si (só trocam chapéu e listra) [C: ok, mas pouca variedade].
5. Teste antigo `tests/test_tts_config.mjs` já falhava antes de mim (espera ordem de chaves legada). Não mexi.

## Limites desta auditoria (não verificado)
- "Rosto livre" (cabelo/prop em cima da cara) e "design feio" foram olhados por mim em folha reduzida, não são automáticos.
- A sombra de chão é um blob da cena, não do boneco; não testei "pé com sombra".
- Só testei pose parada de frente. Poses de ação (correr, gritar, braço pra cima) podem quebrar e o auditor só acusa braço/borda.
- O teste de oclusão do cenário (placa tapando bonecos) é visual; o portão ainda não detecta isso sozinho.

## Esforço de conserto dos reprovados
- `lucia`: acrescentar cabelo no topo (trait `hair` já existe, 'cabelo cai atrás'): ~15 min [H].
- `apocalipse`: câmera `geral` com `grade:false` ou portão deslocado: ~10 min + reteste [H].
- `bruto`/`gerente` no rig: ~10 min. `eye()` com aviso: ~10 min.

## Decisão que precisa do Filippe
Defeito estrutural? Minha leitura: **não**. É conserto pontual (4 itens acima), motor 3D se mantém. Se concordar, sigo para a Task 5 (banco de 8 câmeras) e deixo os consertos pequenos para depois ou já faço antes.
