// ===== MONTADOR 2.5D estilo RicksClips: 6 ângulos, transições fluidas, placas diegéticas, zero tranco de 1.4s =====
const ATORES = {};
const CHAO = 1560;

function renderPlaca(pl, idx) {
  // Placa/tela diegética ancorada DENTRO do cenário (substitui HUD flutuante de meme!)
  const est = pl.estilo || 'madeira';
  const x = pl.x || 900, y = pl.y || 780, s = pl.s || 1;
  const txt = String(pl.txt || '');
  const w = Math.max(240, txt.length * 34 + 70), h = pl.sub ? 136 : 92;
  if (est === 'tela') {
    return `<g transform="translate(${x},${y}) scale(${s})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="12" fill="#0d1726" stroke="#364fc7" stroke-width="6"/><text x="0" y="${pl.sub ? -6 : 14}" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="900" font-size="40" fill="${pl.cor || '#69db7c'}">${txt}</text>${pl.sub ? `<text x="0" y="38" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="700" font-size="24" fill="#bac8ff">${pl.sub}</text>` : ''}</g>`;
  }
  return `<g transform="translate(${x},${y}) scale(${s})"><line x1="-80" y1="${h / 2}" x2="-80" y2="${h / 2 + 120}" stroke="#4a2f18" stroke-width="14"/><line x1="80" y1="${h / 2}" x2="80" y2="${h / 2 + 120}" stroke="#4a2f18" stroke-width="14"/><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="10" fill="#7c4d25" stroke="${OL}" stroke-width="5.5"/><text x="0" y="${pl.sub ? -4 : 14}" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="900" font-size="38" fill="${pl.cor || '#fff3bf'}">${txt}</text>${pl.sub ? `<text x="0" y="38" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="800" font-size="24" fill="#ffd8a8">${pl.sub}</text>` : ''}</g>`;
}

function renderOTS(lado) {
  // Silhueta desfocada de nuca/ombro no primeiro plano (Over-the-Shoulder clássico RicksClips)
  const x = lado === 'dir' ? 1480 : 320;
  return `<g transform="translate(${x}, 1940)" opacity=".92" filter="url(#blur6)"><path d="M-290 0 Q-260 -320 0 -340 Q260 -320 290 0Z" fill="#0c101a"/><circle cx="0" cy="-520" r="195" fill="#0e1320"/></g>`;
}

function renderPOV(pl) {
  // Mãos grandes em primeira pessoa saindo da borda inferior segurando objeto
  const pr = pl.pov_prop ? (props[pl.pov_prop] || '') : '';
  return `<g id="pov_wrap" transform="translate(540, 1690)"><g transform="translate(0,-150) scale(2.35)">${pr}</g><ellipse cx="-165" cy="95" rx="95" ry="68" transform="rotate(-24 -165 95)" fill="#f4f5f9" stroke="${OL}" stroke-width="9"/><ellipse cx="165" cy="95" rx="95" ry="68" transform="rotate(24 165 95)" fill="#f4f5f9" stroke="${OL}" stroke-width="9"/></g>`;
}

