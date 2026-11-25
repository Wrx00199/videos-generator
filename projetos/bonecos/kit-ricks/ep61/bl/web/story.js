// ep61 — "O sorteio que o sobrinho ganhava toda semana". Praça de Vila Sorte (rua + palco do sorteio), noite = set 'night'.
import { M, lerp, lerp3, ramp, camFromKeys } from './motion.js';
import { route, HERO as H0, OBST, WALLS, BOXES, SIGNS } from './world.js';
export const FPS = 30, TOTAL = 1887, XF = 7;
export const HERO = H0;
const S = (id, a, b, set = 'street') => ({ id, a, b, set });
export const SHOTS = [
  S('a', 0, 92), S('b', 93, 150), S('c', 151, 250), S('d', 251, 320), S('e', 321, 410), S('f', 411, 482),
  S('g', 483, 543), S('h', 544, 632), S('i', 633, 712), S('j', 713, 790), S('k', 791, 851), S('l', 852, 985),
  S('m', 986, 1146, 'night'), S('n', 1147, 1235, 'night'), S('o', 1236, 1400), S('p', 1401, 1520),
  S('q', 1521, 1680, 'night'), S('r', 1681, 1757), S('s', 1758, 1886),
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
export const TOUCH = () => [];
// elenco novo
const TIAO = { outfit: 'overalls', top: '#e9b23a', pants: '#3f6a9a', beard: '#b4afa6', hairStyle: 'bald', hat: 'straw' };
const ODAIR = { outfit: 'suit', top: '#6b3a8c', hat: 'fedora', hatCol: '#2a2233', moustache: true, tie: '#f2d24a' };
const SOBR = { outfit: 'hoodie', top: '#2fae8f', hat: 'cap', hatCol: '#e0483c' };
const CIV = [
  { outfit: 'tee', top: '#4f8fd1', hairStyle: 'curly' }, { outfit: 'school', top: '#d9a32e', hairStyle: 'bob' },
  { outfit: 'trench', top: '#8a5a3a', hat: 'beanie' }, { outfit: 'tee', top: '#c96a6a', hairStyle: 'spiky' },
  { outfit: 'lab', top: '#e8e2d6', hairStyle: 'bun' },
];
const SC = 0.95, ST_Y = 0.6;
const r = (x, n = 1) => Math.round(x * n) / n;
const blink = (f, s) => ((f + s * 37) % 83) < 4 ? 1 : 0;
const cyc = (f, arr, per = 14, off = 0) => arr[Math.floor((f + off) / per) % arr.length];
const A = (who, o, opts, pos, facing = 1, h = 1.8) => {
  const key = JSON.stringify([who, opts, facing]);
  return { key, x: pos[0], y: pos[1], z: pos[2], s: 1, h,
    draw: ({ g }) => { g.save(); g.translate(300, 975); g.scale(SC * facing, SC); globalThis.__T.rick(g, o, opts); g.restore(); } };
};
const HT = { tiao: 2.0, odair: 2.05, sobr: 1.95 };
// lugares
const GLOBE = [12.8, 2.05, -2.4], BAL = [11.7, 1.26, -2.6], CAR = [9.4, 0, 0.4], PLACAR = [14.7, 1.85, -1.87], PREMIO = [10.0, 2.15, -2.57];
const OD = [12.0, ST_Y, -1.7];          // Odair no palco, do lado do globo
const TC = [13.3, 0, 2.5];              // Tião na plateia
const SB = [11.0, 0, 1.5];              // sobrinho na plateia
const SBST = [13.6, ST_Y, -1.6];        // sobrinho no palco recebendo
const TN = [12.3, ST_Y, -2.0];          // Tião de madrugada no palco
const CROWD = [[0, 12.2, 0.9], [1, 13.1, 0.3], [2, 14.0, 0.7], [3, 14.7, 1.7], [4, 12.0, 2.0]];
const crowd = (f, mood, skip = []) => CROWD.filter((c) => !skip.includes(c[0])).map(([i, x, z]) =>
  A('civ' + i, CIV[i], { expr: cyc(f, mood, 11 + i * 2, i * 5), look: r(0.6 * Math.sin(f * 0.05 + i), 10), blink: blink(f, 4 + i),
    L: cyc(f, mood[0] === 'laugh' ? ['up', 'hip'] : ['hang', 'hip', 'hang'], 15, i * 3), R: cyc(f, ['hang', 'hip'], 19, i), headTilt: r(5 * Math.sin(f * 0.12 + i)) },
    [x, 0, z], i % 2 ? -1 : 1));
// câmera: chaves por plano (camFromKeys faz spline + creep)
const k = (f, pos, look, fov = 44, roll = 0, ease) => ({ f, pos, look, fov, roll, ease });
const up = (p, d) => [p[0], p[1] + d, p[2]];
const face = (p, h = 1.55) => [p[0], p[1] + h, p[2]];
// o(): câmera em órbita do alvo. dt = meia-altura visível no alvo (m): 1.0 = rosto/busto, 1.6 = corpo inteiro, 3+ = geral.
const o = (f, tgt, dt, az, el, fov = 42, roll = 0, ease) => ({ f, tgt, dt, az, el, fov, roll, ease });
// diretor de câmera: posição livre de poste/fusca/boneco/parede e com visão limpa do alvo; gira/afasta até achar
const HTO = { poste: 4.2, 'árvore': 4.4 };
const camOK = (P, tgt, acts) => {
  if (P[2] < WALLS.zMin + 0.4 || P[2] > WALLS.zMax - 0.3 || P[1] < 0.35) return false;
  for (const [n, x, z, r] of OBST) { const h = HTO[n] ?? 2.4;
    if (P[1] < h && Math.hypot(P[0] - x, P[2] - z) < r + 0.4) return false;
    // segmento câmera→alvo não pode passar rente a poste/árvore/fusca alto
    const dx = tgt[0] - P[0], dz = tgt[2] - P[2], L2 = dx * dx + dz * dz || 1e-6, t = Math.max(0, Math.min(1, ((x - P[0]) * dx + (z - P[2]) * dz) / L2));
    const yy = P[1] + (tgt[1] - P[1]) * t;
    if (t > 0.02 && t < 0.97 && yy < h && Math.hypot(P[0] + dx * t - x, P[2] + dz * t - z) < r + 0.15) return false; }
  for (const [, x0, x1, z0, z1, yb] of BOXES) if (P[0] > x0 - 0.3 && P[0] < x1 + 0.3 && P[2] > z0 - 0.3 && P[2] < z1 + 0.3 && P[1] > yb - 0.2 && P[1] < yb + 1.2) return false;
  for (const a of acts) if (P[1] < a.y + 2.5 && Math.hypot(P[0] - a.x, P[2] - a.z) < 1.25) return false;
  return true;
};
const DUMMY = { rick() {} };
const solveKey = (sid, K) => { const acts = actorsAt(K.f, DUMMY, sid);
  for (const sc of [1, 1.12, 1.25, 1.4]) for (const da of [0, 10, -10, 20, -20, 30, -30, 45, -45, 60, -60, 80, -80]) for (const de of [0, 0.4, 0.9]) {
    const d = K.dt * sc / Math.tan(K.fov * Math.PI / 360), a = (K.az + da) * Math.PI / 180, P = [K.tgt[0] + d * Math.sin(a), K.tgt[1] + K.el + de, K.tgt[2] + d * Math.cos(a)];
    if (camOK(P, K.tgt, acts)) return { f: K.f, pos: P, look: K.tgt, fov: K.fov, roll: K.roll, ease: K.ease }; }
  const d = K.dt / Math.tan(K.fov * Math.PI / 360), a = K.az * Math.PI / 180;
  return { f: K.f, pos: [K.tgt[0] + d * Math.sin(a), K.tgt[1] + K.el, K.tgt[2] + d * Math.cos(a)], look: K.tgt, fov: K.fov, roll: K.roll, ease: K.ease }; };
const CAMR = {}; const keysOf = (sid) => CAMR[sid] || (CAMR[sid] = CAM[sid].map((K) => solveKey(sid, K)));
const FT = face(TC), FO = face(OD), FSB = face(SB), FSS = face(SBST), FN = face(TN), CARL = [9.8, 1.0, 0.6];
const CAM = { // calma (Filippe 25/11): 1 alvo por plano, deriva lenta; troca de personagem só no corte/dissolve
  a: [o(0, [12.8, 2.6, -2.6], 2.0, 0, 0.3, 48, 2), o(92, [12.8, 2.5, -2.6], 1.8, -12, 0.3, 46, -1.5)],
  b: [o(93, PLACAR, 1.1, -25, 0.4, 42, -1.5), o(150, PLACAR, 0.95, -12, 0.35, 40, 1)],
  c: [o(151, [12.2, 1.6, -1.8], 4.2, -40, 2.4, 52, 1.5), o(250, [12.2, 1.6, -1.8], 3.6, -28, 2.0, 50, -1)],
  d: [o(251, [10.1, 1.0, 0.8], 2.0, -20, 0.4, 50, -2), o(320, [10.1, 1.0, 0.8], 1.8, -5, 0.4, 48, 1.5)],
  e: [o(321, [12.4, 2.0, -0.5], 3.8, 0, 0.6, 56, 2), o(410, [12.4, 2.0, -0.5], 3.42, 10, 0.6, 52, -1)],
  f: [o(411, FT, 1.1, 15, 0.0, 40, -2), o(482, FT, 1.4, 28, 0.3, 46, 1.5)],
  g: [o(483, FSS, 1.25, 60, 0.0, 42, 2), o(543, FSS, 1.15, 74, 0.0, 40, -1)],
  h: [o(544, FT, 1.3, -10, 0.0, 46, -2), o(632, FT, 1.1, 5, 0.1, 42, 1.5)],
  i: [o(633, FT, 1.1, 25, 0.0, 42, 2), o(712, FT, 1.25, 12, 0.15, 44, -1)],
  j: [o(713, FT, 1.25, -20, 0.0, 46, -2), o(790, FT, 1.05, -6, 0.2, 42, 1.5)],
  k: [o(791, [11.1, 1.5, 1.8], 1.35, 30, -0.1, 44, 2), o(851, [11.1, 1.5, 1.8], 1.2, 18, 0.1, 42, -1)],
  l: [o(852, GLOBE, 1.1, 20, 0.1, 40, -2), o(940, GLOBE, 0.8, 8, 0.1, 34, 1), o(985, GLOBE, 0.85, 18, 0.2, 36, 1.5)],
  m: [o(986, FN, 2.0, 30, 0.6, 50, 2), o(1100, FN, 1.6, 10, 0.2, 46, -1.5), o(1146, FN, 1.5, 0, 0.2, 44, 1)],
  n: [o(1147, [12.0, 1.85, -2.3], 1.1, -15, 0.2, 38, 2), o(1235, [12.0, 1.85, -2.3], 1.0, 0, 0.25, 36, -1.5)],
  o: [o(1236, GLOBE, 0.8, 15, 0.2, 34, -2), o(1320, GLOBE, 0.7, 5, 0.2, 32, 1.5), o(1400, GLOBE, 0.85, 18, 0.2, 36, 1)],
  p: [o(1401, FT, 1.4, 20, 0.2, 46, 2), o(1520, FT, 1.2, 8, 0.15, 42, -1.5)],
  q: [o(1521, FN, 1.4, -25, 0.3, 46, -2), o(1610, FN, 1.15, -10, 0.15, 40, 1.5), o(1680, FN, 1.2, 0, 0.2, 40, 1)],
  r: [o(1681, GLOBE, 1.3, 18, 0.0, 44, 2), o(1757, GLOBE, 1.0, 6, 0.15, 38, -1.5)],
  s: [o(1758, [11.9, 1.55, 2.4], 1.6, 30, -0.1, 48, -2), o(1820, [11.6, 1.5, 2.0], 1.7, 22, 0.3, 48, 2), o(1886, [11.2, 1.4, 1.2], 2.6, 18, 1.4, 54, 1)],
};
const kicks = { a: [60], k: [815], r: [1715], s: [1800] };
const shake = (f, list) => { let s = 0; for (const f0 of list || []) if (f >= f0 && f < f0 + 12) s += 0.05 * (1 - (f - f0) / 12) * Math.sin((f - f0) * 2.6); return s; };
const push = (P0, f, sid, fov = 42, look = P0) => { let P = [...P0];
  const Rz = Math.max(1.3, 2.1 / (2.5 * Math.tan(fov * Math.PI / 360)));
  const LD = Math.hypot(look[0] - P0[0], look[2] - P0[2]) || 1;
  const acts = actorsAt(f, DUMMY, sid).map((a) => { const d = Math.hypot(a.x - P0[0], a.z - P0[2]) || 1, cs = ((a.x - P0[0]) * (look[0] - P0[0]) + (a.z - P0[2]) * (look[2] - P0[2])) / (d * LD); const b0 = 1.0; return [a.x, a.z, b0 + Math.max(0, Rz - b0) * Math.max(0, Math.min(1, cs * 2 + 0.2)), 99]; });
  const obs = OBST.map(([n, x, z, r]) => [x, z, r + 0.45, Math.max(3.1, HTO[n] ?? 0)]);
  for (let it = 0; it < 6; it++) for (const [x, z, R, h] of [...acts, ...obs]) {
    const d = Math.hypot(P[0] - x, P[2] - z); if (P[1] >= h || d >= R) continue;
    const k = (R - d) / (d || 1e-3); P[0] += (P[0] - x) * k; P[2] += (P[2] - z) * k; }
  for (const [, x0, x1, z0, z1, yb] of BOXES) if (P[0] > x0 - 0.3 && P[0] < x1 + 0.3 && P[2] > z0 - 0.3 && P[2] < z1 + 0.3 && P[1] < yb + 1.2 && P[1] > yb - 0.2) P[1] = yb + 1.2;
  P[2] = Math.min(WALLS.zMax - 0.3, Math.max(WALLS.zMin + 0.4, P[2])); return P; };
// enquadrador: protagonista perto do foco não fica cortado na borda; placa-assunto não fica cortada (abre a lente)
const V3 = { sub: (a, b) => a.map((v, i) => v - b[i]), dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], nrm: (a) => { const l = Math.hypot(...a) || 1; return a.map((v) => v / l); }, cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]] };
const ndc = (c, p) => { const F = V3.nrm(V3.sub(c.look, c.pos)), R = V3.nrm(V3.cross(F, [0, 1, 0])), U = V3.cross(R, F), v = V3.sub(p, c.pos), z = V3.dot(v, F);
  if (z <= 0.05) return null; const t = Math.tan(c.fov * Math.PI / 360); return [V3.dot(v, R) / (z * t * 9 / 16), V3.dot(v, U) / (z * t), z, R]; };
