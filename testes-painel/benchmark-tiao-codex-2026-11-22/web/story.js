import { anda, boneco } from './acoes.js';
import { ORIGEM } from './cenarios.js';
import { luz } from './luzes.js';

export const TOTAL = 450;
const origem = ORIGEM.cozinha;
const xyz = (x, y, z) => [origem.x + x, y, origem.z + z];
const cen = 'cozinha';

export const SHOTS = [
  { id: 'barulho-na-cozinha', a: 0, b: 104, x: 0.1, distancia: 6.4 },
  { id: 'aproximacao', a: 105, b: 224, x: -0.2, distancia: 6.7 },
  { id: 'cap-reage', a: 225, b: 329, x: 0.25, distancia: 6.4 },
  { id: 'confere-o-fogao', a: 330, b: 380, x: -0.15, distancia: 6.3 },
  { id: 'gato-revelado', a: 381, b: 449, x: 0, distancia: 6.5 },
].map(plano => ({ ...plano, cen, light: 'dia' }));

export const shotAt = quadro => SHOTS.find(plano => quadro <= plano.b) || SHOTS.at(-1);
export const LIGHTS = {};
export const lightFor = () => luz('dia');
export const dofAt = () => ({ focus: 6, cinf: 15 });
export const fxAt = () => [];
export const camAt = quadro => {
  const plano = shotAt(quadro);
  return { pos: xyz(plano.x, 1.86, plano.distancia), look: xyz(plano.x, 1.04, 0), fov: 43 };
};
export const worldAt = quadro => ({ cenario: cen, cozinha: { gato: quadro >= 381 ? 1 : 0 } });

export const actorsAt = (quadro, _tempo, mundo) => {
  const t = quadro / 30;
  const chegou = Math.max(0, Math.min(1, (quadro - 98) / 100));
  const fixa = (nome, pose, x, z) => boneco(mundo, nome, pose, origem.x + x, origem.z + z, t);
  const susto = quadro < 75 || quadro >= 381;
  return [
    anda(mundo, 'tiao', { eye: susto ? 'wide' : 'dot', mouth: susto ? 'o' : 'flat' },
      [origem.x + 0.42, origem.z + 0.9], [origem.x - 0.95, origem.z + 0.75], chegou, t),
    ...(quadro < 105 ? [] : [fixa('cap', { f: -1, eye: quadro >= 381 ? 'shut' : 'wide', mouth: quadro >= 381 ? 'grin' : 'o', aL: quadro >= 225 && quadro < 330 ? [-1.14, 0.65] : [-0.2, 0.1] }, 0.86, 0.16)]),
    fixa('mar1', { f: -1, eye: 'dot', mouth: 'flat', aL: quadro >= 270 && quadro < 380 ? [1.4, 0.24] : [-0.22, 0.04] }, -0.06, -1.55),
  ];
};
