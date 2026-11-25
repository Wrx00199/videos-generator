import fs from 'fs';
// Piloto molde Ricks medido (24/11): quadro 0 em ação, "é que" cedo, planos 2–3 s, dissolve 0,3 s casado, 1/3 sem Tião, fim seco.
const C=(x,y,z)=>[x,y,z]; const W=(cx,z1,z2,cy=1400,dx=0,dy=0)=>[C(cx,cy,z1),C(cx+dx,cy+dy,z2)];
const el={
 tiao:{pele:'branca',roupa:['camiseta','#e0663a'],calca:'#2d3e66',acessorios:['barba'],segura:{D:['lixo'],E:[]}},
 vizinha:{pele:'morena',roupa:['regata','#3fa37a'],calca:'#5a3d6e',acessorios:['lenco_cabeca'],segura:{D:['lixo'],E:[]}},
 vizinho:{pele:'parda',roupa:['camiseta','#d9c23a'],calca:'#333a44',acessorios:['bigode'],segura:{D:['lixo'],E:[]}},
 turista:{pele:'branca',roupa:['social','#7fb8e8'],calca:'#d8c9a0',acessorios:['chapeu_explorador','oculos_escuros'],segura:{D:['phone'],E:[]}},
 turista2:{pele:'parda',roupa:['camiseta','#e86fa0'],calca:'#2a2a3a',acessorios:['oculos_escuros'],segura:{D:['phone'],E:[]}},
 prefeito:{pele:'branca',roupa:['terno','#2b2f3a'],calca:'#2b2f3a',acessorios:['bigode'],segura:{D:[],E:[]}}};
