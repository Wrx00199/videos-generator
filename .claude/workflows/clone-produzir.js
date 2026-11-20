export const meta = {
  name: 'clone-produzir',
  description: 'Estúdio: voz, visual, montagem e portão independente (com 1 rodada de correção) dos roteiros aprovados',
  whenToUse: 'Depois que o Filippe aprovou os roteiros. args: {pastas:["projetos/..."]}',
  phases: [
    { title: 'Produzir', detail: 'produtor (sonnet): voz Fenrir consolidada, componentes e montagem local 720p' },
    { title: 'Portão', detail: 'revisor (opus) que não montou o vídeo' },
    { title: 'Correção', detail: '1 rodada: produtor aplica, revisor confere' },
  ],
}
const ESTUDIO = '/media/wr/HDD/Estudio de video'
const pastas = (args && args.pastas) || []
if (!pastas.length) throw new Error('args.pastas vazio')
const PROD = {
  type: 'object',
  properties: { pasta: { type: 'string' }, ok: { type: 'boolean' }, final: { type: 'string' }, duracao_s: { type: 'number' }, tempos_s: { type: 'object' },
    trocas: { type: 'array', items: { type: 'string' } }, erro: { type: 'string' } },
  required: ['ok', 'pasta'],
}
const PORTAO = {
  type: 'object',
  properties: { veredito: { type: 'string', enum: ['APROVADO', 'REPROVADO'] }, nota: { type: 'number' },
    fortes: { type: 'array', items: { type: 'string' } }, fracos: { type: 'array', items: { type: 'string' } },
    correcoes: { type: 'array', items: { type: 'string' } }, numeros: { type: 'string' }, tempo_s: { type: 'number' } },
  required: ['veredito', 'nota', 'correcoes'],
}
const produzir = (pasta, extra) => agent(
  `Você é o agente "produtor": leia e siga ${ESTUDIO}/.claude/agents/produtor.md.\nProjeto: ${ESTUDIO}/${pasta} (storyboard.md aprovado pelo Filippe).\n` +
  (extra ? `CORREÇÕES do revisor para aplicar (cada uma tempo — ação), depois renderizar de novo o final.mp4:\n${extra}\n` : 'Rode as etapas 6 a 8 da skill estudio-clone. ') +
  'Use clone.py voz/validar/montar (hooks técnicos obrigatórios), 720p padrão; preserve original e resultados anteriores. Correção usa nova tentativa/pasta, com análise e conteúdo próprios. Meça tempo ponta a ponta, sem omitir espera ou revisão. Devolva em tempos_s.',
  { label: `${extra ? 'corrige' : 'produz'}:${pasta.split('/').pop()}`, phase: extra ? 'Correção' : 'Produzir', model: 'sonnet', schema: PROD })
const revisar = (pasta, fase) => agent(
  `Você é o agente "revisor": leia e siga ${ESTUDIO}/.claude/agents/revisor.md. Você não montou este vídeo.\nProjeto: ${ESTUDIO}/${pasta}. Escreva portao.md e devolva o veredito.`,
  { label: `portão:${pasta.split('/').pop()}`, phase: fase, model: 'opus', schema: PORTAO })

const um = async (pasta) => {
  const p = await produzir(pasta)
  if (!p || !p.ok) return { pasta, produzir: p, erro: 'produção falhou' }
  let atual = p.pasta || pasta
  let r = await revisar(atual, 'Portão')
  let correcao = null
  if (r && Array.isArray(r.correcoes) && r.correcoes.length && (r.veredito === 'REPROVADO' || r.nota < 7)) {  // reprovou ou ficou fraco: 1 rodada
    correcao = await produzir(atual, r.correcoes.map((c) => '- ' + c).join('\n'))
    if (!correcao || !correcao.ok) return { pasta: atual, produzir: p, correcao, erro: 'correção falhou; não revisar arquivo antigo' }
    atual = correcao.pasta || atual
    r = await revisar(atual, 'Correção') || r
  }
  return { pasta: atual, produzir: p, correcao, portao: r }
}
const out = []
for (let i = 0; i < pastas.length; i += 1) {  // Um render por vez; fila de lote preserva RAM e previsibilidade.
  out.push(...await parallel(pastas.slice(i, i + 1).map((x) => () => um(x))))
}
log(out.filter(Boolean).map((o) => `${o.pasta}: ${o.portao ? o.portao.veredito + ' ' + o.portao.nota + '/10' : o.erro}`).join(' | '))
return out
