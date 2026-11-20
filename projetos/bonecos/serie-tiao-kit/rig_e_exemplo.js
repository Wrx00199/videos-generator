// "O papagaio do capitão" — bonecos de palito desenhados e animados em canvas, quadro a quadro em função do tempo.
(function () {
'use strict';
const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
const W = 1080, H = 1920, INK = '#161616', DUR = 50.1, TAU = Math.PI * 2, PI = Math.PI;

// ---------- utilidades ----------
const C = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v, L = (a, b, t) => a + (b - a) * t;
const io = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, out = t => 1 - Math.pow(1 - t, 3), inn = t => t * t * t;
const back = t => { const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const P = (t, a, b) => C((t - a) / (b - a));
function K(t, k, e = io) { if (t <= k[0][0]) return k[0][1]; for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const a = k[i - 1], b = k[i]; return L(a[1], b[1], e((t - a[0]) / (b[0] - a[0]))); } return k[k.length - 1][1]; }
function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function hx(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function mixHex(a, b, t) { const A = hx(a), B = hx(b); return 'rgb(' + A.map((v, i) => Math.round(L(v, B[i], t))).join(',') + ')'; }
function ell(x, y, rx, ry, r = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.abs(rx), Math.abs(ry), r, 0, TAU); }
function fs(fill, lw = 8, stroke = INK) { if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; ctx.stroke(); } }
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
function line(p, lw, col = INK) { ctx.beginPath(); ctx.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]); ctx.lineWidth = lw; ctx.strokeStyle = col; ctx.stroke(); }
const talk = t => .25 + .75 * Math.abs(Math.sin(t * 13)) * (.6 + .4 * Math.sin(t * 5.3));

// ---------- paletas ----------
const PAL = {
  day:   { s1: '#4aa9ec', s2: '#cdeeff', cloud: '#ffffff', cshade: '#d3e4f4', sea1: '#3aa1e2', sea2: '#1f6cb8', w1: '#2f8fd6', w2: '#2377c2', w3: '#1a62aa' },
  storm: { s1: '#1a2246', s2: '#4a5784', cloud: '#59648c', cshade: '#363f62', sea1: '#2a4374', sea2: '#121f45', w1: '#253c6b', w2: '#1d315c', w3: '#15264c' },
  night: { s1: '#0a1028', s2: '#26305c', cloud: '#343e66', cshade: '#232b4c', sea1: '#1c2b55', sea2: '#0a1330', w1: '#182851', w2: '#121f43', w3: '#0d1736' },
  dawn:  { s1: '#ff8d6a', s2: '#ffe1a1', cloud: '#fff1e0', cshade: '#f6c3a6', sea1: '#5b95d0', sea2: '#2d5ea0', w1: '#4b86c4', w2: '#3e75b4', w3: '#3165a3' },
};
function mixPal(a, b, t) { const o = {}; for (const k in a) o[k] = mixHex(a[k], b[k], t); return o; }

// ---------- rig dos bonecos ----------
const SPEC = {
  tiao: { n: 'tiao', body: '#fbfbf8', hat: 'chef', s: .86, seed: 1 },
  cap:  { n: 'cap', body: '#2f57b3', hat: 'bicorne', s: 1.04, seed: 2, stache: 1 },
  mar1: { n: 'mar1', body: '#f08a24', hat: 'bandana', s: .95, seed: 3 },
  mar2: { n: 'mar2', body: '#3f9d5d', hat: 'beanie', s: .97, seed: 4 },
};
const DEF = { x: 0, y: 0, sc: 1, f: 1, rot: 0, lean: 0, bob: 0, tilt: 0, sq: 1, aL: [-.22, .15], aR: [.22, -.15], lL: [-.07, 0], lR: [.07, 0],
  eye: 'dot', lx: 0, ly: 0, brow: 0, browY: 0, bRaise: 0, mouth: 'smile', mo: .5, blush: 0, sweat: 0, back: 0, hR: null, hL: null, shadow: 1, hat: 1, legs: 1, wind: 0 };
