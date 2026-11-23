// ep46 — O Tião e o jarro dos dragões (sismógrafo, 132 d.C.). Tempos vêm de tempos.js (FT = [ini,fim] por beat, medidos na voz).
// Substitutos (nada criado): palácio = dojo; pote de bronze = velocímetro da pradaria (ponteiro = bolas caindo); palácio em ruína = cidade/ruina.
import { camFromKeys } from './motion.js';
import { luz } from './luzes.js';
import { boneco, anda } from './acoes.js';
import { ORIGEM, camCen } from './cenarios.js';
import { tremor } from './efeitos.js';
import { FT, DUR } from './tempos.js';
export const FPS = 30, TOTAL = Math.round(DUR * FPS);
const F = (s) => Math.round(s * FPS);
const sm = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
const ramp = (t, a, b) => sm((t - a) / (b - a));
const B = FT;
// câmeras do pátio (relativas à origem do dojo). duo = Tião inteiro + jarro; trio = Tião + jarro + imperador/guarda. Tião nunca cortado.
const CUSTOM = { duo: { pos: [0.0, 1.5, 5.0], look: [-0.2, 1.0, 0], fov: 46 }, trio: { pos: [0.1, 1.8, 6.8], look: [0.0, 1.15, 0], fov: 50 } };
const jxAt = (t) => 0.2 - 1.3 * ramp(t, 24.6, 31) * (t < B[4][0] ? 1 : 0);
const S = (t0, cen, cam, extra = {}) => ({ t0, cen, cam, push: 0.16, ...extra });
const LISTA = [
  S(0, 'dojo', 'trio', { id: 'b1', beat: 1 }),
  S(B[1][0], 'dojo', 'trio', { id: 'b2a', beat: 2 }),
  S(9.6, 'dojo', 'duo', { id: 'b2b', beat: 2 }),
  S(B[2][0], 'dojo', 'trio', { id: 'b3a', beat: 3 }),
  S(18.2, 'dojo', 'duo', { id: 'b3b', beat: 3 }),
  S(B[3][0], 'dojo', 'trio', { id: 'b4a', beat: 4 }),
  S(24.6, 'dojo', 'duo', { id: 'b4b', beat: 4 }),
  S(B[4][0], 'dojo', 'duo', { id: 'b5', beat: 5 }),
  S(B[5][0], 'dojo', 'trio', { id: 'b6', beat: 6 }),
  S(B[6][0], 'dojo', 'trio', { id: 'b7a', beat: 7 }),
  S(47.5, 'dojo', 'duo', { id: 'b7b', beat: 7 }),
  S(B[7][0], 'dojo', 'duo', { id: 'b8', beat: 8, push: 0.25 }),
  S(B[8][0], 'dojo', 'duo', { id: 'b9', beat: 9, push: 0.2 }),
];
export const SHOTS = LISTA.map((s, i) => ({ ...s, a: F(s.t0), b: i + 1 < LISTA.length ? F(LISTA[i + 1].t0) : TOTAL }));
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f < s.b) || SHOTS.at(-1);
export const LIGHTS = {};
export const lightFor = (S_) => luz(S_.cen);
export const camAt = (f) => {
  const S_ = shotAt(f), t = f / FPS, c0 = CUSTOM[S_.cam], o = ORIGEM[S_.cen], u = Math.max(0, Math.min(1, (f - S_.a) / Math.max(1, S_.b - S_.a)));
  const sg = S_.beat === 4 ? jxAt(t) - 0.2 : 0;   // beat 4: câmera segue o Tião arrastando o jarro
  const c = { pos: [o.x + c0.pos[0] + sg, c0.pos[1], o.z + c0.pos[2]], look: [o.x + c0.look[0] + sg, c0.look[1], o.z + c0.look[2]], fov: c0.fov };
  const k = 1 - S_.push * sm(u);
  const tr = S_.beat >= 8 ? tremor(f, S_.beat === 9 ? 1 : 0.5 * ramp(t, 57, 64)) : { dx: 0, dy: 0 };
  const pos = c.pos.map((v, i) => c.look[i] + (v - c.look[i]) * k);
  pos[0] += tr.dx; pos[1] += tr.dy;
  return { pos, look: c.look, fov: c.fov };
};
export const dofAt = (f) => { const c = camAt(f); return { focus: Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), cinf: 0 }; };
// bolas caídas no jarro (0..8). Beat 3: 1 bola cai e nada. Beat 5: noite, 1 e depois 2. Beat 6: as oito. Beat 8: uma por uma; a 1ª cai na boca do sapo.
const queda = (t) => {
  if (t >= 19.0 && t < 24) return ramp(t, 19.0, 19.9);
  if (t >= B[4][0] && t < B[5][0]) return ramp(t, 32.6, 33.4) + ramp(t, 34.4, 35.2);
  if (t >= B[5][0] && t < B[6][0]) return 2 + 6 * ramp(t, 36.4, 38.4);
  if (t >= B[7][0] && t < B[8][0]) return 8 * ramp(t, 57.4, 62.6);
  if (t >= B[8][0]) return 8;
  return 0;
};
const tranco = (t) => (t >= B[7][0] && t < B[8][0] ? ramp(t, 55.5, 57.4) * (0.5 + 0.5 * Math.sin(t * 9) ** 2) : t >= B[8][0] ? 1 : 0);
export const worldAt = (f) => {
  const S_ = shotAt(f), t = f / FPS;
  const q = queda(t), tr = tranco(t);
  const o = { jarro: 1, queda: q, tranco: tr, velocimetro: 1, vel: Math.min(1, q / 8) + 0.04 * tr * Math.sin(t * 17), jx: jxAt(t) };
  const fx = S_.beat >= 8 ? { terremoto: { pos: [ORIGEM.dojo.x + 1.5, ORIGEM.dojo.z - 1], k: S_.beat === 9 ? 1 : 0.5 * ramp(t, 57, 64) } } : undefined;
  return { cenario: 'dojo', dojo: o, fx };
};
const wide = { eye: 'wide', mouth: 'o' };
export const actorsAt = (f, T, W) => {
  const S_ = shotAt(f), t = f / FPS, O = ORIGEM[S_.cen], tint = luz(S_.cen).tint, X = (a) => ({ tint, ...a }), out = [], b = S_.beat;
  const P = (n, pose, dx, dz) => out.push(X(boneco(W, n, pose, O.x + dx, O.z + dz, t)));
  const duo = S_.cam === 'duo', TX = duo ? -0.75 : -0.8, TZ = duo ? 0.35 : 0.7, IMP = [0.85, 0.4];
  if (b === 1) { P('tiao', { ...wide, aR: [2.5, -0.2], aL: [-0.3, 0.3] }, TX, TZ); P('imperador', { eye: 'normal', mouth: 'flat', f: -1, aL: [-0.3, 0.3] }, ...IMP); }
  else if (b === 2) { P('tiao', { ...wide, aR: [2.5, -0.2] }, TX, TZ); if (!duo) { P('imperador', { eye: 'happy', mouth: 'grin', f: -1, aL: [-0.3, 0.3] }, ...IMP); P('vizinha', { eye: 'happy', mouth: 'grin', f: -1 }, 1.4, 0.3); } }
  else if (b === 3) { P('tiao', { ...wide }, TX, TZ); if (!duo) P('imperador', { eye: 'normal', mouth: 'flat', f: -1, aL: [1.2, -0.2], aR: [1.2, -0.2] }, ...IMP); }
  else if (b === 4) {
    if (t > 24.6) { const x = jxAt(t) - 0.75; P('tiao', { eye: 'normal', mouth: 'flat', aR: [1.0, -0.2], aL: [1.0, -0.2] }, x, TZ); }
    else { P('tiao', { ...wide }, TX, TZ); P('imperador', { eye: 'happy', mouth: 'grin', f: -1, aR: [2.5, -0.2] }, ...IMP); P('balconista', { eye: 'happy', mouth: 'grin', f: -1 }, 1.4, 0.3); }
  }
  else if (b === 5) P('tiao', { ...wide, aR: [2.0, -0.2] }, TX, TZ);
  else if (b === 6) { const u = Math.min(1, (t - B[5][0]) / (B[5][1] - B[5][0])); out.push(X(anda(W, 'tiao', { ...wide, aR: [2.6, -0.2], aL: [2.6, -0.2] }, [O.x - 1.2, O.z + 0.6], [O.x + 0.3, O.z + 1.1], u, t))); P('carteiro', { eye: 'happy', mouth: 'grin', f: -1 }, 1.1, 0.4); }
  else if (b === 7) { P('tiao', { ...wide, aL: [-0.35, 0.25] }, TX, TZ); if (!duo) P('carteiro', { eye: 'happy', mouth: 'grin', f: -1 }, 1.1, 0.4); }
  else if (b === 8) P('tiao', { ...wide, aR: [2.4, -0.2] }, TX, TZ);
  else if (b === 9) P('tiao', { ...wide, aR: [2.5, -0.2], aL: [2.5, -0.2] }, TX, TZ);
  return out;
};
export const fxAt = () => [];
