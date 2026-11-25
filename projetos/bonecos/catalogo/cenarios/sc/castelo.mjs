// Castelo de lixo: 9 cenários SVG procedurais 2.5D (far/mid/fg), bairro brasileiro de periferia. Chão dos personagens em y=1600.
import { rng, f, W, H, save, lg, rg, glow, relief, blurF, veinF, mix, farWrap, midWrap, fgWrap } from './lib.mjs';
import { PD, cub, shadow, bag, box, can, bottle, tireFlat, tireS, fridge, sofa, colchao, fusca, trator, caminhao, pile } from './props.mjs';

const OLC = '#1b1410', CH = 1600;
const COLS = ['#e8b04a', '#6fb7c9', '#d86a5a', '#8cc271', '#ebdcae', '#b58ad6', '#f08a4b', '#7aa0d8', '#e6c0b4', '#58b59a'];
let UID = 0;
const BASE = PD + blurF('b3', 3) + blurF('b8', 8) + blurF('b20', 20) + blurF('fgb', 3.5) + blurF('fgb2', 7)
  + relief('rWall', '.007 .014', 3, 3, 1.3, 1.14, 225) + relief('rConc', '.03 .05', 4, 8, 2.2, 1.12, 225) + relief('rAsph', '.3 .45', 2, 4, 2.5, 1.2, 225) + relief('rGr', '.012 .03', 4, 11, 3, 1.18, 225)
  + lg('poleG', [[0, '#e2ded4'], [.5, '#b0aca2'], [1, '#6e6a62']], 1, 0) + lg('tileR', [[0, '#d8703a'], [1, '#a2441c']]) + lg('wood', [[0, '#8a5a2c'], [.5, '#a8743a'], [1, '#5a3a1a']], 1, 0)
  + lg('winG', [[0, '#9fd0ea'], [1, '#3e6a8c']]) + lg('metal', [[0, '#7c828c'], [.5, '#b6bcc6'], [1, '#5a606a']], 1, 0) + glow('lampG', '255,220,140') + lg('tarp', [[0, '#5aa4e8'], [1, '#1e5a9c']]) + lg('dirt', [[0, '#000', 0], [1, '#000', .4]]);
