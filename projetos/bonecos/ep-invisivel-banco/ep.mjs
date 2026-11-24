import fs from 'fs';
const C=(x,y,z)=>[x,y,z]; const W=(cx,z1,z2,cy=1380,dx=0)=>[C(cx,cy,z1),C(cx+dx,cy,z2)];
const el={
 tiao:{pele:'branca',roupa:['camiseta','#2c3440'],calca:'#1e2228',acessorios:['barba'],segura:{D:['saco'],E:[]}},
 guarda:{pele:'parda',roupa:['uniforme','#3a4a6a'],acessorios:['quepe','bigode'],segura:{D:['lanterna'],E:[]}},
 pm:{pele:'morena',roupa:['uniforme','#2a3550'],acessorios:['quepe'],segura:{D:['lanterna'],E:[]}}};
const INV=.42; const raio=(x,y,dx,em,cor='#ffe680')=>({svg:`<rect x='-160' y='-7' width='160' height='14' rx='7' fill='${cor}'/><polygon points='0,-22 34,0 0,22' fill='${cor}'/>`,x,y,anim:{dx,dur:.9,em,ease:'none'}}); const F=(txt,planos,x={})=>({txt,planos,...x});
const ep={titulo:'E se o Tião ficasse invisível',elenco:el,falas:[
F('O Tião ficou invisível por uma hora e decidiu roubar um banco.',[
 {cena:'cidade_noite',cam:W(900,1.5,1.7),atores:[{id:'tiao',x:900,expr:'cynic',acoes:[['expressao',.7,{expr:'cynic'}],['sumir',null,{nivel:.3}]]}],texto:[{txt:'1 HORA',em:.2,cor:'#ffd84a'}],sfx:[['riser/snatch',.6,.6,.7]]},
 {cena:'banco_saguao',cam:W(820,1.2,1.35),atores:[{id:'guarda',x:1020,flip:-1,acoes:[['parado',null]]}],texto:[{txt:'BANCO',em:.2}]}]),
F('Entrou pela porta da frente, e o segurança nem piscou.',[
 {cena:'banco_saguao',cam:W(820,1.35,1.5),atores:[{id:'tiao',x:500,invis:INV,acoes:[['andar',null,{dx:380}]]},{id:'guarda',x:1060,flip:-1,acoes:[['olhar',null]]}],sfx:[['whoosh_fast/crisp',.3,.4,.5]]}]),
F('No cofre, ele encheu um saco com trinta quilos de ouro.',[
 {cena:'banco_cofre',cam:W(900,2.0,2.2,1350),objetos:[{prop:'saco',x:960,y:1500,s:1.6},{prop:'ouro',x:760,y:1380,s:1.3,anim:{dx:190,dy:110,r:40,dur:.5,em:.3,ease:'power2.in'}},{prop:'ouro',x:760,y:1380,s:1.3,oculto:1,aparece:.9,anim:{dx:190,dy:110,r:-30,dur:.5,em:.9,ease:'power2.in'}}],atores:[{id:'tiao',x:640,invis:INV,acoes:[['empurrar',null,{dx:30}]]}],sfx:[['impact/metal',.8,.5,.6],['impact/metal',1.4,.5,.6]]},
 {cena:'banco_cofre',cam:W(960,1.8,2.0,1350),objetos:[{prop:'saco',x:960,y:1500,s:1.6,anim:{s:1.5,dur:.8,em:.1,ease:'back.out(2)'}}],texto:[{txt:'30 KG',em:.3,cor:'#ffd84a'}],sfx:[['cut_hit/punch',.3,.6,.5]]}]),
F('Pro guarda, era só um saco de dinheiro flutuando no corredor.',[
 {cena:'banco_saguao',cam:W(820,1.45,1.6),objetos:[{prop:'saco',x:480,y:1180,s:1.6,anim:{dx:380,dy:-90,r:12,dur:2.4,em:0,ease:'sine.inOut'}}],atores:[{id:'tiao',x:420,invis:INV,acoes:[['andar',null,{dx:380}]]},{id:'guarda',x:1120,flip:-1,acoes:[['olhar',.8],['susto',null]]}],texto:[{txt:'?!',em:.9,tam:170}]}]),
F('Ele esfregou os olhos e achou que era cansaço.',[
 {cena:'banco_saguao',cam:W(1000,1.8,1.9),atores:[{id:'guarda',x:1020,flip:-1,acoes:[['chorar',null]]}]}]),
F('Aí o Tião se virou pra sair, e não enxergou absolutamente nada.',[
 {cena:'banco_cofre',cam:W(900,1.6,1.9),atores:[{id:'tiao',x:900,invis:.42,acoes:[['virar',.4],['susto',null]]}],fx:[['flash',.6,'#000',.5]],sfx:[['pro_sub_drop/low',.5,.6,1]]}]),
F('Bateu de cara na porta do cofre e caiu sentado.',[
 {cena:'banco_cofre',cam:W(880,1.5,1.6),atores:[{id:'tiao',x:820,invis:.42,acoes:[['bater',null,{dx:160}]]}],fx:[['shake',.55,18,7]],sfx:[['impact/metal',.5,.8,1]]}]),
F('Saiu tateando a parede, igual apagão de madrugada.',[
 {cena:'banco_saguao',cam:W(800,1.5,1.6,1380,150),atores:[{id:'tiao',x:640,invis:.42,acoes:[['tatear',null,{dx:260}]]}]}]),
F('Quarenta minutos depois, ainda estava procurando a saída.',[
 {cena:'banco_saguao',cam:W(820,1.3,1.45),atores:[{id:'tiao',x:1000,flip:-1,invis:.42,acoes:[['tatear',null,{dx:-260}]]}],texto:[{txt:'40 MIN',em:.2,cor:'#ff6a5a'}],sfx:[['riser/tension',0,.35,2]]}]),
F('Sabe por quê? Pra enxergar, o olho precisa segurar a luz.',[
 {cena:'cidade_noite',cam:W(900,1.6,1.7,1100),objetos:[{tipo:'olho',x:1000,y:1050,s:.7},raio(560,1050,260,.3),raio(560,960,260,.6)],texto:[{txt:'OLHO NORMAL: PEGA A LUZ',em:.2}],fx:[['flash',1.2,'#ffe680',.3]]}]),
F('Um olho invisível deixa a luz passar direto. Não sobra nada pra ver.',[
 {cena:'cidade_noite',cam:W(900,1.6,1.7,1100),objetos:[{svg:`<g opacity='.5'>${'<ellipse rx="210" ry="130" fill="#fff" stroke="#222" stroke-width="8" stroke-dasharray="20 14"/>'}</g>`,x:1000,y:1050},raio(560,1050,760,.2,'#7fd8ff'),raio(560,960,760,.5,'#7fd8ff')],texto:[{txt:'INVISÍVEL: A LUZ ATRAVESSA',em:.2,cor:'#7fd8ff'}]},
 {cena:'banco_saguao',cam:W(820,1.6,1.8),atores:[{id:'tiao',x:700,invis:.42,acoes:[['bater',null,{dx:120}]]}],fx:[['shake',.5,14,6]],sfx:[['impact/punch',.5,.6,.6]]}]),
F('Ou seja: o homem invisível é, na verdade, um homem cego.',[
 {cena:'banco_saguao',cam:W(820,1.7,1.9),atores:[{id:'tiao',x:820,invis:.42,acoes:[['tatear',null,{dx:40}]]}],texto:[{txt:'INVISÍVEL = CEGO',em:.4,cor:'#ffd84a'}],sfx:[['cut_hit/punch',.4,.5,.5]]}]),
F('A polícia achou o Tião às três da manhã, abraçado no saco, dentro do cofre.',[
 {cena:'banco_cofre',cam:W(900,1.5,1.7),atores:[{id:'pm',x:600,pega:[['D','lanterna']],acoes:[['mostrar',null,{prop:'lanterna'}]]},{id:'tiao',x:1050,flip:-1,invis:.42,pega:[['D','saco']],acoes:[['aparecer',.5],['chorar',null]]}],fx:[['flash',.3,'#fff2a0',.4]],texto:[{txt:'3H DA MANHÃ',em:.2}],sfx:[['impact/classic',.1,.4,1]]}]),
F('O crime perfeito: ninguém viu. Nem ele.',[
 {cena:'banco_cofre',cam:W(1000,1.6,2.0),atores:[{id:'tiao',x:1000,flip:-1,pega:[['D','saco']],acoes:[['expressao',.6,{expr:'sad'}],['chorar',null]]}],fx:[['flash',.2,'#fff2a0',.3]],texto:[{txt:'NEM ELE',em:1.4,cor:'#ff6a5a'}],sfx:[['pro_sub_drop/soft',1.4,.5,1]]}])
]};
fs.writeFileSync('episodio.json',JSON.stringify(ep,null,1));
