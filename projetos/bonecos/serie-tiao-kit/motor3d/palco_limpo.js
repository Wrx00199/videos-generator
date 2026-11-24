// palco_limpo.js — Palco neutro limpo (zero cenário reciclado vazando no fundo) + efeitos físicos padronizados.
import * as THREE from './lib/three.module.js';

/**
 * Cria um palco limpo dedicado (chão + calçada opcional) longe de qualquer cenário antigo.
 * Evita lixo visual no fundo (ex.: carrossel vazando do cenário parque).
 */
export function criarPalcoLimpo(scene, toon, { corChao = '#d6cdb8', tamanho = 120, y = 0 } = {}) {
  const g = new THREE.Group();
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(tamanho, tamanho), toon({ color: corChao }));
  chao.rotation.x = -Math.PI / 2;
  chao.position.y = y;
  chao.receiveShadow = true;
  g.add(chao);
  scene.add(g);
  return g;
}

/**
 * Feixe de luz solar amarrado automaticamente à direção real do sol (nunca invertido!).
 */
export function feixeDoSol(scene, sunDir, alvo = [0, 0.4, 0], { comprimento = 14, raioBase = 0.7, raioTopo = 2.4, cor = '#ffe066', opacidade = 0.36 } = {}) {
  const mat = new THREE.MeshBasicMaterial({
    color: cor, transparent: true, opacity: opacidade,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
  });
  const cone = new THREE.Mesh(new THREE.CylinderGeometry(raioTopo, raioBase, comprimento, 16, 1, true), mat);
  const dir = new THREE.Vector3(sunDir.x, Math.max(0.25, sunDir.y), sunDir.z).normalize();
  const centro = new THREE.Vector3(...alvo).addScaledVector(dir, comprimento * 0.5);
  cone.position.copy(centro);
  cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  cone.userData.ndSkip = true;
  scene.add(cone);
  return cone;
}

/**
 * Ação física padronizada: DERRETER (achata eixo Y, alarga base X/Z e escorre gotas — NUNCA gira um bloco!).
 */
export function animarDerretimento(alvo, progresso, gotas = []) {
  const u = Math.max(0, Math.min(1, progresso));
  const e = u * u * (3 - 2 * u);
  alvo.scale.set(1 + 0.38 * e, Math.max(0.28, 1 - 0.62 * e), 1 + 0.38 * e);
  gotas.forEach((g, i) => {
    const gu = Math.max(0, Math.min(1, (e - i * 0.12) / 0.7));
    g.visible = gu > 0.05;
    g.scale.set(0.6 + 0.4 * gu, 0.2 + 1.4 * gu, 0.6 + 0.4 * gu);
    g.position.y = -0.15 - 0.55 * gu;
  });
}

/**
 * Ação física padronizada: QUEDA com gravidade + quique amortecido.
 */
export function animarQueda(alvo, progresso, alturaInicial = 3.0, yChao = 0) {
  const u = Math.max(0, Math.min(1, progresso));
  let h;
  if (u < 0.72) {
    const k = u / 0.72;
    h = alturaInicial * (1 - k * k);
  } else {
    const k = (u - 0.72) / 0.28;
    h = alturaInicial * 0.14 * Math.sin(k * Math.PI);
  }
  alvo.position.y = yChao + h;
}
