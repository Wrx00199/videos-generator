// cenarios2.js — 9 cenários extra do catálogo (16/11): cyberpunk, apocalipse, cemiterio, parque, dojo, fundomar, nuvens, arena, floresta.
// Chamado por cenarios.js: construirMais(X) com X = { THREE, P, add, toon, cv, T, novo, lista, pedra, chamaCard, PLUMc }.
export function construirMais(X) {
  const { THREE, P, add, toon, cv, T, novo, lista, pedra, chamaCard } = X, PI = Math.PI;
  const B = (g, w, h, d, m, x, y, z, o) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, g, o);
  const C = (g, rt, rb, h, m, x, y, z, seg = 12, o) => add(new THREE.CylinderGeometry(rt, rb, h, seg), m, x, y, z, g, o);
  const S_ = (g, r, m, x, y, z, ws = 16, hs = 12) => add(new THREE.SphereGeometry(r, ws, hs), m, x, y, z, g);
  const piso = (g, w, d, tx, rx, ry, z = -20) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), toon({ map: T(tx, rx, ry) })); m.rotation.x = -PI / 2; m.position.set(0, 0, z); m.receiveShadow = true; g.add(m); return m; };
  const brilha = (c) => new THREE.MeshBasicMaterial({ color: c });
  const fant = (m) => { m.userData.ndSkip = true; m.castShadow = false; return m; };
  // prédios dos dois lados da rua (cyberpunk / apocalipse)
  const fach = (cols, rows, seed, pal) => { const r = P.rng(seed), [c, x] = cv(cols * 72, rows * 72); x.fillStyle = pal.base; x.fillRect(0, 0, c.width, c.height);
    for (let j = 1; j < rows; j++) for (let i = 0; i < cols; i++) { const on = r() < pal.on, ox = i * 72 + 12, oy = c.height - (j + 1) * 72 + 12; x.fillStyle = pal.frame; x.fillRect(ox - 4, oy - 4, 56, 58);
      x.fillStyle = on ? pal.luz[(r() * pal.luz.length) | 0] : pal.escuro; x.fillRect(ox, oy, 48, 50); if (pal.quebr && r() < .5) { x.fillStyle = '#050308'; x.beginPath(); x.moveTo(ox, oy); x.lineTo(ox + 30, oy + 10); x.lineTo(ox + 12, oy + 50); x.lineTo(ox, oy + 50); x.fill(); } }
    return T(c); };
  const predios = (g, pal, seed, zi, zf, hmin, hvar) => { const r = P.rng(seed), out = []; for (const lado of [1, -1]) { let z = zi, k = 0; while (z > zf) { const D = 8 + r() * 3, H = hmin + r() * hvar, W = 9, cols = Math.max(2, Math.round(D / 2.3)), rows = Math.max(3, Math.round(H / 2.9)), plain = toon({ color: pal.base }), fa = toon({ map: fach(cols, rows, seed + k * 7 + (lado > 0 ? 0 : 50), pal) });
      const mats = [plain, plain, plain, plain, plain, plain]; mats[lado > 0 ? 0 : 1] = fa; const b = B(g, W, H, D, mats, -lado * (8.2 + W / 2), H / 2, z - D / 2, { cast: false }); b.rotation.z = (r() - .5) * (pal.torto || .03); out.push({ lado, z0: z, z1: z - D, H, D }); z -= D + .15; k++; } } return out; };

  // ===================================== CYBERPUNK =====================================
  { const g = novo('cyberpunk'), r = P.rng(101); const pal = { base: '#1c1636', frame: '#0a0618', luz: ['#ff3fa4', '#35f0ff', '#ffe24a', '#9a5cff'], escuro: '#161030', on: .5 };
    const [fc, fg] = cv(512, 512); fg.fillStyle = '#17112e'; fg.fillRect(0, 0, 512, 512); for (let i = 0; i < 26; i++) { const x = r() * 512, y = r() * 512, rg = fg.createRadialGradient(x, y, 4, x, y, 50 + r() * 60); const c = ['255,63,164', '53,240,255', '154,92,255'][i % 3]; rg.addColorStop(0, `rgba(${c},.5)`); rg.addColorStop(1, `rgba(${c},0)`); fg.fillStyle = rg; fg.beginPath(); fg.ellipse(x, y, 60 + r() * 70, 14 + r() * 20, 0, 0, 7); fg.fill(); } fg.fillStyle = 'rgba(240,235,255,.5)'; for (let i = 0; i < 4; i++) fg.fillRect(250, i * 128 + 20, 12, 70);
    piso(g, 60, 200, fc, 3, 20, -60);
    predios(g, pal, 103, 12, -70, 16, 22);
    const txt = ['BAR', '24H', 'RAMEN', 'NEON', 'HOTEL', 'CAFÉ', 'ROBÔ', 'ARCADE']; let n = 0;
    for (const lado of [1, -1]) for (let i = 0; i < 6; i++) { const z = 3 - i * 7.5, cor = ['#ff3fa4', '#35f0ff', '#ffe24a', '#9a5cff'][(i + (lado > 0 ? 0 : 2)) % 4]; const [c, x] = cv(256, 96); x.fillStyle = '#0a0618'; x.fillRect(0, 0, 256, 96); x.strokeStyle = cor; x.lineWidth = 9; x.strokeRect(6, 6, 244, 84); x.fillStyle = cor; x.font = '900 56px Arial Black, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt[n++ % txt.length], 128, 52);
      const p = add(new THREE.PlaneGeometry(3.4, 1.28), new THREE.MeshBasicMaterial({ map: T(c) }), -lado * 8.05, 3.2 + (i % 3) * 2.2, z - 2, g, { cast: false }); p.rotation.y = lado > 0 ? PI / 2 : -PI / 2; }
    const [hc, hg] = cv(512, 320); hg.fillStyle = '#0a0620'; hg.fillRect(0, 0, 512, 320); for (const [rad, col] of [[140, '#35f0ff'], [100, '#ff3fa4'], [60, '#ffe24a']]) { hg.strokeStyle = col; hg.lineWidth = 10; hg.beginPath(); hg.arc(256, 160, rad, 0, 7); hg.stroke(); } hg.fillStyle = '#35f0ff'; hg.beginPath(); hg.ellipse(256, 160, 34, 22, 0, 0, 7); hg.fill();
    add(new THREE.PlaneGeometry(22, 13.75), new THREE.MeshBasicMaterial({ map: T(hc) }), 0, 14, -62, g, { cast: false });
    const carros = []; for (let i = 0; i < 4; i++) { const c = new THREE.Group(); g.add(c); B(c, 3.2, .8, 1.4, toon({ color: ['#ff3fa4', '#35f0ff', '#ffe24a', '#9a5cff'][i] }), 0, 0, 0, { cast: false }); B(c, 1.6, .6, 1.2, toon({ color: '#1c1636' }), -.3, .6, 0, { cast: false }); B(c, 3.4, .12, 1.5, brilha('#ffffff'), 0, -.46, 0, { cast: false }); c.userData.o = [i, 6 + i * 1.6, (i % 2 ? 1 : -1)]; carros.push(c); }
    const l1 = new THREE.PointLight('#ff3fa4', 2.4, 22, 1.5); l1.position.set(-4, 4, -3); g.add(l1); const l2 = new THREE.PointLight('#35f0ff', 2.4, 22, 1.5); l2.position.set(4, 4, -9); g.add(l2);
    const vap = []; { const fm = new THREE.MeshBasicMaterial({ color: '#c8b8ff', transparent: true, opacity: .5, depthWrite: false }); for (let i = 0; i < 6; i++) { const m = fant(new THREE.Mesh(new THREE.SphereGeometry(.5, 10, 8), fm.clone())); g.add(m); vap.push(m); } }
    lista.cyberpunk = { g, raio: 5, chao: () => 0, state(S, f) { const t = f / 30; carros.forEach((c, i) => { const [k, h, sd] = c.userData.o, u = ((t * .08 + k * .27) % 1); c.position.set(sd * (2 + k), h, 10 - u * 80); c.rotation.y = sd > 0 ? 0 : PI; c.rotation.z = Math.sin(t * 2 + k) * .06; });
      vap.forEach((m, i) => { const u = (t * .4 + i / 6) % 1; m.position.set(3.4, .2 + u * 3.6, -6); m.scale.setScalar(.5 + u * 1.6); m.material.opacity = (1 - u) * .5; }); l1.intensity = 2 + .5 * Math.sin(t * 3); } }; }

  // ===================================== APOCALIPSE =====================================
  { const g = novo('apocalipse'), r = P.rng(111); const pal = { base: '#5a4a48', frame: '#1a1210', luz: ['#ff9a40'], escuro: '#1c1414', on: .06, quebr: 1, torto: .1 };
    const [fc, fg] = cv(512, 512); fg.fillStyle = '#4a4040'; fg.fillRect(0, 0, 512, 512); for (let i = 0; i < 90; i++) { fg.fillStyle = r() < .5 ? 'rgba(20,14,14,.5)' : 'rgba(120,100,90,.35)'; fg.beginPath(); fg.ellipse(r() * 512, r() * 512, 8 + r() * 40, 4 + r() * 14, r() * 3, 0, 7); fg.fill(); } fg.strokeStyle = '#120a0a'; fg.lineWidth = 6; for (let i = 0; i < 8; i++) { fg.beginPath(); let x = r() * 512, y = 0; fg.moveTo(x, y); while (y < 512) { x += (r() - .5) * 60; y += 30 + r() * 40; fg.lineTo(x, y); } fg.stroke(); }
    piso(g, 60, 200, fc, 3, 20, -60);
    const pr = predios(g, pal, 113, 12, -70, 8, 20);
    for (const p of pr) { const z = p.z0 - p.D / 2; for (let k = 0; k < 2; k++) { const b = B(g, 3 + r() * 3, 2 + r() * 4, 3 + r() * 3, toon({ color: '#3a2e2c' }), -p.lado * (11 + r() * 3), p.H + 1, z + (r() - .5) * 5, { cast: false }); b.rotation.set((r() - .5) * .5, r(), (r() - .5) * .5); } }
    const escomb = toon({ map: T(P.rocha(31, 20, 10, 36)) }); for (let i = 0; i < 18; i++) add(pedra(.4 + r() * .9, 120 + i, .6), escomb, (r() - .5) * 8, .2, -3 - r() * 40, g);
    const carro = (cor, x, z, ry, rz) => { const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.set(0, ry, rz); g.add(c); const m = toon({ color: cor }); B(c, 4.2, .85, 1.9, m, 0, .8, 0); B(c, 2.2, .7, 1.7, m, -.2, 1.55, 0); for (const sx of [-1.35, 1.35]) for (const sz of [-.9, .9]) C(c, .42, .42, .34, toon({ color: '#1a1414' }), sx, .42, sz, 14).rotation.x = PI / 2; };
    carro('#6a3a2a', 2.6, -8, .4, .06); carro('#3a4a5a', -2.8, -14, -.7, -.2); carro('#5a5a30', 1.6, -21, .1, .5);
    const fogos = []; for (const [x, z, k] of [[-3.4, -6, 1.2], [3.8, -11, 1.5], [-2.2, -18, 1.8], [0.6, -26, 2.2], [-6.4, -12, 1.6]]) { const m = new THREE.MeshBasicMaterial({ map: chamaCard(3 + fogos.length), transparent: true, depthWrite: false, side: THREE.DoubleSide }); const p = fant(new THREE.Mesh(new THREE.PlaneGeometry(1.1 * k, 1.5 * k), m)); p.position.set(x, .75 * k, z); g.add(p); fogos.push({ p, m, k }); }
    const fum = []; { const fm = new THREE.MeshBasicMaterial({ color: '#2a2224', transparent: true, depthWrite: false, fog: false }); for (let i = 0; i < 10; i++) { const m = fant(new THREE.Mesh(new THREE.SphereGeometry(1, 12, 9), fm.clone())); g.add(m); fum.push(m); } }
    const semaf = new THREE.Group(); semaf.position.set(4.6, 0, -4); g.add(semaf); C(semaf, .1, .12, 4.4, toon({ color: '#3a3040' }), 0, 2.2, 0, 8); B(semaf, .8, 1.9, .55, toon({ color: '#1c1618' }), 0, 4.7, 0); semaf.rotation.z = -.3;
    const luz = new THREE.PointLight('#ff7a2a', 2.2, 26, 1.5); luz.position.set(-3, 4, -10); g.add(luz);

    // --- ZONA 1: PORTÃO MILITAR E BARRICADA DOS MONSTROS (z = 4.5) ---
    const ferroPortao = toon({ color: '#1a1820' });
    const grade = new THREE.Group(); grade.position.set(0, 0, 4.5); g.add(grade);
    for (let x = -5.5; x <= 5.5; x += 1.1) C(grade, .07, .07, 3.4, ferroPortao, x, 1.7, 0, 6, { cast: false });
    B(grade, 12, .1, .1, ferroPortao, 0, 3.2, 0, { cast: false });
    B(grade, 12, .1, .1, ferroPortao, 0, 1.8, 0, { cast: false });
    B(grade, 12, .1, .1, ferroPortao, 0, .4, 0, { cast: false });
    const conc = toon({ color: '#443e3a' });
    B(grade, 4.2, 1.1, .8, conc, -3.2, .55, .4); B(grade, 4.2, 1.1, .8, conc, 3.2, .55, .4);
    const [dgc, dgx] = cv(256, 128); dgx.fillStyle = '#ffba24'; dgx.fillRect(0, 0, 256, 128);
    dgx.fillStyle = '#100a08'; dgx.font = 'bold 38px sans-serif'; dgx.textAlign = 'center'; dgx.fillText('PERIGO', 128, 52);
    dgx.font = 'bold 24px sans-serif'; dgx.fillText('QUARENTENA', 128, 92);
    const pld = add(new THREE.PlaneGeometry(1.8, .9), new THREE.MeshBasicMaterial({ map: T(dgc) }), 0, 2.3, .08, grade, { cast: false });
    // Olhos vermelhos brilhantes de monstros atrás da grade (z = 6 a 9)
    const olhosM = [];
    for (let i = 0; i < 7; i++) {
      const om1 = new THREE.Mesh(new THREE.SphereGeometry(.14, 8, 6), new THREE.MeshBasicMaterial({ color: '#ff1818', fog: false }));
      const xm = (r() - .5) * 8.5, zm = 6 + r() * 3.5, ym = .8 + r() * 1.5;
      om1.position.set(xm, ym, zm); g.add(om1);
      const om2 = om1.clone(); om2.position.x = xm + .32; g.add(om2);
      olhosM.push({ om1, om2, ym, i });
    }

    // --- ZONA 2: GALPÃO E PILHA DE 10.000 LATAS BLINDADAS (x = -4.5, z = -12) ---
    const lataMetal = toon({ color: '#687464' });
    const galpao = new THREE.Group(); galpao.position.set(-4.5, 0, -12.5); g.add(galpao);
    const cxMad = toon({ color: '#383b30' });
    B(galpao, 2.4, 1.3, 1.8, cxMad, 0, .65, 0);
    B(galpao, 2.0, 1.1, 1.5, cxMad, -1.8, .55, .3);
    B(galpao, 1.8, 1.0, 1.4, cxMad, -.5, 1.8, .2);
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < (5 - row); col++) {
        const lx = (col - (5 - row) / 2 + .5) * .42;
        const ly = 1.3 + row * .38;
        C(galpao, .16, .16, .34, lataMetal, lx, ly, .9, 10, { cast: false });
      }
    }

    // --- ZONA 3: MESA IMPROVISADA / TAMBOR DO TIÃO (x = -0.3, z = 0.3) ---
    const tambor = new THREE.Group(); tambor.position.set(-.3, 0, .3); g.add(tambor);
    C(tambor, .32, .32, .75, toon({ color: '#25303c' }), 0, .38, 0, 12);
    const lataTambor = C(tambor, .13, .13, .26, lataMetal, .27, .88, 0, 10);   // 17/11: era no centro do tambor e tapava o rosto de quem fica atrás dele (Tião, quadro 0); agora na borda. Estado: apocalipse.lata = false | [dx, dz]

    // --- PAREDÃO DE ARMAS (17/11): rack de 3 fileiras x 17 = 50 armas penduradas + caixas de munição. ESCONDIDO até o story ligar. ---
    // worldAt: () => ({ apocalipse: { armas: 50, caixasMunicao: 12, rack: { x: 0, z: -2.2, ry: 0, esc: 1 } } })   armas = quantas AINDA estão no rack (0..50; some em ordem
    // embaralhada fixa, então animar 50 -> 0 esvazia o paredão); caixasMunicao 0..16 (some do fim p/ o começo); rack.x/z/ry em coords do cenário (ry em rad).
    const rack = new THREE.Group(); rack.position.set(0, 0, -2.2); rack.visible = false; g.add(rack);
    const NARM = 50, COLS = 17, TIER = 1.15, ESP = 0.3, rr = P.rng(777);
    { const mad = toon({ color: '#8a7466' }), mad2 = toon({ color: '#4a3226' }), ferro = toon({ color: '#1c1d22' });
      const W_ = COLS * ESP + 0.5;
      B(rack, W_, 3.9, 0.08, mad, 0, 1.95, 0, { cast: false });
      for (const sx of [-1, 1]) B(rack, 0.22, 4.1, 0.2, mad2, sx * (W_ / 2 + 0.1), 2.05, 0.04, { cast: false });
      for (let t = 0; t < 3; t++) { B(rack, W_ + 0.3, 0.1, 0.14, mad2, 0, 0.35 + t * TIER, 0.07, { cast: false }); B(rack, W_ + 0.3, 0.08, 0.12, mad2, 0, 1.2 + t * TIER, 0.07, { cast: false }); }
      B(rack, W_ + 0.5, 0.14, 0.3, mad2, 0, 3.98, 0.06, { cast: false }); }
    const armasLista = [];
    { const cano = toon({ color: '#16171c' }), cano2 = toon({ color: '#3a3e48' }), coronha = [toon({ color: '#a0602c' }), toon({ color: '#7a4a24' }), toon({ color: '#c08a48' })], baz = toon({ color: '#6a8a3a' }), pente = toon({ color: '#0e0f12' });
      for (let i = 0; i < NARM; i++) { const t = Math.floor(i / COLS), c = i % COLS, grp = new THREE.Group(), x = (c - (COLS - 1) / 2) * ESP, y0 = 0.42 + t * TIER;
        grp.position.set(x, y0, 0.16); rack.add(grp); const tipo = i % 7 === 3 ? 'baz' : 'fuzil';
        if (tipo === 'baz') { C(grp, 0.085, 0.085, 1.0, baz, 0, 0.5, 0, 8, { cast: false }); C(grp, 0.125, 0.125, 0.2, cano2, 0, 1.0, 0, 8, { cast: false }); B(grp, 0.06, 0.18, 0.06, cano, 0, 0.35, 0.08, { cast: false }); }
        else { B(grp, 0.07, 0.95, 0.06, i % 2 ? cano : cano2, 0, 0.55, 0, { cast: false }); B(grp, 0.13, 0.36, 0.08, coronha[i % 3], 0, 0.1, 0, { cast: false }); B(grp, 0.09, 0.22, 0.07, pente, 0.05, 0.42, 0.04, { cast: false }); }
        armasLista.push({ grp, ordem: rr() }); }
      armasLista.slice().sort((a, b) => a.ordem - b.ordem).forEach((o, k) => { o.rank = k; }); }
    const caixas = []; { const cx = toon({ color: '#4a5230' }), faixa = toon({ color: '#d4a82a' });
      for (let i = 0; i < 16; i++) { const camada = i < 8 ? 0 : i < 14 ? 1 : 2, k = camada === 0 ? i : camada === 1 ? i - 8 : i - 14, x0 = camada === 0 ? -2.2 : camada === 1 ? -1.9 : -1.6, x = x0 + k * 0.62, y = 0.17 + camada * 0.34, z = 0.75 + (camada === 2 ? 0 : 0);
        const gc = new THREE.Group(); gc.position.set(x, y, z); gc.rotation.y = (rr() - .5) * 0.25; rack.add(gc); B(gc, 0.55, 0.32, 0.36, cx, 0, 0, 0, { cast: false }); B(gc, 0.12, 0.33, 0.37, faixa, 0.12, 0, 0, { cast: false }); caixas.push(gc); } }
    const estadoAp = (S, cp) => {
      const A = S.apocalipse || {}, tem = A.armas != null || A.caixasMunicao != null;
      rack.visible = tem; if (tem) { const R = A.rack || {}; rack.position.set(R.x ?? 0, 0, R.z ?? -2.2); rack.rotation.y = R.ry ?? 0; rack.scale.setScalar(R.esc ?? 1);
        const n = Math.max(0, Math.min(NARM, A.armas ?? 0)), nc = Math.max(0, Math.min(16, A.caixasMunicao ?? 0)); armasLista.forEach((o) => { o.grp.visible = o.rank < n; }); caixas.forEach((c, i) => { c.visible = i < nc; }); }
      const L = A.lata; lataTambor.visible = L !== false; if (Array.isArray(L)) lataTambor.position.set(.27 + L[0], .88, L[1]);
      // portão + placa: some sozinho quando a câmera está a < 1,6 m do plano da grade (senão barras e placa amarela gigantes tapam o quadro); apocalipse.grade true/false força
      let vg = true; if (A.grade != null) vg = !!A.grade; else if (cp) vg = !(Math.abs(cp[2] - (g.position.z + 4.5)) < 1.6 && Math.abs(cp[0] - g.position.x) < 8);
      grade.visible = vg; };

    lista.apocalipse = { g, raio: 5, chao: () => 0, state(S, f) { const t = f / 30; estadoAp(S, S.cam); fogos.forEach((o, i) => { o.m.map = [chamaCard(3 + i), chamaCard(4 + i), chamaCard(5 + i)][(Math.floor(t * 7) + i) % 3]; o.p.scale.set(1 + .08 * Math.sin(t * 17 + i), 1 + .12 * Math.sin(t * 13 + i * 2), 1); }); luz.intensity = 2 + .6 * Math.sin(t * 19);
      fum.forEach((m, i) => { const u = (t * .12 + i / 10) % 1, sx = [-6, 4, -2.2][i % 3]; m.position.set(sx + u * 4, 3 + u * 30, [-12, -18, -26][i % 3]); m.scale.set(0.8 + u * 2.2, 1.2 + u * 3.0, 0.8 + u * 2.2); m.material.opacity = (1 - u) * .32; });
      olhosM.forEach((o) => { const pisca = Math.sin(t * 6 + o.i * 2) > .85 ? 0 : 1; o.om1.visible = !!pisca; o.om2.visible = !!pisca; const flut = Math.sin(t * 3 + o.i) * .05; o.om1.position.y = o.ym + flut; o.om2.position.y = o.ym + flut; }); } }; }

  // ===================================== CEMITÉRIO + CASTELO =====================================
  { const g = novo('cemiterio'), r = P.rng(121);
    const [gc, gg] = cv(512, 512); gg.fillStyle = '#2f4a3e'; gg.fillRect(0, 0, 512, 512); for (let i = 0; i < 160; i++) { gg.strokeStyle = r() < .5 ? '#3d5e4a' : '#22382e'; gg.lineWidth = 3; gg.beginPath(); const x = r() * 512, y = r() * 512; gg.moveTo(x, y); gg.lineTo(x + (r() - .5) * 10, y - 8 - r() * 8); gg.stroke(); } gg.fillStyle = '#5a4a3a'; gg.fillRect(215, 0, 82, 512);
    piso(g, 70, 100, gc, 8, 12, -30);
    const pedraL = toon({ map: T(P.mossy(P.stone(5, 220, 10, 56), 4, .45), 1, 1) });
    for (let i = 0; i < 24; i++) { const x = (r() < .5 ? -1 : 1) * (3 + r() * 14), z = -2 - r() * 34, ty = i % 3, h = 1 + r() * 1.2; const gr = new THREE.Group(); gr.position.set(x, 0, z); gr.rotation.set((r() - .5) * .15, (r() - .5) * .8, (r() - .5) * .2); g.add(gr);
      if (ty === 0) { B(gr, 1.1, h, .28, pedraL, 0, h / 2, 0); add(new THREE.CylinderGeometry(.55, .55, .28, 16), pedraL, 0, h, 0, gr).rotation.x = PI / 2; } else if (ty === 1) { B(gr, .3, h * 1.4, .3, pedraL, 0, h * .7, 0); B(gr, 1.0, .3, .3, pedraL, 0, h * 1.1, 0); } else { B(gr, 1.2, h * .8, .3, pedraL, 0, h * .4, 0); B(gr, 1.4, .2, .4, pedraL, 0, h * .85, 0); } }
    const ferro = toon({ color: '#1a1820' }); for (let i = -9; i <= 9; i++) { C(g, .06, .06, 2, ferro, i * 1.3, 1, -4.6, 6, { cast: false }); const pt = add(new THREE.ConeGeometry(.1, .3, 6), ferro, i * 1.3, 2.1, -4.6, g, { cast: false }); } B(g, 25, .08, .08, ferro, 0, 1.6, -4.6, { cast: false }); B(g, 25, .08, .08, ferro, 0, .5, -4.6, { cast: false });
    const tronco = toon({ color: '#2a2024' }); for (const [x, z, h] of [[-5.5, -9, 7], [6.5, -13, 8], [-9, -20, 9]]) { const cu = new THREE.CatmullRomCurve3([new THREE.Vector3(x, 0, z), new THREE.Vector3(x + .8, h * .4, z), new THREE.Vector3(x - .6, h * .7, z), new THREE.Vector3(x + 1, h, z)]); add(new THREE.TubeGeometry(cu, 16, .35, 7), tronco, 0, 0, 0, g); for (let k = 0; k < 4; k++) { const cc = new THREE.CatmullRomCurve3([new THREE.Vector3(x + .3, h * (.55 + k * .12), z), new THREE.Vector3(x + (k % 2 ? 1.6 : -1.6), h * (.65 + k * .12), z), new THREE.Vector3(x + (k % 2 ? 2.4 : -2.4), h * (.8 + k * .1), z)]); add(new THREE.TubeGeometry(cc, 8, .12, 5), tronco, 0, 0, 0, g); } }
    const lua = new THREE.Mesh(new THREE.SphereGeometry(7, 28, 20), new THREE.MeshBasicMaterial({ color: '#fff6d0', fog: false })); lua.position.set(-6, 19, -60); lua.userData.ndSkip = true; g.add(lua); const halo = new THREE.Mesh(new THREE.SphereGeometry(10.5, 24, 16), new THREE.MeshBasicMaterial({ color: '#fff6d0', transparent: true, opacity: .2, fog: false, depthWrite: false })); halo.position.copy(lua.position); halo.userData.ndSkip = true; g.add(halo);
    const mont = toon({ color: '#1a1830' }); add(new THREE.ConeGeometry(30, 22, 14), mont, 10, 11, -64, g, { cast: false }); const cast = new THREE.Group(); cast.position.set(10, 20, -63); g.add(cast); const cp = toon({ color: '#241a3a' }), jan = brilha('#ffd86a');
    B(cast, 10, 8, 6, cp, 0, 2, 0, { cast: false }); for (const [x, h] of [[-6, 12], [6, 10], [0, 14]]) { C(cast, 1.6, 1.8, h, cp, x, h / 2 - 2, 0, 12, { cast: false }); add(new THREE.ConeGeometry(2.2, 4, 12), toon({ color: '#3a1a4a' }), x, h + 0, 0, cast, { cast: false }); } for (const [x, y] of [[-3, 3], [3, 3], [0, 8], [-6, 6], [6, 5]]) B(cast, .9, 1.4, .1, jan, x, y, 3.05, { cast: false });
    const masol = toon({ map: T(P.stone(7, 250, 10, 50), 2, 2) }); B(g, 4.5, 3.6, 4, masol, -7, 1.8, -12); B(g, 5.2, .5, 4.6, masol, -7, 3.8, -12); B(g, 1.4, 2.2, .1, toon({ color: '#0e0a14' }), -7, 1.1, -9.95, { cast: false });
    const lant = new THREE.Group(); lant.position.set(2.8, 0, -3.4); g.add(lant); C(lant, .05, .05, 2.2, ferro, 0, 1.1, 0, 6); const lb = add(new THREE.SphereGeometry(.28, 12, 10), brilha('#ffe08a'), 0, 2.3, 0, lant, { cast: false }); const lz = new THREE.PointLight('#ffcf70', 1.6, 14, 1.5); lz.position.set(2.8, 2.4, -3.4); g.add(lz);
    const morc = []; for (let i = 0; i < 7; i++) { const w = new THREE.Group(); const wm = new THREE.MeshBasicMaterial({ color: '#0a0610', side: THREE.DoubleSide }); for (const sd of [-1, 1]) { const a = fant(new THREE.Mesh(new THREE.PlaneGeometry(.9, .45), wm)); a.position.x = sd * .45; a.userData.sd = sd; w.add(a); } w.userData.o = [i, 6 + (i % 3) * 3, 18 + i * 3]; g.add(w); morc.push(w); }
    lista.cemiterio = { g, raio: 5, chao: () => 0, state(S, f) { const t = f / 30; lz.intensity = 1.3 + .4 * Math.sin(t * 6) + (Math.sin(t * 17) > .9 ? .4 : 0); halo.material.opacity = .18 + .04 * Math.sin(t);
      morc.forEach((w) => { const [i, h, z] = w.userData.o, a = t * .35 + i * 1.3; w.position.set(Math.cos(a) * 12 - 4, h + Math.sin(a * 2) * 1.2, -z + Math.sin(a) * 4); w.rotation.y = a + PI / 2; w.children.forEach((c) => { c.rotation.z = c.userData.sd * Math.sin(t * 14 + i) * .7; }); }); } }; }

  // ===================================== PARQUE ABANDONADO =====================================
  { const g = novo('parque'), r = P.rng(131);
    const [pc, pg] = cv(512, 512); pg.fillStyle = '#6a5a6a'; pg.fillRect(0, 0, 512, 512); pg.strokeStyle = '#3a2e3a'; pg.lineWidth = 5; for (let i = 0; i <= 4; i++) { pg.beginPath(); pg.moveTo(0, i * 128); pg.lineTo(512, i * 128); pg.moveTo(i * 128, 0); pg.lineTo(i * 128, 512); pg.stroke(); } for (let i = 0; i < 12; i++) { pg.strokeStyle = '#241a24'; pg.lineWidth = 4; pg.beginPath(); let x = r() * 512, y = r() * 512; pg.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - .5) * 60; y += (r() - .5) * 60; pg.lineTo(x, y); } pg.stroke(); } pg.fillStyle = '#4a6a3a'; for (let i = 0; i < 40; i++) { pg.beginPath(); pg.arc(r() * 512, r() * 512, 3 + r() * 5, 0, 7); pg.fill(); }
    piso(g, 80, 100, pc, 8, 10, -26);
    // roda-gigante
    const rd = new THREE.Group(); rd.position.set(2, 8.2, -18); g.add(rd); const met = toon({ color: '#8a7a90' }), gond = [];
    add(new THREE.TorusGeometry(7, .2, 8, 48), met, 0, 0, 0, rd); add(new THREE.TorusGeometry(4, .12, 8, 36), met, 0, 0, 0, rd); for (let i = 0; i < 12; i++) { const a = i * PI / 6; const sp = B(rd, .1, 14, .1, met, 0, 0, 0, { cast: false }); sp.rotation.z = a; const gd = new THREE.Group(); gd.position.set(Math.cos(a) * 7, Math.sin(a) * 7, 0); rd.add(gd); B(gd, 1.3, 1, 1, toon({ color: ['#c0392b', '#d4a017', '#3a6aa8', '#7a4a9a'][i % 4] }), 0, -.7, 0); gond.push(gd); }
    B(g, .5, 8.4, .5, met, -3.5 + 2, 4.2, -18); B(g, .5, 8.4, .5, met, 3.5 + 2, 4.2, -18);
    // carrossel
    const car = new THREE.Group(); car.position.set(-3.6, 0, -9); g.add(car); C(car, 3, 3.2, .5, toon({ color: '#9a7a5a' }), 0, .25, 0, 24); const ct = add(new THREE.ConeGeometry(3.6, 2, 24), toon({ color: '#b04050' }), 0, 4.2, 0, car); const mastros = []; for (let i = 0; i < 8; i++) { const a = i * PI / 4, m = new THREE.Group(); m.position.set(Math.cos(a) * 2.2, 0, Math.sin(a) * 2.2); car.add(m); C(m, .06, .06, 3.4, toon({ color: '#d4a017' }), 0, 2, 0, 6); const cv_ = new THREE.Group(); m.add(cv_); S_(cv_, .45, toon({ color: ['#f2f2ee', '#d8b0c0', '#a8c0e0'][i % 3] }), 0, 1.5, 0, 12, 9).scale.set(1.2, .8, .7); mastros.push(cv_); }
    // tenda de circo
    const [tc2, tg2] = cv(256, 128); for (let i = 0; i < 8; i++) { tg2.fillStyle = i % 2 ? '#f4f0e6' : '#b83a4a'; tg2.fillRect(i * 32, 0, 32, 128); }
    add(new THREE.ConeGeometry(5, 5, 16, 1, true), toon({ map: T(tc2, 1, 1), side: THREE.DoubleSide }), 7.5, 7.5, -13, g); add(new THREE.CylinderGeometry(5, 5, 3, 16, 1, true), toon({ map: T(tc2, 1, 1), side: THREE.DoubleSide }), 7.5, 1.5, -13, g); B(g, 1.6, 2.2, .2, toon({ color: '#16101a' }), 7.5, 1.1, -8.1, { cast: false });
    const [sc, sg] = cv(256, 96); sg.fillStyle = '#3a2a3a'; sg.fillRect(0, 0, 256, 96); sg.fillStyle = '#d4a017'; sg.font = '900 44px Arial Black, sans-serif'; sg.textAlign = 'center'; sg.textBaseline = 'middle'; sg.fillText('PARQUE', 128, 50); const placa = add(new THREE.PlaneGeometry(4, 1.5), toon({ map: T(sc), side: THREE.DoubleSide }), -1.2, 5.6, -7, g, { cast: false }); placa.rotation.z = .12; C(g, .08, .08, 5, met, -2.8, 2.5, -7, 6, { cast: false }); C(g, .08, .08, 5, met, .4, 2.5, -7, 6, { cast: false });
    for (let i = 0; i < 10; i++) { const x = (r() - .5) * 14, z = -3 - r() * 12; const b = add(new THREE.ConeGeometry(.15, .5 + r() * .5, 5), toon({ color: '#4a6a3a' }), x, .25, z, g, { cast: false }); b.rotation.z = (r() - .5) * .6; }
    const bal = []; for (const [x, y, z, c] of [[-1.8, 5.4, -6.5, '#d8506a'], [-.6, 5.8, -6.6, '#4a8ad8'], [.3, 5.3, -6.5, '#d8b030']]) { const b = S_(g, .45, toon({ color: c }), x, y, z); b.scale.y = 1.2; bal.push(b); }
    lista.parque = { g, raio: 5, chao: () => 0, state(S, f) { const t = f / 30; rd.rotation.z = -t * .12; gond.forEach((gd) => { gd.rotation.z = t * .12 + Math.sin(t * 1.5 + gd.position.x) * .06; }); car.rotation.y = t * .25; mastros.forEach((m, i) => { m.position.y = Math.sin(t * 1.6 + i) * .4; }); bal.forEach((b, i) => { b.position.y = 5.4 + .15 * Math.sin(t * 1.4 + i * 2); }); } }; }

  // ===================================== DOJO NA MONTANHA =====================================
  { const g = novo('dojo'), r = P.rng(141);
    const [pc, pg] = cv(512, 512); pg.fillStyle = '#d6cbb4'; pg.fillRect(0, 0, 512, 512); pg.strokeStyle = 'rgba(100,80,60,.5)'; pg.lineWidth = 4; for (let i = 0; i <= 4; i++) { pg.beginPath(); pg.moveTo(0, i * 128); pg.lineTo(512, i * 128); pg.moveTo(i * 128, 0); pg.lineTo(i * 128, 512); pg.stroke(); } for (let i = 0; i < 40; i++) { pg.fillStyle = r() < .5 ? 'rgba(150,120,90,.25)' : 'rgba(255,250,235,.35)'; pg.beginPath(); pg.ellipse(r() * 512, r() * 512, 10 + r() * 30, 6 + r() * 14, r() * 3, 0, 7); pg.fill(); } pg.fillStyle = 'rgba(255,160,190,.7)'; for (let i = 0; i < 30; i++) { pg.beginPath(); pg.ellipse(r() * 512, r() * 512, 6, 3, r() * 3, 0, 7); pg.fill(); }
    piso(g, 60, 80, pc, 8, 10, -18);
    const verm = toon({ color: '#c0392b' }), madeira = toon({ map: T(P.planks(3), 2, 1) }), telha = toon({ color: '#3a4a5e' }); const dj = new THREE.Group(); dj.position.set(0, 0, -15); g.add(dj);
    B(dj, 14, 1.2, 8, toon({ color: '#8a8478' }), 0, .6, 0); B(dj, 12, 4.4, 6, madeira, 0, 3.4, 0); for (const x of [-5.6, -2, 2, 5.6]) C(dj, .35, .35, 4.6, verm, x, 3.5, 3.2, 10);
    const [sc, sg] = cv(128, 128); sg.fillStyle = '#f2ead6'; sg.fillRect(0, 0, 128, 128); sg.strokeStyle = '#8a7a5a'; sg.lineWidth = 4; for (let i = 0; i <= 4; i++) { sg.beginPath(); sg.moveTo(i * 32, 0); sg.lineTo(i * 32, 128); sg.moveTo(0, i * 32); sg.lineTo(128, i * 32); sg.stroke(); } for (const x of [-3.2, 0, 3.2]) add(new THREE.PlaneGeometry(2.6, 3.4), toon({ map: T(sc, 1, 1) }), x, 3.2, 3.02, dj, { cast: false });
    for (const [s, y, h] of [[8.6, 6, 1.6], [6.4, 7.4, 1.4], [3.4, 8.6, 1.4]]) { const c = add(new THREE.ConeGeometry(s, h, 4), telha, 0, y, 0, dj); c.rotation.y = PI / 4; c.scale.set(1.3, 1, .9); }
    // portão torii
    const tor = new THREE.Group(); tor.position.set(0, 0, -6.5); g.add(tor); for (const x of [-3.2, 3.2]) C(tor, .3, .36, 5.5, verm, x, 2.75, 0, 12); const vg = B(tor, 9, .5, .6, verm, 0, 5.6, 0); B(tor, 7.6, .35, .4, verm, 0, 4.6, 0); add(new THREE.BoxGeometry(10, .3, .8), toon({ color: '#1a1416' }), 0, 6, 0, tor);
    // bambuzal, cerejeira, lanternas, boneco de treino
    const bam = toon({ color: '#6aa84a' }), bam2 = toon({ color: '#4f8a38' }); for (let i = 0; i < 40; i++) { const lado = i % 2 ? 1 : -1, x = lado * (4.5 + r() * 10), z = -2 - r() * 20, h = 9 + r() * 7; const c = C(g, .16, .2, h, i % 3 ? bam : bam2, x, h / 2, z, 8, { cast: false }); for (let k = 1; k < 5; k++) add(new THREE.TorusGeometry(.2, .04, 5, 10), bam2, x, k * h / 5, z, g, { cast: false }).rotation.x = PI / 2; if (i % 4 === 0) { const l = add(new THREE.SphereGeometry(1.4, 10, 8), bam, x, h, z, g, { cast: false }); l.scale.set(1.2, .5, 1.2); } }
    const ch = new THREE.Group(); ch.position.set(-6.5, 0, -9); g.add(ch); C(ch, .35, .6, 4.5, toon({ color: '#5a3a2a' }), 0, 2.2, 0, 8); for (let i = 0; i < 7; i++) S_(ch, 1.8 + r() * .8, toon({ color: ['#ffb3c8', '#ff9ab8', '#ffc9d8'][i % 3] }), (r() - .5) * 4, 4.6 + r() * 1.4, (r() - .5) * 3, 14, 10);
    for (const x of [-3.4, 3.4]) { const lt = new THREE.Group(); lt.position.set(x, 0, -4); g.add(lt); B(lt, .9, .3, .9, toon({ color: '#8a8a90' }), 0, .15, 0); C(lt, .2, .26, 1.1, toon({ color: '#8a8a90' }), 0, .85, 0, 8); B(lt, .7, .6, .7, toon({ color: '#9a9aa0' }), 0, 1.6, 0); B(lt, .4, .4, .74, brilha('#ffd86a'), 0, 1.6, 0, { cast: false }); }
    const dm = new THREE.Group(); dm.position.set(5, 0, -3.5); g.add(dm); C(dm, .3, .3, 2.2, madeira, 0, 1.1, 0, 10); B(dm, 1.5, .25, .25, madeira, 0, 1.6, 0); B(dm, 1.5, .25, .25, madeira, 0, 1.1, 0);
    for (const [x, h, s] of [[-12, 14, 14], [8, 18, 17], [-3, 12, 12]]) add(new THREE.ConeGeometry(s, h, 6), toon({ color: '#9ab0c8' }), x, h / 2 - 1, -60, g, { cast: false });
    const pet = []; { const pm = new THREE.MeshBasicMaterial({ color: '#ffb3c8', side: THREE.DoubleSide }); for (let i = 0; i < 60; i++) { const m = fant(new THREE.Mesh(new THREE.PlaneGeometry(.18, .12), pm)); m.userData.o = [(r() - .5) * 20, r(), -r() * 16, .5 + r()]; g.add(m); pet.push(m); } }
    lista.dojo = { g, raio: 5, chao: () => 0, state(S, f) { const t = f / 30; pet.forEach((m) => { const [x, u, z, v] = m.userData.o, h = ((u - t * v * .08) % 1 + 1) % 1; m.position.set(x + Math.sin(t * 1.2 + u * 20) * 1.2 + (1 - h) * 3, 9 * h, z); m.rotation.set(t * 2 + u * 9, t, 0); }); } }; }

  // ===================================== FUNDO DO MAR =====================================
  { const g = novo('fundomar'), r = P.rng(151);
    const [sc, sg] = cv(512, 512); sg.fillStyle = '#d8c48a'; sg.fillRect(0, 0, 512, 512); for (let i = 0; i < 30; i++) { sg.strokeStyle = r() < .5 ? 'rgba(170,140,80,.4)' : 'rgba(255,240,200,.45)'; sg.lineWidth = 4; sg.beginPath(); const y = r() * 512; sg.moveTo(0, y); sg.bezierCurveTo(150, y - 20, 350, y + 20, 512, y); sg.stroke(); } for (let i = 0; i < 70; i++) { sg.fillStyle = 'rgba(120,100,60,.35)'; sg.beginPath(); sg.arc(r() * 512, r() * 512, 2 + r() * 3, 0, 7); sg.fill(); }
    piso(g, 80, 100, sc, 8, 10, -24);
    const cor = ['#ff6a8a', '#ff9a3a', '#a85cff', '#35d0c8', '#ffd24a']; for (let i = 0; i < 30; i++) { const x = (r() - .5) * 16, z = -3 - r() * 24, c = toon({ color: cor[i % 5] }), gr = new THREE.Group(); gr.position.set(x, 0, z); g.add(gr); if (i % 3 === 0) for (let k = 0; k < 4; k++) { const cn = add(new THREE.ConeGeometry(.22, 1 + r() * 1.4, 8), c, (k - 1.5) * .35, .6, 0, gr); cn.rotation.z = (k - 1.5) * .25; } else if (i % 3 === 1) { const s1 = S_(gr, .7 + r() * .6, c, 0, .5, 0, 14, 10); s1.scale.y = .8; for (let k = 0; k < 5; k++) S_(gr, .1, toon({ color: '#fff4e0' }), Math.cos(k * 1.3) * .5, .9 + r() * .4, Math.sin(k * 1.3) * .5, 6, 5); } else for (let k = 0; k < 6; k++) { const t0 = C(gr, .12, .2, 1.4 + r(), c, (k - 2.5) * .22, .8, (r() - .5) * .3, 8); t0.rotation.z = (k - 2.5) * .12; } }
    const rocha = toon({ map: T(P.rocha(41, 200, 12, 40)) }); for (let i = 0; i < 10; i++) add(pedra(.6 + r() * 1.2, 150 + i, .7), rocha, (r() < .5 ? -1 : 1) * (4 + r() * 10), .3, -4 - r() * 22, g);
    const kelp = []; for (let i = 0; i < 16; i++) { const k = new THREE.Group(); k.position.set((r() - .5) * 20, 0, -4 - r() * 22); g.add(k); const h = 4 + r() * 5; for (let j = 0; j < 5; j++) S_(k, .45 - j * .05, toon({ color: ['#2f9a5a', '#3fb06a'][(i + j) % 2] }), 0, j * h / 5 + .4, 0, 10, 8).scale.set(1.1, h / 5 / (.45 - j * .05) * .62, .5); k.userData.h = h; kelp.push(k); }
    const naufr = new THREE.Group(); naufr.position.set(5, 0, -16); naufr.rotation.set(.1, -.6, .35); g.add(naufr); const madeira = toon({ map: T(P.planks(8), 1, 1) }); const sh = new THREE.Shape(); sh.moveTo(-6, 0); sh.lineTo(5, 0); sh.quadraticCurveTo(8, 1, 9, 5); sh.lineTo(-6.4, 5); sh.closePath(); const hg = new THREE.ExtrudeGeometry(sh, { depth: 4, bevelEnabled: false }); hg.translate(0, -1.5, -2); add(hg, madeira, 0, 0, 0, naufr);
    for (const [x, h, rz] of [[-1, 7, .2], [3, 5, -.3]]) { const m = add(new THREE.CylinderGeometry(.14, .2, h, 8), madeira, x, 3.5 + h / 2, 0, naufr); m.rotation.z = rz; } add(new THREE.PlaneGeometry(2.6, 3), toon({ color: '#d8d0b8', side: THREE.DoubleSide }), -1.4, 8, 0, naufr, { cast: false });
    const baus = new THREE.Group(); baus.position.set(-4, 0, -9); g.add(baus); B(baus, 1.6, 1, 1, toon({ color: '#8a5a2b' }), 0, .5, 0); add(new THREE.CylinderGeometry(.5, .5, 1.6, 12, 1, false, 0, PI), toon({ color: '#8a5a2b' }), 0, 1, 0, baus).rotation.z = PI / 2; for (const [x, z] of [[.6, .2], [-.4, .5], [.1, -.6]]) S_(baus, .13, toon({ color: '#ffd24a', emissive: '#7a5a00' }), x, 1.2, z, 8, 6);
    const bol = []; { const bm = new THREE.MeshBasicMaterial({ color: '#e6faff', transparent: true, opacity: .75, depthWrite: false }); for (let i = 0; i < 40; i++) { const m = fant(new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), bm)); m.userData.o = [(r() - .5) * 18, r(), -r() * 16, .4 + r() * .6]; g.add(m); bol.push(m); } }
    const peix = []; for (let i = 0; i < 12; i++) { const f2 = new THREE.Group(); const c = toon({ color: ['#ffb43a', '#4aa8ff', '#ff6a8a'][i % 3] }); S_(f2, .35, c, 0, 0, 0, 10, 8).scale.set(1.6, 1, .5); const tail = add(new THREE.ConeGeometry(.28, .5, 3), c, -.65, 0, 0, f2); tail.rotation.z = PI / 2; f2.userData.o = [i, 3 + (i % 4) * 1.4, -6 - (i % 5) * 4]; g.add(f2); peix.push(f2); }
    const rai = []; for (const [x, z, ry] of [[-3, -8, .1], [4, -12, -.15], [-8, -16, .2]]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.8, 3.4, 26, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#e8fff0', transparent: true, opacity: .15, depthWrite: false, side: THREE.DoubleSide })); c.position.set(x, 12, z); c.rotation.z = ry; c.userData.ndSkip = true; g.add(c); rai.push(c); }
    lista.fundomar = { g, raio: 5, chao: () => 0, state(S, f) { const t = f / 30; kelp.forEach((k, i) => { k.rotation.z = Math.sin(t * .9 + i) * .12; k.rotation.x = Math.cos(t * .7 + i * 2) * .08; });
      bol.forEach((m) => { const [x, u, z, v] = m.userData.o, h = ((u + t * v * .12) % 1); m.position.set(x + Math.sin(t + u * 9) * .3, 12 * h, z); m.scale.setScalar(.07 + .1 * u); });
      peix.forEach((f2) => { const [i, y, z] = f2.userData.o, a = t * (.35 + i * .02) + i; f2.position.set(Math.cos(a) * 9, y + Math.sin(t * 2 + i) * .2, z + Math.sin(a) * 2); f2.rotation.y = -Math.atan2(Math.cos(a) * 2, -Math.sin(a) * 9); }); rai.forEach((c, i) => { c.material.opacity = .13 + .05 * Math.sin(t * .8 + i); }); } }; }

  // ===================================== REINO DAS NUVENS =====================================
  { const g = novo('nuvens'), r = P.rng(161); const nv = toon({ color: '#ffffff' }), nv2 = toon({ color: '#e6ecff' });
    const disc = new THREE.Mesh(new THREE.CircleGeometry(11, 48), toon({ color: '#fbfcff' })); disc.rotation.x = -PI / 2; disc.position.y = 0; disc.receiveShadow = true; g.add(disc);
    for (let i = 0; i < 26; i++) { const a = i / 26 * PI * 2, rd = 10.2 + r() * .8; const s = S_(g, 1.4 + r() * 1.2, i % 2 ? nv : nv2, Math.cos(a) * rd, -.4 + r() * .5, Math.sin(a) * rd - 0, 14, 10); s.scale.y = .8; }
    for (let i = 0; i < 12; i++) S_(g, 2 + r() * 1.5, nv2, (r() - .5) * 20, -1.8 - r(), (r() - .5) * 20, 12, 8).scale.y = .6;
    const castelo = new THREE.Group(); castelo.position.set(0, 0, -38); g.add(castelo); const bco = toon({ color: '#fffaf0' }), ouro = toon({ color: '#f2c230' }), az = toon({ color: '#4a8ae8' });
    for (let i = 0; i < 12; i++) S_(castelo, 3 + r() * 2, nv, (r() - .5) * 20, -.5 + r(), (r() - .5) * 5, 12, 8).scale.y = .6;
    B(castelo, 10, 8, 5, bco, 0, 4, 0); for (const [x, h] of [[-7, 13], [7, 13], [0, 16], [-4, 10], [4, 10]]) { C(castelo, 1.4, 1.5, h, bco, x, h / 2, 0, 14); add(new THREE.ConeGeometry(1.9, 3.6, 14), x === 0 ? ouro : az, x, h + 1.8, 0, castelo); } B(castelo, 2.6, 3.6, .2, ouro, 0, 1.8, 2.6, { cast: false }); for (const [x, y] of [[-3, 5], [3, 5], [0, 9], [-7, 8], [7, 8]]) B(castelo, .8, 1.3, .1, brilha('#9ad0ff'), x, y, 2.55, { cast: false });
    const arco = ['#ff4a4a', '#ff9a3a', '#ffe24a', '#4ad86a', '#4a9aff', '#6a5aff', '#b05aff']; arco.forEach((c, i) => { const t = new THREE.Mesh(new THREE.TorusGeometry(22 - i * .9, .5, 8, 64, PI), new THREE.MeshBasicMaterial({ color: c, fog: false })); t.position.set(-8, -3, -34); t.userData.ndSkip = true; g.add(t); });
    for (const [x, y, z, s] of [[-14, 3, -10, 3], [13, 5, -14, 3.4], [-10, 8, -26, 4], [16, 9, -24, 3]]) { const il = new THREE.Group(); il.position.set(x, y, z); g.add(il); add(new THREE.ConeGeometry(s, s * 1.4, 10), toon({ color: '#8a7a6a' }), 0, -s * .7, 0, il).rotation.x = PI; add(new THREE.CylinderGeometry(s, s * .95, .5, 14), toon({ color: '#6acb6a' }), 0, .1, 0, il); S_(il, s * .45, toon({ color: '#3fa24a' }), 0, s * .65, 0, 12, 9); }
    const drift = []; for (let i = 0; i < 6; i++) { const c = new THREE.Group(); for (let k = 0; k < 4; k++) S_(c, 1.2 + r() * .8, nv, k * 1.4, r() * .4, 0, 12, 8).scale.y = .7; c.userData.o = [i, 4 + r() * 12, -8 - r() * 18]; g.add(c); drift.push(c); }
    lista.nuvens = { g, raio: 8, chao: () => 0, state(S, f) { const t = f / 30; drift.forEach((c) => { const [i, y, z] = c.userData.o; c.position.set(-22 + ((t * (.5 + i * .12) + i * 8) % 44), y, z); }); castelo.position.y = .12 * Math.sin(t * .5); } }; }

  // ===================================== ARENA DE LUTA =====================================
  { const g = novo('arena'), r = P.rng(171);
    const [rc, rg] = cv(512, 512); rg.fillStyle = '#2a4a9a'; rg.fillRect(0, 0, 512, 512); rg.strokeStyle = '#f4f0e6'; rg.lineWidth = 16; rg.strokeRect(14, 14, 484, 484); rg.fillStyle = '#e0392d'; rg.beginPath(); for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, q = i % 2 ? 60 : 150; rg.lineTo(256 + Math.cos(a) * q, 256 + Math.sin(a) * q); } rg.fill(); rg.fillStyle = 'rgba(255,255,255,.15)'; for (let i = 0; i < 8; i++) rg.fillRect(i * 64, 0, 32, 512);
    const ring = B(g, 13, .6, 13, [toon({ color: '#1a1a2a' }), toon({ color: '#1a1a2a' }), toon({ map: T(rc) }), toon({ color: '#1a1a2a' }), toon({ color: '#1a1a2a' }), toon({ color: '#1a1a2a' })], 0, -.3, -1); const base = B(g, 40, .4, 60, toon({ color: '#16121e' }), 0, -.8, -20);
    const corda = [toon({ color: '#e0392d' }), toon({ color: '#f4f0e6' }), toon({ color: '#3b82f6' })]; for (const [px, pz] of [[-6, -7], [6, -7]]) { C(g, .25, .3, 2.4, toon({ color: '#2a2a3a' }), px, 1.2, pz, 10); } for (let k = 0; k < 3; k++) { const y = .7 + k * .55; const b1 = B(g, 12, .12, .12, corda[k], 0, y, -7, { cast: false }); for (const sd of [-1, 1]) { const c = B(g, .12, .12, 14, corda[k], sd * 6, y, -1, { cast: false }); } }
    // arquibancada com torcida
    const [cc, cg] = cv(1024, 256); cg.fillStyle = '#1a1424'; cg.fillRect(0, 0, 1024, 256); for (let row = 0; row < 5; row++) for (let i = 0; i < 40; i++) { const x = i * 26 + (row % 2) * 13 + r() * 4, y = 24 + row * 46; cg.fillStyle = ['#e0392d', '#3b82f6', '#ffd24a', '#4ad86a', '#b05aff', '#ff8aa8'][(r() * 6) | 0]; cg.fillRect(x - 10, y + 12, 20, 26); cg.fillStyle = ['#f0c8a0', '#c89870', '#8a6a4a', '#f4d8b8'][(r() * 4) | 0]; cg.beginPath(); cg.arc(x, y + 6, 9, 0, 7); cg.fill(); if (r() < .15) { cg.strokeStyle = '#fff'; cg.lineWidth = 3; cg.beginPath(); cg.moveTo(x + 10, y + 12); cg.lineTo(x + 18, y - 10); cg.stroke(); } }
    for (let i = 0; i < 3; i++) { const p = add(new THREE.PlaneGeometry(44, 11), new THREE.MeshBasicMaterial({ map: T(cc) }), 0, 3 + i * 3.2, -14 - i * 3.2, g, { cast: false }); p.rotation.x = -.18; }
    const [bc, bg] = cv(512, 128); bg.fillStyle = '#e0392d'; bg.fillRect(0, 0, 512, 128); bg.strokeStyle = '#ffd24a'; bg.lineWidth = 8; bg.strokeRect(6, 6, 500, 116); bg.fillStyle = '#ffd24a'; bg.font = '900 80px Arial Black, sans-serif'; bg.textAlign = 'center'; bg.textBaseline = 'middle'; bg.fillText('ARENA', 256, 68); add(new THREE.PlaneGeometry(14, 3.5), new THREE.MeshBasicMaterial({ map: T(bc) }), 0, 14, -28, g, { cast: false });
    const holo = []; for (const [x, c] of [[-5, '#fff4c8'], [0, '#c8e8ff'], [5, '#ffd0e8']]) { const cn = new THREE.Mesh(new THREE.CylinderGeometry(.3, 3.2, 20, 18, 1, true), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .16, depthWrite: false, side: THREE.DoubleSide })); cn.position.set(x, 10, -3); cn.userData.ndSkip = true; g.add(cn); holo.push(cn); }
    lista.arena = { g, raio: 5, chao: () => 0, state(S, f) { const t = f / 30; holo.forEach((c, i) => { c.rotation.z = Math.sin(t * .7 + i * 2) * .25; c.material.opacity = .14 + .05 * Math.sin(t * 2 + i); }); } }; }

  // ===================================== FLORESTA =====================================
  { const g = novo('floresta'), r = P.rng(181);
    const [gc, gg] = cv(512, 512); gg.fillStyle = '#4f8a3a'; gg.fillRect(0, 0, 512, 512); for (let i = 0; i < 300; i++) { gg.strokeStyle = ['#3f7a30', '#6aa84a', '#2f6a28'][i % 3]; gg.lineWidth = 3; gg.beginPath(); const x = r() * 512, y = r() * 512; gg.moveTo(x, y); gg.lineTo(x + (r() - .5) * 8, y - 10 - r() * 8); gg.stroke(); } gg.fillStyle = '#a8845a'; gg.beginPath(); gg.moveTo(200, 0); gg.bezierCurveTo(260, 140, 180, 300, 250, 512); gg.lineTo(330, 512); gg.bezierCurveTo(260, 300, 340, 140, 280, 0); gg.fill(); for (let i = 0; i < 40; i++) { gg.fillStyle = ['#ffd24a', '#ff8aa8', '#ffffff', '#b05aff'][i % 4]; gg.beginPath(); gg.arc(r() * 512, r() * 512, 3, 0, 7); gg.fill(); }
    piso(g, 80, 100, gc, 8, 10, -24);
    const tr = toon({ map: T(P.rocha(51, 28, 30, 34), 1, 3) }), pin = [toon({ color: '#2a6a3a' }), toon({ color: '#347a42' }), toon({ color: '#1f5a30' })], fol = [toon({ color: '#4fa24a' }), toon({ color: '#5fb454' }), toon({ color: '#3f8a3a' })];
    for (let i = 0; i < 40; i++) { const lado = i % 2 ? 1 : -1, x = lado * (3.5 + r() * 14), z = -3 - (i >> 1) * 1.7 - r() * 2, h = 8 + r() * 8; if (i % 3 === 0) { C(g, .35, .5, h * .5, tr, x, h * .25, z, 8); for (let k = 0; k < 4; k++) add(new THREE.ConeGeometry(2.8 - k * .5, h * .35, 10), pin[k % 3], x, h * .3 + k * h * .17, z, g); } else { C(g, .5, .75, h * .6, tr, x, h * .3, z, 9); for (let k = 0; k < 4; k++) S_(g, 2.6 + r() * 1.6, fol[(r() * 3) | 0], x + (r() - .5) * 3.5, h * .62 + k * .6, z + (r() - .5) * 3, 14, 10).scale.y = .8; } }
    for (let i = 0; i < 14; i++) { const x = (r() < .5 ? -1 : 1) * (2 + r() * 8), z = -2 - r() * 22; const g2 = new THREE.Group(); g2.position.set(x, 0, z); g.add(g2); if (i % 2) { C(g2, .1, .14, .5, toon({ color: '#f4f0e6' }), 0, .25, 0, 8); S_(g2, .4, toon({ color: '#d8322a' }), 0, .6, 0, 10, 8).scale.y = .6; S_(g2, .08, toon({ color: '#fff' }), .15, .75, .15, 6, 5); } else for (let k = 0; k < 5; k++) { const f = add(new THREE.ConeGeometry(.15, 1.2, 5), toon({ color: '#3a8a3a' }), 0, .5, 0, g2); f.rotation.set((k - 2) * .3, k * 1.2, (k - 2) * .35); } }
    const log = B(g, 3.6, .8, .8, tr, -2.6, .4, -5.5); log.rotation.y = .3; add(new THREE.CylinderGeometry(.4, .4, .02, 14), toon({ color: '#d8b888' }), -4.2, .4, -5.2, g).rotation.z = PI / 2;
    const rai = []; for (const [x, z, ry] of [[-2, -8, .1], [3, -13, -.12], [-6, -18, .2]]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.8, 3.2, 22, 16, 1, true), new THREE.MeshBasicMaterial({ color: '#fff3b0', transparent: true, opacity: .16, depthWrite: false, side: THREE.DoubleSide })); c.position.set(x, 11, z); c.rotation.z = ry; c.userData.ndSkip = true; g.add(c); rai.push(c); }
    const borb = []; for (let i = 0; i < 8; i++) { const w = new THREE.Group(); const wm = new THREE.MeshBasicMaterial({ color: ['#ffb43a', '#4aa8ff', '#ff6a8a'][i % 3], side: THREE.DoubleSide }); for (const sd of [-1, 1]) { const a = fant(new THREE.Mesh(new THREE.PlaneGeometry(.3, .24), wm)); a.position.x = sd * .15; a.userData.sd = sd; w.add(a); } w.userData.o = [i, 1 + (i % 3) * .8, 6 + i]; g.add(w); borb.push(w); }
    lista.floresta = { g, raio: 5, chao: () => 0, state(S, f) { const t = f / 30; rai.forEach((c, i) => { c.material.opacity = .13 + .05 * Math.sin(t * .7 + i * 2); }); borb.forEach((w) => { const [i, h, z] = w.userData.o, a = t * .5 + i * 1.7; w.position.set(Math.cos(a) * 4, h + Math.sin(a * 3) * .3, -z + Math.sin(a) * 3); w.children.forEach((c) => { c.rotation.z = c.userData.sd * Math.sin(t * 16 + i) * .9; }); }); } }; }
}