const UA = 70, LA = 66, TH = 76, SH = 72, SHX = 50, SHY = -150;
function limb(x, y, a, l1, l2) { const ex = x + Math.sin(a[0]) * l1, ey = y + Math.cos(a[0]) * l1, b = a[0] + a[1]; return [x, y, ex, ey, ex + Math.sin(b) * l2, ey + Math.cos(b) * l2]; }
function ik(sx, sy, tx, ty, l1, l2, sg) {
  const dx = tx - sx, dy = ty - sy; let d = Math.hypot(dx, dy); d = Math.min(d, l1 + l2 - .5); d = Math.max(d, Math.abs(l1 - l2) + 1);
  const base = Math.atan2(dx, dy), al = Math.acos(C((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), be = Math.acos(C((l1 * l1 + l2 * l2 - d * d) / (2 * l1 * l2), -1, 1));
  return [base + sg * al, -sg * (PI - be)];
}
function blink(t, seed) { const per = 2.6 + seed * .37; return ((t + seed * .71) % per) < .1; }
function hipOf(o) { const gL = limb(-20, 0, o.lL || DEF.lL, TH, SH), gR = limb(20, 0, o.lR || DEF.lR, TH, SH); return (o.hipY != null ? o.hipY : -Math.max(gL[5], gR[5])) + (o.bob || 0); }
// ponto do mundo -> coordenadas do corpo (origem no quadril, já com inclinação)
function toBody(n, o, wx, wy) { const sc = SPEC[n].s * (o.sc || 1), f = o.f || 1; const dx = (wx - o.x) / (sc * f), dy = (wy - o.y) / sc - hipOf(o); const l = -(o.lean || 0) * 1; return [dx * Math.cos(l) - dy * Math.sin(l), dx * Math.sin(l) + dy * Math.cos(l)]; }

function drawChar(n, p, t) {
  const S = SPEC[n], o = Object.assign({}, DEF, p), sc = S.s * o.sc;
  ctx.save(); ctx.translate(o.x, o.y);
  if (o.shadow && !o.rot) { ctx.fillStyle = 'rgba(0,0,0,.22)'; ell(0, 3, 82 * sc * (1 + Math.min(0, o.bob) / 400), 14 * sc); ctx.fill(); }
  ctx.rotate(o.rot); ctx.scale(sc * o.f, sc); ctx.scale(1 / Math.sqrt(o.sq), o.sq);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const gL = limb(-20, 0, o.lL, TH, SH), gR = limb(20, 0, o.lR, TH, SH);
  ctx.translate(0, hipOf(o));
  if (o.legs) { leg(gL); leg(gR); }
  ctx.rotate(o.lean);
  if (o.behind) o.behind();
  body(S, o);
  const A = (side, a) => { const sx = side * SHX; if (a.ik) { const r = ik(sx, SHY, a.ik[0], a.ik[1], UA, LA, a.s != null ? a.s : side); return limb(sx, SHY, r, UA, LA); } return limb(sx, SHY, a, UA, LA); };
  const pL = A(-1, o.aL), pR = A(1, o.aR);
  ctx.save(); ctx.translate(0, -190); ctx.rotate(o.tilt); ctx.translate(0, -70); head(S, o, t); ctx.restore();
  if (o.front) o.front();
  arm(pL, o.hL); arm(pR, o.hR);
  ctx.restore();
}
function leg(g) { line(g, 11); ctx.fillStyle = INK; ell(g[4] + 9, g[5] + 1, 18, 9); ctx.fill(); }
function arm(g, pr) { line(g, 10); ctx.fillStyle = INK; ell(g[4], g[5], 11, 11); ctx.fill(); if (pr) prop(pr.k, g[4], g[5], pr.a, pr.s || 1, pr); }
function body(S, o) {
  const path = () => rr(-60, -204, 120, 214, [60, 60, 36, 36]);
  path(); fs(S.body, 0);
  ctx.save(); path(); ctx.clip();
  if (S.n === 'tiao') {
    rr(-44, -128, 88, 150, [12, 12, 20, 20]); fs('#ececea', 5);
    rr(-24, -70, 48, 34, 6); fs(null, 4);
    ctx.beginPath(); ctx.moveTo(-34, -204); ctx.lineTo(34, -204); ctx.lineTo(0, -160); ctx.closePath(); fs('#d8322a', 5);
  } else if (S.n === 'cap') {
    ctx.fillStyle = '#f3efe6'; ctx.beginPath(); ctx.moveTo(-26, -204); ctx.lineTo(26, -204); ctx.lineTo(0, -150); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f2c230'; for (let k = 0; k < 4; k++) for (const s of [-1, 1]) { ell(s * 22, -134 + k * 30, 6, 6); ctx.fill(); }
    ctx.fillStyle = '#1b1b1b'; ctx.fillRect(-70, -26, 140, 18); ctx.fillStyle = '#f2c230'; ctx.fillRect(-10, -28, 20, 22);
  } else if (S.n === 'mar1') {
    ctx.fillStyle = '#fff4e4'; for (let k = 0; k < 5; k++) ctx.fillRect(-70, -176 + k * 40, 140, 15);
  } else if (S.n === 'mar2') {
    ctx.fillStyle = '#2d7a46'; ctx.fillRect(-70, -210, 32, 230); ctx.fillRect(38, -210, 32, 230);
    ctx.fillStyle = '#6b4325'; ctx.fillRect(-70, -30, 140, 18);
  }
  // relevo: luz de cima/esquerda, sombra embaixo/direita, sombra do pescoço
  { const g = ctx.createLinearGradient(-60, -204, 70, 20); g.addColorStop(0, 'rgba(255,255,255,.28)'); g.addColorStop(.45, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(10,20,40,.30)'); ctx.fillStyle = g; ctx.fillRect(-80, -220, 160, 250);
    ell(0, -206, 52, 18); ctx.fillStyle = 'rgba(10,20,40,.18)'; ctx.fill(); rr(-48, -190, 12, 150, 6); ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fill(); }
  ctx.restore(); path(); fs(null, 8);
  if (S.n === 'cap') { for (const s of [-1, 1]) { ell(s * 56, -182, 26, 12, s * .2); fs('#f2c230', 5); } }
}
function head(S, o, t) {
  { const g = ctx.createRadialGradient(-34, -38, 8, -10, -8, 128); g.addColorStop(0, '#ffffff'); g.addColorStop(.55, '#f3f5f8'); g.addColorStop(1, '#c9d2dd'); ell(0, 0, 100, 92); fs(g, 8);
    ctx.save(); ell(0, 0, 96, 88); ctx.clip(); ell(18, 64, 92, 40); ctx.fillStyle = 'rgba(30,40,70,.10)'; ctx.fill(); ctx.restore();
    ell(-50, -46, 20, 11, -.6); ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.fill(); }
  if (!o.back) face(S, o, t);
  if (o.hat) hat(S.hat, t, o.wind);
  if (o.blush && !o.back) { ctx.globalAlpha = o.blush * .75; ctx.fillStyle = '#ff8a9a'; const lx = o.lx * 16; ell(-58 + lx, 30, 18, 10); ctx.fill(); ell(58 + lx, 30, 18, 10); ctx.fill(); ctx.globalAlpha = 1; }
  if (o.sweat) { const sy = ((t * 1.2) % 1) * 40; drop(96 - o.lx * 10, -30 + sy, 1); }
}
function drop(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(0, -24); ctx.quadraticCurveTo(14, -2, 12, 8); ctx.arc(0, 8, 12, 0, PI); ctx.quadraticCurveTo(-14, -2, 0, -24); ctx.closePath(); fs('#8fd6ff', 5); ctx.restore(); }
function face(S, o, t) {
  const lx = o.lx * 16, ly = o.ly * 12, ey = -6 + ly; let e = o.eye; if (e === 'dot' && blink(t, S.seed)) e = 'shut';
  for (const s of [-1, 1]) eye(e, s * 31 + lx, ey, o);
  if (o.brow !== null) for (const s of [-1, 1]) {
    const by = -44 + ly - o.browY * 12 - (s > 0 ? o.bRaise * 14 : 0), inner = s * 13 + lx, outer = s * 50 + lx;
    line([outer, by - o.brow * 8, inner, by + o.brow * 10], 7);
  }
  mouth(o.mouth, lx * .9, 40 + ly * .8, o.mo);
  if (S.stache) stache(lx * .9, 22 + ly * .8);
}
function eye(e, x, y, o) {
  ctx.fillStyle = INK;
  if (e === 'dot') { ell(x, y, 9, 13); ctx.fill(); }
  else if (e === 'wide') { ell(x, y, 21, 23); fs('#fff', 5); ell(x + o.lx * 6, y + o.ly * 6, 8, 9); ctx.fillStyle = INK; ctx.fill(); }
  else if (e === 'happy') { ctx.beginPath(); ctx.moveTo(x - 13, y + 5); ctx.quadraticCurveTo(x, y - 14, x + 13, y + 5); fs(null, 6); }
  else if (e === 'shut') line([x - 12, y + 2, x + 12, y + 2], 6);
  else if (e === 'smug') { ctx.beginPath(); ctx.ellipse(x, y + 1, 10, 10, 0, 0, PI); ctx.fill(); line([x - 14, y + 1, x + 14, y - 1], 6); }
  else if (e === 'x') { line([x - 10, y - 10, x + 10, y + 10], 6); line([x + 10, y - 10, x - 10, y + 10], 6); }
}
function mouth(m, x, y, mo) {
  ctx.beginPath();
  if (m === 'smile') { ctx.moveTo(x - 24, y - 2); ctx.quadraticCurveTo(x, y + 20, x + 24, y - 2); fs(null, 6); }
  else if (m === 'bigsmile') { ctx.moveTo(x - 30, y - 4); ctx.lineTo(x + 30, y - 4); ctx.quadraticCurveTo(x + 28, y + 30, x, y + 32); ctx.quadraticCurveTo(x - 28, y + 30, x - 30, y - 4); fs('#5a1414', 5); ell(x, y + 22, 12, 6); ctx.fillStyle = '#ff7b8a'; ctx.fill(); }
  else if (m === 'grin') {
    const h = 16 + 30 * mo; const pth = () => { ctx.beginPath(); ctx.moveTo(x - 32, y - 6); ctx.lineTo(x + 32, y - 6); ctx.quadraticCurveTo(x + 32, y + h, x, y + h); ctx.quadraticCurveTo(x - 32, y + h, x - 32, y - 6); ctx.closePath(); };
    pth(); fs('#5a1414', 0); ctx.save(); pth(); ctx.clip(); ctx.fillStyle = '#fff'; ctx.fillRect(x - 34, y - 8, 68, 11); ell(x, y + h, 16, 9); ctx.fillStyle = '#ff7b8a'; ctx.fill(); ctx.restore(); pth(); fs(null, 5);
  }
  else if (m === 'shout') { ell(x, y + 8, 16 + 10 * mo, 10 + 24 * mo); fs('#5a1414', 5); ell(x, y + 14 + 18 * mo, 10 + 4 * mo, 5); ctx.fillStyle = '#ff7b8a'; ctx.fill(); }
  else if (m === 'flat') line([x - 18, y + 4, x + 18, y + 4], 6);
  else if (m === 'frown') { ctx.moveTo(x - 20, y + 12); ctx.quadraticCurveTo(x, y - 6, x + 20, y + 12); fs(null, 6); }
  else if (m === 'wavy') { ctx.moveTo(x - 22, y + 6); ctx.quadraticCurveTo(x - 11, y - 3, x, y + 6); ctx.quadraticCurveTo(x + 11, y + 15, x + 22, y + 6); fs(null, 6); }
  else if (m === 'o') { ell(x, y + 6, 8 + 6 * mo, 10 + 8 * mo); fs('#5a1414', 5); }
  else if (m === 'smirk') { ctx.moveTo(x - 20, y + 6); ctx.quadraticCurveTo(x + 4, y + 12, x + 26, y - 8); fs(null, 6); }
  else if (m === 'chew') { ctx.moveTo(x - 16, y + 4); ctx.quadraticCurveTo(x, y + 8 + mo * 8, x + 16, y + 4); fs(null, 6); }
  else if (m === 'teeth') { rr(x - 28, y - 4, 56, 24, 8); fs('#fff', 5); line([x - 28, y + 8, x + 28, y + 8], 3); for (const k of [-14, 0, 14]) line([x + k, y - 4, x + k, y + 20], 3); }
}
function stache(x, y) { ctx.fillStyle = INK; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x + s * 18, y - 16, x + s * 46, y - 10, x + s * 52, y + 12); ctx.bezierCurveTo(x + s * 36, y + 2, x + s * 18, y + 14, x, y + 6); ctx.closePath(); ctx.fill(); } }
function hat(k, t, wind = 0) {
  if (k === 'chef') {
    const pf = [[-48, -150, 40], [0, -172, 48], [48, -150, 40], [-28, -128, 40], [28, -128, 40]];
    ctx.lineWidth = 16; ctx.strokeStyle = INK; for (const [a, b, r] of pf) { ell(a, b, r, r); ctx.stroke(); }
    for (const [a, b, r] of pf) { const g = ctx.createRadialGradient(a - r * .35, b - r * .4, 2, a, b, r * 1.05); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#d5dbe3'); ell(a, b, r, r); ctx.fillStyle = g; ctx.fill(); }
    rr(-64, -124, 128, 46, 8); fs('#fff', 8); for (const x of [-30, 0, 30]) line([x, -118, x, -86], 4, '#cfcfcf');
  } else if (k === 'bicorne') {
    ctx.beginPath(); ctx.moveTo(-130, -60); ctx.quadraticCurveTo(-112, -172, 0, -180); ctx.quadraticCurveTo(112, -172, 130, -60); ctx.quadraticCurveTo(0, -96, -130, -60); ctx.closePath(); fs('#1f3170', 8);
    ctx.beginPath(); ctx.moveTo(-112, -72); ctx.quadraticCurveTo(-96, -158, 0, -164); ctx.quadraticCurveTo(96, -158, 112, -72); fs(null, 6, '#f2c230');
    ell(0, -120, 24, 24); fs('#fff', 6); ell(0, -120, 12, 12); ctx.fillStyle = '#d8322a'; ctx.fill();
  } else if (k === 'bandana') {
    const w = Math.sin(t * 9) * (6 + wind * 20);
    ctx.beginPath(); ctx.moveTo(92, -38); ctx.lineTo(140 + wind * 30, -70 + w); ctx.lineTo(134 + wind * 30, -30 + w); ctx.closePath(); fs('#c92a22', 6);
    ctx.beginPath(); ctx.moveTo(92, -32); ctx.lineTo(136 + wind * 34, -4 - w); ctx.lineTo(110 + wind * 20, -8 - w); ctx.closePath(); fs('#c92a22', 6);
    const pth = () => { ctx.beginPath(); ctx.moveTo(-101, -22); ctx.ellipse(0, 0, 104, 96, 0, PI * 1.07, PI * 1.93); ctx.quadraticCurveTo(0, -52, -101, -22); ctx.closePath(); };
    pth(); fs('#d8322a', 0); ctx.save(); pth(); ctx.clip(); ctx.fillStyle = '#fff'; for (const [a, b] of [[-60, -60], [-10, -80], [40, -64], [70, -40], [-80, -32], [10, -50]]) { ell(a, b, 7, 7); ctx.fill(); } ctx.restore(); pth(); fs(null, 8);
  } else if (k === 'beanie') {
    ell(0, -112, 22, 22); fs('#ece4d2', 7);
    ctx.beginPath(); ctx.moveTo(-98, -34); ctx.ellipse(0, 0, 103, 97, 0, PI * 1.1, PI * 1.9); ctx.lineTo(98, -34); ctx.closePath(); fs('#55658c', 8);
    rr(-106, -52, 212, 32, 14); fs('#44527a', 7);
  }
}
function hatAt(k, x, y, r, s, t) { ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(s, s); ctx.translate(0, 80); hat(k, t); ctx.restore(); }

// ---------- objetos ----------
function prop(k, x, y, a, s = 1, pr = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-a); ctx.scale(s, s);
  if (k === 'ladle') { rr(-6, -30, 12, 140, 6); fs('#c9c9d2', 5); ctx.beginPath(); ctx.arc(0, 112, 32, 0, PI); ctx.closePath(); fs('#c9c9d2', 6); if (pr.full) { ell(0, 113, 28, 6); ctx.fillStyle = '#e8b04a'; ctx.fill(); } }
  else if (k === 'map') { rr(-75, -10, 150, 110, 6); fs('#f1dfae', 6); ctx.setLineDash([10, 10]); line([-50, 75, -10, 40, 25, 60], 5, '#8a5a2b'); ctx.setLineDash([]); line([30, 20, 50, 40], 6, '#d8322a'); line([50, 20, 30, 40], 6, '#d8322a'); }
  else if (k === 'lantern') { line([0, 0, 0, 30], 5); rr(-26, 30, 52, 70, 10); fs('#ffd36e', 6); line([-26, 52, 26, 52], 4); }
  else if (k === 'glass') { rr(-12, -20, 24, 90, 6); fs('#c99a3a', 5); rr(-17, 60, 34, 80, 6); fs('#8a5530', 5); ell(0, 142, 17, 6); fs('#bfe6ff', 4); }
  else if (k === 'spoon') { rr(-5, -10, 10, 80, 5); fs('#c9c9d2', 4); ell(0, 84, 15, 20); fs('#c9c9d2', 4); }
  ctx.restore();
}
function mapAt(x, y, r, s) { ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(s, s); rr(-75, -55, 150, 110, 6); fs('#f1dfae', 6); ctx.setLineDash([10, 10]); line([-50, 30, -10, -5, 25, 15], 5, '#8a5a2b'); ctx.setLineDash([]); line([30, -25, 50, -5], 6, '#d8322a'); line([50, -25, 30, -5], 6, '#d8322a'); ctx.restore(); }
function pot(x, y, s, r = 0, soup = '#e8b84a', empty = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(s, s);
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * 122, -50, 22, 0, TAU); ctx.lineWidth = 16; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 7; ctx.strokeStyle = '#a85a1c'; ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-110, -90); ctx.lineTo(-100, 40); ctx.quadraticCurveTo(-96, 80, -60, 80); ctx.lineTo(60, 80); ctx.quadraticCurveTo(96, 80, 100, 40); ctx.lineTo(110, -90); ctx.closePath(); fs('#e08a2e', 8);
  rr(-82, -70, 18, 116, 9); ctx.fillStyle = '#f6b867'; ctx.fill();
  ell(0, -90, 114, 24); fs('#c66f22', 8); ell(0, -88, 96, 15); ctx.fillStyle = empty ? '#4a2a10' : soup; ctx.fill();
  ctx.restore();
}
function bowl(x, y, s, full = 1) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-52, 0); ctx.quadraticCurveTo(0, 72, 52, 0); ctx.closePath(); fs('#f4f1ea', 6); ell(0, 0, 52, 13); fs(full > 0 ? '#e8b04a' : '#d9d2c4', 5); if (full > 0) { ctx.globalAlpha = full; ell(0, 0, 44, 9); ctx.fillStyle = '#f2c766'; ctx.fill(); ctx.globalAlpha = 1; } ctx.restore(); }
function fish(x, y, a, s) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-55, 0); ctx.lineTo(-92, -28); ctx.lineTo(-92, 28); ctx.closePath(); fs('#5b93bf', 6); ell(0, 0, 62, 30); fs('#82b9de', 7); ell(30, -6, 7, 7); ctx.fillStyle = INK; ctx.fill(); line([-14, -22, -6, 0, -14, 22], 4); ctx.restore(); }
function star(x, y, r, a) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); for (let i = 0; i < 10; i++) { const rad = i % 2 ? r * .45 : r, an = i * PI / 5 - PI / 2; ctx.lineTo(Math.cos(an) * rad, Math.sin(an) * rad); } ctx.closePath(); fs('#ffd23f', 5); ctx.restore(); }
function steam(x, y, t, n = 3, s = 1) { ctx.save(); ctx.lineCap = 'round'; for (let i = 0; i < n; i++) { const ph = ((t * .6 + i / n) % 1); ctx.globalAlpha = .55 * Math.sin(ph * PI); ctx.beginPath(); const bx = x + (i - (n - 1) / 2) * 50 * s; for (let k = 0; k <= 10; k++) { const yy = y - ph * 160 * s - k * 14 * s; ctx.lineTo(bx + Math.sin(k * .8 + t * 4 + i) * 14 * s, yy); } ctx.lineWidth = 10 * s; ctx.strokeStyle = '#ffffff'; ctx.stroke(); } ctx.restore(); }
function wheel(x, y, r, ang) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) { const a = i * TAU / 8; line([0, 0, Math.cos(a) * r * 1.3, Math.sin(a) * r * 1.3], r * .15, INK); }
  for (let i = 0; i < 8; i++) { const a = i * TAU / 8; line([0, 0, Math.cos(a) * r * 1.3, Math.sin(a) * r * 1.3], r * .08, '#9a5f2e'); ell(Math.cos(a) * r * 1.3, Math.sin(a) * r * 1.3, r * .1, r * .1); fs('#b8773d', r * .04); }
  ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.lineWidth = r * .24; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = r * .15; ctx.strokeStyle = '#a8692f'; ctx.stroke();
  ell(0, 0, r * .2, r * .2); fs('#d8a24a', r * .05);
  ctx.restore();
}
const wheelPt = (x, y, r, ang, i) => [x + Math.cos(ang + i * TAU / 8) * r * 1.22, y + Math.sin(ang + i * TAU / 8) * r * 1.22];
function leaf(x, y, a, s) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(-26, 0); ctx.quadraticCurveTo(0, -20, 26, 0); ctx.quadraticCurveTo(0, 20, -26, 0); fs('#5fae4a', 4); line([-22, 0, 22, 0], 3, '#2f6b28'); ctx.restore(); }
function wisp(x0, y0, x1, y1, t, prog, amp = 40, s = 1) {
  ctx.save(); let hx_ = x0, hy = y0;
  for (let i = 0; i < 46; i++) { const u = i / 45 * prog; const x = L(x0, x1, u), y = L(y0, y1, u) + Math.sin(u * 11 - t * 5) * amp * (1 - u * .6);
    ctx.globalAlpha = .5 * Math.sin(Math.min(1, u / Math.max(prog, .01)) * PI * .95 + .05); ctx.fillStyle = i % 3 ? '#a9d27a' : '#a07a4c'; ell(x, y, (16 + 7 * Math.sin(i + t * 3)) * s, (11 + 4 * Math.cos(i * 1.3 + t * 2)) * s); ctx.fill(); hx_ = x; hy = y; }
  ctx.globalAlpha = 1; if (prog > .05) { leaf(hx_, hy, t * 3, .9 * s); ctx.fillStyle = '#9ad3ff'; for (let k = 0; k < 3; k++) { ell(hx_ - 30 - k * 40, hy + Math.sin(t * 6 + k) * 20, 6 * s, 8 * s); ctx.fill(); } }
  ctx.restore();
}

