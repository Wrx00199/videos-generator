
// ---------- objetos novos do vídeo 3 (monstro do mar) ----------
// corpo -> mundo (inverso de toBody, sem inclinação)
function toWorld(n, o, bx, by) { const sc = SPEC[n].s * (o.sc || 1), f = o.f || 1; return [o.x + bx * sc * f, o.y + (by + hipOf(o)) * sc]; }
// espinha do tentáculo: cúbica base->ponta, ondulação perpendicular e enrolamento opcional da ponta
function tspine(b, c1, c2, tp, t, wig = 14, curl = 0, n = 30, sl = 13) {
  const P_ = [];
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1), v = 1 - u;
    let x = v * v * v * b[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * tp[0];
    let y = v * v * v * b[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * tp[1];
    const dx = 3 * v * v * (c1[0] - b[0]) + 6 * v * u * (c2[0] - c1[0]) + 3 * u * u * (tp[0] - c2[0]);
    const dy = 3 * v * v * (c1[1] - b[1]) + 6 * v * u * (c2[1] - c1[1]) + 3 * u * u * (tp[1] - c2[1]);
    const d = Math.hypot(dx, dy) || 1, wg = Math.sin(u * 7 - t * 3) * wig * u * (1 - u) * 4;
    P_.push([x - dy / d * wg, y + dx / d * wg]);
  }
  if (curl) { const m = 9, a0 = P_[n - 1], a1 = P_[n - 2]; let th = Math.atan2(a0[1] - a1[1], a0[0] - a1[0]), x = a0[0], y = a0[1];
    for (let j = 0; j < m; j++) { th += curl / m; x += Math.cos(th) * sl; y += Math.sin(th) * sl; P_.push([x, y]); } }
  return P_;
}
function tentacle(pts, w0, t, bulge = -1) {
  const n = pts.length, Lp = [], Rp = [], Mp = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
    const u = i / (n - 1); let w = w0 * (1 - u * .86) / 2; if (bulge >= 0) w *= 1 + .35 * Math.exp(-Math.pow((u - bulge) * 9, 2));
    Lp.push([pts[i][0] + nx * w, pts[i][1] + ny * w]); Rp.push([pts[i][0] - nx * w, pts[i][1] - ny * w]); Mp.push([pts[i][0] - nx * w * .45, pts[i][1] - ny * w * .45, w]);
  }
  const tipR = w0 * .07;
  const path = () => { ctx.beginPath(); ctx.moveTo(Lp[0][0], Lp[0][1]); for (const p of Lp) ctx.lineTo(p[0], p[1]); const e = pts[n - 1]; ctx.arc(e[0], e[1], tipR, 0, TAU); for (let i = n - 1; i >= 0; i--) ctx.lineTo(Rp[i][0], Rp[i][1]); ctx.closePath(); };
  ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // contorno grosso por trás (lê bem sobre qualquer fundo)
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts) ctx.lineTo(p[0], p[1]);
  for (let i = 0; i < n - 1; i++) { ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[i + 1][0], pts[i + 1][1]); ctx.lineWidth = w0 * (1 - (i / (n - 1)) * .86) + 16; ctx.strokeStyle = INK; ctx.stroke(); }
  ell(pts[n - 1][0], pts[n - 1][1], tipR + 8, tipR + 8); ctx.fillStyle = INK; ctx.fill();
  for (let i = 0; i < n - 1; i++) { ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[i + 1][0], pts[i + 1][1]); ctx.lineWidth = w0 * (1 - (i / (n - 1)) * .86); ctx.strokeStyle = '#8e4fc4'; ctx.stroke(); }
  ell(pts[n - 1][0], pts[n - 1][1], tipR, tipR); ctx.fillStyle = '#8e4fc4'; ctx.fill();
  // barriga rosada (lado das ventosas)
  for (let i = 0; i < n - 1; i++) { ctx.beginPath(); ctx.moveTo(Mp[i][0], Mp[i][1]); ctx.lineTo(Mp[i + 1][0], Mp[i + 1][1]); ctx.lineWidth = Mp[i][2] * .9; ctx.strokeStyle = '#e7a3cf'; ctx.stroke(); }
  // brilho (relevo) no lado de cima
  for (let i = 1; i < n - 3; i++) { const p = Lp[i], q = pts[i]; const hx = L(q[0], p[0], .55), hy = L(q[1], p[1], .55), p2 = Lp[i + 1], q2 = pts[i + 1];
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(L(q2[0], p2[0], .55), L(q2[1], p2[1], .55)); ctx.lineWidth = Math.max(3, Mp[i][2] * .22); ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.stroke(); }
  // sombra do lado de baixo
  for (let i = 0; i < n - 1; i++) { const p = Rp[i], q = Rp[i + 1]; ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.lineWidth = Math.max(3, Mp[i][2] * .18); ctx.strokeStyle = 'rgba(60,20,80,.35)'; ctx.stroke(); }
  // ventosas
  for (let i = 1; i < n - 2; i += 2) { const r = Mp[i][2] * .3; if (r < 4) continue; ell(Mp[i][0], Mp[i][1], r, r * .85); fs('#f6cfe6', 4); ell(Mp[i][0], Mp[i][1], r * .45, r * .38); ctx.fillStyle = '#c47aa8'; ctx.fill(); }
  ctx.restore();
}
function sniff(x, y, t, a = 1) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; for (let i = 0; i < 3; i++) { const ph = (t * 2 + i / 3) % 1; ctx.beginPath(); ctx.arc(x, y, 30 + ph * 70, -1.1 - .3, -1.1 + .5); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,' + (1 - ph) + ')'; ctx.stroke(); } ctx.restore(); }
function bigEye(x, y, s, open, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const lx = o.lx || 0;
  const gl = ctx.createRadialGradient(0, 0, 20, 0, 0, 520); gl.addColorStop(0, 'rgba(255,210,80,' + .3 * open + ')'); gl.addColorStop(1, 'rgba(255,210,80,0)'); ctx.fillStyle = gl; ctx.fillRect(-520, -520, 1040, 1040);
  ell(0, 0, 270, 190); fs('#3a1f58', 10);
  for (const [a, b, r] of [[-200, -120, 26], [190, -110, 20], [-120, 150, 18], [150, 140, 24]]) { ell(a, b, r, r * .8); ctx.fillStyle = 'rgba(160,110,210,.35)'; ctx.fill(); }
  if (open > .02) {
    const ry = 150 * open; ctx.save(); ell(0, 0, 215, ry); ctx.clip();
    ell(0, 0, 215, 160); ctx.fillStyle = '#fff6d6'; ctx.fill();
    const g = ctx.createRadialGradient(lx * 50 - 30, -30, 10, lx * 50, 0, 150); g.addColorStop(0, '#fff09a'); g.addColorStop(.6, '#f2b632'); g.addColorStop(1, '#c46a12'); ell(lx * 50, 0, 140, 140); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
    ell(lx * 50, 0, 20, 112); ctx.fillStyle = INK; ctx.fill();
    ell(lx * 50 - 55, -60, 30, 22); ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fill();
    ctx.restore(); ell(0, 0, 215, ry); fs(null, 10);
  } else line([-215, 0, 215, 0], 10);
  if (o.happy) { ctx.save(); ell(0, 0, 268, 188); ctx.clip(); ctx.beginPath(); ctx.moveTo(-260, 70); ctx.quadraticCurveTo(0, -30, 260, 70); ctx.lineTo(260, 240); ctx.lineTo(-260, 240); ctx.closePath(); ctx.fillStyle = '#3a1f58'; ctx.fill(); ctx.restore(); ctx.beginPath(); ctx.moveTo(-205, 52); ctx.quadraticCurveTo(0, -30, 205, 52); fs(null, 10);
    for (const sx of [-1, 1]) { ell(sx * 175, 130, 55, 24); ctx.fillStyle = 'rgba(255,130,170,.55)'; ctx.fill(); } }
  ctx.restore();
}
function bubbles(t, x0, x1, y0, n = 16, seed = 1, sp = 260) { ctx.save(); ctx.lineWidth = 4; for (let i = 0; i < n; i++) { const ph = (t * sp / 1600 + hash(i + seed)) % 1, x = L(x0, x1, hash(i * 3 + seed)) + Math.sin(t * 3 + i) * 14, y = y0 - ph * 1600, r = 8 + hash(i + 9) * 18; if (y < 750) continue; ell(x, y, r, r); ctx.strokeStyle = 'rgba(210,240,255,' + .6 * (1 - ph) + ')'; ctx.stroke(); ell(x - r * .3, y - r * .3, r * .25, r * .25); ctx.fillStyle = 'rgba(255,255,255,' + .5 * (1 - ph) + ')'; ctx.fill(); } ctx.restore(); }
function underwater(t) {
  const SY = 720, surf = x => SY + Math.sin(x * .012 + t * 2) * 10;
  // céu noturno acima da linha d'água
  const gs = ctx.createLinearGradient(0, -400, 0, SY); gs.addColorStop(0, PAL.night.s1); gs.addColorStop(1, PAL.night.s2); ctx.fillStyle = gs; ctx.fillRect(-1000, -1000, W + 2000, SY + 1000);
  moon(880, 260); for (let i = 0; i < 30; i++) { ell(hash(i) * 1080, hash(i + 50) * 600 - 200, 3, 3); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.fill(); }
  // água
  const g = ctx.createLinearGradient(0, SY, 0, 2300); g.addColorStop(0, '#2a6f9e'); g.addColorStop(.25, '#0d2f52'); g.addColorStop(1, '#030914'); ctx.fillStyle = g; ctx.fillRect(-1000, SY, W + 2000, 3000);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { const x = 80 + i * 190 + Math.sin(t * .7 + i) * 30; ctx.beginPath(); ctx.moveTo(x - 30, SY); ctx.lineTo(x + 30, SY); ctx.lineTo(x + 160, 1900); ctx.lineTo(x - 60, 1900); ctx.closePath(); ctx.fillStyle = 'rgba(150,210,255,.05)'; ctx.fill(); } ctx.restore();
  // o navio deles, inteiro: velas e mastros por cima, casco afundado até a faixa
  ship(540, SY, .95, Math.sin(t * 1.3) * .02, t, 0, 1, 1);
  // parte submersa: véu de água por cima do casco
  ctx.beginPath(); ctx.moveTo(-1000, 3000); for (let x = -1000; x <= W + 1000; x += 30) ctx.lineTo(x, surf(x)); ctx.lineTo(W + 1000, 3000); ctx.closePath(); ctx.fillStyle = 'rgba(25,85,140,.45)'; ctx.fill();
  ctx.beginPath(); for (let x = -1000; x <= W + 1000; x += 30) ctx.lineTo(x, surf(x)); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(200,235,255,.8)'; ctx.stroke();
  for (let i = 0; i < 5; i++) { const x = 380 + i * 80, l = 50 + hash(i) * 60, y0 = SY + 112; ctx.beginPath(); ctx.moveTo(x, y0); ctx.quadraticCurveTo(x + Math.sin(t * 2 + i) * 20, y0 + l / 2, x + Math.sin(t * 2.4 + i) * 16, y0 + l); ctx.lineWidth = 7; ctx.strokeStyle = '#2f7a4a'; ctx.stroke(); }
}
function monsterBody(x, y, s, t, a = 1) { ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-520, 200); ctx.quadraticCurveTo(-560, -420, 0, -470); ctx.quadraticCurveTo(560, -420, 520, 200); ctx.lineTo(520, 900); ctx.lineTo(-520, 900); ctx.closePath(); ctx.fillStyle = '#24123a'; ctx.fill();
  for (const [bx, sd] of [[-460, -1], [-300, -1], [300, 1], [460, 1]]) { const p = tspine([bx, 500], [bx + sd * 120, 300], [bx + sd * 260, 120 + Math.sin(t * 1.5 + bx) * 60], [bx + sd * 330 + Math.sin(t * 1.2 + bx) * 50, -60], t, 18); ctx.lineCap = 'round'; for (let i = 0; i < p.length - 1; i++) { ctx.beginPath(); ctx.moveTo(p[i][0], p[i][1]); ctx.lineTo(p[i + 1][0], p[i + 1][1]); ctx.lineWidth = 90 * (1 - i / p.length * .85); ctx.strokeStyle = '#24123a'; ctx.stroke(); } }
  ctx.restore(); }
