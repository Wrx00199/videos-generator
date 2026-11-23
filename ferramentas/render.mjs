#!/usr/bin/env node
// Render de composição HyperFrames (só Linux). Config medida em docs/render-benchmark.md:
// 1 worker (mais workers pioram nesse PC de 8 GB), cache de frames desligado, qualidade draft por padrão.
// Uso: node ferramentas/render.mjs <pasta> --saida final.mp4 [--res 720|1080] [--qualidade draft|looks|delivery] [--vaapi]
// --vaapi: re-encoda o vídeo pela GPU (h264_vaapi, via /usr/bin/ffmpeg) depois do render; cai em libx264 se falhar.
import {spawnSync} from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path';
process.env.HYPERFRAMES_CACHE_DIR ||= `${process.env.HOME}/.nexo/cache`;
process.env.PUPPETEER_CACHE_DIR ||= `${process.env.HOME}/.nexo/cache`;
const a = process.argv.slice(2); const pasta = a.find(x => !x.startsWith('--') && a[a.indexOf(x)-1] !== '--saida' && a[a.indexOf(x)-1] !== '--res' && a[a.indexOf(x)-1] !== '--qualidade');
const opt = (n, d) => { const i = a.indexOf('--' + n); return i >= 0 ? a[i+1] : d; };
const saida = path.resolve(opt('saida', 'final.mp4')), res = opt('res', '720'), q = opt('qualidade', 'draft'), vaapi = a.includes('--vaapi');
if (!pasta || !fs.existsSync(path.join(pasta, 'index.html'))) { console.error('uso: node ferramentas/render.mjs <pasta-com-index.html> --saida final.mp4 [--res 720|1080] [--qualidade draft|looks|delivery] [--vaapi]'); process.exit(2); }
if (!['720', '1080'].includes(res)) { console.error('--res deve ser 720 ou 1080'); process.exit(2); }
const t0 = Date.now();
const alvo = vaapi ? saida + '.sw.mp4' : saida;
const args = ['hyperframes', 'render', pasta, '-o', alvo, '-q', q, '-w', '1', '--frames-cache-dir', 'off', '--quiet'];
if (res === '720') args.push('--resolution', '720p');
let r = spawnSync('npx', args, {stdio: 'inherit'});
if (r.status !== 0) { console.error('render falhou'); process.exit(r.status || 1); }
if (vaapi) {
  const ff = fs.existsSync('/usr/bin/ffmpeg') ? '/usr/bin/ffmpeg' : 'ffmpeg'; // o ffmpeg de ~/.local/bin aborta com VAAPI
  const base = ['-v', 'error', '-y', '-i', alvo];
  let e = spawnSync(ff, ['-vaapi_device', '/dev/dri/renderD128', ...base, '-vf', 'format=nv12,hwupload', '-c:v', 'h264_vaapi', '-qp', '20', '-c:a', 'copy', saida], {stdio: 'inherit'});
  if (e.status !== 0) { console.error('vaapi falhou, usando libx264'); e = spawnSync(ff, [...base, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-c:a', 'copy', saida], {stdio: 'inherit'}); }
  fs.rmSync(alvo, {force: true}); if (e.status !== 0) process.exit(e.status || 1);
}
console.log(`ok ${saida} em ${((Date.now() - t0) / 1000).toFixed(0)}s`);
