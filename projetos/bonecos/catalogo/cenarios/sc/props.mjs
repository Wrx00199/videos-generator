// Props cartoon 2.5D (vista 3/4, luz pela esquerda): desenhos SVG exportados como funções (base em 0,0) + gerador dos PNG em props_img/.
// uso: node props.mjs [nome...]   (um chrome por vez)  -- os mesmos desenhos montam o castelo em castelo.mjs
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import { rng, f, lg, rg, relief, blurF, mix, ROOT } from './lib.mjs';

const OLC = '#1b1410';
export const PD = lg('oF', [[0, '#fff', .30], [.4, '#fff', 0], [1, '#000', .34]]) + lg('oFh', [[0, '#fff', .16], [1, '#000', .2]], 1, 0)
  + lg('oS', [[0, '#000', .30], [1, '#000', .52]], 1, 0) + lg('oT', [[0, '#fff', .42], [1, '#fff', .18]], 0, 1)
  + rg('bag0', [[0, '#68717f'], [.45, '#262a31'], [1, '#0b0c0f']], .32, .28, .85) + rg('bag1', [[0, '#5a6f96'], [.45, '#232c45'], [1, '#0a0d18']], .32, .28, .85)
  + rg('bag2', [[0, '#5d7f66'], [.45, '#1f3326'], [1, '#08100b']], .32, .28, .85) + rg('bag3', [[0, '#8a8f98'], [.45, '#4a4e56'], [1, '#1c1e22']], .32, .28, .85)
  + rg('shR', [[0, '#000', .62], [.6, '#000', .28], [1, '#000', 0]]) + lg('tireG', [[0, '#3c3c40'], [.35, '#1c1c1e'], [1, '#08080a']], 1, 0) + rg('tireF', [[0, '#3a3a3e'], [1, '#101012']], .35, .3, .8)
  + lg('glass', [[0, '#6d9fc0'], [1, '#17283a']]) + lg('chrome', [[0, '#f4f6fa'], [.5, '#8d95a2'], [1, '#d5dae2']]) + rg('hub', [[0, '#d8dce2'], [.6, '#8a909a'], [1, '#4a4e56']], .35, .3, .8)
  + relief('rP', '.012 .03', 3, 5, 1.6, 1.22, 225) + blurF('pb6', 6) + blurF('pb3', 3);

