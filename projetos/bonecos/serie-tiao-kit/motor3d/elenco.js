// elenco.js — GERADO de ../rig.js por gerar_elenco.sh (contexto injetável). Não editar à mão.
let ctx = null; export function setCtx(g) { ctx = g; }
const W = 1080, H = 1920, INK = '#241726', DUR = 55.9, TAU = Math.PI * 2, PI = Math.PI;

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
  // Tião da volta 4.000 (V5): mesmo desenho do Tião, chamuscado; chapéu de chef rasgado mas PRESENTE (regra fixa)
  tiao4k: { n: 'tiao4k', base: 'tiao', body: '#e6e2da', hat: 'chefRasgado', s: .86, seed: 1, chamusco: 1 },
};
// ---------- TRIPULAÇÕES RIVAIS: padrão para criar uma tripulação nova em poucas linhas ----------
// tripulacao(id, base, membros): base = traços comuns (cores do uniforme); cada membro = { body, hat, hatCol, s, + traços }.
// Traços prontos: stripes (cor), coat (casaca c/ botões), vest (colete+talabarte), patch (tapa-olho), hair (cor), beard (barba curta+brinco),
// barbona (barbona, cor), stache (bigode). Chapéus: chef, bicorne, bandana, beanie (hatCol null no 3º = sem pompom), tricorne, chapelao (aba larga+pluma).
// A cor do NAVIO da tripulação fica em motor3d/mundo.js FROTAS[id]. Depois: rodar motor3d/gerar_elenco.sh.
const TRIPS = {};
function tripulacao(id, base, membros) { let k = 10 + Object.keys(SPEC).length; TRIPS[id] = Object.keys(membros);
  for (const [n, m] of Object.entries(membros)) SPEC[n] = { n, seed: k++, s: 1, ...base, ...m, trip: id }; }
// Capitã Ruiva (navio preto, velas roxas): vilã + 2 piratas
tripulacao('ruiva', {}, {
  ruiva: { feminina: true, body: '#f4efe4', hat: 'tricorne', patch: 1, hair: '#e0602a', vestido: ['#8a1c2b', '#4b2a6a'], makeup: '#d81e3a', earring: 1 },
  riv1:  { body: '#ece6f4', hat: 'bandana', hatCol: ['#6b3fa0', '#5a3290'], s: .96, stripes: '#6b3fa0' },
  riv2:  { body: '#4b3d63', hat: 'beanie', hatCol: ['#4b3a6a', '#3a2d55', null], s: 1.06, beard: 1, vest: 1 },
});
// Os Bravos do Coral (a tripulação mais temida dos sete mares; todos GIGANTES): Capitão Barbacoral + 2 brutamontes
tripulacao('coral', { stripes: '#1f4f6b' }, {
  barbacoral: { body: '#1f4f6b', hat: 'chapelao', hatCol: ['#14505e', '#f2b233', '#ff7a6a'], s: 1.2, coat: 1, barbona: '#ff7a6a', stripes: null },
  coral1:     { body: '#f2b233', hat: 'bandana', hatCol: ['#1f4f6b', '#163a50'], s: 1.24, beard: 1 },
  coral2:     { body: '#f2b233', hat: 'beanie', hatCol: ['#ff7a6a', '#d85a4a', null], s: 1.3, vest: 1 },
});

// Tripulação das Bermudas (19/11, pedido do Filippe: mais tripulantes no navio do Tião): Tonho (gordão bigodudo), Dedé (grumete magrelo), Chiquinha (marujinha de tranças)
tripulacao('bermu', {}, {
  tonho:     { body: '#efe3c6', hat: 'beanie', hatCol: ['#2c3e5c', '#233049', null], s: 1.12, stripes: '#b0302a', stache: 1 },
  dede:      { body: '#dfe9cf', hat: 'bandana', hatCol: ['#d06a2a', '#b85a20'], s: .88, stripes: '#4a7a3a' },
  chiquinha: { feminina: true, body: '#f4efe4', hat: 'bandana', hatCol: ['#2a8a7a', '#1f7064'], s: .94, hair: '#5a3a2a', vestido: ['#2a6a8a', '#1f4f6b'], makeup: '#d8506a' },
});

// ---------- ELENCO EXTRA (16/11): traços novos p/ super-heróis, vilões, alienígenas, gigantes, mutantes, monstros ----------
// Traços (em SPEC): capa (cor), emblema [forma 'raio'|'estrela'|'escudo', cor], mascara (cor), oculos (cor), pele (cor da cabeça), antenas [cor, n 1|2],
// olho3 (cor da pupila ignorada: só liga), chifres (cor), presas (1), espinhos (cor), pelo (cor), capacete (1, bolha de astronauta), botas (cor).
// Chapéus novos: cartola, bruxa, fogo, coroa. Gigante/anão = só mudar `s`. Depois: bash motor3d/gerar_elenco.sh.
function capaDe(S, o, t) { const sw = Math.sin(t * 3.1) * 10, sw2 = Math.sin(t * 2.3 + 1) * 10;
  ctx.beginPath(); ctx.moveTo(-54, -198); ctx.quadraticCurveTo(-96, -90 + sw, -112, 26 + sw2); ctx.quadraticCurveTo(0, 62 + sw, 112, 26 - sw2); ctx.quadraticCurveTo(96, -90 - sw, 54, -198); ctx.closePath(); fs(S.capa, 8);
  ctx.save(); ctx.clip(); const g = ctx.createLinearGradient(-110, 0, 110, 0); g.addColorStop(0, 'rgba(255,255,255,.2)'); g.addColorStop(1, 'rgba(10,0,30,.4)'); ctx.fillStyle = g; ctx.fillRect(-120, -210, 240, 290); ctx.restore(); }
function emblemaDe(S) { const [f, c] = S.emblema; ctx.save(); ctx.translate(0, -128);
  if (f === 'raio') { ctx.beginPath(); ctx.moveTo(10, -38); ctx.lineTo(-22, 4); ctx.lineTo(-2, 4); ctx.lineTo(-12, 40); ctx.lineTo(24, -8); ctx.lineTo(2, -8); ctx.closePath(); fs(c, 5); }
  else if (f === 'estrela') { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, r = i % 2 ? 16 : 38; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); fs(c, 5); }
  else { ctx.beginPath(); ctx.moveTo(-30, -34); ctx.lineTo(30, -34); ctx.lineTo(30, 6); ctx.quadraticCurveTo(30, 34, 0, 44); ctx.quadraticCurveTo(-30, 34, -30, 6); ctx.closePath(); fs(c, 5); line([0, -24, 0, 30], 4, 'rgba(36,23,38,.45)'); }
  ctx.restore(); }
function extraAtras(S, o, t) { // atrás da cabeça: antenas, chifres, espinhos, pelo
  const TX = S.an ? cabXf(S.an) : null; if (TX) { ctx.save(); ctx.translate(0, TX.dy); ctx.scale(TX.wf / TX.cs, 1); }
  if (S.an && S.an.cab === 'abobora') { rr(-14, -124, 28, 44, 8); fs('#5a7a2a', 7); }
  if (S.an && S.an.orelhas) { const { f, c, i } = S.an.orelhas, k = S.an.cabS || 1;
    for (const sd of [-1, 1]) { ctx.save(); ctx.scale(sd, 1);
      if (f === 'redonda') { ell(70 * k, -74 * k, 36, 36); fs(c, 7); if (i) { ell(70 * k, -74 * k, 18, 18); fs(i, 0); } }
      else if (f === 'pontuda') { ctx.beginPath(); ctx.moveTo(30 * k, -84 * k); ctx.quadraticCurveTo(52 * k, -150 * k, 92 * k, -162 * k); ctx.quadraticCurveTo(96 * k, -110 * k, 84 * k, -58 * k); ctx.closePath(); fs(c, 7); if (i) { ctx.beginPath(); ctx.moveTo(50 * k, -88 * k); ctx.quadraticCurveTo(62 * k, -126 * k, 82 * k, -136 * k); ctx.quadraticCurveTo(84 * k, -108 * k, 76 * k, -80 * k); ctx.closePath(); fs(i, 0); } }
      else if (f === 'longa') { ctx.save(); ctx.translate(44 * k, -150 * k); ctx.rotate(.22); ell(0, 0, 24, 84); fs(c, 7); if (i) { ell(0, 6, 11, 62); fs(i, 0); } ctx.restore(); }
      else if (f === 'pequena') { ell(78 * k, -50 * k, 20, 24); fs(c, 7); }
      ctx.restore(); } }
  if (S.an && S.an.coque) { ell(0, -92, 60, 42); fs(S.an.coque, 8); }
  if (S.an && S.an.crista) for (const [x, y, r] of [[-30, -98, 22], [0, -116, 28], [30, -98, 22]]) { ell(x, y, r, r * 1.15); fs(S.an.crista, 7); }
  if (S.an && S.an.cauda) { const { c, ponta } = S.an.cauda; ctx.save(); ctx.setTransform(ctx.getTransform()); ctx.restore(); }
  if (S.antenas) { const [c, n] = S.antenas, bal = Math.sin(t * 5) * 5; for (const s of (n === 1 ? [0] : [-1, 1])) { line([s * 40, -78, s * 62 + bal * s, -140, s * 52 + bal * 1.4 * s, -176], 7); ell(s * 52 + bal * 1.4 * s, -186, 17, 17); fs(c, 6); } }
  if (S.chifres) for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 40, -74); ctx.quadraticCurveTo(s * 92, -112, s * 66, -170); ctx.quadraticCurveTo(s * 66, -118, s * 22, -84); ctx.closePath(); fs(S.chifres, 7); }
  if (S.espinhos && (!S.an || S.an.espinhosCab)) for (let i = 0; i < 5; i++) { const a = -PI * (.18 + i * .16), x = Math.cos(a) * 80, y = Math.sin(a) * 72; ctx.beginPath(); ctx.moveTo(x - 14, y + 4); ctx.lineTo(x * 1.35, y * 1.45 - 8); ctx.lineTo(x + 14, y + 12); ctx.closePath(); fs(S.espinhos, 6); }
  if (S.pelo) for (let i = 0; i < 15; i++) { const a = PI * (.92 + i * .1), x = Math.cos(a) * 94, y = Math.sin(a) * 86; ctx.beginPath(); ctx.moveTo(x - 12, y + 8); ctx.lineTo(x * 1.16 + Math.sin(i * 7) * 6, y * 1.16 - 6); ctx.lineTo(x + 12, y + 8); ctx.closePath(); fs(S.pelo, 5); }
  if (TX) ctx.restore(); }
