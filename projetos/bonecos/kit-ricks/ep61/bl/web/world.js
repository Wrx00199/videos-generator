// Mundo físico do cenário: obstáculos sólidos (cilindros no chão) e placas (retângulos).
// solve() roda em TODO quadro antes do export: empurra bonecos pra fora de obstáculos e uns dos outros.
// Espelha parts/d_sets_tiao.py. Cenário novo = novo bloco aqui (catálogo de mundos).
export const BODY = 0.38;      // raio do boneco no chão (SC 0.95, braços abertos)
export const GAP = 0.06;       // folga visual
const O = [];                  // [nome, x, z, raio]
for (let i = 0; i < 8; i++) for (const zs of [-1, 1]) O.push(['poste', -12 + i * 3.6 + (zs > 0 ? 1.8 : 0), zs * 5.0, 0.14]);
for (const x of [-10.4, -3.1, 4.3, 11.5]) O.push(['árvore', x, -5.2, 0.95]); // copa baixa: raio da copa, não do tronco
O.push(['placa LEI', 1.6, -4.6, 0.5], ['placa seta', -7.5, -4.7, 0.6], ['hidrante', 1.0, -5.2, 0.22], ['lixo', -11, -5.4, 0.28]);
for (const [x, z] of [[-6.0, -5.5], [-5.5, -5.4], [3.5, -5.5], [12.6, -5.6], [-2.0, 5.6], [7.0, 5.5]]) O.push(['barril', x, z, 0.32]);
for (const x of [-4.0, 6.8]) O.push(['banco', x, -5.3, 0.75]);
O.push(['carro', -4.5, 4.1, 1.35]);
// ep61: palco do sorteio (12.6, -2.2), fusca-prêmio, placas
O.push(['fusca', 9.4, 0.4, 1.4], ['placa prêmio', 10.0, -2.6, 0.45], ['placar', 14.7, -1.9, 0.45], ['mastro', 10.9, -3.1, 0.1], ['mastro', 14.3, -3.1, 0.1]);
// paredes: ninguém entra nas casas; varandas e toldos avançam na calçada (caixas [nome, x0, x1, z0, z1, yBaixo])
export const WALLS = { zMin: -6.35, zMax: 6.35 };
export const BOXES = [['palco', 10.8, 14.4, -3.3, -1.1, 0], ['degrau', 10.9, 11.7, -1.2, -0.7, 0]];
for (const [x, w] of [[-8.6, 3.4], [-1.2, 3.4], [6.0, 3.2]]) BOXES.push(['varanda', x - w * 0.35 - 0.1, x + w * 0.35 + 0.1, -6.9, -5.78, 0]);
for (const [x, w] of [[-12, 3.0], [-4.9, 3.6], [2.4, 3.4], [9.4, 3.2]]) BOXES.push(['toldo', x + w * 0.18 - w * 0.275, x + w * 0.18 + w * 0.275, -6.9, -5.85, 1.5]);
for (const [x, w] of [[-10, 3.4], [-6.3, 3.6], [-2.5, 3.4], [1.2, 3.6], [5.0, 3.6], [8.8, 3.4]]) BOXES.push(['toldo', x - w * 0.3, x + w * 0.3, 5.85, 6.9, 1.5]);
export const OBST = O;
// placas legíveis: [nome, centro xyz, largura, altura, normal z (+1 olha pra +z)]
export const SIGNS = [['sorteio', [12.6, 4.3, -3.06], 3.3, 0.7, 1], ['prêmio', [10.0, 2.15, -2.57], 1.0, 0.5, 1], ['placar', [14.7, 1.85, -1.87], 0.9, 0.7, 1], ['LEI', [1.6, 2.2, -4.57], 0.9, 0.9, 1], ['seta', [-7.5, 2.1, -4.67], 1.1, 0.37, 1], ['prefeitura', [16, 4.85, -6.6], 3.6, 1.05, 1]];
for (const [x, w, h, , lj] of [[-12, 3.0, 4.6, 0, 'barbearia'], [-4.9, 3.6, 4.8, 0, 'padaria'], [2.4, 3.4, 5.2, 0, 'bar']])
  SIGNS.push([lj, [x, (h / 2) * 0.88 + 0.1, -6.9 + 0.08], Math.min(w * 0.8, 2.4), 0.55, 1]);
// Contato entre bonecos (trombada/abraço): só separa pares que se sobrepõem de verdade. NÃO mexe em obstáculos:
// obstáculo se resolve com route() no roteiro, e o validador reprova o que sobrar.
export function solve(list, touch = new Set()) {
  let moved = 0;
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const a = list[i], b = list[j], who = [a.who, b.who].sort().join('|');
    const m = touch.has(who) ? 0.45 : 0.5;
    const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz) || 1e-4;
    if (d < m) { const k = (m - d) / d / 2; a.x -= dx * k; a.z -= dz * k; b.x += dx * k; b.z += dz * k; moved = Math.max(moved, m - d); }
  }
  return moved;
}
// Rota que contorna obstáculos: pontos de passagem -> caminho sem colisão, andado em velocidade constante.
const blocked = (x, z, pad = 0) => OBST.some(([, ox, oz, r]) => Math.hypot(x - ox, z - oz) < BODY + r + GAP + pad)
  || BOXES.some(([, x0, x1, z0, z1, yb]) => yb < 2.1 && x > x0 - BODY && x < x1 + BODY && z > z0 - BODY && z < z1 + BODY);
