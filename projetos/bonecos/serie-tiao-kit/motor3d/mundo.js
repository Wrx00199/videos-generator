// mundo.js — mundos fixos da série Tião, construídos UMA vez e reutilizados em todo vídeo.
// NAVIO (origem): convés, amurada verde-água, mastros, velas listradas, casco vermelho com faixa branca, rede.
// MAR: plano infinito. COZINHA: sala interna em COZ (fechada). ILHA: em ILHA, com um 2º navio ancorado ao fundo.
// Alturas do piso por mundo: use chao(x, z) para pôr pé no chão (ação amarrada "standOn").
import * as THREE from './lib/three.module.js';
import * as P from './paint.js';
import { construirCenarios } from './cenarios.js';
import { construirEfeitos } from './efeitos.js';

export const DECK = 2.8;                       // altura do convés (m) acima do mar
export const COZ = new THREE.Vector3(0, -60, 400);   // canto da cozinha (piso)
export const ILHA = new THREE.Vector3(0, 0, -600);   // centro da praia
export const ILHA_Y = 0.9;                     // areia plana na área de ação

// ---------- ONDAS: soma de 3 senoides (mesma fórmula em GLSL e JS); amp ~0,2 calmo, ~0,9 tempestade; some perto da ilha ----------
const ONDA_GLSL = `
  float fadeIlha(vec2 p){ return smoothstep(25., 70., length(p - vec2(${ILHA.x.toFixed(1)}, ${ILHA.z.toFixed(1)}))); }
  float onda(vec2 p, float t, float amp){ return amp * fadeIlha(p) * (.55*sin(dot(p, vec2(.16,.05)) - t*1.1) + .30*sin(dot(p, vec2(-.07,.21)) - t*1.5 + 1.3) + .15*sin(dot(p, vec2(.33,-.18)) - t*2.3 + .7)); }`;
const ss = (a, b, x) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
export function onda(x, z, t, amp) {
  const f = ss(25, 70, Math.hypot(x - ILHA.x, z - ILHA.z));
  return amp * f * (0.55 * Math.sin(x * 0.16 + z * 0.05 - t * 1.1) + 0.30 * Math.sin(-x * 0.07 + z * 0.21 - t * 1.5 + 1.3) + 0.15 * Math.sin(x * 0.33 - z * 0.18 - t * 2.3 + 0.7));
}
// boia: põe um casco (comprimento c ao longo de x local, largura l) em cima da onda: altura + arfagem + jogo tirados de onda()
export function boia(obj, x, y0, z, ry, c, l, t, amp, k = 1) {
  const cs = Math.cos(ry), sn = Math.sin(ry), h = (dx, dz) => onda(x + cs * dx + sn * dz, z - sn * dx + cs * dz, t, amp);
  const pitch = Math.atan2(h(c / 2, 0) - h(-c / 2, 0), c) * 0.8 * k, roll = Math.atan2(h(0, l / 2) - h(0, -l / 2), l) * 0.8 * k;
  obj.position.set(x, y0 + h(0, 0) * k, z);
  obj.quaternion.setFromEuler(new THREE.Euler(-roll, ry, pitch, 'YXZ')); obj.updateMatrixWorld(true);
}
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;

// ---------- pintores (campos chapados + frestas escuras, estilo da referência) ----------
function tabuas(seed, base, seam, n = 6, w0 = 512, h0 = 512) {
  const [c, g] = cv(w0, h0), r = P.rng(seed), w = h0 / n;
  for (let i = 0; i < n; i++) {
    const d = (r() - 0.5) * 6; g.fillStyle = hsl(base[0], base[1], base[2] + d); g.fillRect(0, i * w, w0, w);
    for (let k = 0; k < 6; k++) { g.strokeStyle = hsl(base[0] - 3, base[1], base[2] + d - 6 - r() * 5, 0.35); g.lineWidth = 1 + r() * 2; g.beginPath(); const y = i * w + 4 + r() * (w - 8); g.moveTo(0, y); g.bezierCurveTo(170, y + r() * 4 - 2, 340, y - r() * 4 + 2, w0, y); g.stroke(); }
    g.fillStyle = hsl(base[0], base[1], base[2] + d + 7, 0.8); g.fillRect(0, i * w + 3, w0, 2);
    g.fillStyle = seam; g.fillRect(0, i * w, w0, 3.5);
    const cut = r() * w0; g.fillRect(cut, i * w, 3, w);
    if (r() < 0.45) { g.fillStyle = hsl(base[0], base[1], base[2] - 12, 0.7); g.beginPath(); g.ellipse(r() * w0, i * w + w / 2, 7, 4, 0, 0, 7); g.fill(); }
  }
  return c;
}
function listras(n = 6, cA = '#d8402e', cB = '#f6efe2') { const [c, g] = cv(512, 512), w = 512 / n;
  for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? cB : cA; g.fillRect(i * w, 0, w, 512); }
  const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, 'rgba(255,255,255,.12)'); gr.addColorStop(.6, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(60,20,40,.18)'); g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = 'rgba(90,40,40,.35)'; g.lineWidth = 3; for (let i = 1; i < n; i++) { g.beginPath(); g.moveTo(i * w, 0); g.lineTo(i * w, 512); g.stroke(); }
  return c; }
function casco(h = 9, sa = 80, l = 44, seam = 'rgba(120,20,8,.55)') { const [c, g] = cv(512, 512), r = P.rng(5);
  g.fillStyle = hsl(h, sa, l); g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 8; i++) { g.fillStyle = hsl(h, sa, l + (r() - 0.5) * 4); g.fillRect(0, i * 64, 512, 64); g.fillStyle = seam; g.fillRect(0, i * 64, 512, 2.5); }
  return c; }
function areia(seed = 3) { const [c, g] = cv(512, 512), r = P.rng(seed);
  g.fillStyle = '#f1cf8f'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 26; i++) { g.fillStyle = r() < 0.5 ? 'rgba(226,182,118,.35)' : 'rgba(250,224,170,.4)'; g.beginPath(); g.ellipse(r() * 512, r() * 512, 40 + r() * 90, 14 + r() * 30, r() * 3, 0, 7); g.fill(); }
  for (let i = 0; i < 160; i++) { g.fillStyle = 'rgba(190,140,90,.35)'; g.beginPath(); g.arc(r() * 512, r() * 512, 1 + r() * 1.5, 0, 7); g.fill(); }
  return c; }
function folhaTex() { const [c, g] = cv(256, 512);
  g.fillStyle = '#5ab04c'; g.beginPath(); g.moveTo(128, 0); g.quadraticCurveTo(250, 200, 128, 512); g.quadraticCurveTo(6, 200, 128, 0); g.fill();
  g.fillStyle = '#3f8f3a'; g.beginPath(); g.moveTo(128, 0); g.quadraticCurveTo(250, 200, 128, 512); g.lineTo(128, 0); g.fill();
  g.strokeStyle = '#2f6b2c'; g.lineWidth = 6; g.beginPath(); g.moveTo(128, 6); g.lineTo(128, 506); g.stroke();
  g.globalCompositeOperation = 'destination-out'; for (let i = 1; i < 12; i++) { const y = i * 40; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(128 + s * 140, y - 30); g.lineTo(128 + s * 18, y + 6); g.lineTo(128 + s * 140, y - 10); g.fill(); } }
  return c; }

