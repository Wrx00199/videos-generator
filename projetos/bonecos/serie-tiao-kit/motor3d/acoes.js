// acoes.js — elenco da série nos cartões 2D do motor + AÇÕES AMARRADAS (à prova de ponta solta).
// Regra: posição de pé/mão/objeto nunca é digitada à mão; vem do mundo (chao, REDE, objeto).
// ANDAR (17/11): `andar(n, [x0,z0], [x1,z1], {t0, vel|pps, amp, corre, p})` devolve ator que MOVE x,z com o passo sincronizado (sem patinar; passo ≈ perna);
//   uso: shots[].actors: [{ ...andar('zumbi', [-2,-7], [0,-3], { vel: 0.8, p: (c) => ({ eye: 'wide' }) }) }]. `anda(W,...)` (por u 0..1) também usa a fase por distância.
//   `fila(n, x0, z0, passo, {mira})` = horda parada virada pra um ponto. Mostrar item sem tapar a cara: Pz.segurar(item,{mostra:true}) (Pz.js); `boneco()` avisa prop sobre a cara.
import * as E from './elenco.js';
import { Pz } from './Pz.js';
export { E, Pz };

const PLUM = '#241726';
const off = (() => { const c = document.createElement('canvas'); c.width = 1200; c.height = 2000; return [c, c.getContext('2d')]; })();
const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;
const ESC = 1.35;                           // unidade do rig -> unidade do cartão (600x1000, sola em y=975)

// desenha qualquer coisa no espaço do rig (origem = sola) e aplica a tinta ameixa mais grossa embaixo/à direita
export function cartao(fn) {
  return (p) => {
    const [oc, og] = off; og.setTransform(1, 0, 0, 1, 0, 0); og.clearRect(0, 0, 1200, 2000);
    og.setTransform(2 * ESC, 0, 0, 2 * ESC, 600, 1950); og.lineCap = 'round'; og.lineJoin = 'round';
    E.setCtx(og); fn(og);
    const g = p.g; g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    g.shadowColor = PLUM; g.shadowOffsetX = 4; g.shadowOffsetY = 9; g.shadowBlur = 0; g.drawImage(oc, 0, 0);
    g.shadowColor = 'transparent'; g.drawImage(oc, 0, 0); g.restore();
  };
}

// ---- standOn: pé no chão do mundo (x, z) -> y vem de W.chao ----
export function boneco(W, n, pose, x, z, t, extra = {}) {
  const y = extra.y ?? W.chao(x, z);
  if (extra.y != null && extra.apoio == null) console.warn('boneco ' + n + ': y manual sem apoio declarado');
  const o = { ...pose, x: 0, y: 0, shadow: 0 };
  const key = n + JSON.stringify(o, (k, v) => (typeof v === 'number' ? q(v) : typeof v === 'function' ? String(v).length : v)) + (extra.chave || '') + q(t, 1);
  const aud = E.auditaPose(n, o);   // pose quebrada + caixa do boneco (main.js checa corte na borda)
  const avisos = extra.propNaCara ? aud.avisos : [...aud.avisos, ...Pz.avisaPropCara(o)];   // 17/11: prop sobreposto à cara do dono
  return { key, draw: cartao(() => E.drawChar(n, o, t)), x, y, z, ground: W.chao(x, z), quem: n, bb: aud.bb, avisos, ...extra };
}

// ---- holdItem: objeto NA MÃO (o rig desenha o objeto no punho e a mão por cima) ----
export const segura = (pose, item, lado = 'R', a = 0, s = 1) => ({ ...pose, ['h' + lado]: { k: item, a, s } });

// ---- lieIn: deitado DENTRO da rede (cartão girado, quadril no centro da calha; a borda da rede cobre o corpo) ----
export function deitaNaRede(W, n, pose, t, extra = {}) {
  const c = W.REDE.centro, nav = W.navio;
  const p = c.clone().applyMatrix4(nav.matrixWorld);
  const o = { ...pose, x: 0, y: 0, shadow: 0, legs: 1 };
  return { key: 'rede' + n + JSON.stringify(o) + q(t, 1), draw: cartao(() => E.drawChar(n, o, t)), x: p.x + 0.8, y: p.y + 0.3, z: p.z - 0.12, roll: Math.PI / 2, blob: false, ...extra };
}

