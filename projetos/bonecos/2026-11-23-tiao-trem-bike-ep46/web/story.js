// ep46 — O Tião contra o trem. Cena presa nas palavras: tempos vêm de tempos.js (FT = [ini,fim] por beat, medido na voz).
import { camFromKeys } from './motion.js';
import { luz } from './luzes.js';
import { boneco, anda } from './acoes.js';
import { ORIGEM, camCen } from './cenarios.js';
import { FT, DUR } from './tempos.js';
export const FPS = 30, TOTAL = Math.round(DUR * FPS);
const F = (s) => Math.round(s * FPS);
const sm = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
const ramp = (t, a, b) => sm((t - a) / (b - a));
const B = FT; // B[i] = [ini, fim] do beat i+1
// close do apostador (estação): câmera relativa à origem do cenário
const CUSTOM = {
  apost: { cen: 'estacao_trem', pos: [0.95, 1.5, 2.3], look: [0.8, 1.45, 0.5], fov: 34 },
};
// SHOTS: t0..t1 em segundos; cam = nome em camCen ou CUSTOM; push = quanto a câmera se aproxima até o fim do plano
const S = (t0, t1, cen, cam, extra = {}) => ({ a: F(t0), b: F(t1), cen, cam, push: 0.16, ...extra });
export const SHOTS = [
  S(0, B[1][0], 'pradaria_trilho', 'geral', { id: 'b1', beat: 1 }),
  S(B[1][0], 7.9, 'estacao_trem', 'cartaz', { id: 'b2a', beat: 2 }),
  S(7.9, B[2][0], 'pradaria_trilho', 'caixa', { id: 'b2b', beat: 2 }),
  S(B[2][0], B[3][0], 'estacao_trem', 'apost', { id: 'b3', beat: 3 }),
  S(B[3][0], 17.6, 'estacao_trem', 'geral', { id: 'b4a', beat: 4 }),
  S(17.6, B[4][0], 'pradaria_trilho', 'traseira', { id: 'b4b', beat: 4 }),
  S(B[4][0], 21.5, 'pradaria_trilho', 'mostrador', { id: 'b5a', beat: 5 }),
  S(21.5, B[5][0], 'pradaria_trilho', 'bike', { id: 'b5b', beat: 5 }),
  S(B[5][0], 26.9, 'pradaria_trilho', 'bike', { id: 'b6a', beat: 6 }),
  S(26.9, B[6][0], 'estacao_trem', 'apost', { id: 'b6b', beat: 6 }),
  S(B[6][0], B[7][0], 'nevasca', 'geral', { id: 'b7', beat: 7 }),
  S(B[7][0], 36.0, 'pradaria_trilho', 'trem', { id: 'b8a', beat: 8 }),
  S(36.0, B[8][0], 'pradaria_trilho', 'traseira', { id: 'b8b', beat: 8 }),
  S(B[8][0], B[9][0], 'pradaria_trilho', 'bike', { id: 'b9', beat: 9 }),
  S(B[9][0], B[10][0], 'cabine_locomotiva', 'janela', { id: 'b10', beat: 10 }),
  S(B[10][0], 49.0, 'pradaria_trilho', 'caixa', { id: 'b11a', beat: 11 }),
  S(49.0, B[11][0], 'pradaria_trilho', 'traseira', { id: 'b11b', beat: 11 }),
  S(B[11][0], DUR, 'fim_tarde', 'horizonte', { id: 'b12', beat: 12, push: 0.22 }),
];
SHOTS.forEach((s, i) => { s.a = i ? SHOTS[i - 1].b : 0; if (i === SHOTS.length - 1) s.b = TOTAL; });
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f < s.b) || SHOTS.at(-1);
export const LIGHTS = {};
export const lightFor = (S_) => luz(S_.cen);
const camBase = (S_) => {
  const c = CUSTOM[S_.cam];
  if (!c) return camCen(S_.cen, S_.cam);
  const o = ORIGEM[S_.cen]; return { pos: [o.x + c.pos[0], c.pos[1], o.z + c.pos[2]], look: [o.x + c.look[0], c.look[1], o.z + c.look[2]], fov: c.fov };
};
export const camAt = (f) => {
  const S_ = shotAt(f), c = camBase(S_), u = Math.max(0, Math.min(1, (f - S_.a) / Math.max(1, S_.b - S_.a)));
  const k = 1 - S_.push * sm(u);
  const pos = c.pos.map((v, i) => c.look[i] + (v - c.look[i]) * k);
  return { pos, look: c.look, fov: c.fov };
};
export const dofAt = (f) => { const c = camAt(f); return { focus: Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), cinf: 0 }; };

