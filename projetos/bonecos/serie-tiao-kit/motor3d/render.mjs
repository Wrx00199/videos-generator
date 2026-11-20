// usage: node render.mjs <outdir> <frames: "a-b" or "1,2,3"> [step] [quality]
import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const [,, outdir, spec, step = '1', qual = '0.96'] = process.argv;
if (outdir !== '--auditar') fs.mkdirSync(outdir, { recursive: true });
let frames = [];
for (const part of spec.split(',')) { if (part.includes('-')) { const [a, b] = part.split('-').map(Number); for (let f = a; f <= b; f += +step) frames.push(f); } else frames.push(+part); }
const root = process.env.WEB || path.resolve('.');
const srv = http.createServer((q, s) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : p.endsWith('.png') ? 'image/png' : 'text/html' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise(r => srv.on('listening', r));
const b = await chromium.launch({ executablePath: process.env.CHROME || (process.env.HOME + '/.cache/ms-playwright/chromium-1148/chrome-linux/chrome'), args: ['--use-angle=gl', '--enable-gpu', '--ignore-gpu-blocklist', '--enable-webgl'] });
const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
pg.on('console', m => console.log('PAGE', m.text())); pg.on('pageerror', e => console.log('ERR', e.message));
await pg.goto(`http://localhost:${srv.address().port}/index.html${process.env.HASH||""}`);
await pg.waitForFunction(() => window.ready || window.err, null, { timeout: 180000 });
if (await pg.evaluate(() => window.err)) { console.log('page error'); process.exit(1); }
// modo auditoria: node render.mjs --auditar "0-1214" [passo]  -> auditoria.json + resumo (sem gerar imagem)
if (outdir === '--auditar') {
  const [res, med] = await pg.evaluate((fr) => { window.AUD = []; window.AUDN = []; for (const f of fr) window.auditFrame(f); return [window.AUD, window.AUDN]; }, frames);
  const grupos = {}; for (const r of res) { const k = r.quem + ' | ' + r.msg.replace(/\(.*?\)/, '').trim(); (grupos[k] ||= []).push(r.f); }
  const faixa = (fs) => { const o = []; let a = fs[0], b = fs[0]; for (const f of fs.slice(1)) { if (f - b <= +step * 2) { b = f; continue; } o.push(a === b ? `${a}` : `${a}-${b}`); a = b = f; } o.push(a === b ? `${a}` : `${a}-${b}`); return o.join(','); };
  const linhas = Object.entries(grupos).map(([k, fs]) => `${k} :: quadros ${faixa([...new Set(fs)].sort((x, y) => x - y))}`);
  fs.writeFileSync('auditoria.json', JSON.stringify({ itens: res.length, grupos: linhas, medidas: med }));
  console.log(linhas.length ? linhas.join('\n') : 'auditoria: nenhum problema de pose/enquadramento');
  await b.close(); srv.close(); process.exit(0);
}
const t0 = Date.now();
let idx = 0;
for (const f of frames) {
  const fname = (process.env.SEQ || +step > 1) ? `f${String(idx++).padStart(4, '0')}.jpg` : `f${String(f).padStart(4, '0')}.jpg`;
  if (process.env.RESUME && fs.existsSync(path.join(outdir, fname))) continue;
  const d = await pg.evaluate(([f, q]) => { if (window.location.hash==="#nd") window.DEBUG_ND=1; if (window.location.hash==="#e") window.DEBUG_E=1; window.renderFrame(f); return document.getElementById('c').toDataURL('image/jpeg', q); }, [f, +qual]);
  fs.writeFileSync(path.join(outdir, fname), Buffer.from(d.split(',')[1], 'base64'));
}
if (+step > 1) {
  fs.writeFileSync(path.join(outdir, 'step.info'), JSON.stringify({ step: +step, framerate: 30 / +step }));
}
console.log(`done ${frames.length} frames, ${((Date.now() - t0) / frames.length / 1000).toFixed(2)} s/frame`);
await b.close(); srv.close();