// ---- walk: anda do ponto A ao B, u 0..1 (pé no chão a cada quadro). 17/11: fase do passo vem da DISTÂNCIA andada (não do tempo) => não patina ----
export function anda(W, n, pose, A, B, u, t, extra = {}) {
  const x = A[0] + (B[0] - A[0]) * u, z = A[1] + (B[1] - A[1]) * u, mov = u > 0 && u < 1, amp = extra.amp ?? 0.5;
  const dist = Math.hypot(B[0] - A[0], B[1] - A[1]) * u, k = escalaM(n, pose, extra);
  const w = mov ? Pz.passo(Math.PI * dist / (Pz.compPasso(amp) * k), amp) : {};
  const { amp: _a, ...ex } = extra;
  return boneco(W, n, { ...pose, ...w, f: B[0] >= A[0] ? 1 : -1 }, x, z, t, ex);
}
const escalaM = (n, pose = {}, extra = {}) => ((E.SPEC[n] && E.SPEC[n].s) || 1) * (pose.sc || 1) * (extra.s || 1) * 2 * ESC * 2.25 / 2000;   // metros por unidade do rig deste ator

// ---- andar: ator que ANDA de verdade (move x,z e sincroniza o passo; para zumbi/vampiro/cap/tiao/astro/qualquer SPEC) ----
// Uso em shots[].actors:  { ...andar('zumbi', [x0, z0], [x1, z1], { t0: 0, vel: 0.9, p: (c) => ({ eye: 'wide' }) }) }
// de/ate = [x,z] locais ao cenário. t0 = segundo (desde o início do plano; abs:true = desde o início do vídeo) em que sai; vel = m/s
// (padrão pps=2,4 passos/s; zumbi arrastado: pps 1,5 amp .3; corre:true = corrida). p(c) = expressão/braços/props (SEM E.walk dentro; braços que
// ele não definir vêm do ciclo). Antes de t0 fica em `de`, depois de chegar fica em `ate` (pernas em repouso). Outros campos (longe, vis, y...) passam direto.
export function andar(n, de, ate, o = {}) {
  const { t0 = 0, vel, pps = 2.4, amp = 0.5, corre = false, abs = false, p: pe, f: f0, ...resto } = o;
  const dx = ate[0] - de[0], dz = ate[1] - de[1], D = Math.hypot(dx, dz) || 1e-6, ux = dx / D, uz = dz / D;
  const k = escalaM(n, {}, resto), passoM = Pz.compPasso(amp) * k, v = vel ?? pps * passoM * (corre ? 1.7 : 1);
  const f = Math.abs(dx) > 0.02 ? (dx > 0 ? 1 : -1) : (f0 ?? 1);
  const dist = (c) => Math.max(0, Math.min(D, v * ((abs ? c.t : c.d / 30) - t0)));
  return { n, ...resto, f, x: (c) => de[0] + ux * dist(c), z: (c) => de[1] + uz * dist(c), p: (c) => {
    const d = dist(c), mov = d > 0 && d < D, u = pe ? pe(c) || {} : {}; if (!mov) return { f, ...u };
    const w = Pz.passo(Math.PI * d / passoM, amp, { corre });
    return { f, ...(u.aL ? {} : { aL: w.aL }), ...(u.aR ? {} : { aR: w.aR }), lean: w.lean, hipY: w.hipY, ...u, lL: w.lL, lR: w.lR };
  } };
}