export function build(E) {
  const { scene, add, tbox, box, toon, M } = E;
  const T = (c, rx = 1, ry = 1) => P.tex(c, rx, ry);
  const mat = {
    deck: toon({ map: T(tabuas(1, [36, 88, 66], 'rgba(87,30,0,.95)', 8)) }),
    teal: toon({ map: T(tabuas(2, [180, 30, 66], 'rgba(60,110,120,.9)', 4)) }),
    tealDark: toon({ color: '#5f9ea4' }),
    hull: toon({ map: T(casco()) }), white: toon({ color: '#f4efe4' }), port: toon({ color: '#f5c542' }), portRim: toon({ color: '#7a4a24' }),
    wood: toon({ map: T(tabuas(4, [28, 55, 42], 'rgba(60,25,8,.9)', 3)) }), mast: toon({ color: '#9a6236' }), rope: toon({ color: '#c9a66b' }),
    sail: toon({ map: T(listras()), side: THREE.DoubleSide }), flag: toon({ color: '#d8322a', side: THREE.DoubleSide }),
    iron: toon({ color: '#596474' }), gold: toon({ color: '#e8b33a' }), cloth: toon({ color: '#ead9a8', side: THREE.DoubleSide }),
    sand: toon({ map: T(areia(), 30, 30) }), sandWet: toon({ color: '#d8b07a' }), rock: toon({ map: T(P.mossy(P.rocha(), 5, 0.35)) }),
    trunk: toon({ map: T(tabuas(7, [30, 40, 46], 'rgba(70,40,20,.8)', 10, 256, 512)) }), leaf: toon({ map: T(folhaTex()), alphaTest: 0.5, side: THREE.DoubleSide }),
    galW: toon({ map: T(tabuas(8, [30, 60, 52], 'rgba(70,30,8,.9)', 6)) }), galF: toon({ map: T(tabuas(9, [32, 70, 58], 'rgba(80,30,6,.95)', 8)) }),
    fire: new THREE.MeshBasicMaterial({ color: '#ffb347' }), glass: new THREE.MeshBasicMaterial({ color: '#2a3a6a' }), dark: toon({ color: '#3a2a3a' }),
  };
  const noInk = (m) => { m.userData.nd = E.waterNd; return m; };

  // ---------- NAVIO ----------
  const navio = new THREE.Group(); scene.add(navio);
  const L = 16, B = 5.2;                       // comprimento, boca
  const L_ = L + 2, B_ = B + 1; let AMP = 0.25, TT = 0;
  // casco: perfil extrudado (proa pontuda em +x, popa reta em -x), afunila para baixo
  const hullShape = new THREE.Shape(); hullShape.moveTo(-L / 2, 0.2); hullShape.lineTo(L / 2 - 2.5, 0.2); hullShape.quadraticCurveTo(L / 2 + 1.2, 0.3, L / 2 + 1.6, DECK + 0.95); hullShape.lineTo(-L / 2 - 0.4, DECK + 0.95); hullShape.lineTo(-L / 2 - 0.2, DECK - 0.4); hullShape.lineTo(-L / 2, 0.2);
  const hullGeo = new THREE.ExtrudeGeometry(hullShape, { depth: B, bevelEnabled: true, bevelThickness: 0.5, bevelSize: 0.5, bevelSegments: 3, curveSegments: 16 });
  hullGeo.translate(0, -1.6, -B / 2); { const uv = hullGeo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 4, uv.getY(i) / 4); }
  add(hullGeo, mat.hull, 0, 0, 0, navio);
  // faixa branca e escotilhas nos dois bordos
  for (const s of [-1, 1]) {
    const st = add(box(L + 0.6, 0.6, 0.06), mat.white, 0.2, DECK - 0.75, s * (B / 2 + 0.53), navio, { cast: false });
    for (let i = 0; i < 5; i++) { const x = -L / 2 + 2.2 + i * 2.6; const pr = add(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 20), mat.portRim, x, DECK - 1.55, s * (B / 2 + 0.52), navio, { cast: false }); pr.rotation.x = Math.PI / 2; const pg = add(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 20), mat.port, x, DECK - 1.55, s * (B / 2 + 0.55), navio, { cast: false }); pg.rotation.x = Math.PI / 2; }
  }
  // convés
  const conv = add(tbox(L + 0.6, 0.2, B + 0.6, 1.4), mat.deck, 0.2, DECK - 0.1, 0, navio);
  // amurada verde-água (bordos + popa), com corrimão
  for (const s of [-1, 1]) { add(tbox(L + 0.8, 0.95, 0.16, 1.6), mat.teal, 0.2, DECK + 0.47, s * (B / 2 + 0.36), navio); add(tbox(L + 1, 0.12, 0.3, 1), mat.tealDark, 0.2, DECK + 0.98, s * (B / 2 + 0.36), navio); }
  add(tbox(0.16, 0.95, B + 0.8, 1.6), mat.teal, -L / 2 - 0.25, DECK + 0.47, 0, navio);
  // castelo de popa (silhueta de navio) com amurada própria
  add(tbox(3.2, 1.3, B + 1.0, 1.4), mat.hull, -L / 2 + 1.3, DECK + 0.65, 0, navio); add(tbox(3.4, 0.14, B + 1.1, 1.4), mat.deck, -L / 2 + 1.3, DECK + 1.36, 0, navio);
  for (const s of [-1, 1]) { add(box(3.3, 0.3, 0.06), mat.white, -L / 2 + 1.3, DECK + 0.9, s * (B / 2 + 0.53), navio, { cast: false }); add(tbox(3.4, 0.7, 0.14, 1.6), mat.teal, -L / 2 + 1.3, DECK + 1.75, s * (B / 2 + 0.45), navio); }
  // proa: pequena elevação + gurupés
  const bow = add(new THREE.CylinderGeometry(0.12, 0.16, 5, 8), mat.mast, L / 2 + 2.6, DECK + 1.6, 0, navio); bow.rotation.z = Math.PI / 2 - 0.35;
  // mastros, vergas, velas listradas, bandeira
  const mastros = [];
  const mastro = (x, h, sails) => {
    const g = new THREE.Group(); g.position.set(x, DECK, 0); navio.add(g);
    add(new THREE.CylinderGeometry(0.16, 0.22, h, 10), mat.mast, 0, h / 2, 0, g);
    add(new THREE.CylinderGeometry(0.55, 0.45, 0.45, 12), mat.wood, 0, h * 0.78, 0, g);       // cesto da gávea
    for (const [y, w, hh] of sails) {
      add(new THREE.CylinderGeometry(0.08, 0.08, w + 0.6, 8), mat.mast, 0, y, 0, g).rotation.x = Math.PI / 2;
      const sg = new THREE.PlaneGeometry(w, hh, 8, 6); const pa = sg.attributes.position;
      for (let i = 0; i < pa.count; i++) { const u = pa.getX(i) / w, v = pa.getY(i) / hh; pa.setZ(i, 0); pa.setX(i, pa.getX(i)); pa.setY(i, pa.getY(i)); pa.setZ(i, 0); pa.setX(i, 0.0); pa.setX(i, (1 - Math.pow(2 * u, 2)) * 0.55 * (0.6 + v * 0.4)); pa.setZ(i, u * w); }
      const sail = add(sg, mat.sail, 0.1, y - hh / 2 - 0.05, 0, g); sail.userData.sail = pa.array.slice(); mastros.push(sail);
    }
    return g;
  };
  const mm = mastro(0.6, 11, [[9.4, 4.6, 3.1], [5.9, 5.2, 3.0]]);
  mastro(5.4, 8.5, [[7.2, 3.8, 2.6], [4.4, 4.2, 2.3]]);
  mastro(-3.3, 8.0, [[6.8, 3.4, 2.3], [4.3, 3.8, 2.1]]);   // 3º mastro (FOLHA_MODELO tem 3)
  const flag = add(new THREE.PlaneGeometry(1.4, 0.8, 6, 3), mat.flag, 0.6 - 0.75, DECK + 11.4, 0, navio, { cast: false }); flag.userData.base = flag.geometry.attributes.position.array.slice();
  add(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6), mat.mast, 0.6, DECK + 11.5, 0, navio);
  // cordas (enxárcias) do mastro principal até a amurada
  for (const s of [-1, 1]) for (const dx of [-1.2, 0, 1.2]) { const a = new THREE.Vector3(0.6 + dx, DECK + 1, s * (B / 2 + 0.36)), b = new THREE.Vector3(0.6, DECK + 8.6, 0); const d = b.clone().sub(a); const c = add(new THREE.CylinderGeometry(0.025, 0.025, d.length(), 5), mat.rope, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, navio, { cast: false }); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); }
  // timão na popa, barris e caixotes
  const tim = new THREE.Group(); tim.position.set(-6.4, DECK + 2.6, 0); navio.add(tim); add(tbox(0.3, 1.2, 0.3, 1), mat.wood, 0, -0.6, 0, tim);
  { const w = add(new THREE.TorusGeometry(0.5, 0.05, 6, 20), mat.wood, 0.18, 0.15, 0, tim); w.rotation.y = Math.PI / 2; for (let i = 0; i < 4; i++) { const sp = add(new THREE.CylinderGeometry(0.03, 0.03, 1.3, 5), mat.wood, 0.18, 0.15, 0, tim); sp.rotation.x = i * Math.PI / 4; } }
  const barril = (x, z, par = navio, y = DECK) => { const g = add(new THREE.CylinderGeometry(0.38, 0.38, 0.95, 14), mat.wood, x, y + 0.48, z, par); add(new THREE.TorusGeometry(0.39, 0.035, 5, 18), mat.iron, x, y + 0.2, z, par, { cast: false }).rotation.x = Math.PI / 2; add(new THREE.TorusGeometry(0.39, 0.035, 5, 18), mat.iron, x, y + 0.78, z, par, { cast: false }).rotation.x = Math.PI / 2; return g; };
  barril(4.2, -2, navio); barril(3.4, -2.1, navio); add(tbox(0.8, 0.7, 0.8, 1), mat.wood, -4.5, DECK + 0.35, -2, navio); add(tbox(0.6, 0.5, 0.6, 1), mat.wood, -4.4, DECK + 0.95, -2.05, navio);
  // rede: poste na popa + rede em calha (a frente esconde o corpo de quem deita -> ação amarrada lieIn)
  const REDE = { a: new THREE.Vector3(-0.2, DECK + 1.35, 1.6), b: new THREE.Vector3(-3.8, DECK + 1.35, 1.6) };
  add(new THREE.CylinderGeometry(0.1, 0.12, 2.3, 8), mat.mast, -4.0, DECK + 1.15, 1.6, navio).userData.rede = true;
  const redeG = new THREE.Group(); navio.add(redeG); redeG.userData.rede = true;
  { // rede = calha de pano com barriga (u ao longo, v através); borda da frente cobre quem deita
    const len = REDE.a.distanceTo(REDE.b) - 0.3, g = new THREE.PlaneGeometry(1, 1, 20, 10), pa = g.attributes.position;
    for (let i = 0; i < pa.count; i++) { const u = pa.getX(i) + 0.5, v = pa.getY(i) * 2, k = Math.sin(u * Math.PI), sag = 0.32 * k;
      pa.setXYZ(i, REDE.b.x + 0.15 + u * len, DECK + 1.35 - sag - 0.42 * k * (1 - v * v) + 0.16 * k * Math.max(0, v) ** 2, 1.6 + v * 0.5 * (0.25 + 0.75 * k)); }
    g.computeVertexNormals(); add(g, mat.cloth, 0, 0, 0, redeG);
    for (const [p, s] of [[REDE.a, 1], [REDE.b, -1]]) { const c = add(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 4), mat.rope, p.x - s * 0.1, DECK + 1.4, 1.6, redeG, { cast: false }); c.rotation.z = s * 1.2; } }
  REDE.centro = new THREE.Vector3((REDE.a.x + REDE.b.x) / 2, DECK + 0.78, 1.6);

  // ---------- MAR ----------
  // ondas de verdade: a MESMA função em GLSL (vértices + espuma) e em JS (onda(), navios/bote/chao) -> nada afunda nem flutua
  const waterU = { t: { value: 0 }, amp: { value: 0.25 }, deep: { value: new THREE.Color('#05678f') }, shal: { value: new THREE.Color('#1194b6') }, glint: { value: new THREE.Color('#e9f6ff') }, near: { value: new THREE.Vector3(0, 0, 0) },
    navs: { value: [new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4()] } };
  const marVS = `uniform float t, amp; ${ONDA_GLSL}
      varying vec3 vW; varying float vH;
      void main(){ vec4 w = modelMatrix*vec4(position,1.); w.y = onda(w.xz, t, amp); vH = w.y; vW = w.xyz; vec4 mvPosition = viewMatrix*w; gl_Position = projectionMatrix*mvPosition;`;
  const waterMat = new THREE.ShaderMaterial({
    uniforms: { ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), ...waterU }, fog: true,
    vertexShader: `#include <fog_pars_vertex>
      ${marVS}
      #include <fog_vertex>
      }`,
    fragmentShader: `#include <fog_pars_fragment>
      uniform float t, amp; uniform vec3 deep, shal, glint, near; uniform vec4 navs[3]; varying vec3 vW; varying float vH;
      ${ONDA_GLSL}
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
      void main(){
        float a = max(amp, .001) * fadeIlha(vW.xz);
        float e = .6; vec2 g = vec2(onda(vW.xz + vec2(e,0.), t, amp) - onda(vW.xz - vec2(e,0.), t, amp), onda(vW.xz + vec2(0.,e), t, amp) - onda(vW.xz - vec2(0.,e), t, amp)) / (2.*e);
        float lit = clamp(.5 - dot(g, vec2(.55, .35)) * 2.2, 0., 1.);
        lit = floor(lit * 3. + .5) / 3.;                                   // 3 faixas de valor (pintado, sem reflexo)
        float n = noise(vW.xz*vec2(.06,.18) + vec2(t*.05, 0.)) * .6 + noise(vW.xz*.31 + 7.) * .4;
        vec3 c = mix(deep, shal, .18 + .32*n + .35*lit);
        float sh = 1. - smoothstep(30., 55., length(vW.xz - vec2(${ILHA.x.toFixed(1)}, ${ILHA.z.toFixed(1)})));
        c = mix(c, vec3(.35,.85,.85), sh*.55);
        float hn = vH / a;                                                 // -1..1
        float crest = smoothstep(.80, .86, noise(vW.xz*vec2(.55,2.2) + vec2(t*.4, t*.15)));
        c = mix(c, glint, crest*.45*(1.-sh));
        // espuma em traços curvos nas cristas (esparsa; some no mar calmo)
        float tr = smoothstep(.55, .75, hn) * smoothstep(.5, .62, noise(vW.xz*vec2(.35,1.4) + vec2(t*.3, 0.)));
        tr *= step(.5, fract((vW.x*.7 + vW.z*.25 + sin(vW.z*.4)*1.2) * .5)) * smoothstep(.15, .45, amp);
        c = mix(c, vec3(.96,.98,1.), tr*.9);
        // espuma batendo no casco (elipse em volta de cada navio, pulsando com a onda)
        for (int k = 0; k < 3; k++) { vec4 s = navs[k]; if (s.w < .5) continue;
          vec2 d = vW.xz - s.xy; float cs = cos(s.z), sn = sin(s.z); vec2 l = vec2(cs*d.x - sn*d.y, sn*d.x + cs*d.y);
          float el = length(l / vec2(10.4, 3.9)), pul = .12 + .1*sin(t*3. + l.x*.6) + .15*amp;
          float f = smoothstep(.86, .97, el) * (1. - smoothstep(1., 1. + pul, el)) * smoothstep(.3, .55, noise(l*vec2(.9,2.) + t*.7));
          c = mix(c, vec3(.97,.99,1.), f); }
        gl_FragColor = vec4(c,1.);
        #include <fog_fragment>
      }`,
  });
  // malha densa perto da câmera (0,5 m) e larga no horizonte; segue a câmera em passos de 8 m (sem "nadar")
  const marGeo = new THREE.PlaneGeometry(2, 2, 240, 240); { const pa = marGeo.attributes.position; const f = (u) => Math.sign(u) * (Math.abs(u) * 60 + Math.abs(u) ** 4 * 1940);
    for (let i = 0; i < pa.count; i++) pa.setXY(i, f(pa.getX(i)), f(pa.getY(i))); }
  const marNd = new THREE.ShaderMaterial({ uniforms: waterU, vertexShader: `varying float vD; ${marVS.replace('vec4 mvPosition = viewMatrix*w; gl_Position = projectionMatrix*mvPosition;', 'vec4 mv = viewMatrix*w; vD = -mv.z; gl_Position = projectionMatrix*mv;')} }`,
    fragmentShader: `varying float vD; void main(){ gl_FragColor=vec4(.25,1.,.5,vD); }` });
  const mar = new THREE.Mesh(marGeo, waterMat); mar.rotation.x = -Math.PI / 2; mar.userData.nd = marNd; mar.receiveShadow = false; mar.frustumCulled = false; scene.add(mar);
  mar.onBeforeRender = (r, sc, cam) => { const x = Math.round(cam.position.x / 8) * 8, z = Math.round(cam.position.z / 8) * 8; if (mar.position.x !== x || mar.position.z !== z) { mar.position.set(x, 0, z); mar.updateMatrixWorld(); } };
  // espuma no casco (anel achatado, sem tinta)
  const foam = add(new THREE.TorusGeometry(1, 0.08, 6, 40), new THREE.MeshBasicMaterial({ color: '#eaf6ff' }), 0.4, 0.02, 0, navio, { cast: false }); foam.rotation.x = Math.PI / 2; foam.scale.set(L / 2 + 1.4, B / 2 + 1, 1); foam.userData.ndSkip = true; foam.visible = false;

  // ---------- COZINHA (sala fechada em COZ) ----------
  const coz = new THREE.Group(); coz.position.copy(COZ); scene.add(coz);
  { const w = 9, d = 6, h = 3.6;
    add(tbox(w, 0.2, d, 1.4), mat.galF, 0, -0.1, 0, coz); add(tbox(w, 0.2, d, 2), mat.galW, 0, h, 0, coz);
    add(tbox(w, h, 0.2, 2), mat.galW, 0, h / 2, -d / 2, coz); for (const s of [-1, 1]) add(tbox(0.2, h, d, 2), mat.galW, s * w / 2, h / 2, 0, coz);
    for (let i = 0; i < 4; i++) add(tbox(0.3, 0.3, d, 1), mat.wood, -3.4 + i * 2.3, h - 0.25, 0, coz);       // vigas do teto
    // fogão de ferro com fogo e panela de cobre
    add(tbox(1.6, 0.9, 1.0, 1), mat.iron, -2.4, 0.45, -2.4, coz); const fogo = add(box(0.7, 0.3, 0.05), new THREE.MeshBasicMaterial({ color: '#ffb347' }), -2.4, 0.4, -1.88, coz, { cast: false }); fogo.userData.ndSkip = false; FOG.boca = fogo;
    // registro do gás/lenha (V5): botão de latão na frente do fogão, gira com S.fogao.registro (0 aberto .. 1 fechado)
    { const r = new THREE.Group(); r.position.set(-1.85, 0.72, -1.87); coz.add(r); add(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 16), mat.gold, 0, 0, 0, r, { cast: false }).rotation.x = Math.PI / 2; add(box(0.04, 0.15, 0.04), mat.dark, 0, 0, 0.04, r, { cast: false }); FOG.registro = r; }
    add(new THREE.CylinderGeometry(0.45, 0.38, 0.55, 48), toon({ color: '#c8743a' }), -2.4, 1.18, -2.4, coz); add(new THREE.TorusGeometry(0.45, 0.035, 10, 48), toon({ color: '#e0965a' }), -2.4, 1.455, -2.4, coz, { cast: false }).rotation.x = Math.PI / 2;   // panela lisa com borda (V5: 18 faces lia como serrada)
    add(tbox(0.55, 0.35, 0.5, 1), mat.wood, -1.25, 0.175, -2.3, coz);   // caixote do Tião (ele é baixinho) ao lado do fogão
    add(new THREE.CylinderGeometry(0.12, 0.12, 2.6, 8), mat.iron, -2.4, 2.3, -2.7, coz);
    // prateleiras com potes, escotilha redonda com mar
    for (const y of [1.6, 2.3]) { add(tbox(2.6, 0.08, 0.4, 1), mat.wood, 1.8, y, -2.75, coz); for (let k = 0; k < 4; k++) add(new THREE.CylinderGeometry(0.13, 0.13, 0.32, 10), k % 2 ? toon({ color: '#9fd4c8' }) : toon({ color: '#e8b04a' }), 0.9 + k * 0.6, y + 0.2, -2.72, coz); }
    const jan = add(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 24), mat.glass, -0.2, 2.1, -2.88, coz, { cast: false }); jan.rotation.x = Math.PI / 2;
    const janR = add(new THREE.TorusGeometry(0.44, 0.07, 8, 24), mat.port, -0.2, 2.1, -2.86, coz, { cast: false });
    // mesa com vela (flashback do mapa)
    add(tbox(2.2, 0.1, 1.2, 1), mat.wood, 1.4, 0.95, -0.6, coz); for (const [x, z] of [[0.45, -1.1], [2.35, -1.1], [0.45, -0.1], [2.35, -0.1]]) add(tbox(0.1, 0.9, 0.1, 1), mat.wood, x, 0.45, z, coz);
    add(new THREE.CylinderGeometry(0.05, 0.06, 0.25, 10), mat.white, 2.1, 1.12, -0.85, coz); add(new THREE.SphereGeometry(0.05, 8, 8), mat.fire, 2.1, 1.3, -0.85, coz, { cast: false });
    barril(-3.6, 1.8, coz, 0); barril(-3.7, 1.0, coz, 0);
  }
  // porta da cozinha (parede da direita, x = +4.4): abre em S.porta 0..1; atrás dela, contraluz quente (corredor em chamas da volta 4.000)
  { const g = new THREE.Group(); g.position.set(COZ.x + 4.3, COZ.y, COZ.z + 0.2 - 0.6); scene.add(g); FOG.porta = g;
    const fol = add(tbox(0.1, 2.2, 1.2, 1), mat.wood, 0, 1.1, 0.6, g); add(new THREE.SphereGeometry(0.05, 10, 8), mat.gold, -0.08, 1.05, 1.05, g, { cast: false });
    for (const y of [0.45, 1.75]) add(box(0.12, 0.08, 1.15), mat.iron, 0, y, 0.6, g, { cast: false });
    const luz = add(new THREE.PlaneGeometry(1.2, 2.2), new THREE.MeshBasicMaterial({ color: '#ffb46a' }), COZ.x + 4.385, COZ.y + 1.1, COZ.z + 0.2, scene, { cast: false }); luz.rotation.y = -Math.PI / 2; luz.userData.ndSkip = true; FOG.contraluz = luz;
    add(tbox(0.16, 0.14, 1.5, 1), mat.wood, COZ.x + 4.4, COZ.y + 2.27, COZ.z + 0.2, scene); for (const s2 of [-1, 1]) add(tbox(0.16, 2.3, 0.14, 1), mat.wood, COZ.x + 4.4, COZ.y + 1.15, COZ.z + 0.2 + s2 * 0.68, scene); }
  // chamas do fogão (cartões pintados): laranja e azul cruzam pela S.fogao.azul; tamanho S.fogao.chama (0 apaga)
  // chama em cima do fogão, lambendo o fundo da panela (base apoiada no tampo y = 0,9): cartão 1,2 x 1 m escalado por S.fogao.chama
  { const T = texturasBatalha(); const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.0), new THREE.MeshBasicMaterial({ map: T.chama[0], transparent: true, depthWrite: false }));
    m.userData.ndSkip = true; m.renderOrder = 3; m.onBeforeRender = (r, sc, cam) => { m.quaternion.copy(cam.quaternion); m.updateMatrixWorld(); }; scene.add(m); FOG.chama = m; FOG.T = T; FOG.luz = new THREE.PointLight('#ff9a3a', 0, 7, 1.6); FOG.luz.position.set(COZ.x - 2.4, COZ.y + 1.2, COZ.z - 1.4); scene.add(FOG.luz); }
  // chaminé da cozinha no convés (PISTA do V5: fumaça cresce a cada volta, S.chamine 0..1)
  { const c = add(new THREE.CylinderGeometry(0.16, 0.2, 1.3, 12), mat.iron, -2.2, DECK + 0.65, -1.9, navio); add(new THREE.CylinderGeometry(0.26, 0.2, 0.16, 12), mat.dark, -2.2, DECK + 1.36, -1.9, navio, { cast: false }); FOG.chamine = new THREE.Vector3(-2.2, DECK + 1.5, -1.9); }
  const lampada = new THREE.PointLight('#ffb05a', 0, 12, 1.5); lampada.position.set(COZ.x - 1, COZ.y + 2.6, COZ.z + 0.5); scene.add(lampada);

  // ---------- ILHA ----------
  const ilha = new THREE.Group(); ilha.position.copy(ILHA); scene.add(ilha);
  const dunas = (x, z) => 0.18 * Math.sin(x * 0.35 + 1) * Math.cos(z * 0.28) + 0.1 * Math.sin(x * 0.9 + z * 0.6);
  const chaoIlha = (x, z) => { const r = Math.hypot(x, z * 1.15); const k = 1 - THREE.MathUtils.smoothstep(r, 18, 46); return -1.2 + (ILHA_Y + 1.2) * k + dunas(x, z) * k * THREE.MathUtils.smoothstep(r, 3, 14); };
  { const g = new THREE.PlaneGeometry(110, 110, 110, 110); g.rotateX(-Math.PI / 2); const pa = g.attributes.position;
    for (let i = 0; i < pa.count; i++) pa.setY(i, chaoIlha(pa.getX(i), pa.getZ(i)));
    g.computeVertexNormals(); { const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 1, uv.getY(i) * 1); }
    const s = add(g, mat.sand, 0, 0, 0, ilha, { cast: false }); s.material.map.repeat.set(14, 14); }
  // palmeira: tronco curvo em gomos + leque de folhas
  const palmeira = (x, z, h, lean, rot) => {
    const g = new THREE.Group(); g.position.set(x, chaoIlha(x, z), z); g.rotation.y = rot; ilha.add(g);
    let p = new THREE.Vector3(), n = 9;
    for (let i = 0; i < n; i++) { const u = i / n, seg = h / n; const q = new THREE.Vector3(Math.pow(u + 1 / n, 2) * lean, (i + 1) * seg, 0); const d = q.clone().sub(p);
      const c = add(new THREE.CylinderGeometry(0.17 - u * 0.05, 0.22 - u * 0.05, d.length() + 0.04, 9), mat.trunk, (p.x + q.x) / 2, (p.y + q.y) / 2, 0, g); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
      add(new THREE.TorusGeometry(0.2 - u * 0.05, 0.035, 5, 12), mat.wood, q.x, q.y - 0.03, 0, g, { cast: false }).rotation.x = Math.PI / 2; p = q; }
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; const lf = new THREE.Group(); lf.position.copy(p); lf.rotation.y = a; g.add(lf);
      const pg = new THREE.PlaneGeometry(1.1, 3.2, 1, 6); pg.translate(0, 1.6, 0); const pa = pg.attributes.position; for (let i = 0; i < pa.count; i++) { const v = pa.getY(i) / 3.2; pa.setZ(i, -v * v * 1.6); }
      pg.rotateX(-Math.PI / 2 + 0.55); const m = add(pg, mat.leaf, 0, 0, 0, lf); }
    for (let k = 0; k < 3; k++) add(new THREE.SphereGeometry(0.18, 10, 8), toon({ color: '#6b4325' }), p.x + Math.cos(k * 2) * 0.22, p.y - 0.25, Math.sin(k * 2) * 0.22, g);
    return { g, topo: p.clone().applyEuler(g.rotation).add(g.position) };
  };
  const PALMA = { x: -3.2, z: -2.5 };
  palmeira(PALMA.x, PALMA.z, 7, 1.6, 0.4); palmeira(9, -9, 8.5, -2.2, 2.2); palmeira(-12, -11, 7.5, 1.9, -0.6); palmeira(14, 3, 6.5, 2.4, 1.2);
  // pedra grande com musgo
  const PEDRA = { x: 4.2, z: -1.8 };
  // pedra LISA: esfera indexada (normais suaves) deformada por ruído de baixa frequência.
  // Icosahedron do three é não-indexado -> normais chapadas -> a tinta risca cada faceta (bug "pedra de arame" do V4).
  const pedraLisa = (r0, seed, achata = 0.75) => { const g = new THREE.SphereGeometry(r0, 28, 18); const pa = g.attributes.position; const rr = P.rng(seed); const k = [rr() * 6, rr() * 6, rr() * 6];
    for (let i = 0; i < pa.count; i++) { const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i); const n = 1 + 0.09 * Math.sin(x * 1.7 + k[0]) * Math.cos(z * 1.3 + k[1]) + 0.05 * Math.sin(y * 2.3 + k[2]); pa.setXYZ(i, x * n, y * achata * n, z * n * 0.92); }
    g.computeVertexNormals(); return g; };
  { add(pedraLisa(1.5, 7), mat.rock, PEDRA.x + 0.6, chaoIlha(PEDRA.x, PEDRA.z) + 0.6, PEDRA.z - 0.8, ilha); add(pedraLisa(0.6, 9, 0.7), mat.rock, PEDRA.x + 2, chaoIlha(PEDRA.x + 2, PEDRA.z) + 0.2, PEDRA.z - 0.2, ilha); }
  // arbustos e conchas
  { const r = P.rng(21); for (let i = 0; i < 14; i++) { const a = r() * 6.28, d = 10 + r() * 9, x = Math.cos(a) * d, z = -Math.abs(Math.sin(a) * d) - 4; add(new THREE.SphereGeometry(0.6 + r() * 0.6, 10, 8), toon({ color: r() < 0.5 ? '#6ca937' : '#5a9a30' }), x, chaoIlha(x, z) + 0.2, z, ilha).scale.y = 0.7; } }
  // buracos (aparecem por progresso) e montes de areia
  const buraco = (x, z) => { const g = new THREE.Group(); g.position.set(x, chaoIlha(x, z) + 0.015, z); ilha.add(g);
    const h = add(new THREE.CircleGeometry(0.55, 24), toon({ color: '#7a5434' }), 0, 0, 0, g, { cast: false }); h.rotation.x = -Math.PI / 2;
    const h2 = add(new THREE.CircleGeometry(0.4, 24), toon({ color: '#4a2f22' }), 0, 0.005, 0.03, g, { cast: false }); h2.rotation.x = -Math.PI / 2;
    const monte = add(new THREE.SphereGeometry(0.6, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat.sandWet, 0.9, -0.02, -0.35, g); monte.scale.set(1, 0.5, 0.8);
    g.visible = false; return { g, h, h2, monte }; };
  const BUR = { beto: buraco(PALMA.x + 0.7, PALMA.z + 0.9), zeca: buraco(PEDRA.x - 1.1, PEDRA.z + 1.2), tiao: buraco(0.6, 4.2) };
  // baú 3D (tampa com dobradiça; ferragens douradas)
  const bau = new THREE.Group(); ilha.add(bau); bau.visible = false;
  { add(tbox(0.9, 0.5, 0.56, 0.6), mat.wood, 0, 0.25, 0, bau); for (const x of [-0.3, 0.3]) add(box(0.07, 0.52, 0.6), mat.gold, x, 0.25, 0, bau, { cast: false });
    const tampa = new THREE.Group(); tampa.position.set(0, 0.5, -0.28); bau.add(tampa);
    const tg = new THREE.CylinderGeometry(0.28, 0.28, 0.9, 16, 1, false, 0, Math.PI); const t = add(tg, toon({ color: '#' + mat.wood.color.getHexString(), map: mat.wood.map || null, side: THREE.DoubleSide }), 0, 0, 0.28, tampa); t.rotation.z = Math.PI / 2; t.rotation.y = 0; t.rotation.x = 0;
    for (const x of [-0.3, 0.3]) { const b = add(new THREE.CylinderGeometry(0.29, 0.29, 0.07, 16, 1, false, 0, Math.PI), mat.gold, x, 0, 0.28, tampa, { cast: false }); b.material = toon({ color: '#d4a017', side: THREE.DoubleSide }); b.rotation.z = Math.PI / 2; }
    add(box(0.14, 0.16, 0.05), mat.gold, 0, 0.42, 0.3, bau, { cast: false }); bau.userData.tampa = tampa;
    add(box(0.78, 0.02, 0.44), toon({ color: '#3a2420' }), 0, 0.505, 0, bau, { cast: false });   // fundo escuro do baú aberto
    const papel = add(box(0.3, 0.012, 0.22), toon({ color: '#f4e6bf' }), 0.05, 0.52, 0.02, bau, { cast: false }); papel.rotation.y = 0.2; bau.userData.papel = papel;
    const brilho = add(new THREE.SphereGeometry(0.22, 16, 12), new THREE.MeshBasicMaterial({ color: '#ffe9a0', transparent: true, opacity: 0.0, depthWrite: false }), 0, 0.58, 0, bau, { cast: false }); brilho.userData.ndSkip = true; bau.userData.brilho = brilho; }
  // pegadas na areia (até 14, ligadas por S.pegadas = [[x,z,ang],...] em coords locais)
  const pegadas = []; for (let i = 0; i < 14; i++) { const m = add(new THREE.CircleGeometry(0.09, 12), toon({ color: '#c99a5c' }), 0, 0, 0, ilha, { cast: false }); m.rotation.x = -Math.PI / 2; m.scale.set(0.6, 1.3, 1); m.visible = false; pegadas.push(m); }
  // bote na praia
  const bote = new THREE.Group(); scene.add(bote);
  { const g = new THREE.CylinderGeometry(0.75, 0.75, 3.6, 18, 1, true, Math.PI, Math.PI); const pa = g.attributes.position; for (let i = 0; i < pa.count; i++) { const y = pa.getY(i) / 3.6, k = 1 - Math.pow(Math.max(0, y * 2 - 0.2), 2) * 0.9; pa.setX(i, pa.getX(i) * k); pa.setZ(i, pa.getZ(i) * k); }
    g.computeVertexNormals(); const m = add(g, toon({ color: '#b84a2a', side: THREE.DoubleSide }), 0, 0.75, 0, bote); m.rotation.z = Math.PI / 2;
    // tampas laterais (casco fechado) + banco interno — correção do V4 (bote parecia faltar pedaço)
    for (const s of [-1, 1]) { const cap = add(new THREE.CircleGeometry(0.74, 18, Math.PI, Math.PI), toon({ color: '#8b3a1e', side: THREE.DoubleSide }), s * 1.78, 0.75, 0, bote, { cast: false }); cap.rotation.y = s * Math.PI / 2; }
    add(tbox(1.6, 0.08, 1.2, 1), mat.wood, 0, 0.42, 0, bote, { cast: false });
    add(tbox(3.4, 0.12, 0.12, 1), mat.white, 0, 0.72, 0.72, bote, { cast: false }); add(tbox(3.4, 0.12, 0.12, 1), mat.white, 0, 0.72, -0.72, bote, { cast: false });
    add(tbox(0.25, 0.08, 1.3, 1), mat.wood, -0.6, 0.45, 0, bote); add(tbox(0.25, 0.08, 1.3, 1), mat.wood, 0.7, 0.45, 0, bote); }
  bote.visible = false;
  // 2º navio, ancorado ao fundo da ilha (mesmo navio da série)
  const ancorado = navio.clone(true); ancorado.position.set(ILHA.x + 30, 0, ILHA.z - 25); ancorado.rotation.y = 0.7; scene.add(ancorado);
  const ancFoam = ancorado.children.find((c) => c.geometry && c.geometry.type === 'TorusGeometry' && c.scale.x > 3); if (ancFoam) ancFoam.userData.ndSkip = true;
  // morros ao fundo (outras ilhas), sem tinta pesada
  for (const [x, z, r] of [[-120, -260, 60], [160, -330, 80], [40, -420, 70]]) { const h = add(new THREE.SphereGeometry(r, 20, 10), toon({ color: '#6aa35a' }), ILHA.x + x, -r * 0.62, ILHA.z + z, scene, { cast: false }); h.scale.y = 0.6; }

  // ---------- BATALHA NAVAL (navio rival, canhões, tiros, cordas) ----------
  const BAT = construirBatalha(E, mat, navio, mastros, flag, { L, B });

  // ---------- CENÁRIOS DO CATÁLOGO (espaço, brinquedolândia, cidade): ver cenarios.js ----------
  const CEN = construirCenarios(E);
  const FX = construirEfeitos(E);   // tornado, furacão, chuva, terremoto, tsunami, meteoro, raios (S.fx)

  // ---------- nuvens pintadas (sem névoa, sem tinta) ----------
  const nuvens = [];
  { const r = P.rng(90); for (let i = 0; i < 16; i++) {
    const [c, g] = cv(512, 256); for (let k = 0; k < 7; k++) { const x = 90 + k * 52 + r() * 20, y = 150 - Math.sin(k / 6 * Math.PI) * 60, rr = 50 + Math.sin(k / 6 * Math.PI) * 40 + r() * 15;
      const gr = g.createRadialGradient(x - rr * 0.3, y - rr * 0.4, rr * 0.1, x, y, rr); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.7, '#eef3fb'); gr.addColorStop(1, 'rgba(214,226,246,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); }
    g.globalCompositeOperation = 'destination-out'; g.fillRect(0, 196, 512, 60);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.5), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = r() * Math.PI * 2, d = 700 + r() * 250; m.position.set(Math.cos(a) * d, 90 + r() * 140, Math.sin(a) * d); m.scale.setScalar(200 + r() * 160);
    m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); nuvens.push(m); } }

  // ---------- estado por quadro ----------
  const state = (S, f, L) => {
    waterU.t.value = f / 30; waterU.deep.value.set(L.waterDeep); waterU.shal.value.set(L.waterShal); waterU.glint.value.set(L.glint);
    const t = f / 30;
    mar.visible = !S.cenario; CEN.state(S, f, L); FX.state(S, f);
    for (const s of mastros) { const pa = s.geometry.attributes.position, b = s.userData.sail; for (let i = 0; i < pa.count; i++) pa.setX(i, b[i * 3] * (1 + 0.08 * Math.sin(t * 2.2 + b[i * 3 + 2] * 0.7))); pa.needsUpdate = true; }
    { const pa = flag.geometry.attributes.position, b = flag.userData.base; for (let i = 0; i < pa.count; i++) pa.setZ(i, Math.sin(t * 6 + b[i * 3] * 4) * 0.12 * (b[i * 3] + 0.7)); pa.needsUpdate = true; }
    const amp = S.mar ?? L.ondas ?? 0.25; waterU.amp.value = amp; AMP = amp; TT = t;
    boia(navio, 0, 0, 0, 0, L_, B_, t, amp, S.balanco ?? 1);
    boia(ancorado, ancorado.position.x, 0, ancorado.position.z, 0.7, L_, B_, t, amp);
    waterU.navs.value[0].set(0, 0, 0, 1); waterU.navs.value[2].set(ancorado.position.x, ancorado.position.z, 0.7, 1);
    redeG.rotation.x = 0;
    for (const k in BUR) { const b = BUR[k], p = S.buracos?.[k] ?? 0; b.g.visible = p > 0; const s = Math.max(0.01, p); b.h.scale.setScalar(s); b.h2.scale.setScalar(s); b.monte.scale.set(s, 0.5 * s, 0.8 * s); }
    bau.visible = !!S.bau; if (S.bau) { bau.position.set(...S.bau.pos); bau.rotation.y = S.bau.ry || 0; bau.userData.tampa.rotation.x = -(S.bau.abre || 0) * 1.9; bau.userData.brilho.material.opacity = (S.bau.brilho || 0) * 0.85; bau.userData.papel.visible = !S.bau.semPapel; }
    bote.visible = !!S.bote; if (S.bote?.agua) { boia(bote, S.bote.pos[0], S.bote.pos[1], S.bote.pos[2], S.bote.ry || 0, 3.6, 1.5, t, amp); } else if (S.bote) { bote.position.set(...S.bote.pos); bote.rotation.y = S.bote.ry || 0; bote.rotation.z = 0.03 * Math.sin(t * 2); }
    lampada.intensity = S.lampada || 0;
    { const F = S.fogao || { chama: 0.6 }, k = F.chama ?? 0.6, az = F.azul || 0, tr = 1 + 0.1 * Math.sin(t * 23) + 0.05 * Math.sin(t * 41), m = FOG.chama;
      // tamanho: chama 0,6 = fogo normal (0,32 m de altura, só lambe a panela); 1,6 = labareda (~0,85 m). Azul entra direto (sem mistura rosa).
      m.visible = k > 0.02; m.material.map = (az > 0.5 ? FOG.T.chamaAzul : FOG.T.chama)[Math.floor(f / 3) % 3];
      const sx = 0.75 * Math.min(1.25, 0.6 + 0.4 * k), sy = 0.53 * k * tr; m.scale.set(sx, sy, 1); m.position.set(COZ.x - 2.4, COZ.y + 0.9 + 0.5 * sy, COZ.z - 1.98); m.material.opacity = 1;
      FOG.boca.material.color.set(az > 0.5 ? '#7ab8ff' : '#ffb347'); FOG.boca.material.color.multiplyScalar(Math.min(1, 0.25 + k)); FOG.luz.intensity = k * (az > 0.5 ? 1.4 : 3.5); FOG.luz.color.set(az > 0.5 ? '#8ab8ff' : '#ff9a3a');
      FOG.registro.rotation.z = -(F.registro || 0) * Math.PI * 0.75;
      const pa = S.porta || 0; FOG.porta.rotation.y = -pa * 1.75; FOG.contraluz.visible = pa > 0.02; }
    BAT.state(S, f, t, amp, waterU);
    pegadas.forEach((m, i) => { const p = S.pegadas?.[i]; m.visible = !!p; if (p) { m.position.set(p[0], chaoIlha(p[0], p[1]) + 0.012, p[1]); m.rotation.z = p[2] || 0; } });
  };
  return { state, nuvens, navio, REDE, PALMA, PEDRA, BUR, chaoIlha, dunas,
    get rival() { return BAT.rival; }, frotas: BAT.SHIPS, canhao: BAT.canhao, corda: BAT.corda, CANHOES: BAT.CANHOES,
    cen: CEN,
    chao: (x, z) => { const c0 = CEN.chao(x, z); if (c0 != null) return c0; const r = BAT.noRival(x, z); if (r != null) return r;
      if (Math.abs(z - ILHA.z) < 80) return ILHA.y + chaoIlha(x - ILHA.x, z - ILHA.z);
      if (z > 200) return COZ.y;
      return deckY(navio, x, z) ?? DECK; },
    onda: (x, z) => onda(x, z, TT, AMP), nivelMar: (x, z) => onda(x, z, TT, AMP) };
}

