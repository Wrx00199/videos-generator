// Ep.40 "Tião contra o trem" (20/11, ref BDhG_VplvzA). Planos por tempo (FT = tempos das 15 falas). Pacote trem (cenarios7.js). Tião sempre presente (bike ou na cena).
import { FT, DUR } from './tempos.js';
import { camFromKeys } from './motion.js';
import { luz } from './luzes.js';
import { boneco } from './acoes.js';
import { ORIGEM, camCen } from './cenarios.js';
export const FPS = 30, TOTAL = Math.round(DUR * 30);
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), sm = (t) => { t = cl(t); return t * t * t * (t * (t * 6 - 15) + 10); }, lerp = (a, b, t) => a + (b - a) * t;
const F = (i) => FT[i][0];
const falando = (i, t) => t >= FT[i][0] && t <= FT[i][1];
// s = seg. de início; cam: nome do banco (pradaria: geral/caixa/mostrador/bike/trem/traseira; estacao: geral/cartaz; cabine: geral/janela; fim_tarde: geral/horizonte); vx = m/s de travelling (cena anda junto com a câmera);
// w(lt, u) -> opções do cenário; a(lt, u, x0) -> lista de atores {n, pose, x, z, y?}; dx = deslocamento fixo de câmera
const tb = (x0, lt, o = {}) => ({ n: 'tiao', x: x0 - 1.3 + (o.dx || 0), z: 0, y: 0.5, apoio: 'selim', pose: { f: 1, hipY: -34, lean: 0.25 + (o.lean || 0), eye: o.eye || 'wide', mouth: o.mouth || 'o', lL: [0.35 + 0.25 * Math.cos(lt * (o.rpm || 6)), -0.55 + 0.25 * Math.sin(lt * (o.rpm || 6))], lR: [0.35 - 0.25 * Math.cos(lt * (o.rpm || 6)), -0.55 - 0.25 * Math.sin(lt * (o.rpm || 6))], aR: [1.0, -0.2], aL: [1.0, -0.2], ...(o.pose || {}) } });
const PL = [
  { s: 0, cen: 'pradaria_trilho', cam: 'bike', vx: 2, w: () => ({ bike: 1, fumaca: 0.8 }), ac: (lt, u, x0) => [tb(x0, lt)] },
  { s: 2.6, cen: 'pradaria_trilho', cam: 'trem', vx: 0, dx: -6.2, w: () => ({ bike: 1, fumaca: 1 }), ac: (lt, u, x0) => [tb(x0, lt, { rpm: 0 })] },
  { s: F(1), cen: 'pradaria_trilho', cam: 'trem', vx: 0, dx: -6.2, w: () => ({ tabuas: 1, bike: 1 }), ac: (lt, u, x0) => [tb(x0, lt, { rpm: 0, eye: 'wide', mouth: 'smile' })] },
  { s: F(2), cen: 'pradaria_trilho', cam: 'bike', vx: 0, w: () => ({ bike: 1, tremX: 0.6 }), ac: (lt, u, x0) => [tb(x0, lt, { rpm: 0, mouth: 'smile' })] },
  { s: F(2) + 1.8, cen: 'pradaria_trilho', cam: 'geral', vx: 0, w: () => ({ bike: 1, tremX: 0.6 }), ac: (lt, u, x0) => [tb(x0, lt, { rpm: 0, eye: 'happy', mouth: 'grin' })] },
  { s: F(3), cen: 'estacao_trem', cam: 'geral', vx: 0, w: () => ({ apito: 0 }), ac: (lt, u, x0, t) => [{ n: 'apostador', x: 0.45, z: 0.5, f: -1, pose: { f: -1, eye: 'happy', mouth: falando(3, t) ? 'o' : 'grin', aL: [-0.5, 0.4], aR: [1.2, 0.2] } }, { n: 'tiao', x: -0.7, z: 0.9, pose: { eye: 'wide', mouth: 'smile', aL: [-0.35, 0.25] } }] },
  { s: F(4), cen: 'estacao_trem', cam: 'geral', vx: 0, w: (lt, u) => ({ apito: 1 }), ac: (lt, u, x0, t) => [{ n: 'apostador', x: 0.45, z: 0.5, f: -1, pose: { f: -1, eye: 'wide', mouth: 'o', aL: [-0.5, 0.4], aR: [1.4, 0.3] } }, { n: 'tiao', x: -0.7, z: 0.9, pose: { eye: 'wide', mouth: 'o' } }] },
  { s: F(4) + 1.6, cen: 'pradaria_trilho', cam: 'bike', vx: 5, w: () => ({ bike: 1, fumaca: 1 }), ac: (lt, u, x0) => [tb(x0, lt, { rpm: 9 })] },
  { s: F(5), cen: 'pradaria_trilho', cam: 'mostrador', vx: 4, w: (lt, u, t) => ({ velocimetro: 1, bike: 0, vel: sm((t - F(5)) / 4.2) }), ac: () => [] },
  { s: F(5) + 3.2, cen: 'pradaria_trilho', cam: 'bike', vx: 6, w: () => ({ bike: 1, vento: 1, fumaca: 1 }), ac: (lt, u, x0) => [tb(x0, lt, { rpm: 12, lean: 0.1, eye: 'wide', mouth: 'o', pose: { vento: 0.8 } })] },
  { s: F(6), cen: 'pradaria_trilho', cam: 'bike', vx: 5, w: () => ({ bike: 1, vento: 1, fumaca: 1 }), ac: (lt, u, x0) => [tb(x0, lt, { rpm: 14, lean: -0.15 * Math.sin(lt * 5), eye: 'wide', mouth: 'o' })] },
  { s: F(6) + 3.4, cen: 'estacao_trem', cam: 'geral', vx: 0, w: () => ({ caixa: 0 }), ac: (lt, u, x0, t) => [{ n: 'apostador', x: 0.45, z: 0.5, f: -1, pose: { f: -1, eye: 'happy', mouth: 'grin', aR: [1.3, 0.2] } }] },
  { s: F(7), cen: 'nevasca', cam: 'geral', vx: 0, w: () => ({ vento: 0.8 }), ac: (lt, u, x0, t) => [{ n: 'gigante', x: -0.55 + 0.04 * lt, z: 0.4, pose: { eye: 'wide', mouth: 'smile' } }, { n: 'tiao', x: -0.55 + 0.04 * lt + 1.05, z: 0.6, pose: { f: -1, eye: 'happy', mouth: 'grin' } }] },
  { s: F(8), cen: 'pradaria_trilho', cam: 'bike', vx: 6, w: (lt) => ({ bike: 1, vento: 1, fumaca: 1 }), ac: (lt, u, x0) => [tb(x0, lt, { rpm: 14, lean: 0.05, eye: 'wide', mouth: 'o', pose: { vento: 1 } })] },
  { s: F(9), cen: 'pradaria_trilho', cam: 'bike', vx: 6, w: (lt, u) => ({ bike: 1, vento: 1 - sm(u * 1.5), bolha: sm(u * 1.2), fumaca: 1 }), ac: (lt, u, x0) => [tb(x0, lt, { rpm: 8, eye: 'wide', mouth: 'o', pose: { vento: 1 - sm(u * 2) } })] },
  { s: F(10), cen: 'pradaria_trilho', cam: 'bike', vx: 6, w: () => ({ bike: 1, bolha: 1, fumaca: 1 }), ac: (lt, u, x0) => [tb(x0, lt, { rpm: 5, eye: 'happy', mouth: 'grin', pose: { vento: 0 } })] },
  { s: F(11), cen: 'pradaria_trilho', cam: 'bike', vx: 6, w: (lt, u) => ({ bike: 1, bolha: 1, vento: 1, fumaca: 1 }), ac: (lt, u, x0) => [tb(x0, lt - 0, { rpm: 6, eye: 'happy', mouth: 'grin', pose: { vento: 0 } })] },
  { s: F(11) + 2.4, cen: 'pradaria_trilho', cam: 'bike', vx: 6, w: (lt, u) => ({ bike: 1, bolha: 0.4, vento: 1, fumaca: 1 }), ac: (lt, u, x0) => [tb(x0, lt, { dx: -0.15 * sm(u * 3), rpm: 16, lean: 0.35, eye: 'shut', mouth: 'o', pose: { vento: 1 } })] },
  { s: F(12), cen: 'cabine_locomotiva', cam: 'geral', vx: 0, w: (lt, u) => ({ vel: 0.9, cron: Math.round(58 * cl(u * 1.25)) }), ac: (lt, u, x0, t) => [{ n: 'cap', x: -0.45, z: -0.6, f: -1, pose: { f: -1, eye: 'wide', mouth: 'o', aL: [-0.4, 0.3] } }] },
  { s: F(12) + 2.4, cen: 'cabine_locomotiva', cam: 'janela', vx: 0, w: (lt, u) => ({ vel: 0.9, cron: 58, alavanca: 1 }), ac: (lt, u, x0, t) => [{ n: 'cap', x: -0.1, z: -1.9, f: -1, pose: { f: -1, eye: 'wide', mouth: 'o', aL: [-0.4, 0.3] } }] },
  { s: F(13), cen: 'pradaria_trilho', cam: 'bike', vx: 3, w: () => ({ bike: 1, fumaca: 1 }), ac: (lt, u, x0) => [tb(x0, lt, { dx: 0.6 * sm(u * 1.5), rpm: 10, eye: 'wide', mouth: 'o' })] },
  { s: F(13) + 2.6, cen: 'pradaria_trilho', cam: 'traseira', vx: 3, w: () => ({ bike: 0, fumaca: 1 }), ac: (lt, u, x0) => [{ n: 'tiao', x: x0 - 0.2, z: 0.55, pose: { eye: 'wide', mouth: 'o', aR: [2.5, -0.2], aL: [-0.35, 0.25] } }] },
  { s: F(14), cen: 'pradaria_trilho', cam: 'geral', vx: 3, w: () => ({ bike: 0, fumaca: 1 }), ac: (lt, u, x0) => [{ n: 'tiao', x: x0 - 0.35, z: 0.1, y: 0.5, apoio: 'plataforma', pose: { eye: 'happy', mouth: 'grin', aR: [2.5, -0.2], aL: [2.2, -0.2] } }] },
  { s: F(14) + 1.5, cen: 'fim_tarde', cam: 'geral', vx: 0, w: (lt, u) => ({ ponto: 0.12 + 0.75 * sm(u) }), ac: (lt, u, x0, t) => [{ n: 'apostador', x: 0.3, z: 1.2, f: -1, pose: { f: -1, eye: 'wide', mouth: falando(14, t) ? 'o' : 'o', aL: [-0.4, 0.3], aR: [-0.4, 0.3] } }, { n: 'tiao', x: 0, z: -36 - 0.75 * 120 * sm(u) * 1 + 0.0, longe: true, pose: { eye: 'happy', mouth: 'grin', aR: [2.5, -0.2] } }] },
];
PL.forEach((p, i) => { p.a0 = Math.round(p.s * 30); });
export const SHOTS = PL.map((p, i) => ({ ...p, id: 's' + i, a: p.a0, b: (PL[i + 1] ? PL[i + 1].a0 : TOTAL) - 1, light: p.cen }));
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
export const LIGHTS = {};
export const lightFor = (S) => luz(S.light);
const loc = (f, S) => { const lt = (f - S.a) / 30, u = cl((f - S.a) / Math.max(1, S.b - S.a)); return { lt, u, t: f / 30 }; };
export const camAt = (f) => { const S = shotAt(f), { lt } = loc(f, S), dx = (S.dx || 0) + S.vx * lt, c = camCen(S.cen, S.cam, dx, 0); const push = S.cam === 'bike' || S.cam === 'caixa' ? 0.06 : 0.1; const p = (v, w, k) => [lerp(v[0], w[0], k), lerp(v[1], w[1], k), lerp(v[2], w[2], k)];
  return camFromKeys([{ f: S.a, ...c }, { f: S.b, pos: p(c.pos, c.look, push), look: c.look, fov: c.fov }], f); };