// Uma rota mantém destino, contagem de passos e cadência acoplados em cada trecho.
export function andarRota(n, origem, trechos, o = {}) {
  const { pps = 2.7, t0 = 0, abs = false, ...pose } = o;
  if (!trechos.length || !Number.isFinite(pps) || pps <= 0) throw new RangeError('Rota sem trechos ou cadência inválida');
  let de = origem, fim = t0;
  const passoMaximo = Pz.compPasso(Math.PI / 2) * escalaM(n, {}, pose);
  const etapas = trechos.map(({ ate, passos }) => {
    const distancia = Math.hypot(ate[0] - de[0], ate[1] - de[1]);
    if (!Number.isInteger(passos) || passos < 1 || !Number.isFinite(distancia) || distancia <= 0 || distancia / passos >= passoMaximo) {
      throw new RangeError('O trecho precisa de passos inteiros alcançáveis');
    }
    const segundos = passos / pps;
    const amp = Math.asin(distancia / passos / passoMaximo);
    const ator = andar(n, de, ate, { ...pose, t0: fim, abs, amp, vel: distancia / segundos });
    fim += segundos;
    de = ate;
    return { ator, fim };
  });
  const etapa = c => (etapas.find(e => (abs ? c.t : c.d / 30) < e.fim) || etapas.at(-1)).ator;
  return { ...etapas[0].ator, x: c => etapa(c).x(c), z: c => etapa(c).z(c), p: c => etapa(c).p(c) };
}

// ---- fila: n atores parados em fila (horda esperando), virados para `mira` [x,z]; devolve lista pronta p/ actors: [...fila(8, -3, -7.2, 0.9, { mira: [0, 0] })] ----
// passo = espaçamento em x (número) ou [dx, dz]; tipos = nomes alternados (padrão ['zumbi','zumbi','zumbi','vampiro']); jit = bagunça (m); p(c, i) = pose extra.
export function fila(n, x0, z0, passo = 0.9, o = {}) {
  const { tipos = ['zumbi', 'zumbi', 'zumbi', 'vampiro'], mira = [x0, z0 + 10], jit = 0.18, p: pe, vis, longe } = o, [px, pz] = Array.isArray(passo) ? passo : [passo, 0];
  return Array.from({ length: n }, (_, i) => {
    const x = x0 + px * i + Math.sin(i * 2.3) * jit, z = z0 + pz * i + Math.cos(i * 1.7) * jit * 0.6, f = mira[0] >= x ? 1 : -1;
    return { n: tipos[i % tipos.length], x, z, f, ...(vis ? { vis } : {}), ...(longe ? { longe } : {}), p: (c) => ({ f, ...Pz.idle(c.t * 1.4, i), eye: 'wide', mouth: 'flat', mo: 0, aR: [1.35, 0.05], aL: [-1.35, 0.05], lean: 0.1 + 0.03 * Math.sin(c.t * 2 + i), ...(pe ? pe(c, i) : {}) }) };
  });
}

// ---- cava: ciclo de pá (pá entra na areia a cada golpe; terra voa no fx) ----
export function cava(pose, t, vel = 5) {
  const k = (Math.sin(t * vel) + 1) / 2;
  return segura({ ...pose, lean: 0.25 + 0.25 * k, aL: { ik: [40, -120 + 40 * k] }, aR: { ik: [70, -60 + 50 * k] }, lL: [-.2, .1], lR: [.25, -.1] }, 'shovel', 'R', -0.4 - 0.5 * k, 0.8);
}

// ---- objetos-cartão ----
export function caranguejo(x, y, z, t, extra = {}) {
  return { key: 'crab' + q(t, 1) + (extra.chave || ''), draw: cartao(() => {
    const ctx = E; const a = Math.sin(t * 14) * 0.25;
    E.ell(0, -40, 60, 38); E.fs('#e2462e', 8); E.ell(-14, -56, 18, 10); E.fs('rgba(255,255,255,.35)', 0);
    for (const s of [-1, 1]) { for (let k = 0; k < 3; k++) E.line([s * 40, -30 + k * 6, s * (70 + k * 6), -6 + k * 8 + Math.sin(t * 20 + k) * 4, s * (82 + k * 4), 0], 8);
      E.line([s * 30, -70, s * 36, -96], 7); E.ell(s * 36, -100, 12, 12); E.fs('#fff', 6); E.ell(s * 38, -100, 5, 6); E.fs('#241726', 0);
      const ox = s * 78, oy = -86 - Math.abs(a) * 30; E.line([s * 50, -54, ox, oy], 9); E.ell(ox + s * 14, oy - 14, 26, 18, s * (0.5 + a)); E.fs('#e2462e', 8); E.line([ox + s * 6, oy - 10, ox + s * 34, oy - 4], 6); }
    E.line([-18, -24, 0, -18, 18, -24], 6);
  }), x, y, z, s: 0.32, ...extra };
}
export function objeto(nome, fn, x, y, z, extra = {}) { return { key: nome + (extra.chave || ''), draw: cartao(fn), x, y, z, blob: false, ...extra }; }

