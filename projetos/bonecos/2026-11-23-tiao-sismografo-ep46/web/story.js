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
const S = (t0, cen, cam, extra = {}) => ({ t0, cen, cam, push: 0.16, ...extra });
const LISTA = [
  S(0, 'dojo', 'medio', { id: 'b1', beat: 1 }),
  S(B[1][0], 'dojo', 'geral', { id: 'b2a', beat: 2 }),
  S(9.6, 'pradaria_trilho', 'mostrador', { id: 'b2b', beat: 2 }),
  S(B[2][0], 'dojo', 'medio', { id: 'b3a', beat: 3 }),
  S(18.2, 'pradaria_trilho', 'mostrador', { id: 'b3b', beat: 3 }),
  S(B[3][0], 'dojo', 'geral', { id: 'b4a', beat: 4 }),
  S(24.6, 'pradaria_trilho', 'geral', { id: 'b4b', beat: 4 }),
  S(B[4][0], 'noite', 'medio', { id: 'b5', beat: 5 }),
  S(B[5][0], 'dojo', 'geral', { id: 'b6', beat: 6 }),
  S(B[6][0], 'dojo', 'medio', { id: 'b7a', beat: 7 }),
  S(47.5, 'cidade', 'ruina', { id: 'b7b', beat: 7 }),
  S(50.6, 'pradaria_trilho', 'mostrador', { id: 'b7c', beat: 7 }),
  S(B[7][0], 'pradaria_trilho', 'mostrador', { id: 'b8', beat: 8, push: 0.25 }),
  S(B[8][0], 'cidade', 'ruina', { id: 'b9', beat: 9, push: 0.2 }),
];
export const SHOTS = LISTA.map((s, i) => ({ ...s, a: F(s.t0), b: i + 1 < LISTA.length ? F(LISTA[i + 1].t0) : TOTAL }));
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f < s.b) || SHOTS.at(-1);
export const LIGHTS = {};
export const lightFor = (S_) => luz(S_.cen);
export const camAt = (f) => {
  const S_ = shotAt(f), c = camCen(S_.cen, S_.cam), u = Math.max(0, Math.min(1, (f - S_.a) / Math.max(1, S_.b - S_.a)));
  const k = 1 - S_.push * sm(u), t = f / FPS;
  const tr = S_.beat >= 8 ? tremor(f, S_.beat === 9 ? 1 : 0.5 * ramp(t, 57, 64)) : { dx: 0, dy: 0 };
  const pos = c.pos.map((v, i) => c.look[i] + (v - c.look[i]) * k);
  pos[0] += tr.dx; pos[1] += tr.dy;
  return { pos, look: c.look, fov: c.fov };
};
export const dofAt = (f) => { const c = camAt(f); return { focus: Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), cinf: 0 }; };
// ponteiro do "jarro": 0..1 (bolas caindo). b3: 1 bola cai e nada; b8: tranco -> bolas, 8 no fim
const agulha = (t) => {
  if (t < 18.2) return 0;
  if (t < 21.3) return 0.1 * Math.sin(Math.PI * ramp(t, 19.0, 19.8)) * (1 - ramp(t, 19.8, 20.4));
  if (t >= 50.6 && t < B[7][0]) return 0.12 * Math.sin(t * 7);
  if (t >= B[7][0] && t < B[8][0]) { const u = (t - B[7][0]) / (B[7][1] - B[7][0]); return Math.min(1, 0.15 + 0.85 * sm((u - 0.45) / 0.5)) + 0.05 * Math.sin(t * 12); }
  return 0;
};
export const worldAt = (f) => {
  const S_ = shotAt(f), t = f / FPS, o = {};
  if (S_.cen === 'pradaria_trilho') Object.assign(o, { trem: 0, bike: 0, tabuas: 0, velocimetro: 1, vel: agulha(t), nuvens: 1 });
  const fx = (S_.beat >= 8 && (S_.cen === 'cidade')) ? { terremoto: { pos: [ORIGEM.cidade.x + 4, ORIGEM.cidade.z], k: S_.beat === 9 ? 1 : 0.5 } } : (S_.beat === 8 && S_.cen === 'pradaria_trilho' ? { terremoto: { pos: [ORIGEM.pradaria_trilho.x, ORIGEM.pradaria_trilho.z], k: ramp(t, 58, 64) } } : undefined);
  return { cenario: S_.cen, [S_.cen]: o, fx };
};
const wide = { eye: 'wide', mouth: 'o' };
export const actorsAt = (f, T, W) => {
  const S_ = shotAt(f), t = f / FPS, O = ORIGEM[S_.cen], tint = luz(S_.cen).tint, X = (a) => ({ tint, ...a }), out = [], b = S_.beat;
  const P = (n, pose, dx, dz) => out.push(X(boneco(W, n, pose, O.x + dx, O.z + dz, t)));
  if (S_.cen === 'dojo') {
    const riso = b === 2 || (b === 4 && t > 22.5) || (b === 7 && t < 46);
    if (b === 1) { P('tiao', { ...wide, aR: [2.5, -0.2], aL: [-0.3, 0.3] }, -0.8, 0.9); P('rei', { eye: 'normal', mouth: 'flat', f: -1, aL: [-0.3, 0.3] }, 0.8, 0.5); return out; }
    if (b === 6) { const u = Math.min(1, (t - B[5][0]) / (B[5][1] - B[5][0])); out.push(X(anda(W, 'tiao', { ...wide, aR: [2.6, -0.2], aL: [2.6, -0.2] }, [O.x - 1.6, O.z + 0.3], [O.x + 0.6, O.z + 1.1], u, t))); P('carteiro', { eye: 'happy', mouth: 'grin', f: -1 }, 1.3, 0.5); return out; }
    if (b === 3) { P('tiao', { ...wide }, -0.7, 0.9); P('rei', { eye: 'normal', mouth: 'flat', f: -1, aL: [1.2, -0.2], aR: [1.2, -0.2] }, 0.7, 0.5); return out; }
    if (b === 2) { P('rei', { eye: 'happy', mouth: 'grin', f: -1, aL: [-0.3, 0.3] }, 0.2, 0.2); P('vizinha', { eye: 'happy', mouth: 'grin', f: -1 }, 1.0, 0.9); P('feirante', { eye: 'happy', mouth: 'grin', f: 1 }, -1.0, 0.7); P('tiao', { ...wide, aR: [2.5, -0.2] }, -0.1, 1.2); return out; }
    if (b === 4) { P('tiao', { ...wide }, -0.8, 0.9); P('rei', { eye: 'happy', mouth: 'grin', f: -1, aR: [2.5, -0.2] }, 0.7, 0.5); P('balconista', { eye: 'happy', mouth: 'grin', f: -1 }, 1.4, 0.9); return out; }
    if (b === 7) { P('carteiro', { eye: 'happy', mouth: 'grin', f: -1 }, 0.6, 0.6); P('tiao', { ...wide, aL: [-0.35, 0.25] }, -0.8, 0.9); return out; }
  }
  if (S_.cen === 'pradaria_trilho') {
    if (b === 2) { P('tiao', { ...wide, aR: [2.5, -0.2] }, -1.9, 1.7); return out; }
    if (b === 3) { P('tiao', { ...wide }, -1.9, 1.7); return out; }
    if (b === 4) { const u = Math.min(1, (t - 24.6) / (B[3][1] - 24.6)); out.push(X(anda(W, 'tiao', { eye: 'normal', mouth: 'flat' }, [O.x - 3.0, O.z + 1.2], [O.x + 0.6, O.z + 1.2], u, t))); return out; }
    if (b === 7 || b === 8) { P('tiao', { ...wide, aR: [2.4, -0.2], aL: [-0.3, 0.3] }, -1.9, 1.7); return out; }
  }
  if (S_.cen === 'noite') { P('tiao', { ...wide, aR: [2.0, -0.2] }, 0, 0.9); return out; }
  if (S_.cen === 'cidade') { P('tiao', { ...wide, aR: [2.5, -0.2], aL: [2.5, -0.2] }, 3.6, 0.2); return out; }
  return out;
};
export const fxAt = () => [];