export const dofAt = (f) => { const S = shotAt(f), { lt } = loc(f, S), c = camCen(S.cen, S.cam, (S.dx || 0) + S.vx * lt, 0); return { focus: Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), cinf: 12 }; };
export const worldAt = (f) => { const S = shotAt(f), { lt, u, t } = loc(f, S), x0 = 0.6 + S.vx * lt; const o = { tremX: x0, ...S.w(lt, u, t) }; if (o.tremX == null) o.tremX = x0; if (S.w(lt, u, t).tremX != null) o.tremX = S.w(lt, u, t).tremX + S.vx * lt;
  return { cenario: S.cen, [S.cen]: o, fx: S.cen === 'nevasca' ? { chuva: { pos: [ORIGEM.nevasca.x, ORIGEM.nevasca.z], k: 1, tipo: 'neve' } } : undefined }; };
export const actorsAt = (f, T, W) => {
  const S = shotAt(f), { lt, u, t } = loc(f, S), O = ORIGEM[S.cen], tint = luz(S.light).tint, wo = worldAt(f)[S.cen], x0 = wo.tremX ?? 0.6;
  return S.ac(lt, u, x0, t).map((A) => { const ex = { tint }; const x = O.x + A.x, z = O.z + A.z; if (A.y != null) { ex.y = O.y + A.y; ex.apoio = A.apoio || 'salto'; } if (A.longe) ex.longe = true; return boneco(W, A.n, A.pose, x, z, t, ex); });
};
export const fxAt = () => [];
