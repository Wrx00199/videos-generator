// Painel GTA 6 — cortes de lives. Porta 7777. Sem dependências (Node puro).
// Abas: Ao vivo (Twitch/Kick/YouTube), Revisão (fila/aprovados/recusados em tempo real), Meta (IG/FB), Features.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFile, spawn } from 'node:child_process';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..', '..');
const LIVES = path.join(RAIZ, 'projetos', 'lives');
const CLIPPER = path.join(LIVES, 'clipper');
const PRONTOS = path.join(RAIZ, 'prontos', 'Gta 6');
const ESTADO = path.join(RAIZ, '_estado');
const DECISOES = path.join(ESTADO, 'painel-decisoes.json');
const CONFIG = path.join(RAIZ, 'config');
const HIST = path.join(ESTADO, 'historico-viewers.json');
const FILA_META = path.join(ESTADO, 'fila-meta.json');
const WIN = process.platform === 'win32';
const PY = path.join(CLIPPER, 'ambiente', WIN ? 'Scripts' : 'bin', WIN ? 'python.exe' : 'python');
const PORTA = Number(process.env.PORTA_PAINEL || 7777);
// config de quem usa: contas.json (dados da página, legenda, horários) e streamers.json (favoritos). Sem senhas.
const CONTAS_PAD = { dono: '', meta: { pagina: '', instagram: '', business_suite: 'https://business.facebook.com/latest/home', legenda_modelo: 'Olha o que rolou na live do {streamer} no GTA 6 😳 #gta6 #gtavi #gta #cortes #streamer', horarios: ['12:00', '15:00', '19:00', '21:30'] }, tiktok: { ativo: false, legenda_modelo: 'Olha o que rolou na live do {streamer} no GTA 6 😳 #gta6 #gtavi #fyp' } };
const contas = () => { const c = lerJson(path.join(CONFIG, 'contas.json'), {}); return { ...CONTAS_PAD, ...c, meta: { ...CONTAS_PAD.meta, ...(c.meta || {}) }, tiktok: { ...CONTAS_PAD.tiktok, ...(c.tiktok || {}) } }; };
const streamersCfg = () => ({ favoritos: [], alertar_ao_entrar: true, ...lerJson(path.join(CONFIG, 'streamers.json'), {}) });
function gravarJson(f, obj) { fs.mkdirSync(path.dirname(f), { recursive: true }); const t = f + '.tmp'; fs.writeFileSync(t, JSON.stringify(obj, null, 2)); fs.renameSync(t, f); }
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';
const TWITCH_CLIENT = 'kimne78kx3ncx6brgo4mv6wki5h1ko'; // Client-ID público do site da Twitch (o mesmo do ronda.py)

// ---------- util ----------
const json = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); };
const lerJson = (f, pad) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return pad; } };
const lerTexto = (f) => { try { return fs.readFileSync(f, 'utf8'); } catch { return ''; } };
const ls = (d) => { try { return fs.readdirSync(d, { withFileTypes: true }); } catch { return []; } };
const mtime = (f) => { try { return fs.statSync(f).mtimeMs; } catch { return 0; } };
const b64 = (s) => Buffer.from(s).toString('base64url');
const deb64 = (s) => Buffer.from(s, 'base64url').toString();
const corpo = (req) => new Promise((ok, no) => { let b = ''; req.on('data', (c) => { b += c; if (b.length > 1e5) { no(new Error('grande')); req.destroy(); } }); req.on('end', () => { try { ok(b ? JSON.parse(b) : {}); } catch (e) { no(e); } }); });
async function buscar(url, opts = {}) {
  const c = new AbortController(); const t = setTimeout(() => c.abort(), opts.timeout || 20000);
  try { const r = await fetch(url, { ...opts, signal: c.signal, headers: { 'User-Agent': UA, ...(opts.headers || {}) } }); return await r.text(); } finally { clearTimeout(t); }
}

// ---------- AO VIVO ----------
// Streamers que valem sempre (lista do estudio-lives + gringos grandes). Casa por trecho do login/nome.
const VIPS = ['davyjones', 'davy jones', 'kaicenat', 'kai cenat', 'ishowspeed', 'speed', 'coringa', 'yuri22', 'bistecone', 'alanzoka', 'cellbit', 'gaules',
  'brino', 'polex', 'paulinholoko', 'gabepeixe', 'gabipeixe', 'tonhao', 'blackoutz', 'auronplay', 'rubius', 'illojuan', 'squeezie', 'xqc', 'ohnepixel',
  'adinross', 'adin ross', 'pokimane', 'asmongold', 'jynxzi', 'plaqueboymax', 'sketch', 'lirik', 'shroud', 'summit1g', 'caseoh', 'zackrawrr', 'fanum', 'duke dennis'];
const ehVip = (...nomes) => nomes.some((n) => n && VIPS.some((v) => String(n).toLowerCase().includes(v)));
const BR = ['alanzoka', 'cellbit', 'gaules', 'bistecone', 'coringa', 'brino', 'polex', 'paulinholoko', 'gabepeixe', 'gabipeixe', 'yuri22', 'tonhao', 'blackoutz', 'davyjones', 'snowpay', 'lipaogamer', 'nobru', 'casimiro', 'baianor'];
const PT_RE = /\b(ao vivo|jogando|vamos|hoje|chegou|lan[cç]ou|galera|hist[oó]ria|parte|dia|mapa|miss[oõ]es|explorando|primeira vez|zerando)\b|[ãõçé]/i;
const MIN = { twitch: 300, kick: 300, youtube: 150 };

