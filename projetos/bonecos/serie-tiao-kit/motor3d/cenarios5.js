// cenarios5.js — PACOTE PRÉDIOS (20/11/2026): obra_azul, obra_vermelha, escritorio, skyline, rua, redacao, noite (topo do prédio azul à noite).
// Feito para modelar a referência "prédio mais alto" (corrida azul x vermelho). Mesmo jeito do PACOTE CASA (cenarios4.js): toon + tinta,
// nada facetado (cilindros/esferas com segmentos), prop legível perto da câmera geral, cidade/fundo longe com ndSkip (sem tinta, DOF desfoca).
// Liga: worldAt -> { cenario: '<id>', <id>: { opções } } + luz('<id>') (aliases em luzes.js; para 'noite' use luz('predio_noite'),
// porque luz('noite') é a noite genérica do kit). Piso útil y=0; câmera geral = camCen(id,'geral'); bonecos em x≈±0,7, z≈0,4..0,9.
// Opções (todas opcionais; nada é alocado por quadro, texto só é redesenhado quando muda):
//   obra_azul     { andares: 87 (número na régua/placa), gancho: 0..1 (viga pendurada sobe), bandeiras: 1|0 }
//   obra_azul/obra_vermelha também: nuvens: 1|0 (0 = sem nuvens de dia, p/ luz de noite)
//   obra_vermelha { andares: 86, telhado: 0..1 (telhado vermelho fecha de trás pra frente), mastro: 0..1 (mastro + bandeira sobem; com telhado>=0,5 sai da cumeeira — ver pela câmera 'mastro', de fora), gancho, bandeiras }
//   escritorio    { maquete: { azul: 0..1, vermelho: 0..1 } (altura dos prédios da maquete), luminaria: 1|0, noite: 0|1 (janelão vira noite), coroaAgulha: 0|1 (agulha do azul na janela e na maquete; PADRÃO 0 = sem spoiler) }
//   skyline       { hAzul: 24, hVermelho: 22 (andares, 0..70; topo = -60 + 3,2·andares m), regua: 1|0 (régua gigante com setas azul/vermelha),
//                 coroaAgulha: 0..N (agulha de prata grossa sobe da coroa do azul sem o prédio crescer; 1 ≈ 60 m; PADRÃO 0 = sem spoiler), nuvens: 1|0 }
//   rua           { multidao: 0..1 (pessoinhas na calçada e na rua do fundo), hora: 10.1 (ponteiros do relógio de rua, horas decimais) }
//   redacao       { manchete: 'ACABOU!' (texto curto, ajusta o tamanho), luminaria: 1|0 }
//   noite         { tampa: 0..1 (tampa de ferro redonda abre), agulha: 0..N (topo da agulha = 2·N m acima do teto; >3 sai do quadro geral),
//                   brilho: 0..1 (padrão: min(0,25, agulha·1,5)), brilhoMax, holofote: 1|0,
//                   agulhaGrossa: 1 (raio x N), plataforma: 0|1 (disco r 0,25 na ponta; topo = 2·agulha + 0,07) }  (alias: S.topo_noite)
// Câmeras extras (CAMS5, mescladas em CAMS): noite.agulha (baixo, olhando a agulha subir), skyline.predios (os dois prédios inteiros).
export const PREDIOS = ['obra_azul', 'obra_vermelha', 'escritorio', 'skyline', 'rua', 'redacao', 'noite'];
export const CAMS5 = {
  noite: { agulha: { pos: [1.9, 0.7, -0.5], look: [-0.1, 4.6, -2.4], fov: 64 }, tampa: { pos: [0.9, 2.6, 1.6], look: [0, 0.3, -2.2], fov: 50 } },
  skyline: { predios: { pos: [0.3, 1.8, 6.4], look: [0, 25, -60], fov: 70 } },
  obra_azul: { regua: { pos: [0.9, 2.2, 1.6], look: [1.95, 2.6, -3.3], fov: 50 } },
  obra_vermelha: { mastro: { pos: [9.5, 8.5, 11], look: [0, 4.2, -1.5], fov: 52 } },   // de fora: telhado + mastro
};

