// cenarios4.js — PACOTE CASA (20/11/2026): sala, cozinha, quarto, fachada. Interiores ricos (papel de parede, rodapé, janela com céu,
// quadros, abajur com luz, tapete, 12+ props legíveis cada) para modelar referências de cômodos (ricksclips: ladrão que move móveis).
// Liga: worldAt -> { cenario: 'sala'|'cozinha'|'quarto'|'fachada', <id>: { gato, abajur, moveis: {sofa:dx, mesa:dx, ...}, luzJanela } } + luz('<luz>').
// Luzes sugeridas: casa_dia (amarelo quente), casa_noite (azul frio), casa_quarto (azul-violeta), casa_tarde (laranja). Piso y=0, parede do fundo z=-3.5, largura x ±3.5.
// Câmeras: camCen(id,'geral'|'medio'|'close') (mesmas do espaço). Offsets de móveis: B.moveis = { sofa: dx (m, +direita) } — gag "1 polegada pra esquerda".
export const SALAS = ['sala', 'cozinha', 'quarto', 'fachada'];

export function construirCasa(X) {
  const { THREE, P, add, toon, cv, T, novo, lista } = X, PI = Math.PI;

  const pintaPapel = (id, cor1, cor2, tipo) => {
    const [c, a] = cv(512, 512), r = P.rng(id.length * 77 + 5); a.fillStyle = cor1; a.fillRect(0, 0, 512, 512); a.fillStyle = cor2;
    if (tipo === 'listras') for (let x = 0; x < 512; x += 64) a.fillRect(x, 0, 32, 512);
    else if (tipo === 'bolas') for (let y = 20; y < 512; y += 64) for (let x = (y / 64 % 2) * 32 + 20; x < 512; x += 64) { a.beginPath(); a.arc(x, y, 9, 0, 7); a.fill(); }
    else if (tipo === 'xadrez') for (let y = 0; y < 512; y += 64) for (let x = 0; x < 512; x += 64) if (((x + y) / 64) % 2 === 0) a.fillRect(x, y, 64, 64);
    else if (tipo === 'estrelas') for (let i = 0; i < 40; i++) { a.beginPath(); a.arc(r() * 512, r() * 512, 2 + r() * 4, 0, 7); a.fill(); }
    for (let i = 0; i < 500; i++) { a.fillStyle = r() < 0.5 ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.05)'; a.fillRect(r() * 512, r() * 512, 2, 2); }
    return c;
  };
  const piso = (kind, c1, c2) => {
    const [c, a] = cv(512, 512), r = P.rng(kind.length + 9);
    if (kind === 'xadrez') { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { a.fillStyle = (x + y) % 2 ? c1 : c2; a.fillRect(x * 64, y * 64, 64, 64); } }
    else { for (let i = 0; i < 6; i++) { const h = 512 / 6; a.fillStyle = c1; a.fillRect(0, i * h, 512, h); a.fillStyle = c2; for (let m = 0; m < 24; m++) { a.globalAlpha = 0.18; a.fillRect(r() * 512, i * h + r() * h, 40 + r() * 120, 2); } a.globalAlpha = 1; a.fillStyle = 'rgba(0,0,0,.45)'; a.fillRect(0, i * h, 512, 3); a.fillRect(((i * 197) % 512), i * h, 3, h); } }
    return c;
  };
  const caixa = (g, w, h, d, cor, x, y, z, ry = 0) => { const m = add(new THREE.BoxGeometry(w, h, d), toon({ color: cor }), x, y + h / 2, z, g); m.rotation.y = ry; return m; };
  const cil = (g, rt, rb, h, cor, x, y, z) => add(new THREE.CylinderGeometry(rt, rb, h, 20), toon({ color: cor }), x, y + h / 2, z, g);
  const quadro = (g, x, y, z, w, h, cor, arte) => {
    caixa(g, w + 0.12, h + 0.12, 0.05, '#5b3a22', x, y, z); const [c, a] = cv(128, 128); a.fillStyle = cor; a.fillRect(0, 0, 128, 128); a.fillStyle = arte; a.beginPath(); a.arc(64, 70, 34, 0, 7); a.fill(); a.fillRect(0, 100, 128, 28);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toon({ map: T(c) })); m.position.set(x, y + h / 2, z + 0.03); g.add(m);
  };
  // NOITE (20/11, revisão ep.38): toda janela tem textura de dia e de noite (céu azul-escuro + lua + estrelas). Troca por B.noite (0|1) ou, sem B.noite, pela luz (L.noite).
  // B.breu=1 apaga a luz de teto (cena "no escuro"); B.tetoNoite (padrão 0,2) = fração da luz de teto à noite.
  let ATUAL = null; const JAN = {}, LUZC = {};
  const ceuNoite = (seed) => { const [c, a] = cv(256, 256), r = P.rng(seed), gr = a.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#03071c'); gr.addColorStop(1, '#16205a'); a.fillStyle = gr; a.fillRect(0, 0, 256, 256);
    a.fillStyle = '#ffffff'; for (let i = 0; i < 26; i++) { a.globalAlpha = 0.4 + r() * 0.6; a.fillRect(r() * 256, r() * 200, 2 + (r() < 0.2 ? 1 : 0), 2); } a.globalAlpha = 1;
    a.fillStyle = '#fff3b0'; a.beginPath(); a.arc(184, 66, 30, 0, 7); a.fill(); a.fillStyle = '#16205a'; a.beginPath(); a.arc(198, 56, 26, 0, 7); a.fill(); return c; };
  const janela = (g, x, y, z, w, h, ceu, cort) => {
    const [c, a] = cv(256, 256), gr = a.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, ceu[0]); gr.addColorStop(1, ceu[1]); a.fillStyle = gr; a.fillRect(0, 0, 256, 256);
    a.fillStyle = ceu[2] || '#fff'; for (const [cx, cy, r] of [[60, 70, 22], [90, 64, 28], [180, 110, 20]]) { a.beginPath(); a.arc(cx, cy, r, 0, 7); a.fill(); }
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: T(c), fog: false })); m.position.set(x, y + h / 2, z + 0.02); m.userData.ndSkip = true; g.add(m);
    m.userData.tD = m.material.map; m.userData.tN = T(ceuNoite(Math.round(x * 10 + 50))); if (ATUAL) (JAN[ATUAL] ||= []).push(m);
    for (const [fx, fy, fw, fh] of [[0, h / 2, w + 0.2, 0.1], [0, -0.05, w + 0.3, 0.12], [-w / 2, h / 2, 0.1, h], [w / 2, h / 2, 0.1, h], [0, h / 2, 0.06, h]]) caixa(g, fw, fh, 0.08, '#f4efe6', x + fx, y + fy - fh / 2, z + 0.04);
    for (const s of [-1, 1]) { const cu = caixa(g, 0.55, h + 0.25, 0.12, cort, x + s * (w / 2 + 0.38), y - 0.1, z + 0.12); cu.rotation.z = s * 0.03; }
    caixa(g, w + 1.5, 0.08, 0.1, '#7a5a3a', x, y + h + 0.2, z + 0.15);
  };
  const abajur = (g, x, z, cor, y0 = 0) => {
    cil(g, 0.05, 0.12, 0.08, '#333', x, y0, z); cil(g, 0.025, 0.025, 0.7, '#444', x, y0 + 0.08, z);
    const sh = add(new THREE.CylinderGeometry(0.2, 0.34, 0.34, 20, 1, true), toon({ color: cor, side: THREE.DoubleSide }), x, y0 + 0.9, z, g); sh.userData.ndSkip = true; return sh;
  };
  const gatoMesh = (g, x, z, cor = '#e8892e') => {
    const G = new THREE.Group(); G.position.set(x, 0, z); g.add(G);
    const oval = (parent, color, x, y, z, sx, sy, sz) => {
      const m = add(new THREE.SphereGeometry(1, 16, 12), toon({ color }), x, y, z, parent);
      m.scale.set(sx, sy, sz); return m;
    };
    oval(G, cor, 0, .27, -.12, .23, .25, .33);
    for (const a of [-1, 1]) for (const z of [-.25, .19]) oval(G, '#fff0da', a * .125, .09, z, .071, .09, .09);
    const cab = new THREE.Group(); cab.position.set(0, .56, .27); G.add(cab);
    oval(cab, cor, 0, 0, 0, .227, .18, .184);
    for (const a of [-1, 1]) {
      const orelha = add(new THREE.ConeGeometry(.105, .24, 3), toon({ color: cor }), a * .155, .19, -.015, cab);
      orelha.rotation.set(.04, Math.PI, -a * .22);
      const interior = add(new THREE.ConeGeometry(.057, .127, 3), toon({ color: '#d67b77' }), a * .162, .203, .054, cab);
      interior.rotation.copy(orelha.rotation);
      oval(cab, '#f5cc77', a * .086, .032, .16, .056, .045, .032);
      oval(cab, '#251b25', a * .086, .032, .187, .017, .034, .008);
      oval(cab, '#ffe9cc', a * .045, -.064, .171, .072, .046, .047);
      for (const abertura of [-.19, 0, .19]) {
        const bigode = add(new THREE.CylinderGeometry(.006, .006, .155, 6), toon({ color: '#533045' }), a * .15, -.073 + abertura / 11, .177, cab, { cast: false });
        bigode.rotation.z = Math.PI / 2 + a * abertura;
      }
    }
    oval(cab, '#a24e5e', 0, -.043, .211, .032, .019, .015);
    const cauda = new THREE.CatmullRomCurve3([[0,.32,-.38],[-.17,.51,-.49],[-.28,.72,-.39],[-.24,.79,-.28]].map(v => new THREE.Vector3(...v)));
    add(new THREE.TubeGeometry(cauda, 12, .044, 8, false), toon({ color: cor }), 0, 0, 0, G);
    oval(G, cor, -.24, .79, -.28, .045, .045, .045);
    G.userData.cab = cab; return G;
  };

  // montagem de um cômodo interior: paredes, piso, rodapé, luz de teto; devolve {g, M (móveis móveis)}
  const comodo = (id, cfg) => {
    const g = novo(id), M = {}; ATUAL = id;
    const pw = new THREE.Mesh(new THREE.PlaneGeometry(7, 3.2), toon({ map: T(pintaPapel(id, cfg.p1, cfg.p2, cfg.tipo), 3, 1.6) })); pw.position.set(0, 1.6, -3.5); pw.receiveShadow = true; g.add(pw);
    for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.2), toon({ map: T(pintaPapel(id + 'l', cfg.p1, cfg.p2, cfg.tipo), 6, 1.6), side: THREE.DoubleSide })); w.rotation.y = -s * PI / 2; w.position.set(s * 3.5, 1.6, 3.5); g.add(w); }
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(7, 14), toon({ map: T(piso(cfg.piso, cfg.f1, cfg.f2), cfg.piso === 'xadrez' ? 4 : 2, cfg.piso === 'xadrez' ? 8 : 4) })); fl.rotation.x = -PI / 2; fl.position.set(0, 0, 3.5); fl.receiveShadow = true; g.add(fl);
    const tet = new THREE.Mesh(new THREE.PlaneGeometry(7, 14), toon({ color: cfg.teto || '#f2ece0', side: THREE.DoubleSide })); tet.rotation.x = PI / 2; tet.position.set(0, 3.2, 3.5); g.add(tet);
    caixa(g, 7, 0.16, 0.06, cfg.rodape || '#f4efe6', 0, 0, -3.47);
    for (const s of [-1, 1]) caixa(g, 0.06, 0.16, 14, cfg.rodape || '#f4efe6', s * 3.47, 0, 3.5);
    const luzC = new THREE.PointLight(cfg.luzCor || '#ffe2b0', cfg.luzI ?? 2.0, 14, 1.3); luzC.position.set(0, 2.8, 0.5); g.add(luzC);
    luzC.userData.i0 = cfg.luzI ?? 2.0; LUZC[id] = luzC;
    return { g, M, luzC };
  };
  const registra = (id, g, M, estado, extras = {}) => { lista[id] = { g, chao: () => 0, state(S, f, L) { const B = S[id] || {}; for (const k in M) { const o = M[k]; o.position.x = o.userData.x0 + ((B.moveis || {})[k] || 0); } const LC = LUZC[id]; if (LC) LC.intensity = LC.userData.i0; estado(B, S, f);
    const nt = B.noite ?? (L && L.noite ? 1 : 0); for (const j of JAN[id] || []) { const tx = nt ? j.userData.tN : j.userData.tD; if (j.material.map !== tx) { j.material.map = tx; j.material.needsUpdate = true; } }
    if (LC && nt) LC.intensity *= B.breu ? 0 : (B.tetoNoite ?? 0.2); } , ...extras }; };
  const movel = (M, k, obj) => { obj.userData.x0 = obj.position.x; M[k] = obj; return obj; };

  // ---------- SALA ----------
  { const C = comodo('sala', { p1: '#e9d9a8', p2: '#d9c486', tipo: 'listras', piso: 'tabua', f1: '#a8743e', f2: '#5a3a1e', luzCor: '#ffd9a0', luzI: 2.2 }), g = C.g, M = C.M;
    janela(g, -1.6, 1.0, -3.44, 1.8, 1.3, ['#6fb2ff', '#cfe8ff', '#fff'], '#c24a3a'); janela(g, 1.9, 1.0, -3.44, 1.1, 1.3, ['#6fb2ff', '#cfe8ff', '#fff'], '#c24a3a');
    quadro(g, -0.2, 1.7, -3.44, 0.5, 0.4, '#f5c26a', '#3a6ea5'); quadro(g, 0.55, 1.5, -3.44, 0.35, 0.5, '#9fd6b0', '#c4553a'); quadro(g, 3.0, 1.9, -3.44, 0.45, 0.35, '#e8a0a0', '#fff3c0');
    const tap = add(new THREE.BoxGeometry(3.6, 0.03, 2.4), toon({ color: '#b83a3a' }), 0, 0.02, 0.4, g); add(new THREE.BoxGeometry(3.0, 0.035, 1.8), toon({ color: '#f3d08a' }), 0, 0.03, 0.4, g);
    const sofa = new THREE.Group(); sofa.position.set(0.2, 0, -2.6); g.add(sofa); caixa(sofa, 2.4, 0.45, 0.95, '#8c2f2f', 0, 0.12, 0); caixa(sofa, 2.4, 0.7, 0.28, '#7a2626', 0, 0.12, -0.33); caixa(sofa, 0.28, 0.6, 0.95, '#7a2626', -1.1, 0.12, 0); caixa(sofa, 0.28, 0.6, 0.95, '#7a2626', 1.1, 0.12, 0);
    for (const x of [-0.5, 0.5]) caixa(sofa, 0.8, 0.14, 0.7, '#a63a3a', x, 0.57, 0.06); caixa(sofa, 0.38, 0.38, 0.12, '#f2c14e', -0.9, 0.62, 0.15, 0.3); caixa(sofa, 0.38, 0.38, 0.12, '#3a8fb5', 0.95, 0.62, 0.15, -0.25);
    movel(M, 'sofa', sofa);
    const mesa = new THREE.Group(); mesa.position.set(0.2, 0, -0.4); g.add(mesa); caixa(mesa, 1.2, 0.06, 0.65, '#8a5a30', 0, 0.38, 0); for (const [x, z] of [[-.5, -.25], [.5, -.25], [-.5, .25], [.5, .25]]) caixa(mesa, 0.06, 0.38, 0.06, '#5b3a22', x, 0, z);
    cil(mesa, 0.08, 0.06, 0.12, '#4aa3df', 0.3, 0.44, 0.05); caixa(mesa, 0.3, 0.03, 0.22, '#e8e0c8', -0.3, 0.44, 0); movel(M, 'mesa', mesa);
    const est = new THREE.Group(); est.position.set(-3.0, 0, -3.1); g.add(est); caixa(est, 0.9, 2.1, 0.35, '#6b4423', 0, 0, 0);
    for (let i = 0; i < 4; i++) { for (let k = 0; k < 6; k++) caixa(est, 0.1, 0.28, 0.2, ['#c0392b', '#2e86c1', '#27ae60', '#f1c40f', '#8e44ad'][(i + k) % 5], -0.33 + k * 0.13, 0.12 + i * 0.5, 0.05); } movel(M, 'estante', est);
    const tv = new THREE.Group(); tv.position.set(2.7, 0, -3.1); g.add(tv); caixa(tv, 1.3, 0.55, 0.45, '#5b3a22', 0, 0, 0); caixa(tv, 1.0, 0.65, 0.12, '#1b1b1b', 0, 0.58, 0); add(new THREE.PlaneGeometry(0.9, 0.55), new THREE.MeshBasicMaterial({ color: '#2a5d7a' }), 0, 0.9, 0.07, tv, { cast: false }).userData.ndSkip = true; movel(M, 'tv', tv);
    const ab = abajur(g, -2.2, -2.9, '#f8d98a'); const luzA = new THREE.PointLight('#ffcf80', 0, 7, 1.4); luzA.position.set(-2.2, 1.2, -2.7); g.add(luzA);
    caixa(g, 0.3, 0.55, 0.3, '#7a4a28', -2.2, 0, -2.9);
    const vaso = cil(g, 0.14, 0.1, 0.35, '#2e8bc0', 1.4, 0, -3.1); for (let i = 0; i < 5; i++) add(new THREE.SphereGeometry(0.1, 8, 6), toon({ color: ['#e74c3c', '#f1c40f', '#ec7063'][i % 3] }), 1.4 + (i - 2) * 0.1, 0.55 + (i % 2) * 0.08, -3.1, g);
    const gato = gatoMesh(g, 1.3, 0.6); gato.rotation.y = -0.6;
    registra('sala', g, M, (B) => { luzA.intensity = (B.abajur ?? 1) * 1.8; ab.material.color.set(B.abajur === 0 ? '#aaa' : '#f8d98a'); gato.visible = B.gato !== 0; gato.userData.cab.position.y = 0.56 + 0.01 * Math.sin(performance.now() / 700); }); }

  // ---------- COZINHA ----------
  { const C = comodo('cozinha', { p1: '#f5e48a', p2: '#f7efc0', tipo: 'xadrez', piso: 'xadrez', f1: '#2a9d9a', f2: '#f4f1e6', luzCor: '#fff2c8', luzI: 2.6, rodape: '#e8e0c8' }), g = C.g, M = C.M;
    janela(g, 1.3, 1.1, -3.44, 1.3, 1.1, ['#9fd0ff', '#fff2cf', '#fff'], '#2a9d9a');
    const ger = new THREE.Group(); ger.position.set(-2.6, 0, -3.0); g.add(ger); caixa(ger, 1.0, 1.9, 0.75, '#e8ecee', 0, 0, 0); caixa(ger, 1.02, 0.03, 0.77, '#7e8a90', 0, 1.18, 0); caixa(ger, 0.06, 0.55, 0.06, '#7e8a90', 0.38, 1.3, 0.4); caixa(ger, 0.06, 0.5, 0.06, '#7e8a90', 0.38, 0.5, 0.4);
    caixa(ger, 0.3, 0.3, 0.02, '#e74c3c', -0.2, 1.4, 0.39, 0.1); movel(M, 'geladeira', ger);
    const bal = new THREE.Group(); bal.position.set(-0.4, 0, -3.1); g.add(bal); caixa(bal, 2.2, 0.9, 0.7, '#2ab3b0', 0, 0, 0); caixa(bal, 2.3, 0.07, 0.78, '#e8e0c8', 0, 0.9, 0);
    for (const x of [-0.5, 0.5, 1.0]) caixa(bal, 0.4, 0.5, 0.03, '#239c99', x - 0.25, 0.2, 0.36); for (const x of [-0.8, 0, 0.8]) caixa(bal, 0.6, 0.7, 0.34, '#2ab3b0', x, 1.75, -0.18);
    caixa(bal, 0.5, 0.04, 0.36, '#555', -0.3, 0.97, 0); cil(bal, 0.12, 0.12, 0.2, '#c0392b', 0.7, 0.97, 0); cil(bal, 0.06, 0.06, 0.28, '#f1c40f', 0.95, 0.97, 0.05); movel(M, 'balcao', bal);
    const mesa = new THREE.Group(); mesa.position.set(1.3, 0, -0.6); g.add(mesa); cil(mesa, 0.6, 0.6, 0.05, '#f4efe6', 0, 0.72, 0); cil(mesa, 0.06, 0.06, 0.72, '#7e8a90', 0, 0, 0); cil(mesa, 0.25, 0.25, 0.03, '#7e8a90', 0, 0, 0);
    for (const [x, z] of [[-0.85, 0], [0.85, 0]]) { const cd = new THREE.Group(); cd.position.set(x, 0, z); mesa.add(cd); caixa(cd, 0.42, 0.06, 0.42, '#e74c3c', 0, 0.42, 0); caixa(cd, 0.42, 0.45, 0.06, '#e74c3c', 0, 0.48, x < 0 ? -0.2 : 0.2); for (const [a, b] of [[-.17, -.17], [.17, -.17], [-.17, .17], [.17, .17]]) caixa(cd, 0.04, 0.42, 0.04, '#7e8a90', a, 0, b); }
    cil(mesa, 0.2, 0.2, 0.02, '#fff', 0.2, 0.77, 0.1); add(new THREE.SphereGeometry(0.09, 10, 8), toon({ color: '#e74c3c' }), 0.2, 0.84, 0.1, mesa); movel(M, 'mesa', mesa);
    const rel = add(new THREE.CircleGeometry(0.22, 24), toon({ color: '#fff' }), -1.2, 2.2, -3.44, g); rel.userData.ndSkip = true; add(new THREE.TorusGeometry(0.22, 0.03, 8, 24), toon({ color: '#c0392b' }), -1.2, 2.2, -3.43, g);
    const calend = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.55), toon({ color: '#fff' })); calend.position.set(2.6, 1.8, -3.44); g.add(calend); caixa(g, 0.42, 0.14, 0.02, '#e74c3c', 2.6, 2.2, -3.43);
    const gato = gatoMesh(g, 0.2, 1.4, '#e8892e'); gato.rotation.y = 0.3;
    registra('cozinha', g, M, (B) => { gato.visible = B.gato !== 0; gato.position.x = B.gatoX ?? .2; }, {
      ocupaMesa: (x, y, z) => g.visible && y < .73 && Math.hypot(x - g.position.x - mesa.position.x, z - g.position.z - mesa.position.z) < .78,
    }); }

  // ---------- QUARTO ----------
  { const C = comodo('quarto', { p1: '#6a7fd6', p2: '#f3d36a', tipo: 'estrelas', piso: 'tabua', f1: '#c89868', f2: '#7a5430', luzCor: '#8aa0ff', luzI: 1.2, rodape: '#e8e0f4' }), g = C.g, M = C.M;
    janela(g, 2.1, 1.1, -3.44, 1.3, 1.3, ['#0b1030', '#25306e', '#ffe9a0'], '#8e44ad');
    const cama = new THREE.Group(); cama.position.set(-0.6, 0, -2.4); g.add(cama); caixa(cama, 2.0, 0.35, 2.2, '#8a5a30', 0, 0, 0); caixa(cama, 1.9, 0.22, 2.1, '#f4efe6', 0, 0.35, 0.02); caixa(cama, 1.92, 0.12, 1.2, '#2e86c1', 0, 0.55, 0.45); caixa(cama, 2.0, 1.0, 0.1, '#6b4423', 0, 0, -1.1);
    for (const x of [-0.45, 0.45]) caixa(cama, 0.7, 0.14, 0.4, '#fff', x, 0.57, -0.7); movel(M, 'cama', cama);
    const cab = new THREE.Group(); cab.position.set(1.0, 0, -3.1); g.add(cab); caixa(cab, 0.6, 0.55, 0.45, '#6b4423', 0, 0, 0); abajur(cab, 0, 0, '#ffd27a', 0.55); movel(M, 'criado', cab);
    const luzQ = new THREE.PointLight('#ffb96a', 1.4, 6, 1.4); luzQ.position.set(1.0, 1.5, -2.8); g.add(luzQ);
    const arm = new THREE.Group(); arm.position.set(-2.9, 0, -3.0); g.add(arm); caixa(arm, 1.0, 2.3, 0.55, '#9b6b3a', 0, 0, 0); caixa(arm, 0.02, 2.1, 0.02, '#4a3018', 0, 0.1, 0.29); cil(arm, 0.03, 0.03, 0.01, '#f1c40f', 0.1, 1.0, 0.29); movel(M, 'armario', arm);
    const urso = add(new THREE.SphereGeometry(0.2, 12, 10), toon({ color: '#c68642' }), 1.7, 0.2, 0.3, g); add(new THREE.SphereGeometry(0.14, 12, 10), toon({ color: '#c68642' }), 1.7, 0.46, 0.3, g);
    add(new THREE.BoxGeometry(2.0, 0.02, 1.4), toon({ color: '#e07a5f' }), 0.2, 0.02, 0.5, g); quadro(g, -2.3, 1.9, -3.44, 0.5, 0.4, '#a0c4ff', '#ffd6a5');
    const lua = new THREE.Mesh(new THREE.CircleGeometry(0.22, 24), new THREE.MeshBasicMaterial({ color: '#fff3b0', fog: false })); lua.position.set(2.6, 2.4, -3.43); g.add(lua);
    registra('quarto', g, M, (B) => { luzQ.intensity = (B.abajur ?? 1) * 1.4; C.luzC.intensity = 1.2 * (B.teto ?? 1); }); }

  // ---------- FACHADA (exterior, dia) ----------
  { const g = novo('fachada'), M = {};
    const grama = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), toon({ color: '#6cc24a' })); grama.rotation.x = -PI / 2; grama.position.set(0, 0, -4); grama.receiveShadow = true; g.add(grama);
    caixa(g, 8, 0.05, 6, '#cfc7b8', 0, 0, 3.3); caixa(g, 1.2, 0.04, 6, '#dcd3c2', 0, 0.01, -1.0);
    const [wc, wa] = cv(512, 256); wa.fillStyle = '#9ed3d8'; wa.fillRect(0, 0, 512, 256); wa.fillStyle = '#7fbcc4'; for (let y = 0; y < 256; y += 24) wa.fillRect(0, y, 512, 3);
    const parede = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.4), toon({ map: T(wc, 3, 1.4) })); parede.position.set(0, 1.7, -5); g.add(parede);
    caixa(g, 8.4, 0.9, 0.5, '#c0392b', 0, 3.2, -5.1, 0); const tel = add(new THREE.CylinderGeometry(0.01, 4.2, 1.4, 4, 1, false), toon({ color: '#b03a2e' }), 0, 4.1, -5.1, g); tel.rotation.y = PI / 4; tel.scale.set(1.9, 1, 0.5);
    const porta = caixa(g, 1.0, 2.1, 0.1, '#d62828', 0, 0, -4.93); caixa(g, 1.2, 0.1, 0.14, '#f4efe6', 0, 2.1, -4.92); cil(porta, 0.04, 0.04, 0.04, '#f1c40f', 0.35, 1.0, 0.07);
    for (const s of [-1, 1]) { caixa(g, 1.2, 1.1, 0.08, '#f4efe6', s * 2.5, 0.9, -4.94); add(new THREE.PlaneGeometry(1.0, 0.9), new THREE.MeshBasicMaterial({ color: s > 0 ? '#ffd27a' : '#8fb4d9' }), s * 2.5, 1.5, -4.88, g, { cast: false }).userData.ndSkip = true; caixa(g, 1.3, 0.14, 0.3, '#7a5a3a', s * 2.5, 0.8, -4.8);
      for (const k of [-0.3, 0, 0.3]) add(new THREE.SphereGeometry(0.12, 8, 6), toon({ color: ['#e74c3c', '#f1c40f', '#ec7063'][(k * 10 + 3 | 0) % 3] }), s * 2.5 + k, 0.99, -4.8, g); }
    for (let i = -7; i <= 7; i++) { if (Math.abs(i) < 1) continue; caixa(g, 0.1, 0.8, 0.06, '#f4efe6', i * 0.55, 0, 1.3); } caixa(g, 8.4, 0.08, 0.06, '#f4efe6', 0, 0.55, 1.3);
    for (const [x, z] of [[-4.2, -3.8], [4.2, -3.6]]) { cil(g, 0.14, 0.18, 1.8, '#7a4a28', x, 0, z); const cp = add(new THREE.SphereGeometry(1.1, 14, 10), toon({ color: '#2e9a3a' }), x, 2.4, z, g); cp.scale.set(1, 1.05, 1); }
    for (const [x, z] of [[-1.8, -3.3], [-1.3, -3.4], [1.5, -3.3], [2.0, -3.5], [3.2, -3.0]]) { add(new THREE.SphereGeometry(0.28, 10, 8), toon({ color: '#2f8f3a' }), x, 0.25, z, g); }
    const cx = caixa(g, 0.4, 0.5, 0.3, '#2a5ea8', 3.2, 0, 1.0); const plac = new THREE.Group(); plac.position.set(-2.4, 0, 1.6); g.add(plac); cil(plac, 0.03, 0.03, 1.1, '#6b4423', 0, 0, 0); caixa(plac, 0.9, 0.55, 0.05, '#fff', 0, 0.75, 0); caixa(plac, 0.9, 0.18, 0.06, '#c0392b', 0, 1.12, 0); movel(M, 'placa', plac);
    const gato = gatoMesh(g, 2.4, 2.4); gato.rotation.y = 2.4; const nuv = []; for (const [x, y, z, s] of [[-6, 9, -20, 4], [4, 10, -24, 5], [12, 8, -18, 3]]) { const n = add(new THREE.SphereGeometry(1, 12, 10), new THREE.MeshBasicMaterial({ color: '#fff', fog: false }), x, y, z, g, { cast: false }); n.scale.set(s * 1.6, s * 0.6, s * 0.7); nuv.push(n); }
    registra('fachada', g, M, (B, S, f) => { gato.visible = B.gato !== 0; plac.visible = !!B.placa; nuv.forEach((n, i) => { n.position.x += 0; }); }); }
}
