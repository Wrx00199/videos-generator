// ep46 — O Tião e o jarro dos dragões (sismógrafo, 132 d.C.). Tempos de tempos.js (FT = [ini,fim] por beat, medidos na voz).
// Três lugares (nada novo): pátio = dojo; morro = pradaria_trilho com trilho:0; ruína = cidade/ruina. O pote e as 8 bolas são o medidor (sem velocímetro).
import { luz } from './luzes.js';
import { boneco, anda } from './acoes.js';
import { ORIGEM } from './cenarios.js';
import { tremor } from './efeitos.js';
import { FT, DUR } from './tempos.js';
export const FPS = 30, TOTAL = Math.round(DUR * FPS);
const F = (s) => Math.round(s * FPS);
const sm = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
const ramp = (t, a, b) => sm((t - a) / (b - a));
const B = FT;
const MORRO = 'pradaria_trilho';
// Câmera orbital em torno do jarro (ou de um ponto c): az (graus, 0 = de frente), dist, h (altura da câmera), ly (altura do alvo), fov, off (deslocamento lateral do alvo).
// O Tião é posicionado PELA câmera (profundidade D e lateral em fração da meia-largura): sempre inteiro, no terço esquerdo, grande (~45–50% da altura do quadro).
const CID = 5.8, CZ = 1.0;
const S = (t0, cen, beat, id, cam, extra = {}) => ({ t0, cen, beat, id, cam, push: 0.14, ...extra });
const LISTA = [
  S(0, 'dojo', 1, 'b1', { az: 10, dist: 4.4, h: 1.45, ly: 1.05, fov: 48, off: 0.1, D: 3.6 }),
  S(B[1][0], 'dojo', 2, 'b2a', { az: -38, dist: 4.6, h: 0.55, ly: 1.25, fov: 54, off: 0.0, D: 3.7 }),
  S(9.6, 'dojo', 2, 'b2b', { az: 0, dist: 4.2, h: 3.4, ly: 0.7, fov: 52, off: 0.0, D: 3.3 }),
  S(B[2][0], 'dojo', 3, 'b3a', { az: 42, dist: 4.6, h: 1.5, ly: 1.0, fov: 50, off: 0.1, D: 3.6 }),
  S(18.2, 'dojo', 3, 'b3b', { az: -8, dist: 4.2, h: 1.1, ly: 0.95, fov: 52, off: 0.0 }),
  S(B[3][0], 'dojo', 4, 'b4a', { az: -18, dist: 5.2, h: 2.0, ly: 1.0, fov: 50, off: 0.1, D: 4.0 }),
  S(24.6, MORRO, 4, 'b4b', { az: 28, dist: 4.4, h: 1.3, ly: 1.0, fov: 50, off: 0.0, D: 3.4 }),
  S(B[4][0], MORRO, 5, 'b5', { az: -32, dist: 4.0, h: 1.2, ly: 1.0, fov: 50, off: 0.0, D: 3.2 }),
  S(B[5][0], MORRO, 6, 'b6a', { az: 4, dist: 5.6, h: 1.7, ly: 1.1, fov: 52, off: 0.0, D: 4.8, D2: 2.6 }),
  S(40.2, 'dojo', 6, 'b6b', { az: 0, dist: 4.6, h: 1.5, ly: 1.1, fov: 50, off: 0.0, D: 3.4, c: [0.0, -2.0] }),
  S(B[6][0], 'cidade', 7, 'b7a', { az: -22, dist: 5.2, h: 1.6, ly: 1.5, fov: 56, off: 0.4, D: 3.9 }),
  S(50.0, 'cidade', 7, 'b7b', { az: 32, dist: 4.4, h: 1.3, ly: 1.3, fov: 54, off: 0.3 }),
  S(B[7][0], MORRO, 8, 'b8', { az: 0, dist: 4.0, h: 1.0, ly: 0.9, fov: 50, off: 0.0, push: 0.2 }),
  S(B[8][0], 'dojo', 9, 'b9', { az: -22, dist: 5.2, h: 1.9, ly: 0.95, fov: 50, off: 0.0, push: 0.18 }),
];
export const SHOTS = LISTA.map((s, i) => ({ ...s, a: F(s.t0), b: i + 1 < LISTA.length ? F(LISTA[i + 1].t0) : TOTAL }));
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f < s.b) || SHOTS.at(-1);
export const LIGHTS = {};
export const lightFor = (S_) => luz(S_.cen);

