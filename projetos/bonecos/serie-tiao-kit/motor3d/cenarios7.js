// cenarios7.js — PACOTE TREM (20/11/2026): pradaria_trilho, estacao_trem, nevasca, cabine_locomotiva, fim_tarde + objetos velocimetro, bolha_de_ar, caixa de madeira, bicicleta.
// Feito para modelar a referência "ciclista contra o trem" (ficha referencias/base/FICHA_trem-bike_BDhG_VplvzA.md). Mesmo jeito do pacote prédios: toon + tinta, nada facetado.
// Liga: worldAt -> { cenario: '<id>', <id>: { opções } } + luz('<id>'). Piso y=0; câmera geral = camCen(id,'geral'); bonecos em x≈±0,7, z≈0,4..0,9. Trilho corre no eixo X (visto de lado), eixo da via em z=0.
// Opções (todas opcionais; nada alocado por quadro):
//   pradaria_trilho { trem: 1|0 (padrão 1), tremX: 0.6 (x da traseira do último vagão; locomotiva fica à direita), longe: 0|1 (trem pequeno ao fundo, z -22),
//                     fumaca: 0..1, vento: 0..1 (linhas de vento na frente do trem), bolha: 0..1 (bolha de ar atrás da caixa), vel: 0..1 (ponteiro do velocímetro, 0=0 / 1=70 mph; velocimetro: 1|0 liga o objeto, padrão 0),
//                     tabuas: 1|0 (pista de tábua entre os trilhos, padrão 1), bike: 0|1 (bicicleta do Tião atrás da caixa, x = tremX-1,25), nuvens: 1|0 }
//   estacao_trem    { hora: 10.1 (ponteiros), cartaz: 'APOSTA R$ 1.000' (linha 2 da placa; linha 1 fixa '100 KM/H'), apito: 0..1 (vapor sobe da locomotiva ao fundo), caixa: 1|0 (caixa de madeira na plataforma) }
//   nevasca         { vento: 0..1 (cachecol/placa balança; pinheiros inclinam), (a neve caindo = worldAt.fx.chuva tipo 'neve') }
//   cabine_locomotiva { vel: 0..1 (paisagem passa na janela), alavanca: 0..1 (alavanca de freio sobe/desce), pressao: 0..1 (ponteiro do manômetro), fogo: 0..1 (brilho da fornalha) }
//   fim_tarde       { sol: 0..1 (altura do sol; padrão 0,35), ponto: 0..1 (trem vira um pontinho a x=-60 → 0..1 anda pro horizonte; padrão 0,6) }
export const TREM = ['pradaria_trilho', 'estacao_trem', 'nevasca', 'cabine_locomotiva', 'fim_tarde'];
export const CAMS7 = {
  pradaria_trilho: { traseira: { pos: [-2.2, 1.7, 3.6], look: [0.6, 1.2, 0], fov: 50 }, caixa: { pos: [-0.5, 1.15, 2.4], look: [0.15, 0.9, 0], fov: 40 }, mostrador: { pos: [-1.0, 1.5, 2.4], look: [-1.6, 1.3, 0.75], fov: 36 }, bike: { pos: [0.1, 1.4, 5.6], look: [0.1, 0.9, 0], fov: 58 }, trem: { pos: [5, 2.0, 9], look: [6, 1.4, 0], fov: 52 } },
  estacao_trem: { cartaz: { pos: [3.3, 2.1, 2.4], look: [3.7, 2.05, -1.5], fov: 42 } },
  cabine_locomotiva: { janela: { pos: [0.0, 1.5, 1.7], look: [0, 1.6, -2.3], fov: 46 } },
  fim_tarde: { horizonte: { pos: [0.2, 1.3, 4.6], look: [0, 1.5, -40], fov: 40 } },
};

