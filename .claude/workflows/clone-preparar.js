export const meta = {
  name: 'clone-preparar',
  description: 'Estúdio: desmonta referências e escreve ficha + roteiro (para o Filippe aprovar em lote)',
  whenToUse: 'Depois que o Filippe escolheu as referências. args: {projetos:[{pasta, url}]} (pasta relativa ao estúdio)',
  phases: [{ title: 'Roteiro', detail: 'roteirista (opus): baixar, rea-video, stt, medir, cartão, ficha, roteiro' }],
}
const ESTUDIO = '/media/wr/HDD/Estudio de video'
const itens = (args && args.projetos) || []
if (!itens.length) throw new Error('args.projetos vazio')
const RES = {
  type: 'object',
  properties: {
    pasta: { type: 'string' }, ok: { type: 'boolean' }, duracao_alvo_s: { type: 'number' }, beats: { type: 'number' },
    estilo: { type: 'string' }, usa_material_oficial: { type: 'boolean' }, riscos: { type: 'array', items: { type: 'string' } },
    tempos_s: { type: 'object' }, erro: { type: 'string' },
  },
  required: ['pasta', 'ok'],
}
phase('Roteiro')
// Uma análise por vez; neste PC, evitar CPU/swap disputando com render.
const out = []
for (let i = 0; i < itens.length; i += 1) {
  const lote = itens.slice(i, i + 1)
  const r = await parallel(lote.map((p) => () => agent(
    `Você é o agente "roteirista": leia e siga ${ESTUDIO}/.claude/agents/roteirista.md.\n` +
    `Slug solicitado: ${p.pasta} — referência: ${p.url || p.original}. Use clone.py iniciar em execução nova e devolva a PASTA REAL criada, nunca sobrescreva a pasta solicitada.\n` +
    `Rode as etapas 1 a 5 da skill estudio-clone, leitura de docs/contrato-timeline.md; não pular por existência. Análise enxuta como padrão; completo apenas se faltar evidência. Registre o início desde receber o original, inclusive download e modelagem. Meça o tempo de cada etapa em segundos (date +%s antes/depois) e devolva em tempos_s.`,
    { label: `roteiro:${p.pasta.split('/').pop()}`, phase: 'Roteiro', model: 'opus', schema: RES })))
  out.push(...r)
}
const ok = out.filter(Boolean)
log(`${ok.filter((r) => r.ok).length}/${itens.length} roteiros prontos — Filippe aprova antes do clone-produzir`)
return out
