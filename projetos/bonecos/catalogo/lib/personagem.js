// ===== personagem({pele, roupa, calca, acessorios}) — rig ÚNICO do Tião + elenco estilo RicksClips =====
const PELES = { branca: ['#fff', 'pele'], morena: ['#e0ac84', 'peleP'], parda: ['#e8b48a', 'peleV'], escura: ['#8a5a3a', 'peleE'] };
const _tPath = (tw, yb = 6) => `M${-tw + 6} -156 Q${-tw} -176 0 -176 Q${tw} -176 ${tw - 6} -156 Q${tw + 4} -82 ${tw - 4} ${yb - 18} Q${tw - 8} ${yb} 0 ${yb} Q${-tw + 8} ${yb} ${-tw + 4} ${yb - 18} Q${-tw - 4} -82 ${-tw + 6} -156Z`;
const _tShad = (tw, yb = 6) => `<path d="M${tw - 18} -172 Q${tw + 2} -82 ${tw - 6} ${yb - 14} Q${tw - 12} ${yb} ${tw - 24} ${yb - 2} Q${tw - 10} -82 ${tw - 18} -172Z" fill="#000" opacity=".16"/>`;
const _tHem = (tw, y = -6) => `<path d="M${-tw + 7} ${y} Q0 ${y + 5} ${tw - 7} ${y}" stroke="${OL}" stroke-opacity=".36" stroke-width="2" stroke-dasharray="5 4" fill="none"/>`;

