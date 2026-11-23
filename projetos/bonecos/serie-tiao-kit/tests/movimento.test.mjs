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

test('sentar de frente abre os joelhos e mantém canela vertical; perfil mantém a versão antiga', () => {
  assert.equal(Math.abs(Pz.sentar(0).lL[0]), 0);
  const meio = Pz.sentar(.5), fim = Pz.sentar(1);
  assert.ok(Math.abs(meio.lL[0]) > 0 && Math.abs(meio.lL[0]) < Math.abs(fim.lL[0]));
  assert.ok(Math.abs(fim.lL[0] + fim.lL[1]) < 1e-9 && Math.abs(fim.lR[0] + fim.lR[1]) < 1e-9);   // coxa+canela = vertical
  assert.ok(fim.lL[0] < 0 && fim.lR[0] > 0);                                                       // joelhos pra fora
  const perfil = Pz.sentar(1, { perfil: true });
  assert.ok(perfil.lL[0] > 1 && perfil.lL[1] < -1);
});

test('padrão de pega fica fora do tronco com copo, mapa e concha', () => {
  for (const item of ['glass', 'map', 'ladle']) for (const lado of ['L', 'R']) {
    const sinal = lado === 'R' ? 1 : -1;
    const p = Pz.segurar(item, { lado });
    const [x] = Pz.maoDe(p[`a${lado}`], sinal);
    assert.ok(sinal * x >= 115, `${item} entra no tronco pelo lado ${lado}`);
    assert.deepEqual(auditaPose('vizinha', p).avisos, []);
    assert.deepEqual(Pz.avisaPropCara(p), []);
  }
});

test('apontar para um alvo nivelado estende a mão horizontalmente nos dois sentidos', () => {
  for (const direcao of [-1, 1]) {
    const p = Pz.apontar([2 * direcao, 1.2, 0], [0, 0]);
    const [x, y] = Pz.maoDe(p.aR, 1);
    assert.ok(x > 165);
    assert.equal(y, -150);
    assert.equal(p.f, direcao);
    assert.equal(p.aponta, 'R');
    const inicio = Pz.apontar([2 * direcao, 1.2, 0], [0, 0], { progresso: 0 });
    const meio = Pz.apontar([2 * direcao, 1.2, 0], [0, 0], { progresso: .5 });
    assert.ok(inicio.aR.ik[0] < meio.aR.ik[0] && meio.aR.ik[0] < x);
  }
});
