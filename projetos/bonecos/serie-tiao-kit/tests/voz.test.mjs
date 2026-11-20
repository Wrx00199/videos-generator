import test from 'node:test';
import assert from 'node:assert/strict';
import { chavesTts, girarChaves } from '../../../../ferramentas/tts_config.mjs';

const cota = () => Object.assign(new Error('RESOURCE_EXHAUSTED'), { status: 429 });

test('chavesTts le _1.._5 em ordem e ignora vazias', () => {
  const env = { GEMINI_API_KEY_1: 'k1', GEMINI_API_KEY_2: '  ', GEMINI_API_KEY_3: 'k3', GEMINI_API_KEY_5: ' k5 ' };
  assert.deepEqual(chavesTts(env), ['k1', 'k3', 'k5']);
  assert.deepEqual(chavesTts({}), []);
});

test('429 em a e b usa c', async () => {
  const r = await girarChaves(['a', 'b', 'c'], async (k) => { if (k !== 'c') throw cota(); return 'audio'; });
  assert.equal(r.ok, true); assert.equal(r.valor, 'audio'); assert.equal(r.usada, 2);
});

test('todas 429 -> cota_esgotada', async () => {
  const r = await girarChaves(['a', 'b'], async () => { throw cota(); });
  assert.deepEqual(r, { ok: false, erro: 'cota_esgotada' });
});

test('lista vazia -> cota_esgotada', async () => {
  assert.deepEqual(await girarChaves([], async () => 1), { ok: false, erro: 'cota_esgotada' });
});

test('erro 500 nao gira, propaga', async () => {
  let n = 0;
  await assert.rejects(girarChaves(['a', 'b'], async () => { n++; throw Object.assign(new Error('boom'), { status: 500 }); }), /boom/);
  assert.equal(n, 1);
});

test('saida nunca contem o texto da chave', async () => {
  const seg = 'SEGREDO-ABC123';
  const r = await girarChaves([seg, 'ok'], async (k) => { if (k === seg) throw cota(); return 'x'; });
  assert.ok(!JSON.stringify(r).includes(seg));
  const r2 = await girarChaves([seg], async () => { throw cota(); });
  assert.ok(!JSON.stringify(r2).includes(seg));
});