// =====================================================================================
// BATALHA NAVAL — construída uma vez, ligada por quadro em worldAt(f):
//   batalha: true                      -> canhões visíveis no nosso navio
//   rival: { pos:[x,y,z], ry, balanco } -> navio rival (casco preto, velas roxas, bandeira de caveira)
//   tiros: [{ de:'nosso'|'rival', i, f0, alvo:{ nav:'rival'|'nosso', p:[x,y,z] (local do navio) } | { mar:[x,z] }, dur? }]
//     f0 = quadro do disparo. Antes de f0 (12 q) o pavio solta faísca; depois: recuo, clarão, fumaça, bala em arco,
//     splash no mar OU estilhaço + buraco no casco (o buraco fica até o fim do plano).
// Canhões: CANHOES[i] = { x, lado } (coords do navio; lado +1 = boreste/+z). W.canhao(nav, i) -> { pavio, boca, lado, g }.
// Cordas: W.corda(a, b) estica uma corda (Vector3/array) neste quadro (some no quadro seguinte se não for chamada).
// =====================================================================================
// altura do convés de um navio (que boia) no ponto (x, z) do mundo; null fora do convés
const _v = new THREE.Vector3();
function deckY(nav, x, z, L = 16, B = 5.2) { _v.set(x, nav.position.y + DECK, z); nav.worldToLocal(_v); if (Math.abs(_v.x) > L / 2 + 1 || Math.abs(_v.z) > B / 2 + 0.3) return null; _v.y = DECK; return nav.localToWorld(_v).y; }
const PLUMc = '#241726';
function texPintada(w, h, fn) { const [c, g] = cv(w, h); g.lineJoin = 'round'; g.lineCap = 'round'; fn(g, w, h); const t = P.tex(c); return t; }
function blobs(g, pts, fill, ink, lw) { // nuvem de círculos com contorno grosso (estilo do elenco)
  g.fillStyle = ink; for (const [x, y, r] of pts) { g.beginPath(); g.arc(x, y, r + lw, 0, 7); g.fill(); }
  g.fillStyle = fill; for (const [x, y, r] of pts) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); } }