const frameFix = (c, f, sid) => {
  const foc = Math.hypot(...V3.sub(c.look, c.pos));
  for (const a of actorsAt(f, DUMMY, sid)) { const who = JSON.parse(a.key)[0]; if (who.startsWith('civ')) continue;
    if (Math.hypot(a.x - c.pos[0], a.z - c.pos[2]) > 1.3 * foc) continue;
    for (const yy of [0, 0.9]) { const q = ndc(c, [a.x, a.y + yy, a.z]); if (!q) continue; const ax = Math.abs(q[0]);
      if (ax > 0.82 && ax < 1.5) { const w = ax < 1.3 ? 1 : (1.5 - ax) / 0.2, sh = (ax - 0.82) * w * q[2] * Math.tan(c.fov * Math.PI / 360) * 9 / 16 * Math.sign(q[0]);
        c.look = c.look.map((v, i) => v + q[3][i] * sh); } } }
  const cl = (x) => Math.max(0, Math.min(1, x)); const f0 = c.fov, l0 = c.look;
  for (const [n, p, w, h] of SIGNS) { if (!HERO.includes(n)) continue;
    const q = ndc({ ...c, fov: f0, look: l0 }, p); if (!q) continue;
    const gate = cl((0.85 - Math.max(Math.abs(q[0]), Math.abs(q[1]))) / 0.15) * cl((1.75 * foc - Math.hypot(...V3.sub(p, c.pos))) / (0.3 * foc));
    if (gate <= 0) continue;
    // lente que cabe a placa inteira (busca fina), aplicada em proporção ao "quanto ela é assunto"
    let need = f0; for (; need < f0 + 30; need += 0.5) { const cc = { ...c, fov: need };
      if ([[-1, -1], [1, 1], [-1, 1], [1, -1]].every(([dx, dy]) => { const e = ndc(cc, [p[0] + dx * w / 2, p[1] + dy * h / 2, p[2]]); return e && Math.abs(e[0]) <= 0.97 && Math.abs(e[1]) <= 0.97; })) break; }
    const fit = cl((24 - (need - f0)) / 6); c.fov = Math.max(c.fov, f0 + (need - f0) * gate * fit);
    // placa inteira não pode ficar na faixa da legenda: sobe o olhar
    const cc = { ...c }; const e1 = ndc(cc, [p[0], p[1] - h / 2, p[2]]), e2 = ndc(cc, [p[0], p[1] + h / 2, p[2]]);
    if (e1 && e2) { const lo = Math.min(e1[1], e2[1]), hi = Math.max(e1[1], e2[1]); const over = Math.min(hi + 0.42, -0.28 - lo + 0.0);
      if (lo < -0.28 && hi > -0.42) c.look = [c.look[0], c.look[1] - 0.6 * gate * Math.max(0, Math.min(over, 0.5)) * Math.tan(c.fov * Math.PI / 360) * e1[2], c.look[2]]; } }
  return c; };