// A* em grade de 10 cm (como pathfinding de jogo) + puxada de corda pra virar linhas retas naturais.
const GX0 = -14, GZ0 = -6.4, GS = 0.1, GW = 330, GH = 129;
let GRID = null;
const grid = () => { if (GRID) return GRID; GRID = new Uint8Array(GW * GH);
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) GRID[j * GW + i] = blocked(GX0 + i * GS, GZ0 + j * GS, 0.03) ? 1 : 0; return GRID; };
const cell = (x, z) => [Math.round((x - GX0) / GS), Math.round((z - GZ0) / GS)];
const free = (x, z) => { const [i, j] = cell(x, z); return i >= 0 && j >= 0 && i < GW && j < GH && !grid()[j * GW + i]; };
const sight = (A, B) => { const L = Math.hypot(B[0] - A[0], B[1] - A[1]), n = Math.ceil(L / 0.04);
  for (let k = 0; k <= n; k++) if (!free(A[0] + (B[0] - A[0]) * k / n, A[1] + (B[1] - A[1]) * k / n)) return false; return true; };
export const snap = (P) => { if (free(...P)) return P; for (let r = 0.1; r < 2; r += 0.1) for (let a = 0; a < 6.28; a += 0.4) { const c = [P[0] + r * Math.cos(a), P[1] + r * Math.sin(a)]; if (free(...c)) return c; } return P; };
function astar(P, Q) {
  P = snap(P); Q = snap(Q);
  if (sight(P, Q)) return [P, Q];
  const G = grid(), [si, sj] = cell(...P), [ti, tj] = cell(...Q), N = GW * GH;
  const g = new Float32Array(N).fill(1e9), from = new Int32Array(N).fill(-1), open = [[0, sj * GW + si]]; g[sj * GW + si] = 0;
  const h = (k) => Math.hypot(k % GW - ti, Math.floor(k / GW) - tj);
  while (open.length) {
    let bi = 0; for (let k = 1; k < open.length; k++) if (open[k][0] < open[bi][0]) bi = k;
    const [, c] = open.splice(bi, 1)[0]; if (c === tj * GW + ti) break;
    const ci = c % GW, cj = Math.floor(c / GW);
    for (const [di, dj, w] of [[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[1,-1,1.414],[-1,1,1.414],[-1,-1,1.414]]) {
      const ni = ci + di, nj = cj + dj; if (ni < 0 || nj < 0 || ni >= GW || nj >= GH) continue;
      const n = nj * GW + ni; if (G[n] && n !== tj * GW + ti) continue;
      const ng = g[c] + w; if (ng < g[n]) { g[n] = ng; from[n] = c; open.push([ng + h(n), n]); }
    }
  }
  let k = tj * GW + ti; if (from[k] < 0) return [P, Q];
  const raw = []; while (k >= 0) { raw.push([GX0 + (k % GW) * GS, GZ0 + Math.floor(k / GW) * GS]); k = from[k]; }
  raw.reverse(); raw[0] = P; raw[raw.length - 1] = Q;
  const out = [P]; let i = 0;
  while (i < raw.length - 1) { let j = raw.length - 1; while (j > i + 1 && !sight(raw[i], raw[j])) j--; out.push(raw[j]); i = j; }
  return out;
}
// route([[x,z],[x,z],...]) -> at(u 0..1) = {x, z, walk (fase do passo pela distância), dir (+1 indo pra +x)}
export function route(pts, stride = 0.55) {
  pts = pts.map(snap); let path = [pts[0]];
  for (let i = 1; i < pts.length; i++) path = [...path.slice(0, -1), ...astar(path[path.length - 1], pts[i])];
  const seg = [0]; for (let i = 1; i < path.length; i++) seg.push(seg[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
  const len = seg[seg.length - 1] || 1e-4;
  const at = (u) => {
    const d = Math.min(len, Math.max(0, u * len)); let i = 1; while (i < seg.length - 1 && seg[i] < d) i++;
    const t = (d - seg[i - 1]) / ((seg[i] - seg[i - 1]) || 1e-4), A = path[i - 1], B = path[i] || A;
    return { x: A[0] + (B[0] - A[0]) * t, z: A[1] + (B[1] - A[1]) * t, walk: Math.round(((d / stride) % 1) * 50) / 50, dir: B[0] >= A[0] ? 1 : -1 };
  };
  return { path, len, at };
}
export const HERO = ['LEI', 'seta', 'prefeitura', 'sorteio', 'prêmio', 'placar'];
// quem está em cima do palco (y >= 0.55) pode ficar dentro da caixa do palco
export const ONSTAGE = 0.55;