const TEX = {};
const FOG = {};   // fogão/porta/chaminé da cozinha (V5)
function texturasBatalha() {
  if (TEX.flash) return TEX;
  TEX.flash = texPintada(256, 256, (g) => { const st = (r1, r2, n, col, rot) => { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, r = i % 2 ? r2 : r1; g.lineTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r); } g.closePath(); g.fillStyle = col; g.fill(); };
    g.save(); g.lineWidth = 10; st(124, 62, 9, PLUMc, 0.1); g.restore(); st(116, 56, 9, '#ff7a1a', 0.1); st(84, 42, 9, '#ffc23a', 0.45); g.beginPath(); g.arc(128, 128, 34, 0, 7); g.fillStyle = '#fff7d0'; g.fill(); });
  TEX.fumaca = [0, 1, 2].map((k) => texPintada(256, 256, (g) => { const r = P.rng(31 + k), pts = [];
    for (let i = 0; i < 7; i++) { const a = i / 7 * 6.28 + r(), d = 40 + r() * 22; pts.push([128 + Math.cos(a) * d, 132 + Math.sin(a) * d * 0.8, 36 + r() * 18]); } pts.push([128, 128, 58]);
    blobs(g, pts, '#e9e5ef', PLUMc, 7); g.globalCompositeOperation = 'source-atop';
    const gr = g.createLinearGradient(60, 60, 200, 210); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(.55, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(70,60,110,.45)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }));
  TEX.splash = texPintada(256, 384, (g) => { const ink = '#16304a';
    const coroa = () => { g.beginPath(); g.moveTo(30, 380); g.quadraticCurveTo(50, 250, 34, 150); g.quadraticCurveTo(70, 210, 82, 120); g.quadraticCurveTo(104, 190, 128, 40); g.quadraticCurveTo(152, 190, 174, 120); g.quadraticCurveTo(186, 210, 222, 150); g.quadraticCurveTo(206, 250, 226, 380); g.closePath(); };
    g.lineWidth = 14; g.strokeStyle = ink; coroa(); g.stroke(); g.fillStyle = '#f2fbff'; coroa(); g.fill();
    g.fillStyle = 'rgba(120,190,230,.55)'; g.beginPath(); g.moveTo(70, 380); g.quadraticCurveTo(100, 260, 128, 170); g.quadraticCurveTo(150, 260, 180, 380); g.fill();
    for (const [x, y, r] of [[40, 70, 12], [214, 84, 10], [96, 26, 8], [168, 40, 9]]) { g.beginPath(); g.arc(x, y, r + 5, 0, 7); g.fillStyle = ink; g.fill(); g.beginPath(); g.arc(x, y, r, 0, 7); g.fillStyle = '#f2fbff'; g.fill(); } });
  // FOGO (V5, vale p/ qualquer fogo do kit): 5–7 línguas de tamanhos diferentes, base larga, pontas finas e tortas; 3 quadros que se alternam (tremor)
  const chama = (c1, c2, c3, seed) => texPintada(384, 320, (g) => { const r = P.rng(seed), L = [];
    const n = 6; for (let k = 0; k < n; k++) { const x = 70 + k * (244 / (n - 1)) + (r() - 0.5) * 24, mid = 1 - Math.abs(k - (n - 1) / 2) / ((n - 1) / 2); L.push([x, 120 + 150 * mid * (0.7 + 0.5 * r()), (r() - 0.5) * 60, 38 + 26 * mid]); }
    const forma = (esc) => { g.beginPath(); g.moveTo(40, 318); for (const [x, h, cv, w] of L) { const H = h * esc, W = w * (0.6 + 0.4 * esc); g.quadraticCurveTo(x - W, 318 - H * 0.45, x + cv * esc, 318 - H); g.quadraticCurveTo(x + W * 0.5, 318 - H * 0.4, x + W * 0.9, 300); } g.lineTo(344, 318); g.closePath(); };
    g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = PLUMc; forma(1); g.stroke(); g.fillStyle = c1; forma(1); g.fill(); g.fillStyle = c2; forma(0.66); g.fill(); g.fillStyle = c3; forma(0.32); g.fill(); });
  TEX.chama = [1, 2, 3].map((k) => chama('#ff5a14', '#ffa424', '#fff0a0', 120 + k)); TEX.chamaAzul = [1, 2, 3].map((k) => chama('#1f4fd8', '#4fa0ff', '#e8f6ff', 120 + k));
  // bola de fogo pintada (explosão do navio): blobs laranja/amarelo com miolo branco e contorno ameixa
  TEX.bolaFogo = [0, 1].map((k) => texPintada(512, 512, (g) => { const r = P.rng(55 + k), pts = []; for (let i = 0; i < 11; i++) { const a = i / 11 * 6.28 + r() * 0.3, d = 120 + r() * 50; pts.push([256 + Math.cos(a) * d, 266 + Math.sin(a) * d * 0.85, 70 + r() * 40]); } pts.push([256, 256, 150]);
    blobs(g, pts, '#ff5a1a', PLUMc, 12); const sh = (f, cor) => { g.fillStyle = cor; for (const [x, y, rr] of pts) { g.beginPath(); g.arc(256 + (x - 256) * f, 250 + (y - 256) * f, rr * f, 0, 7); g.fill(); } };
    sh(0.72, '#ff9a2a'); sh(0.46, '#ffd23a'); sh(0.22, '#fff7d0');
    g.globalCompositeOperation = 'source-atop'; const gr = g.createLinearGradient(0, 500, 0, 0); gr.addColorStop(0, 'rgba(120,20,40,.45)'); gr.addColorStop(0.5, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); }));
  TEX.faisca = texPintada(128, 128, (g) => { for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.strokeStyle = i % 2 ? '#ffd23a' : '#fff7d0'; g.lineWidth = 9; g.beginPath(); g.moveTo(64 + Math.cos(a) * 14, 64 + Math.sin(a) * 14); g.lineTo(64 + Math.cos(a) * (i % 2 ? 44 : 60), 64 + Math.sin(a) * (i % 2 ? 44 : 60)); g.stroke(); }
    g.beginPath(); g.arc(64, 64, 16, 0, 7); g.fillStyle = '#ff9a2a'; g.fill(); });
  TEX.buraco = texPintada(256, 256, (g) => { const r = P.rng(77), pts = []; for (let i = 0; i < 18; i++) { const a = i / 18 * 6.28, d = (i % 2 ? 62 : 96) + r() * 16; pts.push([128 + Math.cos(a) * d, 128 + Math.sin(a) * d * 0.85]); }
    const poly = (k, col, lw) => { g.beginPath(); pts.forEach(([x, y], i) => { const X = 128 + (x - 128) * k, Y = 128 + (y - 128) * k; i ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.closePath(); if (lw) { g.lineWidth = lw; g.strokeStyle = col; g.stroke(); } else { g.fillStyle = col; g.fill(); } };
    poly(1.05, PLUMc, 12); poly(1.05, '#c8955a'); poly(1.05, PLUMc, 8); poly(0.72, '#1a0f14'); poly(0.72, PLUMc, 6);
    g.strokeStyle = 'rgba(90,40,10,.6)'; g.lineWidth = 4; for (let i = 0; i < 18; i += 2) { const [x, y] = pts[i]; g.beginPath(); g.moveTo(128 + (x - 128) * 0.75, 128 + (y - 128) * 0.75); g.lineTo(128 + (x - 128) * 1.0, 128 + (y - 128) * 1.0); g.stroke(); } });
  return TEX;
}

// ---------- FROTAS: identidade do navio de cada tripulação (personagens em rig.js tripulacao(id, ...)) ----------
// casco = [matiz, saturação, luz] do casco pintado; velas = [listra A, listra B]; amurada = [matiz, sat, luz] da tábua; bandeira = BANDEIRAS[...]
// Nova frota = uma linha aqui + tripulacao() no rig. Uso no story: worldAt -> rival: { frota: 'coral', pos, ry }.
export const FROTAS = {
  ruiva: { casco: [262, 16, 21], velas: ['#6b3fa0', '#2a1f3a'], faixa: '#7a4fb0', amurada: [270, 14, 26], amuradaEsc: '#3a2f48', escotilha: '#ff7a3a', bandeira: 'caveira' },
  coral: { casco: [198, 55, 26], velas: ['#f2b233', '#1f4f6b'], faixa: '#f2b233', amurada: [40, 60, 52], amuradaEsc: '#a8782a', escotilha: '#ffd36e', bandeira: 'coral' },
};
export const BANDEIRAS = {
  caveira: (g) => { g.fillStyle = '#1a1520'; g.fillRect(0, 0, 256, 160);
    g.strokeStyle = '#f4efe4'; g.lineWidth = 16; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(128 - 58, 80 + s * 44); g.lineTo(128 + 58, 80 - s * 44); g.stroke(); for (const e of [-1, 1]) { g.beginPath(); g.arc(128 + e * 62, 80 + s * e * -46, 10, 0, 7); g.fillStyle = '#f4efe4'; g.fill(); } }
    g.beginPath(); g.ellipse(128, 68, 40, 36, 0, 0, 7); g.fillStyle = '#f4efe4'; g.fill(); g.fillRect(108, 88, 40, 26);
    g.fillStyle = '#1a1520'; for (const x of [-15, 15]) { g.beginPath(); g.ellipse(128 + x, 66, 11, 12, 0, 0, 7); g.fill(); } g.beginPath(); g.moveTo(128, 80); g.lineTo(122, 92); g.lineTo(134, 92); g.fill();
    for (const x of [-10, 0, 10]) g.fillRect(126 + x, 100, 3, 14); },
  coral: (g) => { g.fillStyle = '#1f4f6b'; g.fillRect(0, 0, 256, 160); g.lineCap = 'round';                // galho de coral + dois arpões cruzados
    g.strokeStyle = '#f4efe4'; g.lineWidth = 9; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(128 - s * 80, 140); g.lineTo(128 + s * 80, 22); g.stroke(); g.beginPath(); g.moveTo(128 + s * 80, 22); g.lineTo(128 + s * 64, 30); g.moveTo(128 + s * 80, 22); g.lineTo(128 + s * 76, 40); g.stroke(); }
    g.strokeStyle = '#ff7a6a'; g.lineWidth = 16; const br = (x, y, a, l, d) => { if (d === 0) return; const x2 = x + Math.sin(a) * l, y2 = y - Math.cos(a) * l; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke(); br(x2, y2, a - 0.5, l * 0.68, d - 1); br(x2, y2, a + 0.5, l * 0.68, d - 1); };
    br(128, 150, 0, 46, 4); },
};

