// Coletor TikTok — roda DENTRO da página (navegador onde o Filippe está logado), via javascript_tool.
// Não chama API por fora: só escuta as respostas que a própria página carrega e rola devagar, como gente.
// Uso: abrir https://www.tiktok.com/tag/<hashtag> ou /search/video?q=<termo>, colar este arquivo inteiro.
// Opções no topo. Saída (string JSON): {plataforma, termo, linhas:[[id,@,seguidores,views,likes,coments,shares,salvos,criado_unix,dur_s,legenda]]}
// Gravar em projetos/_coleta/<plataforma>-<termo>.json e rodar ferramentas/importar_social.py nele.
// Captcha/verificação apareceu? PARAR e avisar o Filippe. Nunca contornar.
const ROLAGENS = 4, MIN_VIEWS = 20000, MAX_DUR = 90, MAX_DIAS = 60, TOP = 30;
window.__cap = window.__cap || [];
if (!window.__hooked) {
  window.__hooked = 1;
  const alvo = /item_list|search\/item|search\/general/;
  const of = window.fetch;
  window.fetch = async function (...a) {
    const r = await of.apply(this, a);
    try { const u = (a[0] && a[0].url) || String(a[0]); if (alvo.test(u)) r.clone().json().then(j => window.__cap.push(j)).catch(() => {}); } catch (e) {}
    return r;
  };
  const oo = XMLHttpRequest.prototype.open, os = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (m, u) { this.__u = u; return oo.apply(this, arguments); };
  XMLHttpRequest.prototype.send = function () {
    this.addEventListener('load', () => { try { if (alvo.test(this.__u)) window.__cap.push(JSON.parse(this.responseText)); } catch (e) {} });
    return os.apply(this, arguments);
  };
}
// a 1ª página veio antes do gancho: vem do JSON embutido no HTML
try {
  const s = document.querySelector('#__UNIVERSAL_DATA_FOR_REHYDRATION__');
  if (s && !window.__rehid) { window.__rehid = 1; window.__cap.push({ embutido: JSON.parse(s.textContent) }); }
} catch (e) {}
const captcha = () => !!document.querySelector('[id*="captcha"], .captcha_verify_container, iframe[src*="captcha"]');
for (let i = 0; i < ROLAGENS && !captcha(); i++) {
  window.scrollTo(0, document.body.scrollHeight);
  await new Promise(r => setTimeout(r, 2500 + Math.random() * 2000));
}
const itens = [];
const pega = (o, d = 0) => {  // acha itemList/item em qualquer formato de resposta
  if (!o || typeof o !== 'object' || d > 8) return;
  if (o.id && o.stats && o.author) { itens.push(o); return; }
  for (const v of Object.values(o)) pega(v, d + 1);
};
window.__cap.forEach(c => pega(c));
const agora = Date.now() / 1000, vistos = new Set(), linhas = [];
for (const it of itens) {
  if (vistos.has(it.id)) continue; vistos.add(it.id);
  const s = it.statsV2 || it.stats, a = it.authorStatsV2 || it.authorStats || {};
  const v = +s.playCount, dur = +(it.video?.duration || 0), dias = (agora - it.createTime) / 86400;
  if (it.isAd || v < MIN_VIEWS || dur > MAX_DUR || dias > MAX_DIAS) continue;
  linhas.push([it.id, it.author.uniqueId, +a.followerCount || 0, v, +s.diggCount, +s.commentCount, +s.shareCount,
    +(s.collectCount || 0), +it.createTime, dur, (it.desc || '').slice(0, 50)]);
}
// mesma nota do pesquisar.py: log10(views/dia) * (1 + min(surto, 5)); devolve só o TOP (contexto do agente é caro)
const nota = l => Math.log10(l[3] / Math.max(1, (agora - l[8]) / 86400) + 1) * (1 + Math.min(l[2] ? l[3] / l[2] : 0, 5));
linhas.sort((x, y) => nota(y) - nota(x));
// saída: colar em JSON para ferramentas/importar_social.py
JSON.stringify({ plataforma: 'tiktok', termo: decodeURIComponent(location.pathname + location.search), captcha: captcha(),
  brutos: vistos.size, passaram: linhas.length, linhas: linhas.slice(0, TOP) });