async function twitch() {
  const q = '{"query":"query{game(name:\\"Grand Theft Auto VI\\"){viewersCount streams(first:60,options:{sort:VIEWER_COUNT}){edges{node{viewersCount title language broadcaster{login displayName}}}}}}"}';
  const j = JSON.parse(await buscar('https://gql.twitch.tv/gql', { method: 'POST', body: q, headers: { 'Client-ID': TWITCH_CLIENT } }));
  const g = j.data.game;
  return { total: g.viewersCount, itens: g.streams.edges.map(({ node: n }) => ({
    plat: 'twitch', canal: n.broadcaster.login, nome: n.broadcaster.displayName, titulo: n.title, viewers: n.viewersCount,
    idioma: (n.language || '??').toLowerCase(), url: `https://twitch.tv/${n.broadcaster.login}`,
    thumb: `https://static-cdn.jtvnw.net/previews-ttv/live_user_${n.broadcaster.login.toLowerCase()}-440x248.jpg` })) };
}
const KICK_LANG = { portuguese: 'pt', english: 'en', spanish: 'es', turkish: 'tr', arabic: 'ar', russian: 'ru', polish: 'pl', french: 'fr', german: 'de' };
async function kick() {
  const j = JSON.parse(await buscar('https://kick.com/stream/livestreams/pt?page=1&limit=60&subcategory=grand-theft-auto-vi&sort=desc'));
  return { total: null, itens: (j.data || []).map((d) => ({
    plat: 'kick', canal: d.channel?.slug, nome: d.channel?.user?.username || d.channel?.slug, titulo: String(d.session_title || '').replace(/\s+/g, ' ').trim(),
    viewers: d.viewer_count, idioma: KICK_LANG[String(d.language).toLowerCase()] || String(d.language || '??').slice(0, 2).toLowerCase(),
    url: `https://kick.com/${d.channel?.slug}`, thumb: d.thumbnail?.src || (d.thumbnail?.srcset || '').split(' ')[0] || '' })) };
}
async function youtubeBusca(q, idiomaPadrao, hl) {
  const h = await buscar(`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&sp=EgJAAQ%3D%3D`, { headers: { 'Accept-Language': hl } });
  const m = h.match(/ytInitialData = (\{.*?\});<\/script>/s); if (!m) return [];
  const out = []; const andar = (o) => { if (Array.isArray(o)) o.forEach(andar); else if (o && typeof o === 'object') { if (o.videoRenderer) out.push(o.videoRenderer); Object.values(o).forEach(andar); } };
  andar(JSON.parse(m[1]));
  return out.filter((v) => (v.badges || []).some((b) => b.metadataBadgeRenderer?.style === 'BADGE_STYLE_TYPE_LIVE_NOW')).map((v) => {
    const txt = v.viewCountText?.runs?.[0]?.text ?? v.viewCountText?.simpleText ?? '0';
    const viewers = Number(String(txt).replace(/[^\d]/g, '')) || 0;
    const titulo = v.title?.runs?.[0]?.text || '';
    const nome = v.ownerText?.runs?.[0]?.text || '?';
    return { plat: 'youtube', canal: v.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl?.replace('/', '') || nome, nome, titulo, viewers,
      idioma: PT_RE.test(titulo) ? 'pt' : 'en', /* YouTube não informa idioma: título decide */ url: `https://www.youtube.com/watch?v=${v.videoId}`, thumb: `https://i.ytimg.com/vi/${v.videoId}/mqdefault_live.jpg` };
  });
}
// O mesmo streamer ao vivo em Kick + YouTube + Twitch vira UM card (união por nome normalizado; só junta nomes com 3+ letras)
// apelidos conhecidos: "LOUD Coringa" (YouTube) e "Coringa" (Kick) são o mesmo streamer
const APELIDOS = [...new Set([...BR, ...VIPS].map((x) => x.replace(/[^a-z0-9]/g, '')).filter((x) => x.length >= 6))].sort((x, y) => y.length - x.length);
const chaveNome = (s) => { const k = String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '').replace(/(oficial|official|lives?|games?|gamer|plays?|tv)+$/, ''); const ap = APELIDOS.find((x) => k.includes(x)); if (ap) return ap; return k.length >= 3 ? k : ''; };
function agrupar(itens) {
  const grupos = []; const porChave = new Map();
  for (const i of itens) {
    const ks = [chaveNome(i.nome), chaveNome(i.canal)].filter(Boolean);
    let g = ks.map((k) => porChave.get(k)).find(Boolean);
    if (!g) { g = { itens: [] }; grupos.push(g); }
    g.itens.push(i); ks.forEach((k) => porChave.set(k, g));
  }
  return grupos.map((g) => {
    const ord = [...g.itens].sort((a, b) => b.viewers - a.viewers); const p = ord[0];
    const total = ord.reduce((t, x) => t + x.viewers, 0); const melhor = ord.find((x) => x.plat !== 'youtube') || p; // gravar prefere Twitch/Kick
    const calores = ord.map((x) => x.calor).filter((c) => c != null);
    return { ...p, fontes: ord.map((x) => ({ plat: x.plat, url: x.url, viewers: x.viewers, titulo: x.titulo, thumb: x.thumb })), viewers_total: total, url_clipar: melhor.url,
      gravando: ord.some((x) => x.gravando), com_corte: ord.some((x) => x.com_corte), vip: ord.some((x) => x.vip), fav: ord.some((x) => x.fav),
      regiao: ord.some((x) => x.regiao === 'br') ? 'br' : p.regiao, calor: calores.length ? Math.max(...calores) : null,
      score: Math.round(Math.log10(total + 1) * 20 + (ord.some((x) => x.vip) ? 12 : 0) + ((ord.some((x) => x.regiao === 'br') ? 'br' : p.regiao) === 'br' ? 8 : p.regiao === 'en' ? 4 : 0)) };
  });
}
let _yt = { t: 0, v: null };
async function youtube() {
  if (_yt.v && Date.now() - _yt.t < 300000) return _yt.v; // YouTube: 3 buscas de ~1,2 MB; 5 min de cache basta
  const v = await youtubeReal(); if (v.itens.length) _yt = { t: Date.now(), v }; return v;
}
async function youtubeReal() {
  const r = await Promise.allSettled([youtubeBusca('gta 6 ao vivo', 'pt', 'pt-BR'), youtubeBusca('gta vi live', 'en', 'en-US'), youtubeBusca('gta 6 live stream', 'en', 'en-US')]);
  const vistos = new Set(); const itens = [];
  for (const x of r) if (x.status === 'fulfilled') for (const i of x.value) { const k = i.url; if (!vistos.has(k)) { vistos.add(k); itens.push(i); } }
  return { total: null, itens };
}

