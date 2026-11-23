// Gera a folha de 6 poses (SVG) de cada personagem. Sem rig: cada pose é um desenho pronto.
// uso: node ferramentas/poses.mjs   -> assets/poses/<nome>_<1..6>.svg
import fs from 'node:fs';
const PERSONAGENS = {
  ze:   { pele:'#f2b98a', camisa:'#2e9cff', calca:'#3b3b4f', chapeu:'bone', cor:'#e8412c' },
  banq: { pele:'#e9a77a', camisa:'#1d1d26', calca:'#1d1d26', chapeu:'cartola', cor:'#7a5cff', gravata:'#e8412c' },
};
// braço: ângulo em graus (0 = pra baixo, 90 = pro lado, 180 = pra cima), olhos: normal|choque|feliz, boca: reta|aberta|sorriso|risada
const POSES = [
  { nome:'neutro',  bE:12,  bD:-12, olhos:'normal', boca:'reta',    pernas:14, incl:0 },
  { nome:'choque',  bE:28,  bD:-28, olhos:'choque', boca:'aberta',  pernas:18, incl:-6 },
  { nome:'aponta',  bE:12,  bD:-100,olhos:'normal', boca:'sorriso', pernas:14, incl:-4 },
  { nome:'confiante',bE:55, bD:-55, olhos:'feliz',  boca:'sorriso', pernas:20, incl:0, cruzado:true },
  { nome:'empurra', bE:75, bD:-85,olhos:'normal', boca:'aberta',  pernas:34, incl:10 },
  { nome:'festa',   bE:135, bD:-135,olhos:'feliz',  boca:'risada',  pernas:22, incl:0 },
  { nome:'ri',      bE:35,  bD:-35, olhos:'feliz',  boca:'risada',  pernas:16, incl:5 },
  { nome:'olha_cima',bE:20, bD:-20, olhos:'cima',   boca:'aberta',  pernas:14, incl:-3 },
];
const ln = (x1,y1,ang,len,w,c) => { const a = ang*Math.PI/180; const x2 = x1 + Math.sin(a)*len, y2 = y1 + Math.cos(a)*len;
  return { x2, y2, svg:`<line x1="${x1}" y1="${y1}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>` }; };
