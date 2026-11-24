#!/usr/bin/env node
// Gerador do Tião: episodio.json -> MP4 usando SÓ o catálogo.
// uso: node projetos/bonecos/catalogo/gerar.mjs <pasta-ep> [validar|voz|html|audio|render|final|tudo]
import fs from 'node:fs'; import path from 'node:path'; import { spawnSync } from 'node:child_process';
const CAT = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const RAIZ = path.resolve(CAT, '../../..');
const EPD = path.resolve(process.argv[2] || '.'); const etapa = process.argv[3] || 'tudo';
const EP = JSON.parse(fs.readFileSync(path.join(EPD, 'episodio.json'), 'utf8'));
const CENF = path.join(CAT, 'cenarios/cenarios.json'); const CEN = fs.existsSync(CENF) ? JSON.parse(fs.readFileSync(CENF, 'utf8')) : Object.fromEntries(fs.readdirSync(path.join(CAT, 'cenarios')).filter(f => f.endsWith('_mid.png')).map(f => [f.replace('_mid.png', ''), { chao: 1560 }]));
const LOG = path.join(EPD, 'tempo.log'); const marca = m => fs.appendFileSync(LOG, `${new Date().toISOString()} ${m}\n`);
const sh = (c, a, o = {}) => { const r = spawnSync(c, a, { encoding: 'utf8', maxBuffer: 1 << 28, ...o }); if (r.status !== 0 && !o.ok) { console.error(c, a.join(' '), '\n', r.stderr?.slice(-1500)); process.exit(1); } return r; };
const dur = f => +sh('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.trim();
const n2 = i => String(i + 1).padStart(2, '0');
const AC = ['parado', 'andar', 'correr', 'pegar', 'segurar', 'mostrar', 'empurrar', 'puxar', 'apontar', 'susto', 'raiva', 'reclamar', 'chorar', 'despejar', 'tatear', 'bater', 'comemorar', 'sumir', 'aparecer', 'virar', 'olhar', 'expressao'];
const PASSIVAS = new Set(['parado', 'olhar', 'expressao']);
// auto-enquadramento: cada keyframe de câmera cabe os atores (início em cam[0], fim em cam[1])
const M = a => 95 * (a.s || 1), DX = a => (a.acoes || []).reduce((s, q) => s + ((q[2] || {}).dx || 0), 0);
function alcance(pl, k) { const xs = (pl.atores || []).flatMap(a => k === 0 ? [[a.x, M(a)]] : k === 1 ? [[a.x + DX(a), M(a)]] : [[a.x, M(a)], [a.x + DX(a), M(a)]]); return [Math.min(...xs.map(([x, m]) => x - m)), Math.max(...xs.map(([x, m]) => x + m))]; }
function enquadrar(pl) {
  if (!pl.atores?.length || !pl.cam) return pl; pl = JSON.parse(JSON.stringify(pl));
  pl.cam = pl.cam.map((c, k) => { let [cx, cy, z] = c; const [a, b] = alcance(pl, pl.cam.length === 1 ? 2 : k); const w = b - a + 40;
    if (w > 1080 / z) z = Math.max(1, 1080 / w); const hw = 540 / z; if (a - 20 < cx - hw) cx = a - 20 + hw; if (b + 20 > cx + hw) cx = b + 20 - hw; return [Math.round(cx), cy, +z.toFixed(3)]; });
  return pl;
}
// ---------------- validador (bloqueia antes do render) ----------------
function validar() {
  const err = [];
  EP.falas.forEach((f, i) => {
    if (!f.planos?.length) err.push(`fala ${i + 1}: sem plano`);
    let visivel = false;
    (f.planos || []).forEach((pl, j) => {
      const id = `fala ${i + 1} plano ${j + 1}`;
      if (!CEN[pl.cena]) err.push(`${id}: cenário '${pl.cena}' não existe no catálogo`);
      if (pl.atores?.length) { const r = alcance(pl); if (r[1] - r[0] > 1080) err.push(`${id}: atores espalhados demais (${Math.round(r[1] - r[0])} px > 1080)`); }
      if (!pl.cam || pl.cam.length < 2) err.push(`${id}: câmera sem movimento (precisa [de, para])`);
      (pl.atores || []).forEach(a => {
        if (!EP.elenco[a.id]) err.push(`${id}: ator '${a.id}' fora do elenco`);
        (a.acoes || []).forEach(([n, , o]) => { if (!AC.includes(n)) err.push(`${id}: ação '${n}' não existe na biblioteca`); if (!PASSIVAS.has(n)) visivel = true; if (o?.prop) { const seg = [...(EP.elenco[a.id]?.segura?.D || []), ...(EP.elenco[a.id]?.segura?.E || []), ...(a.segura?.D || []), ...(a.segura?.E || [])]; if (!seg.includes(o.prop)) err.push(`${id}: '${a.id}' usa prop '${o.prop}' sem tê-lo em segura`); } });
      });
      if ((pl.objetos || []).some(o => o.anim || o.aparece !== undefined) || (pl.texto || []).length || (pl.fx || []).length) visivel = true;
    });
    if (!visivel) err.push(`fala ${i + 1} "${f.txt.slice(0, 40)}…": nenhuma ação visível (só parado/olhar)`);
    if (f.txt.split(/\s+/).length > 22) err.push(`fala ${i + 1}: longa demais (>22 palavras)`);
  });
  const tot = EP.falas.reduce((s, f) => s + f.txt.split(/\s+/).length, 0);
  if (tot < 120 || tot > 185) err.push(`roteiro com ${tot} palavras (alvo 130–170 = 55–65 s)`);
  if (err.length) { console.error('VALIDADOR REPROVOU:\n- ' + err.join('\n- ')); process.exit(4); }
  console.log(`validador ok: ${EP.falas.length} falas, ${EP.falas.reduce((s, f) => s + f.planos.length, 0)} planos, ${tot} palavras`);
}
// ---------------- voz (Gemini Fenrir, 1 arquivo por fala, cache) ----------------
function voz() {
  const A = path.join(EPD, 'audio'); fs.mkdirSync(A, { recursive: true });
  EP.falas.forEach((f, i) => {
    const out = path.join(A, `f${n2(i)}.mp3`), txtf = path.join(A, `f${n2(i)}.txt`);
    if (fs.existsSync(out) && fs.existsSync(txtf) && fs.readFileSync(txtf, 'utf8') === f.txt) return;
    const a = ['ferramentas/voz.mjs', '--texto', f.txt, '--saida', out]; if (f.estilo) a.push('--estilo', f.estilo);
    sh('node', a, { cwd: RAIZ }); fs.writeFileSync(txtf, f.txt); console.log('voz', n2(i));
  });
}
// ---------------- tempos: silêncio de borda de cada fala -> início/fim ----------------
function tempos() {
  const A = path.join(EPD, 'audio'); let t = .12; const T = [];
  EP.falas.forEach((f, i) => {
    const fp = path.join(A, `f${n2(i)}.mp3`), D = dur(fp);
    const r = spawnSync('ffmpeg', ['-i', fp, '-af', 'silencedetect=n=-38dB:d=0.08', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
    const ends = [...r.matchAll(/silence_end: ([\d.]+)/g)].map(x => +x[1]), starts = [...r.matchAll(/silence_start: ([\d.]+)/g)].map(x => +x[1]);
    const lead = /silence_start: 0(\.0+)?\n/.test(r) && ends.length ? ends[0] : 0; const last = starts.length && starts[starts.length - 1] > D - .7 ? starts[starts.length - 1] : D;
    const ini = t - lead; T.push({ arq: fp, ini, fala0: t, fala1: ini + last, D }); t = ini + last + (f.pausa ?? .14);
  });
  return { T, DUR: +(t + .5).toFixed(2) };
}
function plano(T, DUR) {
  const PLAN = [];
  EP.falas.forEach((f, i) => {
    const a = i ? T[i].fala0 - (T[i].fala0 - T[i - 1].fala1) / 2 : 0, b = i < T.length - 1 ? T[i].fala1 + (T[i + 1].fala0 - T[i].fala1) / 2 : DUR;
    const W = f.planos.reduce((s, p) => s + (p.peso || 1), 0); let k = a;
    f.planos.forEach(p => { const d = (b - a) * (p.peso || 1) / W; PLAN.push(Object.assign({}, enquadrar(p), { t0: +k.toFixed(3), dur: +d.toFixed(3), fala: i })); k += d; });
  });
  return PLAN;
}
function palavras(T) {
  const out = [];
  EP.falas.forEach((f, i) => {
    const ws = f.txt.replace(/[…"“”]/g, '').split(/\s+/).filter(Boolean); const a = T[i].fala0, b = T[i].fala1 - .05;
    const tot = ws.reduce((s, w) => s + w.length + 1.5, 0); let c = a;
    ws.forEach(w => { const d = (b - a) * (w.length + 1.5) / tot; out.push([w.replace(/[,.!?;:]+$/, '').toUpperCase(), +c.toFixed(3), +(c + d).toFixed(3)]); c += d; });
  });
  return out;
}
// ---------------- HTML ----------------
function html() {
  const { T, DUR } = tempos(); const PLAN = plano(T, DUR); const WORDS = palavras(T);
  const C = path.join(EPD, 'cen'); fs.mkdirSync(C, { recursive: true });
  for (const c of new Set(PLAN.map(p => p.cena))) for (const l of ['far', 'mid', 'fg']) fs.copyFileSync(path.join(CAT, 'cenarios', `${c}_${l}.png`), path.join(C, `${c}_${l}.png`));
  fs.copyFileSync(path.join(CAT, 'assets/grain.png'), path.join(C, 'grain.png'));
  const rd = n => fs.readFileSync(path.join(CAT, 'lib', n), 'utf8');
  const css = fs.readFileSync(path.join(CAT, 'lib/shader.css'), 'utf8');
  const page = `<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=1080, height=1920"><script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script><style>${css}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="1080" data-height="1920"><div id="shake"><div id="stage"></div></div>
<div id="grade" class="ov"></div><div id="vig" class="ov"></div><div id="grain" class="ov"></div><div id="tex" class="ov"></div><div id="hudl" class="ov"></div><div id="cap" class="ov"></div><div id="flash" class="ov"></div><div id="fade" class="ov"></div></div>
<script>${rd('rig-base.js')}</script><script>${rd('personagem.js')}</script><script>${rd('helpers.js')}</script><script>${rd('motor.js')}</script>
<script>const EP=${JSON.stringify(EP)};const PLAN=${JSON.stringify(PLAN)};const WORDS=${JSON.stringify(WORDS)};const CEN=${JSON.stringify(CEN)};const DUR=${DUR};</script>
<script>${rd('montar.js')}</script><script>document.title=JSON.stringify((window.__acoes||[]).map(a=>[a.nome,a.mantem,+a.fim.uD.toFixed(1),+a.fim.lD.toFixed(1),+a.fim.uE.toFixed(1),a.segura.D]))</script></body></html>`;
  fs.writeFileSync(path.join(EPD, 'index.html'), page);
  fs.writeFileSync(path.join(EPD, 'plano.json'), JSON.stringify({ DUR, T, PLAN: PLAN.map(p => ({ t0: p.t0, dur: p.dur, cena: p.cena, fala: p.fala })) }, null, 1));
  console.log(`index.html ok: ${DUR}s, ${PLAN.length} planos`); return { T, DUR, PLAN };
}
// ---------------- áudio: falas + SFX do banco earshot (whoosh nos cortes + sfx do plano) ----------------
function audio() {
  const { T, DUR, PLAN } = JSON.parse(fs.readFileSync(path.join(EPD, 'plano.json'), 'utf8'));
  const EPF = plano(T, DUR); const A = path.join(EPD, 'audio'), SF = path.join(A, 'sfx'); fs.mkdirSync(SF, { recursive: true });
  const take = (id, d) => { const f = path.join(SF, id.replace(/\//g, '_') + `_${d}.wav`); if (!fs.existsSync(f)) sh('python3', ['-m', 'earshot', 'sfx', 'render', id, '-o', f, '--dur', String(d)], { cwd: path.join(RAIZ, 'ferramentas/earshot') }); return f; };
  const ev = T.map(x => ({ f: x.arq, t: x.ini, g: 1 }));
  EPF.forEach((p, i) => { if (i && EPF[i - 1].cena !== p.cena) ev.push({ f: take('whoosh_fast/crisp', .5), t: p.t0 - .12, g: .28 }); (p.sfx || []).forEach(([id, em, g, d]) => ev.push({ f: take(id, d || 1), t: p.t0 + (em || 0), g: g ?? .6 })); });
  if (EP.musica) ev.push({ f: path.resolve(EPD, EP.musica), t: 0, g: EP.musica_gain ?? .12, loop: 1 });
  const ins = [], fl = []; ev.forEach((e, k) => { if (e.loop) ins.push('-stream_loop', '-1'); ins.push('-i', e.f); fl.push(`[${k}:a]aresample=44100,pan=stereo|c0=c0|c1=c0,volume=${e.g},adelay=${Math.max(0, Math.round(e.t * 1000))}|${Math.max(0, Math.round(e.t * 1000))}[a${k}]`); });
  const filt = fl.join(';') + ';' + ev.map((_, k) => `[a${k}]`).join('') + `amix=inputs=${ev.length}:normalize=0,atrim=0:${DUR},loudnorm=I=-14:TP=-1.5:LRA=11[o]`;
  sh('ffmpeg', ['-v', 'error', '-y', ...ins, '-filter_complex', filt, '-map', '[o]', '-ar', '44100', path.join(A, 'mix.wav')]);
  console.log('mix.wav ok', ev.length, 'eventos');
}
// ---------------- render (1 por vez, flock) + shader de pós (bloom) + QA ----------------
function render() {
  const t0 = Date.now();
  sh('flock', ['/tmp/nexo-render.lock', 'node', 'ferramentas/render.mjs', EPD, '--saida', path.join(EPD, 'mudo.mp4'), '--res', '1080'], { cwd: RAIZ, stdio: 'inherit' });
  marca(`render ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
function final() {
  const out = path.join(EPD, 'final.mp4');
  // bloom: realces borrados somados em screen + leve textura de papel já vem do CSS
  const vf = `[0:v]format=gbrp,split[a][b];[b]curves=all='0/0 0.62/0 1/1',gblur=sigma=22[g];[a][g]blend=all_mode=screen:all_opacity=0.32,eq=contrast=1.04:saturation=1.06,format=yuv420p[v]`;
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
else E[etapa]();