function moon(x, y) { const g = ctx.createRadialGradient(x, y, 40, x, y, 260); g.addColorStop(0, 'rgba(255,248,210,.5)'); g.addColorStop(1, 'rgba(255,248,210,0)'); ctx.fillStyle = g; ctx.fillRect(x - 260, y - 260, 520, 520); ell(x, y, 70, 70); fs('#fff6d2', 6); ell(x - 18, y - 10, 14, 12); ctx.fillStyle = 'rgba(200,190,150,.5)'; ctx.fill(); ell(x + 22, y + 20, 10, 9); ctx.fill(); }
function nightDeck(t, o = {}) { deck(PAL.night, t, Object.assign({ skyf: () => moon(220, 330) }, o)); }
function lanternGlow(sx, sy, r = 520, a = .4) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(sx, sy, 10, sx, sy, r); g.addColorStop(0, 'rgba(255,190,90,' + a + ')'); g.addColorStop(1, 'rgba(255,190,90,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore(); }
// tigela de madeira com relevo (veio, brilho, sombra) e sopa com legumes
function bowlR(x, y, s, full = 1, rot = 0, t = 0, smoke = 0, top = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const body = () => { ctx.beginPath(); ctx.moveTo(-62, 0); ctx.quadraticCurveTo(-60, 70, 0, 72); ctx.quadraticCurveTo(60, 70, 62, 0); ctx.closePath(); };
  const g = ctx.createLinearGradient(-62, 0, 62, 0); g.addColorStop(0, '#d9995a'); g.addColorStop(.5, '#b8773d'); g.addColorStop(1, '#7a4a26');
  body(); fs(g, 0); ctx.save(); body(); ctx.clip(); for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-70, 14 + k * 15); ctx.quadraticCurveTo(0, 30 + k * 15, 70, 14 + k * 15); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(70,35,15,.35)'; ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-46, 10); ctx.quadraticCurveTo(-44, 46, -18, 58); ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.stroke(); ctx.restore(); body(); fs(null, 7);
  const ry = 15 + top * 22; ell(0, 0, 62, ry); fs('#8a5530', 6);
  if (full > .03) { const k = .5 + .5 * full; ell(0, 2 + (1 - full) * 8, 52 * k, 10 * k); ctx.fillStyle = '#e8a23a'; ctx.fill(); ell(-16 * k, (1 - full) * 8, 14 * k, 3 * k); ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fill();
    if (full > .5) { ctx.fillStyle = '#e0602a'; ell(14, 3, 7, 4); ctx.fill(); ctx.fillStyle = '#5aa05a'; ell(-8, 5, 6, 3); ctx.fill(); ell(26, 0, 5, 3); ctx.fill(); } }
  else { ell(0, 3, 52, ry - 5); ctx.fillStyle = '#f0cd98'; ctx.fill(); ctx.save(); ell(0, 3, 52, ry - 5); ctx.clip(); for (let k = -2; k <= 2; k++) line([-60, k * 9, 60, k * 9 + 6], 2, 'rgba(120,70,30,.15)'); ctx.restore(); if (top > .3) { ell(12, 10, 7, 4); ctx.fillStyle = '#e8a23a'; ctx.fill(); } ell(-18, 1 - top * 8, 14, 3 + top * 3); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fill(); }
  ctx.restore();
  if (smoke) steam(x, y - 30 * s, t, 3, .45 * s);
}
function crate(x, y, w, h) { rr(x, y, w, h, 8); fs('#9a6236', 7); line([x, y, x + w, y + h], 5); line([x + w, y, x, y + h], 5); }
function sparkle(x, y, k, s = 1) { if (k <= 0 || k >= 1) return; ctx.save(); ctx.globalAlpha = Math.sin(k * PI); ctx.translate(x, y); ctx.rotate(k * 1.5); ctx.scale(s * (.6 + k * .6), s * (.6 + k * .6)); ctx.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 14 : 52, a = i * PI / 4; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); fs('#fff6c2', 5); ctx.restore(); }
function knock(x, y, k) { if (k <= 0 || k >= 1) return; ctx.save(); ctx.globalAlpha = 1 - k; for (let i = 0; i < 3; i++) { const a = -2.2 + i * .5, d = 50 + k * 50; line([x + Math.cos(a) * d, y + Math.sin(a) * d, x + Math.cos(a) * (d + 40), y + Math.sin(a) * (d + 40)], 7); } ctx.restore(); }
const NIGHT = () => tint(NIGHT_T, .3);
// Tião segurando a tigela à frente com as duas mãos
function holdBowl(o, full, t, smoke = 1, top = 0) { o.aL = { ik: [82, -140 + top * 10] }; o.aR = { ik: [178, -140 - top * 10] }; o.front = () => bowlR(130, -140, .9 + top * .15, full, -top * .4, t, 0, top); return o; }