const ROUPA = {
  camiseta: c => (p, tw) =>
    `<path d="${_tPath(tw)}" fill="${c}" stroke="${OL}" stroke-width="4.8"/>` + _tShad(tw) +
    `<path d="M-21 -175 Q0 -150 21 -175" fill="#000" fill-opacity=".12" stroke="${OL}" stroke-width="3.6" stroke-linecap="round"/>` +
    `<path d="M12 -130 H33 V-110 Q22 -105 12 -110Z" fill="${c}" stroke="${OL}" stroke-width="2.5" stroke-linejoin="round"/>` + _tHem(tw),
  regata: c => (p, tw) =>
    `<path d="M${-tw + 16} -175 H${-tw + 32} Q-14 -144 0 -144 Q14 -144 ${tw - 32} -175 H${tw - 16} Q${tw - 10} -148 ${tw - 2} -128 Q${tw + 3} -68 ${tw - 4} -12 Q${tw - 8} 6 0 6 Q${-tw + 8} 6 ${-tw + 4} -12 Q${-tw - 3} -68 ${-tw + 2} -128 Q${-tw + 10} -148 ${-tw + 16} -175Z" fill="${c}" stroke="${OL}" stroke-width="4.6" stroke-linejoin="round"/>` + _tShad(tw) + _tHem(tw),
  tunica: c => (p, tw) =>
    `<path d="M${-tw + 5} -158 Q${-tw} -176 0 -176 Q${tw} -176 ${tw - 5} -158 L${tw + 4} 18 Q0 28 ${-tw - 4} 18Z" fill="${c}" stroke="${OL}" stroke-width="4.8" stroke-linejoin="round"/>` +
    _tShad(tw, 18) +
    `<path d="M${-tw + 4} -175 Q0 -124 ${tw - 4} -175" fill="#246aa0" stroke="${OL}" stroke-width="3.6"/>` +
    `<path d="M${-tw + 10} -172 Q0 -135 ${tw - 10} -172" stroke="#e8b830" stroke-width="6" fill="none" stroke-linecap="round"/>` +
    `<rect x="${-tw}" y="-36" width="${tw * 2}" height="14" rx="4" fill="#b88c34" stroke="${OL}" stroke-width="3.4"/>` +
    `<rect x="-11" y="-38" width="22" height="18" rx="4" fill="#e8b830" stroke="${OL}" stroke-width="3"/>`,
  farao: c => (p, tw) =>
    ROUPA.tunica(c)(p, tw) +
    `<path d="M${-tw + 3} -173 Q0 -102 ${tw - 3} -173" fill="none" stroke="${OL}" stroke-width="19"/>` +
    `<path d="M${-tw + 3} -173 Q0 -102 ${tw - 3} -173" fill="none" stroke="#e8b830" stroke-width="13"/>` +
    `<path d="M${-tw + 3} -173 Q0 -102 ${tw - 3} -173" fill="none" stroke="#1f4fa3" stroke-width="5" stroke-dasharray="7 7"/>` +
    `<path d="M-15 -22 H15 L11 24 L0 30 L-11 24Z" fill="#e8b830" stroke="${OL}" stroke-width="3.4" stroke-linejoin="round"/>`,
  uniforme: c => (p, tw) =>
    `<path d="${_tPath(tw)}" fill="${c}" stroke="${OL}" stroke-width="4.8"/>` + _tShad(tw) +
    `<path d="M-22 -175 L-18 -148 L-2 -162 M22 -175 L18 -148 L2 -162" fill="${c}" stroke="${OL}" stroke-width="3.2" stroke-linejoin="round"/>` +
    `${[-144, -116, -88, -60].map(y => `<circle cx="0" cy="${y}" r="3.8" fill="#e8c030" stroke="${OL}" stroke-width="1.8"/>`).join('')}` +
    `<path d="M18 -150 l9 -4 l9 4 l-2 13 l-7 6 l-7 -6Z" fill="#e8c030" stroke="${OL}" stroke-width="2.4" stroke-linejoin="round"/>` +
    `<rect x="${-tw}" y="-32" width="${tw * 2}" height="14" rx="3" fill="#1c1e24" stroke="${OL}" stroke-width="3"/>` +
    `<rect x="-10" y="-34" width="20" height="18" rx="3" fill="#d8b22e" stroke="${OL}" stroke-width="2.6"/>`,
  moletom: c => (p, tw) =>
    `<path d="${_tPath(tw)}" fill="${c}" stroke="${OL}" stroke-width="4.8"/>` + _tShad(tw) +
    `<path d="M-26 -175 Q-22 -146 0 -142 Q22 -146 26 -175" fill="${c}" stroke="${OL}" stroke-width="3.8"/>` +
    `<path d="M-8 -150 V-118 M8 -150 V-118" stroke="#eceef2" stroke-width="3.2" stroke-linecap="round"/>` +
    `<path d="M-27 -66 H27 L33 -20 H-33Z" fill="${c}" stroke="${OL}" stroke-width="3.2" stroke-linejoin="round"/>`,
  social: c => (p, tw) =>
    `<path d="${_tPath(tw)}" fill="${c}" stroke="${OL}" stroke-width="4.8"/>` + _tShad(tw) +
    `<path d="M-21 -175 L-24 -146 L-2 -158 L0 -166Z M21 -175 L24 -146 L2 -158 L0 -166Z" fill="${c}" stroke="${OL}" stroke-width="3.2" stroke-linejoin="round"/>` +
    `${[-144, -116, -88, -60, -32].map(y => `<circle cx="0" cy="${y}" r="3.4" fill="#f2f4f7" stroke="${OL}" stroke-width="1.8"/>`).join('')}`,
  jaqueta: c => (p, tw) =>
    `<path d="${_tPath(tw)}" fill="#f2f3f5" stroke="${OL}" stroke-width="4.8"/>` +
    `<path d="M${-tw + 6} -156 Q${-tw} -176 -14 -176 L-12 5 Q${-tw + 8} 5 ${-tw + 4} -14 Q${-tw - 4} -82 ${-tw + 6} -156Z" fill="${c}" stroke="${OL}" stroke-width="4.2"/>` +
    `<path d="M14 -176 Q${tw} -176 ${tw - 6} -156 Q${tw + 4} -82 ${tw - 4} -14 Q${tw - 8} 5 12 5Z" fill="${c}" stroke="${OL}" stroke-width="4.2"/>` + _tShad(tw),
  terno: c => (p, tw) =>
    `<path d="${_tPath(tw)}" fill="${c}" stroke="${OL}" stroke-width="4.8"/>` +
    `<path d="M-21 -175 L0 -92 L21 -175Z" fill="#f6f7f9" stroke="${OL}" stroke-width="3.2"/>` +
    `<path d="M-5 -166 H5 L7 -110 L0 -96 L-7 -110Z" fill="#b8262e" stroke="${OL}" stroke-width="2.4"/>` + _tShad(tw),
  // ----- Roupas novas estilo RicksClips (históricas / sci-fi / crime) -----
  quimono: c => (p, tw) =>
    `<path d="M${-tw + 4} -158 Q${-tw} -176 0 -176 Q${tw} -176 ${tw - 4} -158 L${tw + 6} 14 Q0 24 ${-tw - 6} 14Z" fill="${c}" stroke="${OL}" stroke-width="4.8" stroke-linejoin="round"/>` +
    _tShad(tw, 14) +
    `<path d="M-22 -175 L14 -42 M22 -175 L-6 -96" stroke="#e8dec8" stroke-width="9" stroke-linecap="round"/>` +
    `<path d="M-22 -175 L14 -42 M22 -175 L-6 -96" stroke="${OL}" stroke-width="3.2" stroke-linecap="round"/>` +
    `<rect x="${-tw - 2}" y="-44" width="${tw * 2 + 4}" height="22" rx="5" fill="#263342" stroke="${OL}" stroke-width="3.8"/>` +
    `<path d="M-${tw - 4} -33 H${tw - 4}" stroke="#d9a838" stroke-width="3" opacity=".75"/>`,
  armadura: c => (p, tw) =>
    `<path d="${_tPath(tw, 12)}" fill="${c}" stroke="${OL}" stroke-width="5"/>` +
    `${[-142, -116, -90, -64].map(y => `<path d="M${-tw + 4} ${y} H${tw - 4}" stroke="#14100c" stroke-width="5"/><path d="M${-tw + 6} ${y - 4} H${tw - 6}" stroke="#d9a73a" stroke-width="2.6"/>`).join('')}` +
    `<path d="M${-tw - 10} -170 H${-tw + 14} L${-tw + 8} -124 H${-tw - 14}Z M${tw - 14} -170 H${tw + 10} L${tw + 14} -124 H${tw - 8}Z" fill="${c}" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/>` +
    `<rect x="${-tw - 2}" y="-38" width="${tw * 2 + 4}" height="16" rx="4" fill="#1c1815" stroke="${OL}" stroke-width="3.6"/>` +
    `<circle cx="0" cy="-30" r="7" fill="#e8b830" stroke="${OL}" stroke-width="2.5"/>` + _tShad(tw, 12),
  capitao: c => (p, tw) =>
    `<path d="M${-tw + 2} -158 Q${-tw} -176 0 -176 Q${tw} -176 ${tw - 2} -158 L${tw + 8} 16 Q0 26 ${-tw - 8} 16Z" fill="${c}" stroke="${OL}" stroke-width="5"/>` +
    `<path d="M-24 -174 L0 -54 L24 -174" fill="none" stroke="#e8b830" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="M-24 -174 L0 -54 L24 -174" fill="none" stroke="${OL}" stroke-width="3.2" stroke-linecap="round"/>` +
    `<rect x="${-tw - 3}" y="-42" width="${tw * 2 + 6}" height="18" rx="4" fill="#1f1826" stroke="${OL}" stroke-width="3.6"/>` +
    `<circle cx="0" cy="-33" r="8" fill="#ffd24a" stroke="${OL}" stroke-width="2.8"/>` + _tShad(tw, 16),
  astronauta: c => (p, tw) =>
    `<path d="${_tPath(tw)}" fill="${c}" stroke="${OL}" stroke-width="4.8"/>` + _tShad(tw) +
    `<rect x="-22" y="-138" width="44" height="32" rx="6" fill="#dfe6f0" stroke="${OL}" stroke-width="3.2"/>` +
    `<circle cx="-9" cy="-122" r="5" fill="#e03131"/><circle cx="9" cy="-122" r="5" fill="#2b8a3e"/>` +
    `<path d="M-28 -174 L-18 -20 M28 -174 L18 -20" stroke="#3a4250" stroke-width="7"/>`,
  presidiario: c => (p, tw) =>
    `<path d="${_tPath(tw)}" fill="${c || '#e67722'}" stroke="${OL}" stroke-width="4.8"/>` + _tShad(tw) +
    `<path d="M-18 -175 Q0 -154 18 -175" fill="#ffffff" stroke="${OL}" stroke-width="3.2"/>` +
    `<rect x="10" y="-134" width="28" height="16" rx="3" fill="#ffffff" stroke="${OL}" stroke-width="2.4"/>` +
    `<path d="M14 -126 H34" stroke="#14100c" stroke-width="3" stroke-dasharray="3 2"/>`,
};

