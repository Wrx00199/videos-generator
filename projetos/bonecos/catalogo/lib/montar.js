// ===== MONTADOR: episodio.json (EP) + tempos (TEM) -> DOM + timeline. Nada é desenhado aqui: só catálogo. =====
// Globais injetadas pelo gerar.mjs: EP, PLAN (planos com t0/dur já calculados), WORDS, CEN (cenarios.json), DUR
const ATORES = {};
const CHAO = 1560;
(function montar() {
  let html = sharedDefs() + EXTRA_DEFS, hud = '';
  PLAN.forEach((pl, i) => {
    const S = 'p' + i; let chars = '', front = '';
    (pl.objetos || []).forEach((ob, j) => {
      const body = ob.svg || OBJ[ob.tipo] || (ob.prop ? props[ob.prop] : '') || '';
      const g = `<g id="${S}_o${j}" transform="translate(${ob.x || 900},${ob.y === undefined ? CHAO : ob.y}) rotate(${ob.r || 0}) scale(${ob.s || 1})" opacity="${ob.oculto ? 0 : 1}"><g id="${S}_o${j}i">${body}</g></g>`;
      if (ob.frente) front += g; else chars += g;
    });
    (pl.atores || []).forEach((a, j) => {
      const p = `${S}_${a.id}${j}`; a._p = p; const base = EP.elenco[a.id] || {};
      const cfg = Object.assign({}, base, { x: a.x || 900, y: a.y || CHAO, s: a.s || 1, flip: a.flip || 1, rim: (CEN[pl.cena] || {}).rim ? { col: CEN[pl.cena].rim, side: (CEN[pl.cena].sol === 'esq' ? -1 : 1) * (a.flip || 1) } : null });
      cfg.segura = { D: [...new Set([...(base.segura && base.segura.D || []), ...(a.segura && a.segura.D || [])])], E: [...new Set([...(base.segura && base.segura.E || []), ...(a.segura && a.segura.E || [])])] };
      ATORES[p] = cfg; const svg = personagem(p, cfg);
      chars += a.invis ? `<g opacity="${a.invis}">${svg}</g>` : svg;
    });
    (pl.texto || []).forEach((tx, j) => { let tt = String(tx.txt); if (tt.length > 12 && tt.includes(' ')) { const w = tt.split(' '); let best = 1, bd = 1e9; for (let q = 1; q < w.length; q++) { const a = w.slice(0, q).join(' ').length, b = w.slice(q).join(' ').length, dd = Math.max(a, b); if (dd < bd) { bd = dd; best = q; } } tt = w.slice(0, best).join(' ') + '<br>' + w.slice(best).join(' '); } const ln = Math.max(...tt.split('<br>').map(s => s.length)); const fs = Math.min(tx.tam || 150, 860 / (ln * .62)); hud += `<div class="hudt" id="${S}_t${j}" style="font-size:${fs}px;color:${tx.cor || '#fff'};-webkit-text-stroke:${fs / 9}px #111">${tt}</div>`; });
    html += `<div class="scene" id="${S}"><div class="lay" id="${S}_far"><img src="cen/${pl.cena}_far.png"></div><div class="lay" id="${S}_mid"><img src="cen/${pl.cena}_mid.png"><svg class="chars" viewBox="0 0 1800 1920" xmlns="http://www.w3.org/2000/svg">${chars}${front}</svg></div><div class="lay" id="${S}_fg"><img src="cen/${pl.cena}_fg.png"></div></div>`;
  });
  $('#stage').innerHTML = html; $('#hudl').innerHTML = hud;
  // ---------- timeline ----------
  PLAN.forEach((pl, i) => {
    const S = 'p' + i, t0 = pl.t0, d = pl.dur;
    tl.set('#' + S, { display: 'block' }, t0); tl.set('#' + S, { display: 'none' }, t0 + d);
    const c = pl.cam || [[900, 1200, 1.2], [900, 1200, 1.3]]; cam(S, t0, 0, c[0]); if (c[1]) cam(S, t0, d, c[1], pl.ease || 'sine.inOut');
    const cen = CEN[pl.cena] || {}; tl.set('#grade', { background: cen.grade || 'none' }, t0);
    (pl.atores || []).forEach(a => {
      const p = a._p; for (const s of ['D', 'E']) { P(`${p}_u${s}`, 0, 0, { r: BASE['u' + s] }); }
      expr(p, 0, a.expr || 'neutral', 0); if (a.olhar) look(p, 0, 0, a.olhar[0], a.olhar[1]);
      (a.pega || []).forEach(([s, n]) => { pega(p, s, 0, n); arm(p, s, 0, 0, s === 'D' ? -38 : 38, -84); });
      let k = t0 + (a.atraso || 0);
      const lst = a.acoes || [['parado']]; const fixo = lst.reduce((s, x) => s + (x[1] || 0), 0), livres = lst.filter(x => !x[1]).length;
      lst.forEach(([nome, dd, o]) => { const du = dd || Math.max(.4, (t0 + d - k - (fixo - (dd || 0))) / Math.max(1, livres)); acao(nome, p, k, Math.min(du, t0 + d - k), o || {}); k += du; });
      blink(p, Array.from({ length: Math.floor(d / 2.4) }, (_, q) => t0 + .7 + q * 2.4));
    });
    (pl.objetos || []).forEach((ob, j) => { const id = `#${S}_o${j}`; if (ob.aparece !== undefined) OP(id, t0 + ob.aparece, 1); if (ob.anim) { const A = ob.anim; tl.to(id + 'i', { x: A.dx || 0, y: A.dy || 0, rotation: A.r || 0, scale: A.s || 1, svgOrigin: '0 0', duration: A.dur || d, ease: A.ease || 'power1.inOut' }, t0 + (A.em || 0)); } });
    (pl.texto || []).forEach((tx, j) => { tl.fromTo(`#${S}_t${j}`, { opacity: 0, scale: .4 }, { opacity: 1, scale: 1, duration: .25, ease: 'back.out(2.5)' }, t0 + (tx.em || .1)); tl.set(`#${S}_t${j}`, { opacity: 0 }, t0 + d); });
    (pl.fx || []).forEach(([f, em, a, b]) => { if (f === 'shake') shake(t0 + em, a || 12, b || 7); if (f === 'flash') flash(t0 + em, a, b); });
  });
  // ---------- shader global: grão animado (12 qps), vinheta, gradação; bloom é no ffmpeg ----------
  for (let t = 0, i = 0; t < DUR; t += 1 / 12, i++) tl.set('#grain', { backgroundPosition: `${(i * 137) % 540}px ${(i * 251) % 960}px` }, t);
  // ---------- legenda palavra a palavra ----------
  $('#cap').innerHTML = WORDS.map((w, i) => `<span id="w${i}">${w[0]}</span>`).join('');
  WORDS.forEach((w, i) => { tl.set('#w' + i, { opacity: 1 }, w[1]); tl.set('#w' + i, { opacity: 0 }, w[2]); });
  tl.fromTo('#fade', { opacity: 0 }, { opacity: 1, duration: .35 }, DUR - .35);
  tl.set('#fade', { opacity: 0 }, DUR - .001 > 0 ? 0 : 0);
  window.__timelines = window.__timelines || {}; window.__timelines['main'] = tl;
  const q = new URLSearchParams(location.search); if (q.get('t')) tl.seek(+q.get('t'));
})();
