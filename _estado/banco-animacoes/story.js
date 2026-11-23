import { boneco } from './acoes.js';
import { luz } from './luzes.js';
import { ORIGEM } from './cenarios.js';
import { Pz } from './Pz.js';
// BANCO DE ANIMAÇÕES: cada gesto em 30 quadros (0→1 nos 24 primeiros). Câmera fixa, um ator, cozinha.
export const TOTAL = 240;
const c = ORIGEM.cozinha;
export const GESTOS = ['sentar_esq','sentar_dir','chapeu_mao','apontar_dir','apontar_esq','segurar_R','segurar_L','segurar_mostra'];
export const SHOTS = GESTOS.map((id,i)=>({id,a:i*30,b:i*30+29}));
export const shotAt = f => SHOTS.find(s=>f<=s.b) || SHOTS.at(-1);
export const LIGHTS = {};
export const lightFor = ()=>luz('casa_dia');
export const fxAt = ()=>[];
export const dofAt = ()=>({focus:4,cinf:0});
export const worldAt = ()=>({cenario:'cozinha',cozinha:{gato:0,escalaCadeiras:.45,afastamentoCadeiras:.75,cadeirasDeFrente:true}});
export const camAt = f => { const dx = Math.floor(f/30)===1 ? 2.9 : (Math.floor(f/30)===0 ? -0.3 : 0); return {pos:[c.x+dx,1.5,c.z+4.6],look:[c.x+dx,1.0,c.z+.3],fov:44}; };
export const actorsAt = (f,_t,w) => {
  const t=f/30, g=Math.floor(f/30), l=f%30, p=Math.min(1,l/24);
  const at=(n,pose,x=0,z=.4)=>[boneco(w,n,{eye:'dot',mouth:'flat',...pose},c.x+x,c.z+z,t)];
  switch(GESTOS[g]){
    case 'sentar_esq': { const a=w.cen.lista.cozinha.assento('esquerda'); return [boneco(w,'vizinha',{...Pz.sentar(p),f:a.f,eye:'dot',mouth:'flat'},a.x,a.z,t)]; }
    case 'sentar_dir': { const a=w.cen.lista.cozinha.assento('direita'); return [boneco(w,'carteiro',{...Pz.sentar(p),f:a.f,eye:'dot',mouth:'flat'},a.x,a.z,t)]; }
    case 'chapeu_mao': return at('tiao',Pz.chapeuNaMao());
    case 'apontar_dir': return at('balconista',Pz.apontar([c.x+1.3,1.6,c.z-.5],[c.x,c.z+.4],{progresso:p}));
    case 'apontar_esq': return at('balconista',Pz.apontar([c.x-1.3,1.6,c.z-.5],[c.x,c.z+.4],{mao:'L',progresso:p}));
    case 'segurar_R': return at('vizinha',Pz.segurar('glass',{lado:'R'}));
    case 'segurar_L': return at('carteiro',Pz.segurar('ladle',{lado:'L'}));
    default: return at('vizinha',Pz.segurar('glass',{lado:'R',mostra:true,s:1.4}));
  }
};