function boneco(p, k) {
  const O = '#1a1a1a', ombro = {x:200, y:340};
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-100 0 600 700" width="600" height="700"><g transform="rotate(${k.incl} 200 600)">`;
  // pernas
  for (const d of [-1, 1]) { const l = ln(200+d*30, 520, d*k.pernas, 130, 34, p.calca); s += l.svg + `<ellipse cx="${(l.x2+d*10).toFixed(1)}" cy="${(l.y2+6).toFixed(1)}" rx="34" ry="16" fill="${O}"/>`; }
  // corpo
  s += `<rect x="140" y="300" width="120" height="230" rx="56" fill="${p.camisa}" stroke="${O}" stroke-width="6"/>`;
  if (p.gravata) s += `<polygon points="200,310 188,330 200,420 212,330" fill="${p.gravata}"/>`;
  // cabeça
  s += `<circle cx="200" cy="215" r="105" fill="${p.pele}" stroke="${O}" stroke-width="7"/>`;
  const ey = 205;
  if (k.olhos === 'normal') s += `<circle cx="165" cy="${ey}" r="14" fill="#fff" stroke="${O}" stroke-width="4"/><circle cx="235" cy="${ey}" r="14" fill="#fff" stroke="${O}" stroke-width="4"/><circle cx="168" cy="${ey+2}" r="6" fill="${O}"/><circle cx="238" cy="${ey+2}" r="6" fill="${O}"/>`;
  if (k.olhos === 'choque') s += `<circle cx="165" cy="${ey}" r="24" fill="#fff" stroke="${O}" stroke-width="4"/><circle cx="235" cy="${ey}" r="24" fill="#fff" stroke="${O}" stroke-width="4"/><circle cx="165" cy="${ey}" r="5" fill="${O}"/><circle cx="235" cy="${ey}" r="5" fill="${O}"/>`;
  if (k.olhos === 'cima') s += `<circle cx="165" cy="${ey}" r="20" fill="#fff" stroke="${O}" stroke-width="4"/><circle cx="235" cy="${ey}" r="20" fill="#fff" stroke="${O}" stroke-width="4"/><circle cx="167" cy="${ey-11}" r="8" fill="${O}"/><circle cx="237" cy="${ey-11}" r="8" fill="${O}"/>`;
  if (k.olhos === 'feliz') s += `<path d="M148 ${ey+4} Q165 ${ey-18} 182 ${ey+4}" stroke="${O}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M218 ${ey+4} Q235 ${ey-18} 252 ${ey+4}" stroke="${O}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M145 ${ey-32} L185 ${ey-26}" stroke="${O}" stroke-width="7" stroke-linecap="round"/><path d="M255 ${ey-32} L215 ${ey-26}" stroke="${O}" stroke-width="7" stroke-linecap="round"/>`;
  const by = 265;
  if (k.boca === 'reta') s += `<path d="M170 ${by} L230 ${by}" stroke="${O}" stroke-width="7" stroke-linecap="round"/>`;
  if (k.boca === 'sorriso') s += `<path d="M165 ${by-8} Q200 ${by+30} 235 ${by-8}" stroke="${O}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  if (k.boca === 'aberta') s += `<ellipse cx="200" cy="${by+4}" rx="26" ry="32" fill="#5a1a1a" stroke="${O}" stroke-width="6"/>`;
  if (k.boca === 'risada') s += `<path d="M155 ${by-14} Q200 ${by+60} 245 ${by-14} Z" fill="#5a1a1a" stroke="${O}" stroke-width="6" stroke-linejoin="round"/><path d="M175 ${by-6} Q200 ${by+8} 225 ${by-6} L225 ${by-14} L175 ${by-14} Z" fill="#fff"/>`;
  // braços
  let br = '';
  if (k.cruzado) { br += `<line x1="150" y1="390" x2="250" y2="410" stroke="${p.pele}" stroke-width="30" stroke-linecap="round"/><line x1="250" y1="380" x2="150" y2="405" stroke="${p.pele}" stroke-width="30" stroke-linecap="round"/>`; }
  else for (const [x, ang] of [[150, -k.bE], [250, -k.bD]]) { const m = ln(x, 340, ang, 150, 30, p.camisa); br += m.svg + `<circle cx="${m.x2.toFixed(1)}" cy="${m.y2.toFixed(1)}" r="22" fill="${p.pele}" stroke="${O}" stroke-width="5"/>`; }
  s += br;
  // chapéu
  if (p.chapeu === 'bone') s += `<path d="M105 175 Q200 70 295 175 Z" fill="${p.cor}" stroke="${O}" stroke-width="6"/><rect x="95" y="168" width="150" height="16" rx="8" fill="${p.cor}" stroke="${O}" stroke-width="5"/>`;
  if (p.chapeu === 'cartola') s += `<rect x="150" y="30" width="100" height="95" rx="8" fill="#111" stroke="${O}" stroke-width="5"/><rect x="150" y="95" width="100" height="16" fill="${p.cor}"/><rect x="118" y="118" width="164" height="18" rx="9" fill="#111" stroke="${O}" stroke-width="5"/>`;
  s += '</g></svg>';
  return s;
}
fs.mkdirSync('assets/poses', { recursive: true });
for (const [nome, p] of Object.entries(PERSONAGENS)) POSES.forEach((k, i) => fs.writeFileSync(`assets/poses/${nome}_${i+1}.svg`, boneco(p, k)));
fs.writeFileSync('assets/poses/INDEX.json', JSON.stringify(POSES.map((k, i) => ({ n: i+1, nome: k.nome })), null, 1));
// folha de contato (HTML -> PNG por ferramentas/folha.mjs)
const cel = (n, i) => `<figure><img src="poses/${n}_${i+1}.svg"><figcaption>${n} ${i+1} ${POSES[i].nome}</figcaption></figure>`;
fs.writeFileSync('assets/folha_poses.html', `<body style="margin:0;background:#cfe8ff;font:20px sans-serif"><div style="display:grid;grid-template-columns:repeat(8,160px);gap:10px;padding:10px">${Object.keys(PERSONAGENS).map(n => POSES.map((_, i) => cel(n, i)).join('')).join('')}</div><style>img{width:160px}figure{margin:0;text-align:center}</style>`);
console.log('ok', Object.keys(PERSONAGENS).length * POSES.length, 'poses');