// ---------- cenários ----------
const CL = [[-90, 10, 50], [-40, -20, 65], [30, -30, 75], [95, 0, 55], [0, 15, 60], [-130, 30, 35], [140, 30, 35]];
function sky(p, hz) { if (SKYK) { plate(SKYK, hz, TT); if (SKYK2 && SKYM > 0) plate(SKYK2, hz, TT, SKYM); return; } const g = ctx.createLinearGradient(0, -400, 0, hz); g.addColorStop(0, p.s1); g.addColorStop(1, p.s2); ctx.fillStyle = g; ctx.fillRect(-1000, -1000, W + 2000, hz + 1000); }
function cloud(x, y, s, col, shade) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = shade; for (const [a, b, r] of CL) { ell(a, b + 14, r, r); ctx.fill(); } ctx.fillStyle = col; for (const [a, b, r] of CL) { ell(a, b, r, r * .94); ctx.fill(); } ctx.restore(); }
function clouds(p, t, y, seed, n = 5, sp = 8, sc = 1) { if (SKYK) return; for (let i = 0; i < n; i++) { const x = ((hash(seed + i) * 1700 + t * sp * (.6 + hash(i + 9))) % 2000) - 460; cloud(x, y + hash(seed + i * 3) * 240, sc * (.7 + hash(seed + i * 7) * .6), p.cloud, p.cshade); } }
function sea(p, t, y0, y1, amp = 1) {
  const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, p.sea1); g.addColorStop(1, p.sea2); ctx.fillStyle = g; ctx.fillRect(-1000, y0, W + 2000, y1 - y0 + 900);
  ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let r = 0; r < 9; r++) { const yy = y0 + (r + .5) * (y1 - y0) / 9, sp = (.4 + hash(r + 3)) * 30 * amp;
    for (let k = 0; k < 7; k++) { const xx = ((hash(r * 10 + k) * 1700 + t * sp) % 2000) - 460, len = 30 + r * 9; ctx.beginPath(); ctx.moveTo(xx, yy); ctx.quadraticCurveTo(xx + len / 2, yy - 5 * amp + Math.sin(t * 2 + k) * 3 * amp, xx + len, yy); ctx.stroke(); } }
}
function fgWaves(p, t, amp, y0 = 1260, gap = 200) {
  const cols = [p.w1, p.w2, p.w3];
  for (let j = 0; j < 3; j++) { const y = y0 + j * gap, a = (18 + j * 12) * amp, k = .006 + j * .0018, sp = 1.1 + j * .5;
    const yAt = x => y + Math.sin(x * k + t * sp + j) * a + Math.sin(x * k * 2.3 - t * sp * 1.3) * a * .35;
    ctx.beginPath(); ctx.moveTo(-1000, 3000); for (let x = -1000; x <= W + 1000; x += 24) ctx.lineTo(x, yAt(x)); ctx.lineTo(W + 1000, 3000); ctx.closePath(); ctx.fillStyle = cols[j]; ctx.fill();
    ctx.beginPath(); for (let x = -1000; x <= W + 1000; x += 24) ctx.lineTo(x, yAt(x) + 4); ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.stroke(); }
}
function mast(x, t, sway = 0) {
  line([x, 260, x - 470, 968], 4, 'rgba(40,25,15,.8)'); line([x, 260, x + 330, 968], 4, 'rgba(40,25,15,.8)'); line([x, 120, x - 300, 968], 4, 'rgba(40,25,15,.8)');
  rr(x - 26, -900, 52, 2060, 10); fs('#8a5530', 7); for (const y of [300, 700]) { rr(x - 32, y, 64, 22, 6); fs('#5a3418', 6); }
}
function deck(p, t, o = {}) {
  const hz = o.hz != null ? o.hz : 800;
  sky(p, hz); clouds(p, t, hz - 620, o.seed || 11, 6, o.cs || 10, 1.1); sea(p, t, hz, 1000, o.amp || 1);
  if (o.amp > 1.6) { ctx.fillStyle = p.w2; ctx.beginPath(); ctx.moveTo(-1000, 1000); for (let x = -1000; x <= W + 1000; x += 30) ctx.lineTo(x, hz + 60 + Math.sin(x * .008 + t * 2.2) * 40 + Math.sin(x * .02 - t * 3) * 14); ctx.lineTo(W + 1000, 1000); ctx.closePath(); ctx.fill(); }
  if (o.mast != null) mast(o.mast, t);
  ctx.fillStyle = '#a8352b'; ctx.fillRect(-1000, 990, W + 2000, 140); ctx.fillStyle = '#f3efe6'; ctx.fillRect(-1000, 1062, W + 2000, 18);
  for (let x = -1000; x < W + 1000; x += 72) line([x, 994, x, 1130], 3, '#7e241c');
  ctx.fillStyle = '#2f8f8a'; ctx.fillRect(-1000, 958, W + 2000, 36); line([-1000, 958, W + 1000, 958], 6); line([-1000, 994, W + 1000, 994], 6); line([-1000, 1130, W + 1000, 1130], 6);
  const g = ctx.createLinearGradient(0, 1130, 0, 1920); g.addColorStop(0, '#93603a'); g.addColorStop(1, '#d39456'); ctx.fillStyle = g; ctx.fillRect(-1000, 1130, W + 2000, 1600);
  const vx = o.vx != null ? o.vx : 540; ctx.strokeStyle = 'rgba(70,35,15,.5)'; ctx.lineWidth = 4;
  const xAt = (i, y) => vx + i * 60 + (i * 190 - i * 60) * (y - 1130) / 1170;
  for (let i = -24; i <= 24; i++) { ctx.beginPath(); ctx.moveTo(xAt(i, 1130), 1130); ctx.lineTo(xAt(i, 2700), 2700); ctx.stroke(); }
  for (let i = -24; i < 24; i++) for (let j = 0; j < 6; j++) { const yy = 1150 + j * j * 46 + hash(i * 7 + j) * 60; ctx.beginPath(); ctx.moveTo(xAt(i, yy), yy); ctx.lineTo(xAt(i + 1, yy), yy); ctx.stroke(); }
  if (o.wet) { ctx.fillStyle = 'rgba(170,200,255,.18)'; for (let i = 0; i < 9; i++) { ell(hash(i + 40) * 1400 - 160, 1250 + hash(i + 60) * 600, 120 + hash(i) * 120, 18 + hash(i + 2) * 14); ctx.fill(); } }
}
function galley(t, o = {}) {
  for (let x = -1000, i = 0; x < W + 1000; x += 95, i++) { ctx.fillStyle = mixHex('#7a4a29', hash(i * 3.1) > .5 ? '#8c5734' : '#673c22', hash(i * 7.7) * .8); ctx.fillRect(x, -1000, 95, 2600);
    ctx.strokeStyle = 'rgba(45,20,6,.2)'; ctx.lineWidth = 3; for (let g = 0; g < 3; g++) { const gx = x + 20 + g * 25 + hash(i + g) * 10; ctx.beginPath(); ctx.moveTo(gx, -1000); for (let y = -1000; y <= 1500; y += 100) ctx.lineTo(gx + Math.sin(y * .01 + i + g) * 5, y); ctx.stroke(); }
    if (hash(i * 5.3) > .55) { const ky = 200 + hash(i * 9.1) * 1100; ell(x + 47, ky, 10, 16); ctx.fillStyle = 'rgba(45,20,6,.4)'; ctx.fill(); } }
  { const sg = ctx.createLinearGradient(0, -200, 0, 1500); sg.addColorStop(0, 'rgba(20,8,0,.35)'); sg.addColorStop(.5, 'rgba(20,8,0,0)'); sg.addColorStop(1, 'rgba(20,8,0,.25)'); ctx.fillStyle = sg; ctx.fillRect(-1000, -1000, W + 2000, 2500); }
  ctx.strokeStyle = '#5a331b'; ctx.lineWidth = 5; for (let x = -1000; x < W + 1000; x += 95) { ctx.beginPath(); ctx.moveTo(x, -1000); ctx.lineTo(x, 1500); ctx.stroke(); }
  ctx.fillStyle = '#4e2c16'; ctx.fillRect(-1000, 170, W + 2000, 60); line([-1000, 170, W + 1000, 170], 5); line([-1000, 230, W + 1000, 230], 5);
  const px = 860, py = 560; ell(px, py, 108, 108); fs('#d9a646', 10);
  ctx.save(); ell(px, py, 82, 82); ctx.clip(); const g = ctx.createLinearGradient(0, py - 90, 0, py + 90); g.addColorStop(0, o.night ? '#1a2246' : '#5fb6ee'); g.addColorStop(1, o.night ? '#33406a' : '#d9f1ff'); ctx.fillStyle = g; ctx.fillRect(px - 90, py - 90, 180, 180);
  ctx.fillStyle = o.night ? '#1d315c' : '#2d8fd6'; ctx.fillRect(px - 90, py + 18 + Math.sin(t * 1.5) * 10, 180, 90); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(px - 50, py - 60, 16, 70); ctx.restore(); ell(px, py, 82, 82); fs(null, 8);
  for (let i = 0; i < 8; i++) { const a = i * TAU / 8; ell(px + Math.cos(a) * 96, py + Math.sin(a) * 96, 6, 6); ctx.fillStyle = '#8a6420'; ctx.fill(); }
  rr(40, 1000, 520, 26, 6); fs('#5a331b', 6); line([90, 1026, 90, 1080], 10); line([510, 1026, 510, 1080], 10);
  const jw = o.jarWob || 0; [[110, '#d64f3a'], [220, '#e8b33a'], [330, '#5aa05a'], [440, '#5c7fc4']].forEach(([x, c], i) => { ctx.save(); ctx.translate(x, 1000); ctx.rotate(i === 2 ? jw : 0); rr(-34, -90, 68, 90, 14); ctx.fillStyle = 'rgba(225,240,255,.3)'; ctx.fill(); ctx.save(); rr(-34, -90, 68, 90, 14); ctx.clip(); ctx.fillStyle = c; ctx.fillRect(-40, -54 + i * 7, 80, 70); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(-40, -56 + i * 7, 80, 6); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(14, -90, 30, 100); ctx.restore(); rr(-25, -82, 9, 66, 5); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fill(); rr(-34, -90, 68, 90, 14); fs(null, 6); rr(-28, -104, 56, 18, 5); fs('#8a5a2b', 5); ctx.restore(); });
  for (const [x, r] of [[150, 55], [300, 44]]) { const a = Math.sin(t * 1.7 + x) * .08; ctx.save(); ctx.translate(x, 230); ctx.rotate(a); line([0, 0, 0, 90], 5); ell(0, 90 + r, r, r); fs('#3a3a3f', 7); ell(-r * .3, 90 + r * .7, r * .25, r * .2); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fill(); ctx.restore(); }
  { const a = Math.sin(t * 1.3) * .12; ctx.save(); ctx.translate(560, 230); ctx.rotate(a); line([0, 0, 0, 70], 5); const gl = ctx.createRadialGradient(0, 120, 5, 0, 120, 260); gl.addColorStop(0, 'rgba(255,214,120,.45)'); gl.addColorStop(1, 'rgba(255,214,120,0)'); ctx.fillStyle = gl; ctx.fillRect(-260, -140, 520, 520); rr(-30, 70, 60, 90, 10); fs('#ffd36e', 7); line([-30, 100, 30, 100], 4); ctx.restore(); }
  const g2 = ctx.createLinearGradient(0, 1500, 0, 1920); g2.addColorStop(0, '#80522e'); g2.addColorStop(1, '#b57d48'); ctx.fillStyle = g2; ctx.fillRect(-1000, 1500, W + 2000, 1200); line([-1000, 1500, W + 1000, 1500], 6);
  ctx.strokeStyle = 'rgba(60,30,12,.5)'; ctx.lineWidth = 4; for (let i = -20; i <= 20; i++) { ctx.beginPath(); ctx.moveTo(540 + i * 70, 1500); ctx.lineTo(540 + i * 210, 2400); ctx.stroke(); }
  if (o.stove !== false) { const sx = o.sx != null ? o.sx : 480, sy = 1360;
    rr(sx + 100, -1000, 40, sy + 1000, 6); fs('#2d2d33', 7);
    rr(sx, sy, 240, 150, 16); fs('#2b2b30', 8); rr(sx - 12, sy - 16, 264, 26, 8); fs('#1d1d22', 7);
    const fl = .75 + .25 * Math.sin(t * 17) * Math.sin(t * 7.3); rr(sx + 50, sy + 40, 140, 80, 12); fs(mixHex('#ff7a1a', '#ffd04a', fl), 6);
    for (let i = 0; i < 4; i++) { const fx = sx + 74 + i * 30, fh = 26 + 14 * Math.sin(t * 13 + i * 2); ctx.beginPath(); ctx.moveTo(fx - 12, sy + 116); ctx.quadraticCurveTo(fx, sy + 116 - fh * 2, fx + 12, sy + 116); ctx.fillStyle = '#fff3a0'; ctx.fill(); }
  }
}
function ship(x, y, s, rock, t, sail = 0, sxs = 1, lights = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rock); ctx.scale(s * sxs, s); ctx.lineJoin = 'round';
  const M = [[-170, 520, 230], [20, 620, 270], [190, 470, 210]];
  for (const [mx, h] of M) { rr(mx - 11, -h, 22, h + 10, 8); fs('#7a4a26', 6); }
  M.forEach(([mx, h, w], i) => { sailDraw(mx, -h + 80, w, h * .62, t, sail, i); });
  const fw = Math.sin(t * 8) * 10; ctx.beginPath(); ctx.moveTo(20, -620); ctx.quadraticCurveTo(70, -640 + fw, 110, -612 + fw * .5); ctx.lineTo(20, -590); ctx.closePath(); fs('#d8322a', 5);
  line([330, -70, 480, -170], 12); line([330, -70, 480, -170], 5, '#8a5530');
  const hull = () => { ctx.beginPath(); ctx.moveTo(-370, -60); ctx.lineTo(330, -70); ctx.lineTo(390, -120); ctx.quadraticCurveTo(380, 50, 290, 120); ctx.lineTo(-300, 120); ctx.quadraticCurveTo(-375, 50, -370, -60); ctx.closePath(); };
  hull(); fs('#c43a2f', 0); ctx.save(); hull(); ctx.clip(); ctx.fillStyle = '#2a1d16'; ctx.fillRect(-400, -130, 820, 92); ctx.fillStyle = '#f3efe6'; ctx.fillRect(-400, -8, 820, 22); ctx.fillStyle = '#3a2a22'; ctx.fillRect(-400, 92, 820, 40); ctx.restore(); hull(); fs(null, 8); line([-372, -62, 333, -72], 24); line([-372, -62, 333, -72], 12, '#2f8f8a');
  for (let px = -260; px <= 260; px += 90) { ell(px, 48, 12, 12); fs(lights ? '#ffe48a' : '#f2c230', 5); }
  rr(-390, -150, 130, 100, 10); fs('#8a5530', 7); for (const wx of [-360, -310]) { rr(wx, -130, 30, 40, 4); fs(lights ? '#ffe48a' : '#bfe6ff', 4); }
  ctx.restore();
}
function sailDraw(x0, y0, w, h, t, st, i) {
  const wob = st === 0 ? 6 : 26, bul = 30;
  const pth = (xa, xb) => { ctx.beginPath(); ctx.moveTo(xa, y0); ctx.quadraticCurveTo((xa + xb) / 2, y0 - 12, xb, y0); ctx.quadraticCurveTo(xb + bul + Math.sin(t * 9 + i) * wob, y0 + h / 2, xb, y0 + h); ctx.quadraticCurveTo((xa + xb) / 2, y0 + h + 22 + Math.sin(t * 11 + i) * wob, xa, y0 + h); ctx.quadraticCurveTo(xa + bul * .6 + Math.sin(t * 8 + i) * wob, y0 + h / 2, xa, y0); ctx.closePath(); };
  const paint = (xa, xb) => { pth(xa, xb); fs('#f6f1e6', 0); ctx.save(); pth(xa, xb); ctx.clip(); ctx.fillStyle = '#d8322a'; for (let k = 0; k < 6; k += 2) ctx.fillRect(x0 - w / 2 + k * w / 5, y0 - 30, w / 5, h + 60); ctx.restore(); pth(xa, xb); fs(null, 6); };
  if (st === 2) { paint(x0 - w / 2, x0 - w * .1); ctx.save(); ctx.translate(Math.sin(t * 12 + i) * 8, 0); paint(x0 + w * .1, x0 + w / 2); ctx.restore(); }
  else paint(x0 - w / 2, x0 + w / 2);
  line([x0 - w / 2 - 14, y0, x0 + w / 2 + 14, y0], 10, '#5a3418');
}
function lighthouse(x, y, s, on, t, ba) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (on > 0) { ctx.save(); ctx.translate(0, -425); const g = ctx.createRadialGradient(0, 0, 10, 0, 0, 1500); g.addColorStop(0, 'rgba(255,240,170,' + .6 * on + ')'); g.addColorStop(1, 'rgba(255,240,170,0)'); ctx.fillStyle = g;
    for (const d of [0, PI]) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 1500, ba + d - .16, ba + d + .16); ctx.closePath(); ctx.fill(); }
    const g2 = ctx.createRadialGradient(0, 0, 0, 0, 0, 260); g2.addColorStop(0, 'rgba(255,245,190,' + .9 * on + ')'); g2.addColorStop(1, 'rgba(255,245,190,0)'); ctx.fillStyle = g2; ctx.fillRect(-260, -260, 520, 520); ctx.restore(); }
  ctx.beginPath(); ctx.moveTo(-230, 40); ctx.quadraticCurveTo(-160, -50, -60, -20); ctx.lineTo(70, -25); ctx.quadraticCurveTo(180, -40, 240, 40); ctx.closePath(); fs('#3b3b46', 7);
  const tw = () => { ctx.beginPath(); ctx.moveTo(-70, -10); ctx.lineTo(-45, -370); ctx.lineTo(45, -370); ctx.lineTo(70, -10); ctx.closePath(); };
  tw(); fs('#f4efe6', 0); ctx.save(); tw(); ctx.clip(); ctx.fillStyle = '#d8322a'; for (let k = 0; k < 3; k++) ctx.fillRect(-80, -90 - k * 110, 160, 55); ctx.restore(); tw(); fs(null, 8);
  rr(-62, -392, 124, 24, 6); fs('#333', 6); rr(-38, -462, 76, 72, 8); fs(on > 0 ? '#ffe78a' : '#6a6f7a', 7);
  ctx.beginPath(); ctx.moveTo(-50, -460); ctx.lineTo(0, -515); ctx.lineTo(50, -460); ctx.closePath(); fs('#d8322a', 7);
  ctx.restore();
}
function seaWide(p, t, o = {}) {
  const hz = o.hz != null ? o.hz : 980; sky(p, hz); if (o.clouds !== false) clouds(p, t, hz - 760, o.seed || 5, 6, 10, 1.3);
  if (o.sky) o.sky(); sea(p, t, hz, 1500, o.amp || 1); if (o.pre) o.pre();
  if (o.ship !== false) ship(o.sx != null ? o.sx : 540, o.sy != null ? o.sy : 1190, o.ss || .95, o.rock || 0, t, o.sail || 0, o.sxs || 1, o.lights || 0);
  fgWaves(p, t, o.amp || 1, o.wy || 1270);
}
function port(t) {
  const p = PAL.dawn; sky(p, 1060);
  ctx.save(); ctx.translate(290, 1040); ctx.rotate(t * .08); ctx.fillStyle = 'rgba(255,248,214,.22)'; for (let i = 0; i < 12; i++) { ctx.rotate(TAU / 12); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-60, -1400); ctx.lineTo(60, -1400); ctx.closePath(); ctx.fill(); } ctx.restore();
  const sg = ctx.createRadialGradient(290, 1040, 40, 290, 1040, 420); sg.addColorStop(0, 'rgba(255,250,220,.9)'); sg.addColorStop(1, 'rgba(255,250,220,0)'); ctx.fillStyle = sg; ctx.fillRect(-200, 600, 1000, 900);
  ell(290, 1040, 130, 130); ctx.fillStyle = '#fff4c8'; ctx.fill();
  clouds(p, t, 300, 31, 5, 12, 1);
  ctx.fillStyle = '#c08aa0'; ctx.beginPath(); ctx.moveTo(-1000, 1062); for (let x = -1000; x <= W + 1000; x += 40) ctx.lineTo(x, 1040 - Math.abs(Math.sin(x * .004)) * 60 - Math.sin(x * .011) * 15); ctx.lineTo(W + 1000, 1062); ctx.closePath(); ctx.fill();
  sea(p, t, 1060, 1320, .6); lighthouse(920, 1110, .62, 0, t, 0);
  for (let i = 0; i < 3; i++) { const x = ((t * 70 + i * 420) % 1500) - 200, y = 520 + i * 90 + Math.sin(t * 3 + i) * 20, w = Math.sin(t * 10 + i * 2) * 14; ctx.beginPath(); ctx.moveTo(x - 34, y - w); ctx.quadraticCurveTo(x - 14, y - 22, x, y); ctx.quadraticCurveTo(x + 14, y - 22, x + 34, y - w); fs(null, 7); }
  const g = ctx.createLinearGradient(0, 1300, 0, 1920); g.addColorStop(0, '#9a6538'); g.addColorStop(1, '#cf9054'); ctx.fillStyle = g; ctx.fillRect(-1000, 1300, W + 2000, 1400); line([-1000, 1300, W + 1000, 1300], 6);
  for (let k = 1; k < 14; k++) line([-1000, 1300 + k * k * 7 + k * 14, W + 1000, 1300 + k * k * 7 + k * 14], 4, 'rgba(70,35,15,.45)');
  for (const x of [40, 1000]) { rr(x - 22, 1210, 44, 120, 10); fs('#6b4325', 7); }
}

