// Teste rápido do painel: node --test testes/smoke.mjs  (sobe o servidor numa porta própria; não usa rede externa)
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTA = 7791;
const SERVIDOR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'ferramentas', 'painel', 'servidor.mjs');
let proc;
const pedir = (p, { metodo = 'GET', headers = {}, corpo } = {}) => new Promise((ok, no) => {
  const r = http.request({ host: '127.0.0.1', port: PORTA, path: p, method: metodo, headers }, (res) => { let b = ''; res.on('data', (c) => (b += c)); res.on('end', () => ok({ status: res.statusCode, corpo: b })); });
  r.on('error', no); if (corpo) r.write(corpo); r.end();
});
before(async () => {
  proc = spawn('node', [SERVIDOR], { env: { ...process.env, PORTA_PAINEL: String(PORTA) }, stdio: 'ignore' });
  for (let i = 0; i < 40; i++) { try { await pedir('/api/saude'); return; } catch { await new Promise((r) => setTimeout(r, 150)); } }
  throw new Error('servidor não subiu');
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
