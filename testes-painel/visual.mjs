import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Readable,Writable} from 'node:stream';
import assert from 'node:assert/strict';
const base=path.dirname(fileURLToPath(import.meta.url));
const raiz=fs.mkdtempSync(path.join(base,'visual-'));
fs.mkdirSync(path.join(raiz,'prontos','Gta 6'),{recursive:true});
fs.writeFileSync(path.join(raiz,'prontos','Gta 6','video.mp4'),'fixture');
process.env.PAINEL_RAIZ_DADOS=raiz;process.env.PAINEL_SEM_LISTEN='1';process.env.PORTA_PAINEL='7777';
const {atender}=await import('../ferramentas/painel/servidor.mjs');
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage();const erros=[];page.on('pageerror',e=>erros.push(e.message));
 await page.route('http://127.0.0.1:7777/**',async route=>{
  const r=route.request(),u=new URL(r.url());const req=Readable.from(r.postDataBuffer()?[r.postDataBuffer()]:[]);req.url=u.pathname+u.search;req.method=r.method();req.headers={...r.headers(),host:'127.0.0.1:7777'};req.socket={remoteAddress:'127.0.0.1'};
  const chunks=[];const res=new Writable({write(c,e,cb){chunks.push(c);cb()}});let status=200,headers={};res.writeHead=(s,h)=>{status=s;headers=h||{};};
  const done=new Promise((ok,no)=>{res.on('finish',ok);res.on('error',no)});await atender(req,res);await done;await route.fulfill({status,headers,body:Buffer.concat(chunks)});
 });
 await page.goto('http://127.0.0.1:7777/');await page.waitForSelector('.legenda-video');
 await page.locator('.legenda-video').fill('Legenda da interface');await page.getByRole('button',{name:'Salvar legenda',exact:true}).click();await page.getByText('Legenda salva ✓',{exact:true}).waitFor();
 await page.getByRole('button',{name:'✔ Aprovar',exact:true}).click();await page.locator('#c-aprovado').filter({hasText:'1'}).waitFor();
 await page.selectOption('#seletor-conta','aventuras_do_tiao');await page.getByText('Nada aqui ainda.',{exact:true}).waitFor();
 await page.click('#configurar');await page.waitForSelector('#cofre b');
 await page.selectOption('#editor-selecao','aventuras_do_tiao');assert.equal(await page.inputValue('#ed-nome'),'Aventuras do Tião');
 await page.setViewportSize({width:390,height:844});await page.reload();await page.waitForSelector('#seletor-conta option');assert.equal(await page.inputValue('#seletor-conta'),'aventuras_do_tiao');
 assert.equal(await page.getAttribute('#menu','aria-expanded'),'false');await page.click('#menu');assert.equal(await page.getAttribute('#menu','aria-expanded'),'true');
 await page.getByRole('button',{name:'📅 Calendário',exact:false}).click();await page.waitForSelector('.dia');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:path.join(base,'painel-mobile.png'),fullPage:true});
 await page.click('#configurar');await page.waitForSelector('#cofre b');await page.screenshot({path:path.join(base,'painel-config-mobile.png'),fullPage:true});
 assert.deepEqual(erros,[]);console.log('UI verificada: legenda, aprovação, troca de conta, configuração, persistência e menu mobile.');
}finally{await browser.close()}