// ---------- sobreposições (espaço da tela) ----------
function rain(t, amt) { if (amt <= 0) return; ctx.save(); ctx.strokeStyle = 'rgba(205,220,255,' + (.38 * amt) + ')'; ctx.lineWidth = 3; ctx.beginPath(); const n = Math.floor(240 * amt); for (let i = 0; i < n; i++) { const x = ((hash(i) * 1500 + t * 380) % 1500) - 200, y = ((hash(i + 500) * 2300 + t * 2700 * (.8 + hash(i + 77) * .4)) % 2300) - 160; ctx.moveTo(x, y); ctx.lineTo(x - 18, y - 64); } ctx.stroke(); ctx.restore(); }
function tint(col, a) { if (a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function flashA(t, times) { let a = 0; for (const s of times) { const d = t - s; if (d >= 0 && d < .7) a = Math.max(a, d < .06 ? 1 : (d > .12 && d < .2 ? .9 : Math.exp(-(d - .06) * 6) * .8)); } return a; }
function flash(a, alpha = .7) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a * alpha; ctx.fillStyle = '#e8eeff'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function bolt(x, y, seed, a, s = 1) { if (a <= .05) return; ctx.save(); ctx.globalAlpha = Math.min(1, a * 1.3); const pts = [x, y]; let cx = x, cy = y; for (let i = 0; i < 9; i++) { cx += (hash(seed + i) - .5) * 140 * s; cy += (70 + hash(seed + i * 3) * 40) * s; pts.push(cx, cy); } ctx.shadowColor = '#bcd0ff'; ctx.shadowBlur = 40; line(pts, 14 * s, '#ffffff'); ctx.shadowBlur = 0; line(pts, 6 * s, '#e6f0ff'); ctx.restore(); }
function vignette(a = .4) { const g = ctx.createRadialGradient(W / 2, H / 2, H * .32, W / 2, H / 2, H * .78); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,' + a + ')'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
function wind(t, a) { ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,' + .35 * a + ')'; ctx.lineWidth = 5; ctx.lineCap = 'round'; for (let i = 0; i < 14; i++) { const y = hash(i + 200) * H, x = ((hash(i + 300) * 2400 + t * 2200) % 2400) - 600; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 120, y - 20, x + 260, y + Math.sin(t * 6 + i) * 20); ctx.stroke(); } ctx.restore(); }
function cam(z, cx, cy, r = 0, sh = 0, t = 0) { const f = Math.floor(t * 24); ctx.translate(W / 2, H / 2); ctx.rotate(r); ctx.scale(z, z); ctx.translate(-cx + (sh ? (hash(f) - .5) * sh : 0), -cy + (sh ? (hash(f + 99) - .5) * sh : 0)); }
const STORM_T = '#7d8bc6', NIGHT_T = '#6a78b2';

// ---------- poses prontas ----------
function walk(ph, amp = .5) { const s = Math.sin(ph), c = Math.cos(ph); return { lL: [s * amp, -Math.max(0, -c) * amp * 1.4], lR: [-s * amp, -Math.max(0, c) * amp * 1.4], aL: [-.15 - s * amp * .7, .3], aR: [.15 + s * amp * .7, .3], bob: -Math.abs(c) * 10 * amp }; }
function laugh(t, s) { const k = Math.abs(Math.sin(t * 11 + s)); return { bob: -k * 16, lean: -.05 + Math.sin(t * 5.5 + s) * .07, eye: 'happy', mouth: 'grin', mo: .55 + .45 * k, brow: -.3, tilt: Math.sin(t * 11 + s) * .05 }; }
function clap(t, s, y = -110) { const c = Math.abs(Math.sin(t * 9 + s)); return { aL: { ik: [-10 - c * 50, y] }, aR: { ik: [10 + c * 50, y] } }; }
function cheer(t, s) { const j = Math.max(0, Math.sin(t * 8 + s)); return { bob: -j * 90, aL: [-2.75 + Math.sin(t * 16 + s) * .15, -.2], aR: [2.75 - Math.sin(t * 16 + s) * .15, .2], eye: 'happy', mouth: 'grin', mo: .8, lL: [-.25 * j, .3 * j], lR: [.25 * j, -.3 * j] }; }



// ---------- céus pintados (Claude Drawing / FlatVector) ----------
const IMG = { dia: document.getElementById('ceuDia'), tarde: document.getElementById('ceuTarde') };
const TOPC = { dia: '#3f9be6', tarde: '#3c3f8f' };
let SKYK = null, SKYK2 = null, SKYM = 0, TT = 0;
function plate(k, hz, t, a = 1) {
  const im = IMG[k]; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = TOPC[k]; ctx.fillRect(-1500, -3000, W + 3000, hz - 1200 + 3004);
  if (im && im.complete && im.naturalWidth) { const dx = -((t * 8) % 3360);
    for (let i = -2; i <= 2; i++) { const x = -300 + dx + i * 1680; ctx.save(); if (i % 2) { ctx.translate(x + 1680, 0); ctx.scale(-1, 1); ctx.drawImage(im, 0, hz - 1200, 1680, 1200); } else ctx.drawImage(im, x, hz - 1200, 1680, 1200); ctx.restore(); } }
  ctx.restore();
}
PAL.dusk = { s1: '#3c3f8f', s2: '#ffb36b', cloud: '#ffc6a0', cshade: '#c27a8e', sea1: '#d98a6e', sea2: '#4a3f7a', w1: '#7a5a9a', w2: '#634a88', w3: '#4e3a74' };

// ---------- objetos novos ----------
function parrot(x, y, s, o = {}) {
  const f = o.f || 1, fl = o.flap || 0, pk = o.peck || 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * f, s); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; if (o.fly) { ctx.translate(0, -70); ctx.rotate(.45); ctx.translate(0, 70); }
  if (o.fly) { ctx.save(); ctx.translate(-2, -104); ctx.rotate(-.2 - fl * 2.2); ctx.beginPath(); ctx.moveTo(-6, 0); ctx.quadraticCurveTo(-34, 44, -14, 96); ctx.quadraticCurveTo(24, 50, 20, 2); ctx.closePath(); fs('#1f7a2e', 6); ctx.restore(); }
  ctx.beginPath(); ctx.moveTo(-22, -46); ctx.lineTo(-78, 66); ctx.lineTo(-46, 76); ctx.lineTo(-4, -34); ctx.closePath(); fs('#2f8fd6', 6);
  ctx.beginPath(); ctx.moveTo(-12, -44); ctx.lineTo(-56, 88); ctx.lineTo(-26, 92); ctx.lineTo(8, -32); ctx.closePath(); fs('#d8322a', 6);
  if (o.fly) { line([-6, -34, -26, -14], 6); line([10, -34, -10, -10], 6); } else { line([-6, -34, -8, 0], 6); line([12, -34, 14, 0], 6); line([-22, 0, 6, 0], 6); line([0, 0, 28, 0], 6); }
  ell(0, -74, 42, 58, -.35); fs('#3fae4a', 7);
  ell(12, -62, 20, 34, -.35); ctx.fillStyle = '#f2d23a'; ctx.fill();
  ctx.save(); ctx.translate(18, -126); ctx.rotate(pk * .9);
  ell(0, 0, 36, 34); fs('#d8322a', 7);
  ctx.beginPath(); ctx.moveTo(26, -14); ctx.quadraticCurveTo(64, -12, 54, 26); ctx.quadraticCurveTo(44, 10, 28, 10); ctx.closePath(); fs('#f2b134', 6);
  if (o.open) { ctx.beginPath(); ctx.moveTo(28, 10); ctx.lineTo(50, 14 + o.open * 20); ctx.lineTo(28, 22); ctx.closePath(); fs('#e0952a', 5); }
  if (o.bisc) biscuit(62, 24, .55);
  ell(8, -8, 13, 13); fs('#fff', 5);
  if (o.eye === 'happy') line([1, -6, 8, -14, 15, -6], 5); else { ell(11, -8, 5, 6); ctx.fillStyle = INK; ctx.fill(); }
  ctx.restore();
  ctx.save(); ctx.translate(-8, -100); ctx.rotate(-.35 - fl * (o.fly ? 2.4 : 1.7));
  ctx.beginPath(); ctx.moveTo(-6, 0); ctx.quadraticCurveTo(-34, 44, -14, 96); ctx.quadraticCurveTo(24, 50, 20, 2); ctx.closePath(); fs('#2e9a3c', 6);
  ctx.beginPath(); ctx.moveTo(-22, 66); ctx.quadraticCurveTo(-24, 90, -14, 96); ctx.quadraticCurveTo(0, 84, 4, 70); ctx.closePath(); ctx.fillStyle = '#2f8fd6'; ctx.fill();
  ctx.restore(); ctx.restore();
}
function feather(x, y, a, s) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(0, -60); ctx.quadraticCurveTo(28, -10, 0, 60); ctx.quadraticCurveTo(-28, -10, 0, -60); fs('#3fae4a', 5); line([0, -50, 0, 74], 4); ctx.restore(); }
function perch(x, y) { rr(x - 10, y, 20, 330, 6); fs('#8a5530', 6); ell(x, y + 334, 90, 18); fs('#6b4325', 6); rr(x - 150, y - 14, 300, 26, 12); fs('#a8692f', 6); ctx.beginPath(); ctx.moveTo(x + 80, y - 14); ctx.quadraticCurveTo(x + 115, y + 30, x + 150, y - 14); ctx.closePath(); fs('#d9c79a', 5); }
function hammock(x0, y0, x1, y1, sag, sw = 0) {
  const mx = (x0 + x1) / 2 + sw, my = Math.max(y0, y1) + sag;
  line([x0, y0 - 260, x0, y0], 6, '#5a3418'); line([x1, y1 - 260, x1, y1], 6, '#5a3418');
  const pth = () => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, my + 70, x1, y1); ctx.quadraticCurveTo(mx, my - 20, x0, y0); ctx.closePath(); };
  pth(); fs('#e8d7a8', 0); ctx.save(); pth(); ctx.clip(); ctx.strokeStyle = 'rgba(120,80,40,.5)'; ctx.lineWidth = 3;
  for (let k = -14; k <= 14; k++) { ctx.beginPath(); ctx.moveTo(mx + k * 40 - 200, my - 200); ctx.lineTo(mx + k * 40 + 200, my + 200); ctx.moveTo(mx + k * 40 + 200, my - 200); ctx.lineTo(mx + k * 40 - 200, my + 200); ctx.stroke(); }
  ctx.restore(); pth(); fs(null, 6);
}
function hammockBack(x0, y0, x1, y1, sag, sw = 0) { const mx = (x0 + x1) / 2 + sw, my = Math.max(y0, y1) + sag; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, y0 + sag * .25, x1, y1); ctx.quadraticCurveTo(mx, my + 70, x0, y0); ctx.closePath(); ctx.fillStyle = '#c7b183'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); }
function zz(x, y, t) { ctx.save(); ctx.font = 'bold 64px sans-serif'; ctx.lineWidth = 8; ctx.strokeStyle = INK; ctx.fillStyle = '#fff';
  for (let i = 0; i < 3; i++) { const ph = (t * .7 + i / 3) % 1; ctx.globalAlpha = Math.sin(ph * PI); const s = .6 + ph * .6; ctx.save(); ctx.translate(x + ph * 90 + Math.sin(ph * 9) * 14, y - ph * 200); ctx.scale(s, s); ctx.strokeText('Z', 0, 0); ctx.fillText('Z', 0, 0); ctx.restore(); }
  ctx.restore(); }
