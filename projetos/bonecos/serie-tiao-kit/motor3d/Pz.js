// Pz.js — Poses nomeadas da série Tião (separado de planos.js para não crescer demais).
// Cada função retorna um objeto de pose compatível com o rig (acoes.js / elenco.js).
// NÃO depende de DOM; pode rodar em Node.js (node --input-type=module).
//
// Campos de pose reconhecidos pelo rig:
//   f      : direção do boneco (+1 = direita, -1 = esquerda)
//   lean   : inclinação do tronco (rad positivo = para frente, negativo = para trás)
//   bob    : deslocamento vertical em unidades do rig (negativo = para cima)
//   tilt   : inclinação da cabeça (rad)
//   brow   : sobrancelha (-1 franzida … +1 levantada)
//   eye    : 'normal'|'wide'|'happy'|'shut'
//   mouth  : 'flat'|'grin'|'bigsmile'|'shout'|'o'
//   mo     : abertura da boca 0..1
//   aR/aL  : braço D/E — [ang_rad, comprimento_rel] OU { ik:[x,y] } OU { ik:[x,y], s, fl }
//   lR/lL  : perna D/E — [ângulo_rad, encurtamento_rel]
//   hR/hL  : item na mão — { k:'nome', a:ang, s:escala, fl:flip }
//   hipY   : deslocamento vertical do quadril (px do rig; usado para sentado/suspenso)
//
// Convenção walk() de elenco.js (linha 667):
//   lL: [s*amp, -max(0,-c)*amp*1.4], lR: [-s*amp, max(0,c)*amp*1.4]
//   aL: [-.15 - s*amp*.7, .3],       aR: [.15 + s*amp*.7, .3]
//   bob: -|c|*10*amp
//
// Coordenadas "braço apontando para alvo no mundo":
//   O boneco fica em (bx, 0, bz); cabeça ~1.6 m; ombro ~1.4 m; braço esticado ~1.2 m de ponto de pivô.
//   ang_rad = atan2(alvo.y - 1.2, dist_horizontal)   (positivo = para cima)
//   O rig espera o ângulo no campo aR ou aL como [ang, comprimento] ou via IK.
//
// Importar em epi.js:
//   import { Pz } from './Pz.js';
//
// ANDAR DE VERDADE (17/11, bug "anda no mesmo lugar"): E.walk só mexe as pernas; quem MOVE o boneco é `andar` (acoes.js, reexportado em epi.js):
//   { ...andar('zumbi', [x0,z0], [x1,z1], { t0: 0, vel: 0.9, amp: .5, p: (c) => ({ eye:'wide' }) }) }   // ator pronto p/ shots[].actors
//   - passo do ciclo = comprimento da perna (amp .5; menor = arrasta o pé, maior = corrida); fase vem da DISTÂNCIA andada, então não patina.
//   - p(c) só põe expressão/braços/props; NÃO chame E.walk dentro dele. Pz.passo(ph, amp) é o ciclo puro (usado por andar e anda).
// SEGURAR PARA MOSTRAR: Pz.segurar('abridor', { mostra: true, s: 1.4 }) põe o item ao lado do rosto (nunca sobre a cara); o auditor
//   (main.js --auditar) avisa "prop X sobre a cara" quando hR/hL cai na cabeça do dono (liberar de propósito: ator { propNaCara: true }).


// ── geometria do rig (mesmos números de elenco.js: UA, LA, TH, SH, SHX, SHY) ────
const UA = 70, LA = 66, TH = 76, SH = 72, SHX = 50, SHY = -150, REACH = UA + LA, PERNA = TH + SH;
const clampN = (v, a, b) => (v < a ? a : v > b ? b : v);
const lmb = (x, y, a, l1, l2) => { const ex = x + Math.sin(a[0]) * l1, ey = y + Math.cos(a[0]) * l1, b = a[0] + a[1]; return [ex, ey, ex + Math.sin(b) * l2, ey + Math.cos(b) * l2]; };

// extensão de cada prop ao longo do eixo do rig (a partir da mão, +y = ponta; unidades do rig, antes da escala s) e meia-largura
const PROP_BOX = { bicorne: [-105, 28, 106], abridor: [-42, 65, 18], lata: [-25, 45, 26], fuzil: [-35, 125, 24], spoon: [-10, 99, 15], ladle: [-30, 144, 32], sword: [-34, 150, 30], cutlass: [-34, 150, 30],
  shovel: [-40, 245, 30], map: [-10, 100, 75], recipe: [-10, 160, 70], lantern: [0, 100, 26], glass: [-20, 142, 17], pavio: [-20, 232, 16], relogio: [-14, 134, 74], knife: [-10, 90, 14], facaTorta: [-10, 90, 14], quill: [-60, 150, 30] };