export function construirTrem(X) {
  const { THREE, P, add, toon, cv, T, novo, lista } = X, PI = Math.PI;
  const MC = {}; const mc = (c) => (typeof c === 'string' ? (MC[c] ||= toon({ color: c })) : c);
  const bas = (o) => new THREE.MeshBasicMaterial({ fog: false, ...o });
  const semTinta = (m) => { m.userData.ndSkip = true; m.castShadow = false; return m; };
  const caixa = (g, w, h, d, cor, x, y, z, o) => add(new THREE.BoxGeometry(w, h, d), mc(cor), x, y + h / 2, z, g, o);
  const cil = (g, rt, rb, h, cor, x, y, z, o, seg = 22) => add(new THREE.CylinderGeometry(rt, rb, h, seg), mc(cor), x, y + h / 2, z, g, o);
  const texto = (w, h, fn) => { const [c, a] = cv(w, h); fn(a, w, h); return c; };
  const escreve = (a, s, x, y, maxW, px, cor, peso = 'bold') => { let p = px; a.font = `${peso} ${p}px sans-serif`; while (a.measureText(s).width > maxW && p > 10) { p -= 2; a.font = `${peso} ${p}px sans-serif`; }
    a.fillStyle = cor; a.textAlign = 'center'; a.textBaseline = 'middle'; a.fillText(s, x, y); };
  const nuvens = (g, lst, cor = '#ffffff') => { const m = bas({ color: cor }), out = []; for (const [x, y, z, s] of lst) for (let k = 0; k < 3; k++) {
    const n = add(new THREE.SphereGeometry(1, 14, 10), m, x + (k - 1) * s * 1.1, y + (k === 1 ? s * 0.35 : 0), z, g, { cast: false }); n.scale.set(s * 1.3, s * 0.55, s * 0.7); semTinta(n); out.push(n); } return out; };
  // chão de grama (textura pintada, UV em metros) / neve
  const solo = (g, base, pint, seed, t = 40, z0 = 0, ext = 400) => { const r = P.rng(seed), c = texto(256, 256, (a) => { a.fillStyle = base; a.fillRect(0, 0, 256, 256); for (let i = 0; i < 320; i++) { a.fillStyle = pint[(r() * pint.length) | 0]; a.globalAlpha = 0.5; a.beginPath(); a.ellipse(r() * 256, r() * 256, 3 + r() * 9, 1.5 + r() * 3, 0, 0, 7); a.fill(); } a.globalAlpha = 1; });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(ext, ext), toon({ map: T(c, ext / t, ext / t) })); m.rotation.x = -PI / 2; m.position.set(0, 0, z0); m.receiveShadow = true; semTinta(m); m.castShadow = false; g.add(m); return m; };
  const morros = (g, lst) => { for (const [x, z, r, h, cor] of lst) { const m = add(new THREE.SphereGeometry(r, 24, 14), mc(cor), x, -r + h, z, g, { cast: false }); semTinta(m); } };
  const poste = (g, x, z, h = 4.2) => { cil(g, 0.07, 0.09, h, '#6b4a2a', x, 0, z, { cast: false }, 10); caixa(g, 1.1, 0.07, 0.07, '#6b4a2a', x, h - 0.25, z, { cast: false }); caixa(g, 0.8, 0.06, 0.06, '#6b4a2a', x, h - 0.7, z, { cast: false }); };
  // texturas pequenas
  const texTabua = (a, b, seed) => { const r = P.rng(seed); return texto(256, 256, (c) => { c.fillStyle = a; c.fillRect(0, 0, 256, 256); for (let y = 0; y < 256; y += 64) { c.fillStyle = b; c.fillRect(0, y, 256, 4); c.fillStyle = 'rgba(0,0,0,.12)'; for (let k = 0; k < 6; k++) c.fillRect(r() * 256, y + 8 + r() * 46, 30 + r() * 60, 2); } }); };

  // ===== objetos reutilizáveis =====
  // vagão de carga com caixa de madeira parafusada atrás; o grupo fica com a traseira em x=0 e corre para +x; eixo da via z=0.
  const vagao = (g, x0, comp = 2.6, comCaixa = true) => { const V = new THREE.Group(); V.position.set(x0, 0, 0); g.add(V);
    caixa(V, comp, 0.18, 1.1, '#3a3a40', comp / 2, 0.38, 0, {});                       // chassi
    caixa(V, comp - 0.1, 1.15, 1.0, '#8c3a2a', comp / 2, 0.55, 0, {});                  // corpo vermelho-tijolo
    caixa(V, comp + 0.1, 0.1, 1.15, '#4a2a22', comp / 2, 1.7, 0, {});                   // teto
    for (const dx of [0.45, comp - 0.45]) for (const dz of [0.57, -0.57]) { const w = cil(V, 0.3, 0.3, 0.12, '#222228', dx, 0.3, dz, {}, 20); w.rotation.x = PI / 2; w.position.y = 0.3; w.position.z = dz; caixa(V, 0.08, 0.08, 0.14, '#b8b8c0', dx, 0.26, dz, { cast: false }); }
    if (comCaixa) { const c = new THREE.Group(); c.position.set(-0.45, 0, 0); V.add(c); caixa(c, 0.8, 0.62, 0.76, '#b98a4e', 0, 0.58, 0, {});   // caixa de madeira (plataforma traseira)
      caixa(c, 0.86, 0.06, 0.82, '#8a5e30', 0, 1.2, 0, {}); for (const dy of [0.7, 1.0]) caixa(c, 0.84, 0.05, 0.8, '#8a5e30', 0, dy, 0, { cast: false });
      for (const [bx, by] of [[-0.3, 0.7], [0.3, 0.7], [-0.3, 1.05], [0.3, 1.05]]) { const p = cil(c, 0.035, 0.035, 0.04, '#d8d8e0', bx, by, 0.39, { cast: false }, 10); p.rotation.x = PI / 2; }
      caixa(c, 1.0, 0.05, 0.9, '#5a3a22', 0.1, 0.42, 0, {}); }                                // plataforma sob a caixa
    return V; };
  const locomotiva = (g, x0) => { const L = new THREE.Group(); L.position.set(x0, 0, 0); g.add(L);
    caixa(L, 4.2, 0.2, 1.15, '#2a2a30', 2.1, 0.4, 0, {});
    const cal = cil(L, 0.55, 0.55, 2.4, '#2f6b4a', 2.9, 0.62, 0, {}, 28); cal.rotation.z = PI / 2; cal.position.set(2.9, 1.12, 0);
    const bocal = cil(L, 0.5, 0.5, 0.1, '#1a1a1e', 4.15, 0.7, 0, {}, 28); bocal.rotation.z = PI / 2; bocal.position.set(4.15, 1.12, 0);
    cil(L, 0.14, 0.2, 0.7, '#1a1a1e', 3.7, 1.45, 0, {}, 16); cil(L, 0.28, 0.14, 0.2, '#1a1a1e', 3.7, 2.1, 0, {}, 16);   // chaminé
    cil(L, 0.2, 0.2, 0.3, '#d8b04a', 2.8, 1.65, 0, {}, 16);                                                          // cúpula de vapor
    caixa(L, 1.3, 1.5, 1.15, '#2f6b4a', 0.7, 0.5, 0, {}); caixa(L, 1.5, 0.1, 1.3, '#1d4a32', 0.7, 2.0, 0, {});     // cabine
    caixa(L, 0.5, 0.45, 0.04, '#bfe6ff', 0.55, 1.35, 0.58, { cast: false }); caixa(L, 0.5, 0.45, 0.04, '#bfe6ff', 0.55, 1.35, -0.58, { cast: false });
    for (const dx of [0.5, 1.5, 2.3, 3.1]) for (const dz of [0.6, -0.6]) { const w = cil(L, dx < 1.4 ? 0.5 : 0.36, dx < 1.4 ? 0.5 : 0.36, 0.12, '#b8483a', dx, 0.5, dz, {}, 24); w.rotation.x = PI / 2; w.position.set(dx, dx < 1.4 ? 0.5 : 0.36, dz); }
    const cow = add(new THREE.ConeGeometry(0.55, 0.9, 4), mc('#2a2a30'), 4.45, 0.5, 0, L); cow.rotation.z = -PI / 2; cow.rotation.y = PI / 4;
    return L; };
  // velocímetro (mostrador de ponteiro 0–70 mph, ~0,95 m, base e suporte; voltado para +z)
  const velocimetro = (g) => { const G = new THREE.Group(); g.add(G);
    const face = texto(512, 512, (a) => { a.fillStyle = '#f5ecd2'; a.beginPath(); a.arc(256, 256, 250, 0, 7); a.fill(); a.strokeStyle = '#3a2a1a'; a.lineWidth = 8; a.stroke(); a.fillStyle = '#2a1a10'; a.strokeStyle = '#2a1a10';
      for (let i = 0; i <= 14; i++) { const ang = PI * 0.75 + (i / 14) * PI * 1.5, big = i % 2 === 0, r0 = big ? 190 : 205; a.lineWidth = big ? 8 : 4; a.beginPath(); a.moveTo(256 + Math.cos(ang) * r0, 256 + Math.sin(ang) * r0); a.lineTo(256 + Math.cos(ang) * 232, 256 + Math.sin(ang) * 232); a.stroke();
        if (big) { a.font = 'bold 40px sans-serif'; a.textAlign = 'center'; a.textBaseline = 'middle'; a.fillText(String(i * 5), 256 + Math.cos(ang) * 160, 256 + Math.sin(ang) * 160); } }
      a.fillStyle = '#b8483a'; a.beginPath(); a.arc(256, 256, 20, 0, 7); a.fill(); escreve(a, 'MPH', 256, 330, 140, 38, '#6b4a2a'); });
    cil(G, 0.05, 0.08, 0.9, '#6b4a2a', 0, 0, 0, {}, 10);
    const aro = add(new THREE.CylinderGeometry(0.5, 0.5, 0.09, 36), mc('#d8b04a'), 0, 1.35, 0, G); aro.rotation.x = PI / 2;
    const fc = new THREE.Mesh(new THREE.CircleGeometry(0.46, 36), bas({ map: T(face) })); fc.position.set(0, 1.35, 0.052); semTinta(fc); G.add(fc);
    const agulha = new THREE.Group(); agulha.position.set(0, 1.35, 0.07); G.add(agulha); const ag = add(new THREE.BoxGeometry(0.03, 0.4, 0.015), mc('#b8301f'), 0, 0.19, 0, agulha, { cast: false }); ag.userData.ndSkip = true;
    G.userData.set = (k) => { agulha.rotation.z = -(-PI * 0.75 + k * PI * 1.5) + PI; /* 0 = canto inferior esquerdo */ agulha.rotation.z = PI * 0.75 - k * PI * 1.5 + PI - PI; agulha.rotation.z = -(PI * 0.75) + PI + 0 - k * PI * 1.5 + PI * 0.0; };
    return G; };
  // bicicleta de lado (eixo x), pé no chão em y=0, corpo para +x; ~1,4 m
  const bicicleta = (g, cor = '#d84a3a') => { const B = new THREE.Group(); g.add(B);
    for (const x of [-0.55, 0.55]) { const r = add(new THREE.TorusGeometry(0.34, 0.03, 10, 28), mc('#1a1a1e'), x, 0.36, 0, B); r.userData.roda = 1; for (let k = 0; k < 3; k++) { const rr = add(new THREE.BoxGeometry(0.02, 0.66, 0.015), mc('#cfd0d8'), x, 0.36, 0, B, { cast: false }); rr.rotation.z = k * PI / 3; } }
    const tubo = (ax, ay, bx, by, r = 0.028) => { const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy), m = add(new THREE.CylinderGeometry(r, r, L, 10), mc(cor), (ax + bx) / 2, (ay + by) / 2, 0, B); m.rotation.z = Math.atan2(dx, -dy) + PI; };
    tubo(-0.55, 0.36, -0.1, 0.38); tubo(-0.1, 0.38, 0.4, 0.74); tubo(-0.55, 0.36, -0.12, 0.78); tubo(-0.12, 0.78, 0.4, 0.74); tubo(-0.1, 0.38, -0.12, 0.78); tubo(0.4, 0.74, 0.55, 0.36); tubo(0.4, 0.74, 0.34, 0.9);
    caixa(B, 0.3, 0.05, 0.12, '#2a2a30', -0.14, 0.78, 0, {}); caixa(B, 0.05, 0.05, 0.4, '#2a2a30', 0.34, 0.9, 0, {}); cil(B, 0.05, 0.05, 0.1, '#2a2a30', -0.1, 0.34, 0, {}, 12).rotation.z = PI / 2;
    return B; };
  // bolha de ar: casca translúcida (esfera achatada) + 3 anéis de vento; centro na origem do grupo
  const bolha = (g) => { const G = new THREE.Group(); g.add(G);
    const s = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18), bas({ color: '#bfe8ff', transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide })); s.scale.set(1.5, 1.05, 0.9); semTinta(s); G.add(s);
    const borda = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 8, 56), bas({ color: '#e6f7ff', transparent: true, opacity: 0.7 })); borda.scale.set(1.5, 1.05, 1); semTinta(borda); G.add(borda);
    G.userData.set = (k, t) => { G.visible = k > 0.01; G.scale.setScalar(Math.max(0.01, k) * (1 + 0.02 * Math.sin(t * 7))); };
    return G; };

  // =====================================================================================
  // 1) PRADARIA COM TRILHO — grama, via férrea no eixo X, trem (vagão com caixa + locomotiva), postes, morros, nuvens
  // =====================================================================================
  {
    const g = novo('pradaria_trilho');
    solo(g, '#6db55a', ['#5aa04a', '#86c868', '#7ab85a'], 7, 30);
    morros(g, [[-40, -70, 38, 10, '#5f9a52'], [20, -90, 50, 14, '#4f8a4a'], [75, -80, 40, 9, '#6aa85a'], [-90, -100, 55, 16, '#478045']]);
    const bal = caixa(g, 400, 0.14, 2.2, '#b8a888', 0, 0, 0, { cast: false }); semTinta(bal);                       // lastro
    const dorm = texTabua('#6b4a2a', '#4a3220', 3); const mdorm = toon({ map: T(dorm, 1, 1) });
    for (let x = -60; x < 80; x += 0.8) caixa(g, 0.22, 0.12, 1.9, mdorm, x, 0.07, 0, { cast: false });                 // dormentes
    for (const z of [0.42, -0.42]) caixa(g, 400, 0.1, 0.07, '#7a7a86', 0, 0.2, z, { cast: false });                    // trilhos
    const tab = caixa(g, 400, 0.04, 0.6, '#c89a5a', 0, 0.2, 0, { cast: false }); const tabM = toon({ map: T(texTabua('#c89a5a', '#8a6232', 9), 200, 1) }); tab.material = tabM; tab.scale.x = 1;
    for (let x = -30; x < 40; x += 12) poste(g, x, -4);
    const nv = nuvens(g, [[-12, 14, -45, 4], [8, 18, -60, 5], [30, 12, -50, 4], [-30, 20, -70, 6]], '#ffffff');
    const trem = new THREE.Group(); g.add(trem);
    const cars = [vagao(trem, 0, 2.6, true), vagao(trem, 2.8, 2.6, false)], loc = locomotiva(trem, 5.6);
    const vagoes = trem.children.slice();
    const fumo = []; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 9), bas({ color: '#f4f4f8', transparent: true, opacity: 0.7, depthWrite: false })); semTinta(m); g.add(m); fumo.push(m); }
    const vento = []; for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.03, 0.03), bas({ color: '#ffffff', transparent: true, opacity: 0.85 })); semTinta(m); g.add(m); vento.push(m); }
    const bk = bicicleta(g), bh = bolha(g), vm = velocimetro(g); vm.position.set(-1.9, 0, 0.75); vm.scale.setScalar(0.9);
    bk.userData.rodas = []; bk.traverse((o) => { if (o.userData.roda) bk.userData.rodas.push(o); });
    lista.pradaria_trilho = { g, chao: () => 0, state(S, f) { const B = S.pradaria_trilho || {}, t = f / 30, x0 = B.tremX ?? 0.6, longe = !!B.longe;
        trem.visible = (B.trem ?? 1) > 0; trem.position.set(longe ? -4 + x0 : x0, 0, longe ? -22 : 0); trem.scale.setScalar(longe ? 0.8 : 1);
        tab.visible = (B.tabuas ?? 1) > 0; bk.visible = !!B.bike; bk.position.set(x0 - 1.35, 0, 0.0); bk.userData.rodas.forEach((r) => { r.rotation.z = -x0 * 1.2 - t * 6 * (B.bike ? 1 : 0); });
        nv.forEach((n, i) => { n.position.x += 0; n.visible = (B.nuvens ?? 1) > 0; });
        const fk = B.fumaca ?? 0.7; fumo.forEach((m, i) => { const u = ((t * 0.5 + i / 8) % 1), cx = trem.position.x + 5.6 + 3.7, cz = trem.position.z; m.visible = fk > 0.02 && trem.visible; m.scale.setScalar((0.25 + u * 0.9) * (0.4 + fk)); m.position.set(cx - u * 4.2 * (longe ? 1 : 1.3), 2.3 * trem.scale.y + u * 1.6, cz); m.material.opacity = 0.7 * (1 - u) * Math.min(1, fk + 0.3); });
        const vk = B.vento ?? 0; vento.forEach((m, i) => { const u = ((t * 1.8 + i * 0.37) % 1); m.visible = vk > 0.02; m.position.set(x0 + 1.5 + (i % 4) * 0.5 - u * 2.6, 0.45 + (i % 3) * 0.42 + (i * 0.13 % 0.3), 0.7 + (i % 2) * 0.25); m.scale.x = 0.5 + vk; m.material.opacity = 0.85 * (1 - u); });
        bh.position.set(x0 - 0.9, 0.82, 0); bh.userData.set(B.bolha ?? 0, t);
        vm.visible = !!B.velocimetro; vm.position.x = x0 - 2.2; vm.userData.agulha = vm.userData.agulha; vm.children[vm.children.length - 1].rotation.z = PI * 0.75 - (B.vel ?? 0) * PI * 1.5; } };
  }

  // =====================================================================================
  // 2) ESTAÇÃO DE TREM — plataforma de madeira, telhado, relógio, placa-cartaz, bancos, locomotiva ao fundo
  // =====================================================================================
  {
    const g = novo('estacao_trem');
    solo(g, '#d8b878', ['#c8a868', '#e6c88a'], 11, 30);
    morros(g, [[-60, -80, 40, 10, '#7aa862'], [40, -95, 50, 13, '#6a9a58']]);
    const madeira = toon({ map: T(texTabua('#b8814a', '#7a4f28', 5), 6, 3) });
    caixa(g, 16, 0.12, 5, madeira, 0, 0, -1.5, { cast: false }).position.y = 0.06;                                         // deck de tábuas em y=0 (piso útil)
    // prédio da estação ao fundo
    caixa(g, 11, 3.0, 0.3, '#c2563c', 0, 0, -4.3, {}); caixa(g, 11.6, 0.3, 1.2, '#7a2f22', 0, 3.0, -4.0, {});
    for (const x of [-3.6, 3.6]) { caixa(g, 1.4, 1.5, 0.08, '#f2d98a', x, 1.0, -4.12, { cast: false }); caixa(g, 1.5, 0.08, 0.1, '#5a3a22', x, 1.45, -4.12, { cast: false }); }
    caixa(g, 1.3, 2.3, 0.12, '#4a2f1e', 0, 0, -4.12, {});                                                                    // porta
    // telhado sobre pilares na frente
    for (const x of [-5.2, 5.2]) cil(g, 0.12, 0.12, 3.1, '#5a3a22', x, 0, -2.2, {}, 12);
    caixa(g, 11.4, 0.18, 2.4, '#7a2f22', 0, 3.1, -3.2, { cast: false }); caixa(g, 11.4, 0.5, 0.1, '#5a2018', 0, 2.6, -2.0, { cast: false });
    // relógio redondo no beiral
    const rel = new THREE.Group(); rel.position.set(0, 2.75, -2.0); g.add(rel);
    const rf = texto(256, 256, (a) => { a.fillStyle = '#fff6dc'; a.beginPath(); a.arc(128, 128, 120, 0, 7); a.fill(); a.strokeStyle = '#3a2a1a'; a.lineWidth = 10; a.stroke(); a.fillStyle = '#2a1a10';
      for (let i = 0; i < 12; i++) { const ang = i * PI / 6; a.fillRect(128 + Math.sin(ang) * 98 - 3, 128 - Math.cos(ang) * 98 - 3, 6, 6); } });
    const rfm = new THREE.Mesh(new THREE.CircleGeometry(0.34, 32), bas({ map: T(rf) })); rfm.position.z = 0.07; semTinta(rfm); rel.add(rfm); add(new THREE.CylinderGeometry(0.36, 0.36, 0.1, 32), mc('#d8b04a'), 0, 0, 0.03, rel).rotation.x = PI / 2;
    const hH = add(new THREE.BoxGeometry(0.035, 0.18, 0.01), mc('#1a1a1e'), 0, 0.09, 0.09, rel, { cast: false }), hM = add(new THREE.BoxGeometry(0.025, 0.27, 0.01), mc('#1a1a1e'), 0, 0.135, 0.1, rel, { cast: false });
    for (const h of [hH, hM]) { const p = new THREE.Group(); p.position.copy(h.position); h.position.set(0, h.position.y, 0); rel.add(p); p.add(h); h.parent = p; if (h === hH) rel.userData.pH = p; else rel.userData.pM = p; }
    // placa-cartaz (objeto real; só 2 linhas curtas) em poste à direita
    const cart = { c: null, t: null }; const [cc, ca] = cv(512, 320); const ct = T(cc, 1, 1);
    cart.pintar = (linha2) => { ca.fillStyle = '#f2e2a8'; ca.fillRect(0, 0, 512, 320); ca.strokeStyle = '#5a3a22'; ca.lineWidth = 14; ca.strokeRect(7, 7, 498, 306); escreve(ca, '100 KM/H', 256, 105, 440, 110, '#b8301f'); escreve(ca, linha2, 256, 225, 440, 74, '#3a2a1a'); ct.needsUpdate = true; };
    cart.pintar('APOSTA R$ 1.000'); cart.t = 'APOSTA R$ 1.000';
    cil(g, 0.06, 0.06, 2.5, '#5a3a22', 2.9, 0, -1.5, {}, 10); cil(g, 0.06, 0.06, 2.5, '#5a3a22', 4.5, 0, -1.5, {}, 10);
    const pl = add(new THREE.BoxGeometry(1.9, 1.2, 0.08), mc('#6b4a2a'), 3.7, 2.05, -1.5, g); const pm = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.06), bas({ map: ct })); pm.position.set(0, 0, 0.05); semTinta(pm); pl.add(pm);
    // banco e malas
    caixa(g, 1.5, 0.1, 0.45, '#8a5a30', -3.2, 0.45, -3.4, {}); caixa(g, 1.5, 0.5, 0.06, '#8a5a30', -3.2, 0.5, -3.62, {}); for (const dx of [-0.65, 0.65]) caixa(g, 0.08, 0.45, 0.4, '#3a3a40', -3.2 + dx, 0, -3.4, { cast: false });
    caixa(g, 0.55, 0.38, 0.32, '#7a4a28', -1.8, 0, -3.3, {}); caixa(g, 0.4, 0.3, 0.28, '#a04a30', -1.3, 0, -3.3, {});
    const cx = new THREE.Group(); cx.position.set(1.6, 0, -2.6); g.add(cx); caixa(cx, 0.8, 0.62, 0.76, '#b98a4e', 0, 0, 0, {}); caixa(cx, 0.86, 0.06, 0.82, '#8a5e30', 0, 0.62, 0, {});
    // via e locomotiva ao fundo (z -8), com vapor
    for (const z of [-7.6, -8.4]) caixa(g, 300, 0.1, 0.07, '#7a7a86', 0, 0.12, z, { cast: false });
    for (let x = -40; x < 40; x += 0.8) caixa(g, 0.22, 0.1, 1.8, '#4a3220', x, 0, -8, { cast: false });
    const lo = locomotiva(g, -9); lo.position.z = -8; lo.scale.setScalar(1.15);
    const vap = []; for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 9), bas({ color: '#f4f4f8', transparent: true, opacity: 0.7, depthWrite: false })); semTinta(m); g.add(m); vap.push(m); }
    lista.estacao_trem = { g, chao: () => 0, state(S, f) { const B = S.estacao_trem || {}, t = f / 30, h = B.hora ?? 10.1;
        rel.userData.pM.rotation.z = -((h % 1) * 2 * PI); rel.userData.pH.rotation.z = -((h % 12) / 12 * 2 * PI);
        const txt = B.cartaz || 'APOSTA R$ 1.000'; if (txt !== cart.t) { cart.pintar(txt); cart.t = txt; }
        cx.visible = (B.caixa ?? 1) > 0; const k = B.apito ?? 0; vap.forEach((m, i) => { const u = ((t * 0.8 + i / 6) % 1); m.visible = k > 0.02; m.scale.setScalar((0.3 + u * 1.1) * (0.4 + k)); m.position.set(-9 + 4.8 * 1.15 + u * 0.6, 2.9 + u * 2.2, -8); m.material.opacity = 0.7 * (1 - u) * Math.min(1, k + 0.3); }); } };
  }

  // =====================================================================================
  // 3) NEVASCA — rua nevada, pinheiros, casas, lampiões, bancos de neve (a neve caindo vem de worldAt.fx.chuva tipo 'neve')
  // =====================================================================================
  {
    const g = novo('nevasca');
    solo(g, '#eef4fb', ['#dfe9f6', '#ffffff', '#cfdcee'], 21, 30);
    morros(g, [[-50, -70, 40, 10, '#d8e4f2'], [30, -85, 52, 14, '#cbd9ec'], [80, -75, 36, 9, '#e0eaf6']]);
    const pinheiro = (x, z, s = 1) => { const G = new THREE.Group(); G.position.set(x, 0, z); G.scale.setScalar(s); g.add(G); cil(G, 0.14, 0.18, 0.7, '#6b4a2a', 0, 0, 0, { cast: false }, 10);
      for (let i = 0; i < 4; i++) { const r = 1.3 - i * 0.28, c = add(new THREE.ConeGeometry(r, 1.3, 20), mc(i % 2 ? '#2f6a52' : '#265a46'), 0, 1.0 + i * 0.75, 0, G, { cast: false }); const nv = add(new THREE.ConeGeometry(r * 0.78, 0.55, 20), mc('#f6faff'), 0, 1.25 + i * 0.75, 0, G, { cast: false }); nv.scale.set(1.04, 1, 1.04); }
      return G; };
    const pin = [[-4.8, -3.4, 1.2], [-6.5, -6, 1.5], [5.2, -3.8, 1.3], [7, -7, 1.6], [-9, -9, 1.7], [10, -11, 1.8], [-2.4, -12, 1.5], [3.6, -14, 1.6]].map(([x, z, s]) => pinheiro(x, z, s));
    const casa = (x, z, w, cor, tel) => { caixa(g, w, 2.4, 2.4, cor, x, 0, z, {}); const t = add(new THREE.CylinderGeometry(0.01, w * 0.78, 1.3, 4), mc(tel), x, 3.0, z, g, { cast: false }); t.rotation.y = PI / 4; t.scale.z = 1.1; const nv = add(new THREE.CylinderGeometry(0.01, w * 0.7, 0.4, 4), mc('#f6faff'), x, 3.3, z, g, { cast: false }); nv.rotation.y = PI / 4;
      caixa(g, 0.5, 0.55, 0.06, '#ffd76a', x - w * 0.22, 1.1, z + 1.23, { cast: false }); caixa(g, 0.5, 0.55, 0.06, '#ffd76a', x + w * 0.22, 1.1, z + 1.23, { cast: false }); caixa(g, 0.55, 1.2, 0.07, '#5a3a22', x, 0, z + 1.22, { cast: false }); };
    casa(-5.4, -10, 3.4, '#b8644a', '#7a3f2e'); casa(4.6, -12, 3.8, '#6a8aa8', '#3f5470'); casa(-1.0, -18, 4.2, '#c8a668', '#7a5a38');
    const lamp = (x, z) => { cil(g, 0.05, 0.07, 2.9, '#2a2a30', x, 0, z, { cast: false }, 10); caixa(g, 0.28, 0.34, 0.28, '#fff2b0', x, 2.9, z, { cast: false }); caixa(g, 0.36, 0.06, 0.36, '#2a2a30', x, 3.24, z, { cast: false }); };
    lamp(-2.8, -4); lamp(3.0, -6);
    for (const [x, z, s] of [[-2.0, -1.6, 1], [3.4, -2.4, 1.3], [-4.2, -2.2, 0.9], [0.6, -3.6, 1.1]]) { const m = add(new THREE.SphereGeometry(0.8 * s, 20, 12), mc('#fafcff'), x, 0.1, z, g, { cast: false }); m.scale.set(1.6, 0.55, 1); }   // bancos de neve
    caixa(g, 1.5, 0.08, 0.4, '#8a5a30', 1.8, 0.45, -3.3, {}); caixa(g, 1.5, 0.45, 0.06, '#8a5a30', 1.8, 0.5, -3.5, {}); caixa(g, 1.6, 0.1, 0.5, '#fafcff', 1.8, 0.53, -3.3, { cast: false });
    lista.nevasca = { g, chao: () => 0, state(S, f) { const B = S.nevasca || {}, t = f / 30, v = B.vento ?? 0.5; pin.forEach((p, i) => { p.rotation.z = 0.04 * v * Math.sin(t * 1.6 + i); }); } };
  }

  // =====================================================================================
  // 4) CABINE DA LOCOMOTIVA — cabine verde, caldeira com manômetros, fornalha, alavancas, janela com paisagem passando
  // =====================================================================================
  {
    const g = novo('cabine_locomotiva');
    const assoalho = toon({ map: T(texTabua('#5a3a24', '#3a2414', 14), 5, 5) });
    caixa(g, 7, 0.1, 12, assoalho, 0, 0, 1.6, { cast: false });
    const paineis = toon({ map: T(texTabua('#3f8a60', '#2a6a46', 15), 4, 2) });
    caixa(g, 7, 4, 0.2, paineis, 0, 0, 1.6, { cast: false });                                                                 // parede atrás da câmera? mantida longe (z 1,6) p/ não entrar no quadro
    g.children[g.children.length - 1].visible = false;
    caixa(g, 0.2, 3.6, 12, paineis, -3.5, 0, 1.6, {}); caixa(g, 0.2, 3.6, 12, paineis, 3.5, 0, 1.6, {});                     // paredes laterais (vidros vazados)
    // parede da frente (fundo) com janela central: 4 caixas em volta do vão
    const zf = -4.2; caixa(g, 7, 1.0, 0.25, paineis, 0, 0, zf, {}); caixa(g, 7, 1.0, 0.25, paineis, 0, 2.6, zf, {}); caixa(g, 1.7, 1.6, 0.25, paineis, -2.65, 1.0, zf, {}); caixa(g, 1.7, 1.6, 0.25, paineis, 2.65, 1.0, zf, {});
    caixa(g, 7, 0.14, 12, '#3f8a60', 0, 3.6, 1.6, { cast: false });                                                            // teto
    for (const [x, w] of [[-1.85, 0.12], [1.85, 0.12]]) caixa(g, w, 1.6, 0.3, '#d8b04a', x, 1.0, zf + 0.05, { cast: false });
    caixa(g, 3.8, 0.12, 0.3, '#d8b04a', 0, 2.52, zf + 0.05, { cast: false }); caixa(g, 3.8, 0.12, 0.3, '#d8b04a', 0, 0.96, zf + 0.05, { cast: false });
    // paisagem que passa (plano atrás da janela, textura em loop)
    const pc = texto(1024, 256, (a) => { const gr = a.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#79b8ee'); gr.addColorStop(0.5, '#cfe8fa'); gr.addColorStop(0.52, '#7cc060'); gr.addColorStop(1, '#4f9a44'); a.fillStyle = gr; a.fillRect(0, 0, 1024, 256);
      const r = P.rng(33); a.fillStyle = '#5f9a52'; a.beginPath(); a.moveTo(0, 140); for (let x = 0; x <= 1024; x += 32) a.lineTo(x, 130 + Math.sin(x * 0.01) * 12); a.lineTo(1024, 150); a.lineTo(0, 150); a.fill();
      for (let i = 0; i < 18; i++) { const x = (i + r() * 0.6) * 57, s = 14 + r() * 10; a.fillStyle = '#6b4a2a'; a.fillRect(x - 2, 150, 4, 24); a.fillStyle = '#2f7a40'; a.beginPath(); a.arc(x, 146, s, 0, 7); a.fill(); }
      for (let x = 0; x < 1024; x += 64) { a.fillStyle = 'rgba(255,255,255,.35)'; a.fillRect(x, 180, 40, 3); a.fillRect(x + 20, 210, 30, 3); } });
    const pt = T(pc, 1, 1); pt.wrapS = THREE.RepeatWrapping; const pais = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.5), bas({ map: pt })); pais.position.set(0, 1.85, zf - 1.5); semTinta(pais); g.add(pais);
    // caldeira (parede frontal baixa à frente) com manômetros e porta da fornalha
    const cald = cil(g, 0.9, 0.9, 2.2, '#3a3a40', 0, 0.9, -3.3, {}, 32); cald.rotation.x = PI / 2; cald.position.set(0, 1.0, -3.4);
    const fornalha = caixa(g, 1.0, 0.9, 0.12, '#1a1a1e', 0, 0.2, -2.35, {}); const brasa = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.48), bas({ color: '#ff8a2a', transparent: true, opacity: 0.9 })); brasa.position.set(0, 0.65, -2.28); semTinta(brasa); g.add(brasa);
    const brilho = new THREE.Mesh(new THREE.CircleGeometry(1.8, 24), bas({ color: '#ff9a40', transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false })); brilho.position.set(0, 0.7, -2.2); semTinta(brilho); g.add(brilho);
    const mano = (x, y) => { const G = new THREE.Group(); G.position.set(x, y, -2.25); g.add(G); add(new THREE.CylinderGeometry(0.24, 0.24, 0.1, 28), mc('#d8b04a'), 0, 0, 0, G).rotation.x = PI / 2;
      const f = texto(128, 128, (a) => { a.fillStyle = '#f5ecd2'; a.beginPath(); a.arc(64, 64, 62, 0, 7); a.fill(); a.strokeStyle = '#2a1a10'; a.lineWidth = 3; for (let i = 0; i <= 10; i++) { const ang = PI * 0.75 + i / 10 * PI * 1.5; a.beginPath(); a.moveTo(64 + Math.cos(ang) * 48, 64 + Math.sin(ang) * 48); a.lineTo(64 + Math.cos(ang) * 58, 64 + Math.sin(ang) * 58); a.stroke(); } });
      const m = new THREE.Mesh(new THREE.CircleGeometry(0.21, 24), bas({ map: T(f) })); m.position.z = 0.055; semTinta(m); G.add(m);
      const p = new THREE.Group(); p.position.z = 0.07; G.add(p); add(new THREE.BoxGeometry(0.018, 0.17, 0.01), mc('#b8301f'), 0, 0.075, 0, p, { cast: false }); return p; };
    const ponteiros = [mano(-0.55, 1.75), mano(0.55, 1.75)];
    // alavancas (freio e acelerador)
    const alav = (x, cor) => { const G = new THREE.Group(); G.position.set(x, 0.1, -2.1); g.add(G); caixa(G, 0.3, 0.14, 0.2, '#2a2a30', 0, 0, 0, {}); const h = new THREE.Group(); h.position.y = 0.14; G.add(h); cil(h, 0.03, 0.03, 1.1, '#cfd0d8', 0, 0, 0, {}, 10); add(new THREE.SphereGeometry(0.08, 14, 10), mc(cor), 0, 1.15, 0, h); return h; };
    const aFreio = alav(-1.5, '#b8301f'), aAcel = alav(1.5, '#2a8a3c');
    for (const x of [-1.2, 1.2]) cil(g, 0.04, 0.04, 2.0, '#d8b04a', x, 1.4, -3.9, { cast: false }, 10);                           // canos de latão
    lista.cabine_locomotiva = { g, chao: () => 0, state(S, f) { const B = S.cabine_locomotiva || {}, t = f / 30, v = B.vel ?? 0.5;
        pt.offset.x = -(t * v * 0.35) % 1; ponteiros.forEach((p, i) => { p.rotation.z = PI * 0.75 - (i ? 0.5 + 0.3 * v : (B.pressao ?? 0.6)) * PI * 1.5 + 0.02 * Math.sin(t * 9 + i); });
        aFreio.rotation.z = (B.alavanca ?? 0) * -0.6 + 0.3; aAcel.rotation.z = -0.1 - v * 0.5; brasa.material.opacity = 0.7 + 0.2 * Math.sin(t * 12); brilho.material.opacity = (B.fogo ?? 0.35) * (0.8 + 0.2 * Math.sin(t * 11)); } };
  }

  // =====================================================================================
  // 5) FIM DE TARDE — campo aberto, sol baixo, trilhos em perspectiva fugindo ao horizonte, trem virando um ponto, postes
  // =====================================================================================
  {
    const g = novo('fim_tarde');
    solo(g, '#b8a050', ['#a8903f', '#c8b060', '#9a8a3a'], 31, 30);
    morros(g, [[-70, -120, 60, 8, '#8a6a3a'], [50, -130, 70, 10, '#7a5a34'], [0, -160, 80, 6, '#6a4a30']]);
    const dormM = toon({ map: T(texTabua('#5a3a22', '#3a2414', 3), 1, 1) });
    for (let z = 4; z > -200; z -= 0.9) caixa(g, 1.9, 0.12, 0.22, dormM, 0, 0.07, z, { cast: false });                       // dormentes (via corre pro fundo, z)
    for (const x of [0.42, -0.42]) caixa(g, 0.07, 0.1, 400, '#8a8a96', x, 0.2, -100, { cast: false });
    for (let z = 0; z > -160; z -= 14) poste(g, 3.2, z + 3);
    const sol = new THREE.Mesh(new THREE.CircleGeometry(7, 40), bas({ color: '#ffe0a0' })); semTinta(sol); g.add(sol);
    const halo = new THREE.Mesh(new THREE.CircleGeometry(20, 40), bas({ color: '#ffb060', transparent: true, opacity: 0.35, depthWrite: false })); semTinta(halo); g.add(halo);
    const nv = nuvens(g, [[-30, 22, -140, 8], [26, 28, -150, 9], [0, 36, -160, 7]], '#ffc89a');
    const trem = new THREE.Group(); g.add(trem); caixa(trem, 3.0, 1.0, 1.0, '#2a2a30', 0, 0, 0, {}); caixa(trem, 1.4, 1.5, 1.0, '#2a2a30', 1.9, 0, 0, {}); cil(trem, 0.2, 0.2, 0.8, '#1a1a1e', 2.2, 1.5, 0, {}, 12);
    const fum = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 9), bas({ color: '#d8c0b0', transparent: true, opacity: 0.6, depthWrite: false })); semTinta(fum); g.add(fum);
    lista.fim_tarde = { g, chao: () => 0, state(S, f) { const B = S.fim_tarde || {}, t = f / 30, k = B.sol ?? 0.35, pk = B.ponto ?? 0.6;
        const sy = 4 + k * 40; sol.position.set(-12 + k * 4, sy, -170); halo.position.set(-12 + k * 4, sy, -171); nv.forEach((n) => { n.visible = true; });
        const tz = -24 - pk * 120; trem.position.set(0, 0, tz); trem.scale.setScalar(1 + Math.max(0, -tz) * 0.0); fum.position.set(1.9 + 1.0, 2.0, tz + 0.0); fum.scale.setScalar(0.5 + pk * 1.2 + 0.1 * Math.sin(t * 3)); } };
  }
}