const hex = c => c;
// -------- elementos de cenário
function cloud(x, y, s, c = '#fff', sh = '#cfd8e8') {
  let g = `<g transform="translate(${x},${y}) scale(${s})"><g fill="${sh}"><ellipse cx="0" cy="22" rx="150" ry="34"/><circle cx="-70" cy="0" r="52"/><circle cx="10" cy="-18" r="68"/><circle cx="84" cy="2" r="48"/></g><g fill="${c}"><ellipse cx="-6" cy="12" rx="146" ry="26"/><circle cx="-72" cy="-8" r="48"/><circle cx="6" cy="-30" r="64"/><circle cx="80" cy="-6" r="42"/></g></g>`;
  return g;
}
function casa(x, by, w, h, col, R, o = {}) {
  const dir = o.dir || 1, d = o.d || w * .34, dk = mix(col, '#1a1030', .4), lt = mix(col, '#ffffff', .42);
  const sx = dir > 0 ? x + w : x, ex = sx + dir * d, roof = o.roof || (R() < .5 ? 'laje' : 'tel'), night = o.night;
  let s = `<polygon points="${x},${by} ${x + w + d},${by - d * .1} ${x + w + d + h * .5},${by + 12} ${x + h * .4},${by + 14}" fill="#000" opacity=".28" filter="url(#b8)"/>`;
  // lado
  s += `<polygon points="${sx},${f(by - h)} ${ex},${f(by - h + d * .2)} ${ex},${f(by - d * .1)} ${sx},${by}" fill="${dk}"/><g filter="url(#rWall)"><polygon points="${sx},${f(by - h)} ${ex},${f(by - h + d * .2)} ${ex},${f(by - d * .1)} ${sx},${by}" fill="${dk}"/></g>`;
  const wx = sx + dir * d * .5, wy = by - h * .62;
  s += `<polygon points="${f(wx - dir * d * .22)},${f(wy + d * .02)} ${f(wx + dir * d * .22)},${f(wy + d * .06)} ${f(wx + dir * d * .22)},${f(wy + h * .26)} ${f(wx - dir * d * .22)},${f(wy + h * .22)}" fill="${night ? '#ffcc66' : 'url(#winG)'}" stroke="${OLC}" stroke-width="3"/>`;
  // telhado / laje
  if (roof === 'tel') {
    const rh = h * .3;
    s += `<polygon points="${sx - dir * 14},${f(by - h)} ${ex + dir * 14},${f(by - h + d * .2)} ${f(ex + dir * 14 - dir * d * .5)},${f(by - h - rh + d * .12)} ${f(sx - dir * 14 + dir * 4)},${f(by - h - rh)}" fill="${night ? '#5a2a20' : '#9a3e18'}" stroke="${OLC}" stroke-width="3" stroke-linejoin="round"/>`;
    s += `<polygon points="${x - 14},${f(by - h)} ${x + w + 14},${f(by - h)} ${f(x + w - 30)},${f(by - h - rh)} ${x + 30},${f(by - h - rh)}" fill="url(#tileR)" stroke="${OLC}" stroke-width="3" stroke-linejoin="round"/>`;
    for (let i = 1; i < 5; i++) { const yy = by - h - rh * i / 5, ins = 30 * (1 - i / 5) * -1 + 30 - 30 * (i / 5) * 0; s += `<path d="M${f(x - 14 + (44 * i / 5))} ${f(by - h - rh * i / 5)}H${f(x + w + 14 - 44 * i / 5)}" stroke="#000" stroke-opacity=".28" stroke-width="3"/>`; }
    s += `<path d="M${x - 8} ${f(by - h - 3)}H${x + w + 8}" stroke="#fff" stroke-opacity=".4" stroke-width="3"/><rect x="${x + w * .66}" y="${f(by - h - rh - 34)}" width="22" height="40" fill="${mix(col, '#7a5a40', .5)}" stroke="${OLC}" stroke-width="3"/>`;
  } else {
    const ph = 26;
    s += `<polygon points="${sx - dir * 6},${f(by - h)} ${ex + dir * 6},${f(by - h + d * .2)} ${ex + dir * 6},${f(by - h + d * .2 - ph)} ${sx - dir * 6},${f(by - h - ph)}" fill="${mix(col, '#000000', .3)}" stroke="${OLC}" stroke-width="3" stroke-linejoin="round"/>`;
    const tp = dir > 0 ? `${x - 6},${f(by - h - ph)} ${x + w + 6},${f(by - h - ph)} ${ex + 6},${f(by - h + d * .2 - ph)}  ${x + d * .4},${f(by - h - ph + d * .1)}` : `${x - 6},${f(by - h - ph)} ${x + w + 6},${f(by - h - ph)} ${x + w},${f(by - h - ph + d * .1)} ${ex - 6},${f(by - h + d * .2 - ph)}`;
    s += `<polygon points="${tp}" fill="#9a968a" opacity=".001"/>`;
    s += `<rect x="${x - 6}" y="${f(by - h - ph)}" width="${w + 12}" height="${ph}" fill="${lt}" stroke="${OLC}" stroke-width="3"/><rect x="${x - 6}" y="${f(by - h - ph)}" width="${w + 12}" height="6" fill="#fff" opacity=".6"/>`;
    const cx2 = x + w * .3 + (R() * w * .3);
    s += `<g transform="translate(${f(cx2)},${f(by - h - ph)})"><rect x="-22" y="-12" width="44" height="12" fill="#6a5a4a" stroke="${OLC}" stroke-width="2.5"/><path d="M-26 -16V-54C-26 -64 26 -64 26 -54V-16C26 -6 -26 -6 -26 -16Z" fill="#3b90d8" stroke="${OLC}" stroke-width="3"/><path d="M-26 -50C-26 -40 26 -40 26 -50M-26 -34C-26 -24 26 -24 26 -34" stroke="#0a3a70" stroke-width="2.5" fill="none"/><path d="M-18 -56V-18" stroke="#fff" stroke-opacity=".5" stroke-width="5" stroke-linecap="round"/><ellipse cx="0" cy="-58" rx="26" ry="8" fill="#6cb6f0" stroke="${OLC}" stroke-width="3"/></g>`;
    if (R() < .6) s += `<path d="M${f(x + w * .15)} ${f(by - h - ph)}V${f(by - h - ph - 60)}M${f(x + w * .15 - 24)} ${f(by - h - ph - 56)}H${f(x + w * .15 + 24)}M${f(x + w * .15 - 16)} ${f(by - h - ph - 44)}H${f(x + w * .15 + 16)}" stroke="#3a3a42" stroke-width="3.5"/>`;
  }
  // frente
  s += `<g filter="url(#rWall)"><rect x="${x}" y="${f(by - h)}" width="${w}" height="${h}" fill="${col}"/></g><rect x="${x}" y="${f(by - h)}" width="${w}" height="${h}" fill="url(#oF)"/><rect x="${x}" y="${f(by - h)}" width="${w}" height="${h}" fill="url(#oFh)"/><rect x="${x}" y="${f(by - h)}" width="${w}" height="${h}" fill="none" stroke="${OLC}" stroke-width="3.5"/><rect x="${x}" y="${f(by - 40)}" width="${w}" height="40" fill="url(#dirt)"/>`;
  s += `<path d="M${x + 3} ${f(by - h + 4)}H${x + w - 3}" stroke="#fff" stroke-opacity=".6" stroke-width="3"/>`;
  if (R() < .6) { const bx = x + (dir > 0 ? w - w * .3 : 0), by2 = by - h * .5; s += `<g><rect x="${f(bx)}" y="${f(by2)}" width="${f(w * .3)}" height="${f(h * .26)}" fill="#b0562f" stroke="${OLC}" stroke-width="2"/>${[0, 1, 2, 3].map(i => `<path d="M${f(bx + 2)} ${f(by2 + 8 + i * h * .06)}H${f(bx + w * .3 - 2)}" stroke="#6a2a14" stroke-width="2"/>`).join('')}</g>`; }
  // porta e janelas
  const dw = w * .2, dh = Math.min(h * .55, 120);
  const dx = x + w * (o.doorAt ?? .12);
  s += `<rect x="${f(dx)}" y="${f(by - dh)}" width="${f(dw)}" height="${f(dh)}" fill="${mix(col, '#2a3a5a', .55)}" stroke="${OLC}" stroke-width="3.5"/><rect x="${f(dx + 5)}" y="${f(by - dh + 8)}" width="${f(dw - 10)}" height="${f(dh * .4)}" fill="#000" opacity=".2"/><circle cx="${f(dx + dw - 8)}" cy="${f(by - dh * .5)}" r="4" fill="#f0d070" stroke="${OLC}" stroke-width="1.5"/><path d="M${f(dx - 3)} ${f(by - dh - 2)}H${f(dx + dw + 3)}" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>`;
  const nWin = w > 190 ? 2 : 1;
  for (let i = 0; i < nWin; i++) {
    const ww = w * .22, wh = Math.min(h * .3, 72), wxx = x + w * (.46 + i * .27), wyy = by - h * .66;
    if (wxx + ww > x + w - 6) continue;
    s += `<rect x="${f(wxx - 5)}" y="${f(wyy - 5)}" width="${f(ww + 10)}" height="${f(wh + 10)}" fill="#f4f0e4" stroke="${OLC}" stroke-width="3"/><rect x="${f(wxx)}" y="${f(wyy)}" width="${f(ww)}" height="${f(wh)}" fill="${night ? '#ffc863' : 'url(#winG)'}" stroke="${OLC}" stroke-width="2.5"/>`;
    s += `<path d="M${f(wxx + ww / 2)} ${f(wyy)}V${f(wyy + wh)}M${f(wxx)} ${f(wyy + wh / 2)}H${f(wxx + ww)}" stroke="#2a2a30" stroke-width="3"/><path d="M${f(wxx + 4)} ${f(wyy + wh - 4)}L${f(wxx + ww * .4)} ${f(wyy + 4)}L${f(wxx + ww * .6)} ${f(wyy + 4)}L${f(wxx + 10)} ${f(wyy + wh - 4)}Z" fill="#fff" opacity="${night ? .1 : .35}"/><path d="M${f(wxx - 5)} ${f(wyy + wh + 8)}H${f(wxx + ww + 5)}" stroke="#000" stroke-opacity=".3" stroke-width="5"/>`;
  }
  // muro + portão
  if (o.muro !== false) {
    const mh = Math.min(86, h * .32), my = by + 18, mc = mix(col, '#ffffff', .12);
    s += `<polygon points="${x - 12},${my} ${x + w + 14},${my} ${x + w + 14 + h * .12},${my + 12} ${x - 12 + h * .1},${my + 12}" fill="#000" opacity=".25" filter="url(#b3)"/>`;
    s += `<g filter="url(#rConc)"><rect x="${x - 12}" y="${my - mh}" width="${w + 26}" height="${mh}" fill="${mc}"/></g><rect x="${x - 12}" y="${my - mh}" width="${w + 26}" height="${mh}" fill="url(#oF)"/><rect x="${x - 12}" y="${my - mh}" width="${w + 26}" height="${mh}" fill="none" stroke="${OLC}" stroke-width="3.5"/><rect x="${x - 16}" y="${my - mh - 8}" width="${w + 34}" height="10" fill="${mix(mc, '#ffffff', .4)}" stroke="${OLC}" stroke-width="3"/>`;
    const gx = x + w * .5 - 4, gw = w * .26;
    s += `<rect x="${f(gx)}" y="${f(my - mh + 6)}" width="${f(gw)}" height="${mh - 6}" fill="#2a2e36" stroke="${OLC}" stroke-width="3"/>${Array.from({ length: Math.floor(gw / 9) }, (_, i) => `<path d="M${f(gx + 6 + i * 9)} ${f(my - mh + 8)}V${my - 2}" stroke="#8a909a" stroke-width="3"/>`).join('')}<path d="M${f(gx)} ${f(my - mh + 6)}H${f(gx + gw)}" stroke="#fff" stroke-opacity=".4" stroke-width="2.5"/>`;
    s += `<rect x="${x - 14}" y="${my - mh - 8}" width="14" height="${mh + 8}" fill="${mix(mc, '#000000', .1)}" stroke="${OLC}" stroke-width="3"/>`;
  }
  return s;
}
function poste(x, by, h, wires = true) {
  let s = `<ellipse cx="${x + 14}" cy="${by + 3}" rx="36" ry="7" fill="#000" opacity=".4" filter="url(#b3)"/><rect x="${x - 10}" y="${by - h}" width="20" height="${h}" fill="url(#poleG)" stroke="${OLC}" stroke-width="3"/><path d="M${x - 6} ${by - h + 8}V${by - 6}" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>`;
  s += `<rect x="${x - 64}" y="${by - h + 34}" width="128" height="11" fill="#5a4a38" stroke="${OLC}" stroke-width="3"/><rect x="${x - 52}" y="${by - h + 70}" width="104" height="9" fill="#5a4a38" stroke="${OLC}" stroke-width="3"/>`;
  for (const dx of [-54, -18, 18, 54]) s += `<rect x="${x + dx - 4}" y="${by - h + 18}" width="8" height="18" rx="3" fill="#cfd4dc" stroke="${OLC}" stroke-width="2"/>`;
  s += `<g><rect x="${x + 14}" y="${by - h + 90}" width="38" height="58" rx="8" fill="url(#metal)" stroke="${OLC}" stroke-width="3"/><rect x="${x + 18}" y="${by - h + 86}" width="30" height="8" rx="3" fill="#4a4e56" stroke="${OLC}" stroke-width="2"/><path d="M${x + 22} ${by - h + 100}V${by - h + 140}" stroke="#fff" stroke-opacity=".5" stroke-width="3"/></g>`;
  return s;
}
function fios(pts, sag = 40, n = 3, gap = 14) {
  let s = ''; for (let k = 0; k < n; k++) for (let i = 0; i < pts.length - 1; i++) { const [a, b] = pts[i], [c, d] = pts[i + 1]; s += `<path d="M${a} ${b + k * gap}Q${(a + c) / 2} ${Math.max(b, d) + k * gap + sag} ${c} ${d + k * gap}" fill="none" stroke="#17171c" stroke-width="3.2"/><path d="M${a} ${b + k * gap - 1}Q${(a + c) / 2} ${Math.max(b, d) + k * gap + sag - 1} ${c} ${d + k * gap - 1}" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="1.2"/>`; }
  return s;
}
function arvore(x, by, s, R, c1 = '#4aa04a', c2 = '#1f6a34') {
  let g = `<g transform="translate(${x},${by}) scale(${s})"><ellipse cx="30" cy="4" rx="120" ry="16" fill="#000" opacity=".32" filter="url(#b8)"/><path d="M-18 0C-14 -60 -8 -120 -14 -190L20 -190C16 -120 22 -60 24 0Z" fill="#6a4426" stroke="${OLC}" stroke-width="4"/><path d="M-8 -4C-6 -60 -2 -120 -6 -184" stroke="#b08a5a" stroke-opacity=".6" stroke-width="6" fill="none"/><path d="M0 -120L-60 -170M8 -140L70 -190" stroke="#6a4426" stroke-width="12" stroke-linecap="round"/>`;
  const bl = [[-90, -230, 80], [80, -240, 84], [0, -300, 100], [-40, -190, 70], [50, -180, 74], [-120, -170, 56], [120, -170, 58]];
  for (const [bx, by2, r] of bl) g += `<circle cx="${bx + 14}" cy="${by2 + 16}" r="${r}" fill="${c2}"/>`;
  for (const [bx, by2, r] of bl) g += `<circle cx="${bx}" cy="${by2}" r="${r}" fill="${c1}"/><circle cx="${bx - r * .25}" cy="${by2 - r * .3}" r="${r * .66}" fill="${mix(c1, '#e8ff9a', .32)}"/>`;
  for (let i = 0; i < 18; i++) g += `<circle cx="${f(-130 + R() * 260)}" cy="${f(-340 + R() * 220)}" r="${f(4 + R() * 7)}" fill="${mix(c1, '#ffffff', .5)}" opacity=".5"/>`;
  return g + `</g>`;
}
// piso de rua: calçada + meio-fio + asfalto (perspectiva com ponto de fuga em (900,1000))
function chaoRua(by = 1392, o = {}) {
  const vx = 900, vy = 1000, k = y => (y - vy) / (1920 - vy), cur0 = 1530, cur1 = 1566;
  let s = `<g filter="url(#rConc)"><rect x="-50" y="${by}" width="1900" height="${cur0 - by}" fill="${o.calc || '#cdc6b4'}"/></g><rect x="-50" y="${by}" width="1900" height="${cur0 - by}" fill="url(#oT)" opacity=".3"/>`;
  for (let xi = -1800; xi <= 3600; xi += 220) s += `<path d="M${f(vx + (xi - vx) * k(by))} ${by}L${f(vx + (xi - vx) * k(cur0))} ${cur0}" stroke="#6a6458" stroke-opacity=".35" stroke-width="3"/>`;
  for (const y of [by + 24, by + 62, cur0 - 30]) s += `<path d="M-50 ${y}H1850" stroke="#6a6458" stroke-opacity=".3" stroke-width="3"/><path d="M-50 ${y + 3}H1850" stroke="#fff" stroke-opacity=".25" stroke-width="2"/>`;
  s += `<rect x="-50" y="${by}" width="1900" height="14" fill="#000" opacity=".16"/>`;
  s += `<rect x="-50" y="${cur0}" width="1900" height="14" fill="#efe9d8" stroke="${OLC}" stroke-width="3"/><rect x="-50" y="${cur0 + 14}" width="1900" height="${cur1 - cur0 - 14}" fill="#a49d8c" stroke="${OLC}" stroke-width="3"/><rect x="-50" y="${cur0 + 14}" width="1900" height="6" fill="#000" opacity=".25"/>`;
  s += `<g filter="url(#rAsph)"><rect x="-50" y="${cur1}" width="1900" height="${1960 - cur1}" fill="${o.asf || '#52565f'}"/></g><rect x="-50" y="${cur1}" width="1900" height="${1960 - cur1}" fill="url(#asfG)"/>`;
  s += `<rect x="-50" y="${cur1}" width="1900" height="30" fill="#000" opacity=".3" filter="url(#b8)"/>`;
  // faixa central tracejada em perspectiva
  for (let i = -6; i < 10; i++) { const y1 = 1760, y2 = 1792; const xa = 900 + (i * 260 - 900) * 1, xb = xa + 150; s += `<polygon points="${xa},${y1} ${xb},${y1} ${xb + 30},${y2} ${xa - 4},${y2}" fill="${o.faixa || '#f2d24a'}" opacity=".85"/>`; }
  // rachaduras e remendos
  for (const [x1, y1, x2, y2] of [[140, 1700, 360, 1790], [1380, 1640, 1560, 1730], [760, 1850, 1100, 1900], [300, 1620, 420, 1660]]) s += `<path d="M${x1} ${y1}L${(x1 + x2) / 2 + 20} ${(y1 + y2) / 2 - 14}L${x2} ${y2}" stroke="#121216" stroke-width="3.5" fill="none" stroke-linejoin="round"/>`;
  s += `<ellipse cx="1180" cy="1830" rx="200" ry="26" fill="#2a4a6a" opacity=".5"/><path d="M1020 1826Q1180 1812 1340 1826" stroke="#cfe6ff" stroke-opacity=".35" stroke-width="4" fill="none"/>`;
  s += `<ellipse cx="500" cy="1880" rx="64" ry="14" fill="#2a2d34" stroke="${OLC}" stroke-width="3"/><ellipse cx="500" cy="1876" rx="56" ry="11" fill="#43464e"/>`;
  return s;
}
const ASF = lg('asfG', [[0, '#fff', .06], [.25, '#000', 0], [1, '#000', .32]]);
// ---------- castelo de lixo
function junkWall(x0, x1, yb, yt, R, sc = 1) {
  const id = 'cw' + (UID++), FR = ['#e6e1d0', '#d8d2c0', '#bfc9c4', '#cfd8e0', '#e8c9a8', '#cdd2c0'];
  let s = `<clipPath id="${id}"><rect x="${x0}" y="${yt}" width="${x1 - x0}" height="${yb - yt + 4}"/></clipPath><g clip-path="url(#${id})"><rect x="${x0}" y="${yt}" width="${x1 - x0}" height="${yb - yt}" fill="#241a12"/>`;
  let y = yb;
  while (y > yt - 20) {
    const rh = (96 + R() * 56) * sc; let x = x0 - 22 * sc; let row = '';
    while (x < x1 + 10) {
      const t = R(), jy = (R() - .5) * 10 * sc;
      if (t < .28) { const k = rh * .9 / 330 * (.85 + R() * .3); row += fridge(x + 82 * k, y + jy, k, FR[Math.floor(R() * FR.length)], false); x += 150 * k; }
      else if (t < .46) { const r = rh * .36, th = r * .5, n = 2 + Math.floor(R() * 2); for (let i = 0; i < n; i++) row += tireFlat(x + r, y + jy - i * th * .86, r, th); x += r * 2 - 4; }
      else if (t < .66) { const k = rh / 190 * (.8 + R() * .4); row += bag(x + 70 * k, y + jy, k, R() < .7 ? 0 : 1 + Math.floor(R() * 3), (R() - .5) * 20, false) + bag(x + 150 * k, y + jy, k * .88, 0, (R() - .5) * 20, false); x += 190 * k; }
      else if (t < .78) { const k = rh * 1.05 / 340; row += colchao(x + 150 * k, y + jy, k, ['#d9d4c0', '#c8d4e0', '#e0c8c8'][Math.floor(R() * 3)], false); x += 340 * k; }
      else if (t < .88) { const k = rh * 1.3 / 520; row += sofa(x + 250 * k, y + jy, k, ['#b8793a', '#7a8aa8', '#a85a50'][Math.floor(R() * 3)], false); x += 540 * k; }
      else { const k = rh / 110; row += box(x + 50 * k, y + jy, k, R, ['#b98a55', '#cfae7a', '#a87a48'][Math.floor(R() * 3)]); x += 100 * k; }
    }
    s += row; y -= rh * .84;
  }
  // sombras entre fileiras e oclusão ambiente
  s += `<rect x="${x0}" y="${yt}" width="${x1 - x0}" height="${yb - yt}" fill="url(#castAO)"/></g>`;
  return s;
}
const CASTD = lg('castAO', [[0, '#000', .0], [.7, '#000', .06], [1, '#000', .5]]) + lg('castL', [[0, '#fff', .16], [.5, '#fff', 0], [1, '#000', .26]], 1, 0) + lg('flagG', [[0, '#7ec2ff'], [.5, '#3a8ae0'], [1, '#164a8c']], 1, 0);
function tower(x0, x1, yb, yt, d, R, sc = 1, mer = true) {
  const w = x1 - x0, k = d * .45, wall = junkWall(x0, x1, yb, yt, R, sc);
  let s = `<g transform="matrix(${f(d / w)} ${f(-k / w)} 0 1 ${f(x1 - x0 * d / w)} ${f(k * x0 / w)})">${wall}</g>`;
  s += `<polygon points="${x1},${yt} ${x1 + d},${f(yt - k)} ${x1 + d},${f(yb - k)} ${x1},${yb}" fill="#000" opacity=".4"/>`;
  s += `<polygon points="${x0},${yt} ${x1},${yt} ${x1 + d},${f(yt - k)} ${x0 + d},${f(yt - k)}" fill="#9b8c76"/><polygon points="${x0},${yt} ${x1},${yt} ${x1 + d},${f(yt - k)} ${x0 + d},${f(yt - k)}" fill="url(#oT)"/>`;
  for (let i = 0; i < 3; i++) s += bag(x0 + d * .6 + w * (.2 + .3 * i + R() * .1), yt - k * .5 - 6, .3 * sc, 0, (R() - .5) * 40, false);
  s += wall + `<rect x="${x0}" y="${yt}" width="${w}" height="${yb - yt}" fill="url(#castL)"/>`;
  s += `<path d="M${x0} ${yt}V${yb}M${x1} ${yt}V${yb}" stroke="${OLC}" stroke-width="4"/><polygon points="${x1},${yt} ${x1 + d},${f(yt - k)} ${x1 + d},${f(yb - k)} ${x1},${yb}" fill="none" stroke="${OLC}" stroke-width="4" stroke-linejoin="round"/><polygon points="${x0},${yt} ${x1},${yt} ${x1 + d},${f(yt - k)} ${x0 + d},${f(yt - k)}" fill="none" stroke="${OLC}" stroke-width="4" stroke-linejoin="round"/>`;
  if (mer) { const mw = 46 * sc, cols = ['#e6e1d0', '#8a5a2c', '#2a2a30', '#bfc9c4', '#a85a50']; let i = 0; for (let x = x0 + 4; x + mw <= x1 + 2; x += mw * 2) s += cub(x + mw / 2, yt, mw, 44 * sc, 18 * sc, cols[(i++) % 5], { sw: 3 }); }
  return s;
}
function janelaC(x, y, w, h, night) {
  return `<path d="M${x - w / 2} ${y}V${y - h * .6}Q${x - w / 2} ${y - h} ${x} ${y - h}Q${x + w / 2} ${y - h} ${x + w / 2} ${y - h * .6}V${y}Z" fill="${night ? '#ffc65a' : '#3a2a1c'}" stroke="${OLC}" stroke-width="4"/><path d="M${x - w / 2 + 6} ${y}V${y - h * .6}Q${x - w / 2 + 6} ${y - h + 8} ${x} ${y - h + 8}" fill="none" stroke="#fff" stroke-opacity="${night ? .5 : .15}" stroke-width="3"/><rect x="${x - w / 2 - 6}" y="${y}" width="${w + 12}" height="9" fill="#8a5a2c" stroke="${OLC}" stroke-width="3"/>${night ? '' : `<path d="M${x - w / 2 + 6} ${y - h * .5}L${x + w * .1} ${y - h * .4}L${x - w * .1} ${y - 4}L${x - w / 2 + 6} ${y - 4}Z" fill="#c24a3a" opacity=".85"/>`}`;
}
// opts: S escala, night, tilt
function castelo(cx, by, S, R, o = {}) {
  const night = o.night; let s = ''; let LT = '';
  const T = (x0, x1, yt, d = 56, sc = 1) => tower(x0, x1, 0, yt, d, R, sc);
  // sombra projetada no chão (luz da esquerda)
  s += `<polygon points="-380,0 400,0 ${f(400 + 540)},44 ${f(-380 + 440)},40" fill="#000" opacity=".3" filter="url(#b20)"/>`;
  s += `<g>`;
  s += T(-70, 70, -1060, 40, .8);                // torreta central alta
  s += T(-170, 170, -820, 64, 1);              // torre mestra
  s += T(-400, -250, -600, 50, .95);           // torre esquerda
  s += T(250, 400, -690, 50, .95);             // torre direita
  s += T(-250, -170, -400, 40, .8) + T(170, 250, -420, 40, .8);  // muralhas
  s += T(-130, 130, -340, 70, 1.1);            // bloco do portão
  // portão (arco) e janelas
  s += `<path d="M-52 0V-130Q-52 -190 0 -190Q52 -190 52 -130V0Z" fill="#1a0f08" stroke="${OLC}" stroke-width="5"/><path d="M-44 0V-128Q-44 -176 0 -178Q44 -176 44 -128V0Z" fill="#4a2a14" opacity=".8"/><rect x="-62" y="-6" width="124" height="12" fill="#8a5a2c" stroke="${OLC}" stroke-width="3"/>`;
  const WN = [[0, -560, 50, 96], [-90, -420, 40, 80], [90, -440, 40, 80], [-325, -380, 40, 82], [325, -430, 40, 82], [0, -900, 30, 60]];
  for (const [a, b, c, d] of WN) { s += janelaC(a, b, c, d, false); if (night) LT += `<circle cx="${a}" cy="${b - d * .4}" r="${c * 2.6}" fill="url(#lampG)" opacity=".7"/>` + janelaC(a, b, c, d, true); }
  if (night) LT += `<circle cx="0" cy="-90" r="140" fill="url(#lampG)" opacity=".75"/><path d="M-44 0V-128Q-44 -176 0 -178Q44 -176 44 -128V0Z" fill="#ffc65a"/><path d="M-44 0L-44 -120L44 -120L44 0Z" fill="#fff4c0" opacity=".25"/>`;
  // placa PARE + pneus + fusca no alto + sofá
  s += `<g transform="translate(-205,-330)"><rect x="-4" y="-4" width="8" height="70" fill="#8a8f98" stroke="${OLC}" stroke-width="2.5"/><polygon points="-22,-50 22,-50 44,-28 44,16 22,38 -22,38 -44,16 -44,-28" transform="scale(.7) translate(0,-14)" fill="#d23a2a" stroke="#fff" stroke-width="3"/><text x="0" y="-22" font-family="Anton,Impact,sans-serif" font-size="16" text-anchor="middle" fill="#fff">PARE</text></g>`;
  s += fusca(-290, -600, .42, '#6fa8c4', false) + sofa(285, -690, .26, '#a85a50', false);
  // bandeira de lona azul
  s += `<g><rect x="-3" y="-1190" width="7" height="140" fill="#cfd4dc" stroke="${OLC}" stroke-width="2.5"/><path d="M4 -1186C34 -1204 64 -1170 100 -1190C112 -1160 108 -1132 98 -1108C64 -1126 34 -1100 4 -1116Z" fill="url(#flagG)" stroke="${OLC}" stroke-width="3.5" stroke-linejoin="round"/><path d="M10 -1182C34 -1196 58 -1166 90 -1182" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/><circle cx="8" cy="-1182" r="4" fill="#e8c44a"/><circle cx="8" cy="-1118" r="4" fill="#e8c44a"/></g>`;
  s += `</g>`;
  // entulho no pé do castelo
  s += pile(-300, 24, .55, R, 4, 2, 1) + pile(300, 30, .6, R, 4, 2, 1) + pile(-60, 54, .5, R, 3, 2, 0) + pile(150, 60, .46, R, 3, 1, 1) + pile(-420, 48, .42, R, 3, 2, 0);
  if (night) { // pisca-pisca
    const cols = ['#ff4a4a', '#ffd23a', '#4af08a', '#4ab8ff', '#ff7ad0'];
    for (const [a, b, c, d] of [[-400, -600, -250, -520], [-250, -520, -170, -770], [-170, -770, 170, -770], [170, -770, 250, -650], [250, -650, 400, -690], [-130, -340, 130, -340]]) {
      const n = 9, sg = 24; LT += `<path d="M${a} ${b}Q${(a + c) / 2} ${Math.max(b, d) + sg} ${c} ${d}" fill="none" stroke="#10151f" stroke-width="3"/>`;
      for (let i = 1; i < n; i++) { const t = i / n, x = (1 - t) * (1 - t) * a + 2 * t * (1 - t) * ((a + c) / 2) + t * t * c, y = (1 - t) * (1 - t) * b + 2 * t * (1 - t) * (Math.max(b, d) + sg) + t * t * d; LT += `<circle cx="${f(x)}" cy="${f(y + 8)}" r="22" fill="${cols[i % 5]}" opacity=".28"/><circle cx="${f(x)}" cy="${f(y + 6)}" r="7" fill="${cols[i % 5]}" stroke="#10151f" stroke-width="2"/><circle cx="${f(x - 2)}" cy="${f(y + 4)}" r="2.5" fill="#fff"/>`; }
    }
  }
  const T0 = `translate(${cx},${by}) scale(${S})${o.tilt ? ` rotate(${o.tilt})` : ''}`;
  if (o.lights) { o.lights.push(`<g transform="${T0}">${LT}</g>`); return `<g transform="${T0}">${s}</g>`; }
  return `<g transform="${T0}">${s}${LT}</g>`;
}
const filt = (id, m) => `<filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="${m}"/></filter>`;
const NIGHT = filt('nightF', '.38 .05 .1 0 0  .05 .42 .18 0 0  .1 .16 .78 0 .02  0 0 0 1 0');
const SUNSET = filt('sunF', '1.05 .12 0 0 .02  .04 .78 .05 0 0  0 .08 .62 0 0  0 0 0 1 0');
const WARM = filt('warmF', '1.02 .06 0 0 .01  .02 .94 .03 0 0  0 .04 .8 0 0  0 0 0 1 0');
function morro(y0, c1, c2, R, hmin, hmax, seed) { // colina com casinhas coloridas
  let s = `<path d="M-100 ${y0 + 200}V${y0}`; let x = -100; const pts = [[-100, y0]]; while (x < 1900) { x += 140 + R() * 120; const y = y0 - hmin - R() * (hmax - hmin); pts.push([x, y]); s += `Q${f(x - 90)} ${f(y - 30)} ${f(x)} ${f(y)}`; }
  s += `V${y0 + 200}Z" fill="${c1}"/>`;
  for (let i = 0; i < 120; i++) { const x2 = -60 + R() * 1920, ytop = y0 - hmax * .8 + R() * hmax * .9, w = 26 + R() * 30, h = 20 + R() * 22; s += `<rect x="${f(x2)}" y="${f(ytop)}" width="${f(w)}" height="${f(h)}" fill="${mix(COLS[Math.floor(R() * COLS.length)], c2, .35)}"/><rect x="${f(x2)}" y="${f(ytop - 6)}" width="${f(w)}" height="6" fill="${mix(c2, '#000000', .3)}"/>`; }
  return s;
}
function ceu(id, stops) { return lg(id, stops); }
// monte de lixo "desfocado" para o primeiro plano
const fgPile = (x, y, s, R, w, rows, blur = 'fgb') => `<g filter="url(#${blur})">${pile(x, y, s, R, w, rows, 1)}</g>`;

