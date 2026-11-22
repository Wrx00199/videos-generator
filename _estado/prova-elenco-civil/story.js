import { anda, boneco } from './acoes.js';
import { ORIGEM } from './cenarios.js';
import { luz } from './luzes.js';

const o = ORIGEM.cozinha;
export const TOTAL = 97;
export const SHOTS = [{id:'prova',a:0,b:96}];
export const LIGHTS = {};
export const shotAt = () => SHOTS[0];
export const lightFor = () => luz('casa_dia');
export const fxAt = () => [];
export const worldAt = f => ({cenario:'cozinha',cozinha:{gato:f < 93 ? 1 : 0,gatoX:.53}});
export const dofAt = () => ({focus:5,cinf:0});
export const camAt = f => f >= 93
  ? {pos:[o.x,1.72,o.z+3.7],look:[o.x,1.35,o.z+.82],fov:32}
  : f === 90
  ? {pos:[o.x+.62,1.22,o.z+3.65],look:[o.x+.5,.49,o.z+1.4],fov:37}
  : {pos:[o.x+.02,1.95,o.z+6.45],look:[o.x,.98,o.z+.35],fov:51};
export const actorsAt = (f, _t, w) => {
  if (f === 90) return [];
  const ator = (id,x,z,pose,extra={}) => boneco(w,id,pose,o.x+x,o.z+z,f/30,extra);
  if (f >= 93) {
    const nome = ['vizinha','balconista','carteiro','feirante'][f-93];
    return [ator(nome,0,.82,{eye:'dot',mouth:'smile'},{yaw:f === 94 ? .32 : 0})];
  }
  return [
    ator('vizinha',-.94,.4,{eye:'happy',mouth:'smile'}, {yaw:f === 92 ? Math.PI/2 : 0}),
    anda(w,'tiao',{eye:'wide',mouth:'o'},[o.x-.27,o.z+.31],[o.x-.27,o.z+.83],Math.min(1,f/42),f/30,{yaw:.35*Math.sin(Math.min(1,f/42)*Math.PI)}),
    ator('feirante',f === 91 ? 1.3 : .69,f === 91 ? -.6 : .86,{eye:'dot',mouth:'flat'}),
  ];
};
