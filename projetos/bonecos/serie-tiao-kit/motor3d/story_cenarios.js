// story_cenarios.js — PORTÃO DOS CENÁRIOS DO CATÁLOGO: 1 quadro por cenário (Tião + 1 personagem posados) + variantes de câmera.
// Uso: copiar motor para pasta temporária, trocar story.js por este, `node render.mjs <saida> "0,1,2"` (de dentro de web/). Ver catalogo/CENARIOS.md.
import { camFromKeys } from './motion.js';
import { luz } from './luzes.js';
import { boneco, segura } from './acoes.js';
import { ORIGEM, camCen } from './cenarios.js';
import { tremor } from './efeitos.js';

export const FPS = 30, TOTAL = 31;
export const SHOTS = [
  { id: 'espaco-geral', a: 0, b: 0, light: 'espaco', cen: 'espaco', cam: 'geral' },
  { id: 'espaco-medio', a: 1, b: 1, light: 'espaco', cen: 'espaco', cam: 'medio' },
  { id: 'espaco-foguete', a: 2, b: 2, light: 'espaco', cen: 'espaco', cam: 'geral', fogo: 1, dx: -2.6 },
  { id: 'brinq-geral', a: 3, b: 3, light: 'brinquedo', cen: 'brinquedo', cam: 'geral' },
  { id: 'brinq-medio', a: 4, b: 4, light: 'brinquedo', cen: 'brinquedo', cam: 'medio' },
  { id: 'brinq-lado', a: 5, b: 5, light: 'brinquedo', cen: 'brinquedo', cam: 'geral', dx: 2.4 },
  { id: 'cidade-geral', a: 6, b: 6, light: 'cidade', cen: 'cidade', cam: 'geral' },
  { id: 'cidade-medio', a: 7, b: 7, light: 'cidade', cen: 'cidade', cam: 'medio' },
  { id: 'cidade-fundo', a: 8, b: 8, light: 'cidade', cen: 'cidade', cam: 'geral', dz: -3 },
  { id: 'cidade-fogo', a: 9, b: 9, light: 'cidade', cen: 'cidade', cam: 'fogo', pos: [[-3.6, 0.6], [-3.0, 0.1]] },
  { id: 'cidade-ruina', a: 10, b: 10, light: 'cidade', cen: 'cidade', cam: 'ruina', pos: [[3.6, 0.2], [4.6, -0.3]] },
  { id: 'cidade-banco', a: 11, b: 11, light: 'cidade', cen: 'cidade', cam: 'banco', pos: [[-5.3, 1.2], [-6.2, 1.7]] },
  { id: 'bermudas', a: 12, b: 12, light: 'bermudas', cen: 'bermudas', cam: 'geral', a1: 'tiao', a2: 'barao' },
  { id: 'maia', a: 13, b: 13, light: 'maia', cen: 'maia', cam: 'geral', a1: 'tiao', a2: 'glorp' },
  { id: 'amazonia', a: 14, b: 14, light: 'amazonia', cen: 'amazonia', cam: 'geral', a1: 'tiao', a2: 'curupira' },
  { id: 'fx-tornado', a: 15, b: 15, light: 'dia', cen: 'bermudas', cam: 'geral', cm: { pos: [0.3, 2.0, 6.4], look: [0, 9, -30], fov: 66 }, a1: 'tiao', a2: 'heroi', fx: { tornado: { pos: [ORIGEM.bermudas.x + 2, ORIGEM.bermudas.z - 48], k: 1, esc: 0.9 } } },
  { id: 'fx-furacao', a: 16, b: 16, light: 'bermudas', cen: 'bermudas', cam: 'geral', cm: { pos: [0.3, 2.0, 6.4], look: [0, 9, -30], fov: 66 }, a1: 'tiao', a2: 'zegelo', fx: { furacao: { pos: [ORIGEM.bermudas.x, ORIGEM.bermudas.z - 90], k: 1 }, chuva: { pos: [ORIGEM.bermudas.x, ORIGEM.bermudas.z], k: 1 } } },
  { id: 'fx-terremoto', a: 17, b: 17, light: 'brinquedo', cen: 'brinquedo', cam: 'geral', a1: 'tiao', a2: 'heroi', fx: { terremoto: { pos: [ORIGEM.brinquedo.x, ORIGEM.brinquedo.z - 1.5], k: 1 } } },
  { id: 'fx-tsunami', a: 18, b: 18, light: 'dia', cen: 'bermudas', cam: 'geral', cm: { pos: [0.3, 2.0, 6.4], look: [0, 9, -30], fov: 66 }, a1: 'tiao', a2: 'lucia', fx: { tsunami: { pos: [ORIGEM.bermudas.x, ORIGEM.bermudas.z - 4], k: 0.6 } } },
  { id: 'fx-meteoro', a: 19, b: 19, light: 'dia', cen: 'bermudas', cam: 'geral', cm: { pos: [0.3, 2.0, 6.4], look: [0, 9, -30], fov: 66 }, a1: 'tiao', a2: 'astro', fx: { meteoro: { de: [ORIGEM.bermudas.x - 14, 70, ORIGEM.bermudas.z - 90], ate: [ORIGEM.bermudas.x + 6, 0, ORIGEM.bermudas.z - 40], k: 0.72 }, raios: [{ pos: [ORIGEM.bermudas.x - 9, ORIGEM.bermudas.z - 36], f0: 17 }] } },
  { id: 'fx-acida', a: 20, b: 20, light: 'bermudas', cen: 'bermudas', cam: 'geral', a1: 'panda', a2: 'tigresa', fx: { chuva: { pos: [ORIGEM.bermudas.x, ORIGEM.bermudas.z], k: 1, tipo: 'acida' } } },
  { id: 'fx-neve', a: 21, b: 21, light: 'dia', cen: 'bermudas', cam: 'geral', a1: 'coelho', a2: 'galo', fx: { chuva: { pos: [ORIGEM.bermudas.x, ORIGEM.bermudas.z], k: 1, tipo: 'neve' } } },
];

