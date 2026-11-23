// vozes_elenco.mjs — diálogo com VOZ PRÓPRIA por personagem (Gemini TTS), econômico em cota.
// TODO(velocidade): A API Gemini TTS (generateContent + responseModalities:AUDIO) NÃO expõe parâmetro
//   numérico de velocidade (speakingRate/speedingRate/rate) no speechConfig — apenas seleção de voz.
//   Alternativas para atingir >2.8 wps: (1) instruir via prompt textual (ex.: "[fale rapidamente]" no
//   campo `tom` da fala, que já é injetado no pedido), ou (2) usar ffmpeg atempo para acelerar o áudio
//   pós-geração (ex.: -filter:a "atempo=1.3"). Se a API futuramente suportar speakingRate, adicionar
//   campo opcional `velocidade` (padrão 1.0) no falas.json e passar em speechConfig.
// Uso: node vozes_elenco.mjs <falas.json> <pasta_saida>
//   falas.json = { "falas": [ { "quem": "narrador|tiao|cap|...", "texto": "...", "tom": "gritando" (opcional), "pausa": 0.3 (opcional) } ] }
//   vozes/estilo de cada personagem: catalogo/vozes.json (pode sobrescrever com "elenco": { "cap": { "voz": "..." } } no falas.json)
// Saída: <pasta>/dialogo.wav (+ .mp3), <pasta>/falas_tempos.json [{i, quem, ini, fim, texto}], <pasta>/_por_personagem/*.wav
// Cota: 1 chamada por personagem (todas as falas dele juntas, pausa longa entre elas, corte por silêncio).
// Se o corte não bater com o nº de falas, refaz SÓ aquele personagem fala a fala. 429 = cota acabou: para e avisa.
import fs from 'node:fs'; import path from 'node:path'; import { spawnSync } from 'node:child_process'; import { fileURLToPath } from 'node:url';
import { chavesTts } from '../../../ferramentas/tts_config.mjs';
const KIT = path.dirname(fileURLToPath(import.meta.url));
const envFile = process.env.ESTUDIO_ENV || path.resolve(KIT, '../../../.env');
try { process.loadEnvFile(envFile); } catch (e) { if (e.code !== 'ENOENT') throw e; }
const KEYS = chavesTts(process.env); let ki = 0;   // V4 18/11: rotacao 1->5; so para (exit 3) quando TODAS acabarem
const MONTAR = process.argv.includes('--montar');   // --montar: só monta dialogo.wav com os <quem>_<i>.wav que já existem (cortes corrigidos à mão pelo STT), sem chamar o Gemini nem recortar
const POR_FALA = process.argv.includes('--por-fala');   // 18/11 ep.31: o corte por silencio casou a CONTAGEM mas errou os limites (fala 3 com 11 s); --por-fala gera 1 chamada por fala
const [arq, out0] = process.argv.slice(2).filter((a) => a !== '--montar' && a !== '--por-fala');
const out = out0 && path.resolve(out0);   // absoluto: o concat do ffmpeg resolve caminho relativo à pasta da lista (bug: dialogo.wav não saía com pasta relativa)
if (!arq || !out) { console.error('uso: node vozes_elenco.mjs <falas.json> <pasta_saida>'); process.exit(2); }
const cfg = JSON.parse(fs.readFileSync(arq, 'utf8'));
const projeto = path.dirname(path.resolve(arq));
const perfil = spawnSync('python3', [path.join(KIT, 'portao.py'), projeto, 'perfil'], { encoding: 'utf8' });
if (perfil.status !== 0) {
  console.error(perfil.stderr || perfil.stdout || 'Não foi possível checar o perfil do episódio.');
  process.exit(2);
}
if (cfg.molde === 'v7' || perfil.stdout.trim() === 'v7') {
  console.error('V7 usa voz_fala.py com pareceres vigentes e montar_dialogo.py.');
  process.exit(2);
}
const cat = JSON.parse(fs.readFileSync(path.join(KIT, 'catalogo/vozes.json'), 'utf8'));
const elenco = { ...cat.personagens, ...(cfg.elenco || {}) };
const falas = cfg.falas.map((f, i) => ({ ...f, i }));
const pp = path.join(out, '_por_personagem'); fs.mkdirSync(pp, { recursive: true });
const SR = 24000; let chamadas = 0;
const sh = (c, a) => spawnSync(c, a, { encoding: 'utf8', maxBuffer: 1 << 26 });
const dur = (f) => +sh('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.trim();
if (!MONTAR && !KEYS.length) { console.error('Sem credencial Gemini configurada para gerar as falas.'); process.exit(2); }

async function tts(voz, texto, dst) {
  chamadas++;
  for (let tent = 0; tent < 2; tent++) {
    let r, j;
    for (;;) {
      if (ki >= KEYS.length) { console.log(JSON.stringify({ erro: 'cota_esgotada' })); console.error(`COTA: todas as ${KEYS.length} chaves Gemini sem cota. Chamadas feitas: ${chamadas}. PARAR (nunca entregar voz cortada).`); process.exit(3); }
      r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent', { method: 'POST', signal: AbortSignal.timeout(180000),
        headers: { 'x-goog-api-key': KEYS[ki], 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: texto }] }], generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voz } } } } }) });
      j = await r.json().catch(() => ({}));
      const detalhe = String(j.error?.message ?? '').replaceAll(KEYS[ki], '[oculto]').slice(0, 250);
      if (r.status === 429) { console.error(`credencial ${ki + 1}: HTTP 429 ${detalhe}`); ki++; continue; }
      if (!r.ok) { console.error(`Gemini TTS falhou: HTTP ${r.status} ${detalhe}`); process.exit(1); }
      break;
    }
    const b = j.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data;
    if (b) {
      const parcial = dst + '.partial.wav';
      const conversao = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 's16le', '-ar', String(SR), '-ac', '1', '-i', 'pipe:0', parcial], { input: Buffer.from(b, 'base64') });
      if (conversao.status !== 0) {
        fs.rmSync(parcial, { force: true });
        console.error('Conversão da fala falhou: ' + String(conversao.stderr || conversao.error || 'ffmpeg').slice(0, 250));
        process.exit(1);
      }
      fs.renameSync(parcial, dst);
      return;
    }
    console.error('tts falhou', r.status, JSON.stringify(j.error?.message ?? j).slice(0, 160), tent ? '' : '— tentando 1x de novo');
  }
  return false;   // bloqueio (ex.: PROHIBITED_CONTENT): não derruba os outros personagens; a fala fica na lista de faltantes
}
const faltam = [];
function silencios(f) {
  const e = sh('ffmpeg', ['-hide_banner', '-i', f, '-af', 'silencedetect=noise=-38dB:d=0.55', '-f', 'null', '-']).stderr;
  const ini = [...e.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]), fim = [...e.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
  return ini.map((a, k) => [a, fim[k] ?? dur(f)]);
}
function corta(f, n) {   // devolve n trechos [a,b] de fala, usando os n-1 maiores silêncios internos
  const D = dur(f), sil = silencios(f).filter(([a, b]) => a > 0.15 && b < D - 0.15).sort((x, y) => (y[1] - y[0]) - (x[1] - x[0])).slice(0, n - 1).sort((x, y) => x[0] - y[0]);
  if (sil.length !== n - 1) return null;
  const pts = [0, ...sil.flatMap(([a, b]) => [a + 0.08, b - 0.08]), D]; const seg = [];
  for (let k = 0; k < n; k++) seg.push([pts[2 * k], pts[2 * k + 1]]);
  return seg.every(([a, b]) => b - a > 0.25) ? seg : null;
}
const instr = (P) => (P.estilo || 'Fale em português do Brasil, natural e expressivo.') + ' ';
const pedido = (P, lista) => instr(P) + 'Leia as falas abaixo, UMA POR VEZ, com uma pausa longa de 2 segundos entre elas. Siga o tom pedido entre colchetes, mas NUNCA leia o colchete em voz alta.\n\n' + lista.map((f) => (f.tom ? `[${f.tom}] ` : '') + f.texto).join('\n\n');

