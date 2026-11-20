// planos.js — auto-enquadramento calculado para a série Tião (v1, 16/11/2026)
// Resolve item 4A.2 da auditoria: câmera analítica que garante todos os bonecos cabem com folga.
// Partes: 1) constantes/medida  2) enquadra  3) slots  4) P.solo/P.dupla  5) oracoes

// ─────────────────────────────────────────────────────────────────────────────
// PARTE 1 — constantes e medida(bb)
// ─────────────────────────────────────────────────────────────────────────────

/** Largura de um boneco com braços abertos (metros). */
export const BONECO_L = 0.9;

/** Altura de um boneco padrão (metros). */
export const BONECO_H = 1.8;

/**
 * Extrai dimensões úteis a partir de um bounding box de tela (pixels normalizados 0..1).
 * Por enquanto retorna as constantes físicas do rig, pois a conversão px→metros
 * depende de parâmetros de projeção ainda não exportados pelo auditor.
 * @param {Object} bb - { x0, x1, y0, y1 } normalizados
 * @returns {{ l: number, h: number, cx: number, cy: number }}
 */
export function medida(bb) {
  // cx/cy em 0..1 (centro na tela); l/h em metros (constantes até auditor exportar fov+dist)
  const cx = bb ? (bb.x0 + bb.x1) / 2 : 0.5;
  const cy = bb ? (bb.y0 + bb.y1) / 2 : 0.5;
  return { l: BONECO_L, h: BONECO_H, cx, cy };
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTE 2 — enquadra(atores, opcoes)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calcula câmera analítica que garante que todos os atores cabem na tela com folga.
 *
 * @param {Array<{x: number, z: number, largura?: number}>} atores
 *   Posições dos atores em coordenadas locais do cenário. `largura` em metros (default BONECO_L).
 * @param {Object} [opcoes]
 *   - fov: number    — fov vertical em graus (default 46)
 *   - margem: number — fração de tela a reservar de cada lado (default 0.12)
 *   - alt: number    — altura do olhar (metros, default 1.3 = rosto)
 *   - tipo: string   — 'close'|'medio'|'geral' (informativo; não altera cálculo)
 * @returns {{ pos: number[], look: number[], fov: number, folga_min: number }}
 */
export function enquadra(atores, opcoes = {}) {
  if (!atores || atores.length === 0) {
    throw new Error('enquadra: lista de atores vazia');
  }

  const fov    = opcoes.fov    ?? 46;
  const margem = opcoes.margem ?? 0.12;
  const alt    = opcoes.alt    ?? 1.3;

  // 1) bbox dos centros dos atores
  const xs = atores.map(a => a.x);
  const zs = atores.map(a => a.z);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const xMed = (minX + maxX) / 2;
  const zMed = zs.reduce((s, z) => s + z, 0) / zs.length;

  // 2) largura total: spread entre centros + metade de cada boneco nas extremidades
  const spread = maxX - minX;
  const lMax   = Math.max(...atores.map(a => a.largura ?? BONECO_L));
  const larguraTotal = spread + lMax;  // lMax cobre as bordas dos bonecos

  // 3) hfov horizontal equivalente em radianos
  // Tela 9:16 (vertical) → hfov_horizontal = fov_vertical * (9/16)
  const hfovDeg = fov * (9 / 16);
  const hfovRad = hfovDeg * (Math.PI / 180);

  // 4) distância mínima para caber com margem
  // larguraVisível_mínima = larguraTotal / (1 - 2*margem)
  // dist = (larguraVisível / 2) / tan(hfov/2)
  const larguraVis = larguraTotal / (1 - 2 * margem);
  const distMin = (larguraVis / 2) / Math.tan(hfovRad / 2);

  // 5-7) posição e look
  const posZ = zMed + distMin;
  const posY = alt;
  const pos  = [xMed, posY, posZ];
  const look = [xMed, alt * 0.9, zMed];

  // verificar pitch (ângulo de inclinação da câmera)
  const dx = look[0] - pos[0];
  const dy = look[1] - pos[1];
  const dz = look[2] - pos[2];
  const dist3d = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const pitchDeg = Math.abs(Math.asin(dy / dist3d) * (180 / Math.PI));
  if (pitchDeg > 10) {
    // ajustar look_y para manter pitch <= 10°
    const maxDy = dist3d * Math.sin(10 * Math.PI / 180);
    look[1] = pos[1] - maxDy;
  }

  // folga_min = margem por definição do cálculo (a distância foi escolhida para isso).
  // Recalcular a partir de larguraVis para confirmar, mas usar margem como piso garantido.
  const larguraVisReal = 2 * distMin * Math.tan(hfovRad / 2);
  const folgaCalc = (larguraVisReal - larguraTotal) / (2 * larguraVisReal);
  // folgaCalc pode diferir de margem por erro de ponto flutuante; usar o maior dos dois
  const folgaMin = Math.max(margem, folgaCalc);

  return { pos, look, fov, folga_min: folgaMin };
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTE 3 — slots(cenario, tipo)
// ─────────────────────────────────────────────────────────────────────────────

// Raios úteis dos cenários (metros)
const RAIO = {
  espaco:    9,
  cidade:    16,
  arena:     15.6,
  apocalipse: 8.4,
};

/**
 * Retorna posições seguras pré-calculadas para atores no cenário.
 * Coordenadas locais (relativas ao ORIGEM do cenário) no piso.
 *
 * @param {'espaco'|'cidade'|'arena'|'apocalipse'} cenario
 * @param {'solo'|'dupla'|'trio'|'estab'} tipo
 * @returns {Array<{x: number, z: number}>}
 */
export function slots(cenario, tipo) {
  const r = RAIO[cenario];
  if (r == null) throw new Error(`slots: cenário desconhecido '${cenario}'. Use: espaco, cidade, arena, apocalipse`);

  // Separação entre bonecos: mínimo 1.1m para não sobrepor chapéu
  const sep = 1.1;
  // Distância do centro do palco (z negativo = mais perto da câmera)
  const zBase = -r * 0.15;  // ~15% do raio, próximo da câmera, dentro do piso útil

  switch (tipo) {
    case 'solo':
      return [{ x: 0, z: zBase }];

    case 'dupla':
      return [
        { x: -sep / 2, z: zBase },
        { x:  sep / 2, z: zBase },
      ];

    case 'trio':
      return [
        { x: -sep,     z: zBase },
        { x:  0,       z: zBase - 0.3 },  // central ligeiramente à frente
        { x:  sep,     z: zBase },
      ];

    case 'estab': {
      // plano geral: bonecos espalhados no palco para mostrar o cenário
      const rUtil = r * 0.55;
      return [
        { x: -rUtil * 0.5, z:  rUtil * 0.1 },
        { x:  rUtil * 0.5, z: -rUtil * 0.1 },
      ];
    }

    default:
      throw new Error(`slots: tipo desconhecido '${tipo}'. Use: solo, dupla, trio, estab`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTE 4 — P.solo e P.dupla
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cria um plano solo compatível com epi.js.
 * @param {string} quem — id do ator (ex: 'tiao')
 * @param {{t0: number, t1: number, quem: string}} oracao — segmento de tempo
 * @param {Object} [opcoes] — passado para enquadra() + { x?, z?, cenario? }
 * @returns {Object} — estrutura de SHOT compatível com epi.js (cam.cm)
 */
function solo(quem, oracao, opcoes = {}) {
  const x   = opcoes.x   ?? 0;
  const z   = opcoes.z   ?? 0;
  const cam = enquadra([{ x, z, largura: opcoes.largura ?? BONECO_L }], {
    fov:    opcoes.fov    ?? 40,
    margem: opcoes.margem ?? 0.14,
    alt:    opcoes.alt    ?? 1.3,
    tipo:   'close',
  });
  return {
    t0:  oracao.t0,
    t1:  oracao.t1,
    de:  null,          // usa t0/t1 em vez de índice de fala
    cam: { cm: { pos: cam.pos, look: cam.look, fov: cam.fov } },
    actors: [{ n: quem, x, z }],
    _folga: cam.folga_min,
  };
}

/**
 * Cria um plano dupla compatível com epi.js.
 * @param {string} a — id do primeiro ator
 * @param {string} b — id do segundo ator
 * @param {{t0: number, t1: number, quem: string}} oracao
 * @param {Object} [opcoes] — { xa?, za?, xb?, zb?, fov?, margem?, alt? }
 * @returns {Object}
 */
function dupla(a, b, oracao, opcoes = {}) {
  const xa = opcoes.xa ?? -0.55;
  const za = opcoes.za ?? 0;
  const xb = opcoes.xb ??  0.55;
  const zb = opcoes.zb ?? 0;
  const cam = enquadra(
    [{ x: xa, z: za }, { x: xb, z: zb }],
    {
      fov:    opcoes.fov    ?? 46,
      margem: opcoes.margem ?? 0.12,
      alt:    opcoes.alt    ?? 1.3,
      tipo:   'medio',
    }
  );
  return {
    t0:  oracao.t0,
    t1:  oracao.t1,
    de:  null,
    cam: { cm: { pos: cam.pos, look: cam.look, fov: cam.fov } },
    actors: [{ n: a, x: xa, z: za }, { n: b, x: xb, z: zb }],
    _folga: cam.folga_min,
  };
}

/** Presets de plano. */
export const P = { solo, dupla };

// ─────────────────────────────────────────────────────────────────────────────
// PARTE 5 — oracoes(falas, palavras, opcoes)
// ─────────────────────────────────────────────────────────────────────────────

// Pontuação que encerra uma oração
const PONTUACAO_FIM = /[.!?…]+$/;
// Palavras que carregam pontuação de fim de oração no próprio token
const TOKEN_FIM     = /[.!?…]/;

/**
 * Segmenta falas em orações para enquadramento 1 plano/oração.
 *
 * @param {Array<{quem: string, texto: string, pausa?: number}>} falas
 * @param {Array<{w: string, ini: number, fim: number}>} palavras
 * @param {Object} [opcoes]
 *   - minDur: number — duração mínima de uma oração (default 1.2 s)
 *   - maxDur: number — duração máxima antes de forçar corte (default 3.2 s)
 *   - pauzaCorte: number — pausa entre palavras que força corte de oração (default 0.3 s)
 * @returns {Array<{i: number, fala: number, quem: string, t0: number, t1: number, texto: string}>}
 */
export function oracoes(falas, palavras, opcoes = {}) {
  const minDur     = opcoes.minDur     ?? 1.2;
  const maxDur     = opcoes.maxDur     ?? 3.2;
  const pauzaCorte = opcoes.pauzaCorte ?? 0.3;

  if (!falas || falas.length === 0) return [];
  if (!palavras || palavras.length === 0) return [];

  // — 1) Tokenizar: agrupa palavras por fala (alinhamento por sequência)
  //   Estratégia: iterar pelas palavras na ordem e tentar atribuir à fala atual
  //   baseado em texto normalizado. Se não alinhar, avança.
  const normalize = (s) => s.toLowerCase().replace(/[^a-záàâãéêíóôõúç]/g, '');

  // Achatar tokens de cada fala
  const falaTokens = falas.map(f => {
    // tokenizar por espaço, remover vazios
    return f.texto.trim().split(/\s+/).filter(Boolean);
  });

  // Atribuir cada palavra da lista STT a uma fala
  // Usamos índice corrente por fala
  const palavrasFala = palavras.map(() => -1); // índice da fala para cada palavra
  let fIdx = 0;
  let tIdx = 0; // índice dentro dos tokens da fala atual

  for (let pIdx = 0; pIdx < palavras.length; pIdx++) {
    const pw = normalize(palavras[pIdx].w);
    // tentar casar com token atual da fala atual
    while (fIdx < falaTokens.length) {
      if (tIdx >= falaTokens[fIdx].length) {
        // fala esgotada → próxima
        fIdx++;
        tIdx = 0;
        continue;
      }
      const ft = normalize(falaTokens[fIdx][tIdx]);
      if (ft === pw || pw.includes(ft) || ft.includes(pw)) {
        palavrasFala[pIdx] = fIdx;
        tIdx++;
        break;
      } else {
        // token não casa; tentar próximo token da mesma fala
        tIdx++;
        if (tIdx >= falaTokens[fIdx].length) {
          // fala sem mais tokens; manter fIdx e tentar próxima fala
          fIdx++;
          tIdx = 0;
        }
      }
    }
    if (palavrasFala[pIdx] === -1) palavrasFala[pIdx] = Math.max(0, fIdx - 1);
  }

  // — 2) Para cada fala, coletar suas palavras e segmentar em orações
  const resultado = [];
  let iGlobal = 0;

  for (let fi = 0; fi < falas.length; fi++) {
    const fala = falas[fi];
    const pws  = palavras.filter((_, i) => palavrasFala[i] === fi);
    if (pws.length === 0) continue;

    // segmentar por pontuação e pausas
    const cortes = []; // índices de pws onde começa nova oração (após este índice)
    for (let i = 0; i < pws.length - 1; i++) {
      const w   = pws[i];
      const wn  = pws[i + 1];
      const pausa = wn.ini - w.fim;

      const eFim = TOKEN_FIM.test(w.w);
      const ePauzaLonga = pausa > pauzaCorte;

      if (eFim || ePauzaLonga) {
        cortes.push(i);
      }
    }
    // sempre cortar no final da fala
    cortes.push(pws.length - 1);

    // agrupar em segmentos
    let inicio = 0;
    const segmentos = [];
    for (const c of cortes) {
      if (c >= inicio) {
        segmentos.push(pws.slice(inicio, c + 1));
        inicio = c + 1;
      }
    }

    // — 3) aplicar regras minDur / maxDur
    const segsFinal = [];
    for (let si = 0; si < segmentos.length; si++) {
      let seg = segmentos[si];
      const dur = seg[seg.length - 1].fim - seg[0].ini;

      if (dur < minDur && si < segmentos.length - 1) {
        // fundir com próximo
        segmentos[si + 1] = [...seg, ...segmentos[si + 1]];
        continue;
      }

      if (dur > maxDur) {
        // partir ao meio na maior pausa
        let melhorIdx  = -1;
        let melhorPausa = 0;
        for (let k = 0; k < seg.length - 1; k++) {
          const p = seg[k + 1].ini - seg[k].fim;
          if (p > melhorPausa) { melhorPausa = p; melhorIdx = k; }
        }
        if (melhorIdx >= 0 && melhorPausa > 0) {
          segsFinal.push(seg.slice(0, melhorIdx + 1));
          segsFinal.push(seg.slice(melhorIdx + 1));
          continue;
        }
      }

      segsFinal.push(seg);
    }

    // — 4) emitir orações
    for (const seg of segsFinal) {
      if (seg.length === 0) continue;
      resultado.push({
        i:     iGlobal++,
        fala:  fi,
        quem:  fala.quem,
        t0:    seg[0].ini,
        t1:    seg[seg.length - 1].fim,
        texto: seg.map(p => p.w).join(' '),
      });
    }
  }

  return resultado;
}