function note(x, y, s, a, al) { if (al <= 0) return; ctx.save(); ctx.globalAlpha = al; ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s); ell(0, 0, 24, 17, -.4); ctx.fillStyle = INK; ctx.fill(); line([20, -6, 20, -92, 50, -68], 8); ctx.restore(); }
function apple(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ell(0, 0, 24, 22); fs('#d8322a', 5); line([0, -20, 4, -32], 4); leaf(12, -30, -.5, .35); ctx.restore(); }
const THROW = ['crate', 'bucket', 'fish', 'apple', 'rope', 'crate', 'fish', 'bucket'];
function junk(k, x, y, a, s) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
  if (k === 'crate') { rr(-60, -60, 120, 120, 8); fs('#b8773d', 7); line([-60, -60, 60, 60], 6); line([60, -60, -60, 60], 6); }
  else if (k === 'bucket') { ctx.beginPath(); ctx.moveTo(-45, -50); ctx.lineTo(45, -50); ctx.lineTo(35, 50); ctx.lineTo(-35, 50); ctx.closePath(); fs('#8fa3b8', 7); ctx.beginPath(); ctx.moveTo(-45, -50); ctx.quadraticCurveTo(0, -120, 45, -50); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke(); }
  else if (k === 'fish') fish(0, 0, 0, .8);
  else if (k === 'apple') apple(0, 0, 1.6);
  else { for (let i = 0; i < 3; i++) { ell(0, 0, 60 - i * 15, 40 - i * 10); ctx.lineWidth = 14; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 7; ctx.strokeStyle = '#d9b26a'; ctx.stroke(); } }
  ctx.restore();
}
function barrelBack(x, y, full = 1) { ell(x, y - 260, 150, 40); fs('#4e2c16', 7); if (full) { ctx.save(); ell(x, y - 260, 146, 37); ctx.clip(); for (let i = 0; i < 9; i++) apple(x - 120 + i * 30, y - 262 + (i % 2) * 12, 1.2); ctx.restore(); } }
function barrelFront(x, y) {
  ctx.beginPath(); ctx.moveTo(x - 150, y - 260); ctx.quadraticCurveTo(x - 192, y - 130, x - 150, y); ctx.lineTo(x + 150, y); ctx.quadraticCurveTo(x + 192, y - 130, x + 150, y - 260); ctx.ellipse(x, y - 260, 150, 40, 0, 0, PI); ctx.closePath(); fs('#b8773d', 8);
  for (const yy of [y - 205, y - 60]) { ctx.beginPath(); ctx.moveTo(x - 168, yy); ctx.quadraticCurveTo(x, yy + 34, x + 168, yy); ctx.lineWidth = 16; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = 8; ctx.strokeStyle = '#6b6f78'; ctx.stroke(); }
  for (const dx of [-80, 0, 80]) line([x + dx, y - 222, x + dx * 1.1, y - 6], 4, 'rgba(70,35,15,.6)');
}
function hold(t) { galley(t, { stove: false }); for (const [x, y, w, h] of [[40, 1330, 260, 230], [220, 1190, 200, 150], [800, 1300, 260, 260]]) { rr(x, y, w, h, 8); fs('#9a6236', 7); line([x, y, x + w, y + h], 5); line([x + w, y, x, y + h], 5); } }
function cabin(t) {
  rr(700, 600, 700, 980, 10); fs('#8a5530', 8); for (let y = 680; y < 1560; y += 80) line([700, y, 1400, y], 4, 'rgba(60,30,12,.5)');
  rr(680, 560, 740, 60, 10); fs('#5a3418', 7);
  const gl = ctx.createRadialGradient(880, 1340, 20, 880, 1340, 420); gl.addColorStop(0, 'rgba(255,200,110,.55)'); gl.addColorStop(1, 'rgba(255,200,110,0)'); ctx.fillStyle = gl; ctx.fillRect(400, 900, 900, 900);
  rr(780, 1110, 200, 470, 12); fs('#ffd27a', 8); rr(790, 1120, 50, 450, 6); ctx.fillStyle = '#7a4a29'; ctx.fill();
  ell(1170, 900, 70, 70); fs('#ffd27a', 8);
}
function bigSpoon(x0, y0, x1, y1) { line([x0, y0, x1 + 36, y1], 17); line([x0, y0, x1 + 36, y1], 9, '#c08a4a'); ell(x1, y1 + 3, 44, 21, (y1 - y0) / (x1 - x0) * .6); fs('#c08a4a', 6); ell(x1, y1 - 2, 32, 11); ctx.fillStyle = '#9a6a34'; ctx.fill(); }
function biscuit(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); rr(-34, -16, 68, 30, 9); fs('#e2b26a', 5); ctx.fillStyle = '#9a6a34'; for (const [a, b] of [[-18, -4], [0, 4], [18, -4]]) { ell(a, b, 4, 4); ctx.fill(); } ctx.restore(); }
function crumbs(x, y, t, n = 6) { ctx.save(); ctx.fillStyle = '#e2b26a'; for (let i = 0; i < n; i++) { const ph = (t * 1.4 + i / n) % 1; ctx.globalAlpha = 1 - ph; ctx.fillRect(x + (hash(i) - .5) * 70 + ph * 20, y + ph * 360, 10, 8); } ctx.restore(); }
function poof(x, y, k) { if (k <= 0 || k >= 1) return; ctx.save(); ctx.globalAlpha = 1 - k; for (let i = 0; i < 9; i++) { const a = i * TAU / 9, d = 80 + k * 220; ell(x + Math.cos(a) * d, y + Math.sin(a) * d * .8, 40 * (1 - k * .6), 40 * (1 - k * .6)); fs('#ffffff', 6); } ctx.restore(); }
function burst(x, y, k, r = 280) { if (k <= 0 || k >= 1) return; ctx.save(); ctx.globalAlpha = 1 - k; for (let i = 0; i < 8; i++) { const a = i * TAU / 8 + .2; line([x + Math.cos(a) * r, y + Math.sin(a) * r * .85, x + Math.cos(a) * (r + 80), y + Math.sin(a) * (r + 80) * .85], 9); } ctx.restore(); }
// pose sentado (de lado, virado para a esquerda)
const SIT = { f: -1, lL: [1.45, .15], lR: [1.3, .35], hipY: -40 };
function hatLap(t) { return () => hatAt('bicorne', 62, -118, .1, .78, t); }

