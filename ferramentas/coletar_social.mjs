// Coleta virais de TikTok / Instagram (Reels) por hashtag ou busca, SEM passar pelo contexto do agente.
// Chrome real (channel chrome) com perfil persistente; lê as RESPOSTAS de rede que a própria página carrega.
// Uso:
//   node ferramentas/coletar_social.mjs tiktok tag gta6
//   node ferramentas/coletar_social.mjs tiktok busca "gta 6 curiosidades"
//   node ferramentas/coletar_social.mjs instagram tag gta6
//   node ferramentas/coletar_social.mjs --nicho gta6      (rápido por padrão; --completo para varrer tudo)
//   --visivel  não usa tela virtual (abre janela no desktop)
// Saída: projetos/_coleta/<execucao>/manifesto.json e coletas com status, timestamp e linhas.
// Importar: ferramentas/rea-video/.venv/bin/python -I ferramentas/importar_social.py <nicho> --manifesto <caminho impresso>
// REGRA: captcha / verificação / login no Instagram => PARA aquela rede e avisa. Nunca contorna, nunca digita senha.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIN_VIEWS = 20000, MAX_DUR = 90, MAX_DIAS = 60, TOP = 40, ROLAGENS = 3;
const dorme = (ms) => new Promise((r) => setTimeout(r, ms));
const humano = () => 2500 + Math.random() * 2000;

// ---- normalizadores ----
const num = (x) => Number(x) || 0;
function walk(o, fn, d = 0) {
  if (!o || typeof o !== 'object' || d > 14) return;
  if (fn(o) === true) return;
  for (const v of Array.isArray(o) ? o : Object.values(o)) walk(v, fn, d + 1);
}

export function itensTikTok(json) {
  const out = [];
  walk(json, (o) => {
    if (o.id && o.stats && o.author && o.createTime) { out.push(o); return true; }
  });
  return out.map((it) => {
    const s = it.statsV2 || it.stats, a = it.authorStatsV2 || it.authorStats || {};
    return {
      id: String(it.id), autor: typeof it.author === 'object' ? it.author.uniqueId : String(it.author),
      seg: num(a.followerCount), views: num(s.playCount), likes: num(s.diggCount), coms: num(s.commentCount),
      shares: num(s.shareCount), salvos: num(s.collectCount), criado: num(it.createTime),
      dur: num(it.video?.duration), leg: it.desc || '', capa: it.video?.cover || it.video?.originCover || '', ad: !!it.isAd,
    };
  });
}

export function itensInstagram(json) {
  const out = [];
  walk(json, (o) => {
    // formato api/v1 (xdt_api / clips / tags)
    if (o.code && o.taken_at && (o.like_count !== undefined || o.play_count !== undefined || o.view_count !== undefined) && (o.media_type === 2 || o.video_versions || o.video_duration || o.product_type === 'clips')) {
      out.push({
        id: String(o.code), autor: o.user?.username || o.owner?.username || '', seg: num(o.user?.follower_count),
        views: num(o.play_count ?? o.ig_play_count ?? o.view_count), likes: Math.max(0, num(o.like_count)), coms: num(o.comment_count),
        shares: 0, salvos: 0, criado: num(o.taken_at), dur: num(o.video_duration), leg: o.caption?.text || '',
        capa: o.image_versions2?.candidates?.[0]?.url || o.thumbnail_url || '', ad: o.is_paid_partnership === true || !!o.ad_id,
      });
      return true;
    }
    // formato graphql antigo (shortcode)
    if (o.shortcode && o.taken_at_timestamp && o.is_video) {
      out.push({
        id: String(o.shortcode), autor: o.owner?.username || '', seg: 0, views: num(o.video_view_count),
        likes: num(o.edge_liked_by?.count ?? o.edge_media_preview_like?.count), coms: num(o.edge_media_to_comment?.count ?? o.edge_media_preview_comment?.count),
        shares: 0, salvos: 0, criado: num(o.taken_at_timestamp), dur: num(o.video_duration),
        leg: o.edge_media_to_caption?.edges?.[0]?.node?.text || '', capa: o.display_url || o.thumbnail_src || '', ad: false,
      });
      return true;
    }
  });
  return out;
}

// ---- navegador ----
export async function abrir(perfil, raiz = RAIZ, chromium = null) {
  chromium ||= (await import('playwright')).chromium;
  const dir = path.join(raiz, '_estado', perfil);
  fs.mkdirSync(dir, { recursive: true });
  // Chrome é responsável por validar seus locks; nunca remover locks de outro processo.
  return chromium.launchPersistentContext(dir, {
    channel: 'chrome', headless: false, viewport: { width: 1366, height: 900 },
    locale: 'pt-BR', timezoneId: 'America/Sao_Paulo',
    args: ['--no-first-run', '--no-default-browser-check'],
  });
}