const ACESS = {
  // Barba do Tião REFEITA (24/11): curta, aparada no maxilar, contorno limpo, sem cobrir a boca nem parecer babador!
  barba: {
    face:
      `<path d="M-83 18 C-80 58 -46 86 0 88 C46 86 80 58 83 18 L73 16 C67 48 40 69 0 70 C-40 69 -67 48 -73 16 Z" fill="#858b97" stroke="${OL}" stroke-width="4.2" stroke-linejoin="round"/>` +
      `<path d="M-64 56 C-40 76 -10 84 26 81 C52 77 72 60 79 34 C66 60 40 74 4 75 C-28 75 -50 67 -64 56 Z" fill="#5e6470"/>` +
      `<path d="M-22 36 Q-8 27 5 33 Q18 27 32 36 Q20 42 5 39 Q-10 42 -22 36 Z" fill="#858b97" stroke="${OL}" stroke-width="3.4" stroke-linejoin="round"/>`
  },
  bigode: { face: `<g transform="translate(6,-4)"><path d="M-30 42 Q-12 29 4 39 Q20 29 38 42 Q30 51 4 47 Q-22 51 -30 42Z" fill="#7a7f8a" stroke="${OL}" stroke-width="3.4"/></g>` },
  cavanhaque: { face: `<path d="M-20 35 Q0 27 22 35 Q12 41 0 38 Q-12 41 -20 35Z" fill="#2b2724" stroke="${OL}" stroke-width="3"/><path d="M-14 68 L0 88 L14 68 Q0 73 -14 68Z" fill="#2b2724" stroke="${OL}" stroke-width="3.2" stroke-linejoin="round"/>` },
  tapa_olho: { face: `<path d="M-82 -26 L78 2" stroke="${OL}" stroke-width="5"/><ellipse cx="36" cy="-7" rx="22" ry="20" fill="#181a20" stroke="${OL}" stroke-width="4"/>` },
  oculos_escuros: { face: `<g transform="translate(4,-6)"><rect x="-56" y="-22" width="52" height="38" rx="10" fill="#14181e" stroke="${OL}" stroke-width="4"/><rect x="8" y="-22" width="52" height="38" rx="10" fill="#14181e" stroke="${OL}" stroke-width="4"/><path d="M-4 -6 H8" stroke="${OL}" stroke-width="5"/><path d="M-48 -14 h16 M16 -14 h16" stroke="#fff" stroke-opacity=".5" stroke-width="4"/></g>` },
  mascara: { face: `<g transform="translate(4,-6)"><path d="M-82 -26 Q4 -44 88 -26 Q92 14 68 20 Q38 22 6 6 Q-26 22 -58 20 Q-86 14 -82 -26Z" fill="#14181e" stroke="${OL}" stroke-width="4"/><ellipse cx="-28" cy="-4" rx="17" ry="13" fill="#fff"/><ellipse cx="34" cy="-4" rx="17" ry="13" fill="#fff"/></g>` },
  faixa_testa: { hat: `<g><path d="M-87 -34 Q0 -48 87 -34 L85 -16 Q0 -30 -85 -16Z" fill="#e8b830" stroke="${OL}" stroke-width="4.2"/><path d="M-84 -25 L-114 -10 L-106 6 L-82 -16Z" fill="#e8b830" stroke="${OL}" stroke-width="3.6"/></g>` },
  coque_samurai: { hat: `<g><path d="M-84 -32 Q-76 -92 0 -94 Q76 -92 84 -32 Q42 -56 0 -56 Q-42 -56 -84 -32Z" fill="#23201e" stroke="${OL}" stroke-width="4.5"/><ellipse cx="0" cy="-104" rx="24" ry="18" fill="#23201e" stroke="${OL}" stroke-width="4.5"/><rect x="-16" y="-92" width="32" height="9" rx="4" fill="#e8b830" stroke="${OL}" stroke-width="2.8"/></g>` },
  kasa: { hat: `<g transform="translate(0,-62)"><path d="M-142 16 L0 -54 L142 16 Q0 30 -142 16Z" fill="#3a332c" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/><path d="M-96 -4 L0 -50 L96 -4" fill="#52473d"/><ellipse cx="0" cy="-24" rx="26" ry="8" fill="none" stroke="#e8b830" stroke-width="4.5"/></g>` },
  kabuto: { hat: `<g transform="translate(0,-54)"><path d="M-104 22 L-126 56 L-76 48 L-70 10 Z M104 22 L126 56 L76 48 L70 10 Z" fill="#1e2026" stroke="${OL}" stroke-width="4.5"/><path d="M-94 14 Q-98 -68 0 -74 Q98 -68 94 14Z" fill="#1e2026" stroke="${OL}" stroke-width="5"/><path d="M-12 -52 L-92 -136 L-54 -62 Z M12 -52 L92 -136 L54 -62 Z" fill="#f0c030" stroke="${OL}" stroke-width="4.5" stroke-linejoin="round"/><circle cx="0" cy="-42" r="14" fill="#e03131" stroke="${OL}" stroke-width="3.5"/></g>` },
  chapeu_imperial: { hat: `<g transform="translate(0,-66)"><ellipse cx="0" cy="8" rx="134" ry="20" fill="#2b1e38" stroke="${OL}" stroke-width="5"/><path d="M-74 6 Q-70 -54 0 -58 Q70 -54 74 6Z" fill="#462d5c" stroke="${OL}" stroke-width="4.8"/><circle cx="0" cy="-24" r="11" fill="#ffd24a" stroke="${OL}" stroke-width="3"/></g>` },
  chapeu_explorador: { hat: `<g transform="translate(0,-72)"><ellipse cx="0" cy="10" rx="138" ry="25" fill="#a8844a" stroke="${OL}" stroke-width="5"/><path d="M-80 10 Q-84 -60 0 -64 Q84 -60 80 10Z" fill="#c8a462" stroke="${OL}" stroke-width="5"/><path d="M-80 -4 Q0 8 80 -4 L80 8 Q0 20 -80 8Z" fill="#6a4a24"/></g>` },
  nemes: { hat: `<g><path d="M-96 -20 Q-100 -110 0 -112 Q100 -110 96 -20 L120 110 L80 110 L70 20 Q0 -10 -70 20 L-80 110 L-120 110Z" fill="#e8b830" stroke="${OL}" stroke-width="5" stroke-linejoin="round"/>${[-90, -70, -50, -30].map(y => `<path d="M-94 ${y} Q0 ${y - 30} 94 ${y}" stroke="#2050a8" stroke-width="9" fill="none"/>`).join('')}</g>` },
  quepe: { hat: `<g transform="translate(0,-60)"><path d="M-86 0 Q-90 -64 0 -70 Q90 -64 86 0Z" fill="#1e2a4a" stroke="${OL}" stroke-width="5"/><path d="M-88 0 H96 Q120 6 120 18 H-60Z" fill="#14181e" stroke="${OL}" stroke-width="4.5"/><path d="M-86 -8 H86" stroke="#e8c030" stroke-width="6"/></g>` },
  gorro: { hat: `<g transform="translate(0,-56)"><path d="M-90 10 Q-96 -74 0 -80 Q96 -74 90 10Z" fill="#26282e" stroke="${OL}" stroke-width="5"/><rect x="-94" y="-6" width="188" height="28" rx="10" fill="#33363d" stroke="${OL}" stroke-width="4.5"/></g>` },
  capacete_obra: { hat: `<g transform="translate(0,-66)"><path d="M-92 14 Q-94 -70 0 -74 Q94 -70 92 14Z" fill="#f0c020" stroke="${OL}" stroke-width="5"/><path d="M-110 14 H110" stroke="${OL}" stroke-width="12" stroke-linecap="round"/><path d="M-110 14 H110" stroke="#f0c020" stroke-width="6" stroke-linecap="round"/></g>` },
  lenco_cabeca: { hat: `<g transform="translate(0,-60)"><path d="M-92 20 Q-96 -64 0 -70 Q96 -64 92 20 Q0 -4 -92 20Z" fill="#f2ead8" stroke="${OL}" stroke-width="5"/><path d="M-92 20 L-110 90 L-80 90 L-78 30" fill="#f2ead8" stroke="${OL}" stroke-width="4"/></g>` },
};