const NOVOS9 = [['cyberpunk', 'robo'], ['apocalipse', 'zumbi'], ['cemiterio', 'vampiro'], ['parque', 'palhaco'], ['dojo', 'panda'], ['fundomar', 'peixeman'], ['nuvens', 'heroi'], ['arena', 'gorila'], ['floresta', 'curupira']];
NOVOS9.forEach(([id, a2], i) => SHOTS.push({ id: 'cen-' + id, a: 22 + i, b: 22 + i, light: id, cen: id, cam: 'geral', a1: 'tiao', a2 }));
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
export const LIGHTS = {};
export const lightFor = (S) => luz(S.light);
export const camAt = (f) => { const S = shotAt(f), o = ORIGEM[S.cen], c = S.cm ? { pos: [o.x + S.cm.pos[0], o.y + S.cm.pos[1], o.z + S.cm.pos[2]], look: [o.x + S.cm.look[0], o.y + S.cm.look[1], o.z + S.cm.look[2]], fov: S.cm.fov } : camCen(S.cen, S.cam, S.dx || 0, S.dz || 0); return camFromKeys([{ f: S.a, ...c }, { f: S.b, ...c }], f); };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => { const S = shotAt(f), c = camCen(S.cen, S.cam, S.dx || 0, S.dz || 0); return { focus: (S.pos || S.cm) ? 6 : dist(c.pos, c.look), cinf: 12 }; };
export const worldAt = (f) => { const S = shotAt(f); return { cenario: S.cen, fx: S.fx, bermudas: { bussola: S.fx ? 0 : 1 }, espaco: { foguete: { fogo: S.fogo || 0, y: S.fogo ? 1.4 : 0 } } }; };
export const actorsAt = (f, T, W) => {
  const S = shotAt(f), t = f / 30, out = [], tint = luz(S.light).tint, O = ORIGEM[S.cen];
  const X = (a) => ({ tint, ...a });
  if (S.cen === 'espaco' || S.cen === 'brinquedo' || S.cen === 'cidade' || S.a1) {
    const m = S.cam === 'medio', dx = S.dx || 0, P2 = S.pos || [[(m ? -0.4 : -0.65) + dx, 0.9 + (S.dz || 0)], [(m ? 0.45 : 0.7) + dx, 0.4 + (S.dz || 0)]];
    out.push(X(boneco(W, S.a1 || 'tiao', { eye: 'wide', mouth: 'o', aR: [2.5, -0.2], aL: [-0.35, 0.25], ...(S.pos ? {} : { eye: 'happy', mouth: 'grin' }) }, O.x + P2[0][0], O.z + P2[0][1], t)));
    out.push(X(boneco(W, S.a2 || 'cap', { eye: 'wide', mouth: 'o', f: -1, aL: [-0.4, 0.3] }, O.x + P2[1][0], O.z + P2[1][1], t)));
  }
  return out;
};
export const fxAt = () => [];