// ================== 1. RUA DO LIXO (manhã) ==================
function ruaLixo() {
  const id = 'cl_rua_lixo', R = rng(101);
  const defs = BASE + ASF + CASTD + ceu('skyM', [[0, '#79c0ec'], [.55, '#bfe3f6'], [1, '#fff0cc']]) + glow('sunG', '255,236,170') + WARM;
  let g = `<rect width="1800" height="1920" fill="url(#skyM)"/><circle cx="330" cy="520" r="420" fill="url(#sunG)"/><circle cx="330" cy="520" r="70" fill="#fff8d8"/>`;
  g += cloud(1300, 360, 1.5) + cloud(700, 240, 1) + cloud(1600, 640, 1.1, '#fff', '#e8d8c8') + cloud(160, 760, .9);
  g += morro(1130, '#7f98a8', '#9fb4c4', R, 60, 180) + morro(1260, '#8a8f9a', '#b0b4be', R, 20, 90);
  for (let x = 20; x < 1850; x += 70 + R() * 90) g += casa(x, 1370, 110 + R() * 50, 130 + R() * 60, COLS[Math.floor(R() * COLS.length)], R, { d: 30, muro: false });
  g += `<rect x="-50" y="1360" width="1900" height="600" fill="#6d7078"/>`;
  g += pile(300, 1362, .3, R, 5, 2, 0) + pile(780, 1360, .26, R, 4, 2, 0) + pile(1450, 1364, .32, R, 5, 2, 0);
  save(id + '_far', farWrap('#6d7078', g, defs, 3.5, '#d8ecf8', .22));
  let m = chaoRua(1392);
  // casas laterais
  const L = [[-90, 330, 520, COLS[2], 1], [270, 260, 340, COLS[0], 1], [1390, 260, 400, COLS[1], -1], [1700, 300, 560, COLS[3], -1]];
  for (const [x, w, h, c, d] of L) m += casa(x, 1392, w, h, c, R, { dir: d, doorAt: d > 0 ? .1 : .6 });
  m += poste(560, 1470, 560) + poste(1270, 1470, 540);
  m += fios([[560, 920 + 60], [1270, 940 + 60], [1900, 920]], 52, 3, 16) + fios([[-100, 940], [560, 930]], 40, 3, 16);
  // montes de lixo e entulho na calçada (mid)
  m += pile(210, 1500, .95, R, 5, 4, 1) + pile(1560, 1510, 1.0, R, 5, 3, 1) + pile(760, 1478, .56, R, 4, 2, 1) + pile(1080, 1484, .5, R, 3, 2, 1) + pile(650, 1482, .4, R, 3, 1, 0);
  m += sofa(1000, 1486, .3, '#7a8aa8', true) + colchao(420, 1474, .3, '#d9d4c0', true, -8);
  m += tireS(1210, 1492, 42, 54, 22) + tireS(940, 1500, 38, 48, 20);
  save(id + '_mid', midWrap(`<g filter="url(#warmF)">${m}</g>`, defs));
  let fg = fgPile(70, 1990, 2.1, R, 4, 3) + fgPile(1750, 1996, 2.3, R, 4, 3) + `<g filter="url(#fgb2)">${bag(1380, 1960, 1.7, 0, 8, false)}${bag(430, 1990, 1.9, 1, -10, false)}</g>`;
  fg += poste(30, 1960, 1960) + fios([[30, 330], [900, 410], [1800, 300]], 80, 3, 18);
  fg += `<g filter="url(#fgb)">${can(300, 1900, 2)}${bottle(1550, 1890, 2.2)}</g>`;
  save(id + '_fg', fgWrap(fg, defs));
}
// ================== 2. COZINHA ==================
function cozinha() {
  const id = 'cl_cozinha', R = rng(202);
  const defs = BASE + CASTD + lg('wallK', [[0, '#f2e6b8'], [1, '#e4d29a']]) + lg('azul', [[0, '#fafcff'], [1, '#d4e0ee']]) + lg('floorK', [[0, '#c9b9a0'], [1, '#8a7a64']]) + glow('lightW', '255,246,200') + lg('beam', [[0, '#fff2b8', .55], [1, '#fff2b8', 0]]) + lg('cab', [[0, '#d97a3a'], [1, '#a2501e']]);
  // far: paisagem da janela + parede de fundo
  let g = `<rect width="1800" height="1920" fill="url(#wallK)"/>`;
  g += `<rect x="1040" y="360" width="520" height="520" fill="#8ac8ec"/>` + cloud(1250, 520, .7) + morro(800, '#7f98a8', '#9fb4c4', R, 40, 120) + `<rect x="1040" y="780" width="520" height="100" fill="#6d7078"/>`;
  g += casa(1100, 830, 150, 160, COLS[0], R, { d: 30, muro: false }) + casa(1330, 830, 170, 200, COLS[2], R, { d: 30, muro: false });
  g += `<rect x="1040" y="360" width="520" height="520" fill="url(#sunG2)" opacity=".001"/>`;
  save(id + '_far', farWrap('#e4d29a', g, defs + glow('sunG2', '255,240,180'), 3, '#fff2d0', .14));
  let m = `<g filter="url(#rWall)"><path fill-rule="evenodd" d="M-50 0H1850V1390H-50Z M1060 380V860H1540V380Z" fill="url(#wallK)"/></g>`;
  // azulejo (meia parede)
  m += `<g><rect x="-50" y="1000" width="1900" height="390" fill="url(#azul)"/>`;
  for (let x = -50; x < 1900; x += 78) m += `<path d="M${x} 1000V1390" stroke="#9fb4cc" stroke-width="3"/>`; for (let y = 1000; y < 1400; y += 78) m += `<path d="M-50 ${y}H1850" stroke="#9fb4cc" stroke-width="3"/>`;
  for (let x = 0; x < 1850; x += 78 * 3) for (let y = 1000; y < 1390; y += 78 * 2) m += `<rect x="${x + 6}" y="${y + 6}" width="66" height="66" fill="#4a86c8" opacity=".45"/><circle cx="${x + 39}" cy="${y + 39}" r="14" fill="#fff" opacity=".7"/>`;
  m += `<rect x="-50" y="996" width="1900" height="14" fill="#2f5a8c" stroke="${OLC}" stroke-width="3"/></g>`;
  // janela com moldura, cortina e vista
  m += `<path d="M1040 360H1560V880H1040Z M1060 380V860H1540V380Z" fill-rule="evenodd" fill="#f4f0e4" stroke="${OLC}" stroke-width="5"/><path d="M1300 380V860M1060 620H1540" stroke="#f4f0e4" stroke-width="14"/><path d="M1300 380V860M1060 620H1540" stroke="${OLC}" stroke-width="3" fill="none"/><rect x="1030" y="880" width="540" height="22" fill="#d8d0bc" stroke="${OLC}" stroke-width="4"/>`;
  m += `<path d="M1040 360C1100 480 1100 700 1060 880H1040Z M1560 360C1500 480 1500 700 1540 880H1560Z" fill="#d86a5a" stroke="${OLC}" stroke-width="3"/><path d="M1056 380C1096 500 1090 700 1070 860" stroke="#fff" stroke-opacity=".35" stroke-width="4" fill="none"/>`;
  m += `<polygon points="1060,380 1300,380 1100,1420 700,1420" fill="url(#beam)" opacity=".5" style="mix-blend-mode:screen"/>`;
  // calendário na parede (x≈593, y 420-700)
  m += `<g><rect x="494" y="426" width="214" height="280" fill="#000" opacity=".25" filter="url(#b3)" transform="translate(8,10)"/><rect x="486" y="420" width="214" height="282" fill="#fdfdf8" stroke="${OLC}" stroke-width="4"/><rect x="486" y="420" width="214" height="70" fill="#fff"/><path d="M486 494H700" stroke="#c23a2a" stroke-width="5"/>`;
  for (let i = 0; i < 9; i++) m += `<rect x="${500 + i * 22}" y="408" width="8" height="26" rx="4" fill="#4a4e56" stroke="${OLC}" stroke-width="2"/>`;
  for (let r = 0; r < 5; r++) for (let q = 0; q < 7; q++) { const n = r * 7 + q + 1; if (n > 31) continue; m += `<text x="${503 + q * 28}" y="${524 + r * 36}" font-family="Arial,sans-serif" font-size="14" font-weight="700" fill="${q === 0 ? '#c23a2a' : '#5a5e66'}" opacity=".85">${n}</text>`; }
  m += `<path d="M486 702L700 702V690L486 698Z" fill="#000" opacity=".12"/><path d="M490 424V698" stroke="#fff" stroke-width="3" opacity=".7"/></g>`;
  // armário aéreo
  m += `<g>${cub(920, 760, 400, 200, 60, '#d9803a', { fil: 'rWall' })}<path d="M720 560V760M920 560V760M1120 560V760" stroke="${OLC}" stroke-width="3"/><rect x="896" y="680" width="10" height="46" rx="4" fill="#d4d8de" stroke="${OLC}" stroke-width="2.5"/><rect x="934" y="680" width="10" height="46" rx="4" fill="#d4d8de" stroke="${OLC}" stroke-width="2.5"/></g>`;
  // geladeira
  m += fridge(170, 1396, 1.62, '#d4dad4', true);
  m += `<g>${cub(1480, 960, 360, 18, 40, '#8a5a2c')}${[0, 1, 2, 3, 4].map(i => `<g transform="translate(${1350 + i * 60},948)"><rect x="-20" y="-60" width="40" height="60" rx="8" fill="${['#d23a2a', '#e8b84a', '#3b8a4a', '#f4f0e4', '#4a8ac0'][i]}" stroke="${OLC}" stroke-width="3"/><rect x="-22" y="-72" width="44" height="14" rx="4" fill="#cfd4dc" stroke="${OLC}" stroke-width="3"/><path d="M-12 -52V-10" stroke="#fff" stroke-opacity=".5" stroke-width="4"/></g>`).join('')}</g>`;
  m += `<g><circle cx="860" cy="260" r="62" fill="#f4f0e4" stroke="${OLC}" stroke-width="5"/><path d="M860 260V218M860 260L890 276" stroke="${OLC}" stroke-width="5" stroke-linecap="round"/><circle cx="860" cy="260" r="52" fill="none" stroke="#000" stroke-opacity=".15" stroke-width="3"/></g>`;
  // balcão + pia + fogão
  m += cub(940, 1392, 520, 360, 70, '#e7cfa0', { fil: 'rGr' }) + `<rect x="680" y="1030" width="520" height="30" fill="#c8c4bc" stroke="${OLC}" stroke-width="3"/><path d="M690 1034H1190" stroke="#fff" stroke-opacity=".7" stroke-width="3"/>`;
  m += `<path d="M740 1200V1380M940 1200V1380M1140 1200V1380" stroke="${OLC}" stroke-width="3"/><rect x="722" y="1070" width="206" height="124" fill="#d97a3a" stroke="${OLC}" stroke-width="3"/><rect x="954" y="1070" width="206" height="124" fill="#d97a3a" stroke="${OLC}" stroke-width="3"/>`;
  m += `<rect x="800" y="1000" width="170" height="34" rx="6" fill="url(#metal)" stroke="${OLC}" stroke-width="3"/><ellipse cx="885" cy="1010" rx="70" ry="8" fill="#3a3e46"/><path d="M1000 1030V980Q1000 960 1030 960H1060" stroke="url(#metal)" stroke-width="12" fill="none" stroke-linecap="round"/><path d="M1000 1030V980Q1000 960 1030 960" stroke="${OLC}" stroke-width="2" fill="none"/>`;
  m += cub(1380, 1392, 250, 350, 60, '#f1f0ea', { fil: 'rWall' }) + `<rect x="1285" y="1074" width="190" height="30" fill="#2a2d34" stroke="${OLC}" stroke-width="3"/>${[0, 1, 2, 3].map(i => `<circle cx="${1312 + i * 45}" cy="1084" r="9" fill="#8a909a" stroke="${OLC}" stroke-width="2"/>`).join('')}<rect x="1300" y="1150" width="160" height="150" fill="#16181d" stroke="${OLC}" stroke-width="3"/><rect x="1310" y="1160" width="140" height="130" fill="url(#glass)" opacity=".5"/>`;
  m += `<ellipse cx="1300" cy="1000" rx="46" ry="12" fill="#6a6e76"/><path d="M1254 1000V960H1346V1000Z" fill="url(#metal)" stroke="${OLC}" stroke-width="3"/><path d="M1260 960Q1300 940 1340 960" stroke="${OLC}" stroke-width="3" fill="none"/><rect x="1294" y="940" width="12" height="20" fill="#d23a2a"/>`;
  // piso (azulejo xadrez em perspectiva)
  m += `<g filter="url(#rConc)"><rect x="-50" y="1390" width="1900" height="570" fill="url(#floorK)"/></g>`;
  const vx = 900, vy = 1000, kk = y => (y - vy) / (1920 - vy);
  for (let xi = -2400; xi <= 4200; xi += 240) m += `<path d="M${f(vx + (xi - vx) * kk(1390))} 1390L${xi} 1920" stroke="#5a4a38" stroke-opacity=".5" stroke-width="3"/>`;
  for (const y of [1390, 1420, 1462, 1520, 1600, 1700, 1820]) m += `<path d="M-50 ${y}H1850" stroke="#5a4a38" stroke-opacity=".5" stroke-width="3"/>`;
  m += `<rect x="-50" y="1390" width="1900" height="22" fill="#000" opacity=".35" filter="url(#b8)"/><polygon points="1060,1420 1500,1420 1760,1920 1180,1920" fill="url(#beam)" opacity=".4" style="mix-blend-mode:screen"/>`;
  // lixo acumulado dentro de casa (cantos)
  m += pile(520, 1440, .62, R, 4, 2, 1) + pile(1620, 1520, .8, R, 4, 3, 1) + bag(380, 1440, .8, 0, 0) + bag(1500, 1460, .7, 1, 6);
  m += `<g><rect x="530" y="1404" width="120" height="20" fill="#000" opacity=".3" filter="url(#b3)"/></g>`;
  save(id + '_mid', midWrap(m, defs));
  let fg = fgPile(80, 1960, 1.9, R, 4, 3) + fgPile(1740, 1990, 2.1, R, 4, 3);
  fg += `<g filter="url(#fgb2)"><rect x="0" y="0" width="30" height="1920" fill="#000" opacity=".25"/></g><g filter="url(#fgb)">${box(380, 1960, 2.6, R)}${can(1450, 1930, 2.4)}</g>`;
  fg += `<path d="M1700 0V380" stroke="#2a2a30" stroke-width="4"/><g filter="url(#fgb)"><ellipse cx="1700" cy="430" rx="60" ry="22" fill="#fff6c8"/><path d="M1640 430Q1700 360 1760 430Z" fill="#d8d0bc" stroke="${OLC}" stroke-width="4"/></g>`;
  save(id + '_fg', fgWrap(fg, defs));
}
// ================== 3. CASTELO MÉDIO (tarde) ==================
function casteloMedio() {
  const id = 'cl_castelo_medio', R = rng(303);
  const defs = BASE + ASF + CASTD + ceu('skyT', [[0, '#5ea8e4'], [.5, '#b4daf2'], [1, '#ffe6b0']]) + glow('sunT', '255,220,150') + WARM;
  let g = `<rect width="1800" height="1920" fill="url(#skyT)"/><circle cx="1500" cy="620" r="440" fill="url(#sunT)"/>`;
  g += cloud(300, 300, 1.7) + cloud(1100, 180, 1.1) + cloud(1560, 380, 1.3, '#fff', '#f0dcc8') + cloud(620, 520, .8);
  g += morro(1180, '#7f98a8', '#9fb4c4', R, 50, 160) + morro(1290, '#8d93a0', '#b4b8c4', R, 20, 80);
  g += `<rect x="-50" y="1380" width="1900" height="600" fill="#6d7078"/>`;
  g += pile(240, 1380, .3, R, 5, 2, 0) + pile(1560, 1382, .3, R, 5, 2, 0);
  save(id + '_far', farWrap('#6d7078', g, defs, 3.5, '#e8f0f8', .2));
  let m = chaoRua(1392) + castelo(900, 1392, .95, R);
  // casas pequenas em volta (escala)
  const small = [[-40, 220, 190, 2, 1], [150, 190, 150, 0, 1], [1480, 210, 170, 1, -1], [1690, 200, 200, 3, -1], [1300, 160, 130, 4, -1]];
  for (const [x, w, h, c, d] of small) m += casa(x, 1392, w, h, COLS[c], R, { dir: d, d: 40, muro: false });
  m += poste(430, 1470, 440) + poste(1370, 1470, 430) + fios([[430, 1090], [1370, 1100], [1900, 1080]], 40, 3, 14) + fios([[-100, 1070], [430, 1090]], 36, 3, 14);
  m += pile(200, 1500, .85, R, 5, 3, 1) + pile(1560, 1510, .9, R, 5, 3, 1) + pile(620, 1480, .5, R, 4, 2, 1) + pile(1230, 1484, .46, R, 4, 2, 1) + fridge(1000, 1490, .34, '#d8d2c0', true, -4) + tireS(760, 1500, 40, 50, 20);
  save(id + '_mid', midWrap(`<g filter="url(#warmF)">${m}</g>`, defs));
  let fg = fgPile(60, 1990, 2.2, R, 4, 3) + fgPile(1760, 1996, 2.3, R, 4, 3) + `<g filter="url(#fgb2)">${bag(1360, 1980, 1.8, 0, 8, false)}${bag(440, 1990, 1.7, 2, -8, false)}</g>` + poste(1790, 1990, 1990);
  fg += fios([[1790, 280], [900, 380], [-60, 300]], 90, 3, 18);
  save(id + '_fg', fgWrap(fg, defs));
}
// ================== 4. PREFEITURA (pôr do sol) ==================
function prefeitura() {
  const id = 'cl_castelo_prefeitura', R = rng(404);
  const defs = BASE + ASF + CASTD + ceu('skyP', [[0, '#5a3a8c'], [.35, '#d8587a'], [.7, '#ff9a4a'], [1, '#ffd88a']]) + glow('sunP', '255,200,110') + SUNSET
    + lg('marm', [[0, '#f4ecd8'], [.5, '#fffaf0'], [1, '#c8bca0']], 1, 0);
  let g = `<rect width="1800" height="1920" fill="url(#skyP)"/><circle cx="260" cy="1120" r="560" fill="url(#sunP)"/><circle cx="260" cy="1130" r="120" fill="#fff0b8"/>`;
  g += cloud(1000, 420, 1.8, '#ffb48a', '#c8587a') + cloud(300, 640, 1.2, '#ffd2a0', '#d8687a') + cloud(1600, 760, 1.2, '#ffc8a0', '#c8587a') + cloud(700, 200, 1, '#f0a0a0', '#8a4a8c');
  g += morro(1230, '#6a4a7a', '#8a5a8a', R, 60, 180) + morro(1320, '#5a3a5a', '#7a4a6a', R, 20, 90) + `<rect x="-50" y="1370" width="1900" height="600" fill="#4a3a48"/>`;
  g += pile(1500, 1372, .3, R, 5, 2, 0) + pile(200, 1372, .26, R, 5, 2, 0);
  save(id + '_far', farWrap('#4a3a48', g, defs, 3.5, '#ff9a70', .2));
  let m = chaoRua(1392, { asf: '#5a4a58', calc: '#d8bca4' });
  // prédio da prefeitura (lado direito), 3/4
  const bx = 760, bw = 920, bh = 560, d = 120;
  m += `<polygon points="${bx},1392 ${bx + bw + d},1380 ${bx + bw + d + 520},1410 ${bx + 300},1412" fill="#000" opacity=".3" filter="url(#b20)"/>`;
  m += cub(bx + bw / 2, 1392, bw, bh, d, '#e8d4b0', { fil: 'rWall' });
  // frontão
  m += `<polygon points="${bx - 30},${1392 - bh} ${bx + bw + 30},${1392 - bh} ${bx + bw / 2},${1392 - bh - 170}" fill="#f0e2c4" stroke="${OLC}" stroke-width="5" stroke-linejoin="round"/><polygon points="${bx + 40},${1392 - bh - 8} ${bx + bw - 40},${1392 - bh - 8} ${bx + bw / 2},${1392 - bh - 128}" fill="#d8c4a0" stroke="${OLC}" stroke-width="3"/><circle cx="${bx + bw / 2}" cy="${1392 - bh - 52}" r="26" fill="#fffaf0" stroke="${OLC}" stroke-width="4"/><path d="M${bx + bw / 2} ${1392 - bh - 52}V${1392 - bh - 68}M${bx + bw / 2} ${1392 - bh - 52}H${bx + bw / 2 + 12}" stroke="${OLC}" stroke-width="3"/>`;
  m += `<rect x="${bx - 30}" y="${1392 - bh}" width="${bw + 60}" height="46" fill="#f4e8d0" stroke="${OLC}" stroke-width="4"/><rect x="${bx + bw / 2 - 250}" y="${1392 - bh + 6}" width="500" height="34" fill="#1f3a6a"/><text x="${bx + bw / 2}" y="${1392 - bh + 36}" font-family="Anton,Impact,sans-serif" font-size="34" text-anchor="middle" fill="#f2e6b8" letter-spacing="8">PREFEITURA</text>`;
  // janelas, porta, colunas
  for (const wx of [bx + 40, bx + 190, bx + 640, bx + 790]) m += `<rect x="${wx}" y="${1392 - bh + 100}" width="80" height="180" fill="#2a3a58" stroke="${OLC}" stroke-width="4"/><rect x="${wx + 6}" y="${1392 - bh + 106}" width="68" height="168" fill="#ffb868" opacity=".8"/><path d="M${wx + 40} ${1392 - bh + 106}V${1392 - bh + 274}M${wx + 6} ${1392 - bh + 190}H${wx + 74}" stroke="${OLC}" stroke-width="3"/><rect x="${wx - 8}" y="${1392 - bh + 280}" width="96" height="12" fill="#c8bca0" stroke="${OLC}" stroke-width="3"/>`;
  m += `<path d="M${bx + bw / 2 - 70} 1392V${1392 - 250}Q${bx + bw / 2} ${1392 - 320} ${bx + bw / 2 + 70} ${1392 - 250}V1392Z" fill="#3a2418" stroke="${OLC}" stroke-width="5"/><path d="M${bx + bw / 2} ${1392 - 300}V1392" stroke="${OLC}" stroke-width="3"/>`;
  for (const cx2 of [bx + 40, bx + 330, bx + 590, bx + 880]) m += `<g><rect x="${cx2 - 22}" y="${1392 - bh + 46}" width="44" height="${bh - 80}" fill="url(#marm)" stroke="${OLC}" stroke-width="3.5"/><rect x="${cx2 - 30}" y="${1392 - bh + 46}" width="60" height="16" fill="#f4ecd8" stroke="${OLC}" stroke-width="3"/><rect x="${cx2 - 30}" y="1372" width="60" height="22" fill="#c8bca0" stroke="${OLC}" stroke-width="3"/><path d="M${cx2 - 10} ${1392 - bh + 66}V1366" stroke="#000" stroke-opacity=".18" stroke-width="3"/></g>`;
  m += `<rect x="${bx - 40}" y="1392" width="${bw + 80}" height="22" fill="#d8c8a8" stroke="${OLC}" stroke-width="4"/><rect x="${bx - 70}" y="1414" width="${bw + 140}" height="22" fill="#c8b890" stroke="${OLC}" stroke-width="4"/>`;
  m += `<rect x="${bx + bw / 2 - 4}" y="${1392 - bh - 300}" width="6" height="160" fill="#cfd4dc"/><path d="M${bx + bw / 2 + 2} ${1392 - bh - 296}C${bx + bw / 2 + 40} ${1392 - bh - 316} ${bx + bw / 2 + 70} ${1392 - bh - 280} ${bx + bw / 2 + 110} ${1392 - bh - 298}V${1392 - bh - 240}C${bx + bw / 2 + 70} ${1392 - bh - 224} ${bx + bw / 2 + 40} ${1392 - bh - 258} ${bx + bw / 2 + 2} ${1392 - bh - 240}Z" fill="#3aa05a" stroke="${OLC}" stroke-width="3"/>`;
  // castelo gigante encostado/desabando sobre o prédio, à esquerda-atrás, inclinado
  const cg = castelo(660, 1396, 1.18, R, { tilt: 9 });
  m = m.replace(/$/, '');
  const prefAvalanche = pile(bx + 110, 822, 1.0, R, 4, 2, 1) + pile(bx + 780, 822, .95, R, 4, 2, 1) + pile(bx + 470, 664, .6, R, 3, 2, 0) + pile(bx + 90, 1404, 1.0, R, 5, 4, 1) + pile(bx + 790, 1410, .95, R, 5, 3, 1) + fusca(bx + 640, 822, .42, '#d86a5a', false) + sofa(bx + 250, 812, .3, '#7a8aa8', false);
  m = `<g>${cg}</g>` + m + prefAvalanche;
  m += poste(540, 1470, 520) + pile(160, 1500, .85, R, 5, 3, 1) + pile(1740, 1514, .9, R, 4, 3, 1) + pile(400, 1492, .4, R, 3, 1, 0) + tireS(1000, 1498, 40, 50, 20) + bag(690, 1484, .6, 0, 8) + bag(1340, 1494, .55, 1, -6);
  m += fios([[540, 960], [1900, 940]], 50, 3, 14);
  save(id + '_mid', midWrap(`<g filter="url(#sunF)">${m}</g>`, defs));
  let fg = fgPile(60, 1990, 2.2, R, 4, 3) + fgPile(1760, 1996, 2.3, R, 4, 3) + `<g filter="url(#fgb2)">${bag(1340, 1990, 1.7, 0, 8, false)}${bag(450, 1992, 1.8, 1, -8, false)}</g>`;
  fg += `<g filter="url(#sunF)" opacity=".001"></g>`;
  save(id + '_fg', fgWrap(`<g filter="url(#sunF)">${fg}</g>`, defs));
}
// ================== 5. PRAÇA TURISTAS ==================
function praca() {
  const id = 'cl_praca_turistas', R = rng(505);
  const defs = BASE + ASF + CASTD + ceu('skyT2', [[0, '#5ea8e4'], [.5, '#b4daf2'], [1, '#ffe6b0']]) + glow('sunT2', '255,220,150') + WARM + lg('grass', [[0, '#7cc060'], [1, '#3e8a3a']]) + lg('brick', [[0, '#d8a07a'], [1, '#a8684a']]);
  let g = `<rect width="1800" height="1920" fill="url(#skyT2)"/><circle cx="260" cy="560" r="440" fill="url(#sunT2)"/>`;
  g += cloud(800, 260, 1.4) + cloud(1500, 480, 1.2) + cloud(200, 380, .9);
  g += morro(1150, '#7f98a8', '#9fb4c4', R, 40, 150);
  g += `<rect x="-50" y="1290" width="1900" height="700" fill="url(#grass)"/>`;
  for (const x of [120, 420, 1380, 1700]) g += arvore(x, 1320, .7, R, '#58a850', '#2a7040');
  save(id + '_far', farWrap('#3e8a3a', g, defs, 3, '#e8f0f8', .22));
  let m = `<g filter="url(#rGr)"><rect x="-50" y="1360" width="1900" height="600" fill="url(#grass)"/></g>`;
  // calçada de pedra portuguesa em curva
  m += `<path d="M-50 1500Q500 1420 900 1440T1850 1500V1620Q1300 1560 900 1580T-50 1620Z" fill="url(#brick)" stroke="${OLC}" stroke-width="3"/>`;
  for (let i = 0; i < 160; i++) { const x = R() * 1800, y = 1470 + R() * 130; m += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(8 + R() * 8)}" ry="${f(3 + R() * 3)}" fill="${R() < .5 ? '#f2d6b8' : '#7a4a30'}" opacity=".18"/>`; }
  m += `<path d="M-50 1640Q500 1560 900 1580T1850 1640V1920H-50Z" fill="#c8b890" opacity=".35"/><rect x="-50" y="1680" width="1900" height="240" fill="url(#grass)"/>`;
  m += `<g filter="url(#rGr)"><rect x="-50" y="1700" width="1900" height="260" fill="#4a9a40" opacity=".5"/></g>`;
  for (const x of [230, 1460]) m += arvore(x, 1470, 1.05, R, '#5ab04a', '#2a7040');
  m += `<g transform="translate(900,1390) scale(1)"></g>`;
  // castelo aparece também no mid, pequeno, atrás dos bancos
  m += castelo(900, 1420, .84, R);
  // bancos
  const banco = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})">${shadow(30, 4, 150, 14)}<rect x="-110" y="-70" width="10" height="70" fill="#2a2e36" stroke="${OLC}" stroke-width="2"/><rect x="100" y="-70" width="10" height="70" fill="#2a2e36" stroke="${OLC}" stroke-width="2"/>${cub(0, -50, 230, 18, 30, '#9a6a34')}${cub(0, -90, 230, 16, 22, '#9a6a34')}${cub(0, -50, 230, 18, 30, '#9a6a34')}</g>`;
  m += banco(560, 1520, 1) + banco(1280, 1530, 1);
  // placa turística marrom
  m += `<g transform="translate(1060,1500)"><ellipse cx="14" cy="4" rx="70" ry="10" fill="#000" opacity=".35" filter="url(#b3)"/><rect x="-6" y="-300" width="14" height="300" fill="url(#metal)" stroke="${OLC}" stroke-width="3"/><rect x="-190" y="-380" width="380" height="140" rx="12" fill="#7a4a24" stroke="#fff" stroke-width="5"/><rect x="-178" y="-368" width="356" height="116" rx="8" fill="none" stroke="#f8f0e0" stroke-width="3"/><text x="0" y="-322" font-family="Anton,Impact,sans-serif" font-size="46" text-anchor="middle" fill="#fff" letter-spacing="3">PONTO TURÍSTICO</text><text x="0" y="-278" font-family="Arial,sans-serif" font-size="30" font-weight="800" text-anchor="middle" fill="#f8f0e0">CASTELO DE LIXO</text></g>`;
  // faixa entre dois postes
  m += poste(300, 1470, 480, false) + `<path d="M170 1060Q500 1130 830 1060" stroke="#17171c" stroke-width="3" fill="none"/>`;
  m += `<g><path d="M200 1070Q500 1150 800 1070L800 1150Q500 1230 200 1150Z" fill="#f2e24a" stroke="${OLC}" stroke-width="4"/><text x="500" y="1150" font-family="Anton,Impact,sans-serif" font-size="42" text-anchor="middle" fill="#2a2a30" transform="rotate(0)">VISITE O CASTELO</text></g>`;
  m += pile(120, 1730, .9, R, 4, 2, 1) + pile(1700, 1700, .8, R, 4, 2, 1);
  save(id + '_mid', midWrap(`<g filter="url(#warmF)">${m}</g>`, defs));
  let fg = fgPile(40, 1990, 2.0, R, 4, 3) + fgPile(1780, 1996, 2.1, R, 4, 3) + arvore(1700, 1990, 2.4, R, '#4a9a40', '#1f5a34').replace('<g ', '<g filter="url(#fgb2)" ');
  save(id + '_fg', fgWrap(fg, defs));
}
// ================== 6. BOTECO ==================
function boteco() {
  const id = 'cl_boteco', R = rng(606);
  const defs = BASE + CASTD + lg('wallB', [[0, '#e0a24a'], [1, '#b8742a']]) + lg('wallB2', [[0, '#8a3a2a'], [1, '#5a2418']]) + lg('floorB', [[0, '#a8a090'], [1, '#6a6458']]) + glow('lamp', '255,220,140') + glow('ledG', '255,150,90') + lg('night', [[0, '#0a1030'], [1, '#2a3a6a']]) + lg('screen', [[0, '#4ac06a'], [1, '#1f7a3a']]);
  let g = `<rect width="1800" height="1920" fill="url(#wallB)"/><rect x="-50" y="1000" width="1900" height="420" fill="url(#wallB2)"/>`;
  g += `<rect x="1260" y="520" width="440" height="900" fill="url(#night)"/>` + morro(1100, '#1a2040', '#3a3a6a', R, 40, 140);
  for (let i = 0; i < 40; i++) g += `<circle cx="${f(1280 + R() * 400)}" cy="${f(540 + R() * 300)}" r="${f(1 + R() * 2)}" fill="#fff" opacity=".7"/>`;
  g += `<circle cx="1360" cy="660" r="30" fill="#f4f0d0"/>`;
  g += castelo(1500, 1400, .46, R, { night: true });
  save(id + '_far', farWrap('#b8742a', g, defs, 3, '#ffb868', .12));
  let m = `<g filter="url(#rWall)"><path fill-rule="evenodd" d="M-50 0H1850V1000H-50Z M1250 510H1710V1000H1250Z" fill="url(#wallB)"/></g><g filter="url(#rWall)"><path fill-rule="evenodd" d="M-50 1000H1850V1400H-50Z M1250 1000H1710V1400H1250Z" fill="url(#wallB2)"/></g><rect x="-50" y="996" width="1900" height="14" fill="#3a1a10" stroke="${OLC}" stroke-width="3"/>`;
  // porta aberta p/ rua (moldura) à direita
  m += `<path d="M1220 480H1740V1400H1220Z M1250 510V1400H1710V510Z" fill-rule="evenodd" fill="#3a2a1c" stroke="${OLC}" stroke-width="5"/><path d="M1250 510L1330 500V1400H1250Z" fill="#6a4a2a" stroke="${OLC}" stroke-width="3"/>`;
  m += `<rect x="1250" y="1340" width="460" height="60" fill="#5a5a60" opacity=".35"/>`;
  // prateleira de garrafas
  m += `<g>${cub(500, 800, 760, 24, 40, '#7a4a24')}${cub(500, 600, 760, 24, 40, '#7a4a24')}`;
  const bc = ['#3b8a4a', '#8a5a2a', '#d8c8a0', '#c23a2a', '#4a8ac0', '#e0a830'];
  for (const yy of [600, 800]) for (let i = 0; i < 20; i++) m += bottle(130 + i * 38, yy - 24, 1, bc[Math.floor(R() * bc.length)]);
  m += `<rect x="130" y="578" width="740" height="8" fill="#ff9a60" opacity=".8" filter="url(#b3)"/></g>`;
  // TV na parede
  m += `<g><rect x="860" y="330" width="320" height="200" fill="#0e0f14" stroke="${OLC}" stroke-width="5" rx="8"/><rect x="876" y="344" width="288" height="168" fill="url(#screen)"/><path d="M876 428H1164M1020 344V512" stroke="#fff" stroke-opacity=".7" stroke-width="3"/><circle cx="1020" cy="428" r="30" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3"/><path d="M876 344L980 344L900 512L876 512Z" fill="#fff" opacity=".12"/><circle cx="1000" cy="440" r="9" fill="#f8f8f8" stroke="${OLC}" stroke-width="1.5"/><path d="M1000 540V580" stroke="#2a2d34" stroke-width="10"/></g>`;
  m += `<rect x="120" y="360" width="300" height="130" rx="10" fill="#c23a2a" stroke="#fff" stroke-width="5"/><text x="270" y="438" font-family="Anton,Impact,sans-serif" font-size="56" text-anchor="middle" fill="#fff" letter-spacing="3">BOTECO</text><text x="270" y="474" font-family="Arial,sans-serif" font-size="24" font-weight="800" text-anchor="middle" fill="#ffe9a0">CERVEJA GELADA</text>`;
  // pendentes de luz
  for (const [x, y] of [[620, 230], [1000, 190]]) m += `<circle cx="${x}" cy="${y + 40}" r="150" fill="url(#lamp)" opacity=".6" style="mix-blend-mode:screen"/><path d="M${x} 0V${y}" stroke="#2a2a30" stroke-width="4"/><path d="M${x - 30} ${y + 24}Q${x} ${y - 20} ${x + 30} ${y + 24}Z" fill="#d8d0bc" stroke="${OLC}" stroke-width="3"/><circle cx="${x}" cy="${y + 28}" r="12" fill="#fff8d0"/>`;
  // balcão
  m += cub(520, 1400, 900, 270, 70, '#7a4a24', { fil: 'rWall' }) + `<rect x="60" y="1100" width="970" height="30" fill="#c8c4bc" stroke="${OLC}" stroke-width="3"/><rect x="60" y="1100" width="970" height="6" fill="#fff" opacity=".7"/>`;
  m += `<path d="M130 1140V1396M330 1140V1396M530 1140V1396M730 1140V1396M930 1140V1396" stroke="${OLC}" stroke-width="3" opacity=".6"/>`;
  m += bottle(160, 1100, 1.2, '#c23a2a') + bottle(200, 1100, 1.2, '#8a5a2a') + can(900, 1100, 1.4, '#c23a2a');
  m += `<g><rect x="400" y="1010" width="170" height="90" rx="10" fill="#f4f0e4" stroke="${OLC}" stroke-width="4"/><rect x="412" y="1020" width="146" height="42" fill="#e8d8a8"/><ellipse cx="485" cy="1030" rx="40" ry="8" fill="#e8b84a"/></g>`;
  // banquetas
  for (const x of [200, 420, 640, 860]) m += `<g><ellipse cx="${x}" cy="1445" rx="40" ry="8" fill="#000" opacity=".4" filter="url(#b3)"/><path d="M${x - 6} 1400V1440M${x + 6} 1400V1440M${x - 26} 1440L${x - 6} 1400M${x + 26} 1440L${x + 6} 1400" stroke="#2a2e36" stroke-width="6"/><ellipse cx="${x}" cy="1392" rx="40" ry="14" fill="#a2322a" stroke="${OLC}" stroke-width="3"/><path d="M${x - 40} 1392V1404Q${x} 1424 ${x + 40} 1404V1392" fill="#7a2220" stroke="${OLC}" stroke-width="3"/></g>`;
  // piso
  m += `<g filter="url(#rConc)"><rect x="-50" y="1400" width="1900" height="560" fill="url(#floorB)"/></g>`;
  const vx = 900, vy = 1000, kk = y => (y - vy) / (1920 - vy);
  for (let xi = -2400; xi <= 4200; xi += 260) m += `<path d="M${f(vx + (xi - vx) * kk(1400))} 1400L${xi} 1920" stroke="#3a362c" stroke-opacity=".45" stroke-width="3"/>`;
  for (const y of [1400, 1440, 1500, 1580, 1690, 1820]) m += `<path d="M-50 ${y}H1850" stroke="#3a362c" stroke-opacity=".45" stroke-width="3"/>`;
  m += `<rect x="-50" y="1400" width="1900" height="26" fill="#000" opacity=".35" filter="url(#b8)"/>`;
  m += `<ellipse cx="620" cy="1700" rx="500" ry="140" fill="url(#lamp)" opacity=".28" style="mix-blend-mode:screen"/>`;
  // mesas e cadeiras de plástico
  const mesa = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})">${shadow(20, 4, 130, 14)}<path d="M-60 -10L-50 -120M60 -10L50 -120M-50 -120H50" stroke="#e8e8ea" stroke-width="12" stroke-linecap="round"/><ellipse cx="0" cy="-130" rx="110" ry="30" fill="#f4f4f0" stroke="${OLC}" stroke-width="4"/><ellipse cx="-16" cy="-134" rx="70" ry="16" fill="#fff" opacity=".6"/><path d="M-100 -124Q0 -96 100 -124" stroke="${OLC}" stroke-width="3" fill="none" opacity=".4"/>${bottle(30, -138, .7, '#8a5a2a')}${can(-40, -134, .8, '#c23a2a')}</g>`;
  const cadeira = (x, y, s, c) => `<g transform="translate(${x},${y}) scale(${s})">${shadow(10, 4, 70, 10)}<path d="M-32 -6L-28 -70M32 -6L28 -70" stroke="${c}" stroke-width="9" stroke-linecap="round"/><path d="M-40 -70H40L34 -90H-34Z" fill="${c}" stroke="${OLC}" stroke-width="3.5"/><path d="M-34 -90L-38 -170H38L34 -90Z" fill="${c}" stroke="${OLC}" stroke-width="3.5"/><path d="M-26 -112H26M-28 -140H28" stroke="#000" stroke-opacity=".3" stroke-width="4"/><path d="M-32 -164L-34 -96" stroke="#fff" stroke-opacity=".5" stroke-width="4"/></g>`;
  m += mesa(1100, 1560, 1) + cadeira(960, 1566, 1, '#c23a2a') + cadeira(1250, 1570, 1, '#c23a2a');
  m += pile(1700, 1520, .7, R, 3, 2, 1) + bag(1560, 1480, .7, 0, 0);
  save(id + '_mid', midWrap(`<g filter="url(#warmF)">${m}</g>`, defs + WARM));
  let fg = `<g filter="url(#fgb)">${mesa(110, 1990, 1.9)}${cadeira(1700, 1995, 2.1, '#3a8ae8')}</g>`;
  fg += `<path d="M0 90Q450 190 900 120T1800 100" stroke="#17171c" stroke-width="4" fill="none"/>`;
  for (let i = 0; i < 14; i++) { const x = 40 + i * 128, y = 100 + Math.sin(i * .7) * 40 + 28; fg += `<circle cx="${x}" cy="${y + 16}" r="40" fill="${['#ffd23a', '#ff4a4a', '#4af08a', '#4ab8ff'][i % 4]}" opacity=".3"/><circle cx="${x}" cy="${y + 12}" r="11" fill="${['#ffd23a', '#ff4a4a', '#4af08a', '#4ab8ff'][i % 4]}" stroke="${OLC}" stroke-width="2.5"/>`; }
  save(id + '_fg', fgWrap(fg, defs + WARM));
}
// ================== 7. CASTELO À NOITE ==================
function noite() {
  const id = 'cl_castelo_noite', R = rng(707);
  const defs = BASE + ASF + CASTD + ceu('skyN', [[0, '#050a22'], [.55, '#13245a'], [1, '#3a4e8c']]) + glow('moonG', '200,225,255') + NIGHT + lg('cone', [[0, '#ffe8a8', .55], [1, '#ffe8a8', 0]]);
  let g = `<rect width="1800" height="1920" fill="url(#skyN)"/><circle cx="1400" cy="440" r="440" fill="url(#moonG)" opacity=".7"/><circle cx="1400" cy="440" r="84" fill="#f4f4e0"/><circle cx="1374" cy="418" r="14" fill="#d8d8c0"/><circle cx="1424" cy="470" r="20" fill="#d8d8c0"/><circle cx="1432" cy="408" r="9" fill="#d8d8c0"/>`;
  for (let i = 0; i < 160; i++) g += `<circle cx="${f(R() * 1800)}" cy="${f(R() * 1000)}" r="${f(.8 + R() * 2.4)}" fill="#fff" opacity="${f(.35 + R() * .6)}"/>`;
  g += cloud(500, 300, 1.4, '#2a3a78', '#141c46') + cloud(1100, 700, 1.3, '#3a4a88', '#1a2250');
  g += morro(1180, '#1a2450', '#3a4a7a', R, 50, 160);
  for (let i = 0; i < 90; i++) g += `<rect x="${f(R() * 1800)}" y="${f(1030 + R() * 160)}" width="7" height="9" fill="#ffc863" opacity=".85"/>`;
  g += morro(1290, '#141b3c', '#2a3a6a', R, 20, 80) + `<rect x="-50" y="1380" width="1900" height="600" fill="#1c2240"/>`;
  g += pile(240, 1382, .3, R, 5, 2, 0) + pile(1560, 1384, .3, R, 5, 2, 0);
  save(id + '_far', farWrap('#1c2240', g, defs, 3.5, '#3a5aa8', .2));
  const LC = []; let m = chaoRua(1392) + castelo(900, 1392, .95, R, { night: true, lights: LC });
  const small = [[-40, 220, 190, 2, 1], [150, 190, 150, 0, 1], [1480, 210, 170, 1, -1], [1690, 200, 200, 3, -1], [1300, 160, 130, 4, -1]];
  for (const [x, w, h, c, d] of small) m += casa(x, 1392, w, h, COLS[c], R, { dir: d, d: 40, muro: false, night: false });
  m += poste(430, 1470, 440) + poste(1370, 1470, 430) + fios([[430, 1090], [1370, 1100], [1900, 1080]], 40, 3, 14) + fios([[-100, 1070], [430, 1090]], 36, 3, 14);
  m += pile(200, 1500, .85, R, 5, 3, 1) + pile(1560, 1510, .9, R, 5, 3, 1) + pile(620, 1480, .5, R, 4, 2, 1) + pile(1230, 1484, .46, R, 4, 2, 1) + fridge(1000, 1490, .34, '#d8d2c0', true, -4);
  // rebrilho de lua e luzes de janela depois do filtro de noite
  let lights = '';
  for (const [x, w, h, d] of [[-40, 220, 190, 1], [150, 190, 150, 1], [1480, 210, 170, -1], [1690, 200, 200, -1], [1300, 160, 130, -1]]) { const wx = x + w * .46, wy = 1392 - h * .66; lights += `<circle cx="${f(wx + 20)}" cy="${f(wy + 20)}" r="70" fill="url(#lampG)" opacity=".55"/><rect x="${f(wx)}" y="${f(wy)}" width="${f(w * .22)}" height="${f(Math.min(h * .3, 72))}" fill="#ffc863" stroke="${OLC}" stroke-width="2.5"/>`; }
  for (const x of [430, 1370]) lights += `<polygon points="${x - 40},${1470 - 440 + 80} ${x + 40},${1470 - 440 + 80} ${x + 200},1560 ${x - 200},1560" fill="url(#cone)" style="mix-blend-mode:screen"/><circle cx="${x}" cy="${1470 - 440 + 70}" r="90" fill="url(#lampG)" opacity=".7"/><circle cx="${x}" cy="${1470 - 440 + 60}" r="12" fill="#fff8d0"/>`;
  lights += `<ellipse cx="900" cy="1500" rx="520" ry="50" fill="#6a88d8" opacity=".12" style="mix-blend-mode:screen"/>`;
  save(id + '_mid', midWrap(`<g filter="url(#nightF)">${m}</g>${LC.join('')}${lights}`, defs));
  let fg = fgPile(60, 1990, 2.2, R, 4, 3) + fgPile(1760, 1996, 2.3, R, 4, 3) + `<g filter="url(#fgb2)">${bag(1360, 1980, 1.8, 0, 8, false)}${bag(440, 1990, 1.7, 2, -8, false)}</g>` + poste(1790, 1990, 1990) + fios([[1790, 280], [900, 380], [-60, 300]], 90, 3, 18);
  save(id + '_fg', fgWrap(`<g filter="url(#nightF)">${fg}</g>`, defs));
}
// ================== 8. LADEIRA ==================
function ladeira() {
  const id = 'cl_ladeira', R = rng(808);
  const defs = BASE + ASF + CASTD + ceu('skyL', [[0, '#5ea8e4'], [.5, '#b4daf2'], [1, '#ffe6b0']]) + glow('sunL', '255,220,150') + WARM + lg('slope', [[0, '#8a7a5a'], [1, '#5a4a38']]);
  let g = `<rect width="1800" height="1920" fill="url(#skyL)"/><circle cx="330" cy="620" r="440" fill="url(#sunL)"/>`;
  g += cloud(900, 260, 1.5) + cloud(1500, 420, 1.1) + cloud(260, 380, 1);
  g += morro(1000, '#7f98a8', '#9fb4c4', R, 80, 220);
  g += castelo(1370, 1020, .52, R);
  g += morro(1180, '#8a8f9c', '#b0b4be', R, 30, 90) + `<rect x="-50" y="1330" width="1900" height="600" fill="#6d7078"/>`;
  save(id + '_far', farWrap('#6d7078', g, defs, 3.5, '#e8f0f8', .22));
  // ladeira: rua sobe da esquerda-baixo para a direita-cima
  let m = `<g filter="url(#rGr)"><polygon points="-50,1280 1900,780 1900,1960 -50,1960" fill="url(#slope)"/></g>`;
  // casas em degraus subindo (esquerda) e do outro lado (direita-baixo)
  const stairs = [[40, 1380, 300, 280, 0], [380, 1290, 250, 230, 1], [660, 1210, 220, 200, 2], [900, 1140, 190, 170, 3], [1120, 1080, 170, 150, 4], [1300, 1030, 150, 130, 5], [1480, 972, 140, 120, 6], [1650, 925, 150, 130, 7]];
  for (const [x, by, w, h, c] of stairs.reverse()) m += casa(x, by - 10, w, h, COLS[c], R, { d: 40, muro: false });
  // pista inclinada
  m += `<polygon points="-50,1480 1900,860 1900,1000 -50,1640" fill="#9a9488"/><polygon points="-50,1640 1900,1000 1900,1960 -50,1960" fill="#52565f"/><g filter="url(#rAsph)"><polygon points="-50,1640 1900,1000 1900,1960 -50,1960" fill="#52565f"/></g><polygon points="-50,1640 1900,1000 1900,1960 -50,1960" fill="url(#asfG)"/>`;
  m += `<polygon points="-50,1624 1900,984 1900,1004 -50,1644" fill="#efe9d8" stroke="${OLC}" stroke-width="3"/><polygon points="-50,1644 1900,1004 1900,1018 -50,1660" fill="#8a8272"/>`;
  for (let i = 0; i < 9; i++) { const t = i / 9, x = -50 + t * 1950, y = 1760 - t * 640; m += `<polygon points="${f(x)},${f(y)} ${f(x + 120)},${f(y - 38)} ${f(x + 134)},${f(y - 30)} ${f(x + 10)},${f(y + 8)}" fill="#f2d24a" opacity=".85"/>`; }
  // degraus laterais / escadaria da ladeira
  for (let i = 0; i < 9; i++) m += `<polygon points="${100 + i * 90},${1420 - i * 50} ${190 + i * 90},${1390 - i * 50} ${190 + i * 90},${1410 - i * 50} ${100 + i * 90},${1440 - i * 50}" fill="#cfc8b6" stroke="${OLC}" stroke-width="2" opacity=".001"/>`;
  m += poste(1110, 1660, 520) + poste(430, 1560, 480) + fios([[430, 1160], [1110, 1180], [1900, 1000]], 44, 3, 14);
  m += pile(1500, 1660, .7, R, 5, 3, 1) + pile(260, 1560, .6, R, 4, 2, 1) + pile(800, 1640, .46, R, 4, 2, 1) + pile(1250, 1630, .4, R, 3, 2, 1) + fusca(1650, 1600, .3, '#6fa8c4', true) + pile(560, 1650, .36, R, 3, 1, 0);
  save(id + '_mid', midWrap(`<g filter="url(#warmF)">${m}</g>`, defs));
  let fg = fgPile(60, 1990, 2.2, R, 4, 3) + fgPile(1760, 1996, 2.3, R, 4, 3) + `<g filter="url(#fgb2)">${bag(1340, 1990, 1.7, 0, 8, false)}${bag(460, 1992, 1.8, 1, -8, false)}</g>` + poste(40, 1990, 1990) + fios([[40, 360], [900, 440], [1860, 300]], 80, 3, 18);
  save(id + '_fg', fgWrap(fg, defs));
}
// ================== 9. CORTE DO CASTELO (interior) ==================
function corte() {
  const id = 'cl_corte_castelo', R = rng(909);
  const defs = BASE + CASTD + lg('wallJ', [[0, '#3a2a1e'], [1, '#1c130c']]) + glow('lamp', '255,210,130') + lg('floorJ', [[0, '#7a6246'], [1, '#3e2e1e']]) + lg('beam', [[0, '#ffe6a0', .5], [1, '#ffe6a0', 0]]) + lg('screen', [[0, '#5ab0f0'], [1, '#1f4a8c']]);
  let g = `<rect width="1800" height="1920" fill="url(#wallJ)"/>`;
  for (let r = 0; r < 14; r++) for (let i = 0; i < 12; i++) { const x = -60 + i * 170 + (r % 2) * 80 + (R() - .5) * 30, y = 120 + r * 120; g += R() < .6 ? bag(x, y + 120, 1.1 + R() * .3, R() < .7 ? 0 : 1, (R() - .5) * 30, false) : (R() < .5 ? tireFlat(x, y + 80, 70, 36) : fridge(x, y + 130, .36, '#cfc8b8', false)); }
  g += `<rect width="1800" height="1920" fill="#10080a" opacity=".45"/>`;
  save(id + '_far', farWrap('#1c130c', g, defs, 5, '#4a3a2a', .2));
  let m = `<g filter="url(#rWall)"><rect x="-50" y="0" width="1900" height="1400" fill="url(#wallJ)" opacity=".001"/></g>`;
  // paredes de lixo laterais (cortes das paredes do castelo)
  m += junkWall(-60, 330, 1400, 0, R, 1.1) + `<rect x="330" y="0" width="22" height="1400" fill="#241a12" stroke="${OLC}" stroke-width="4"/>`;
  m += junkWall(1480, 1860, 1400, 0, R, 1.1) + `<rect x="1458" y="0" width="22" height="1400" fill="#241a12" stroke="${OLC}" stroke-width="4"/>`;
  // plataformas (andares) de tábuas
  const plat = (x0, x1, y) => `<g><polygon points="${x0},${y} ${x1},${y} ${x1 + 60},${y - 26} ${x0 + 60},${y - 26}" fill="#b08a5a"/>${cub((x0 + x1) / 2, y + 30, x1 - x0, 30, 60, '#7a4a24')}<path d="M${x0} ${y + 6}H${x1}" stroke="#fff" stroke-opacity=".3" stroke-width="3"/></g>`;
  for (const x of [380, 740, 1030, 1430]) m += `<rect x="${x - 16}" y="${x < 800 ? 748 : 588}" width="32" height="${1400 - (x < 800 ? 748 : 588)}" fill="url(#wood)" stroke="${OLC}" stroke-width="4"/><path d="M${x - 8} ${x < 800 ? 760 : 600}V1390" stroke="#fff" stroke-opacity=".25" stroke-width="4"/>`;
  // andar de cima esquerdo: cama com colchão
  m += plat(352, 760, 720) + cub(540, 704, 320, 46, 110, '#d8c8c8', { fil: 'rGr' }) + cub(540, 704, 320, 46, 110, '#d8c8c8', { fil: 'rGr' }) + cub(380, 704, 26, 130, 110, '#7a4a24') + `<ellipse cx="430" cy="672" rx="50" ry="20" fill="#fff" stroke="${OLC}" stroke-width="3"/><path d="M500 704V658Q600 640 700 660V704Z" fill="#4a7ac0" opacity=".85" stroke="${OLC}" stroke-width="3"/>` + `<g><path d="M360 720V1400" stroke="#3a2a1e" stroke-width="0"/></g>`;
  m += `<g><rect x="660" y="430" width="140" height="220" fill="#1a0f08" stroke="${OLC}" stroke-width="4"/><rect x="668" y="438" width="124" height="204" fill="#ffd488" opacity=".7"/></g>`;
  // andar de cima direito: TV velha + sofá
  m += plat(1000, 1458, 560) + sofa(1180, 540, .5, '#7a8aa8', true);
  m += `<g><rect x="1290" y="400" width="160" height="130" rx="10" fill="#4a3a2c" stroke="${OLC}" stroke-width="4"/><rect x="1302" y="412" width="110" height="104" rx="6" fill="url(#screen)"/><path d="M1302 412L1352 412L1312 516L1302 516Z" fill="#fff" opacity=".2"/><circle cx="1430" cy="440" r="8" fill="#d23a2a"/><path d="M1340 400L1310 360M1360 400L1390 350" stroke="#c4c9d0" stroke-width="3"/></g>`;
  // escada de pneus subindo à esquerda
  for (let i = 0; i < 6; i++) m += tireFlat(430 + i * 70, 1390 - i * 100, 64, 32) + tireFlat(430 + i * 70, 1390 - i * 100 + 0, 0.1, 1);
  // pilares de geladeira + luz de lâmpada pendurada
  for (const x of [560, 1300]) m += `<path d="M${x} 0V${x === 560 ? 360 : 300}" stroke="#2a2a30" stroke-width="5"/><circle cx="${x}" cy="${x === 560 ? 440 : 380}" r="200" fill="url(#lamp)" opacity=".55" style="mix-blend-mode:screen"/><circle cx="${x}" cy="${x === 560 ? 380 : 320}" r="14" fill="#fff6c8" stroke="${OLC}" stroke-width="3"/>`;
  // piso do térreo (tábua + papelão)
  m += `<g filter="url(#rWall)"><rect x="-50" y="1390" width="1900" height="570" fill="url(#floorJ)"/></g>`;
  const vx = 900, vy = 1000, kk = y => (y - vy) / (1920 - vy);
  for (let xi = -2400; xi <= 4200; xi += 280) m += `<path d="M${f(vx + (xi - vx) * kk(1390))} 1390L${xi} 1920" stroke="#1c130c" stroke-opacity=".5" stroke-width="3"/>`;
  m += `<rect x="-50" y="1390" width="1900" height="26" fill="#000" opacity=".5" filter="url(#b8)"/><polygon points="460,1390 1260,1390 1500,1920 300,1920" fill="url(#beam)" opacity=".28" style="mix-blend-mode:screen"/>`;
  m += `<g>${cub(900, 1490, 360, 14, 100, '#b98a55', { sw: 2.5 })}</g>` + sofa(480, 1460, .6, '#b8793a', true) + `<g transform="translate(1330,1440)">${shadow(0, 4, 120, 12)}${cub(0, 0, 150, 120, 50, '#4a3a2c')}<rect x="-62" y="-104" width="96" height="84" fill="url(#screen)" stroke="${OLC}" stroke-width="3"/><path d="M-62 -104L-20 -104L-50 -20L-62 -20Z" fill="#fff" opacity=".2"/></g>`;
  m += pile(1680, 1520, .7, R, 4, 2, 1) + pile(160, 1520, .7, R, 4, 2, 1);
  save(id + '_mid', midWrap(m, defs));
  let fg = fgPile(60, 1990, 2.1, R, 4, 3, 'fgb2') + fgPile(1760, 1996, 2.2, R, 4, 3, 'fgb2') + `<path d="M0 90Q450 190 900 120T1800 100" stroke="#17171c" stroke-width="4" fill="none"/>`;
  for (let i = 0; i < 14; i++) { const x = 40 + i * 128, y = 100 + Math.sin(i * .7) * 40 + 28; fg += `<circle cx="${x}" cy="${y + 16}" r="40" fill="${['#ffd23a', '#ff4a4a', '#4af08a', '#4ab8ff'][i % 4]}" opacity=".3"/><circle cx="${x}" cy="${y + 12}" r="11" fill="${['#ffd23a', '#ff4a4a', '#4af08a', '#4ab8ff'][i % 4]}" stroke="${OLC}" stroke-width="2.5"/>`; }
  fg += `<rect x="0" y="0" width="1800" height="1920" fill="url(#vig)"/>`;
  save(id + '_fg', fgWrap(fg, defs + rg('vig', [[.55, '#000', 0], [1, '#000', .55]], .5, .5, .75)));
}
export default { cl_rua_lixo: ruaLixo, cl_cozinha: cozinha, cl_castelo_medio: casteloMedio, cl_castelo_prefeitura: prefeitura, cl_praca_turistas: praca, cl_boteco: boteco, cl_castelo_noite: noite, cl_ladeira: ladeira, cl_corte_castelo: corte };