// ---- primitivas
export function cub(x, y, w, h, d, c, o = {}) {
  const k = d * .45, cS = o.cs || mix(c, '#000000', .38), cT = o.ct || mix(c, '#ffffff', .3), x0 = x - w / 2, x1 = x + w / 2, sw = o.sw || 3, ol = o.ol || OLC;
  const side = `M${f(x1)} ${f(y - h)}L${f(x1 + d)} ${f(y - h - k)}L${f(x1 + d)} ${f(y - k)}L${f(x1)} ${f(y)}Z`;
  const top = `M${f(x0)} ${f(y - h)}L${f(x1)} ${f(y - h)}L${f(x1 + d)} ${f(y - h - k)}L${f(x0 + d)} ${f(y - h - k)}Z`;
  let s = `<path d="${side}" fill="${cS}"/><path d="${side}" fill="url(#oS)"/><path d="${top}" fill="${cT}"/><path d="${top}" fill="url(#oT)"/>`;
  s += `<rect x="${f(x0)}" y="${f(y - h)}" width="${f(w)}" height="${f(h)}" fill="${c}"${o.fil ? ` filter="url(#${o.fil})"` : ''}/><rect x="${f(x0)}" y="${f(y - h)}" width="${f(w)}" height="${f(h)}" fill="url(#oF)"/><rect x="${f(x0)}" y="${f(y - h)}" width="${f(w)}" height="${f(h)}" fill="url(#oFh)"/>`;
  s += `<path d="${side}" fill="none" ${`stroke="${ol}" stroke-width="${sw}" stroke-linejoin="round"`}/><path d="${top}" fill="none" stroke="${ol}" stroke-width="${sw}" stroke-linejoin="round"/><rect x="${f(x0)}" y="${f(y - h)}" width="${f(w)}" height="${f(h)}" fill="none" stroke="${ol}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  s += `<path d="M${f(x0 + 2)} ${f(y - h + 3)}H${f(x1 - 2)}" stroke="#fff" stroke-opacity=".6" stroke-width="3"/><path d="M${f(x0 + 3)} ${f(y - h + 3)}V${f(y - 4)}" stroke="#fff" stroke-opacity=".28" stroke-width="3"/>`;
  s += `<path d="M${f(x0)} ${f(y - 1)}H${f(x1)}" stroke="#000" stroke-opacity=".35" stroke-width="5"/>`;
  return s;
}
export const shadow = (x, y, rx, ry = 16, op = 1) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="url(#shR)" opacity="${op}"/>`;
const wheel = (x, y, r, fl = false) => `<g><circle cx="${x}" cy="${y}" r="${r}" fill="url(#tireF)" stroke="${OLC}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="${f(r * .84)}" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="${f(r * .1)}"/><circle cx="${x}" cy="${y}" r="${f(r * .56)}" fill="url(#hub)" stroke="${OLC}" stroke-width="2.5"/><circle cx="${x}" cy="${y}" r="${f(r * .16)}" fill="#3a3e46" stroke="${OLC}" stroke-width="1.5"/>${[0, 72, 144, 216, 288].map(a => `<circle cx="${f(x + Math.cos(a * Math.PI / 180) * r * .34)}" cy="${f(y + Math.sin(a * Math.PI / 180) * r * .34)}" r="${f(r * .045)}" fill="#2a2d34"/>`).join('')}<path d="M${f(x - r * .85)} ${f(y - r * .3)} A${f(r * .9)} ${f(r * .9)} 0 0 1 ${f(x - r * .3)} ${f(y - r * .85)}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="${f(r * .09)}" stroke-linecap="round"/></g>`;

// ---- saco de lixo preto amarrado (base 0,0; ~170 de altura)
export function bag(x = 0, y = 0, s = 1, v = 0, rot = 0, sh = true) {
  const P = 'M-62 -6C-86 -30 -80 -95 -44 -118C-30 -128 -18 -134 -14 -146L-24 -168C-14 -161 -6 -158 0 -150C6 -158 14 -163 26 -168L14 -146C20 -134 34 -126 48 -112C84 -84 88 -28 62 -6C40 6 -40 6 -62 -6Z';
  let g = `<g transform="translate(${f(x)},${f(y)}) rotate(${rot}) scale(${f(s)})">`;
  if (sh) g += shadow(6, 4, 88, 14);
  g += `<path d="${P}" fill="url(#bag${v})" stroke="#07080a" stroke-width="3.5" stroke-linejoin="round"/>`;
  g += `<path d="M-20 -146C-30 -112 -50 -80 -60 -40M2 -148C6 -110 8 -70 4 -20M16 -146C34 -112 60 -80 66 -40" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="3.5"/><path d="M-14 -146C-22 -112 -40 -80 -48 -40M10 -146C20 -110 40 -80 44 -36" fill="none" stroke="#9aa6bc" stroke-opacity=".22" stroke-width="3"/>`;
  g += `<path d="M-52 -96C-58 -74 -54 -52 -44 -34" fill="none" stroke="#fff" stroke-opacity=".62" stroke-width="8" stroke-linecap="round"/><ellipse cx="-28" cy="-90" rx="12" ry="26" transform="rotate(24 -28 -90)" fill="#fff" opacity=".2"/><path d="M-34 -108C-26 -118 -18 -122 -8 -124" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="5" stroke-linecap="round"/>`;
  g += `<path d="M70 -90C78 -66 70 -36 56 -18" fill="none" stroke="#8fb0ff" stroke-opacity=".4" stroke-width="5" stroke-linecap="round"/><path d="M-40 -8C-10 4 30 4 56 -8" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="6"/>`;
  g += `<path d="M-12 -150C-6 -142 6 -142 12 -150L10 -140C4 -134 -4 -134 -10 -140Z" fill="#111317" stroke="#000" stroke-width="2"/><path d="M-22 -166L-10 -150M24 -166L10 -150" stroke="#9aa6bc" stroke-opacity=".5" stroke-width="3"/>`;
  return g + `</g>`;
}
export function box(x, y, s = 1, R = null, c = '#b98a55') { return `<g transform="translate(${f(x)},${f(y)}) scale(${s})">${cub(0, 0, 90, 56, 32, c, { sw: 2.5 })}<path d="M-45 -28H45" stroke="#e8d8b0" stroke-opacity=".6" stroke-width="7"/><path d="M-10 -56L10 -56" stroke="#6a4a28" stroke-width="3"/></g>`; }
export function can(x, y, s = 1, c = '#b8bec8') { return `<g transform="translate(${f(x)},${f(y)}) scale(${s})"><ellipse cx="0" cy="0" rx="14" ry="5" fill="${mix(c, '#000000', .4)}" stroke="${OLC}" stroke-width="2"/><rect x="-14" y="-38" width="28" height="38" fill="${c}"/><rect x="-14" y="-38" width="28" height="38" fill="url(#oFh)"/><path d="M-14 -38V0M14 -38V0" stroke="${OLC}" stroke-width="2"/><ellipse cx="0" cy="-38" rx="14" ry="5" fill="#e8ecf2" stroke="${OLC}" stroke-width="2"/><path d="M-9 -30V-6" stroke="#fff" stroke-opacity=".7" stroke-width="3"/></g>`; }
export function bottle(x, y, s = 1, c = '#3b8a4a') { return `<g transform="translate(${f(x)},${f(y)}) scale(${s})"><path d="M-12 0V-44C-12 -60 -5 -62 -5 -78V-96H5V-78C5 -62 12 -60 12 -44V0Z" fill="${c}" stroke="${OLC}" stroke-width="2.5"/><path d="M-8 -6V-44" stroke="#fff" stroke-opacity=".5" stroke-width="3"/><rect x="-12" y="-36" width="24" height="16" fill="#e8dcc0" opacity=".85"/></g>`; }
// pneu deitado (empilhável)
export function tireFlat(x, y, r = 90, th = null, c = '#222226') {
  th = th || r * .5; const ry = r * .38;
  let g = `<path d="M${f(x - r)} ${f(y - th)}L${f(x - r)} ${f(y)}A${f(r)} ${f(ry)} 0 0 0 ${f(x + r)} ${f(y)}L${f(x + r)} ${f(y - th)}Z" fill="url(#tireG)" stroke="${OLC}" stroke-width="3" stroke-linejoin="round"/>`;
  for (let i = 0; i < 9; i++) { const u = (i + .5) / 9, px = x - r + u * 2 * r, yy = y + Math.sqrt(Math.max(0, 1 - Math.pow((px - x) / r, 2))) * ry; g += `<path d="M${f(px)} ${f(yy - th + 6)}V${f(yy - 5)}" stroke="#000" stroke-opacity=".5" stroke-width="3"/>`; }
  g += `<ellipse cx="${f(x)}" cy="${f(y - th)}" rx="${f(r)}" ry="${f(ry)}" fill="${c}" stroke="${OLC}" stroke-width="3"/><ellipse cx="${f(x)}" cy="${f(y - th)}" rx="${f(r * .9)}" ry="${f(ry * .88)}" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="3"/>`;
  g += `<ellipse cx="${f(x)}" cy="${f(y - th)}" rx="${f(r * .5)}" ry="${f(ry * .5)}" fill="#050506" stroke="#000" stroke-width="2"/><path d="M${f(x - r * .46)} ${f(y - th + ry * .2)}Q${f(x)} ${f(y - th + ry * .62)} ${f(x + r * .46)} ${f(y - th + ry * .2)}" fill="none" stroke="#4a4a50" stroke-width="3"/>`;
  g += `<path d="M${f(x - r * .85)} ${f(y - th - ry * .3)}Q${f(x - r * .5)} ${f(y - th - ry * .8)} ${f(x - r * .1)} ${f(y - th - ry * .92)}" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="5" stroke-linecap="round"/>`;
  return g;
}
// pneu em pé, vista 3/4 (extrudado)
export function tireS(x = 0, y = 0, rx = 82, ry = 104, d = 42) {
  const cx = x, cy = y - ry; let g = shadow(x + d * .4, y + 2, rx + d * .9, 15);
  const n = 12; for (let i = n; i >= 1; i--) { const t = i / n; g += `<ellipse cx="${f(cx + d * t)}" cy="${f(cy - d * .45 * t)}" rx="${rx}" ry="${ry}" fill="${mix('#0a0a0c', '#2c2c30', 1 - t)}" stroke="#000" stroke-opacity=".6" stroke-width="1.5"/>`; }
  for (let a = -70; a < 140; a += 14) { const r = a * Math.PI / 180; g += `<path d="M${f(cx + Math.cos(r - 1.2) * rx)} ${f(cy + Math.sin(r - 1.2) * ry)}l${f(d * .95)} ${f(-d * .43)}" stroke="#000" stroke-opacity=".38" stroke-width="3"/>`; }
  g += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#tireF)" stroke="${OLC}" stroke-width="3.5"/><ellipse cx="${cx}" cy="${cy}" rx="${f(rx * .86)}" ry="${f(ry * .86)}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="7"/><ellipse cx="${cx}" cy="${cy}" rx="${f(rx * .55)}" ry="${f(ry * .55)}" fill="#08080a" stroke="#000" stroke-width="3"/>`;
  g += `<ellipse cx="${f(cx + d * .5)}" cy="${f(cy - d * .22)}" rx="${f(rx * .42)}" ry="${f(ry * .42)}" fill="#3e424a" stroke="#000" stroke-width="2.5"/>${[0, 72, 144, 216, 288].map(a => `<circle cx="${f(cx + d * .5 + Math.cos(a * Math.PI / 180) * rx * .25)}" cy="${f(cy - d * .22 + Math.sin(a * Math.PI / 180) * ry * .25)}" r="4" fill="#1a1c20"/>`).join('')}`;
  g += `<path d="M${f(cx - rx * .9)} ${f(cy - ry * .25)}A${f(rx * .95)} ${f(ry * .95)} 0 0 1 ${f(cx - rx * .3)} ${f(cy - ry * .9)}" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="7" stroke-linecap="round"/>`;
  return g;
}
// ---- geladeira velha
export function fridge(x = 0, y = 0, s = 1, c = '#e6e1d0', sh = true, rot = 0) {
  let g = `<g transform="translate(${f(x)},${f(y)}) rotate(${rot}) scale(${f(s)})">`;
  if (sh) g += shadow(30, 4, 130, 17);
  g += cub(0, 0, 160, 330, 70, c, { fil: 'rP' });
  g += `<path d="M-80 -228H80" stroke="${OLC}" stroke-width="4"/><path d="M-80 -224H80" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>`;
  g += `<rect x="52" y="-300" width="10" height="56" rx="5" fill="#4a4f58" stroke="${OLC}" stroke-width="2.5"/><rect x="52" y="-208" width="10" height="110" rx="5" fill="#4a4f58" stroke="${OLC}" stroke-width="2.5"/><path d="M54 -296V-250M54 -204V-104" stroke="#fff" stroke-opacity=".45" stroke-width="2.5"/>`;
  g += `<path d="M-80 -12H80" stroke="#000" stroke-opacity=".5" stroke-width="3"/><path d="M-70 -8H70" stroke="#000" stroke-opacity=".4" stroke-width="2" stroke-dasharray="4 6"/>`;
  g += `<g opacity=".55"><ellipse cx="-40" cy="-60" rx="38" ry="22" fill="#a65a22"/><ellipse cx="-20" cy="-40" rx="26" ry="12" fill="#7a3a14"/><ellipse cx="46" cy="-170" rx="20" ry="30" fill="#b9732c"/></g><path d="M-60 -200C-52 -170 -58 -150 -48 -120" stroke="#9a5a22" stroke-opacity=".5" stroke-width="5" fill="none"/>`;
  g += `<path d="M-50 -260L-20 -250L-40 -230Z" fill="#fff" opacity=".18"/><rect x="-60" y="-290" width="22" height="26" fill="#e84a3a" stroke="${OLC}" stroke-width="1.5" transform="rotate(-6 -50 -277)"/><rect x="-30" y="-285" width="18" height="18" fill="#3a8ae8" stroke="${OLC}" stroke-width="1.5" transform="rotate(8 -20 -276)"/>`;
  g += `<path d="M80 -300L120 -318M80 -228L120 -246" stroke="#000" stroke-opacity=".4" stroke-width="2"/>`;
  return g + `</g>`;
}
// ---- sofá velho
export function sofa(x = 0, y = 0, s = 1, c = '#b8793a', sh = true) {
  let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">`;
  if (sh) g += shadow(40, 4, 280, 18);
  g += cub(40, -26, 440, 235, 46, c, { fil: 'rP' }) + cub(-205, 0, 62, 150, 80, mix(c, '#000000', .06), { fil: 'rP' }) + cub(205, 0, 62, 150, 80, mix(c, '#000000', .06), { fil: 'rP' }) + cub(0, 0, 370, 96, 80, c, { fil: 'rP' });
  g += `<path d="M0 -96V0" stroke="${OLC}" stroke-width="3.5"/><path d="M-185 -90C-100 -80 100 -80 185 -90" stroke="#000" stroke-opacity=".35" stroke-width="3" fill="none"/><path d="M-205 -146h62" stroke="#fff" stroke-opacity=".35" stroke-width="5"/>`;
  g += `<path d="M60 -96l22 -26 18 14 20 -24 14 20" fill="#f1ead8" stroke="${OLC}" stroke-width="2.5" stroke-linejoin="round"/><path d="M-120 -56l26 -4 10 12 -20 8z" fill="#7a4a22" stroke="${OLC}" stroke-width="2"/><ellipse cx="-70" cy="-50" rx="46" ry="22" fill="#6a3a14" opacity=".4"/>`;
  g += `<rect x="-229" y="-8" width="14" height="10" fill="#2a1a10"/><rect x="215" y="-8" width="14" height="10" fill="#2a1a10"/>`;
  return g + `</g>`;
}
// ---- colchão
export function colchao(x = 0, y = 0, s = 1, c = '#d9d4c0', sh = true, rot = 0) {
  let g = `<g transform="translate(${f(x)},${f(y)}) rotate(${rot}) scale(${f(s)})">`;
  if (sh) g += shadow(24, 4, 190, 14);
  g += cub(0, 0, 300, 340, 42, c, { fil: 'rP' });
  for (let i = 1; i < 12; i++) g += `<path d="M${-150 + i * 25} -340V0" stroke="#4a6aa8" stroke-opacity=".22" stroke-width="2"/>`;
  for (let r = 0; r < 6; r++) for (let q = 0; q < 4; q++) g += `<circle cx="${-100 + q * 66}" cy="${-300 + r * 56}" r="5" fill="#8a6a40" stroke="#1b1410" stroke-width="1.5"/><path d="M${-100 + q * 66 - 12} ${-300 + r * 56 + 9}Q${-100 + q * 66} ${-300 + r * 56 + 16} ${-100 + q * 66 + 12} ${-300 + r * 56 + 9}" stroke="#000" stroke-opacity=".25" stroke-width="2" fill="none"/>`;
  g += `<ellipse cx="-30" cy="-200" rx="70" ry="52" fill="#b49040" opacity=".5"/><ellipse cx="-24" cy="-196" rx="38" ry="28" fill="#8a6a28" opacity=".45"/><ellipse cx="70" cy="-90" rx="46" ry="30" fill="#7a5a3a" opacity=".38"/>`;
  g += `<path d="M-150 -336H150M-150 -4H150" stroke="#2a3a6a" stroke-opacity=".7" stroke-width="7"/><path d="M80 -340l30 20 -10 34z" fill="#fff" opacity=".4"/><path d="M110 -120l30 -10 8 22 -34 8z" fill="#f4eed8" stroke="${OLC}" stroke-width="2"/>`;
  return g + `</g>`;
}
// ---- fusca velho (olhando p/ esquerda)
export function fusca(x = 0, y = 0, s = 1, c = '#6fa8c4', sh = true) {
  const B = 'M-268 -52C-276 -92 -272 -118 -252 -130C-232 -140 -200 -152 -170 -165C-150 -190 -125 -230 -90 -258C-60 -282 20 -292 70 -276C115 -262 150 -222 185 -180C225 -165 262 -150 270 -110C278 -90 276 -70 270 -52Z';
  let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">`;
  if (sh) g += shadow(10, 3, 330, 22);
  g += `<path d="M-240 -52H240V-30H-240Z" fill="#14100c"/><ellipse cx="-168" cy="-62" rx="62" ry="34" fill="#0a0806" transform="translate(30,-12)" opacity=".7"/>`;
  g += `<path d="${B}" fill="${c}" filter="url(#rP)"/><path d="${B}" fill="url(#oF)"/><path d="${B}" fill="url(#oFh)"/><path d="${B}" fill="none" stroke="${OLC}" stroke-width="4" stroke-linejoin="round"/>`;
  g += `<path d="M-250 -128C-225 -158 -150 -166 -112 -120" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="5"/><path d="M130 -200C190 -176 245 -158 262 -128" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="5"/><path d="M-80 -270C-30 -286 40 -286 70 -272" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="6" stroke-linecap="round"/>`;
  g += `<circle cx="-166" cy="-62" r="76" fill="#0e0b08" stroke="${OLC}" stroke-width="3"/><circle cx="172" cy="-62" r="76" fill="#0e0b08" stroke="${OLC}" stroke-width="3"/>`;
  g += `<path d="M-132 -184C-124 -208 -108 -234 -92 -252C-60 -272 -10 -280 18 -274L16 -188Z" fill="url(#glass)" stroke="${OLC}" stroke-width="3.5" stroke-linejoin="round"/><path d="M26 -274C80 -266 130 -216 160 -186L26 -188Z" fill="url(#glass)" stroke="${OLC}" stroke-width="3.5" stroke-linejoin="round"/><path d="M-118 -190L-86 -250L-62 -252L-92 -190Z M40 -270L60 -266L96 -190L74 -190Z" fill="#fff" opacity=".26"/>`;
  g += `<path d="M-130 -184L-126 -66M20 -188L24 -66M160 -186L168 -108" stroke="${OLC}" stroke-width="3" fill="none"/><rect x="-26" y="-170" width="30" height="7" rx="3" fill="#cfd5dd" stroke="${OLC}" stroke-width="2"/><rect x="-110" y="-172" width="26" height="7" rx="3" fill="#cfd5dd" stroke="${OLC}" stroke-width="2"/>`;
  g += `<path d="M-252 -130L-250 -96" stroke="${OLC}" stroke-width="3"/><ellipse cx="-258" cy="-112" rx="14" ry="18" fill="#ffe9a0" stroke="${OLC}" stroke-width="3"/><ellipse cx="-262" cy="-118" rx="5" ry="7" fill="#fff"/><rect x="-286" y="-86" width="30" height="12" rx="6" fill="url(#chrome)" stroke="${OLC}" stroke-width="2.5"/><rect x="258" y="-84" width="30" height="12" rx="6" fill="url(#chrome)" stroke="${OLC}" stroke-width="2.5"/><rect x="262" y="-126" width="12" height="20" rx="5" fill="#d23a2a" stroke="${OLC}" stroke-width="2.5"/>`;
  g += `<g opacity=".6"><ellipse cx="-20" cy="-90" rx="60" ry="22" fill="#a8592a"/><ellipse cx="200" cy="-120" rx="40" ry="18" fill="#7a3a16"/><path d="M60 -250C70 -220 64 -200 72 -190" stroke="#8a4a20" stroke-width="6" fill="none"/></g><path d="M-200 -140l50 -10 -30 20z" fill="#000" opacity=".25"/>`;
  g += wheel(-166, -62, 60) + wheel(172, -62, 60);
  g += `<path d="M-238 -2H240" stroke="#000" stroke-opacity=".3" stroke-width="3"/>`;
  return g + `</g>`;
}
// ---- trator amarelo
export function trator(x = 0, y = 0, s = 1, c = '#e8b420', sh = true) {
  let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">`;
  if (sh) g += shadow(0, 3, 380, 22);
  // pá frontal
  g += `<path d="M-395 -150L-300 -178L-296 -150L-390 -118Z" fill="#8a909a" stroke="${OLC}" stroke-width="3.5"/><path d="M-420 -60L-340 -60L-326 -250L-410 -230Z" fill="#7a7f88" stroke="${OLC}" stroke-width="4" stroke-linejoin="round"/><path d="M-410 -230L-326 -250L-318 -236L-404 -214Z" fill="#c4c9d0"/><path d="M-408 -100H-336M-406 -150H-332M-404 -200H-330" stroke="#000" stroke-opacity=".3" stroke-width="3"/><path d="M-336 -60L-326 -250" stroke="#000" stroke-opacity=".4" stroke-width="5"/>`;
  g += wheel(-215, -85, 85);
  g += `<path d="M-290 -150H140V-112H-290Z" fill="#262a30" stroke="${OLC}" stroke-width="3.5"/>`;
  g += cub(-110, -146, 360, 106, 34, c, { sw: 3.5, fil: 'rP' });
  g += `<rect x="-290" y="-236" width="14" height="86" fill="#2a2e34" stroke="${OLC}" stroke-width="2"/>${[0, 1, 2, 3, 4].map(i => `<path d="M-286 ${-228 + i * 16}H-292" stroke="#000" stroke-width="3"/>`).join('')}<circle cx="-262" cy="-214" r="17" fill="#fff4c0" stroke="${OLC}" stroke-width="3"/><circle cx="-266" cy="-218" r="6" fill="#fff"/>`;
  g += `<rect x="-188" y="-342" width="18" height="100" fill="#4a4f58" stroke="${OLC}" stroke-width="2.5"/><path d="M-196 -342H-162L-170 -358H-188Z" fill="#2a2d34" stroke="${OLC}" stroke-width="2.5"/><rect x="-186" y="-340" width="5" height="96" fill="#fff" opacity=".35"/>`;
  g += `<g opacity=".7"><circle cx="-120" cy="-366" r="14" fill="#9aa0aa" opacity=".4"/><circle cx="-100" cy="-396" r="20" fill="#9aa0aa" opacity=".3"/></g>`;
  g += wheel(130, -150, 150);
  g += `<path d="M20 -200Q130 -330 285 -200L285 -170Q130 -304 20 -170Z" fill="${c}" stroke="${OLC}" stroke-width="3.5" stroke-linejoin="round"/><path d="M20 -200Q130 -330 285 -200" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="5"/>`;
  // cabine
  g += `<path d="M44 -252H268V-436H44Z" fill="url(#glass)" stroke="${OLC}" stroke-width="3.5"/><rect x="100" y="-340" width="82" height="90" rx="14" fill="#a2321e" stroke="${OLC}" stroke-width="2.5"/><rect x="104" y="-420" width="14" height="108" fill="#000" opacity=".35"/><path d="M62 -420L96 -420L62 -300Z M170 -420L222 -420L150 -270Z" fill="#fff" opacity=".22"/>`;
  g += `<rect x="38" y="-436" width="14" height="190" fill="${c}" stroke="${OLC}" stroke-width="2.5"/><rect x="262" y="-436" width="14" height="190" fill="${c}" stroke="${OLC}" stroke-width="2.5"/><path d="M26 -436L296 -436L318 -452L48 -452Z" fill="${mix(c, '#ffffff', .35)}" stroke="${OLC}" stroke-width="3"/><rect x="26" y="-436" width="270" height="16" fill="${c}" stroke="${OLC}" stroke-width="3.5"/><rect x="26" y="-436" width="270" height="16" fill="url(#oF)"/><circle cx="300" cy="-440" r="0"/><rect x="146" y="-472" width="22" height="20" rx="8" fill="#ff9a20" stroke="${OLC}" stroke-width="2.5"/>`;
  g += `<path d="M268 -252L296 -262V-420L268 -420Z" fill="${mix(c, '#000000', .4)}" stroke="${OLC}" stroke-width="3"/>`;
  g += `<g opacity=".6"><ellipse cx="-80" cy="-190" rx="50" ry="14" fill="#8a4a1e"/><ellipse cx="-190" cy="-170" rx="24" ry="10" fill="#6a3a14"/></g>`;
  return g + `</g>`;
}
// ---- caminhão de lixo (olhando p/ esquerda)
export function caminhao(x = 0, y = 0, s = 1, sh = true) {
  let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">`;
  if (sh) g += shadow(0, 3, 400, 24);
  g += `<path d="M-350 -90H330V-62H-350Z" fill="#262a30" stroke="${OLC}" stroke-width="3.5"/>`;
  g += wheel(-245, -62, 62);
  g += cub(90, -92, 470, 250, 38, '#e9e6da', { fil: 'rP', sw: 3.5 });
  g += `<rect x="-145" y="-190" width="470" height="66" fill="#3f9a50"/><rect x="-145" y="-190" width="470" height="66" fill="url(#oF)"/><path d="M-145 -190H325M-145 -124H325" stroke="${OLC}" stroke-width="3"/>`;
  g += `<path d="M300 -342V-110M240 -342V-110" stroke="#000" stroke-opacity=".25" stroke-width="3"/><rect x="262" y="-205" width="60" height="80" fill="#14100c" stroke="${OLC}" stroke-width="3"/><path d="M268 -130H318M268 -150H318M268 -170H318" stroke="#8a909a" stroke-width="5"/><path d="M-100 -330L-100 -110M30 -330L30 -110" stroke="#000" stroke-opacity=".18" stroke-width="3"/>`;
  g += `<g opacity=".55"><ellipse cx="90" cy="-260" rx="70" ry="26" fill="#a89a70"/><ellipse cx="200" cy="-140" rx="40" ry="14" fill="#7a5a30"/></g><path d="M-100 -300H250" stroke="#fff" stroke-opacity=".5" stroke-width="5"/>`;
  g += `<path d="M-352 -92V-228C-352 -262 -326 -278 -296 -290L-232 -336H-146V-92Z" fill="#f1eee2" stroke="${OLC}" stroke-width="4" stroke-linejoin="round"/><path d="M-352 -92V-228C-352 -262 -326 -278 -296 -290L-232 -336H-146V-92Z" fill="url(#oF)"/><path d="M-352 -92V-228C-352 -262 -326 -278 -296 -290L-232 -336H-146V-92Z" fill="url(#oFh)"/>`;
  g += `<path d="M-334 -250C-318 -270 -300 -276 -286 -284L-232 -322H-166V-210H-334Z" fill="url(#glass)" stroke="${OLC}" stroke-width="3.5" stroke-linejoin="round"/><path d="M-318 -216L-280 -282L-250 -290L-290 -216Z" fill="#fff" opacity=".3"/><path d="M-160 -330V-96" stroke="${OLC}" stroke-width="3"/><rect x="-216" y="-200" width="34" height="8" rx="4" fill="#8a909a" stroke="${OLC}" stroke-width="2"/>`;
  g += `<rect x="-352" y="-150" width="206" height="26" fill="#3f9a50"/><rect x="-352" y="-150" width="206" height="26" fill="url(#oF)"/><rect x="-364" y="-110" width="40" height="22" rx="8" fill="url(#chrome)" stroke="${OLC}" stroke-width="3"/><ellipse cx="-346" cy="-170" rx="10" ry="16" fill="#ffe9a0" stroke="${OLC}" stroke-width="3"/><rect x="-190" y="-352" width="28" height="18" rx="9" fill="#ff9a20" stroke="${OLC}" stroke-width="3"/><path d="M-310 -250L-338 -232V-218L-318 -228Z" fill="#8a909a" stroke="${OLC}" stroke-width="2.5"/>`;
  g += wheel(160, -62, 64) + wheel(268, -62, 64);
  g += `<path d="M-340 -4H320" stroke="#000" stroke-opacity=".3" stroke-width="3"/>`;
  return g + `</g>`;
}
// ---- monte de lixo (sacos em pirâmide + entulho). base em y, centro em x. w = nº de sacos na linha de baixo
export function pile(x, y, s, R, w = 4, rows = 3, deb = 1) {
  let g = `<g transform="translate(${f(x)},${f(y)}) scale(${f(s)})">`;
  g += shadow(0, 6, w * 62 + 40, 16 + rows * 3);
  const items = [];
  for (let r = rows - 1; r >= 0; r--) { const n = w - r; for (let i = 0; i < n; i++) items.push({ t: 'b', x: (i - (n - 1) / 2) * 100 + (R() - .5) * 26, y: -r * 66 + (R() - .5) * 12, sc: .82 + R() * .38, v: R() < .72 ? 0 : 1 + Math.floor(R() * 3), rot: (R() - .5) * 28 }); }
  for (const it of items) g += bag(it.x, it.y, it.sc, it.v, f(it.rot), false);
  if (deb) {
    const hw = w * 50; g += box(-hw + 20, 4, .9 + R() * .3, R, '#b98a55') + tireFlat(hw - 10, 8, 62, 30);
    g += can(-hw * .4, 10, 1.1) + can(hw * .5, 16, 1) + bottle(-hw * .8, 6, 1) + bottle(hw * .3, 10, 1.1, '#8a5a2a') + box(hw * .1, 12, .6, R, '#cfae7a');
    g += bag(-hw + 70, 6, .7, 0, -12, false);
  }
  return g + `</g>`;
}

// ---- exportação de PNG
const LISTA = {
  lixo: { d: () => bag(0, 0, 1, 0), vb: [-110, -190, 230, 215] },
  geladeira: { d: () => fridge(0, 0, 1), vb: [-100, -372, 330, 410] },
  pneu: { d: () => tireS(0, 0), vb: [-110, -230, 280, 260] },
  sofa: { d: () => sofa(0, 0, 1), vb: [-300, -300, 640, 330] },
  colchao: { d: () => colchao(0, 0, 1), vb: [-190, -400, 400, 430] },
  fusca: { d: () => fusca(0, 0, 1), vb: [-310, -310, 640, 340] },
  trator: { d: () => trator(0, 0, 1), vb: [-440, -500, 780, 540] },
  caminhao: { d: () => caminhao(0, 0, 1), vb: [-400, -370, 800, 410] },
};
export function renderProps(names) {
  const CH = execFileSync('bash', ['-c', 'ls -d ~/.nexo/cache/chrome/chrome-headless-shell/*/chrome-headless-shell-linux64 | tail -1']).toString().trim() + '/chrome-headless-shell';
  const out = ROOT + '../props_img/'; fs.mkdirSync(out, { recursive: true }); fs.mkdirSync(ROOT + '_svg', { recursive: true });
  for (const n of names) {
    const { d, vb } = LISTA[n]; const k = 1100 / Math.max(vb[2], vb[3]); const Wp = Math.round(vb[2] * k), Hp = Math.round(vb[3] * k);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Wp}" height="${Hp}" viewBox="${vb.join(' ')}"><defs>${PD}</defs>${d()}</svg>`;
    const sf = ROOT + '_svg/prop_' + n + '.svg'; fs.writeFileSync(sf, svg);
    const raw = os.tmpdir() + '/prop_' + n + '.png';
    try { execFileSync(CH, ['--no-sandbox', '--hide-scrollbars', '--screenshot=' + raw, '--default-background-color=00000000', `--window-size=${Wp},${Hp}`, '--force-device-scale-factor=1', 'file://' + sf], { stdio: 'ignore', timeout: 180000 }); } catch (e) { }
    // recorta e reduz p/ ~600px no maior lado
    execFileSync('python3', ['-I', '-c', `from PIL import Image\nim=Image.open("${raw}").convert("RGBA");bb=im.getchannel("A").point(lambda a:255 if a>8 else 0).getbbox();im=im.crop(bb);k=600/max(im.size);im=im.resize((max(1,round(im.size[0]*k)),max(1,round(im.size[1]*k))),Image.LANCZOS);im.save("${out}${n}.png");print("${n}",im.size)`], { stdio: 'inherit' });
    fs.unlinkSync(raw); console.log('prop', n);
  }
}
if (process.argv[1] && process.argv[1].endsWith('props.mjs')) { const w = process.argv.slice(2); renderProps(w.length ? w : Object.keys(LISTA)); }
