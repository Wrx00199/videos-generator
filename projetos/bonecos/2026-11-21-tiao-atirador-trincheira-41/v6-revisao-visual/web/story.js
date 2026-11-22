// GERADO por ferramentas/montar_ep41.py — ep.41 vídeo real (tempos da voz). Não editar à mão.
import { KF } from './story_kf.js';
import { FT, DUR } from './tempos.js';
import { luz } from './luzes.js';
import { boneco } from './acoes.js';
import { ORIGEM, camCen } from './cenarios.js';
export const FPS = 30, TOTAL = Math.round(DUR * 30);
const SEG = [[0, 0], [158, 2], [248, 3], [316, 4], [371, 5], [405, 6], [560, 8], [682, 10], [742, 12], [832, 13], [915, 14], [981, 15], [1034, 16], [1111, 17], [1178, 18], [1264, 19], [1350, 20], [1417, 21], [1485, 22], [1550, 23], [1680, 24], [1781, 25], [1837, 26], [1957, 27], [1985, 30], [2189, 31], [2269, 32], [2346, 33], [2414, 34], [2481, 35]];
const QUEM = ["narrador", "narrador", "narrador", "narrador", "narrador", "narrador", "narrador", "narrador", "narrador", "narrador", "narrador", "narrador", "narrador", "narrador"];
const B = typeof location !== 'undefined' && location.hash === '#b';
export const SHOTS = KF;
export const LIGHTS = {};
const seg = (f) => { let i = 0; for (let q = 0; q < SEG.length; q++) if (f >= SEG[q][0]) i = q; return i; };
export const shotAt = (f) => { const q = seg(f), k = KF[SEG[q][1]]; const S = k.split ? KF[k.split[B ? 1 : 0]] : k; return { ...S, _a: SEG[q][0], _b: q + 1 < SEG.length ? SEG[q + 1][0] : TOTAL }; };
export const lightFor = (S) => luz(S.luz || S.cen || 'trincheira');
const cen = (S) => S.cen || 'trincheira';
const LERP = (a, b, w) => (typeof a === 'number' && typeof b === 'number') ? a + (b - a) * w : (Array.isArray(a) && Array.isArray(b) && a.length === b.length) ? a.map((v, i) => LERP(v, b[i], w)) : (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a)) ? Object.fromEntries([...new Set([...Object.keys(a), ...Object.keys(b)])].map((k) => [k, LERP(k in a ? a[k] : (typeof b[k] === 'number' ? 0 : b[k]), k in b ? b[k] : (typeof a[k] === 'number' ? 0 : a[k]), w)])) : b;
const ease = (w) => w * w * (3 - 2 * w);
const prevShot = (f) => { const q = seg(f); if (q === 0) return null; const S = shotAt(f), P = shotAt(SEG[q][0] - 1); return (P.pl === S.pl && P.cen === S.cen && P.cam === S.cam && !P.card && !S.card && !P.split) ? P : null; };   // só entre quadros-chave do MESMO plano e cenário
const wTr = (f, S) => Math.min(1, Math.max(0, (f - S._a) / Math.max(24, Math.min(54, S._b - S._a - 6))));   // transição 3D longa (0,8-1,8 s): câmera/ator mexem devagar, sem corte falso, sem dissolve (sem 2 cópias do mesmo boneco)
// vida (V3) + boca só na fala do personagem em cena (V12): respira, balança os braços; boca mexe só quando QUEM[i] == ator e t dentro da fala i
const vida = (M, t) => { const sd = M.n.length * 0.7, p = { ...M.pose }, a = t * 1.7 + sd;
  p.lean = (p.lean || 0) + Math.sin(t * 1.1 + sd * 2.4) * 0.02; p.bob = (p.bob || 0) - Math.abs(Math.sin(t * 1.1 + sd * 2.4)) * 5; p.tilt = (p.tilt || 0) + Math.sin(t * 0.8 + sd * 3.1) * 0.03;
  for (const k of ['aR', 'aL']) if (Array.isArray(p[k])) p[k] = [p[k][0] + 0.07 * Math.sin(a + (k === 'aL' ? 2 : 0)), p[k][1]];
  const i = FT.findIndex((x, q) => QUEM[q] === M.n && t >= x[0] && t <= x[1]);
  if (i >= 0) { p.mouth = 'o'; p.mo = 0.45 + 0.45 * Math.abs(Math.sin(t * 13 + i)); } else if (p.mouth === 'o') p.mo = 0.25;
  return p; };
