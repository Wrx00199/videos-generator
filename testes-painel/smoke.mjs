// Teste rápido do painel: node --test testes/smoke.mjs  (sobe o servidor numa porta própria; não usa rede externa)
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import {Readable, Writable} from 'node:stream';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTA = 7791;
const SERVIDOR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'ferramentas', 'painel', 'servidor.mjs');
const FIXTURE = fs.mkdtempSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'execucao-'));
fs.mkdirSync(path.join(FIXTURE, 'prontos', 'Gta 6'), {recursive:true});
fs.writeFileSync(path.join(FIXTURE, 'prontos', 'Gta 6', 'teste.mp4'), 'fixture');
let proc, handler;
const pedir = (p, { metodo = 'GET', headers = {}, corpo } = {}) => new Promise((ok, no) => {
  if(handler){
    const req=Readable.from(corpo?[Buffer.from(corpo)]:[]);req.url=p;req.method=metodo;req.socket={remoteAddress:'127.0.0.1'};
    req.headers={host:`127.0.0.1:${PORTA}`,...Object.fromEntries(Object.entries(headers).map(([k,v])=>[k.toLowerCase(),v]))};
    let b='';const res=new Writable({write(c,enc,cb){b+=c.toString();cb();}});res.statusCode=200;res.writeHead=(code,h)=>{res.statusCode=code;res.headers=h;return res};res.on('finish',()=>ok({status:res.statusCode,corpo:b}));res.on('error',no);handler(req,res).catch(no);return;
  }
  const r = http.request({ host: '127.0.0.1', port: PORTA, path: p, method: metodo, headers }, (res) => { let b = ''; res.on('data', (c) => (b += c)); res.on('end', () => ok({ status: res.statusCode, corpo: b })); });
  r.on('error', no); if (corpo) r.write(corpo); r.end();
});
before(async () => {
  let saida='';
  proc = spawn('node', [SERVIDOR], { env: { ...process.env, PORTA_PAINEL: String(PORTA), PAINEL_RAIZ_DADOS: FIXTURE }, stdio: ['ignore','pipe','pipe'] });
  proc.stderr.on('data',c=>saida+=c);proc.stdout.on('data',c=>saida+=c);
  for (let i = 0; i < 40; i++) {
    if(proc.exitCode!==null){
      if(!saida.includes('EPERM'))throw new Error('Servidor falhou: '+saida);
      process.env.PAINEL_RAIZ_DADOS=FIXTURE;process.env.PORTA_PAINEL=String(PORTA);process.env.PAINEL_SEM_LISTEN='1';
      ({atender:handler}=await import(SERVIDOR));
      console.log('Sandbox bloqueou listen (EPERM): smoke executa handlers HTTP reais em memória, sem validar socket/LAN.');return;
    }
    try { await pedir('/api/saude'); return; } catch { await new Promise((r) => setTimeout(r, 150)); }
  }
  throw new Error('servidor não subiu: '+saida);
});
after(() => proc?.kill());

