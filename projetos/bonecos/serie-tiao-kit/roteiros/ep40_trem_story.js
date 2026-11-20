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
let TNOW = 0;
const PH = (o) => (o.rpm === 0 ? 0 : TNOW * 7);                 // fase do pedal = a mesma na bike (cenário) e nos pés do Tião
const tb = (x0, lt, o = {}) => { const ph = PH(o), cx = 0.3, cy = -0.7, r = 0.18; return { n: 'tiao', x: x0 - 2.12 + (o.dx || 0), z: 0.1, y: 0.72, apoio: 'selim', pose: { f: 1, hipY: -34, lean: 0.1 + (o.lean || 0), eye: o.eye || 'wide', mouth: o.mouth || 'o', lL: [cx + r * Math.cos(ph), cy + r * Math.sin(ph)], lR: [cx - r * Math.cos(ph), cy - r * Math.sin(ph)], aR: [1.2, -0.55], aL: [1.2, -0.55], ...(o.pose || {}) } }; };
const AP = (t, o = {}) => ({ n: 'apostador', x: 0.45, z: 0.5, f: -1, pose: { f: -1, eye: o.eye || 'happy', mouth: o.mouth || 'grin', aL: [-0.5, 0.4], aR: o.aR || [1.2, 0.2] } });
const TI = (o = {}) => ({ n: 'tiao', x: -0.7, z: 0.9, pose: { eye: o.eye || 'wide', mouth: o.mouth || 'o', aL: [-0.35, 0.25] } });
const PL = [
  // 0 gancho (0-6.4)
  { s: 0, cen: 'pradaria_trilho', cam: 'bike', vx: 2, w: () => ({ bike: 1, fumaca: 0.8 }), ac: (lt, u, x0) => [tb(x0, lt)] },
  { s: 3.0, cen: 'pradaria_trilho', cam: 'trem', vx: 0, dx: -6.2, parado: 1, w: () => ({ bike: 1, fumaca: 1 }), ac: (lt, u, x0) => [tb(x0, lt, { rpm: 0 })] },
  // 1 pista de madeira + caixa (6.4-12.5)
  { s: F(1), cen: 'pradaria_trilho', cam: 'trem', vx: 0, dx: -6.2, parado: 1, w: () => ({ tabuas: 1, bike: 1 }), ac: (lt, u, x0) => [tb(x0, lt, { rpm: 0, eye: 'wide', mouth: 'smile' })] },
  { s: F(1) + 3.4, cen: 'pradaria_trilho', cam: 'bike', vx: 0, parado: 1, w: () => ({ bike: 1 }), ac: (lt, u, x0) => [tb(x0, lt, { rpm: 0, eye: 'happy', mouth: 'grin' })] },
  // 2 apostador zomba (12.5-15.6)
  { s: F(2), cen: 'estacao_trem', cam: 'geral', vx: 0, w: () => ({ apito: 0 }), ac: (lt, u, x0, t) => [AP(t, { mouth: falando(2, t) ? 'o' : 'grin' }), TI({ mouth: 'smile' })] },
  // 3 apito + arranque (15.6-20.2)
  { s: F(3), cen: 'estacao_trem', cam: 'geral', vx: 0, w: () => ({ apito: 1 }), ac: (lt, u, x0, t) => [AP(t, { eye: 'wide', mouth: 'o', aR: [1.4, 0.3] }), TI()] },
  { s: F(3) + 2.0, cen: 'pradaria_trilho', cam: 'bike', vx: 5, w: () => ({ bike: 1, fumaca: 1 }), ac: (lt, u, x0) => [tb(x0, lt)] },
  // 4 degraus 30 40 50 (20.2-27.3)
  { s: F(4), cen: 'pradaria_trilho', cam: 'bike', vx: 4, w: (lt, u, t) => ({ velocimetro: 1, velX: -0.35, velZ: 0.95, bike: 1, vel: 0.28 + 0.27 * sm((t - F(4)) / 2.6) }), ac: (lt, u, x0) => [tb(x0, lt, { eye: 'wide', mouth: 'o' })] },
  { s: F(4) + 3.0, cen: 'pradaria_trilho', cam: 'bike', vx: 6, w: () => ({ bike: 1, vento: 1, fumaca: 1 }), ac: (lt, u, x0) => [tb(x0, lt, { lean: 0.1 })] },
  // 5 escorrega, um pé, dois, apostador sorri (27.3-33.4)
  { s: F(5), cen: 'pradaria_trilho', cam: 'bike', vx: 5, w: () => ({ bike: 1, vento: 1, fumaca: 1 }), ac: (lt, u, x0) => [tb(x0, lt, { lean: -0.15 * Math.sin(lt * 5) })] },
  { s: F(5) + 3.4, cen: 'estacao_trem', cam: 'geral', vx: 0, w: () => ({ caixa: 0 }), ac: (lt, u, x0, t) => [AP(t, { eye: 'happy', mouth: 'grin' })] },
  // 6 lá vai ele, como acompanha um trem? (33.4-37.5)
  { s: F(6), cen: 'pradaria_trilho', cam: 'bike', vx: 6, w: () => ({ bike: 1, vento: 1, fumaca: 1 }), ac: (lt, u, x0) => [tb(x0, lt, { eye: 'wide', mouth: 'o' })] },
  // 7 nevasca com o amigão (37.5-43.1)
  { s: F(7), cen: 'nevasca', cam: 'geral', vx: 0, w: () => ({ vento: 0.8 }), ac: () => [{ n: 'barbacoral', x: -0.6, z: -0.2, pose: { eye: 'wide', mouth: 'smile' } }, { n: 'tiao', x: 0.4, z: -0.3, pose: { f: -1, eye: 'happy', mouth: 'grin' } }] },
  // 8 parede de ar + bolsão atrás da caixa (43.1-51.3)
  { s: F(8), cen: 'pradaria_trilho', cam: 'bike', vx: 6, w: () => ({ bike: 1, vento: 1, fumaca: 1 }), ac: (lt, u, x0) => [tb(x0, lt, { eye: 'wide', mouth: 'o' })] },
  { s: F(8) + 3.6, cen: 'pradaria_trilho', cam: 'bike', vx: 6, w: (lt, u) => ({ bike: 1, vento: 1 - sm(u * 1.5), bolha: sm(u * 1.2), fumaca: 1 }), ac: (lt, u, x0) => [tb(x0, lt, { eye: 'wide', mouth: 'o' })] },
  // 9 dentro / fora / volta (51.3-58.8)
  { s: F(9), cen: 'pradaria_trilho', cam: 'close', dx: -1.43, vx: 6, w: () => ({ bike: 1, bolha: 1, fumaca: 1 }), ac: (lt, u, x0) => [tb(x0, lt, { eye: 'happy', mouth: 'grin' })] },
  { s: F(9) + 3.2, cen: 'pradaria_trilho', cam: 'bike', vx: 6, w: (lt, u) => ({ bike: 1, bolha: 0.35, vento: 1, fumaca: 1 }), ac: (lt, u, x0) => [tb(x0, lt, { lean: 0.35, eye: 'shut', mouth: 'o' })] },
  // 10 a milha / maquinista freia (58.8-64.3)
  { s: F(10), cen: 'cabine_locomotiva', cam: 'geral', vx: 0, w: (lt, u) => ({ vel: 0.9, cron: Math.round(58 * cl(u * 1.5)) }), ac: () => [{ n: 'cap', x: -0.1, z: -1.2, f: -1, pose: { f: -1, eye: 'wide', mouth: 'o', aL: [-0.4, 0.3] } }] },
  { s: F(10) + 3.6, cen: 'cabine_locomotiva', cam: 'janela', vx: 0, w: () => ({ vel: 0.9, cron: 58, alavanca: 1 }), ac: () => [{ n: 'cap', x: -0.1, z: -1.9, f: -1, pose: { f: -1, eye: 'wide', mouth: 'o', aL: [-0.4, 0.3] } }] },
  // 11 bate na caixa, puxam pra dentro (64.3-68.5)
  { s: F(11), cen: 'pradaria_trilho', cam: 'bike', vx: 3, w: () => ({ bike: 1, fumaca: 1 }), ac: (lt, u, x0) => [tb(x0, lt, { dx: 0.6 * sm(u * 1.5), eye: 'wide', mouth: 'o' })] },
  { s: F(11) + 2.4, cen: 'pradaria_trilho', cam: 'traseira', vx: 3, w: (lt, u, t, x0) => ({ bike: 1, bikeX: 0.6 + 3 * lt - 1.5, bikeY: 0.55 + 0.1 * Math.sin(lt * 6), bikeZ: 0.4, bikeRz: 0.45, pedal: 0, fumaca: 1 }), ac: (lt, u, x0) => [{ n: 'cap', x: x0 - 1.0, z: 0.75, pose: { f: 1, eye: 'wide', mouth: 'o', aR: [1.6, 0.1] } }, { n: 'tonho', x: x0 - 0.15, z: 0.75, f: -1, pose: { f: -1, eye: 'wide', mouth: 'o', aL: [-1.6, 0.1] } }, { n: 'tiao', x: x0 - 0.58, z: 0.75, y: 0.5, apoio: 'plataforma', pose: { eye: 'wide', mouth: 'o', aR: [1.7, 0.0], aL: [-1.7, 0.0] } }] },
  // 12 apostador vê o dinheiro virar um pontinho (68.5-72.8)
  { s: F(12), cen: 'pradaria_trilho', cam: 'geral', vx: 3, w: () => ({ bike: 0, fumaca: 1 }), ac: (lt, u, x0) => [{ n: 'tiao', x: x0 - 0.35, z: 0.7, y: 0.5, apoio: 'plataforma', pose: { eye: 'happy', mouth: 'grin', aR: [2.5, -0.2], aL: [2.2, -0.2] } }] },
  { s: F(12) + 1.4, cen: 'fim_tarde', cam: 'geral', vx: 0, w: (lt, u) => ({ ponto: 0.12 + 0.75 * sm(u), notas: 0.01 + 0.95 * u }), ac: (lt, u) => [{ n: 'apostador', x: 0.3, z: 1.2, f: -1, pose: { f: -1, eye: 'wide', mouth: 'o', aL: [-0.4, 0.3], aR: [-0.9, 0.9] } }] },
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
export const worldAt = (f) => { const S = shotAt(f), { lt, u, t } = loc(f, S), x0 = 0.6 + S.vx * lt; TNOW = t; const o = { tremX: x0, pedal: S.parado ? 0 : t * 7, ...S.w(lt, u, t, 0.6 + S.vx * lt) }; if (o.tremX == null) o.tremX = x0; if (S.w(lt, u, t).tremX != null) o.tremX = S.w(lt, u, t).tremX + S.vx * lt;
  return { cenario: S.cen, [S.cen]: o, fx: S.cen === 'nevasca' ? { chuva: { pos: [ORIGEM.nevasca.x, ORIGEM.nevasca.z], k: 1, tipo: 'neve' } } : undefined }; };
export const actorsAt = (f, T, W) => {
  TNOW = f / 30; const S = shotAt(f), { lt, u, t } = loc(f, S), O = ORIGEM[S.cen], tint = luz(S.light).tint, wo = worldAt(f)[S.cen], x0 = wo.tremX ?? 0.6;
  return S.ac(lt, u, x0, t).map((A) => { const ex = { tint }; const x = O.x + A.x, z = O.z + A.z; if (A.y != null) { ex.y = O.y + A.y; ex.apoio = A.apoio || 'salto'; } if (A.longe) ex.longe = true; return boneco(W, A.n, A.pose, x, z, t, ex); });
};
export const fxAt = () => [];