function espinhosCosta(S) { if (!S.espinhos) return; for (let i = 0; i < 4; i++) for (const s of [-1, 1]) { const y = -170 + i * 40; ctx.beginPath(); ctx.moveTo(s * 56, y - 14); ctx.lineTo(s * 92, y + 4); ctx.lineTo(s * 56, y + 16); ctx.closePath(); fs(S.espinhos, 6); } }
function mascaraDe(S, lx, ey) { ctx.beginPath(); ctx.moveTo(-84, ey - 22); ctx.quadraticCurveTo(0, ey - 48, 84, ey - 22); ctx.lineTo(90, ey + 8); ctx.quadraticCurveTo(0, ey + 40, -90, ey + 8); ctx.closePath(); fs(S.mascara, 7); }
function oculosDe(S, lx, ey) { for (const s of [-1, 1]) { ell(s * 31 + lx, ey, 31, 31); fs('rgba(190,235,255,.35)', 8, S.oculos); } line([-4 + lx, ey - 6, 4 + lx, ey - 6], 7, S.oculos); line([-100, ey - 10, -62 + lx, ey - 6], 7, S.oculos); line([100, ey - 10, 62 + lx, ey - 6], 7, S.oculos); }
function capaceteFrente(S) { ctx.beginPath(); ctx.ellipse(0, 2, 112, 104, 0, 0, TAU); ctx.fillStyle = 'rgba(190,235,255,.22)'; ctx.fill(); ctx.lineWidth = 9; ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.beginPath(); ctx.ellipse(0, 2, 116, 108, 0, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.arc(14, 8, 96, PI * 1.08, PI * 1.38); ctx.lineWidth = 12; ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.stroke(); rr(-70, 82, 140, 26, 12); fs('#ff9a1f', 6); }

// ---------- ELENCO EXTRA (16/11): catálogo de personagens de aventura (nomes nossos, nada de obra/pessoa real) ----------
const NOVOS = {
  // 20/11 pacote TREM: apostador bigodudo de casaco xadrez (listras largas) e chapéu marrom
  apostador: { body: '#8a5a30', hat: 'chapelao', hatCol: ['#6b4a2a', '#3a2414', '#6b4a2a'], s: 1.1, stache: 1, stripes: '#4a2f1a', coat: 1 },
  // super-heróis (anatomia de herói: ombro largo, cintura fina, luvas e botas)
  heroi:   { s: 1.12, hat: null, capa: '#ffd21f', mascara: '#2b62d9', emblema: ['raio', '#ffd21f'], an: { t: 'v', cab: 'queixo', cabS: .95, pele: '#f0b88c', roupa: '#e0392d', manga: '#e0392d', luva: '#ffd21f', bota: '#ffd21f', calca: '#2b62d9', br: [36, 30], pr: [36, 30], mao: 24, pe: 36, cabelo: '#2a1a12', deco: ['peitoral', 'cinto'] } },                  // Capitão Pamonha
  lucia:   { feminina: true, s: 1.05, hat: null, capa: '#7c3aed', mascara: '#ffe44f', emblema: ['estrela', '#ffe44f'], hair: '#ffe44f', makeup: '#ff4d8d', an: { t: 'v', w: .78, cab: 'queixo', cabS: .86, cabelo: '#ffe44f', franja: 30, pele: '#f6c4a2', roupa: '#3b82f6', manga: '#3b82f6', luva: '#7c3aed', bota: '#7c3aed', calca: '#3b82f6', br: [24, 20], pr: [28, 24], mao: 18, pe: 30, deco: ['cinto'] } }, // Relâmpago Lúcia
  zegelo:  { s: 1.12, hat: null, capa: '#4fa8ff', an: { t: 'bruto', w: .85, cab: 'queixo', cabS: .95, pele: '#cfeaff', roupa: '#8cc8f5', manga: '#8cc8f5', luva: '#e8faff', bota: '#e8faff', calca: '#5aa0d8', br: [38, 32], pr: [38, 32], mao: 26, pe: 38, ombro: '#cfefff', cabelo: '#e8faff', deco: ['peitoral'] } },    // Zé Gelo
  tiaosuper: { base: 'tiao', body: '#fbfbf8', hat: 'chef', s: .86, capa: '#d8322a', emblema: ['estrela', '#ffd21f'] },
  // vilões
  barao:   { s: 1.18, hat: 'cartola', hatCol: ['#1d1a24', '#8a2be2'], capa: '#6d28d9', stache: 1, presas: 1, an: { t: 'fino', cab: 'pontuda', cabS: .85, pele: '#e6dcf0', roupa: '#2a1f3a', manga: '#2a1f3a', luva: '#1d1a24', bota: '#1d1a24', calca: '#2a1f3a', sobre: '#2a1f3a', br: [18, 15], pr: [20, 16], mao: 14, pe: 30, deco: ['sobretudo'] } },                  // Barão Sombra
  drgambi: { s: .98, hat: null, oculos: '#e0392d', an: { t: 'pera', w: .8, cab: 'oval', cabS: 1.18, pele: '#f1cdb0', roupa: '#d9d4c4', manga: '#ffffff', luva: '#f1cdb0', bota: '#4a3a2a', calca: '#5a5a6a', br: [22, 18], pr: [20, 17], mao: 17, pe: 28, tufos: '#cfcfd6', deco: ['jaleco'] } },   // Dr. Gambiarra
  bruxa:   { feminina: true, s: 1.0, hat: 'bruxa', hatCol: ['#3a2a5a', '#f2b233'], hair: '#7bd36a', an: { t: 'fino', cab: 'pontuda', cabS: .85, pele: '#9fdc8a', roupa: '#2f2740', manga: '#2f2740', luva: '#9fdc8a', bota: '#1d1a24', calca: '#2f2740', br: [15, 12], pr: [14, 12], mao: 15, pe: 28, feio: ['nariz', 'verrugas'], deco: ['vestidoLongo'] } }, // Dona Cacilda
  // alienígenas
  glorp:   { s: .9, hat: null, antenas: ['#ff5ca8', 2], olho3: 1, an: { sobr: false, t: 'pera', w: .7, cab: 'alongada', cabS: .95, pele: '#79d65a', olhos: 'alien', olhoCor: '#1a0f26', br: [12, 10], pr: [14, 12], mao: 14, dedos: 3, pe: 22, deco: ['manchas'] } },   // Glorp
  zorbina: { s: 1.1, hat: null, antenas: ['#ffe44f', 2], makeup: '#ff4d8d', an: { sobr: false, t: 'fino', w: .8, cab: 'alongada', cabS: .9, pele: '#b794ff', roupa: '#5b2fb0', manga: '#b794ff', luva: '#b794ff', bota: '#2a0a4a', calca: '#5b2fb0', olhos: 'alien', olhoCor: '#1a0f26', br: [13, 11], pr: [14, 12], mao: 13, dedos: 3, pe: 22 } },   // Zorbina
  astro:   { s: 1.05, hat: null, capacete: 1, emblema: ['estrela', '#ff9a1f'], an: { t: 'astro', cab: 'oval', cabS: .9, pele: '#f0c8a0', roupa: '#f2f2ee', manga: '#f2f2ee', luva: '#ff9a1f', bota: '#ff9a1f', calca: '#f2f2ee', br: [36, 32], pr: [38, 34], mao: 24, pe: 40, mochila: 1, deco: ['macacao'] } }, // Astronauta Neto
  // gigante / mutante / monstro / robô: bichos de verdade
  gigante: { s: 1.85, hat: null, an: { sobr: false, t: 'bruto', w: 1.05, cab: 'bruta', cabS: .78, pele: '#8fa06a', calca: '#6b4b2a', br: [52, 46], pr: [48, 42], mao: 42, pe: 52, cabelo: null, olhoCor: '#b3201f', deco: ['barriga'], feio: ['verrugas', 'cicatriz', 'tusks', 'sobrancelha', 'olhoGrande', 'dentesTortos'], garras: 0 } },   // Gigante Bolotão
  rei: { s: 1.85, hat: 'coroa', an: { sobr: false, t: 'bruto', w: 1.05, cab: 'bruta', cabS: .78, pele: '#d6a272', roupa: '#7a2f9a', manga: '#7a2f9a', calca: '#5a2478', br: [52, 46], pr: [48, 42], mao: 42, pe: 52, cabelo: null, olhoCor: '#b3201f', deco: ['barriga'], feio: ['verrugas', 'cicatriz', 'tusks', 'sobrancelha', 'olhoGrande', 'dentesTortos'], garras: 0 } },   // Rei Bolotão (gigante com coroa, ep. 37)
  mutante: { s: 1.15, hat: null, espinhos: '#3f8f1f', an: { espinhosCab: 1, t: 'pera', w: 1.0, cab: 'oval', cabS: 1.0, pele: '#6cd13f', garra: 'R', br: [26, 22], pr: [28, 24], mao: 18, pe: 30, garras: 1, deco: ['manchas'], feio: ['olhosExtras', 'dentesTortos', 'olhoGrande'] } },  // Gosmildo
  monstro: { s: 1.6, hat: null, chifres: '#f2e2a8', pelo: '#6d3fd0', presas: 1, an: { sobr: false, t: 'bruto', w: 1.0, cab: 'bruta', cabS: .95, pele: '#8b5cf6', br: [44, 38], pr: [42, 36], mao: 34, pe: 44, garras: 1, deco: ['barriga'], feio: ['sobrancelha'] } },   // Monstro Bolotinha
  robo:    { s: 1.05, hat: null, antenas: ['#ff5c5c', 1], an: { sobr: false, t: 'caixa', cab: 'caixa', cabS: .92, pele: '#9aa3b5', roupa: '#8b93a8', manga: '#7b8499', luva: '#5a6278', bota: '#5a6278', calca: '#7b8499', olhos: 'visor', br: [30, 26], pr: [32, 28], mao: 20, pe: 34, deco: ['placas'] } },   // Robô Lata-Velha
  // folclore (desenho nosso): criança-duende da mata
  // ---- TERROR / ESTRANHOS (16/11): tenebrosos, mas com o mesmo acabamento ----
  palhaco: { s: 1.28, hat: null, an: { boca: 'palhaco', t: 'pera', w: 1.0, cab: 'oval', cabS: 1.05, pele: '#f4f0f0', roupa: '#e0392d', manga: '#3b82f6', luva: '#ffffff', bota: '#e0392d', calca: '#ffd21f', br: [26, 22], pr: [26, 22], mao: 26, pe: 58, tufos: '#e03a2d', deco: ['bolinhas', 'golaBabado'], feio: ['sorrisoPintado', 'narizBola', 'losango', 'dentesTortos'] } , def: { mouth: 'flat', brow: -.4, eye: 'wide' } },   // Palhaço Risonho
  esqueleto: { s: 1.15, hat: null, an: { boca: 'esqueleto', t: 'fino', w: .95, cab: 'caveira', cabS: .95, pele: '#efe8d4', roupa: '#241c2c', manga: '#efe8d4', luva: '#efe8d4', bota: '#efe8d4', calca: '#efe8d4', br: [13, 11], pr: [15, 13], mao: 15, pe: 30, olhos: 'orbitas', sobr: false, deco: ['costelas'], feio: ['narizCaveira', 'dentesCaveira'], semBoca: 1 } , def: { mouth: 'flat' } },   // Seu Ossada
  zumbi:   { s: 1.12, hat: null, an: { boca: 'zumbi', t: 'pera', w: .95, cab: 'oval', cabS: .98, pele: '#8fa58a', roupa: '#5a5a6a', manga: '#5a5a6a', luva: '#8fa58a', bota: '#3a3a3a', calca: '#4a4a58', br: [26, 20], pr: [24, 20], mao: 22, pe: 34, olhos: 'molenga', sobr: false, tufos: '#3a3a2a', deco: ['rasgado', 'manchas'], feio: ['costuras', 'dentesTortos'] } , def: { mouth: 'flat', brow: .3 } },   // Zumbi Mofado
  vampiro: { s: 1.2, capa: '#6a1020', hat: null, presas: 1, an: { boca: 'vampiro', t: 'fino', w: 1.0, cab: 'pontuda', cabS: .88, pele: '#e8dcea', roupa: '#1a1020', manga: '#1a1020', luva: '#e8dcea', bota: '#1a1020', calca: '#1a1020', sobre: '#6a1020', br: [18, 15], pr: [20, 16], mao: 16, pe: 30, cabelo: '#14101a', picoCabelo: 1, presasG: 1, orelhas: { f: 'pontuda', c: '#e8dcea', i: '#c9a0c0' }, olhos: 'brilho', olhoCor: '#ff3b3b', deco: ['sobretudo'], feio: ['olheiras', 'bochechasOcas'] }, def: { mouth: 'flat', brow: .9, eye: 'wide' } },   // Conde Sanguessuga
  abobora: { s: 1.15, hat: null, an: { t: 'pera', w: .85, cab: 'abobora', cabS: 1.0, pele: '#f2862a', roupa: '#7a5a3a', manga: '#7a5a3a', luva: '#d9b24a', bota: '#4a3a2a', calca: '#5a4a3a', br: [20, 17], pr: [18, 15], mao: 17, pe: 32, olhos: 'triangulos', olhoCor: '#ffd23a', sobr: false, semBoca: 1, deco: ['manchas'], feio: ['bocaAbobora'] } },   // Abóbora Assombrada
  sombra:  { s: 1.4, hat: null, an: { boca: 'sombra', t: 'gosma', semPernas: 1, w: .95, cab: 'oval', cabS: .9, pele: '#241a36', roupa: '#241a36', manga: '#241a36', luva: '#2e2044', br: [22, 14], mao: 22, garras: 1, olhos: 'brilho', olhoCor: '#e8f6ff', sobr: false, semBoca: 1, feio: ['sorrisoDentes'] } , def: { mouth: 'flat' } },   // A Sombra
  magrelo: { s: 1.6, hat: null, an: { t: 'fino', w: .62, cab: 'oval', cabS: .8, pele: '#ede8e4', roupa: '#16141c', manga: '#16141c', luva: '#ede8e4', bota: '#16141c', calca: '#16141c', br: [14, 12], pr: [16, 13], mao: 15, pe: 28, semRosto: 1, sobr: false, deco: ['gravata'] } },   // Seu Magrelo (sem rosto)
  lobisomem: { s: 1.5, hat: null, an: { boca: 'lobo', t: 'bruto', w: .95, cab: 'bruta', cabS: .9, pele: '#6a5648', roupa: null, manga: '#6a5648', luva: '#4a3a30', bota: null, calca: '#4a4458', br: [40, 34], pr: [38, 32], mao: 30, pe: 46, garras: 1, olhos: 'brilho', olhoCor: '#ffd23a', sobr: false, orelhas: { f: 'pontuda', c: '#6a5648', i: '#3a2a24' }, focinho: { c: '#7a6658', w: 66, h: 50, nariz: '#1d1a24' }, deco: ['barriga'], cicatriz: 0 }, def: { mouth: 'flat', brow: .5 } },   // Lobisomem Peludo
  // ---- CRIATURAS BIZARRAS (16/11, pedido: estilo Gravity Falls / Rick and Morty: bicho feio, estranho, mas bem desenhado) ----
  molengo: { s: 1.15, hat: null, an: { sobr: false, t: 'pera', w: 1.1, cab: 'oval', cabS: .78, pele: '#cdb6a2', roupa: '#8a7a5a', manga: '#8a7a5a', luva: '#cdb6a2', bota: '#4a3a2a', calca: '#6a5a44', br: [34, 15], pr: [22, 15], mao: 28, pe: 36, olhos: 'molenga', tufos: '#6b4a2a', deco: ['manchas', 'barriga'], feio: ['lingua', 'baba', 'dentesTortos'] } },   // Bubu Molengo (a criatura abobada)
  olhao:   { s: 1.25, hat: null, an: { sobr: false, t: 'pera', w: 1.1, cab: 'oval', cabS: 1.05, pele: '#f0a050', roupa: null, manga: '#f0a050', luva: '#f0a050', bota: null, calca: '#d98a38', br: [17, 15], pr: [28, 24], mao: 15, pe: 42, olhos: 'ciclope', olhoCor: '#3aa84a', orelhas: { f: 'pequena', c: '#f0a050' }, deco: ['barriga'], feio: ['dentesTortos', 'verrugas'] } },   // Olhão
  gosma:   { s: 1.3, hat: null, an: { t: 'gosma', w: 1.0, semPernas: 1, cab: 'oval', cabS: .85, pele: '#5fe0a0', roupa: '#5fe0a0', manga: '#5fe0a0', luva: '#7af0b8', br: [28, 24], mao: 20, olhos: 'molenga', deco: ['bolhas'], feio: ['dentesTortos', 'baba'] } },   // Seu Gosma
  gnomo:   { s: .74, hat: 'gnomo', hatCol: ['#e0392d'], barbona: '#f4f4f0', an: { t: 'pera', w: .9, cab: 'oval', cabS: 1.0, pele: '#f0b88c', roupa: '#3f8a4a', manga: '#3f8a4a', luva: '#f0b88c', bota: '#5a3a1a', calca: '#6b4b2a', br: [20, 17], pr: [18, 16], mao: 17, pe: 30, deco: ['cinto'], feio: ['nariz'] } },   // Gnomo Zé Barbicha
  mariposa: { s: 1.15, hat: null, antenas: ['#e8d8c0', 2], an: { sobr: false, t: 'fino', w: 1.1, cab: 'oval', cabS: .95, pele: '#c8b08c', roupa: '#c8b08c', manga: '#c8b08c', luva: '#c8b08c', bota: null, calca: '#c8b08c', olhos: 'alien', olhoCor: '#c01c28', asas: { c: '#a07850', ponta: '#f2d28c' }, br: [15, 12], pr: [17, 14], mao: 14, dedos: 3, pe: 28 } },   // Homem-Mariposa
  peixeman: { sobr: false, s: 1.12, hat: null, an: { t: 'v', w: .9, cab: 'oval', cabS: 1.1, pele: '#5aa8e0', roupa: '#2a2a3a', manga: '#2a2a3a', luva: '#5aa8e0', bota: '#2a2a3a', calca: '#2a2a3a', br: [24, 20], pr: [26, 22], mao: 20, pe: 34, olhos: 'saltado', orelhas: { f: 'pontuda', c: '#3a7ab8', i: '#8ad0ff' }, focinho: { f: 'beicos', c: '#f06a8a' }, deco: [] } },   // Sr. Escamas (homem-peixe)
  sapao:   { s: 1.35, hat: null, an: { sobr: false, t: 'pera', w: 1.2, cab: 'croc', cabS: 1.0, pele: '#8a9a3a', roupa: null, manga: '#8a9a3a', luva: '#8a9a3a', bota: null, calca: '#7a8a30', br: [34, 28], pr: [34, 28], mao: 24, pe: 46, olhos: 'croc', deco: ['barrigaClara', 'manchas'], claro: '#e6e29a', feio: ['verrugas'] } },   // Seu Sapão
  // ---- BICHOS LUTADORES (16/11): animais com anatomia própria ----
  panda:   { s: 1.3, hat: null, an: { sobr: false, t: 'pera', w: 1.18, cab: 'oval', cabS: 1.15, pele: '#f6f6f2', roupa: '#f4f4f8', manga: '#f4f4f8', luva: '#1d1a24', bota: '#1d1a24', calca: '#f4f4f8', br: [40, 34], pr: [40, 34], mao: 26, pe: 40, orelhas: { f: 'redonda', c: '#1d1a24' }, manchaOlho: '#1d1a24', olhos: 'bicho', focinho: { c: '#ffffff', w: 44, h: 32, nariz: '#1d1a24' }, faixa: null, deco: ['quimono'] } },        // Mestre Pancadão (panda karateca)
  tigresa: { feminina: true, s: 1.15, hat: null, an: { sobr: false, t: 'v', w: .8, cab: 'oval', cabS: 1.0, pele: '#f2872a', roupa: '#e0392d', manga: '#f2872a', luva: '#f2872a', bota: '#2b1a14', calca: '#2b1a14', br: [29, 25], pr: [28, 24], mao: 20, pe: 32, orelhas: { f: 'pontuda', c: '#f2872a', i: '#fff4de' }, focinho: { c: '#fff4de', w: 48, h: 34, nariz: '#ff7a9a', bigodes: 1 }, rajasCara: 1, cauda: { c: '#f2872a', ponta: '#2b1a14' }, deco: ['listras'] } },       // Tigresa Rajada
  coelho:  { s: 1.0, hat: null, an: { sobr: false, t: 'fino', w: .95, cab: 'oval', cabS: .95, pele: '#e6e2ea', roupa: '#33333f', manga: '#33333f', luva: '#e6e2ea', bota: '#33333f', calca: '#33333f', br: [20, 17], pr: [22, 18], mao: 17, pe: 36, orelhas: { f: 'longa', c: '#e6e2ea', i: '#ffb3c8' }, focinho: { c: '#ffffff', w: 40, h: 28, nariz: '#ff7a9a', bigodes: 1 }, faixa: '#e0392d', cauda: { c: '#ffffff', ponta: '#ffffff', f: 'fofa' }, deco: [] } }, // Coelho Ninja Zé Pulo
  tartaruga: { s: 1.0, hat: null, an: { sobr: false, t: 'pera', w: .9, cab: 'oval', cabS: .85, pele: '#6cc06a', roupa: '#f2e2a8', manga: '#6cc06a', luva: '#6cc06a', bota: '#6cc06a', calca: '#6cc06a', br: [22, 19], pr: [26, 22], mao: 18, pe: 32, casco: '#4f8a3a', focinho: { f: 'bico', c: '#d9b24a' }, deco: ['barrigaClara'], claro: '#f2e2a8' } },   // Vovó Tartaruga Sábia
  jacare:  { s: 1.4, hat: null, an: { sobr: false, t: 'bruto', w: .95, cab: 'croc', cabS: .95, pele: '#4fae5a', roupa: null, manga: '#4fae5a', luva: '#4fae5a', bota: null, calca: '#3f8a4a', br: [36, 30], pr: [38, 32], mao: 26, pe: 48, garras: 1, olhos: 'croc', focinho: { f: 'longo', c: '#6cc872' }, cauda: { c: '#3f8a4a', ponta: '#3f8a4a' }, deco: ['barrigaClara', 'listras'], claro: '#e8f2a8' } },   // Jacaré Dentão
  gorila:  { s: 1.3, hat: null, an: { sobr: false, t: 'bruto', w: 1.15, cab: 'bruta', cabS: .8, pele: '#3a3340', roupa: null, manga: '#3a3340', luva: '#26212c', bota: null, calca: '#3a3340', br: [54, 48], pr: [46, 40], mao: 40, pe: 50, coque: '#3a3340', orelhas: { f: 'pequena', c: '#3a3340' }, deco: ['barriga'], feio: ['sobrancelha'], focinho: { c: '#6a5d74', w: 62, h: 44, chato: 1, nariz: '#1d1a24' } } },   // Gorilão Zen
  raposa:  { feminina: true, s: 1.05, hat: null, an: { sobr: false, t: 'fino', w: .95, cab: 'pontuda', cabS: .9, pele: '#f2692a', roupa: '#3a2a5a', manga: '#f2692a', luva: '#2b1a14', bota: '#2b1a14', calca: '#3a2a5a', br: [20, 17], pr: [22, 18], mao: 16, pe: 32, orelhas: { f: 'pontuda', c: '#f2692a', i: '#2b1a14' }, focinho: { c: '#ffffff', w: 36, h: 26, nariz: '#1d1a24', bigodes: 1 }, cauda: { c: '#f2692a', ponta: '#ffffff', f: 'fofa' }, deco: [] } },   // Raposa Ladina
  galo:    { s: .95, hat: null, an: { sobr: false, t: 'pera', w: .85, cab: 'oval', cabS: .9, pele: '#f4f0e6', roupa: '#f4f0e6', manga: '#e0392d', luva: '#e0392d', bota: '#f2b233', calca: '#f4f0e6', br: [24, 20], pr: [18, 15], mao: 22, pe: 34, crista: '#e0392d', focinho: { f: 'bico', c: '#f2b233' }, cauda: { c: '#2b62d9', ponta: '#e0392d' }, deco: ['barrigaClara'], claro: '#ffffff' } },   // Galo Garnizé (boxeador)
  curupira: { s: .9, hat: 'fogo', an: { t: 'fino', w: 1.1, cab: 'oval', cabS: .95, pele: '#c98a52', roupa: '#c98a52', manga: '#c98a52', luva: '#c98a52', calca: '#c98a52', br: [18, 15], pr: [22, 19], mao: 17, pe: 34, deco: ['folhas'] } },   // Curupira
};
for (const [n, m] of Object.entries(NOVOS)) SPEC[n] = { n, seed: 40 + Object.keys(SPEC).length, s: 1, ...m, novo: 1 };
Object.assign(SPEC, {
  vizinha: { n: "vizinha", body: "#a94f71", pele: "#c68c68", feminina: true, hair: "#332127", penteado: "longo", s: .94, seed: 901 },
  feirante: { n: "feirante", body: "#41796f", pele: "#ead0ad", oculos: "#373241", stache: 1, s: 1.01, seed: 902 },
  balconista: { n: "balconista", body: "#718cbd", pele: "#dfab89", feminina: true, hair: "#793f2e", penteado: "curto", s: .91, seed: 903 },
  carteiro: { n: "carteiro", body: "#c68338", pele: "#9f6947", hair: "#44302b", penteado: "topete", s: 1.03, seed: 904 },
});

// ---------- ANATOMIA PRÓPRIA (16/11, pedido do Filippe): personagens que NÃO são o boneco de palito ----------
// SPEC.an = { t: tronco ('v'|'bruto'|'pera'|'fino'|'caixa'|'astro'), w: largura x, cab: cabeça ('queixo'|'bruta'|'alongada'|'pontuda'|'caixa'|'oval'),
//   cabS: escala da cabeça, pele, roupa, manga, luva, bota, calca, br:[braço sup, inf], pr:[coxa, canela], mao, pe, cabelo, olhos ('alien'|'visor'), deco:[...], feio:[...] }
// Mesmo esqueleto/poses do rig (aL/aR/lL/lR/hR...), mas tronco, cabeça, braços, pernas, mãos e pés são outros desenhos.
const mixc = (a, b, k) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
const claro = (c, k = .35) => mixc(c, '#ffffff', k), escuro = (c, k = .35) => mixc(c, '#1a1030', k);
function torsoAn(a) { const w = a.w || 1, X = (x) => x * w; ctx.beginPath();
  if (a.t === 'v') { ctx.moveTo(X(-92), -190); ctx.quadraticCurveTo(X(-94), -214, X(-60), -214); ctx.lineTo(X(60), -214); ctx.quadraticCurveTo(X(94), -214, X(92), -190); ctx.lineTo(X(58), -34); ctx.quadraticCurveTo(X(56), 12, X(30), 12); ctx.lineTo(X(-30), 12); ctx.quadraticCurveTo(X(-56), 12, X(-58), -34); }
  else if (a.t === 'bruto') { ctx.moveTo(X(-106), -184); ctx.quadraticCurveTo(X(-116), -218, X(-70), -218); ctx.lineTo(X(70), -218); ctx.quadraticCurveTo(X(116), -218, X(106), -184); ctx.quadraticCurveTo(X(126), -90, X(100), -20); ctx.quadraticCurveTo(X(84), 20, 0, 22); ctx.quadraticCurveTo(X(-84), 20, X(-100), -20); ctx.quadraticCurveTo(X(-126), -90, X(-106), -184); }
  else if (a.t === 'pera') { ctx.moveTo(X(-52), -206); ctx.quadraticCurveTo(X(-58), -216, X(-34), -216); ctx.lineTo(X(34), -216); ctx.quadraticCurveTo(X(58), -216, X(52), -206); ctx.quadraticCurveTo(X(60), -130, X(90), -70); ctx.quadraticCurveTo(X(96), 14, 0, 16); ctx.quadraticCurveTo(X(-96), 14, X(-90), -70); ctx.quadraticCurveTo(X(-60), -130, X(-52), -206); }
  else if (a.t === 'fino') { ctx.moveTo(X(-46), -206); ctx.quadraticCurveTo(X(-50), -216, X(-30), -216); ctx.lineTo(X(30), -216); ctx.quadraticCurveTo(X(50), -216, X(46), -206); ctx.lineTo(X(38), -20); ctx.quadraticCurveTo(X(36), 10, 0, 10); ctx.quadraticCurveTo(X(-36), 10, X(-38), -20); }
  else if (a.t === 'gosma') { ctx.moveTo(X(-56), -206); ctx.lineTo(X(56), -206); ctx.quadraticCurveTo(X(112), -180, X(106), -90); ctx.quadraticCurveTo(X(124), -10, X(98), 34); ctx.quadraticCurveTo(X(82), 50, X(62), 36); ctx.quadraticCurveTo(X(46), 62, X(24), 40); ctx.quadraticCurveTo(X(6), 54, X(-14), 38); ctx.quadraticCurveTo(X(-34), 66, X(-54), 38); ctx.quadraticCurveTo(X(-84), 54, X(-98), 34); ctx.quadraticCurveTo(X(-124), -10, X(-106), -90); ctx.quadraticCurveTo(X(-112), -180, X(-56), -206); }
  else if (a.t === 'caixa') { ctx.roundRect(X(-74), -210, X(148), 222, [14, 14, 10, 10]); }
  else { ctx.roundRect(X(-80), -212, X(160), 226, [44, 44, 30, 30]); } ctx.closePath(); }
function bodyAn(S, o) { const a = S.an, w = a.w || 1, pele = a.pele, roupa = a.roupa || null; const base = roupa || pele;
  // pelagem atrás do tronco (monstro)
  if (S.pelo) for (let i = 0; i < 26; i++) { const u = i / 25, y = -200 + u * 210, side = i % 2 ? 1 : -1, x = side * (92 * w + Math.sin(i * 5) * 6); ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.lineTo(x + side * (30 + (i % 3) * 8), y + 4); ctx.lineTo(x, y + 18); ctx.closePath(); fs(S.pelo, 5); }
  if (a.asas) { const { c, ponta } = a.asas; for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * 40, -190); ctx.bezierCurveTo(sd * 170, -300, sd * 250, -170, sd * 190, -80); ctx.bezierCurveTo(sd * 170, -20, sd * 90, -10, sd * 44, -60); ctx.closePath(); fs(c, 8); ell(sd * 168, -150, 26, 30); fs(ponta, 5); ell(sd * 168, -150, 11, 13); fs('#1d1a24', 0); ell(sd * 120, -80, 16, 18); fs(ponta, 4); } }
  if (a.cauda) { const { c, ponta, f } = a.cauda; const cu = f === 'fofa' ? [[40, -30], [140, -20], [150, -130], [96, -150]] : [[40, -30], [120, 0], [140, -80], [110, -120]];
    ctx.beginPath(); ctx.moveTo(40, -30); ctx.bezierCurveTo(cu[1][0], cu[1][1], cu[2][0], cu[2][1], cu[3][0], cu[3][1]); ctx.lineCap = 'round'; ctx.lineWidth = f === 'fofa' ? 70 : 34; ctx.strokeStyle = INK; ctx.stroke(); ctx.lineWidth = (f === 'fofa' ? 70 : 34) - 14; ctx.strokeStyle = c; ctx.stroke();
    if (ponta) { ell(cu[3][0], cu[3][1], f === 'fofa' ? 30 : 17, f === 'fofa' ? 30 : 17); fs(ponta, 6); } }
  if (a.casco) { ctx.beginPath(); ctx.ellipse(0, -100, 118, 132, 0, 0, TAU); fs(a.casco, 9); ctx.save(); ctx.beginPath(); ctx.ellipse(0, -100, 118, 132, 0, 0, TAU); ctx.clip(); for (const [x, y] of [[0, -150], [-52, -110], [52, -110], [-30, -50], [30, -50], [0, -100]]) { ctx.beginPath(); for (let i = 0; i < 6; i++) { const q = i * PI / 3 + PI / 6; ctx.lineTo(x + Math.cos(q) * 30, y + Math.sin(q) * 30); } ctx.closePath(); fs(escuro(a.casco, .22), 5, 'rgba(36,23,38,.7)'); } ctx.restore(); }
  if (a.mochila) { rr(-70 * w, -200, 140 * w, 150, 24); fs('#c9ccd8', 8); rr(-46 * w, -170, 92 * w, 40, 8); fs('#8a90a6', 5); }
  torsoAn(a); { const g = ctx.createLinearGradient(-90 * w, -214, 90 * w, 12); g.addColorStop(0, claro(base, .28)); g.addColorStop(.5, base); g.addColorStop(1, escuro(base, .38)); ctx.fillStyle = g; ctx.fill(); }
  ctx.save(); torsoAn(a); ctx.clip();
  if (roupa && pele && a.peito) { ctx.beginPath(); ctx.moveTo(-30 * w, -216); ctx.lineTo(30 * w, -216); ctx.lineTo(0, -150); ctx.closePath(); ctx.fillStyle = pele; ctx.fill(); }
  const D = a.deco || [];
  if (D.includes('peitoral')) { for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 4, -196); ctx.quadraticCurveTo(s * 70 * w, -200, s * 64 * w, -140); ctx.quadraticCurveTo(s * 30 * w, -120, s * 4, -150); fs(null, 4, 'rgba(36,23,38,.35)'); } for (let k = 0; k < 3; k++) for (const s of [-1, 1]) { rr(s * 26 * w - 15, -108 + k * 28, 30, 22, 8); fs(null, 3, 'rgba(36,23,38,.28)'); } }
  if (D.includes('barrigaClara')) { ctx.beginPath(); ctx.ellipse(0, -80, 52 * w, 108, 0, 0, TAU); ctx.fillStyle = a.claro || '#fff4de'; ctx.fill(); }
  if (D.includes('bolinhas')) for (let i = 0; i < 12; i++) { ell(-80 * w + (i % 4) * 54 * w, -180 + Math.floor(i / 4) * 70, 11, 11); fs(i % 2 ? '#ffd21f' : '#3b82f6', 4); }
  if (D.includes('rasgado')) { ctx.beginPath(); ctx.moveTo(-44 * w, -150); ctx.lineTo(10, -170); ctx.lineTo(50 * w, -120); ctx.lineTo(24, -70); ctx.lineTo(-30 * w, -86); ctx.closePath(); fs('#4a1a24', 5); for (let k = 0; k < 3; k++) { line([-34 * w + 4, -132 + k * 18, 40 * w - 8, -144 + k * 18 + 10], 5, '#e8dcc8'); } }
  if (D.includes('costelas')) { line([0, -210, 0, 10], 8, '#efe8d4'); for (let k = 0; k < 6; k++) for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(0, -190 + k * 26); ctx.quadraticCurveTo(sd * 54 * w, -200 + k * 26, sd * 40 * w, -166 + k * 26); fs(null, 9, '#efe8d4'); } }
  if (D.includes('gravata')) { ctx.beginPath(); ctx.moveTo(-34 * w, -214); ctx.lineTo(34 * w, -214); ctx.lineTo(0, -150); ctx.closePath(); ctx.fillStyle = '#ede8e4'; ctx.fill(); ctx.beginPath(); ctx.moveTo(-8, -176); ctx.lineTo(8, -176); ctx.lineTo(14, -80); ctx.lineTo(0, -66); ctx.lineTo(-14, -80); ctx.closePath(); fs('#c01c28', 5); }
  if (D.includes('bolhas')) for (const [x, y, r] of [[-50, -150, 16], [40, -100, 22], [-30, -50, 12], [60, -170, 11], [-70, -90, 14], [10, -20, 9]]) { ell(x, y, r, r); fs('rgba(255,255,255,.28)', 4, 'rgba(255,255,255,.7)'); }
  if (D.includes('listras')) for (let k = 0; k < 5; k++) for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * 100 * w, -190 + k * 40); ctx.quadraticCurveTo(sd * 60 * w, -176 + k * 40, sd * 34 * w, -186 + k * 40); ctx.quadraticCurveTo(sd * 64 * w, -160 + k * 40, sd * 100 * w, -170 + k * 40); ctx.closePath(); ctx.fillStyle = '#2b1a14'; ctx.fill(); }
  if (D.includes('quimono')) { ctx.beginPath(); ctx.moveTo(-60 * w, -216); ctx.lineTo(0, -120); ctx.lineTo(60 * w, -216); ctx.lineTo(40 * w, -216); ctx.lineTo(0, -156); ctx.lineTo(-40 * w, -216); ctx.closePath(); fs('#e8e8f4', 5); ctx.beginPath(); ctx.moveTo(-56 * w, -216); ctx.lineTo(20 * w, -60); ctx.lineTo(40 * w, -80); ctx.lineTo(-30 * w, -216); ctx.closePath(); fs(null, 4, 'rgba(36,23,38,.35)'); rr(-96 * w, -76, 192 * w, 24, 4); fs(a.faixa || '#1d1a24', 6); rr(-20, -76, 40, 50, 6); fs(a.faixa || '#1d1a24', 6); }
  if (D.includes('barriga')) { ctx.beginPath(); ctx.ellipse(0, -50, 62 * w, 56, 0, 0, TAU); ctx.fillStyle = claro(pele, .22); ctx.fill(); ell(-4, -46, 7, 5); fs(escuro(pele, .35), 4); for (let i = 0; i < 7; i++) line([-20 + i * 7, -30 + (i % 2) * 8, -17 + i * 7, -22 + (i % 2) * 8], 3, 'rgba(36,23,38,.45)'); }
  if (D.includes('manchas')) for (const [x, y, r, c] of [[-50, -150, 16, '#7b3fbf'], [40, -90, 20, '#7b3fbf'], [-20, -40, 14, '#d9f06a'], [60, -170, 12, '#d9f06a'], [-62, -70, 18, '#7b3fbf']]) { ell(x, y, r, r * .85); fs(c, 4); }
  if (D.includes('cinto')) { ctx.fillStyle = '#c9a022'; ctx.fillRect(-90 * w, -42, 180 * w, 22); ctx.fillStyle = '#ffe27a'; rr(-16, -45, 32, 28, 4); fs('#ffe27a', 4); }
  if (D.includes('jaleco')) { ctx.beginPath(); ctx.moveTo(-8, -214); ctx.lineTo(-40 * w, -150); ctx.lineTo(-6, -90); ctx.lineTo(-4, 14); ctx.lineTo(-90, 14); ctx.lineTo(-90, -214); ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.beginPath(); ctx.moveTo(8, -214); ctx.lineTo(40 * w, -150); ctx.lineTo(6, -90); ctx.lineTo(4, 14); ctx.lineTo(90, 14); ctx.lineTo(90, -214); ctx.closePath(); ctx.fill(); line([0, -212, 0, 14], 4, 'rgba(36,23,38,.5)'); for (let k = 0; k < 3; k++) ell(10, -110 + k * 36, 5, 5), fs('#9aa3b5', 3); rr(30 * w, -92, 26, 34, 4); fs('#e8e8e4', 4); for (const [x, c] of [[36, '#e0392d'], [44, '#3b82f6']]) line([x * w, -92, x * w, -108], 5, c); }
  if (D.includes('sobretudo')) { ctx.beginPath(); ctx.moveTo(-60, -214); ctx.lineTo(-8, -214); ctx.lineTo(-30, -150); ctx.lineTo(-6, -60); ctx.lineTo(-6, 14); ctx.lineTo(-70, 14); ctx.closePath(); ctx.fillStyle = a.sobre || '#8a2be2'; ctx.fill(); ctx.beginPath(); ctx.moveTo(60, -214); ctx.lineTo(8, -214); ctx.lineTo(30, -150); ctx.lineTo(6, -60); ctx.lineTo(6, 14); ctx.lineTo(70, 14); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#f2c230'; for (let k = 0; k < 4; k++) for (const s of [-1, 1]) ell(s * 16, -150 + k * 38, 5, 5), ctx.fill(); }
  if (D.includes('placas')) { for (const [x, y, ww, hh] of [[-50, -190, 100, 60], [-50, -120, 46, 70], [4, -120, 46, 70], [-50, -44, 100, 50]]) { rr(x * w, y, ww * w, hh, 8); fs(claro(base, .1), 4, escuro(base, .5)); for (const [rx, ry] of [[x + 8, y + 8], [x + ww - 8, y + 8], [x + 8, y + hh - 8], [x + ww - 8, y + hh - 8]]) ell(rx * w, ry, 3, 3), fs(escuro(base, .5), 0); } for (const [x, c] of [[-24, '#ff5c5c'], [0, '#ffd21f'], [24, '#4ff0d8']]) { ell(x, -160, 8, 8); fs(c, 4); } }
  if (D.includes('macacao')) { rr(-50 * w, -190, 100 * w, 70, 10); fs('#dfe3ee', 5); for (const [x, c] of [[-26, '#e0392d'], [0, '#3b82f6'], [26, '#ffd21f']]) { ell(x * w, -170, 9, 9); fs(c, 4); } for (let k = 0; k < 3; k++) line([-40 * w, -100 + k * 26, 40 * w, -100 + k * 26], 4, 'rgba(36,23,38,.28)'); rr(-80 * w, -50, 160 * w, 14, 6); fs('#ff9a1f', 4); }
  if (D.includes('folhas')) for (let i = 0; i < 9; i++) { const x = -70 + i * 17.5; ctx.beginPath(); ctx.moveTo(x - 12, -34); ctx.lineTo(x, 36); ctx.lineTo(x + 12, -34); ctx.closePath(); fs(['#3fa24a', '#2a8a3c', '#6cd13f'][i % 3], 5); }
  if (D.includes('vestidoLongo')) { ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(-60, -210, 30, 220); }
  { const g = ctx.createLinearGradient(-90 * w, 0, 90 * w, 0); g.addColorStop(0, 'rgba(255,255,255,.2)'); g.addColorStop(.35, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(10,0,30,.38)'); ctx.fillStyle = g; ctx.fillRect(-130 * w, -220, 260 * w, 250); }
  ctx.restore(); torsoAn(a); fs(null, 8);
  // saias/caudas que passam do tronco
  if (D.includes('sobretudo')) { for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 6, -20); ctx.lineTo(s * 70, 4); ctx.quadraticCurveTo(s * 86, 70, s * 62, 120); ctx.lineTo(s * 8, 90); ctx.closePath(); fs(a.sobre || '#8a2be2', 7); } }
  if (D.includes('jaleco')) { for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 4, -6); ctx.lineTo(s * 96, 0); ctx.quadraticCurveTo(s * 108, 50, s * 92, 86); ctx.lineTo(s * 6, 76); ctx.closePath(); fs('#ffffff', 7); } }
  if (D.includes('vestidoLongo')) { ctx.beginPath(); ctx.moveTo(-40, -30); ctx.quadraticCurveTo(-60, 40, -118, 100); ctx.quadraticCurveTo(0, 124, 118, 100); ctx.quadraticCurveTo(60, 40, 40, -30); ctx.closePath(); fs(a.roupa, 8); line([-30, -10, -64, 100], 4, 'rgba(255,255,255,.2)'); line([20, -10, 50, 104], 4, 'rgba(0,0,0,.22)'); }
  if (D.includes('folhas')) { }
  if ((a.deco || []).includes('golaBabado')) for (let i = 0; i < 8; i++) { const x = -70 * w + i * 20 * w; ell(x, -204, 18, 16); fs(['#ffd21f', '#e0392d', '#3b82f6', '#ffffff'][i % 4], 6); }
  if (a.ombro) for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 70 * w, -196); ctx.lineTo(s * 130 * w, -250); ctx.lineTo(s * 112 * w, -176); ctx.closePath(); fs(a.ombro, 7); ctx.beginPath(); ctx.moveTo(s * 100 * w, -184); ctx.lineTo(s * 150 * w, -214); ctx.lineTo(s * 126 * w, -160); ctx.closePath(); fs(claro(a.ombro, .3), 6); }
}
function membroAn(g, w1, w2, c1, c2) { // braço/perna grossos: duas pernas de cápsula, juntas arredondadas
  line([g[0], g[1], g[2], g[3]], w1 + 15, INK); line([g[2], g[3], g[4], g[5]], w2 + 15, INK); ell(g[2], g[3], (w1 + w2) / 4 + 7, (w1 + w2) / 4 + 7); ctx.fillStyle = INK; ctx.fill();
  line([g[0], g[1], g[2], g[3]], w1, c1); line([g[2], g[3], g[4], g[5]], w2, c2 || c1); ell(g[2], g[3], (w1 + w2) / 4, (w1 + w2) / 4); ctx.fillStyle = c1; ctx.fill();
  line([g[0] - w1 * .2, g[1], g[2] - w1 * .2, g[3]], w1 * .22, 'rgba(255,255,255,.22)'); line([g[2] + w2 * .22, g[3], g[4] + w2 * .22, g[5]], w2 * .2, 'rgba(10,0,30,.2)'); }
