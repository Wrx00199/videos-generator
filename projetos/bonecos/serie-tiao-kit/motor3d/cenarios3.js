// cenarios3.js — NAVIO NAS BERMUDAS (19/11/2026): deck de madeira com RELEVO (bumpMap + veio + pregos), panelão 3D com SOPA de comida
// de verdade (caldo, cenoura, batata, ervilha, macarrão, bolhas), névoa em camadas, lua, navio fantasma, lanternas, barris, caixotes.
// Liga no story: worldAt -> { cenario: 'navioberm', navioberm: { sopa, tampa, treme, vapor, fogo, nevoa, cadeira } } + luz('navioberm').
// Coordenadas LOCAIS (somar ORIGEM.navioberm). Piso y=0. Panelão em POT = (0.95, 0.35). Câmeras: camCen('navioberm', 'geral'|'medio'|'close').
export const POT = { x: 0.95, z: 0.35, base: 0.3, h: 0.62, rIn: 0.44 };

export function construirNavioBermudas(X) {
  const { THREE, P, add, toon, cv, T, novo, lista } = X, PI = Math.PI, rb = P.rng(311);
  const g = novo('navioberm');
  const linear = (t) => { t.colorSpace = THREE.NoColorSpace; return t; };

  // ---------- madeira com relevo: cor + bump pintados juntos (mesmo veio) ----------
  const cache = {};
  const madeiraCv = (seed, base, n, tom) => {
    const k = `${seed}|${n}`; if (cache[k]) return cache[k];
    const r = P.rng(seed), [c, a] = cv(512, 512), [b, q] = cv(512, 512), w = 512 / n;
    q.fillStyle = '#909090'; q.fillRect(0, 0, 512, 512);
    const rach = (x0, y0, len, cw) => { let x = x0, y = y0; a.strokeStyle = 'rgba(20,10,5,.9)'; q.strokeStyle = 'rgba(10,10,10,.95)'; a.lineWidth = q.lineWidth = cw; a.beginPath(); q.beginPath(); a.moveTo(x, y); q.moveTo(x, y);
      for (let i = 0; i < len; i++) { x += (r() - 0.5) * 5; y += 6 + r() * 6; a.lineTo(x, y); q.lineTo(x, y); } a.stroke(); q.stroke(); };
    for (let i = 0; i < n; i++) {
      const H = base[0] + (r() - 0.5) * 9, L = base[2] + (r() - 0.5) * 20 + tom, S = base[1];
      a.fillStyle = `hsl(${H},${S}%,${L}%)`; a.fillRect(i * w, 0, w, 512);
      const ov = r() * 40 - 20; q.fillStyle = `rgb(${144 + ov},${144 + ov},${144 + ov})`; q.fillRect(i * w, 0, w, 512);
      const gr = a.createLinearGradient(i * w, 0, i * w + w, 0); gr.addColorStop(0, 'rgba(0,0,0,.28)'); gr.addColorStop(0.15, 'rgba(0,0,0,0)'); gr.addColorStop(0.88, 'rgba(255,230,190,.14)'); a.fillStyle = gr; a.fillRect(i * w, 0, w, 512);
      for (let m = 0; m < 34; m++) { const x = i * w + 3 + r() * (w - 6), dx = (r() - 0.5) * 16, lw = 1 + r() * 3;
        a.strokeStyle = `hsla(${H - 5},${S}%,${L - 17 - r() * 12}%,.6)`; a.lineWidth = lw; a.beginPath(); a.moveTo(x, 0); a.bezierCurveTo(x + dx, 170, x - dx, 340, x + dx * 0.3, 512); a.stroke();
        q.strokeStyle = 'rgba(30,30,30,.7)'; q.lineWidth = lw; q.beginPath(); q.moveTo(x, 0); q.bezierCurveTo(x + dx, 170, x - dx, 340, x + dx * 0.3, 512); q.stroke(); }
      if (r() < 0.8) { const kx = i * w + w * (0.3 + 0.4 * r()), ky = r() * 512; for (let m = 6; m > 0; m--) { a.strokeStyle = `hsla(${H - 6},${S}%,${L - 6 - m * 5}%,.85)`; a.lineWidth = 2.4; a.beginPath(); a.ellipse(kx, ky, m * 3.6, m * 7, 0, 0, 7); a.stroke(); q.strokeStyle = `rgba(${20 + m * 12},${20 + m * 12},${20 + m * 12},.9)`; q.lineWidth = 2.6; q.beginPath(); q.ellipse(kx, ky, m * 3.6, m * 7, 0, 0, 7); q.stroke(); } }
      if (r() < 0.55) rach(i * w + w * (0.2 + 0.6 * r()), r() * 300, 14 + (r() * 18 | 0), 2.2);
      for (let m = 0; m < 6; m++) { const y = r() * 512, x = i * w + r() * w; a.strokeStyle = 'rgba(255,225,170,.3)'; a.lineWidth = 1.6; a.beginPath(); a.moveTo(x, y); a.lineTo(x + (r() - 0.5) * 20, y + 8 + r() * 24); a.stroke(); }
      const cut = r() * 512; a.fillStyle = 'rgba(20,10,5,.96)'; a.fillRect(i * w, cut, w, 6); q.fillStyle = '#050505'; q.fillRect(i * w, cut, w, 7); q.fillStyle = '#d8d8d8'; q.fillRect(i * w, cut + 7, w, 2);
      for (const y of [cut - 22, cut + 26]) for (const fx of [0.26, 0.74]) { a.fillStyle = '#26211c'; a.beginPath(); a.arc(i * w + w * fx, y, 4, 0, 7); a.fill(); a.strokeStyle = 'rgba(255,230,190,.5)'; a.lineWidth = 1; a.beginPath(); a.arc(i * w + w * fx - 1, y - 1, 3.4, 3.4, 5); a.stroke(); q.fillStyle = '#f2f2f2'; q.beginPath(); q.arc(i * w + w * fx, y, 4, 0, 7); q.fill(); }
      a.fillStyle = 'rgba(14,8,4,.97)'; a.fillRect(i * w, 0, 6, 512); q.fillStyle = '#080808'; q.fillRect(i * w, 0, 7, 512); q.fillStyle = '#e0e0e0'; q.fillRect(i * w + 7, 0, 3, 512);
    }
    for (let m = 0; m < 1400; m++) { a.fillStyle = r() < 0.5 ? 'rgba(0,0,0,.12)' : 'rgba(255,240,210,.09)'; a.fillRect(r() * 512, r() * 512, 1 + r() * 3, 1 + r() * 3); }
    return (cache[k] = [c, b]);
  };
  const madeira = (seed, rx, ry, o = {}) => {
    const [c, b] = madeiraCv(seed, o.base || [27, 58, 40], o.n || 8, o.tom || 0);
    return toon({ map: T(c, rx, ry), bumpMap: linear(P.tex(b, rx, ry)), bumpScale: o.bump ?? 14, color: o.color || '#ffffff' });
  };

  // ---------- mar escuro, céu e lua ----------
  const [sc, sg] = cv(512, 512); sg.fillStyle = '#0c2e30'; sg.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 80; i++) { sg.strokeStyle = rb() < 0.5 ? 'rgba(110,220,185,.22)' : 'rgba(2,18,22,.4)'; sg.lineWidth = 3 + rb() * 4; sg.beginPath(); const y = rb() * 512, x0 = rb() * 512; sg.moveTo(x0, y); sg.bezierCurveTo(x0 + 40, y - 12, x0 + 80, y + 12, x0 + 130, y); sg.stroke(); }
  const mar = new THREE.Mesh(new THREE.PlaneGeometry(500, 500, 70, 70), toon({ map: T(sc, 40, 40) })); mar.rotation.x = -PI / 2; mar.position.y = -1.3; mar.receiveShadow = true; g.add(mar);
  const mp = mar.geometry.attributes.position, mbase = mp.array.slice();
  const lua = new THREE.Mesh(new THREE.CircleGeometry(4.2, 40), new THREE.MeshBasicMaterial({ color: '#e8fff2', fog: false })); lua.position.set(-15, 20, -70); lua.userData.ndSkip = true; g.add(lua);
  const halo = (() => { const [hc, h] = cv(256, 256), gr = h.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, 'rgba(200,255,225,.5)'); gr.addColorStop(0.55, 'rgba(200,255,225,.12)'); gr.addColorStop(0.9, 'rgba(200,255,225,0)'); h.fillStyle = gr; h.fillRect(0, 0, 256, 256);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), new THREE.MeshBasicMaterial({ map: T(hc), transparent: true, depthWrite: false, fog: false })); m.position.set(-15, 20, -69.5); m.userData.ndSkip = true; g.add(m); return m; })();

  // ---------- casco: convés, amuradas, popa, proa ----------
  const deck = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 46, 1, 1), madeira(7, 3.4, 16, { bump: 4 })); deck.rotation.x = -PI / 2; deck.position.set(0, 0, -7); deck.receiveShadow = true; g.add(deck);
  const poste = madeira(21, 1, 1, { n: 4, bump: 3 });
  for (const s of [-1, 1]) {
    add(new THREE.BoxGeometry(0.28, 1.25, 46), madeira(11, 20, 1, { n: 6 }), s * 4.9, 0.62, -7, g);
    add(new THREE.BoxGeometry(0.5, 0.14, 46.2), madeira(13, 20, 1, { n: 3, tom: 6 }), s * 4.9, 1.3, -7, g);
    for (let z = 14; z > -30; z -= 2.6) { add(new THREE.BoxGeometry(0.34, 1.7, 0.34), poste, s * 4.9, 0.85, z, g); }
  }
  add(new THREE.BoxGeometry(10.2, 1.25, 0.3), madeira(15, 3, 1, { n: 6 }), 0, 0.62, 14.2, g); add(new THREE.BoxGeometry(10.4, 0.14, 0.55), madeira(13, 3, 1, { n: 3, tom: 6 }), 0, 1.3, 14.2, g);
  // (sem parede na proa: a névoa fecha o fundo)
  const gur = add(new THREE.CylinderGeometry(0.2, 0.3, 9, 10), madeira(9, 1, 3, { n: 4 }), 0, 1.4, -34, g); gur.rotation.x = PI / 2 - 0.22;
  // mastros com vela enrolada, verga e cordame
  const corda = toon({ color: '#6e5a3c' }), lona = toon({ color: '#cfc7ae' });
  const mastro = (x, z, h, seed) => { add(new THREE.CylinderGeometry(0.2, 0.3, h, 20), madeira(seed, 2, 3, { n: 4, base: [26, 58, 40], bump: 22, tom: 10 }), x, h / 2, z, g);
    for (const yy of [0.5, 1.4, 2.6, 4.2, 6.5]) { add(new THREE.TorusGeometry(0.265 - yy * 0.004, 0.032, 8, 24), toon({ color: '#3d424e' }), x, yy, z, g).rotation.x = PI / 2; }
    for (let k = 0; k < 7; k++) add(new THREE.TorusGeometry(0.255, 0.03, 6, 20), corda, x, 1.0 + k * 0.07, z, g).rotation.x = PI / 2;
    const v = add(new THREE.CylinderGeometry(0.12, 0.12, 8.6, 10), madeira(seed + 1, 1, 3, { n: 4 }), x, h * 0.72, z, g); v.rotation.z = PI / 2;
    const vela = add(new THREE.CylinderGeometry(0.42, 0.42, 7.6, 14), lona, x, h * 0.72 - 0.38, z, g); vela.rotation.z = PI / 2; vela.scale.set(1, 1, 0.8);
    for (const lado of [-1, 1]) for (let k = 0; k < 4; k++) { const zz = z + (k - 1.5) * 0.45, top = new THREE.Vector3(x + (k % 2) * 0.1, h * 0.8, z), bot = new THREE.Vector3(lado * 4.8, 1.3, zz);
      add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([top, top.clone().lerp(bot, 0.5).add(new THREE.Vector3(0, -0.15, 0)), bot]), 10, 0.03, 5), corda, 0, 0, 0, g, { cast: false }); } };
  mastro(-1.7, -6, 11, 31); mastro(2.2, -14, 14, 41);
  // barris (aduelas com relevo + arcos de ferro), caixotes, rolos de corda, sacos
  const barril = (x, z, s = 1) => { const b = add(new THREE.CylinderGeometry(0.46 * s, 0.4 * s, 1.0 * s, 20), madeira(51, 4, 1, { n: 8, bump: 4, tom: 4 }), x, 0.5 * s, z, g); b.scale.x = 1; for (const y of [0.18, 0.5, 0.82]) add(new THREE.TorusGeometry((y === 0.5 ? 0.465 : 0.43) * s, 0.025 * s, 6, 24), toon({ color: '#4d5663' }), x, y * s, z, g).rotation.x = PI / 2;
    add(new THREE.CylinderGeometry(0.4 * s, 0.4 * s, 0.02, 20), madeira(53, 1, 1, { n: 5 }), x, 1.0 * s, z, g); };
  barril(-3.4, 2.0); barril(-3.9, 0.9, 0.9); barril(-3.1, 0.7, 0.8);
  const caixote = (x, z, y0, s, ry) => { const m = madeira(61, 1, 1, { n: 5, bump: 3.6, tom: -2 }), b = add(new THREE.BoxGeometry(s, s, s), m, x, y0 + s / 2, z, g); b.rotation.y = ry; for (const k of [-1, 1]) { const t = add(new THREE.BoxGeometry(s * 1.03, s * 0.1, s * 1.03), madeira(63, 1, 1, { n: 2, tom: 8 }), x, y0 + s / 2 + k * s * 0.42, z, g); t.rotation.y = ry; } };
  caixote(3.6, -1.8, 0, 0.9, 0.2); caixote(3.9, -2.9, 0, 0.8, -0.3); caixote(3.55, -2.2, 0.9, 0.7, 0.5);
  for (let i = 0; i < 4; i++) add(new THREE.TorusGeometry(0.34 - i * 0.02, 0.07, 8, 22), corda, 2.8, 0.07 + i * 0.12, 1.9, g).rotation.x = PI / 2;
  for (const [x, z, s] of [[-3.7, -1.6, 1], [-3.2, -2.3, 0.85]]) { const sc2 = add(new THREE.SphereGeometry(0.4 * s, 16, 12), toon({ color: '#b79a6a' }), x, 0.32 * s, z, g); sc2.scale.set(1, 0.85, 0.9); add(new THREE.SphereGeometry(0.1 * s, 8, 6), corda, x, 0.7 * s, z, g); }
  // rede de dormir do Zeca entre o mastro e a amurada (eixo x = comprimento, y = barriga que pende, z = largura)
  { const hm = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 0.8, 18, 4), toon({ color: '#c9b88a', side: THREE.DoubleSide })), p = hm.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) { const u = p.getX(i) / 1.5, w = p.getY(i); p.setZ(i, w); p.setY(i, -0.42 * (1 - u * u)); }
    hm.geometry.computeVertexNormals(); hm.position.set(-3.3, 1.35, -6); hm.castShadow = true; g.add(hm);
    add(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 6), corda, -4.8, 1.55, -6, g).rotation.z = PI / 2; }
  // lanternas penduradas nos postes
  const lant = [];
  for (const [x, y, z, cor] of [[-4.8, 1.35, 0.4, '#ffb050'], [4.8, 1.35, -3.5, '#8dffb8'], [-1.7, 3.0, -5.5, '#ffb050']]) {
    const L = new THREE.Group(); L.position.set(x, y, z); g.add(L);
    add(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 10), toon({ color: '#2f343c' }), 0, -0.3, 0, L); add(new THREE.ConeGeometry(0.2, 0.16, 10), toon({ color: '#2f343c' }), 0, 0.2, 0, L);
    for (const a of [0, 1, 2, 3]) add(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 4), toon({ color: '#2f343c' }), Math.cos(a * PI / 2) * 0.14, -0.05, Math.sin(a * PI / 2) * 0.14, L);
    const bulbo = add(new THREE.SphereGeometry(0.12, 12, 10), new THREE.MeshBasicMaterial({ color: cor }), 0, -0.05, 0, L, { cast: false }); bulbo.userData.ndSkip = true;
    const hl = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), new THREE.MeshBasicMaterial({ map: halo.material.map, transparent: true, depthWrite: false, color: cor, opacity: 0.55 })); hl.userData.ndSkip = true; L.add(hl); lant.push({ L, bulbo, hl, cor }); }
  const luzLant = new THREE.PointLight('#ffb866', 3.4, 11, 1.4); luzLant.position.set(-4.0, 1.9, 0.4); g.add(luzLant);

  // ---------- braseiro + PANELÃO com sopa ----------
  const pot = new THREE.Group(); pot.position.set(POT.x, 0, POT.z); g.add(pot);
  const ferro = toon({ color: '#3b404c' }), ferroC = toon({ color: '#5d6574' });
  for (let i = 0; i < 3; i++) { const a = i * 2 * PI / 3 + 0.5, l = add(new THREE.CylinderGeometry(0.035, 0.05, 0.62, 6), ferro, Math.cos(a) * 0.34, 0.28, Math.sin(a) * 0.34, pot); l.rotation.set(Math.sin(a) * 0.32, 0, -Math.cos(a) * 0.32); }
  add(new THREE.CylinderGeometry(0.42, 0.46, 0.14, 24), toon({ color: '#2a2622' }), 0, 0.07, 0, pot);
  const brasa = new THREE.Mesh(new THREE.CircleGeometry(0.36, 24), new THREE.MeshBasicMaterial({ color: '#ff7a1e' })); brasa.rotation.x = -PI / 2; brasa.position.y = 0.145; brasa.userData.ndSkip = true; pot.add(brasa);
  for (let i = 0; i < 9; i++) { const a = rb() * 6.28, d = rb() * 0.27, l = add(new THREE.CylinderGeometry(0.03, 0.035, 0.34, 6), madeira(71, 1, 1, { n: 2 }), Math.cos(a) * d, 0.2, Math.sin(a) * d, pot); l.rotation.set(rb(), rb() * 3, PI / 2 - 0.2 + rb() * 0.4); }
  const lat = [[0.5, 0], [0.54, 0.06], [0.58, 0.28], [0.58, 0.55], [0.54, 0.62], [0.52, 0.64], [0.485, 0.64], [0.48, 0.6], [0.44, 0.55], [0.44, 0.12], [0.3, 0.02], [0.0, 0.0]].map(([r, y]) => new THREE.Vector2(r, y));
  const corpo = new THREE.Mesh(new THREE.LatheGeometry(lat, 40), toon({ color: '#444a58', side: THREE.DoubleSide })); corpo.position.y = POT.base; corpo.castShadow = true; corpo.receiveShadow = true; pot.add(corpo);
  add(new THREE.TorusGeometry(0.505, 0.03, 8, 40), ferroC, 0, POT.base + 0.63, 0, pot).rotation.x = PI / 2;
  add(new THREE.TorusGeometry(0.56, 0.02, 6, 40), ferroC, 0, POT.base + 0.22, 0, pot).rotation.x = PI / 2;
  for (const s of [-1, 1]) { const o = add(new THREE.TorusGeometry(0.1, 0.026, 8, 16, PI), ferroC, s * 0.55, POT.base + 0.46, 0, pot); o.rotation.z = s > 0 ? -PI / 2 : PI / 2; }
  // sopa: superfície ondulada pintada + pedaços em 3D flutuando
  const sopaTex = (() => { const [c, s] = cv(512, 512), r = P.rng(97), gr = s.createRadialGradient(256, 256, 20, 256, 256, 256); gr.addColorStop(0, '#e69a32'); gr.addColorStop(0.7, '#d27a22'); gr.addColorStop(1, '#a8501a'); s.fillStyle = gr; s.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 26; i++) { s.strokeStyle = r() < 0.5 ? 'rgba(255,214,120,.35)' : 'rgba(110,45,12,.3)'; s.lineWidth = 4 + r() * 8; s.beginPath(); s.arc(256, 256, 40 + r() * 190, r() * 6, r() * 6 + 1.6 + r() * 1.4); s.stroke(); }
    for (let i = 0; i < 60; i++) { const x = 60 + r() * 392, y = 60 + r() * 392, w = 5 + r() * 12; s.fillStyle = 'rgba(255,224,120,.55)'; s.beginPath(); s.ellipse(x, y, w, w * 0.8, 0, 0, 7); s.fill(); s.strokeStyle = 'rgba(255,250,215,.8)'; s.lineWidth = 1.6; s.beginPath(); s.arc(x - w * 0.25, y - w * 0.25, w * 0.35, 3.4, 4.9); s.stroke(); }
    const sombra = (f) => { s.shadowColor = 'rgba(70,25,5,.7)'; s.shadowBlur = 5; s.shadowOffsetY = 3; f(); s.shadowColor = 'transparent'; };
    for (let i = 0; i < 9; i++) { const x = 90 + r() * 330, y = 90 + r() * 330; sombra(() => { s.fillStyle = '#f08622'; s.beginPath(); s.arc(x, y, 22, 0, 7); s.fill(); }); s.fillStyle = '#ffb24a'; s.beginPath(); s.arc(x, y, 12, 0, 7); s.fill(); s.strokeStyle = '#c4590f'; s.lineWidth = 2; s.beginPath(); s.arc(x, y, 17, 0, 7); s.stroke(); }
    for (let i = 0; i < 7; i++) { const x = 90 + r() * 330, y = 90 + r() * 330, a = r(); sombra(() => { s.save(); s.translate(x, y); s.rotate(a); s.fillStyle = '#ecd48a'; s.beginPath(); s.roundRect(-18, -18, 36, 36, 9); s.fill(); s.restore(); }); s.fillStyle = 'rgba(160,110,50,.5)'; for (let k = 0; k < 4; k++) { s.beginPath(); s.arc(x + (r() - 0.5) * 20, y + (r() - 0.5) * 20, 1.8, 0, 7); s.fill(); } }
    for (let i = 0; i < 26; i++) { const x = 80 + r() * 350, y = 80 + r() * 350; sombra(() => { s.fillStyle = '#6fbe3c'; s.beginPath(); s.arc(x, y, 8, 0, 7); s.fill(); }); s.fillStyle = '#b6ec7c'; s.beginPath(); s.arc(x - 2, y - 2, 3, 0, 7); s.fill(); }
    for (let i = 0; i < 6; i++) { const x = 90 + r() * 330, y = 90 + r() * 330; s.strokeStyle = '#f4e3ac'; s.lineWidth = 7; s.lineCap = 'round'; s.beginPath(); s.moveTo(x, y); s.bezierCurveTo(x + 30, y - 24, x + 10, y + 22, x + 52, y + 4); s.stroke(); s.strokeStyle = 'rgba(150,100,40,.5)'; s.lineWidth = 2; s.stroke(); }
    for (let i = 0; i < 5; i++) { const x = 90 + r() * 330, y = 90 + r() * 330; sombra(() => { s.fillStyle = '#d63b24'; s.beginPath(); s.arc(x, y, 15, 0.2, 5.2); s.lineTo(x, y); s.fill(); }); }
    for (let i = 0; i < 90; i++) { s.fillStyle = r() < 0.6 ? '#2f8a2c' : '#fff0a0'; s.fillRect(60 + r() * 392, 60 + r() * 392, 3, 3); }
    return T(c); })();
  const sup = new THREE.Mesh(new THREE.RingGeometry(0.001, POT.rIn - 0.01, 48, 10), toon({ map: sopaTex })); sup.rotation.x = -PI / 2; sup.receiveShadow = true; pot.add(sup);
  const sp = sup.geometry.attributes.position, sbase = sp.array.slice();
  const bocados = []; const mkB = (geo, cor, n, rmax) => { for (let i = 0; i < n; i++) { const m = add(geo, toon({ color: cor }), 0, 0, 0, pot); const a = rb() * 6.28, d = 0.08 + rb() * (rmax - 0.08); m.userData = { a, d, ph: rb() * 6, rot: rb() * 3 }; bocados.push(m); } };
  mkB(new THREE.CylinderGeometry(0.058, 0.058, 0.032, 14), '#f08622', 7, 0.34); mkB(new THREE.BoxGeometry(0.085, 0.07, 0.085), '#ecd48a', 6, 0.34); mkB(new THREE.SphereGeometry(0.03, 8, 6), '#6fbe3c', 14, 0.36);
  bocados.forEach((m, i) => { m.userData.cb = i; });
  const sprBolha = []; for (let i = 0; i < 5; i++) { const m = add(new THREE.SphereGeometry(0.035, 10, 8), toon({ color: '#ffd887' }), 0, 0, 0, pot, { cast: false }); m.userData = { ph: i * 1.3, a: i * 1.9, d: 0.1 + 0.07 * i }; sprBolha.push(m); }
  const tampa = new THREE.Group(); pot.add(tampa);
  { const pl = [[0, 0.1], [0.12, 0.085], [0.38, 0.055], [0.545, 0.02], [0.56, 0.0], [0.5, -0.01]].map(([r, y]) => new THREE.Vector2(r, y)); const t = new THREE.Mesh(new THREE.LatheGeometry(pl, 36), toon({ color: '#565e6e', side: THREE.DoubleSide })); t.castShadow = true; tampa.add(t);
    add(new THREE.SphereGeometry(0.06, 12, 10), toon({ color: '#c84a2a' }), 0, 0.15, 0, tampa); add(new THREE.CylinderGeometry(0.025, 0.04, 0.05, 8), ferro, 0, 0.1, 0, tampa); }
  const vapor = []; const [vc, vg] = cv(128, 128), vgr = vg.createRadialGradient(64, 64, 4, 64, 64, 64); vgr.addColorStop(0, 'rgba(255,255,255,.7)'); vgr.addColorStop(1, 'rgba(255,255,255,0)'); vg.fillStyle = vgr; vg.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 9; i++) { const m = new THREE.Group(); const mat = new THREE.MeshBasicMaterial({ map: T(vc), transparent: true, depthWrite: false, opacity: 0.4, color: '#f2fff6', side: THREE.DoubleSide });
    for (const ry of [0, PI / 2]) { const q = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat); q.rotation.y = ry; q.userData.ndSkip = true; m.add(q); }
    m.userData = { ph: i / 9, a: rb() * 6.28, mat }; m.userData.ndSkip = true; pot.add(m); vapor.push(m); }
  const luzBrasa = new THREE.PointLight('#ff8a30', 1.6, 6, 1.7); luzBrasa.position.set(0, 0.55, 0.4); pot.add(luzBrasa);

  // ---------- cadeira (opcional) ----------
  const cadeira = new THREE.Group(); g.add(cadeira); cadeira.visible = false;
  { const m = madeira(81, 1, 1, { n: 4, bump: 3.4 }); add(new THREE.BoxGeometry(0.5, 0.06, 0.5), m, 0, 0.46, 0, cadeira); for (const [x, z] of [[-0.21, -0.21], [0.21, -0.21], [-0.21, 0.21], [0.21, 0.21]]) add(new THREE.BoxGeometry(0.06, 0.46, 0.06), m, x, 0.23, z, cadeira);
    for (const x of [-0.21, 0.21]) add(new THREE.BoxGeometry(0.06, 0.55, 0.06), m, x, 0.78, -0.21, cadeira); for (const y of [0.65, 0.8, 0.95]) add(new THREE.BoxGeometry(0.46, 0.07, 0.04), m, 0, y, -0.21, cadeira); }

  // balde do Beto (aparece com state.balde = {x,z})
  const balde = new THREE.Group(); balde.visible = false; g.add(balde);
  add(new THREE.CylinderGeometry(0.19, 0.14, 0.3, 16), madeira(91, 2, 1, { n: 6, bump: 4 }), 0, 0.15, 0, balde);
  for (const y of [0.06, 0.24]) add(new THREE.TorusGeometry(y < 0.1 ? 0.15 : 0.185, 0.014, 6, 20), toon({ color: '#4d5663' }), 0, y, 0, balde).rotation.x = PI / 2;
  add(new THREE.TorusGeometry(0.17, 0.012, 6, 16, PI), toon({ color: '#4d5663' }), 0, 0.3, 0, balde);
  // corda amarrada na cadeira (state.corda)
  const cordaClara = toon({ color: '#e0cc92' }); const cordaCad = new THREE.Group(); cordaCad.visible = false; cadeira.add(cordaCad);
  for (const [y, r] of [[0.52, 0.3], [0.7, 0.28], [0.9, 0.27]]) add(new THREE.TorusGeometry(r, 0.03, 6, 22), cordaClara, 0, y, -0.05, cordaCad).rotation.x = PI / 2;
  add(new THREE.TorusGeometry(0.06, 0.028, 6, 10), cordaClara, 0.2, 0.52, 0.24, cordaCad);
  // ---------- navio fantasma ao fundo ----------
  const fant = new THREE.Group(); fant.position.set(-16, -1.2, -48); fant.rotation.y = 0.5; fant.scale.setScalar(1.6); g.add(fant);
  { const sh = new THREE.Shape(); sh.moveTo(-8, 0.2); sh.lineTo(6, 0.2); sh.quadraticCurveTo(9.5, 0.4, 10, 4); sh.lineTo(-8.4, 4); sh.closePath(); const hg = new THREE.ExtrudeGeometry(sh, { depth: 5, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.4, bevelSegments: 2 }); hg.translate(0, -0.6, -2.5);
    const gm = new THREE.MeshBasicMaterial({ color: '#9fe8c0', transparent: true, opacity: 0.5, fog: false }); const m = new THREE.Mesh(hg, gm); m.userData.ndSkip = true; fant.add(m);
    for (const [x, h] of [[-3, 11], [2.4, 9], [-6.5, 8]]) { const mm = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, h, 8), gm); mm.position.set(x, 4 + h / 2, 0); mm.userData.ndSkip = true; fant.add(mm);
      const sv = new THREE.Mesh(new THREE.PlaneGeometry(4, h * 0.55), new THREE.MeshBasicMaterial({ color: '#d8f5e6', transparent: true, opacity: 0.38, side: THREE.DoubleSide, fog: false })); sv.position.set(x, 4 + h * 0.62, 0); sv.userData.ndSkip = true; fant.add(sv); } }

  // ---------- névoa: camadas verticais e rasteiras (bolhas pintadas macias, sem tinta) ----------
  const nvTex = (seed) => { const [c, n] = cv(512, 256), r = P.rng(seed); for (let i = 0; i < 22; i++) { const x = 110 + r() * 292, y = 70 + r() * 116, rad = 30 + r() * 46, rg = n.createRadialGradient(x, y, 3, x, y, rad); rg.addColorStop(0, 'rgba(120,190,170,.6)'); rg.addColorStop(1, 'rgba(120,190,170,0)'); n.fillStyle = rg; n.fillRect(0, 0, 512, 256); }
    n.globalCompositeOperation = 'destination-in'; const m = n.createRadialGradient(256, 128, 20, 256, 128, 250); m.addColorStop(0, 'rgba(0,0,0,1)'); m.addColorStop(0.6, 'rgba(0,0,0,.8)'); m.addColorStop(1, 'rgba(0,0,0,0)'); n.setTransform(1, 0, 0, 0.5, 0, 64); n.fillStyle = m; n.fillRect(0, -128, 512, 512); return T(c); };
  const nev = [];
  for (const [z, w, h, y, op, seed] of [[-3.5, 24, 4, 1.6, 0.12, 5], [-7, 30, 5, 2.2, 0.16, 6], [-12, 36, 7, 3.2, 0.2, 7], [-18, 44, 9, 4.5, 0.26, 8], [-28, 60, 12, 5, 0.3, 9]]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: nvTex(seed), transparent: true, depthWrite: false, opacity: op })); m.position.set(0, y, z); m.userData = { ndSkip: true, op, x0: 0, v: 0.05 + 0.02 * (seed % 3), z }; g.add(m); nev.push(m); }
  for (const [y, op, seed, sz] of [[0.1, 0.34, 11, 26], [0.5, 0.2, 12, 32], [1.0, 0.1, 13, 40]]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(sz, sz * 1.6), new THREE.MeshBasicMaterial({ map: nvTex(seed), transparent: true, depthWrite: false, opacity: op })); m.rotation.x = -PI / 2; m.position.set(0, y, -6); m.userData = { ndSkip: true, op, v: 0.06 + 0.02 * (seed % 3), ground: true }; g.add(m); nev.push(m); }

  { const h = new URLSearchParams(location.hash.slice(1)).get('hide'); if (h) { const [a, b] = h.split('-').map(Number); g.children.forEach((c, i) => { if (i >= a && i <= b) c.visible = false; }); console.log('children', g.children.length); } }

  // ---------- TERROR (ep. 33): velas, pegadas molhadas, poça, vulto. Sem comida. Opções: velas:[7 valores 0..1], fumaca:[7 valores 0..1], pegadas:0..1, poca:{x,z,r}, vulto:{x,z,op,s}, semPanela, escuro ----------
  const velas = [], VX = [-1.86, -1.24, -0.62, 0, 0.62, 1.24, 1.86];
  const [fcv, fg] = cv(64, 128); { const gr = fg.createRadialGradient(32, 84, 2, 32, 76, 52); gr.addColorStop(0, 'rgba(255,250,200,1)'); gr.addColorStop(0.35, 'rgba(255,190,70,.95)'); gr.addColorStop(1, 'rgba(255,90,0,0)'); fg.fillStyle = gr; fg.beginPath(); fg.moveTo(32, 6); fg.bezierCurveTo(60, 60, 58, 118, 32, 124); fg.bezierCurveTo(6, 118, 4, 60, 32, 6); fg.fill(); }
  const flameTex = T(fcv);
  const [fcv2, fg2c] = cv(64, 128); { const gr = fg2c.createRadialGradient(32, 84, 2, 32, 76, 52); gr.addColorStop(0, 'rgba(235,250,255,1)'); gr.addColorStop(0.35, 'rgba(90,170,255,.95)'); gr.addColorStop(1, 'rgba(20,60,255,0)'); fg2c.fillStyle = gr; fg2c.beginPath(); fg2c.moveTo(32, 6); fg2c.bezierCurveTo(60, 60, 58, 118, 32, 124); fg2c.bezierCurveTo(6, 118, 4, 60, 32, 6); fg2c.fill(); }
  const flameTexAz = T(fcv2);
  const cera = toon({ color: '#efe3c4' }), pires = madeira(97, 1, 1, { n: 4, bump: 3, tom: -6 });
  VX.forEach((x, i) => { const V = new THREE.Group(); V.position.set(x, 0, -0.55 + 0.1 * Math.sin(i * 2.1)); g.add(V);
    add(new THREE.CylinderGeometry(0.17, 0.2, 0.04, 16), toon({ color: '#6b5a3a' }), 0, 0.02, 0, V);
    const h = 0.26 + 0.05 * ((i * 5) % 3); add(new THREE.CylinderGeometry(0.065, 0.075, h, 14), cera, 0, 0.04 + h / 2, 0, V);
    for (const a of [0.8, 2.6, 4.4]) add(new THREE.CapsuleGeometry(0.014, 0.08, 4, 6), cera, Math.cos(a) * 0.068, 0.04 + h - 0.04, Math.sin(a) * 0.068, V);
    add(new THREE.CylinderGeometry(0.006, 0.006, 0.05, 4), toon({ color: '#1c1410' }), 0, 0.04 + h + 0.02, 0, V);
    const F = new THREE.Group(); F.position.y = 0.04 + h + 0.1; V.add(F);
    for (const ry of [0, PI / 2]) { const q = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.26), new THREE.MeshBasicMaterial({ map: flameTex, transparent: true, depthWrite: false, side: THREE.DoubleSide })); q.rotation.y = ry; q.userData.ndSkip = true; F.add(q); }
    const hl = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshBasicMaterial({ map: halo.material.map, transparent: true, depthWrite: false, color: '#ffb050', opacity: 0.5 })); hl.position.y = 0.04; hl.userData.ndSkip = true; F.add(hl);
    const fum = new THREE.Group(); fum.position.y = 0.04 + h + 0.1; V.add(fum);
    for (const ry of [0, PI / 2]) { const q = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.8), new THREE.MeshBasicMaterial({ map: T(vc), transparent: true, depthWrite: false, color: '#9aa7a8', opacity: 0, side: THREE.DoubleSide })); q.rotation.y = ry; q.userData.ndSkip = true; fum.add(q); }
    velas.push({ V, F, hl, fum, h }); });
  const luzVelas = new THREE.PointLight('#ffb060', 2.2, 7, 1.6); luzVelas.position.set(0, 0.7, -0.2); g.add(luzVelas);
  // pegadas molhadas (do mastro até o centro) e poça
  const [pcv, pg] = cv(64, 128); { pg.fillStyle = 'rgba(6,18,28,.92)'; pg.beginPath(); pg.ellipse(32, 84, 15, 32, 0, 0, 7); pg.fill(); pg.beginPath(); pg.ellipse(32, 36, 14, 12, 0, 0, 7); pg.fill(); for (let k = 0; k < 5; k++) { pg.beginPath(); pg.ellipse(14 + k * 9, 14 + Math.abs(k - 2) * 3, 4.5, 6, 0, 0, 7); pg.fill(); } pg.fillStyle = 'rgba(170,225,245,.45)'; pg.beginPath(); pg.ellipse(25, 80, 4, 14, 0, 0, 7); pg.fill(); pg.strokeStyle = 'rgba(130,200,230,.5)'; pg.lineWidth = 1.5; pg.beginPath(); pg.ellipse(32, 84, 17, 34, 0, 0, 7); pg.stroke(); }
  const pegTex = T(pcv), pegadas = [];
  for (let i = 0; i < 12; i++) { const u = i / 11, x = -1.7 + (0.35 + 1.0 * 0) * 0 + u * 1.75 + (i % 2 ? 0.1 : -0.1), z = -5.6 + u * 4.65;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.68), new THREE.MeshBasicMaterial({ map: pegTex, transparent: true, depthWrite: false, opacity: 0.9 })); m.rotation.x = -PI / 2; m.rotation.z = (i % 2 ? 1 : -1) * 0.14 + 0.28; m.position.set(x, 0.012, z); m.userData = { ndSkip: true }; g.add(m); pegadas.push(m); }
  const [qcv, qg] = cv(128, 128); { const gr = qg.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(6,26,34,.85)'); gr.addColorStop(0.7, 'rgba(10,34,44,.6)'); gr.addColorStop(1, 'rgba(10,34,44,0)'); qg.fillStyle = gr; qg.fillRect(0, 0, 128, 128); qg.fillStyle = 'rgba(200,240,250,.18)'; qg.beginPath(); qg.ellipse(46, 50, 14, 7, -0.4, 0, 7); qg.fill(); }
  const poca = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: T(qcv), transparent: true, depthWrite: false })); poca.rotation.x = -PI / 2; poca.position.y = 0.014; poca.userData.ndSkip = true; poca.visible = false; g.add(poca);
  // vulto: silhueta alta de capuz com olhos pálidos, dentro da névoa
  const [vcv, vcg] = cv(256, 512); { const gr = vcg.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, 'rgba(2,6,10,0.96)'); gr.addColorStop(1, 'rgba(2,6,10,0.0)'); vcg.fillStyle = gr; vcg.beginPath(); vcg.moveTo(128, 8); vcg.bezierCurveTo(176, 8, 190, 70, 176, 112); vcg.bezierCurveTo(230, 170, 252, 330, 244, 512); vcg.lineTo(12, 512); vcg.bezierCurveTo(4, 330, 26, 170, 80, 112); vcg.bezierCurveTo(66, 70, 80, 8, 128, 8); vcg.fill(); vcg.fillStyle = 'rgba(225,255,240,.95)'; vcg.beginPath(); vcg.ellipse(108, 76, 8, 5, 0.3, 0, 7); vcg.ellipse(150, 76, 8, 5, -0.3, 0, 7); vcg.fill(); }
  const vulto = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.2), new THREE.MeshBasicMaterial({ map: T(vcv), transparent: true, depthWrite: false, side: THREE.DoubleSide })); vulto.userData.ndSkip = true; vulto.visible = false; g.add(vulto);

  // alçapão do porão (ep. 35): moldura de madeira, tampa que levanta (open 0..1) e luz âmbar vindo de baixo. B.alcapao = {x, z, open, luz}
  const alc = new THREE.Group(); alc.visible = false; g.add(alc);
  { const mad = madeira(77, 1, 1, { n: 5, bump: 4, tom: -4 });
    for (const [x, z, w, d] of [[0, -0.5, 1.1, 0.12], [0, 0.5, 1.1, 0.12], [-0.5, 0, 0.12, 1.0], [0.5, 0, 0.12, 1.0]]) add(new THREE.BoxGeometry(w, 0.1, d), mad, x, 0.05, z, alc);
    add(new THREE.PlaneGeometry(0.88, 0.88), toon({ color: '#050403' }), 0, 0.012, 0, alc).rotation.x = -PI / 2; }
  const alcTampa = new THREE.Group(); alcTampa.position.set(-0.46, 0.1, 0); alc.add(alcTampa);
  { const mad = madeira(78, 1, 1, { n: 5, bump: 4, tom: -2 }); const tp = add(new THREE.BoxGeometry(0.94, 0.07, 0.94), mad, 0.47, 0.035, 0, alcTampa); for (const z of [-0.3, 0.3]) add(new THREE.BoxGeometry(0.9, 0.02, 0.05), toon({ color: '#3b2a1a' }), 0.47, 0.08, z, alcTampa); add(new THREE.TorusGeometry(0.07, 0.015, 6, 14), toon({ color: '#5a626e' }), 0.8, 0.09, 0, alcTampa).rotation.x = PI / 2; }
  const alcLuz = new THREE.PointLight('#ff9a3a', 0, 5, 1.6); alcLuz.position.set(0, 0.55, 0); alc.add(alcLuz);
  const alcRaio = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.4), new THREE.MeshBasicMaterial({ map: halo.material.map, transparent: true, depthWrite: false, color: '#ffb050', opacity: 0, side: THREE.DoubleSide })); alcRaio.position.y = 1.0; alcRaio.userData.ndSkip = true; alc.add(alcRaio);
  lista.navioberm = { g, raio: 4, chao: () => 0,
    state(S, f, L) {
      const t = f / 30, B = S.navioberm || {}, k = (v, d) => (v === undefined ? d : v);
      const amp = 0.34; for (let i = 0; i < mp.count; i++) { const x = mbase[i * 3], z = -mbase[i * 3 + 1]; mp.setY(i, amp * (Math.sin(x * 0.18 + t * 1.1) * 0.6 + Math.sin(z * 0.23 - t * 1.4) * 0.4) * Math.min(1, Math.hypot(x, z) / 10)); } mp.needsUpdate = true; mar.geometry.computeVertexNormals();
      fant.position.x = -16 + k(B.fantX, 0); fant.position.y = -1.2 + 0.15 * Math.sin(t * 0.6); fant.rotation.z = 0.03 * Math.sin(t * 0.5);
      const sopa = k(B.sopa, 0.5), ySopa = POT.base + 0.17 + 0.4 * sopa;
      sup.position.y = ySopa; const bol = (i) => 0.5 + 0.5 * Math.sin(t * 2.2 + i * 1.7);
      for (let i = 0; i < sp.count; i++) { const x = sbase[i * 3], y = sbase[i * 3 + 1], d = Math.hypot(x, y); let h = 0.008 * Math.sin(x * 22 + t * 3.2) * Math.cos(y * 19 - t * 2.6) + 0.004 * Math.sin(d * 40 - t * 4);
        for (let b = 0; b < 3; b++) { const bx = 0.18 * Math.cos(b * 2.1 + 0.4), by = 0.18 * Math.sin(b * 2.1 + 0.4), dd = Math.hypot(x - bx, y - by); h += 0.035 * bol(b) * Math.exp(-dd * dd * 260); }
        sp.setZ(i, h); } sp.needsUpdate = true; sup.geometry.computeVertexNormals(); sup.visible = true;
      bocados.forEach((m, i) => { const u = m.userData, a = u.a + 0.05 * Math.sin(t * 0.5 + u.ph), d = u.d; m.position.set(Math.cos(a) * d, ySopa + 0.012 + 0.012 * Math.sin(t * 3 + u.ph), Math.sin(a) * d); m.rotation.set(0.3 * Math.sin(t * 1.3 + u.ph), u.rot + t * 0.2, 0.2 * Math.cos(t * 1.1 + u.ph)); m.visible = sopa > 0.05; });
      sprBolha.forEach((m, i) => { const u = m.userData, c = (t * 0.7 + u.ph) % 1.6, s = c < 1 ? c : 0; m.position.set(Math.cos(u.a) * u.d, ySopa + 0.01 + 0.03 * s, Math.sin(u.a) * u.d); m.scale.setScalar(0.3 + 1.2 * s); m.visible = sopa > 0.05 && c < 1.0; });
      const tp = k(B.tampa, 0), tr = k(B.treme, 0), yl = POT.base + 0.64;
      const lift = Math.min(1, tp / 0.3), slide = Math.max(0, (tp - 0.3) / 0.7);
      tampa.position.set(0.62 * slide, yl + 0.34 * lift - 0.34 * slide * 0.0 + (tr ? 0.012 * Math.abs(Math.sin(t * 38)) * tr : 0), 0.06 * slide); tampa.rotation.set(0, 0, -0.85 * slide + (tr ? 0.03 * Math.sin(t * 31) * tr : 0));
      if (slide > 0) tampa.position.y = yl + 0.34 * (1 - slide) - 0.08 * slide + 0.0;
      const vp = k(B.vapor, 1); vapor.forEach((m, i) => { const u = m.userData, c = (t * 0.28 + u.ph) % 1, a = u.a; m.position.set(0.06 * Math.cos(a) * (1 + c * 3) + 0.12 * Math.sin(t + a) * c, yl + 0.1 + c * 1.5, 0.06 * Math.sin(a) * (1 + c * 3)); m.scale.setScalar(0.28 + c * 0.9); m.userData.mat.opacity = vp * 0.4 * Math.sin(Math.PI * c); });
      const fg2 = k(B.fogo, 1); brasa.material.color.setRGB(1, 0.35 + 0.18 * Math.sin(t * 7) + 0.1 * Math.sin(t * 17), 0.1); luzBrasa.intensity = fg2 * (1.5 + 0.5 * Math.sin(t * 9) + 0.3 * Math.sin(t * 23));
      lant.forEach((o, i) => { const fl = 0.8 + 0.2 * Math.sin(t * (5 + i) + i * 2) + (Math.sin(t * 21 + i) > 0.92 ? 0.25 : 0); o.hl.material.opacity = 0.55 * fl; o.L.rotation.z = 0.04 * Math.sin(t * 0.9 + i); });
      luzLant.intensity = 1.8 + 0.4 * Math.sin(t * 6.5) + (Math.sin(t * 19) > 0.9 ? 0.4 : 0);
      const nv = k(B.nevoa, 1); nev.forEach((m, i) => { const u = m.userData; m.material.color.set(B.nevoaCor || '#ffffff'); m.material.opacity = Math.min(0.9, u.op * nv); if (u.ground) m.position.x = 1.6 * Math.sin(t * u.v + i); else m.position.x = 2.2 * Math.sin(t * u.v + i * 1.4); });
      cordaCad.visible = !!B.corda; if (B.balde) balde.position.set(B.balde.x, 0, B.balde.z); balde.visible = !!B.balde;
      pot.visible = !B.semPanela; lua.material.color.set(B.luaCor || '#e8fff2'); halo.material.color.set(B.luaCor || '#ffffff'); const esc = k(B.escuro, 1);
      lant.forEach((o) => { o.hl.material.opacity *= esc; o.bulbo.visible = esc > 0.3; }); luzLant.intensity *= esc;
      { const vv = B.velas || [], fu = B.fumaca || [], mostra = !!B.velas; let soma = 0, n = 0;
        velas.forEach((o, i) => { const v = vv[i] ?? 1, fl = 0.85 + 0.15 * Math.sin(t * (9 + i) + i) + (Math.sin(t * 27 + i * 3) > 0.9 ? 0.2 : 0); o.V.visible = mostra;
          o.F.visible = v > 0.02; { const az = (B.azul || [])[i] || 0; o.F.children.forEach((q, qi) => { if (qi < 2) q.material.map = az > 0.5 ? flameTexAz : flameTex; else q.material.color.set(az > 0.5 ? '#6aa8ff' : '#ffb050'); }); } o.F.scale.set(v * (0.9 + 0.12 * Math.sin(t * 13 + i)), v * fl, v); o.F.rotation.z = 0.08 * Math.sin(t * 7 + i * 2); o.hl.material.opacity = 0.5 * v * fl;
          const f = fu[i] || 0; o.fum.children.forEach((q) => { q.material.opacity = 0.55 * Math.sin(Math.PI * Math.min(1, f)); }); o.fum.position.y = 0.04 + o.h + 0.1 + 0.7 * f; o.fum.scale.setScalar(0.5 + f);
          soma += v * VX[i]; n += v; });
        luzVelas.intensity = mostra ? 0.5 * n * (0.9 + 0.1 * Math.sin(t * 11)) : 0; luzVelas.position.x = n ? soma / n : 0; }
      { const pp = B.pegadas || 0, R = B.rota; pegadas.forEach((m, i) => { m.visible = pp > (i + 0.5) / 12;
        if (R) { const u = i / 11, dx = R.x1 - R.x0, dz = R.z1 - R.z0; m.position.set(R.x0 + u * dx + (i % 2 ? 0.09 : -0.09) * (dz ? 1 : 0), 0.012, R.z0 + u * dz); m.rotation.z = Math.atan2(dx, -dz) * -1 + (i % 2 ? 0.14 : -0.14); } }); }
      { const q = B.poca; poca.visible = !!q; if (q) { poca.position.set(q.x, 0.014, q.z); poca.scale.set(q.r * 2.2, q.r * 1.6, 1); } }
      { const q = B.vulto; vulto.visible = !!q && q.op > 0.01; if (q) { vulto.position.set(q.x, 1.1 * (q.s || 1), q.z); vulto.scale.setScalar(q.s || 1); vulto.material.opacity = q.op * (0.85 + 0.15 * Math.sin(t * 3)); vulto.rotation.y = q.ry || 0; } }
      { const q = B.alcapao; alc.visible = !!q; if (q) { alc.position.set(q.x, 0, q.z); const o = q.open || 0; alcTampa.rotation.z = -1.5 * o * (1 + 0.04 * Math.sin(t * 30) * (o > 0 && o < 0.2 ? 1 : 0)); const l = q.luz ?? o; alcLuz.intensity = 2.6 * l * (0.85 + 0.15 * Math.sin(t * 9)); alcRaio.material.opacity = 0.5 * l; } }
      const c = B.cadeira; cadeira.visible = !!c; if (c) { cadeira.position.set(c.x, 0, c.z); cadeira.rotation.y = c.ry || 0; }
    } };
}
