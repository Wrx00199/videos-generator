// cameras.js — banco de 8 composicoes de camera nomeadas (V4, 18/11/2026).
// Cada camera: (alvo, t) => { pos, look, fov }.  alvo = caixa que PRECISA caber: {x, y, z, w, h}
// (x,y,z = centro da caixa em metros do mundo; w = largura/profundidade; h = altura). t = 0..1 dentro do plano.
// Convencao igual a epi.js camBase: { pos, look, fov } com fov vertical em graus, tela 1080x1920.
// Folga >= 12% nas bordas: a distancia sai da caixa do alvo (enquadra), nao de numero digitado.
// Uso em story.js: `camFromKeys([{f:a, ...CAMERAS.orbita(alvo,0)}, {f:b, ...CAMERAS.orbita(alvo,1)}], f)`.
const ASPECT = 1080 / 1920, FOLGA = 0.12, PAD = 1.18;
const L = (a, b, t) => a + (b - a) * t;
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const sm = (t) => { t = cl(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const out = (t) => 1 - Math.pow(1 - cl(t), 3);

// distancia (m) para a caixa ocupar no maximo (1-2*FOLGA) da tela no fov dado
export function enquadra(al, fov) {
  const th = Math.tan((fov * Math.PI) / 360), uso = 1 - 2 * FOLGA;
  const dv = al.h / (2 * uso * th), dh = al.w / (2 * uso * th * ASPECT);
  return Math.max(dv, dh) * PAD + al.w / 2;
}
const P = (al, dx, dy, dz) => [al.x + dx, Math.max(0.15, al.y + dy), al.z + dz];
const L3 = (al) => [al.x, al.y, al.z];

export const CAMERAS = {
  // 1. abertura com push: entra largo e fecha no alvo (primeiro plano do video / mudanca de cena)
  abertura_push(al, t) { const fov = 50, d = enquadra(al, fov); const k = L(1.55, 1, sm(t)); return { pos: P(al, 0.35, 0.3, d * k), look: L3(al), fov }; },
  // 2. close de reacao: rosto/ator em primeiro plano (passe a caixa do rosto como alvo)
  close_reacao(al, t) { const fov = 36, d = enquadra(al, fov); return { pos: P(al, 0.25, 0.05, d * L(1.08, 1, sm(t))), look: L3(al), fov }; },
  // 3. detalhe de objeto: apertado, com leve deriva lateral
  detalhe_objeto(al, t) { const fov = 34, d = enquadra(al, fov) * 1.05; return { pos: P(al, L(-0.25, 0.25, sm(t)), 0.15, d), look: L3(al), fov }; },
  // 4. corte transversal: de lado (eixo x), mostra a profundidade da cena
  corte_transversal(al, t) { const fov = 48, d = enquadra(al, fov) * 1.1; return { pos: P(al, d * L(1.05, 0.97, sm(t)), 0.25, 0), look: L3(al), fov }; },
  // 5. travelling lateral: camera anda de lado e continua olhando o alvo
  travelling_lateral(al, t) { const fov = 50, d = enquadra(al, fov) * 1.25; const x = L(-0.3, 0.3, sm(t)) * d; return { pos: P(al, x, 0.3, d), look: [al.x + x * 0.15, al.y, al.z], fov }; },
  // 6. plongee: de cima, olhando para baixo (~45-55 graus)
  plongee(al, t) { const fov = 50, d = enquadra(al, fov) * 1.3; return { pos: P(al, 0.2, d * 0.72, d * L(0.72, 0.62, sm(t))), look: L3(al), fov }; },
  // 9. contra-plongee (V5, ep. 37): camera baixa olhando para cima; faz o objeto enorme parecer ainda maior (gancho de escala)
  contra_plongee(al, t) { const fov = 56, d = enquadra(al, fov) * 1.1; return { pos: P(al, L(-0.15, 0.2, sm(t)), -al.y * 0.7, d * L(1, 0.85, sm(t))), look: [al.x, al.y + (al.h || 1) * 0.25, al.z], fov }; },
  // 7. orbita: gira em torno do alvo (~70 graus)
  orbita(al, t) { const fov = 50, d = enquadra(al, fov) * 1.15, a = L(-0.6, 0.6, sm(t)); return { pos: P(al, Math.sin(a) * d, 0.3, Math.cos(a) * d), look: L3(al), fov }; },
  // 8. whip-pan: varre rapido para o lado (t<0.28) e assenta enquadrado (corte de entrada de plano)
  whip_pan(al, t) {
    const fov = 52, d = enquadra(al, fov), s = cl(t / 0.28);
    const varre = 1 - out(s); // 1 -> 0
    return { pos: P(al, 0.3, 0.3, d * L(1.06, 1.0, sm((t - 0.28) / 0.72))), look: [al.x + varre * 7, al.y, al.z], fov: L(66, fov, out(s)) };
  },
};
export const NOMES = Object.keys(CAMERAS);

// Caixa do alvo a partir do bb do boneco (boneco(...).bb = [x0,x1,y0,y1] em unidades do rig; medido 18/11:
// 1 unidade = 0.00303 m; Tiao ~1,74 m com chapeu, Capitao ~1,91 m). parte: 'corpo' | 'rosto' (topo 40%: cabeca+chapeu).
export const UNIDADE_M = 0.00303;
export function caixaDe(bb, x, z, chao = 0, parte = 'corpo') {
  const h = (bb[3] - bb[2]) * UNIDADE_M || (bb[2] * -1) * UNIDADE_M, w = (bb[1] - bb[0]) * UNIDADE_M;
  const H = Math.abs(bb[2]) * UNIDADE_M || h;
  if (parte === 'rosto') return { x, y: chao + H * 0.8, z, w: w * 0.55, h: H * 0.4 };
  return { x, y: chao + H / 2, z, w, h: H };
}