function legAn(g, S, side = 1) { const a = S.an, [w1, w2] = a.pr || [30, 26]; membroAn(g, w1, w2, a.calca || a.pele, a.calca || a.pele);
  const pe = a.pe || 26, fc = a.bota || a.pele, fx = g[4] + side * pe * .22, fy = g[5] + 3;
  if (a.bota) { rr(g[4] - w2 * .55, g[5] - w2 * .9, w2 * 1.1, w2 * .9, 8); fs(fc, 6); }
  ctx.save(); ctx.translate(fx, fy); ctx.rotate(side * .16); ctx.beginPath(); ctx.ellipse(0, 0, pe * .82, 15, 0, 0, TAU); fs(fc, 7);
  if (!a.bota) for (const d of [-1, 0, 1]) line([d * pe * .38, 2, d * pe * .38, 12], 4, 'rgba(36,23,38,.55)');
  if (a.garras) for (const d of [-1, 0, 1]) { ctx.beginPath(); ctx.moveTo(d * pe * .4 - 5, 8); ctx.lineTo(d * pe * .45, 22); ctx.lineTo(d * pe * .4 + 5, 8); ctx.closePath(); fs('#f4efe0', 4); }
  ctx.restore();
  if (a.pelo) for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(fx + i * 10 - 10, fy + 8); ctx.lineTo(fx + i * 10 - 4, fy + 22); ctx.lineTo(fx + i * 10 + 2, fy + 8); ctx.closePath(); fs('#f2e2a8', 3); } }