// ---------- planos (tempos casados com a narração) ----------
const SH_ = [];
const shot = (a, b, f) => SH_.push({ a, b, f });

// 1 — "O capitão acordou e levou um susto"
shot(0, 3.3, (lt, t) => {
  const up = lt > 2.2;
  ctx.save(); cam(K(lt, [[0, 1.25], [2.2, 1.12], [2.5, 1.0]]), 520, 1250, 0, lt > 2.2 && lt < 2.7 ? 18 : 0, t);
  galley(t, { stove: false }); perch(880, 1250);
  if (!up) {
    const str = Math.sin(P(lt, 1.0, 1.9) * PI);
    hammockBack(110, 1060, 860, 1060, 360, Math.sin(t * 1.4) * 20);
    drawChar('cap', { x: 800, y: 1205, rot: -PI / 2, shadow: 0, eye: lt < 1.0 ? 'shut' : (lt > 1.9 ? 'wide' : 'dot'), ly: lt > 1.9 ? .9 : 0, brow: lt > 1.9 ? -.7 : 0,
      mouth: lt < 1.0 ? 'o' : (str > .3 ? 'o' : 'smile'), mo: lt < 1 ? .2 + .1 * Math.sin(t * 3) : .2 + .6 * str, aL: str > .05 ? [-.3 - 2.6 * str, .2] : { ik: [48, -70] }, aR: str > .05 ? [.3 + 2.6 * str, -.2] : { ik: [48, -105] }, lL: [-.02, 0], lR: [.02, 0] }, t);
    ctx.save(); ctx.beginPath(); ctx.rect(470, 0, 2000, 3000); ctx.clip(); hammock(110, 1060, 860, 1060, 360, Math.sin(t * 1.4) * 20); ctx.restore(); line([110, 800, 110, 1060], 6, '#5a3418');
    if (lt < 1.0) zz(260, 1000, t);
  } else {
    const j = P(lt, 2.2, 2.9), hop = Math.sin(j * PI);
    { const sw = Math.sin(t * 7) * 70 * (1 - P(lt, 2.2, 3.3)); hammockBack(110, 1060, 860, 1060, 360, sw); hammock(110, 1060, 860, 1060, 360, sw); }
    drawChar('cap', { x: 520, y: 1580 - hop * 260, eye: 'wide', lx: .7, brow: -.8, mouth: 'shout', mo: .9, aL: [-2.6, -.3], aR: [2.6, .3], lL: [-.4 * hop, .5 * hop], lR: [.4 * hop, -.5 * hop], hat: lt > 2.85, sq: 1 + .1 * hop, sweat: 1 }, t);
    if (lt <= 2.85) hatAt('bicorne', 520, 1040 - hop * 260 - Math.sin(P(lt, 2.2, 2.85) * PI) * 220, (lt - 2.2) * 9.7, 1.04, t);
    burst(520, 1250, P(lt, 2.2, 2.75));
  }
  ctx.restore();
});
// 2 — "o Pirata, seu papagaio, tinha sumido!"
shot(3.3, 6.8, (lt, t) => {
  ctx.save(); cam(K(lt, [[0, 1.55], [3.5, 1.7]]), 720, 1270); galley(t, { stove: false }); perch(880, 1250);
  const fu = P(lt, 0, 3.5); feather(880 + Math.sin(lt * 3) * 60, 1150 + fu * 380, Math.sin(lt * 3) * .6, .7);
  const gone = lt > 2.15;
  drawChar('cap', { x: 560, y: 1720, sc: 1.1, eye: 'wide', ly: gone ? 0 : -.3, lx: .8, brow: gone ? -.9 : -.5, mouth: gone ? 'shout' : 'o', mo: gone ? .5 + .4 * talk(t) : .5, sweat: gone ? 1 : 0,
    aL: gone ? [-2.7, -.2] : [-.4, .3], aR: gone ? [2.7, .2] : [.5, -1.7], tilt: gone ? Math.sin(t * 9) * .05 : .06, bob: gone ? -Math.abs(Math.sin(t * 10)) * 20 : 0 }, t);
  const bi = out(P(lt, .2, .55)), bo = P(lt, 2.15, 2.45);
  if (bi > 0 && bo < 1) { const s = bi * (1 + bo * .3); ctx.save(); ctx.globalAlpha = 1 - bo; ctx.translate(690, 860); ctx.scale(s, s);
    for (const [x, y, r] of [[-130, 225, 18], [-95, 178, 28]]) { ell(x, y, r, r); fs('#fff', 6); }
    const B = [[0, 0, 150], [-120, 20, 95], [120, 20, 95], [-70, -80, 95], [70, -80, 95], [-70, 95, 90], [70, 95, 90]];
    for (const [x, y, r] of B) { ell(x, y, r, r); ctx.lineWidth = 16; ctx.strokeStyle = INK; ctx.stroke(); }
    ctx.fillStyle = '#fff'; for (const [x, y, r] of B) { ell(x, y, r, r); ctx.fill(); }
    parrot(12, 78, 1.0, { flap: Math.abs(Math.sin(t * 8)), open: Math.abs(Math.sin(t * 6)) * .8, eye: 'happy' }); ctx.restore(); }
  poof(690, 860, P(lt, 2.15, 2.75));
  ctx.restore();
});
// 3 — "Ele virou o navio de cabeça pra baixo"
shot(6.8, 10.1, (lt, t) => {
  SKYK = 'dia'; const spin = io(P(lt, 1.15, 2.6)) * TAU;
  ctx.save(); cam(1.25, 540, 1250, spin + Math.sin(t * 2) * .05, 10, t); deck(PAL.day, t, { mast: 960 });
  const ph = lt * 2.4, cx = 540 + Math.sin(ph) * 300, dir = Math.cos(ph) > 0 ? 1 : -1;
  drawChar('cap', { ...walk(t * 20, .8), x: cx, y: 1600, f: dir, lean: .2, eye: 'wide', mouth: 'shout', mo: talk(t), brow: -.7, sweat: 1, aL: [-2.4 + Math.sin(t * 17) * .6, .3], aR: [2.4 + Math.cos(t * 15) * .6, -.3] }, t);
  for (let i = 0; i < 8; i++) { const u = (lt - i * .38) / 1.3; if (u < 0 || u > 1) continue; const x0 = 540 + Math.sin(i * .38 * 2.4) * 300, sd = hash(i + 5) > .5 ? 1 : -1;
    junk(THROW[i], x0 + sd * u * 620, 1330 - Math.sin(u * PI) * 700 + u * 220, u * 9 * sd, 1); }
  ctx.restore();
});
// 4 — "Procurou no porão"
shot(10.1, 11.3, (lt, t) => {
  const z = 1.15 + lt * .1, f = (lt % .6) < .3 ? 1 : -1;
  ctx.save(); cam(z, 540, 1250); hold(t);
  const o = { x: 540, y: 1600, f, eye: 'wide', lx: .9, ly: .2, brow: -.6, mouth: 'wavy', lean: .12, tilt: Math.sin(t * 12) * .06, aL: [-.5, .4] };
  const hx = 540 + f * 150, hy = 1330; o.aR = { ik: toBody('cap', o, hx, hy) }; o.hR = { k: 'lantern', a: 0 };
  drawChar('cap', o, t); ctx.restore();
  tint('#2e2c5a', .8);
  const sx = 540 + (hx - 540) * z, sy = 960 + (hy + 70 - 1250) * z;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(sx, sy, 10, sx, sy, 520); g.addColorStop(0, 'rgba(255,190,90,.55)'); g.addColorStop(1, 'rgba(255,190,90,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
});
// 5 — "no mastro"
shot(11.3, 12.3, (lt, t) => {
  SKYK = 'dia'; ctx.save(); cam(1.0, 540, 960, -.06); sky(PAL.day, 2300);
  line([100, 260, 1100, 260], 30); line([100, 260, 1100, 260], 16, '#5a3418');
  rr(560, -600, 90, 3000, 12); fs('#8a5530', 8); for (const y of [500, 1100, 1700]) { rr(552, y, 106, 26, 6); fs('#5a3418', 6); }
  const cy = 1700 - lt * 520, c = Math.sin(lt * 14);
  const o = { x: 470, y: cy, eye: 'wide', ly: -1, lx: .6, brow: -.5, mouth: 'o', mo: .5, sweat: 1, shadow: 0, lL: [.5 + c * .4, -.9], lR: [.5 - c * .4, -.9] };
  o.aL = { ik: toBody('cap', o, 565, cy - 380 + c * 35) }; o.aR = { ik: toBody('cap', o, 575, cy - 300 - c * 35) };
  drawChar('cap', o, t); ctx.restore();
});
// 6 — "até dentro do barril de maçãs"
shot(12.3, 14.7, (lt, t) => {
  SKYK = 'dia'; ctx.save(); cam(K(lt, [[0, 1.2], [2.4, 1.35]]), 600, 1320); deck(PAL.day, t, { mast: 120 });
  const bx = 660, by = 1660; barrelBack(bx, by, 1);
  const dv = P(lt, .65, 1.0);
  if (lt < .65) drawChar('cap', { ...walk(t * 16, .6), x: L(250, 430, lt / .65), y: 1660, eye: 'wide', lx: .8, mouth: 'shout', mo: .6 }, t);
  else if (dv < 1) drawChar('cap', { x: L(430, bx, dv), y: L(1660, by - 520, dv) - Math.sin(dv * PI) * 160, rot: dv * PI, shadow: 0, aL: [-2.8, 0], aR: [2.8, 0], eye: 'shut', mouth: 'o', mo: .7 }, t);
  else { ctx.save(); ctx.beginPath(); ctx.rect(-2000, -3000, 5000, by - 40 + 3000); ctx.clip(); drawChar('cap', { x: bx, y: by - 520 + Math.sin(t * 20) * 8, rot: PI, shadow: 0, lL: [Math.sin(t * 18) * .5, .4], lR: [-Math.sin(t * 18) * .5, -.4], aL: [-2.8, 0], aR: [2.8, 0], eye: 'shut', hat: 0 }, t); ctx.restore(); }
  barrelFront(bx, by);
  for (let i = 0; i < 9; i++) { const u = (lt - 1.0 - i * .12) / .9; if (u < 0 || u > 1) continue; apple(bx + (hash(i + 3) - .5) * 1000 * u, by - 300 - Math.sin(u * PI) * 520 + u * 330, 1.6); }
  ctx.restore();
});
// 7 — "Nada."
shot(14.7, 15.9, (lt, t) => {
  SKYK = 'dia'; ctx.save(); cam(1.7, 660, 1320); deck(PAL.day, t, { mast: 120 });
  const bx = 660, by = 1660, r = out(P(lt, 0, .3)); barrelBack(bx, by, 1);
  ctx.save(); ctx.beginPath(); ctx.rect(-2000, -3000, 5000, by - 40 + 3000); ctx.clip();
  drawChar('cap', { x: bx, y: by + 180 - r * 140, shadow: 0, eye: 'dot', ly: .6, brow: -.6, browY: .3, mouth: 'frown', aL: [-.3, .2], aR: [.3, -.2], tilt: -.06, front: () => apple(0, -470, 1.5) }, t); ctx.restore();
  barrelFront(bx, by);
  ctx.restore();
});
// 8 — "A tripulação inteira entrou na busca"
shot(15.9, 18.9, (lt, t) => {
  SKYK = 'dia'; ctx.save(); cam(K(lt, [[0, 1.0], [3, 1.08]]), 540, 1250); deck(PAL.day, t, { mast: 900 });
  const go = P(lt, 1.6, 3.0), arr = P(lt, 0, .8);
  drawChar('cap', { x: 540, y: 1560, f: Math.sin(t * 2.5) > 0 ? 1 : -1, eye: 'wide', brow: -.6, mouth: lt < 1.6 ? 'shout' : 'o', mo: lt < 1.6 ? talk(t) : .5, aR: [2.2 + Math.sin(t * 6) * .3, -.1], aL: [-.6, .4] }, t);
  drawChar('mar1', lt < .8 ? { ...walk(t * 18, .8), x: L(-200, 230, arr), y: 1700, lean: .2, eye: 'wide', mouth: 'o', mo: .5 } :
    lt < 1.6 ? { x: 230, y: 1700, eye: 'wide', lx: .6, mouth: 'smile', aR: [2.75, .25] } :
    { ...walk(t * 18, .9), x: 230 - go * 800, y: 1700, f: -1, lean: .25, eye: 'wide', mouth: 'shout', mo: .7 }, t);
  drawChar('mar2', lt < .8 ? { ...walk(t * 18, .8), x: L(1280, 860, arr), y: 1730, f: -1, lean: .2, eye: 'wide', mouth: 'o', mo: .5, hR: { k: 'glass', a: .3 } } :
    lt < 1.6 ? { x: 860, y: 1730, f: -1, eye: 'wide', lx: .6, mouth: 'smile', hR: { k: 'glass', a: .3 } } :
    { ...walk(t * 18, .9), x: 860 + go * 800, y: 1730, lean: .25, eye: 'wide', mouth: 'shout', mo: .7, hR: { k: 'glass', a: .3 } }, t);
  ctx.restore();
});
// 9 — "O Beto olhou debaixo das redes"
shot(18.9, 21.2, (lt, t) => {
  ctx.save(); cam(1.2, 560, 1260); galley(t, { stove: false });
  const lift = io(P(lt, .3, .8)) * (1 - io(P(lt, 1.3, 1.6)));
  hammock(100, 1000, 520, 1000, 70, Math.sin(t * 2) * 15);
  ctx.save(); ctx.translate(560, 1520); ctx.rotate(.3); rr(-40, -16, 80, 34, 14); fs('#e9e2d0', 5); rr(-40, -16, 24, 34, 8); ctx.fillStyle = '#d8322a'; ctx.fill(); ctx.restore();
  hammock(300, 1230, 900, 1230 - lift * 230, 70 * (1 - lift * .5), 0);
  const shrug = P(lt, 1.6, 1.9);
  const o = { x: 780, y: 1640, f: -1, lL: [1.0 * (1 - shrug), -1.8 * (1 - shrug)], lR: [.6 * (1 - shrug), -1.3 * (1 - shrug)], lean: (.45 * lift + .1) * (1 - shrug), tilt: .25 * lift,
    eye: lt > 1.0 && lt < 1.6 ? 'wide' : 'dot', ly: .7 * lift, lx: .6, mouth: lt > 1.6 ? 'flat' : 'o', mo: .4, aL: [-.4, .3] };
  if (shrug > 0) { o.aL = [-1.3, -1.2 * shrug]; o.aR = [1.3, 1.2 * shrug]; o.lx = 0; o.brow = .4; o.tilt = .12; }
  else o.aR = { ik: toBody('mar1', o, 860, 1250 - lift * 220) };
  drawChar('mar1', o, t);
  ctx.restore();
});
// 10 — "O Zeca subiu até o cesto da gávea"
shot(21.2, 24.0, (lt, t) => {
  SKYK = 'dia'; const cy = K(lt, [[0, 1500], [1.9, 640]]); ctx.save(); cam(1.0, 540, cy); sky(PAL.day, 2300);
  rr(500, -500, 80, 3000, 10); fs('#8a5530', 8);
  sailDraw(540, 1000, 760, 640, t, 0, 1);
  for (let k = 0; k < 7; k++) line([170 + k * 50, 2300, 470, 560], 4, 'rgba(40,25,15,.85)');
  for (let y = 700; y < 2300; y += 90) line([470 - (y - 560) * .19, y, 470, y], 4, 'rgba(40,25,15,.85)');
  const fw = Math.sin(t * 8) * 10; ctx.beginPath(); ctx.moveTo(540, -480); ctx.quadraticCurveTo(620, -500 + fw, 680, -470 + fw * .5); ctx.lineTo(540, -440); ctx.closePath(); fs('#d8322a', 5);
  const cl = P(lt, 0, 1.9);
  if (cl < 1) { const y = L(2050, 640, io(cl)), c = Math.sin(lt * 16);
    const o = { x: 420, y, eye: 'wide', ly: -1, lx: .5, mouth: 'flat', shadow: 0, lL: [.4 + c * .4, -.9], lR: [.4 - c * .4, -.9] };
    o.aL = { ik: toBody('mar2', o, 488, y - 360 + c * 35) }; o.aR = { ik: toBody('mar2', o, 498, y - 290 - c * 35) };
    drawChar('mar2', o, t);
  } else { const k = lt - 1.9;
    drawChar('mar2', { x: 560, y: 650, eye: 'dot', lx: Math.sin(k * 4), mouth: 'flat', aR: { ik: [70, -250] }, hR: { k: 'glass', a: PI / 2 }, aL: [-.4, .3], f: Math.sin(k * 4) > -.2 ? 1 : -1 }, t); }
  rr(400, 460, 300, 200, 14); fs('#9a6236', 8); for (const x of [460, 530, 600, 660]) line([x, 470, x, 650], 4, 'rgba(60,30,12,.6)'); rr(388, 446, 324, 30, 10); fs('#6b4325', 7);
  ctx.restore();
});
// 11 — "E o cozinheiro? Continuou mexendo a panela, tranquilo."
shot(24.0, 28.0, (lt, t) => {
  const z = K(lt, [[0, 1.0], [.9, 1.0], [1.6, 1.4]]);
  ctx.save(); cam(z, K(lt, [[.9, 540], [1.6, 590]]), K(lt, [[.9, 1200], [1.6, 1260]])); galley(t);
  rr(370, 1470, 200, 110, 8); fs('#9a6236', 7); line([370, 1470, 570, 1580], 5); line([570, 1470, 370, 1580], 5);
  const o = { x: 470, y: 1474, shadow: 0, eye: 'happy', lx: .6, mouth: 'smile', tilt: Math.sin(t * 2.2) * .07, lean: .06 + Math.sin(t * 2.2) * .03,
    aR: { ik: [112 + Math.cos(t * 4) * 16, -118 + Math.sin(t * 4) * 6], s: -1 }, hR: { k: 'ladle', a: .45 + Math.cos(t * 4) * .12 }, aL: [-.3, .3] };
  if (lt > 2.3) o.behind = () => { ctx.save(); ctx.translate(-70, -430); ctx.rotate(-.5 + Math.sin(t * 6) * .25); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-20, -80); ctx.lineTo(8, -84); ctx.closePath(); fs('#d8322a', 5); ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-2, -66); ctx.lineTo(24, -66); ctx.closePath(); fs('#2f8fd6', 5); ctx.restore(); };
  drawChar('tiao', o, t); pot(620, 1316, .55); steam(620, 1250, t, 3, .6);
  if (lt < 1.0) drawChar('mar1', { ...walk(t * 20, .9), x: L(-250, 1350, lt / 1.0), y: 1780, sc: 1.1, lean: .25, eye: 'wide', mouth: 'shout', mo: .8 }, t);
  ctx.restore();
});
// 12 — "Já era fim de tarde quando o capitão se sentou, triste, no convés."
shot(28.0, 33.7, (lt, t) => {
  const m = io(P(lt, .1, 2.0)); SKYK = 'dia'; SKYK2 = 'tarde'; SKYM = m;
  ctx.save(); cam(K(lt, [[0, 1.0], [3.4, 1.0], [5.7, 1.3]]), K(lt, [[3.4, 540], [5.7, 480]]), K(lt, [[3.4, 1250], [5.7, 1360]])); deck(mixPal(PAL.day, PAL.dusk, m), t, { mast: 960 });
  const sit = io(P(lt, 2.9, 3.5));
  const w = lt < 2.9 ? walk(lt * 7, .3) : {};
  const o = { ...w, x: lt < 2.9 ? L(1250, 480, P(lt, .5, 2.9)) : 480, y: 1620, f: -1, eye: 'dot', ly: .7, brow: -.5, browY: .3, mouth: 'frown', tilt: .12, lean: .08, hat: 0,
    aL: [.6, -.2], aR: [.5, -.2], front: hatLap(t) };
  if (sit > 0) { o.lL = [L(-.07, SIT.lL[0], sit), L(0, SIT.lL[1], sit)]; o.lR = [L(.07, SIT.lR[0], sit), L(0, SIT.lR[1], sit)]; o.hipY = L(-148, SIT.hipY, sit); o.bob = 0; o.lean = .14; }
  if (lt > 4.0) { const k = P(lt, 4.0, 5.2), fr = o.front; o.front = () => { fr(); if (k < 1) { ctx.save(); ctx.globalAlpha = 1 - k * .6; drop(28, -250 + k * 80, .55); ctx.restore(); } }; o.sq = 1 - .04 * Math.sin(P(lt, 4, 5) * PI); }
  drawChar('cap', o, t);
  ctx.restore(); SKYK2 = null; SKYM = 0;
});
// 13 — "Foi aí que ele ouviu um assobio."
shot(33.7, 36.5, (lt, t) => {
  SKYK = 'tarde'; ctx.save(); cam(K(lt, [[0, 1.9], [2.8, 2.1]]), 520, 1360); deck(PAL.dusk, t, { mast: 960 });
  const hear = P(lt, .95, 1.2), hop = Math.sin(P(lt, .95, 1.35) * PI);
  drawChar('cap', { ...SIT, x: 480, y: 1620, bob: -hop * 30, eye: hear > 0 ? 'wide' : 'dot', ly: hear > 0 ? -.2 : .7, lx: hear > 0 ? -.9 : 0, brow: hear > 0 ? .3 : -.5, mouth: hear > 0 ? 'o' : 'frown', mo: .4,
    tilt: hear > 0 ? -.18 : .12, lean: .14, hat: 0, aL: [.6, -.2], aR: [.5, -.2], front: hatLap(t) }, t);
  for (let i = 0; i < 6; i++) { const u = (lt - .9 - i * .3) / 1.6; if (u < 0 || u > 1) continue; note(L(900, 600, u), 1150 + Math.sin(u * 8 + i) * 40 - u * 80, .8, Math.sin(u * 6) * .3, Math.sin(u * PI)); }
  ctx.restore();
});
// 14 — "Vinha da cozinha!"
shot(36.5, 38.4, (lt, t) => {
  SKYK = 'tarde'; ctx.save(); cam(1.05, 600, 1250); deck(PAL.dusk, t, { mast: 120 }); cabin(t);
  for (let i = 0; i < 6; i++) { const u = (lt + i * .3) % 1.8 / 1.8; note(L(880, 600, u), L(1250, 850, u) + Math.sin(u * 9) * 30, .9, Math.sin(u * 6) * .3, Math.sin(u * PI)); }
  const p = P(lt, 0, 1.9);
  drawChar('cap', { ...walk(lt * 9, .35), x: L(200, 640, p), y: 1640, bob: -Math.abs(Math.sin(lt * 9)) * 18, lean: .16, eye: 'wide', ly: -.2, lx: .5, mouth: 'o', mo: .3, aL: [-1.0, -1.2], aR: [1.0, 1.2] }, t);
  ctx.restore();
});
// 15 — "Lá estava o Pirata, empoleirado na colher do cozinheiro, comendo biscoito."
shot(38.4, 43.8, (lt, t) => {
  const z = K(lt, [[0, 1.05], [1.6, 1.05], [2.6, 1.8], [5.4, 1.9]]);
  ctx.save(); cam(z, K(lt, [[1.6, 540], [2.6, 520]]), K(lt, [[1.6, 1250], [2.6, 1190]])); galley(t, { night: true });
  if (lt < 1.9) drawChar('cap', { x: 90, y: 1640, eye: 'wide', ly: -.1, lx: .8, brow: .3, mouth: 'o', mo: K(lt, [[0, .2], [.5, 1]]), lean: .2, aL: [-.3, .2], aR: [.5, -1.6] }, t);
  const hx = 600, hy = 1240;
  const o = { x: 720, y: 1600, f: -1, sc: 1.1, eye: 'happy', mouth: 'smile', lx: .5, ly: .4, tilt: Math.sin(t * 2) * .05, aL: [-.2, .3] };
  o.aR = { ik: toBody('tiao', o, hx, hy) };
  drawChar('tiao', o, t);
  bigSpoon(hx, hy, 430, 1222);
  const eat = lt > 3.8, ch = eat ? Math.abs(Math.sin(t * 9)) : 0, sing = lt < 1.7;
  parrot(512, 1234, .85, { f: -1, peck: eat ? .12 * ch : 0, open: sing ? Math.abs(Math.sin(t * 9)) * .9 : ch * .7, flap: sing ? Math.max(0, Math.sin(t * 3)) * .3 : 0, eye: sing ? 'happy' : 'dot', bisc: !sing });
  if (sing) for (let i = 0; i < 4; i++) { const u = (lt * .9 + i * .25) % 1; note(L(470, 380, u), L(1100, 900, u), .6, .2, Math.sin(u * PI)); }
  if (eat) crumbs(445, 1160, t);
  ctx.restore();
});
// 16 — "Ele não tinha fugido"
shot(43.8, 46.0, (lt, t) => {
  ctx.save(); cam(K(lt, [[0, 1.35], [2.2, 1.45]]), 560, 1330); galley(t, { night: true });
  const u = P(lt, .7, 1.4), landed = u >= 1;
  const co = { x: 360, y: 1640, eye: landed ? 'happy' : 'wide', lx: .7, mouth: landed ? 'bigsmile' : 'o', mo: .6, brow: landed ? 0 : .3, aL: [-1.2, -.8], aR: [1.2, .8], blush: landed ? 1 : 0 };
  if (landed) Object.assign(co, laugh(t, 0), { aL: { ik: [-20, -80] }, aR: [.9, -1.9] });
  drawChar('cap', co, t);
  const hx = 700, hy = 1250, o = { x: 820, y: 1600, f: -1, eye: 'happy', mouth: 'smile', aL: [-.2, .3] }; o.aR = { ik: toBody('tiao', o, hx, hy) };
  drawChar('tiao', o, t); bigSpoon(hx, hy, 540, 1232);
  if (u <= 0) parrot(615, 1244, .85, { f: -1, eye: 'dot', bisc: 1 });
  else if (!landed) parrot(L(615, 455, u), L(1244, 1325, u) - Math.sin(u * PI) * 120, .85, { f: -1, flap: .5 + .5 * Math.sin(t * 28), eye: 'dot', bisc: 1, fly: 1 });
  else parrot(455, 1325 - Math.abs(Math.sin(t * 11)) * 16 * (1 - P(lt, 1.4, 2.2)), .85, { f: -1, eye: 'happy', peck: .25 + .2 * Math.sin(t * 6), bisc: 1 });
  ctx.restore();
});
// 17 — "Só tinha descoberto quem fazia a melhor comida do navio."
shot(46.0, 50.1, (lt, t) => {
  ctx.save(); cam(K(lt, [[0, 1.45], [4.1, 1.12]]), 560, K(lt, [[0, 1330], [4.1, 1270]])); galley(t, { night: true });
  if (lt > 2.4) { const k = out(P(lt, 2.4, 3.2));
    drawChar('mar1', { x: L(-200, 110, k), y: 1700, eye: 'happy', mouth: 'grin', mo: .7, aR: [2.6, .2], aL: [-.4, .3], ...(lt > 3.1 ? cheer(t, 1) : {}) }, t);
    drawChar('mar2', { x: L(-350, 0, k), y: 1560, sc: .92, eye: 'happy', mouth: 'grin', mo: .7, aR: [2.6, .2], ...(lt > 3.1 ? cheer(t, 2) : {}) }, t); }
  const sip = Math.max(0, Math.sin(lt * 4.2)), yum = lt > 2.1;
  const co = { x: 360, y: 1640, eye: yum ? 'happy' : 'shut', lx: .5, mouth: sip > .7 ? 'o' : (yum ? 'bigsmile' : 'chew'), mo: .5, blush: yum ? 1 : .4,
    aL: { ik: [40, -110] }, aR: { ik: [L(70, 45, sip), L(-110, -225, sip)] }, hR: { k: 'spoon', a: L(2.0, 3.0, sip) }, front: () => bowl(55, -95, .85, 1 - lt / 6) };
  if (lt > 3.1) Object.assign(co, { tilt: Math.sin(t * 11) * .05, bob: -Math.abs(Math.sin(t * 11)) * 12 });
  drawChar('cap', co, t);
  drawChar('tiao', { ...(lt > 2.2 ? laugh(t, 1) : { eye: 'happy', mouth: 'smile' }), x: 820, y: 1600, f: -1, aL: { ik: [-30, -90] }, aR: { ik: [30, -90] }, hL: { k: 'ladle', a: 2.4 } }, t);
  const fl = lt > 3.1 ? Math.abs(Math.sin(t * 18)) : 0;
  parrot(482, 1335 - fl * 12 + (lt > 3.1 ? -Math.abs(Math.sin(t * 11)) * 12 : 0), .85, { f: -1, flap: fl, open: lt > 3.1 ? .9 : Math.abs(Math.sin(t * 9)) * .6, eye: 'happy', bisc: lt < 3.1 });
  ctx.restore();
});

function renderAt(t) {
  t = C(t, 0, DUR - .001); TT = t; SKYK = null; SKYK2 = null; SKYM = 0;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  let s = SH_[SH_.length - 1]; for (const x of SH_) if (t >= x.a && t < x.b) { s = x; break; }
  ctx.save(); s.f(t - s.a, t, s.b - s.a); ctx.restore(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; vignette(.32);
}
window.__renderAt = renderAt;
const st = { t: 0 }; const tl = gsap.timeline({ paused: true });
tl.to(st, { t: DUR, duration: DUR, ease: 'none', onUpdate: () => renderAt(st.t) }, 0);
window.__timelines = window.__timelines || {}; window.__timelines.main = tl;
window.addEventListener('hf-seek', e => renderAt(e.detail.time));
window.addEventListener('load', () => renderAt(st.t));
renderAt(0);
})();