async function gravandoAgoraPs() {
  const urls = new Set(); const canais = new Set();
  for (const p of await gravacoesAtivas()) for (const u of p.args.match(/https?:\/\/\S+/g) || []) { urls.add(u); const k = u.replace(/[?#].*$/, '').split('/').filter(Boolean).pop(); if (k) canais.add(k.toLowerCase()); }
  return { urls, canais };
}
function gravandoAgora() {
  const set = new Set(); const base = path.join(CLIPPER, 'trabalho');
  for (const d of ls(base)) if (d.isDirectory() && Date.now() - mtime(path.join(base, d.name)) < 30 * 60e3) set.add(d.name.split('-')[0].toLowerCase());
  return set;
}
function clipadoHoje() { // canais que já têm corte na fila/aprovados
  const set = new Set();
  for (const it of listarRevisao().itens) { const m = it.id_texto.toLowerCase(); for (const v of VIPS) if (m.includes(v.replace(/\s/g, ''))) set.add(v.replace(/\s/g, '')); }
  return set;
}

// Radar de calor: guarda os viewers de cada live a cada varredura e mede quanto subiu por minuto.
let hist = lerJson(HIST, {});
function registrarHist(itens) {
  const agora = Date.now();
  for (const i of itens) { const k = `${i.plat}:${String(i.canal).toLowerCase()}`; const a = (hist[k] ||= []);
    if (!a.length || agora - a[a.length - 1][0] > 30000) a.push([agora, i.viewers]); if (a.length > 40) a.shift(); }
  for (const k of Object.keys(hist)) if (agora - hist[k][hist[k].length - 1][0] > 3600e3) delete hist[k];
  try { gravarJson(HIST, hist); } catch {}
}
function calor(i) { // % de variação por minuto, olhando ~5 min atrás
  const a = hist[`${i.plat}:${String(i.canal).toLowerCase()}`] || []; if (a.length < 2) return null;
  const fim = a[a.length - 1]; const ref = [...a].reverse().find((x) => fim[0] - x[0] >= 120e3) || a[0]; const min = (fim[0] - ref[0]) / 60e3; if (min < 1 || !ref[1]) return null;
  return Math.round(((fim[1] - ref[1]) / ref[1]) * 1000 / min) / 10;
}
let cacheLive = { t: 0, dados: null, promessa: null };
async function aoVivo(forcar = false) {
  if (!forcar && cacheLive.dados && Date.now() - cacheLive.t < 45000) return cacheLive.dados;
  if (cacheLive.promessa) return cacheLive.promessa;
  cacheLive.promessa = (async () => {
    const t0 = Date.now();
    const [tw, ki, yt] = await Promise.allSettled([twitch(), kick(), youtube()]);
    const fontes = {}; let todos = [];
    for (const [nome, r, ] of [['twitch', tw], ['kick', ki], ['youtube', yt]]) {
      if (r.status === 'fulfilled') { fontes[nome] = { ok: true, vistos: r.value.itens.length, total: r.value.total }; todos = todos.concat(r.value.itens); }
      else fontes[nome] = { ok: false, erro: String(r.reason?.message || r.reason).slice(0, 80) };
    }
    const gp = await gravandoAgoraPs(); const grav = gp.canais; const clip = clipadoHoje(); const favs = streamersCfg().favoritos.map((f) => f.toLowerCase());
    const itens = todos.filter((i) => i.viewers >= MIN[i.plat]).map((i) => {
      const vip = ehVip(i.canal, i.nome);
      // a tag de idioma da Twitch/Kick erra (ex.: alanzoka vem como EN): streamer BR conhecido ou título em PT vale como BR
      const ehBR = i.idioma === 'pt' || BR.some((b) => String(i.canal).toLowerCase().includes(b)) || (i.idioma === 'en' && PT_RE.test(i.titulo) && /[ãõç]/i.test(i.titulo));
      const regiao = ehBR ? 'br' : i.idioma === 'en' ? 'en' : 'outro';
      // relevância: audiência em escala log (todas as plataformas comparáveis) + bônus de VIP + bônus de idioma que o pipeline entende hoje (PT)
      const score = Math.round(Math.log10(i.viewers + 1) * 20 + (vip ? 12 : 0) + (regiao === 'br' ? 8 : regiao === 'en' ? 4 : 0));
      const k = String(i.canal || '').toLowerCase();
      return { ...i, vip, regiao, score, fav: favs.some((f) => k.includes(f)), gravando: grav.has(k) || gp.urls.has(i.url), com_corte: [...clip].some((c) => k.includes(c) || c.includes(k)) };
    });
    registrarHist(itens); itens.forEach((i) => { i.calor = calor(i); });
    const unicos = agrupar(itens).sort((a, b) => b.score - a.score || b.viewers_total - a.viewers_total);
    cacheLive.dados = { atualizado: Date.now(), varredura_ms: Date.now() - t0, fontes, total_twitch_gta6: fontes.twitch?.total ?? null, itens: unicos, brutos: itens.length };
    cacheLive.t = Date.now();
    return cacheLive.dados;
  })().finally(() => { cacheLive.promessa = null; });
  return cacheLive.promessa;
}

// ---------- REVISÃO ----------
const decisoes = () => lerJson(DECISOES, {});
function salvarDecisao(id, d) {
  _rv.t = 0; const todas = decisoes(); if (d === null) delete todas[id]; else todas[id] = d;
  fs.mkdirSync(ESTADO, { recursive: true });
  const tmp = DECISOES + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(todas, null, 1)); fs.renameSync(tmp, DECISOES);
}
function primeiraLinha(f) { return lerTexto(f).split('\n').map((s) => s.trim()).find(Boolean) || ''; }

let _rv = { t: 0, v: null };
function listarRevisao() { if (_rv.v && Date.now() - _rv.t < 2000) return _rv.v; _rv = { t: Date.now(), v: listarRevisaoRaw() }; return _rv.v; }
function listarRevisaoRaw() {
  const itens = []; const rel = (f) => path.relative(RAIZ, f);
  const tt = contas().tiktok.ativo;
  const add = (arq, extra) => { const st = fs.statSync(arq); const irmao = arq.replace(/_ig\.mp4$/, '_tiktok.mp4'); const temTT = tt && irmao !== arq && fs.existsSync(irmao);
    itens.push({ id: b64(rel(arq)), id_texto: rel(arq), mp4: rel(arq), tamanho: st.size, criado: st.mtimeMs, ...(temTT ? { tiktok_id: b64(rel(irmao)), tiktok_mp4: rel(irmao) } : {}), ...extra }); };
  // 1) fila (saída do clipador/ao_vivo): aguardando revisão
  for (const e of ls(path.join(LIVES, 'fila'))) if (e.isFile() && e.name.endsWith('.mp4')) {
    const f = path.join(LIVES, 'fila', e.name); const txt = f.replace(/\.mp4$/, '.txt'); const t = lerTexto(txt).split('\n').map((s) => s.trim()).filter(Boolean);
    const side = lerJson(f.replace(/\.mp4$/, '.json'), {});
    add(f, { origem: 'fila', estado: 'revisao', titulo: t[0] || e.name, legenda: t[1] || '', streamer: e.name.split('-')[2] || '', nota: side.nota ?? null, gravado_em: side.gravado_em ?? null, abaixo_min: !!side.abaixo_min });
  }
  // 2) clipes/<pasta>/*_ig.mp4 (montados à mão/pelo ao_vivo): só versão Instagram/Facebook (TikTok parado)
  const prontosNomes = [];
  const prontosDir = path.join(PRONTOS, 'Lives BR');
  for (const d of ls(prontosDir)) if (d.isDirectory()) for (const e of ls(path.join(prontosDir, d.name))) if (e.isFile() && /_ig\.mp4$/.test(e.name)) {
    const f = path.join(prontosDir, d.name, e.name); prontosNomes.push(e.name.replace(/_ig\.mp4$/, ''));
    const leg = lerTexto(path.join(prontosDir, d.name, `legenda-${e.name.replace(/_ig\.mp4$/, '').split('-')[0]}.txt`));
    add(f, { origem: 'prontos', estado: 'aprovado', titulo: e.name.replace(/_ig\.mp4$/, '').replace(/-/g, ' '), legenda: leg.trim().split('\n')[0] || '', streamer: d.name.replace(/^\d{4}-\d\d-\d\d-/, '') });
  }
  for (const d of ls(path.join(LIVES, 'clipes'))) if (d.isDirectory()) {
    const dir = path.join(LIVES, 'clipes', d.name); const meta = lerJson(path.join(dir, 'meta.json'), {});
    const ig = ls(dir).find((e) => /_ig\.mp4$/.test(e.name)); if (!ig) continue;
    if (prontosNomes.some((n) => d.name.endsWith(n))) continue; // já saiu em prontos/
    add(path.join(dir, ig.name), { origem: 'clipes', estado: 'revisao', titulo: meta.gancho || d.name, legenda: meta.reacao || '', streamer: d.name.replace(/^\d{4}-\d\d-\d\d-/, '').split('-')[0], dur: meta.dur, status_pipeline: meta.status, nota: meta.nota ?? null, gravado_em: meta.gravado_em ?? null, abaixo_min: !!meta.abaixo_min });
  }
  // 3) descartados pelo próprio pipeline (sem reação/sem fala PT)
  for (const e of ls(path.join(LIVES, 'descartados'))) if (e.isFile() && e.name.endsWith('.mp4')) {
    const f = path.join(LIVES, 'descartados', e.name);
    add(f, { origem: 'descartados', estado: 'recusado', auto: true, titulo: primeiraLinha(f.replace(/\.mp4$/, '.txt')) || e.name, streamer: e.name.split('-')[2] || '', motivo: 'recusado pelo robô (sem reação / fala PT fraca)' });
  }
  // suas decisões sobrepõem o estado automático
  const dec = decisoes();
  for (const it of itens) { const d = dec[it.id]; if (d) { it.estado = d.estado; it.motivo = d.motivo || it.motivo; it.decidido_em = d.ts; it.auto = false; } }
  itens.sort((a, b) => b.criado - a.criado);
  return { itens, contagem: { revisao: itens.filter((i) => i.estado === 'revisao').length, aprovado: itens.filter((i) => i.estado === 'aprovado').length, recusado: itens.filter((i) => i.estado === 'recusado').length } };
}

// processos do pipeline (Linux/Mac via ps; Windows via PowerShell — Windows ainda não testado)
function listaProcessos() {
  return new Promise((ok) => {
    if (WIN) return execFile('powershell', ['-NoProfile', '-Command', 'Get-CimInstance Win32_Process | Select-Object ProcessId,CommandLine | ConvertTo-Json -Compress'], { maxBuffer: 8e6 }, (e, out) => {
      if (e) return ok([]); try { const j = JSON.parse(out); ok((Array.isArray(j) ? j : [j]).filter((p) => p.CommandLine).map((p) => ({ pid: p.ProcessId, seg: 0, cpu: 0, args: p.CommandLine }))); } catch { ok([]); } });
    execFile('ps', ['-eo', 'pid,etimes,pcpu,args', '--no-headers'], { maxBuffer: 4e6 }, (e, out) => {
      const analisa = (txt, comEt) => txt.split('\n').map((l) => { const m = comEt ? l.trim().match(/^(\d+)\s+(\d+)\s+([\d.]+)\s+(.*)$/) : l.trim().match(/^(\d+)\s+([\d.]+)\s+(.*)$/);
        return m ? (comEt ? { pid: +m[1], seg: +m[2], cpu: +m[3], args: m[4] } : { pid: +m[1], seg: 0, cpu: +m[2], args: m[3] }) : null; }).filter(Boolean);
      if (!e) return ok(analisa(out, true));
      execFile('ps', ['-eo', 'pid,pcpu,args'], { maxBuffer: 4e6 }, (e2, out2) => ok(e2 ? [] : analisa(out2, false))); // macOS não tem etimes
    });
  });
}
const REGEX_ROBO = /ao_vivo\.py|vod\.py|clipador\.py|achar\.py|ferramentas[\/]lives|whisper|streamlink|ffmpeg.*(seg_|\.ts|1080x1920|libx264)/;
async function processos() {
  const l = (await listaProcessos()).filter((p) => REGEX_ROBO.test(p.args) && !/ps -eo|servidor\.mjs|Get-CimInstance/.test(p.args));
  return l.slice(0, 14).map((p) => { const a = p.args; const tipo = /ao_vivo/.test(a) ? 'gravando+clipando' : /vod\.py/.test(a) ? 'cortando vídeo offline' : /clipador/.test(a) ? 'clipando' : /achar/.test(a) ? 'achando picos' : /whisper/.test(a) ? 'transcrevendo' : /ffmpeg/.test(a) ? 'ffmpeg' : 'outro';
    return { pid: p.pid, seg: p.seg, cpu: p.cpu, tipo, cmd: a.slice(0, 110).replace(/https?:\/\/\S+/g, (u) => u.slice(0, 40)) }; });
}
// gravações em andamento = processos ao_vivo.py de verdade (sobrevive a reinício do painel)
async function gravacoesAtivas() { return (await listaProcessos()).filter((p) => /(ao_vivo|vod)\.py/.test(p.args) && !/servidor\.mjs/.test(p.args)); }
function atividade() {
  const logs = ls(CLIPPER).filter((e) => e.isFile() && e.name.endsWith('.log')).map((e) => ({ f: path.join(CLIPPER, e.name), m: mtime(path.join(CLIPPER, e.name)), n: e.name })).sort((a, b) => b.m - a.m).slice(0, 2);
  const linhas = [];
  for (const l of logs) if (Date.now() - l.m < 20 * 60e3) { const t = lerTexto(l.f).split('\n').filter(Boolean).slice(-6); t.forEach((x) => linhas.push(`[${l.n.replace(/\.log$/, '')}] ${x.slice(0, 200)}`)); }
  const achados = lerTexto(path.join(LIVES, 'achados', 'achados.jsonl')).split('\n').filter(Boolean).slice(-6).map((l) => { try { const o = JSON.parse(l); return { canal: String(o.seg).split('/').slice(-2)[0].split('-')[0], score: o.score, pico: o.pico, texto: String(o.texto).slice(0, 140) }; } catch { return null; } }).filter(Boolean).reverse();
  return { log: linhas.slice(-10), picos: achados };
}

// vídeo com Range (preview no navegador)
function servirVideo(req, res, rel) {
  const f = path.resolve(RAIZ, rel);
  if (!f.startsWith(RAIZ + path.sep) || !f.endsWith('.mp4') || !fs.existsSync(f)) { res.writeHead(404); return res.end('nao'); }
  const { size } = fs.statSync(f); const r = req.headers.range;
  if (r) { const m = /bytes=(\d*)-(\d*)/.exec(r); const ini = m[1] ? +m[1] : 0; const fim = m[2] ? Math.min(+m[2], size - 1) : size - 1;
    res.writeHead(206, { 'Content-Range': `bytes ${ini}-${fim}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': fim - ini + 1, 'Content-Type': 'video/mp4' });
    return fs.createReadStream(f, { start: ini, end: fim }).pipe(res); }
  res.writeHead(200, { 'Content-Length': size, 'Content-Type': 'video/mp4', 'Accept-Ranges': 'bytes' }); fs.createReadStream(f).pipe(res);
}

// ---------- FILA DO META: aprovado vira post pendente com legenda do modelo e próximo horário livre ----------
const filaMeta = () => lerJson(FILA_META, []);
function proximoHorario(fila) {
  const hs = contas().meta.horarios.filter((h) => /^\d\d:\d\d$/.test(h)).sort(); if (!hs.length) return '';
  const usados = new Set(fila.map((f) => f.horario)); const d = new Date();
  for (let dia = 0; dia < 14; dia++) for (const h of hs) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + dia, +h.slice(0, 2), +h.slice(3)); const t = x.toISOString().slice(0, 16).replace('T', ' ');
    const loc = `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')} ${h}`; if (x > d && !usados.has(loc)) return loc; }
  return '';
}
function entrarNaFilaMeta(id) {
  const fila = filaMeta(); if (fila.some((f) => f.id === id)) return;
  const it = listarRevisao().itens.find((i) => i.id === id); if (!it) return;
  const streamer = (it.streamer || '').replace(/-/g, ' ');
  const legenda = contas().meta.legenda_modelo.replaceAll('{streamer}', streamer || 'streamer').replaceAll('{titulo}', it.titulo || '');
  const t = contas().tiktok; const ttx = t.ativo && it.tiktok_mp4 ? { arquivo_tiktok: it.tiktok_mp4, legenda_tiktok: t.legenda_modelo.replaceAll('{streamer}', streamer || 'streamer').replaceAll('{titulo}', it.titulo || '') } : {};
  fila.push({ id, clipe: it.titulo, arquivo: it.mp4, legenda, streamer, horario: proximoHorario(fila), status: 'pendente', criado: Date.now(), ...ttx });
  gravarJson(FILA_META, fila);
}
function tirarDaFilaMeta(id) { const f = filaMeta(); if (f.some((x) => x.id === id && x.status === 'pendente')) gravarJson(FILA_META, f.filter((x) => x.id !== id)); }

// ---------- placar por streamer (derivado da revisão) ----------
function placar() {
  const m = {}; for (const it of listarRevisao().itens) { const k = (it.streamer || '?').toLowerCase(); const o = (m[k] ||= { streamer: k, aprovado: 0, recusado: 0, revisao: 0, auto: 0 }); o[it.estado]++; if (it.estado === 'recusado' && it.auto) o.auto++; }
  return Object.values(m).map((o) => { const dec = o.aprovado + o.recusado; return { ...o, taxa: dec ? Math.round((o.aprovado / dec) * 100) : null, total: dec + o.revisao }; }).sort((a, b) => b.aprovado - a.aprovado || b.total - a.total);
}

// ---------- saúde do PC e do ambiente ----------
let cpuAnt = os.cpus(); let cpuPct = 0;
setInterval(() => { const a = os.cpus(); let idle = 0; let total = 0; a.forEach((c, i) => { for (const k in c.times) total += c.times[k] - cpuAnt[i].times[k]; idle += c.times.idle - cpuAnt[i].times.idle; }); cpuAnt = a; cpuPct = total ? Math.round(100 * (1 - idle / total)) : 0; }, 5000).unref();
function discoLivreGb() { try { const s = fs.statfsSync(RAIZ); return +((s.bavail * s.bsize) / 1e9).toFixed(0); } catch { return null; } }
function existeComando(cmd) { return new Promise((ok) => execFile(WIN ? 'where' : 'which', [cmd], (e) => ok(!e))); }
async function saude() {
  const cpus = os.cpus().length;
  const checks = { node: true, python_venv: fs.existsSync(PY), ffmpeg: await existeComando('ffmpeg'), 'yt-dlp': fs.existsSync(path.join(CLIPPER, 'ambiente', WIN ? 'Scripts' : 'bin', WIN ? 'yt-dlp.exe' : 'yt-dlp')) || await existeComando('yt-dlp'),
    identidade: fs.existsSync(path.join(RAIZ, 'marca', 'identidade.json')), logo: fs.existsSync(path.join(RAIZ, 'marca', 'logo.png')), contas: fs.existsSync(path.join(CONFIG, 'contas.json')) };
  const c = contas();
  return { checks, pc: { nucleos: cpus, carga: cpuPct, disco_livre_gb: discoLivreGb(), ram_livre_gb: +(os.freemem() / 1e9).toFixed(1), ram_total_gb: +(os.totalmem() / 1e9).toFixed(1), so: `${os.platform()} ${os.release()}` },
    contas_preenchidas: !!(c.meta.pagina && c.meta.instagram) };
}

// ---------- META (Instagram/Facebook) ----------
function csv(txt) { // CSV simples com aspas
  const linhas = []; let cur = []; let c = ''; let q = false;
  for (let i = 0; i < txt.length; i++) { const ch = txt[i];
    if (q) { if (ch === '"' && txt[i + 1] === '"') { c += '"'; i++; } else if (ch === '"') q = false; else c += ch; }
    else if (ch === '"') q = true; else if (ch === ',') { cur.push(c); c = ''; } else if (ch === '\n') { cur.push(c); linhas.push(cur); cur = []; c = ''; } else if (ch !== '\r') c += ch; }
  if (c || cur.length) { cur.push(c); linhas.push(cur); }
  return linhas;
}
function metaFila() {
  const l = csv(lerTexto(path.join(LIVES, 'FILA-AGENDAR.csv'))); const [cab, ...resto] = l; if (!cab) return [];
  return resto.filter((r) => r.length >= cab.length).map((r) => Object.fromEntries(cab.map((k, i) => [k, r[i]])))
    .filter((o) => (contas().tiktok.ativo ? /instagram|facebook|tiktok/i : /instagram|facebook/i).test(o.plataforma)); // TikTok só aparece se estiver ligado em Contas
}

// ---------- gravar + clipar (botão) ----------
// ---------- cortar por link (Twitch, Kick, YouTube; ao vivo ou offline) ----------
const LINK_RE = /^https:\/\/((www|m)\.)?(twitch\.tv|kick\.com|youtube\.com|youtu\.be|clips\.twitch\.tv)\//i;
const plataformaDoLink = (u) => (/twitch\.tv/i.test(u) ? 'twitch' : /kick\.com/i.test(u) ? 'kick' : /youtube\.com|youtu\.be/i.test(u) ? 'youtube' : null);
const YTDLP = () => { const f = path.join(CLIPPER, 'ambiente', WIN ? 'Scripts' : 'bin', WIN ? 'yt-dlp.exe' : 'yt-dlp'); return fs.existsSync(f) ? [f] : ['yt-dlp']; };
const _det = new Map();
function detectarLink(url) {
  return new Promise((ok) => {
    url = String(url || '').trim();
    if (!LINK_RE.test(url)) return ok({ ok: false, erro: 'Link não suportado. Por enquanto só Twitch, Kick e YouTube (https://…).' });
    const c = _det.get(url); if (c && Date.now() - c.t < 300000) return ok(c.v);
    const [cmd, ...pre] = YTDLP();
    execFile(cmd, [...pre, '-J', '--no-playlist', '--no-warnings', url], { maxBuffer: 5e7, timeout: 70000 }, (e, out, err) => {
      let v;
      if (e) { const t = String(err || e.message); v = { ok: false, erro: /offline|not currently live|is offline/i.test(t) ? 'Esse canal está offline agora. Cole o link de um vídeo/replay, ou espere ele entrar ao vivo.' : /ENOENT/.test(t) ? 'yt-dlp não encontrado: rode o instalador.' : 'Não consegui ler esse link: ' + (t.trim().split('\n').pop() || '').slice(0, 160) }; }
      else { try { const j = JSON.parse(out); const vivo = j.live_status === 'is_live';
        v = { ok: true, plataforma: plataformaDoLink(url), modo: vivo ? 'ao_vivo' : 'offline', titulo: j.title || '', canal: j.uploader || j.channel || '', duracao_s: vivo ? null : (j.duration || null), thumb: j.thumbnail || '', url }; }
        catch { v = { ok: false, erro: 'Resposta inesperada do yt-dlp.' }; } }
      if (v.ok) _det.set(url, { t: Date.now(), v }); ok(v);
    });
  });
}
async function iniciarTrabalho(url, opts = {}) {
  const d = await detectarLink(url); if (!d.ok) return [400, { erro: d.erro }];
  if (!fs.existsSync(PY)) return [500, { erro: 'ambiente Python não encontrado: rode o instalador (instalar.sh / instalar.ps1)' }];
  const ativas = await gravacoesAtivas();
  if (ativas.some((p) => p.args.includes(url))) return [200, { ok: true, ja: true, modo: d.modo }];
  if (ativas.length >= 2) return [409, { erro: 'já tem 2 trabalhos rodando (limite do PC: 4 núcleos, 8 GB)' }];
  const nome = url.replace(/[^a-z0-9]+/gi, '_').slice(-40);
  const log = fs.openSync(path.join(CLIPPER, `painel_${nome}.log`), 'a');
  const num = (v, pad) => (Number.isFinite(+v) && +v >= 0 ? String(Math.floor(+v)) : String(pad));
  const args = d.modo === 'ao_vivo' ? [path.join(RAIZ, 'ferramentas', 'lives', 'ao_vivo.py'), url, '--seg', '300', '--max', '1', '--sempre-melhor']
    : [path.join(RAIZ, 'ferramentas', 'lives', 'vod.py'), url, '--inicio', num(opts.inicio, 0), ...(opts.fim != null && opts.fim !== '' ? ['--fim', num(opts.fim, 60)] : []), '--max', '1', '--sempre-melhor'];
  const p = spawn(PY, args, { cwd: RAIZ, detached: true, stdio: ['ignore', log, log] }); p.unref();
  return [200, { ok: true, pid: p.pid, modo: d.modo }];
}

// ---------- trabalhos em andamento (listar / parar) ----------
async function trabalhos() {
  const l = (await gravacoesAtivas());
  return l.map((p) => { const url = (p.args.match(/https?:\/\/\S+/) || [''])[0]; const modo = /vod\.py/.test(p.args) ? 'offline' : 'ao_vivo';
    const nome = url.replace(/[^a-z0-9]+/gi, '_').slice(-40); const logf = path.join(CLIPPER, `painel_${nome}.log`);
    const linhas = lerTexto(logf).split('\n').filter(Boolean).slice(-4).map((x) => x.slice(0, 180));
    return { pid: p.pid, modo, url, seg: p.seg, cpu: p.cpu, log: linhas }; });
}
async function pararTrabalho(pid) {
  const t = (await trabalhos()).find((x) => x.pid === pid); if (!t) return [404, { erro: 'esse trabalho não está rodando (ou não é do painel)' }];
  try {
    if (WIN) await new Promise((ok) => execFile('taskkill', ['/pid', String(pid), '/T', '/F'], () => ok()));
    else { try { process.kill(-pid, 'SIGTERM'); } catch { process.kill(pid, 'SIGTERM'); } } // detached = líder de grupo: leva o ffmpeg junto
  } catch (e) { return [500, { erro: String(e.message || e) }]; }
  return [200, { ok: true }];
}

// ---------- desempenho (perfil do robô: qualidade / equilibrado / leve) ----------
const PERFIS_DESC = { qualidade: 'PC forte (8+ núcleos, 12+ GB): analisa mais picos, realce de imagem, encode mais caprichado.', equilibrado: 'PC médio (4 núcleos, 6+ GB): configuração padrão validada.', leve: 'PC fraco (até 2 núcleos ou pouca RAM): menos picos e janelas menores, sem realce de imagem, encode mais rápido (arquivo maior).' };
const perfilAuto = () => { const n = os.cpus().length; const ram = os.totalmem() / 1e9; return n >= 8 && ram >= 12 ? 'qualidade' : n >= 4 && ram >= 6 ? 'equilibrado' : 'leve'; };
function desempenho() { const p = lerJson(path.join(CONFIG, 'desempenho.json'), {}).perfil; const escolhido = ['auto', ...Object.keys(PERFIS_DESC)].includes(p) ? p : 'auto'; const efetivo = escolhido === 'auto' ? perfilAuto() : escolhido;
  return { escolhido, efetivo, nucleos: os.cpus().length, ram_gb: +(os.totalmem() / 1e9).toFixed(1), descricao: PERFIS_DESC[efetivo], opcoes: PERFIS_DESC }; }

// ---------- marca (logo, capa e @ que aparecem no vídeo) ----------
const MARCA = path.join(RAIZ, 'marca');
const identidade = () => lerJson(path.join(MARCA, 'identidade.json'), lerJson(path.join(MARCA, 'identidade.example.json'), { nick: '', logo: 'marca/logo.png', capa: 'marca/capa.png' }));
function corpoBruto(req, max = 4e6) { return new Promise((ok, no) => { const p = []; let n = 0; req.on('data', (c) => { n += c.length; if (n > max) { no(new Error('arquivo grande demais (máx 4 MB)')); req.destroy(); } else p.push(c); }); req.on('end', () => ok(Buffer.concat(p))); req.on('error', no); }); }
function tipoImagem(b) { if (b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png'; if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg'; if (b.length > 12 && b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP') return 'webp'; return null; }
function servirMarca(res, tipo) {
  const id = identidade(); const rel = tipo === 'capa' ? id.capa : id.logo; const f = path.resolve(RAIZ, rel || '');
  if (!f.startsWith(MARCA + path.sep) || !fs.existsSync(f)) { res.writeHead(404); return res.end('nao'); }
  const ext = path.extname(f).slice(1).toLowerCase(); res.writeHead(200, { 'Content-Type': ext === 'jpg' ? 'image/jpeg' : `image/${ext}`, 'Cache-Control': 'no-store' }); fs.createReadStream(f).pipe(res);
}

// ---------- servidor ----------
const HTML = path.join(AQUI, 'index.html');
http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  // anti-CSRF / DNS rebinding: só aceita Host e Origin do próprio painel (um site aberto no navegador não consegue mandar POST aqui)
  const hostsOk = [`127.0.0.1:${PORTA}`, `localhost:${PORTA}`]; const origem = req.headers.origin;
  if (!hostsOk.includes(req.headers.host || '') || (origem && !hostsOk.map((h) => `http://${h}`).includes(origem))) { res.writeHead(403, { 'Content-Type': 'text/plain' }); return res.end('origem não permitida'); }
  try {
    if (u.pathname === '/') { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); return res.end(fs.readFileSync(HTML)); }
    if (u.pathname === '/api/ao-vivo') return json(res, 200, await aoVivo(u.searchParams.get('forcar') === '1'));
    if (u.pathname === '/api/revisao') { const r = listarRevisao(); return json(res, 200, { ...r, agora: Date.now(), processos: await processos(), ...atividade() }); }
    if (u.pathname === '/api/meta' && req.method === 'GET') { const c = contas().meta; return json(res, 200, { tiktok: contas().tiktok.ativo, fila: filaMeta(), legado: metaFila(), conta: { pagina: c.pagina, instagram: c.instagram, business_suite: c.business_suite }, horarios: c.horarios }); }
    if (u.pathname === '/api/meta/status' && req.method === 'POST') { const b = await corpo(req); const f = filaMeta(); const x = f.find((y) => y.id === b.id); if (!x) return json(res, 404, { erro: 'não está na fila' });
      if (!['pendente', 'agendado', 'postado'].includes(b.status)) return json(res, 400, { erro: 'status' }); x.status = b.status; if (typeof b.horario === 'string') x.horario = b.horario.slice(0, 16); gravarJson(FILA_META, f); return json(res, 200, { ok: true }); }
    if (u.pathname === '/api/ajuda') { res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end(lerTexto(path.join(RAIZ, 'AGENTS.md'))); }
    if (u.pathname === '/api/desempenho' && req.method === 'GET') return json(res, 200, desempenho());
    if (u.pathname === '/api/desempenho' && req.method === 'POST') { const b = await corpo(req); if (!['auto', ...Object.keys(PERFIS_DESC)].includes(b.perfil)) return json(res, 400, { erro: 'perfil' }); gravarJson(path.join(CONFIG, 'desempenho.json'), { perfil: b.perfil }); return json(res, 200, desempenho()); }
    if (u.pathname === '/api/trabalhos' && req.method === 'GET') return json(res, 200, await trabalhos());
    if (u.pathname === '/api/trabalhos/parar' && req.method === 'POST') { const b = await corpo(req); const [c, o] = await pararTrabalho(Number(b.pid)); return json(res, c, o); }
    if (u.pathname === '/api/marca' && req.method === 'GET') { const id = identidade(); return json(res, 200, { nick: id.nick || '', tem_logo: fs.existsSync(path.resolve(RAIZ, id.logo || 'x')), tem_capa: fs.existsSync(path.resolve(RAIZ, id.capa || 'x')) }); }
    if (u.pathname === '/api/marca' && req.method === 'POST') { const b = await corpo(req); const f = path.join(MARCA, 'identidade.json'); const id = identidade(); id.nick = String(b.nick ?? '').replace(/^@/, '').replace(/[^\w.]/g, '').slice(0, 40); id.confirmado = true; gravarJson(f, id); return json(res, 200, { ok: true, nick: id.nick }); }
    if (u.pathname === '/api/marca/arquivo' && req.method === 'POST') {
      const tipo = u.searchParams.get('tipo'); if (!['logo', 'capa'].includes(tipo)) return json(res, 400, { erro: 'tipo' });
      let buf; try { buf = await corpoBruto(req); } catch (e) { return json(res, 413, { erro: String(e.message) }); }
      const ext = tipoImagem(buf); if (!ext) return json(res, 400, { erro: 'envie uma imagem PNG, JPG ou WEBP' });
      fs.mkdirSync(MARCA, { recursive: true }); const rel = `marca/${tipo}.${ext}`; fs.writeFileSync(path.join(RAIZ, rel), buf);
      const id = identidade(); id[tipo] = rel; gravarJson(path.join(MARCA, 'identidade.json'), id); return json(res, 200, { ok: true, arquivo: rel });
    }
    if (u.pathname === '/marca/logo' || u.pathname === '/marca/capa') return servirMarca(res, u.pathname.endsWith('capa') ? 'capa' : 'logo');
    if (u.pathname === '/api/placar') return json(res, 200, placar());
    if (u.pathname === '/api/saude') return json(res, 200, await saude());
    if (u.pathname === '/api/contas' && req.method === 'GET') return json(res, 200, contas());
    if (u.pathname === '/api/contas' && req.method === 'POST') { const b = await corpo(req); const m = b.meta || {}; const txt = (v, n = 200) => String(v ?? '').slice(0, n);
      const novo = { dono: txt(b.dono, 80), meta: { pagina: txt(m.pagina, 120), instagram: txt(m.instagram, 60).replace(/^@/, ''), business_suite: /^https:\/\//.test(m.business_suite) ? txt(m.business_suite, 300) : CONTAS_PAD.meta.business_suite,
        legenda_modelo: txt(m.legenda_modelo, 400), horarios: (Array.isArray(m.horarios) ? m.horarios : []).filter((h) => /^\d\d:\d\d$/.test(h)).slice(0, 8) }, tiktok: { ativo: !!b.tiktok?.ativo, legenda_modelo: txt(b.tiktok?.legenda_modelo, 400) || CONTAS_PAD.tiktok.legenda_modelo } };
      gravarJson(path.join(CONFIG, 'contas.json'), novo);
      if (b.nick) { const f = path.join(RAIZ, 'marca', 'identidade.json'); const id = lerJson(f, lerJson(path.join(RAIZ, 'marca', 'identidade.example.json'), {})); id.nick = txt(b.nick, 40).replace(/^@/, ''); id.confirmado = true; gravarJson(f, id); }
      return json(res, 200, { ok: true }); }
    if (u.pathname === '/api/streamers' && req.method === 'GET') return json(res, 200, streamersCfg());
    if (u.pathname === '/api/streamers' && req.method === 'POST') { const b = await corpo(req); const c = streamersCfg(); const n = String(b.canal || '').toLowerCase().replace(/[^a-z0-9_ .-]/g, '').slice(0, 40); if (!n) return json(res, 400, { erro: 'canal' });
      c.favoritos = c.favoritos.includes(n) ? c.favoritos.filter((x) => x !== n) : [...c.favoritos, n]; if (typeof b.alertar === 'boolean') c.alertar_ao_entrar = b.alertar; gravarJson(path.join(CONFIG, 'streamers.json'), c); cacheLive.t = 0; return json(res, 200, c); }
    if (u.pathname === '/video') return servirVideo(req, res, deb64(u.searchParams.get('id') || ''));
    if (u.pathname === '/api/decidir' && req.method === 'POST') {
      const b = await corpo(req);
      if (typeof b.id !== 'string') return json(res, 400, { erro: 'id' });
      if (b.estado === 'desfazer') { salvarDecisao(b.id, null); tirarDaFilaMeta(b.id); return json(res, 200, { ok: true }); }
      if (!['aprovado', 'recusado'].includes(b.estado)) return json(res, 400, { erro: 'estado' });
      salvarDecisao(b.id, { estado: b.estado, motivo: String(b.motivo || '').slice(0, 200), ts: Date.now() });
      if (b.estado === 'aprovado') entrarNaFilaMeta(b.id); else tirarDaFilaMeta(b.id);
      return json(res, 200, { ok: true });
    }
    if (u.pathname === '/api/gravar' && req.method === 'POST') { const b = await corpo(req); const [c, o] = await iniciarTrabalho(String(b.url || '')); return json(res, c, o); }
    if (u.pathname === '/api/link/detectar' && req.method === 'POST') { const b = await corpo(req); return json(res, 200, await detectarLink(b.url)); }
    if (u.pathname === '/api/link/cortar' && req.method === 'POST') { const b = await corpo(req); const [c, o] = await iniciarTrabalho(String(b.url || '').trim(), { inicio: b.inicio, fim: b.fim }); return json(res, c, o); }
    res.writeHead(404); res.end('nao');
  } catch (e) { json(res, 500, { erro: String(e.message || e) }); }
}).listen(PORTA, '127.0.0.1', () => {
  console.log(`painel GTA 6 em http://127.0.0.1:${PORTA} (pid ${process.pid})`);
  const varrer = () => aoVivo(true).catch(() => {}); setTimeout(varrer, 2000); setInterval(varrer, 60000); // amostra viewers sozinho: o radar de calor funciona com a aba fechada
});