// jarro: posição no chão (relativa à origem do cenário), por plano
const arrasto = (t) => ramp(t, 24.6, 31.0);
const jarroPos = (S_, t) => {
  if (S_.cen === 'cidade') return { jx: CID, jz: CZ };
  if (S_.cen === MORRO) { const u = S_.beat === 4 ? arrasto(t) : 1; return { jx: -0.4 + 0.6 * u, jz: -2.2 * u }; }
  return { jx: 0.2, jz: 0 };
};
const RAD = Math.PI / 180;
// geometria da câmera de um plano no instante t (coordenadas locais ao cenário)
const geo = (S_, t, k = 1) => {
  const c0 = S_.cam, jp = jarroPos(S_, t), C = c0.c ?? [jp.jx, -0.5 + jp.jz];
  const px = C[0] + Math.sin(c0.az * RAD) * c0.dist * k, pz = C[1] + Math.cos(c0.az * RAD) * c0.dist * k;
  let dx = C[0] - px, dz = C[1] - pz; const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
  const rx = -dz, rz = dx;
  return { px, pz, dx, dz, rx, rz, lx: C[0] + rx * c0.off, lz: C[1] + rz * c0.off, hw: Math.tan(c0.fov * RAD / 2) * 0.5625 };
};
// ponto no chão a profundidade D da câmera e lateral lat (fração da meia-largura no plano D; negativo = esquerda)
const noPlano = (S_, t, D, lat, k = 1) => { const g = geo(S_, t, k); return [g.px + g.dx * D + g.rx * lat * g.hw * D, g.pz + g.dz * D + g.rz * lat * g.hw * D]; };
export const camAt = (f) => {
  const S_ = shotAt(f), t = f / FPS, o = ORIGEM[S_.cen], u = Math.max(0, Math.min(1, (f - S_.a) / Math.max(1, S_.b - S_.a)));
  const k = 1 - S_.push * sm(u), g = geo(S_, t, k), c0 = S_.cam;
  const tr = S_.beat >= 8 ? tremor(f, S_.beat === 9 ? 1 : 0.5 * ramp(t, 57, 64)) : { dx: 0, dy: 0 };
  return { pos: [o.x + g.px + tr.dx, c0.h + tr.dy, o.z + g.pz], look: [o.x + g.lx, c0.ly, o.z + g.lz], fov: c0.fov };
};
export const dofAt = (f) => { const c = camAt(f); return { focus: Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), cinf: 0 }; };