test('Host estranho é barrado (DNS rebinding)', async () => {
  assert.equal((await pedir('/api/saude', { headers: { Host: 'evil.example' } })).status, 403);
});
test('POST com Origin de outro site é barrado (CSRF)', async () => {
  const r = await pedir('/api/gravar', { metodo: 'POST', headers: { Origin: 'https://evil.example' }, corpo: '{"url":"https://x"}' });
  assert.equal(r.status, 403);
});
test('POST da própria página passa e é validado', async () => {
  const r = await pedir('/api/gravar', { metodo: 'POST', headers: { Origin: `http://127.0.0.1:${PORTA}` }, corpo: '{"url":"https://x"}' });
  assert.equal(r.status, 400);
});
test('saúde: CPU numérica e disco', async () => {
  const j = JSON.parse((await pedir('/api/saude')).corpo);
  assert.equal(typeof j.pc.carga, 'number'); assert.ok(j.pc.carga >= 0 && j.pc.carga <= 100);
  assert.ok('disco_livre_gb' in j.pc);
});
test('revisão tem a forma esperada', async () => {
  const j = JSON.parse((await pedir('/api/revisao')).corpo);
  assert.ok(Array.isArray(j.itens) && Array.isArray(j.processos)); assert.ok('revisao' in j.contagem);
});
test('Tião preserva pendente para revisão e mostra reprovação editorial separada', async t => {
  const pasta = path.join(FIXTURE, 'prontos', '3D', 'Aventuras do Tião');
  const arquivos = ['rascunho_NAO-APROVADO-PELO-REVISOR.mp4', 'piloto (PARA-APROVAR).mp4'].map(nome => path.join(pasta, nome));
  fs.mkdirSync(pasta, { recursive: true });
  t.after(() => arquivos.forEach(arquivo => fs.rmSync(arquivo, { force: true })));
  arquivos.forEach(arquivo => fs.writeFileSync(arquivo, 'fixture'));
  const resposta = await pedir('/api/revisao?conta=aventuras_do_tiao');
  assert.equal(resposta.status, 200);
  const { itens, contagem } = JSON.parse(resposta.corpo);
  assert.equal(itens.find(i => i.titulo.startsWith('rascunho')).estado, 'recusado');
  assert.equal(itens.find(i => i.titulo.startsWith('piloto')).estado, 'revisao');
  assert.equal(contagem.revisao, 1);
  const calendario = JSON.parse((await pedir('/api/calendario?conta=aventuras_do_tiao')).corpo);
  assert.equal(calendario.produzidos_hoje, 1);
});
test('TikTok é opcional e vem desligado por padrão', async () => {
  const j = JSON.parse((await pedir('/api/contas')).corpo);
  assert.equal(typeof j.tiktok.ativo, 'boolean');
});
test('decidir rejeita estado inválido', async () => {
  const r = await pedir('/api/decidir', { metodo: 'POST', headers: { Origin: `http://127.0.0.1:${PORTA}` }, corpo: '{"id":"x","estado":"nada"}' });
  assert.equal(r.status, 400);
});
test('link não suportado é recusado sem rodar nada', async () => {
  const r = await pedir('/api/link/detectar', { metodo: 'POST', headers: { Origin: `http://127.0.0.1:${PORTA}` }, corpo: '{"url":"https://exemplo.com/x"}' });
  const j = JSON.parse(r.corpo); assert.equal(j.ok, false); assert.match(j.erro, /Twitch, Kick e YouTube/);
});
test('cortar por link só aceita link das 3 plataformas', async () => {
  const r = await pedir('/api/link/cortar', { metodo: 'POST', headers: { Origin: `http://127.0.0.1:${PORTA}` }, corpo: '{"url":"file:///etc/passwd"}' });
  assert.equal(r.status, 400);
});
test('cortar por link de origem estranha é barrado', async () => {
  const r = await pedir('/api/link/cortar', { metodo: 'POST', headers: { Origin: 'https://evil.example' }, corpo: '{"url":"https://kick.com/x"}' });
  assert.equal(r.status, 403);
});
test('trabalhos: lista e recusa parar pid que não é do painel', async () => {
  const l = JSON.parse((await pedir('/api/trabalhos')).corpo); assert.ok(Array.isArray(l));
  const r = await pedir('/api/trabalhos/parar', { metodo: 'POST', headers: { Origin: `http://127.0.0.1:${PORTA}` }, corpo: '{"pid":1}' });
  assert.equal(r.status, 404);
});
test('marca: arquivo que não é imagem é recusado', async () => {
  const r = await pedir('/api/marca/arquivo?tipo=logo', { metodo: 'POST', headers: { Origin: `http://127.0.0.1:${PORTA}` }, corpo: 'isso não é uma imagem' });
  assert.equal(r.status, 400);
});
test('desempenho: perfil automático tem descrição e perfil inválido é recusado', async () => {
  const d = JSON.parse((await pedir('/api/desempenho')).corpo); assert.ok(['qualidade', 'equilibrado', 'leve'].includes(d.efetivo)); assert.ok(d.descricao);
  const r = await pedir('/api/desempenho', { metodo: 'POST', headers: { Origin: `http://127.0.0.1:${PORTA}` }, corpo: '{"perfil":"turbo"}' });
  assert.equal(r.status, 400);
});

