const EXPR = {
  neutral: { bL: { dy: 0, r: 0 }, bR: { dy: 0, r: 0 }, es: 1, ps: 1, m: 0, red: 0, vein: 0, lid: 0, beads: 0 },
  wide: { bL: { dy: -13, r: -4 }, bR: { dy: -13, r: 4 }, es: 1.2, ps: .55, m: 0, red: 0, vein: 0, lid: 0, beads: 0 },
  fear: { bL: { dy: -15, r: -20 }, bR: { dy: -15, r: 20 }, es: 1.18, ps: .42, m: 3, red: 0, vein: 0, lid: 0, beads: 1 },
  rage: { bL: { dy: 6, r: 22 }, bR: { dy: 6, r: -22 }, es: .92, ps: .85, m: 1, red: .85, vein: 1, lid: 0, beads: 1 },
  sad: { bL: { dy: -4, r: -18 }, bR: { dy: -4, r: 18 }, es: .95, ps: 1, m: 1, red: 0, vein: 0, lid: 0, beads: 0 },
  cynic: { bL: { dy: -20, r: -8 }, bR: { dy: 7, r: 10 }, es: 1, ps: 1, m: 2, red: 0, vein: 0, lid: 1, beads: 0 },
  effort: { bL: { dy: 4, r: 14 }, bR: { dy: 4, r: -14 }, es: .9, ps: .9, m: 1, red: .45, vein: 0, lid: 0, beads: 1 },
  suspect: { bL: { dy: -6, r: 6 }, bR: { dy: 4, r: 12 }, es: .95, ps: .9, m: 0, red: 0, vein: 0, lid: 1, beads: 0 },
};
const $ = s => document.querySelector(s);
const tl = gsap.timeline({ paused: true, defaults: { immediateRender: false } });

function P(id, t, d, s, ease) {
  const r = REG[id]; if (!r) { console.error('sem REG ' + id); return; }
  const prev = tstr(r, r.st); Object.assign(r.st, s); const nx = tstr(r, r.st);
  if (!d) tl.set('#' + id, { attr: { transform: nx } }, t);
  else tl.fromTo('#' + id, { attr: { transform: prev } }, { attr: { transform: nx }, duration: d, ease: ease || 'power2.inOut' }, t);
}
const OP = (sel, t, v) => tl.set(sel, { opacity: v === undefined ? 1 : v }, t);
const FD = (sel, t, d, v, ease) => tl.to(sel, { opacity: v, duration: d, ease: ease || 'none' }, t);
function expr(p, t, name, d) {
  d = d === undefined ? .12 : d; const E = EXPR[name];
  P(`${p}_bL`, t, d, E.bL); P(`${p}_bR`, t, d, E.bR);
  for (const s of ['L', 'R']) { P(`${p}_e${s}`, t, d, { sx: E.es, sy: E.es }); P(`${p}_p${s}`, t, d, { sx: E.ps, sy: E.ps }); tl.to(`#${p}_lid${s}`, { opacity: E.lid, duration: d || .01 }, t); }
  for (let i = 0; i < 4; i++) tl.to(`#${p}_m${i}`, { opacity: i === E.m ? 1 : 0, duration: d || .01 }, t);
  tl.to(`#${p}_red`, { opacity: E.red, duration: Math.max(d, .2) }, t); tl.to(`#${p}_vein`, { opacity: E.vein, duration: d || .01 }, t);
  if (document.getElementById(p + '_beads')) tl.to(`#${p}_beads`, { opacity: E.beads, duration: d || .01 }, t);
}
function look(p, t, d, dx, dy) { for (const s of ['L', 'R']) P(`${p}_p${s}`, t, d, { dx: dx, dy: dy }, 'power2.out'); }
function blink(p, ts) { for (const t of ts) for (const s of ['L', 'R']) { P(`${p}_e${s}`, t, .05, { sy: .08 }); P(`${p}_e${s}`, t + .07, .08, { sy: REG[`${p}_e${s}`].st.sx }); } }
function tremble(p, t, dur, amp) { const n = Math.floor(dur / .045); for (let i = 0; i < n; i++) P(`${p}_hd`, t + i * .045, 0, { dx: (i % 2 ? -1 : 1) * amp, dy: (i % 3 ? .4 : -.4) * amp }); P(`${p}_hd`, t + n * .045, 0, { dx: 0, dy: 0 }); }
function sweatDrops(p, t, dur) { for (let i = 0; i < 3; i++) { const e = `#${p}_sw${i}`; for (let k = 0; k * 0.9 + i * .3 < dur; k++) { const t0 = t + i * .3 + k * .9; tl.fromTo(e, { opacity: 1, y: 0 }, { opacity: 0, y: 70, duration: .85, ease: 'power1.in' }, t0); } } }
function goose(p, t, v) { for (const id of [`${p}_gsH`, `${p}_gsD`, `${p}_gsE`]) OP('#' + id, t, v === undefined ? 1 : v); }
function breathe(p, t0, t1) { for (let t = t0, i = 0; t < t1; t += .9, i++) P(`${p}_tr`, t, .9, { sy: i % 2 ? 1 : 1.018, dy: 0 }, 'sine.inOut'); }
// braço: alvo no mundo (coords da cena) -> IK. side 'D' | 'E'