(function montar() {
  let html = sharedDefs() + EXTRA_DEFS, hud = '';
  PLAN.forEach((pl, i) => {
    const S = 'p' + i; let chars = '', front = '', fgExtra = '';
    const sunDir = (CEN[pl.cena] || {}).sol === 'dir' ? -1 : 1;

    (pl.placas || []).forEach((pk, j) => { chars += renderPlaca(pk, j); });

    (pl.objetos || []).forEach((ob, j) => {
      const body = ob.img ? `<image href="cen/${ob.img}.png" x="${-(ob.w || 300) / 2}" y="${-(ob.h || 300)}" width="${ob.w || 300}" height="${ob.h || 300}" preserveAspectRatio="xMidYMax meet"/>` : ob.svg || OBJ[ob.tipo] || (ob.prop ? props[ob.prop] : '') || '';
      const g = `<g id="${S}_o${j}" transform="translate(${ob.x || 900},${ob.y === undefined ? CHAO : ob.y}) rotate(${ob.r || 0}) scale(${ob.s || 1})" opacity="${ob.oculto ? 0 : 1}"><g id="${S}_o${j}i">${body}</g></g>`;
      if (ob.frente) front += g; else chars += g;
    });

    (pl.atores || []).forEach((a, j) => {
      const p = `${S}_${a.id}${j}`; a._p = p; const baseCfg = EP.elenco[a.id] || {};
      const cfg = Object.assign({}, baseCfg, {
        x: a.x || 900, y: a.y || CHAO, s: a.s || 1, flip: a.flip || 1, sunDir,
        rim: (CEN[pl.cena] || {}).rim ? { col: pl.rim || (CEN[pl.cena].rim), side: (CEN[pl.cena].sol === 'esq' ? -1 : 1) * (a.flip || 1) } : null
      });
      cfg.segura = { D: [...new Set([...(baseCfg.segura && baseCfg.segura.D || []), ...(a.segura && a.segura.D || [])])], E: [...new Set([...(baseCfg.segura && baseCfg.segura.E || []), ...(a.segura && a.segura.E || [])])] };
      ATORES[p] = cfg; const svg = personagem(p, cfg);
      chars += a.invis ? `<g opacity="${a.invis}">${svg}</g>` : svg;
    });

    if (pl.angulo === 'ots_esq') fgExtra += renderOTS('esq');
    if (pl.angulo === 'ots_dir') fgExtra += renderOTS('dir');

    // Compatibilidade com episódios antigos que tenham pl.texto:
    (pl.texto || []).forEach((tx, j) => {
      let tt = String(tx.txt);
      const fs = Math.min(tx.tam || 96, 720 / Math.max(6, tt.length * .62));
      hud += `<div class="hudt" id="${S}_t${j}" style="font-size:${fs}px;color:${tx.cor || '#fff'};-webkit-text-stroke:${fs / 10}px #111">${tt}</div>`;
    });

    const dimMid = pl.diagrama ? ' style="filter:brightness(0.36) blur(5px)"' : '';
    const povSvg = pl.angulo === 'pov' ? `<svg class="chars" viewBox="0 0 1080 1920" style="width:1080px;height:1920px;z-index:4">${renderPOV(pl)}</svg>` : '';
    html += `<div class="scene" id="${S}" style="opacity:${pl.fantasma ? 0.4 : 1}"><div class="lay" id="${S}_far"${dimMid}><img src="cen/${pl.cena}_far.png"></div><div class="lay" id="${S}_mid"${dimMid}><img src="cen/${pl.cena}_mid.png"><svg class="chars" viewBox="0 0 1800 1920" xmlns="http://www.w3.org/2000/svg">${chars}${front}</svg></div><div class="lay" id="${S}_fg"${dimMid}><img src="cen/${pl.cena}_fg.png">${fgExtra ? `<svg class="chars" viewBox="0 0 1800 1920">${fgExtra}</svg>` : ''}</div>${povSvg}</div>`;
  });

  $('#stage').innerHTML = html; $('#hudl').innerHTML = hud;

  // ---------- TIMELINE: transições suaves estilo Rick + câmera em movimento contínuo 100% do plano ----------
  PLAN.forEach((pl, i) => {
    const S = 'p' + i, t0 = pl.t0, d = pl.dur;
    const prev = i > 0 ? PLAN[i - 1] : null;
    // Transição inteligente: dissolve rápido (0.16s) em continuidade, corte seco em impacto/mudança brusca, whip em viagem
    const tr = pl.transicao || (i === 0 ? 'corte' : (prev && prev.cena !== pl.cena ? 'dissolve' : 'corte'));
    const ov = tr === 'dissolve' ? Math.min(pl.dissolve || 0.3, d * 0.3) : 0; // medido: 0,2–0,4 s

    tl.set('#' + S, { display: 'block', zIndex: i + 1 }, Math.max(0, t0 - ov));
    if (ov > 0) tl.fromTo('#' + S, { opacity: 0 }, { opacity: 1, duration: ov, ease: 'sine.inOut' }, Math.max(0, t0 - ov));
    if (tr === 'whip') {
      tl.fromTo('#' + S, { x: 420, filter: 'url(#whipBlur)' }, { x: 0, duration: .14, ease: 'power3.out' }, t0);
      tl.set('#' + S, { filter: 'none' }, t0 + .15);
    }
    const nextOv = (PLAN[i + 1] && (PLAN[i + 1].transicao === 'dissolve' || (!PLAN[i + 1].transicao && PLAN[i + 1].cena !== pl.cena))) ? 0.4 : 0;
    tl.set('#' + S, { display: 'none' }, t0 + d + nextOv);

    // Ângulo inclinado opcional (Dutch tilt cinematográfico) ou baixo/topo
    const tilt0 = pl.tilt || (pl.angulo === 'baixo' ? -1.5 : 0);
    tl.set('#' + S, { rotation: tilt0, transformOrigin: '50% 50%' }, Math.max(0, t0 - ov));

    // Câmera viaja DO INÍCIO AO FIM do plano (zero vai-e-volta artificial!)
    const c = pl.cam || [[900, 1220, 1.3], [900, 1220, 1.48]];
    cam(S, Math.max(0, t0 - ov), 0, c[0]);
    if (c[1]) cam(S, t0, d, c[1], pl.ease || 'none');

    const cen = CEN[pl.cena] || {};
    tl.set('#grade', { background: pl.luz || cen.grade || 'none' }, t0);

    (pl.atores || []).forEach((a, aj) => {
      const p = a._p;
      for (const s of ['D', 'E']) P(`${p}_u${s}`, 0, 0, { r: BASE['u' + s] });
      expr(p, 0, a.expr || 'neutral', 0);
      if (a.olhar) look(p, 0, 0, a.olhar[0], a.olhar[1]);
      (a.pega || []).forEach(([s, n]) => { pega(p, s, 0, n); arm(p, s, 0, 0, s === 'D' ? -38 : 38, -84); });
      let k = t0 + (a.atraso || 0);
      const lst = a.acoes || [['parado']];
      const fixo = lst.reduce((s, x) => s + (x[1] || 0), 0), livres = lst.filter(x => !x[1]).length;
      lst.forEach(([nome, dd, o]) => {
        const du = dd || Math.max(.35, (t0 + d - k - (fixo - (dd || 0))) / Math.max(1, livres));
        acao(nome, p, k, Math.min(du, t0 + d - k), o || {});
        k += du;
      });
      // Piscadas dessincronizadas entre personagens (ninguém pisca em uníssono robótico!)
      const bOffset = 0.42 + (aj * 0.67) % 1.5;
      blink(p, Array.from({ length: Math.floor(d / 2.3) }, (_, q) => t0 + bOffset + q * 2.3).filter(bt => bt < t0 + d - .2));
    });

    (pl.objetos || []).forEach((ob, j) => {
      const id = `#${S}_o${j}`;
      if (ob.aparece !== undefined) OP(id, t0 + ob.aparece, 1);
      if (ob.some !== undefined) OP(id, t0 + ob.some, 0);
      if (ob.anim) {
        const A = ob.anim;
        tl.to(id + 'i', { x: A.dx || 0, y: A.dy || 0, rotation: A.r || 0, scale: A.s || 1, svgOrigin: '0 -50', duration: A.dur || d, ease: A.ease || 'power1.inOut' }, t0 + (A.em || 0));
      }
      // Vida secundária automática: fogueira oscila suavemente!
      if (ob.tipo === 'fogueira') {
        for (let ft = t0, fk = 0; ft < t0 + d; ft += .14, fk++) {
          tl.to(id + 'i', { scaleY: fk % 2 ? 1.06 : .95, scaleX: fk % 2 ? .97 : 1.03, svgOrigin: '0 0', duration: .14, ease: 'sine.inOut' }, ft);
        }
      }
    });

    if (pl.diagrama) montarDiagrama(S, pl.diagrama, t0, d);

    (pl.texto || []).forEach((tx, j) => {
      tl.fromTo(`#${S}_t${j}`, { opacity: 0, scale: .6 }, { opacity: 1, scale: 1, duration: .2, ease: 'back.out(2)' }, t0 + (tx.em || .1));
      tl.set(`#${S}_t${j}`, { opacity: 0 }, t0 + d);
    });

    (pl.fx || []).forEach(([f, em, a, b, c2]) => {
      const T = t0 + (em || 0);
      if (f === 'shake') shake(T, a || 12, b || 7);
      if (f === 'flash') flash(T, a, b, c2);
      if (f === 'linhas') speedLines(T, a || .6);
      if (f === 'impacto') impactFrame(T);
      if (f === 'congela') congela(T, a || .5);
      if (f === 'estrelas') estrelas(a, b, T);
      if (f === 'fumaca') fumaca(a, b, T);
      if (f === 'poeira') poeira(S + '_mid', a, b, T);
      if (f === 'faiscas') faiscas(S + '_mid', a || 900, b || 1480, T, c2 || .45);
      if (f === 'explosao') explosaoHorizonte(S + '_far', a || 900, b || 1260, T, c2 || d);
      if (f === 'suor') { const at = (pl.atores || [])[a || 0]; if (at) suor(at._p, T); }
    });
  });

  // Respiração sutil de câmera orgânica (±3.2px, sem chacoalhar nem entortar!)
  tl.set('#stage', { transformOrigin: '50% 50%' }, 0);
  for (let t = 0, k = 0; t < DUR; t += .75, k++) {
    tl.to('#stage', { x: Math.sin(k * 1.6) * 3.2, y: Math.cos(k * 2.1) * 2.8, duration: .75, ease: 'sine.inOut' }, t);
  }

  // Grão de película 12 fps
  for (let t = 0, i = 0; t < DUR; t += 1 / 12, i++) tl.set('#grain', { backgroundPosition: `${(i * 137) % 540}px ${(i * 251) % 960}px` }, t);

  // ---------- LEGENDA CINÉTICA PADRÃO RICKSCLIPS (1–3 palavras, Sentence case, zona segura y=1360) ----------
  $('#cap').innerHTML = WORDS.map((w, i) => `<span id="w${i}">${w[0]}</span>`).join('');
  WORDS.forEach((w, i) => {
    tl.fromTo('#w' + i, { opacity: 1, scale: .93 }, { opacity: 1, scale: 1, duration: Math.min(.06, (w[2] - w[1]) * .35), ease: 'power2.out' }, w[1]);
    tl.set('#w' + i, { opacity: 0 }, w[2]);
  });

  // Corte seco no fim igual RicksClips (sem fade-out lento matando o punchline!)
  tl.set('#fade', { opacity: 0 }, 0);

  window.__timelines = window.__timelines || {}; window.__timelines['main'] = tl;
  const q = new URLSearchParams(location.search); if (q.get('t')) tl.seek(+q.get('t'));
})();