export function construirPredios(X) {
  const { THREE, P, add, toon, cv, T, novo, lista } = X, PI = Math.PI;
  const MC = {}; const mc = (c) => (typeof c === 'string' ? (MC[c] ||= toon({ color: c })) : c);
  const bas = (o) => new THREE.MeshBasicMaterial({ fog: false, ...o });
  const brilho = (cor, op = 0.5) => bas({ color: cor, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const semTinta = (m) => { m.userData.ndSkip = true; m.castShadow = false; return m; };
  const caixa = (g, w, h, d, cor, x, y, z, ry = 0, o) => { const m = add(new THREE.BoxGeometry(w, h, d), mc(cor), x, y + h / 2, z, g, o); m.rotation.y = ry; return m; };
  const cil = (g, rt, rb, h, cor, x, y, z, o, seg = 20) => add(new THREE.CylinderGeometry(rt, rb, h, seg), mc(cor), x, y + h / 2, z, g, o);
  const esf = (g, r, cor, x, y, z, o) => add(new THREE.SphereGeometry(r, 16, 12), mc(cor), x, y, z, g, o);
  const plano = (g, w, h, mat, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; g.add(m); return m; };
  const V = (a) => new THREE.Vector3(a[0], a[1], a[2]), UP = new THREE.Vector3(0, 1, 0);
  const tubo = (g, a, b, r, cor, o) => { const va = V(a), vb = V(b), d = vb.clone().sub(va), L = d.length();
    const m = add(new THREE.CylinderGeometry(r, r, L, 12), mc(cor), 0, 0, 0, g, o); m.position.copy(va).add(vb).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(UP, d.normalize()); return m; };
  const texto = (w, h, fn) => { const [c, a] = cv(w, h); fn(a, w, h); return c; };
  const escreve = (a, s, x, y, maxW, px, cor, peso = 'bold') => { let p = px; a.font = `${peso} ${p}px sans-serif`; while (a.measureText(s).width > maxW && p > 10) { p -= 2; a.font = `${peso} ${p}px sans-serif`; }
    a.fillStyle = cor; a.textAlign = 'center'; a.textBaseline = 'middle'; a.fillText(s, x, y); };
  // caixa com UV em metros (textura de fachada não estica): t = metros por repetição
  const tbox = (w, h, d, t = 8) => { const geo = new THREE.BoxGeometry(w, h, d), uv = geo.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
    for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / t, uv.getY(i) * dims[f][1] / t); } return geo; };
  // fachada pintada: grade de janelas (lit = fração acesa, para noite)
  const facTex = (base, jan, cols, rows, seed, o = {}) => { const r = P.rng(seed), cw = 64, [c, a] = cv(cols * cw, rows * cw); a.fillStyle = base; a.fillRect(0, 0, c.width, c.height);
    for (let y = 0; y < rows; y++) { a.fillStyle = 'rgba(0,0,0,.18)'; a.fillRect(0, y * cw + cw - 7, c.width, 7); a.fillStyle = 'rgba(255,255,255,.12)'; a.fillRect(0, y * cw, c.width, 3);
      for (let x = 0; x < cols; x++) { const lit = o.lit && r() < o.lit; a.fillStyle = lit ? (r() < 0.5 ? '#ffd76a' : '#ffefb0') : jan; a.fillRect(x * cw + 13, y * cw + 12, cw - 26, cw - 27);
        if (!o.lit) { a.fillStyle = 'rgba(255,255,255,.4)'; a.fillRect(x * cw + 16, y * cw + 15, 7, cw - 34); } a.fillStyle = 'rgba(0,0,0,.4)'; a.fillRect(x * cw + 11, y * cw + cw - 16, cw - 22, 4); } }
    return c; };
  const rebite = (cor, esc) => texto(64, 256, (a, w, h) => { a.fillStyle = cor; a.fillRect(0, 0, w, h); a.fillStyle = esc; a.fillRect(0, 0, w, 6); a.fillRect(0, h - 6, w, 6);
    for (let y = 16; y < h; y += 32) for (const x of [12, 52]) { a.beginPath(); a.arc(x, y, 5, 0, 7); a.fill(); } a.fillStyle = 'rgba(255,255,255,.18)'; a.fillRect(0, 8, w, 5); });
  // viga I (3 caixas) entre dois pontos alinhados a um eixo: eixo 'x'|'y'|'z'
  const vigaI = (g, eixo, c, L, mat, s = 1) => { const G = new THREE.Group(); G.position.set(c[0], c[1], c[2]); g.add(G);
    const alma = add(tbox(0.07 * s, L, 0.34 * s, 0.6), mat, 0, 0, 0, G); for (const k of [-1, 1]) add(tbox(0.3 * s, L, 0.06 * s, 0.6), mat, 0, 0, k * 0.17 * s, G);
    if (eixo === 'x') G.rotation.z = PI / 2; else if (eixo === 'z') G.rotation.x = PI / 2; return G; };
  const nuvens = (g, lista_, cor = '#ffffff', op = 1) => { const m = bas({ color: cor, transparent: op < 1, opacity: op }), ms = []; for (const [x, y, z, s] of lista_) for (let k = 0; k < 3; k++) {
    const n = add(new THREE.SphereGeometry(1, 14, 10), m, x + (k - 1) * s * 1.1, y + (k === 1 ? s * 0.35 : 0), z, g, { cast: false }); n.scale.set(s * 1.3, s * 0.55, s * 0.7); semTinta(n); ms.push(n); } return ms; };
  const bandeirinhas = (g, a, b, n, cores, sag = 0.35) => { const pa = V(a), pb = V(b), meio = pa.clone().add(pb).multiplyScalar(0.5); meio.y -= sag;
    const cur = new THREE.QuadraticBezierCurve3(pa, meio, pb); add(new THREE.TubeGeometry(cur, 16, 0.012, 5), mc('#3a3a3a'), 0, 0, 0, g, { cast: false });
    const sh = new THREE.Shape(); sh.moveTo(-0.15, 0); sh.lineTo(0.15, 0); sh.lineTo(0, -0.38); sh.closePath(); const geo = new THREE.ShapeGeometry(sh), out = [];
    for (let i = 0; i < n; i++) { const p = cur.getPoint((i + 0.5) / n), m = new THREE.Mesh(geo, toon({ color: cores[i % cores.length], side: THREE.DoubleSide })); m.position.copy(p); m.rotation.y = 0.2 * Math.sin(i * 1.7); g.add(m); out.push(m); } return out; };
  const pessoa = (g, x, z, cor, s = 1) => { const G = new THREE.Group(); G.position.set(x, 0, z); g.add(G); add(new THREE.CapsuleGeometry(0.2 * s, 0.6 * s, 4, 10), mc(cor), 0, 0.5 * s, 0, G, { cast: false });
    add(new THREE.SphereGeometry(0.17 * s, 12, 10), mc('#f0c08a'), 0, 1.12 * s, 0, G, { cast: false }); return G; };

  // CIDADE ABAIXO: chão, ~130 prédios pintados (UV em metros, materiais partilhados), anel de silhueta ao fundo. noite = janelas acesas (MeshBasic).
  const cidade = (g, y0, seed, pal, noite = false, o = {}) => { const r = P.rng(seed), G = new THREE.Group(); G.position.y = y0; g.add(G);
    const [cc, ca] = cv(512, 512); ca.fillStyle = pal.chao; ca.fillRect(0, 0, 512, 512); ca.fillStyle = pal.rua; for (let k = 0; k < 512; k += 128) { ca.fillRect(k, 0, 22, 512); ca.fillRect(0, k, 512, 22); }
    const chao = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), noite ? bas({ map: T(cc, 40, 40), fog: true }) : toon({ map: T(cc, 40, 40) })); chao.rotation.x = -PI / 2; semTinta(chao); G.add(chao);
    const mats = pal.cores.map((c, i) => { const t = T(facTex(c, noite ? '#1a2048' : pal.jan, 4, 4, seed + i * 7, noite ? { lit: 0.45 } : {})); return noite ? bas({ map: t, fog: true }) : toon({ map: t }); });
    const teto = noite ? bas({ color: '#141a3a', fog: true }) : mc(pal.teto);
    const evita = o.evita || (() => false);
    for (let i = 0; i < (o.n || 130); i++) { const a = -PI / 2 + (r() - 0.5) * PI * 1.7, rad = (o.r0 || 28) + Math.pow(r(), 0.75) * 400, x = Math.cos(a) * rad, z = Math.sin(a) * rad;
      if (evita(x, z)) continue; const w = 10 + r() * 16, d = 10 + r() * 14, h = 14 + r() * (rad < 120 ? 50 : 75), m0 = mats[(r() * mats.length) | 0];
      const m = add(tbox(w, h, d, 9), [m0, m0, teto, teto, m0, m0], x, h / 2, z, G, { cast: false }); m.rotation.y = (r() - 0.5) * 0.3; if (rad > 70) semTinta(m);
      if (r() < 0.25) cil(G, 0.12, 0.12, 6, noite ? '#ff4040' : '#9aa0aa', x, h, z, { cast: false }); }
    // anel de silhueta (sem tinta) fechando o horizonte
    const [sc, sa] = cv(2048, 256), rs = P.rng(seed + 3); for (let x = 0; x < 2048;) { const w = 30 + rs() * 70, h = 50 + rs() * 180; sa.fillStyle = noite ? '#1b2250' : pal.longe; sa.fillRect(x, 256 - h, w, h);
      sa.fillStyle = noite ? 'rgba(255,215,110,.85)' : 'rgba(255,255,255,.25)'; for (let yy = 256 - h + 8; yy < 250; yy += 14) for (let xx = x + 5; xx < x + w - 6; xx += 11) if (rs() < (noite ? 0.35 : 0.5)) sa.fillRect(xx, yy, 5, 7); x += w + rs() * 6; }
    const anel = new THREE.Mesh(new THREE.CylinderGeometry(560, 560, 180, 48, 1, true), bas({ map: T(sc, 3, 1), transparent: true, side: THREE.BackSide, depthWrite: false })); anel.position.y = 90; semTinta(anel); G.add(anel);
    return G; };

  // ================= OBRA (azul / vermelha): topo de prédio em construção =================
  const obra = (id, pal) => { const g = novo(id), R = P.rng(id.length * 31);
    // laje + prédio descendo (o topo do prédio é o palco) + deque de tábuas
    caixa(g, 12, 0.6, 12, '#b9b4aa', 0, -0.6, -1);
    const corpoTex = T(facTex(pal.predio, pal.vidro, 4, 4, 11)); add(tbox(12, 120, 12, 8), toon({ map: corpoTex }), 0, -60.6, -1, g, { cast: false });
    const tab = new THREE.Mesh(new THREE.PlaneGeometry(8, 10), toon({ map: T(P.planks(id === 'obra_azul' ? 3 : 7), 2, 2.5) })); tab.rotation.x = -PI / 2; tab.position.set(0, 0.01, -1); tab.receiveShadow = true; g.add(tab);
    // estrutura de vigas I (colunas + vigas no alto) com rebites
    const mv = toon({ map: T(rebite(pal.viga, pal.vigaEsc)) });
    for (const [x, z] of [[-2.35, -4.3], [2.35, -4.3], [-3.4, -0.6], [3.4, -0.6]]) vigaI(g, 'y', [x, 2.3, z], 4.6, mv);
    vigaI(g, 'x', [0, 4.6, -4.3], 5.1, mv); for (const x of [-2.35, 2.35]) vigaI(g, 'z', [x, 4.6, -0.9], 7, mv);
    // viga pendurada no cabo (some no alto do quadro) — gancho 0..1 sobe
    const pend = new THREE.Group(); g.add(pend); vigaI(pend, 'x', [0, 0, 0], 2.6, mv); for (const s of [-1, 1]) tubo(pend, [s * 1.1, 0.18, 0], [0, 1.25, 0], 0.018, '#2a2a2a');
    esf(pend, 0.07, '#d8b030', 0, 1.27, 0); const gancho = add(new THREE.TorusGeometry(0.11, 0.03, 8, 16, 4.4), mc('#d8b030'), 0, 1.38, 0, pend); gancho.rotation.z = 2.4; tubo(pend, [0, 1.48, 0], [0, 30, 0], 0.02, '#2a2a2a', { cast: false });
    // andaime à esquerda: tubos prata + 2 pisos de tábua + diagonais
    const ta = '#c3c9d2'; for (const x of [-3.7, -2.2]) for (const z of [-3.7, -1.9]) tubo(g, [x, 0, z], [x, 3.9, z], 0.035, ta);
    for (const y of [1.6, 3.2]) { for (const z of [-3.7, -1.9]) tubo(g, [-3.7, y, z], [-2.2, y, z], 0.03, ta); for (const x of [-3.7, -2.2]) tubo(g, [x, y, -3.7], [x, y, -1.9], 0.03, ta);
      for (let k = 0; k < 4; k++) caixa(g, 1.5, 0.05, 0.4, k % 2 ? '#c8924e' : '#b07c3c', -2.95, y, -3.55 + k * 0.45); caixa(g, 1.5, 0.12, 0.03, '#f2c230', -2.95, y + 0.05, -1.88); }
    tubo(g, [-2.2, 0, -3.7], [-2.2, 1.6, -1.9], 0.025, ta); tubo(g, [-2.2, 1.6, -3.7], [-2.2, 3.2, -1.9], 0.025, ta);
    // régua de andares (número = opção andares) + seta + placa
    const regua = plano(g, 0.55, 4.6, toon({ map: T(texto(8, 8, () => {})) }), 1.95, 2.6, -3.3); caixa(g, 0.65, 0.12, 0.12, '#555', 1.95, 0.2, -3.32); caixa(g, 0.08, 4.9, 0.08, '#6b4a2a', 1.95, 0.2, -3.38);
    const placa = plano(g, 1.1, 0.42, toon({ map: T(texto(8, 8, () => {})) }), 1.95, 5.15, -3.28);
    const seta = new THREE.Shape(); seta.moveTo(0, 0); seta.lineTo(0.42, 0.2); seta.lineTo(0.42, -0.2); seta.closePath(); const sm = new THREE.Mesh(new THREE.ShapeGeometry(seta), toon({ color: pal.band[0], side: THREE.DoubleSide })); sm.position.set(1.62, 0.3 + 4.6 * 4 / 6, -3.25); sm.rotation.y = PI; g.add(sm);
    let ultAnd = null; const pintaRegua = (n) => { ultAnd = n;
      regua.material.map = T(texto(128, 1024, (a, w, h) => { a.fillStyle = '#f6f1e4'; a.fillRect(0, 0, w, h); a.fillStyle = pal.band[0]; a.fillRect(w - 16, 0, 16, h); const per = h / 6;
        for (let i = 0; i < 6; i++) { const y = h - i * per; a.fillStyle = '#222'; a.fillRect(0, y - 5, w * 0.62, 10); for (let k = 1; k < 5; k++) a.fillRect(0, y - k * per / 5 - 2, w * 0.3, 4); escreve(a, String(Math.max(0, n - 4 + i)), 82, y - per * 0.5, 80, 44, i === 4 ? pal.band[0] : '#222'); }
        a.strokeStyle = '#333'; a.lineWidth = 6; a.strokeRect(3, 3, w - 6, h - 6); })); regua.material.needsUpdate = true;
      placa.material.map = T(texto(256, 96, (a, w, h) => { a.fillStyle = pal.band[0]; a.fillRect(0, 0, w, h); a.fillStyle = '#fff'; a.fillRect(6, 6, w - 12, h - 12); escreve(a, `${n}º ANDAR`, w / 2, h / 2 + 2, w - 30, 54, pal.band[0]); })); placa.material.needsUpdate = true; };
    // bandeirinhas (cor da equipe + branco) entre as colunas e até o andaime
    const band = [...bandeirinhas(g, [-2.35, 4.35, -4.25], [2.35, 4.35, -4.25], 11, pal.band, 0.45), ...bandeirinhas(g, [-2.35, 4.3, -4.2], [-3.7, 3.9, -1.9], 5, pal.band, 0.25)];
    // grua ao fundo: torre treliçada, cabine, lança, contra-peso, cabo com caçamba
    const lat = texto(64, 64, (a, w, h) => { a.strokeStyle = pal.grua; a.lineWidth = 7; a.strokeRect(3, 3, w - 6, h - 6); a.lineWidth = 5; a.beginPath(); a.moveTo(0, 0); a.lineTo(w, h); a.moveTo(w, 0); a.lineTo(0, h); a.stroke(); });
    const latM = toon({ map: T(lat, 1, 18), alphaTest: 0.5, side: THREE.DoubleSide }), latH = toon({ map: T(lat, 16, 1), alphaTest: 0.5, side: THREE.DoubleSide });
    add(new THREE.BoxGeometry(1.1, 22, 1.1), latM, 4.6, -1, -16, g, { cast: false }); add(new THREE.BoxGeometry(18, 0.9, 0.9), latH, -1.6, 10.3, -16, g, { cast: false });
    caixa(g, 1.6, 1.3, 1.4, pal.grua, 4.6, 9.2, -15.6, 0, { cast: false }); plano(g, 1.0, 0.6, bas({ color: '#bfe6ff' }), 4.6, 10.0, -14.88).userData.ndSkip = true; caixa(g, 2.6, 1.1, 1.0, '#7a7f88', 7.6, 9.8, -16, 0, { cast: false });
    tubo(g, [4.6, 11.2, -16], [-9, 10.7, -16], 0.03, '#333', { cast: false }); tubo(g, [4.6, 11.2, -16], [7.8, 10.8, -16], 0.03, '#333', { cast: false }); cil(g, 0.08, 0.08, 1.2, pal.grua, 4.6, 10.7, -16, { cast: false });
    tubo(g, [-4.5, 10.3, -16], [-4.5, 5.2, -16], 0.03, '#333', { cast: false }); cil(g, 0.5, 0.35, 0.7, '#e0a020', -4.5, 4.5, -16, { cast: false });
    // guarda-corpo na borda do fundo (amarelo/preto)
    for (let x = -3.9; x <= 3.95; x += 0.65) caixa(g, 0.06, 1.0, 0.06, '#e8c020', x, 0, -5.85); for (const y of [0.55, 1.0]) caixa(g, 7.9, 0.05, 0.05, '#e8c020', 0, y, -5.85);
    const [lc, la] = cv(256, 32); for (let x = -32; x < 256; x += 32) { la.fillStyle = '#f2c230'; la.beginPath(); la.moveTo(x, 32); la.lineTo(x + 16, 0); la.lineTo(x + 32, 0); la.lineTo(x + 16, 32); la.fill(); la.fillStyle = '#1e1e1e'; la.beginPath(); la.moveTo(x + 16, 32); la.lineTo(x + 32, 0); la.lineTo(x + 48, 0); la.lineTo(x + 32, 32); la.fill(); }
    add(new THREE.BoxGeometry(7.9, 0.2, 0.04), toon({ map: T(lc, 8, 1) }), 0, 0.1, -5.82, g);
    // props no deque (≥8): pilha de vigas, capacete, caixa de ferramentas, balde de rebites, cone, sacos de cimento, fita métrica, marmita+garrafa, carrinho de mão, bandeira
    for (let i = 0; i < 3; i++) vigaI(g, 'z', [1.55 + (i % 2) * 0.36, 0.17 + i * 0.34 * 0.5, -1.9], 1.6, mv, 0.8).rotation.z = PI / 2;
    const cap = esf(g, 0.2, pal.band[0], 1.75, 0.55, -1.6); cap.scale.set(1, 0.7, 1.1); cil(g, 0.27, 0.27, 0.025, pal.band[0], 1.75, 0.43, -1.6);
    caixa(g, 0.6, 0.3, 0.3, '#c0392b', -1.45, 0, -2.3, 0.2); caixa(g, 0.62, 0.05, 0.32, '#e34a3a', -1.45, 0.3, -2.3, 0.2); tubo(g, [-1.65, 0.36, -2.34], [-1.25, 0.36, -2.26], 0.025, '#333'); tubo(g, [-1.72, 0.3, -2.35], [-1.65, 0.36, -2.34], 0.02, '#333'); tubo(g, [-1.18, 0.3, -2.25], [-1.25, 0.36, -2.26], 0.02, '#333');
    cil(g, 0.17, 0.14, 0.32, '#8a8f99', -1.0, 0, -3.1); for (let i = 0; i < 7; i++) esf(g, 0.035, '#d9a040', -1.0 + Math.cos(i) * 0.08, 0.33, -3.1 + Math.sin(i) * 0.08, { cast: false });
    cil(g, 0.02, 0.2, 0.55, '#ff7a20', -1.55, 0, -0.75); cil(g, 0.105, 0.135, 0.09, '#ffffff', -1.55, 0.26, -0.75, { cast: false }); caixa(g, 0.42, 0.04, 0.42, '#ff7a20', -1.55, 0, -0.75);
    for (let i = 0; i < 4; i++) { const s = caixa(g, 0.7, 0.18, 0.45, '#d9cfb4', 0.95 + (i % 2) * 0.1, (i >> 0) * 0.18, -3.75, 0.08 * (i % 2 ? 1 : -1)); s.scale.set(1, 1, 1); } plano(g, 0.36, 0.12, toon({ color: '#2a5ea8' }), 0.98, 0.62, -3.52);
    caixa(g, 0.18, 0.18, 0.08, '#f2c230', -0.4, 0, -1.6); caixa(g, 1.9, 0.005, 0.05, '#f7d84a', 0.55, 0.002, -1.6); for (let k = 0; k < 10; k++) caixa(g, 0.008, 0.007, 0.05, '#222', -0.3 + k * 0.19, 0.003, -1.6, 0, { cast: false });
    caixa(g, 0.32, 0.16, 0.22, '#3a8fd8', -2.75, 0, -1.3); cil(g, 0.06, 0.06, 0.32, '#c0c0c0', -2.45, 0, -1.25);
    const carr = new THREE.Group(); carr.position.set(-2.4, 0, -4.9); carr.rotation.y = 0.5; g.add(carr); const cc = add(new THREE.CylinderGeometry(0.45, 0.28, 0.35, 20, 1, true), toon({ color: '#5a8a3a', side: THREE.DoubleSide }), 0, 0.5, 0, carr); cc.scale.z = 0.7;
    const roda = add(new THREE.TorusGeometry(0.15, 0.05, 8, 18), mc('#222'), 0, 0.17, 0.55, carr); roda.rotation.y = PI / 2; for (const s of [-1, 1]) tubo(carr, [s * 0.2, 0.35, 0.4], [s * 0.25, 0.55, -0.7], 0.02, '#444');
    tubo(g, [-2.95, 3.25, -2.8], [-2.95, 5.4, -2.8], 0.025, '#ddd'); const flag = plano(g, 0.9, 0.55, toon({ color: pal.band[0], side: THREE.DoubleSide }), -2.5, 5.1, -2.8);
    // mastro (só vermelho usa) e telhado vermelho (fecha por faixas, de trás pra frente)
    const mastro = new THREE.Group(); mastro.position.set(-1.45, 0, -5.55); g.add(mastro); const haste = cil(mastro, 0.05, 0.07, 1, '#e8e8ee', 0, 0, 0); esf(mastro, 0.11, '#f0c040', 0, 0, 0);
    const bm = plano(mastro, 1.2, 0.75, toon({ color: pal.band[0], side: THREE.DoubleSide }), 0.62, 0, 0); const [fc, fa] = cv(128, 80); fa.fillStyle = pal.band[0]; fa.fillRect(0, 0, 128, 80); fa.fillStyle = '#fff'; fa.beginPath(); fa.arc(64, 40, 18, 0, 7); fa.fill(); bm.material.map = T(fc); bm.material.color.set('#fff');
    const bola = mastro.children[1]; mastro.visible = false;
    const tel = new THREE.Group(); g.add(tel); const [tc, tca] = cv(256, 256); tca.fillStyle = '#b8352a'; tca.fillRect(0, 0, 256, 256); for (let y = 0; y < 256; y += 32) { tca.fillStyle = 'rgba(0,0,0,.28)'; tca.fillRect(0, y + 26, 256, 6); for (let x = (y / 32 % 2) * 16; x < 256; x += 32) { tca.fillStyle = 'rgba(255,255,255,.12)'; tca.fillRect(x + 3, y + 4, 22, 6); tca.fillStyle = 'rgba(0,0,0,.2)'; tca.fillRect(x, y, 2, 30); } }
    const telM = toon({ map: T(tc, 2, 1), side: THREE.DoubleSide }), FX = 6, faixas = [];
    for (let i = 0; i < FX; i++) for (const s of [-1, 1]) { const f = add(new THREE.BoxGeometry(2.75, 0.06, 7.4 / FX), telM, s * 1.25, 5.25, -4.3 + (i + 0.5) * 7.4 / FX, tel); f.rotation.z = -s * 0.5; f.userData.i = i; faixas.push(f); }
    const cume = add(new THREE.CylinderGeometry(0.09, 0.09, 7.4, 12), mc('#8a2a20'), 0, 5.9, -0.6, tel); cume.rotation.x = PI / 2; tel.visible = false;
    // cidade abaixo + nuvens
    cidade(g, -95, id.length * 13 + 5, pal.cidade); const nuv = nuvens(g, [[-30, 22, -120, 7], [25, 30, -160, 9], [60, 18, -110, 6], [-70, 35, -200, 10]], pal.nuvem || '#ffffff');
    lista[id] = { g, chao: () => 0, state(S, f) { const B = S[id] || {}, t = f / 30;
      const nv = (B.nuvens ?? 1) !== 0; nuv.forEach((m) => { m.visible = nv; });
      const n = Math.round(B.andares ?? pal.andares); if (n !== ultAnd) pintaRegua(n);
      pend.position.set(0.9, 3.55 + (B.gancho ?? 0) * 1.2, -2.7); pend.rotation.y = 0.25 + 0.04 * Math.sin(t * 0.9);
      const bv = B.bandeiras ?? 1; band.forEach((b, i) => { b.visible = !!bv; b.rotation.y = 0.25 * Math.sin(t * 2.2 + i); }); flag.scale.x = 1 + 0.05 * Math.sin(t * 3);
      const mt = Math.min(1, Math.max(0, B.mastro ?? 0)), tt = Math.min(1, Math.max(0, B.telhado ?? 0)); mastro.visible = mt > 0.001; if (tt >= 0.5) mastro.position.set(0, 5.95, -2.4); else mastro.position.set(-1.45, 0, -5.55); if (mastro.visible) { const h = 0.6 + (tt >= 0.5 ? 3.4 : 6.4) * mt; haste.scale.y = h; haste.position.y = h / 2; bola.position.y = h + 0.08; bm.position.y = h - 0.42; bm.rotation.y = 0.15 * Math.sin(t * 2.4); }
      tel.visible = tt > 0.001; if (tel.visible) { const k = tt * FX; for (const fx of faixas) { const v = Math.min(1, Math.max(0, k - fx.userData.i)); fx.visible = v > 0.02; fx.scale.z = Math.max(v, 0.02); } cume.scale.y = tt; cume.position.z = -4.3 + 3.7 * tt; } } };
  };
  obra('obra_azul', { viga: '#2f6fd6', vigaEsc: '#163f8a', band: ['#2f78e0', '#ffffff'], grua: '#f2c230', predio: '#4a78c8', vidro: '#a9d6ff', andares: 87,
    cidade: { chao: '#9aa59a', rua: '#7d8478', cores: ['#d9cbb0', '#c9b79a', '#b9c6d3', '#e3d6c0', '#a8b4c8'], jan: '#6d8fb3', teto: '#8a8a8a', longe: '#9fb2d0' } });
  obra('obra_vermelha', { viga: '#d23a2e', vigaEsc: '#7a1a14', band: ['#d8302a', '#ffffff'], grua: '#f2c230', predio: '#c8483a', vidro: '#ffd9b0', andares: 86, nuvem: '#ffe3cf',
    cidade: { chao: '#a59a8a', rua: '#86786a', cores: ['#e3c9a0', '#d9a888', '#cbb8a8', '#f0d8b8', '#b89a90'], jan: '#7a6a8a', teto: '#8a7a70', longe: '#d6a0a0' } });

  // ================= INTERIOR (escritório / redação): paredes altas sem teto (nada de mancha de teto no quadro) =================
  const interior = (id, cfg) => { const g = novo(id);
    const pw = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 7.5), toon({ map: T(cfg.parede, cfg.rep || 3, cfg.repY || 3) })); pw.position.set(0, 3.75, -3.5); pw.receiveShadow = true; g.add(pw);
    for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(14, 7.5), toon({ map: T(cfg.parede, 6, cfg.repY || 3), side: THREE.DoubleSide })); w.rotation.y = -s * PI / 2; w.position.set(s * 3.7, 3.75, 3.5); g.add(w); }
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 14), toon({ map: T(cfg.piso, 3, 6) })); fl.rotation.x = -PI / 2; fl.position.set(0, 0, 3.5); fl.receiveShadow = true; g.add(fl);
    caixa(g, 7.4, 0.16, 0.06, cfg.rodape, 0, 0, -3.47); for (const s of [-1, 1]) caixa(g, 0.06, 0.16, 14, cfg.rodape, s * 3.67, 0, 3.5);
    if (cfg.lambri) { caixa(g, 7.4, 1.1, 0.04, cfg.lambri, 0, 0, -3.46); caixa(g, 7.4, 0.07, 0.08, cfg.rodape, 0, 1.1, -3.44); }
    caixa(g, 7.4, 0.14, 0.12, cfg.rodape, 0, 6.2, -3.44);
    const luzC = new THREE.PointLight(cfg.luzCor, cfg.luzI, 14, 1.3); luzC.position.set(0, 3.6, 0.8); g.add(luzC); return g; };
  const tabuas = (c1, c2, seed) => texto(512, 512, (a) => { const r = P.rng(seed), h = 512 / 6; for (let i = 0; i < 6; i++) { a.fillStyle = c1; a.fillRect(0, i * h, 512, h); a.fillStyle = c2; a.globalAlpha = 0.2; for (let m = 0; m < 22; m++) a.fillRect(r() * 512, i * h + r() * h, 40 + r() * 120, 2); a.globalAlpha = 1; a.fillStyle = 'rgba(0,0,0,.45)'; a.fillRect(0, i * h, 512, 3); a.fillRect((i * 197) % 512, i * h, 3, h); } });
  const mesa = (g, x, z, w, d, h, cor, perna) => { const G = new THREE.Group(); G.position.set(x, 0, z); g.add(G); caixa(G, w, 0.07, d, cor, 0, h - 0.07, 0); for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) caixa(G, 0.06, h - 0.07, 0.06, perna, a * (w / 2 - 0.08), 0, b * (d / 2 - 0.08)); return G; };
  const binoculo = (g, x, y, z, ry = 0, s = 1) => { const G = new THREE.Group(); G.position.set(x, y, z); G.rotation.y = ry; G.scale.setScalar(s); g.add(G);
    for (const k of [-1, 1]) { const c = add(new THREE.CylinderGeometry(0.06, 0.07, 0.22, 18), mc('#2a2a30'), k * 0.075, 0.07, 0, G); c.rotation.x = PI / 2; const l = add(new THREE.CylinderGeometry(0.05, 0.05, 0.01, 18), bas({ color: '#7fc8ff' }), k * 0.075, 0.07, 0.115, G); l.rotation.x = PI / 2; semTinta(l); }
    caixa(G, 0.1, 0.04, 0.08, '#5a5a62', 0, 0.05, 0); return G; };
  const relogioParede = (g, x, y, z, r = 0.32, aro = '#6b4423') => { const [c, a] = cv(128, 128); a.fillStyle = '#fbf6ea'; a.beginPath(); a.arc(64, 64, 62, 0, 7); a.fill(); a.fillStyle = '#222'; for (let i = 0; i < 12; i++) { const an = i / 12 * PI * 2; a.fillRect(64 + Math.sin(an) * 50 - 3, 64 - Math.cos(an) * 50 - 3, 6, 6); }
    a.strokeStyle = '#222'; a.lineWidth = 6; a.beginPath(); a.moveTo(64, 64); a.lineTo(64, 26); a.moveTo(64, 64); a.lineTo(92, 74); a.stroke();
    const m = new THREE.Mesh(new THREE.CircleGeometry(r, 32), toon({ map: T(c) })); m.position.set(x, y, z + 0.03); g.add(m); const t = add(new THREE.TorusGeometry(r, 0.035, 8, 32), mc(aro), x, y, z + 0.03, g); return m; };

  // ---------- ESCRITÓRIO (construtora; quente) ----------
  { const parede = texto(256, 256, (a) => { a.fillStyle = '#2f6d6a'; a.fillRect(0, 0, 256, 256); a.fillStyle = '#2a625f'; for (let x = 0; x < 256; x += 32) a.fillRect(x, 0, 14, 256); });
    const g = interior('escritorio', { parede, piso: tabuas('#c08a4e', '#6a4424', 21), rodape: '#e8dcc4', lambri: '#7a4a2a', luzCor: '#ffd29a', luzI: 2.0 });
    // janelão com skyline (dia/poente) — dois prédios: azul e vermelho
    const pintaJanela = (noite, comAgulha = false) => texto(512, 512, (a, w, h) => { const gr = a.createLinearGradient(0, 0, 0, h); if (noite) { gr.addColorStop(0, '#0a1036'); gr.addColorStop(1, '#2a3a7a'); } else { gr.addColorStop(0, '#6a8fe0'); gr.addColorStop(0.6, '#ffc690'); gr.addColorStop(1, '#ff9a6a'); } a.fillStyle = gr; a.fillRect(0, 0, w, h);
      if (!noite) { a.fillStyle = '#fff2c0'; a.beginPath(); a.arc(380, 300, 34, 0, 7); a.fill(); } else { a.fillStyle = '#fff'; const r = P.rng(4); for (let i = 0; i < 40; i++) a.fillRect(r() * w, r() * 260, 2, 2); }
      const r = P.rng(9); for (let x = 0; x < w;) { const bw = 30 + r() * 40, bh = 60 + r() * 120; a.fillStyle = noite ? '#1c2452' : '#b07a8a'; a.fillRect(x, h - bh, bw, bh); a.fillStyle = noite ? '#ffd76a' : 'rgba(255,240,220,.5)'; for (let yy = h - bh + 8; yy < h - 6; yy += 14) for (let xx = x + 5; xx < x + bw - 6; xx += 10) if (r() < 0.45) a.fillRect(xx, yy, 4, 7); x += bw + 2; }
      const torre = (x, bw, bh, cor, topo) => { a.fillStyle = cor; a.fillRect(x, h - bh, bw, bh); a.fillStyle = noite ? '#ffd76a' : 'rgba(255,255,255,.55)'; for (let yy = h - bh + 10; yy < h; yy += 16) for (let xx = x + 6; xx < x + bw - 6; xx += 12) a.fillRect(xx, yy, 6, 9);
        a.fillStyle = cor; if (topo === 'agulha') { a.fillRect(x + bw * 0.2, h - bh - 30, bw * 0.6, 30); if (comAgulha) { a.fillStyle = '#d6dce6'; a.beginPath(); a.moveTo(x + bw / 2 - 9, h - bh - 30); a.lineTo(x + bw / 2, h - bh - 130); a.lineTo(x + bw / 2 + 9, h - bh - 30); a.fill(); } }
        else { a.beginPath(); a.moveTo(x - 4, h - bh); a.lineTo(x + bw / 2, h - bh - 40); a.lineTo(x + bw + 4, h - bh); a.fill(); a.fillRect(x + bw / 2 - 2, h - bh - 80, 4, 42); a.fillStyle = '#e03a2a'; a.fillRect(x + bw / 2 + 2, h - bh - 80, 26, 16); } };
      torre(110, 70, 330, '#3f6fd0', 'agulha'); torre(320, 76, 300, '#d0423a', 'telhado'); });
    const jan = plano(g, 4.6, 3.6, bas({ map: T(pintaJanela(false)) }), 0, 2.85, -3.44); jan.userData.ndSkip = true; jan.userData.tD = jan.material.map; jan.userData.tN = T(pintaJanela(true)); jan.userData.tDA = T(pintaJanela(false, true)); jan.userData.tNA = T(pintaJanela(true, true));
    for (const x of [-2.35, -0.78, 0.78, 2.35]) caixa(g, 0.1, 3.8, 0.1, '#e8dcc4', x, 0.95, -3.4); for (const y of [0.95, 2.85, 4.7]) caixa(g, 4.8, 0.1, 0.1, '#e8dcc4', 0, y - 0.05, -3.4); caixa(g, 5.0, 0.12, 0.3, '#e8dcc4', 0, 0.86, -3.3);
    relogioParede(g, 0, 5.45, -3.47, 0.36); const plq = plano(g, 2.6, 0.5, toon({ map: T(texto(512, 96, (a, w, h) => { a.fillStyle = '#7a4a2a'; a.fillRect(0, 0, w, h); a.fillStyle = '#f2c66a'; a.fillRect(6, 6, w - 12, h - 12); escreve(a, 'CONSTRUTORA', w / 2, h / 2 + 2, w - 40, 64, '#5a3418'); })) }), 0, 6.4, -3.45);
    // prancheta de desenho com planta (esquerda)
    const pr = new THREE.Group(); pr.position.set(-1.65, 0, -2.1); pr.rotation.y = 0.35; g.add(pr); for (const s of [-1, 1]) { tubo(pr, [s * 0.55, 0, -0.35], [s * 0.5, 0.95, 0], 0.03, '#3a3a40'); tubo(pr, [s * 0.55, 0, 0.35], [s * 0.5, 0.95, 0], 0.03, '#3a3a40'); }
    const tampo = new THREE.Group(); tampo.position.set(0, 1.0, 0); tampo.rotation.x = 0.75; pr.add(tampo); caixa(tampo, 1.35, 0.05, 0.95, '#d9c49a', 0, -0.025, 0);
    const planta = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.8), toon({ map: T(texto(256, 180, (a, w, h) => { a.fillStyle = '#2a5fb0'; a.fillRect(0, 0, w, h); a.strokeStyle = '#e8f2ff'; a.lineWidth = 2; for (let x = 0; x < w; x += 16) { a.globalAlpha = 0.2; a.beginPath(); a.moveTo(x, 0); a.lineTo(x, h); a.stroke(); } for (let y = 0; y < h; y += 16) { a.beginPath(); a.moveTo(0, y); a.lineTo(w, y); a.stroke(); } a.globalAlpha = 1; a.lineWidth = 3;
      a.strokeRect(90, 30, 50, 140); a.beginPath(); a.moveTo(100, 30); a.lineTo(115, 6); a.lineTo(130, 30); a.stroke(); for (let y = 40; y < 165; y += 14) { a.beginPath(); a.moveTo(90, y); a.lineTo(140, y); a.stroke(); } a.strokeRect(160, 70, 50, 100); a.strokeRect(20, 110, 50, 60); escreve(a, 'PLANTA', 50, 22, 80, 18, '#e8f2ff'); })) }));
    planta.rotation.x = -PI / 2; planta.position.set(0, 0.006, 0); tampo.add(planta); caixa(tampo, 1.3, 0.025, 0.05, '#7a5a3a', 0, 0, 0.12); const esq = caixa(tampo, 0.6, 0.012, 0.32, '#f0e080', 0.3, 0.01, -0.15); esq.rotation.y = 0.5;
    tubo(pr, [0.6, 1.25, -0.2], [0.75, 1.75, -0.1], 0.02, '#333'); tubo(pr, [0.75, 1.75, -0.1], [0.45, 1.95, 0.1], 0.02, '#333'); const cup = add(new THREE.ConeGeometry(0.15, 0.2, 18, 1, true), toon({ color: '#2a8a5a', side: THREE.DoubleSide }), 0.42, 1.88, 0.12, pr); cup.rotation.z = 0.6;
    const luzL = new THREE.PointLight('#ffd27a', 1.5, 5, 1.4); luzL.position.set(-1.4, 1.6, -1.8); g.add(luzL); const halo = semTinta(add(new THREE.SphereGeometry(0.07, 12, 8), bas({ color: '#fff3c0' }), 0.4, 1.8, 0.14, pr, { cast: false }));
    cil(g, 0.22, 0.22, 0.05, '#333', -1.1, 0.66, -1.3); cil(g, 0.04, 0.04, 0.6, '#555', -1.1, 0.05, -1.3); cil(g, 0.22, 0.22, 0.04, '#444', -1.1, 0, -1.3);
    // mesa da maquete (direita): dois prédios em escala + binóculo + caneca
    const mq = mesa(g, 1.7, -2.3, 1.5, 0.9, 0.8, '#8a5a30', '#5b3a22'); caixa(mq, 1.3, 0.04, 0.75, '#6ab04a', 0, 0.8, 0); for (const z of [-0.2, 0.2]) caixa(mq, 1.2, 0.005, 0.06, '#9a9a9a', 0, 0.84, z);
    const torreM = (x, cor, topo) => { const T0 = new THREE.Group(); T0.position.set(x, 0.84, -0.05); mq.add(T0); const and = []; for (let i = 0; i < 10; i++) { const b = caixa(T0, 0.24, 0.07, 0.24, i % 2 ? cor : new THREE.Color(cor).multiplyScalar(0.85).getStyle(), 0, i * 0.072, 0); and.push(b); }
      const top = new THREE.Group(); T0.add(top); if (topo) { const ag = new THREE.Group(); top.add(ag); cil(ag, 0.003, 0.05, 0.35, '#d8dde5', 0, 0, 0); top.userData.ag = ag; ag.visible = false; } else { const tt = add(new THREE.ConeGeometry(0.2, 0.14, 4), mc('#a8281e'), 0, 0.07, 0, top); tt.rotation.y = PI / 4; cil(top, 0.006, 0.006, 0.22, '#eee', 0, 0.1, 0); } return { and, top }; };
    const mA = torreM(-0.3, '#3f6fd0', true), mV = torreM(0.3, '#d0423a', false);
    binoculo(mq, -0.45, 0.82, 0.3, 0.4, 1.3); cil(mq, 0.05, 0.045, 0.12, '#f2f2f2', 0.55, 0.82, 0.3); const alca = add(new THREE.TorusGeometry(0.035, 0.012, 6, 12), mc('#f2f2f2'), 0.61, 0.88, 0.3, mq);
    // estante/arquivo + globo, rolos de planta, cesto com papel, planta, cabideiro com chapéu, tapete
    caixa(g, 0.9, 1.6, 0.45, '#6b4423', 3.05, 0, -3.15); for (let i = 0; i < 3; i++) { caixa(g, 0.8, 0.04, 0.4, '#5a361a', 3.05, 0.5 * i + 0.3, -3.1); for (let k = 0; k < 5; k++) caixa(g, 0.1, 0.3, 0.26, ['#c0392b', '#2e86c1', '#e8c040', '#27ae60', '#8e44ad'][(i + k) % 5], 2.8 + k * 0.12, 0.5 * i + 0.34, -3.05); }
    esf(g, 0.2, '#3a8fd8', 3.05, 1.85, -3.15); cil(g, 0.06, 0.1, 0.06, '#d8b030', 3.05, 1.6, -3.15);
    cil(g, 0.24, 0.2, 0.55, '#8a5a30', -2.75, 0, -2.9); for (let i = 0; i < 6; i++) { const r0 = add(new THREE.CylinderGeometry(0.045, 0.045, 1.0, 14), mc(i % 2 ? '#e8f0ff' : '#9cc4ff'), -2.75 + Math.cos(i) * 0.1, 0.8, -2.9 + Math.sin(i) * 0.1, g); r0.rotation.set(0.15 * Math.sin(i * 2), 0, 0.15 * Math.cos(i * 3)); }
    cil(g, 0.17, 0.13, 0.36, '#55606a', 0.2, 0, -2.9); for (let i = 0; i < 3; i++) esf(g, 0.08, '#f4f0e4', 0.15 + i * 0.06, 0.38 + (i % 2) * 0.04, -2.9 + (i - 1) * 0.05); esf(g, 0.08, '#f4f0e4', 0.55, 0.08, -2.6);
    cil(g, 0.22, 0.17, 0.4, '#c8643a', 2.75, 0, -1.2); for (let i = 0; i < 7; i++) { const fo = add(new THREE.SphereGeometry(0.22, 12, 10), mc(i % 2 ? '#2f8f3a' : '#3fa84a'), 2.75 + Math.cos(i * 0.9) * 0.18, 0.8 + i * 0.12, -1.2 + Math.sin(i * 0.9) * 0.18, g); fo.scale.set(0.7, 1.2, 0.7); }
    cil(g, 0.025, 0.025, 1.85, '#5b3a22', -2.75, 0, -0.9); cil(g, 0.2, 0.22, 0.04, '#5b3a22', -2.75, 0, -0.9); const ch = cil(g, 0.13, 0.15, 0.13, '#2a2a30', -2.68, 1.8, -0.9); cil(g, 0.24, 0.24, 0.02, '#2a2a30', -2.68, 1.8, -0.9);
    add(new THREE.BoxGeometry(3.2, 0.02, 2.2), mc('#8c2f2f'), 0, 0.01, 0.4, g); add(new THREE.BoxGeometry(2.7, 0.025, 1.7), mc('#e8c070'), 0, 0.015, 0.4, g);
    lista.escritorio = { g, chao: () => 0, state(S) { const B = S.escritorio || {}, M = B.maquete || {};
      for (const [k, T0] of [[M.azul ?? 1, mA], [M.vermelho ?? 0.8, mV]]) { const n = Math.max(1, Math.round(Math.min(1, k) * 10)); T0.and.forEach((b, i) => { b.visible = i < n; }); T0.top.position.y = n * 0.072; }
      const ca = (B.coroaAgulha ?? 0) > 0; mA.top.userData.ag.visible = ca;   // agulha = payoff: desligada por padrão (sem spoiler)
      const on = B.luminaria ?? 1; luzL.intensity = on ? 1.5 : 0; halo.visible = !!on; const tx = B.noite ? (ca ? jan.userData.tNA : jan.userData.tN) : (ca ? jan.userData.tDA : jan.userData.tD); if (jan.material.map !== tx) { jan.material.map = tx; jan.material.needsUpdate = true; } } };
  }

  // ---------- SKYLINE (pôr do sol): terraço + cidade + DOIS prédios (azul e vermelho) com altura controlável ----------
  { const g = novo('skyline');
    const [pc, pa] = cv(256, 256); pa.fillStyle = '#c8704a'; pa.fillRect(0, 0, 256, 256); pa.fillStyle = 'rgba(0,0,0,.3)'; for (let k = 0; k < 256; k += 64) { pa.fillRect(k, 0, 4, 256); pa.fillRect(0, k, 256, 4); }
    const piso = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), toon({ map: T(pc, 5, 5) })); piso.rotation.x = -PI / 2; piso.position.set(0, 0, 0); piso.receiveShadow = true; g.add(piso);
    caixa(g, 10, 0.4, 10, '#a89a8a', 0, -0.4, 0); add(tbox(10, 60, 10, 8), toon({ map: T(facTex('#d8b890', '#7a6a9a', 4, 4, 41)) }), 0, -30.4, 0, g, { cast: false });
    const [bc, ba] = cv(256, 64); ba.fillStyle = '#b8583a'; ba.fillRect(0, 0, 256, 64); ba.fillStyle = 'rgba(0,0,0,.35)'; for (let y = 0; y < 64; y += 16) { ba.fillRect(0, y, 256, 2); for (let x = (y / 16 % 2) * 16; x < 256; x += 32) ba.fillRect(x, y, 2, 16); }
    const mur = toon({ map: T(bc, 4, 1) }); add(new THREE.BoxGeometry(10, 0.9, 0.3), mur, 0, 0.45, -4.8, g); caixa(g, 10.2, 0.08, 0.4, '#e8dcc4', 0, 0.9, -4.8);
    for (const s of [-1, 1]) add(new THREE.BoxGeometry(0.3, 0.9, 10), mur, s * 4.85, 0.45, 0, g);
    // binóculo de moeda (turista) no parapeito
    const bm = new THREE.Group(); bm.position.set(1.75, 0, -3.9); bm.rotation.y = 0.25; g.add(bm); cil(bm, 0.12, 0.2, 0.08, '#3a6a5a', 0, 0, 0); cil(bm, 0.06, 0.06, 1.05, '#3a6a5a', 0, 0.08, 0);
    const cab = add(new THREE.SphereGeometry(0.22, 18, 14), mc('#4a8a72'), 0, 1.32, 0, bm); cab.scale.set(1.2, 0.85, 1); for (const k of [-1, 1]) { const o = add(new THREE.CylinderGeometry(0.06, 0.08, 0.2, 16), mc('#2a2a30'), k * 0.1, 1.36, 0.22, bm); o.rotation.x = PI / 2; } caixa(bm, 0.1, 0.12, 0.06, '#d8b030', 0, 1.1, 0.18);
    // caixa d'água de madeira em pés (esquerda), antena de TV, chaminé, banco, vasos, varal, pombos, lampião
    const cx = new THREE.Group(); cx.position.set(-2.7, 0, -4.0); g.add(cx); for (const [a, b] of [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]]) tubo(cx, [a, 0, b], [a * 0.8, 2.2, b * 0.8], 0.06, '#5a3a22');
    const [wc, wa] = cv(256, 128); wa.fillStyle = '#8a5a34'; wa.fillRect(0, 0, 256, 128); wa.fillStyle = 'rgba(0,0,0,.3)'; for (let x = 0; x < 256; x += 18) wa.fillRect(x, 0, 3, 128); wa.fillStyle = '#3a3a40'; wa.fillRect(0, 30, 256, 7); wa.fillRect(0, 90, 256, 7);
    add(new THREE.CylinderGeometry(0.85, 0.85, 1.6, 24), toon({ map: T(wc, 3, 1) }), 0, 3.0, 0, cx); add(new THREE.ConeGeometry(0.95, 0.7, 24), mc('#5a3a22'), 0, 4.15, 0, cx); caixa(cx, 1.6, 0.08, 1.6, '#5a3a22', 0, 2.15, 0);
    tubo(g, [-1.2, 0, -4.55], [-1.2, 3.4, -4.55], 0.03, '#888'); for (const [y, w] of [[2.6, 1.0], [3.0, 0.7], [3.3, 0.45]]) tubo(g, [-1.2 - w / 2, y, -4.55], [-1.2 + w / 2, y, -4.55], 0.02, '#888');
    caixa(g, 0.6, 1.3, 0.6, '#9a4a32', 3.3, 0, -3.6); caixa(g, 0.7, 0.1, 0.7, '#7a3a28', 3.3, 1.3, -3.6);
    caixa(g, 1.4, 0.07, 0.42, '#8a5a30', -2.3, 0.45, -1.6); for (const s of [-1, 1]) caixa(g, 0.06, 0.45, 0.4, '#333', -2.3 + s * 0.6, 0, -1.6); caixa(g, 1.4, 0.4, 0.06, '#8a5a30', -2.3, 0.55, -1.8);
    for (const [x, z, c] of [[2.6, -1.4, '#e74c3c'], [2.95, -2.2, '#f1c40f'], [-3.2, -2.6, '#ec7063']]) { cil(g, 0.2, 0.15, 0.32, '#c8643a', x, 0, z); for (let k = 0; k < 4; k++) esf(g, 0.13, k % 2 ? c : '#3a9a3a', x + Math.cos(k * 1.6) * 0.12, 0.42 + (k % 2) * 0.1, z + Math.sin(k * 1.6) * 0.12); }
    const pombos = []; for (const [x, z] of [[0.3, -4.75], [0.6, -4.8], [2.6, -4.78]]) { const pg = new THREE.Group(); pg.position.set(x, 0.94, z); g.add(pg); const b = esf(pg, 0.09, '#8a8fa0', 0, 0.08, 0); b.scale.set(1, 0.85, 1.4); esf(pg, 0.055, '#9aa0b0', 0, 0.17, 0.08); const bi = add(new THREE.ConeGeometry(0.02, 0.05, 8), mc('#e0a020'), 0, 0.17, 0.15, pg); bi.rotation.x = PI / 2; pombos.push(pg); }
    cil(g, 0.04, 0.05, 2.2, '#2a2a2a', -3.6, 0, -0.6); const lamp = add(new THREE.SphereGeometry(0.16, 16, 12), bas({ color: '#ffe7a0' }), -3.6, 2.3, -0.6, g); semTinta(lamp);
    // cidade lá embaixo (evita o "corredor" dos dois prédios)
    cidade(g, -60, 77, { chao: '#a07a6a', rua: '#7a5a52', cores: ['#e8b890', '#d89a7a', '#c8a0a8', '#f0c8a0', '#b88a8a'], jan: '#7a5a8a', teto: '#8a6a60', longe: '#c88a8a' }, false, { n: 120, r0: 30, evita: (x, z) => Math.abs(z + 78) < 14 && Math.abs(Math.abs(x) - 9) < 12 });
    // os dois prédios: corpo com UV repetida por andar (janelas não esticam), coroa sobe junto
    const torre = (x, cor, vidro, tipo) => { const G = new THREE.Group(); G.position.set(x, -60, -78); g.add(G); const tx = T(facTex(cor, vidro, 5, 1, x > 0 ? 3 : 5)), m = toon({ map: tx }), topo = mc(new THREE.Color(cor).multiplyScalar(0.8).getStyle());
      const corpo = add(new THREE.BoxGeometry(12, 1, 12), [m, m, topo, topo, m, m], 0, 0.5, 0, G, { cast: false }); const coroa = new THREE.Group(); G.add(coroa);
      if (tipo === 'agulha') { caixa(coroa, 9, 3, 9, cor, 0, 0, 0, 0, { cast: false }); caixa(coroa, 6, 3, 6, cor, 0, 3, 0, 0, { cast: false });
        // agulha de prata = PAYOFF: desligada por padrão (coroaAgulha 0); sobe da coroa sem o prédio crescer. Grossa p/ ler a 150 px (~85 m da câmera)
        const ag = new THREE.Group(); ag.position.y = 6; ag.visible = false; coroa.add(ag); cil(ag, 2.6, 2.9, 1.2, '#8a94a6', 0, 0, 0, { cast: false }, 24);
        const haste = add(new THREE.CylinderGeometry(1.1, 1.9, 1, 24), mc('#cfd6e2'), 0, 0.5, 0, ag, { cast: false }); const ponta = new THREE.Group(); ag.add(ponta);
        add(new THREE.ConeGeometry(1.1, 7, 24), mc('#e4e8f0'), 0, 3.5, 0, ponta, { cast: false }); esf(ponta, 1.4, '#f2f4f8', 0, 7.4, 0, { cast: false });
        coroa.userData.ag = { ag, haste, ponta }; }
      else { const tt = add(new THREE.ConeGeometry(9, 6, 4), mc('#a8281e'), 0, 3, 0, coroa, { cast: false }); tt.rotation.y = PI / 4; caixa(coroa, 3, 4, 3, cor, 0, 3, 0, 0, { cast: false }); const tc = add(new THREE.ConeGeometry(2.4, 3, 4), mc('#a8281e'), 0, 8.5, 0, coroa, { cast: false }); tc.rotation.y = PI / 4;
        cil(coroa, 0.12, 0.12, 8, '#eee', 0, 10, 0, { cast: false }); const fb = plano(coroa, 3.4, 2, toon({ color: '#e03a2a', side: THREE.DoubleSide }), 1.8, 17, 0); coroa.userData.flag = fb; }
      return { G, corpo, coroa, tx }; };
    const tA = torre(-9, '#3f6fd0', '#bfe0ff', 'agulha'), tV = torre(9, '#d0423a', '#ffe0c0', 'telhado');
    // régua gigante entre os dois (andares) com setas azul/vermelha
    const rg = new THREE.Group(); rg.position.set(0, -60, -76); g.add(rg); const rtx = texto(128, 2048, (a, w, h) => { a.fillStyle = '#f6f1e4'; a.fillRect(0, 0, w, h); for (let i = 0; i <= 70; i++) { const y = h - i / 70 * h; a.fillStyle = '#222'; a.fillRect(0, y - (i % 10 ? 2 : 5), i % 10 ? 40 : 80, i % 10 ? 4 : 10); if (i % 10 === 0 && i) escreve(a, String(i), 96, y + 22, 60, 40, '#222'); } a.strokeStyle = '#333'; a.lineWidth = 8; a.strokeRect(4, 4, w - 8, h - 8); });
    add(new THREE.BoxGeometry(2.4, 224, 0.3), [mc('#ddd'), mc('#ddd'), mc('#ddd'), mc('#ddd'), toon({ map: T(rtx) }), mc('#ddd')], 0, 112, 0, rg, { cast: false });
    const setaS = new THREE.Shape(); setaS.moveTo(0, 0); setaS.lineTo(3.2, 1.4); setaS.lineTo(3.2, -1.4); setaS.closePath(); const sg = new THREE.ShapeGeometry(setaS);
    const sA = new THREE.Mesh(sg, toon({ color: '#3f8cff', side: THREE.DoubleSide })); sA.rotation.y = PI; rg.add(sA); const sV = new THREE.Mesh(sg, toon({ color: '#ff4a3a', side: THREE.DoubleSide })); rg.add(sV);
    const nuvS = nuvens(g, [[-40, 40, -220, 12], [35, 55, -260, 14], [80, 30, -200, 9], [-90, 60, -300, 16]], '#ffc8a8');
    lista.skyline = { g, chao: () => 0, state(S, f) { const B = S.skyline || {}, t = f / 30;
      for (const [h, T0] of [[B.hAzul ?? 24, tA], [B.hVermelho ?? 22, tV]]) { const n = Math.max(1, Math.min(70, h)), H = n * 3.2; T0.corpo.scale.y = H; T0.corpo.position.y = H / 2; T0.tx.repeat.set(1, n); T0.coroa.position.y = H; if (T0.coroa.userData.flag) T0.coroa.userData.flag.rotation.y = 0.2 * Math.sin(t * 2); }
      { const A = tA.coroa.userData.ag, k = Math.max(0, B.coroaAgulha ?? 0), L = 4 + 56 * k; A.ag.visible = k > 0.001; if (A.ag.visible) { A.haste.scale.y = L; A.haste.position.y = L / 2; A.ponta.position.y = L; } }
      { const nv = (B.nuvens ?? 1) !== 0; nuvS.forEach((m) => { m.visible = nv; }); }
      rg.visible = (B.regua ?? 1) !== 0; sA.position.set(-1.2, Math.min(70, B.hAzul ?? 24) * 3.2, 0.3); sV.position.set(1.2, Math.min(70, B.hVermelho ?? 22) * 3.2, 0.3);
      pombos.forEach((p, i) => { p.rotation.y = 0.6 * Math.sin(t * 0.8 + i * 2); }); } };
  }

  // ---------- RUA (centro, de manhã): calçada, rua com faixa, fachadas com lojas, rua lateral ao fundo, relógio de rua, banca de jornal ----------
  { const g = novo('rua');
    const [sc, sa] = cv(256, 256); sa.fillStyle = '#d8cfc0'; sa.fillRect(0, 0, 256, 256); sa.fillStyle = 'rgba(0,0,0,.18)'; for (let k = 0; k < 256; k += 64) { sa.fillRect(k, 0, 3, 256); sa.fillRect(0, k, 256, 3); }
    const calc = toon({ map: T(sc, 6, 4) }); const c1 = new THREE.Mesh(new THREE.PlaneGeometry(60, 9), calc); c1.rotation.x = -PI / 2; c1.position.set(0, 0, 2.6); c1.receiveShadow = true; g.add(c1);
    caixa(g, 60, 0.15, 0.25, '#b8b0a2', 0, -0.12, -1.75);
    const [ac, aa] = cv(512, 256); aa.fillStyle = '#4a4a52'; aa.fillRect(0, 0, 512, 256); const ra = P.rng(3); for (let i = 0; i < 600; i++) { aa.fillStyle = ra() < 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.1)'; aa.fillRect(ra() * 512, ra() * 256, 3, 3); } aa.fillStyle = '#f2c230'; for (let x = 0; x < 512; x += 128) aa.fillRect(x, 124, 70, 8);
    const asf = new THREE.Mesh(new THREE.PlaneGeometry(60, 5), toon({ map: T(ac, 8, 1) })); asf.rotation.x = -PI / 2; asf.position.set(0, -0.12, -4.25); asf.receiveShadow = true; g.add(asf);
    for (let k = 0; k < 7; k++) caixa(g, 0.4, 0.012, 3.6, '#f4f4f0', -1.5 + k * 0.6, -0.12, -4.25, 0, { cast: false });
    const c2 = new THREE.Mesh(new THREE.PlaneGeometry(60, 2.2), calc); c2.rotation.x = -PI / 2; c2.position.set(0, 0, -7.85); g.add(c2); caixa(g, 60, 0.15, 0.25, '#b8b0a2', 0, -0.12, -6.75);
    // fachadas (fundo z=-9), com vão da rua lateral em x 1..7
    const letreiro = (s, fundo, cor) => toon({ map: T(texto(256, 64, (a, w, h) => { a.fillStyle = fundo; a.fillRect(0, 0, w, h); escreve(a, s, w / 2, h / 2 + 2, w - 24, 42, cor); })) });
    const fach = [[-12.5, 5, '#e8b87a', 'PADARIA', '#c0392b'], [-7.5, 5, '#9fc8d8', 'CAFÉ', '#2a6a8a'], [-2.8, 4.4, '#e8d0a0', 'JORNAIS', '#2a8a4a'], [10, 6, '#d89a9a', 'BANCO', '#2a3a8a'], [16, 6, '#c8d89a', 'LOJA', '#8a4a2a']];
    fach.forEach(([x, w, cor, nome, cl], i) => { const h = 14 + (i * 7) % 9; add(tbox(w, h, 8, 6), toon({ map: T(facTex(cor, '#7aa8c8', 3, 3, 50 + i)) }), x, h / 2, -13, g, { cast: false });
      caixa(g, w - 0.2, 2.6, 0.1, '#5a4a3a', x, 0, -8.98); plano(g, w - 1.4, 1.8, bas({ color: '#bfe2f0' }), x, 1.2, -8.92).userData.ndSkip = true; caixa(g, 0.9, 2.2, 0.06, '#7a4a2a', x + w / 2 - 1.0, 0, -8.9);
      const tol = add(new THREE.BoxGeometry(w - 0.4, 0.06, 1.1), toon({ map: T(texto(64, 8, (a) => { for (let k = 0; k < 8; k++) { a.fillStyle = k % 2 ? '#fff' : cl; a.fillRect(k * 8, 0, 8, 8); } }), (w - 0.4) / 0.8, 1) }), x, 2.75, -8.4, g); tol.rotation.x = 0.35;
      plano(g, Math.min(w - 1, 3.2), 0.65, letreiro(nome, '#fff', cl), x, 3.4, -8.9); });
    // rua lateral ao fundo: prédios dos dois lados até longe + prédio azul alto no fim
    for (let i = 0; i < 9; i++) for (const s of [-1, 1]) { const x = 4 + s * 5.5, z = -14 - i * 13, h = 16 + ((i * 5 + (s > 0 ? 3 : 0)) % 7) * 4, cor = ['#e3c9a0', '#c8b8d8', '#a8c8b8', '#e8b8a0'][(i + (s > 0)) % 4];
      const m = add(tbox(6, h, 12, 6), toon({ map: T(facTex(cor, '#7a98b8', 3, 3, 60 + i * 2 + (s > 0))) }), x, h / 2, z, g, { cast: false }); if (i > 2) semTinta(m); }
    const fimT = add(tbox(10, 90, 10, 7), toon({ map: T(facTex('#3f6fd0', '#bfe0ff', 4, 4, 9)) }), 4, 45, -140, g, { cast: false }); semTinta(fimT); semTinta(cil(g, 0.2, 1.5, 14, '#d8dde5', 4, 90, -140, { cast: false }));
    const asf2 = new THREE.Mesh(new THREE.PlaneGeometry(5, 130), toon({ map: T(ac, 1, 16) })); asf2.rotation.x = -PI / 2; asf2.position.set(4, -0.11, -73); g.add(asf2);
    // relógio de rua (2 faces) — opção hora
    const rel = new THREE.Group(); rel.position.set(-1.75, 0, -1.0); g.add(rel); cil(rel, 0.22, 0.28, 0.35, '#2a5a3a', 0, 0, 0); cil(rel, 0.08, 0.1, 3.0, '#2a5a3a', 0, 0.35, 0); cil(rel, 0.12, 0.12, 0.2, '#d8b030', 0, 2.2, 0);
    const caixaR = add(new THREE.CylinderGeometry(0.42, 0.42, 0.22, 32), mc('#2a5a3a'), 0, 3.75, 0, rel); caixaR.rotation.x = PI / 2; esf(rel, 0.1, '#d8b030', 0, 4.25, 0);
    const [qc, qa] = cv(128, 128); qa.fillStyle = '#fbf6ea'; qa.beginPath(); qa.arc(64, 64, 62, 0, 7); qa.fill(); qa.fillStyle = '#222'; for (let i = 0; i < 12; i++) { const an = i / 12 * PI * 2; qa.fillRect(64 + Math.sin(an) * 50 - 3, 64 - Math.cos(an) * 50 - 3, 6, 6); }
    const pont = []; for (const s of [-1, 1]) { const face = new THREE.Mesh(new THREE.CircleGeometry(0.36, 32), toon({ map: T(qc) })); face.position.set(0, 3.75, s * 0.115); face.rotation.y = s > 0 ? 0 : PI; rel.add(face);
      for (const [L, W] of [[0.2, 0.045], [0.3, 0.03]]) { const pv = new THREE.Group(); pv.position.set(0, 3.75, s * 0.125); rel.add(pv); const p = new THREE.Mesh(new THREE.BoxGeometry(W, L, 0.01), mc('#1a1a1a')); p.position.y = L / 2; pv.add(p); pont.push({ pv, s, h: L < 0.25 }); } }
    // banca de jornal (verde) com revistas e letreiro
    const bn = new THREE.Group(); bn.position.set(1.6, 0, -1.7); bn.rotation.y = -0.45; g.add(bn); caixa(bn, 1.3, 2.0, 1.0, '#2a7a4a', 0, 0, 0); caixa(bn, 1.5, 0.1, 1.25, '#1f5a36', 0, 2.0, 0.08);
    plano(bn, 1.25, 0.32, letreiro('BANCA', '#f2c230', '#1f5a36'), 0, 2.32, 0.62); caixa(bn, 1.3, 0.08, 0.5, '#1f5a36', 0, 0.9, 0.7);
    const rev = ['#e74c3c', '#3a8fd8', '#f1c40f', '#9b59b6', '#27ae60', '#ff8a3a']; for (let i = 0; i < 6; i++) { const r0 = caixa(bn, 0.18, 0.24, 0.02, rev[i], -0.45 + i * 0.18, 1.2 + (i % 2) * 0.32, 0.51); r0.rotation.x = -0.1; plano(bn, 0.14, 0.04, mc('#fff'), -0.45 + i * 0.18, 1.38 + (i % 2) * 0.32, 0.525); }
    for (let i = 0; i < 4; i++) { const j = caixa(bn, 0.32, 0.03, 0.22, '#efe8d6', -0.42 + i * 0.28, 0.98, 0.7, 0.1 * i); } caixa(bn, 0.8, 0.5, 0.05, '#efe8d6', 0, 0.3, 0.52);
    // poste, semáforo, hidrante, lixeira, banco de praça, árvore em canteiro, carro, pombos
    cil(g, 0.06, 0.08, 4.6, '#3a3a40', -3.2, 0, -1.6); const lp = add(new THREE.SphereGeometry(0.22, 16, 12), bas({ color: '#fff4c8' }), -3.2, 4.7, -1.6, g); semTinta(lp); caixa(g, 0.5, 0.08, 0.3, '#3a3a40', -3.2, 4.5, -1.6);
    cil(g, 0.05, 0.06, 3.0, '#3a3a40', 0.9, 0, -7.4); caixa(g, 0.3, 0.8, 0.25, '#2a2a2a', 0.9, 3.0, -7.4); for (const [y, c] of [[3.65, '#ff3a2a'], [3.4, '#f2c230'], [3.15, '#3ad05a']]) semTinta(add(new THREE.SphereGeometry(0.075, 12, 10), bas({ color: c, opacity: c === '#3ad05a' ? 1 : 0.35, transparent: true }), 0.9, y, -7.26, g, { cast: false }));
    cil(g, 0.13, 0.15, 0.45, '#d8302a', -0.9, 0, -1.25); esf(g, 0.13, '#d8302a', -0.9, 0.46, -1.25); for (const s of [-1, 1]) { const b = cil(g, 0.05, 0.05, 0.1, '#d8302a', -0.9 + s * 0.13, 0.25, -1.25); b.rotation.z = PI / 2; b.position.y = 0.3; }
    cil(g, 0.2, 0.17, 0.6, '#2a6a8a', 0.6, 0, -1.3); cil(g, 0.22, 0.22, 0.05, '#1f4f6a', 0.6, 0.6, -1.3);
    caixa(g, 1.4, 0.07, 0.42, '#8a5a30', -2.7, 0.45, 0.8, 0.2); caixa(g, 1.4, 0.4, 0.06, '#8a5a30', -2.75, 0.55, 0.6, 0.2); for (const s of [-1, 1]) caixa(g, 0.06, 0.45, 0.4, '#333', -2.7 + s * 0.6, 0, 0.8, 0.2);
    caixa(g, 1.0, 0.3, 1.0, '#a89a8a', 2.9, 0, 0.5); cil(g, 0.08, 0.1, 1.4, '#6b4423', 2.9, 0.3, 0.5); for (let k = 0; k < 4; k++) add(new THREE.SphereGeometry(0.55, 14, 10), mc(k % 2 ? '#2f8f3a' : '#3fa84a'), 2.9 + Math.cos(k * 1.6) * 0.3, 2.2 + (k % 2) * 0.3, 0.5 + Math.sin(k * 1.6) * 0.3, g);
    const car = new THREE.Group(); car.position.set(-3.6, -0.12, -4.6); g.add(car); caixa(car, 3.4, 0.7, 1.5, '#e8b820', 0, 0.3, 0); caixa(car, 1.8, 0.6, 1.36, '#e8b820', -0.2, 1.0, 0); for (const s of [-1, 1]) plano(car, 1.6, 0.42, bas({ color: '#bfe2f0' }), -0.2, 1.3, s * 0.69, s > 0 ? 0 : PI).userData.ndSkip = true;
    caixa(car, 0.5, 0.18, 1.38, '#222', -0.2, 1.6, 0); for (const [a, b] of [[-1.1, -0.75], [1.1, -0.75], [-1.1, 0.75], [1.1, 0.75]]) { const w = add(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 20), mc('#1e1e1e'), a, 0.32, b, car); w.rotation.x = PI / 2; } plano(car, 1.0, 0.25, letreiro('TÁXI', '#fff', '#222'), -0.2, 1.75, 0, 0);
    const pomb = []; for (const [x, z] of [[-0.2, -0.6], [0.15, -0.9], [-2.2, 2.0]]) { const pg = new THREE.Group(); pg.position.set(x, 0, z); g.add(pg); const b = esf(pg, 0.09, '#8a8fa0', 0, 0.1, 0); b.scale.set(1, 0.85, 1.4); esf(pg, 0.055, '#9aa0b0', 0, 0.2, 0.08); pomb.push(pg); }
    // multidão-pontos (opcional)
    const gente = [], rr = P.rng(88), cores = ['#e74c3c', '#3a8fd8', '#f1c40f', '#9b59b6', '#27ae60', '#ff8a3a', '#2a2a40', '#e8e8e8'];
    for (let i = 0; i < 40; i++) { const side = i < 16, x = side ? -14 + rr() * 13 : 4 + (rr() - 0.5) * 3.6, z = side ? -7.4 - rr() * 1.0 : -10 - rr() * 70; const p = pessoa(g, x, z, cores[i % cores.length], side ? 1 : 1.2); p.userData.f = rr() * 6; gente.push(p); if (!side) p.traverse((o) => { if (o.isMesh) o.userData.ndSkip = z < -25; }); }
    nuvens(g, [[-30, 40, -150, 10], [30, 50, -190, 12], [-80, 45, -220, 12]]);
    lista.rua = { g, chao: () => 0, state(S, f) { const B = S.rua || {}, t = f / 30, n = Math.round(Math.min(1, B.multidao ?? 0) * gente.length);
      gente.forEach((p, i) => { p.visible = i < n; if (p.visible) p.position.y = Math.abs(Math.sin(t * 5 + p.userData.f)) * 0.05; });
      const hr = B.hora ?? 10.1; for (const q of pont) q.pv.rotation.z = -q.s * (q.h ? (hr % 12) / 12 : (hr % 1)) * PI * 2;
      pomb.forEach((p, i) => { p.rotation.y = 0.8 * Math.sin(t * 1.1 + i * 2); }); } };
  }

  // ---------- REDAÇÃO DE JORNAL (luz de luminária, quente/verde) ----------
  { const tij = texto(256, 256, (a) => { a.fillStyle = '#7a3a2a'; a.fillRect(0, 0, 256, 256); const r = P.rng(5); for (let y = 0; y < 256; y += 32) for (let x = (y / 32 % 2) * 32; x < 256 + 32; x += 64) { a.fillStyle = `hsl(${8 + r() * 10},${45 + r() * 15}%,${30 + r() * 10}%)`; a.fillRect(x - 32 + 3, y + 3, 58, 26); } });
    const g = interior('redacao', { parede: tij, rep: 4, repY: 4, piso: tabuas('#7a5434', '#3a2414', 33), rodape: '#3a2414', lambri: '#4a3020', luzCor: '#ffcf8a', luzI: 1.3 });
    // jornal gigante na parede (manchete = opção) — moldura + prendedores
    const jornal = plano(g, 3.2, 4.0, toon({ map: T(texto(8, 8, () => {})) }), 0.15, 3.6, -3.42); jornal.rotation.z = -0.03; caixa(g, 3.4, 0.08, 0.08, '#2a1a10', 0.15, 5.62, -3.42);
    for (const x of [-1.2, 1.5]) { caixa(g, 0.1, 0.2, 0.1, '#c0c0c0', x, 5.5, -3.38); }
    let ultM = null; const pintaJornal = (s) => { ultM = s; jornal.material.map = T(texto(512, 640, (a, w, h) => { a.fillStyle = '#efe6cc'; a.fillRect(0, 0, w, h); a.fillStyle = 'rgba(120,90,40,.08)'; for (let i = 0; i < 30; i++) a.fillRect((i * 97) % w, (i * 53) % h, 40, 30);
      escreve(a, 'O DIÁRIO DA CIDADE', w / 2, 40, w - 40, 44, '#1a1a1a', 'bold'); a.fillStyle = '#1a1a1a'; a.fillRect(20, 70, w - 40, 4); a.fillRect(20, 80, w - 40, 2);
      escreve(a, s, w / 2, 140, w - 40, 96, '#1a1a1a'); a.fillRect(20, 200, w - 40, 3);
      a.fillStyle = '#d8d0b8'; a.fillRect(30, 220, 230, 300); a.fillStyle = '#7a8090'; a.fillRect(110, 280, 70, 240); a.beginPath(); a.moveTo(120, 280); a.lineTo(145, 230); a.lineTo(170, 280); a.fill(); a.fillStyle = '#efe6cc'; for (let y = 292; y < 510; y += 18) for (let x = 118; x < 175; x += 16) a.fillRect(x, y, 8, 10);
      a.fillStyle = '#c0302a'; a.fillRect(100, 380, 90, 16);
      a.fillStyle = 'rgba(30,30,30,.75)'; for (let c = 0; c < 2; c++) for (let y = 222; y < 610; y += 14) a.fillRect(280 + c * 112, y, 96 - ((y * 7) % 30), 6); for (let y = 535; y < 615; y += 14) a.fillRect(30, y, 230 - ((y * 5) % 40), 6); })); jornal.material.needsUpdate = true; };
    // luminárias pendentes verdes (com luz)
    const luzes = []; for (const x of [-1.5, 1.6]) { tubo(g, [x, 7.5, -1.6], [x, 3.75, -1.6], 0.012, '#222', { cast: false }); const cup = add(new THREE.CylinderGeometry(0.12, 0.45, 0.32, 24, 1, true), toon({ color: '#2a7a4a', side: THREE.DoubleSide }), x, 3.6, -1.6, g); cil(g, 0.1, 0.12, 0.08, '#1f5a36', x, 3.72, -1.6);
      const lb = semTinta(add(new THREE.SphereGeometry(0.1, 12, 10), bas({ color: '#fff0b0' }), x, 3.48, -1.6, g, { cast: false })); const L = new THREE.PointLight('#ffd08a', 2.2, 7, 1.4); L.position.set(x, 3.3, -1.6); g.add(L); luzes.push({ L, lb }); }
    // mesa com máquina de escrever, telefone, xícara, pilha de jornais (esquerda)
    const ms = mesa(g, -1.75, -2.2, 1.7, 0.85, 0.8, '#6a4424', '#3a2414'); caixa(ms, 0.5, 0.65, 0.05, '#4a3020', 0, 0.07, 0.38);
    const mq = new THREE.Group(); mq.position.set(-0.1, 0.8, 0.05); mq.rotation.y = 0.15; ms.add(mq); caixa(mq, 0.6, 0.16, 0.42, '#2f6a4a', 0, 0, 0); const corpo2 = caixa(mq, 0.5, 0.14, 0.2, '#3a7a58', 0, 0.16, -0.08); corpo2.rotation.x = -0.25;
    const rolo = add(new THREE.CylinderGeometry(0.05, 0.05, 0.66, 18), mc('#1e1e1e'), 0, 0.32, -0.14, mq); rolo.rotation.z = PI / 2; const fol = plano(mq, 0.36, 0.34, toon({ color: '#fbf6ea', side: THREE.DoubleSide }), 0, 0.5, -0.17); fol.rotation.x = -0.2;
    for (let r0 = 0; r0 < 3; r0++) for (let k = 0; k < 8; k++) cil(mq, 0.018, 0.018, 0.03, '#e8e0c8', -0.2 + k * 0.057, 0.13 + r0 * 0.015, 0.06 + r0 * 0.05, { cast: false }, 10);
    const tel = new THREE.Group(); tel.position.set(0.55, 0.8, -0.1); ms.add(tel); caixa(tel, 0.26, 0.12, 0.22, '#1e1e1e', 0, 0, 0); const fone = add(new THREE.CapsuleGeometry(0.03, 0.22, 4, 10), mc('#1e1e1e'), 0, 0.15, 0, tel); fone.rotation.z = PI / 2; cil(tel, 0.06, 0.06, 0.02, '#e8e0c8', 0, 0.12, 0.08);
    cil(ms, 0.045, 0.04, 0.09, '#f2f2f2', -0.55, 0.8, 0.2); cil(ms, 0.07, 0.07, 0.01, '#f2f2f2', -0.55, 0.8, 0.2); for (let i = 0; i < 5; i++) caixa(ms, 0.42, 0.03, 0.3, '#ebe2c8', -0.6, 0.8 + i * 0.03, -0.18, 0.12 * Math.sin(i * 2));
    // arquivo de aço + ventilador, quadro de cortiça, relógio, pilha amarrada no chão, cesto, cadeira
    caixa(g, 0.6, 1.35, 0.55, '#7a8a88', 2.5, 0, -3.1); for (let i = 0; i < 3; i++) { caixa(g, 0.5, 0.36, 0.02, '#8a9a98', 2.5, 0.1 + i * 0.43, -2.82); caixa(g, 0.16, 0.04, 0.03, '#d8d0b0', 2.5, 0.38 + i * 0.43, -2.8); }
    const vt = new THREE.Group(); vt.position.set(2.5, 1.35, -3.05); g.add(vt); cil(vt, 0.1, 0.12, 0.04, '#2a2a30', 0, 0, 0); cil(vt, 0.025, 0.025, 0.3, '#2a2a30', 0, 0.04, 0); const gr = add(new THREE.TorusGeometry(0.2, 0.015, 6, 24), mc('#9aa0a8'), 0, 0.5, 0.05, vt);
    const pas = new THREE.Group(); pas.position.set(0, 0.5, 0.06); vt.add(pas); for (let k = 0; k < 3; k++) { const p = add(new THREE.SphereGeometry(0.09, 12, 8), mc('#c8a040'), Math.cos(k * 2.09) * 0.09, Math.sin(k * 2.09) * 0.09, 0, pas); p.scale.set(1, 0.5, 0.15); }
    const [kc, ka] = cv(256, 192); ka.fillStyle = '#b8864a'; ka.fillRect(0, 0, 256, 192); const rk = P.rng(12); for (let i = 0; i < 300; i++) { ka.fillStyle = 'rgba(80,50,20,.25)'; ka.fillRect(rk() * 256, rk() * 192, 2, 2); }
    for (const [x, y, c] of [[20, 20, '#fff'], [110, 30, '#f2e08a'], [180, 15, '#fff'], [40, 100, '#bfe0ff'], [140, 110, '#fff'], [200, 100, '#ffc0b0']]) { ka.fillStyle = c; ka.fillRect(x, y, 50, 60); ka.fillStyle = '#d8302a'; ka.beginPath(); ka.arc(x + 25, y + 6, 5, 0, 7); ka.fill(); ka.fillStyle = 'rgba(0,0,0,.4)'; for (let k = 0; k < 4; k++) ka.fillRect(x + 6, y + 18 + k * 9, 36, 3); }
    caixa(g, 1.2, 0.95, 0.04, '#5a361a', -2.55, 2.2, -3.44); plano(g, 1.1, 0.85, toon({ map: T(kc) }), -2.55, 2.67, -3.41);
    relogioParede(g, 2.45, 4.0, -3.47, 0.3, '#2a1a10');
    for (let i = 0; i < 4; i++) { caixa(g, 0.5, 0.12, 0.38, '#e6dcc0', 1.35, i * 0.12, -2.7, 0.1 * Math.sin(i * 3)); } tubo(g, [1.35, 0, -2.5], [1.35, 0.5, -2.5], 0.008, '#8a5a30'); tubo(g, [1.1, 0.49, -2.7], [1.6, 0.49, -2.7], 0.008, '#8a5a30');
    cil(g, 0.17, 0.13, 0.36, '#4a4a50', -0.55, 0, -2.85); for (let i = 0; i < 3; i++) esf(g, 0.08, '#f4f0e4', -0.6 + i * 0.06, 0.38 + (i % 2) * 0.04, -2.85);
    const cd = new THREE.Group(); cd.position.set(-1.7, 0, -1.35); cd.rotation.y = PI + 0.3; g.add(cd); caixa(cd, 0.48, 0.06, 0.45, '#5a361a', 0, 0.45, 0); caixa(cd, 0.48, 0.5, 0.05, '#5a361a', 0, 0.5, -0.2); cil(cd, 0.03, 0.03, 0.45, '#333', 0, 0, 0); cil(cd, 0.24, 0.24, 0.03, '#333', 0, 0, 0);
    lista.redacao = { g, chao: () => 0, state(S, f) { const B = S.redacao || {}, s = String(B.manchete ?? 'ACABOU!').toUpperCase(); if (s !== ultM) pintaJornal(s);
      const on = B.luminaria ?? 1; for (const q of luzes) { q.L.intensity = on ? 2.2 : 0; q.lb.visible = !!on; } pas.rotation.z = f * 0.9; } };
  }

  // ---------- NOITE: topo do prédio azul — tampa de ferro redonda + agulha de prata, estrelas, cidade acesa, holofote ----------
  { const g = novo('noite'), CZ = -1.6, HZ = -2.2, HR = 0.85;
    // deque redondo de aço com furo da tampa
    const [dc, da] = cv(512, 512); da.fillStyle = '#5a6a88'; da.fillRect(0, 0, 512, 512); da.strokeStyle = 'rgba(0,0,0,.35)'; da.lineWidth = 4; for (let k = 0; k < 512; k += 128) { da.beginPath(); da.moveTo(k, 0); da.lineTo(k, 512); da.moveTo(0, k); da.lineTo(512, k); da.stroke(); }
    da.fillStyle = 'rgba(255,255,255,.25)'; for (let y = 10; y < 512; y += 128) for (let x = 10; x < 512; x += 32) { da.beginPath(); da.arc(x, y, 3, 0, 7); da.fill(); }
    const forma = new THREE.Shape(); forma.absarc(0, 0, 6.5, 0, PI * 2, false); const furo = new THREE.Path(); furo.absarc(0, -(HZ - CZ), HR, 0, PI * 2, true); forma.holes.push(furo);
    const dg = new THREE.ShapeGeometry(forma, 48), uvd = dg.attributes.uv; for (let i = 0; i < uvd.count; i++) uvd.setXY(i, uvd.getX(i) / 3, uvd.getY(i) / 3);
    const deck = new THREE.Mesh(dg, toon({ map: T(dc) })); deck.rotation.x = -PI / 2; deck.position.set(0, 0, CZ); deck.receiveShadow = true; g.add(deck);
    add(new THREE.CylinderGeometry(6.5, 6.5, 2, 48, 1, true), toon({ color: '#3f5f9a', side: THREE.DoubleSide }), 0, -1, CZ, g, { cast: false });
    const corpo = add(tbox(15, 140, 15, 8), toon({ map: T(facTex('#3f6fd0', '#1a2048', 4, 4, 15, { lit: 0.5 })) }), 0, -72, CZ, g, { cast: false });
    const poco = add(new THREE.CylinderGeometry(HR, HR, 1.2, 32, 1, true), toon({ color: '#141824', side: THREE.BackSide }), 0, -0.6, HZ, g, { cast: false }); poco.userData.ndSkip = true;
    const fundo = new THREE.Mesh(new THREE.CircleGeometry(HR, 32), bas({ color: '#0a0c14' })); fundo.rotation.x = -PI / 2; fundo.position.set(0, -1.15, HZ); g.add(fundo);
    cil(g, HR + 0.08, HR + 0.08, 0.06, '#8a96aa', 0, -0.03, HZ, { cast: false }, 32);
    const aro = add(new THREE.TorusGeometry(HR + 0.06, 0.05, 10, 40), mc('#9aa6ba'), 0, 0.05, HZ, g); aro.rotation.x = PI / 2;
    // tampa de ferro (pivô na dobradiça de trás)
    const piv = new THREE.Group(); piv.position.set(0, 0.06, HZ - HR); g.add(piv); const tampa = new THREE.Group(); tampa.position.set(0, 0, HR); piv.add(tampa);
    const [tc, ta] = cv(256, 256); ta.fillStyle = '#6a6e78'; ta.fillRect(0, 0, 256, 256); ta.strokeStyle = '#4a4e58'; ta.lineWidth = 8; for (let r0 = 30; r0 < 128; r0 += 30) { ta.beginPath(); ta.arc(128, 128, r0, 0, 7); ta.stroke(); } ta.lineWidth = 6; for (let k = 0; k < 8; k++) { const an = k / 8 * PI * 2; ta.beginPath(); ta.moveTo(128, 128); ta.lineTo(128 + Math.cos(an) * 120, 128 + Math.sin(an) * 120); ta.stroke(); }
    const tmat = [mc('#5a5e68'), toon({ map: T(tc) }), mc('#4a4e58')]; add(new THREE.CylinderGeometry(HR + 0.02, HR + 0.02, 0.09, 40), tmat, 0, 0.045, 0, tampa);
    for (let k = 0; k < 14; k++) { const an = k / 14 * PI * 2; esf(tampa, 0.035, '#b8c0cc', Math.cos(an) * (HR - 0.08), 0.1, Math.sin(an) * (HR - 0.08), { cast: false }); }
    const pega = add(new THREE.TorusGeometry(0.16, 0.03, 8, 20, PI), mc('#b8c0cc'), 0, 0.09, 0.2, tampa); pega.rotation.y = PI / 2; for (const s of [-1, 1]) caixa(g, 0.18, 0.12, 0.12, '#3a3e48', s * 0.35, 0, HZ - HR - 0.04);
    // agulha de prata (topo em 2·agulha m), brilho no topo
    const AG = 30, ag = new THREE.Group(); g.add(ag); const hast = new THREE.Group(); ag.add(hast); add(new THREE.CylinderGeometry(0.02, 0.32, AG, 24), toon({ color: '#dfe6f0', emissive: '#3a4a6a' }), 0, -AG / 2, 0, hast, { cast: false });
    for (let k = 1; k < 9; k++) add(new THREE.TorusGeometry(0.02 + 0.3 * (k * 2.4) / AG + 0.02, 0.025, 8, 24), mc('#9aa8bc'), 0, -k * 2.4, 0, hast, { cast: false }).rotation.x = PI / 2;
    // plataforma redonda na ponta (opção plataforma: 1) — assento com contato p/ boneco sentado no topo; topo da plataforma = ponta + 0,07
    const plat = new THREE.Group(); ag.add(plat); cil(plat, 0.25, 0.25, 0.07, '#c8d0dc', 0, 0, 0, { cast: false }, 32); const pAro = add(new THREE.TorusGeometry(0.25, 0.018, 8, 32), mc('#5a6478'), 0, 0.07, 0, plat, { cast: false }); pAro.rotation.x = PI / 2;
    cil(plat, 0.06, 0.1, 0.12, '#9aa8bc', 0, -0.12, 0, { cast: false }); plat.visible = false;
    const hal = []; for (const [r0, op] of [[0.2, 0.9], [0.45, 0.35], [0.9, 0.12]]) { const h = semTinta(add(new THREE.SphereGeometry(r0, 18, 12), brilho('#d8ecff', op), 0, 0, 0, ag, { cast: false })); hal.push(h); }
    const raioAg = semTinta(add(new THREE.CylinderGeometry(0.4, 0.4, AG, 20, 1, true), brilho('#a8d0ff', 0.12), 0, -AG / 2, 0, ag, { cast: false }));
    const luzAg = new THREE.PointLight('#cfe6ff', 0, 9, 1.4); ag.add(luzAg);
    // coroa art déco: anel de leques prata/azul na borda
    for (let k = 0; k < 36; k++) { const an = k / 36 * PI * 2, x = Math.sin(an) * 6.35, z = CZ + Math.cos(an) * 6.35; if (z > 3.6) continue; const pz = caixa(g, 1.15, 0.7, 0.18, k % 2 ? '#c8d0dc' : '#3f6fd0', x, 0, z, an);
      const lq = add(new THREE.CircleGeometry(0.55, 20, 0, PI), toon({ color: k % 2 ? '#e4e8f0' : '#5a8ae0', side: THREE.DoubleSide }), x, 0.7, z, g); lq.rotation.y = an; }
    // casinha da escada com porta e placa PROIBIDO SUBIR + luz na porta
    caixa(g, 1.7, 2.5, 1.5, '#3a4a6a', 2.7, 0, -4.4, -0.3); const pt = caixa(g, 0.75, 1.9, 0.05, '#2a2e3a', 2.95, 0, -3.62, -0.3);
    const pl = plano(g, 0.9, 0.3, toon({ map: T(texto(256, 86, (a, w, h) => { a.fillStyle = '#c0302a'; a.fillRect(0, 0, w, h); a.strokeStyle = '#fff'; a.lineWidth = 5; a.strokeRect(6, 6, w - 12, h - 12); escreve(a, 'PROIBIDO SUBIR', w / 2, h / 2 + 2, w - 30, 40, '#fff'); })) }), 2.97, 2.05, -3.58, -0.3);
    const lpo = semTinta(add(new THREE.SphereGeometry(0.1, 12, 10), bas({ color: '#ffe08a' }), 2.95, 2.35, -3.5, g, { cast: false })); const Lp = new THREE.PointLight('#ffd08a', 1.4, 5, 1.4); Lp.position.set(2.9, 2.2, -3.2); g.add(Lp);
    // holofote + feixe; antena com luz vermelha; tubos de ventilação; barril; rolo de cabo; lanterna; caixa de ferramentas; bandeira azul
    const hf = new THREE.Group(); hf.position.set(-2.0, 0, -3.3); g.add(hf); for (const s of [-1, 1]) tubo(hf, [s * 0.3, 0, 0], [s * 0.25, 0.7, 0], 0.035, '#3a3e48'); const lata = new THREE.Group(); lata.position.y = 0.75; lata.rotation.set(-1.15, 0, 0.3); hf.add(lata);
    add(new THREE.CylinderGeometry(0.32, 0.26, 0.6, 24), mc('#5a5e68'), 0, 0, 0, lata); const lente = semTinta(add(new THREE.CircleGeometry(0.3, 24), bas({ color: '#fff8d8' }), 0, 0.31, 0, lata, { cast: false })); lente.rotation.x = -PI / 2;
    const feixe = semTinta(add(new THREE.CylinderGeometry(0.3, 2.2, 60, 24, 1, true), brilho('#fff2c0', 0.06), 0, 30.3, 0, lata, { cast: false }));
    const feixe2 = semTinta(add(new THREE.CylinderGeometry(1, 6, 260, 24, 1, true), brilho('#cfe0ff', 0.05), 70, 20, -250, g, { cast: false })); feixe2.rotation.z = 0.35;
    tubo(g, [-3.0, 0, -5.2], [-3.0, 7.5, -5.2], 0.05, '#7a8090'); for (let k = 1; k < 6; k++) tubo(g, [-3.4, k * 1.25, -5.2], [-2.6, k * 1.25, -5.2], 0.025, '#7a8090'); const ant = semTinta(add(new THREE.SphereGeometry(0.12, 12, 10), bas({ color: '#ff3a2a' }), -3.0, 7.6, -5.2, g, { cast: false })); const antH = semTinta(add(new THREE.SphereGeometry(0.4, 12, 10), brilho('#ff3a2a', 0.3), -3.0, 7.6, -5.2, g, { cast: false }));
    for (const [x, z] of [[-1.3, -4.6], [1.0, -4.9]]) { cil(g, 0.12, 0.12, 0.8, '#8a96aa', x, 0, z); const ch = add(new THREE.SphereGeometry(0.24, 16, 10, 0, PI * 2, 0, PI / 2), mc('#9aa6ba'), x, 0.85, z, g); }
    cil(g, 0.28, 0.28, 0.85, '#2a5aa8', 1.75, 0, -2.6); add(new THREE.TorusGeometry(0.28, 0.025, 6, 24), mc('#1a3a78'), 1.75, 0.3, -2.6, g).rotation.x = PI / 2;
    const rc = add(new THREE.TorusGeometry(0.22, 0.08, 10, 24), mc('#e0a020'), -1.45, 0.08, -1.4, g); rc.rotation.x = PI / 2; add(new THREE.TorusGeometry(0.12, 0.07, 10, 20), mc('#e0a020'), -1.45, 0.2, -1.4, g).rotation.x = PI / 2;
    cil(g, 0.08, 0.1, 0.32, '#c0302a', 1.3, 0, -1.2); const ll = semTinta(add(new THREE.SphereGeometry(0.075, 12, 10), bas({ color: '#ffe8a0' }), 1.3, 0.38, -1.2, g, { cast: false })); const Ll = new THREE.PointLight('#ffd890', 0.8, 3, 1.5); Ll.position.set(1.3, 0.5, -1.0); g.add(Ll);
    caixa(g, 0.55, 0.28, 0.28, '#c0392b', -2.2, 0, -1.9, 0.4); tubo(g, [-2.0, 0, -5.3], [-2.0, 2.4, -5.3], 0.025, '#ddd'); plano(g, 0.8, 0.5, toon({ color: '#3f8cff', side: THREE.DoubleSide }), -1.58, 2.15, -5.3);
    // céu: domo de estrelas + lua; cidade acesa lá embaixo
    const [ec, ea] = cv(2048, 1024), re = P.rng(21); for (let i = 0; i < 900; i++) { const y = re() * 560; ea.globalAlpha = 0.35 + re() * 0.65; ea.fillStyle = re() < 0.15 ? '#fff0c0' : '#ffffff'; const s = re() < 0.08 ? 4 : 2; ea.fillRect(re() * 2048, y, s, s); }
    ea.globalAlpha = 1; for (let i = 0; i < 12; i++) { const x = re() * 2048, y = re() * 400; ea.strokeStyle = 'rgba(255,255,255,.9)'; ea.lineWidth = 2; ea.beginPath(); ea.moveTo(x - 8, y); ea.lineTo(x + 8, y); ea.moveTo(x, y - 8); ea.lineTo(x, y + 8); ea.stroke(); }
    const ceu = new THREE.Mesh(new THREE.SphereGeometry(700, 32, 16), bas({ map: T(ec, 2, 1), transparent: true, side: THREE.BackSide, depthWrite: false })); ceu.userData.ndSkip = true; g.add(ceu);
    const lua = semTinta(add(new THREE.CircleGeometry(16, 32), bas({ color: '#fff3c0' }), -120, 170, -420, g, { cast: false })); lua.rotation.set(-0.35, 0.25, 0); semTinta(add(new THREE.CircleGeometry(30, 32), brilho('#fff3c0', 0.12), -119, 170, -419, g, { cast: false })).rotation.set(-0.35, 0.25, 0);
    cidade(g, -115, 101, { chao: '#141a3a', rua: '#ffcf6a', cores: ['#2a3466', '#33285a', '#243a5a', '#3a2f5f'], jan: '#1a2048', teto: '#141a3a', longe: '#1b2250' }, true, { n: 140, r0: 30 });
    lista.noite = { g, chao: () => 0, state(S, f) { const B = S.noite || S.topo_noite || {}, t = f / 30;
      const tp = Math.min(1, Math.max(0, B.tampa ?? 0)); piv.rotation.x = -tp * 1.95;
      const a = Math.max(0, B.agulha ?? 0), topo = a * 2; ag.visible = a > 0.001; ag.position.set(0, topo, HZ);
      const gx = Math.max(0.2, B.agulhaGrossa ?? 1); hast.scale.set(gx, 1, gx); plat.visible = !!B.plataforma;   // agulhaGrossa: raio x N (3 = legível a 150 px)
      const br = Math.min(B.brilhoMax ?? 1, B.brilho ?? Math.min(0.25, a * 1.5));   // halo nunca maior que o prop: padrão <= 0,25 hal.forEach((h, i) => { h.visible = br > 0.02; h.scale.setScalar(Math.min(1, 0.15 + 0.85 * br) * (1 + 0.06 * Math.sin(t * 6 + i))); }); raioAg.visible = br > 0.3;   // halo encolhe com o brilho (não cobre a agulha) raioAg.material.opacity = 0.12 * br; luzAg.intensity = 2.5 * br;
      const hon = B.holofote ?? 1; feixe.visible = lente.visible = !!hon; lata.rotation.z = 0.3 + 0.2 * Math.sin(t * 0.5); feixe2.rotation.z = 0.35 + 0.15 * Math.sin(t * 0.3);
      const pisca = (Math.floor(t * 1.5) % 2) === 0; ant.visible = antH.visible = pisca; } };
  }
}
