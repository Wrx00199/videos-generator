// foto.mjs <arquivo.html|url> <saida.png> <largura> <altura>  — print com o Chromium do playwright (nunca o Chrome do usuário)
import puppeteer from '/media/wr/HDD/Piloto Moeda/demo-world/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js';
import path from 'node:path';
const [,, src, out, w = '1280', h = '720'] = process.argv;
const b = await puppeteer.launch({ headless: true, executablePath: process.env.PUPPETEER_EXECUTABLE_PATH, args: ['--allow-file-access-from-files'] });
const p = await b.newPage(); await p.setViewport({ width: +w, height: +h });
await p.goto(src.startsWith('http') ? src : 'file://' + path.resolve(src)); await new Promise(r => setTimeout(r, 400));
await p.screenshot({ path: out }); await b.close();
