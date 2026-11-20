// cenarios.js — CATÁLOGO DE CENÁRIOS reutilizáveis da série Tião (espaço, brinquedolândia, cidade).
// Cada cenário = grupo 3D construído UMA vez, longe da origem (não mistura com navio/ilha/cozinha).
// Liga no story: worldAt -> { cenario: 'espaco' } (mar e navio somem sozinhos). Pé no chão: W.chao(x, z) com x,z do MUNDO
// (= ORIGEM.<id>.x + x_local). Câmeras seguras em números: CAMS (offsets do centro do cenário) + camCen(id, tipo).
// Regra do kit: geometria curva = indexada (normais suaves); nada de Icosahedron. Ver catalogo/CENARIOS.md.
import * as THREE from './lib/three.module.js';
import * as P from './paint.js';
import { construirMais } from './cenarios2.js';
import { construirNavioBermudas } from './cenarios3.js';
import { construirCasa, SALAS } from './cenarios4.js';

export const ORIGEM = { espaco: new THREE.Vector3(3000, 0, 0), brinquedo: new THREE.Vector3(3000, 0, 1200), cidade: new THREE.Vector3(3000, 0, 2400), bermudas: new THREE.Vector3(3000, 0, 3600), maia: new THREE.Vector3(3000, 0, 4800), amazonia: new THREE.Vector3(3000, 0, 6000), cyberpunk: new THREE.Vector3(3000, 0, 7200), apocalipse: new THREE.Vector3(3000, 0, 8400), cemiterio: new THREE.Vector3(3000, 0, 9600), parque: new THREE.Vector3(3000, 0, 10800), dojo: new THREE.Vector3(3000, 0, 12000), fundomar: new THREE.Vector3(3000, 0, 13200), nuvens: new THREE.Vector3(3000, 0, 14400), arena: new THREE.Vector3(3000, 0, 15600), floresta: new THREE.Vector3(3000, 0, 16800), navioberm: new THREE.Vector3(3000, 0, 18000), sala: new THREE.Vector3(3000, 0, 19200), cozinha: new THREE.Vector3(3000, 0, 20400), quarto: new THREE.Vector3(3000, 0, 21600), fachada: new THREE.Vector3(3000, 0, 22800) };
const RAIO = { espaco: 9, brinquedo: 14, cidade: 16, bermudas: 6, maia: 9, amazonia: 5 };   // raio (m) do piso útil de cada cenário
// câmeras seguras (offsets do centro). tipo: geral = grupo inteiro; medio = 2 bonecos; close = rosto/objeto. fov em graus (vertical, tela 1080x1920)
export const CAMS = {
  espaco: {
    geral: { pos: [0.3, 2.0, 6.4], look: [0, 1.5, 0], fov: 52 },
    medio: { pos: [0.1, 1.6, 4.9], look: [0, 1.3, 0], fov: 46 },
    close: { pos: [0.6, 1.5, 3.0], look: [0, 1.3, 0], fov: 40 },
  },
  brinquedo: {
    geral: { pos: [0.3, 2.0, 6.4], look: [0, 1.5, 0], fov: 52 },
    medio: { pos: [0.1, 1.6, 4.9], look: [0, 1.3, 0], fov: 46 },
    close: { pos: [0.6, 1.5, 3.0], look: [0, 1.3, 0], fov: 40 },
  },
  cidade: {
    fogo: { pos: [-1.4, 1.6, 5.6], look: [-7, 6, -7], fov: 64 },     // lateral esquerda: prédio pegando fogo (z -5..-14). Bonecos em x -3,6 e -3,0, z 0,6 e 0,1
    ruina: { pos: [1.6, 1.6, 5.6], look: [6, 5, -5], fov: 62 },       // lateral direita: prédio destruído (z 1..-8) e entulho. Bonecos em x 3,6 e 4,6, z 0,2 e -0,3
    banco: { pos: [-2.2, 1.7, 6.0], look: [-7.0, 2.4, -0.4], fov: 54 },    // assalto ao banco (esq., z 3,6..-5). Bonecos em x -5,3 e -6,2, z 1,2 e 1,7
    geral: { pos: [0.3, 2.0, 6.4], look: [0, 1.5, 0], fov: 52 },
    medio: { pos: [0.1, 1.6, 4.9], look: [0, 1.3, 0], fov: 46 },
    close: { pos: [0.6, 1.5, 3.0], look: [0, 1.3, 0], fov: 40 },
  },
};
for (const id of ['bermudas', 'maia', 'amazonia', 'cyberpunk', 'apocalipse', 'cemiterio', 'parque', 'dojo', 'fundomar', 'nuvens', 'arena', 'floresta', 'navioberm', 'sala', 'cozinha', 'quarto', 'fachada']) CAMS[id] = { ...CAMS.espaco };
export const camCen = (id, tipo = 'geral', dx = 0, dz = 0) => { const o = ORIGEM[id], c = CAMS[id][tipo];
  return { pos: [o.x + c.pos[0] + dx, o.y + c.pos[1], o.z + c.pos[2] + dz], look: [o.x + c.look[0] + dx, o.y + c.look[1], o.z + c.look[2] + dz], fov: c.fov }; };

const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const PLUMc = '#241726';