const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// bloqueio visível na página (texto/URL). IG: login também conta.
async function bloqueio(page, rede) {
  const url = page.url();
  if (rede === 'instagram' && /accounts\/login|\/challenge|checkpoint|suspended/.test(url)) return 'tela de login/verificação do Instagram (' + url.slice(0, 60) + ')';
  return page.evaluate((rede) => {
    const t = (document.body?.innerText || '').slice(0, 4000).toLowerCase();
    const vis = (e) => { const r = e.getBoundingClientRect(), st = getComputedStyle(e); return r.width > 40 && r.height > 40 && st.visibility !== 'hidden' && st.display !== 'none'; };
    if ([...document.querySelectorAll('[id*="captcha"], .captcha_verify_container, iframe[src*="captcha"], iframe[src*="recaptcha"]')].some(vis)) return 'captcha visível na página';
    if (/suspicious activity|atividade suspeita|confirm it'?s you|confirme que é você|verifique sua identidade|verify you are human|we detected unusual|unusual activity|atividade incomum/.test(t)) return 'verificação/atividade suspeita';
    if (rede === 'instagram' && document.querySelector('input[name="password"]')) return 'tela de login do Instagram';
    return '';
  }, rede).catch(() => '');
}

export async function coletar(ctx, rede, tipo, termo) {
  const t0 = Date.now();
  const page = await ctx.newPage();
  const respostas = [];
  const alvo = rede === 'tiktok' ? /api\/(challenge\/item_list|search\/|recommend\/item_list|post\/item_list)/ : /graphql|api\/v1\/(tags|clips|fbsearch|discover|feed|explore)|\/api\/graphql/;
  const pend = [];
  page.on('response', (r) => {
    const u = r.url();
    if (!alvo.test(u)) return;
    pend.push(r.text().then((tx) => { try { respostas.push(JSON.parse(tx)); } catch { /* não-JSON */ } }).catch(() => {}));
  });
  let url;
  if (rede === 'tiktok') url = tipo === 'tag' ? `https://www.tiktok.com/tag/${encodeURIComponent(termo)}` : `https://www.tiktok.com/search/video?q=${encodeURIComponent(termo)}`;
  else url = `https://www.instagram.com/explore/tags/${encodeURIComponent(termo)}/`;
  let bloq = '';
  try {
    let erroNavegacao;
    try { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 }); }
    catch(e) { erroNavegacao = e; }
    bloq = await bloqueio(page, rede);
    if (bloq) return {bloq, linhas:[], brutos:0};
    if (erroNavegacao) throw erroNavegacao;
    if (!bloq) {
      await dorme(2000);
      bloq = await bloqueio(page, rede);
    }
    if (!bloq) {
      for (let i = 0; i < ROLAGENS && !bloq; i++) {
        await page.mouse.move(400 + Math.random() * 400, 300 + Math.random() * 300);
        await page.mouse.wheel(0, 1800 + Math.random() * 800);
        await dorme(humano());
        bloq = await bloqueio(page, rede);
      }
    }
    if (bloq) return {bloq, linhas:[], brutos:0};
    await Promise.allSettled(pend);
    // JSON embutido no HTML (1ª página veio antes do gancho)
    const emb = await page.evaluate(() => {
      const out = [];
      const s = document.querySelector('#__UNIVERSAL_DATA_FOR_REHYDRATION__, #SIGI_STATE');
      if (s) { try { out.push(JSON.parse(s.textContent)); } catch {} }
      for (const x of document.querySelectorAll('script[type="application/json"]')) {
        if (x.textContent.length > 2000 && /taken_at|play_count|like_count/.test(x.textContent)) { try { out.push(JSON.parse(x.textContent)); } catch {} }
      }
      return out;
    }).catch(() => []);
    respostas.push(...emb);
  } finally {
    await page.close().catch(() => {});
  }
  const todos = new Map();
  for (const j of respostas) for (const it of (rede === 'tiktok' ? itensTikTok(j) : itensInstagram(j))) {
    const prev = todos.get(it.id);
    if (!prev || it.views > prev.views) todos.set(it.id, it);
  }
  const linhas = selecionarCapturas(todos.values(), Date.now() / 1000);
  const seg = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`${rede} | ${tipo}:${termo} | brutos ${todos.size} | passaram ${linhas.length} | ${seg}s${bloq ? ' | BLOQUEIO: ' + bloq : ''}`);
  return { bloq, brutos: todos.size, linhas: bloq ? [] : linhas };
}