function construirBatalha(E, mat, navio, mastros, flag, { L, B }) {
  const { scene, add, tbox, box, toon } = E;
  const T = texturasBatalha();
  const ferro = mat.iron, faixa = toon({ color: '#c9d2de' }), bocaMat = new THREE.MeshBasicMaterial({ color: '#120c14' });
  // ---------- canhão 3D: carreta de madeira (sobre estrado, o cano passa por cima da amurada) + cano de ferro com faixa clara ----------
  function canhao(par, x, lado) {
    const g = new THREE.Group(); g.position.set(x, DECK, lado * (B / 2 - 0.55)); g.rotation.y = lado > 0 ? -Math.PI / 2 : Math.PI / 2; par.add(g);
    // portinhola na amurada (moldura escura nas duas faces): o cano passa por ela
    add(box(0.22, 0.44, 0.56), toon({ color: '#1a0f14' }), 0.91, 0.75, 0, g, { cast: false });
    const rec = new THREE.Group(); g.add(rec);
    for (const s of [-1, 1]) add(tbox(1.0, 0.42, 0.1, 1), mat.wood, -0.1, 0.38, s * 0.26, rec);   // laterais da carreta
    add(tbox(0.85, 0.1, 0.46, 1), mat.wood, -0.1, 0.24, 0, rec);
    for (const xx of [-0.42, 0.28]) for (const s of [-1, 1]) { const w = add(new THREE.CylinderGeometry(0.15, 0.15, 0.08, 14), mat.wood, xx, 0.15, s * 0.36, rec); w.rotation.x = Math.PI / 2;
      const ax = add(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 8), ferro, xx, 0.15, s * 0.41, rec, { cast: false }); ax.rotation.x = Math.PI / 2; }
    const Y = 0.75;                                                                              // eixo do cano (cintura do Tião)
    const cano = add(new THREE.CylinderGeometry(0.13, 0.19, 1.8, 18), ferro, 0.45, Y, 0, rec); cano.rotation.z = -Math.PI / 2;
    for (const [xx, r] of [[1.3, 0.165], [0.55, 0.17], [-0.25, 0.2]]) { const b = add(new THREE.TorusGeometry(r, 0.035, 6, 20), faixa, xx, Y, 0, rec, { cast: false }); b.rotation.y = Math.PI / 2; }
    add(new THREE.SphereGeometry(0.11, 12, 10), ferro, -0.52, Y, 0, rec);
    const furo = add(new THREE.CircleGeometry(0.085, 16), bocaMat, 1.355, Y, 0, rec, { cast: false }); furo.rotation.y = Math.PI / 2;
    add(new THREE.CylinderGeometry(0.03, 0.03, 0.05, 8), mat.dark, -0.28, Y + 0.2, 0, rec, { cast: false });   // ouvido do pavio
    return { g, rec, lado, boca: new THREE.Vector3(1.45, Y, 0), pavio: new THREE.Vector3(-0.28, Y + 0.22, 0) };
  }
  const CANHOES = [{ x: 2.4, lado: 1 }, { x: 4.4, lado: 1 }, { x: 2.4, lado: -1 }, { x: -1.6, lado: -1 }];

  // ---------- frotas rivais = mesmo navio da série (escala, tinta, silhueta) com a identidade de cada tripulação (FROTAS) ----------
  const SHIPS = {}, CANF = {};
  for (const [id, F] of Object.entries(FROTAS)) {
    const nv = navio.clone(true); nv.visible = false; scene.add(nv);
    { const rem = []; nv.traverse((o) => { if (o.userData.rede) rem.push(o); }); rem.forEach((o) => o.parent.remove(o)); }
    const band = texPintada(256, 160, (g, w, h) => BANDEIRAS[F.bandeira](g, w, h));
    const rmat = new Map([
      [mat.hull, toon({ map: P.tex(casco(...F.casco, 'rgba(0,0,0,.6)')) })],
      [mat.sail, toon({ map: P.tex(listras(6, ...F.velas)), side: THREE.DoubleSide })],
      [mat.flag, toon({ map: band, side: THREE.DoubleSide })],
      [mat.teal, toon({ map: P.tex(tabuas(12, F.amurada, 'rgba(10,6,16,.9)', 4)) })],
      [mat.tealDark, toon({ color: F.amuradaEsc })], [mat.white, toon({ color: F.faixa })], [mat.port, toon({ color: F.escotilha })],
    ]);
    nv.traverse((o) => { if (o.isMesh && rmat.has(o.material)) o.material = rmat.get(o.material); });
    const fl = nv.children.find((c) => c.geometry === flag.geometry); if (fl) { fl.scale.set(2.6, 2.6, 1); fl.position.x -= 1.0; fl.position.y += 0.6; }
    SHIPS[id] = nv; CANF[id] = CANHOES.map((c) => canhao(nv, c.x, c.lado));
  }
  let rival = SHIPS.ruiva;
  const CAN = { nosso: CANHOES.map((c) => canhao(navio, c.x, c.lado)), rival: CANF.ruiva };
  const NAV = { nosso: navio, rival };

  // ---------- pools de efeitos (cartões pintados virados para a câmera; sem tinta do mundo, a tinta está pintada) ----------
  const bill = (map, w, h, ord = 3) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false, fog: true }));
    m.userData.ndSkip = true; m.renderOrder = ord; m.visible = false; m.onBeforeRender = (r, sc, cam) => { m.quaternion.copy(cam.quaternion); m.updateMatrixWorld(); }; scene.add(m); return m; };
  const pool = (mk, n) => { const a = Array.from({ length: n }, mk); let i = 0; return { reset() { i = 0; a.forEach((m) => (m.visible = false)); }, get() { const m = a[i++ % n]; m.visible = true; return m; } }; };
  const P_FLASH = pool(() => bill(T.flash, 1, 1, 4), 6), P_FUMO = pool((_, k) => bill(T.fumaca[k % 3], 1, 1, 3), 60), P_SPL = pool(() => bill(T.splash, 1, 1.5, 3), 4), P_FAI = pool(() => bill(T.faisca, 1, 1, 4), 6);
  const P_BALA = pool(() => { const m = add(new THREE.SphereGeometry(0.16, 14, 10), ferro, 0, 0, 0, scene); m.visible = false; return m; }, 6);
  const P_LASCA = pool(() => { const m = add(tbox(0.42, 0.07, 0.12, 1), mat.wood, 0, 0, 0, scene); m.visible = false; return m; }, 48);
  const P_ANEL = pool(() => { const m = add(new THREE.TorusGeometry(1, 0.06, 6, 30), new THREE.MeshBasicMaterial({ color: '#eaf6ff' }), 0, 0.04, 0, scene, { cast: false }); m.rotation.x = Math.PI / 2; m.userData.ndSkip = true; m.visible = false; return m; }, 4);
  const buracos = { nosso: [], rival: [] };
  const P_BUR = { nosso: [], rival: [] };
  for (const k of ['nosso', 'rival']) for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.7), new THREE.MeshBasicMaterial({ map: T.buraco, transparent: true, alphaTest: 0.4, polygonOffset: true, polygonOffsetFactor: -4 })); m.userData.ndSkip = true; m.visible = false; NAV[k].add(m); P_BUR[k].push(m); }
  const P_CORDA = pool(() => { const m = add(new THREE.CylinderGeometry(0.03, 0.03, 1, 6), mat.rope, 0, 0, 0, scene, { cast: false }); m.visible = false; return m; }, 40);
  const P_BOLA = pool((_, k) => bill(T.bolaFogo[k % 2], 1, 1, 4), 8);

  const v3 = (a) => (Array.isArray(a) ? new THREE.Vector3(...a) : a.clone());
  const rand = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
  const world = (nav, i, k) => { NAV[nav].updateMatrixWorld(true); const c = CAN[nav][i]; return c.rec.localToWorld(c[k].clone()); };
  const fumo = (p, d, seed, n = 6, esc = 1) => { // bolo de fumaça: cresce, sobe, deriva e some
    for (let k = 0; k < n; k++) { const life = 50 + rand(seed, k) * 30; if (d < 0 || d > life) continue; const u = d / life, m = P_FUMO.get();
      const ang = rand(seed, k + 9) * 6.28, rr = (0.3 + 1.4 * Math.sqrt(u)) * esc;
      m.position.set(p.x + Math.cos(ang) * rr + u * 1.2, p.y + 0.2 + u * (1.4 + rand(seed, k + 3)) * esc, p.z + Math.sin(ang) * rr * 0.6);
      m.scale.setScalar((0.5 + 1.6 * Math.sqrt(u)) * esc * (0.7 + 0.5 * rand(seed, k + 5))); m.material.opacity = 1 - Math.max(0, (u - 0.6) / 0.4); } };

  const R_ry = (S) => (S.rival ? S.rival.ry || 0 : 0);
  const state = (S, f, t, amp = 0.25, wU = null) => {
    for (const c of CAN.nosso) c.g.visible = !!S.batalha;
    const fid = S.rival?.frota || 'ruiva'; rival = SHIPS[fid]; NAV.rival = rival; CAN.rival = CANF[fid];
    for (const k in SHIPS) SHIPS[k].visible = false; rival.visible = !!S.rival;
    if (S.rival) { const R = S.rival; rival.position.set(...R.pos); rival.rotation.set(0, R.ry || 0, 0);
      boia(rival, R.pos[0], R.pos[1] || 0, R.pos[2], R.ry || 0, L + 2, B + 1, t, amp, R.balanco ?? (S.balanco ?? 1)); }
    if (wU) wU.navs.value[1].set(rival.position.x, rival.position.z, R_ry(S), S.rival ? 1 : 0);
    [P_FLASH, P_FUMO, P_SPL, P_FAI, P_BALA, P_LASCA, P_ANEL, P_CORDA, P_BOLA].forEach((p) => p.reset());
    // chaminé da cozinha soltando fumaça (S.chamine 0..1): puffs contínuos, mais grossos com k
    if (S.chamine) { navio.updateMatrixWorld(true); const top = navio.localToWorld(FOG.chamine.clone()); for (let j = 0; j < 4; j++) fumo(top, (f + j * 17) % 66, 900 + j, 1, 0.25 + 0.55 * S.chamine); if (S.chamine > 0.6 && f % 9 < 4) { const m = P_FAI.get(); m.position.copy(top).add(new THREE.Vector3(0, 0.25, 0)); m.scale.setScalar(0.25); } }
    // EXPLOSÃO DO NAVIO INTEIRO (V5): S.explosao = { f0, p:[x,y,z] local do navio (padrão meio do convés), esc }
    //   clarão estrela -> bola de fogo pintada que cresce e sobe -> lascas de madeira voando em todas as direções -> cogumelo de fumaça
    if (S.explosao) { const X = S.explosao, d = f - X.f0, es = X.esc || 1; navio.updateMatrixWorld(true); const c = navio.localToWorld(v3(X.p || [0.5, DECK + 1.2, 0]));
      if (d >= 0) {
        if (d < 6) { const m = P_FLASH.get(); m.position.copy(c); m.scale.setScalar(es * (4 + d * 2.2)); }
        for (let k = 0; k < 5; k++) { const dk = d - k * 2; if (dk < 0 || dk > 46) continue; const u = dk / 46, m = P_BOLA.get(), a = rand(k, 3) * 6.28, rr = es * (0.4 + 2.6 * Math.sqrt(u)) * (k ? 1 : 0.3);
          m.position.set(c.x + Math.cos(a) * rr, c.y + es * (0.4 + 4.5 * u) + k * 0.3 * es, c.z + Math.sin(a) * rr * 0.5); m.scale.setScalar(es * (2.2 + 5.5 * Math.sqrt(u)) * (1 - 0.35 * k / 5)); m.material.opacity = 1 - Math.max(0, (u - 0.55) / 0.45); }
        for (let k = 0; k < 40; k++) { if (d > 55) break; const m = P_LASCA.get(), a = rand(k, 1) * 6.28, sp = es * (5 + rand(k, 2) * 7), vy = es * (4 + rand(k, 4) * 8), tt = d / 30;
          m.position.set(c.x + Math.cos(a) * sp * tt, c.y + vy * tt - 4.9 * tt * tt, c.z + Math.sin(a) * sp * tt); m.rotation.set(d * 0.3 * (k % 5 + 1), d * 0.2, k); m.scale.setScalar(1 + rand(k, 6) * 1.2);
          if (m.position.y < onda(m.position.x, m.position.z, t, amp)) m.visible = false; }
        fumo(c.clone().add(new THREE.Vector3(0, es * 2, 0)), d - 6, 700, 10, es * 2.6); fumo(c, d - 10, 701, 8, es * 1.8); } }
    for (const k in P_BUR) P_BUR[k].forEach((m) => (m.visible = false));
    for (const c of [...CAN.nosso, ...Object.values(CANF).flat()]) c.rec.position.x = 0;
    const nb = { nosso: 0, rival: 0 };
    (S.tiros || []).forEach((tr, j) => {
      const d = f - tr.f0, c = CAN[tr.de][tr.i]; if (!c) return;
      if (tr.de === 'rival' && !S.rival) return;
      // faísca no pavio (12 q antes)
      if (d >= -12 && d < 0) { const m = P_FAI.get(); m.position.copy(world(tr.de, tr.i, 'pavio')); m.scale.setScalar(0.35 + 0.15 * Math.sin(f * 2.3)); }
      if (d < 0) return;
      // recuo do cano + carreta
      c.rec.position.x = -0.45 * (d < 3 ? d / 3 : Math.max(0, 1 - (d - 3) / 30));
      const boca = world(tr.de, tr.i, 'boca'), dir = boca.clone().sub(world(tr.de, tr.i, 'pavio')).setY(0).normalize();
      if (d < 5) { const m = P_FLASH.get(); m.position.copy(boca).addScaledVector(dir, 0.5); m.scale.setScalar(1.8 * (d < 2 ? 0.7 + d * 0.3 : 1.3 - (d - 2) * 0.3)); }
      fumo(boca.clone().addScaledVector(dir, 0.8), d, j * 7 + 1, 7, 1);
      // bala em arco até o alvo
      let alvo, hitNav = null, local = null;
      if (tr.alvo?.mar) alvo = new THREE.Vector3(tr.alvo.mar[0], onda(tr.alvo.mar[0], tr.alvo.mar[1], t, amp), tr.alvo.mar[1]);
      else if (tr.alvo?.nav) { hitNav = tr.alvo.nav; local = v3(tr.alvo.p); NAV[hitNav].updateMatrixWorld(true); alvo = NAV[hitNav].localToWorld(local.clone()); }
      if (!alvo) return;
      const dist = boca.distanceTo(alvo), dur = tr.dur ?? Math.round(Math.min(40, Math.max(12, dist * 0.9)));
      if (d < dur) { const u = d / dur, m = P_BALA.get(); m.position.lerpVectors(boca, alvo, u); m.position.y += Math.sin(u * Math.PI) * (1 + dist * 0.08); return; }
      const e = d - dur;
      if (!hitNav) { // splash no mar
        if (e < 34) { const m = P_SPL.get(), up = e < 8 ? e / 8 : Math.max(0, 1 - (e - 8) / 26); m.position.set(alvo.x, onda(alvo.x, alvo.z, t, amp) + 1.5 * up * 2.2 * 0.5, alvo.z); m.scale.set(2.2 * (0.7 + 0.3 * up), 2.2 * up + 0.01, 1); }
        if (e < 40) { const a = P_ANEL.get(); a.position.set(alvo.x, onda(alvo.x, alvo.z, t, amp) + 0.05, alvo.z); a.scale.setScalar(0.6 + e * 0.12); a.material.opacity = 1; }
        return; }
      // impacto no casco: clarão, estilhaços de madeira voando, poeira; o buraco fica
      if (e < 4) { const m = P_FLASH.get(); m.position.copy(alvo); m.scale.setScalar(1.6 - e * 0.25); }
      const nrm = new THREE.Vector3(0, 0, Math.sign(local.z) || 1).applyQuaternion(NAV[hitNav].quaternion);
      for (let k = 0; k < 12; k++) { if (e > 40) break; const m = P_LASCA.get(), sp = 3 + rand(j, k) * 4, ang = (rand(j, k + 20) - 0.5) * 2.2, tt = e / 30;
        const vx = nrm.x * sp + Math.sin(ang) * 2, vz = nrm.z * sp + Math.cos(ang) * 0.8 * Math.sign(nrm.x || 1), vy = 3 + rand(j, k + 40) * 4;
        m.position.set(alvo.x + vx * tt, alvo.y + vy * tt - 4.9 * tt * tt, alvo.z + vz * tt); m.rotation.set(e * 0.4 * (k + 1) * 0.2, e * 0.3, k);
        if (m.position.y < onda(m.position.x, m.position.z, t, amp)) m.visible = false; }
      fumo(alvo.clone().addScaledVector(nrm, 0.5), e, j * 7 + 3, 5, 0.8);
      const b = P_BUR[hitNav][nb[hitNav]++ % 4]; b.visible = true; if (b.parent !== NAV[hitNav]) NAV[hitNav].add(b); const zs = Math.sign(local.z) || 1;
      b.position.set(local.x, local.y, zs * (B / 2 + 0.53)); b.rotation.set(0, zs > 0 ? 0 : Math.PI, 0); b.scale.setScalar(Math.min(1, 0.3 + e / 4));
    });
  };
  // corda esticada de a até b neste quadro (ação "balança na corda")
  const corda = (a, b) => { const A = v3(a), Bv = v3(b), m = P_CORDA.get(), d = Bv.clone().sub(A); m.position.copy(A).addScaledVector(d, 0.5); m.scale.set(1, d.length(), 1); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); };
  const canhaoInfo = (nav, i) => ({ pavio: world(nav, i, 'pavio'), boca: world(nav, i, 'boca'), lado: CAN[nav][i].lado, g: CAN[nav][i].g });
  // piso do convés do rival (para chao); null fora dele
  const noRival = (x, z) => (rival.visible ? deckY(rival, x, z, L, B) : null);
  return { state, get rival() { return rival; }, SHIPS, canhao: canhaoInfo, corda, noRival, CANHOES, CAN };
}