const CABECA = { cx: 0, cy: -262, rx: 100, ry: 92 };   // elipse da CARA no espaço do corpo (origem no quadril, sem tilt)

// mão (ponto no espaço do corpo) para o braço `a` ({ik:[x,y]} ou [ang,dobra]); `lado` +1 = D, -1 = E. Igual ao armG do rig, só o ponto final.
function maoDe(a, lado) {
  const sx = lado * SHX;
  if (a && a.ik) { let dx = a.ik[0] - sx, dy = a.ik[1] - SHY, d = Math.hypot(dx, dy) || 1; const d2 = clampN(d, 0.62 * REACH, REACH - 0.5); return [sx + dx / d * d2, SHY + dy / d * d2]; }
  const q = a || [0.2, 0]; const g = lmb(sx, SHY, [q[0], clampN(q[1], -1.92, 1.92)], UA, LA); return [g[2], g[3]];
}
// fração (0..1) da área do prop que cai na cara do dono (amostragem 9x5 do retângulo do prop). Sem prop/medida desconhecida -> 0.
function propNaCara(item, mao, ang, s = 1) {
  const bx = PROP_BOX[item] || [-30, 100, 30], ca = Math.sin(ang), cb = Math.cos(ang); let dentro = 0, tot = 0;
  for (let i = 0; i <= 8; i++) for (let j = -2; j <= 2; j++) {
    const u = (bx[0] + (bx[1] - bx[0]) * i / 8) * s, v = j / 2 * bx[2] * s;     // u ao longo do eixo (sin a, cos a); v perpendicular
    const x = mao[0] + u * ca + v * cb, y = mao[1] + u * cb - v * ca;
    if (((x - CABECA.cx) / CABECA.rx) ** 2 + ((y - CABECA.cy) / CABECA.ry) ** 2 < 1) dentro++; tot++; }
  return dentro / tot;
}
// avisos de uma pose completa (hR/hL): retorna ['prop abridor (D) sobre a cara (35% da área)']
function avisaPropCara(pose) {
  const out = [];
  for (const [lado, a, h, nome] of [[1, pose.aR, pose.hR, 'D'], [-1, pose.aL, pose.hL, 'E']]) {
    if (!h || !h.k) continue; const f = propNaCara(h.k, maoDe(a, lado), h.a || 0, h.s || 1);
    if (f > 0.08) out.push(`prop ${h.k} (${nome}) sobre a cara (${Math.round(f * 100)}% da área): usar Pz.segurar(item,{mostra:true}) ou { propNaCara: true } se for de propósito`);
  }
  return out;
}

// ── ciclo de passo ANDADO (pernas plantadas): chão corre sob o pé de apoio a velocidade constante ────
// φ de cada perna: apoio (0..½ ciclo): perna reta, pé vai de +s a −s; balanço: joelho dobra e a perna volta. Perna E = φ, D = φ+π.
// Pé de apoio anda 2·148·sin(amp) por meio ciclo (π rad) => passo = comprimento da perna com amp .5.
const compPasso = (amp = 0.5) => 2 * PERNA * Math.sin(amp);          // unidades do rig por passo (π rad de fase)
// joelho: expoente .55 = o pé sobe e pousa rápido (o pé de balanço nunca fica mais baixo que o de apoio)
function perna(phi, amp, joelho) {
  const u = (((phi / (2 * Math.PI)) % 1) + 1) % 1; let s, flex = 0;
  if (u < 0.5) s = 1 - 4 * u; else { s = 4 * u - 3; flex = -joelho * Math.pow(Math.sin(Math.PI * (2 * u - 1)), 0.55); }
  return [Math.asin(s * Math.sin(amp)), flex];
}
function passo(ph, amp = 0.5, { corre = false } = {}) {
  const jo = corre ? 1.5 : 1.0, bw = corre ? 0.95 : 0.8, lL = perna(ph, amp, jo), lR = perna(ph + Math.PI, amp, jo);
  const apoioE = ((((ph / (2 * Math.PI)) % 1) + 1) % 1) < 0.5, ap = apoioE ? lL : lR, sw = apoioE ? lR : lL;
  const yApoio = TH * Math.cos(ap[0]) + SH * Math.cos(ap[0] + ap[1]);            // altura do pé plantado = quadril (hipY): o pé de apoio NUNCA sai do chão
  while (TH * Math.cos(sw[0]) + SH * Math.cos(sw[0] + sw[1]) > yApoio - 3 && sw[1] > -2.2) sw[1] -= 0.04;   // pé de balanço sempre ≥ 3 un. acima do chão
  return { lL, lR, aL: [-0.15 - bw * lL[0], 0.3 + (corre ? 0.5 : 0)], aR: [0.15 - bw * lR[0], 0.3 + (corre ? 0.5 : 0)], hipY: -yApoio, bob: 0, lean: corre ? 0.12 : 0.03 };
}

