// usage: node render.mjs <outdir> <frames: "a-b" or "1,2,3"> [step] [quality]
import { chromium } from 'playwright'; import http from 'http'; import fs from 'fs'; import path from 'path';
const [,, outdir, spec, step = '1', qual = '0.96'] = process.argv;
if (!outdir || !spec || !/^\d+(?:-\d+)?(?:,\d+(?:-\d+)?)*$/.test(spec) || !Number.isInteger(+step) || +step < 1) {
  console.error('Uso: node render.mjs <diretorio|--auditar> <quadros> [passo inteiro positivo]');
  process.exit(2);
}
if (outdir !== '--auditar') fs.mkdirSync(outdir, { recursive: true });
let frames = [];
for (const part of spec.split(',')) { if (part.includes('-')) { const [a, b] = part.split('-').map(Number); for (let f = a; f <= b; f += +step) frames.push(f); } else frames.push(+part); }
if (!frames.length) { console.error('Nenhum quadro no intervalo'); process.exit(2); }
let salvos = 0, reaproveitados = 0, ultimoQuadro = null;
if (outdir !== '--auditar') {
  const estado = path.join(outdir, 'estado-render.json');
  const parcial = `${estado}.${process.pid}.tmp`;
  const inicio = new Date().toISOString();
  const registrar = (status, codigo) => {
    fs.writeFileSync(parcial, JSON.stringify({ status, codigo, pid: process.pid, inicio, ultimo_sinal: new Date().toISOString(), total: frames.length, salvos, reaproveitados, ultimo_quadro: ultimoQuadro }) + '\n');
    fs.renameSync(parcial, estado);
  };
  registrar('em_andamento');
  setInterval(() => registrar('em_andamento'), 5000).unref();
  process.once('exit', codigo => registrar(codigo === 0 ? 'concluido' : 'falhou', codigo));
  process.once('SIGTERM', () => process.exit(143));
  process.once('SIGINT', () => process.exit(130));
}
const root = process.env.WEB || path.resolve('.');
const srv = http.createServer((q, s) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : p.endsWith('.png') ? 'image/png' : 'text/html' }); fs.createReadStream(p).pipe(s); }).listen(0);
await new Promise(r => srv.on('listening', r));
const angle = process.env.TIAO_GPU === 'vulkan'
  ? ['--use-gl=angle', '--use-angle=vulkan', '--disable-vulkan-surface', '--disable-software-rasterizer', '--enable-features=Vulkan']
  : ['--use-angle=gl'];
const b = await chromium.launch({ executablePath: process.env.CHROME || (process.env.HOME + '/.cache/ms-playwright/chromium-1148/chrome-linux/chrome'), args: [...angle, '--enable-gpu', '--ignore-gpu-blocklist', '--enable-webgl'] });
const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } });
pg.on('console', m => console.log('PAGE', m.text())); pg.on('pageerror', e => console.log('ERR', e.message));
await pg.goto(`http://localhost:${srv.address().port}/index.html${process.env.HASH||""}`);
await pg.waitForFunction(() => window.ready || window.err, null, { timeout: 180000 });
if (await pg.evaluate(() => window.err)) { console.log('page error'); process.exit(1); }
if (process.env.TIAO_TOTAL) {
  const total = await pg.evaluate(() => window.TOTAL);
  if (total !== Number(process.env.TIAO_TOTAL)) {
    console.error(`Story com ${total} quadros diverge do plano com ${process.env.TIAO_TOTAL}.`);
    await b.close(); srv.close(); process.exit(1);
  }
}
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
  if (process.env.RESUME && fs.existsSync(path.join(outdir, fname))) { reaproveitados++; ultimoQuadro = f; continue; }
  const d = await pg.evaluate(([f, q]) => { if (window.location.hash==="#nd") window.DEBUG_ND=1; if (window.location.hash==="#e") window.DEBUG_E=1; window.renderFrame(f); return document.getElementById('c').toDataURL('image/jpeg', q); }, [f, +qual]);
  fs.writeFileSync(path.join(outdir, fname), Buffer.from(d.split(',')[1], 'base64'));
  salvos++; ultimoQuadro = f;
}
if (+step > 1) {
  fs.writeFileSync(path.join(outdir, 'step.info'), JSON.stringify({ step: +step, framerate: 30 / +step }));
}
console.log(`done ${frames.length} frames, ${((Date.now() - t0) / frames.length / 1000).toFixed(2)} s/frame`);
await b.close(); srv.close();
