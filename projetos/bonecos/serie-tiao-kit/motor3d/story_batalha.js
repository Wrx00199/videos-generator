// story_batalha.js — teste do portão da BATALHA NAVAL (6 stills) e exemplo de uso para o episódio 06 "a batalha era um sonho".
// Para renderizar: copiar como story.js numa pasta web/ (ver LEIA.md) e rodar render.mjs nos quadros 10,31,50,70,95,108.
import { camFromKeys, acordaDoSonho } from './motion.js';
import { luz } from './luzes.js';
import { boneco, deitaNaRede, segura, disparaCanhao, balancaNaCorda, duelo, E } from './acoes.js';
import { DECK } from './mundo.js';

export const FPS = 30, TOTAL = 130;
export const SHOTS = [
  { id: 'rival-longe', a: 0, b: 19, light: 'tempestade' },
  { id: 'tiros', a: 20, b: 39, light: 'batalha' },
  { id: 'impacto', a: 40, b: 59, light: 'batalha' },
  { id: 'ruiva', a: 60, b: 79, light: 'tempestade' },
  { id: 'abordagem', a: 80, b: 99, light: 'batalha' },
  { id: 'acorda', a: 100, b: 119, light: 'dia' },
  { id: 'mar-agitado', a: 120, b: 129, light: 'tempestade' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
export const LIGHTS = {};
export const lightFor = (S) => luz(S.light);
const RIV = [4, 0, -22], RIV_LADO = [1, 0, -7.7];       // rival ao largo / encostado (abordagem)
const CAMS = {
  'rival-longe': { pos: [3.2, DECK + 2.3, 4.4], look: [7, 4.2, -38], fov: 36 },
  'tiros': { pos: [3.6, DECK + 2.2, 1.2], look: [1.3, DECK + 0.9, -2.4], fov: 54 },
  'impacto': { pos: [-3.5, 3.4, -7.5], look: [3.0, 2.2, -19.0], fov: 40 },
  'ruiva': { pos: [5.9, DECK + 1.7, -19.4], look: [5.6, DECK + 1.45, -22.2], fov: 44 },
  'abordagem': { pos: [3.4, DECK + 2.3, 2.9], look: [2.0, DECK + 1.4, -3.5], fov: 52 },
  'mar-agitado': { pos: [24, 4.6, 20], look: [-1.5, 3.0, -8], fov: 46 },
  'acorda': { pos: [-1.4, DECK + 2.5, 4.8], look: [-2.0, DECK + 1.0, 1.6], fov: 38 },
};
export const camAt = (f) => {
  const S = shotAt(f), c = CAMS[S.id], C = camFromKeys([{ f: S.a, ...c }, { f: S.b, ...c }], f, { kicks: S.id === 'tiros' ? [{ f: 30, a: 0.25 }] : [] });
  if (S.id === 'acorda') { const s = acordaDoSonho(f, S.a); C.flash = s.flash; }
  return C;
};
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => { const S = shotAt(f), c = CAMS[S.id]; return { focus: dist(c.pos, c.look), cinf: S.id === 'rival-longe' || S.id === 'impacto' || S.id === 'mar-agitado' ? 0 : 7 }; };
export const worldAt = (f) => {
  const S = shotAt(f);
  if (S.id === 'rival-longe') return { batalha: true, balanco: 2, rival: { pos: [8, 0, -38], ry: 0.25, balanco: 2 } };
  if (S.id === 'tiros') return { batalha: true, balanco: 1.5, rival: { pos: [-6, 0, -22] }, tiros: [{ de: 'nosso', i: 2, f0: 30, alvo: { nav: 'rival', p: [2, 1.5, 3] } }] };
  if (S.id === 'impacto') return { batalha: true, rival: { pos: RIV }, tiros: [{ de: 'nosso', i: 2, f0: 32, dur: 12, alvo: { nav: 'rival', p: [-0.8, 1.4, 3] } }] };
  if (S.id === 'ruiva') return { batalha: true, rival: { pos: RIV } };
  if (S.id === 'abordagem') return { batalha: true, rival: { pos: RIV_LADO } };
  if (S.id === 'mar-agitado') return { batalha: true, rival: { pos: [-14, 0, -34], ry: 0.3 } };
  return {};
};
export const actorsAt = (f, T, W) => {
  const S = shotAt(f), t = f / 30, out = [], tint = luz(S.light).tint, cam = CAMS[S.id].pos;
  const X = (a) => ({ tint, ...a });
  if (S.id === 'rival-longe') {
    out.push(X(boneco(W, 'tiao', { eye: 'wide', mouth: 'o', mo: 0.8, brow: -0.6, browY: 0.6, aR: { ik: [150, -260] }, f: 1, sweat: 1 }, 3.35, -0.6, t)));
    out.push(X(boneco(W, 'cap', { eye: 'wide', mouth: 'shout', mo: 0.7, brow: 0.8, aL: [-0.4, 0.3], f: 1 }, 4.0, -1.1, t)));
  }
  if (S.id === 'tiros') {
    out.push(X(disparaCanhao(W, 'tiao', { eye: 'shut', mouth: 'shout', mo: 0.9, brow: -0.4, lean: -0.1 }, 'nosso', 2, cam, 1, t)));
    out.push(X(boneco(W, 'mar1', { eye: 'wide', mouth: 'o', aL: { ik: [-60, -300] }, aR: { ik: [60, -300] }, f: -1 }, 4.6, 0.6, t)));
  }
  if (S.id === 'ruiva') {
    out.push(X(boneco(W, 'ruiva', segura({ eye: 'dot', mouth: 'grin', mo: 0.6, brow: 1, lx: 0.3, aL: { ik: [-70, -40] } }, 'cutlass', 'R', Math.PI - 0.5, 1), 5.6, -22.2, t)));
    out.push(X(boneco(W, 'riv1', { eye: 'dot', mouth: 'grin', brow: 0.8, f: 1 }, 4.2, -23.4, t)));
    out.push(X(boneco(W, 'riv2', segura({ eye: 'dot', mouth: 'flat', brow: 1, f: -1 }, 'cutlass', 'R', Math.PI - 0.3), 7.0, -23.6, t)));
  }
  if (S.id === 'abordagem') {
    out.push(...duelo(W, 'tiao', { eye: 'wide', mouth: 'shout', mo: 0.8, brow: 0.9 }, 'riv1', { eye: 'dot', mouth: 'grin', brow: 1 }, [2.6, -0.5], cam, t, { armaA: 'ladle' }).map(X));
    out.push(X(balancaNaCorda(W, 'riv2', { eye: 'wide', mouth: 'shout', mo: 0.9, brow: 1 }, [1.0, -6.9], [1.6, -2.0], [1.6, DECK + 9.4, -7.7], 0.55, cam, t)));
    out.push(X(boneco(W, 'ruiva', segura({ eye: 'dot', mouth: 'grin', brow: 1, f: 1 }, 'cutlass', 'R', Math.PI - 0.6), 2.6, -5.4, t)));
  }
  if (S.id === 'acorda') out.push(X(deitaNaRede(W, 'tiao', { eye: 'wide', mouth: 'o', mo: 0.9, brow: -0.6, browY: 0.8, sweat: 1, aL: { ik: [10, -150] }, aR: { ik: [-20, -140] } }, t)));
  return out;
};
export const fxAt = () => [];
