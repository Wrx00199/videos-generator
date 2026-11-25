#!/usr/bin/env node
// Gerador do Tião (padrão RicksClips 2.5D): episodio.json -> MP4 usando SÓ o catálogo.
// uso: node projetos/bonecos/catalogo/gerar.mjs <pasta-ep> [validar|voz|html|audio|render|final|tudo|entregar <nome>]
import fs from 'node:fs'; import path from 'node:path'; import { spawnSync } from 'node:child_process';
const CAT = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const RAIZ = path.resolve(CAT, '../../..');
const EPD = path.resolve(process.argv[2] || '.'); const etapa = process.argv[3] || 'tudo';
const EP = JSON.parse(fs.readFileSync(path.join(EPD, 'episodio.json'), 'utf8'));
const CENF = path.join(CAT, 'cenarios/cenarios.json');
const CEN = fs.existsSync(CENF) ? JSON.parse(fs.readFileSync(CENF, 'utf8')) : Object.fromEntries(fs.readdirSync(path.join(CAT, 'cenarios')).filter(f => f.endsWith('_mid.png')).map(f => [f.replace('_mid.png', ''), { chao: 1560 }]));
const LOG = path.join(EPD, 'tempo.log'); const marca = m => fs.appendFileSync(LOG, `${new Date().toISOString()} ${m}\n`);
const sh = (c, a, o = {}) => { const r = spawnSync(c, a, { encoding: 'utf8', maxBuffer: 1 << 28, ...o }); if (r.status !== 0 && !o.ok) { console.error(c, a.join(' '), '\n', r.stderr?.slice(-1500)); process.exit(1); } return r; };
const dur = f => +sh('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.trim();
const n2 = i => String(i + 1).padStart(2, '0');

const AC = [
  'parado', 'andar', 'correr', 'esgueirar', 'pegar', 'segurar', 'mostrar', 'jogar', 'golpear',
  'empurrar', 'puxar', 'apontar', 'susto', 'levantar_maos', 'cair', 'sentar', 'falar',
  'raiva', 'reclamar', 'chorar', 'despejar', 'tatear', 'bater', 'comemorar', 'sumir', 'aparecer', 'virar', 'olhar', 'expressao'
];
const PASSIVAS = new Set(['parado', 'olhar', 'expressao', 'sentar']);

// Auto-enquadramento inteligente: respeita closes manuais (manual_cam / foco_ator) e não encolhe mais por punch-zoom!
const M = a => 92 * (a.s || 1), DX = a => (a.acoes || []).reduce((s, q) => s + ((q[2] || {}).dx || 0), 0);
function alcance(pl, k, listaAtores) {
  const arr = listaAtores || pl.atores || [];
  const xs = arr.flatMap(a => k === 0 ? [[a.x || 900, M(a)]] : k === 1 ? [[(a.x || 900) + DX(a), M(a)]] : [[a.x || 900, M(a)], [(a.x || 900) + DX(a), M(a)]]);
  return [Math.min(...xs.map(([x, m]) => x - m)), Math.max(...xs.map(([x, m]) => x + m))];
}
function enquadrar(pl) {
  if (!pl.atores?.length || !pl.cam || pl.manual_cam) return pl;
  pl = JSON.parse(JSON.stringify(pl));
  const focados = pl.foco_ator !== undefined ? pl.atores.filter((a, idx) => idx === pl.foco_ator || a.id === pl.foco_ator) : pl.atores;
  const alvos = focados.length ? focados : pl.atores;
  pl.cam = pl.cam.map((c, k) => {
    let [cx, cy, z] = c;
    let [a, b] = alcance(pl, pl.cam.length === 1 ? 2 : k, alvos);
    const pad = z >= 2.0 ? 85 : 115;
    a -= pad; b += pad; const w = b - a;
    if (w > 1080 / z) z = Math.max(0.75, 1080 / w);
    const hw = 540 / Math.max(z, 1);
    if (a < cx - hw) cx = a + hw;
    if (b > cx + hw) cx = b - hw;
    return [Math.round(cx), cy, +z.toFixed(3)];
  });
  return pl;
}

// ---------------- VALIDADOR (bloqueia antes do render) ----------------
function validar() {
  const err = [];
  let totalPlanos = 0, insertos = 0, closes = 0;
  EP.falas.forEach((f, i) => {
    if (!f.planos?.length) err.push(`fala ${i + 1}: sem plano`);
    let visivel = false;
    (f.planos || []).forEach((pl, j) => {
      totalPlanos++;
      const id = `fala ${i + 1} plano ${j + 1}`;
      if (!CEN[pl.cena]) err.push(`${id}: cenário '${pl.cena}' não existe no catálogo`);
      if (!pl.cam || pl.cam.length < 2) err.push(`${id}: câmera sem movimento (precisa [de, para])`);
      else if (pl.cam[0][0] === pl.cam[1][0] && pl.cam[0][1] === pl.cam[1][1] && pl.cam[0][2] === pl.cam[1][2]) {
        err.push(`${id}: câmera congelada ([de] igual a [para])`);
      }
      const zMax = Math.max(pl.cam?.[0]?.[2] || 1, pl.cam?.[1]?.[2] || 1);
      if (zMax >= 1.85) closes++;
      if (!pl.atores?.length || pl.diagrama || pl.angulo === 'pov' || pl.angulo === 'raiox') insertos++;
      if (EP.molde === 'rick' && pl.texto?.length) err.push(`${id}: HUD flutuante (pl.texto) proibido no molde Rick; use pl.placas diegéticas`);
      (pl.atores || []).forEach(a => {
        if (!EP.elenco[a.id]) err.push(`${id}: ator '${a.id}' fora do elenco`);
        (a.acoes || []).forEach(([n, , o]) => {
          if (!AC.includes(n)) err.push(`${id}: ação '${n}' não existe na biblioteca`);
          if (!PASSIVAS.has(n)) visivel = true;
          if (n === 'falar' && !f.fala_ator && !pl.dialogo) err.push(`${id}: ação 'falar' (boca aberta) proibida em narração 3ª pessoa sem fala_ator`);
          if (o?.prop) {
            const seg = [...(EP.elenco[a.id]?.segura?.D || []), ...(EP.elenco[a.id]?.segura?.E || []), ...(a.segura?.D || []), ...(a.segura?.E || [])];
            if (!seg.includes(o.prop)) err.push(`${id}: '${a.id}' usa prop '${o.prop}' sem tê-lo em segura`);
          }
        });
      });
      if ((pl.objetos || []).some(o => o.anim || o.aparece !== undefined || o.tipo === 'fogueira') || pl.diagrama || pl.angulo === 'pov' || (pl.texto || []).length || (pl.fx || []).length) visivel = true;
    });
    if (!visivel) err.push(`fala ${i + 1} "${f.txt.slice(0, 40)}…": nenhuma ação visível (só parado/olhar)`);
    if (EP.modo !== 'teste' && f.txt.split(/\s+/).length > 24) err.push(`fala ${i + 1}: longa demais (>24 palavras)`);
  });
  const tot = EP.falas.reduce((s, f) => s + f.txt.split(/\s+/).length, 0);
  if (EP.modo !== 'teste') {
    if (!EP.teste && (tot < 120 || tot > 205)) err.push(`roteiro com ${tot} palavras (alvo 135–195 = 52–64 s)`);
    if (EP.molde === 'rick') {
      if (totalPlanos < 24) err.push(`molde Rick exige ≥24 planos (atual: ${totalPlanos})`);
      if (closes < 6) err.push(`molde Rick exige ≥6 planos médios/closes z≥1.85 (atual: ${closes})`);
      if (insertos < 4) err.push(`molde Rick exige ≥4 insertos/diagramas/POV sem boneco solto (atual: ${insertos})`);
    }
  }
  if (err.length) { console.error('VALIDADOR REPROVOU:\n- ' + err.join('\n- ')); process.exit(4); }
  console.log(`validador ok: ${EP.falas.length} falas, ${totalPlanos} planos (${closes} closes, ${insertos} insertos), ${tot} palavras`);
}

// ---------------- VOZ (Gemini Fenrir, 1 arquivo por fala, cache) ----------------
function voz() {
  const A = path.join(EPD, 'audio'); fs.mkdirSync(A, { recursive: true });
  EP.falas.forEach((f, i) => {
    const out = path.join(A, `f${n2(i)}.mp3`), txtf = path.join(A, `f${n2(i)}.txt`);
    const tag = `${f.estilo || ''}|${f.txt}`;
    if (fs.existsSync(out) && fs.existsSync(txtf) && fs.readFileSync(txtf, 'utf8') === tag) return;
    if (fs.existsSync(out)) fs.rmSync(out, { force: true });
    const a = ['ferramentas/voz.mjs', '--texto', f.txt, '--saida', out];
    if (f.estilo) a.push('--estilo', f.estilo);
    sh('node', a, { cwd: RAIZ }); fs.writeFileSync(txtf, tag); console.log('voz', n2(i));
  });
}

// ---------------- TEMPOS: ritmo seco estilo RicksClips (>92% fala, corte seco no fim!) ----------------
function tempos() {
  const A = path.join(EPD, 'audio'); let t = .06; const T = [];
  EP.falas.forEach((f, i) => {
    const fp = path.join(A, `f${n2(i)}.mp3`), D = dur(fp);
    const r = spawnSync('ffmpeg', ['-i', fp, '-af', 'silencedetect=n=-38dB:d=0.06', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
    const ends = [...r.matchAll(/silence_end: ([\d.]+)/g)].map(x => +x[1]), starts = [...r.matchAll(/silence_start: ([\d.]+)/g)].map(x => +x[1]);
    const lead = /silence_start: 0(\.0+)?\n/.test(r) && ends.length ? Math.min(ends[0], .25) : 0;
    const last = starts.length && starts[starts.length - 1] > D - .75 ? starts[starts.length - 1] : D;
    const ini = t - lead;
    T.push({ arq: fp, ini, fala0: t, fala1: ini + last, D });
    t = ini + last + (f.pausa ?? .05);
  });
  // Corte seco no payoff igual ao RicksClips (apenas 0.14s de respiro após a última sílaba!)
  return { T, DUR: +(t + .14).toFixed(2) };
}

// Direção automática estilo Rick (preserva escolhas manuais do storyboard e enriquece reações)
const KW = [
  [/medo|susto|assust|mergulh|abrigo|socorro/i, 'panic'],
  [/raiva|bravo|furios|suma|expuls|grit/i, 'rage'],
  [/genial|esperto|carretel|segredo|sorri|calmo/i, 'smug'],
  [/quebr|imposs|nada acontece|o qu[eê]|chifr/i, 'shock'],
  [/ouro|tesouro|aposta|rico/i, 'greedy'],
  [/explod|cogumelo|fogo/i, 'awe']
];
const FXA = {
  susto: [['suor', .25, 0]],
  correr: [['poeira', .15, 900, 1560]],
  bater: [['estrelas', .35, 900, 1150]],
  empurrar: [['poeira', .2, 900, 1560]],
  puxar: [['poeira', .3, 900, 1560]],
  cair: [['poeira', .2, 900, 1560]]
};
function dirigir(p, i, txt) {
  p = JSON.parse(JSON.stringify(p));
  const kw = (KW.find(([r]) => r.test(txt)) || [])[1];
  const fx = p.fx || [];
  (p.atores || []).forEach((a, j) => {
    if (!a.expr && a.id === 'tiao') a.expr = kw || ['scheming', 'smug', 'suspect', 'deadpan'][i % 4];
    if (!a.expr && a.id !== 'tiao') a.expr = kw === 'panic' || kw === 'shock' ? 'shock' : ['cynic', 'deadpan', 'suspect'][i % 3];
    (a.acoes || []).forEach(([n]) => (FXA[n] || []).forEach(f => {
      const g = f.slice();
      if (g[0] === 'suor') g[2] = j;
      if (!fx.some(x => x[0] === g[0])) fx.push(g);
    }));
  });
  p.fx = fx;
  return p;
}

function plano(T, DUR) {
  const PLAN = [];
  EP.falas.forEach((f, i) => {
    const a = i ? T[i].fala0 - (T[i].fala0 - T[i - 1].fala1) / 2 : 0;
    const b = i < T.length - 1 ? T[i].fala1 + (T[i + 1].fala0 - T[i].fala1) / 2 : DUR;
    const W = f.planos.reduce((s, p) => s + (p.peso || 1), 0); let k = a;
    f.planos.forEach(p => {
      const d = (b - a) * (p.peso || 1) / W;
      PLAN.push(Object.assign({}, enquadrar(dirigir(p, PLAN.length, f.txt)), { t0: +k.toFixed(3), dur: +d.toFixed(3), fala: i }));
      k += d;
    });
  });
  return PLAN;
}

// ---------------- LEGENDA PADRÃO RICKSCLIPS (Sentence case + pontuação + agrupamento 1–3 palavras) ----------------
const CURTAS = new Set(['o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'no', 'na', 'nos', 'nas', 'em', 'por', 'com', 'sem', 'pra', 'pro', 'que', 'se', 'ao', 'à', 'e', 'ou', 'mas', 'só', 'já', 'lá', 'não', 'nem', 'até', 'deu', 'foi', 'vai', 'era', 'tá']);
function agruparPalavras(rawWords) {
  const grupos = [];
  let buf = [];
  for (let i = 0; i < rawWords.length; i++) {
    const w = rawWords[i];
    const clean = w.toLowerCase().replace(/[^a-záàâãéêíóôõúç0-9]/gi, '');
    buf.push(w);
    const joined = buf.join(' ');
    const temPontuacaoForte = /[,.!?;:—…]$/.test(w);
    const ehCurta = CURTAS.has(clean) && !temPontuacaoForte;
    const prox = rawWords[i + 1] || '';
    const proxTam = joined.length + 1 + prox.length;
    if (temPontuacaoForte || buf.length >= 3 || (!ehCurta && (joined.length >= 10 || proxTam > 16)) || i === rawWords.length - 1) {
      grupos.push(joined);
      buf = [];
    }
  }
  if (buf.length) grupos.push(buf.join(' '));
  return grupos;
}

function palavras(T) {
  const out = [];
  EP.falas.forEach((f, i) => {
    const ws = f.txt.replace(/[“”"]/g, '').split(/\s+/).filter(Boolean);
    const chunks = agruparPalavras(ws);
    const a = T[i].fala0, b = Math.max(a + .08, T[i].fala1 - .02);
    const tot = chunks.reduce((s, ch) => s + ch.length + 2.2, 0); let c = a;
    chunks.forEach(ch => {
      const d = (b - a) * (ch.length + 2.2) / tot;
      out.push([ch, +c.toFixed(3), +(c + d).toFixed(3)]);
      c += d;
    });
  });
  return out;
}

// ---------------- HTML ----------------
function html() {
  const { T, DUR } = tempos(); const PLAN = plano(T, DUR); const WORDS = palavras(T);
  const C = path.join(EPD, 'cen'); fs.mkdirSync(C, { recursive: true });
  for (const o of new Set(PLAN.flatMap(p => (p.objetos || []).map(o => o.img).filter(Boolean)))) fs.copyFileSync(path.join(CAT, 'props_img', o + '.png'), path.join(C, o + '.png'));
  for (const c of new Set(PLAN.map(p => p.cena))) for (const l of ['far', 'mid', 'fg']) fs.copyFileSync(path.join(CAT, 'cenarios', `${c}_${l}.png`), path.join(C, `${c}_${l}.png`));
  fs.copyFileSync(path.join(CAT, 'assets/grain.png'), path.join(C, 'grain.png'));
  const rd = n => fs.readFileSync(path.join(CAT, 'lib', n), 'utf8');
  const css = fs.readFileSync(path.join(CAT, 'lib/shader.css'), 'utf8');
  const page = `<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=1080, height=1920"><script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script><style>${css}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="1080" data-height="1920"><div id="shake"><div id="stage"></div></div>
<div id="grade" class="ov"></div><div id="vig" class="ov"></div><div id="grain" class="ov"></div><div id="tex" class="ov"></div><div id="hudl" class="ov"></div><div id="cap" class="ov"></div><div id="flash" class="ov"></div><div id="fade" class="ov"></div></div>
<script>${rd('rig-base.js')}</script><script>${rd('personagem.js')}</script><script>${rd('helpers.js')}</script><script>${rd('motor.js')}</script><script>${rd('fx.js')}</script>
<script>const EP=${JSON.stringify(EP)};const PLAN=${JSON.stringify(PLAN)};const WORDS=${JSON.stringify(WORDS)};const CEN=${JSON.stringify(CEN)};const DUR=${DUR};</script>
<script>${rd('montar.js')}</script><script>document.title=JSON.stringify((window.__acoes||[]).map(a=>[a.nome,a.mantem,+a.fim.uD.toFixed(1),+a.fim.lD.toFixed(1),+a.fim.uE.toFixed(1),a.segura.D]))</script></body></html>`;
  fs.writeFileSync(path.join(EPD, 'index.html'), page);
  fs.writeFileSync(path.join(EPD, 'plano.json'), JSON.stringify({ DUR, T, PLAN: PLAN.map(p => ({ t0: p.t0, dur: p.dur, cena: p.cena, fala: p.fala, angulo: p.angulo || 'padrao' })) }, null, 1));
  console.log(`index.html ok: ${DUR}s, ${PLAN.length} planos`); return { T, DUR, PLAN };
}

// ---------------- ÁUDIO: falas + cama pizzicato estilo Rick + SFX cirúrgicos (sem whoosh metralhadora!) ----------------
function audio() {
  const { T, DUR } = JSON.parse(fs.readFileSync(path.join(EPD, 'plano.json'), 'utf8'));
  const EPF = plano(T, DUR); const A = path.join(EPD, 'audio'), SF = path.join(A, 'sfx'); fs.mkdirSync(SF, { recursive: true });
  const take = (id, d) => {
    if (id.startsWith('real/')) return path.join(RAIZ, 'banco/sfx', id + '.wav');
    const f = path.join(SF, id.replace(/\//g, '_') + `_${d}.wav`);
    if (!fs.existsSync(f)) sh('python3', ['-m', 'earshot', 'sfx', 'render', id, '-o', f, '--dur', String(d)], { cwd: path.join(RAIZ, 'ferramentas/earshot') });
    return f;
  };
  const ev = T.map(x => ({ f: x.arq, t: x.ini, g: 1 }));
  const SFXA = {
    susto: ['impact/swell', .5, .26],
    bater: ['cut_hit/punch', .4, .48],
    golpear: ['impact/metal', .6, .45],
    jogar: ['fit/whoosh.short/bamboo_swish', .35, .28],
    empurrar: ['cut_hit/air', .45, .24],
    cair: ['cut_hit/kick', .35, .32],
    pegar: ['knock/wood', .2, .22],
    raiva: ['cut_hit/sub', .35, .28]
  };
  EPF.forEach((p, i) => {
    if (i && p.transicao === 'whip') ev.push({ f: take('fit/whoosh.short/bamboo_swish', .35), t: Math.max(0, p.t0 - .06), g: .26 });
    (p.atores || []).forEach(a => {
      let k = p.t0 + (a.atraso || 0);
      (a.acoes || []).forEach(([nm, dd]) => { const s = SFXA[nm]; if (s) ev.push({ f: take(s[0], s[1]), t: k + .12, g: s[2] }); k += dd || 0; });
    });
    (p.sfx || []).forEach(([id, em, g, d]) => ev.push({ f: take(id, d || 1), t: p.t0 + (em || 0), g: g ?? .5 }));
  });
  // Cama musical padrão estilo RicksClips (pizzicato/pluck discreto a -28 dB sob a voz)
  const camaPadrao = path.join(CAT, 'assets/cama_rick.wav');
  // Trilha por seções (medido no Rick: estilo muda 4–5x seguindo a história). EP.trilha=[{f,de_fala,gain}]
  if (Array.isArray(EP.trilha)) EP.trilha.forEach((m, k) => {
    const de = T[m.de_fala || 0].ini, ate = EP.trilha[k + 1] ? T[EP.trilha[k + 1].de_fala].ini : DUR;
    ev.push({ f: path.resolve(EPD, m.f), t: Math.max(0, de - .15), g: m.gain ?? .12, loop: 1, dur: ate - de + .3 });
  });
  // Pop de UI em todo texto/objeto que aparece + whoosh em todo dissolve (medido: ~0,7 SFX/s)
  EPF.forEach((p, i) => {
    (p.texto || []).forEach(t => ev.push({ f: take('ui_pop/soft', .18), t: p.t0 + (t.em || 0), g: .3 }));
    if (i && p.transicao !== 'corte' && EPF[i - 1].cena !== p.cena) ev.push({ f: take('whoosh_fast/crisp', .5), t: Math.max(0, p.t0 - .2), g: .16 });
  });
  if (EP.musica !== false && !Array.isArray(EP.trilha)) {
    const musFile = EP.musica ? path.resolve(EPD, EP.musica) : (fs.existsSync(camaPadrao) ? camaPadrao : null);
    if (musFile && fs.existsSync(musFile)) ev.push({ f: musFile, t: 0, g: EP.musica_gain ?? .10, loop: 1 });
  }
  const ins = [], fl = [];
  ev.forEach((e, k) => {
    if (e.loop) ins.push('-stream_loop', '-1');
    if (e.dur) ins.push('-t', String(e.dur.toFixed(2)));
    ins.push('-i', e.f);
    fl.push(`[${k}:a]aresample=44100,pan=stereo|c0=c0|c1=c0,volume=${e.g},adelay=${Math.max(0, Math.round(e.t * 1000))}|${Math.max(0, Math.round(e.t * 1000))}[a${k}]`);
  });
  const filt = fl.join(';') + ';' + ev.map((_, k) => `[a${k}]`).join('') + `amix=inputs=${ev.length}:normalize=0,atrim=0:${DUR},loudnorm=I=-14:TP=-1.5:LRA=9[o]`;
  sh('ffmpeg', ['-v', 'error', '-y', ...ins, '-filter_complex', filt, '-map', '[o]', '-ar', '44100', path.join(A, 'mix.wav')]);
  console.log('mix.wav ok', ev.length, 'eventos');
}

// ---------------- RENDER (1 por vez, flock) + SHADER PÓS (bloom RGB) + QA FFMPEG ----------------
function render() {
  const t0 = Date.now();
  sh('flock', ['/tmp/nexo-render.lock', 'node', 'ferramentas/render.mjs', EPD, '--saida', path.join(EPD, 'mudo.mp4'), '--res', '1080'], { cwd: RAIZ, stdio: 'inherit' });
  marca(`render ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}

function final() {
  const out = path.join(EPD, 'final.mp4');
  // Bloom só em RGB (gbrp) para realçar fogo/luz/ouro sem pintar YUV de magenta!
  const vf = `[0:v]format=gbrp,split[a][b];[b]curves=all='0/0 0.64/0 1/1',gblur=sigma=20[g];[a][g]blend=all_mode=screen:all_opacity=0.28,eq=contrast=1.05:saturation=1.07,format=yuv420p[v]`;
  sh('ffmpeg', ['-v', 'error', '-y', '-i', path.join(EPD, 'mudo.mp4'), '-i', path.join(EPD, 'audio/mix.wav'), '-filter_complex', vf, '-map', '[v]', '-map', '1:a', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '19', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', out]);
  const qa = f => spawnSync('ffmpeg', ['-i', out, ...f, '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  const preto = (qa(['-vf', 'blackdetect=d=0.2:pix_th=0.06', '-an']).match(/black_start/g) || []).length;
  const cong = (qa(['-vf', 'freezedetect=n=0.003:d=2.5', '-an']).match(/freeze_start/g) || []).length;
  const sil = (qa(['-af', 'silencedetect=n=-45dB:d=2', '-vn']).match(/silence_start/g) || []).length;
  fs.mkdirSync(path.join(EPD, 'q'), { recursive: true });
  sh('ffmpeg', ['-v', 'error', '-y', '-i', out, '-vf', 'fps=1,scale=216:-1,tile=8x8', '-frames:v', '1', path.join(EPD, 'q/folha.jpg')]);
  const r = `QA ffmpeg: preto=${preto} congelado=${cong} silencio=${sil} dur=${dur(out).toFixed(1)}s`; console.log(r); marca(r);
  if (preto || cong || sil) process.exitCode = 5;
}

const E = { validar, voz, html, audio, render, final };
if (etapa === 'tudo') { marca('início'); validar(); voz(); marca('voz ok'); html(); audio(); render(); final(); marca('fim'); }
else if (etapa !== 'entregar') E[etapa]();

if (etapa === 'entregar') {
  const R = path.join(EPD, 'q/revisao.json'); if (!fs.existsSync(R)) { console.error('REPROV entrega: falta q/revisao.json do revisor'); process.exit(2); }
  const r = JSON.parse(fs.readFileSync(R, 'utf8')); const notas = Object.values(r.notas || {});
  const ok = r.media >= 7.5 && notas.every(n => n >= 6) && !(r.bloqueios || []).length && fs.statSync(R).mtimeMs > fs.statSync(path.join(EPD, 'final.mp4')).mtimeMs;
  if (!ok) { console.error(`REPROV entrega: média ${r.media}, mín ${Math.min(...notas)}, bloqueios ${(r.bloqueios || []).length} (ou revisão mais velha que o vídeo)`); process.exit(2); }
  const dst = path.join(RAIZ, 'prontos/Aventuras do Tiao', (process.argv[4] || path.basename(EPD)) + '.mp4'); fs.copyFileSync(path.join(EPD, 'final.mp4'), dst); console.log('entregue', dst);
}
