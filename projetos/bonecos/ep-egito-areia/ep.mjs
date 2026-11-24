// fonte legível do episodio.json (rodar: node ep.mjs)
const C=(x,y,z)=>[x,y,z]; const W=(cx,z1,z2,cy=1380,dx=0)=>[C(cx,cy,z1),C(cx+dx,cy,z2)];
const tiao={id:'tiao'}, el={
 tiao:{pele:'branca',roupa:['tunica','#efe3c4'],acessorios:['barba'],segura:{D:['jarro'],E:[]}},
 farao:{pele:'morena',roupa:['farao','#f2e6c8'],acessorios:['nemes'],segura:{D:[],E:[]}},
 capataz:{pele:'parda',roupa:['regata','#8a5a3a'],acessorios:['lenco_cabeca','bigode'],segura:{D:['chicote'],E:[]}},
 op1:{pele:'morena',roupa:['regata','#c9b48a'],acessorios:['lenco_cabeca'],segura:{D:[],E:[]}},
 op2:{pele:'escura',roupa:['regata','#b7a27a'],acessorios:[],segura:{D:[],E:[]}}};
const treno=(x,o={})=>({tipo:'treno',x,y:1560,...o});
const F=(txt,planos,x={})=>({txt,planos,...x});
const ep={titulo:'Tião foi pro Egito com um balde',elenco:el,falas:[
F('O Tião foi parar no Egito e fez vinte blocos de pedra andarem usando só água.',[
 {cena:'egito_obra',cam:W(900,1.05,1.2,1250),objetos:[treno(-300,{s:.6,y:1420,anim:{dx:900,dur:3,ease:'none'}}),treno(-900,{s:.6,y:1420,anim:{dx:900,dur:3,ease:'none'}}),treno(300,{anim:{dx:500,dur:3,ease:'none'}})],atores:[{id:'tiao',x:1100,flip:-1,pega:[['D','jarro']],acoes:[['despejar',null]]}],texto:[{txt:'20 BLOCOS',em:.4,cor:'#ffd84a'}],sfx:[['drip/drop',.8,.5,1]]},
 {cena:'egito_obra',cam:W(800,1.4,1.4,1380,500),objetos:[treno(700,{anim:{dx:500,dur:1.6,em:.2}})],atores:[{id:'op1',x:1050,acoes:[['puxar',null,{dx:500}]]}],sfx:[['whoosh_fast/whip',.2,.5,.6]]}]),
F('Cada bloco pesava duas toneladas. Oitenta homens mal arrastavam um por dia.',[
 {cena:'egito_obra',cam:W(950,1.35,1.5),objetos:[treno(600)],atores:[{id:'op1',x:1000,acoes:[['puxar',null,{dx:40}]]},{id:'op2',x:1180,acoes:[['puxar',null,{dx:40}]]}],texto:[{txt:'2 TONELADAS',y:990,em:.3}],sfx:[['impact/deep',.3,.5,1]]},
 {cena:'egito_obra',cam:W(1000,1.7,1.8),atores:[{id:'op2',x:1000,expr:'sad',acoes:[['chorar',null]]}]}]),
F('O Tião olhou aquilo, pegou um jarro e começou a molhar a areia.',[
 {cena:'egito_obra',cam:W(900,1.6,1.8),atores:[{id:'tiao',x:900,acoes:[['olhar',.8],['expressao',.4,{expr:'suspect'}],['pegar',1.2,{prop:'jarro',lado:'D'}]]}]},
 {cena:'egito_obra',cam:W(950,1.6,1.7),objetos:[treno(600),{tipo:'poca',x:1040,y:1570,oculto:1,aparece:.8}],atores:[{id:'tiao',x:1150,flip:-1,pega:[['D','jarro']],acoes:[['despejar',null]]}],sfx:[['drip/drop',.6,.6,1]]}]),
F('O faraó riu na cara dele: tá regando o deserto, velhote?',[
 {cena:'egito_palacio',cam:W(900,1.5,1.75),atores:[{id:'farao',x:900,flip:-1,expr:'cynic',acoes:[['apontar',.9,{expr:'cynic'}],['comemorar',null]]}],sfx:[['cut_hit/punch',.1,.4,.6]]},
 {cena:'egito_obra',cam:W(900,1.8,1.9),atores:[{id:'tiao',x:900,pega:[['D','jarro']],acoes:[['expressao',null,{expr:'suspect'}]]}]}],{estilo:'zombeteiro'}),
F('Os operários riram junto, e o capataz estalou o chicote no chão.',[
 {cena:'egito_obra',cam:W(900,1.35,1.45),atores:[{id:'op1',x:700,acoes:[['comemorar',null]]},{id:'op2',x:1100,flip:-1,acoes:[['comemorar',null]]}]},
 {cena:'egito_obra',cam:W(900,1.7,1.8),atores:[{id:'capataz',x:900,expr:'rage',pega:[['D','chicote']],acoes:[['raiva',null]]}],fx:[['shake',.5,14,6]],sfx:[['whoosh_fast/whip',.4,.7,.5],['impact/punch',.55,.6,.6]]}]),
F('O Tião nem respondeu. Despejou mais água bem na frente do trenó.',[
 {cena:'egito_obra',cam:W(1100,2.1,2.2,1250),atores:[{id:'tiao',x:1150,flip:-1,expr:'suspect',acoes:[['expressao',.3,{expr:'suspect'}],['olhar',null]]}]},
 {cena:'egito_obra',cam:W(960,1.45,1.6),objetos:[treno(600),{tipo:'poca',x:1050,y:1570}],atores:[{id:'tiao',x:1220,flip:-1,pega:[['D','jarro']],acoes:[['despejar',null]]}],sfx:[['drip/drop',.5,.6,1]]}]),
F('Aí mandou só dez homens puxarem.',[
 {cena:'egito_obra',cam:W(950,1.15,1.25,1300),objetos:[treno(160,{s:.8})],atores:[{id:'op1',x:480,s:.8,acoes:[['puxar',null,{dx:20}]]},{id:'op2',x:565,s:.8,acoes:[['puxar',null,{dx:20}]]},{id:'op1',x:650,s:.8,acoes:[['puxar',null,{dx:20}]]},{id:'op2',x:735,s:.8,acoes:[['puxar',null,{dx:20}]]},{id:'op1',x:820,s:.8,acoes:[['puxar',null,{dx:20}]]},{id:'op2',x:905,s:.8,acoes:[['puxar',null,{dx:20}]]},{id:'op1',x:990,s:.8,acoes:[['puxar',null,{dx:20}]]},{id:'op2',x:1075,s:.8,acoes:[['puxar',null,{dx:20}]]},{id:'op1',x:1160,s:.8,acoes:[['puxar',null,{dx:20}]]},{id:'op2',x:1245,s:.8,acoes:[['puxar',null,{dx:20}]]}],texto:[{txt:'10 HOMENS',em:.3,cor:'#ffd84a'}]},
 {cena:'egito_obra',cam:W(900,1.6,1.7),atores:[{id:'tiao',x:900,acoes:[['apontar',null,{alto:1}]]}]}]),
F('E o bloco escorregou como se fosse de isopor.',[
 {cena:'egito_obra',cam:W(600,1.3,1.4,1380,500),objetos:[treno(500,{anim:{dx:700,dur:1.9,em:.1,ease:'power2.in'}})],atores:[{id:'op1',x:860,acoes:[['correr',null,{dx:700}]]},{id:'op2',x:1000,acoes:[['correr',null,{dx:700}]]}],sfx:[['whoosh_big/cape',.2,.6,1.2]]}]),
F('No fim do dia: vinte blocos do Tião. Dois do faraó.',[
 {cena:'egito_obra',cam:W(900,1.0,1.1,1200),objetos:[...[0,1,2,3,4].flatMap(i=>[0,1,2,3].map(c=>treno(250+c*150+i*20,{s:.25,y:1330-i*45}))),treno(1320,{s:.32,y:1330}),treno(1320,{s:.32,y:1275})],atores:[{id:'tiao',x:900,pega:[['D','jarro']],acoes:[['comemorar',null]]}],texto:[{txt:'TIÃO 20 x 2 FARAÓ',y:880,em:.2,cor:'#ffd84a'}],sfx:[['impact/classic',.2,.5,1]]},
 {cena:'egito_palacio',cam:W(900,1.7,1.85),atores:[{id:'farao',x:900,acoes:[['susto',null]]}],texto:[{txt:'FARAÓ 2',y:990,em:.1,cor:'#ff6a5a'}],sfx:[['pro_sub_drop/low',.1,.6,1]]}]),
F('O faraó gritou que aquilo era feitiçaria.',[
 {cena:'egito_palacio',cam:W(1160,1.4,1.5),atores:[{id:'farao',x:1160,flip:-1,acoes:[['apontar',null,{expr:'rage'}]]}]},
 {cena:'egito_palacio',cam:W(900,1.6,1.9),atores:[{id:'farao',x:900,acoes:[['raiva',null]]}],fx:[['shake',.3,12,6]]}]),
F('Não era. Areia seca se amontoa na frente do trenó e trava tudo.',[
 {cena:'egito_obra',cam:W(1050,1.2,1.28),objetos:[treno(650),{tipo:'pedra',x:1000,y:1565,s:.6}],atores:[{id:'op1',x:1050,acoes:[['puxar',null,{dx:10}]]}],texto:[{txt:'AREIA SECA = TRAVA',y:990,em:.4}]}]),
F('Molhada na medida certa, ela endurece, e a força cai pela metade.',[
 {cena:'egito_obra',cam:W(1120,1.2,1.25,1380,200),objetos:[{tipo:'poca',x:950,y:1570},treno(650,{anim:{dx:300,dur:1.6,em:.4}})],atores:[{id:'op1',x:1050,acoes:[['puxar',null,{dx:300}]]}],texto:[{txt:'FORÇA ÷ 2',y:990,em:.4,cor:'#7fd8ff'}]}]),
F('O Tião não ganhou nem um obrigado. Ganhou foi uma chicotada.',[
 {cena:'egito_obra',cam:W(900,1.5,1.6),atores:[{id:'capataz',x:700,pega:[['D','chicote']],acoes:[['raiva',null]]},{id:'tiao',x:1100,flip:-1,acoes:[['olhar',null]]}],sfx:[['whoosh_fast/whip',.6,.7,.5]]},
 {cena:'egito_obra',cam:W(900,1.6,1.7),atores:[{id:'tiao',x:900,acoes:[['susto',null]]}],fx:[['shake',.1,16,7],['flash',.1,'#fff',.2]],sfx:[['impact/punch',.1,.8,.6]]}]),
F('Três mil anos depois, arqueólogos acharam essa cena pintada numa tumba.',[
 {cena:'tumba_parede',cam:W(1000,1.0,1.35,800),texto:[{txt:'3.000 ANOS DEPOIS',y:420,em:.2}],sfx:[['riser/build',0,.4,2]]}]),
F('Um homem jogando água na frente de um trenó gigante.',[
 {cena:'tumba_parede',cam:W(980,1.7,2.1,720),texto:[{txt:'ÁGUA ↓',y:560,em:.6,cor:'#7fd8ff'}],fx:[['flash',.6,'#fff',.2]],sfx:[['cut_hit/punch',.6,.5,.6]]}]),
F('E por um século, os cientistas acharam que era só decoração.',[
 {cena:'tumba_parede',cam:W(950,1.25,1.15,1200),atores:[{id:'tiao',x:1100,s:1,flip:-1,acoes:[['expressao',.5,{expr:'cynic'}],['apontar',null,{alto:1,expr:'cynic'}]]}],texto:[{txt:'"DECORAÇÃO"',y:990,em:.4,cor:'#ffd84a'}]}])
]};
import('fs').then(fs=>fs.writeFileSync('episodio.json',JSON.stringify(ep,null,1)));
