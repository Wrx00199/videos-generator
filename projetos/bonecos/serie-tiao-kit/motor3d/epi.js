// epi.js — montador declarativo de episódio em cenário do catálogo (16/11). Cada plano cobre falas [de..ate-1]; ator = {n,x,z,f,p(c),y?,apoio?,roll?}.
// c = {f,t,u(0..1 no plano),a(i)=fala i ativa,b(i,quieta)=boca,R(f0,f1)} ; x,z locais ao cenário. cam: {k:'geral'|'medio'|'larga'|'close',x,z,alt,dist,push} ou {cm:{pos,look,fov}}.
import { camFromKeys } from './motion.js';
import { luz } from './luzes.js';
import { boneco, anda, andar, fila, E, Pz } from './acoes.js';
import { ORIGEM, camCen } from './cenarios.js';
import { tremor } from './efeitos.js';
export { boneco, anda, andar, fila, E, Pz, ORIGEM, tremor };
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const sm = (t) => { t = cl(t); return t * t * t * (t * (t * 6 - 15) + 10); };
export const lerp = (a, b, t) => a + (b - a) * t;
export function episodio({ cen, FT, DUR, shots, luzId }) {
  const FPS = 30, TOTAL = Math.round(DUR * 30), F = (i) => Math.round(FT[i][0] * 30), O = ORIGEM[cen];
  const st = (s) => (s.t0 != null ? Math.round(s.t0 * 30) : s.de === 0 ? 0 : F(s.de) - (s.pre || 0));   // plano começa na fala `de` (menos `pre` quadros) OU em t0 segundos (cortes extras dentro de uma fala)
  const SH = shots.map((s, k) => ({ ...s, a: st(s), b: (shots[k + 1] ? st(shots[k + 1]) : TOTAL) - 1 }));
  const shotAt = (f) => SH.find((s) => f >= s.a && f <= s.b) || SH[SH.length - 1];
  const camBase = (S) => {
    const c = S.cam || { k: 'geral' };
    if (c.cm) return { pos: [O.x + c.cm.pos[0], O.y + c.cm.pos[1], O.z + c.cm.pos[2]], look: [O.x + c.cm.look[0], O.y + c.cm.look[1], O.z + c.cm.look[2]], fov: c.cm.fov };
    if (c.k === 'close') { const x = c.x ?? 0, z = c.z ?? 0.9, al = c.alt ?? 1.3, d = c.dist ?? 2.9; return { pos: [O.x + x + (c.lado ?? 0.35), O.y + al + 0.15, O.z + z + d], look: [O.x + x, O.y + al, O.z + z], fov: c.fov ?? 40 }; }
    if (c.k === 'larga') return { pos: [O.x + (c.x ?? 0.1), O.y + 1.65, O.z + (c.d ?? 6.0)], look: [O.x + (c.x ?? 0.1), O.y + 1.1, O.z], fov: c.fov ?? 50 };
    return camCen(cen, c.k, c.dx || 0, c.dz || 0);
  };
  const camAt = (f) => {
    const S = shotAt(f), c = camBase(S), p = (S.cam && S.cam.push) ?? 0.1, q = (v, w) => [lerp(v[0], w[0], p), lerp(v[1], w[1], p), lerp(v[2], w[2], p)];
    const mv = (S.cam && S.cam.mv) || [0, 0, 0], ad = (v) => [v[0] + mv[0], v[1] + mv[1], v[2] + mv[2]];   // cam.mv = travelling: desloca pos e look até o fim do plano
    const C = camFromKeys([{ f: S.a, ...c }, { f: S.b, pos: ad(q(c.pos, c.look)), look: ad(c.look), fov: c.fov * (1 - p * 0.25) }], f);
    if (S.shake) { const [f0, f1, k] = S.shake, d = f - S.a; if (d >= f0 && d <= f1) { const tr = tremor(f, k * (1 - (d - f0) / (f1 - f0))); C.pos = [C.pos[0] + tr.dx, C.pos[1] + tr.dy, C.pos[2]]; } }
    let fl = 0; if (S.flash) { const [f0, f1, v] = S.flash, d = f - S.a; if (d >= f0 && d <= f1) fl = v * (1 - (d - f0) / (f1 - f0)); }
    C.flash = Math.max(C.flash || 0, fl); return C;
  };
  const dofAt = (f) => { const C = camAt(f), S = shotAt(f), d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); const A0 = S.actors && S.actors[0]; let foco = d(C.pos, C.look); if (A0) { const c = ctx(f, S), v = (q) => (typeof q === 'function' ? q(c) : q); foco = d(C.pos, [O.x + v(A0.x), O.y + 1.0, O.z + v(A0.z)]); } return { focus: foco, cinf: 14 }; };   // foco no 1º ator do plano (antes: no ponto de olhar -> boneco borrado)
  const lightFor = (S) => luz(S.light || luzId);
  const worldAt = (f) => { const S = shotAt(f), c = ctx(f, S); return { cenario: cen, ...(S.world ? S.world(c, O) : {}) }; };
  const ctx = (f, S) => { const t = f / 30, u = cl((f - S.a) / Math.max(1, S.b - S.a)); const a = (i) => FT[i] && f >= F(i) && f <= Math.round(FT[i][1] * 30);
    return { f, t, u, a, F, FT, b: (i, q = 'smile', m = 'o') => (a(i) ? { mouth: m, mo: 0.45 + 0.45 * Math.abs(Math.sin(t * 13 + i)) } : { mouth: q, mo: 0.3 }), R: (f0, f1) => cl((f - S.a - f0) / (f1 - f0)), sm, lerp, d: f - S.a, S }; };
  const actorsAt = (f, T, W) => {
    const S = shotAt(f), c = ctx(f, S), t = c.t, tint = luz(S.light || luzId).tint, out = [];
    for (const A of S.actors) {
      if (A.vis && !A.vis(c)) continue;
      const v = (q) => (typeof q === 'function' ? q(c) : q), x = O.x + v(A.x), z = O.z + v(A.z), pose = { f: A.f ?? 1, ...A.p(c) }, ex = { tint };
      if (A.y != null) { ex.y = O.y + v(A.y); ex.apoio = A.apoio || 'salto'; ex.blob = true; }
      if (A.roll != null) ex.roll = v(A.roll);
      if (A.longe) ex.longe = true;
      if (A.propNaCara) ex.propNaCara = true;   // liberar o aviso de prop sobre a cara (comer, beber, mostrar de propósito)
      out.push(boneco(W, A.n, pose, x, z, t, ex));
    }
    return out;
  };
  return { FPS, TOTAL, SHOTS: SH, shotAt, LIGHTS: {}, lightFor, camAt, dofAt, worldAt, actorsAt, fxAt: () => [] };
}
