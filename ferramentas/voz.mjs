#!/usr/bin/env node
// Voz Fenrir — texto consolidado -> MP3. V4: gira GEMINI_API_KEY_1..5 (mesma voz); sem cota em nenhuma = exit 3.
// Uso: node ferramentas/voz.mjs --texto "fala" | --arquivo fala.txt  --saida voz.mp3
// Chaves: lidas de $ESTUDIO_ENV (padrão: .env do próprio estúdio). Nunca imprime chave.
// Saída no stdout: JSON {saida, duracao_s, chave: "...<4 últimos>"}.
import fs from 'node:fs';
import { chavesTts, girarChaves } from './tts_config.mjs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const arg = (n, d) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : d; };
const ENV = process.env.ESTUDIO_ENV || fileURLToPath(new URL('../.env', import.meta.url));
try { process.loadEnvFile(ENV); } catch { /* sem .env: usa o ambiente */ }

const texto = arg('--texto') ?? (arg('--arquivo') ? fs.readFileSync(arg('--arquivo'), 'utf8') : null);
const saida = arg('--saida');
if (!texto?.trim() || !saida) { console.error('uso: voz.mjs --texto "..." | --arquivo f.txt --saida voz.mp3'); process.exit(2); }

// Voz PADRÃO FIXA do estúdio (aprovada pelo Filippe em 14/11): Fenrir + este estilo + este modelo. Não trocar sem ele pedir.
const voz = arg('--voz', 'Fenrir'); // --voz só para trabalho fora do GTA com pedido do Filippe (ex.: AD Lia, 20/11)
const modelo = 'gemini-3.1-flash-tts-preview';
const estilo = arg('--estilo', 'Fale em português do Brasil, tom seco, irônico e direto de narrador gamer paulista, ritmo rápido:') + ' ';
// V4 (18/11): rotacao 1->5 com as MESMAS voz/estilo/modelo. Sem chave nenhuma = exit 1; cota esgotada em todas = exit 3 (nunca entrega mudo/cortado).
const chaves = chavesTts(process.env);
if (!chaves.length) { console.error(`sem chave Gemini (procurei em ${ENV})`); process.exit(1); }

if (fs.existsSync(saida)) { console.error('saída já existe; preserve o arquivo e use uma execução nova'); process.exit(2); }
const inicioTotal = performance.now();
const erros = [];
const chamar = async (k) => {
  const inicioApi = performance.now();
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`, {
    method: 'POST', signal: AbortSignal.timeout(120000),
    headers: { 'x-goog-api-key': k, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: estilo + texto.trim() }] }],
      generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voz } } } },
    }),
  }).catch((e) => ({ ok: false, status: 0, json: async () => ({ error: { message: String(e) } }) }));
  const j = await r.json().catch(() => ({}));
  const b64 = j.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data;
  if (!r.ok || !b64) {
    const msg = String(j.error?.message ?? JSON.stringify(j)).slice(0, 100).replaceAll(k, '…');
    erros.push(`…${k.slice(-4)}: ${r.status} ${msg}`);
    throw Object.assign(new Error(msg), { status: r.status });
  }
  return { b64, api_s: (performance.now() - inicioApi) / 1000 };
};
// Erro que nao e cota (ex.: PROHIBITED_CONTENT, 5xx) nao gira: propaga e para com exit 1.
let g;
try { g = await girarChaves(chaves, chamar); }
catch { console.error('a chave falhou:\n' + erros.join('\n')); if (erros.some((e) => e.includes('PROHIBITED_CONTENT'))) console.error('dica: bloqueio do filtro do Gemini (falso positivo comum em frase curta/estranha). Reescreva a frase ou junte com a próxima.'); process.exit(1); }
if (!g.ok) { console.log(JSON.stringify({ erro: 'cota_esgotada' })); console.error('todas as chaves sem cota:\n' + erros.join('\n')); process.exit(3); }
const { b64, api_s } = g.valor;
const k = chaves[g.usada];
const inicioConversao = performance.now();
const pcm = `${saida}.pcm`;
const parcial = `${saida}.partial.mp3`;
fs.writeFileSync(pcm, Buffer.from(b64, 'base64'));
const c = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', pcm, '-b:a', '160k', parcial], { encoding: 'utf8' });
fs.rmSync(pcm, { force: true });
if (c.status !== 0) { fs.rmSync(parcial, { force: true }); console.error('ffmpeg falhou: ' + (c.stderr || '').slice(0, 200)); process.exit(1); }
fs.renameSync(parcial, saida);
const d = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', saida], { encoding: 'utf8' });
console.log(JSON.stringify({ saida, duracao_s: +(+d.stdout.trim()).toFixed(2), tempos_s: { api: +api_s.toFixed(2), conversao: +((performance.now() - inicioConversao) / 1000).toFixed(2), total: +((performance.now() - inicioTotal) / 1000).toFixed(2) }, chave: '…' + k.slice(-4) }));