const tearsSVG = p => `<g id="${p}_tears" opacity="0"><path d="M-28 18 q-6 40 -2 86" stroke="#8fd4ff" stroke-width="8.5" fill="none" stroke-linecap="round" opacity=".9"/><path d="M36 18 q6 40 2 86" stroke="#8fd4ff" stroke-width="8.5" fill="none" stroke-linecap="round" opacity=".9"/></g>`;

// ---------- props na mão (centro no punho, orientados pelo uso) ----------
Object.assign(props, {
  jarro: `<g transform="translate(0,34)"><path d="M-26 -30 Q-46 10 -30 48 Q0 62 30 48 Q46 10 26 -30Z" fill="#c4743a" stroke="${OL}" stroke-width="5"/><path d="M-18 -30 V-46 H18 V-30" fill="#a85a2a" stroke="${OL}" stroke-width="4.5"/><path d="M-30 6 H30" stroke="#7a3a18" stroke-width="4"/><g class="agua" opacity="0"><path d="M0 -48 Q8 -120 4 -240" stroke="#8fd8ff" stroke-width="16" fill="none" stroke-linecap="round" opacity=".85"/></g></g>`,
  lixo: `<g transform="translate(0,40)"><path d="M-10 -26 Q-62 -4 -56 48 Q-44 84 0 84 Q44 84 56 48 Q62 -4 10 -26Z" fill="#23262d" stroke="${OL}" stroke-width="5"/><path d="M-30 6 Q-20 30 -34 58" stroke="#5a606c" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M-12 -26 L-18 -44 M12 -26 L18 -44" stroke="#23262d" stroke-width="9" stroke-linecap="round"/></g>`,
  saco: `<g transform="translate(0,40)"><path d="M-14 -24 Q-60 0 -54 50 Q-40 82 0 82 Q40 82 54 50 Q60 0 14 -24Z" fill="#c8b07a" stroke="${OL}" stroke-width="5"/><text x="0" y="52" font-size="42" font-family="Montserrat,Anton" font-weight="900" text-anchor="middle" fill="#2a6a2a">$</text></g>`,
  ouro: `<g transform="translate(0,26)"><path d="M-40 -14 L-28 -30 H28 L40 -14 V14 H-40Z" fill="#f0c030" stroke="${OL}" stroke-width="4.5"/><path d="M-30 -24 H10" stroke="#fff6c0" stroke-width="5"/></g>`,
  lanterna: `<g transform="translate(0,20)"><rect x="-12" y="-30" width="24" height="70" rx="6" fill="#30343a" stroke="${OL}" stroke-width="4"/><rect x="-18" y="-46" width="36" height="20" rx="5" fill="#50555c" stroke="${OL}" stroke-width="4"/></g>`,
  papiro: `<g transform="translate(0,20)"><rect x="-44" y="-50" width="88" height="100" fill="#ecdca8" stroke="${OL}" stroke-width="4"/><path d="M-30 -30 h50 M-30 -14 h40 M-30 2 h56" stroke="#6a4a2a" stroke-width="4"/></g>`,
  chicote: `<g transform="translate(0,10)"><rect x="-7" y="-10" width="14" height="60" rx="5" fill="#6a3a1a" stroke="${OL}" stroke-width="3.5"/><path d="M0 50 Q40 120 -20 180 Q-60 220 10 250" stroke="#4a2a10" stroke-width="7" fill="none" stroke-linecap="round"/></g>`,
  // Novos props RicksClips:
  bomba_ferro: `<g transform="translate(10,18)"><circle cx="0" cy="0" r="54" fill="url(#ironBallG)" stroke="${OL}" stroke-width="5.5"/><ellipse cx="-18" cy="-20" rx="14" ry="9" transform="rotate(-30 -18 -20)" fill="#ffffff" opacity=".28"/><rect x="-14" y="-64" width="28" height="14" rx="4" fill="#3a404c" stroke="${OL}" stroke-width="4"/><path d="M0 -64 Q14 -88 30 -82" stroke="#c99b52" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="32" cy="-82" r="8" fill="#ff922b"/><circle cx="32" cy="-82" r="4" fill="#fff4bf"/></g>`,
  katana: `<g transform="translate(0,4)"><rect x="-6" y="-26" width="12" height="48" rx="4" fill="#2c221e" stroke="${OL}" stroke-width="3.5"/><ellipse cx="0" cy="-28" rx="18" ry="6" fill="#d9a830" stroke="${OL}" stroke-width="3.5"/><path d="M-5 -34 L-3 -220 Q0 -242 6 -248 L7 -34Z" fill="url(#steelG)" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/><path d="M-1 -42 L1 -232" stroke="#ffffff" stroke-width="2.5" opacity=".8"/></g>`,
  katana_quebrada: `<g transform="translate(0,4)"><rect x="-6" y="-26" width="12" height="48" rx="4" fill="#2c221e" stroke="${OL}" stroke-width="3.5"/><ellipse cx="0" cy="-28" rx="18" ry="6" fill="#d9a830" stroke="${OL}" stroke-width="3.5"/><path d="M-5 -34 L-4 -108 L3 -96 L7 -114 L7 -34Z" fill="url(#steelG)" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/></g>`,
  marreta: `<g transform="translate(0,10)"><rect x="-7" y="-210" width="14" height="250" rx="5" fill="#7a4e28" stroke="${OL}" stroke-width="4.2"/><g transform="translate(0,-206)"><rect x="-68" y="-38" width="136" height="76" rx="10" fill="url(#ironBallG)" stroke="${OL}" stroke-width="5.5"/><rect x="-72" y="-34" width="16" height="68" rx="4" fill="#5c6472" stroke="${OL}" stroke-width="3.5"/><rect x="56" y="-34" width="16" height="68" rx="4" fill="#5c6472" stroke="${OL}" stroke-width="3.5"/></g></g>`,
  lanca: `<g transform="translate(0,20)"><rect x="-5" y="-280" width="10" height="360" rx="4" fill="#6e4726" stroke="${OL}" stroke-width="3.8"/><path d="M0 -340 L-16 -276 H16Z" fill="url(#steelG)" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/><path d="M-14 -274 Q0 -262 14 -274" stroke="#e03131" stroke-width="7" fill="none"/></g>`,
  tocha: `<g transform="translate(0,6)"><path d="M-8 30 L-13 -54 H13 L8 30Z" fill="#6b4423" stroke="${OL}" stroke-width="4"/><rect x="-15" y="-58" width="30" height="14" rx="4" fill="#3b2818" stroke="${OL}" stroke-width="3.5"/><ellipse cx="0" cy="-92" rx="44" ry="52" fill="#ff922b" opacity=".32" filter="url(#blur6)"/><path d="M0 -132 C22 -96 28 -70 18 -54 C10 -44 -10 -44 -18 -54 C-28 -70 -16 -98 0 -132Z" fill="#ff7b1c" stroke="${OL}" stroke-width="3.5"/><path d="M0 -106 C11 -84 14 -68 8 -58 C4 -52 -4 -52 -8 -58 C-14 -68 -8 -84 0 -106Z" fill="#fff3bf"/></g>`,
  caneca: `<g transform="translate(0,12)"><path d="M16 -18 Q34 -18 34 0 Q34 18 16 18" fill="none" stroke="#e8dfd1" stroke-width="9"/><path d="M16 -18 Q34 -18 34 0 Q34 18 16 18" fill="none" stroke="${OL}" stroke-width="3.5"/><rect x="-20" y="-26" width="38" height="52" rx="6" fill="#d9480f" stroke="${OL}" stroke-width="4"/><ellipse cx="-1" cy="-26" rx="19" ry="5" fill="#4a2c18" stroke="${OL}" stroke-width="3"/></g>`,
});