// ---- mundo por plano ----
const velAt = (t) => t < B[4][0] ? 0.3 : t < 20.3 ? 0.5 : t < 20.8 ? 0.5 + 0.15 * ramp(t, 20.3, 20.5) : 0.65 + 0.35 * ramp(t, 20.7, 21.2);
const dxBike = (t) => { // quanto o Tião+bike ficam pra trás da caixa (m); beat 6 escorrega, beat 9 sai do bolsão e volta
  if (t >= B[5][0] && t < B[6][0]) return -0.35 * ramp(t, 25.4, 26.2) + 0.2 * ramp(t, 26.2, 26.6) - 0.1 * ramp(t, 26.6, 26.8);
  if (t >= B[8][0] && t < B[9][0]) return -1.1 * ramp(t, 40.0, 40.9) + 1.1 * ramp(t, 41.3, 42.3);
  return 0;
};
export const worldAt = (f) => {
  const S_ = shotAt(f), t = f / FPS, dx = dxBike(t), ph = t * 6;
  const o = {};
  if (S_.cen === 'pradaria_trilho') {
    Object.assign(o, { bike: 1, tremX: 0.6, vel: 0.4, pedal: ph, bikeX: 0.6 - 2.0 + dx, fumaca: 0.5 });
    if (S_.beat === 1) Object.assign(o, { velocimetro: 1, vel: 0.15, fumaca: 0.6 });
    if (S_.beat === 4) Object.assign(o, { vel: 0.3 });
    if (S_.beat === 5) Object.assign(o, { velocimetro: 1, vel: velAt(t), fumaca: 1 });
    if (S_.beat === 6) Object.assign(o, { velocimetro: 1, vel: 0.65, fumaca: 1 });
    if (S_.beat === 8) Object.assign(o, { vento: ramp(t, 33.4, 34.6), bolha: ramp(t, 35.0, 36.4) });
    if (S_.beat === 9) Object.assign(o, { bolha: 1, vento: 1 });
    if (S_.beat === 11) Object.assign(o, { bolha: 1, vento: 1 });
  }
  if (S_.cen === 'estacao_trem') Object.assign(o, { caixa: 1, cartaz: 'MIL REAIS', apito: S_.beat === 4 ? ramp(t, 15.9, 17.0) : 0 });
  if (S_.cen === 'nevasca') Object.assign(o, { vento: 0.6 });
  if (S_.cen === 'cabine_locomotiva') Object.assign(o, { cron: 58, vel: 0.9, alavanca: ramp(t, 44.6, 45.4), pressao: 0.8, fogo: 0.7 });
  if (S_.cen === 'fim_tarde') Object.assign(o, { notas: ramp(t, 52.0, 55.0), ponto: ramp(t, 51.0, 55.0), sol: 0.35 });
  return { cenario: S_.cen, [S_.cen]: o, fx: S_.cen === 'nevasca' ? { chuva: { pos: [ORIGEM.nevasca.x, ORIGEM.nevasca.z], k: 1, tipo: 'neve' } } : undefined };
};