const F=(txt,planos,x={})=>({txt,planos,...x});
const G=(x,y,s=1,ex={})=>({img:'geladeira',x,y,w:300*s,h:420*s,...ex});
const P=(x,y,s=1,ex={})=>({img:'pneu',x,y,w:240*s,h:240*s,...ex});
const pres=`<defs><linearGradient id="pz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe14a" stop-opacity=".0"/><stop offset=".55" stop-color="#ff9a2a" stop-opacity=".55"/><stop offset="1" stop-color="#ff2a2a" stop-opacity=".8"/></linearGradient></defs><rect x="-520" y="-900" width="1040" height="900" fill="url(#pz)"/>`;
const ep={titulo:'Tião construiu um castelo de lixo',molde:'ricks',elenco:el,
trilha:[{f:'../../../banco/musica/corporativo_inspiracional_animado.mp3',de_fala:0},{f:'../../../banco/musica/pizzicato_curioso_travesso.mp3',de_fala:6},{f:'../../../banco/musica/hiphop_grave_confiante.mp3',de_fala:7},{f:'../../../banco/musica/tensa_cello_suspense.mp3',de_fala:10},{f:'../../../banco/musica/epica_destruicao_orquestral.mp3',de_fala:12,gain:.16},{f:'../../../banco/musica/marimba_alegre_brincalhona.mp3',de_fala:14}],
falas:[
F('O Tião construiu um castelo de trinta metros só com lixo, e ele soterrou a prefeitura.',[
 {cena:'cl_castelo_medio',cam:W(900,1.45,1.3,950,0,-60),atores:[{id:'tiao',x:900,y:1000,s:.8,acoes:[['jogar',null,{prop:'lixo'}]]}],objetos:[G(980,1000,.7,{anim:{dy:-260,r:25,dur:.6,em:.15,ease:'power2.out'}})],sfx:[['real/impacto_metal_pesado',.75,.5]]},
 {cena:'cl_castelo_prefeitura',cam:W(900,1.15,1.35,1300,0,-60),transicao:'dissolve',fx:[['poeira',900,1450]],sfx:[['pro_sub_drop/low',.2,.4,1]]}]),
F('É que o caminhão do lixo parou de passar na rua dele fazia três meses.',[
 {cena:'cl_cozinha',cam:W(593,2.0,2.4,580),objetos:[{svg:`<rect x="-104" y="-50" width="208" height="50" fill="#d23a2a"/><text x="0" y="-13" font-size="31" font-weight="900" text-anchor="middle" fill="#fff" font-family="Montserrat">OUTUBRO</text>`,x:593,y:478,aparece:.6}],sfx:[['fit/whoosh.short/bamboo_swish',.5,.3,.35]]},
 {cena:'cl_rua_lixo',cam:W(900,1.2,1.4,1450,-80),transicao:'dissolve'}]),
F('No primeiro dia, ele só empilhou os sacos pra liberar a calçada.',[
 {cena:'cl_rua_lixo',cam:W(760,1.6,1.7,1400,160),atores:[{id:'tiao',x:600,acoes:[['empurrar',null,{dx:280,prop:'lixo'}]]}],objetos:[{img:'lixo',x:900,y:1600,w:200,h:200,anim:{dx:280,dur:1.6,ease:'power1.inOut'}}]}]),
F('No décimo, já tinha muralha de geladeira e torre de pneu.',[
 {cena:'cl_castelo_medio',cam:W(900,1.5,1.2,1500,0,-200),transicao:'dissolve',sfx:[['impact/metal',.3,.4,.6]]},
 {cena:'cl_castelo_medio',cam:W(1100,1.3,1.5,1280),atores:[{id:'tiao',x:1100,s:.6,acoes:[['olhar',.6],['comemorar',null]]}],objetos:[P(700,1600,1.1,{oculto:1,aparece:.2,anim:{dy:-30,dur:.3,em:.2,ease:'bounce.out'}})]}]),
F('Aí os vizinhos acharam lindo, e começaram a jogar lixo de propósito.',[
 {cena:'cl_rua_lixo',cam:W(900,1.4,1.55),atores:[{id:'vizinha',x:700,acoes:[['susto',.4],['comemorar',.7],['jogar',null,{prop:'lixo'}]]},{id:'vizinho',x:1080,flip:-1,acoes:[['jogar',.8,{prop:'lixo'}],['comemorar',null]]}],sfx:[['ui_pop/wide',.8,.35,.2]]},
 {cena:'cl_rua_lixo',cam:W(900,1.7,1.5,1100,0,-100),angulo:'baixo',objetos:[{img:'lixo',x:700,y:300,w:180,h:180,anim:{dy:1200,r:80,dur:1,ease:'power2.in'}},{img:'lixo',x:1100,y:100,w:160,h:160,anim:{dy:1400,r:-60,dur:1.1,em:.2,ease:'power2.in'}},{img:'colchao',x:900,y:0,w:300,h:300,anim:{dy:1400,r:30,dur:1.1,em:.4,ease:'power2.in'}}]}]),
F('Sofá, colchão, até um fusca.',[
 {cena:'cl_castelo_medio',cam:W(900,2.0,2.1,1400),transicao:'corte',objetos:[{img:'sofa',x:900,y:400,w:520,h:300,anim:{dy:1150,dur:.35,ease:'power3.in'}}],fx:[['shake',.35,10,4]],sfx:[['real/queda_objeto_grande',.35,.5]]},
 {cena:'cl_castelo_medio',cam:W(900,2.0,2.1,1400),transicao:'corte',objetos:[{img:'colchao',x:900,y:400,w:420,h:380,anim:{dy:1150,r:-12,dur:.35,ease:'power3.in'}}],fx:[['shake',.35,8,4]],sfx:[['cut_hit/kick',.35,.5,.4]]},
 {cena:'cl_castelo_noite',cam:W(900,1.6,1.9,1450),transicao:'corte',objetos:[{img:'fusca',x:900,y:200,w:560,h:360,anim:{dy:1400,dur:.45,ease:'power3.in'}}],fx:[['shake',.5,20,6],['poeira',900,1600]],sfx:[['real/queda_geladeira_objeto',.45,.7]]}]),
F('E o segredo tava no peso: cada camada esmagava a de baixo até virar tijolo.',[
 {cena:'cl_corte_castelo',cam:W(900,1.2,1.5,1100),transicao:'dissolve',objetos:[{svg:pres,x:900,y:1700,oculto:1,aparece:.8,anim:{s:1.05,dur:2,em:.8}}],fx:[['shake',1.6,3,10]],sfx:[['riser/build',.4,.35,2]]}]),
F('Em um mês, o castelo passou o prédio da prefeitura.',[
 {cena:'cl_castelo_prefeitura',cam:W(900,1.0,1.25,1000,0,200),transicao:'dissolve',atores:[{id:'tiao',x:700,y:560,s:.22,acoes:[['comemorar',null]]}]},
 {cena:'cl_castelo_prefeitura',cam:W(700,2.6,2.8,620),atores:[{id:'tiao',x:700,y:560,s:.22,acoes:[['expressao',null,{expr:'smug'}]]}]}]),
F('Vinha ônibus de turista só pra tirar foto.',[
 {cena:'cl_praca_turistas',cam:W(900,1.4,1.6,1450,120),transicao:'dissolve',atores:[{id:'turista',x:650,acoes:[['mostrar',.7,{prop:'phone'}],['comemorar',null]]},{id:'turista2',x:1000,acoes:[['olhar',.4],['mostrar',null,{prop:'phone'}]]},{id:'vizinha',x:1300,flip:-1,acoes:[['comemorar',null]]}],fx:[['flash',.6,'#fff',.25],['flash',1.1,'#fff',.25]],sfx:[['real/camera_celular_clique',.6,.5],['real/camera_celular_clique',1.1,.5],['real/multidao_murmurando',0,.15]]}]),
F('Aí o prefeito foi na TV dizer que aquilo era ilegal,',[
 {cena:'cl_boteco',cam:W(900,1.3,1.55,1350),transicao:'dissolve',atores:[{id:'prefeito',x:900,s:.9,acoes:[['raiva',.5],['apontar',.7],['reclamar',null]]}],objetos:[{svg:`<rect x="-200" y="-40" width="400" height="70" fill="#c81e1e"/><text x="0" y="12" font-size="46" font-weight="900" text-anchor="middle" fill="#fff" font-family="Montserrat">É ILEGAL!</text>`,x:900,y:960,aparece:.5,frente:1}],sfx:[['real/sino_noticia_tv',0,.25]]}]),
F('e mandou um trator derrubar tudo de madrugada.',[
 {cena:'cl_castelo_noite',cam:W(1100,1.3,1.6,1450,-200),transicao:'dissolve',objetos:[{img:'trator',x:1700,y:1640,w:620,h:460,anim:{dx:-600,dur:2.2,ease:'power1.out'}}],fx:[['shake',.2,4,20]],sfx:[['real/motor_trator',0,.35]]}]),
F('Só que o trator puxou justo o fusca. O fusca da base.',[
 {cena:'cl_castelo_noite',cam:W(900,2.1,2.3,1500),transicao:'corte',objetos:[{img:'fusca',x:900,y:1620,w:560,h:360,anim:{dx:160,dur:1.2,em:.3,ease:'power2.in'}}],fx:[['shake',.4,6,8]],sfx:[['real/rangido_metal',.3,.5]]},
 {cena:'cl_rua_lixo',cam:W(900,2.2,2.4,1250),transicao:'corte',atores:[{id:'tiao',x:900,acoes:[['susto',.35],['levantar_maos',.45],['chorar',null]]}],sfx:[['impact/swell',.05,.5,.6]]}]),
F('Cinquenta toneladas de lixo desceram a ladeira,',[
 {cena:'cl_ladeira',cam:W(900,1.2,1.6,1200,0,250),transicao:'corte',fx:[['impacto',.05],['shake',.1,26,20],['poeira',900,900],['poeira',700,1300],['congela',.5,.45]],objetos:[G(800,700,.6,{anim:{dy:900,r:120,dur:1.6,ease:'power2.in'}}),P(1100,600,.8,{anim:{dy:1000,dx:-200,r:540,dur:1.5,ease:'power1.in'}}),{img:'sofa',x:700,y:500,w:360,h:220,anim:{dy:1100,r:-90,dur:1.7,ease:'power2.in'}}],sfx:[['pro_sub_drop/low',.05,.9,1.5],['real/avalanche_pedras',.1,.6]]}]),
F('e pararam na porta da prefeitura.',[
 {cena:'cl_castelo_prefeitura',cam:W(1250,1.8,2.1,1450),transicao:'corte',fx:[['impacto',.15],['shake',.15,30,10],['poeira',1250,1500],['flash',.15,'#fff',.4]],objetos:[{img:'lixo',x:1250,y:1650,w:900,h:700,oculto:1,aparece:.15}],sfx:[['real/explosao',.15,.7],['real/desabamento_entulho',.3,.5]]}]),
F('No dia seguinte, o caminhão do lixo voltou a passar.',[
 {cena:'cl_rua_lixo',cam:W(900,1.5,1.65,1420),transicao:'dissolve',atores:[{id:'tiao',x:900,acoes:[['apontar',.7],['comemorar',null]]}],objetos:[{img:'fusca',x:500,y:1640,w:560,h:360,r:4},{img:'caminhao',x:1900,y:1640,w:700,h:420,anim:{dx:-1300,dur:2.6,ease:'none'}}],sfx:[['real/buzina_caminhao',1.2,.4]]}])
]};
fs.writeFileSync('episodio.json',JSON.stringify(ep,null,1));
