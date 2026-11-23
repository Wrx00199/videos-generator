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
// câmeras relativas à origem do cenário; deslocadas por (dx,dz) do jarro quando ele anda
const C = {
  duo: { pos: [0.0, 1.5, 5.0], look: [-0.2, 1.0, 0], fov: 46 },
  trio: { pos: [0.1, 1.8, 6.8], look: [0.0, 1.15, 0], fov: 50 },
  pote: { pos: [0.1, 1.3, 3.5], look: [-0.1, 0.85, 0], fov: 48 },
  ruina: { pos: [-0.1, 1.5, 5.6], look: [0.4, 1.9, -3.0], fov: 56 },
};
const CID = 5.8, CZ = 1.0; // x do jarro e do Tião na cidade/ruina (câmera olha o prédio destruído ao fundo)
const S = (t0, cen, cam, beat, id, extra = {}) => ({ t0, cen, cam, beat, id, push: 0.16, ...extra });
const LISTA = [
  S(0, 'dojo', 'trio', 1, 'b1'),
  S(B[1][0], 'dojo', 'trio', 2, 'b2a'),
  S(9.6, 'dojo', 'duo', 2, 'b2b'),
  S(B[2][0], 'dojo', 'trio', 3, 'b3a'),
  S(18.2, 'dojo', 'duo', 3, 'b3b'),
  S(B[3][0], 'dojo', 'trio', 4, 'b4a'),
  S(24.6, MORRO, 'duo', 4, 'b4b'),
  S(B[4][0], MORRO, 'duo', 5, 'b5'),
  S(B[5][0], MORRO, 'trio', 6, 'b6a'),
  S(40.2, 'dojo', 'trio', 6, 'b6b'),
  S(B[6][0], 'cidade', 'ruina', 7, 'b7a'),
  S(50.0, 'cidade', 'ruina', 7, 'b7b'),
  S(B[7][0], MORRO, 'duo', 8, 'b8', { push: 0.25 }),
  S(B[8][0], 'dojo', 'pote', 9, 'b9', { push: 0.2 }),
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
export const camAt = (f) => {
  const S_ = shotAt(f), t = f / FPS, c0 = C[S_.cam], o = ORIGEM[S_.cen], u = Math.max(0, Math.min(1, (f - S_.a) / Math.max(1, S_.b - S_.a)));
  const jp = jarroPos(S_, t), dx = S_.cen === 'cidade' ? CID - 0.2 : S_.cen === MORRO ? jp.jx - 0.2 : 0, dz = S_.cen === MORRO ? jp.jz : S_.cen === 'cidade' ? CZ : 0;
  const c = { pos: [o.x + c0.pos[0] + dx, c0.pos[1], o.z + c0.pos[2] + dz], look: [o.x + c0.look[0] + dx, c0.look[1], o.z + c0.look[2] + dz], fov: c0.fov };
  const k = 1 - S_.push * sm(u);
  const tr = S_.beat >= 8 ? tremor(f, S_.beat === 9 ? 1 : 0.5 * ramp(t, 57, 64)) : { dx: 0, dy: 0 };
  const pos = c.pos.map((v, i) => c.look[i] + (v - c.look[i]) * k);
  pos[0] += tr.dx; pos[1] += tr.dy;
  return { pos, look: c.look, fov: c.fov };
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
  const S_ = shotAt(f), t = f / FPS, O = ORIGEM[S_.cen], tint = luz(S_.cen).tint, X = (a) => ({ tint, ...a }), out = [], b = S_.beat;
  const P = (n, pose, dx, dz) => out.push(X(boneco(W, n, pose, O.x + dx, O.z + dz, t)));
  const duo = S_.cam === 'duo', TX = duo ? -0.75 : -0.8, TZ = duo ? 0.35 : 0.7, IMP = [0.85, 0.4], jp = jarroPos(S_, t);
  if (b === 1) { P('tiao', { ...wide, aR: [2.5, -0.2], aL: [-0.3, 0.3] }, TX, TZ); P('imperador', { eye: 'normal', mouth: 'flat', f: -1, aL: [-0.3, 0.3] }, ...IMP); }
  else if (b === 2) { P('tiao', { ...wide, aR: [2.5, -0.2] }, TX, TZ); if (!duo) { P('imperador', { eye: 'happy', mouth: 'grin', f: -1, aL: [-0.3, 0.3] }, ...IMP); P('vizinha', { eye: 'happy', mouth: 'grin', f: -1 }, 1.4, 0.3); } }
  else if (b === 3) { P('tiao', { ...wide }, TX, TZ); if (!duo) P('imperador', { eye: 'normal', mouth: 'flat', f: -1, aL: [1.2, -0.2], aR: [1.2, -0.2] }, ...IMP); }
  else if (b === 4 && S_.cen === 'dojo') { P('tiao', { ...wide }, TX, TZ); P('imperador', { eye: 'happy', mouth: 'grin', f: -1, aR: [2.5, -0.2] }, ...IMP); P('balconista', { eye: 'happy', mouth: 'grin', f: -1 }, 1.4, 0.3); }
  else if (b === 4) { out.push(X(anda(W, 'tiao', { eye: 'normal', mouth: 'flat', aR: [1.0, -0.2], aL: [1.0, -0.2] }, [O.x - 1.0, O.z + 0.3], [O.x + jp.jx - 0.75, O.z + jp.jz + 0.35], Math.min(1, arrasto(t) * 3), t))); if (arrasto(t) >= 0.33) { /* depois de chegar ao lado do pote, acompanha ele */ } }
  else if (b === 5) P('tiao', { ...wide, aR: [2.0, -0.2] }, jp.jx - 0.75, jp.jz + 0.35);
  else if (b === 6 && S_.cen === MORRO) { const u = Math.min(1, (t - B[5][0]) / (S_.b / FPS - B[5][0])); out.push(X(anda(W, 'tiao', { ...wide, aR: [2.6, -0.2], aL: [2.6, -0.2] }, [O.x + jp.jx - 0.75, O.z + jp.jz + 0.35], [O.x + 0.9, O.z + 0.9], u, t))); }
  else if (b === 6) { P('tiao', { ...wide, aR: [2.6, -0.2], aL: [2.6, -0.2] }, -0.6, 0.9); P('carteiro', { eye: 'happy', mouth: 'grin', f: -1 }, 0.9, 0.4); }
  else if (b === 7) { P('tiao', { ...wide, aL: [-0.35, 0.25] }, CID - 0.75, TZ + CZ); if (!duo) P('carteiro', { eye: 'happy', mouth: 'grin', f: -1 }, CID + 0.9, 0.4 + CZ); }
  else if (b === 8) P('tiao', { ...wide, aR: [2.4, -0.2] }, jp.jx - 0.75, jp.jz + 0.35);
  else if (b === 9) P('tiao', { ...wide, aR: [2.5, -0.2], aL: [2.5, -0.2] }, -0.62, -0.3);
  return out;
};
export const fxAt = () => [];
