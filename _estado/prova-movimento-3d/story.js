import { andarRota, boneco } from './acoes.js';
import { luz } from './luzes.js';
import { ORIGEM } from './cenarios.js';
import { Pz } from './Pz.js';
export const TOTAL = 255;
const c = ORIGEM.cozinha;
const roteiro = andarRota('tiao', [-.53,-.7], [
  {ate:[-.53,.70],passos:10}, {ate:[-.95,.70],passos:3},
],{pps:2.8,abs:true,t0:.10,p:()=>({eye:'dot',mouth:'flat'})});
const xyz = (x,y,z) => [c.x+x,y,c.z+z];
export const SHOTS = [{id:'rota',a:0,b:146},{id:'chapeu',a:147,b:197},{id:'cadeira',a:198,b:254}];
export const shotAt = f => SHOTS.find(s=>f<=s.b) || SHOTS.at(-1);
export const LIGHTS = {};
export const lightFor = ()=>luz('casa_dia');
export const fxAt = ()=>[];
export const dofAt = f => {
  const { pos } = camAt(f);
  const alvo = f <= 146 ? xyz(roteiro.x({t:f/30}),1.08,roteiro.z({t:f/30}))
    : f <= 197 ? xyz(-.42,1.12,.72) : xyz(.40,.85,-.50);
  return {focus:Math.hypot(...pos.map((v,i)=>v-alvo[i])),cinf:8};
};
export const worldAt = ()=>({cenario:'cozinha',cozinha:{gato:0,escalaCadeiras:.61}});
export const camAt = f => f<=146
  ? {pos:xyz(.42,2.02,5.72),look:xyz(-.63,.98,.02),fov:43}
  : f<=197
    ? {pos:xyz(.17,1.6,3.92),look:xyz(-.32,1.07,.7),fov:37}
    : {pos:xyz(-1.35,1.45,3.65),look:xyz(.45,.81,-.55),fov:38};
export const actorsAt = (f,_t,w) => {
  const t=f/30;
  const ator=(id,pose,x,z)=>boneco(w,id,pose,c.x+x,c.z+z,t);
  if (f<=146) return [ator('tiao',roteiro.p({t}),roteiro.x({t}),roteiro.z({t}))];
  if (f<=197) return [ator('cap',{...Pz.chapeuNaMao(),eye:'wide',tilt:.045*Math.sin((f-147)*.13)},-.42,.72)];
  const p=Math.max(0,Math.min(1,(f-205)/34));
  return [ator('vizinha',{...Pz.sentar(p),f:-1,eye:'happy',mouth:'smile'},.40,-.50)];
};
