// build.mjs — roteiro.json (+ voz/words.json se existir) -> index.html (composição HyperFrames 1080x1920, 30 fps)
// Zero cena escrita à mão: tudo sai do roteiro. Zona segura e faixa de legenda são variáveis (VAR).
import fs from 'node:fs';
const VAR = { W: 1080, H: 1920, SAFE: 0.9, LEG_Y: 1390, LEG_FONT: 84, CAM_X: 540, CAM_Y: 760, CHAO: 1500, PUSH: 1.28, PUSH_S: 1.35 };
const R = JSON.parse(fs.readFileSync('roteiro.json', 'utf8'));
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
const FOCOS = { ze_rosto: [260, 1170], banq_rosto: [830, 1170], pilha_base: [530, 1330], pilha_meio: [530, 900], pilha_topo: [530, 330], torre_topo: [810, 260], placa: [810, 640],
  janela: [810, 900], caminhao: [330, 1380], cofre: [540, 1150], escritura: [540, 900], geral: [540, 1000], dupla: [540, 1180], placaPilha: [530, 1100], moedaGrande: [612, 1200], gancho: [400, 1250], gancho2: [590, 860], virada2: [720, 1170], virada: [770, 1170], payoff: [540, 1200] };
const px = (v) => `${Math.round(v)}px`;

// ---- tempos: palavras reais (voz/words.json) ou estimativa por tamanho da palavra
const toks = R.beats.map(b => b.fala.split(/\s+/).filter(Boolean));
let palavras; // [{w, t0, t1, beat}]
const real = fs.existsSync('voz/words.json') ? JSON.parse(fs.readFileSync('voz/words.json', 'utf8')) : null;
if (real) { let k = 0; palavras = []; R.beats.forEach((b, bi) => toks[bi].forEach(w => { const r = real[k++]; palavras.push({ w, t0: r.start, t1: r.end, beat: bi }); })); if (k !== real.length) throw new Error(`words.json tem ${real.length} palavras, roteiro tem ${k}`); }
else { let t = 0; palavras = []; R.beats.forEach((b, bi) => toks[bi].forEach(w => { const d = 0.09 + 0.045 * norm(w).length + (/[,.:?!]$/.test(w) ? 0.12 : 0); palavras.push({ w, t0: t, t1: t + d, beat: bi }); t += d; })); }
const beatT = R.beats.map((b, bi) => { const ws = palavras.filter(p => p.beat === bi); return { ini: bi === 0 ? 0 : ws[0].t0, ws }; });
beatT.forEach((b, i) => { b.fim = i + 1 < beatT.length ? beatT[i + 1].ini : b.ws.at(-1).t1 + (R.beats[i].segura || 0.4); b.dur = b.fim - b.ini; });
const TOTAL = +beatT.at(-1).fim.toFixed(2);
const tNa = (bi, palavra, def = 0) => { if (!palavra) return def; const q = norm(palavra); const p = beatT[bi].ws.find(p => norm(p.w) === q || norm(p.w).startsWith(q)); return p ? p.t0 - beatT[bi].ini : def; };