// ---- atores ----
const wide = { eye: 'wide', mouth: 'o' };
export const actorsAt = (f, T, W) => {
  const S_ = shotAt(f), t = f / FPS, O = ORIGEM[S_.cen], tint = luz(S_.cen).tint, X = (a) => ({ tint, ...a }), out = [];
  const tiaoBike = (dx, pose = {}) => {
    const ph = t * 6;
    return X(boneco(W, 'tiao', { f: 1, hipY: -34, lean: 0.25, eye: 'wide', mouth: 'o', lL: [0.35 + 0.25 * Math.cos(ph), -0.55 + 0.25 * Math.sin(ph)], lR: [0.35 - 0.25 * Math.cos(ph), -0.55 - 0.25 * Math.sin(ph)], aR: [1.0, -0.2], aL: [1.0, -0.2], ...pose }, O.x - 0.7 + dx, O.z, t, { y: 0.5, apoio: 'selim' }));
  };
  const b = S_.beat;
  if (S_.cen === 'pradaria_trilho') {
    const dx = dxBike(t);
    if (b === 11 && S_.id === 'b11a') { out.push(X(boneco(W, 'tiao', { ...wide, aR: [2.6, -0.2], aL: [2.4, -0.2] }, O.x - 0.2, O.z + 0.9, t))); return out; }
    if (b === 5 && S_.id === 'b5a') return out; // close do mostrador: objeto é o foco
    if (b === 2) { out.push(X(boneco(W, 'tiao', { ...wide, aR: [2.6 + 0.3 * Math.sin(t * 9), -0.2], aL: [-0.3, 0.3] }, O.x + 0.1, O.z + 1.0, t))); return out; }
    if (b === 1) { for (const [n, x, z, g] of [['vizinha', 1.6, 1.4, -1], ['carteiro', 2.3, 1.1, -1], ['feirante', 3.0, 1.5, -1]]) out.push(X(boneco(W, n, { ...wide, f: g, aR: [2.2 + 0.2 * Math.sin(t * 4 + x), -0.2] }, O.x + x, O.z + z, t))); }
    const lose = b === 6 ? { eye: 'wide', mouth: 'o', lean: 0.25 + 0.35 * Math.sin(Math.max(0, t - 25.4) * 5) } : {};
    out.push(tiaoBike(dx, lose));
    return out;
  }
  if (S_.cen === 'estacao_trem') {
    const grin = b === 6 || b === 3;
    out.push(X(boneco(W, 'apostador', { eye: 'happy', mouth: grin ? 'grin' : 'smile', f: -1, aL: [-0.4, 0.3], aR: b === 3 ? [2.4 + 0.2 * Math.sin(t * 6), -0.2] : [-0.3, 0.3] }, O.x + 0.8, O.z + 0.5, t)));
    if (b !== 3 && b !== 6) out.push(X(boneco(W, 'tiao', { ...wide, aR: [-0.3, 0.3], aL: [-0.35, 0.25] }, O.x - 0.7, O.z + 0.9, t)));
    return out;
  }
  if (S_.cen === 'nevasca') {
    const u = Math.min(1, (t - B[6][0]) / (B[6][1] - B[6][0]));
    out.push(X(anda(W, 'gigante', { eye: 'normal' }, [O.x - 0.8, O.z + 0.6], [O.x + 0.6, O.z + 0.6], u, t)));
    out.push(X(anda(W, 'tiao', { eye: 'happy', mouth: 'smile' }, [O.x - 1.9, O.z + 0.6], [O.x - 0.5, O.z + 0.6], u, t)));
    return out;
  }
  if (S_.cen === 'cabine_locomotiva') {
    const pull = ramp(t, 44.6, 45.4);
    out.push(X(boneco(W, 'cap', { ...wide, aR: [1.2 + 1.0 * pull, -0.2], aL: [-0.3, 0.3] }, O.x, O.z + 0.4, t)));
    return out;
  }
  if (S_.cen === 'fim_tarde') {
    out.push(X(boneco(W, 'apostador', { eye: 'wide', mouth: 'o', aL: [-0.3, 0.3], aR: [-0.3, 0.3] }, O.x, O.z + 0.9, t)));
    return out;
  }
  return out;
};
export const fxAt = () => [];