// =====================================================================================
// BATALHA NAVAL — ações amaradas (pose calculada do objeto; nunca digitar mão/pavio/espada à mão)
// =====================================================================================
const MPR = 2 * ESC * 2.25 / 2000;          // metros por unidade do rig (cartão 2000 px = 2,25 m), ator s = 1
const direita = (p, cam) => { const ry = Math.atan2(cam[0] - p.x, cam[2] - p.z); return [Math.cos(ry), -Math.sin(ry)]; };
const ang = (v) => Math.atan2(v[0], v[1]);  // ângulo do prop (o rig gira -a e desenha ao longo de +y a partir da mão)

// ---- disparaCanhao: mão no bota-fogo, chama na ponta TOCANDO o ouvido do canhão (toque 0 = 35 cm acima, 1 = encostado) ----
// W.canhao(nav, i) dá o ouvido no mundo; o boneco fica do lado de DENTRO do navio, de frente para o canhão.
export function disparaCanhao(W, n, pose, nav, i, cam, toque, t, extra = {}) {
  const inf = W.canhao(nav, i), tip = inf.pavio.clone(); tip.y += (1 - toque) * 0.35;
  const out = inf.boca.clone().sub(inf.pavio).setY(0).normalize(), r = direita(tip, cam);
  const sg = r[0] * out.x + r[1] * out.z > 0 ? 1 : -1;     // fica no lado oposto à boca (dentro do navio)
  const H = [100, -95]; let best = null;
  for (let dx = 0.7; dx <= 1.4; dx += 0.05) {   // ≥ 0,7 m: não fica atrás da carreta
    const x = tip.x - r[0] * sg * dx, z = tip.z - r[1] * sg * dx, g = W.chao(x, z);
    const o = { ...pose, f: sg, x: 0, y: 0 }, tb = E.toBody(n, o, sg * dx / MPR, -(tip.y - g) / MPR), v = [tb[0] - H[0], tb[1] - H[1]], ps = Math.hypot(...v) / 232;
    const err = Math.abs(ps - 0.95); if (!best || err < best.err) best = { err, x, z, v, ps };
  }
  const o = { ...pose, f: sg, aR: { ik: H }, hR: { k: 'pavio', a: ang(best.v), s: Math.min(1.35, Math.max(0.6, best.ps)), fl: 1 } };
  return boneco(W, n, o, best.x, best.z, t, extra);
}

// ---- balancaNaCorda: pendurado pelas duas mãos, de A [x,z] a B [x,z] (convés de um navio ao do outro), u 0..1 ----
// A corda vai da âncora (ponto alto, ex.: verga do mastro) até as mãos; arco por cima das amuradas.
export function balancaNaCorda(W, n, pose, A, B, ancora, u, cam, t, extra = {}) {
  const ya = W.chao(A[0], A[1]), yb = W.chao(B[0], B[1]);
  const x = A[0] + (B[0] - A[0]) * u, z = A[1] + (B[1] - A[1]) * u, y = ya + (yb - ya) * u + 1.7 * Math.sin(Math.PI * u);
  const r = direita({ x, z }, cam), f = (B[0] - A[0]) * r[0] + (B[1] - A[1]) * r[1] >= 0 ? 1 : -1, sw = Math.sin(t * 7);
  const o = { ...pose, f, hipY: -148, aL: { ik: [-16, -330] }, aR: { ik: [16, -330] }, lL: [0.55 + 0.25 * sw, -1.1], lR: [0.25 - 0.2 * sw, -0.8], hR: null, hL: null };
  const sc = E.SPEC[n].s * (o.sc || 1), handH = (330 + 148) * sc * MPR * (extra.s || 1);
  W.corda(ancora, [x, y + handH, z]);
  return boneco(W, n, o, x, z, t, { y, apoio: 'corda', blob: false, ...extra });
}