export const Pz = {
  passo, compPasso, maoDe, propNaCara, avisaPropCara, PROP_BOX,

  // Sentar DE FRENTE (padrão, 22/11): o rig só desenha de frente; então coxas abrem pra fora (joelhos afastados) e canelas descem
  // verticais. O quadril desce sozinho (hipOf usa o pé mais baixo). Cadeira deve estar virada pra câmera (cozinha: cadeirasDeFrente).
  // { perfil:true } = versão antiga (pernas horizontais), só serve com corpo de perfil, que o rig ainda não tem.
  sentar(progresso, { perfil = false } = {}) {
    const u = clampN(progresso, 0, 1);
    const k = u * u * (3 - 2 * u);
    if (perfil) return { lL: [1.29 * k, -1.55 * k], lR: [1.43 * k, -1.39 * k], lean: .23 * Math.sin(k * Math.PI) };
    return { lL: [-.5 * k, .5 * k], lR: [.5 * k, -.5 * k], lean: .05 * Math.sin(k * Math.PI), aL: [-.22 - .06 * k, .15 + .3 * k], aR: [.22 + .06 * k, .15 + .3 * k] };
  },

  chapeuNaMao({ lado = 'R' } = {}) {
    const sinal = lado === 'L' ? -1 : 1;
    return { hat: false, [`a${lado}`]: { ik: [sinal * 148, -151] }, [`h${lado}`]: { k: 'bicorne', a: .16 * sinal, s: .72 } };
  },

  // ─── apontar ───────────────────────────────────────────────────────────────
  // Estica o braço direito (ou esquerdo) em direção a alvoXYZ.
  // alvoXYZ  = [x, y, z] no espaço do mundo (metros)
  // bonecoXZ = [x, z] do boneco
  // { mao:'R'|'L' }
  //
  // Retorna f (direção) + aR ou aL com ângulo calculado.
  apontar(alvoXYZ, bonecoXZ, { mao = 'R', progresso = 1 } = {}) {
    const dx = alvoXYZ[0] - bonecoXZ[0];
    const dz = alvoXYZ[2] - bonecoXZ[1];  // bonecoXZ[1] é o z
    const dist = Math.hypot(dx, dz) || 0.001;
    const angV = clampN(Math.atan2(alvoXYZ[1] - 1.2, dist), -.95, .95);
    const lado = mao === 'L' ? 'L' : 'R';
    const ombroX = lado === 'L' ? -SHX : SHX;
    const alcance = REACH - 3;
    const f = dx >= 0 ? 1 : -1;
    const u = clampN(progresso, 0, 1);
    const arco = -Math.PI / 2 + (angV + Math.PI / 2) * u * u * (3 - 2 * u);
    return { f, aponta: u >= .8 ? lado : null, aL: [-.15, .3], aR: [.15, .3],
      [`a${lado}`]: { ik: [ombroX + Math.cos(arco) * alcance, SHY - Math.sin(arco) * alcance] } };
  },

  // ─── olhar ─────────────────────────────────────────────────────────────────
  // Vira o boneco para encarar alvoXYZ (campo f).
  // Inclina levemente a cabeça (tilt) na direção do alvo.
  // alvoXYZ  = [x, y, z]
  // bonecoXZ = [x, z]
  olhar(alvoXYZ, bonecoXZ) {
    const dx = alvoXYZ[0] - bonecoXZ[0];
    const f = dx >= 0 ? 1 : -1;
    // Inclinação da cabeça: olha para cima se alvo muito alto, para baixo se baixo
    const dz   = alvoXYZ[2] - bonecoXZ[1];
    const dist = Math.hypot(dx, dz) || 0.001;
    const angV = Math.atan2(alvoXYZ[1] - 1.6, dist);  // 1.6m = altura dos olhos
    const tilt = Math.max(-0.3, Math.min(0.3, -angV * 0.4));
    return { f, tilt, eye: 'normal' };
  },

  // ─── susto ─────────────────────────────────────────────────────────────────
  // Braços para cima, lean para trás, boca aberta, sobrancelhas levantadas.
  // k = intensidade 0..1
  susto(k = 1) {
    const kc = Math.max(0, Math.min(1, k));
    return {
      lean  : -0.18 * kc,
      aR    : [-1.4 * kc - 0.3, 0.9],   // braço direito para cima
      aL    : [ 1.4 * kc + 0.3, 0.9],   // braço esquerdo para cima
      lR    : [0.08 * kc, 0.05 * kc],
      lL    : [-0.08 * kc, 0.05 * kc],
      mouth : kc > 0.5 ? 'shout' : 'o',
      mo    : 0.5 + 0.5 * kc,
      eye   : 'wide',
      brow  : 0.6 + 0.4 * kc,
      bob   : -6 * kc,
      tilt  : (Math.random() - 0.5) * 0.06 * kc,  // leve abalo de cabeça (estático)
    };
  },

  // ─── recuar ────────────────────────────────────────────────────────────────
  // Lean para trás, pernas em recuo, braços levemente estendidos para frente.
  // k = intensidade 0..1
  recuar(k = 1) {
    const kc = Math.max(0, Math.min(1, k));
    return {
      lean  : -0.22 * kc,
      aR    : [-0.4 * kc, 0.6],
      aL    : [ 0.4 * kc, 0.6],
      lR    : [-0.15 * kc, 0.1 * kc],
      lL    : [ 0.25 * kc, -0.05 * kc],
      brow  : 0.3 * kc,
      eye   : kc > 0.6 ? 'wide' : 'normal',
    };
  },

  // ─── correr ────────────────────────────────────────────────────────────────
  // Ciclo de corrida: usa walk() com frequência maior (×2.4) e lean acentuado.
  // t = tempo em segundos.
  //
  // TODO: idealmente o rig exporia um parâmetro de inclinação do tronco dentro
  //       de walk(); por ora usa lean separado sobre o resultado de walk().
  //       Substituir quando o rig tiver walk(ph, amp, lean) nativo.
  correr(t) {
    const ph  = t * 9 * 2.4;         // frequência de passo ×2.4 em relação a walk normal
    const amp = 0.55;
    const s   = Math.sin(ph), c = Math.cos(ph);
    const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
    return {
      lL    : [ s * amp,  -clamp(-c, 0, 1) * amp * 1.6],
      lR    : [-s * amp,  -clamp( c, 0, 1) * amp * 1.6],
      aL    : [-0.18 - s * amp * 0.9, 0.35],
      aR    : [ 0.18 + s * amp * 0.9, 0.35],
      bob   : -Math.abs(c) * 14 * amp,
      lean  : 0.14,                  // inclinado para frente
      mouth : 'flat',
    };
  },

  // ─── comemorar ─────────────────────────────────────────────────────────────
  // Braços para cima alternados, lean leve, boca de sorriso.
  // t = tempo em segundos (para ciclo).
  comemorar(t) {
    const j = Math.max(0, Math.sin(t * 8));
    const sw = Math.sin(t * 16);
    return {
      aL    : [-2.6 + sw * 0.18, -0.15],
      aR    : [ 2.6 - sw * 0.18,  0.25],
      bob   : -j * 70,
      lean  : sw * 0.04,
      lL    : [-0.22 * j, 0.28 * j],
      lR    : [ 0.22 * j, -0.28 * j],
      mouth : 'bigsmile',
      mo    : 0.75,
      eye   : 'happy',
      brow  : -0.3,
    };
  },

  // ─── segurar ───────────────────────────────────────────────────────────────
  // Segura um item na mão. { lado:'R'|'L', mostra:false, s:1, subir:true }
  //  mostra:false = item à frente na altura da cintura (pose neutra, como antes).
  //  mostra:true  = "segurar para mostrar": mão ao lado do queixo/peito, item apontando pra cima e levemente pra fora; busca a posição
  //                 mais alta e perto do corpo em que o item NÃO cai sobre a cara (usa o tamanho do prop e a escala `s`). subir:false = ponta pra baixo.
  // Uso: { ...Pz.segurar('abridor', { mostra: true, s: 1.4 }), eye: 'wide' }   (aR/hR ou aL/hL já vêm montados)
  segurar(item, { lado = 'R', mostra = false, s = 1, subir = true } = {}) {
    const side = lado === 'L' ? -1 : 1, kA = lado === 'L' ? 'aL' : 'aR', kH = lado === 'L' ? 'hL' : 'hR';
    if (!mostra) return { [kA]: { ik: [side * 132, -111] }, [kH]: { k: item, a: 0, s, fl: 0 } };
    let melhor = null;
    for (let x = 105; x <= 178; x += 8) for (let y = -205; y <= -95; y += 10) for (const inc of [0.25, 0.45, 0.7, 1.0]) {
      const mao = [side * x, y], ang = subir ? Math.PI - side * inc : side * inc;
      if (Math.hypot(mao[0] - side * SHX, mao[1] - SHY) > REACH - 6) continue;
      const f = propNaCara(item, maoDe({ ik: mao }, side), ang, s); if (f > 0) continue;
      const custo = Math.abs(y + 175) * 0.6 + (x - 105) * 0.5 + inc * 30;          // prefere altura do peito/queixo, perto do corpo, pouca inclinação
      if (!melhor || custo < melhor.custo) melhor = { custo, mao, ang };
    }
    if (!melhor) { const y = -105, ang = subir ? Math.PI - side * 1.0 : side; melhor = { mao: [side * 125, y], ang }; }   // item enorme: baixo e inclinado pra fora
    return { [kA]: { ik: melhor.mao }, [kH]: { k: item, a: melhor.ang, s, fl: 0 } };
  },

  // ─── falar ─────────────────────────────────────────────────────────────────
  // Pose neutra de fala.  Usar junto com talk(t) de elenco.js para boca sync.
  // gesto = 'leve' | 'forte' | 'nenhum'
  //
  // O campo `mo` aqui é o valor padrão; se epi.js injetar talk(t) como `mo`,
  // substituirá este valor — compatível.
  falar({ gesto = 'leve' } = {}) {
    const gestoPose = {
      leve  : { aR: [-0.1, 0.4], aL: [ 0.08, 0.35] },
      forte : { aR: [-0.5, 0.7], aL: [ 0.3,  0.6 ], lean: 0.08 },
      nenhum: { aR: [ 0.1, 0.3], aL: [-0.08, 0.3 ] },
    };
    return {
      lean  : gesto === 'forte' ? 0.08 : 0.03,
      mouth : 'flat',          // talk(t) de elenco.js substituirá mo dinamicamente
      mo    : 0.0,
      eye   : 'normal',
      brow  : 0,
      ...gestoPose[gesto] ?? gestoPose.leve,
    };
  },

  // ─── pensar ────────────────────────────────────────────────────────────────
  // Mão direita levantada (cotovelo dobrado), olhar levemente para cima, tilt de cabeça.
  pensar() {
    return {
      lean  : 0.04,
      aR    : [-0.8, 0.65],              // braço levantado, cotovelo dobrado (IK aproximado)
      aL    : [ 0.1, 0.35],
      lR    : [ 0.05, 0.02],
      lL    : [-0.05, 0.02],
      mouth : 'flat',
      mo    : 0,
      eye   : 'normal',
      brow  : 0.2,
      tilt  : 0.07,
      bob   : -4,
    };
  },

  // ─── idle ──────────────────────────────────────────────────────────────────
  // Movimento de vida automático (respirar + balançar suave) para bonecos sem
  // pose explícita.  t = tempo em s, seed = semente para variar entre bonecos.
  //
  // Resultado: oscilação de lean, bob e tilt com fase deslocada por seed,
  //            evitando que todos os bonecos estáticos de fundo se movam em sincronia.
  idle(t, seed = 0) {
    const ph1 = t * 1.1 + seed * 2.39;   // frequência de respiração (~0.17 Hz)
    const ph2 = t * 1.7 + seed * 5.31;   // micro-balanço
    const ph3 = t * 0.8 + seed * 3.14;   // micro-tilt
    return {
      lean  :  Math.sin(ph1) * 0.018 + Math.sin(ph2 * 2.1) * 0.006,
      bob   : -Math.abs(Math.sin(ph1)) * 5 - 2,   // sempre ligeiramente para cima
      tilt  :  Math.sin(ph3) * 0.025,
      aR    : [0.12 + Math.sin(ph2) * 0.04, 0.3],
      aL    : [-0.1 - Math.sin(ph2) * 0.04, 0.3],
      mouth : 'flat',
      mo    : 0,
      eye   : 'normal',
    };
  },
};
