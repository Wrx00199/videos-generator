// Ep. 43 PILOTO V6 "O chapéu que lê pensamento" (23/11). Molde M4 (E se com ação) do MOLDES_ROTEIRO.md.
// Só kit fixo: cenários cozinha/rua/sala, elenco tiao+vizinha+carteiro, gestos do Pz (chapeuNaMao, sentar, susto, recuar, pensar, comemorar, segurar).
// Ritmo: cada fala vira planos de ~2 s (nenhum > 2,6 s), câmera alterna geral/médio/close com push-in lento.
import { FT, DUR } from './tempos.js';
import { boneco } from './acoes.js';
import { luz } from './luzes.js';
import { ORIGEM } from './cenarios.js';
import { Pz } from './Pz.js';

export const FPS = 30, TOTAL = Math.round(DUR * FPS);
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const sm = (t) => { t = cl(t); return t * t * (3 - 2 * t); };
const fala = (t) => ({ mouth: 'shout', mo: 0.25 + 0.45 * Math.abs(Math.sin(t * 11)) });
const SEM_CHAPEU = { hat: false };

// beat por fala: cenário, luz, e quem está em cena (fn(t, u) -> lista [nome, x, z, pose, sentado?]); u = 0..1 dentro da fala
const B = [
  /*0 gancho*/ { cen: 'cozinha', luz: 'casa_dia', foco: [0, .4], at: (t, u) => [['tiao', 0, .4, { eye: 'wide', mouth: 'o', mo: .4, ...(u > .55 ? { aR: [2.6, .4] } : Pz.chapeuNaMao({ progresso: 1 - sm(u / .5), chapeu: 'chapeuChef' })) }], ['vizinha', 1.0, .2, { eye: 'dot', mouth: 'smile', f: -1 }]] },
  /*1 dia1*/ { cen: 'cozinha', luz: 'casa_dia', foco: [.4, .4], at: (t) => [['tiao', 0, .4, { eye: 'happy', ...fala(t), aR: [1.45, .1] }], ['vizinha', 1.0, .3, { eye: 'happy', mouth: 'bigsmile', mo: .6, f: -1 }]] },
  /*2 se achando*/ { cen: 'cozinha', luz: 'casa_dia', foco: [0, .4], at: (t) => [['tiao', 0, .4, { ...Pz.comemorar(t) }]] },
  /*3 dia2 carteiro*/ { cen: 'cozinha', luz: 'casa_tarde', foco: [2.5, .3], sentado: 'carteiro', at: (t) => [['tiao', 2.0, .5, { eye: 'smug', mouth: 'smile', ...Pz.segurar('spoon', { lado: 'R' }) }]] },
  /*4 salgada?*/ { cen: 'cozinha', luz: 'casa_tarde', foco: [2.0, .5], close: true, sentado: 'carteiro', at: (t) => [['tiao', 2.0, .5, { ...Pz.susto(1), tilt: 0, ...fala(t) }]] },
  /*5 tira chapéu*/ { cen: 'cozinha', luz: 'casa_tarde', foco: [2.5, .4], sentado: 'carteiro', alegre: true, at: (t, u) => [['tiao', 2.0, .5, { eye: 'dot', mouth: 'flat', ...Pz.chapeuNaMao({ progresso: sm(u / .6), chapeu: 'chapeuChef' }) }]] },
  /*6 dia3 vizinha*/ { cen: 'sala', luz: 'casa_dia', foco: [.3, .4], at: (t) => [['tiao', -.4, .5, { eye: 'dot', mouth: 'flat', aL: [-.4, .3], aR: [.4, -.3] }], ['vizinha', .7, .3, { eye: 'smug', mouth: 'flat', f: -1, aR: [1.5, .15], aL: [1.3, .35] }]] },
  /*7 mentira?*/ { cen: 'sala', luz: 'casa_dia', foco: [-.4, .5], close: true, at: (t) => [['tiao', -.4, .5, { ...Pz.recuar(1), mouth: 'shout', ...fala(t) }]] },
  /*8 rua*/ { cen: 'rua', luz: 'casa_tarde', foco: [0, .6], at: (t) => [['tiao', 0, .6, { ...SEM_CHAPEU, eye: 'dot', mouth: 'flat', lean: .12, tilt: .12, aL: [-.15, .2], aR: [.15, .2] }]] },
  /*9 noite*/ { cen: 'cozinha', luz: 'casa_noite', foco: [2.9, .3], sentado: 'tiao', triste: true, at: () => [] },
  /*10 virada*/ { cen: 'rua', luz: 'casa_tarde', foco: [0, .6], close: true, at: (t, u) => [['tiao', 0, .6, { ...SEM_CHAPEU, eye: u > .5 ? 'wide' : 'dot', mouth: u > .5 ? 'o' : 'flat', mo: .4, tilt: .12 * (1 - u) }]] },
  /*10 peraí*/ { cen: 'rua', luz: 'casa_tarde', foco: [0, .6], close: true, at: (t) => [['tiao', 0, .6, { ...SEM_CHAPEU, ...Pz.pensar(), ...fala(t) }]] },
  /*11 fecho*/ { cen: 'cozinha', luz: 'casa_dia', foco: [2.0, .4], sentado: 'carteiro', alegre: true, at: (t) => [['tiao', 2.0, .5, { ...Pz.comemorar(t) }], ['vizinha', 1.1, .3, { eye: 'happy', mouth: 'bigsmile', mo: .6, f: 1 }]] },
];

