// cenarios6.js — CENÁRIOS BLENDER (20/11/2026): imagens renderizadas no Blender (EEVEE) em camadas PNG alpha, como planos com parallax.
// Cenário 'sala_blender': fundo (opaco, z=-6), meio (z=-2), frente (z=+1). Câmera base em (0,1.5,6) fov 40 enquadra cada camada inteira;
// ao mover a câmera o parallax aparece sozinho. Personagens ficam entre meio e frente (z -2..1). Fonte: cenarios_blender/sala.py (rodar de novo p/ atualizar).
// Liga: worldAt -> { cenario: 'sala_blender' } + luz 'casa_dia'. Texturas carregam async: main.js espera window.TEXPROMISES antes de window.ready.
export const BLENDER = ['sala_blender'];
export const CAMS6 = { sala_blender: { geral: { pos: [0, 1.5, 6], look: [0, 1.5, 0], fov: 40 }, medio: { pos: [0, 1.5, 4.2], look: [0, 1.4, 0], fov: 40 }, close: { pos: [0.3, 1.45, 3.0], look: [0, 1.4, 0], fov: 40 } } };

export function construirBlender(X) {
  const { THREE, novo, lista } = X;
  const loader = new THREE.TextureLoader();
  (window.TEXPROMISES ||= []);
  const tex = (nome) => { const p = new Promise((ok, no) => loader.load(`assets/${nome}.png`, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; ok(t); }, undefined, () => { window.err = 'textura ' + nome; no(new Error(nome)); })); window.TEXPROMISES.push(p); return p; };
  const camada = (g, nome, z, dist, opaco) => {
    const H = 2 * dist * Math.tan(THREE.MathUtils.degToRad(20)), W = H * 9 / 16;
    const mat = new THREE.MeshBasicMaterial({ transparent: !opaco, alphaTest: opaco ? 0 : 0.02, fog: false, depthWrite: !!opaco });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(W, H), mat); m.position.set(0, 1.5, z); m.userData.ndSkip = true; m.renderOrder = opaco ? -2 : (z < 0 ? -1 : 1); g.add(m);
    tex(nome).then((t) => { mat.map = t; mat.needsUpdate = true; });
    return m;
  };
  const g = novo('sala_blender');
  camada(g, 'sala_fundo', -6, 12, true);
  camada(g, 'sala_meio', -2, 8, false);
  camada(g, 'sala_frente', 1, 5, false);
  lista.sala_blender = { g, chao: () => 0, state() {} };
}