function armAn(g, pr, S, side) { const a = S.an, [w1, w2] = a.br || [28, 24]; const garra = a.garra === (side < 0 ? 'L' : 'R'), k = garra ? 1.6 : 1; membroAn(g, w1 * k, w2 * k, a.manga || a.pele, a.luva || a.pele);
  const r = (a.mao || 20) * k, dir = Math.atan2(g[5] - g[3], g[4] - g[2]);
  if (!(a.dedos === 3) && !pr && !a.semDedos) for (const d of [-1, 0, 1]) { const an2 = dir + d * .62, fx = g[4] + Math.cos(an2) * r * .92, fy = g[5] + Math.sin(an2) * r * .92; ctx.beginPath(); ctx.ellipse(fx, fy, r * .36, r * .36, 0, 0, TAU); fs(a.luva || a.pele, 6); }
  ctx.beginPath(); ctx.ellipse(g[4], g[5], r, r * .95, 0, 0, TAU); fs(a.luva || a.pele, 7);
  if (a.dedos === 3) for (const d of [-1, 0, 1]) { line([g[4] + d * r * .6, g[5] + r * .5, g[4] + d * r * .9, g[5] + r * 1.5], 9, INK); line([g[4] + d * r * .6, g[5] + r * .5, g[4] + d * r * .9, g[5] + r * 1.5], 4, a.pele); }
  if (garra || a.garras) for (const d of [-1, 0, 1]) { ctx.beginPath(); ctx.moveTo(g[4] + d * r * .55 - 6, g[5] + r * .6); ctx.lineTo(g[4] + d * r * .75, g[5] + r * 1.7); ctx.lineTo(g[4] + d * r * .55 + 6, g[5] + r * .6); ctx.closePath(); fs('#f4efe0', 5); }
  if (pr) { prop(pr.k, g[4], g[5], pr.a, pr.s || 1, pr); ctx.fillStyle = INK; ell(g[4], g[5], 12, 12); ctx.fill(); } }
const CAB_TOPO = { oval: -92, queixo: -100, bruta: -100, alongada: -126, pontuda: -104, caixa: -90, croc: -52, caveira: -100, abobora: -96 }, CAB_LARG = { oval: 100, queixo: 92, bruta: 120, alongada: 82, pontuda: 84, caixa: 98, croc: 108, caveira: 84, abobora: 118 };
// ÂNCORA: tudo que gruda na cabeça (orelha, antena, chifre, tufo, chapéu) é desenhado numa grade que segue o topo e a largura da cabeça do personagem
// (bug 16/11: tufos do Molengo e espinho do Jacaré ficavam voando porque usavam posição fixa de cabeça redonda).
const cabXf = (a) => { const cs = a.cabS || 1, k = a.cab || 'oval'; return { dy: (CAB_TOPO[k] ?? -92) * cs + 92, wf: ((CAB_LARG[k] ?? 100) / 100) * cs, cs }; };
function cabAn(k, z = 1) { const q = (v) => v * z; ctx.beginPath();
  if (k === 'queixo') { ctx.moveTo(q(-90), q(-10)); ctx.bezierCurveTo(q(-92), q(-110), q(92), q(-110), q(90), q(-10)); ctx.bezierCurveTo(q(96), q(40), q(80), q(88), q(0), q(96)); ctx.bezierCurveTo(q(-80), q(88), q(-96), q(40), q(-90), q(-10)); }
  else if (k === 'bruta') { ctx.moveTo(q(-74), q(-30)); ctx.bezierCurveTo(q(-76), q(-104), q(76), q(-104), q(74), q(-30)); ctx.bezierCurveTo(q(120), q(10), q(126), q(70), q(86), q(96)); ctx.bezierCurveTo(q(40), q(110), q(-40), q(110), q(-86), q(96)); ctx.bezierCurveTo(q(-126), q(70), q(-120), q(10), q(-74), q(-30)); }
  else if (k === 'alongada') { ctx.ellipse(0, q(-14), q(82), q(112), 0, 0, TAU); }
  else if (k === 'pontuda') { ctx.moveTo(q(-84), q(-20)); ctx.bezierCurveTo(q(-86), q(-104), q(86), q(-104), q(84), q(-20)); ctx.bezierCurveTo(q(84), q(40), q(34), q(80), q(0), q(112)); ctx.bezierCurveTo(q(-34), q(80), q(-84), q(40), q(-84), q(-20)); }
  else if (k === 'caixa') { ctx.moveTo(q(-78), q(-90)); ctx.lineTo(q(78), q(-90)); ctx.quadraticCurveTo(q(98), q(-90), q(98), q(-70)); ctx.lineTo(q(98), q(70)); ctx.quadraticCurveTo(q(98), q(90), q(78), q(90)); ctx.lineTo(q(-78), q(90)); ctx.quadraticCurveTo(q(-98), q(90), q(-98), q(70)); ctx.lineTo(q(-98), q(-70)); ctx.quadraticCurveTo(q(-98), q(-90), q(-78), q(-90)); }
  else if (k === 'caveira') { ctx.moveTo(q(-84), q(-20)); ctx.bezierCurveTo(q(-86), q(-112), q(86), q(-112), q(84), q(-20)); ctx.bezierCurveTo(q(84), q(30), q(60), q(52), q(48), q(96)); ctx.lineTo(q(-48), q(96)); ctx.bezierCurveTo(q(-60), q(52), q(-84), q(30), q(-84), q(-20)); }
  else if (k === 'abobora') { ctx.ellipse(0, 0, q(118), q(88), 0, 0, TAU); }
  else if (k === 'croc') { ctx.moveTo(q(-48), q(-52)); ctx.lineTo(q(48), q(-52)); ctx.quadraticCurveTo(q(108), q(-52), q(108), q(8)); ctx.lineTo(q(108), q(50)); ctx.quadraticCurveTo(q(108), q(98), q(60), q(98)); ctx.lineTo(q(-60), q(98)); ctx.quadraticCurveTo(q(-108), q(98), q(-108), q(50)); ctx.lineTo(q(-108), q(8)); ctx.quadraticCurveTo(q(-108), q(-52), q(-48), q(-52)); }
  else { ctx.ellipse(0, 0, q(100), q(92), 0, 0, TAU); } ctx.closePath(); }
function olhosAn(S, o, lx, ey, e) { const a = S.an, cor = a.olhoCor || '#16101e';
  if (a.olhos === 'alien') { for (const s of [-1, 1]) { ctx.save(); ctx.translate(s * 38 + lx, ey + 4); ctx.rotate(s * -.35); ctx.beginPath(); ctx.ellipse(0, 0, 30, e === 'shut' ? 4 : (e === 'wide' ? 42 : 34), 0, 0, TAU); ctx.fillStyle = cor; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); ell(-9, -12, 9, 11); ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fill(); ell(10, 12, 4, 5); ctx.fill(); ctx.restore(); } return true; }
  if (a.olhos === 'orbitas') { for (const sd of [-1, 1]) { const x = sd * 36 + lx; ell(x, ey, 27, e === 'wide' ? 38 : 32); fs('#0a060e', 7); if (e !== 'shut') { ell(x + o.lx * 5, ey + 5, 6, 6); fs('#ff4b4b', 0); } } return true; }
  if (a.olhos === 'brilho') { const cor = a.olhoCor || '#e8f6ff'; for (const sd of [-1, 1]) { const x = sd * 38 + lx, g = ctx.createRadialGradient(x, ey, 2, x, ey, 48); g.addColorStop(0, cor + 'cc'); g.addColorStop(1, cor + '00'); ctx.fillStyle = g; ctx.fillRect(x - 50, ey - 50, 100, 100);
      if (e === 'shut') { line([x - 16, ey + 3, x + 16, ey + 3], 7, cor); continue; } ctx.save(); ctx.translate(x, ey); ctx.rotate(sd * .28); ell(0, 0, 21, e === 'wide' ? 26 : 13); fs(cor, 5); ctx.restore(); ell(x + o.lx * 4, ey + 1, 4, e === 'wide' ? 8 : 5); fs(INK, 0); } return true; }
  if (a.olhos === 'triangulos') { const cor = a.olhoCor || '#ffd23a'; for (const sd of [-1, 1]) { const x = sd * 38 + lx; ctx.beginPath(); ctx.moveTo(x - 26, ey + 18); ctx.lineTo(x + sd * 6, ey - 28); ctx.lineTo(x + 26, ey + 18); ctx.closePath(); fs(cor, 7); } return true; }
  if (a.olhos === 'bicho') { for (const sd of [-1, 1]) { const x = sd * 38 + lx;
      if (e === 'shut') { line([x - 14, ey + 4, x + 14, ey + 4], 7, '#ffffff'); continue; } if (e === 'happy') { ctx.beginPath(); ctx.moveTo(x - 14, ey + 8); ctx.quadraticCurveTo(x, ey - 14, x + 14, ey + 8); fs(null, 7, '#ffffff'); continue; }
      ell(x, ey + 2, 17, e === 'wide' ? 25 : 20); fs('#ffffff', 5); ell(x + o.lx * 5 - sd * 2, ey + 4 + o.ly * 4, 8, e === 'wide' ? 11 : 10); fs(INK, 0); ell(x + o.lx * 5 - sd * 2 - 3, ey - 1, 3, 3); ctx.fillStyle = '#fff'; ctx.fill(); } return true; }
  if (a.olhos === 'ciclope') { if (e === 'shut') { line([lx - 46, ey + 4, lx + 46, ey + 4], 9); return true; } ell(lx, ey, 54, e === 'wide' ? 64 : 56); fs('#fff7e0', 8); const ix = lx + o.lx * 14, iy = ey + 4 + o.ly * 10; ell(ix, iy, 26, 28); fs(a.olhoCor || '#3aa84a', 5); ell(ix, iy, 12, 15); fs(INK, 0); ell(ix - 7, iy - 8, 6, 6); ctx.fillStyle = '#fff'; ctx.fill(); return true; }
  if (a.olhos === 'molenga') { for (const [sd, rx, ry] of [[-1, 27, 29], [1, 15, 17]]) { const x = sd * 38 + lx; if (e === 'shut') { line([x - rx, ey + 4, x + rx, ey + 4], 7); continue; } ell(x, ey, rx, ry); fs('#fffbe8', 6); ell(x - sd * rx * .45 + o.lx * 3, ey + 3, rx * .42, ry * .42); fs(INK, 0); } return true; }
  if (a.olhos === 'saltado') { for (const sd of [-1, 1]) { const x = sd * 78 + lx; ell(x, -18, 30, 32); fs(a.pele, 7); ell(x, -16, 21, e === 'wide' ? 24 : 20); fs('#ffffff', 5); ell(x + o.lx * 5, -14 + o.ly * 4, 9, 11); fs(INK, 0); } return true; }
  if (a.olhos === 'croc') { for (const sd of [-1, 1]) { ell(sd * 52 + lx, -58, 30, 28); fs(a.pele, 7); ell(sd * 52 + lx, -56, 19, e === 'shut' ? 3 : (e === 'wide' ? 20 : 17)); fs('#f2d23a', 5); ell(sd * 52 + lx + o.lx * 5, -56, 5, e === 'shut' ? 2 : 16); fs(INK, 0); } return true; }
  if (a.olhos === 'visor') { rr(-80, ey - 26, 160, 56, 16); fs('#16222e', 8); for (const s of [-1, 1]) { const c = e === 'shut' ? '#335' : '#4ff0d8'; ell(s * 34 + lx, ey + 2, e === 'wide' ? 22 : 16, e === 'shut' ? 3 : (e === 'wide' ? 22 : 16)); fs(c, 0); ell(s * 34 + lx - 5, ey - 4, 5, 5); ctx.fillStyle = '#fff'; ctx.fill(); } return true; }
  return false; }

