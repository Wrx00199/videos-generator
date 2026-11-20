// story_trem.js — PORTÃO DO PACOTE TREM (cenarios7.js): 1 quadro por cenário/objeto. Uso: bash portao_trem.sh "<quadros>"  (ex.: "0" ou "0,1,2")
import { camFromKeys } from './motion.js';
import { luz } from './luzes.js';
import { boneco } from './acoes.js';
import { ORIGEM, camCen } from './cenarios.js';
export const FPS = 30, TOTAL = 20;
export const SHOTS = [
  { a: 0, cen: 'pradaria_trilho', cam: 'geral', opt: { bike: 1, vel: 0.4, velocimetro: 1, tremX: 0.6 }, a2: 'cap' },
  { a: 1, cen: 'pradaria_trilho', cam: 'mostrador', opt: { velocimetro: 1, vel: 0.6, tremX: 0.6 }, solo: 1 },
  { a: 2, cen: 'pradaria_trilho', cam: 'geral', opt: { bike: 1, bolha: 1, vento: 1, tremX: 0.6 }, a2: 'cap' },
  { a: 3, cen: 'estacao_trem', cam: 'geral', opt: { apito: 1 }, a2: 'apostador' },
  { a: 4, cen: 'estacao_trem', cam: 'cartaz', opt: {}, solo: 1 },
  { a: 5, cen: 'nevasca', cam: 'geral', opt: {}, a2: 'gigante' },
  { a: 6, cen: 'cabine_locomotiva', cam: 'geral', opt: { vel: 0.7 }, a2: 'cap' },
  { a: 7, cen: 'fim_tarde', cam: 'geral', opt: {}, a2: 'cap' },
  { a: 8, cen: 'pradaria_trilho', cam: 'caixa', opt: { tremX: 0.6, bike: 1 }, solo: 1 },
  { a: 9, cen: 'fim_tarde', cam: 'horizonte', opt: { ponto: 0.9 }, solo: 1 },
  { a: 10, cen: 'pradaria_trilho', cam: 'bike', opt: { bike: 1, tremX: 0.6, bolha: 1 }, solo: 1, tiaoBike: 1 },
];
export const shotAt = (f) => SHOTS.find((s) => s.a === f) || SHOTS[0];
export const LIGHTS = {};
export const lightFor = (S) => luz(S.cen);
export const camAt = (f) => { const S = shotAt(f), c = camCen(S.cen, S.cam); return camFromKeys([{ f: 0, ...c }, { f: 99, ...c }], f); };
export const dofAt = (f) => { const S = shotAt(f), c = camCen(S.cen, S.cam); return { focus: Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), cinf: 12 }; };
export const worldAt = (f) => { const S = shotAt(f); return { cenario: S.cen, [S.cen]: S.opt, fx: S.cen === 'nevasca' ? { chuva: { pos: [ORIGEM.nevasca.x, ORIGEM.nevasca.z], k: 1, tipo: 'neve' } } : undefined }; };
export const actorsAt = (f, T, W) => {
  const S = shotAt(f), t = f / 30, O = ORIGEM[S.cen], tint = luz(S.cen).tint, out = [], X = (a) => ({ tint, ...a });
  if (S.tiaoBike) { const ph = t * 6; out.push(X(boneco(W, 'tiao', { f: 1, hipY: -34, lean: 0.25, eye: 'wide', mouth: 'o', lL: [0.35 + 0.25 * Math.cos(ph), -0.55 + 0.25 * Math.sin(ph)], lR: [0.35 - 0.25 * Math.cos(ph), -0.55 - 0.25 * Math.sin(ph)], aR: [1.0, -0.2], aL: [1.0, -0.2] }, O.x - 0.7, O.z + 0.0, t, { y: 0.5, apoio: 'selim' }))); return out; }
  if (S.solo) return out;
  out.push(X(boneco(W, 'tiao', { eye: 'wide', mouth: 'o', aR: [2.5, -0.2], aL: [-0.35, 0.25] }, O.x - 0.7, O.z + 0.9, t)));
  out.push(X(boneco(W, S.a2, { eye: 'wide', mouth: 'o', f: -1, aL: [-0.4, 0.3] }, O.x + 0.8, O.z + 0.5, t)));
  return out;
};
export const fxAt = () => [];
