from pathlib import Path
p=Path('ferramentas/painel/servidor.mjs')
s=p.read_text().replace("import os from 'node:os';", "import os from 'node:os';\nimport crypto from 'node:crypto';")
s=s.replace("const RAIZ = path.resolve(AQUI, '..', '..');", "const RAIZ = process.env.PAINEL_RAIZ_DADOS ? path.resolve(process.env.PAINEL_RAIZ_DADOS) : path.resolve(AQUI, '..', '..');\nconst DADOS = process.env.PAINEL_RAIZ_DADOS ? path.join(RAIZ, 'painel-dados') : path.join(AQUI, 'dados');")
s=s.replace("const DECISOES = path.join(ESTADO, 'painel-decisoes.json');", "const DECISOES = path.join(DADOS, 'decisoes.json');")
a=s.index('const contas = () =>');b=s.index('\nconst streamersCfg',a)
s=s[:a]+'''const contas = () => { const c = contasCfg().find(c=>c.id==='six_stars') || contasCfg()[0]; return {...CONTAS_PAD, meta:{...CONTAS_PAD.meta, pagina:c?.nome||'', instagram:c?.plataformas.find(p=>p.rede==='instagram')?.handle||'', legenda_modelo:c?.legenda_modelo||'',horarios:c?.horarios||[]},tiktok:{...CONTAS_PAD.tiktok,ativo:!!c?.plataformas.find(p=>p.rede==='tiktok')?.ligado}}; };'''+s[b:]
s=s.replace("function gravarJson(f, obj) { fs.mkdirSync", "function gravarJson(f, obj) { if (!f.startsWith(DADOS + path.sep) && f !== path.join(CONFIG,'contas.json')) throw new Error('Gravação fora do escopo do painel bloqueada'); fs.mkdirSync")
s=s.replace("fs.mkdirSync(ESTADO, { recursive: true });", "fs.mkdirSync(DADOS, { recursive: true });")
s=s.replace("disco_livre_gb: discoLivreGb(),", "disco_livre_gb: discoLivreGb(), gpus: gpus(),")
s=s.replace("return { checks, pc:", "return { checks, chaves: chaves(), bots: statusBots(), pc:")
s=s.replace("http.createServer(async (req, res) => {", "export async function atender(req, res) {")
s=s.replace("const hostsOk = [`127.0.0.1:${PORTA}`, `localhost:${PORTA}`]; const origem = req.headers.origin;", "const hostsOk = [`127.0.0.1:${PORTA}`, `localhost:${PORTA}`, ...(rede.ligado ? ipsLAN().map(ip=>`${ip}:${PORTA}`) : [])]; const origem = req.headers.origin;")
s=s.replace("!hostsOk.map((h) => `http://${h}`).includes(origem)", "origem !== `http://${req.headers.host}`")
s=s.replace("  try {\n    if (u.pathname === '/')", """  try {
    const local = ['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
    if (!local && (!rede.ligado || !autenticado(req))) { res.writeHead(401, {'WWW-Authenticate':'Basic realm="Painel WR", charset="UTF-8"'}); return res.end('Senha do painel necessária'); }
    const nova = await rotasNovas(req,res,u,local); if (nova) return;
    if (req.method === 'POST' && ['/api/marca','/api/marca/arquivo','/api/contas','/api/streamers','/api/desempenho','/api/meta/status'].includes(u.pathname)) return json(res,409,{erro:'Configuração antiga somente leitura. Use Configurações de contas.'});
    if (u.pathname === '/')""")
s=s.replace("if (u.pathname === '/api/revisao') { const r = listarRevisao();", "if (u.pathname === '/api/revisao') { const c=contaDaUrl(u); const r = revisaoConta(c);")
s=s.replace("if (u.pathname === '/api/placar') return json(res, 200, placar());", "if (u.pathname === '/api/placar') return json(res, 200, placarConta(contaDaUrl(u)));")
a=s.index("    if (u.pathname === '/api/decidir'");b=s.index("    if (u.pathname === '/api/gravar'",a)
s=s[:a]+'''    if (u.pathname === '/api/decidir' && req.method === 'POST') {
      const b=await corpo(req); if(!['aprovado','recusado','desfazer'].includes(b.estado)) return json(res,400,{erro:'estado'});
      const c=acharConta(b.conta || 'six_stars'); const it=revisaoConta(c).itens.find(i=>i.id===b.id); if(!it) return json(res,404,{erro:'Vídeo não pertence à conta'});
      salvarDecisao(it.id,b.estado==='desfazer'?null:{estado:b.estado,motivo:String(b.motivo||'').slice(0,200),legenda:it.legenda,conta:c.id,ts:Date.now()});
      return json(res,200,{ok:true,legenda:it.legenda});
    }
'''+s[b:]
s=s.replace("} catch (e) { json(res, 500, { erro: String(e.message || e) }); }", "} catch (e) { json(res, e.status || (e instanceof SyntaxError ? 400 : 500), { erro: e.status || e instanceof SyntaxError ? e.message : 'Falha interna do painel' }); }")
a=s.index("}).listen(PORTA")
s=s[:a]+'''}
if (process.env.PAINEL_SEM_LISTEN !== '1') {
  http.createServer(atender).listen(PORTA, '127.0.0.1', () => console.log(`Painel WR em http://127.0.0.1:${PORTA} — manual, sem IA e sem postagem automática`));
}
'''
# no heavy jobs launched from this panel
s=s.replace("function iniciarTrabalho(","function iniciarTrabalho(")
a=s.index("async function iniciarTrabalho(") if "async function iniciarTrabalho(" in s else -1
if a>=0:
 b=s.index('{',a);s=s[:b+1]+"\n  return [409,{erro:'Produção desativada neste painel; fila de render é apenas visual.'}];\n"+s[b+1:]
# old invalid requests should stay validation errors: handle route instead
s=s.replace("const [c, o] = await iniciarTrabalho(String(b.url || ''));", "if(!LINK_RE.test(String(b.url||''))) return json(res,400,{erro:'URL inválida'}); const [c, o] = await iniciarTrabalho(String(b.url || ''));")
s=s.replace("const [c, o] = await iniciarTrabalho(String(b.url || '').trim(),", "if(!LINK_RE.test(String(b.url||''))) return json(res,400,{erro:'URL inválida'}); const [c, o] = await iniciarTrabalho(String(b.url || '').trim(),")
p.write_text(s)
