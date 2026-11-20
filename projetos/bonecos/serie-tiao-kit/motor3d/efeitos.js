// efeitos.js — EFEITOS VISUAIS reutilizáveis (desastres naturais) da série Tião. Ligam por quadro em worldAt: { fx: { ... } }.
// Coordenadas ABSOLUTAS do mundo (use ORIGEM.<cenario> de cenarios.js + offset). Tudo desliga sozinho quando a chave não vem.
//   tornado:   { pos:[x,z], k:0..1 (intensidade), esc:1 }            funil girando com destroços e poeira na base
//   furacao:   { pos:[x,z], k:0..1 }                                  espiral gigante de nuvens no céu + parede de nuvem (junto com chuva)
//   chuva:     { pos:[x,z], k:0..1, tipo:'chuva'|'acida'|'neve'|'granizo' }  riscos/bolinhas em volta (24x14x24 m); 'acida' = chuva verde + poças borbulhando
//   terremoto: { pos:[x,z], k:0..1 }                                  rachadura no chão que cresce, pedras caindo, poeira; use tremor(f,k) p/ tremer a câmera
//   tsunami:   { pos:[x,z], k:0..1 (progresso), ry }                  parede de água com crista de espuma vindo em direção à câmera (-z -> +z)
//   meteoro:   { de:[x,y,z], ate:[x,y,z], k:0..1.3 }                  bola de fogo com rastro; k>1 = explosão no impacto
//   raios:     [{ pos:[x,z], f0 }]                                    raio do céu ao chão por 7 quadros (somar relampago() da luz p/ o clarão)
// Som: não é feito aqui (ficha de SFX no catalogo/CENARIOS.md); na produção do vídeo.
import * as THREE from './lib/three.module.js';
import * as P from './paint.js';

export const tremor = (f, k = 1) => ({ dx: Math.sin(f * 1.9) * 0.07 * k + Math.sin(f * 4.1) * 0.04 * k, dy: Math.cos(f * 2.3) * 0.06 * k });

export function meteoroLateral(origem, alvo, camPos = [0, 2, 6]) {
  const dx = alvo[0] - origem[0], dz = alvo[2] - origem[2];
  const angulo = Math.abs(Math.atan2(dx, dz)) * (180 / Math.PI);
  if (angulo < 50) {
    const sinal = dx >= 0 ? 1 : -1;
    const novoOrigemX = alvo[0] - sinal * Math.max(12, Math.abs(dz) * 1.2);
    return { de: [novoOrigemX, origem[1], origem[2]], ate: alvo };
  }
  return { de: origem, ate: alvo };
}
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
const PLUMc = '#241726';

