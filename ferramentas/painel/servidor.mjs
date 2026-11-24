// Painel WR multi-conta. Porta 7777. Sem dependências (Node puro).
// Abas: Ao vivo (Twitch/Kick/YouTube), Revisão (fila/aprovados/recusados em tempo real), Meta (IG/FB), Features.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFile, spawn } from 'node:child_process';
import os from 'node:os';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = process.env.PAINEL_RAIZ_DADOS ? path.resolve(process.env.PAINEL_RAIZ_DADOS) : path.resolve(AQUI, '..', '..');
const DADOS = process.env.PAINEL_RAIZ_DADOS ? path.join(RAIZ, 'painel-dados') : path.join(AQUI, 'dados');
const LIVES = path.join(RAIZ, 'projetos', 'lives');
const CLIPPER = path.join(LIVES, 'clipper');
const PRONTOS = path.join(RAIZ, 'prontos', 'Gta 6');
const ESTADO = path.join(RAIZ, '_estado');
const DECISOES = path.join(DADOS, 'decisoes.json');
const CONFIG = path.join(RAIZ, 'config');
const HIST = path.join(ESTADO, 'historico-viewers.json');
const FILA_META = path.join(ESTADO, 'fila-meta.json');
const WIN = process.platform === 'win32';
const PY = path.join(CLIPPER, 'ambiente', WIN ? 'Scripts' : 'bin', WIN ? 'python.exe' : 'python');
const PORTA = Number(process.env.PORTA_PAINEL || 7777);
const ESPELHO = process.env.PAINEL_ESPELHO === '1'; // celular: só leitura, quem decide é o PC
// config de quem usa: contas.json (dados da página, legenda, horários) e streamers.json (favoritos). Sem senhas.
const CONTAS_PAD = { dono: '', meta: { pagina: '', instagram: '', business_suite: 'https://business.facebook.com/latest/home', legenda_modelo: 'Olha o que rolou na live do {streamer} no GTA 6 😳 #gta6 #gtavi #gta #cortes #streamer', horarios: ['12:00', '15:00', '19:00', '21:30'] }, tiktok: { ativo: false, legenda_modelo: 'Olha o que rolou na live do {streamer} no GTA 6 😳 #gta6 #gtavi #fyp' } };
const contas = () => { const c = contasCfg().find(c=>c.id==='six_stars') || contasCfg()[0]; return {...CONTAS_PAD, meta:{...CONTAS_PAD.meta, pagina:c?.nome||'', instagram:c?.plataformas.find(p=>p.rede==='instagram')?.handle||'', legenda_modelo:c?.legenda_modelo||'',horarios:c?.horarios||[]},tiktok:{...CONTAS_PAD.tiktok,ativo:!!c?.plataformas.find(p=>p.rede==='tiktok')?.ligado}}; };
const streamersCfg = () => ({ favoritos: [], alertar_ao_entrar: true, ...lerJson(path.join(CONFIG, 'streamers.json'), {}) });
function gravarJson(f, obj) { if (!f.startsWith(DADOS + path.sep) && f !== path.join(CONFIG,'contas.json')) throw new Error('Gravação fora do escopo do painel bloqueada'); fs.mkdirSync(path.dirname(f), { recursive: true }); const t = f + '.tmp'; fs.writeFileSync(t, JSON.stringify(obj, null, 2)); fs.renameSync(t, f); }
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
const corpo = (req) => new Promise((ok, no) => { let b = ''; req.on('data', (c) => { b += c; if (b.length > 1e5) { no(new Error('grande')); req.destroy(); } }); req.on('end', () => { try { const valor=b ? JSON.parse(b) : {}; if(!valor || typeof valor!=='object' || Array.isArray(valor)) throw new SyntaxError('Envie um objeto JSON'); ok(valor); } catch (e) { no(e); } }); });
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
const decisoes = () => ({...lerJson(path.join(ESTADO,'painel-decisoes.json'),{}),...lerJson(DECISOES,{})});
function salvarDecisao(id, d) {
  _rv.t = 0; const todas = decisoes(); if (d === null) todas[id] = null; else todas[id] = d;
  fs.mkdirSync(DADOS, { recursive: true });
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
const REGEX_ROBO = /render\.mjs|hyperframes.*render|ao_vivo\.py|vod\.py|clipador\.py|achar\.py|ferramentas[\/]lives|whisper|streamlink|ffmpeg.*(seg_|\.ts|1080x1920|libx264)/;
async function processos() {
  const l = (await listaProcessos()).filter((p) => REGEX_ROBO.test(p.args) && !/ps -eo|servidor\.mjs|Get-CimInstance|^\/?(usr\/)?(bin\/)?(ba|z)?sh -c /.test(p.args));
  return l.slice(0, 14).map((p) => { const a = p.args; const tipo = /render\.mjs|hyperframes.*render/.test(a) ? 'render' : /ao_vivo/.test(a) ? 'gravando+clipando' : /vod\.py/.test(a) ? 'cortando vídeo offline' : /clipador/.test(a) ? 'clipando' : /achar/.test(a) ? 'achando picos' : /whisper/.test(a) ? 'transcrevendo' : /ffmpeg/.test(a) ? 'ffmpeg' : 'outro';
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
  const f=path.resolve(RAIZ,rel);
  let real;try{real=fs.realpathSync(f);}catch{res.writeHead(404);return res.end('Vídeo não encontrado');}
  if(!real.startsWith(fs.realpathSync(RAIZ)+path.sep)||! /\.mp4$/i.test(real)||!fs.statSync(real).isFile()){res.writeHead(404);return res.end('Vídeo não encontrado');}
  const {size}=fs.statSync(real),range=req.headers.range;
  const invalido=()=>{res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();};
  if(range){const m=/^bytes=(\d*)-(\d*)$/.exec(range);if(!m||(!m[1]&&!m[2])||!size)return invalido();
    let ini=m[1]?Number(m[1]):Math.max(0,size-Number(m[2])),fim=m[1]?(m[2]?Math.min(Number(m[2]),size-1):size-1):size-1;
    if(!Number.isSafeInteger(ini)||!Number.isSafeInteger(fim)||ini>fim||ini>=size||ini<0)return invalido();
    res.writeHead(206,{'Content-Range':`bytes ${ini}-${fim}/${size}`,'Accept-Ranges':'bytes','Content-Length':fim-ini+1,'Content-Type':'video/mp4'});
    const stream=fs.createReadStream(real,{start:ini,end:fim});stream.on('error',()=>res.destroy());return stream.pipe(res);
  }
  res.writeHead(200,{'Content-Length':size,'Content-Type':'video/mp4','Accept-Ranges':'bytes'});const stream=fs.createReadStream(real);stream.on('error',()=>res.destroy());stream.pipe(res);
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
  return { checks, chaves: chaves(), bots: statusBots(), pc: { nucleos: cpus, carga: cpuPct, disco_livre_gb: discoLivreGb(), gpus: gpus(), ram_livre_gb: +(os.freemem() / 1e9).toFixed(1), ram_total_gb: +(os.totalmem() / 1e9).toFixed(1), so: `${os.platform()} ${os.release()}` },
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
  if (ESPELHO) return [403, { erro: 'Espelho do celular: só leitura. Inicie pelo PC.' }];
  if (!LINK_RE.test(url) || !/^[A-Za-z0-9:\/._~%?&=#+@,-]+$/.test(url) || url.length > 300) return [400, { erro: 'URL inválida (só Twitch, Kick ou YouTube em https, sem espaços)' }];
  const d = await detectarLink(url); if (!d.ok) return [400, { erro: d.erro }];
  if (!fs.existsSync(PY)) return [500, { erro: 'ambiente Python do clipador não encontrado neste PC' }];
  const ativas = await gravacoesAtivas();
  if (ativas.some((p) => p.args.includes(url))) return [200, { ok: true, ja: true, modo: d.modo }];
  if (ativas.length >= 1) return [409, { erro: 'Já tem um trabalho rodando. Um por vez, para não travar o PC (8 GB).' }];
  const nome = url.replace(/[^a-z0-9]+/gi, '_').slice(-40);
  const log = fs.openSync(path.join(CLIPPER, `painel_${nome}.log`), 'a');
  const num = (x, pad) => (Number.isFinite(+x) && +x >= 0 ? Math.floor(+x) : pad);
  let args;
  if (d.modo === 'ao_vivo') args = [path.join(RAIZ, 'ferramentas', 'lives', 'ao_vivo.py'), url, '--seg', '300', '--max', '1', '--sempre-melhor'];
  else {
    const ini = num(opts.inicio, 0); const fim = opts.fim != null && opts.fim !== '' ? Math.max(ini + 1, num(opts.fim, ini + 60)) : ini + 60;
    const quer = Math.min(10, Math.max(1, Math.floor(+opts.quantos) || 1));
    const janela = Math.max(10, Math.ceil((fim - ini) / quer)); // ~1 clipe por janela => perto da quantidade pedida
    args = [path.join(RAIZ, 'ferramentas', 'lives', 'vod.py'), url, '--inicio', String(ini), '--fim', String(fim), '--janela', String(janela), '--max', '1', '--sempre-melhor'];
  }
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

// Dados novos ficam sob o painel enquanto a exceção para legendas/referências não for autorizada.
const SEMENTES = [
  {id:'six_stars',nome:'Six Stars',nicho:'GTA 6',plataformas:[{rede:'instagram',handle:'six_starsbr',ligado:true,modo:'manual'},{rede:'facebook',handle:'six_starsbr',ligado:true,modo:'manual'},{rede:'tiktok',handle:'wrx00_',ligado:false,modo:'manual'}],pasta_saida:'prontos/Gta 6',legenda_modelo:'{titulo} #gta6 #gtavi',horarios:['12:00','15:00','19:00','21:30'],tipo_producao:'cortes',filtro_acabamento:true},
  {id:'aventuras_do_tiao',nome:'Aventuras do Tião',nicho:'Tião',plataformas:[{rede:'youtube',handle:'aventurasdotiao',ligado:true,modo:'manual'},{rede:'tiktok',handle:'aventurasdotião',ligado:true,modo:'manual'}],pasta_saida:'prontos/3D/Aventuras do Tião',legenda_modelo:'{titulo} #aventurasdotiao',horarios:['12:00','19:00'],tipo_producao:'bonecos',filtro_acabamento:true}
];
const contasCfg = () => {const v=lerJson(path.join(CONFIG,'contas.json'),SEMENTES);return Array.isArray(v)?v:SEMENTES;};
function erro(status,msg){throw Object.assign(new Error(msg),{status});}
function acharConta(id){const c=contasCfg().find(c=>c.id===id);if(!c)erro(404,'Conta não encontrada');return c;}
const contaDaUrl=u=>acharConta(u.searchParams.get('conta')||'six_stars');
function pastaConta(c){const rel=String(c.pasta_saida||'');const f=path.resolve(RAIZ,rel);const base=path.join(RAIZ,'prontos');if(!f.startsWith(base+path.sep))erro(400,'Pasta deve estar dentro de prontos/');
  let atual=RAIZ;for(const parte of path.relative(RAIZ,f).split(path.sep)){atual=path.join(atual,parte);if(fs.existsSync(atual)&&fs.lstatSync(atual).isSymbolicLink())erro(400,'Pasta com link simbólico não permitida');}return f;}
function validarConta(c){
  if(!c||! /^[a-z0-9_]{1,60}$/.test(c.id||'')||typeof c.nome!=='string'||!c.nome.trim()||c.nome.length>100||typeof c.nicho!=='string'||!c.nicho.trim()||c.nicho.length>100)erro(400,'ID, nome e nicho obrigatórios');
  pastaConta(c);
  if(!Array.isArray(c.plataformas)||c.plataformas.length>8||c.plataformas.some(p=>!['instagram','facebook','tiktok','youtube'].includes(p.rede)||!['manual','chrome','api'].includes(p.modo)||typeof p.handle!=='string'||p.handle.length>100||typeof p.ligado!=='boolean'))erro(400,'Plataformas inválidas');
  if(new Set(c.plataformas.map(p=>p.rede)).size!==c.plataformas.length)erro(400,'Rede duplicada');
  if(!Array.isArray(c.horarios)||c.horarios.length>24||c.horarios.some(h=>! /^([01]\d|2[0-3]):[0-5]\d$/.test(h)))erro(400,'Horários inválidos');
  if(typeof c.legenda_modelo!=='string'||c.legenda_modelo.length>5000||typeof c.tipo_producao!=='string'||c.tipo_producao.length>100||typeof c.filtro_acabamento!=='boolean')erro(400,'Modelo, tipo ou filtro inválido');
  return {id:c.id,nome:c.nome.trim(),nicho:c.nicho.trim(),plataformas:c.plataformas.map(({rede,handle,ligado,modo})=>({rede,handle,ligado,modo})),pasta_saida:path.relative(RAIZ,pastaConta(c)),legenda_modelo:c.legenda_modelo,horarios:c.horarios,tipo_producao:c.tipo_producao,filtro_acabamento:c.filtro_acabamento};
}
const LEGENDAS=path.join(DADOS,'legendas.json');
const REFERENCIAS=path.join(DADOS,'_fila_painel.jsonl');
function listarReferencias(conta) {
  const itens = [];
  for (const linha of lerTexto(REFERENCIAS).split('\n')) {
    if (!linha.trim()) continue;
    try {
      const item = JSON.parse(linha);
      if (item?.conta === conta) itens.push(item);
    } catch { /* Uma linha incompleta não impede a leitura das anteriores. */ }
  }
  return itens.reverse();
}
function revisaoConta(c){
  const base=pastaConta(c), mapa=new Map();
  // Reaproveita a revisão de lives apenas para a conta GTA.
  if(c.id==='six_stars')for(const i of listarRevisao().itens)mapa.set(i.id,{...i,conta:c.id});
  function andar(dir,n=0){if(n>12)return;for(const e of ls(dir)){const f=path.join(dir,e.name);if(e.isDirectory())andar(f,n+1);else if(e.isFile()&&/\.mp4$/i.test(e.name)){
    const mp4=path.relative(RAIZ,f),id=b64(mp4),titulo=e.name.replace(/\.mp4$/i,'').replace(/[-_]/g,' ');
    const reprovado = c.tipo_producao === 'bonecos' && /(?:não|nao)[-_ ]aprovado[-_ ]pelo[-_ ]revisor/i.test(e.name);
    if(!mapa.has(id))mapa.set(id,{id,id_texto:mp4,mp4,titulo,conta:c.id,streamer:c.nome,criado:mtime(f),estado:reprovado?'recusado':'revisao',...(reprovado?{motivo:'Marcado como reprovado pelo revisor'}:{}),origem:'prontos',legenda:lerTexto(f.replace(/\.mp4$/i,'.txt')).trim()||c.legenda_modelo.replaceAll('{titulo}',titulo).replaceAll('{streamer}',c.nome)});
  }}}andar(base);
  const dec=decisoes(),legs=lerJson(LEGENDAS,{});
  const itens=[...mapa.values()].map(i=>{const d=dec[i.id];return {...i,...(d?{estado:d.estado,motivo:d.motivo,decidido_em:d.ts}:{}),legenda:legs[i.id]?.legenda??d?.legenda??i.legenda??''};}).sort((a,b)=>b.criado-a.criado);
  return {itens,contagem:Object.fromEntries(['revisao','aprovado','recusado'].map(k=>[k,itens.filter(i=>i.estado===k).length]))};
}
function placarConta(c){const r=revisaoConta(c);const dec=r.contagem.aprovado+r.contagem.recusado;return [{conta:c.id,streamer:c.nome,...r.contagem,auto:0,total:r.itens.length,taxa:dec?Math.round(r.contagem.aprovado/dec*100):null}];}
const diaSP=t=>new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo'}).format(new Date(t));
function calendario(c){const itens=revisaoConta(c).itens.filter(i=>c.tipo_producao!=='bonecos'||i.estado!=='recusado'), hoje=diaSP(Date.now()),min=c.id==='aventuras_do_tiao'?2:c.id==='six_stars'?3:1,max=c.id==='six_stars'?4:min;
  const dias={};for(const i of itens){const dia=diaSP(i.criado);dias[dia]=(dias[dia]||0)+1;}return {conta:c.id,hoje,meta_min:min,meta_max:max,produzidos_hoje:dias[hoje]||0,faltam:Math.max(0,min-(dias[hoje]||0)),horarios:c.horarios,dias};}
function gpus(){return ls('/sys/class/drm').filter(e=>/^card\d+$/.test(e.name)).map(e=>{const base=path.join('/sys/class/drm',e.name,'device');const num=n=>{const t=lerTexto(path.join(base,n)).trim();return t&&Number.isFinite(+t)?+t:null;};return {nome:e.name,uso_percent:num('gpu_busy_percent'),vram_usada_bytes:num('mem_info_vram_used'),vram_total_bytes:num('mem_info_vram_total')};});}
function chaves(){const texto=lerTexto(path.join(RAIZ,'.env'));return Array.from({length:5},(_,i)=>{const nome=`GEMINI_API_KEY_${i+1}`,m=texto.match(new RegExp(`^\\s*(?:export\\s+)?${nome}\\s*=\\s*(.*)$`,'m'));const valor=String(process.env[nome]||m?.[1]||'').trim().replace(/^(['"])(.*?)\1(?:\s*#.*)?$/,'$2').replace(/\s+#.*$/,'');return {nome,existe:!!valor,formato_valido:/^AIza[\w-]{35}$/.test(valor),validade:'não consultada (sem chamada de IA)'};});}
let cacheBots={t:0,v:[]};
function statusBots(){if(Date.now()-cacheBots.t<30000)return cacheBots.v;
  const arquivos=[];const visitar=(dir,n=0)=>{if(n>2)return;for(const e of ls(dir)){if(e.name.startsWith('.')||['node_modules','ambiente'].includes(e.name))continue;const f=path.join(dir,e.name);if(e.isDirectory())visitar(f,n+1);else if(e.isFile()&&/\.(log|lock)$/.test(e.name))arquivos.push({f,nome:e.name,ts:mtime(f)});}};visitar(ESTADO);visitar(path.join(RAIZ,'ferramentas'));
  const v=Object.entries({olheiro:/olheiro|ronda/,clipador:/clipador|clipper/,ao_vivo:/ao[_-]vivo/,render:/render/}).map(([bot,re])=>{const a=arquivos.filter(a=>re.test(a.nome)).sort((a,b)=>b.ts-a.ts)[0];return {bot,ativo:!!a&&Date.now()-a.ts<120000,ultimo_sinal:a?.ts||null,criterio:'log/lock atualizado nos últimos 2 min; sinal de atividade, não prova de processo vivo'};});cacheBots={t:Date.now(),v};return v;
}
const rede={ligado:false,hash:null,salt:null,ip:null};let servidorLAN=null;
function ipsLAN(){return [...new Set(Object.values(os.networkInterfaces()).flat().filter(i=>i&&i.family==='IPv4'&&!i.internal).map(i=>i.address))];}
function autenticado(req){try{const a=String(req.headers.authorization||'');if(!a.startsWith('Basic '))return false;const txt=Buffer.from(a.slice(6),'base64').toString();const senha=txt.slice(txt.indexOf(':')+1);const hash=crypto.scryptSync(senha,rede.salt,32);return crypto.timingSafeEqual(hash,rede.hash);}catch{return false;}}
async function rotasNovas(req,res,u,local){
 const rota=u.pathname; if(!['/api/contas-cfg','/api/legendas','/api/referencias','/api/calendario','/api/bots','/api/render-fila','/api/rede'].includes(rota))return false;
 if(!['GET','POST'].includes(req.method)){json(res,405,{erro:'Método não permitido'});return true;}
 if(rota==='/api/contas-cfg'){
  if(req.method==='GET')json(res,200,contasCfg());else{const b=await corpo(req);let lista=contasCfg();if(b.acao==='remover'){acharConta(b.id);lista=lista.filter(c=>c.id!==b.id);}else{const c=validarConta(b.conta||b);lista=lista.filter(x=>x.id!==c.id);lista.push(c);}gravarJson(path.join(CONFIG,'contas.json'),lista);json(res,200,{ok:true,contas:lista});}
 }else if(rota==='/api/legendas'){
  if(req.method==='GET'){const c=contaDaUrl(u);json(res,200,revisaoConta(c).itens.map(({id,legenda})=>({id,legenda})));}else{const b=await corpo(req),c=acharConta(b.conta);if(!revisaoConta(c).itens.some(i=>i.id===b.id))erro(404,'Vídeo não pertence à conta');if(typeof b.legenda!=='string'||b.legenda.length>10000)erro(400,'Legenda inválida');const l=lerJson(LEGENDAS,{});l[b.id]={conta:c.id,legenda:b.legenda,atualizado:Date.now()};gravarJson(LEGENDAS,l);json(res,200,{ok:true});}
 }else if(rota==='/api/referencias'){
  if(req.method==='GET'){
    const conta=u.searchParams.get('conta');
    if(conta)acharConta(conta);
    json(res,200,listarReferencias(conta||null));
  }else{
    const b=await corpo(req);let url;try{url=new URL(b.url);}catch{erro(400,'URL inválida');}if(!['http:','https:'].includes(url.protocol)||url.username||url.password)erro(400,'Somente link HTTP/HTTPS sem senha');if(b.conta)acharConta(b.conta);if(b.nota!==undefined&&typeof b.nota!=='string')erro(400,'Nota inválida');const item={id:crypto.randomUUID(),url:url.href,nota:String(b.nota||'').slice(0,2000),conta:b.conta||null,status:'pendente',criado:Date.now()};fs.mkdirSync(path.dirname(REFERENCIAS),{recursive:true});fs.appendFileSync(REFERENCIAS,JSON.stringify(item)+'\n');json(res,201,item);
  }
 }else if(rota==='/api/calendario')json(res,200,calendario(contaDaUrl(u)));
 else if(rota==='/api/bots')json(res,200,statusBots());
 else if(rota==='/api/render-fila')json(res,200,{limite_pesados:1,somente_visual:true,itens:(await processos()).filter(p=>/ffmpeg|render/.test(p.tipo+' '+p.cmd)).map(p=>({...p,peso:'pesada',estado:'em execução (externa)'})),classes:['leve','média','pesada']});
 else if(rota==='/api/rede'){
  if(!local)erro(403,'Configure a rede neste PC');
  if(req.method==='POST'){const b=await corpo(req);if(typeof b.ligado!=='boolean')erro(400,'Estado inválido');if(b.ligado){if(typeof b.senha!=='string'||b.senha.length<10||b.senha.length>200)erro(400,'Senha deve ter de 10 a 200 caracteres');const ip=ipsLAN()[0];if(!ip)erro(409,'IP de rede local não encontrado');if(!servidorLAN){const srv=http.createServer(atender);await new Promise((ok,no)=>{srv.once('error',no);srv.listen(PORTA,ip,ok);});servidorLAN=srv;}rede.salt=crypto.randomBytes(16);rede.hash=crypto.scryptSync(b.senha,rede.salt,32);rede.ip=ip;rede.ligado=true;}else{rede.ligado=false;rede.ip=null;rede.hash=null;rede.salt=null;servidorLAN?.close();servidorLAN?.closeAllConnections();servidorLAN=null;}}
  json(res,200,{ligado:rede.ligado,ips:rede.ligado?[rede.ip]:[],urls:rede.ligado?[`http://${rede.ip}:${PORTA}`]:[],aviso:'Desligado ao reiniciar. Na LAN o transporte é HTTP; use apenas rede confiável.'});
 }
 return true;
}

// ---------- NEXO (multi-estilo, outliers, produção e lote) ----------
let nexoRenderProc = null;
let nexoCacarProc = null;
const NEXO_JOBS = path.join(ESTADO, 'nexo-jobs.json');

function nexoEstilos() {
  const dir = path.join(RAIZ, 'estilos');
  const out = [];
  for (const e of ls(dir)) {
    if (!e.isDirectory()) continue;
    const stFile = path.join(dir, e.name, 'style.json');
    if (!fs.existsSync(stFile)) continue;
    const st = lerJson(stFile, null);
    if (!st) continue;
    const id = st.id || e.name;
    const prev = path.join(RAIZ, 'videos', 'estilos', `${id}.mp4`);
    const lote = lerJson(path.join(dir, e.name, 'lote.json'), { rows: [] });
    out.push({
      id,
      nome: st.nome || id,
      motor: 'hyperframes',
      descricao: st.descricao || '',
      formato: st.formato || {},
      slots: st.slots || [],
      variables: st.variables || [],
      tem_preview: fs.existsSync(prev),
      preview_rel: fs.existsSync(prev) ? `videos/estilos/${id}.mp4` : null,
      lote_exemplo: Array.isArray(lote.rows) ? lote.rows : [],
    });
  }
  const ep46 = path.join(RAIZ, 'videos', 'ep46', 'ep46-720p.mp4');
  const walkie = path.join(RAIZ, 'videos', 'nexo', 'tiao-predio-derrete-carros.mp4');
  const v8 = path.join(RAIZ, 'videos', 'nexo', 'piloto-tiao-v8.mp4');
  const prevTiao = fs.existsSync(walkie) ? 'videos/nexo/tiao-predio-derrete-carros.mp4' : (fs.existsSync(v8) ? 'videos/nexo/piloto-tiao-v8.mp4' : (fs.existsSync(ep46) ? 'videos/ep46/ep46-720p.mp4' : null));
  out.push({
    id: 'tiao_3d',
    nome: 'Tião 3D (Nexo V8)',
    motor: 'motor3d',
    descricao: 'Série 3D do Tião estilo RicksClips (rosto branco + barba cinza, livre de roupa/cenário, ação 1:1 com a narração).',
    formato: { largura: 1080, altura: 1920, duracao: 25, fps: 24 },
    slots: [],
    variables: [],
    tem_preview: !!prevTiao,
    preview_rel: prevTiao,
    lote_exemplo: [],
  });
  return out;
}

function parseCsvLinha(linha) {
  const cols = [];
  let cur = '', emAspas = false;
  for (let i = 0; i < linha.length; i++) {
    const ch = linha[i];
    if (emAspas) {
      if (ch === '"' && linha[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') emAspas = false;
      else cur += ch;
    } else if (ch === '"') emAspas = true;
    else if (ch === ',') { cols.push(cur); cur = ''; }
    else cur += ch;
  }
  cols.push(cur);
  return cols;
}

function nexoOutliers(nicho, limit = 50) {
  const nichosDir = path.join(RAIZ, 'nichos');
  const nichos = ls(nichosDir)
    .filter((e) => e.isFile() && e.name.endsWith('.json') && !e.name.startsWith('_'))
    .map((e) => e.name.replace(/\.json$/, ''))
    .sort();
  const csvPath = path.join(RAIZ, 'projetos', 'referencias.csv');
  const txt = lerTexto(csvPath);
  const itens = [];
  if (txt.trim()) {
    const linhas = txt.split(/\r?\n/).filter(Boolean);
    const hdr = parseCsvLinha(linhas[0]);
    for (let i = 1; i < linhas.length; i++) {
      const vals = parseCsvLinha(linhas[i]);
      const row = {};
      hdr.forEach((k, idx) => { row[k] = vals[idx] ?? ''; });
      if (nicho && row.nicho !== nicho) continue;
      itens.push(row);
    }
  }
  itens.sort((a, b) => (parseFloat(b.nota) || 0) - (parseFloat(a.nota) || 0));
  return { nichos, total: itens.length, cacando: !!nexoCacarProc, itens: itens.slice(0, limit) };
}

async function rotasNexo(req, res, u) {
  const rota = u.pathname;
  if (!rota.startsWith('/api/nexo/')) return false;
  if (rota === '/api/nexo/estilos' && req.method === 'GET') {
    json(res, 200, nexoEstilos());
    return true;
  }
  if (rota === '/api/nexo/outliers' && req.method === 'GET') {
    const nicho = u.searchParams.get('nicho') || '';
    const limit = Math.min(100, Math.max(1, Number(u.searchParams.get('limit') || 50)));
    json(res, 200, nexoOutliers(nicho || null, limit));
    return true;
  }
  if (rota === '/api/nexo/jobs' && req.method === 'GET') {
    json(res, 200, { ocupado: !!nexoRenderProc, cacando: !!nexoCacarProc, jobs: lerJson(NEXO_JOBS, []) });
    return true;
  }
  if (rota === '/api/nexo/video' && req.method === 'GET') {
    const rel = String(u.searchParams.get('arquivo') || '').replace(/^\/+/, '');
    if (!rel.startsWith('videos/') || rel.includes('..') || !/\.mp4$/i.test(rel)) {
      json(res, 400, { erro: 'Caminho de vídeo inválido' });
      return true;
    }
    servirVideo(req, res, rel);
    return true;
  }
  if (rota === '/api/nexo/cacar' && req.method === 'POST') {
    if (nexoCacarProc) { json(res, 409, { erro: 'Já existe uma busca de outliers rodando.' }); return true; }
    const b = await corpo(req);
    const nicho = String(b.nicho || '').trim();
    const janela = ['hora', 'hoje', 'semana', 'mes', 'ano'].includes(b.janela) ? b.janela : 'semana';
    if (!/^[a-z0-9_-]{1,40}$/.test(nicho)) { json(res, 400, { erro: 'Nicho inválido' }); return true; }
    const p = spawn('python3', [path.join(RAIZ, 'ferramentas', 'nexo.py'), 'cacar', nicho, '--janela', janela, '--top', '15'], { cwd: RAIZ, stdio: 'ignore' });
    nexoCacarProc = p;
    p.on('exit', () => { if (nexoCacarProc === p) nexoCacarProc = null; });
    p.on('error', () => { if (nexoCacarProc === p) nexoCacarProc = null; });
    json(res, 202, { ok: true, nicho, janela });
    return true;
  }
  if (rota === '/api/nexo/produzir' && req.method === 'POST') {
    if (nexoRenderProc) { json(res, 409, { erro: 'Já existe um render em andamento (limite: 1 por vez para proteger seu PC).' }); return true; }
    const b = await corpo(req);
    const estilo = String(b.estilo || '').trim();
    if (!/^[a-z0-9_-]{1,40}$/.test(estilo) || estilo === 'tiao_3d') {
      json(res, 400, { erro: 'Estilo HyperFrames inválido para produção direta.' });
      return true;
    }
    const resolucao = b.resolucao === '1080p' ? '1080p' : '720p';
    const qualidade = b.qualidade === 'standard' ? 'standard' : 'draft';
    const canal = /^[a-z0-9_-]{1,40}$/.test(String(b.canal || '')) ? String(b.canal) : 'nexo';
    const voz = /^[A-Za-z0-9_-]{2,30}$/.test(String(b.voz || '')) ? String(b.voz) : 'Fenrir';
    const texto = typeof b.texto === 'string' ? b.texto.trim().slice(0, 1200) : '';
    const vars = (b.vars && typeof b.vars === 'object' && !Array.isArray(b.vars)) ? b.vars : {};
    const jobId = `nexo-${Date.now()}-${estilo}`;
    const args = [
      path.join(RAIZ, 'ferramentas', 'nexo.py'), 'produzir',
      '--estilo', estilo,
      '--vars', JSON.stringify(vars),
      '--canal', canal,
      '--voz', voz,
      '--resolucao', resolucao,
      '--qualidade', qualidade,
      '--job-id', jobId,
    ];
    if (texto) args.push('--texto', texto);
    const p = spawn('python3', args, { cwd: RAIZ, stdio: 'ignore' });
    nexoRenderProc = p;
    p.on('exit', () => { if (nexoRenderProc === p) nexoRenderProc = null; });
    p.on('error', () => { if (nexoRenderProc === p) nexoRenderProc = null; });
    json(res, 202, { ok: true, job_id: jobId });
    return true;
  }
  if (rota === '/api/nexo/lote' && req.method === 'POST') {
    if (nexoRenderProc) { json(res, 409, { erro: 'Já existe um render em andamento (limite: 1 por vez).' }); return true; }
    const b = await corpo(req);
    const estilo = String(b.estilo || '').trim();
    if (!/^[a-z0-9_-]{1,40}$/.test(estilo) || estilo === 'tiao_3d') {
      json(res, 400, { erro: 'Estilo inválido para lote.' });
      return true;
    }
    if (!Array.isArray(b.rows) || !b.rows.length || b.rows.length > 20) {
      json(res, 400, { erro: 'Envie de 1 a 20 linhas no lote.' });
      return true;
    }
    const canal = /^[a-z0-9_-]{1,40}$/.test(String(b.canal || '')) ? String(b.canal) : 'nexo';
    const jobId = `nexo-lote-${Date.now()}-${estilo}`;
    const loteDir = path.join(RAIZ, 'videos', 'nexo', '_lotes');
    fs.mkdirSync(loteDir, { recursive: true });
    const lotePath = path.join(loteDir, `${jobId}.json`);
    fs.writeFileSync(lotePath, JSON.stringify({ rows: b.rows }, null, 2));
    const p = spawn('python3', [
      path.join(RAIZ, 'ferramentas', 'nexo.py'), 'lote',
      '--estilo', estilo,
      '--arquivo', lotePath,
      '--canal', canal,
      '--job-id', jobId,
    ], { cwd: RAIZ, stdio: 'ignore' });
    nexoRenderProc = p;
    p.on('exit', () => { if (nexoRenderProc === p) nexoRenderProc = null; });
    p.on('error', () => { if (nexoRenderProc === p) nexoRenderProc = null; });
    json(res, 202, { ok: true, job_id: jobId });
    return true;
  }
  json(res, 404, { erro: 'Rota Nexo não encontrada' });
  return true;
}

// ---------- servidor ----------
const HTML = path.join(AQUI, 'index.html');
export async function atender(req, res) {
  const u = new URL(req.url, 'http://x');
  // anti-CSRF / DNS rebinding: só aceita Host e Origin do próprio painel (um site aberto no navegador não consegue mandar POST aqui)
  const hostsOk = [`127.0.0.1:${PORTA}`, `localhost:${PORTA}`, ...(rede.ligado ? ipsLAN().map(ip=>`${ip}:${PORTA}`) : [])]; const origem = req.headers.origin;
  if (!hostsOk.includes(req.headers.host || '') || (origem && origem !== `http://${req.headers.host}`)) { res.writeHead(403, { 'Content-Type': 'text/plain' }); return res.end('origem não permitida'); }
  try {
    const local = ['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
    if (!local && (!rede.ligado || !autenticado(req))) { res.writeHead(401, {'WWW-Authenticate':'Basic realm="Painel WR", charset="UTF-8"'}); return res.end('Senha do painel necessária'); }
    if (u.pathname === '/api/modo') return json(res, 200, { espelho: ESPELHO });
    if (ESPELHO && req.method !== 'GET' && req.method !== 'HEAD') return json(res, 403, { erro: 'Espelho do celular: só leitura. Decida no PC.' });
    const nova = await rotasNovas(req,res,u,local); if (nova) return;
    const nexo = await rotasNexo(req,res,u); if (nexo) return;
    if (req.method === 'POST' && ['/api/marca','/api/contas','/api/streamers','/api/meta/status'].includes(u.pathname)) return json(res,409,{erro:'Configuração antiga somente leitura. Use Configurações de contas.'});
    if (u.pathname === '/') { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); return res.end(fs.readFileSync(HTML)); }
    if (u.pathname === '/api/ao-vivo') return json(res, 200, await aoVivo(u.searchParams.get('forcar') === '1'));
    if (u.pathname === '/api/revisao') { const c=contaDaUrl(u); const r = revisaoConta(c); return json(res, 200, { ...r, agora: Date.now(), processos: await processos(), ...atividade() }); }
    if (u.pathname === '/api/meta' && req.method === 'GET') { const c = contas().meta; return json(res, 200, { tiktok: contas().tiktok.ativo, fila: filaMeta(), legado: metaFila(), conta: { pagina: c.pagina, instagram: c.instagram, business_suite: c.business_suite }, horarios: c.horarios }); }
    if (u.pathname === '/api/ajuda') { res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end(lerTexto(path.join(RAIZ, 'AGENTS.md'))); }
    if (u.pathname === '/api/desempenho' && req.method === 'GET') return json(res, 200, desempenho());
    if (u.pathname === '/api/desempenho' && req.method === 'POST') { const b = await corpo(req); if (!['auto', ...Object.keys(PERFIS_DESC)].includes(b.perfil)) return json(res, 400, { erro: 'perfil' }); return json(res,409,{erro:'Desempenho somente leitura'}); }
    if (u.pathname === '/api/trabalhos' && req.method === 'GET') return json(res, 200, await trabalhos());
    if (u.pathname === '/api/trabalhos/parar' && req.method === 'POST') { const b = await corpo(req); const [c, o] = await pararTrabalho(Number(b.pid)); return json(res, c, o); }
    if (u.pathname === '/api/marca' && req.method === 'GET') { const id = identidade(); return json(res, 200, { nick: id.nick || '', tem_logo: fs.existsSync(path.resolve(RAIZ, id.logo || 'x')), tem_capa: fs.existsSync(path.resolve(RAIZ, id.capa || 'x')) }); }
    if (u.pathname === '/api/marca/arquivo' && req.method === 'POST') {
      const tipo = u.searchParams.get('tipo'); if (!['logo', 'capa'].includes(tipo)) return json(res, 400, { erro: 'tipo' });
      let buf; try { buf = await corpoBruto(req); } catch (e) { return json(res, 413, { erro: String(e.message) }); }
      const ext = tipoImagem(buf); if (!ext) return json(res, 400, { erro: 'envie uma imagem PNG, JPG ou WEBP' });
      return json(res,409,{erro:'Marca somente leitura neste painel'});

    }
    if (u.pathname === '/marca/logo' || u.pathname === '/marca/capa') return servirMarca(res, u.pathname.endsWith('capa') ? 'capa' : 'logo');
    if (u.pathname === '/api/placar') return json(res, 200, placarConta(contaDaUrl(u)));
    if (u.pathname === '/api/saude') return json(res, 200, await saude());
    if (u.pathname === '/api/contas' && req.method === 'GET') return json(res, 200, contas());
    if (u.pathname === '/api/streamers' && req.method === 'GET') return json(res, 200, streamersCfg());
    if (u.pathname === '/video') return servirVideo(req, res, deb64(u.searchParams.get('id') || ''));
    if (u.pathname === '/api/decidir' && req.method === 'POST') {
      const b=await corpo(req); if(!['aprovado','recusado','desfazer'].includes(b.estado)) return json(res,400,{erro:'estado'});
      const c=acharConta(b.conta || 'six_stars'); const it=revisaoConta(c).itens.find(i=>i.id===b.id); if(!it) return json(res,404,{erro:'Vídeo não pertence à conta'});
      salvarDecisao(it.id,b.estado==='desfazer'?null:{estado:b.estado,motivo:String(b.motivo||'').slice(0,200),legenda:it.legenda,conta:c.id,ts:Date.now()});
      return json(res,200,{ok:true,legenda:it.legenda});
    }
    if (u.pathname === '/api/gravar' && req.method === 'POST') { const b = await corpo(req); if(!LINK_RE.test(String(b.url||''))) return json(res,400,{erro:'URL inválida'}); const [c, o] = await iniciarTrabalho(String(b.url || '')); return json(res, c, o); }
    if (u.pathname === '/api/link/detectar' && req.method === 'POST') { const b = await corpo(req); return json(res, 200, await detectarLink(b.url)); }
    if (u.pathname === '/api/link/cortar' && req.method === 'POST') { const b = await corpo(req); if(!LINK_RE.test(String(b.url||''))) return json(res,400,{erro:'URL inválida'}); const [c, o] = await iniciarTrabalho(String(b.url || '').trim(), { inicio: b.inicio, fim: b.fim, quantos: b.quantos }); return json(res, c, o); }
    res.writeHead(404); res.end('nao');
  } catch (e) { json(res, e.status || (e instanceof SyntaxError ? 400 : 500), { erro: e.status || e instanceof SyntaxError ? e.message : 'Falha interna do painel' }); }
}
if (process.env.PAINEL_SEM_LISTEN !== '1') {
  http.createServer(atender).listen(PORTA, '127.0.0.1', () => console.log(`Painel WR em http://127.0.0.1:${PORTA} — manual, sem IA e sem postagem automática`));
}
