import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
const executar=new AsyncFunction('args','agent','parallel','phase','log',fs.readFileSync(new URL('../.claude/workflows/clone-produzir.js',import.meta.url),'utf8').replace('export const meta','const meta'));
const parallel=async fs=>Promise.all(fs.map(f=>f()));
test('correção falha não dispara revisão do arquivo anterior',async()=>{
 const respostas=[{ok:true,pasta:'projetos/nova'},{veredito:'REPROVADO',nota:5,correcoes:['corrigir']},{ok:false,pasta:'projetos/falha'}];let chamadas=0;
 const result=await executar({pastas:['projetos/entrada']},async()=>{chamadas++;return respostas.shift()},parallel,()=>{},()=>{});
 assert.equal(chamadas,3);assert.match(result[0].erro,/correção falhou/);assert.equal(result[0].portao,undefined);
});
test('revisão da correção aponta à pasta nova real',async()=>{
 const prompts=[];const respostas=[{ok:true,pasta:'projetos/primeira'},{veredito:'REPROVADO',nota:5,correcoes:['corrigir']},{ok:true,pasta:'projetos/segunda'},{veredito:'APROVADO',nota:8,correcoes:[]}];
 const r=await executar({pastas:['projetos/entrada']},async prompt=>{prompts.push(prompt);return respostas.shift()},parallel,()=>{},()=>{});
 assert.equal(r[0].pasta,'projetos/segunda');assert.match(prompts[3],/projetos\/segunda/);
});
