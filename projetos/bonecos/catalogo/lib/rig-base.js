// ===== RIG 2D cut-out: pessoa (Tião/vendedor/policial), pinguim, geladeira, props =====
const REG = {};
const f1 = n => +(+n).toFixed(2);
const tstr = (r, s) => `translate(${f1(r.bx + s.dx)},${f1(r.by + s.dy)}) rotate(${f1(s.r)}) scale(${f1(s.sx)},${f1(s.sy)})`;
function G(id, bx, by, inner, st0) { const st = Object.assign({ dx: 0, dy: 0, r: 0, sx: 1, sy: 1 }, st0 || {}); REG[id] = { bx, by, st }; return `<g id="${id}" transform="${tstr(REG[id], st)}">${inner}</g>`; }
const NS = 'http://www.w3.org/2000/svg';
const OL = '#14100c';
// ---------- IK de braço (2 segmentos), 0 graus = apontando pra baixo ----------
const L1 = 100, L2 = 92;
function ik(tx, ty, bend) {
  let d = Math.hypot(tx, ty); d = Math.min(Math.max(d, 24), L1 + L2 - .5);
  const phi = Math.atan2(-tx, ty), al = Math.acos(Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))), be = Math.acos(Math.max(-1, (L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2)));
  const s = bend || 1; return [(phi + s * al) * 180 / Math.PI, -s * (Math.PI - be) * 180 / Math.PI];
}
// ---------- mãos ----------
function fistSVG(sk) {
  return `<g class="fist"><rect x="-16" y="-4" width="32" height="34" rx="13" fill="${sk}" stroke="${OL}" stroke-width="4.5"/>` +
    [-11, -3.7, 3.7, 11].map(x => `<circle cx="${x}" cy="27" r="6.6" fill="${sk}" stroke="${OL}" stroke-width="3.6"/>`).join('') +
    `<path d="M-14 8 Q-2 3 10 9" stroke="${OL}" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="-13" cy="14" rx="7" ry="11" transform="rotate(-18 -13 14)" fill="${sk}" stroke="${OL}" stroke-width="4"/>` +
    `<path d="M-6 8 L-6 24 M2 8 L2 24" stroke="#000" stroke-opacity=".18" stroke-width="2"/></g>`;
}
function openSVG(sk) {
  const fing = [[-11, -16, 50], [-4, -6, 56], [4, 4, 55], [11, 14, 48]].map(([x, dx, l]) => `<path d="M${x} 22 L${x + dx * .5} ${l}" stroke="${OL}" stroke-width="12" stroke-linecap="round"/>`).join('') +
    [[-11, -16, 50], [-4, -6, 56], [4, 4, 55], [11, 14, 48]].map(([x, dx, l]) => `<path d="M${x} 22 L${x + dx * .5} ${l}" stroke="${sk}" stroke-width="5.4" stroke-linecap="round"/>`).join('');
  return `<g class="open">${fing}<path d="M-14 18 L-30 34" stroke="${OL}" stroke-width="12" stroke-linecap="round"/><path d="M-14 18 L-30 34" stroke="${sk}" stroke-width="5.4" stroke-linecap="round"/><rect x="-16" y="-4" width="32" height="30" rx="11" fill="${sk}" stroke="${OL}" stroke-width="4.5"/></g>`;
}
function armSVG(p, side, o) {
  const sk = o.skin, sl = o.sleeve;
  const sleeveU = sl ? `<path d="M0 0 V${sl.len > 1 ? 62 : 36}" stroke="${OL}" stroke-width="25" stroke-linecap="round"/><path d="M0 0 V${sl.len > 1 ? 62 : 36}" stroke="${sl.col}" stroke-width="18" stroke-linecap="round"/>` : '';
  const sleeveL = sl && sl.len > 1 ? `<path d="M0 0 V50" stroke="${OL}" stroke-width="23" stroke-linecap="round"/><path d="M0 0 V50" stroke="${sl.col}" stroke-width="16" stroke-linecap="round"/>` : '';
  const holds = (o.hold && o.hold[side] || []).map((h, i) => `<g id="${p}_h${side}_k${i}" opacity="${h.on ? 1 : 0}">${h.svg}</g>`).join('');
  const lower = `<path d="M0 0 V${L2}" stroke="${OL}" stroke-width="22" stroke-linecap="round"/><path d="M0 0 V${L2}" stroke="${sk}" stroke-width="14" stroke-linecap="round"/>${sleeveL}` +
    G(`${p}_h${side}`, 0, L2, `<g id="${p}_h${side}_hold">${holds}</g><g id="${p}_h${side}_fist">${fistSVG(sk)}</g><g id="${p}_h${side}_open" opacity="0">${openSVG(sk)}</g>`);
  const goose = `<g id="${p}_gs${side}" opacity="0" stroke="${OL}" stroke-width="2.6" stroke-linecap="round"><path d="M-9 14 l-7 -2 M9 22 l7 -2 M-9 34 l-7 -1 M9 46 l7 -1 M-9 56 l-7 0"/></g>`;
  return `<path d="M0 0 V${L1}" stroke="${OL}" stroke-width="22" stroke-linecap="round"/><path d="M0 0 V${L1}" stroke="${sk}" stroke-width="14" stroke-linecap="round"/>${sleeveU}${goose}` + G(`${p}_l${side}`, 0, L1, lower);
}
// ---------- perna ----------
function legSVG(p, side, o) {
  const sk = o.legSkin || o.skin, pl = o.pants ? o.pants.len : 0, pc = o.pants ? o.pants.col : '#000', wd = o.pants ? o.pants.w : 20;
  const pantsPart = pl ? `<path d="M0 0 V${pl}" stroke="${OL}" stroke-width="${wd + 8}" stroke-linecap="butt"/><path d="M0 0 V${pl}" stroke="${o.pants.pat ? 'url(#pjPat)' : pc}" stroke-width="${wd}" stroke-linecap="butt"/><path d="M${-wd / 2} 3 V${pl}" stroke="#fff" stroke-opacity=".18" stroke-width="3"/>` : '';
  const shoe = o.shoe || '#7a2a2a';
  return `<path d="M0 0 V158" stroke="${OL}" stroke-width="20" stroke-linecap="round"/><path d="M0 0 V158" stroke="${sk}" stroke-width="12" stroke-linecap="round"/>${pantsPart}` +
    `<g transform="translate(0,158)"><path d="M-15 -2 Q-17 -16 -2 -18 L18 -14 Q42 -10 47 6 Q48 17 36 17 H-14 Q-18 17 -18 8Z" fill="${shoe}" stroke="${OL}" stroke-width="4.5" stroke-linejoin="round"/><path d="M-14 11 H40" stroke="#000" stroke-opacity=".5" stroke-width="5"/><path d="M-8 -12 Q4 -16 14 -10" stroke="#fff" stroke-opacity=".4" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
}
// ---------- cabeça/rosto ----------
function faceSVG(p, o) {
  const sk = o.skin, lidc = o.skin;
  const eye = (x, side) => G(`${p}_e${side}`, x, -6, `<ellipse cx="0" cy="0" rx="25" ry="29" fill="#fff" stroke="${OL}" stroke-width="5"/>` +
    G(`${p}_p${side}`, 3, 2, `<circle cx="0" cy="0" r="10.5" fill="#15110d"/><circle cx="3.4" cy="-3.6" r="3.4" fill="#fff"/>`) +
    `<path id="${p}_lid${side}" d="M-25 -4 A25 29 0 0 1 25 -4 Z" fill="${lidc}" stroke="${OL}" stroke-width="5" opacity="0" stroke-linejoin="round"/>`);
  const brow = (x, side) => G(`${p}_b${side}`, x, -48, `<path d="M-23 0 Q0 -5 23 0" stroke="${o.browCol || OL}" stroke-width="${o.browW || 9}" stroke-linecap="round" fill="none"/>`);
  const mouth = `<g transform="translate(6,0)"><path id="${p}_m0" d="M-20 56 Q0 59 20 56" stroke="${OL}" stroke-width="7" fill="none" stroke-linecap="round"/><path id="${p}_m1" d="M-24 66 Q0 46 24 66" stroke="${OL}" stroke-width="7" fill="none" stroke-linecap="round" opacity="0"/><path id="${p}_m2" d="M-22 60 Q6 62 24 46" stroke="${OL}" stroke-width="7" fill="none" stroke-linecap="round" opacity="0"/><path id="${p}_m3" d="M-26 58 q8.6 -9 17.3 0 t17.3 0 t17.3 0" stroke="${OL}" stroke-width="6.5" fill="none" stroke-linecap="round" opacity="0"/></g>`;
  const nose = `<g><ellipse cx="12" cy="22" rx="11" ry="13" fill="${o.nose || sk}" stroke="${OL}" stroke-width="4.5"/><path d="M8 14 Q14 11 18 16" stroke="#fff" stroke-opacity=".6" stroke-width="3" fill="none" stroke-linecap="round"/></g>`;
  return nose + eye(-30, 'L') + eye(34, 'R') + brow(-30, 'L') + brow(34, 'R') + mouth;
}
function headSVG(p, o) {
  const sk = o.skin, rim = o.rim ? `<path d="M${o.rim.side * 80} -38 A89 89 0 0 ${o.rim.side > 0 ? 1 : 0} ${o.rim.side * 56} 66" stroke="${o.rim.col}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".95"/>` : '';
  const sweat = [-56, 6, 58].map((x, i) => `<path id="${p}_sw${i}" d="M${x} -64 q-9 18 0 24 q9 -6 0 -24Z" fill="#a8e0ff" stroke="${OL}" stroke-width="2.6" opacity="0"/>`).join('');
  const beads = `<g id="${p}_beads" opacity="${o.sweaty ? 1 : 0}" fill="#bfeaff" stroke="${OL}" stroke-width="1.6"><circle cx="-60" cy="-52" r="5"/><circle cx="-34" cy="-72" r="4"/><circle cx="20" cy="-74" r="5.4"/><circle cx="52" cy="-62" r="4"/><circle cx="72" cy="-34" r="4.4"/><circle cx="-70" cy="-24" r="3.6"/></g>`;
  const hairs = `<g id="${p}_gsH" opacity="0" stroke="${OL}" stroke-width="3.4" stroke-linecap="round"><path d="M-30 -86 l-6 -14 M-8 -92 l-1 -15 M16 -91 l5 -14 M40 -80 l10 -12 M-52 -72 l-12 -10 M62 -60 l13 -6"/></g>`;
  return `<ellipse cx="-88" cy="6" rx="13" ry="22" fill="${sk}" stroke="${OL}" stroke-width="5"/><ellipse cx="88" cy="6" rx="13" ry="22" fill="${sk}" stroke="${OL}" stroke-width="5"/>` +
    `<circle cx="0" cy="0" r="90" fill="url(#${o.skinG || 'pele'})" stroke="${OL}" stroke-width="6"/>` +
    `<circle id="${p}_red" cx="0" cy="0" r="86" fill="#e03a2c" opacity="0"/>` + rim +
    `<path d="M-80 -30 A90 90 0 0 0 -50 62" stroke="#fff" stroke-opacity=".5" stroke-width="5" fill="none" stroke-linecap="round"/>` +
    (o.headDeco ? o.headDeco(p) : '') +
    G(`${p}_fc`, 8, 0, faceSVG(p, o)) +
    (o.faceDeco ? o.faceDeco(p) : '') +
    `<g id="${p}_vein" opacity="0" stroke="#b01414" stroke-width="5.5" stroke-linecap="round" fill="none"><path d="M-46 -68 q10 -10 18 -2 q-4 10 4 16 M-28 -70 q-2 -12 8 -16 M-34 -52 q-12 4 -16 14"/></g>` + beads + sweat + hairs +
    (o.hat ? o.hat(p) : '');
}
// ---------- pessoa ----------
function person(p, o) {
  o = Object.assign({ skin: '#fff', shirt: '#e8c84a', torsoW: 50, shoe: '#7a2a2a', x: 0, y: 0, s: 1, flip: 1 }, o);
  const tw = o.torsoW;
  const torso = `<path d="M${-tw} -165 Q${-tw} -176 ${-tw + 16} -176 H${tw - 16} Q${tw} -176 ${tw} -165 V-14 Q${tw} 4 ${tw - 18} 4 H${-tw + 18} Q${-tw} 4 ${-tw} -14Z" fill="${o.skinBody || o.skin}" stroke="${OL}" stroke-width="5.5"/>` + (o.torsoDeco ? o.torsoDeco(p, tw) : '') +
    `<path d="M${-tw + 4} -160 Q${-tw + 2} -90 ${-tw + 8} -10" stroke="#fff" stroke-opacity=".28" stroke-width="5" fill="none" stroke-linecap="round"/>` +
    (o.rim ? `<path d="M${o.rim.side * (tw - 3)} -160 Q${o.rim.side * (tw - 1)} -80 ${o.rim.side * (tw - 8)} -14" stroke="${o.rim.col}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>` : '');
  const hips = `<g>${legSVG(p, 'B', o)}</g>`;
  const legB = G(`${p}_lgB`, -22, -175, legSVG(p, 'B', Object.assign({}, o, { shoe: o.shoeB || o.shoe })));
  const legF = G(`${p}_lgF`, 22, -175, legSVG(p, 'F', o));
  const armE = G(`${p}_uE`, -tw - 4, -150, armSVG(p, 'E', o));
  const armD = G(`${p}_uD`, tw + 4, -150, armSVG(p, 'D', o));
  const head = G(`${p}_hd`, 0, -258, headSVG(p, o));
  const neck = `<rect x="-14" y="-192" width="28" height="30" fill="${o.skin}" stroke="${OL}" stroke-width="4"/>`;
  const tr = G(`${p}_tr`, 0, -175, armE + neck + torso + head + armD);
  const bob = G(`${p}_bob`, 0, 0, tr);
  const shadow = `<ellipse id="${p}_sh" cx="${o.shx || 0}" cy="4" rx="84" ry="15" fill="url(#shadG)"/>`;
  return G(`${p}_root`, o.x, o.y, shadow + legB + bob.replace('', '') + legF, { sx: o.s * o.flip, sy: o.s });
}
// ---------- pinguim: MESMO rig do Tião (personagem), só pele escura + barriga/bico/pijama/gorro ----------
const props = {
  pote: `<g><ellipse cx="0" cy="26" rx="54" ry="9" fill="#000" opacity=".25"/><path d="M-52 -34 L-44 30 Q0 40 44 30 L52 -34Z" fill="url(#poteG)" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/><rect x="-58" y="-48" width="116" height="20" rx="8" fill="#e04a8a" stroke="${OL}" stroke-width="5"/><path d="M-46 -4 H46 L44 14 H-45Z" fill="#fff" opacity=".85"/><text x="0" y="12" font-size="13" font-family="Anton,Impact,sans-serif" fill="#c0306a" text-anchor="middle" letter-spacing="1">SORVETE</text><path d="M30 -48 L46 -92" stroke="#c9a46a" stroke-width="7" stroke-linecap="round"/><path d="M30 -48 L46 -92" stroke="${OL}" stroke-width="2" opacity=".5"/></g>`,
  controle: `<g><rect x="-17" y="-48" width="34" height="96" rx="10" fill="#2a2e34" stroke="${OL}" stroke-width="4.5"/><circle cx="0" cy="-30" r="7.5" fill="#e03a3a" stroke="${OL}" stroke-width="2"/><g fill="#aab4c0">${[-12, 0, 12].map(x => [-8, 6, 20, 34].map(y => `<rect x="${x - 4}" y="${y}" width="8" height="8" rx="2"/>`).join('')).join('')}</g><path d="M-12 -44 Q0 -48 12 -44" stroke="#fff" stroke-opacity=".4" stroke-width="3" fill="none"/></g>`,
  phone: `<g><rect x="-30" y="-56" width="60" height="112" rx="12" fill="#1c2026" stroke="${OL}" stroke-width="4.5"/><rect x="-24" y="-46" width="48" height="84" rx="6" fill="#aee8ff"/><text x="0" y="-8" font-size="32" font-family="Anton,Impact" fill="#0a3a5a" text-anchor="middle">190</text><circle cx="0" cy="46" r="5" fill="#555"/><path d="M-22 -44 L8 -44 L-22 -14Z" fill="#fff" opacity=".5"/></g>`,
  lata: `<g><rect x="-26" y="-48" width="52" height="96" rx="9" fill="url(#canG)" stroke="${OL}" stroke-width="4.5"/><rect x="-26" y="-18" width="52" height="40" fill="#d83a2a"/><text x="0" y="8" font-size="18" font-family="Anton,Impact" fill="#fff" text-anchor="middle" letter-spacing="1">BREJA</text><ellipse cx="0" cy="-48" rx="26" ry="6" fill="#d7dade" stroke="${OL}" stroke-width="3"/><ellipse cx="6" cy="-49" rx="8" ry="3" fill="#8a9098"/><path d="M-20 -40 V40" stroke="#fff" stroke-opacity=".5" stroke-width="4" stroke-linecap="round"/></g>`,
  nota: `<g><rect x="-48" y="-22" width="96" height="44" rx="4" fill="#9ad08a" stroke="${OL}" stroke-width="3.5"/><circle cx="0" cy="0" r="14" fill="#6aa85a" stroke="${OL}" stroke-width="2.5"/><text x="0" y="6" font-size="17" font-family="Anton" text-anchor="middle" fill="#1c4a14">50</text></g>`,
  conta: `<g><rect x="-34" y="-46" width="68" height="92" fill="#fffdf0" stroke="${OL}" stroke-width="3.5"/><rect x="-34" y="-46" width="68" height="16" fill="#e8b42a"/><path d="M-26 -18 H26 M-26 -6 H26 M-26 6 H10" stroke="#555" stroke-width="3"/><text x="0" y="34" font-size="15" font-family="Anton" text-anchor="middle" fill="#c02020">R$ 800</text></g>`,
};
function sharedDefs() {
  return `<svg width="0" height="0" style="position:absolute" xmlns="${NS}"><defs>
<radialGradient id="shadG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".62"/><stop offset=".6" stop-color="#000" stop-opacity=".3"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<radialGradient id="pele" cx=".34" cy=".3" r=".9"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#f2f2f6"/><stop offset="1" stop-color="#b9c0d4"/></radialGradient>
<radialGradient id="pgH" cx=".34" cy=".3" r=".9"><stop offset="0" stop-color="#4a566e"/><stop offset=".6" stop-color="#232b3c"/><stop offset="1" stop-color="#0e121c"/></radialGradient>
<radialGradient id="peleV" cx=".34" cy=".3" r=".9"><stop offset="0" stop-color="#f6d2ac"/><stop offset=".6" stop-color="#e0a878"/><stop offset="1" stop-color="#a8704a"/></radialGradient>
<radialGradient id="peleP" cx=".34" cy=".3" r=".9"><stop offset="0" stop-color="#eec4a0"/><stop offset=".6" stop-color="#d49a70"/><stop offset="1" stop-color="#8a5a3a"/></radialGradient>
<linearGradient id="pgG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#394258"/><stop offset=".3" stop-color="#1a202e"/><stop offset="1" stop-color="#0c1018"/></linearGradient>
<pattern id="pjPat" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#f4f6fa"/><rect width="11" height="22" fill="#4a86d8"/></pattern>
<linearGradient id="poteG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#e8e0f0"/><stop offset="1" stop-color="#a8a0c0"/></linearGradient>
<linearGradient id="canG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e6e9ee"/><stop offset=".5" stop-color="#b4bac4"/><stop offset="1" stop-color="#70767f"/></linearGradient>
<linearGradient id="fridgeG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fbf4e0"/><stop offset=".55" stop-color="#e6dcc0"/><stop offset="1" stop-color="#b2a584"/></linearGradient>
<linearGradient id="fridgeIn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#bfe8ff"/><stop offset="1" stop-color="#6aa8d8"/></linearGradient>
<radialGradient id="fridgeGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffffff"/><stop offset=".22" stop-color="#9ae0ff"/><stop offset=".6" stop-color="#2a78d8"/><stop offset="1" stop-color="#0e3a8a"/></radialGradient>
<linearGradient id="beamG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#bfeaff" stop-opacity=".85"/><stop offset="1" stop-color="#6ab8ff" stop-opacity="0"/></linearGradient>
<radialGradient id="flashG"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="#c8f0ff" stop-opacity=".8"/><stop offset="1" stop-color="#6ac0ff" stop-opacity="0"/></radialGradient>
<filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter><filter id="blur14"><feGaussianBlur stdDeviation="14"/></filter><filter id="blur3"><feGaussianBlur stdDeviation="3"/></filter>
</defs></svg>`;
}
// ---------- geladeira ----------
// origem: centro da base no chão. Dobradiça na esquerda.