// bolas caídas (0..8). B3: 1 bola cai e nada. B5: 1 e depois 2. B6: as oito. B8: uma por uma, a 1ª na boca do sapo.
const queda = (t) => {
  if (t >= 19.0 && t < 24) return ramp(t, 19.0, 19.9);
  if (t >= B[4][0] && t < B[5][0]) return ramp(t, 32.6, 33.4) + ramp(t, 34.4, 35.2);
  if (t >= B[5][0] && t < B[6][0]) return 2 + 6 * ramp(t, 36.4, 38.4);
  if (t >= B[6][0] && t < B[7][0]) return 8;
  if (t >= B[7][0] && t < B[8][0]) return 8 * ramp(t, 57.4, 62.6);
  if (t >= B[8][0]) return 8;
  return 0;
};
const tranco = (t) => (t >= B[7][0] && t < B[8][0] ? ramp(t, 55.5, 57.4) * (0.5 + 0.5 * Math.sin(t * 9) ** 2) : t >= B[8][0] ? 1 : 0);
export const worldAt = (f) => {
  const S_ = shotAt(f), t = f / FPS, jp = jarroPos(S_, t);
  const o = { jarro: S_.id === 'b6b' ? 0 : 1, queda: queda(t), tranco: tranco(t), ...jp };
  if (S_.cen === MORRO) Object.assign(o, { trem: 0, bike: 0, tabuas: 0, trilho: 0, velocimetro: 0 });
  const O = ORIGEM[S_.cen];
  const fx = S_.beat >= 8 ? { terremoto: { pos: [O.x + 2.6, O.z - 4.0], k: S_.beat === 9 ? 1 : 0.5 * ramp(t, 57, 64) } } : undefined;
  return { cenario: S_.cen, [S_.cen]: o, fx };
};
const wide = { eye: 'wide', mouth: 'o' };
export const actorsAt = (f, T, W) => {
  const S_ = shotAt(f), t = f / FPS, O = ORIGEM[S_.cen], tint = luz(S_.cen).tint, X = (a) => ({ tint, ...a }), out = [], b = S_.beat, c0 = S_.cam;
  const kk = 1 - S_.push * sm(Math.max(0, Math.min(1, (f - S_.a) / Math.max(1, S_.b - S_.a)))), tg = Math.tan(c0.fov * Math.PI / 360);
  // Tião ~45% da altura do quadro, borda esquerda dentro do quadro; na frente do jarro (exceto b9, onde fica atrás e o jarro é o maior objeto)
  const DT = b === 9 ? c0.dist * kk - 0.7 : Math.min(1.44 / tg, c0.dist * kk - 0.8), wf = 1.23 * 1.3 / (2 * DT * tg), LT = b === 9 ? -0.62 : -Math.max(0.1, Math.min(0.75, 0.97 - wf));
  const at = (D, lat) => noPlano(S_, t, D, lat, kk);
  const P = (n, pose, [x, z]) => out.push(X(boneco(W, n, pose, O.x + x, O.z + z, t)));
  const TIAO = (pose) => P('tiao', pose, at(DT, LT)), RIGHT = (n, pose, d = 0.3) => P(n, pose, at(DT + d, 0.5));
  if (b === 1) { TIAO({ ...wide, aR: [2.5, -0.2], aL: [-0.3, 0.3] }); RIGHT('imperador', { eye: 'normal', mouth: 'flat', f: -1, aL: [-0.3, 0.3] }); }
  else if (b === 2) { TIAO({ ...wide, aR: [2.5, -0.2] }); if (S_.id === 'b2a') { RIGHT('imperador', { eye: 'happy', mouth: 'grin', f: -1, aL: [-0.3, 0.3] }); P('vizinha', { eye: 'happy', mouth: 'grin', f: -1 }, at(DT + 1.0, 0.1)); } }
  else if (b === 3) { TIAO({ ...wide }); if (S_.id === 'b3a') RIGHT('imperador', { eye: 'normal', mouth: 'flat', f: -1, aL: [1.2, -0.2], aR: [1.2, -0.2] }); }
  else if (b === 4 && S_.cen === 'dojo') { TIAO({ ...wide }); RIGHT('imperador', { eye: 'happy', mouth: 'grin', f: -1, aR: [2.5, -0.2] }); P('balconista', { eye: 'happy', mouth: 'grin', f: -1 }, at(DT + 1.2, 0.15)); }
  else if (b === 4) { const A = at(DT + 1.2, -0.5), Bp = at(DT, LT); out.push(X(anda(W, 'tiao', { eye: 'normal', mouth: 'flat', aR: [1.0, -0.2], aL: [1.0, -0.2] }, [O.x + A[0], O.z + A[1]], [O.x + Bp[0], O.z + Bp[1]], Math.min(1, arrasto(t) * 4), t))); }
  else if (b === 5) TIAO({ ...wide, aR: [2.0, -0.2] });
  else if (b === 6 && S_.cen === MORRO) { const u = Math.min(1, (t - B[5][0]) / (S_.b / FPS - B[5][0])), A = at(DT, LT), Bp = at(DT * 0.85, LT + 0.15); out.push(X(anda(W, 'tiao', { ...wide, aR: [2.6, -0.2], aL: [2.6, -0.2] }, [O.x + A[0], O.z + A[1]], [O.x + Bp[0], O.z + Bp[1]], u, t))); }
  else if (b === 6) { TIAO({ ...wide, aR: [2.6, -0.2], aL: [2.6, -0.2] }); RIGHT('carteiro', { eye: 'happy', mouth: 'grin', f: -1 }); }
  else if (b === 7) { TIAO({ ...wide, aL: [-0.35, 0.25] }); if (S_.id === 'b7a') RIGHT('carteiro', { eye: 'happy', mouth: 'grin', f: -1 }); }
  else if (b === 8) TIAO({ ...wide, aR: [2.4, -0.2] });
  else if (b === 9) TIAO({ ...wide, aR: [2.5, -0.2], aL: [2.5, -0.2] });
  return out;
};
export const fxAt = () => [];