const trechos = {};   // i -> arquivo wav da fala
if (MONTAR) for (const f of falas) { const d = path.join(pp, `${f.quem}_${f.i}.wav`); if (!fs.existsSync(d)) { console.error('falta ' + d); process.exit(2); } trechos[f.i] = d; }
for (const quem of MONTAR ? [] : [...new Set(falas.map((f) => f.quem))]) {
  const P = elenco[quem]; if (!P) { console.error(`personagem sem voz no catálogo: ${quem}`); process.exit(2); }
  const lista = falas.filter((f) => f.quem === quem), bruto = path.join(pp, `${quem}.wav`);
  if (!POR_FALA && !fs.existsSync(bruto) && (await tts(P.voz, lista.length === 1 ? instr(P) + (lista[0].tom ? `[${lista[0].tom}] ` : '') + lista[0].texto : pedido(P, lista), bruto)) === false) { if (lista.length === 1) { faltam.push(lista[0].i); continue; } }
  let seg = POR_FALA || !fs.existsSync(bruto) ? null : lista.length === 1 ? [[0, dur(bruto)]] : corta(bruto, lista.length);
  if (!seg) {   // corte não bateu: fala a fala só deste personagem
    console.error(`${quem}: silêncios não bateram com ${lista.length} falas — gerando fala a fala`);
    for (const f of lista) { const d = path.join(pp, `${quem}_${f.i}.wav`); if (!fs.existsSync(d) && (await tts(P.voz, instr(P) + (f.tom ? `[${f.tom}] ` : '') + f.texto, d)) === false) { faltam.push(f.i); continue; } trechos[f.i] = d; }
    continue;
  }
  lista.forEach((f, k) => { const d = path.join(pp, `${quem}_${f.i}.wav`); sh('ffmpeg', ['-y', '-loglevel', 'error', '-i', bruto, '-ss', seg[k][0].toFixed(3), '-to', seg[k][1].toFixed(3), '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse', d]); trechos[f.i] = d; });
}
if (faltam.length) { console.error(`FALTAM falas ${faltam.join(', ')} (bloqueadas): trocar o tom/texto delas no falas.json e rodar de novo. Chamadas: ${chamadas}`); process.exit(4); }
// monta na ordem: fala + pausa (padrão 0,25 s; virada dramática = "pausa": 1.0 no falas.json)
const lst = path.join(pp, 'lista.txt'), sil = (s) => { const d = path.join(pp, `sil_${s}.wav`); if (!fs.existsSync(d)) sh('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', `anullsrc=r=${SR}:cl=mono`, '-t', String(s), d]); return d; };
let t = 0; const tempos = [], linhas = [];
for (const f of falas) { const d = dur(trechos[f.i]); tempos.push({ i: f.i, quem: f.quem, ini: +t.toFixed(3), fim: +(t + d).toFixed(3), texto: f.texto }); t += d; linhas.push(`file '${trechos[f.i]}'`);
  const p = f.pausa ?? cfg.pausa ?? 0.25; if (p > 0) { linhas.push(`file '${sil(p)}'`); t += p; } }
fs.writeFileSync(lst, linhas.join('\n'));
{ const r = sh('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-ar', String(SR), '-ac', '1', path.join(out, 'dialogo.wav')]); if (r.status) { console.error('ffmpeg concat falhou: ' + r.stderr.slice(0, 300)); process.exit(1); } }
sh('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(out, 'dialogo.wav'), '-b:a', '160k', path.join(out, 'dialogo.mp3')]);
fs.writeFileSync(path.join(out, 'falas_tempos.json'), JSON.stringify(tempos, null, 1));
const pal = falas.reduce((a, f) => a + f.texto.split(/\s+/).length, 0);
console.log(`dialogo.wav ${t.toFixed(1)} s · ${falas.length} falas · ${pal} palavras (${(pal / t).toFixed(2)} pal/s) · chamadas Gemini: ${chamadas}`);