// empurrão contínuo: cada quadro parte do desvio do quadro anterior (não troca de lado = sem teleporte)
const OFF = new Map();
const offAt = (f, sid) => { const k = sid + ':' + f; if (OFF.has(k)) return OFF.get(k);
  const sh = SHOTS.find((x) => x.id === sid), c = camFromKeys(keysOf(sid), f);
  const prev = f > sh.a - 8 ? offAt(f - 1, sid) : [0, 0, 0];
  const P0 = c.pos.map((v, i) => v + 0.92 * prev[i]), P = push(P0, f, sid, c.fov, c.look);
  let o = P.map((v, i) => v - c.pos[i]); const dv = o.map((v, i) => v - prev[i]), m = Math.hypot(...dv);
  if (m > 0.55) o = prev.map((v, i) => v + dv[i] * 0.55 / m); OFF.set(k, o); return o; };
export const camAt = (f, sid) => {
  const sh = SHOTS.find((x) => x.id === sid); for (let g = sh.a - 8; g < f; g += 50) offAt(g, sid);
  const c = camFromKeys(keysOf(sid), f), s = shake(f, kicks[sid]), o = offAt(f, sid); c.pos = c.pos.map((v, i) => v + o[i]); frameFix(c, f, sid);
  return { pos: [c.pos[0] + s, c.pos[1] + s, c.pos[2]], look: c.look, fov: c.fov, roll: (c.roll || 0) + s * 40 };
};
export const dofAt = (f, sid) => { const c = camAt(f, sid); return { focus: r(Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), 10), cinf: 0 }; };
// rotas planejadas (A*), nunca atravessam nada
const R_SB_UP = route([[SB[0], SB[2]], [11.4, 0.1], [12.0, -0.5], [12.9, -1.6]]);   // sobrinho sobe pro palco (degrau)
const R_T_CAR = route([[TC[0], TC[2]], [12.2, 3.2], [11.2, 2.7], [10.7, 1.95]]);    // Tião vai até o fusca no final
const tiao = (f, o, pos, face_ = -1) => A('tiao', TIAO, { blink: blink(f, 1), ...o }, pos, face_, HT.tiao);
const odair = (f, o, pos = OD, face_ = 1) => A('odair', ODAIR, { blink: blink(f, 9), ...o }, pos, face_, HT.odair);
const sobr = (f, o, pos, face_ = 1) => A('sobr', SOBR, { blink: blink(f, 13), ...o }, pos, face_, HT.sobr);
const talk = (f) => r(Math.abs(Math.sin(f * 0.9)), 2);
export const actorsAt = (f, T, sid) => {
  globalThis.__T = T; const out = [];
  const day = !['m', 'n', 'q'].includes(sid);
  if (day && sid !== 'o' && sid !== 'p') out.push(...crowd(f, sid === 'f' || sid === 'g' || sid === 'k' ? ['laugh', 'grin', 'laugh'] : sid === 'r' || sid === 's' ? ['shock', 'beam', 'shock'] : ['neutral', 'smile', 'bored', 'think']));
  if (sid === 'a' || sid === 'b') {
    out.push(tiao(f, { expr: f < 55 ? cyc(f, ['think', 'nervous'], 10) : cyc(f, ['shock', 'angry', 'shock'], 9), look: f < 55 ? -0.5 : 0.3, L: f > 60 ? 'up' : 'hip', R: f > 60 ? 'up' : 'chin', headTilt: r(6 * Math.sin(f * 0.3)), squash: f > 60 && f < 70 ? 0.12 : 0 }, TC));
    out.push(odair(f, { expr: cyc(f, ['smugsmile', 'sly'], 16), look: 0.4, R: 'up', L: 'hip' }));
    out.push(sobr(f, { expr: cyc(f, ['smirk', 'grin'], 13), look: 0.5, R: f > 64 ? 'up' : 'thumb', L: 'hip' }, SB));
  } else if (sid === 'c') {
    out.push(odair(f, { expr: cyc(f, ['smugsmile', 'beam', 'sly'], 12), look: 0.6, R: { a: 'point', b: 'up', t: r(0.5 + 0.5 * Math.sin(f * 0.4), 10) }, L: 'wave' }));
    out.push(tiao(f, { expr: cyc(f, ['bored', 'stern'], 15), look: -0.3, L: 'cross', R: 'cross' }, TC));
    out.push(sobr(f, { expr: cyc(f, ['smirk', 'sly'], 12), look: 0.4, R: 'thumb' }, SB));
  } else if (sid === 'd') {
    out.push(sobr(f, { expr: cyc(f, ['grin', 'smirk', 'beam'], 11), look: -0.6, R: 'point', L: 'hip', headTilt: r(6 * Math.sin(f * 0.2)) }, SB, -1));
    out.push(tiao(f, { expr: cyc(f, ['think', 'nervous'], 12), look: -0.5, R: 'chin', L: 'hip' }, TC));
    out.push(odair(f, { expr: cyc(f, ['smugsmile', 'sly', 'beam'], 12), look: r(-0.3 + 0.3 * Math.sin(f * 0.1), 10), L: cyc(f, ['wave', 'hip'], 18) }));
  } else if (sid === 'e') {
    const u = M.smooth(ramp(f, 330, 372)); const p = R_SB_UP.at(u); const onSt = u >= 1;
    const E = R_SB_UP.at(1), hop = ramp(f, 372, 380), P1 = [E.x + (12.9 - E.x) * hop, r(ST_Y * M.smooth(hop) + 0.35 * Math.sin(Math.PI * hop), 100), E.z + (-1.6 - E.z) * M.smooth(hop)];
    const pos = !onSt ? [p.x, 0, p.z] : f < 380 ? P1 : lerp3([12.9, ST_Y, -1.6], SBST, M.smooth(ramp(f, 380, 396)));   // pula pro palco (arco), depois anda
    { const air = f >= 372 && f < 380, sb = sobr(f, { expr: air ? 'beam' : cyc(f, ['beam', 'smirk', 'laugh'], 10), look: 0.5, walk: !air && u > 0 && f < 392 ? (onSt ? r(((f - 380) * 0.06) % 1, 8) : p.walk) : null, R: f > 392 || air ? 'up' : 'hang', L: f > 392 || air ? 'up' : 'hang', squash: f >= 380 && f < 384 ? 0.12 : 0 }, pos, 1); if (air) sb.air = 1; out.push(sb); }
    out.push(odair(f, { expr: cyc(f, ['beam', 'smugsmile'], 12), look: 0.6, R: 'point', L: 'hip' }));
    out.push(tiao(f, { expr: cyc(f, ['stern', 'angry'], 13), look: -0.4, L: 'cross', R: 'cross' }, TC));
  } else if (sid === 'f' || sid === 'g') {
    out.push(tiao(f, { expr: sid === 'f' ? cyc(f, ['angry', 'stern', 'angry'], 8) : cyc(f, ['shock', 'nervous'], 10), look: -0.4, R: sid === 'f' ? 'point' : 'hang', L: sid === 'f' ? 'up' : 'hang', talk: 0, headTilt: r(8 * Math.sin(f * 0.5)) }, TC));
    out.push(sobr(f, { expr: sid === 'g' ? cyc(f, ['laugh', 'smirk'], 7) : cyc(f, ['laugh', 'grin'], 9), look: 0.5, talk: sid === 'g' && f < 540 ? talk(f) : 0, R: 'point', L: cyc(f, ['hip', 'up'], 12) }, SBST, 1));
    out.push(odair(f, { expr: cyc(f, ['laugh', 'smugsmile'], 9), look: 0.3, L: 'hip', R: 'thumb' }));
  } else if (sid === 'h' || sid === 'i' || sid === 'j') {
    const n = { h: [544, 625], i: [633, 700], j: [713, 785] }[sid]; const lose = f > (sid === 'h' ? 622 : sid === 'i' ? 695 : 9999);
    out.push(tiao(f, { expr: lose ? cyc(f, ['shock', 'nervous'], 8) : cyc(f, ['think', 'nervous', 'smile'], 10), look: lose ? 0 : -0.4, propR: 'clipboard', R: 'hold', L: lose ? 'up' : 'chin', headTilt: lose ? r(10 * Math.sin(f * 0.6)) : -4, squash: lose ? 0.06 : 0 }, TC));
    out.push(odair(f, { expr: cyc(f, ['smugsmile', 'beam'], 13), look: 0.5, R: 'up', L: 'hip' }));
    out.push(sobr(f, { expr: cyc(f, ['beam', 'smirk'], 10), look: 0.4, R: 'up', L: 'up' }, SBST));
  } else if (sid === 'k') {
    out.push(sobr(f, { expr: cyc(f, ['laugh', 'smirk'], 8), look: 0.6, R: 'point', L: 'hip' }, [10.6, 0, 1.75], 1));
    out.push(tiao(f, { expr: f > 815 ? cyc(f, ['shock', 'angry'], 8) : 'stern', look: -0.6, L: f > 815 ? 'up' : 'hang', R: f > 815 ? 'up' : 'hang', squash: f > 815 && f < 825 ? 0.12 : 0 }, [11.6, 0, 1.9], -1));
  } else if (sid === 'l') {
    out.push(tiao(f, { expr: f < 880 ? 'think' : cyc(f, ['shock', 'think', 'sly'], 12), look: f < 880 ? -0.6 : 0.2, R: f < 880 ? 'chin' : 'point', L: 'hip', headTilt: -8 }, TC));
    out.push(odair(f, { expr: cyc(f, ['sly', 'smugsmile'], 14), look: 0.3, R: 'up', L: 'hip' }));
  } else if (sid === 'm' || sid === 'n' || sid === 'q') {
    const u = sid === 'm' ? M.smooth(ramp(f, 986, 1040)) : 1;
    const pos = sid === 'm' ? lerp3([11.3, ST_Y, -1.9], TN, u) : TN;
    const ex = sid === 'q' ? cyc(f, ['sly', 'smugsmile', 'grin'], 12) : sid === 'n' ? (f > 1200 ? cyc(f, ['shock', 'sly'], 10) : 'think') : cyc(f, ['nervous', 'think'], 12);
    out.push(tiao(f, { expr: ex, look: r(0.6 * Math.sin(f * 0.08), 10), walk: sid === 'm' && u < 1 ? r((f * 0.06) % 1, 8) : null, L: 'holdUp', R: sid === 'q' ? 'hold' : 'point', headTilt: r(5 * Math.sin(f * 0.2)) }, pos, 1));
  } else if (sid === 'o' || sid === 'p') {
    out.push(odair(f, { expr: cyc(f, ['sly', 'smugsmile', 'wink'], 12), look: 0.5, R: sid === 'o' ? 'hold' : 'point', L: 'chin', headTilt: -6 }));
    if (sid === 'p') out.push(tiao(f, { expr: cyc(f, ['think', 'smile', 'sly'], 13), look: -0.3, R: 'point', L: 'hip' }, TC));
    if (sid === 'o') out.push(...crowd(f, ['bored', 'neutral'], [3, 4]));
  } else if (sid === 'r') {
    out.push(tiao(f, { expr: cyc(f, ['sly', 'smugsmile'], 12), look: -0.4, L: 'cross', R: 'cross' }, TC));
    out.push(odair(f, { expr: f > 1715 ? cyc(f, ['shock', 'nervous'], 7) : cyc(f, ['smugsmile', 'sly', 'beam'], 12), look: f > 1715 ? 0.6 : r(0.4 + 0.3 * Math.sin(f * 0.12), 10), R: 'up', L: f > 1715 ? 'up' : 'hip', squash: f > 1715 && f < 1725 ? 0.1 : 0 }));
    out.push(sobr(f, { expr: f > 1715 ? cyc(f, ['shock', 'angry'], 8) : 'smirk', look: 0.4, R: f > 1715 ? 'up' : 'thumb' }, SB));
  } else {
    const u = M.smooth(ramp(f, 1758, 1795)); const p = R_T_CAR.at(u);
    out.push(tiao(f, { expr: f > 1800 ? cyc(f, ['laugh', 'beam', 'smugsmile'], 9) : 'sly', look: -0.6, walk: u > 0 && u < 1 ? p.walk : null, R: f > 1795 ? 'point' : 'hang', L: f > 1800 ? 'up' : 'hip', talk: 0 }, [p.x, 0, p.z], -1));
    out.push(sobr(f, { expr: f > 1800 ? cyc(f, ['shock', 'angry', 'nervous'], 8) : cyc(f, ['stern', 'smirk'], 12), look: 0.6, L: f > 1800 ? 'up' : 'hang', R: f > 1800 ? 'up' : 'hang', squash: f > 1800 && f < 1812 ? 0.14 : 0 }, [11.4, 0, 0.6], 1));
    out.push(odair(f, { expr: cyc(f, ['shock', 'nervous'], 9), look: -0.6, L: 'up', R: 'chin' }));
  }
  return out;
};
// FX 3D do mundo
export const fxAt = (f) => {
  const o = {}, sid = shotAt(f).id;
  const spinning = (f < 92) || (f >= 151 && f < 250) || (f >= 852 && f < 985) || (f >= 1236 && f < 1520) || (f >= 1681 && f < 1757);
  if (spinning) o.spin = 1;
  if (f >= 45 && f < 150) { o.pula = r(M.easeOut(ramp(f, 45, 70)), 100); o.pn = 4; }
  if (f >= 900 && f < 985) { o.pula = r(M.easeOut(ramp(f, 905, 930)), 100); o.pn = 4; }
  if (f >= 1236 && f < 1520) { const t = (f - 1236) % 70; o.pula = r(M.easeOut(ramp(t, 10, 30)), 100); o.pn = 4; }
  if (f >= 1715 && f < 1757) { o.pula = r(M.easeOut(ramp(f, 1715, 1735)), 100); o.pn = 7; }
  if (sid === 'm' || sid === 'n' || sid === 'q') {
    o.lant = { p: [TN[0] + 0.45, 1.75, TN[2] + 0.15], r: -1.2 };
    if (sid !== 'm' || f > 1060) o.peso = r(sid === 'n' && f > 1200 ? lerp(0.6, 0.42, M.back(ramp(f, 1200, 1215))) : M.spring((f - 1060) / 30) * 0.6, 100);
  }
  if (sid === 'k' && f >= 815 && f < 845) o.bang = { p: [11.6, 2.25, 1.9], s: r(M.back(ramp(f, 815, 821)), 100), r: 0.25 };
  if (sid === 's' && f >= 1800 && f < 1850) o.bang = { p: [11.4, 2.2, 0.7], s: r(M.back(ramp(f, 1800, 1806)), 100), r: -0.25 };
  if ((sid === 'f' || sid === 'g') && f < 500) o.sweat = { p: [TC[0] + 0.25, 1.75, TC[2] + 0.1], u: (f - 411) / 12 };
  if (sid === 's') o.roda = r((f - 1758) * 0.0, 10);
  return o;
};
