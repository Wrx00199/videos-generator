// story_atirador.js — STORYBOARD do ep.41 "Tião e o atirador" (ref U9GsR_Mphpo). Cada FRAME = um quadro-chave (não é vídeo): render.mjs "0,1,2,..." gera 1 still por quadro.
// Planos = 1:1 com os 16 planos reais do original (+ cartão final), tempo = original x 0,973 (ficha: ritmo do original manda). Cartões 2D (mira, cartaz, setas, flash final) saem do compor_storyboard.py.
// Uso: bash portao_atirador.sh "0,1,2"  ->  /tmp/atirador_still/fNNNN.jpg
import { camFromKeys } from './motion.js';
import { luz } from './luzes.js';
import { boneco } from './acoes.js';
import { ORIGEM, camCen } from './cenarios.js';
export const FPS = 30, TOTAL = 40;
const SOL = { eye: 'wide', mouth: 'o' };
// pl = plano (1..17), t = início (s) do quadro-chave, 3d: cenário/câmera/opções/atores; card: 2D (compor_storyboard.py)
export const KF = [
  { pl: 1, t: 0.0, cen: 'sala', luz: 'casa_noite', cam: 'geral', opt: { abajur: 0 }, ac: () => [
    { n: 'tiao', x: -0.7, z: 0.7, pose: { eye: 'wide', mouth: 'smile', aR: [1.0, 0.3], hR: { k: 'panela', a: 0, s: 0.8 } } },
    { n: 'soldado_quepe', x: 0.75, z: 0.5, f: -1, pose: { f: -1, eye: 'wide', mouth: 'smile', aR: [0.35, 0.2] } }] },
  { pl: 1, foco: 'tiao', ocup: 0.55, t: 2.6, cen: 'sala', luz: 'casa_noite', cam: 'close', opt: { abajur: 0 }, ac: () => [
    { n: 'tiao', x: -0.01, z: 0.3, pose: { eye: 'wide', mouth: 'smile', aR: [1.2, 0.3], aL: [1.2, -0.3], hR: { k: 'panela', a: 0, s: 0.8 } } }] },
  { pl: 2, t: 5.1, cen: 'trincheira', cam: 'geral', opt: {}, ac: () => [
    { n: 'tiao', x: 0.1, z: 1.6, pose: { eye: 'smug', mouth: 'smile', aR: [1.0, 0.3], hR: { k: 'panela', a: 0, s: 0.8 } } }] },
  { pl: 3, t: 8.0, cen: 'trincheira', cam: 'medio', opt: {}, ac: () => [
    { n: 'tiao', x: -0.3, z: 0.5, pose: { eye: 'wide', mouth: 'o', lean: 0.2, aR: [1.0, 0.3], hR: { k: 'panela', a: 0, s: 0.8 } } },
    { n: 'soldado_quepe', x: 0.95, z: 0.5, f: -1, pose: { f: -1, eye: 'wide', mouth: 'o', lean: 0, aR: [1.6, 0.1] } }] },
  { pl: 3, t: 10.2, cen: 'trincheira', cam: 'medio', opt: {}, ac: () => [
    { n: 'tiao', x: -0.3, z: 0.5, pose: { eye: 'wide', mouth: 'o', lean: 0.2, aR: [1.0, 0.3], hR: { k: 'panela', a: 0, s: 0.8 } } },
    { n: 'soldado_quepe', x: 0.95, z: 0.5, f: -1, pose: { f: -1, eye: 'wide', mouth: 'o', lean: 0, aR: [1.6, 0.1] } }] },
  { pl: 3, t: 12.0, cen: 'trincheira', cam: 'medio', opt: {}, ac: () => [
    { n: 'tiao', x: -0.3, z: 0.5, pose: { eye: 'wide', mouth: 'o', lean: 0.25, aR: [1.0, 0.3], hR: { k: 'panela', a: 0, s: 0.8 } } },
    { n: 'soldado_quepe', x: 0.95, z: 0.5, f: -1, pose: { f: -1, eye: 'wide', mouth: 'o', lean: -0.1, aR: [1.6, 0.1] } }] },
  { pl: 4, t: 13.1, cen: 'trincheira', cam: 'medio2', opt: {}, ac: () => [
    { n: 'tiao', x: -0.45, z: 0.7, pose: { eye: 'wide', mouth: 'o', aR: [1.0, 0.3], hR: { k: 'panela', a: 0, s: 0.8 } } },
    { n: 'soldado_quepe', x: 0.65, z: 0.6, f: -1, pose: { f: -1, eye: 'wide', mouth: 'o', aR: [0.35, 0.2] } }] },
  { pl: 4, t: 15.6, cen: 'trincheira', cam: 'medio2', opt: {}, ac: () => [
    { n: 'tiao', x: -0.45, z: 0.7, pose: { eye: 'wide', mouth: 'o', aR: [1.0, 0.3], hR: { k: 'panela', a: 0, s: 0.8 } } },
    { n: 'soldado_quepe', x: 0.65, z: 0.6, f: -1, pose: { f: -1, eye: 'wide', mouth: 'o', aR: [0.35, 0.2] } }] },
  { pl: 5, t: 18.2, cen: 'trincheira', cam: 'janela', opt: { janela: 1 }, ac: () => [
    { n: 'atirador', x: 4.1, z: -2.25, y: 0.62, pose: { eye: 'wide', mouth: 'o', aR: [2.9, 0.1], aL: [2.9, -0.1] } },
    { n: 'tiao', x: 3.13, z: 0.4, pose: { eye: 'wide', mouth: 'o', aR: [1.2, 0.3], hR: { k: 'panela', a: 0, s: 0.8 } } }] },
  { pl: 5, t: 20.4, cen: 'trincheira', cam: 'janela', opt: { janela: 1 }, ac: () => [
    { n: 'atirador', x: 4.1, z: -2.25, y: 0.62, pose: { eye: 'wide', mouth: 'o', aR: [2.9, 0.1], aL: [2.9, -0.1] } },
    { n: 'tiao', x: 3.13, z: 0.4, pose: { eye: 'wide', mouth: 'o', aR: [1.2, 0.3], hR: { k: 'panela', a: 0, s: 0.8 } } }] },
  { pl: 6, t: 22.1, cen: 'trincheira', cam: 'medio2', opt: {}, ac: () => [
    { n: 'tiao', x: -0.45, z: 0.7, pose: { eye: 'wide', mouth: 'o', aR: [1.0, 0.3], hR: { k: 'panela', a: 0, s: 0.8 } } },
    { n: 'soldado_quepe', x: 0.65, z: 0.6, f: -1, pose: { f: -1, eye: 'wide', mouth: 'o', aR: [1.6, 0.1] } }] },
  { pl: 6, t: 22.9, cen: 'trincheira', cam: 'medio2', opt: {}, ac: () => [
    { n: 'tiao', x: -0.45, z: 0.7, pose: { eye: 'wide', mouth: 'o', aR: [1.0, 0.3], hR: { k: 'panela', a: 0, s: 0.8 } } },
    { n: 'soldado_quepe', x: 0.65, z: 0.6, f: -1, pose: { f: -1, eye: 'wide', mouth: 'o', aR: [1.6, 0.1] } }] },
  { pl: 8, t: 24.1, cen: 'trincheira', cam: 'medio', opt: {}, ac: () => [
    { n: 'soldado_quepe', x: -0.15, z: 0.9, pose: { eye: 'wide', mouth: 'o', lean: 0, aR: [1.3, 0.2] } },
    { n: 'tiao', x: 1.05, z: 0.5, f: -1, pose: { f: -1, eye: 'wide', mouth: 'o', hR: { k: 'panela', a: 0, s: 0.8 } } }] },
  { pl: 8, t: 27.0, cen: 'trincheira', cam: 'medio', opt: {}, ac: () => [
    { n: 'soldado_quepe', x: -0.15, z: 0.9, pose: { eye: 'wide', mouth: 'o', lean: 0.3, aR: [1.3, 0.2] } },
    { n: 'tiao', x: 1.05, z: 0.5, f: -1, pose: { f: -1, eye: 'wide', mouth: 'o', hR: { k: 'panela', a: 0, s: 0.8 } } }] },
  { pl: 9, t: 29.7, cen: 'trincheira', cam: 'paisagem', opt: { primeiroPlano: 1 }, ac: () => [] },
  { pl: 9, t: 31.8, cen: 'trincheira', cam: 'paisagem', opt: { primeiroPlano: 1 }, ac: () => [
    { n: 'tiao', x: 0.0, z: 0.6, pose: { hR: { k: 'panela', a: 0, s: 0.8 }, eye: 'wide', mouth: 'o', lean: 0.2, aR: [1.0, 0.3], aL: [-0.8, 0.4] } }] },
  { pl: 10, t: 33.5, fx: 'clarao', cen: 'trincheira', cam: 'tronco2', opt: { quepeTronco: 0.4 }, ac: () => [] },
  { pl: 10, t: 36.0, fx: 'pimq', cen: 'trincheira', cam: 'tronco2', opt: { quepeTronco: 1, furo: 1 }, ac: () => [] },
  { pl: 11, foco: 'soldado_quepe', ocup: 0.6, t: 38.2, cen: 'trincheira', cam: 'vara', opt: { quepeVara: 1 }, ac: () => [
    { n: 'soldado_quepe', x: 0.06, z: 0.2, pose: { eye: 'wide', mouth: 'o', aR: [2.5, 0.1] } }] },
  { pl: 11, foco: 'soldado_quepe', ocup: 0.6, t: 41.0, fx: 'pim', cen: 'trincheira', cam: 'vara', opt: { quepeVara: 1, furo: 1 }, ac: () => [
    { n: 'soldado_quepe', x: 0.06, z: 0.2, pose: { eye: 'wide', mouth: 'o', aR: [2.5, 0.1] } }] },
  { pl: 11, foco: 'soldado_quepe', ocup: 0.55, t: 43.8, cen: 'trincheira', cam: 'medio', opt: { quepeVara: 1, furo: 1 }, ac: () => [
    { n: 'soldado_quepe', x: 0.06, z: 0.2, pose: { eye: 'shut', mouth: 'o', aR: [2.5, 0.1] } },
    { n: 'tiao', x: 0.73, z: 0.6, f: -1, pose: { hR: { k: 'panela', a: 0, s: 0.8 }, f: -1, eye: 'wide', mouth: 'o' } }] },
  { pl: 12, t: 46.0, fx: 'balao07', cen: 'trincheira', cam: 'vara', opt: { boneco: 1 }, ac: () => [
    { n: 'soldado_quepe', x: 0.06, z: 0.2, pose: { eye: 'happy', mouth: 'grin', aR: [2.5, 0.1] } }] },
  { pl: 12, t: 48.2, cen: 'trincheira', cam: 'medio', opt: { boneco: 1 }, ac: () => [
    { n: 'soldado_quepe', x: 0.06, z: 0.2, pose: { eye: 'happy', mouth: 'grin', aR: [2.5, 0.1] } },
    { n: 'tiao', x: 0.72, z: 0.7, f: -1, pose: { hR: { k: 'panela', a: 0, s: 0.8 }, f: -1, eye: 'wide', mouth: 'o' } }] },
  { pl: 13, foco: 'tiao', ocup: 0.65, t: 50.3, cen: 'trincheira', cam: 'tampa', opt: { tampa: 1 }, ac: () => [
    { n: 'tiao', x: 0.12, z: 0.2, pose: { hR: { k: 'panela', a: 0, s: 0.8 }, eye: 'happy', mouth: 'grin', aR: [2.5, 0.1] } }] },
  { pl: 13, foco: 'tiao', ocup: 0.6, t: 54.5, fx: 'brilho', cen: 'trincheira', cam: 'tampa', opt: { tampa: 1, clarao: 0.6 }, ac: () => [
    { n: 'tiao', x: 0.12, z: 0.2, pose: { hR: { k: 'panela', a: 0, s: 0.8 }, eye: 'wide', mouth: 'o', aR: [2.5, 0.1] } }] },
  { pl: 13, t: 57.8, cen: 'trincheira', cam: 'janela', opt: { clarao: 1, mira: 1 }, ac: () => [
    { n: 'atirador', x: 4.1, z: -2.25, y: 0.62, pose: { eye: 'wide', mouth: 'o', aR: [2.9, 0.1], aL: [2.9, -0.1] } },
    { n: 'tiao', x: 3.13, z: 0.4, pose: { eye: 'wide', mouth: 'o', aR: [1.2, 0.3], aL: [1.2, -0.3], hR: { k: 'panela', a: 0, s: 0.8 } } }] },
  { pl: 14, foco: 'soldado_quepe', ocup: 0.55, t: 59.6, cen: 'trincheira', cam: 'medio', opt: {}, ac: () => [
    { n: 'soldado_quepe', x: -0.61, z: 0.7, pose: { eye: 'wide', mouth: 'smile', aR: [1.6, 0.2], lean: 0.2 } },
    { n: 'tiao', x: 0.5, z: 0.8, pose: { eye: 'happy', mouth: 'grin', aR: [1.45, 0.2], aL: [1.2, -0.2], hR: { k: 'ladle', a: -0.6, s: 0.8 }, hL: { k: 'panela', a: 0, s: 0.7 } } }] },
  { pl: 14, foco: 'soldado_quepe', ocup: 0.55, t: 63.5, cen: 'trincheira', cam: 'medio2', opt: {}, ac: () => [
    { n: 'soldado_quepe', x: -1.0, z: 0.7, pose: { eye: 'wide', mouth: 'o', aR: [1.6, 0.2], lean: 0.25 } },
    { n: 'tiao', x: 0.1, z: 0.8, pose: { eye: 'happy', mouth: 'grin', aR: [1.55, 0.2], aL: [1.2, -0.2], hR: { k: 'ladle', a: -0.9, s: 0.8 }, hL: { k: 'panela', a: 0, s: 0.7 } } }] },
  { pl: 0, foco: 'atirador', ocup: 0.7, t: 0, cen: 'trincheira', cam: 'janela', opt: { janela: 1 }, ac: () => [
    { n: 'atirador', x: 4.1, z: -1.5, pose: { eye: 'wide', mouth: 'o', aR: [2.9, 0.1], aL: [2.9, -0.1] } }] },
  { pl: 0, foco: 'soldado_quepe', ocup: 0.7, t: 0, cen: 'trincheira', cam: 'medio2', opt: { panelaBarril: 1 }, ac: () => [
    { n: 'soldado_quepe', x: -0.7, z: 0.8, pose: { eye: 'happy', mouth: 'grin', aR: [1.8, 0.2] } },
    { n: 'tiao', x: 0.35, z: 0.7, f: -1, pose: { f: -1, eye: 'happy', mouth: 'grin', aR: [2.5, 0.2] } }] },
  { pl: 14, t: 64.4, split: [28, 29] },
  { pl: 15, t: 71.0, fx: 'granada', cen: 'trincheira', cam: 'medio2', opt: { panelaBarril: 1 }, ac: () => [
    { n: 'soldado_quepe', x: -0.7, z: 0.9, pose: { eye: 'happy', mouth: 'grin', aR: [1.8, 0.2] } },
    { n: 'tiao', x: 0.35, z: 0.7, f: -1, pose: { f: -1, eye: 'happy', mouth: 'grin', aR: [2.5, 0.2] } }] },
  { pl: 15, t: 73.6, fx: 'aviao', cen: 'trincheira', cam: 'medio2', opt: { panelaBarril: 1 }, ac: () => [
    { n: 'tiao', x: 0.2, z: 0.9, pose: { eye: 'wide', mouth: 'o', aR: [2.9, 0.1], aL: [1.2, 0.2] } }] },
  { pl: 16, foco: 'tiao', ocup: 0.6, t: 76.1, cen: 'trincheira', cam: 'medio2', opt: { panelaBarril: 1 }, ac: () => [
    { n: 'atirador', x: 1.2, z: 0.5, f: -1, pose: { f: -1, eye: 'wide', mouth: 'o', aR: [2.9, 0.1], aL: [2.9, -0.1] } },
    { n: 'tiao', x: -0.4, z: 0.6, pose: { eye: 'smug', mouth: 'smile', aR: [1.4, 0.2] } }] },
  { pl: 16, foco: 'tiao', ocup: 0.6, t: 78.3, cen: 'trincheira', cam: 'baixo', opt: { panelaBarril: 1 }, ac: () => [
    { n: 'tiao', x: 0.25, z: 0.8, pose: { eye: 'smug', mouth: 'smile', aR: [1.4, 0.2] } }] },
  { pl: 17, t: 80.5, card: 'flash_imposto' },
  { pl: 0, t: 0, cen: 'trincheira', cam: 'rosto', opt: { janela: 1, clarao: 0.75 }, ac: () => [
    { n: 'atirador', x: 4.1, z: -2.2, y: 0.62, pose: { eye: 'wide', mouth: 'o' } }] },
];
export const SHOTS = KF.map((k, i) => ({ ...k, id: 's' + i, a: i, b: i, light: k.luz || k.cen || 'trincheira' }));
export const shotAt = (f) => SHOTS[Math.min(f, SHOTS.length - 1)];
export const LIGHTS = {};
export const lightFor = (S) => luz(S.luz || S.cen || 'trincheira');
const cen = (S) => S.cen || 'trincheira';
export const camAt = (f) => { const S = shotAt(f), c = camCen(cen(S), S.cam || 'medio'); return camFromKeys([{ f: 0, ...c }, { f: 99, ...c }], f); };
export const dofAt = (f) => { const S = shotAt(f), c = camCen(cen(S), S.cam || 'medio'); return { focus: Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), cinf: 12 }; };
export const worldAt = (f) => { const S = shotAt(f); return { cenario: cen(S), [cen(S)]: S.opt || {} }; };
export const actorsAt = (f, T, W) => {
  const S = shotAt(f), t = f / 30, O = ORIGEM[cen(S)], tint = luz(S.luz || cen(S)).tint;
  return (S.ac ? S.ac() : []).map((A) => boneco(W, A.n, A.pose, O.x + A.x, O.z + A.z, t, A.y != null ? { tint, y: A.y, apoio: 'janela' } : { tint }));
};
export const fxAt = () => [];
