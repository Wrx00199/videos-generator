import test from 'node:test';
import assert from 'node:assert/strict';
import { Pz } from '../motor3d/Pz.js';
import { auditaPose } from '../motor3d/elenco.js';

globalThis.document = { createElement: () => ({ getContext: () => null }) };
const { andarRota } = await import('../motor3d/acoes.js');
delete globalThis.document;

test('rota cobre dez passos em frente e três à esquerda, sem andar parado', () => {
  const a = andarRota('tiao', [0, 0], [
    { ate: [0, 2], passos: 10 }, { ate: [-.6, 2], passos: 3 },
  ], { pps: 2.5 });
  const quadro = t => ({ t, d: t * 30 });
  assert.equal(a.z(quadro(2)), 1);
  assert.equal(a.z(quadro(4)), 2);
  assert.ok(Math.abs(a.x(quadro(4.4)) + .2) < 1e-8);
  assert.equal(a.p(quadro(4.4)).f, -1);
  assert.equal(a.x(quadro(6)), -.6);
  assert.deepEqual(a.p(quadro(6)).lL, undefined);
  assert.notDeepEqual(a.p(quadro(1.6)).lL, a.p(quadro(1.8)).lL);
});

test('chapéu sai da cabeça para a mão e braço e objeto passam na auditoria', () => {
  const p = Pz.chapeuNaMao();
  assert.equal(p.hat, false);
  assert.equal(p.hR.k, 'bicorne');
  assert.deepEqual(auditaPose('cap', p).avisos, []);
  assert.deepEqual(Pz.avisaPropCara(p), []);
});

test('sentar interpola o joelho e não gira as pernas esticadas', () => {
  assert.equal(Pz.sentar(0).lL[0], 0);
  const meio = Pz.sentar(.5), fim = Pz.sentar(1);
  assert.ok(meio.lL[0] > 0 && meio.lL[0] < fim.lL[0]);
  assert.ok(fim.lL[0] > 1 && fim.lL[1] < -1);
});