export function construirEfeitos(E) {
  const { scene, toon } = E, T = (c, rx = 1, ry = 1) => P.tex(c, rx, ry), rnd = P.rng(97);
  const grupo = () => { const g = new THREE.Group(); g.visible = false; scene.add(g); return g; };
  const ndOff = (m) => { m.userData.ndSkip = true; m.castShadow = false; return m; };

  // ---- TORNADO ----
  const tor = grupo(); const [tc, tg] = cv(512, 512);
  { tg.fillStyle = '#5a5478'; tg.fillRect(0, 0, 512, 512); for (let i = 0; i < 46; i++) { tg.strokeStyle = i % 3 ? 'rgba(30,26,50,.6)' : 'rgba(190,186,215,.4)'; tg.lineWidth = 3 + rnd() * 7; tg.beginPath(); const y = rnd() * 512; tg.moveTo(0, y); tg.bezierCurveTo(150, y - 40, 350, y + 40, 512, y); tg.stroke(); } }
  const tex = T(tc, 3, 4);
  const pts = []; for (let i = 0; i <= 30; i++) { const u = i / 30, y = u * 46; pts.push(new THREE.Vector2(0.7 + 0.9 * Math.pow(u, 0.5) + 11 * Math.pow(u, 3.2) + 0.35 * Math.sin(u * 17), y)); }
  const fg2 = new THREE.LatheGeometry(pts, 48); { const pa = fg2.attributes.position; for (let i = 0; i < pa.count; i++) { const y = pa.getY(i), u = y / 46; pa.setX(i, pa.getX(i) + Math.sin(y * 0.16) * 2.2 * u + Math.sin(y * 0.5) * 0.25); pa.setZ(i, pa.getZ(i) + Math.cos(y * 0.13) * 1.6 * u); } fg2.computeVertexNormals(); }
  const funil = new THREE.Mesh(fg2, toon({ map: tex, side: THREE.DoubleSide })); funil.castShadow = false; tor.add(funil);
  const nuvem = []; { const cm = [toon({ color: '#3a3552' }), toon({ color: '#4a4466' }), toon({ color: '#2c2840' })]; for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28, r0 = 4 + (i % 3) * 5, m = new THREE.Mesh(new THREE.SphereGeometry(5 + (i % 4) * 1.6, 16, 12), cm[i % 3]); m.position.set(Math.cos(a) * r0, 46 + (i % 2) * 1.6, Math.sin(a) * r0); m.scale.set(1.5, 0.5, 1.5); m.castShadow = false; tor.add(m); nuvem.push(m); } }
  { const m = new THREE.Mesh(new THREE.CylinderGeometry(17, 15, 0.8, 30), toon({ color: '#2c2840' })); m.position.y = 44.4; m.castShadow = false; tor.add(m); }
  const deb = []; for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.5 + rnd() * 0.9, 0.2 + rnd() * 0.4, 0.4 + rnd() * 0.6), toon({ color: ['#8a5a2b', '#9aa3b5', '#d8322a', '#e0c070', '#5a4a3a'][i % 5] })); m.userData.o = [rnd() * 6.28, 3 + rnd() * 34, 0.6 + rnd() * 1.2, 1 + rnd() * 2]; m.castShadow = false; tor.add(m); deb.push(m); }
  const poeira = []; for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(2.6, 14, 10), new THREE.MeshBasicMaterial({ color: '#a8a0b8', transparent: true, opacity: 0.85, depthWrite: false })); ndOff(m); tor.add(m); poeira.push(m); }

  // ---- FURACÃO ----
  const fur = grupo(); const [fc, fg] = cv(1024, 1024);
  { fg.fillStyle = '#3a3a5c'; fg.fillRect(0, 0, 1024, 1024); const rr = P.rng(5); for (let arm = 0; arm < 5; arm++) for (let i = 0; i < 90; i++) { const a = arm * 1.2566 + i * 0.075, r0 = 60 + i * 5.2; fg.fillStyle = i % 3 ? '#8f93b8' : '#d6d8ee'; fg.beginPath(); fg.arc(512 + Math.cos(a) * r0, 512 + Math.sin(a) * r0, 22 + rr() * 22 + i * 0.2, 0, 7); fg.fill(); }
    const eye = fg.createRadialGradient(512, 512, 10, 512, 512, 120); eye.addColorStop(0, '#a8dcff'); eye.addColorStop(1, 'rgba(168,220,255,0)'); fg.fillStyle = eye; fg.beginPath(); fg.arc(512, 512, 120, 0, 7); fg.fill(); }
  const disco = new THREE.Mesh(new THREE.CircleGeometry(120, 64), new THREE.MeshBasicMaterial({ map: T(fc), side: THREE.DoubleSide, fog: false })); ndOff(disco); disco.rotation.x = Math.PI / 2; disco.position.y = 70; fur.add(disco);
  const [wc, wg] = cv(512, 256); { wg.fillStyle = '#2f2f4e'; wg.fillRect(0, 0, 512, 256); for (let i = 0; i < 60; i++) { wg.fillStyle = i % 2 ? 'rgba(150,155,190,.5)' : 'rgba(60,60,96,.6)'; wg.beginPath(); wg.arc(rnd() * 512, rnd() * 256, 20 + rnd() * 40, 0, 7); wg.fill(); } }
  const parede = new THREE.Mesh(new THREE.CylinderGeometry(60, 80, 55, 40, 1, true), new THREE.MeshBasicMaterial({ map: T(wc, 4, 1), side: THREE.DoubleSide })); ndOff(parede); parede.position.y = 25; fur.add(parede);

  // ---- CHUVA ----
  const chu = grupo(); const gotas = []; const gm = new THREE.MeshBasicMaterial({ color: '#cfe6ff', transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide });
  for (let i = 0; i < 170; i++) { const m = ndOff(new THREE.Mesh(new THREE.PlaneGeometry(0.06, 1.3), gm)); m.userData.o = [(rnd() - 0.5) * 24, rnd(), (rnd() - 0.5) * 24, 0.8 + rnd() * 0.6]; chu.add(m); gotas.push(m); }

  const bol = []; const bm = new THREE.MeshBasicMaterial({ color: '#ffffff' }); for (let i = 0; i < 160; i++) { const m = ndOff(new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), bm)); m.userData.o = [(rnd() - 0.5) * 24, rnd(), (rnd() - 0.5) * 24, 0.8 + rnd() * 0.6]; chu.add(m); bol.push(m); }
  const poc = []; { const pm = new THREE.MeshBasicMaterial({ color: '#8aff4a', transparent: true, opacity: 0.8, depthWrite: false }); for (let i = 0; i < 9; i++) { const m = ndOff(new THREE.Mesh(new THREE.CircleGeometry(1, 20), pm)); m.rotation.x = -Math.PI / 2; m.position.set((rnd() - 0.5) * 14, 0.04, (rnd() - 0.5) * 14); m.userData.r = 0.8 + rnd() * 1.4; chu.add(m); const b = ndOff(new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshBasicMaterial({ color: '#d8ffb0' }))); b.userData.o = [m.position.x + (rnd() - 0.5), m.position.z + (rnd() - 0.5), rnd() * 6]; chu.add(b); poc.push([m, b]); } }

  // ---- TERREMOTO ----
  const ter = grupo(); const [kc, kg] = cv(1024, 256);
  { kg.strokeStyle = '#1a0f1a'; kg.lineWidth = 34; kg.lineJoin = 'round'; kg.beginPath(); let x = 10, y = 128; kg.moveTo(x, y); while (x < 1010) { x += 40 + rnd() * 50; y = 128 + (rnd() - 0.5) * 110; kg.lineTo(x, y); } kg.stroke(); kg.strokeStyle = '#7a6a8a'; kg.lineWidth = 8; kg.stroke(); }
  const crack = new THREE.Mesh(new THREE.PlaneGeometry(16, 4), new THREE.MeshBasicMaterial({ map: T(kc), transparent: true, depthWrite: false })); crack.userData.ndSkip = true; crack.rotation.x = -Math.PI / 2; crack.position.y = 0.03; ter.add(crack);
  const pedras = []; for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.3 + rnd() * 0.4, 12, 9), toon({ color: '#8a7f9a' })); m.userData.o = [(rnd() - 0.5) * 12, rnd(), (rnd() - 0.5) * 5]; ter.add(m); pedras.push(m); }
  const pof = []; for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 9), new THREE.MeshBasicMaterial({ color: '#d9ccb0', transparent: true, opacity: 0.6, depthWrite: false })); ndOff(m); m.userData.o = [(rnd() - 0.5) * 12, rnd()]; ter.add(m); pof.push(m); }

  // ---- TSUNAMI ----
  const tsu = grupo(); const wv = new THREE.PlaneGeometry(70, 26, 50, 24); { const pa = wv.attributes.position; for (let i = 0; i < pa.count; i++) { const x = pa.getX(i), y = pa.getY(i) + 13, v = y / 26; pa.setXYZ(i, x, y, Math.pow(v, 2.2) * 15 + Math.sin(x * 0.5 + v * 4) * 0.5 * v); } wv.computeVertexNormals(); }
  const [sc, sg] = cv(256, 256); { const gr = sg.createLinearGradient(0, 256, 0, 0); gr.addColorStop(0, '#0e4a78'); gr.addColorStop(0.6, '#1d8ec8'); gr.addColorStop(0.85, '#7fd0f0'); gr.addColorStop(1, '#ffffff'); sg.fillStyle = gr; sg.fillRect(0, 0, 256, 256); sg.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < 40; i++) { sg.beginPath(); sg.arc(rnd() * 256, 10 + rnd() * 60, 6 + rnd() * 12, 0, 7); sg.fill(); } }
  const onda = new THREE.Mesh(wv, toon({ map: T(sc), side: THREE.DoubleSide })); onda.castShadow = false; tsu.add(onda);
  const esp = []; for (let i = 0; i < 18; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.9 + rnd() * 0.8, 12, 9), new THREE.MeshBasicMaterial({ color: '#f4fbff' })); m.userData.o = [(rnd() - 0.5) * 66, rnd()]; ndOff(m); tsu.add(m); esp.push(m); }

  // ---- METEORO ----
  const met = grupo(); const bola = new THREE.Mesh(new THREE.SphereGeometry(2.2, 20, 14), toon({ color: '#7a3a1a', emissive: '#ff6a1a', emissiveIntensity: 0.9 })); bola.castShadow = false; met.add(bola);
  const cauda = []; for (let i = 0; i < 3; i++) { const m = ndOff(new THREE.Mesh(new THREE.ConeGeometry(2.0 - i * 0.5, 14 + i * 6, 14), new THREE.MeshBasicMaterial({ color: ['#ff5a14', '#ffa424', '#fff0a0'][i] }))); m.position.y = (14 + i * 6) / 2 + 1; met.add(m); cauda.push(m); }
  const imp = ndOff(new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshBasicMaterial({ color: '#ffb040', transparent: true, depthWrite: false }))); met.add(imp);

  // ---- RAIOS ----
  const raiosM = []; for (let i = 0; i < 3; i++) { const m = ndOff(new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: '#fff9c8', fog: false }))); m.visible = false; m.userData.key = null; scene.add(m); raiosM.push(m); }
  const bolt = (x, z, seed) => { const r = P.rng(seed), p = []; let px = 0; for (let i = 0; i <= 12; i++) { px += (r() - 0.5) * 4.4; p.push(new THREE.Vector3(x + (i === 12 ? 0 : px), 60 - i * 5, z)); } return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p, false, 'catmullrom', 0.1), 40, 0.22, 5); };

  return {
    state(S, f) { const t = f / 30, X = S.fx || {};
      { const o = X.tornado, on = o && o.k > 0.02; tor.visible = !!on; if (on) { tor.position.set(o.pos[0], 0, o.pos[1]); tor.scale.setScalar((o.esc ?? 1) * o.k); tor.rotation.z = 0.05 * Math.sin(t * 1.3); tex.offset.x = -t * 0.9; tex.offset.y = t * 0.15; funil.rotation.y = t * 0.4;
        nuvem.forEach((m, i) => { m.position.x += 0; m.rotation.y = t * 0.2 + i; });
        deb.forEach((m, i) => { const [a, y, sp, rs] = m.userData.o, u = y / 44, r = 1.0 + 10 * Math.pow(u, 1.9) + 1.8, ang = a + t * (1.4 + sp); m.position.set(Math.cos(ang) * r, y + Math.sin(t * 2 + i) * 0.6, Math.sin(ang) * r); m.rotation.set(t * rs, t * rs * 0.7, t * 1.1); });
        poeira.forEach((m, i) => { const a = i / 9 * 6.28 + t * 0.8; m.position.set(Math.cos(a) * 4.2, 1.0 + (i % 3) * 0.7, Math.sin(a) * 4.2); m.scale.setScalar(1 + 0.3 * Math.sin(t * 3 + i)); }); } }
      { const o = X.furacao, on = o && o.k > 0.02; fur.visible = !!on; if (on) { fur.position.set(o.pos[0], 0, o.pos[1]); disco.rotation.z = t * 0.12 * o.k; parede.rotation.y = -t * 0.35; } }
      { const o = X.chuva, on = o && o.k > 0.02; chu.visible = !!on; if (on) { const tp = o.tipo || 'chuva', liq = tp === 'chuva' || tp === 'acida'; chu.position.set(o.pos[0], 0, o.pos[1]); gm.color.set(tp === 'acida' ? '#a6ff5a' : '#cfe6ff');
        gotas.forEach((m) => { const [x, u, z, v] = m.userData.o, h = ((u - t * v * 1.4 * (0.6 + o.k)) % 1 + 1) % 1; m.position.set(x + h * 3 * 0.3, 14 * h, z); m.rotation.z = 0.2; m.visible = liq && u < o.k + 0.05; m.rotation.y = Math.PI * 0.25; });
        bol.forEach((m) => { const [x, u, z, v] = m.userData.o, ne = tp === 'neve', h = ((u - t * v * (ne ? 0.22 : 1.5) * (0.6 + o.k)) % 1 + 1) % 1; m.visible = !liq && u < o.k + 0.05; m.position.set(x + (ne ? Math.sin(t * 1.3 + u * 20) * 0.9 : h * 1.2), 14 * h, z + (ne ? Math.cos(t + u * 9) * 0.5 : 0)); m.scale.setScalar(ne ? 0.1 : 0.12); m.material.color.set(ne ? '#ffffff' : '#e6f4ff'); });
        poc.forEach(([m, b], i) => { m.visible = b.visible = tp === 'acida'; m.scale.setScalar(m.userData.r * (0.8 + 0.2 * Math.min(1, o.k * 2))); const u = ((t * 0.8 + b.userData.o[2]) % 1); b.position.set(b.userData.o[0], 0.08 + 0.45 * u, b.userData.o[1]); b.scale.setScalar(0.6 + 0.8 * (1 - Math.abs(u - 0.5) * 2)); }); } }
      { const o = X.terremoto, on = o && o.k > 0.02; ter.visible = !!on; if (on) { ter.position.set(o.pos[0], 0, o.pos[1]); crack.scale.set(0.3 + 0.7 * o.k, 0.6 + 0.6 * o.k, 1);
        pedras.forEach((m, i) => { const [x, u, z] = m.userData.o, h = ((u + t * 0.9 * o.k) % 1), y = 8 * (1 - h) ** 1; m.position.set(x, y + 0.2, z); m.visible = h < 0.96; m.rotation.set(t * 3 + i, t * 2, 0); });
        pof.forEach((m, i) => { const [x, u] = m.userData.o, h = (u + t * 0.35) % 1; m.position.set(x, 0.4 + h * 2.4, ((i * 17) % 5) - 2); m.scale.setScalar((0.6 + h * 1.6) * o.k); m.material.opacity = (1 - h) * 0.6; }); } }
      { const o = X.tsunami, on = o && o.k > 0.01; tsu.visible = !!on; if (on) { tsu.position.set(o.pos[0], -0.4, o.pos[1] + (-70 + 66 * o.k)); tsu.rotation.y = o.ry || 0; tsu.scale.setScalar(1);
        esp.forEach((m, i) => { const [x, u] = m.userData.o; m.position.set(x, 24 + Math.sin(t * 4 + i) * 1.2, -13 + Math.sin(t * 3 + i * 2) * 1.5); m.scale.setScalar(0.8 + 0.4 * Math.sin(t * 5 + i)); }); } }
      { const o = X.meteoro, k = o ? o.k : 0, on = o && k > 0.01; met.visible = !!on; if (on) { const kk = Math.min(1, k), p = [0, 1, 2].map((i) => o.de[i] + (o.ate[i] - o.de[i]) * kk); met.position.set(...p); const d = new THREE.Vector3(o.ate[0] - o.de[0], o.ate[1] - o.de[1], o.ate[2] - o.de[2]).normalize();
        met.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().negate()); bola.visible = cauda[0].visible = cauda[1].visible = cauda[2].visible = k < 1; bola.rotation.set(t * 4, t * 3, 0);
        imp.visible = k >= 1; if (k >= 1) { const u = Math.min(1, (k - 1) / 0.3); imp.quaternion.copy(met.quaternion).invert(); imp.scale.setScalar(2 + 14 * u); imp.material.opacity = 1 - u * 0.9; } } }
      raiosM.forEach((m, i) => { const r = (X.raios || [])[i], d = r ? f - r.f0 : -1, on = r && d >= 0 && d < 7; m.visible = !!on; if (on) { const key = r.f0 + ':' + r.pos; if (m.userData.key !== key) { m.geometry.dispose(); m.geometry = bolt(r.pos[0], r.pos[1], r.f0 * 13 + 5); m.userData.key = key; } m.material.color.set(d % 2 ? '#ffffff' : '#fff2a0'); } });
    },
  };
}