export function construirCenarios(E) {
  const { scene, add, toon } = E;
  const T = (c, rx = 1, ry = 1) => P.tex(c, rx, ry);
  const lista = {};
  const novo = (id) => { const g = new THREE.Group(); g.position.copy(ORIGEM[id]); g.visible = false; scene.add(g); return g; };
  // esfera indexada deformada por ruído de baixa frequência (pedra/asteroide liso, nunca facetado)
  const pedra = (r0, seed, achata = 0.8) => { const g = new THREE.SphereGeometry(r0, 28, 18), pa = g.attributes.position, rr = P.rng(seed), k = [rr() * 6, rr() * 6, rr() * 6];
    for (let i = 0; i < pa.count; i++) { const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i), d = 1 + 0.16 * Math.sin(x * 1.3 / r0 * 2 + k[0]) * Math.cos(z * 1.1 / r0 * 2 + k[1]) + 0.1 * Math.sin(y * 2.2 / r0 * 2 + k[2]); pa.setXYZ(i, x * d, y * d * achata, z * d); }
    g.computeVertexNormals(); return g; };

  // =====================================================================================
  // 1) ESPAÇO SIDERAL — asteroide-palco com cratera, foguete do Tião, cristais, bandeira, planeta com anel, planeta azul, lua, nebulosa
  // =====================================================================================
  {
    const g = novo('espaco'), t0 = {};
    // céu estrelado (cúpula pintada, sem tinta, segue o centro do cenário; câmera fica a < 30 m do centro)
    const [sc, sg] = cv(2048, 1024), r = P.rng(5);
    { const gr = sg.createLinearGradient(0, 0, 0, 1024); gr.addColorStop(0, '#070a24'); gr.addColorStop(0.5, '#150f3d'); gr.addColorStop(1, '#0a0c2c'); sg.fillStyle = gr; sg.fillRect(0, 0, 2048, 1024);
      for (const [x, y, rad, col] of [[300, 420, 330, '130,70,220'], [1250, 500, 380, '40,150,190'], [1800, 380, 300, '230,80,150'], [760, 640, 260, '90,60,200'], [1500, 700, 240, '60,170,150']]) {
        const rg = sg.createRadialGradient(x, y, 0, x, y, rad); rg.addColorStop(0, `rgba(${col},.42)`); rg.addColorStop(1, `rgba(${col},0)`); sg.fillStyle = rg; sg.fillRect(0, 0, 2048, 1024); }
      for (let i = 0; i < 900; i++) { const x = r() * 2048, y = r() * 1024, s = r() < 0.12 ? 2.8 : 1 + r() * 1.5; sg.fillStyle = ['#ffffff', '#fff3b0', '#bfe6ff', '#ffc9ec'][(r() * 4) | 0]; sg.globalAlpha = 0.55 + r() * 0.45; sg.beginPath(); sg.arc(x, y, s, 0, 7); sg.fill(); }
      sg.globalAlpha = 1; for (let i = 0; i < 44; i++) { const x = 40 + r() * 1968, y = 60 + r() * 700, s = 7 + r() * 11; sg.fillStyle = '#fff6c8'; sg.beginPath(); sg.moveTo(x, y - s); sg.quadraticCurveTo(x, y, x + s, y); sg.quadraticCurveTo(x, y, x, y + s); sg.quadraticCurveTo(x, y, x - s, y); sg.quadraticCurveTo(x, y, x, y - s); sg.fill(); } }
    const dome = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), new THREE.MeshBasicMaterial({ map: T(sc), side: THREE.BackSide, fog: false }));
    dome.userData.sky = true; dome.userData.ndSkip = true; g.add(dome); t0.dome = dome;
    // astros: planeta listrado com anel, planeta azul, lua — pintados, longe, sem névoa
    const [pc, pg] = cv(1024, 512);
    { const cores = ['#ff8a3d', '#ffc36b', '#ff6f6f', '#ffe2a8', '#e8643c', '#ffb25a', '#ff8a8a', '#ffd9a0']; const h = 512 / cores.length;
      cores.forEach((c, i) => { pg.fillStyle = c; pg.beginPath(); pg.moveTo(0, i * h); for (let x = 0; x <= 1024; x += 32) pg.lineTo(x, i * h + Math.sin(x * 0.02 + i) * 7); pg.lineTo(1024, (i + 1) * h + 8); pg.lineTo(0, (i + 1) * h + 8); pg.fill(); });
      pg.fillStyle = '#c23b2a'; pg.beginPath(); pg.ellipse(660, 300, 70, 38, 0, 0, 7); pg.fill(); pg.fillStyle = '#ffb08a'; pg.beginPath(); pg.ellipse(660, 300, 36, 18, 0, 0, 7); pg.fill(); }
    const planeta = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), toon({ map: T(pc), fog: false })); planeta.position.set(-20, 30, -150); planeta.scale.setScalar(15); g.add(planeta);
    const [rc, rg2] = cv(512, 512);
    { for (const [a, b, col] of [[0.52, 0.6, 'rgba(255,238,200,.95)'], [0.62, 0.7, 'rgba(255,170,205,.9)'], [0.72, 0.8, 'rgba(255,238,200,.95)'], [0.82, 0.9, 'rgba(190,150,255,.85)'], [0.91, 1.0, 'rgba(255,238,200,.9)']]) { rg2.strokeStyle = col; rg2.lineWidth = (b - a) * 256; rg2.beginPath(); rg2.arc(256, 256, (a + b) / 2 * 256, 0, 7); rg2.stroke(); } }
    const anel = new THREE.Mesh(new THREE.RingGeometry(1.45, 2.6, 96), new THREE.MeshBasicMaterial({ map: T(rc), transparent: true, side: THREE.DoubleSide, fog: false, depthWrite: false })); anel.userData.ndSkip = true;
    { const ring = anel.geometry.attributes, pos = ring.position, uv = ring.uv; for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / 2.6 * 0.5 + 0.5, pos.getY(i) / 2.6 * 0.5 + 0.5); }
    anel.scale.setScalar(15); anel.rotation.set(-Math.PI / 2 + 0.38, 0, -0.32); anel.position.copy(planeta.position); g.add(anel);
    const [ac, ag] = cv(512, 256);
    { ag.fillStyle = '#2cb7d6'; ag.fillRect(0, 0, 512, 256); ag.fillStyle = '#5ed86f'; for (const [x, y, rx, ry] of [[90, 100, 70, 40], [210, 160, 55, 70], [330, 90, 60, 36], [430, 170, 50, 45], [150, 210, 40, 22]]) { ag.beginPath(); ag.ellipse(x, y, rx, ry, 0.4, 0, 7); ag.fill(); }
      ag.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 9; i++) { ag.beginPath(); ag.ellipse(r() * 512, r() * 256, 40 + r() * 30, 8 + r() * 6, 0, 0, 7); ag.fill(); } }
    const azul = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 28), toon({ map: T(ac), fog: false })); azul.position.set(28, 34, -150); azul.scale.setScalar(7); g.add(azul);
    const [mc, mg] = cv(256, 128);
    { mg.fillStyle = '#e4dcf5'; mg.fillRect(0, 0, 256, 128); for (let i = 0; i < 12; i++) { const x = r() * 256, y = r() * 128, rr = 6 + r() * 14; mg.fillStyle = '#b9aedb'; mg.beginPath(); mg.arc(x, y, rr, 0, 7); mg.fill(); mg.fillStyle = '#f6f1ff'; mg.beginPath(); mg.arc(x - rr * 0.2, y - rr * 0.2, rr * 0.7, 0, 7); mg.fill(); } }
    const lua = new THREE.Mesh(new THREE.SphereGeometry(1, 36, 24), toon({ map: T(mc), fog: false })); lua.position.set(12, 12, -90); lua.scale.setScalar(3.4); g.add(lua);
    // chão: asteroide-palco (torno indexado = normais suaves), topo plano em y = 0 com poeira e crateras pintadas
    const perfil = [[0.01, -4.6], [2.6, -4.1], [5.2, -3.0], [7.4, -1.7], [8.6, -0.55], [9.0, -0.12], [8.8, 0]].map(([x, y]) => new THREE.Vector2(x, y));
    const rocha = new THREE.LatheGeometry(perfil, 56); { const pa = rocha.attributes.position, rr = P.rng(3); const k = [rr() * 6, rr() * 6];
      for (let i = 0; i < pa.count; i++) { const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i); if (y > -0.2) continue; const a = Math.atan2(z, x), d = 1 + 0.07 * Math.sin(a * 5 + k[0] + y) + 0.05 * Math.sin(a * 11 + k[1]); pa.setXYZ(i, x * d, y + 0.25 * Math.sin(a * 7 + y * 2), z * d); }
      rocha.computeVertexNormals(); }
    add(rocha, toon({ map: T(P.rocha(11, 265, 28, 46), 3, 2), side: THREE.DoubleSide }), 0, 0, 0, g);
    const [tc, tg] = cv(1024, 1024);
    { tg.fillStyle = '#b8a4ec'; tg.fillRect(0, 0, 1024, 1024); for (let i = 0; i < 40; i++) { tg.fillStyle = r() < 0.5 ? 'rgba(150,125,215,.35)' : 'rgba(215,200,255,.4)'; tg.beginPath(); tg.ellipse(r() * 1024, r() * 1024, 40 + r() * 110, 16 + r() * 40, r() * 3, 0, 7); tg.fill(); }
      const crat = (x, y, rr) => { tg.fillStyle = '#7e69c0'; tg.beginPath(); tg.ellipse(x, y, rr, rr * 0.55, 0, 0, 7); tg.fill(); tg.fillStyle = '#9a86dc'; tg.beginPath(); tg.ellipse(x - rr * 0.08, y + rr * 0.1, rr * 0.82, rr * 0.42, 0, 0, 7); tg.fill(); tg.strokeStyle = '#e6dcff'; tg.lineWidth = 7; tg.beginPath(); tg.ellipse(x, y, rr, rr * 0.55, 0, Math.PI * 1.05, Math.PI * 1.95); tg.stroke(); };
      for (const [x, y, rr] of [[250, 300, 120], [760, 230, 85], [830, 700, 130], [330, 800, 70], [560, 500, 50], [150, 600, 45]]) crat(x, y, rr);
      tg.fillStyle = '#8f7bd0'; for (let i = 0; i < 120; i++) { tg.beginPath(); tg.arc(r() * 1024, r() * 1024, 2 + r() * 4, 0, 7); tg.fill(); } }
    const topo = new THREE.Mesh(new THREE.CircleGeometry(8.85, 64), toon({ map: T(tc) })); topo.rotation.x = -Math.PI / 2; topo.position.y = 0.004; topo.receiveShadow = true; g.add(topo);
    // asteroides flutuantes (bobbing em state)
    const rochaM = toon({ color: '#544c68', map: T(P.rocha(19, 270, 22, 52)) }), flut = [];
    for (const [x, y, z, rr, sd] of [[-9, 3.2, -6, 1.1, 1], [10.5, 5.5, -9, 1.6, 2], [-13, 7.5, -14, 2.2, 3], [7, 1.2, 5, 0.55, 4], [14, 9.5, -18, 1.3, 5], [-6, 10, -22, 1.8, 6]]) { const m = add(pedra(rr, sd, 0.75), rochaM, x, y, z, g); m.userData.p0 = [x, y, z, sd]; flut.push(m); }
    // foguete do Tião (pousou meio torto): corpo branco, nariz e aletas vermelhos, janela azul, chama que liga com S.foguete.fogo
    const fog = new THREE.Group(); fog.position.set(-4.4, 0, -3.0); fog.rotation.set(0, 0.5, 0.1); fog.scale.setScalar(0.62); g.add(fog);
    const bco = toon({ color: '#f6f3ee' }), verm = toon({ color: '#e0392d' }), azl = toon({ color: '#58b6ff' }), cinza = toon({ color: '#8a90a6' });
    add(new THREE.CylinderGeometry(0.95, 1.1, 3.0, 24), bco, 0, 2.0, 0, fog); add(new THREE.CylinderGeometry(0.05, 0.95, 1.7, 24), verm, 0, 4.35, 0, fog);
    add(new THREE.TorusGeometry(0.5, 0.1, 10, 24), cinza, 0, 2.6, 1.0, fog); add(new THREE.CircleGeometry(0.46, 24), azl, 0, 2.6, 1.02, fog, { cast: false });
    add(new THREE.CylinderGeometry(0.7, 0.55, 0.5, 20), cinza, 0, 0.45, 0, fog);
    for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3 + 0.5, fin = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.5, 1.0), verm); fin.position.set(Math.sin(a) * 1.2, 0.95, Math.cos(a) * 1.2); fin.rotation.set(0, a, 0); fin.rotation.z = 0; fin.castShadow = true; fog.add(fin); }
    const chamaE = add(new THREE.ConeGeometry(0.55, 1.6, 14), new THREE.MeshBasicMaterial({ color: '#ff8a2a' }), 0, -0.2, 0, fog, { cast: false }), chamaI = add(new THREE.ConeGeometry(0.3, 1.0, 12), new THREE.MeshBasicMaterial({ color: '#ffe36a' }), 0, -0.1, 0, fog, { cast: false });
    chamaE.rotation.x = chamaI.rotation.x = Math.PI; chamaE.userData.ndSkip = chamaI.userData.ndSkip = true;
    // bandeirinha do Tião
    const [bc, bg] = cv(256, 160); bg.fillStyle = '#d8322a'; bg.fillRect(0, 0, 256, 160); bg.fillStyle = '#fff6e0'; bg.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 26 : 62; bg.lineTo(128 + Math.cos(a) * rr, 80 + Math.sin(a) * rr); } bg.fill();
    const poste = new THREE.Group(); poste.position.set(3.9, 0, -3.8); g.add(poste); add(new THREE.CylinderGeometry(0.05, 0.06, 2.8, 8), toon({ color: '#c9ccd8' }), 0, 1.4, 0, poste);
    const flag = add(new THREE.PlaneGeometry(1.5, 0.94, 8, 4), toon({ map: T(bc), side: THREE.DoubleSide }), 0.78, 2.35, 0, poste, { cast: false }); flag.userData.base = flag.geometry.attributes.position.array.slice();
    // cristais brilhantes (cones lisos com brilho próprio que pulsa)
    const cris = [];
    for (const [x, z, h, rr, tx, tz, col] of [[4.8, -1.0, 1.8, 0.34, 0.12, -0.1, '#4ff0d8'], [5.3, -0.4, 1.2, 0.26, -0.2, 0.15, '#ff7ad9'], [4.3, -0.4, 0.9, 0.22, 0.3, 0.2, '#4ff0d8'], [5.7, -1.5, 1.5, 0.3, -0.1, -0.25, '#ffd24f'], [4.2, -1.6, 1.0, 0.24, 0.2, -0.3, '#ff7ad9']]) {
      const m = add(new THREE.ConeGeometry(rr, h, 9, 1), toon({ color: col, emissive: col, emissiveIntensity: 0.5 }), x, h / 2 - 0.05, z, g); m.rotation.set(tz, 0, tx); cris.push(m); }
    // ---- (16/11 v3) linha de bandeiras, pegadas, poeira que sobe, escada e porta do foguete: tudo pelo state (ES.bandeiras, ES.brilho, ES.pegadas, ES.poeira, ES.porta)
    const NB = 40, bandM = toon({ map: T(bc), side: THREE.DoubleSide, emissive: '#ff2a1a', emissiveIntensity: 0 }), hasteM = toon({ color: '#c9ccd8' }), bands = [];
    for (let i = 0; i < NB; i++) { const gp = new THREE.Group(); gp.position.set(-3.4 + i * 0.27, 0, -2.0 + i * 0.045); gp.rotation.y = 0.9; gp.visible = false; g.add(gp);
      add(new THREE.CylinderGeometry(0.03, 0.04, 1.5, 6), hasteM, 0, 0.75, 0, gp);
      const fl2 = add(new THREE.PlaneGeometry(0.7, 0.44), bandM, 0.36, 1.25, 0, gp, { cast: false }); fl2.userData.i = i; bands.push({ gp, fl2 }); }
    const pegM = new THREE.MeshBasicMaterial({ color: '#4a3a86', transparent: true, opacity: 0, depthWrite: false }), pegs = [];
    for (let i = 0; i < 28; i++) { const m = new THREE.Mesh(new THREE.CircleGeometry(0.17, 10), pegM); m.rotation.x = -Math.PI / 2; m.scale.set(1, 1.7, 1); m.position.set(-3.5 + i * 0.3, 0.012, 1.0 + (i % 2 ? 0.13 : -0.13)); m.userData.ndSkip = true; g.add(m); pegs.push(m); }
    const poM = new THREE.MeshBasicMaterial({ color: '#2f2542', transparent: true, opacity: 0, depthWrite: false }), puffs = [], rp = P.rng(77);
    for (let i = 0; i < 110; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), poM); m.userData.b = [-9 + rp() * 18, 0.1 + rp() * 4.5, -8 + rp() * 14, 0.9 + rp() * 1.6, rp() * 6]; m.userData.ndSkip = true; m.visible = false; g.add(m); puffs.push(m); }
    const escM = toon({ color: '#6b7088' }); for (const sx of [-0.42, 0.42]) add(new THREE.BoxGeometry(0.07, 3.2, 0.07), escM, sx, 1.6, 1.25, fog); for (let i = 0; i < 8; i++) add(new THREE.BoxGeometry(0.9, 0.06, 0.08), escM, 0, 0.35 + i * 0.38, 1.25, fog);
    const porta = add(new THREE.CircleGeometry(0.5, 20), toon({ color: '#3a3f55' }), 0, 1.6, 1.07, fog, { cast: false }); const portaM = porta.material;
    lista.espaco = { g, raio: RAIO.espaco, chao: () => 0,
      state(S, f, L) { const t = f / 30, ES = S.espaco || {};
        flut.forEach((m) => { const [x, y, z, sd] = m.userData.p0; m.position.set(x, y + 0.35 * Math.sin(t * 0.7 + sd * 1.7), z); m.rotation.set(t * 0.08 * sd * 0.3, t * 0.12 + sd, 0); });
        dome.rotation.y = t * 0.002; planeta.rotation.y = t * 0.01; lua.rotation.y = t * 0.02;
        cris.forEach((m, i) => { const ck = ES.cristais ?? 1; m.userData.c0 = m.userData.c0 || m.material.color.clone(); m.material.color.copy(m.userData.c0).multiplyScalar(0.22 + 0.78 * ck); m.material.emissiveIntensity = ck * (0.5 + 0.3 * Math.sin(t * (ES.pulso ?? 2.4) + i * 1.3)); });   // ES.cristais 0..1 (0 = apagados), ES.pulso = velocidade
        { const pa = flag.geometry.attributes.position, b = flag.userData.base; for (let i = 0; i < pa.count; i++) pa.setZ(i, Math.sin(t * 4 + b[i * 3] * 3) * 0.1 * (b[i * 3] + 0.75)); pa.needsUpdate = true; flag.geometry.computeVertexNormals(); }
        { const nb = ES.bandeiras ?? 0, br = ES.brilho ?? 0; bands.forEach((o, i) => { const k = Math.max(0, Math.min(1, nb - i)); o.gp.visible = k > 0.02; o.gp.scale.set(1, 0.25 + 0.75 * k, 1); const pa = o.fl2.position; pa.y = 1.25 * (0.25 + 0.75 * k); });
          bandM.emissiveIntensity = br * (1.1 + 0.4 * Math.sin(t * 6));
          const pg = ES.pegadas ?? 0; pegM.opacity = 0.75 * pg; pegs.forEach((m, i) => { m.visible = pg > 0.02; });
          const po = ES.poeira ?? 0; poM.opacity = 0.62 * Math.min(1, po * 1.6); puffs.forEach((m) => { const b = m.userData.b; m.visible = po > 0.02; const sc = b[3] * (0.25 + 1.5 * po); m.scale.set(sc * 1.4, sc * 0.8, sc); m.position.set(b[0] + Math.sin(t * 0.9 + b[4]) * 0.5, b[1] * (0.3 + 1.1 * po), b[2] + Math.cos(t * 0.7 + b[4]) * 0.4); });
          portaM.color.set((ES.porta ?? 0) > 0.5 ? '#07080f' : '#3a3f55'); }
        const fg = ES.foguete?.fogo ?? 0; chamaE.visible = chamaI.visible = fg > 0.02 && !ES.foguete?.destruido; const fl = fg * (1 + 0.12 * Math.sin(t * 40)); chamaE.scale.set(fg, fl, fg); chamaI.scale.set(fg, fl * 1.1, fg); chamaE.position.y = -0.2 - 0.8 * fl + 0.8; chamaI.position.y = -0.1 - 0.5 * fl * 1.1 + 0.5;
        if (ES.foguete?.destruido) {
          fog.rotation.z = Math.PI * 0.45; fog.rotation.x = 0.2; fog.position.y = -0.4;
        } else {
          fog.position.y = ES.foguete?.y ?? 0; fog.rotation.z = 0.1 * (1 - Math.min(1, (ES.foguete?.y ?? 0) / 2));
        } } };
  }

  // =====================================================================================
  // 2) BRINQUEDOLÂNDIA — quarto de criança em escala de brinquedo: tapete de EVA, parede de papel, trilho com trem, blocos ABC, bola, urso gigante
  // =====================================================================================
  {
    const g = novo('brinquedo');
    const rr = P.rng(21);
    // piso: tapete de EVA em quadrados (2 m cada), peças com encaixe pintado
    const [tc, tg] = cv(512, 512); { const cs = ['#ff6b6b', '#4dabf7', '#ffd43b', '#51cf66'];
      for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { tg.fillStyle = cs[i * 2 + j]; tg.fillRect(i * 256, j * 256, 256, 256);
        tg.fillStyle = 'rgba(255,255,255,.22)'; tg.fillRect(i * 256 + 8, j * 256 + 8, 240, 110); tg.strokeStyle = 'rgba(40,20,60,.55)'; tg.lineWidth = 6; tg.strokeRect(i * 256 + 3, j * 256 + 3, 250, 250);
        tg.fillStyle = 'rgba(0,0,0,.08)'; for (let k = 0; k < 30; k++) { tg.beginPath(); tg.arc(i * 256 + rr() * 256, j * 256 + rr() * 256, 2 + rr() * 3, 0, 7); tg.fill(); } } }
    add(new THREE.BoxGeometry(70, 0.4, 70), toon({ map: T(tc, 17, 17) }), 0, -0.2, -10, g);
    // parede com papel de parede (estrelas, nuvens, bolinhas) + rodapé
    const [wc, wg] = cv(512, 512); { wg.fillStyle = '#fff1d6'; wg.fillRect(0, 0, 512, 512); wg.fillStyle = '#ffe0a8'; for (let x = 0; x < 512; x += 64) wg.fillRect(x, 0, 32, 512);
      const est = (x, y, s, col) => { wg.fillStyle = col; wg.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? s * 0.45 : s; wg.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } wg.fill(); };
      est(100, 110, 38, '#ff8fb0'); est(330, 300, 44, '#6cc3ff'); est(450, 90, 30, '#ffc83d'); est(170, 400, 34, '#8be28b');
      wg.fillStyle = '#ffffff'; for (const [x, y] of [[260, 120], [90, 290], [400, 440]]) for (const [dx, dy, r] of [[0, 0, 26], [28, 6, 20], [-26, 8, 18]]) { wg.beginPath(); wg.arc(x + dx, y + dy, r, 0, 7); wg.fill(); } }
    add(new THREE.PlaneGeometry(90, 34), toon({ map: T(wc, 9, 3.4) }), 0, 17, -26, g, { cast: false });
    add(new THREE.BoxGeometry(90, 1.1, 0.5), toon({ color: '#d9482f' }), 0, 0.55, -25.8, g, { cast: false });
    // bloco de brinquedo com letra em cada face
    const bloco = (cor, letras) => letras.map((l, i) => { const [c, x] = cv(256, 256); x.fillStyle = cor; x.fillRect(0, 0, 256, 256); x.fillStyle = 'rgba(255,255,255,.28)'; x.fillRect(0, 0, 256, 18); x.strokeStyle = 'rgba(40,20,60,.5)'; x.lineWidth = 12; x.strokeRect(6, 6, 244, 244);
      x.fillStyle = '#fff8e4'; x.font = '900 170px Arial Black, Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(l, 128, 138); return toon({ map: T(c) }); });
    const blocos = new THREE.Group(); blocos.position.set(-2.6, 0, -6.0); g.add(blocos);
    for (const [x, y, z, ry, cor, ls] of [[0, 0.7, 0, 0.15, '#ff5c5c', 'ABCDEF'], [1.6, 0.7, 0.4, -0.3, '#4dabf7', 'GHIJKL'], [0.7, 2.1, 0.1, 0.5, '#ffd43b', 'MNOPQR']]) { const b = add(new THREE.BoxGeometry(1.4, 1.4, 1.4), bloco(cor, ls.split('')), x, y, z, blocos); b.rotation.y = ry; }
    // bola de praia que quica (state)
    const [bc, bg] = cv(512, 256); { const cs = ['#ff4d4d', '#fff8e4', '#4dabf7', '#ffd43b', '#51cf66', '#fff8e4']; for (let i = 0; i < 12; i++) { bg.fillStyle = cs[i % 6]; bg.fillRect(i * 512 / 12, 0, 512 / 12 + 1, 256); } }
    const bola = add(new THREE.SphereGeometry(1.0, 32, 20), toon({ map: T(bc) }), 2.0, 1, -5.0, g);
    // urso de pelúcia gigante (esferas lisas), sentado ao fundo
    const urso = new THREE.Group(); urso.position.set(1.8, 0, -17.5); urso.scale.setScalar(0.75); g.add(urso);
    { const pel = toon({ color: '#c8884a' }), claro = toon({ color: '#ecc796' }), esc = toon({ color: '#2b1b24' }), lac = toon({ color: '#e0392d' });
      const S = (r0, mt, x, y, z, sx = 1, sy = 1, sz = 1) => { const m = add(new THREE.SphereGeometry(r0, 28, 20), mt, x, y, z, urso); m.scale.set(sx, sy, sz); return m; };
      S(3.0, pel, 0, 3.0, 0, 1, 1.1, 0.9); S(2.0, claro, 0, 2.7, 2.0, 1, 1.15, 0.5);
      const cab = new THREE.Group(); cab.position.set(0, 7.0, 0.3); urso.add(cab); urso.userData.cab = cab;
      add(new THREE.SphereGeometry(2.3, 28, 20), pel, 0, 0, 0, cab); for (const s of [-1, 1]) { add(new THREE.SphereGeometry(0.85, 20, 14), pel, s * 1.8, 1.8, 0, cab); add(new THREE.SphereGeometry(0.5, 16, 12), claro, s * 1.8, 1.8, 0.45, cab); add(new THREE.SphereGeometry(0.27, 14, 10), esc, s * 0.85, 0.35, 2.05, cab); add(new THREE.SphereGeometry(0.11, 10, 8), toon({ color: '#ffffff' }), s * 0.85 + 0.07, 0.42, 2.27, cab); }
      add(new THREE.SphereGeometry(0.95, 20, 14), claro, 0, -0.65, 1.75, cab).scale.set(1, 0.8, 0.9); add(new THREE.SphereGeometry(0.3, 14, 10), esc, 0, -0.35, 2.55, cab);
      S(0.9, pel, -2.9, 3.6, 1.3, 0.8, 1.9, 0.8).rotation.z = -0.5; S(0.9, pel, 2.9, 3.6, 1.3, 0.8, 1.9, 0.8).rotation.z = 0.5;
      S(1.1, pel, -1.8, 0.6, 1.9, 1, 0.9, 1.5); S(1.1, pel, 1.8, 0.6, 1.9, 1, 0.9, 1.5); S(0.6, claro, -1.8, 0.6, 3.0, 1, 0.7, 0.5); S(0.6, claro, 1.8, 0.6, 3.0, 1, 0.7, 0.5);
      add(new THREE.TorusGeometry(1.5, 0.28, 10, 32), lac, 0, 4.9, 0.5, urso).rotation.x = Math.PI / 2 - 0.2; }
    // trilho oval + trem de brinquedo
    const TR = { cx: 0, cz: -10.5, a: 10.5, b: 3.4 }, pt = (th, k = 1) => new THREE.Vector3(TR.cx + TR.a * k * Math.cos(th), 0, TR.cz + TR.b * k * Math.sin(th));
    { const curva = (k) => new THREE.CatmullRomCurve3(Array.from({ length: 64 }, (_, i) => pt(i / 64 * Math.PI * 2, k)), true), ferro = toon({ color: '#9aa3b5' }), madeira = toon({ color: '#b5783c' });
      for (const k of [0.93, 1.07]) add(new THREE.TubeGeometry(curva(k).clone(), 160, 0.07, 6, true), ferro, 0, 0.2, 0, g, { cast: false }).position.y = 0.2;
      for (let i = 0; i < 70; i++) { const th = i / 70 * Math.PI * 2, p = pt(th), s = add(new THREE.BoxGeometry(0.28, 0.12, 1.6), madeira, p.x, 0.07, p.z, g, { cast: false }); s.rotation.y = Math.atan2(-(TR.b * Math.cos(th)), -TR.a * Math.sin(th)); } }
    const trem = new THREE.Group(); g.add(trem); const carros = [];
    { const verm = toon({ color: '#e0392d' }), azl = toon({ color: '#3b82f6' }), ama = toon({ color: '#ffd43b' }), pre = toon({ color: '#33333f' }), vrd = toon({ color: '#3fbf6a' });
      const roda = (p, x, z) => { const w = add(new THREE.CylinderGeometry(0.34, 0.34, 0.16, 18), pre, x, 0.38, z, p); w.rotation.x = Math.PI / 2; };
      const loco = new THREE.Group(); trem.add(loco); const cb = add(new THREE.CylinderGeometry(0.62, 0.62, 2.0, 22), verm, 0.5, 1.15, 0, loco); cb.rotation.z = Math.PI / 2;
      add(new THREE.BoxGeometry(1.1, 1.3, 1.3), azl, -0.9, 1.45, 0, loco); add(new THREE.BoxGeometry(1.4, 0.16, 1.5), ama, -0.9, 2.15, 0, loco); add(new THREE.CylinderGeometry(0.2, 0.28, 0.7, 14), ama, 1.2, 2.0, 0, loco); add(new THREE.BoxGeometry(3.3, 0.3, 1.2), pre, 0, 0.55, 0, loco);
      for (const x of [-1.1, 0.0, 1.2]) for (const z of [-0.65, 0.65]) roda(loco, x, z); carros.push(loco);
      for (const [cor, ca] of [[ama, vrd], [azl, verm]]) { const v = new THREE.Group(); trem.add(v); add(new THREE.BoxGeometry(2.6, 0.3, 1.2), pre, 0, 0.55, 0, v); add(new THREE.BoxGeometry(2.4, 1.0, 1.4), cor, 0, 1.2, 0, v); add(new THREE.BoxGeometry(2.6, 0.18, 1.55), ca, 0, 1.78, 0, v); for (const x of [-0.8, 0.8]) for (const z of [-0.65, 0.65]) roda(v, x, z); carros.push(v); } }
    trem.scale.setScalar(1.15);
    lista.brinquedo = { g, raio: RAIO.brinquedo, chao: () => 0,
      state(S, f, L) { const t = f / 30, B = S.brinquedo || {};
        const th0 = (B.trem ?? 1) ? 1.2 + t * 0.32 : 1.2;
        carros.forEach((c, i) => { const th = th0 - i * 0.2, p = pt(th), dx = -TR.a * Math.sin(th), dz = TR.b * Math.cos(th); c.parent === trem; c.position.set(p.x, 0, p.z); c.rotation.y = Math.atan2(-dz, dx); c.scale.setScalar(1); });
        trem.position.set(0, 0, 0); trem.scale.setScalar(1);
        const q = (B.bola ?? 1) ? Math.abs(Math.sin(t * 3.1)) : 0; bola.position.y = 1 + 1.7 * q; bola.scale.set(1 + 0.18 * (1 - q) ** 6, 1 - 0.2 * (1 - q) ** 6, 1 + 0.18 * (1 - q) ** 6); bola.rotation.set(t * 0.8, t * 1.3, 0);
        urso.userData.cab.rotation.set(0.05 * Math.sin(t * 0.9), 0.15 * Math.sin(t * 0.6), 0.04 * Math.sin(t * 0.7)); } };
  }

  // =====================================================================================
  // 3) CIDADE DO CAOS — rua estreita de desenho animado no fim de tarde: prédios tortos coloridos, carros empilhados/batidos,
  //    poste torto, hidrante jorrando, semáforo maluco, bueiro soltando fumaça, fios, balões, cones, placa-letreiro no fim da rua
  // =====================================================================================
  {
    const g = novo('cidade'), rr = P.rng(33);
    const bas = ['#ff8fa3', '#7bdcb5', '#ffd166', '#74b9ff', '#c4a1ff', '#ff9f6b', '#a7e36d'];
    // rua: asfalto (x -5..5) com faixa amarela tracejada e linhas brancas, calçada de lajotas (5..8), resto chão escuro
    const [ac, ag] = cv(1200, 200);
    { ag.fillStyle = '#6a6488'; ag.fillRect(0, 0, 1200, 200);
      ag.fillStyle = '#7d779c'; for (let i = 0; i < 200; i++) { ag.beginPath(); ag.arc(500 + rr() * 200, rr() * 200, 1 + rr() * 2, 0, 7); ag.fill(); }
      ag.fillStyle = '#cdc6dc'; ag.fillRect(440, 0, 60, 200); ag.fillRect(700, 0, 60, 200);
      ag.strokeStyle = '#a79fbd'; ag.lineWidth = 3; for (const x0 of [440, 700]) { for (let k = 0; k <= 3; k++) { ag.beginPath(); ag.moveTo(x0 + k * 20, 0); ag.lineTo(x0 + k * 20, 200); ag.stroke(); } for (let y = 0; y <= 200; y += 50) { ag.beginPath(); ag.moveTo(x0, y); ag.lineTo(x0 + 60, y); ag.stroke(); } }
      ag.fillStyle = '#f2e9ff'; ag.fillRect(496, 0, 5, 200); ag.fillRect(699, 0, 5, 200);
      ag.fillStyle = '#ffd21f'; ag.fillRect(597, 20, 6, 110); }
    const rua = new THREE.Mesh(new THREE.PlaneGeometry(60, 200), toon({ map: T(ac, 1, 20) })); rua.rotation.x = -Math.PI / 2; rua.position.set(0, 0, -60); rua.receiveShadow = true; g.add(rua);
    const [zc, zg] = cv(512, 128); zg.fillStyle = '#f6f0ff'; for (let i = 0; i < 9; i++) zg.fillRect(i * 57 + 8, 0, 34, 128);
    const faixa = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.6), new THREE.MeshToonMaterial({ map: T(zc), transparent: true, gradientMap: null })); faixa.rotation.x = -Math.PI / 2; faixa.position.set(0, 0.012, -3.4); faixa.receiveShadow = true; g.add(faixa);
    // prédios
    const fachada = (cols, rows, base, seed) => { const r = P.rng(seed), [c, x] = cv(cols * 72, rows * 72); x.fillStyle = base; x.fillRect(0, 0, c.width, c.height);
      x.fillStyle = 'rgba(0,0,0,.08)'; for (let j = 0; j < rows; j++) if (j % 2) x.fillRect(0, j * 72, c.width, 72);
      for (let j = 1; j < rows; j++) for (let i = 0; i < cols; i++) { const lit = r() < 0.45, ox = i * 72 + 14, oy = c.height - (j + 1) * 72 + 12;
        x.fillStyle = '#3a2a4a'; x.fillRect(ox - 4, oy - 4, 52, 56); x.fillStyle = lit ? '#ffe27a' : (r() < 0.5 ? '#6fb3ee' : '#4a7cc4'); x.fillRect(ox, oy, 44, 48);
        x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(ox, oy, 44, 10); x.fillStyle = '#3a2a4a'; x.fillRect(ox + 20, oy, 4, 48); x.fillRect(ox, oy + 22, 44, 4);
        if (r() < 0.22) { x.fillStyle = ['#ff5c8a', '#fff', '#6cd96c'][(r() * 3) | 0]; x.fillRect(ox + 4, oy + 10, 14, 30); } }
      const y0 = c.height - 72; for (let i = 0; i < cols; i++) { x.fillStyle = i % 2 ? '#ffffff' : ['#e0392d', '#2b7be0', '#18a05a'][seed % 3]; x.fillRect(i * 72, y0 + 8, 72, 18); }
      x.fillStyle = '#3a2a4a'; x.fillRect(c.width / 2 - 22, y0 + 28, 44, 44); x.fillStyle = '#ffd36e'; x.fillRect(c.width / 2 - 18, y0 + 32, 36, 36); return T(c); };
    const predio = (cx, cz, W, D, H, base, seed, lado) => { // lado +1 = fachada vira para +x (prédio da esquerda), -1 = para -x
      const cols = Math.max(2, Math.round(D / 2.3)), rows = Math.max(3, Math.round(H / 2.9)), plain = toon({ color: base }), fac = toon({ map: fachada(cols, rows, base, seed) });
      const mats = [plain, plain, plain, plain, plain, plain]; mats[lado > 0 ? 0 : 1] = fac;
      const b = add(new THREE.BoxGeometry(W, H, D), mats, cx, H / 2, cz, g, { cast: false }); b.rotation.set(0, 0, (rr() - 0.5) * 0.05 * (H > 18 ? 1 : 0.5)); return b; };
    const PRD = { 1: [], '-1': [] };
    for (const lado of [1, -1]) { let z = 12, k = lado > 0 ? 0 : 3; while (z > -62) { const D = 8 + rr() * 3, H = 11 + rr() * 17, W = 9; const i = PRD[lado].length; PRD[lado].push({ z0: z, z1: z - D, H, W, D }); if (!(lado < 0 && i === 1)) predio(-lado * (8.2 + W / 2), z - D / 2, W, D, H, bas[k++ % bas.length], 100 + k * 7, lado); else k++; z -= D + 0.15; } }

    // fim da rua: prédio-letreiro
    { const [lc, lg] = cv(1024, 512); lg.fillStyle = '#ff5c8a'; lg.fillRect(0, 0, 1024, 512); lg.fillStyle = '#ffd21f'; lg.fillRect(40, 40, 944, 432); lg.strokeStyle = '#241726'; lg.lineWidth = 14; lg.strokeRect(40, 40, 944, 432);
      lg.fillStyle = '#e0392d'; lg.font = '900 150px Arial Black, Arial, sans-serif'; lg.textAlign = 'center'; lg.textBaseline = 'middle'; lg.fillText('CIDADE', 512, 170); lg.fillStyle = '#2b7be0'; lg.fillText('DO CAOS', 512, 340);
      lg.fillStyle = '#fff'; for (let i = 0; i < 24; i++) { lg.beginPath(); lg.arc(70 + i * 38.5, 60, 8, 0, 7); lg.arc(70 + i * 38.5, 452, 8, 0, 7); lg.fill(); }
      const fim = [0, 1, 2, 3, 4, 5].map((i) => i === 4 ? toon({ map: fachada(14, 11, '#7bdcb5', 77) }) : toon({ color: '#7bdcb5' })), tab = toon({ map: T(lc) }); add(new THREE.BoxGeometry(34, 34, 8), fim, 0, 17, -68, g, { cast: false }); add(new THREE.PlaneGeometry(22, 11), tab, 0, 22, -63.85, g, { cast: false }); }
    // carros
    const carro = (cor, x, y, z, ry, rz = 0, taxi = false) => { const c = new THREE.Group(); c.position.set(x, y, z); c.rotation.set(0, ry, rz); g.add(c);
      const corpo = toon({ color: cor }), vid = toon({ color: '#9ad7ff' }), pre = toon({ color: '#2b2433' }), br = toon({ color: '#fff4c2' });
      add(new THREE.BoxGeometry(4.2, 0.85, 1.9), corpo, 0, 0.8, 0, c); add(new THREE.BoxGeometry(2.3, 0.8, 1.7), corpo, -0.2, 1.62, 0, c); add(new THREE.BoxGeometry(2.0, 0.55, 1.76), vid, -0.2, 1.64, 0, c, { cast: false }); add(new THREE.BoxGeometry(2.34, 0.14, 1.74), corpo, -0.2, 2.06, 0, c);
      for (const sx of [-1.35, 1.35]) for (const sz of [-0.9, 0.9]) { const w = add(new THREE.CylinderGeometry(0.42, 0.42, 0.34, 18), pre, sx, 0.42, sz, c); w.rotation.x = Math.PI / 2; }
      for (const sz of [-0.62, 0.62]) add(new THREE.SphereGeometry(0.2, 12, 8), br, 2.1, 0.95, sz, c);
      if (taxi) add(new THREE.BoxGeometry(0.9, 0.3, 0.4), toon({ color: '#fff' }), -0.2, 2.3, 0, c); return c; };
    carro('#ffd21f', 2.4, 0, -9.5, 0.45, 0, true); carro('#2fbf71', 2.9, 0, -17.5, -0.1); carro('#3b82f6', 3.1, 1.8, -17.2, 0.6, 0.06); carro('#e0392d', -2.9, 0, -13.5, -0.5);
    // poste torto + lâmpada, semáforo, hidrante, bueiro, cones, balões, fios
    const poste = (x, z, rz) => { const p = new THREE.Group(); p.position.set(x, 0, z); p.rotation.z = rz; g.add(p); const fe = toon({ color: '#5a5470' });
      add(new THREE.CylinderGeometry(0.1, 0.15, 6.2, 10), fe, 0, 3.1, 0, p); const braco = add(new THREE.CylinderGeometry(0.07, 0.07, 1.6, 8), fe, 0.7, 6.2, 0, p); braco.rotation.z = Math.PI / 2; add(new THREE.SphereGeometry(0.32, 14, 10), new THREE.MeshBasicMaterial({ color: '#fff2a8' }), 1.4, 6.05, 0, p, { cast: false }); return p; };
    poste(-4.4, -6.5, 0.2); poste(4.6, -14.5, -0.08); poste(-4.5, -22, 0.05);
    const sem = new THREE.Group(); sem.position.set(4.5, 0, -4.8); g.add(sem); const luzes = [];
    { add(new THREE.CylinderGeometry(0.1, 0.12, 4.2, 10), toon({ color: '#5a5470' }), 0, 2.1, 0, sem); add(new THREE.BoxGeometry(0.8, 1.9, 0.55), toon({ color: '#2b2433' }), 0, 4.5, 0, sem);
      for (const [i, col] of ['#ff3b3b', '#ffd21f', '#3bd96c'].entries()) { const m = new THREE.MeshBasicMaterial({ color: col }); const d = add(new THREE.CircleGeometry(0.24, 18), m, 0, 5.1 - i * 0.6, 0.29, sem, { cast: false }); d.userData.cor = new THREE.Color(col); luzes.push(m); } }
    sem.rotation.z = -0.06;
    const hid = new THREE.Group(); hid.position.set(-2.5, 0, -4.6); g.add(hid);
    { const vm = toon({ color: '#e0392d' }), cr = toon({ color: '#ffe27a' }); add(new THREE.CylinderGeometry(0.34, 0.4, 0.9, 16), vm, 0, 0.45, 0, hid); add(new THREE.SphereGeometry(0.34, 16, 10), vm, 0, 0.95, 0, hid); add(new THREE.CylinderGeometry(0.4, 0.4, 0.12, 16), cr, 0, 0.5, 0, hid);
      for (const s of [-1, 1]) { const b = add(new THREE.CylinderGeometry(0.14, 0.14, 0.6, 10), cr, s * 0.42, 0.62, 0, hid); b.rotation.z = Math.PI / 2; } }
    const gotas = []; { const gm = new THREE.MeshBasicMaterial({ color: '#bfe9ff', fog: false }); for (let i = 0; i < 34; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), gm); m.userData.ndSkip = true; m.castShadow = false; hid.add(m); gotas.push(m); } }
    const bueiro = new THREE.Group(); bueiro.position.set(1.4, 0, -7.4); g.add(bueiro); add(new THREE.CylinderGeometry(0.7, 0.7, 0.05, 20), toon({ color: '#2b2433' }), 0, 0.03, 0, bueiro, { cast: false });
    const fumos = []; { const fm = new THREE.MeshBasicMaterial({ color: '#f1ecf8', transparent: true, depthWrite: false, fog: false }); for (let i = 0; i < 7; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 9), fm.clone()); m.userData.ndSkip = true; m.castShadow = false; bueiro.add(m); fumos.push(m); } }
    for (const [x, z] of [[1.9, -3.0], [3.1, -5.2], [-3.4, -2.4], [-1.2, -9.4]]) { const c = new THREE.Group(); c.position.set(x, 0, z); g.add(c); add(new THREE.CylinderGeometry(0.06, 0.36, 0.8, 14), toon({ color: '#ff7a1a' }), 0, 0.4, 0, c); add(new THREE.CylinderGeometry(0.2, 0.26, 0.16, 14), toon({ color: '#ffffff' }), 0, 0.42, 0, c); add(new THREE.BoxGeometry(0.8, 0.08, 0.8), toon({ color: '#ff7a1a' }), 0, 0.04, 0, c); }
    const balaos = []; { const bp = new THREE.Group(); bp.position.set(-4.4, 5.2, -6.5); g.add(bp); balaos.push(bp); // presos no poste torto
      [['#ff5c8a', -0.6, 2.2], ['#4dabf7', 0.3, 2.9], ['#ffd21f', 0.9, 2.1], ['#51cf66', -0.1, 3.5]].forEach(([c, x, h]) => { add(new THREE.SphereGeometry(0.5, 18, 14), toon({ color: c }), x, h, 0, bp).scale.set(1, 1.2, 1); add(new THREE.CylinderGeometry(0.01, 0.01, h, 4), toon({ color: '#ffffff' }), x / 2, h / 2, 0, bp, { cast: false }); }); }
    for (const [z, y] of [[-5, 10.5], [-12, 12], [-20, 11]]) { const cu = new THREE.CatmullRomCurve3([new THREE.Vector3(-8.2, y, z), new THREE.Vector3(0, y - 1.3, z - 0.3), new THREE.Vector3(8.2, y + 0.4, z + 0.2)]); add(new THREE.TubeGeometry(cu, 24, 0.035, 5, false), toon({ color: '#2b2433' }), 0, 0, 0, g, { cast: false }); }
    // ---- CAOS: prédio pegando fogo (esq., z -5..-14), prédio destruído (dir., z 1..-8), assalto ao banco (esq., z 4..-5) ----
    const aux = {}; const FOGO = PRD[1][2], RUINA = PRD[-1][1], BANCO = PRD[1][1];
    const uz = (P0, frac) => P0.z0 - frac * P0.D;                    // z de uma fração da fachada (u cresce p/ -z na face +x)
    const chamaTex = (seed) => { const [c, x] = cv(256, 320), r = P.rng(seed), L = [];
      for (let k = 0; k < 5; k++) { const mid = 1 - Math.abs(k - 2) / 2; L.push([40 + k * 44 + (r() - 0.5) * 16, 120 + 160 * mid * (0.7 + 0.5 * r()), (r() - 0.5) * 50, 30 + 22 * mid]); }
      const forma = (e) => { x.beginPath(); x.moveTo(14, 318); for (const [px, h, cvv, w] of L) { const H = h * e, W = w * (0.6 + 0.4 * e); x.quadraticCurveTo(px - W, 318 - H * 0.45, px + cvv * e, 318 - H); x.quadraticCurveTo(px + W * 0.5, 318 - H * 0.4, px + W, 318); } x.closePath(); };
      x.lineJoin = 'round'; x.lineWidth = 10; x.strokeStyle = PLUMc; forma(1); x.stroke(); x.fillStyle = '#ff5a14'; forma(1); x.fill(); x.fillStyle = '#ffa424'; forma(0.66); x.fill(); x.fillStyle = '#fff0a0'; forma(0.32); x.fill(); return T(c); };
    const chamas = [chamaTex(1), chamaTex(2), chamaTex(3)], fogos = [];
    { const fx = -8.12; const cols = Math.max(2, Math.round(FOGO.D / 2.3)), rows = Math.max(3, Math.round(FOGO.H / 2.9));
      for (const [i, j, k] of [[0, 1, 1.1], [2, 1, 1.2], [1, 2, 1.3], [3, 2, 1.1], [0, 3, 1.3], [2, 3, 1.2], [1, 4, 1.3], [3, 5, 1.2], [0, 5, 1.2], [2, 6, 1.3], [1, 7, 1.2], [3, 7, 1], [0, 8, 1.3], [2, 8, 1.1]]) {
        if (i >= cols || j >= rows) continue; const m = new THREE.MeshBasicMaterial({ map: chamas[0], transparent: true, depthWrite: false, side: THREE.DoubleSide });
        const p = new THREE.Mesh(new THREE.PlaneGeometry(1.7 * k, 2.2 * k), m); p.position.set(fx, (j * 72 + 8) / (rows * 72) * FOGO.H + 1.1 * k, uz(FOGO, (i * 72 + 36) / (cols * 72))); p.rotation.y = Math.PI / 2; p.userData.ndSkip = true; g.add(p); fogos.push({ p, m, i: i + j }); }
      for (const [fr, kk] of [[0.2, 3.2], [0.5, 4.2], [0.8, 3.4]]) { const m = new THREE.MeshBasicMaterial({ map: chamas[0], transparent: true, depthWrite: false, side: THREE.DoubleSide }); const p = new THREE.Mesh(new THREE.PlaneGeometry(2.2 * kk / 2, 2.8 * kk / 2), m); p.position.set(fx - 0.3, FOGO.H + 0.6, uz(FOGO, fr)); p.rotation.y = Math.PI / 2; p.userData.ndSkip = true; g.add(p); fogos.push({ p, m, i: fr * 9 }); } }
    const brilho = new THREE.PointLight('#ff7a2a', 2.2, 26, 1.5); brilho.position.set(-6.3, 6, FOGO.z0 - FOGO.D / 2); g.add(brilho);
    const fumFogo = []; { const fm = new THREE.MeshBasicMaterial({ color: '#4a4258', transparent: true, depthWrite: false, fog: false }); for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), fm.clone()); m.userData.ndSkip = true; m.castShadow = false; g.add(m); fumFogo.push(m); } }
    // prédio destruído: base rachada + restos tombados + entulho na calçada + poeira
    { const cols = 4, rows = 3, [c, x] = cv(cols * 72, rows * 72), r = P.rng(55);
      x.fillStyle = '#9a93a8'; x.fillRect(0, 0, c.width, c.height); for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { x.fillStyle = '#2a2236'; x.fillRect(i * 72 + 12, j * 72 + 10, 48, 52); if (r() < 0.5) { x.fillStyle = '#6fb3ee'; x.fillRect(i * 72 + 18, j * 72 + 16, 18, 22); } }
      x.strokeStyle = '#2a2236'; x.lineWidth = 5; for (let i = 0; i < 7; i++) { x.beginPath(); let px = r() * c.width, py = 0; x.moveTo(px, py); while (py < c.height) { px += (r() - 0.5) * 40; py += 20 + r() * 30; x.lineTo(px, py); } x.stroke(); }
      const ruM = toon({ color: '#8a8498' }), ruF = toon({ map: T(c) }), mt = [ruM, ruF, ruM, ruM, ruM, ruM];
      const b = add(new THREE.BoxGeometry(9, 9, RUINA.D), mt, 12.7, 4.5, RUINA.z0 - RUINA.D / 2, g, { cast: false }); b.rotation.z = -0.03;
      for (const [dx, dz, w, h, d, rz, ry] of [[1.2, -2.6, 4.2, 5.2, 3.2, 0.16, 0.1], [-1.4, 2.4, 3.6, 3.6, 3.0, -0.2, -0.2], [2.4, 2.8, 3.2, 2.4, 2.6, 0.1, 0.3]]) { const q = add(new THREE.BoxGeometry(w, h, d), ruM, 12.7 + dx, 9 + h / 2 - 0.4, RUINA.z0 - RUINA.D / 2 + dz, g, { cast: false }); q.rotation.set(0.05, ry, rz); }
      const ped = toon({ map: T(P.rocha(23, 270, 6, 56)) }); const rp = P.rng(8);
      for (let i = 0; i < 14; i++) add(pedra(0.35 + rp() * 0.75, 40 + i, 0.7), ped, 5.4 + rp() * 2.4, 0.2, RUINA.z0 - 1 - rp() * (RUINA.D - 3), g);
      for (const [px, pz, w, rz] of [[4.6, RUINA.z0 - 4.5, 2.6, 0.5], [5.2, RUINA.z0 - 7, 2.0, -0.4]]) { const t = add(new THREE.BoxGeometry(w, 0.3, 0.9), ruM, px, 0.7, pz, g); t.rotation.set(0, 0.6, rz); }
      const pom = new THREE.Group(); pom.position.set(7.2, 0, RUINA.z0 - RUINA.D / 2); g.add(pom); aux.pom = pom; }
    const poeira = []; { const fm = new THREE.MeshBasicMaterial({ color: '#cfc8d8', transparent: true, depthWrite: false, fog: false }); for (let i = 0; i < 7; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 9), fm.clone()); m.userData.ndSkip = true; m.castShadow = false; aux.pom.add(m); poeira.push(m); } }
    // assalto: porta do banco com vitrine quebrada, letreiro, sirene, saco de dinheiro, moedas, carro de fuga
    { const bz = uz(BANCO, 0.5), [sc, sg] = cv(512, 128); sg.fillStyle = '#ffd21f'; sg.fillRect(0, 0, 512, 128); sg.strokeStyle = PLUMc; sg.lineWidth = 10; sg.strokeRect(5, 5, 502, 118); sg.fillStyle = '#18a05a'; sg.font = '900 92px Arial Black, Arial, sans-serif'; sg.textAlign = 'center'; sg.textBaseline = 'middle'; sg.fillText('BANCO', 256, 70);
      add(new THREE.PlaneGeometry(3.4, 0.85), new THREE.MeshBasicMaterial({ map: T(sc) }), -8.1, 3.3, bz, g, { cast: false }).rotation.y = Math.PI / 2;
      const [vc, vg] = cv(256, 288); vg.fillStyle = '#2a2236'; vg.fillRect(0, 0, 256, 288); vg.fillStyle = '#6fb3ee'; vg.fillRect(14, 14, 228, 260); vg.strokeStyle = '#ffffff'; vg.lineWidth = 5; for (let i = 0; i < 11; i++) { const a = i / 11 * 6.28; vg.beginPath(); vg.moveTo(128, 150); vg.lineTo(128 + Math.cos(a) * 160, 150 + Math.sin(a) * 160); vg.stroke(); }
      vg.fillStyle = '#1a1226'; vg.beginPath(); vg.moveTo(100, 120); vg.lineTo(150, 100); vg.lineTo(175, 160); vg.lineTo(128, 190); vg.lineTo(88, 165); vg.fill();
      add(new THREE.PlaneGeometry(2.3, 2.6), new THREE.MeshBasicMaterial({ map: T(vc) }), -8.1, 1.4, bz, g, { cast: false }).rotation.y = Math.PI / 2;
      const sir = add(new THREE.SphereGeometry(0.3, 14, 10), new THREE.MeshBasicMaterial({ color: '#ff3b3b' }), -8.35, 4.4, uz(BANCO, 0.12), g, { cast: false }); aux.sirene = sir;
      const [dc, dg] = cv(128, 128); dg.fillStyle = '#d9bf8f'; dg.fillRect(0, 0, 128, 128); dg.fillStyle = '#2a8a4a'; dg.font = '900 90px Arial Black, sans-serif'; dg.textAlign = 'center'; dg.textBaseline = 'middle'; dg.fillText('$', 64, 70);
      const saco = add(new THREE.SphereGeometry(0.5, 20, 14), toon({ map: T(dc) }), -6.4, 0.42, bz + 1.2, g); saco.scale.set(1, 0.95, 0.9); add(new THREE.ConeGeometry(0.18, 0.32, 10), toon({ color: '#d9bf8f' }), -6.4, 0.95, bz + 1.2, g);
      for (const [dx, dz] of [[0.7, 0.2], [0.9, -0.5], [-0.4, 0.8], [0.2, 1.1], [1.3, 0.7], [-0.8, -0.2]]) add(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 14), toon({ color: '#ffd21f', emissive: '#7a5a00', emissiveIntensity: 0.4 }), -6.4 + dx, 0.03, bz + 1.2 + dz, g, { cast: false });
      const fuga = carro('#8b5cf6', -3.4, 0, bz - 3.2, Math.PI / 2 - 0.12); const pt = add(new THREE.BoxGeometry(0.1, 0.75, 1.0), toon({ color: '#8b5cf6' }), 0.6, 1.1, 1.0, fuga); pt.rotation.y = -0.9; }
    lista.cidade = { g, raio: RAIO.cidade, chao: () => 0,
      state(S, f, L) { const t = f / 30, C = S.cidade || {};
        const ph = Math.floor(t * 1.6) % 3, pis = Math.sin(t * 20) > 0; luzes.forEach((m, i) => { m.color.set(i === ph ? (pis || i !== 1 ? ['#ff3b3b', '#ffd21f', '#3bd96c'][i] : '#ffd21f') : ['#4a1a1a', '#4a4210', '#124a24'][i]); });
        const hj = C.hidrante ?? 1; gotas.forEach((m, i) => { const u = ((t * 1.3 + i / gotas.length) % 1), v = 3.2 + (i % 5) * 0.4, vx = 1.6 + (i % 7) * 0.35; m.visible = hj > 0.02; m.position.set(0.1 + vx * u * 1.2, 1.0 + v * u * 1.2 - 4.9 * (u * 1.2) ** 2 * 0.75, ((i * 37) % 10) / 20 - 0.25); m.scale.setScalar(0.7 + 0.5 * hj); });
        const fj = C.fumaca ?? 1; fumos.forEach((m, i) => { const u = ((t * 0.45 + i / fumos.length) % 1); m.visible = fj > 0.02; m.position.set(Math.sin(i * 2 + t) * 0.25 * u, 0.3 + u * 3.6, 0); m.scale.setScalar(0.5 + u * 1.7 * fj); m.material.opacity = (1 - u) * 0.9; });
        balaos[0].rotation.z = 0.07 * Math.sin(t * 1.2); balaos[0].rotation.x = 0.05 * Math.sin(t * 0.9);
        const fo = C.fogo ?? 1; fogos.forEach((o, n) => { o.p.visible = fo > 0.02; o.m.map = chamas[(Math.floor(t * 7) + n) % 3]; o.p.scale.set(fo * (1 + 0.06 * Math.sin(t * 17 + n)), fo * (1 + 0.1 * Math.sin(t * 13 + n * 2)), 1); }); brilho.intensity = fo * (2.0 + 0.5 * Math.sin(t * 19));
        fumFogo.forEach((m, i) => { const u = (t * 0.22 + i / fumFogo.length) % 1; m.visible = fo > 0.02; m.position.set(-9.5 + u * 1.5, FOGO.H + 1 + u * 20, uz(FOGO, 0.3 + (i % 3) * 0.2)); m.scale.setScalar(1.6 + u * 4.5); m.material.opacity = (1 - u) * 0.85; });
        poeira.forEach((m, i) => { const u = (t * 0.3 + i / poeira.length) % 1; m.position.set(Math.sin(i * 3) * 1.6, 1 + u * 7, Math.cos(i * 2) * 1.8); m.scale.setScalar(0.8 + u * 2.6); m.material.opacity = (1 - u) * 0.55; });
        aux.sirene.material.color.set(Math.sin(t * 9) > 0 ? '#ff3b3b' : '#5a1a1a'); } };
  }

  // =====================================================================================
  // 4) TRIÂNGULO DAS BERMUDAS — jangada de destroços no mar escuro, neblina verde, navio fantasma, bússola maluca, lanterna verde
  // =====================================================================================
  const chamaCard = (seed) => { const [c, x] = cv(256, 320), r = P.rng(seed), L = []; for (let k = 0; k < 5; k++) { const mid = 1 - Math.abs(k - 2) / 2; L.push([40 + k * 44 + (r() - 0.5) * 16, 120 + 160 * mid * (0.7 + 0.5 * r()), (r() - 0.5) * 50, 30 + 22 * mid]); }
    const forma = (e) => { x.beginPath(); x.moveTo(14, 318); for (const [px, h, cvv, w] of L) { x.quadraticCurveTo(px - w * (0.6 + 0.4 * e), 318 - h * e * 0.45, px + cvv * e, 318 - h * e); x.quadraticCurveTo(px + w * 0.5, 318 - h * e * 0.4, px + w * (0.6 + 0.4 * e), 318); } x.closePath(); };
    x.lineJoin = 'round'; x.lineWidth = 10; x.strokeStyle = PLUMc; forma(1); x.stroke(); x.fillStyle = '#ff5a14'; forma(1); x.fill(); x.fillStyle = '#ffa424'; forma(0.66); x.fill(); x.fillStyle = '#fff0a0'; forma(0.32); x.fill(); return T(c); };
  const tocha = (par, x, z, h = 2.4, escala = 1) => { add(new THREE.CylinderGeometry(0.07, 0.1, h, 8), toon({ color: '#7a4a24' }), x, h / 2, z, par); const m = new THREE.MeshBasicMaterial({ map: chamaCard(7 + ((x * 7 + z) | 0)), transparent: true, depthWrite: false, side: THREE.DoubleSide }); const p = new THREE.Mesh(new THREE.PlaneGeometry(0.8 * escala, 1.0 * escala), m); p.position.set(x, h + 0.45 * escala, z); p.userData.ndSkip = true; par.add(p); return { p, m }; };
  {
    const g = novo('bermudas'), rb = P.rng(61);
    const [wc, wg] = cv(512, 512); wg.fillStyle = '#12413f'; wg.fillRect(0, 0, 512, 512); for (let i = 0; i < 70; i++) { wg.strokeStyle = rb() < 0.5 ? 'rgba(120,230,190,.28)' : 'rgba(5,25,30,.35)'; wg.lineWidth = 3 + rb() * 3; wg.beginPath(); const y = rb() * 512, x0 = rb() * 512; wg.moveTo(x0, y); wg.quadraticCurveTo(x0 + 40, y - 12, x0 + 90, y); wg.stroke(); }
    const mar = new THREE.Mesh(new THREE.PlaneGeometry(500, 500, 70, 70), toon({ map: T(wc, 40, 40) })); mar.rotation.x = -Math.PI / 2; mar.position.y = -0.4; mar.receiveShadow = true; g.add(mar); const mp = mar.geometry.attributes.position; const mbase = mp.array.slice();
    // jangada de destroços (piso útil r 6), aba quebrada, tábuas soltas, barril, mastro quebrado com vela rasgada, lanterna verde
    add(new THREE.CylinderGeometry(6.2, 6.0, 0.6, 44), toon({ map: T(P.planks(5), 4, 4) }), 0, -0.3, 0, g);
    const mad = toon({ map: T(P.planks(9), 1, 1) });
    for (const [a, r0, w, ry, rz] of [[0.4, 6.4, 2.6, 0.2, 0.12], [1.9, 6.6, 2.2, -0.4, -0.2], [3.4, 6.3, 2.8, 0.5, 0.18], [4.8, 6.6, 2.4, -0.2, 0.1]]) { const b = add(new THREE.BoxGeometry(w, 0.18, 0.7), mad, Math.cos(a) * r0, -0.12, Math.sin(a) * r0, g); b.rotation.set(0, a + ry, rz); }
    const mastro = add(new THREE.CylinderGeometry(0.16, 0.22, 7, 10), toon({ color: '#6b4a2a' }), 3.0, 3.2, -2.8, g); mastro.rotation.z = -0.14;
    const [sc, sg] = cv(256, 256); sg.fillStyle = '#e9e2cf'; sg.fillRect(0, 0, 256, 256); sg.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 18; i++) { sg.beginPath(); sg.arc(rb() * 256, rb() * 256, 8 + rb() * 22, 0, 7); sg.fill(); } sg.beginPath(); sg.moveTo(0, 256); sg.lineTo(70, 190); sg.lineTo(120, 256); sg.fill();
    const vela = add(new THREE.PlaneGeometry(3.0, 3.4), toon({ map: T(sc), side: THREE.DoubleSide, alphaTest: 0.5 }), 3.9, 4.0, -2.7, g, { cast: false }); vela.rotation.y = 0.5;
    const barril = add(new THREE.CylinderGeometry(0.5, 0.5, 1.1, 16), toon({ color: '#8a5a2b' }), -3.6, 0.55, -2.2, g); add(new THREE.TorusGeometry(0.51, 0.04, 6, 18), toon({ color: '#596474' }), -3.6, 0.3, -2.2, g).rotation.x = Math.PI / 2;
    const lant = new THREE.Group(); lant.position.set(-2.2, 0, -3.6); g.add(lant); add(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 6), toon({ color: '#5a4a3a' }), 0, 0.8, 0, lant); const lbulb = add(new THREE.SphereGeometry(0.3, 14, 10), new THREE.MeshBasicMaterial({ color: '#8dffb0' }), 0, 1.8, 0, lant, { cast: false });
    const glow = new THREE.PointLight('#7dffa8', 1.6, 18, 1.5); glow.position.set(-2.2, 2, -3.6); g.add(glow);
    // navio fantasma (ao fundo, translúcido) e bússola maluca flutuando
    const fant = new THREE.Group(); fant.position.set(-7, -0.3, -24); fant.rotation.y = 0.5; fant.scale.setScalar(1.5); g.add(fant);
    { const sh = new THREE.Shape(); sh.moveTo(-8, 0.2); sh.lineTo(6, 0.2); sh.quadraticCurveTo(9.5, 0.4, 10, 4); sh.lineTo(-8.4, 4); sh.closePath(); const hg = new THREE.ExtrudeGeometry(sh, { depth: 5, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.4, bevelSegments: 2 }); hg.translate(0, -0.6, -2.5);
      const gm = new THREE.MeshBasicMaterial({ color: '#9fe8c0', transparent: true, opacity: 0.55 }); const m = new THREE.Mesh(hg, gm); m.userData.ndSkip = true; fant.add(m);
      const [fc, fg] = cv(256, 256); fg.fillStyle = '#d8f5e6'; fg.fillRect(0, 0, 256, 256); fg.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 20; i++) { fg.beginPath(); fg.arc(rb() * 256, rb() * 256, 10 + rb() * 24, 0, 7); fg.fill(); }
      for (const [x, h] of [[-3, 11], [2.4, 9], [-6.5, 8]]) { const mm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, h, 8), gm); mm.position.set(x, 4 + h / 2, 0); mm.userData.ndSkip = true; fant.add(mm);
        const sv = new THREE.Mesh(new THREE.PlaneGeometry(4, h * 0.55), new THREE.MeshBasicMaterial({ map: T(fc), transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, opacity: 0.8 })); sv.position.set(x, 4 + h * 0.62, 0); sv.userData.ndSkip = true; fant.add(sv); } }
    const bus = new THREE.Group(); bus.position.set(2.2, 4.3, -9); g.add(bus);
    { const [bc, bg] = cv(256, 256); bg.fillStyle = '#f2c230'; bg.beginPath(); bg.arc(128, 128, 124, 0, 7); bg.fill(); bg.fillStyle = '#fff6dd'; bg.beginPath(); bg.arc(128, 128, 100, 0, 7); bg.fill(); bg.strokeStyle = '#241726'; bg.lineWidth = 6; for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; bg.beginPath(); bg.moveTo(128 + Math.cos(a) * 86, 128 + Math.sin(a) * 86); bg.lineTo(128 + Math.cos(a) * 100, 128 + Math.sin(a) * 100); bg.stroke(); }
        bg.fillStyle = '#241726'; bg.font = '900 38px Arial Black, sans-serif'; bg.textAlign = 'center'; bg.textBaseline = 'middle'; bg.fillText('N', 128, 38); bg.fillText('S', 128, 218); bg.fillText('L', 218, 128); bg.fillText('O', 38, 128);
      const disco = add(new THREE.CylinderGeometry(2, 2, 0.35, 36), toon({ map: T(bc) }), 0, 0, 0, bus); disco.rotation.x = Math.PI / 2; disco.material = [toon({ color: '#c99a22' }), toon({ map: T(bc) }), toon({ color: '#c99a22' })]; }
    const agulha = new THREE.Group(); agulha.position.z = 0.3; bus.add(agulha); add(new THREE.ConeGeometry(0.22, 1.5, 12), toon({ color: '#e0392d' }), 0, 0.75, 0, agulha); add(new THREE.ConeGeometry(0.22, 1.5, 12), toon({ color: '#f4f4f4' }), 0, -0.75, 0, agulha).rotation.x = Math.PI;
    const flut = []; for (const [x, z, s0] of [[-9, -6, 1], [10, -12, 2], [-4, -15, 3], [14, 2, 4]]) { const b = add(new THREE.CylinderGeometry(0.5, 0.5, 1.1, 14), toon({ color: '#8a5a2b' }), x, 0.1, z, g); b.userData.p0 = [x, z, s0]; flut.push(b); }
    lista.bermudas = { g, raio: 6, chao: () => 0,
      state(S, f, L) { const t = f / 30, B = S.bermudas || {};
        const amp = B.mar ?? 0.28; for (let i = 0; i < mp.count; i++) { const x = mbase[i * 3], z = -mbase[i * 3 + 1]; mp.setY(i, amp * (Math.sin(x * 0.18 + t * 1.1) * 0.6 + Math.sin(z * 0.23 - t * 1.4) * 0.4) * Math.min(1, Math.hypot(x, z) / 14)); } mp.needsUpdate = true; mar.geometry.computeVertexNormals();
        g.children[1].rotation.z = 0.012 * Math.sin(t * 0.8);
        bus.visible = (B.bussola ?? 1) !== 0; bus.rotation.y = 0.3 * Math.sin(t * 0.4); bus.position.y = 4.3 + 0.3 * Math.sin(t * 0.9); agulha.rotation.z = (B.bussolaLouca ?? 1) ? t * 3.2 + Math.sin(t * 7) * 0.6 : 0;
        fant.position.y = -0.3 + 0.12 * Math.sin(t * 0.6); fant.rotation.z = 0.03 * Math.sin(t * 0.5);
        flut.forEach((b) => { const [x, z, s0] = b.userData.p0; b.position.y = 0.1 + 0.2 * Math.sin(t * 1.2 + s0); b.rotation.z = 0.2 * Math.sin(t + s0); });
        glow.intensity = 1.4 + 0.5 * Math.sin(t * 5) + (Math.sin(t * 23) > 0.9 ? 0.5 : 0); lbulb.material.color.set(Math.sin(t * 5) > -0.6 ? '#8dffb0' : '#3a8a58'); } };
  }

  // =====================================================================================
  // 5) CIDADE MAIA — praça de pedra, pirâmide escalonada com templo, calendário de pedra, cabeças de pedra, tochas, selva ao redor
  // =====================================================================================
  {
    const g = novo('maia'), rm = P.rng(71);
    const [pc, pg] = cv(512, 512); { pg.fillStyle = '#d9c9a0'; pg.fillRect(0, 0, 512, 512); pg.strokeStyle = 'rgba(90,60,30,.55)'; pg.lineWidth = 5; for (let i = 0; i <= 4; i++) { pg.beginPath(); pg.moveTo(0, i * 128); pg.lineTo(512, i * 128); pg.moveTo(i * 128, 0); pg.lineTo(i * 128, 512); pg.stroke(); } for (let i = 0; i < 60; i++) { pg.fillStyle = rm() < 0.5 ? 'rgba(150,120,70,.25)' : 'rgba(255,245,210,.3)'; pg.beginPath(); pg.ellipse(rm() * 512, rm() * 512, 10 + rm() * 40, 6 + rm() * 18, rm() * 3, 0, 7); pg.fill(); } pg.fillStyle = 'rgba(90,150,60,.4)'; for (let i = 0; i < 26; i++) { pg.beginPath(); pg.arc(rm() * 512, rm() * 512, 3 + rm() * 6, 0, 7); pg.fill(); } }
    add(new THREE.BoxGeometry(80, 0.4, 80), toon({ map: T(pc, 14, 14) }), 0, -0.2, -20, g);
    const [fc, fg] = cv(512, 128); { fg.fillStyle = '#c2a56a'; fg.fillRect(0, 0, 512, 128); fg.strokeStyle = '#6b4a2a'; fg.lineWidth = 9; fg.beginPath(); for (let i = 0; i < 8; i++) { const x = i * 64; fg.moveTo(x, 100); fg.lineTo(x, 28); fg.lineTo(x + 40, 28); fg.lineTo(x + 40, 72); fg.lineTo(x + 18, 72); fg.lineTo(x + 18, 50); } fg.stroke(); }
    const pedraM = toon({ map: T(P.mossy(P.stone(4, 38, 16, 62), 6, 0.4), 6, 2) }), friso = toon({ map: T(fc, 3, 1) });
    const pir = new THREE.Group(); pir.position.set(0, 0, -20); g.add(pir); const n = 5, hN = 2.6;
    for (let i = 0; i < n; i++) { const w = 22 - i * 4, b = add(new THREE.BoxGeometry(w, hN, w), [pedraM, pedraM, pedraM, pedraM, pedraM, pedraM], 0, hN / 2 + i * hN, 0, pir); add(new THREE.BoxGeometry(w + 0.1, 0.8, w + 0.1), friso, 0, i * hN + 1.4, 0, pir, { cast: false }); }
    for (let i = 0; i < n * 5; i++) { const sy = i * (hN / 5), sz = 11 - i * (hN / 5) * (2 / hN) * 0 - (i / 5) * 2 - (i % 5) * 0.4; add(new THREE.BoxGeometry(4.2, hN / 5, 0.6), toon({ color: '#cdb98a' }), 0, sy + hN / 10, sz + 0.2, pir); }
    add(new THREE.BoxGeometry(5.5, 3.6, 5.5), pedraM, 0, n * hN + 1.8, 0, pir); add(new THREE.BoxGeometry(6.4, 0.7, 6.4), friso, 0, n * hN + 3.9, 0, pir); add(new THREE.BoxGeometry(1.8, 2.4, 0.2), toon({ color: '#1e1424' }), 0, n * hN + 1.4, 2.8, pir, { cast: false });
    // calendário de pedra (disco com anéis e dentes) sobre pedestal
    const [dc, dg] = cv(512, 512); { dg.fillStyle = '#c9b58a'; dg.beginPath(); dg.arc(256, 256, 250, 0, 7); dg.fill(); dg.strokeStyle = '#4a3320'; dg.lineWidth = 10; for (const r0 of [240, 190, 140, 80]) { dg.beginPath(); dg.arc(256, 256, r0, 0, 7); dg.stroke(); } dg.lineWidth = 8; for (let i = 0; i < 20; i++) { const a = i * Math.PI / 10; dg.beginPath(); dg.moveTo(256 + Math.cos(a) * 140, 256 + Math.sin(a) * 140); dg.lineTo(256 + Math.cos(a) * 240, 256 + Math.sin(a) * 240); dg.stroke(); dg.fillStyle = i % 2 ? '#e0a63a' : '#4f9a6a'; dg.beginPath(); dg.arc(256 + Math.cos(a + 0.15) * 215, 256 + Math.sin(a + 0.15) * 215, 18, 0, 7); dg.fill(); }
      dg.fillStyle = '#e0a63a'; dg.beginPath(); dg.arc(256, 256, 60, 0, 7); dg.fill(); dg.fillStyle = '#4a3320'; dg.beginPath(); dg.arc(235, 245, 8, 0, 7); dg.arc(277, 245, 8, 0, 7); dg.fill(); dg.fillRect(236, 272, 40, 8); }
    const disco = add(new THREE.CylinderGeometry(2.3, 2.3, 0.5, 40), [toon({ color: '#b9a374' }), toon({ map: T(dc) }), toon({ color: '#b9a374' })], -4.4, 2.6, -5, g); disco.rotation.x = Math.PI / 2; disco.rotation.y = 0.0; disco.rotation.z = 0.3;
    add(new THREE.BoxGeometry(3.2, 0.9, 1.2), pedraM, -4.4, 0.45, -5, g); add(new THREE.BoxGeometry(1.2, 1.3, 0.9), pedraM, -4.4, 1.5, -5.1, g);
    // cabeças de pedra gigantes
    const cabeca = (x, z, ry) => { const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; g.add(c); const sm = pedraM; add(new THREE.BoxGeometry(2.6, 1.2, 2.2), sm, 0, 0.6, 0, c); const cr = add(new THREE.SphereGeometry(1.5, 24, 18), sm, 0, 2.4, 0, c); cr.scale.set(1, 1.1, 0.9); const esc = toon({ color: '#2a1d14' });
      for (const s of [-1, 1]) { add(new THREE.BoxGeometry(0.5, 0.35, 0.2), esc, s * 0.55, 2.7, 1.2, c, { cast: false }); add(new THREE.SphereGeometry(0.22, 10, 8), toon({ color: '#cdb98a' }), s * 0.9, 2.2, 1.0, c); }
      add(new THREE.BoxGeometry(0.4, 0.8, 0.5), sm, 0, 2.3, 1.3, c); add(new THREE.BoxGeometry(1.1, 0.25, 0.2), esc, 0, 1.75, 1.2, c, { cast: false }); add(new THREE.BoxGeometry(2.2, 0.5, 1.7), toon({ color: '#4f9a6a' }), 0, 3.7, 0, c); add(new THREE.BoxGeometry(0.4, 1.1, 0.4), toon({ color: '#e0a63a' }), 0, 4.3, 0, c); return c; };
    cabeca(7.2, -6, -0.5); cabeca(-8, -12, 0.4);
    // ---- ep. 37: cabeça de pedra de 20 t móvel, pedrinhas (1.000 em fila), lasca, pedra quadrada, poeira, sol ----
    const hero = cabeca(0, -2.5, 1.57); hero.scale.setScalar(0.75); hero.visible = false;
    { const [lc, lg] = cv(512, 256); lg.fillStyle = '#d8c79c'; lg.fillRect(0, 0, 512, 256); lg.strokeStyle = '#3a2718'; lg.lineWidth = 14; lg.strokeRect(14, 14, 484, 228); lg.fillStyle = '#3a2718'; lg.font = '900 150px Arial Black, sans-serif'; lg.textAlign = 'center'; lg.textBaseline = 'middle'; lg.fillText('20 T', 256, 136);
      const pl = add(new THREE.PlaneGeometry(1.9, 0.9), toon({ map: T(lc) }), -1.31, 0.62, 0, hero, { cast: false }); pl.rotation.y = -Math.PI / 2; }
    const rocha = toon({ map: T(P.rocha(21, 32, 10, 60), 1, 1) });
    const pedrinhas = (n, x0, x1, z0, z1, r0, seed) => { const rp = P.rng(seed), g0 = new THREE.SphereGeometry(1, 8, 6), pc = g0.attributes.position.count, ic = g0.index.count; const pos = new Float32Array(n * pc * 3), nor = new Float32Array(n * pc * 3), uv = new Float32Array(n * pc * 2), idx = new Uint32Array(n * ic);
      const nx = Math.max(1, Math.round((x1 - x0) / (r0 * 2.1))), pts = []; for (let i = 0; i < n; i++) pts.push([x0 + ((i % nx) + 0.5 + (rp() - 0.5) * 0.7) / nx * (x1 - x0), z0 + (Math.floor(i / nx) + 0.5 + (rp() - 0.5) * 0.7) / Math.ceil(n / nx) * (z1 - z0)]);
      pts.sort((a, b) => (z0 < z1 ? a[1] - b[1] : b[1] - a[1]));
      pts.forEach(([x, z], k) => { const s = r0 * (0.75 + rp() * 0.5), sy = 0.62 + rp() * 0.2; for (let v = 0; v < pc; v++) { const o = (k * pc + v) * 3; pos[o] = x + g0.attributes.position.getX(v) * s; pos[o + 1] = s * sy * 0.55 + g0.attributes.position.getY(v) * s * sy; pos[o + 2] = z + g0.attributes.position.getZ(v) * s; nor[o] = g0.attributes.normal.getX(v); nor[o + 1] = g0.attributes.normal.getY(v); nor[o + 2] = g0.attributes.normal.getZ(v); uv[(k * pc + v) * 2] = g0.attributes.uv.getX(v); uv[(k * pc + v) * 2 + 1] = g0.attributes.uv.getY(v); } for (let q = 0; q < ic; q++) idx[k * ic + q] = g0.index.getX(q) + k * pc; });
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); geo.setIndex(new THREE.BufferAttribute(idx, 1)); const m = new THREE.Mesh(geo, toon({ color: '#d2c6ac' })); m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; m.visible = false; g.add(m); return { m, ic, n }; };
    const fila = pedrinhas(1000, -1.25, 1.25, -2.0, -8.5, 0.065, 91);
    const lasca = (() => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(0.9, 0); sh.lineTo(0.9, 0.22); sh.lineTo(0, 0.03); sh.closePath(); const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.35, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 }), toon({ color: '#9a8566' })); m.castShadow = true; m.visible = false; g.add(m); return m; })();
    const quadrada = add(new THREE.BoxGeometry(0.34, 0.34, 0.34), rocha, 0, 0.17, 0, g); quadrada.visible = false;
    const poeira = []; for (let i = 0; i < 12; i++) { const m = add(new THREE.SphereGeometry(0.07 + (i % 3) * 0.03, 10, 8), toon({ color: '#d9c7a0' }), 0, 0, 0, g, { cast: false }); m.visible = false; poeira.push(m); }
    const solM = new THREE.Mesh(new THREE.CircleGeometry(7, 40), new THREE.MeshBasicMaterial({ color: '#ffb347', fog: false })); solM.userData.ndSkip = true; solM.visible = false; solM.position.set(9, 30, -75); g.add(solM);
    const halo = new THREE.Mesh(new THREE.CircleGeometry(13, 40), new THREE.MeshBasicMaterial({ color: '#ffd9a0', transparent: true, opacity: 0.3, fog: false })); halo.userData.ndSkip = true; halo.position.set(9, 30, -75.5); halo.visible = false; g.add(halo);
    const tochas = [tocha(g, 4.6, -3.8, 2.6, 1.3), tocha(g, -2.2, -2.6, 2.4, 1.2), tocha(g, 5.2, -9, 2.6, 1.3), tocha(g, -6.4, -8.2, 2.6, 1.3)];
    // selva ao redor (troncos + copas lisas)
    const verde = [toon({ color: '#2f8a3a' }), toon({ color: '#3fa24a' }), toon({ color: '#256b33' })], tronco = toon({ color: '#6b4325' });
    for (let i = 0; i < 26; i++) { const a = Math.PI * (0.05 + 0.9 * rm()), r0 = 26 + rm() * 22, x = Math.cos(a) * r0 * 1.3 * (rm() < 0.5 ? -1 : 1), z = -Math.abs(Math.sin(a)) * r0 - 4, h = 9 + rm() * 8; if (Math.abs(x) < 3 && z > -40) continue;
      add(new THREE.CylinderGeometry(0.5, 0.8, h, 8), tronco, x, h / 2, z, g); for (let k = 0; k < 4; k++) add(new THREE.SphereGeometry(3.6 + rm() * 2.4, 16, 12), verde[(rm() * 3) | 0], x + (rm() - 0.5) * 4, h + k * 0.7 - 0.5, z + (rm() - 0.5) * 3, g).scale.y = 0.75; }
    lista.maia = { g, raio: 9, chao: () => 0,
      state(S, f, L) { const t = f / 30, M = S.maia || {};
        { const c = M.cabeca; hero.visible = !!c; if (c) { hero.position.set(c.x, c.y || 0, c.z); hero.rotation.set(c.rx || 0, c.ry ?? 1.57, c.tilt || 0); } }
        fila.m.visible = (M.fila || 0) > 0; fila.m.geometry.setDrawRange(0, Math.round(Math.min(1000, M.fila || 0)) * fila.ic);
        { const l = M.lasca; lasca.visible = !!l; if (l) { lasca.position.set(l.x, l.y || 0.02, l.z); lasca.rotation.set(0, l.ry || 0, l.rz || 0); lasca.scale.setScalar(l.s || 1); } }
        { const q = M.quadrada; quadrada.visible = !!q; if (q) { quadrada.position.set(q.x, (q.y ?? 0.17), q.z); quadrada.rotation.y = q.ry || 0; } }
        { const d = M.poeira; poeira.forEach((m, i) => { const k = d ? ((t * 0.9 + i / 12) % 1) : 0; m.visible = !!d && k > 0; if (d) m.position.set(d.x + (i % 4 - 1.5) * 0.35, d.y - k * d.y, d.z + (i % 3 - 1) * 0.3); }); }
        { const s0 = M.sol; solM.visible = halo.visible = s0 != null; if (s0 != null) { solM.position.y = halo.position.y = 6 + 34 * s0; solM.material.color.set(s0 < 0.3 ? '#ff7a3a' : '#ffb347'); } }
        tochas.forEach((o, i) => { o.m.map = [chamaCard(7), chamaCard(8), chamaCard(9)][(Math.floor(t * 7) + i) % 3]; o.p.scale.set(1 + 0.08 * Math.sin(t * 17 + i), 1 + 0.12 * Math.sin(t * 13 + i * 2), 1); }); } };
  }

  // =====================================================================================
  // 6) AMAZÔNIA — jangada de troncos no rio, vitórias-régias, árvores gigantes com cipós, raios de sol na névoa
  // =====================================================================================
  {
    const g = novo('amazonia'), ra = P.rng(81);
    const [rc, rg] = cv(512, 512); rg.fillStyle = '#3f8c6a'; rg.fillRect(0, 0, 512, 512); for (let i = 0; i < 90; i++) { rg.strokeStyle = ra() < 0.5 ? 'rgba(210,255,225,.3)' : 'rgba(20,70,60,.35)'; rg.lineWidth = 2 + ra() * 3; rg.beginPath(); const y = ra() * 512, x0 = ra() * 512; rg.moveTo(x0, y); rg.quadraticCurveTo(x0 + 30, y - 8, x0 + 70, y); rg.stroke(); }
    const rio = new THREE.Mesh(new THREE.PlaneGeometry(400, 400, 40, 40), toon({ map: T(rc, 40, 40) })); rio.rotation.x = -Math.PI / 2; rio.position.y = -0.4; rio.receiveShadow = true; g.add(rio); const rp = rio.geometry.attributes.position, rbase = rp.array.slice();
    // jangada: troncos amarrados (cilindros) + deck de tábuas
    const log = toon({ map: T(P.planks(2), 1, 1) }), cord = toon({ color: '#c9a66b' });
    add(new THREE.BoxGeometry(11, 0.25, 8), toon({ map: T(P.planks(12), 3, 2) }), 0, -0.1, 0, g);
    for (let i = 0; i < 6; i++) { const l = add(new THREE.CylinderGeometry(0.5, 0.5, 11.4, 14), log, 0, -0.45, -3.4 + i * 1.36, g); l.rotation.z = Math.PI / 2; }
    for (const x of [-4, 0, 4]) add(new THREE.BoxGeometry(0.22, 0.12, 8.6), cord, x, 0.06, 0, g, { cast: false });
    // cabana de palha (toldo) e remo e cesto
    for (const [x, z] of [[-4.6, -3.2], [-1.4, -3.2], [-4.6, -0.6], [-1.4, -0.6]]) add(new THREE.CylinderGeometry(0.1, 0.1, 3, 8), toon({ color: '#8a5a2b' }), x, 1.5, z, g);
    const palha = add(new THREE.ConeGeometry(2.6, 1.4, 4), toon({ color: '#d6b252' }), -3, 3.4, -1.9, g); palha.rotation.y = Math.PI / 4;
    const cesto = add(new THREE.CylinderGeometry(0.5, 0.35, 0.6, 12), toon({ color: '#b5783c' }), 3.8, 0.3, 2.6, g); for (let i = 0; i < 4; i++) add(new THREE.SphereGeometry(0.2, 10, 8), toon({ color: ['#8f8a80', '#a39a8a', '#7d776c', '#968b78'][i] }), 3.7 + (i % 2) * 0.2 - 0.1, 0.7, 2.55 + (i >> 1) * 0.2, g);
    const remo = add(new THREE.CylinderGeometry(0.05, 0.05, 3, 6), toon({ color: '#8a5a2b' }), 4.6, 1.4, -2.8, g); remo.rotation.z = 0.2; add(new THREE.BoxGeometry(0.5, 0.9, 0.06), toon({ color: '#8a5a2b' }), 4.35, 0.2, -2.8, g);
    // vitórias-régias
    const vit = []; for (let i = 0; i < 16; i++) { const x = (ra() - 0.5) * 36, z = -8 - ra() * 22; if (Math.abs(x) < 7 && z > -12) continue; const r0 = 1.0 + ra() * 1.3; const p = new THREE.Group(); p.position.set(x, -0.3, z); g.add(p); add(new THREE.CylinderGeometry(r0, r0 * 0.96, 0.1, 28, 1, true), toon({ color: '#2f9a4a', side: THREE.DoubleSide }), 0, 0.05, 0, p); add(new THREE.CircleGeometry(r0, 28), toon({ color: '#3fb05a' }), 0, 0.04, 0, p).rotation.x = -Math.PI / 2; if (ra() < 0.5) { add(new THREE.SphereGeometry(0.34, 14, 10), toon({ color: '#ff7ab8' }), r0 * 0.2, 0.25, 0, p).scale.y = 0.7; add(new THREE.SphereGeometry(0.16, 10, 8), toon({ color: '#ffe44f' }), r0 * 0.2, 0.38, 0, p); } vit.push(p); }
    // árvores gigantes com raízes tabulares, copas e cipós
    const tr = toon({ map: T(P.rocha(3, 28, 30, 36), 1, 4) }), folha = [toon({ color: '#2a8a3c' }), toon({ color: '#3da04a' }), toon({ color: '#1f6e32' })], cipo = toon({ color: '#3a6a2a' });
    for (let i = 0; i < 16; i++) { const lado = i % 2 ? 1 : -1, x = lado * ((i < 6 ? 4.2 : 9) + ra() * (i < 6 ? 3 : 9)), z = -9 - (i >> 1) * 4.2 - ra() * 3, h = 20 + ra() * 12;
      add(new THREE.CylinderGeometry(0.9, 1.3, h, 12), tr, x, h / 2, z, g); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + ra(), rt = add(new THREE.ConeGeometry(0.7, 3.2, 8), tr, x + Math.cos(a) * 1.1, 1.4, z + Math.sin(a) * 1.1, g); rt.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); }
      for (let k = 0; k < 5; k++) add(new THREE.SphereGeometry(4 + ra() * 2.4, 16, 12), folha[(ra() * 3) | 0], x + (ra() - 0.5) * 6, h - 1 + k * 0.6, z + (ra() - 0.5) * 5, g).scale.y = 0.7;
      for (let k = 0; k < 3; k++) { const vx = x - lado * (1.5 + ra() * 3), top = h - 2, bot = 5 + ra() * 6; add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(vx, top, z + 1), new THREE.Vector3(vx + (ra() - 0.5), (top + bot) / 2, z + 1.2), new THREE.Vector3(vx - lado * 0.6, bot, z + 1)]), 10, 0.07, 5), cipo, 0, 0, 0, g, { cast: false }); } }
    // raios de sol (cones translúcidos, sem tinta)
    const raios = []; for (const [x, z, ry] of [[-3, -9, 0.1], [4, -14, -0.12], [-8, -18, 0.2]]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 3.6, 24, 18, 1, true), new THREE.MeshBasicMaterial({ color: '#fff3b0', transparent: true, opacity: 0.16, depthWrite: false, side: THREE.DoubleSide })); c.position.set(x, 12, z); c.rotation.set(0, 0, ry); c.userData.ndSkip = true; g.add(c); raios.push(c); }
    lista.amazonia = { g, raio: 5, chao: () => 0,
      state(S, f, L) { const t = f / 30; for (let i = 0; i < rp.count; i++) { const x = rbase[i * 3], z = -rbase[i * 3 + 1]; rp.setY(i, 0.12 * (Math.sin(x * 0.2 + t * 0.8) + Math.sin(z * 0.27 - t)) * Math.min(1, Math.hypot(x, z) / 10)); } rp.needsUpdate = true; rio.geometry.computeVertexNormals();
        vit.forEach((p, i) => { p.position.y = -0.3 + 0.04 * Math.sin(t * 1.3 + i); p.rotation.y = 0.05 * Math.sin(t * 0.5 + i); }); raios.forEach((c, i) => { c.material.opacity = 0.13 + 0.05 * Math.sin(t * 0.7 + i * 2); }); } };
  }

  construirMais({ THREE, P, add, toon, cv, T, novo, lista, pedra, chamaCard, PLUMc });
  construirNavioBermudas({ THREE, P, add, toon, cv, T, novo, lista });
  construirCasa({ THREE, P, add, toon, cv, T, novo, lista });
  return {
    state(S, f, L) { for (const id in lista) { const c = lista[id], on = S.cenario === id; c.g.visible = on; if (on) c.state(S, f, L); } },
    chao(x, z) { for (const id in lista) { const o = ORIGEM[id]; if (Math.hypot(x - o.x, z - o.z) < 80) return o.y + lista[id].chao(x - o.x, z - o.z); } return null; },
    lista,
  };
}