const GRIP = { jarro: 0, saco: 0, lixo: 0, ouro: 0, lanterna: 0, papiro: 0, phone: 0, lata: 0, nota: 0, conta: 0, controle: 0, pote: 0, chicote: 20, bomba_ferro: 0, katana: 35, katana_quebrada: 35, marreta: 20, lanca: 5, tocha: 8, caneca: 0 };

// ---------- objetos de cena (origem = base no chão) ----------
const OBJ = {
  treno: `<g><ellipse cx="0" cy="10" rx="300" ry="26" fill="url(#shadG)"/><path d="M-280 -10 H250 Q300 -10 300 -50" stroke="#6a4424" stroke-width="22" fill="none" stroke-linecap="round"/><rect x="-250" y="-60" width="480" height="34" rx="6" fill="#8a5a2e" stroke="${OL}" stroke-width="5"/><g><path d="M-220 -60 L-200 -380 H190 L210 -60Z" fill="#d8c8a0" stroke="${OL}" stroke-width="6" stroke-linejoin="round"/><path d="M-200 -380 L-170 -420 H220 L190 -380Z" fill="#ece0bc" stroke="${OL}" stroke-width="5"/><path d="M190 -380 L220 -420 L240 -100 L210 -60Z" fill="#a89470" stroke="${OL}" stroke-width="5"/></g></g>`,
  poca: `<g><ellipse cx="0" cy="0" rx="240" ry="34" fill="#6a5434" opacity=".7"/><ellipse cx="10" cy="-4" rx="170" ry="20" fill="#8fbfd0" opacity=".5"/></g>`,
  pedra: `<g><path d="M-120 0 L-104 -170 L110 -176 L124 0Z" fill="#d8c8a0" stroke="${OL}" stroke-width="6"/><path d="M110 -176 L134 -196 L146 -20 L124 0Z" fill="#a89470" stroke="${OL}" stroke-width="5"/></g>`,
  barras: `<g>${[0, 1, 2, 3, 4, 5].map(i => `<g transform="translate(${(i % 3) * 84 - 84},${-Math.floor(i / 3) * 34 - 20})"><path d="M-40 -14 L-28 -30 H28 L40 -14 V14 H-40Z" fill="#f0c030" stroke="${OL}" stroke-width="4"/><path d="M-30 -24 H10" stroke="#fff6c0" stroke-width="5"/></g>`).join('')}</g>`,
  porta_cofre: `<g><circle cx="0" cy="-330" r="330" fill="#7a8088" stroke="${OL}" stroke-width="8"/><circle cx="0" cy="-330" r="270" fill="#9aa0a8" stroke="${OL}" stroke-width="6"/></g>`,
  olho: `<g><ellipse cx="0" cy="0" rx="300" ry="190" fill="#fff" stroke="${OL}" stroke-width="10"/><circle cx="0" cy="0" r="120" fill="#4a8ac8" stroke="${OL}" stroke-width="8"/><circle cx="0" cy="0" r="56" fill="#111"/><circle cx="34" cy="-36" r="20" fill="#fff"/></g>`,
  // Novos objetos de cena estilo RicksClips:
  bomba_chao: `<g><ellipse cx="0" cy="8" rx="95" ry="22" fill="url(#shadG)"/><circle cx="0" cy="-68" r="72" fill="url(#ironBallG)" stroke="${OL}" stroke-width="6.5"/><ellipse cx="-24" cy="-96" rx="20" ry="12" transform="rotate(-28 -24 -96)" fill="#ffffff" opacity=".26"/><path d="M-52 -42 A68 68 0 0 0 48 -20" stroke="#ff922b" stroke-width="4" fill="none" opacity=".55"/><rect x="-18" y="-150" width="36" height="16" rx="5" fill="#3a404c" stroke="${OL}" stroke-width="4.5"/><path d="M0 -150 Q18 -178 38 -170" stroke="#c99b52" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="40" cy="-170" r="10" fill="#ff7b1c"/><circle cx="40" cy="-170" r="5" fill="#fff9db"/></g>`,
  fogueira: `<g><ellipse cx="0" cy="0" rx="260" ry="65" fill="#ff7b1c" opacity=".26" filter="url(#blur14)"/><path d="M-95 -6 L85 -38 M-85 -38 L95 -6" stroke="#5c3a1e" stroke-width="22" stroke-linecap="round"/><path d="M-95 -6 L85 -38 M-85 -38 L95 -6" stroke="${OL}" stroke-width="4" fill="none"/><path d="M0 -175 C42 -118 58 -72 42 -24 C26 4 -26 4 -42 -24 C-58 -72 -32 -112 0 -175Z" fill="#ff6b18" stroke="${OL}" stroke-width="4.5"/><path d="M0 -128 C24 -88 32 -56 20 -26 C10 -8 -10 -8 -20 -26 C-32 -56 -18 -86 0 -128Z" fill="#ffd43b"/>${[-58, -22, 26, 62].map(x => `<ellipse cx="${x}" cy="4" rx="22" ry="14" fill="#495057" stroke="${OL}" stroke-width="4"/>`).join('')}</g>`,
  banco_madeira: `<g><ellipse cx="0" cy="6" rx="150" ry="18" fill="url(#shadG)"/><rect x="-110" y="-76" width="24" height="78" fill="#5c3c20" stroke="${OL}" stroke-width="4.5"/><rect x="86" y="-76" width="24" height="78" fill="#5c3c20" stroke="${OL}" stroke-width="4.5"/><rect x="-136" y="-96" width="272" height="26" rx="6" fill="#8a5a32" stroke="${OL}" stroke-width="5"/></g>`,
  barril: `<g><ellipse cx="0" cy="8" rx="84" ry="18" fill="url(#shadG)"/><path d="M-62 0 Q-78 -78 -58 -156 H58 Q78 -78 62 0Z" fill="#7c4d28" stroke="${OL}" stroke-width="5.5" stroke-linejoin="round"/><rect x="-68" y="-128" width="136" height="14" fill="#3a404a" stroke="${OL}" stroke-width="3.5"/><rect x="-68" y="-44" width="136" height="14" fill="#3a404a" stroke="${OL}" stroke-width="3.5"/></g>`,
  lamina_caida: `<g><path d="M-70 -6 L65 -24 L52 -4 L-64 6Z" fill="url(#steelG)" stroke="${OL}" stroke-width="4" stroke-linejoin="round"/></g>`,
};