export function selecionarCapturas(itens, agora) {
  const recentes = [...itens].filter(it => !it.ad && (!it.dur || it.dur <= MAX_DUR) && (agora - it.criado) / 86400 <= MAX_DIAS);
  const nota = i => Math.log10(i.views / Math.max(1, (agora - i.criado) / 86400) + 1) * (1 + Math.min(i.seg ? i.views / i.seg : 0, 5));
  const medidas = recentes.filter(i => i.views >= MIN_VIEWS).sort((a, b) => nota(b) - nota(a));
  const semContagem = recentes.filter(i => i.views === 0).sort((a, b) => b.criado - a.criado);
  return [...medidas, ...semContagem].slice(0, TOP).map(i => [i.id, i.autor, i.seg, i.views, i.likes, i.coms, i.shares, i.salvos, i.criado, i.dur,
    (i.leg || '').replace(/\s+/g, ' '), i.capa]);
}

// ---- CLI e estado durável ----
export function parseArgs(args) {
  const out = { rapido: true, visivel: false, pos: [] };
  let modo = null;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--nicho' || a === '--liberar-bloqueio') {
      const v = args[++i];
      if (!v || v.startsWith('--')) throw new Error(`${a} exige valor`);
      const key = a === '--nicho' ? 'nicho' : 'liberar';
      if (out[key]) throw new Error(`${a} repetido`);
      out[key] = v;
    } else if (a === '--rapido' || a === '--completo') {
      if (modo && modo !== a) throw new Error('--rapido e --completo são incompatíveis');
      modo = a; out.rapido = a === '--rapido';
    } else if (a === '--visivel') out.visivel = true;
    else if (a.startsWith('--')) throw new Error(`opção desconhecida: ${a}`);
    else out.pos.push(a);
  }
  if (out.nicho && !/^[a-zA-Z0-9_-]+$/.test(out.nicho)) throw new Error('nicho inválido');
  if (out.liberar) {
    if (!['tiktok','instagram'].includes(out.liberar) || out.nicho || out.pos.length || modo) throw new Error('--liberar-bloqueio <tiktok|instagram> deve ser usado sozinho');
  } else if (out.nicho) {
    if (out.pos.length) throw new Error('use --nicho ou rede/tipo/termo');
  } else {
    const [rede, tipo, ...termo] = out.pos;
    if (!['tiktok','instagram'].includes(rede) || !['tag','busca'].includes(tipo) || !termo.join(' ').trim()) throw new Error('uso: coletar_social.mjs <tiktok|instagram> <tag|busca> <termo> | --nicho <nome> [--completo]');
    if (rede === 'instagram' && tipo !== 'tag') throw new Error('Instagram aceita só hashtag nesta rota; use instagram tag <hashtag>');
    if (rede === 'instagram' && tipo !== 'tag') throw new Error('instagram: só tag');
  }
  return out;
}