// planos: cada fala corta em pedaços de ~2 s; tipos de enquadre se alternam
const TIPOS = ['geral', 'medio', 'close'];
export const SHOTS = [];
FT.forEach(([a, b], i) => {
  const fim = i + 1 < FT.length ? FT[i + 1][0] : DUR;
  const n = Math.max(1, Math.round((fim - a) / 2.0));
  for (let k = 0; k < n; k++) {
    const t0 = a + (fim - a) * k / n, t1 = a + (fim - a) * (k + 1) / n;
    const tipo = B[i].close ? (k % 2 ? 'medio' : 'close') : TIPOS[(i + k) % 3];
    SHOTS.push({ id: `f${i}_${k}`, fala: i, tipo, a: Math.round(t0 * FPS), b: Math.round(t1 * FPS) - 1, t0, t1 });
  }
});
SHOTS[0].a = 0; SHOTS.at(-1).b = TOTAL - 1;
export const shotAt = (f) => SHOTS.find((s) => f <= s.b) || SHOTS.at(-1);
const beat = (f) => B[shotAt(f).fala];

export const LIGHTS = {};
export const lightFor = (S) => luz(B[S.fala].luz);
export const fxAt = () => [];
export const dofAt = () => ({ focus: 4, cinf: 0 });
export const worldAt = (f) => {
  const b = beat(f);
  return { cenario: b.cen, cozinha: { gato: 0, escalaCadeiras: .45, afastamentoCadeiras: .75, cadeirasDeFrente: true }, rua: { multidao: .5, hora: 17.2 }, sala: {} };
};

// câmera: foco do beat, distância pelo tipo, push-in lento dentro do plano
const DIST = { geral: [4.6, 1.5, 1.0, 44], medio: [3.0, 1.35, 1.05, 40], close: [1.7, 1.25, 1.15, 36] };
export const camAt = (f) => {
  const s = shotAt(f), b = B[s.fala], o = ORIGEM[b.cen];
  const [d, h, lh, fov] = DIST[s.tipo];
  const u = cl((f - s.a) / Math.max(1, s.b - s.a));
  const lado = ((s.fala + SHOTS.indexOf(s)) % 2 ? 1 : -1) * (s.tipo === 'close' ? .25 : .45);
  const dd = d * (1 - .07 * u);
  return { pos: [o.x + b.foco[0] + lado, h, o.z + b.foco[1] + dd], look: [o.x + b.foco[0], lh, o.z + b.foco[1]], fov };
};

export const actorsAt = (f, _t, w) => {
  const t = f / FPS, s = shotAt(f), b = B[s.fala], o = ORIGEM[b.cen];
  const [a0, a1] = FT[s.fala], u = cl((t - a0) / Math.max(.1, a1 - a0));
  const out = b.at(t, u).map(([n, x, z, pose]) => boneco(w, n, { eye: 'dot', mouth: 'flat', aL: [-.4, .3], aR: [.4, -.3], ...pose }, o.x + x, o.z + z, t));
  if (b.sentado && b.cen === 'cozinha') {
    const a = w.cen.lista.cozinha.assento('direita');
    const rosto = b.alegre ? { eye: 'happy', mouth: 'bigsmile', mo: .6 } : { eye: 'dot', mouth: 'flat' };
    const extra = b.triste ? { ...SEM_CHAPEU, lean: .1, tilt: .15 } : Pz.segurar('spoon', { lado: 'L' });
    out.push(boneco(w, b.sentado, { ...Pz.sentar(1), f: a.f, ...rosto, ...extra }, a.x, a.z, t));
  }
  return out;
};
