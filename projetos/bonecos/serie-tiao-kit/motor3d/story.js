// story.js de TESTE do motor: 6 stills (cenário x luz) para o portão do diretor de arte.
import { camFromKeys } from './motion.js';
import { luz } from './luzes.js';
import { boneco, deitaNaRede, segura, caranguejo, cava, E } from './acoes.js';
import { DECK, COZ, ILHA } from './mundo.js';

export const FPS = 30, TOTAL = 60;
export const SHOTS = [
  { id: 'convés-dia', a: 0, b: 9, light: 'dia' },
  { id: 'convés-dourado', a: 10, b: 19, light: 'dourado' },
  { id: 'navio-mar', a: 20, b: 29, light: 'dia' },
  { id: 'cozinha', a: 30, b: 39, light: 'cozinha' },
  { id: 'ilha-dia', a: 40, b: 49, light: 'dia' },
  { id: 'convés-noite', a: 50, b: 59, light: 'noite' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
export const LIGHTS = {};
export const lightFor = (S) => luz(S.light);
const I = ILHA, C = COZ;
const CAMS = {
  'convés-dia': { pos: [5.8, DECK + 1.5, 1.8], look: [1.6, DECK + 1.0, -0.3], fov: 50 },
  'convés-dourado': { pos: [-1.2, DECK + 2.7, 5.4], look: [-2.0, DECK + 0.9, 1.6], fov: 40 },
  'navio-mar': { pos: [14, 3.2, 26], look: [0, 4.5, 0], fov: 40 },
  'cozinha': { pos: [C.x + 1.4, C.y + 1.4, C.z + 2.3], look: [C.x - 0.6, C.y + 1.0, C.z - 0.6], fov: 46 },
  'ilha-dia': { pos: [I.x + 1.8, I.y + 1.9, I.z + 8.2], look: [I.x + 1.0, I.y + 1.3, I.z + 3.0], fov: 46 },
  'convés-noite': { pos: [5.8, DECK + 1.5, 1.8], look: [1.6, DECK + 1.0, -0.3], fov: 50 },
};
export const camAt = (f) => { const S = shotAt(f), c = CAMS[S.id]; return camFromKeys([{ f: S.a, ...c }, { f: S.b, ...c }], f); };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => { const S = shotAt(f), c = CAMS[S.id]; return { focus: dist(c.pos, c.look), cinf: S.id === 'navio-mar' ? 0 : 7 }; };
export const worldAt = (f) => {
  const S = shotAt(f);
  if (S.id === 'cozinha') return { lampada: 3 };
  if (S.id === 'ilha-dia') return { buracos: { beto: 1 }, bau: { pos: [-0.2, 0.92, 3.0] } };
  return {};
};
export const actorsAt = (f, T, W) => {
  const S = shotAt(f), t = f / 30, out = [], tint = luz(S.light).tint;
  const X = (a) => ({ tint, ...a });
  if (S.id.startsWith('convés')) {
    if (S.id !== 'convés-dia') out.push(X(deitaNaRede(W, 'tiao', { eye: 'shut', mouth: 'smile', aL: { ik: [10, -150] }, aR: { ik: [-20, -140] } }, t)));
    out.push(X(boneco(W, 'cap', segura({ eye: 'wide', mouth: 'shout', mo: 0.7, aL: [-.6, .4] }, 'map', 'R', 2.4), 1.6, -0.3, t)));
    out.push(X(boneco(W, 'mar1', { mouth: 'grin', f: -1 }, 2.6, 1.2, t)));
    out.push(X(boneco(W, 'mar2', { mouth: 'o', eye: 'wide', f: -1 }, 3.2, -1.0, t)));
  }
  if (S.id === 'cozinha') out.push(X(boneco(W, 'tiao', segura({ eye: 'dot', mouth: 'smile', lx: -0.4 }, 'recipe', 'R', 2.6, 0.9), C.x - 0.6, C.z - 0.6, t)));
  if (S.id === 'ilha-dia') {
    out.push(X(boneco(W, 'mar1', cava({ eye: 'dot', mouth: 'flat' }, t), I.x - 3.0, I.z - 0.6, t)));
    out.push(X(boneco(W, 'tiao', segura({ eye: 'happy', mouth: 'grin' }, 'map', 'R', 2.5), I.x + 1.2, I.z + 3.2, t)));
    out.push(X(boneco(W, 'cap', { eye: 'dot', mouth: 'o', f: -1 }, I.x + 2.6, I.z + 1.5, t)));
    out.push(X(caranguejo(I.x + 3.4, W.chao(I.x + 3.4, I.z + 0.6), I.z + 0.6, t)));
  }
  return out;
};
export const fxAt = () => [];
