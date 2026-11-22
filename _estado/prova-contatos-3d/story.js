import { boneco } from './acoes.js';
import { luz } from './luzes.js';
import { ORIGEM } from './cenarios.js';
import { Pz } from './Pz.js';
export const TOTAL = 180;
const c = ORIGEM.cozinha;
const xyz = (x,y,z) => [c.x+x,y,c.z+z];
export const SHOTS = [{id:'pega',a:0,b:54},{id:'aponta',a:55,b:104},{id:'cadeira',a:105,b:179}];
export const shotAt = f => SHOTS.find(s=>f<=s.b) || SHOTS.at(-1);
export const LIGHTS = {};
export const lightFor = ()=>luz('casa_dia');
export const fxAt = ()=>[];
export const dofAt = ()=>({focus:4,cinf:0});
export const worldAt = ()=>({cenario:'cozinha',cozinha:{gato:0,escalaCadeiras:.45,afastamentoCadeiras:.75}});
export const camAt = f => f<=54
  ? {pos:xyz(0,1.73,5.7),look:xyz(0,1.12,.33),fov:49}
  : f<=104
    ? {pos:xyz(-.4,1.62,4.2),look:xyz(-.18,1.13,.4),fov:47}
    : {pos:xyz(-.65,1.35,3.25),look:xyz(-.24,.79,-.55),fov:36};
export const actorsAt = (f,_t,w) => {
  const t=f/30, ator=(id,pose,x,z)=>boneco(w,id,pose,c.x+x,c.z+z,t);
  if (f<=54) return [
    ator('vizinha',{...Pz.segurar('glass',{lado:'L'}),lean:.045*Math.sin(f/9),eye:'happy',mouth:'smile'},-.68,.42),
    ator('carteiro',{...Pz.segurar('ladle',{lado:'R'}),lean:.04*Math.sin(f/8),eye:'dot',mouth:'smile'},.62,.42),
  ];
  if (f<=104) return [ator('balconista',{...Pz.apontar(xyz(1.3,1.62,-3.35),[c.x-.55,c.z+.38],{progresso:(f-57)/22}),eye:'dot',mouth:'flat'},-.55,.38)];
  const p = Math.max(0,Math.min(1,(f-111)/42));
  const assento = w.cen.lista.cozinha.assento();
  return [boneco(w,'vizinha',{...Pz.sentar(p),f:assento.f,eye:'happy',mouth:'smile'},assento.x,assento.z,t)];
};