const api = async (p, b) => { const r = await pedir(p, b === undefined ? {} : {metodo:'POST', headers:{Origin:`http://127.0.0.1:${PORTA}`}, corpo:JSON.stringify(b)}); return {...r, j:JSON.parse(r.corpo)}; };
test('contas-cfg: sementes, criar, editar, remover e validar pasta', async () => {
  const r=await api('/api/contas-cfg'); assert.equal(r.status,200); assert.ok(Array.isArray(r.j));
  assert.equal(r.j.find(x=>x.id==='six_stars').plataformas.find(x=>x.rede==='tiktok').ligado,false);
  const c={...r.j[0],id:'teste',nome:'Teste'};
  assert.equal((await api('/api/contas-cfg',c)).status,200);
  assert.equal((await api('/api/contas-cfg',{...c,nome:'Editada'})).status,200);
  assert.equal((await api('/api/contas-cfg',{...c,pasta_saida:'../segredo'})).status,400);
  assert.equal((await api('/api/contas-cfg',{acao:'remover',id:'teste'})).status,200);
  assert.ok(!(await api('/api/contas-cfg')).j.some(x=>x.id==='teste'));
});
test('legenda salva por vídeo, aprovação usa edição e contas não se misturam', async () => {
  let r=await api('/api/revisao?conta=six_stars'); const i=r.j.itens.find(x=>x.mp4.endsWith('teste.mp4')); assert.ok(i);
  assert.equal((await api('/api/legendas',{conta:'six_stars',id:i.id,legenda:'Minha legenda editada'})).status,200);
  assert.equal((await api('/api/legendas',{conta:'aventuras_do_tiao',id:i.id,legenda:'invadir'})).status,404);
  assert.equal((await api('/api/decidir',{conta:'six_stars',id:i.id,estado:'aprovado'})).status,200);
  r=await api('/api/revisao?conta=six_stars'); assert.equal(r.j.itens.find(x=>x.id===i.id).legenda,'Minha legenda editada');
  assert.equal(r.j.itens.find(x=>x.id===i.id).estado,'aprovado');
  assert.equal((await api('/api/revisao?conta=aventuras_do_tiao')).j.itens.length,0);
  assert.equal((await api('/api/placar?conta=six_stars')).j[0].aprovado,1);
  assert.equal((await api('/api/calendario?conta=aventuras_do_tiao')).j.meta_min,2);
});
test('referências ficam pendentes sem baixar e recusam URL inválida', async () => {
  assert.equal((await api('/api/referencias',{url:'file:///etc/passwd'})).status,400);
  const r=await api('/api/referencias',{url:'https://example.com/ref',nota:'Estudar gancho',conta:'aventuras_do_tiao'}); assert.equal(r.status,201); assert.equal(r.j.status,'pendente');
  const tiao=await api('/api/referencias?conta=aventuras_do_tiao');
  assert.equal(tiao.status,200);
  assert.deepEqual(tiao.j,[r.j]);
  assert.deepEqual((await api('/api/referencias?conta=six_stars')).j,[]);
});
test('saúde: GPU opcional, chaves sem valor e LAN desligada', async () => {
  const r=await api('/api/saude'); assert.ok(Array.isArray(r.j.pc.gpus)); assert.equal(r.j.chaves.length,5);
  for(const c of r.j.chaves){assert.equal(typeof c.existe,'boolean');assert.ok(!('valor' in c));}
  assert.equal((await api('/api/rede')).j.ligado,false);
  assert.equal((await api('/api/rede',{ligado:true,senha:'x'})).status,400);
});
test('JSON malformado é erro de cliente', async()=>{assert.equal((await pedir('/api/contas-cfg',{metodo:'POST',corpo:'{'})).status,400)});
test('vídeo suporta range válido e rejeita range inválido sem cair',async()=>{
 const j=(await api('/api/revisao?conta=six_stars')).j;const id=j.itens.find(i=>i.mp4.endsWith('teste.mp4')).id;
 assert.equal((await pedir('/video?id='+id,{headers:{Range:'bytes=0-2'}})).status,206);
 assert.equal((await pedir('/video?id='+id,{headers:{Range:'bytes=999999-'}})).status,416);
 assert.equal((await pedir('/video?id='+id,{headers:{Range:'quebrado'}})).status,416);
});
test('cadastro rejeita horários impossíveis e plataformas inválidas',async()=>{
 const c=(await api('/api/contas-cfg')).j[0];
 assert.equal((await api('/api/contas-cfg',{...c,horarios:['25:99']})).status,400);
 assert.equal((await api('/api/contas-cfg',{...c,plataformas:[{rede:'x',handle:'x',ligado:true,modo:'api'}]})).status,400);
 assert.equal((await api('/api/revisao?conta=inexistente')).status,404);
});
test('aprovação e configuração de conta preservam marca e estado do estúdio',async()=>{
 assert.equal((await api('/api/marca',{nick:'nao_mudar'})).status,409);
 assert.equal(fs.existsSync(path.join(FIXTURE,'_estado')),false);
 assert.equal(fs.existsSync(path.join(FIXTURE,'marca')),false);
});
test('referência e legenda são persistidas em disco',async()=>{
 const refs=fs.readFileSync(path.join(FIXTURE,'painel-dados','_fila_painel.jsonl'),'utf8').trim().split('\n').map(JSON.parse);
 assert.equal(refs[0].status,'pendente');assert.equal(refs[0].nota,'Estudar gancho');
 const legs=JSON.parse(fs.readFileSync(path.join(FIXTURE,'painel-dados','legendas.json'),'utf8'));
 assert.equal(Object.values(legs)[0].legenda,'Minha legenda editada');
});
test('contas rejeitam corpos nulos e arrays',async()=>{
 assert.equal((await api('/api/contas-cfg',null)).status,400);
 assert.equal((await api('/api/contas-cfg',[])).status,400);
});
test('HTML preserva emblema no favicon, sidebar e topo e script é válido',async()=>{
 const html=(await pedir('/')).corpo;
 assert.equal((html.match(/data:image\/svg\+xml;base64,/g)||[]).length,3);
 const js=html.match(/<script>([\s\S]*?)<\/script>/)[1];
 const {Script}=await import('node:vm');assert.doesNotThrow(()=>new Script(js));
 for(const id of ['seletor-conta','conta-form','cofre','cal-dias','referencia-form','menu'])assert.ok(html.includes(`id="${id}"`));
});
