// ===== MOTOR do catálogo: ações (sempre voltam à pose base), câmera, cenas, shader, legenda =====
// Depende de: gsap, rig-base.js, personagem.js, helpers.js (tl, P, OP, FD, expr, look, blink...)
EXPR.happy = { bL: { dy: -10, r: -6 }, bR: { dy: -10, r: 6 }, es: 1.05, ps: 1, m: 2, red: 0, vein: 0, lid: 0, beads: 0 };
const BASE = { uD: 4, uE: -4 };
const HOLD = {}; // HOLD[p] = {D:{k,nome}|null, E:...}
const TRR = {}; // inclinação do tronco por ator (para a pegada)
// braço com pegada: se a mão segura objeto, a mão gira para o objeto ficar no ângulo de uso (GRIP)
function arm(p, s, t, d, a1, a2, ease, angUso) {
  P(`${p}_u${s}`, t, d, { r: a1 }, ease); P(`${p}_l${s}`, t, d, { r: a2 }, ease);
  const h = HOLD[p] && HOLD[p][s];
  const ang = angUso !== undefined ? angUso : (h ? (GRIP[h.nome] || 0) : null);
  P(`${p}_h${s}`, t, d, { r: ang === null ? 0 : ang - a1 - a2 - (TRR[p] || 0) }, ease);
}
function torso(p, t, d, r, ease) { TRR[p] = r; P(`${p}_tr`, t, d, { r }, ease); for (const s of ['D', 'E']) { const h = HOLD[p] && HOLD[p][s]; if (h) { const a1 = REG[`${p}_u${s}`].st.r, a2 = REG[`${p}_l${s}`].st.r; P(`${p}_h${s}`, t, d, { r: (GRIP[h.nome] || 0) - a1 - a2 - r }, ease); } } }
function pega(p, s, t, nome) { // mostra o objeto na mão (precisa estar em `segura` do personagem)
  const lst = ATORES[p].segura[s] || []; const k = lst.indexOf(nome); if (k < 0) { console.error('prop fora do personagem', p, nome); return; }
  HOLD[p] = HOLD[p] || {}; HOLD[p][s] = { k, nome }; OP(`#${p}_h${s}_k${k}`, t, 1);
}
function solta(p, s, t) { const h = HOLD[p] && HOLD[p][s]; if (h) { OP(`#${p}_h${s}_k${h.k}`, t, 0); HOLD[p][s] = null; } }
function maos(p, t, modo) { for (const s of ['D', 'E']) hand(p, s, t, modo); }
function hand(p, side, t, mode) { OP(`#${p}_h${side}_fist`, t, mode === 'open' ? 0 : 1); OP(`#${p}_h${side}_open`, t, mode === 'open' ? 1 : 0); }
// volta à pose base: braços ao lado, tronco reto, pernas paradas. Chamada AUTOMÁTICA no fim de toda ação.
function base(p, t, d) {
  d = d === undefined ? .22 : d; TRR[p] = 0;
  P(`${p}_tr`, t, d, { r: 0, sy: 1 }); P(`${p}_bob`, t, d, { dy: 0 }); P(`${p}_hd`, t, d, { r: 0, dx: 0, dy: 0 });
  P(`${p}_lgB`, t, d, { r: 0 }); P(`${p}_lgF`, t, d, { r: 0 });
  arm(p, 'D', t, d, BASE.uD, 0); arm(p, 'E', t, d, BASE.uE, 0);
}
function passos(p, t, d, step, amp, bobA) {
  const n = Math.max(1, Math.round(d / step));
  for (let i = 0; i < n; i++) { const a = i % 2 ? -amp : amp; P(`${p}_lgB`, t + i * step, step, { r: a }, 'sine.inOut'); P(`${p}_lgF`, t + i * step, step, { r: -a }, 'sine.inOut'); P(`${p}_bob`, t + i * step, step, { dy: i % 2 ? 0 : -bobA }, 'sine.inOut'); }
  return n;
}
function mover(p, t, d, dx, dy, ease) { const r = REG[p + '_root']; P(p + '_root', t, d, { dx: r.st.dx + (dx || 0), dy: r.st.dy + (dy || 0) }, ease || 'none'); }
const segurando = (p, s) => !!(HOLD[p] && HOLD[p][s]);
// ===================== BIBLIOTECA DE AÇÕES =====================
// assinatura: (p, t, d, o). Toda ação começa com antecipação curta e termina no follow-through; base() é chamado pelo acao().
const ACOES = {
  parado(p, t, d, o) { breathe(p, t, t + d); blink(p, [t + Math.min(.8, d * .5)]); if (o.olhar) look(p, t, .2, o.olhar[0], o.olhar[1]); },
  andar(p, t, d, o) {
    const n = passos(p, t, d, .34, 22, 7);
    for (let i = 0; i < n; i++) { const a = i % 2 ? 14 : -14; if (!segurando(p, 'D')) arm(p, 'D', t + i * .34, .34, a, -8, 'sine.inOut'); if (!segurando(p, 'E')) arm(p, 'E', t + i * .34, .34, -a, -8, 'sine.inOut'); }
    mover(p, t, d, o.dx === undefined ? 300 : o.dx);
  },
  correr(p, t, d, o) {
    torso(p, t, .12, 12); const n = passos(p, t, d, .17, 42, 14);
    for (let i = 0; i < n; i++) { const a = i % 2 ? 55 : -45; if (!segurando(p, 'D')) arm(p, 'D', t + i * .17, .17, a, -75, 'sine.inOut'); if (!segurando(p, 'E')) arm(p, 'E', t + i * .17, .17, -a, -75, 'sine.inOut'); }
    mover(p, t, d, o.dx === undefined ? 700 : o.dx, 0, 'power1.in');
  },
  pegar(p, t, d, o) { // abaixa, pega objeto do chão, sobe segurando
    const s = o.lado || 'D', a = d * .45;
    P(`${p}_bob`, t, a, { dy: 46 }, 'power2.inOut'); torso(p, t, a, 38, 'power2.inOut'); arm(p, s, t, a, -40, -6, 'power2.inOut');
    pega(p, s, t + a, o.prop); hand(p, s, t + a, 'fist');
    P(`${p}_bob`, t + a + .05, d - a - .05, { dy: 0 }, 'back.out(1.4)'); torso(p, t + a + .05, d - a - .05, 0, 'power2.out'); arm(p, s, t + a + .05, d - a - .05, -38, -82, 'power2.out');
  },
  segurar(p, t, d, o) { const s = o.lado || 'D'; if (o.prop) pega(p, s, t, o.prop); arm(p, s, t, .25, -38, -84, 'back.out(1.6)'); breathe(p, t, t + d); },
  mostrar(p, t, d, o) { const s = o.lado || 'D'; if (o.prop) pega(p, s, t, o.prop); arm(p, s, t, .25, -110, -30, 'back.out(1.6)'); look(p, t, .2, 8, -2); },
  empurrar(p, t, d, o) {
    torso(p, t, .2, 24, 'power2.out'); arm(p, 'D', t, .2, -84, -12); arm(p, 'E', t, .2, -76, -18); maos(p, t, 'open');
    expr(p, t, 'effort'); passos(p, t + .2, d - .2, .5, 16, 3); mover(p, t + .2, d - .2, o.dx === undefined ? 160 : o.dx); sweatDrops(p, t + .3, d - .4);
  },
  puxar(p, t, d, o) { // corda no ombro, inclinado pra frente, passos curtos e pesados
    torso(p, t, .2, 30, 'power2.out'); arm(p, 'D', t, .2, -160, 150); arm(p, 'E', t, .2, -150, 140);
    expr(p, t, 'effort'); passos(p, t + .2, d - .2, .55, 18, 3); mover(p, t + .2, d - .2, o.dx === undefined ? 120 : o.dx); sweatDrops(p, t + .3, d - .4);
  },
  apontar(p, t, d, o) {
    const s = o.lado || 'D'; arm(p, s, t, .1, -20, -30, 'power2.in'); arm(p, s, t + .1, .2, o.alto ? -125 : -95, -4, 'back.out(2)'); hand(p, s, t + .1, 'open');
    if (o.expr) expr(p, t, o.expr); P(`${p}_hd`, t + .1, .2, { r: o.alto ? -6 : 0 });
  },
  susto(p, t, d, o) {
    P(`${p}_bob`, t, .06, { dy: 14 }); P(`${p}_bob`, t + .06, .14, { dy: -70 }, 'power2.out'); P(`${p}_bob`, t + .2, .22, { dy: 0 }, 'bounce.out');
    arm(p, 'D', t + .06, .14, -165, -20, 'power2.out'); arm(p, 'E', t + .06, .14, -195, 20, 'power2.out'); maos(p, t + .06, 'open');
    expr(p, t + .04, 'fear', .05); goose(p, t + .06); goose(p, t + d - .1, 0); tremble(p, t + .4, Math.max(0, d - .6), 2.5);
  },
  raiva(p, t, d, o) {
    expr(p, t, 'rage', .2); arm(p, 'D', t, .18, -70, -110, 'back.out(2)'); arm(p, 'E', t, .18, -60, -115, 'back.out(2)'); maos(p, t, 'fist');
    for (let i = 0, k = t + .2; k < t + d - .2; i++, k += .09) { P(`${p}_uD`, k, .09, { r: -70 + (i % 2 ? 10 : -10) }); P(`${p}_uE`, k, .09, { r: -60 + (i % 2 ? -10 : 10) }); }
    P(`${p}_bob`, t + .25, .1, { dy: 10 }); P(`${p}_bob`, t + .35, .1, { dy: 0 });
  },
  reclamar(p, t, d, o) {
    expr(p, t, 'cynic', .15); maos(p, t, 'open'); const n = Math.max(1, Math.floor(d / .6));
    for (let i = 0; i < n; i++) { const k = t + i * .6; arm(p, 'D', k, .3, i % 2 ? -60 : -95, -50, 'back.out(1.5)'); arm(p, 'E', k, .3, i % 2 ? -95 : -60, -50, 'back.out(1.5)'); P(`${p}_hd`, k, .3, { r: i % 2 ? 6 : -6 }); P(`${p}_tr`, k, .3, { sy: i % 2 ? 1 : 1.03 }); }
  },
  chorar(p, t, d, o) {
    expr(p, t, 'sad', .2); FD(`#${p}_tears`, t + .15, .3, 1); arm(p, 'D', t, .3, -150, -125); hand(p, 'D', t, 'fist');
    for (let k = t + .3, i = 0; k < t + d - .2; k += .28, i++) P(`${p}_tr`, k, .28, { sy: i % 2 ? 1 : .97, r: 0 }, 'sine.inOut');
    FD(`#${p}_tears`, t + d - .1, .2, 0);
  },
  despejar(p, t, d, o) { // jarro (já na mão D) inclina e derrama água no chão
    if (o.prop) pega(p, 'D', t, o.prop); arm(p, 'D', t, .3, -70, -20, 'power2.out', 0);
    arm(p, 'D', t + .3, .35, -78, -14, 'power2.inOut', 125); tl.to(`#${p}_hD_k${HOLD[p].D.k} .agua`, { opacity: 1, duration: .1 }, t + .55);
    tl.to(`#${p}_hD_k${HOLD[p].D.k} .agua`, { opacity: 0, duration: .15 }, t + d - .35); arm(p, 'D', t + d - .3, .25, -70, -20, 'power2.inOut', 0);
  },
  tatear(p, t, d, o) { // cego: braços pra frente tateando, passo inseguro
    expr(p, t, 'wide'); maos(p, t, 'open'); const n = Math.max(1, Math.floor(d / .5));
    for (let i = 0; i < n; i++) { const k = t + i * .5; arm(p, 'D', k, .5, i % 2 ? -80 : -100, -8, 'sine.inOut'); arm(p, 'E', k, .5, i % 2 ? -100 : -80, -8, 'sine.inOut'); P(`${p}_hd`, k, .5, { r: i % 2 ? 8 : -8 }, 'sine.inOut'); }
    passos(p, t, d, .5, 12, 2); mover(p, t, d, o.dx === undefined ? 120 : o.dx);
  },
  bater(p, t, d, o) { // anda e bate de cara (na parede/porta) e cai sentado
    const a = Math.min(.5, d * .35); passos(p, t, a, .25, 22, 6); mover(p, t, a, o.dx === undefined ? 120 : o.dx);
    P(`${p}_root`, t + a, .08, { r: -6 }); P(`${p}_hd`, t + a, .06, { sx: .9 });
    P(`${p}_hd`, t + a + .06, .12, { sx: 1 }); expr(p, t + a, 'fear', .02);
    P(`${p}_bob`, t + a + .1, .25, { dy: 120 }, 'bounce.out'); P(`${p}_lgF`, t + a + .1, .25, { r: -80 }); P(`${p}_lgB`, t + a + .1, .25, { r: -70 });
    arm(p, 'D', t + a + .1, .25, -40, -30); arm(p, 'E', t + a + .1, .25, 40, -30); P(`${p}_root`, t + a + .3, .2, { r: 0 });
  },
  comemorar(p, t, d, o) {
    expr(p, t, 'happy'); maos(p, t, 'fist'); arm(p, 'D', t, .2, -170, -10, 'back.out(2)'); arm(p, 'E', t, .2, -190, 10, 'back.out(2)');
    for (let k = t + .2, i = 0; k < t + d - .3; k += .36, i++) { P(`${p}_bob`, k, .18, { dy: -50 }, 'power2.out'); P(`${p}_bob`, k + .18, .18, { dy: 0 }, 'power2.in'); }
  },
  sumir(p, t, d, o) { // fica invisível (contorno fantasma)
    FD(`#${p}_root`, t, Math.min(.6, d * .6), o.nivel === undefined ? .1 : o.nivel, 'power2.in'); expr(p, t, 'wide');
  },
  aparecer(p, t, d, o) { FD(`#${p}_root`, t, Math.min(.4, d * .5), 1, 'power2.out'); },
  virar(p, t, d, o) { const r = REG[p + '_root']; P(p + '_root', t, .14, { sx: -r.st.sx }, 'power2.inOut'); },
  olhar(p, t, d, o) { look(p, t, .2, o.dx || 8, o.dy || 0); if (o.expr) expr(p, t, o.expr); breathe(p, t, t + d); },
  expressao(p, t, d, o) { expr(p, t, o.nome || 'neutral'); breathe(p, t, t + d); },
};
// ações que NÃO voltam à base sozinhas (pose final faz parte da cena seguinte do mesmo plano)
const MANTEM = new Set(['segurar', 'mostrar', 'sumir', 'virar', 'expressao', 'olhar', 'parado']);
function acao(nome, p, t, d, o) {
  o = o || {}; const f = ACOES[nome]; if (!f) throw new Error('ação inexistente: ' + nome);
  f(p, t, d, o);
  if (!MANTEM.has(nome) && !o.manter) { const s = o.lado || 'D'; base(p, t + d - .24, .22); if (segurando(p, 'D')) arm(p, 'D', t + d - .24, .22, -38, -84); if (segurando(p, 'E')) arm(p, 'E', t + d - .24, .22, 38, -84); if (o.expr_fim) expr(p, t + d - .2, o.expr_fim); }
  // teste numérico: estado final dos braços
  const fim = { uD: REG[`${p}_uD`].st.r, lD: REG[`${p}_lD`].st.r, uE: REG[`${p}_uE`].st.r, lE: REG[`${p}_lE`].st.r, bob: REG[`${p}_bob`].st.dy };
  (window.__acoes = window.__acoes || []).push({ nome, p, t, d, fim, mantem: MANTEM.has(nome) || !!o.manter, segura: { D: segurando(p, 'D'), E: segurando(p, 'E') } });
}
// ===================== CÂMERA (paralaxe por camada) =====================
const PAR = { far: .45, mid: 1, fg: 1.3 };
function camState(cx, cy, z, k) { const s = 1 + (z - 1) * k, cxl = 900 + (cx - 900) * k, cyl = 960 + (cy - 960) * k; return { x: 540 - cxl * s, y: 960 - cyl * s, scale: s }; }
function cam(S, t, d, c, ease) { { const z = Math.max(c[2], 1.0), hw = 540 / z, hh = 960 / z; c = [Math.min(Math.max(c[0], hw), 1800 - hw), Math.min(Math.max(c[1], hh), 1920 - hh), z]; } for (const l of ['far', 'mid', 'fg']) { const st = camState(c[0], c[1], c[2], PAR[l]); const el = `#${S}_${l}`; if (!d) tl.set(el, st, t); else tl.to(el, { ...st, duration: d, ease: ease || 'sine.inOut' }, t); } }
function shake(t, k, n) { n = n || 6; for (let i = 0; i < n; i++) { const m = (n - i) / n * (i % 2 ? -1 : 1); tl.set('#shake', { x: m * k, y: -m * k * .7 }, t + i * .035); } tl.set('#shake', { x: 0, y: 0 }, t + n * .035); }
function flash(t, col, d, a) { tl.set('#flash', { background: col || '#fff' }, t); tl.fromTo('#flash', { opacity: a || .9 }, { opacity: 0, duration: d || .25, ease: 'power2.out' }, t); }
