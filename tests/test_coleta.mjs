import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const mod = await import('../ferramentas/coletar_social.mjs');
const temp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'coleta-'));
test('bloqueio persiste, não abre Chrome nem espera e só liberação humana remove', async () => {
  const raiz = temp();
  try {
    let aberturas = 0, esperas = 0;
    const deps = { raiz, abrir: async () => { aberturas++; return {close: async()=>{}}; },
      coletar: async () => ({bloq:'captcha', linhas:[], brutos:0}), dormir: async()=>{esperas++;} };
    const tarefas = [['tiktok','tag','a'], ['tiktok','tag','b']];
    const a = await mod.executar(tarefas, deps);
    assert.equal(a.arquivos.length, 2);
    assert.equal(aberturas, 1); assert.equal(esperas, 0);
    const b = await mod.executar(tarefas, deps);
    assert.equal(aberturas, 1); assert.equal(b.arquivos[0].status, 'bloqueado');
    assert.deepEqual(JSON.parse(fs.readFileSync(b.arquivos[0].arquivo)).linhas, []);
    mod.liberarBloqueio(raiz, 'tiktok');
    await mod.executar(tarefas.slice(0,1), deps);
    assert.equal(aberturas, 2);
  } finally { fs.rmSync(raiz,{recursive:true,force:true}); }
});
test('perfil mantém os três locks e argumentos normais de automação', async () => {
  const raiz = temp();
  try {
    const dir = path.join(raiz,'_estado','chrome-busca'); fs.mkdirSync(dir,{recursive:true});
    for (const f of ['SingletonLock','SingletonSocket','SingletonCookie']) fs.writeFileSync(path.join(dir,f),'ocupado');
    await mod.abrir('chrome-busca', raiz, {launchPersistentContext: async (p, opts) => {
      for (const f of ['SingletonLock','SingletonSocket','SingletonCookie']) assert.equal(fs.readFileSync(path.join(p,f),'utf8'),'ocupado');
      assert.equal(opts.ignoreDefaultArgs, undefined);
      assert.ok(!opts.args?.some(x => /AutomationControlled/.test(x)));
      return {};
    }});
  } finally {fs.rmSync(raiz,{recursive:true,force:true});}
});
test('CLI rápido padrão, completo explícito e valida flags', () => {
  assert.equal(mod.parseArgs(['--nicho','gta6']).rapido,true);
  assert.equal(mod.parseArgs(['--nicho','gta6','--completo']).rapido,false);
  assert.throws(()=>mod.parseArgs(['--nicho']));
  assert.throws(()=>mod.parseArgs(['--nicho','gta6','--rapdio']));
  assert.throws(()=>mod.parseArgs(['--liberar-bloqueio','tiktok','--nicho','gta6']));
});
test('normaliza números e duração das redes', () => {
  assert.equal(mod.itensTikTok({id:'1', stats:{playCount:'21000'},author:{uniqueId:'canal'},createTime:1,video:{duration:'20'}})[0].views,21000);
  assert.equal(mod.itensInstagram({code:'abc',taken_at:1,media_type:2,play_count:'30000',video_duration:'30'})[0].dur,30);
});
test('redes sequenciais e falha de Chrome gera arquivo vazio no manifesto', async () => {
  const raiz=temp(); let ativo=0, maximo=0;
  try {
    const r=await mod.executar([['tiktok','tag','a'],['instagram','tag','b']],{
      raiz, abrir:async()=>{ativo++;maximo=Math.max(maximo,ativo);return {close:async()=>{ativo--;}};},
      coletar:async()=>({linhas:[],brutos:0}), dormir:async()=>assert.fail('não há próxima página na mesma rede'),
    });
    assert.equal(maximo,1); assert.equal(ativo,0); assert.equal(r.resumo.vazio,2);
    const falha=await mod.executar([['tiktok','tag','a']],{raiz,abrir:async()=>{throw new Error('perfil ocupado');}});
    assert.equal(falha.arquivos[0].status,'erro');
    assert.deepEqual(JSON.parse(fs.readFileSync(falha.arquivos[0].arquivo)).linhas,[]);
  } finally {fs.rmSync(raiz,{recursive:true,force:true});}
});
test('captcha na navegação fecha a página sem rolar nem extrair dados', async () => {
  let fechou=false;
  const page={on(){},goto:async()=>{},url:()=> 'https://www.tiktok.com/tag/teste',
    evaluate:async()=> 'captcha visível na página', close:async()=>{fechou=true;},
    mouse:{wheel:()=>assert.fail('rolagem após captcha'),move:()=>assert.fail('movimento após captcha')}};
  const r=await mod.coletar({newPage:async()=>page},'tiktok','tag','teste');
  assert.ok(r.bloq); assert.deepEqual(r.linhas,[]); assert.ok(fechou);
});