// ---- BOCA PRÓPRIA DOS MONSTROS (16/11, Filippe: "parece que tem duas bocas / parecem palhaços"): UMA boca só, fechada ou aberta (m 0..1) ----
const FECHADAS = ['flat', 'smile', 'frown', 'wavy', 'smug'];
function bocaAn(S, o, bx, my) { const k = S.an.boca, m = FECHADAS.includes(o.mouth) ? 0 : Math.min(1, .3 + o.mo * .9); const dente = (x, y, w, h, up) => { ctx.beginPath(); ctx.moveTo(x - w, y); ctx.lineTo(x, y + (up ? -h : h)); ctx.lineTo(x + w, y); ctx.closePath(); fs('#efe9d4', 3); };
  const abre = (w, hAb, cor = '#12060c') => { ctx.beginPath(); ctx.moveTo(bx - w, my); ctx.quadraticCurveTo(bx, my - 8 + hAb * 2, bx + w, my); ctx.quadraticCurveTo(bx, my + 6 + hAb * 2, bx - w, my); ctx.closePath(); fs(cor, 6); };
  if (k === 'sombra') { const sc = .22 + .78 * m, H = 84 * sc; ctx.save(); ctx.translate(bx, my - 34); ctx.scale(.62, .62); ctx.beginPath(); ctx.moveTo(-96, 20); ctx.quadraticCurveTo(0, 20 - 28 * m, 96, 20); ctx.quadraticCurveTo(110, 20 + H * .8, 0, 20 + H); ctx.quadraticCurveTo(-110, 20 + H * .8, -96, 20); ctx.closePath(); fs('#07040c', 7); ctx.save(); ctx.clip(); const gg = ctx.createRadialGradient(0, 20 + H * .7, 6, 0, 20 + H * .7, 90); gg.addColorStop(0, 'rgba(140,40,200,' + (.7 * m) + ')'); gg.addColorStop(1, 'rgba(7,4,12,0)'); ctx.fillStyle = gg; ctx.fillRect(-110, 0, 220, 160); ctx.restore();
    for (let i = 0; i < 12; i++) { const x = -86 + i * 15.6, up = 20 + 10 * Math.sin((x + 96) / 192 * PI) * m, len = (8 + 24 * m) + (i % 3) * 8 * m; dente(x, up - 1, 7, len, false); }
    if (m > .15) for (let i = 0; i < 10; i++) { const x = -78 + i * 17.4, lo = 20 + H * (.9 - .22 * Math.sin((x + 96) / 192 * PI)), len = 14 + 22 * m + ((i + 1) % 3) * 8; dente(x, lo, 7, len, true); }
    ctx.restore(); }
  else if (k === 'vampiro') { if (m < .1) { line([bx - 26, my + 2, bx - 6, my + 6, bx + 6, my + 6, bx + 26, my + 2], 6, '#5a1a3a'); } else { abre(34, 22 * m, '#3a0a1e'); } for (const sd of [-1, 1]) dente(bx + sd * 15, my + 4, 6, 20 + 14 * m, false); }
  else if (k === 'zumbi') { if (m < .1) { line([bx - 28, my + 6, bx - 8, my + 2, bx + 12, my + 8, bx + 30, my + 1], 6, '#2a1218'); dente(bx - 4, my + 5, 5, 9, false); dente(bx + 14, my + 6, 4, 7, false); } else { ctx.beginPath(); ctx.moveTo(bx - 30, my); ctx.quadraticCurveTo(bx, my + 6 + 36 * m, bx + 34, my - 4); ctx.quadraticCurveTo(bx + 4, my - 6, bx - 30, my); ctx.closePath(); fs('#2a1218', 6); dente(bx - 14, my + 2, 5, 12, false); dente(bx + 12, my, 5, 10, false); ell(bx + 4, my + 18 * m + 4, 12, 7 * m + 2); fs('#a64a5a', 0); } }
  else if (k === 'lobo') { if (m < .1) { line([bx - 30, my + 2, bx, my + 8, bx + 30, my + 2], 6, '#1d1218'); for (const sd of [-1, 1]) dente(bx + sd * 22, my + 5, 6, 16, false); } else { ctx.beginPath(); ctx.moveTo(bx - 40, my - 2); ctx.quadraticCurveTo(bx, my - 12, bx + 40, my - 2); ctx.quadraticCurveTo(bx + 44, my + 14 + 38 * m, bx, my + 18 + 44 * m); ctx.quadraticCurveTo(bx - 44, my + 14 + 38 * m, bx - 40, my - 2); ctx.closePath(); fs('#3a0a12', 6); ell(bx, my + 22 + 24 * m, 18, 8 + 8 * m); fs('#c85a6a', 0); for (let i = 0; i < 6; i++) dente(bx - 32 + i * 12.8, my - 1, 5, 12 + (i % 2) * 8, false); for (let i = 0; i < 5; i++) dente(bx - 26 + i * 13, my + 16 + 40 * m, 5, 12 + (i % 2) * 6, true); } }
  else if (k === 'palhaco') { const W = 80, ty = 30; ctx.beginPath(); ctx.moveTo(-W, ty); ctx.bezierCurveTo(-60, 100 + 14 * m, 60, 100 + 14 * m, W, ty); ctx.bezierCurveTo(50, ty + 26, -50, ty + 26, -W, ty); ctx.closePath();
    if (m > .1) { fs('#c4161e', 9); ctx.save(); ctx.clip(); ctx.beginPath(); ctx.moveTo(-W + 10, ty + 4); ctx.bezierCurveTo(-52, 84 + 12 * m, 52, 84 + 12 * m, W - 10, ty + 4); ctx.bezierCurveTo(40, ty + 22, -40, ty + 22, -W + 10, ty + 4); ctx.closePath(); fs('#3a0a12', 4); ctx.restore(); for (let i = 0; i < 9; i++) { const x = -56 + i * 14, t = (x + W) / (2 * W), top = ty + 12 + 4 * Math.sin(t * PI); dente(x, top, 5.5, 14, false); if (i % 2 && m > .5) dente(x, 66 + 12 * m * Math.sin(t * PI), 5, 11, true); } }
    else { fs('#d8222a', 8); for (let i = 0; i < 9; i++) { const x = -58 + i * 14.5, t = (x + W) / (2 * W); line([x, ty + 16 + 18 * Math.sin(t * PI), x + 1, ty + 26 + 26 * Math.sin(t * PI)], 4, '#f4f0f0'); } } }
  else if (k === 'esqueleto') { rr(bx - 48, my + 6, 96, 22, 6); fs('#efe8d4', 6); for (let i = -2; i <= 2; i++) line([bx + i * 18, my + 6, bx + i * 18, my + 28], 4); const drop = 26 * m; if (drop > 1) { rr(bx - 44, my + 30, 88, 14 + drop * .3, 6); ctx.fillStyle = '#0a060e'; ctx.fillRect(bx - 44, my + 28, 88, drop); rr(bx - 42, my + 28 + drop, 84, 16, 6); fs('#efe8d4', 6); for (let i = -2; i <= 2; i++) line([bx + i * 18, my + 28 + drop, bx + i * 18, my + 44 + drop], 4); } else { line([bx - 48, my + 28, bx + 48, my + 28], 4); } } }
function fimAn(S, o, lx, ly) { const f = S.an.feio || [], bx = lx * .9, my = 40 + ly * .8;
  if (f.includes('lingua')) { const w = Math.sin((o.t || 0) * 5) * 3; rr(bx - 4, my + 8, 30, 66, 15); fs('#ff7b8a', 6); line([bx + 11, my + 16, bx + 11, my + 56], 3, 'rgba(120,20,40,.5)'); }
  if (f.includes('baba')) { line([bx + 30, my + 14, bx + 32, my + 70], 6, 'rgba(190,235,255,.9)'); ell(bx + 32, my + 76, 8, 11); fs('rgba(190,235,255,.9)', 3); } }
function featAn(S, o, lx, ey, ly) { const f = S.an.feio || [], fo = S.an.focinho;
  if (f.includes('sorrisoPintado') && !S.an.boca) { ctx.beginPath(); ctx.moveTo(-96, 18); ctx.bezierCurveTo(-70, 120, 70, 120, 96, 18); ctx.lineWidth = 18; ctx.strokeStyle = '#d8222a'; ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); }
  if (f.includes('losango')) for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * 36 + lx, ey - 66); ctx.lineTo(sd * 36 + lx + 16, ey - 42); ctx.lineTo(sd * 36 + lx, ey - 20); ctx.lineTo(sd * 36 + lx - 16, ey - 42); ctx.closePath(); fs('#3b82f6', 5); }
  if (f.includes('narizBola')) { ell(0, 18, 24, 22); fs('#e0392d', 7); ell(-7, 11, 7, 6); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fill(); }
  if (f.includes('sorrisoDentes') && !S.an.boca) { ctx.beginPath(); ctx.moveTo(-96, 8); ctx.quadraticCurveTo(0, -18, 96, 8); ctx.quadraticCurveTo(110, 96, 0, 124); ctx.quadraticCurveTo(-110, 96, -96, 8); ctx.closePath(); fs('#07040c', 7); ctx.save(); ctx.clip(); const gg = ctx.createRadialGradient(0, 90, 6, 0, 90, 90); gg.addColorStop(0, 'rgba(140,40,200,.7)'); gg.addColorStop(1, 'rgba(7,4,12,0)'); ctx.fillStyle = gg; ctx.fillRect(-110, 0, 220, 140); ctx.restore();
    ctx.fillStyle = '#eaf6ff'; for (let i = 0; i < 12; i++) { const x = -86 + i * 15.6, up = 4 + 10 * Math.sin((x + 96) / 192 * PI), len = 20 + (i % 3) * 9; ctx.beginPath(); ctx.moveTo(x - 7, up); ctx.lineTo(x + (i % 2 ? 2 : -2), up + len); ctx.lineTo(x + 7, up); ctx.closePath(); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); }
    for (let i = 0; i < 10; i++) { const x = -78 + i * 17.4, lo = 112 - 22 * Math.sin((x + 96) / 192 * PI) , len = 18 + ((i + 1) % 3) * 10; ctx.beginPath(); ctx.moveTo(x - 7, lo); ctx.lineTo(x + (i % 2 ? -2 : 2), lo - len); ctx.lineTo(x + 7, lo); ctx.closePath(); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke(); } }
  if (f.includes('bocaAbobora')) { ctx.beginPath(); ctx.moveTo(-70, 30); for (let i = 0; i <= 8; i++) ctx.lineTo(-70 + i * 17.5, 30 + (i % 2 ? 36 : 10) + 24 * Math.sin(i / 8 * PI)); ctx.lineTo(70, 40); ctx.quadraticCurveTo(0, 20, -70, 30); ctx.closePath(); fs(S.an.olhoCor || '#ffd23a', 7); }
  if (f.includes('olheiras')) for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sd * 38 + lx, ey + 30, 34, 12, sd * -.15, 0, PI); ctx.fillStyle = 'rgba(70,20,70,.55)'; ctx.fill(); }
  if (f.includes('bochechasOcas')) for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * 80, 6); ctx.quadraticCurveTo(sd * 50, 40, sd * 30, 74); fs(null, 6, 'rgba(70,20,70,.45)'); }
  if (f.includes('costuras')) { line([-80, 34, -56, 52, -34, 72], 6, '#2a1a1a'); for (let k = 0; k < 4; k++) { const x = -80 + k * 15, y = 34 + k * 12.5; line([x - 7, y + 7, x + 7, y - 7], 4, '#2a1a1a'); } line([40, -76, 70, -52], 5, '#2a1a1a'); for (let k = 0; k < 3; k++) line([40 + k * 12 - 5, -76 + k * 8 + 7, 40 + k * 12 + 5, -76 + k * 8 - 4], 4, '#2a1a1a'); }
  if (f.includes('narizCaveira')) { ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(-12, 40); ctx.lineTo(12, 40); ctx.closePath(); fs('#0a060e', 5); }
  if (f.includes('dentesCaveira') && !S.an.boca) { rr(-48, 56, 96, 36, 8); fs('#efe8d4', 6); for (let i = -2; i <= 2; i++) line([i * 18, 56, i * 18, 92], 4); line([-48, 74, 48, 74], 4); }
  if (fo) { const my = 40 + ly * .8, bx = lx * .9;
    if (fo.f === 'longo') { rr(bx - 96, my - 38, 192, 96, 40); fs(fo.c, 7); for (const sd of [-1, 1]) { ell(bx + sd * 48, my - 22, 7, 5); fs(INK, 0); } for (let i = 0; i < 9; i++) { const x = bx - 80 + i * 20; ctx.beginPath(); ctx.moveTo(x - 7, my + 30); ctx.lineTo(x, my + 48 + (i % 2) * 6); ctx.lineTo(x + 7, my + 30); ctx.closePath(); fs('#f4efe0', 4); } }
    else if (fo.f === 'beicos') { ctx.beginPath(); ctx.ellipse(bx, my + 8, 60, 28, 0, 0, TAU); fs(fo.c, 8); line([bx - 54, my + 8, bx + 54, my + 8], 5); ctx.beginPath(); ctx.ellipse(bx, my + 28, 46, 18, 0, 0, TAU); fs(fo.c, 7); }
    else if (fo.f === 'bico') { ctx.beginPath(); ctx.moveTo(bx - 30, my - 20); ctx.lineTo(bx + 30, my - 20); ctx.quadraticCurveTo(bx + 22, my + 30, bx, my + 44); ctx.quadraticCurveTo(bx - 22, my + 30, bx - 30, my - 20); ctx.closePath(); fs(fo.c, 7); line([bx - 22, my + 4, bx + 22, my + 4], 4, 'rgba(36,23,38,.5)'); ctx.beginPath(); ctx.ellipse(bx + 2, my + 52, 12, 22, 0, 0, TAU); fs('#e0392d', 6); }
    else { ctx.beginPath(); ctx.ellipse(bx, my - 2, fo.w || 56, fo.h || 40, 0, 0, TAU); fs(fo.c, 7); }
    if (fo.chato) { for (const sd of [-1, 1]) { ell(bx + sd * 13, my - 10, 10, 7); fs(fo.nariz || '#1d1a24', 4); } }
    else if (fo.f !== 'bico' && fo.f !== 'beicos') { ctx.beginPath(); ctx.moveTo(bx - 16, my - 20); ctx.quadraticCurveTo(bx, my - 32, bx + 16, my - 20); ctx.quadraticCurveTo(bx + 10, my - 4, bx, my - 2); ctx.quadraticCurveTo(bx - 10, my - 4, bx - 16, my - 20); ctx.closePath(); fs(fo.nariz || '#1d1a24', 5); }
    if (fo.bigodes) for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) line([bx + sd * (36 + (fo.w || 56) * .3), my - 4 + k * 8, bx + sd * (100 + k * 6), my - 14 + k * 20], 3, 'rgba(36,23,38,.75)'); }
  if (S.an.rajasCara) for (const sd of [-1, 1]) { for (let k = 0; k < 3; k++) line([sd * 84, -10 + k * 24, sd * 58, -4 + k * 22], 8, '#2b1a14'); for (const dx of [-14, 0, 14]) line([dx, -100, dx * .8, -72], 8, '#2b1a14'); }
  if (S.an.faixa) { rr(-100, -88, 200, 26, 8); fs(S.an.faixa, 7); line([96, -78, 150, -56], 8, S.an.faixa); line([96, -72, 148, -34], 8, S.an.faixa); ell(0, -75, 16, 12); fs('#c9c9d2', 5); } // detalhes que dão personalidade: tuscas, verrugas, cicatriz, nariz grande, sobrancelha pesada
  if (f.includes('verrugas')) { const T = cabXf(S.an); ctx.save(); ctx.translate(0, T.dy); ctx.scale(T.wf / T.cs, 1); } if (f.includes('verrugas')) for (const [x, y, r] of [[-62, 26, 8], [48, -46, 7], [70, 18, 6], [-26, -74, 6]]) { ell(x, y, r, r); fs('#6b7a45', 4); ell(x - 2, y - 2, r * .3, r * .3); ctx.fillStyle = '#c8d9a0'; ctx.fill(); } if (f.includes('verrugas')) ctx.restore();
  if (f.includes('cicatriz')) { line([-60, -38, -34, 6, -8, 36], 6, '#5a2a30'); for (let k = 0; k < 4; k++) line([-54 + k * 14 - 6, -22 + k * 14, -54 + k * 14 + 8, -22 + k * 14 + 4], 4, '#5a2a30'); }
  if (f.includes('tusks')) for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 34, 62); ctx.quadraticCurveTo(s * 52, 60, s * 46, 20); ctx.quadraticCurveTo(s * 32, 42, s * 22, 56); ctx.closePath(); fs('#f4efe0', 6); }
  if (f.includes('nariz')) { ctx.beginPath(); ctx.moveTo(-8, ey + 14); ctx.quadraticCurveTo(18, ey + 40, 24, ey + 58); ctx.quadraticCurveTo(2, ey + 58, -16, ey + 50); ctx.closePath(); fs(mixc(S.an.pele, '#7a3a6a', .15), 6); ell(10, ey + 46, 5, 3); fs('#5a2a50', 0); ell(-12, ey + 50, 8, 7); fs('#7a4a4a', 3); }
  if (f.includes('sobrancelha')) for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 72, ey - 26); ctx.lineTo(s * 8, ey - 8); ctx.lineTo(s * 12, ey - 30); ctx.lineTo(s * 70, ey - 44); ctx.closePath(); fs(escuro(S.an.pele, .45), 6); }
  if (f.includes('olhoGrande')) { ell(32 + lx, ey, 28, 28); fs('#f2ecd0', 6); ell(32 + lx + o.lx * 5, ey + 2, 9, 11); ctx.fillStyle = '#b3201f'; ctx.fill(); ell(32 + lx + o.lx * 5, ey + 2, 4, 6); ctx.fillStyle = INK; ctx.fill(); }
  if (f.includes('olhosExtras')) for (const [x, y, r] of [[-70, 10, 12], [74, -34, 10], [60, 40, 8]]) { ell(x, y, r, r); fs('#fff6c8', 5); ell(x + 2, y + 1, r * .4, r * .45); ctx.fillStyle = INK; ctx.fill(); }
  if (f.includes('dentesTortos') && !S.an.boca) for (const [x, y] of [[-16, 62], [-2, 66], [14, 62], [28, 66]]) { ctx.beginPath(); ctx.moveTo(x - 6, y - 8); ctx.lineTo(x, y + 10); ctx.lineTo(x + 6, y - 8); ctx.closePath(); fs('#efe9c8', 4); }
  if (S.an.cabelo) { const c = S.an.cabelo; ctx.save(); cabAn(S.an.cab, (S.an.cabS || 1) * .98); ctx.clip(); ctx.beginPath(); ctx.moveTo(-110, -20); ctx.quadraticCurveTo(-96, -118, 0, -112); ctx.quadraticCurveTo(100, -118, 110, -20); const fr = S.an.franja || 0; ctx.quadraticCurveTo(70, -62 + fr, 40, -72 + fr); ctx.quadraticCurveTo(0, -50 + fr, -40, -74 + fr); /* V4: an.franja = franja mais baixa */ ctx.quadraticCurveTo(-80, -56, -110, -20); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke(); ctx.restore(); }
  if (S.an.picoCabelo) { ctx.beginPath(); ctx.moveTo(-26, -92); ctx.lineTo(0, -52); ctx.lineTo(26, -92); ctx.closePath(); fs(S.an.cabelo, 5); }
  if (S.an.tufos) { const T = cabXf(S.an); ctx.save(); ctx.scale(T.wf, T.cs); }
  if (S.an.tufos) for (const s of [-1, 1]) { for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(s * 94, -30 + k * 22); ctx.quadraticCurveTo(s * (140 + k * 8), -46 + k * 26, s * (150 - k * 6), -16 + k * 30); ctx.quadraticCurveTo(s * 118, -22 + k * 22, s * 96, -6 + k * 22); ctx.closePath(); fs(S.an.tufos, 5); } } if (S.an.tufos) ctx.restore(); }
