import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMERAS, NOMES } from '../motor3d/cameras.js';

const ASPECT = 1080 / 1920;
const sub = (a, b) => a.map((v, i) => v - b[i]), dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const n = Math.hypot(...a); return a.map((v) => v / n); };
// projeta a caixa do alvo; devolve maior |ndc|
function maxNdc(c, al) {
  const f = norm(sub(c.look, c.pos)), r = norm(cross(f, [0, 1, 0])), u = cross(r, f), th = Math.tan((c.fov * Math.PI) / 360);
  let m = 0;
  for (const dx of [-1, 1]) for (const dy of [-1, 1]) for (const dz of [-1, 1]) {
    const q = [al.x + dx * al.w / 2, al.y + dy * al.h / 2, al.z + dz * al.w / 2], v = sub(q, c.pos), z = dot(v, f);
    if (z <= 0.1) return Infinity;
    m = Math.max(m, Math.abs(dot(v, r) / (z * th * ASPECT)), Math.abs(dot(v, u) / (z * th)));
  }
  return m;
}
const ALVOS = [{ x: 0, y: 0.6, z: 0, w: 0.9, h: 1.2 }, { x: 3, y: 1.6, z: -2, w: 2.2, h: 3.2 }, { x: 0, y: 0.35, z: 0, w: 0.4, h: 0.5 }];

test('banco tem as 8 cameras', () => {
  assert.deepEqual([...NOMES].sort(), ['abertura_push', 'close_reacao', 'corte_transversal', 'detalhe_objeto', 'orbita', 'plongee', 'travelling_lateral', 'whip_pan']);
  for (const n of NOMES) assert.equal(typeof CAMERAS[n], 'function');
});

test('cada camera devolve {pos,look,fov} validos', () => {
  for (const n of NOMES) for (const t of [0, 0.5, 1]) {
    const c = CAMERAS[n](ALVOS[0], t);
    assert.equal(c.pos.length, 3); assert.equal(c.look.length, 3);
    assert.ok(c.fov > 20 && c.fov < 90, `${n} fov ${c.fov}`);
    assert.ok(c.pos.every(Number.isFinite) && c.look.every(Number.isFinite), n);
  }
});

test('folga >= 12% nas bordas (caixa do alvo dentro de |ndc| <= 0.76)', () => {
  for (const n of NOMES) for (const al of ALVOS) for (const t of [0, 0.25, 0.5, 0.75, 1]) {
    if (n === 'whip_pan' && t < 0.3) continue; // varrida de proposito
    const m = maxNdc(CAMERAS[n](al, t), al);
    assert.ok(m <= 0.76, `${n} t=${t} alvo h=${al.h}: ndc ${m.toFixed(2)} > 0.76`);
  }
});

test('whip_pan assenta enquadrado no fim', () => {
  assert.ok(maxNdc(CAMERAS.whip_pan(ALVOS[0], 1), ALVOS[0]) <= 0.76);
});

test('camera nunca entra no alvo nem fica abaixo do chao', () => {
  for (const n of NOMES) for (const t of [0, 0.5, 1]) {
    const c = CAMERAS[n](ALVOS[0], t);
    assert.ok(c.pos[1] > 0.05, `${n} abaixo do chao`);
    assert.ok(Math.hypot(c.pos[0] - ALVOS[0].x, c.pos[2] - ALVOS[0].z) > 0.8, `${n} dentro do alvo`);
  }
});

import { caixaDe } from '../motor3d/cameras.js';
test('caixaDe: corpo do Tiao (bb real) ~1,74 m e rosto no topo', () => {
  const bb = [-109.6, 109.6, -573.69, 0];
  const c = caixaDe(bb, 1, 2, 0.1), r = caixaDe(bb, 1, 2, 0.1, 'rosto');
  assert.ok(Math.abs(c.h - 1.74) < 0.03, `h ${c.h}`);
  assert.ok(r.y > c.y && r.h < c.h * 0.5);
  assert.ok(Math.abs(c.y - (0.1 + c.h / 2)) < 1e-9);
});