const ESC = { tiao: 1.0, soldado_quepe: 1.16, atirador: 0.84 };   // escala do boneco (SPEC.s); altura ~1,75*s
const SH = (q) => { const k = KF[SEG[q][1]]; return k.split ? KF[k.split[B ? 1 : 0]] : k; };
const MESMO = (q) => { if (q <= 0) return false; const P = SH(q - 1), S = SH(q); return P.pl === S.pl && P.cen === S.cen && !P.card && !S.card && !P.split && !S.split; };
const ACQ = (q) => { const own = SH(q).ac ? [...SH(q).ac()] : []; if (MESMO(q)) for (const a of ACQ(q - 1)) if (!own.find((x) => x.n === a.n)) own.push(a); return own; };   // A: quem estava no plano FICA (posição estável) até o plano acabar
const camFinal = (S) => { const c = camCen(cen(S), S.cam || 'medio'); if (!S.foco || !S.ac) return c;   // FOCO/OCUP: aproxima a câmera do ator até ocupar `ocup` da altura do quadro (alvo = closes do original)
  const A = S.ac().find((x) => x.n === S.foco); if (!A) return c; const O = ORIGEM[cen(S)], s = ESC[A.n] || 1, hc = 1.75 * (S.ac().length > 1 ? 1.18 * Math.max(...S.ac().map((q) => ESC[q.n] || 1)) : s), oc = S.ocup || 0.6;
  const AC = [...S.ac(), ...(S.opt && S.opt.panelaBarril ? [{ n: 'tiao', x: -1.0 }] : [])], tg = Math.tan(c.fov * Math.PI / 360); let cx = A.x, dw = 0;   // com 2+ atores: centro da UNIÃO e distância pela largura (margem 0,8)
  if (AC.length > 1) { const x0 = Math.min(...AC.map((q) => q.x - 0.62 * (ESC[q.n] || 1))), x1 = Math.max(...AC.map((q) => q.x + 0.62 * (ESC[q.n] || 1))); cx = (x0 + x1) / 2; dw = (x1 - x0) / 0.8 / (2 * tg * 9 / 16); }
  const look = [O.x + cx, 0.95 * s, O.z + A.z], dir = c.pos.map((v, i) => v - c.look[i]), L = Math.hypot(...dir) || 1, d = Math.min(L, Math.max(dw, hc / (oc * 2 * tg)));
  return { pos: look.map((v, i) => v + dir[i] / L * d), look, fov: c.fov }; };
export const camAt = (f) => { const S = shotAt(f), c = camFinal(S); const P = prevShot(f), w = P ? ease(wTr(f, S)) : 1;
  const c0 = P ? camFinal(P) : c; const cc = P ? { pos: LERP(c0.pos, c.pos, w), look: LERP(c0.look, c.look, w), fov: LERP(c0.fov, c.fov, w) } : c;
  const u = Math.min(1, (f - S._a) / Math.max(1, S._b - S._a)), K0 = f < 158 ? 0.1 : 0.03, k = P ? K0 * ((1 - w) + w * u) : K0 * u;   // avanço lento: movimento dentro do plano
  const q = seg(f); let q0 = q; while (MESMO(q0)) q0--; const dx = S.cam === 'paisagem' ? 0.32 * Math.min(6, (f - SEG[q0][0]) / 30) : 0;   // paisagem: deriva lateral lenta (sem quadro parado)
  return { pos: cc.pos.map((v, i) => v + (cc.look[i] - v) * k + (i === 0 ? dx : 0)), look: cc.look.map((v, i) => v + (i === 0 ? dx : 0)), fov: cc.fov, roll: 0 }; };
export const dofAt = (f) => { const c = camAt(f); return { focus: Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), cinf: 12 }; };
export const worldAt = (f) => { const S = shotAt(f), P = prevShot(f), w = P ? ease(wTr(f, S)) : 1; return { cenario: cen(S), [cen(S)]: P ? LERP(P.opt || {}, S.opt || {}, w) : (S.opt || {}) }; };
export const actorsAt = (f, T, W) => { const S = shotAt(f), P = prevShot(f), w = P ? ease(wTr(f, S)) : 1, t = f / 30, O = ORIGEM[cen(S)], tint = luz(S.luz || cen(S)).tint;
  const q = seg(f), A0 = P ? ACQ(q - 1) : [], A1 = ACQ(q);   // A (estabilidade): quem aparece/some DENTRO do plano desliza pela borda (sem pop = sem corte falso)
  const mk = (M, tr) => boneco(W, M.n, vida(M, t), O.x + M.x + tr, O.z + M.z, t, M.y != null ? { tint, y: M.y, apoio: 'janela' } : { tint });
  const out = A1.map((A) => { const B0 = A0.find((x) => x.n === A.n); if (!P || w >= 1) return mk(A, 0);
    if (!B0) return mk(A, (A.x >= 0 ? 1 : -1) * 2.6 * (1 - w));
    return mk({ ...A, x: LERP(B0.x, A.x, w), z: LERP(B0.z, A.z, w), y: A.y, pose: { ...LERP(B0.pose, A.pose, w), f: (w < 0.5 ? B0.pose.f : A.pose.f) } }, 0); });
  if (P && w < 1) for (const B0 of A0) if (!A1.find((x) => x.n === B0.n)) out.push(mk(B0, (B0.x >= 0 ? 1 : -1) * 2.6 * w));
  return out; };
export const fxAt = () => [];