function personagem(p, o) {
  o = Object.assign({ pele: 'branca', roupa: ['camiseta', '#e8c84a'], calca: { len: 110, col: '#2b3a52', w: 22 }, sapato: '#2b2420', acessorios: [] }, o || {});
  const [sk, skG] = PELES[o.pele] || PELES.branca;
  const ac = o.acessorios.map(a => ACESS[a]).filter(Boolean);
  const cat = k => ac.map(a => a[k] || '').join('');
  const fnRoupa = ROUPA[o.roupa[0]] || ROUPA.camiseta;
  return person(p, {
    x: o.x || 0, y: o.y || 0, s: o.s || 1, flip: o.flip || 1, skin: sk, skinG: skG, torsoW: o.torsoW || 50,
    torsoDeco: fnRoupa(o.roupa[1]), pants: o.calca, shoe: o.sapato, shoeB: o.sapato,
    sleeve: o.manga ? { col: o.roupa[1], len: o.manga } : null, rim: o.rim, sunDir: o.sunDir || 1,
    semNariz: o.semNariz, orelhas: o.orelhas,
    headDeco: () => cat('head'), faceDeco: q => cat('face') + tearsSVG(q), hat: () => cat('hat'),
    hold: { D: (o.segura && o.segura.D || []).map(n => ({ svg: props[n], on: 0 })), E: (o.segura && o.segura.E || []).map(n => ({ svg: props[n], on: 0 })) },
  });
}

const EXTRA_DEFS = `<svg width="0" height="0" style="position:absolute"><defs><radialGradient id="peleE" cx=".34" cy=".28" r=".88"><stop offset="0" stop-color="#b57f56"/><stop offset=".62" stop-color="#8a5a3a"/><stop offset="1" stop-color="#5a3420"/></radialGradient></defs></svg>`;