// ---- cenas
const F = (n) => +n.toFixed(3);
const sprite = (k, pose, x, esc = 1) => { const esq = k === 'ze'; const cx = x ?? (esq ? 260 : 830); const w = 450 * esc, h = 525 * esc; return `<img class="suj ${k}" src="assets/poses/${k}_${pose}.svg" style="left:${px(cx - w / 2)};top:${px(VAR.CHAO - h * 0.95)};width:${w}px;height:${h}px">`; };
const um = (d) => `<b class="n" style="font-size:${Math.round(d * 0.66)}px">1</b>`;
const moedaCss = 'border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff3a0,#f5c542 45%,#b8860b);border:6px solid #8a6500;';
function cena(b, bi) {
  const T = beatT[bi]; let h = '', js = '';
  const id = b.id, q = (s) => `#${id} ${s}`;
  const cofre = b.cenario === 'cofre';
  h += `<div class="mundo" id="${id}m">`;
  h += `<div class="ceu${cofre ? ' ceuC' : ''}"></div>`;
  if (!cofre) {
    h += `<div class="chao"></div><div class="torre ${b.ouro ? 'ouroT' : ''}" id="${id}t"><div class="janelas"></div><div class="banco" data-layout-allow-overlap>BANCO VICE</div><div class="janelaB"></div><div class="porta"></div></div>`;
    const p = b.pilha || { de: 0, ate: 0 }; h += `<div class="pilha" id="${id}p" style="height:${px(p.de * 1300)}"></div>`;
    js += `tl.fromTo('#${id}p',{height:${p.de * 1300}},{height:${p.ate * 1300},duration:${F(Math.max(0.3, T.dur - tNa(bi, p.na)))},ease:'power1.inOut'},${F(T.ini + tNa(bi, p.na))});`;
    if (b.ouro) js += `tl.fromTo('#${id}t',{filter:'none'},{filter:'none',duration:0.01},${F(T.ini)});` + (b.ouro.na ? `tl.to('#${id}t .ouroL',{opacity:1,duration:0.5},${F(T.ini + tNa(bi, b.ouro.na))});` : '');
    if (b.ouro) h = h.replace(`id="${id}t"><div class="janelas">`, `id="${id}t"><div class="ouroL" style="opacity:${b.ouro.na ? 0 : 1}"></div><div class="janelas">`);
  }
  for (const q2 of b.quem || []) { h += sprite(q2.k, q2.pose, q2.x, q2.esc); }
  for (const e of b.extras || []) {
    const at = T.ini + tNa(bi, e.na);
    if (e.t === 'moedaCai') { h += `<div class="moeda" id="${id}mc" style="${moedaCss}left:${px(445)};top:${px(130)};width:100px;height:100px">${um(100)}</div>`; js += `tl.fromTo('#${id}mc',{y:0,scale:1.3,opacity:1},{y:650,scale:1,duration:0.45,ease:'power2.in'},${F(T.ini)});tl.to('#${id}mc',{opacity:0,duration:0.1},${F(T.ini + 0.45)});`; }
    if (e.t === 'placaTopo') { h += `<div class="placa pq" id="${id}pt" style="left:${px(380)};top:${px(140)}">${e.texto}</div>`; js += `tl.fromTo('#${id}pt',{scale:0,opacity:0},{scale:1,opacity:1,duration:0.4,ease:'back.out(2)'},${F(at)});`; }
    if (e.t === 'placaNum' || e.t === 'placaMoedas') { const big = e.t === 'placaNum'; h += `<div class="placa ${big ? '' : 'pq'}" id="${id}pn" style="${big ? 'left:620px;top:520px;width:380px' : 'left:380px;top:980px;width:420px'}">${e.texto}</div>`; js += `tl.fromTo('#${id}pn',{scale:0.2,opacity:0,rotation:-6},{scale:1,opacity:1,rotation:0,duration:0.45,ease:'back.out(2.2)'},${F(at)});`; }
    if (e.t === 'coroa') { h += `<div class="coroa" id="${id}co" style="left:760px;top:60px">$$$</div>`; js += `tl.fromTo('#${id}co',{scale:0,opacity:0},{scale:1,opacity:1,duration:0.4,ease:'back.out(2)'},${F(at)});`; }
    if (e.t === 'moedaMao') { h += `<div class="moeda" id="${id}mm" style="${moedaCss}left:340px;top:1090px;width:110px;height:110px">${um(110)}</div>`; js += `tl.fromTo('#${id}mm',{scale:0,opacity:0},{scale:1,opacity:1,duration:0.3,ease:'back.out(2)'},${F(at)});`; }
    if (e.t === 'caminhao' || e.t === 'caminhaoFixo') { h += `<div class="caminhao" id="${id}cm"><div class="cab"></div><div class="cacamba"></div><div class="roda r1"></div><div class="roda r2"></div></div>`; js += e.t === 'caminhao' ? `tl.fromTo('#${id}cm',{x:-700},{x:0,duration:${F(Math.max(0.5, T.dur - tNa(bi, e.na)))},ease:'power2.out'},${F(at)});` : `tl.set('#${id}cm',{x:0},0);`; }
    if (e.t === 'cofre' && !h.includes(`${id}cf"`)) { h += `<div class="cofre" id="${id}cf"><div class="focinho"></div><div class="orelha"></div><div class="fenda"></div></div>`; js += `tl.fromTo('#${id}cf',{scale:0.6,opacity:0},{scale:1,opacity:1,duration:0.45,ease:'back.out(1.8)'},${F(T.ini)});`; }
    if (e.t === 'cofreCresce') js += `tl.to('#${id}cf',{scale:1.9,duration:${F(Math.max(0.4, T.dur - tNa(bi, e.na)))},ease:'power3.out'},${F(at)});`;
    if (e.t === 'moedaCaiCofre') { for (let i = 0; i < 4; i++) { h += `<div class="moeda" id="${id}mq${i}" style="${moedaCss}left:${px(500)};top:480px;width:70px;height:70px">${um(70)}</div>`; js += `tl.fromTo('#${id}mq${i}',{y:-300,opacity:1},{y:330,opacity:1,duration:0.35,ease:'power2.in'},${F(at + i * 0.45)});tl.to('#${id}mq${i}',{opacity:0,duration:0.05},${F(at + i * 0.45 + 0.35)});`; } }
    if (e.t === 'escritura') { h += `<div class="escritura" id="${id}es"><b>ESCRITURA</b><span>Prédio mais caro de Vice City</span><i data-layout-allow-overlap>DONO:</i></div>`; js += `tl.fromTo('#${id}es',{scale:0.3,rotation:-12,opacity:0},{scale:1,rotation:-2,opacity:1,duration:0.5,ease:'back.out(1.6)'},${F(at)});`; }
    if (e.t === 'escrituraMini') { h += `<div class="escMini" id="${id}em" style="left:${px((e.x ?? 400) - (e.w ?? 300) / 2)};top:${px((e.y ?? 1200) - 120)};width:${e.w ?? 300}px"><span>ESCRITURA</span><b>DONO: ZÉ</b></div>`; js += `tl.fromTo('#${id}em',{scale:0.2,rotation:-14,opacity:0},{scale:1,rotation:-4,opacity:1,duration:0.45,ease:'back.out(1.8)'},${F(T.ini + 0.15)});`; }
    if (e.t === 'janelaPilha') { h += `<div class="fluxo" id="${id}fl"></div>`; js += `tl.fromTo('#${id}fl',{width:0},{width:330,duration:${F(Math.max(0.5, T.dur - tNa(bi, e.na)))},ease:'power2.out'},${F(at)});`; }
    if (e.t === 'carimbo') { h += `<div class="carimbo" id="${id}ca">ZÉ</div>`; js += `tl.fromTo('#${id}ca',{scale:3,opacity:0},{scale:1,opacity:1,duration:0.18,ease:'power4.in'},${F(at)});`; }
    if (e.t === 'moedaGrande') { const D = e.d || 560, cx = e.x ?? 450, cy2 = e.y ?? 1240; h += `<div class="moeda gigante" id="${id}mg" style="${moedaCss}left:${px(cx - D / 2)};top:${px(cy2 - D / 2)};width:${D}px;height:${D}px">${um(D)}</div>`; js += `tl.fromTo('#${id}mg',{scale:0.1,opacity:0},{scale:1,opacity:1,duration:0.6,ease:'expo.out'},${F(at)});`; }
  }
  // paradas vivas: ator respira (sem repeat infinito)
  for (const q2 of b.quem || []) js += `tl.fromTo('#${id} .suj.${q2.k}',{y:0},{y:-8,duration:0.6,ease:'sine.inOut',yoyo:true,repeat:${Math.max(1, Math.floor(T.dur / 0.6) - 1)}},${F(T.ini)});`;
  h += '</div>';
  // Zé no canto (tela, não mundo): aparece em TODO quadro em que não está na cena
  if (!(b.quem || []).some(q => q.k === 'ze')) { const pz = b.canto || 1; h += `<img class="canto" id="${id}cz" src="assets/poses/ze_${pz}.svg">`; js += `tl.fromTo('#${id}cz',{y:0},{y:-10,duration:0.6,ease:'sine.inOut',yoyo:true,repeat:${Math.max(1, Math.floor(T.dur / 0.6) - 1)}},${F(T.ini)});`; }
  // câmera: pivô no foco; push-in ×1,28 em 1,35 s (expo.out ~ cubic-bezier .16,1,.3,1), depois deriva lenta
  const [fa, fb] = b.foco, [za, zb] = b.z; const A = FOCOS[fa], B = FOCOS[fb] || A;
  const CY = b.cy ?? VAR.CAM_Y; const s0 = za, s1 = za * (b.push ?? VAR.PUSH), dur = Math.min(VAR.PUSH_S, T.dur), restT = Math.max(0, T.dur - dur);
  // proxy tweenado: x = CAM - foco*escala (pivô em 0 0) — evita o conflito do GSAP com transformOrigin
  const mx = Math.max(s1, zb), fa2 = A, fb2 = B;
  js += `(function(){const el=document.querySelector('#${id}m'),o={p:0,u:0,q:0};const f=()=>{const fx=${fa2[0]}+(${fb2[0]}-${fa2[0]})*o.p,fy=${fa2[1]}+(${fb2[1]}-${fa2[1]})*o.p,s=(${s0}+(${F(mx)}-${s0})*o.u)*(1+0.06*o.q);gsap.set(el,{transformOrigin:'0 0',scale:s,x:${VAR.CAM_X}-fx*s,y:${CY}-fy*s});};f();`
    + `tl.fromTo(o,{p:0},{p:1,duration:${F(T.dur)},ease:'sine.inOut',onUpdate:f},${F(T.ini)});tl.fromTo(o,{u:0},{u:1,duration:${F(dur)},ease:'expo.out',onUpdate:f},${F(T.ini)});`
    + (restT > 0.05 ? `tl.fromTo(o,{q:0},{q:1,duration:${F(restT)},ease:'none',onUpdate:f},${F(T.ini + dur)});` : '') + `})();`;
  return { h: `<div class="clip cena" id="${id}" data-start="${F(T.ini)}" data-duration="${F(T.dur)}" data-track-index="0">${h}</div>`, js };
}
const cenas = R.beats.map(cena);
// legenda: 1-2 palavras por grupo, sem ponto final, no índice da palavra
let leg = '', gi = 0;
for (const T of beatT) { const ws = T.ws; for (let i = 0; i < ws.length;) { const n = (ws[i].w.length <= 3 && ws[i + 1]) ? 2 : 1; const g = ws.slice(i, i + n); const t0 = g[0].t0, t1 = (ws[i + n]?.t0 ?? T.fim); leg += `<div class="clip leg" id="l${gi++}" data-start="${F(t0)}" data-duration="${F(Math.max(0.12, t1 - t0))}" data-track-index="2">${g.map(x => x.w.replace(/[.,:;?!]+$/, '')).join(' ')}</div>`; i += n; } }
const css = `
:root{--W:${VAR.W}px;--H:${VAR.H}px;--safe:${VAR.SAFE};--leg-y:${VAR.LEG_Y}px;--leg-font:${VAR.LEG_FONT}px}
*{margin:0;padding:0;box-sizing:border-box}html,body{width:var(--W);height:var(--H);overflow:hidden;background:#000;font-family:'Nunito',sans-serif}
#root{position:relative;width:var(--W);height:var(--H);overflow:hidden}
.cena{position:absolute;inset:0;overflow:hidden}.mundo{position:absolute;left:0;top:0;width:var(--W);height:var(--H)}
.ceu{position:absolute;left:-1200px;top:-1200px;width:3480px;height:2700px;background:linear-gradient(#ff9e5e 0%,#ffd0a0 45%,#9fd0ff 70%)}.ceuC{background:radial-gradient(circle at 50% 55%,#ffe9b0,#ff7eb6 70%)}
.chao{position:absolute;left:-1200px;top:${VAR.CHAO}px;width:3480px;height:1200px;background:#55556a;border-top:14px solid #2d2d3a;background-image:repeating-linear-gradient(90deg,#f5c542 0 80px,transparent 80px 160px);background-size:100% 14px;background-position:0 190px;background-repeat:no-repeat}
.torre{position:absolute;left:640px;top:200px;width:340px;height:1300px;background:#7fa3d1;border:8px solid #1a1a1a;border-radius:10px 10px 0 0}
.ouroT{background:#7fa3d1}.ouroL{position:absolute;inset:0;background:repeating-linear-gradient(#f5c542 0 22px,#d9a400 22px 28px);z-index:3}
.janelas{position:absolute;inset:20px;background:repeating-linear-gradient(90deg,transparent 0 30px,#cde7ff 30px 70px),repeating-linear-gradient(#7fa3d1 0 46px,transparent 46px 80px);opacity:.9;z-index:1}
.banco{position:absolute;left:20px;right:20px;top:40px;height:90px;background:#1a1a1a;color:#f5c542;font:900 44px 'Nunito';text-align:center;line-height:90px;z-index:4}
.janelaB{position:absolute;left:20px;top:800px;width:150px;height:230px;background:#1c2a3c;border:10px solid #1a1a1a;z-index:2;box-shadow:inset 0 0 40px #000}.fluxo{position:absolute;left:520px;top:1075px;height:120px;background:repeating-linear-gradient(90deg,#f5c542 0 16px,#b8860b 16px 20px);border:6px solid #8a6500;border-radius:60px 20px 20px 60px;z-index:3}.escMini{position:absolute;padding:14px 10px;background:#fff6dc;border:8px solid #1a1a1a;z-index:9;text-align:center;font-family:'Nunito'}.escMini span{display:block;font:900 34px 'Nunito';color:#1a1a1a}.escMini b{display:block;font:900 74px/1.05 'Nunito';color:#c0182b;margin-top:6px}.moeda .n{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Nunito';font-weight:900;color:#8a6500;text-shadow:2px 2px 0 #fff3a0,-2px -2px 0 #b8860b}.porta{position:absolute;left:120px;top:1170px;width:100px;height:130px;background:#33261a;z-index:4}
.pilha{position:absolute;left:250px;bottom:${1920 - VAR.CHAO}px;width:450px;clip-path:polygon(34% 0,66% 0,100% 100%,0 100%);background:repeating-linear-gradient(#f5c542 0 12px,#8a6500 12px 15px);border:5px solid #8a6500;border-bottom:0;z-index:2}
.moeda{position:absolute;width:90px;height:90px;z-index:6}.gigante{left:170px;top:960px;width:560px;height:560px;z-index:20}
.suj{position:absolute;z-index:5}.canto{position:absolute;left:-30px;top:1560px;width:330px;height:385px;z-index:30}
.placa{position:absolute;padding:18px 24px;background:#fff;color:#c0182b;border:10px solid #1a1a1a;border-radius:18px;font:900 64px/1.05 'Nunito';text-align:center;z-index:8;box-shadow:0 10px 0 #0006}.pq{font-size:44px}
.coroa{position:absolute;font:900 90px 'Nunito';color:#f5c542;-webkit-text-stroke:6px #1a1a1a;z-index:8}
.caminhao{position:absolute;left:30px;top:1340px;width:330px;height:190px;z-index:4}.cab{position:absolute;right:0;top:50px;width:100px;height:110px;background:#e8412c;border:6px solid #1a1a1a;border-radius:12px}.cacamba{position:absolute;left:0;top:30px;width:230px;height:130px;background:#f5c542;border:6px solid #1a1a1a}.roda{position:absolute;top:140px;width:60px;height:60px;border-radius:50%;background:#222;border:8px solid #777}.r1{left:30px}.r2{right:30px}
.cofre{position:absolute;left:240px;top:760px;width:600px;height:460px;border-radius:50%;background:#ff8fb8;border:10px solid #1a1a1a;z-index:5}.focinho{position:absolute;right:-70px;top:150px;width:150px;height:130px;border-radius:50%;background:#ff6fa4;border:10px solid #1a1a1a}.orelha{position:absolute;left:380px;top:-60px;width:100px;height:100px;background:#ff6fa4;border:10px solid #1a1a1a;transform:rotate(30deg)}.fenda{position:absolute;left:230px;top:20px;width:160px;height:24px;background:#1a1a1a;border-radius:12px}
.escritura{position:absolute;left:190px;top:620px;width:700px;height:560px;background:#fff6dc;border:10px solid #1a1a1a;z-index:9;text-align:center;font-family:'Nunito';padding-top:40px}.escritura b{display:block;font:900 70px 'Nunito';color:#1a1a1a}.escritura span{display:block;font:800 36px 'Nunito';margin-top:20px}.escritura i{display:block;font:900 90px 'Nunito';margin-top:60px;font-style:normal}
.carimbo{position:absolute;left:350px;top:900px;width:380px;height:380px;line-height:340px;border:20px solid #c0182b;border-radius:50%;color:#c0182b;font:900 190px 'Nunito';text-align:center;z-index:10;transform:rotate(-14deg);background:#fff6dc99}
.leg{position:absolute;left:calc(var(--W)*(1 - var(--safe))/2);width:calc(var(--W)*var(--safe));top:calc(var(--leg-y) - var(--leg-font));text-align:center;font:900 var(--leg-font)/1.05 'Nunito';text-transform:uppercase;color:#fff;-webkit-text-stroke:16px #000;paint-order:stroke fill;z-index:50;height:calc(var(--leg-font)*1.2)}`;
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=${VAR.W}, height=${VAR.H}"><script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script><style>${css}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="${VAR.W}" data-height="${VAR.H}">
${cenas.map(c => c.h).join('\n')}
${leg}
</div>
<script>const tl=gsap.timeline({paused:true});${cenas.map(c => c.js).join('\n')}window.__timelines["main"]=tl;tl.seek(0);</script></body></html>`;
fs.writeFileSync('index.html', html);
fs.writeFileSync('tempos.json', JSON.stringify({ total: TOTAL, palavras_reais: !!real, beats: R.beats.map((b, i) => ({ id: b.id, secao: b.secao, ini: F(beatT[i].ini), fim: F(beatT[i].fim) })) }, null, 1));
console.log('index.html ok,', R.beats.length, 'beats,', TOTAL, 's', real ? '(palavras reais)' : '(estimado)');