// ---- duelo: espada contra espada no ponto P [x,z]; as lâminas se cruzam num X na altura 'alt' a cada golpe ----
// Devolve [atorA, atorB, faísca?]. A fica à esquerda (na tela), B à direita. Golpe a cada 'per' s; quem ataca alterna.
export function duelo(W, nA, poseA, nB, poseB, P, cam, t, extra = {}) {
  const { per = 0.7, alt = 1.15, dx = 0.62, armaA = 'sword', armaB = 'cutlass' } = extra;
  const p = { x: P[0], z: P[1] }, r = direita(p, cam), g = W.chao(P[0], P[1]);
  const fase = (t / per) % 1, golpe = Math.floor(t / per), altoA = golpe % 2 === 0;
  const contato = fase >= 0.45 && fase < 0.62, pre = Math.min(1, fase / 0.45), pos = fase >= 0.62 ? (fase - 0.62) / 0.38 : 0;
  const um = (n, pose, lado, alto, arma, atk) => {
    const x = P[0] + r[0] * lado * dx, z = P[1] + r[1] * lado * dx, gx = W.chao(x, z), f = -lado;
    const lean = atk ? 0.18 * Math.sin(Math.min(1, fase / 0.55) * Math.PI) : -0.06;
    const o = { ...pose, f, lean, x: 0, y: 0 }, H = alto ? [92, -232] : [108, -118];
    const tb = E.toBody(n, o, -lado * dx / MPR, -(g + alt - gx) / MPR), v = [tb[0] - H[0], tb[1] - H[1]], ps = Math.min(1.3, Math.max(0.7, Math.hypot(...v) / 150));
    const aC = ang(v), aUp = Math.PI - 0.2 * (alto ? 1 : -1);
    const a = contato ? aC : fase < 0.45 ? aUp + (aC - aUp) * M3(pre) : aC + (aUp - aC) * 0.35 * Math.sin(pos * Math.PI);
    return boneco(W, n, { ...o, aR: { ik: H }, hR: { k: arma, a, s: ps } }, x, z, t, { chave: 'duelo' });
  };
  const out = [um(nA, poseA, -1, altoA, armaA, altoA), um(nB, poseB, 1, !altoA, armaB, !altoA)];
  if (contato) { const k = (fase - 0.45) / 0.17;
    out.push(objeto('tim' + Math.round(t * 30), () => { E.star(0, -260, 70 * (1 - k) + 34, k * 2); E.fs('#fff3b0', 6); E.burst(0, -260, k * 0.9 + 0.05, 150); }, P[0], g + alt - 260 * MPR * 0.85, P[1], { s: 0.85, order: 5 })); }
  return out;
}
const M3 = (u) => u * u * (3 - 2 * u);

// ---- grito: rajada saindo da boca de quem grita na direção do ouvinte (modelado da referência: chapéu voa no grito) ----
// Uso: X(rajada(W, A, B, k, t)) com A/B = [x,y,z] do mundo (boca e cabeça aprox.), k 0..1 = força. No ouvinte: pose { vento: k, eye: 'shut', lean: -0.15*k }.
export function rajada(A, B, k, t, extra = {}) {
  const dx = B[0] - A[0], dz = B[2] - A[2], comp = Math.hypot(dx, dz);
  return { key: 'rajada' + q(k, 2) + q(t, 2), x: (A[0] + B[0]) / 2, y: A[1] - 0.25, z: (A[2] + B[2]) / 2 + 0.05, blob: false, shadow: false, s: Math.max(0.9, comp / 0.8), order: 6, flip: dx < 0, draw: cartao(() => {
    const g = E; for (let i = 0; i < 9; i++) { const ph = (t * 3.2 + i * 0.137) % 1, y = -330 + (i % 5) * 26 - 50 + Math.sin(i * 1.7) * 18, x0 = -180 + ph * 300, L = 50 + 90 * k * (1 - ph);
      const pts = [x0, y, x0 + L * 0.5, y - 10 * Math.sin(ph * 6 + i), x0 + L, y]; E.line(pts, 11 + 5 * k); E.line(pts, 6 + 4 * k, '#eaf7ff'); }
    for (let i = 0; i < 5 * k; i++) { const ph = (t * 2.4 + i * 0.29) % 1; E.ell(-160 + ph * 320, -300 + Math.sin(i * 3.1) * 40, 6, 6); E.fs('#bfe4ff', 3); }
  }), ...extra };
}

