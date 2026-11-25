// Texturas pintadas em canvas (rua do Tião). Blender carrega de data/tex/<nome>.png.
const C = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return c; };
let seed = 7; const R = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); return `rgb(${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.min(255, Math.round(v * k))).join(',')})`; };
const siding = (col) => () => C(512, 512, (g, w, h) => { g.fillStyle = col; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 32) { g.fillStyle = shade(col, 0.82); g.fillRect(0, y + 27, w, 5); g.fillStyle = shade(col, 1.08); g.fillRect(0, y, w, 4);
    for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(0,0,0,${0.03 + R() * 0.05})`; g.fillRect(R() * w, y + 6, 40 + R() * 120, 18); } } });
const brick = (col) => () => C(512, 512, (g, w, h) => { g.fillStyle = shade(col, 0.7); g.fillRect(0, 0, w, h);
  for (let y = 0, r = 0; y < h; y += 32, r++) for (let x = (r % 2) * -32; x < w; x += 64) { g.fillStyle = shade(col, 0.88 + R() * 0.24); g.fillRect(x + 3, y + 3, 58, 26); } });
const stripes = (a, b) => () => C(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect(i * 32, 0, 32, h); }
  g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, h - 30, w, 30); });
const sign = (lines, bg, fg, border = '#f3e6c4', w = 1024, h = 320) => () => C(w, h, (g) => { g.fillStyle = border; g.fillRect(0, 0, w, h); g.fillStyle = bg; g.fillRect(18, 18, w - 36, h - 36);
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; const n = lines.length;
  lines.forEach((t, i) => { g.font = `bold ${Math.round((h - 60) / n * (i === 0 ? 0.78 : 0.55))}px Georgia, serif`; g.fillText(t, w / 2, 30 + (h - 60) * (i + 0.5) / n); }); });
export const TEXTURES = {
  coin: () => C(256, 256, (g, w, h) => { g.fillStyle = '#e0ac3a'; g.beginPath(); g.arc(w / 2, h / 2, w / 2, 0, 7); g.fill();
    g.fillStyle = '#a8731c'; g.font = 'bold 150px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', w / 2, h / 2 + 8); }),
  asfalto: () => C(1024, 1024, (g, w, h) => { g.fillStyle = '#8d8174'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(${R() < 0.5 ? '40,30,20' : '255,245,230'},${0.05 + R() * 0.08})`; g.fillRect(R() * w, R() * h, 2 + R() * 6, 2 + R() * 6); }
    g.strokeStyle = 'rgba(40,30,20,0.35)'; g.lineWidth = 3; for (let i = 0; i < 10; i++) { g.beginPath(); let x = R() * w, y = R() * h; g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (R() - 0.5) * 80; y += (R() - 0.5) * 80; g.lineTo(x, y); } g.stroke(); }
    g.fillStyle = '#f1e6c8'; for (let x = 0; x < w; x += 256) g.fillRect(x + 40, h / 2 - 10, 150, 20); }),
  calcada: () => C(512, 512, (g, w, h) => { g.fillStyle = '#b9aa94'; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 64) { g.fillStyle = shade('#d8cbb4', 0.9 + R() * 0.15); g.fillRect(x + 3, y + 3, 58, 58); } }),
  sid_verm: siding('#b8473a'), sid_azul: siding('#5f8fb8'), sid_amar: siding('#e0b354'), sid_verde: siding('#79a86a'), sid_creme: siding('#efe2c4'), sid_rosa: siding('#d98a8f'),
  tijolo: brick('#b5563e'),
  toldo_vb: stripes('#d23c35', '#f6efe2'), toldo_vd: stripes('#3f8f5a', '#f6efe2'), toldo_az: stripes('#3f6fb0', '#f6efe2'),
  pl_pref: sign(['PREFEITURA', 'Vila Sorte'], '#7a2f28', '#f6e7c4', '#e7c470', 1024, 300),
  pl_lei: sign(['PROIBIDO', 'DESCONFIAR', 'DO GLOBO'], '#f4ecd8', '#7a1f1a', '#2e2420', 640, 640),
  pl_sorteio: sign(['GRANDE SORTEIO DE DOMINGO'], '#c23b32', '#ffe9a8', '#f2d24a', 1400, 300),
  pl_premio: sign(['PRÊMIO:', 'FUSCA ZERADO'], '#f6efe2', '#c23b32', '#2e2420', 800, 400),
  pl_placar: sign(['GANHADOR', 'DA SEMANA:', 'O SOBRINHO', '(DE NOVO)'], '#22324f', '#ffd86a', '#2e2420', 720, 560),
  balanca: () => C(256, 256, (g) => { g.fillStyle = '#fbf6ea'; g.beginPath(); g.arc(128, 128, 124, 0, 7); g.fill(); g.fillStyle = '#2b1f1c'; g.font = 'bold 30px sans-serif'; g.textAlign = 'center';
    for (let i = 0; i <= 4; i++) { const a = -1.2 + i * 0.6; g.fillText(String(i * 10), 128 + Math.sin(a) * 90, 138 - Math.cos(a) * 90); } g.font = 'bold 22px sans-serif'; g.fillText('gramas', 128, 200); }),
  pl_pad: sign(['PADARIA DO ZÉ'], '#2f5a3c', '#f6e7c4'), pl_bar: sign(['BAR DA SORTE'], '#22324f', '#ffd86a'),
  pl_seta: sign(['→ SORTEIO'], '#f2d24a', '#2b1f1c', '#2b1f1c', 768, 256), pl_barb: sign(['BARBEARIA'], '#efe2c4', '#2b3f6a'),
  relogio: () => C(512, 512, (g, w) => { g.fillStyle = '#f6f0e0'; g.beginPath(); g.arc(256, 256, 250, 0, 7); g.fill(); g.strokeStyle = '#2b1f1c'; g.lineWidth = 16; g.stroke();
    g.fillStyle = '#2b1f1c'; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; g.fillRect(256 + Math.sin(a) * 205 - 6, 256 - Math.cos(a) * 205 - 14, 12, 28); }
    g.lineWidth = 14; g.beginPath(); g.moveTo(256, 256); g.lineTo(256 - 110, 256 - 40); g.moveTo(256, 256); g.lineTo(256 + 20, 256 - 170); g.stroke(); }),
  nevoa: () => C(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(236,228,214,0)'); gr.addColorStop(0.6, 'rgba(236,228,214,0.55)'); gr.addColorStop(1, 'rgba(236,228,214,0.8)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }),
};
for (let n = 1; n <= 10; n++) TEXTURES['bola' + n] = () => C(256, 128, (g) => { g.fillStyle = ['#f6efe2', '#f2d24a', '#7cb35a', '#4f8fd1', '#e0483c'][n % 5]; g.fillRect(0, 0, 256, 128);
  for (const cx of [64, 192]) { g.fillStyle = '#fff'; g.beginPath(); g.arc(cx, 64, 34, 0, 7); g.fill(); g.fillStyle = '#1a1418'; g.font = 'bold 44px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), cx, 66); } });