function arquivoBloqueios(raiz) { return path.join(raiz, '_estado', 'coleta-bloqueios.json'); }
function lerBloqueios(raiz) {
  const p = arquivoBloqueios(raiz);
  if (!fs.existsSync(p)) return {};
  const estado = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (!estado || typeof estado !== 'object' || Array.isArray(estado)) throw new Error('estado de bloqueios inválido');
  for (const rede of Object.keys(estado)) {
    if (!['tiktok','instagram'].includes(rede) || typeof estado[rede]?.motivo !== 'string' || !estado[rede].motivo.trim()) throw new Error('registro de bloqueio inválido');
  }
  return estado;
}
function gravarJson(p, value) {
  fs.mkdirSync(path.dirname(p), {recursive:true});
  const tmp = `${p}.${randomUUID()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2)); fs.renameSync(tmp, p);
}
export function liberarBloqueio(raiz, rede) {
  if (!['tiktok','instagram'].includes(rede)) throw new Error('rede inválida');
  const estado = lerBloqueios(raiz); delete estado[rede];
  gravarJson(arquivoBloqueios(raiz), estado);
}

export async function executar(tarefas, deps = {}) {
  const raiz = deps.raiz || RAIZ, abre = deps.abrir || abrir, coleta = deps.coletar || coletar;
  const dormir = deps.dormir || dorme;
  const execucao = `${new Date().toISOString().replace(/[:.]/g,'-')}-${randomUUID()}`;
  const dir = path.join(raiz,'projetos','_coleta',execucao);
  const manifesto = { execucao, iniciado_em:new Date().toISOString(), status:'em_andamento', arquivos:[] };
  const manifestoPath = path.join(dir,'manifesto.json');
  gravarJson(manifestoPath, manifesto);
  // Apenas um contexto de Chrome ativo. Bloqueio só expira por liberação humana explícita.
  for (const rede of ['tiktok','instagram']) {
    const lista = tarefas.filter(t => t[0] === rede);
    if (!lista.length) continue;
    let ctx, erroAbrir;
    const registrar = (tipo, termo, r) => {
      const status = r.bloq ? 'bloqueado' : r.erro ? 'erro' : r.linhas?.length ? 'ok' : 'vazio';
      const arquivo = path.join(dir, `${manifesto.arquivos.length + 1}-${rede}-${slug(termo)}.json`);
      const dado = {execucao, plataforma:rede, termo:`${tipo}:${termo}`, coletado_em:new Date().toISOString(), status,
        motivo:r.bloq || r.erro || '', brutos:r.brutos || 0, linhas:status === 'ok' ? r.linhas : []};
      const camposObservados = {
        views: dado.linhas.filter(l => l[3] > 0).length,
        duracao: dado.linhas.filter(l => l[9] > 0).length,
      };
      gravarJson(arquivo, dado);
      manifesto.arquivos.push({arquivo,status,plataforma:rede,termo:dado.termo,passaram:dado.linhas.length,campos_observados:camposObservados,motivo:dado.motivo});
      gravarJson(manifestoPath, manifesto);
    };
    try {
      for (let i = 0; i < lista.length; i++) {
        const [,tipo,termo] = lista[i];
        const estado = lerBloqueios(raiz);
        if (estado[rede]) { registrar(tipo,termo,{bloq:estado[rede].motivo}); continue; }
        if (erroAbrir) { registrar(tipo,termo,{erro:erroAbrir}); continue; }
        if (!ctx) {
          try { ctx = await abre(rede === 'instagram' ? 'chrome-meta' : 'chrome-busca',raiz); }
          catch(e) { erroAbrir = String(e.message); registrar(tipo,termo,{erro:erroAbrir}); continue; }
        }
        let r;
        try { r = await coleta(ctx,rede,tipo,termo); }
        catch(e) { r = {erro:String(e.message)}; }
        if (r.bloq) {
          const atual = lerBloqueios(raiz);
          atual[rede] = {motivo:r.bloq, desde:new Date().toISOString()};
          gravarJson(arquivoBloqueios(raiz), atual);
          console.log(`AVISO: ${rede} bloqueado. Resolva manualmente e só então use --liberar-bloqueio ${rede}.`);
        }
        registrar(tipo,termo,r);
        if (!r.bloq && !r.erro && i < lista.length - 1) await dormir(rede === 'tiktok' ? 40000 : 8000);
      }
    } finally { if (ctx) await ctx.close().catch(()=>{}); }
  }
  manifesto.finalizado_em = new Date().toISOString();
  manifesto.resumo = Object.fromEntries(['ok','vazio','bloqueado','erro'].map(s => [s,manifesto.arquivos.filter(a=>a.status===s).length]));
  manifesto.status = manifesto.resumo.erro || manifesto.resumo.bloqueado ? 'parcial' : 'concluido';
  gravarJson(manifestoPath, manifesto);
  console.log(`Manifesto: ${manifestoPath}`);
  return {...manifesto, manifesto:manifestoPath};
}

export async function main(args = process.argv.slice(2)) {
  const op = parseArgs(args);
  if (op.liberar) { liberarBloqueio(RAIZ,op.liberar); console.log(`Estado de ${op.liberar} liberado por instrução humana. Nenhuma coleta executada.`); return; }
  let tarefas;
  if (op.nicho) {
    const cfg = JSON.parse(fs.readFileSync(path.join(RAIZ,'nichos',`${op.nicho}.json`),'utf8'));
    const tt = [...(cfg.hashtags || []).map(h=>['tiktok','tag',h]), ...(cfg.tiktok_buscas || []).map(b=>['tiktok','busca',b])];
    const ig = (cfg.instagram_tags || cfg.hashtags || []).map(h=>['instagram','tag',h]);
    const r = cfg.rapido || {};
    tarefas = op.rapido ? [
      ...tt.filter(t=>(r.tiktok || [`${tt[0]?.[1]}:${tt[0]?.[2]}`]).includes(`${t[1]}:${t[2]}`)).slice(0,2),
      ...ig.filter(t=>(r.instagram || [ig[0]?.[2]]).includes(t[2])).slice(0,2),
    ] : [...tt,...ig];
  } else { const [rede,tipo,...resto] = op.pos; tarefas = [[rede,tipo,resto.join(' ').replace(/^#/, '')]]; }
  // Nem sequer iniciar Xvfb se todas as redes já estão bloqueadas.
  const estado = lerBloqueios(RAIZ);
  if (!op.visivel && !process.env.__SOCIAL_XVFB && tarefas.some(t=>!estado[t[0]])) {
    const r = spawnSync('xvfb-run',['-a','-s','-screen 0 1366x900x24',process.execPath,fileURLToPath(import.meta.url),...args],
      {stdio:'inherit',env:{...process.env,__SOCIAL_XVFB:'1'}});
    if (r.error) throw r.error;
    process.exitCode = r.status ?? 1; return;
  }
  const resultado = await executar(tarefas);
  if (resultado.status === 'parcial') process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(e=>{console.error(e.message);process.exitCode=1;});
}
