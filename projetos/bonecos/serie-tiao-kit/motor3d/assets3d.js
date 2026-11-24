// assets3d.js — Carregador oficial de modelos 3D CC0 (Kenney GLB) no motor3d com twoTone() + ink automático.
import * as THREE from './lib/three.module.js';
import { GLTFLoader } from './lib/GLTFLoader.js';
import { twoTone } from './shade.js';

const loader = new GLTFLoader();
const cache = new Map();

function aplicarTwoTone(root, corOverride = null) {
  root.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    const m0 = o.material;
    const opts = { color: corOverride || (m0?.color ? m0.color.clone() : new THREE.Color('#cccccc')) };
    if (m0?.map) opts.map = m0.map;
    o.material = twoTone(new THREE.MeshLambertMaterial(opts));
  });
}

function alinharChao(root, alturaAlvo = null) {
  const box = new THREE.Box3().setFromObject(root);
  const sz = new THREE.Vector3();
  box.getSize(sz);
  if (alturaAlvo && sz.y > 0.001) {
    const k = alturaAlvo / sz.y;
    root.scale.multiplyScalar(k);
    box.setFromObject(root);
  }
  const cen = new THREE.Vector3();
  box.getCenter(cen);
  root.position.x -= cen.x;
  root.position.z -= cen.z;
  root.position.y -= box.min.y;
}

/**
 * Carrega um modelo GLB de ./assets3d/<categoria>/<nome>.glb em um Group síncrono
 * e registra a promise em window.TEXPROMISES (render.mjs espera tudo carregar antes do frame 0).
 */
export function propGLB(categoria, nome, { x = 0, y = 0, z = 0, rotY = 0, altura = null, escala = 1, cor = null, parent = null } = {}) {
  const holder = new THREE.Group();
  holder.position.set(x, y, z);
  holder.rotation.y = rotY;
  if (parent) parent.add(holder);

  const url = `./assets3d/${categoria}/${nome}.glb`;
  const p = (cache.has(url) ? cache.get(url) : (() => {
    const pr = new Promise((ok, no) => loader.load(url, ok, undefined, no));
    cache.set(url, pr);
    return pr;
  })()).then((gltf) => {
    const clone = gltf.scene.clone(true);
    aplicarTwoTone(clone, cor);
    clone.scale.setScalar(escala);
    alinharChao(clone, altura);
    holder.add(clone);
    return holder;
  });

  (window.TEXPROMISES ||= []).push(p);
  return holder;
}