let HC = null; // cores do chapéu do personagem atual (SPEC.hatCol)
const DEF = { x: 0, y: 0, sc: 1, f: 1, rot: 0, lean: 0, bob: 0, tilt: 0, sq: 1, aL: [-.22, .15], aR: [.22, -.15], lL: [-.07, 0], lR: [.07, 0],
  eye: 'dot', lx: 0, ly: 0, brow: 0, browY: 0, bRaise: 0, mouth: 'smile', mo: .5, blush: 0, sweat: 0, back: 0, hR: null, hL: null, shadow: 1, hat: 1, legs: 1, wind: 0, vento: 0 };
const UA = 70, LA = 66, TH = 76, SH = 72, SHX = 50, SHY = -150;
function limb(x, y, a, l1, l2) { const ex = x + Math.sin(a[0]) * l1, ey = y + Math.cos(a[0]) * l1, b = a[0] + a[1]; return [x, y, ex, ey, ex + Math.sin(b) * l2, ey + Math.cos(b) * l2]; }
function ik(sx, sy, tx, ty, l1, l2, sg) {
  const dx = tx - sx, dy = ty - sy; let d = Math.hypot(dx, dy); d = Math.min(d, l1 + l2 - .5); d = Math.max(d, Math.abs(l1 - l2) + 1);
  const base = Math.atan2(dx, dy), al = Math.acos(C((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), be = Math.acos(C((l1 * l1 + l2 * l2 - d * d) / (2 * l1 * l2), -1, 1));
  return [base + sg * al, -sg * (PI - be)];
}
// BRAÇO NATURAL (15/11, vale p/ toda a série): Filippe pegou braço "bugado" (cotovelo dobrado pra cima/pra dentro, palito em zigue-zague).
// IK: alvo colado no ombro é empurrado pra 62% do alcance (braço quase reto, nunca dobra até sumir) e o cotovelo
// escolhido é o que fica MAIS BAIXO e pra fora (como braço de gente); a.s força o lado só se precisar.
// Ângulo direto: dobra do cotovelo limitada a 110°.
function armG(side, a) {
  const sx = side * SHX, R = UA + LA;
  if (a.ik) { let [tx, ty] = a.ik, dx = tx - sx, dy = ty - SHY, d = Math.hypot(dx, dy); const dmin = 0.62 * R;
    if (d < dmin) { if (d < 1) { dx = side; dy = 1; d = 1; } tx = sx + dx / d * dmin; ty = SHY + dy / d * dmin; }
    if (a.s != null) return limb(sx, SHY, ik(sx, SHY, tx, ty, UA, LA, a.s), UA, LA);
    const g1 = limb(sx, SHY, ik(sx, SHY, tx, ty, UA, LA, 1), UA, LA), g2 = limb(sx, SHY, ik(sx, SHY, tx, ty, UA, LA, -1), UA, LA);
    const nota = (g) => g[3] + 0.35 * side * (g[2] - sx); return nota(g1) >= nota(g2) ? g1 : g2; }
  return limb(sx, SHY, [a[0], Math.max(-1.92, Math.min(1.92, a[1]))], UA, LA);
}
function blink(t, seed) { const per = 2.6 + seed * .37; return ((t + seed * .71) % per) < .1; }
function hipOf(o) { const tc = TH * (o.coxa ?? 1), gL = limb(-20, 0, o.lL || DEF.lL, tc, SH), gR = limb(20, 0, o.lR || DEF.lR, tc, SH); return (o.hipY != null ? o.hipY : -Math.max(gL[5], gR[5])) + (o.bob || 0); }
// ponto do mundo -> coordenadas do corpo (origem no quadril, já com inclinação)
function toBody(n, o, wx, wy) { const sc = SPEC[n].s * (o.sc || 1), f = o.f || 1; const dx = (wx - o.x) / (sc * f), dy = (wy - o.y) / sc - hipOf(o); const l = -(o.lean || 0) * 1; return [dx * Math.cos(l) - dy * Math.sin(l), dx * Math.sin(l) + dy * Math.cos(l)]; }

function drawChar(n, p, t) {
  const S = SPEC[n], o = Object.assign({}, DEF, S.def || {}, p), sc = S.s * o.sc;
  ctx.save(); ctx.translate(o.x, o.y);
  if (o.shadow && !o.rot) { const k = 1 + Math.min(0, o.bob) / 400; ctx.fillStyle = 'rgba(0,0,0,.16)'; ell(0, 3, 92 * sc * k, 17 * sc); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,.24)'; ell(0, 2, 58 * sc * k, 9 * sc); ctx.fill(); }
  ctx.rotate(o.rot); ctx.scale(sc * o.f, sc); ctx.scale(1 / Math.sqrt(o.sq), o.sq);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const gL = limb(-20, 0, o.lL, TH * (o.coxa ?? 1), SH), gR = limb(20, 0, o.lR, TH * (o.coxa ?? 1), SH); // coxa<1 = escorço (coxa vindo pra câmera)
  ctx.translate(0, hipOf(o));
  if (o.legs) { if (S.an) { if (!S.an.semPernas) { legAn(gL, S, -1); legAn(gR, S, 1); } } else { leg(gL, 1.04 / S.s); leg(gR, 1.04 / S.s); } }
  ctx.rotate(o.lean);
  if (o.behind) o.behind();
  if (S.capa) capaDe(S, o, t);
  if (S.an) bodyAn(S, o); else body(S, o);
  const A = (side, a) => armG(side, a);
  const pL = A(-1, o.aL), pR = A(1, o.aR);
  ctx.save(); ctx.translate(0, -190); ctx.rotate(o.tilt); ctx.translate(0, -70); head(S, o, t); ctx.restore();
  if (o.front) o.front();
  if (S.an) { armAn(pL, o.hL, S, -1); armAn(pR, o.hR, S, 1); } else { arm(pL, o.hL, S.body, S.pele, 1.04 / S.s, o.aponta === "L"); arm(pR, o.hR, S.body, S.pele, 1.04 / S.s, o.aponta === "R"); }
  ctx.restore();
}
// ---- auditaPose: checagem automática (texto, sem imagem) de pose quebrada + caixa do boneco ----
// Pega o tipo de erro do braço do capitão no V4 (alvo do IK colado no ombro -> braço dobra e o cotovelo espeta).
function auditaPose(n, p) {
  const S = SPEC[n] || { s: 1 }, o = Object.assign({}, DEF, p), av = [], R = UA + LA, hip = hipOf(o), topo = -260 - 92 - (String(S.hat).startsWith('chef') ? 150 : (S.hat === 'bruxa' || S.hat === 'fogo' || S.hat === 'cartola') ? 160 : S.hat ? 95 : (S.antenas || S.chifres || S.espinhos) ? 90 : 0);
  const pts = [];
  for (const [side, a, nome] of [[-1, o.aL, 'esquerdo'], [1, o.aR, 'direito']]) {
    if (!a) continue; const sx = side * SHX; let g;
    if (a.ik) { const d = Math.hypot(a.ik[0] - sx, a.ik[1] - SHY);
      if (d > R + 4) av.push(`braço ${nome} não alcança o alvo (faltam ${(d - R) | 0}): mão longe do objeto`);
    }
    g = armG(side, a);
    { const b = Math.atan2(g[4] - g[2], g[5] - g[3]) - Math.atan2(g[2] - g[0], g[3] - g[1]), bend = Math.abs(Math.atan2(Math.sin(b), Math.cos(b)));
      if (g[3] < SHY - 40 && g[5] > g[3] + 25) av.push(`braço ${nome} com cotovelo espetado pra cima (cotovelo acima do ombro e mão abaixo dele)`); }
    const cotY = g[3], maoY = g[5];
    if (cotY < topo + 40 && maoY > cotY + 20) av.push(`cotovelo ${nome} espetado acima da cabeça com a mão abaixo dele`);
    if (cotY < -260 && Math.abs(g[2]) < 95 && Math.abs(g[4]) < 95 && !o.hR && !o.hL) av.push(`braço ${nome} todo atrás/na frente da cabeça (lê como palito saindo do chapéu)`);
    pts.push([g[2], g[3] + hip], [g[4], g[5] + hip]);
    if (o.aponta === (side < 0 ? 'L' : 'R') && !o[side < 0 ? 'hL' : 'hR']) {
      const ang = Math.atan2(g[5] - g[3], g[4] - g[2]);
      const ponta = 27 * 1.04 / S.s;
      pts.push([g[4] + Math.cos(ang) * ponta, g[5] + hip + Math.sin(ang) * ponta]);
    }
  }
  pts.push([-110, topo + hip], [110, topo + hip], [-70, 0], [70, 0]);
  const sc = S.s * (o.sc || 1); const xs = pts.map((q) => q[0] * sc), ys = pts.map((q) => q[1] * sc);
  return { avisos: av, bb: [Math.min(...xs) - 15, Math.max(...xs) + 15, Math.min(...ys) - 15, Math.max(...ys)] };
}
function leg(g, traço) {
  line(g, 23 * traço); line(g, 13 * traço, '#494653'); line(g, 4 * traço, 'rgba(255,255,255,.22)');
  ell(g[4] + 12 * traço, g[5], 28 * traço, 13 * traço); fs('#332b3b', 4 * traço);
}
function arm(g, pr, manga, pele = '#efe8df', traço = 1, aponta = false) {
  line(g, 22 * traço); line(g, 12 * traço, manga); line(g, 4 * traço, 'rgba(255,255,255,.22)');
  if (pr) prop(pr.k, g[4], g[5], pr.a, pr.s || 1, pr);
  if (aponta && !pr) {
    const direcao = Math.atan2(g[5] - g[3], g[4] - g[2]);
    const dedo = [g[4], g[5], g[4] + Math.cos(direcao) * 27 * traço, g[5] + Math.sin(direcao) * 27 * traço];
    line(dedo, 13 * traço); line(dedo, 7 * traço, pele);
  }
  ell(g[4], g[5], 14 * traço, 13 * traço); fs(pele, 5 * traço);
}
function body(S, o) {
  const path = () => rr(-60, -204, 120, 214, [60, 60, 36, 36]);
  path(); fs(S.body, 0);
  ctx.save(); path(); ctx.clip();
  if (S.n === 'tiao' || S.base === 'tiao') {
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
  if (S.emblema) emblemaDe(S);
  if (S.stripes) { ctx.fillStyle = S.stripes; for (let k = 0; k < 5; k++) ctx.fillRect(-70, -176 + k * 40, 140, 15); }
  if (S.vestido) { // roupa de pirata mulher: blusa (body) + corpete com cordão dourado + decote de babado
    const [cp] = S.vestido; rr(-62, -138, 124, 118, [26, 26, 8, 8]); fs(cp, 0);
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(-62, -30, 124, 10);
    for (let k = 0; k < 4; k++) { const y = -124 + k * 24; line([-14, y, 14, y + 12], 4, '#f2c230'); line([14, y, -14, y + 12], 4, '#f2c230'); }
    ctx.beginPath(); ctx.moveTo(-40, -204); ctx.quadraticCurveTo(-30, -170, 0, -160); ctx.quadraticCurveTo(30, -170, 40, -204); fs(null, 5, 'rgba(36,23,38,.5)');
    for (let k = -2; k <= 2; k++) { ell(k * 18, -150 + Math.abs(k) * 6, 10, 7); fs('#ffffff', 3); } }
  if (S.coat) { // casaca preta: lapelas roxas, botões dourados, faixa vermelha na cintura
    ctx.fillStyle = '#6b3fa0'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 4, -204); ctx.lineTo(s * 40, -204); ctx.lineTo(s * 8, -120); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = '#f3efe6'; ctx.beginPath(); ctx.moveTo(-8, -204); ctx.lineTo(8, -204); ctx.lineTo(0, -150); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f2c230'; for (let k = 0; k < 3; k++) for (const s of [-1, 1]) { ell(s * 24, -104 + k * 26, 6, 6); ctx.fill(); }
    ctx.fillStyle = '#c8202a'; ctx.fillRect(-70, -34, 140, 22); }
  if (S.vest) { // colete roxo-escuro: talabarte cruzado + cinto com fivela
    ctx.save(); ctx.translate(0, -100); ctx.rotate(.62); ctx.fillStyle = '#6b4325'; ctx.fillRect(-140, -11, 280, 22); ctx.restore();
    ctx.fillStyle = '#2a1e18'; ctx.fillRect(-70, -30, 140, 18); ctx.fillStyle = '#c9c9d2'; ctx.fillRect(-12, -32, 24, 22); }
  // relevo: luz de cima/esquerda, sombra embaixo/direita, sombra do pescoço
  { const g = ctx.createLinearGradient(-60, 0, 60, 0); g.addColorStop(0, 'rgba(255,255,255,.32)'); g.addColorStop(.3, 'rgba(255,255,255,.06)'); g.addColorStop(.65, 'rgba(10,20,40,.08)'); g.addColorStop(1, 'rgba(10,20,40,.42)'); ctx.fillStyle = g; ctx.fillRect(-80, -220, 160, 250);
    const g2 = ctx.createLinearGradient(0, -60, 0, 12); g2.addColorStop(0, 'rgba(10,20,40,0)'); g2.addColorStop(1, 'rgba(10,20,40,.22)'); ctx.fillStyle = g2; ctx.fillRect(-80, -60, 160, 80);
    ell(0, -206, 52, 18); ctx.fillStyle = 'rgba(10,20,40,.18)'; ctx.fill(); rr(-48, -190, 12, 150, 6); ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fill(); }
  if (S.chamusco) fuligem([[-30, -150, 34], [36, -90, 40], [-20, -40, 30], [40, -180, 22], [-46, -96, 18]], 0.5);
  ctx.restore(); path(); fs(null, 8);
  espinhosCosta(S);
  if (S.n === 'cap') { for (const s of [-1, 1]) { ell(s * 56, -182, 26, 12, s * .2); fs('#f2c230', 5); } }
  if (S.coat) { for (const s of [-1, 1]) { ell(s * 56, -182, 24, 11, s * .2); fs('#f2c230', 5); } }
  if (S.vestido) { const [, sa] = S.vestido; // saia rodada (cobre o alto das pernas) com barra dourada
    const sk = () => { ctx.beginPath(); ctx.moveTo(-62, -24); ctx.quadraticCurveTo(-82, 20, -104, 66); ctx.quadraticCurveTo(-52, 84, 0, 76); ctx.quadraticCurveTo(52, 84, 104, 66); ctx.quadraticCurveTo(82, 20, 62, -24); ctx.closePath(); };
    sk(); fs(sa, 8); ctx.save(); sk(); ctx.clip(); line([-104, 60, -52, 76, 0, 70, 52, 76, 104, 60], 9, '#f2c230');
    for (const x of [-46, 0, 46]) line([x * 0.6, -18, x * 1.4, 70], 4, 'rgba(0,0,0,.18)');
    const g = ctx.createLinearGradient(-100, 0, 100, 0); g.addColorStop(0, 'rgba(255,255,255,.18)'); g.addColorStop(1, 'rgba(10,20,40,.3)'); ctx.fillStyle = g; ctx.fillRect(-110, -30, 220, 120); ctx.restore(); sk(); fs(null, 8);
    for (const s of [-1, 1]) { ell(s * 58, -190, 22, 16); fs('#ffffff', 5); } }
}
function head(S, o, t) {
  const cabeloSolto = !S.penteado || S.penteado === "longo";
  if (S.hair && cabeloSolto && !o.back) hair(S.hair, t);
  extraAtras(S, o, t);
  { const g = ctx.createRadialGradient(-34, -38, 8, -10, -8, 128); const fem = S.feminina || S.makeup || S.semRelevoQueixo; g.addColorStop(0, '#ffffff'); g.addColorStop(.45, fem ? '#fdf8f6' : '#f1f4f8'); g.addColorStop(1, fem ? '#ead6d0' : '#a9b7c9'); if (S.an) { const A = S.an; g.addColorStop(0, '#ffffff'); }
    if (S.an) { cabAn(S.an.cab, S.an.cabS || 1); const A = S.an, g2 = ctx.createRadialGradient(-34, -38, 8, -10, -8, 128); g2.addColorStop(0, claro(A.pele, .45)); g2.addColorStop(.45, A.pele); g2.addColorStop(1, escuro(A.pele, .32)); fs(g2, 8); } else { ell(0, 0, 100, 92); fs(g, 8); }
    if (!fem) { ctx.save(); if (S.an) cabAn(S.an.cab, (S.an.cabS || 1) * .96); else ell(0, 0, 96, 88); ctx.clip(); ctx.beginPath(); ctx.arc(14, 10, 96, PI * .05, PI * .55); ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.stroke(); ctx.restore(); }
    if (!fem && !S.an) { ctx.save(); ell(0, 0, 96, 88); ctx.clip(); ell(18, 64, 92, 40); ctx.fillStyle = 'rgba(30,40,70,.10)'; ctx.fill(); ctx.restore(); }
    if (S.pele) { ctx.save(); ell(0, 0, 96, 88); ctx.clip(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = S.pele; ctx.fillRect(-100, -96, 200, 192); ctx.restore(); }
    if (!S.an) { ell(-50, -46, 20, 11, -.6); ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.fill(); } else { ell(-50, -46, 16, 8, -.6); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fill(); } }
  if (S.hair && cabeloSolto && !o.back) for (const s of [-1, 1]) { ell(s * 86, -34, 20, 32, s * 0.35); fs(S.hair, 6); }
  if (S.hair && (S.penteado || S.feminina) && !o.back) cabeloFrente(S.hair, S.penteado || 'longo');
  if (S.chamusco && !o.back) { ctx.save(); ell(0, 0, 96, 88); ctx.clip(); fuligem([[-60, 30, 30], [62, -20, 26], [10, 70, 34], [-30, -60, 18]], 0.42); ctx.restore(); }
  if (!o.back) face(S, o, t);
  // vento (grito na cara, ventania): chapéu levanta e inclina pra trás tremendo; vento>0.85 = chapéu quase saindo
  if (S.capacete && !o.back) capaceteFrente(S);
  HC = S.hatCol || null; if (o.hat) { ctx.save(); if (S.an) { const T = cabXf(S.an); ctx.translate(0, T.dy); ctx.scale(Math.min(1.1, Math.max(.9, T.wf / T.cs)), 1); } if (o.vento) { const v = o.vento, tr = Math.sin(t * 47) * 0.06 * v; ctx.translate(-v * 34, -v * 30 - Math.abs(Math.sin(t * 31)) * 8 * v); ctx.rotate(-v * 0.38 + tr); } hat(S.hat, t, o.wind + (o.vento || 0)); ctx.restore(); } HC = null;
  if (S.makeup && !o.back && !o.blush) o = { ...o, blush: 0.55 };
  if (o.blush && !o.back) { ctx.globalAlpha = o.blush * .75; ctx.fillStyle = '#ff8a9a'; const lx = o.lx * 16; ell(-58 + lx, 30, 18, 10); ctx.fill(); ell(58 + lx, 30, 18, 10); ctx.fill(); ctx.globalAlpha = 1; }
  if (o.sweat) { const sy = ((t * 1.2) % 1) * 40; drop(96 - o.lx * 10, -30 + sy, 1); }
}
function drop(x, y, s) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(0, -24); ctx.quadraticCurveTo(14, -2, 12, 8); ctx.arc(0, 8, 12, 0, PI); ctx.quadraticCurveTo(-14, -2, 0, -24); ctx.closePath(); fs('#8fd6ff', 5); ctx.restore(); }
function face(S, o, t) {
  if (S.an && S.an.semRosto) return;
  const lx = o.lx * 16, ly = o.ly * 12, ey = -6 + ly; let e = o.eye; if (!['dot','wide','happy','shut','smug','x'].includes(e)) e = 'dot'; /* V4: valor desconhecido (look/grin/blink/wink) desenhava SEM olho */ if (e === 'dot' && blink(t, S.seed)) e = 'shut';
  if (S.mascara) mascaraDe(S, lx, ey);
  if (S.an && S.an.manchaOlho) for (const sd of [-1, 1]) { ctx.save(); ctx.translate(sd * 38 + lx, ey + 4); ctx.rotate(sd * .5); ell(0, 0, 30, 44); fs(S.an.manchaOlho, 0); ctx.restore(); }
  if (!(S.an && olhosAn(S, o, lx, ey, e))) for (const s of [-1, 1]) eye(e, s * 31 + lx, ey, o);
  if (S.olho3) { ctx.save(); ctx.translate(lx * .8, -66 + ly); ctx.scale(.62, .62); eye(e === 'dot' ? 'wide' : e, 0, 0, o); ctx.restore(); }
  if (S.oculos) oculosDe(S, lx, ey);
  if (S.makeup && e !== 'shut' && e !== 'happy') for (const s of [-1, 1]) { if (S.patch && s < 0) continue; const x = s * 31 + lx, top = e === 'wide' ? 23 : 13;
    for (const k of [0, 1, 2]) { const a = (-0.2 + k * 0.45) * s, x0 = x + s * (2 + k * 5), y0 = ey - top + k * 3; line([x0, y0, x0 + Math.sin(a + s * .5) * 14, y0 - Math.cos(a) * 14], 5); } }
  if (o.brow !== null && !(S.an && S.an.sobr === false)) for (const s of [-1, 1]) {
    const by = -44 + ly - o.browY * 12 - (s > 0 ? o.bRaise * 14 : 0), inner = s * 13 + lx, outer = s * 50 + lx;
    line([outer, by - o.brow * 8, inner, by + o.brow * 10], 7);
  }
  if (S.barbona) { const bx = lx * .9, by = 40 + ly * .8; ctx.beginPath(); ctx.moveTo(bx - 78, by - 26); ctx.quadraticCurveTo(bx - 98, by + 60, bx - 40, by + 104); ctx.quadraticCurveTo(bx - 14, by + 88, bx, by + 120); ctx.quadraticCurveTo(bx + 14, by + 88, bx + 40, by + 104); ctx.quadraticCurveTo(bx + 98, by + 60, bx + 78, by - 26); ctx.quadraticCurveTo(bx, by + 24, bx - 78, by - 26); ctx.closePath(); fs(S.barbona, 7);
    for (const s of [-1, 1]) line([bx + s * 44, by + 20, bx + s * 52, by + 70], 4, 'rgba(120,30,30,.35)'); ell(bx, by + 4, 34, 16); fs('#f4efe4', 0); }
  if (S.an) featAn(S, o, lx, ey, ly);
  if (S.an && S.an.boca) bocaAn(S, o, lx * .9, 40 + ly * .8); else if (!(S.an && S.an.semBoca)) mouth(o.mouth, lx * .9, 40 + ly * .8, o.mo);
  if (S.an) fimAn(S, o, lx, ly);
  if (S.makeup) lips(o.mouth, lx * .9, 40 + ly * .8, o.mo, S.makeup);
  if (S.stache) stache(lx * .9, 22 + ly * .8);
  if (S.presas && !(S.an && S.an.boca)) { const L = S.an && S.an.presasG ? 54 : 28; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 22 + lx * .9, 40 + ly * .8); ctx.lineTo(s * 38 + lx * .9, 40 + ly * .8); ctx.lineTo(s * 30 + lx * .9, 40 + L + ly * .8); ctx.closePath(); fs('#ffffff', 4); } }
  if (S.beard) { ctx.fillStyle = 'rgba(42,30,30,.35)'; for (let i = 0; i < 16; i++) { const a = PI * (.12 + .76 * i / 15); ell(lx * .9 + Math.cos(a) * 62, 40 + ly * .8 + Math.sin(a) * 40, 4, 4); ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(lx * .9 - 20, 66 + ly * .8); ctx.quadraticCurveTo(lx * .9, 104 + ly * .8, lx * .9 + 20, 66 + ly * .8); ctx.closePath(); fs('#3a2622', 5);
    ctx.beginPath(); ctx.arc(-98, 34, 12, 0, TAU); fs(null, 6, '#f2c230'); }
  if (S.earring && !S.beard) { ctx.beginPath(); ctx.arc(98, 40, 13, 0, TAU); fs(null, 6, '#f2c230'); ell(98, 56, 6, 6); fs('#f2c230', 3); }
  if (S.patch) { line([-98, -52 + ly, -31 + lx, ey - 14, 96, -66 + ly], 7); ell(-31 + lx, ey + 2, 27, 24, -.15); fs(INK, 0); ell(-38 + lx, ey - 6, 8, 5, -.4); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fill(); }
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
function lips(m, x, y, mo, c) { // batom: contorno grosso colorido seguindo a boca (arco do cupido em cima)
  ctx.save(); ctx.lineCap = 'round';
  if (m === 'grin' || m === 'bigsmile') { const h = m === 'grin' ? 16 + 30 * mo : 32; ctx.beginPath(); ctx.moveTo(x - 33, y - 7); ctx.quadraticCurveTo(x - 16, y - 16, x, y - 8); ctx.quadraticCurveTo(x + 16, y - 16, x + 33, y - 7); fs(null, 9, c);
    ctx.beginPath(); ctx.moveTo(x - 31, y - 4); ctx.quadraticCurveTo(x - 31, y + h + 2, x, y + h + 3); ctx.quadraticCurveTo(x + 31, y + h + 2, x + 31, y - 4); fs(null, 8, c); }
  else if (m === 'shout' || m === 'o') { const rx = m === 'o' ? 16 : 16 + 10 * mo, ry = m === 'o' ? 18 : 10 + 24 * mo; ell(x, y + 8, rx + 3, ry + 3); fs(null, 8, c); }
  else if (m === 'smile' || m === 'flat' || m === 'smirk') { ctx.beginPath(); ctx.moveTo(x - 24, y); ctx.quadraticCurveTo(x, y + (m === 'smile' ? 18 : 6), x + 24, y); fs(null, 10, c); ell(x, y + (m === 'smile' ? 12 : 8), 10, 5); ctx.fillStyle = c; ctx.fill(); }
  ctx.restore();
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
// fuligem (Tião queimado): manchas de carvão com borda irregular, sem gore
function fuligem(pts, a = 0.5) { for (const [x, y, r] of pts) { const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r); g.addColorStop(0, `rgba(40,30,34,${a})`); g.addColorStop(0.7, `rgba(40,30,34,${a * 0.6})`); g.addColorStop(1, 'rgba(40,30,34,0)');
  ctx.fillStyle = g; ctx.beginPath(); for (let i = 0; i < 12; i++) { const an = i / 12 * TAU, rr_ = r * (0.8 + 0.25 * Math.sin(i * 2.7 + x)); ctx.lineTo(x + Math.cos(an) * rr_, y + Math.sin(an) * rr_); } ctx.closePath(); ctx.fill(); } }
function stache(x, y) { ctx.fillStyle = INK; for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x, y); ctx.bezierCurveTo(x + s * 18, y - 16, x + s * 46, y - 10, x + s * 52, y + 12); ctx.bezierCurveTo(x + s * 36, y + 2, x + s * 18, y + 14, x, y + 6); ctx.closePath(); ctx.fill(); } }
function hat(k, t, wind = 0) {
  if (k === 'gnomo') { ctx.beginPath(); ctx.moveTo(-84, -70); ctx.quadraticCurveTo(-60, -130, 20, -190); ctx.quadraticCurveTo(70, -214, 96, -180); ctx.quadraticCurveTo(60, -176, 62, -130); ctx.quadraticCurveTo(84, -90, 88, -66); ctx.quadraticCurveTo(0, -102, -84, -70); ctx.closePath(); fs(HC?.[0] ?? '#e0392d', 8); ell(96, -178, 14, 14); fs('#ffffff', 5); }
  else if (k === 'cartola') { // cartola preta com fita (HC: copa, fita)
    ell(0, -82, 118, 20); fs('#1d1a24', 8); rr(-62, -196, 124, 118, [10, 10, 4, 4]); fs(HC?.[0] ?? '#1d1a24', 8); rr(-62, -122, 124, 26, 2); fs(HC?.[1] ?? '#8a2be2', 6); ell(0, -190, 62, 14); fs('#2b2733', 6);
  } else if (k === 'bruxa') { // chapéu de bruxa pontudo torto (HC: copa, fita)
    ell(0, -82, 126, 22); fs(HC?.[0] ?? '#3a2a5a', 8); ctx.beginPath(); ctx.moveTo(-62, -88); ctx.quadraticCurveTo(-34, -160, 60, -252); ctx.quadraticCurveTo(64, -190, 66, -88); ctx.closePath(); fs(HC?.[0] ?? '#3a2a5a', 8); rr(-64, -122, 130, 26, 4); fs(HC?.[1] ?? '#f2b233', 6); rr(-14, -122, 28, 26, 3); fs('#d9d9e8', 4);
  } else if (k === 'fogo') { // cabelo de fogo (Curupira): línguas de chama
    const L = [[-70, 70, -14], [-36, 120, 8], [0, 150, -6], [36, 118, 10], [70, 76, 14]];
    const fm = (e) => { ctx.beginPath(); ctx.moveTo(-84, -70); for (const [x, h, cv] of L) { ctx.quadraticCurveTo(x - 26, -70 - h * e * .5, x + cv * e, -80 - h * e); ctx.quadraticCurveTo(x + 22, -70 - h * e * .4, x + 28, -70); } ctx.lineTo(84, -70); ctx.closePath(); };
    const fl = Math.sin(t * 14) * 5; ctx.save(); ctx.translate(0, fl * .3); fm(1); fs('#ff5a14', 9); fm(.68); fs('#ffa424', 0); fm(.36); fs('#fff0a0', 0); ctx.restore();
  } else if (k === 'coroa') { // coroa dourada
    ctx.beginPath(); ctx.moveTo(-62, -84); ctx.lineTo(-66, -150); ctx.lineTo(-34, -118); ctx.lineTo(0, -168); ctx.lineTo(34, -118); ctx.lineTo(66, -150); ctx.lineTo(62, -84); ctx.closePath(); fs('#f2c230', 8);
    for (const [x, y, c] of [[-66, -154, '#d8322a'], [0, -172, '#3b82f6'], [66, -154, '#d8322a']]) { ell(x, y, 9, 9); fs(c, 4); }
  } else if (k === 'chefRasgado') { // chef do Tião da volta 4.000: copa cinza-fumaça, um gomo arrancado (borda serrilhada queimada), faixa encardida
    const pf = [[-48, -150, 40], [0, -166, 44], [-28, -128, 40], [28, -128, 40]];
    ctx.lineWidth = 16; ctx.strokeStyle = INK; for (const [a, b, r] of pf) { ell(a, b, r, r); ctx.stroke(); }
    for (const [a, b, r] of pf) { const g = ctx.createRadialGradient(a - r * .35, b - r * .4, 2, a, b, r * 1.05); g.addColorStop(0, '#d9d6d2'); g.addColorStop(1, '#8e8a90'); ell(a, b, r, r); ctx.fillStyle = g; ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(30, -186); const zz = [[44, -170], [36, -160], [54, -150], [44, -140], [62, -128], [50, -118]]; for (const [x, y] of zz) ctx.lineTo(x, y); ctx.lineTo(28, -118); ctx.closePath(); fs('#3a2c30', 6);
    for (const [x, y] of zz) { ell(x, y, 5, 5); ctx.fillStyle = '#ff8a2a'; ctx.fill(); }
    fuligem([[-40, -150, 22], [10, -170, 18]], 0.45);
    rr(-64, -124, 128, 46, 8); fs('#cfc9c2', 8); fuligem([[-30, -100, 26], [34, -104, 22]], 0.5); line([-58, -82, -30, -96, -10, -84], 4, '#3a2c30');
  } else if (k === 'chef') {
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
    ctx.beginPath(); ctx.moveTo(92, -38); ctx.lineTo(140 + wind * 30, -70 + w); ctx.lineTo(134 + wind * 30, -30 + w); ctx.closePath(); fs(HC?.[1] ?? '#c92a22', 6);
    ctx.beginPath(); ctx.moveTo(92, -32); ctx.lineTo(136 + wind * 34, -4 - w); ctx.lineTo(110 + wind * 20, -8 - w); ctx.closePath(); fs(HC?.[1] ?? '#c92a22', 6);
    const pth = () => { ctx.beginPath(); ctx.moveTo(-101, -22); ctx.ellipse(0, 0, 104, 96, 0, PI * 1.07, PI * 1.93); ctx.quadraticCurveTo(0, -52, -101, -22); ctx.closePath(); };
    pth(); fs(HC?.[0] ?? '#d8322a', 0); ctx.save(); pth(); ctx.clip(); ctx.fillStyle = '#fff'; for (const [a, b] of [[-60, -60], [-10, -80], [40, -64], [70, -40], [-80, -32], [10, -50]]) { ell(a, b, 7, 7); ctx.fill(); } ctx.restore(); pth(); fs(null, 8);
  } else if (k === 'beanie') {
    if (HC?.[2] !== null) { ell(0, -112, 22, 22); fs(HC?.[2] ?? '#ece4d2', 7); }
    ctx.beginPath(); ctx.moveTo(-98, -34); ctx.ellipse(0, 0, 103, 97, 0, PI * 1.1, PI * 1.9); ctx.lineTo(98, -34); ctx.closePath(); fs(HC?.[0] ?? '#55658c', 8);
    rr(-106, -52, 212, 32, 14); fs(HC?.[1] ?? '#44527a', 7);
  } else if (k === 'chapelao') { // chapelão de aba larga com pluma (HC: copa, fita, pluma)
    const pl = Math.sin(t * 4) * 4;
    ctx.beginPath(); ctx.moveTo(30, -150); ctx.quadraticCurveTo(110 + pl, -250, 170 + pl, -200); ctx.quadraticCurveTo(120, -190, 60, -130); ctx.closePath(); fs(HC?.[2] ?? '#ff7a6a', 7);
    rr(-74, -176, 148, 100, [50, 50, 8, 8]); fs(HC?.[0] ?? '#14505e', 8);
    rr(-76, -104, 152, 22, 6); fs(HC?.[1] ?? '#f2b233', 6);
    ell(0, -76, 162, 30); fs(HC?.[0] ?? '#14505e', 8); ctx.beginPath(); ctx.ellipse(0, -80, 150, 20, 0, PI * 1.05, PI * 1.95); fs(null, 4, 'rgba(255,255,255,.25)');
  } else if (k === 'tricorne') { // tricórnio vermelho: pontas esquerda/direita para cima, bico da frente para baixo; debrum dourado
    ell(0, -96, 92, 58); fs('#a8161f', 8);
    const pth = () => { ctx.beginPath(); ctx.moveTo(-150, -92); ctx.quadraticCurveTo(-132, -170, -88, -178); ctx.quadraticCurveTo(-40, -120, 0, -128); ctx.quadraticCurveTo(40, -120, 88, -178); ctx.quadraticCurveTo(132, -170, 150, -92); ctx.quadraticCurveTo(60, -86, 0, -46); ctx.quadraticCurveTo(-60, -86, -150, -92); ctx.closePath(); };
    pth(); fs('#c8202a', 8);
    ctx.beginPath(); ctx.moveTo(-138, -98); ctx.quadraticCurveTo(-60, -94, 0, -58); ctx.quadraticCurveTo(60, -94, 138, -98); fs(null, 7, '#f2c230');
    ctx.save(); pth(); ctx.clip(); ctx.beginPath(); ctx.moveTo(-120, -150); ctx.quadraticCurveTo(-60, -112, 0, -116); fs(null, 6, 'rgba(255,255,255,.28)'); ctx.restore();
    ell(0, -92, 15, 13); fs('#f4efe4', 5); ell(-5, -94, 3, 3); ctx.fillStyle = INK; ctx.fill(); ell(5, -94, 3, 3); ctx.fill();
  }
}
function cabeloFrente(cor, penteado) {
  const longo = penteado === 'longo';
  const topo = penteado === 'topete' ? -141 : -117;
  const curva = () => {
    ctx.beginPath(); ctx.moveTo(-96, -20);
    ctx.bezierCurveTo(-113, -82, -60, topo, 0, -110);
    ctx.bezierCurveTo(54, -119, 105, -90, 98, -27);
    ctx.quadraticCurveTo(80, -76, 39, -74);
    ctx.quadraticCurveTo(12, -75, -4, longo ? -51 : -57);
    ctx.quadraticCurveTo(-47, -50, -63, -67);
    ctx.quadraticCurveTo(-82, -53, -96, -20); ctx.closePath();
  };
  const g = ctx.createLinearGradient(-75, -120, 65, -42);
  g.addColorStop(0, claro(cor, .32)); g.addColorStop(.46, cor); g.addColorStop(1, escuro(cor, .25));
  curva(); fs(g, 7);
  ctx.save(); curva(); ctx.clip();
  ctx.beginPath(); ctx.moveTo(-83, -59); ctx.quadraticCurveTo(-41, -114, 44, -98);
  fs(null, 5, 'rgba(255,222,194,.27)');
  ctx.beginPath(); ctx.moveTo(-75, -47); ctx.quadraticCurveTo(-35, -98, 18, -89);
  fs(null, 3, 'rgba(255,222,194,.19)');
  ctx.restore();
}
function hair(c, t) {
  const balanço = Math.sin(t * 2.6) * 4;
  for (const lado of [-1, 1]) {
    ctx.save(); ctx.scale(lado, 1);
    const contorno = () => {
      ctx.beginPath(); ctx.moveTo(59, -88);
      ctx.bezierCurveTo(107, -105, 148, -70, 145, -4);
      ctx.bezierCurveTo(140, 39, 162 + balanço, 72, 151 + balanço, 118);
      ctx.quadraticCurveTo(132, 149, 90, 142);
      ctx.quadraticCurveTo(107, 117, 93, 91);
      ctx.bezierCurveTo(80, 60, 112, 30, 92, -7);
      ctx.quadraticCurveTo(75, -46, 59, -88); ctx.closePath();
    };
    const mechas = ctx.createLinearGradient(83, -70, 151, 120);
    mechas.addColorStop(0, claro(c, .24)); mechas.addColorStop(.5, c); mechas.addColorStop(1, escuro(c, .38));
    contorno(); fs(mechas, 7); ctx.save(); contorno(); ctx.clip();
    for (const x of [103, 119, 132]) {
      ctx.beginPath(); ctx.moveTo(x - 13, -72); ctx.bezierCurveTo(x + 13, -42, x - 12, 18, x + 2, 58);
      ctx.quadraticCurveTo(x + 18 + balanço, 100, x - 6, 129);
      fs(null, 3, 'rgba(255,218,189,.23)');
    }
    ctx.restore(); ctx.restore();
  }
}
function hatAt(k, x, y, r, s, t) { HC = null; ctx.save(); ctx.translate(x, y); ctx.rotate(r); ctx.scale(s, s); ctx.translate(0, 80); hat(k, t); ctx.restore(); }

// ---------- objetos ----------
function prop(k, x, y, a, s = 1, pr = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-a); ctx.scale(s, s);
  if (k === 'bicorne') { hatAt('bicorne', 0, -9, 0, .78, 0); }
  else if (k === 'chapeuChef') { hatAt('chef', 0, -9, 0, .78, 0); }
  else if (k === 'ladle') { rr(-6, -30, 12, 140, 6); fs('#c9c9d2', 5); ctx.beginPath(); ctx.arc(0, 112, 32, 0, PI); ctx.closePath(); fs('#c9c9d2', 6); if (pr.full) { ell(0, 113, 28, 6); ctx.fillStyle = '#e8b04a'; ctx.fill(); } }
  else if (k === 'map') { rr(-75, -10, 150, 110, 6); fs('#f1dfae', 6); ctx.setLineDash([10, 10]); line([-50, 75, -10, 40, 25, 60], 5, '#8a5a2b'); ctx.setLineDash([]); line([30, 20, 50, 40], 6, '#d8322a'); line([50, 20, 30, 40], 6, '#d8322a'); }
  else if (k === 'lantern') { line([0, 0, 0, 30], 5); rr(-26, 30, 52, 70, 10); fs('#ffd36e', 6); line([-26, 52, 26, 52], 4); }
  else if (k === 'glass') { rr(-12, -20, 24, 90, 6); fs('#c99a3a', 5); rr(-17, 60, 34, 80, 6); fs('#8a5530', 5); ell(0, 142, 17, 6); fs('#bfe6ff', 4); }
  else if (k === 'sword') { rr(-7, -30, 14, 42, 5); fs('#6b4325', 4); ell(0, -34, 10, 10); fs('#f2c230', 4); rr(-30, 10, 60, 14, 6); fs('#f2c230', 5); ctx.beginPath(); ctx.moveTo(-11, 24); ctx.lineTo(11, 24); ctx.lineTo(8, 190); ctx.lineTo(0, 214); ctx.lineTo(-8, 190); ctx.closePath(); fs('#dfe4ee', 5); line([-3, 34, -2, 196], 4, 'rgba(255,255,255,.9)'); line([5, 34, 4, 190], 3, 'rgba(110,120,140,.6)'); }
  else if (k === 'shovel') { rr(-6, -40, 12, 190, 6); fs('#9a6236', 5); ctx.beginPath(); ctx.moveTo(-30, 150); ctx.lineTo(30, 150); ctx.lineTo(26, 215); ctx.quadraticCurveTo(0, 245, -26, 215); ctx.closePath(); fs('#9aa6b4', 6); line([-14, 160, -12, 210], 4, 'rgba(255,255,255,.7)'); rr(-22, -52, 44, 16, 6); fs('#9a6236', 4); }
  else if (k === 'recipe') { rr(-70, -10, 140, 170, 6); fs('#f4e6bf', 6); line([-48, 20, 48, 20], 4, '#8a5a2b'); line([-48, 120, 30, 120], 3, '#8a5a2b'); line([-48, 138, 40, 138], 3, '#8a5a2b'); fish(-22, 62, 0, .38); bowl(36, 84, .32, 1); steam(36, 58, 0, 2, .3); }
  else if (k === 'quill') { ctx.beginPath(); ctx.moveTo(0, 150); ctx.quadraticCurveTo(-34, 40, -6, -60); ctx.quadraticCurveTo(26, 40, 0, 150); ctx.closePath(); fs('#f4f0e6', 5); line([0, 150, -4, -40], 3, '#8a7a6a'); line([0, 150, 2, 178], 5); }
  else if (k === 'pavio') { // bota-fogo: haste de madeira (230) com o pavio aceso na ponta; pr.fl = tamanho da chama 0..1
    rr(-6, -20, 12, 230, 6); fs('#9a6236', 5); line([-6, 200, 6, 214], 5); const fl = pr.fl ?? 1;
    if (fl > 0) { ell(0, 232, 16 * fl, 26 * fl); fs('#ff9a2a', 4); ell(0, 228, 8 * fl, 13 * fl); ctx.fillStyle = '#fff3b0'; ctx.fill(); } }
  else if (k === 'cutlass') { rr(-7, -30, 14, 42, 5); fs('#3a2a2a', 4); ctx.beginPath(); ctx.arc(14, -6, 26, -PI * .9, PI * .4); fs(null, 6, '#c9a24a'); rr(-26, 10, 52, 12, 6); fs('#c9a24a', 5);
    ctx.beginPath(); ctx.moveTo(-10, 22); ctx.lineTo(10, 22); ctx.quadraticCurveTo(30, 120, 4, 196); ctx.lineTo(-6, 170); ctx.quadraticCurveTo(10, 110, -10, 22); ctx.closePath(); fs('#dfe4ee', 5); line([0, 40, 10, 140], 4, 'rgba(255,255,255,.9)'); }
  else if (k === 'knife') { // faca de cozinha: cabo de madeira com rebites + lâmina larga com brilho
    rr(-9, -30, 18, 70, 6); fs('#6b4325', 5); for (const y of [-12, 14]) { ell(0, y, 4, 4); ctx.fillStyle = '#e8d8a8'; ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(-10, 40); ctx.lineTo(16, 40); ctx.lineTo(16, 150); ctx.quadraticCurveTo(10, 190, -10, 200); ctx.closePath(); fs('#dfe4ee', 5); line([10, 52, 10, 150], 4, 'rgba(255,255,255,.9)'); line([-4, 50, -4, 186], 3, 'rgba(110,120,140,.55)'); }
  else if (k === 'relogio') { // relógio de bolso: corrente, tampa dourada, mostrador com 12 marcas; pr.h, pr.m = hora (ponteiros), pr.tic (0..1 pulso)
    line([0, -60, 0, -20], 6, '#c9a24a'); ell(0, -66, 10, 10); fs(null, 5, '#c9a24a'); rr(-8, -26, 16, 14, 4); fs('#d4a017', 4);
    ctx.save(); ctx.translate(0, 60); ctx.rotate(a); ctx.translate(0, -60);   // mostrador SEMPRE com o 12 pra cima, em qualquer ângulo da mão (V5: girava junto e marcava hora errada)
    ell(0, 60, 74, 74); fs('#d4a017', 7); ell(0, 60, 60, 60); fs('#fbf6e6', 5);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line([Math.sin(a) * 50, 60 - Math.cos(a) * 50, Math.sin(a) * (i % 3 ? 44 : 38), 60 - Math.cos(a) * (i % 3 ? 44 : 38)], i % 3 ? 3 : 6); }
    const h = pr.h ?? 10, m = pr.m ?? 0, am = m / 60 * TAU, ah = (h % 12 + m / 60) / 12 * TAU;
    line([0, 60, Math.sin(ah) * 28, 60 - Math.cos(ah) * 28], 8); line([0, 60, Math.sin(am) * 46, 60 - Math.cos(am) * 46], 5, '#c8202a');
    ell(0, 60, 7, 7); ctx.fillStyle = INK; ctx.fill(); ell(-24, 34, 14, 7, -.6); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fill(); ctx.restore(); }
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

// ---------- ações amarradas (à prova de ponta solta) ----------
// Mexer panela: a mão é calculada a partir da panela, a concha termina DENTRO da sopa e a parte submersa fica escondida.
// Desenha panela + personagem + concha. Se a mão não alcança, avisa no console (use caixote/aproxime o personagem).
function stirPot(n, o, px, py, ps, t, sp = 4) {
  const rimY = py - 90 * ps, a = t * sp, side = o.x < px ? -1 : 1;
  const bx = px + Math.cos(a) * 40 * ps, by = rimY + 2 * ps + Math.sin(a) * 5 * ps;
  const hx = px + side * 62 * ps + Math.cos(a) * 22 * ps, hy = rimY - 115 * ps;
  const tb = toBody(n, o, hx, hy), shx = (o.f || 1) * side < 0 ? -SHX : SHX;
  const reach = Math.hypot(tb[0] - SHX, tb[1] - SHY);
  if (reach > UA + LA - 2) console.warn('stirPot: mão do ' + n + ' não alcança a panela (' + Math.round(reach) + ' > ' + (UA + LA) + '). Aproxime ou use caixote.');
  o.aR = { ik: tb, s: -1 }; o.hR = null;
  pot(px, py, ps); drawChar(n, o, t);
  ctx.save(); ctx.beginPath(); ctx.rect(-3000, -4000, 7000, rimY + 4000); ctx.ellipse(px, rimY + 2 * ps, 92 * ps, 13 * ps, 0, 0, TAU); ctx.clip();
  line([hx, hy, bx, by + 40 * ps], Math.max(11, 18 * ps), INK); line([hx, hy, bx, by + 40 * ps], Math.max(5, 9 * ps), '#c9c9d2');
  ctx.restore();
  ctx.save(); ell(bx, by, 26 * ps, 6 * ps); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.stroke(); ctx.restore();
  ctx.fillStyle = INK; ell(hx, hy, 12, 12); ctx.fill();
  return { hx, hy, bx, by, reach };
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

function toWorld(n, o, bx, by) { const sc = SPEC[n].s * (o.sc || 1), f = o.f || 1; return [o.x + bx * sc * f, o.y + (by + hipOf(o)) * sc]; }
export { SPEC, TRIPS, tripulacao, DEF, drawChar, auditaPose, toBody, toWorld, hipOf, ik, limb, K, C, L, io, out, inn, back, P, hash, talk, prop, mapAt, pot, bowl, fish, star, steam, leaf, stirPot, walk, laugh, clap, cheer, parrot, hammock, biscuit, poof, burst, SIT, hatAt, ell, fs, rr, line, INK, UA, LA, SHX, SHY };