// ---- amarradoNoMastro (V5): costas no mastro principal. Devolve [boneco, cordas]: faixas de corda DESENHADAS no tronco
// (peito, cintura, coxas — nunca no rosto) num cartão logo à frente do boneco + voltas 3D só ATRÁS do mastro (W.corda).
// cam = posição da câmera [x,y,z]; solta 0..1 = corda cortada escorregando até o chão. Uso no story: amarradoNoMastro(...).forEach(X)
export const MASTRO = [0.6, 0];
export function amarradoNoMastro(W, n, pose, cam, t, extra = {}) {
  const nav = W.navio, mx = nav.position.x + MASTRO[0], mz = nav.position.z + MASTRO[1];
  let dx = cam[0] - mx, dz = cam[2] - mz; const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
  const x = mx + dx * 0.3, z = mz + dz * 0.3, y0 = W.chao(x, z), solta = extra.solta || 0, N = 10, sc = E.SPEC[n].s, M = MPR * sc;
  const { solta: _s, ...ex } = extra;
  const o = { aL: [-0.1, 0.03], aR: [0.1, -0.03], lL: [-0.03, 0], lR: [0.03, 0], ...pose };
  const hip = 148;   // quadril ~148 un. acima da sola (pernas padrão)
  const faixas = [[hip + 120, 0], [hip + 50, 1], [hip - 50, 2]];   // peito, cintura, coxas (unidades do rig acima da sola)
  // voltas 3D atrás do mastro (meia volta do lado oposto à câmera), na altura das faixas
  if (solta < 0.6) for (const [h] of faixas) { const yy = y0 + h * M; const a0 = Math.atan2(-dz, -dx);
    for (let i = 0; i < N; i++) { const a = a0 - 1.6 + 3.2 * i / N, b = a0 - 1.6 + 3.2 * (i + 1) / N, r = 0.24;
      W.corda([mx + Math.cos(a) * r, yy, mz + Math.sin(a) * r], [mx + Math.cos(b) * r, yy, mz + Math.sin(b) * r]); } }
  const bon = boneco(W, n, o, x, z, t, ex);
  const cordas = objeto('cordas' + n + q(solta, 2), () => {
    faixas.forEach(([h, k]) => { const y = -h * (1 - solta) - 14 * solta - k * 6 * solta, w = 82 + 12 * k + 40 * solta, sag = 10 + 30 * solta;
      const pts = [-w, y - 4, -w * 0.5, y + sag * 0.6, 0, y + sag, w * 0.5, y + sag * 0.6, w, y - 4];
      E.line(pts, 22); E.line(pts, 13, '#c9a66b'); for (let j = -2; j <= 2; j++) E.line([j * w * 0.36 - 6, y + sag * 0.7 - 6, j * w * 0.36 + 6, y + sag * 0.7 + 6], 3, 'rgba(90,60,30,.7)'); });
    if (solta > 0) E.line([84, -hip * (1 - solta), 100, -hip * (1 - solta) + 60, 92, -hip * (1 - solta) + 110], 12, '#c9a66b');   // ponta cortada
  }, x + dx * 0.02, y0, z + dz * 0.02, { s: sc, order: 4 });
  return [bon, cordas];
}
