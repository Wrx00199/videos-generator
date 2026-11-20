// luzes.js — luz por momento (valores medidos da referência; ver RESUMO_APLICAVEL.md).
// tint = cor que os cartões (bonecos) pegam da luz da cena.
export const LIGHTS = {
  dia: { ondas: 0.22, az: 140, el: 46, sky: '#c4d6f2', ground: '#8a84b0', hemi: 1.15, sun: '#fff1dc', sunI: 2.5, fog: '#b5d9fb', fogNear: 60, fogFar: 900,
    skyTop: '#4f8ad8', skyHor: '#b5d9fb', sat: 1.12, waterDeep: '#05678f', waterShal: '#1194b6', glint: '#effaff', vig: 0.18, shadowExt: 14, tint: '#ffffff' },
  dourado: { ondas: 0.2, az: 20, el: 14, sky: '#a89cd8', ground: '#5a4a6a', hemi: 1.1, sun: '#ffc07c', sunI: 2.2, fog: '#f3b98c', fogNear: 50, fogFar: 760,
    skyTop: '#6a4f8c', skyHor: '#ffd18a', sunDisc: '#fff0c8', sunSize: 0.004, sat: 1.0, gain: '#fff2e2', waterDeep: '#3d4a86', waterShal: '#d99a6e',
    glint: '#ffe2a8', vig: 0.28, shadowExt: 14, tint: '#fde0b8' },
  noite: { ondas: 0.25, az: 200, el: 35, sky: '#4a4f9a', ground: '#1c1a3a', hemi: 0.95, sun: '#cfe0ff', sunI: 1.3, fog: '#262246', fogNear: 30, fogFar: 500,
    skyTop: '#0a0f38', skyHor: '#2a2a62', sunDisc: '#e6eef7', sunSize: 0.0016, sat: 1.05, gain: '#d8dcff', lift: '#05040f', waterDeep: '#0a0f38', waterShal: '#1c2b6a',
    glint: '#9fb6f7', vig: 0.45, shadowExt: 14, tint: '#d2d0f4' },
  cozinha: { ondas: 0.2, az: 230, el: 60, sky: '#ffc98a', ground: '#5a3424', hemi: 0.95, sun: '#ffd9a0', sunI: 0.7, fog: '#3a2420', fogNear: 20, fogFar: 80,
    skyTop: '#2a1a18', skyHor: '#2a1a18', sat: 1.1, gain: '#fff0dc', waterDeep: '#05678f', waterShal: '#1194b6', glint: '#effaff', vig: 0.5, shadowExt: 8, tint: '#fff3e2' },
  sepia: { ondas: 0.2, az: 230, el: 60, sky: '#ffc98a', ground: '#5a3424', hemi: 0.9, sun: '#ffd9a0', sunI: 0.6, fog: '#3a2420', fogNear: 20, fogFar: 80,
    skyTop: '#2a1a18', skyHor: '#2a1a18', sat: 0.35, gain: '#ffe2b8', lift: '#1a0c04', waterDeep: '#05678f', waterShal: '#1194b6', glint: '#effaff', vig: 0.55, shadowExt: 8, tint: '#ffe0b0' },
  // batalha naval: céu de chumbo, mar escuro e agitado, sombra fria; bonecos pegam um cinza-azulado
  tempestade: { ondas: 1.3, az: 250, el: 22, sky: '#7c8aa8', ground: '#2a2a3e', hemi: 0.9, sun: '#c9d6ea', sunI: 1.1, fog: '#4f5b70', fogNear: 25, fogFar: 380,
    skyTop: '#1f2636', skyHor: '#5d6a80', sat: 0.82, gain: '#e4ecf6', lift: '#0a0c14', waterDeep: '#132a3c', waterShal: '#2c5266', glint: '#cfe2f0', vig: 0.42, shadowExt: 14, tint: '#d7dde8' },
  // troca de tiros: céu de fumaça alaranjada (pôr do sol atrás da fumaça), contraste forte
  batalha: { ondas: 0.55, az: 300, el: 12, sky: '#b08a8a', ground: '#3a2a3a', hemi: 1.0, sun: '#ffb070', sunI: 2.0, fog: '#a07a72', fogNear: 30, fogFar: 520,
    skyTop: '#3a2a44', skyHor: '#e0915a', sunDisc: '#ffe0b0', sunSize: 0.003, sat: 0.95, gain: '#fff0e0', lift: '#120a10', waterDeep: '#1f2a4a', waterShal: '#3e5578',
    glint: '#d9cce6', vig: 0.36, shadowExt: 14, tint: '#fbeadf' },
  // ESPAÇO (catálogo de cenários): céu roxo-escuro, sol forte e frio de lado, sombra azul-violeta, sem névoa perto
  espaco: { ondas: 0.2, az: 235, el: 42, sky: '#7a6ad8', ground: '#2a2060', hemi: 1.0, sun: '#fff4e6', sunI: 2.6, fog: '#0b0c2c', fogNear: 600, fogFar: 3000,
    skyTop: '#070a24', skyHor: '#150f3d', sat: 1.12, gain: '#f4f0ff', lift: '#06051a', waterDeep: '#05678f', waterShal: '#1194b6', glint: '#effaff', vig: 0.32, shadowExt: 14, tint: '#f1eeff' },
  // BRINQUEDOLÂNDIA: quarto claro e quente, sol de frente-alto, sombra lilás suave, cores vivas
  brinquedo: { ondas: 0.2, az: 100, el: 52, sky: '#ffd9ec', ground: '#7a60c8', hemi: 1.15, sun: '#fff0d8', sunI: 2.3, fog: '#ffe6d2', fogNear: 45, fogFar: 260,
    skyTop: '#bfe3ff', skyHor: '#ffe6d2', sat: 1.15, gain: '#fff6ea', waterDeep: '#05678f', waterShal: '#1194b6', glint: '#effaff', vig: 0.22, shadowExt: 18, tint: '#fff6ec' },
  // CIDADE DO CAOS: fim de tarde laranja-rosa, sol de frente-lado, sombra violeta, névoa quente ao longe
  cidade: { ondas: 0.2, az: 118, el: 46, sky: '#ffd0c0', ground: '#8a70d0', hemi: 1.45, sun: '#ffd2a0', sunI: 2.7, fog: '#f7a98a', fogNear: 45, fogFar: 300,
    skyTop: '#5a5fd0', skyHor: '#ffb27a', sat: 1.12, gain: '#fff1e2', lift: '#0a0614', waterDeep: '#05678f', waterShal: '#1194b6', glint: '#effaff', vig: 0.3, shadowExt: 18, tint: '#ffeedd' },
  // BERMUDAS: neblina verde densa, sol fraco esverdeado, mar escuro; fog = horizonte do céu (emenda sem costura)
  bermudas: { ondas: 0.3, az: 210, el: 32, sky: '#7fe0b0', ground: '#1a3a40', hemi: 1.0, sun: '#cfffe6', sunI: 1.3, fog: '#4fae8a', fogNear: 16, fogFar: 130,
    skyTop: '#0d3a3a', skyHor: '#4fae8a', sat: 1.0, gain: '#e6fff2', lift: '#02100f', waterDeep: '#0a3a3a', waterShal: '#1a6a5a', glint: '#9fffd0', vig: 0.42, shadowExt: 14, tint: '#f2fff8' },
  // NAVIO NAS BERMUDAS (19/11): noite fria verde, lua pálida, névoa densa, brasa e lanternas quentes
  navioterror: { ondas: 0.3, az: 215, el: 30, sky: '#0b1626', ground: '#04070c', hemi: 0.5, sun: '#8fb0ff', sunI: 1.1, fog: '#0a1626', fogNear: 6, fogFar: 40,
    skyTop: '#01040a', skyHor: '#0a1a2c', sat: 1.0, gain: '#c4d4ff', lift: '#01040a', waterDeep: '#030d18', waterShal: '#06192a', glint: '#7fa6ff', vig: 0.72, shadowExt: 14, tint: '#9db4d8' },
  fundoescuro: { ondas: .2, az: 100, el: 70, sky: '#06202e', ground: '#031018', hemi: 0.5, sun: '#8fc4d8', sunI: 0.7, fog: '#04202e', fogNear: 3, fogFar: 26, skyTop: '#01080e', skyHor: '#04202e', sat: 0.9, lift: '#010508', waterDeep: '#02121c', waterShal: '#04202e', glint: '#6aa0b8', vig: .7, shadowExt: 14, tint: '#7fa8bc' },
  navioberm: { ondas: 0.3, az: 215, el: 34, sky: '#1f4a4a', ground: '#0a181c', hemi: 0.5, sun: '#9fe8ff', sunI: 1.5, fog: '#0f2c2c', fogNear: 6, fogFar: 40,
    skyTop: '#020b10', skyHor: '#133634', sat: 1.12, gain: '#e8fff6', lift: '#010a0c', waterDeep: '#062a2c', waterShal: '#0e4a44', glint: '#9fffd0', vig: 0.58, shadowExt: 14, tint: '#e4faf0' },
  // MAIA: tarde dourada quente na selva
  maia: { ondas: 0.2, az: 115, el: 38, sky: '#ffe0b0', ground: '#6a5a30', hemi: 1.2, sun: '#ffd9a0', sunI: 2.5, fog: '#f6d9a0', fogNear: 40, fogFar: 260,
    skyTop: '#5aa8e8', skyHor: '#ffe0b0', sat: 1.12, gain: '#fff1da', waterDeep: '#05678f', waterShal: '#1194b6', glint: '#effaff', vig: 0.26, shadowExt: 18, tint: '#fff0dc' },
  // MAIA ep. 37: variações do mesmo cenário (hora 5 âmbar, poente laranja-rosa)
  maiaAmbar: { ondas: 0.2, az: 100, el: 24, sky: '#ffcf94', ground: '#5a4a28', hemi: 1.05, sun: '#ffb870', sunI: 2.2, fog: '#f2c48a', fogNear: 40, fogFar: 260,
    skyTop: '#4a86c8', skyHor: '#ffc88a', sat: 1.14, gain: '#ffe6c4', waterDeep: '#05678f', waterShal: '#1194b6', glint: '#effaff', vig: 0.3, shadowExt: 18, tint: '#ffe2bc' },
  maiaPoente: { ondas: 0.2, az: 95, el: 10, sky: '#e8a68a', ground: '#4a3a30', hemi: 0.95, sun: '#ffa268', sunI: 2.2, fog: '#d9a08c', fogNear: 30, fogFar: 220,
    skyTop: '#6a5aa8', skyHor: '#ff9a6a', sat: 1.18, gain: '#ffd0b4', waterDeep: '#05678f', waterShal: '#1194b6', glint: '#effaff', vig: 0.36, shadowExt: 22, tint: '#ffc8a8' },
  // AMAZÔNIA: verde úmido, névoa clara, raios de sol
  amazonia: { ondas: 0.2, az: 120, el: 55, sky: '#d8f5d0', ground: '#2a5a3a', hemi: 1.25, sun: '#fff0b8', sunI: 2.3, fog: '#a8dcc0', fogNear: 30, fogFar: 200,
    skyTop: '#7fc8b0', skyHor: '#a8dcc0', sat: 1.15, gain: '#f6fff0', waterDeep: '#05678f', waterShal: '#1194b6', glint: '#effaff', vig: 0.3, shadowExt: 16, tint: '#f4ffe8' },
  // ---- CENÁRIOS EXTRA (16/11) ----
  cyberpunk: { ondas: .2, az: 215, el: 25, sky: '#3a2a6a', ground: '#10082a', hemi: .9, sun: '#9a8aff', sunI: .9, fog: '#2a1650', fogNear: 18, fogFar: 140, skyTop: '#0a0620', skyHor: '#3a1a6a', sat: 1.25, gain: '#f0e6ff', lift: '#05021a', waterDeep: '#05678f', waterShal: '#1194b6', glint: '#effaff', vig: .4, shadowExt: 14, tint: '#e8e0ff' },
  apocalipse: { ondas: .2, az: 120, el: 20, sky: '#c08060', ground: '#3a2a28', hemi: .95, sun: '#ff9a50', sunI: 1.9, fog: '#a85a38', fogNear: 14, fogFar: 130, skyTop: '#4a2a20', skyHor: '#e08a48', sat: .95, gain: '#ffe6d0', lift: '#1a0a06', waterDeep: '#05678f', waterShal: '#1194b6', glint: '#effaff', vig: .42, shadowExt: 14, tint: '#ffe4d0' },
  cemiterio: { ondas: .2, az: 200, el: 38, sky: '#6a6ab8', ground: '#202040', hemi: .95, sun: '#cfd8ff', sunI: 1.4, fog: '#2a3060', fogNear: 20, fogFar: 160, skyTop: '#0a1030', skyHor: '#3a4a8a', sat: 1.05, lift: '#04061a', waterDeep: '#05678f', waterShal: '#1194b6', glint: '#effaff', vig: .42, shadowExt: 14, tint: '#e0e0ff' },
  parque: { ondas: .2, az: 110, el: 18, sky: '#c890b0', ground: '#5a4060', hemi: 1.05, sun: '#ffb878', sunI: 1.9, fog: '#c88aa0', fogNear: 30, fogFar: 220, skyTop: '#5a3a8a', skyHor: '#ffa878', sat: 1.05, waterDeep: '#05678f', waterShal: '#1194b6', glint: '#effaff', vig: .34, shadowExt: 16, tint: '#ffe8dc' },
  dojo: { ondas: .2, az: 100, el: 40, sky: '#fff0e0', ground: '#7a6a50', hemi: 1.2, sun: '#fff0c8', sunI: 2.4, fog: '#f0e6d8', fogNear: 40, fogFar: 260, skyTop: '#8ac0f0', skyHor: '#f6ead8', sat: 1.1, waterDeep: '#05678f', waterShal: '#1194b6', glint: '#effaff', vig: .24, shadowExt: 16, tint: '#fff6e8' },
  fundomar: { ondas: .2, az: 100, el: 70, sky: '#7ad0e0', ground: '#1a5a6a', hemi: 1.25, sun: '#d8fff8', sunI: 1.7, fog: '#1f8aa8', fogNear: 10, fogFar: 80, skyTop: '#0a5a8a', skyHor: '#1f8aa8', sat: 1.15, waterDeep: '#05678f', waterShal: '#1194b6', glint: '#effaff', vig: .36, shadowExt: 14, tint: '#e0fff8' },
  nuvens: { ondas: .2, az: 110, el: 55, sky: '#ffffff', ground: '#b8c8f0', hemi: 1.35, sun: '#fff6d8', sunI: 2.4, fog: '#e8f0ff', fogNear: 60, fogFar: 400, skyTop: '#4a8ae8', skyHor: '#cfe6ff', sat: 1.1, waterDeep: '#05678f', waterShal: '#1194b6', glint: '#effaff', vig: .18, shadowExt: 16, tint: '#ffffff' },
  arena: { ondas: .2, az: 90, el: 60, sky: '#a0a0d0', ground: '#302848', hemi: .9, sun: '#fff4e0', sunI: 2.6, fog: '#241c3c', fogNear: 30, fogFar: 200, skyTop: '#0a0818', skyHor: '#241c3c', sat: 1.15, lift: '#04020c', waterDeep: '#05678f', waterShal: '#1194b6', glint: '#effaff', vig: .45, shadowExt: 16, tint: '#fff4ea' },
  floresta: { ondas: .2, az: 120, el: 52, sky: '#cfeccf', ground: '#2a4a2a', hemi: 1.2, sun: '#fff4c8', sunI: 2.3, fog: '#b8dcb0', fogNear: 25, fogFar: 190, skyTop: '#8ac8c0', skyHor: '#cfeccf', sat: 1.12, waterDeep: '#05678f', waterShal: '#1194b6', glint: '#effaff', vig: .3, shadowExt: 16, tint: '#f6ffe8' },
  // PACOTE CASA (20/11): luzes de interior. Paletas bem diferentes entre si (referência troca de paleta por cômodo).
  casa_dia: { ondas: 0.2, az: 120, el: 55, sky: '#fff0c8', ground: '#c9a46a', hemi: 1.5, sun: '#fff0d0', sunI: 1.2, fog: '#fff0cf', fogNear: 30, fogFar: 200, skyTop: '#9fd0ff', skyHor: '#fff0cf', sat: 1.18, gain: '#fff4e0', vig: 0.28, shadowExt: 10, tint: '#fff2dc' },
  // noite:1 (20/11) = janelas do PACOTE CASA viram céu escuro + lua; ambiente <= 40%, abajur é a fonte quente
  casa_noite: { ondas: 0.2, az: 200, el: 40, sky: '#33449a', ground: '#12163a', hemi: 0.5, sun: '#9fb0ff', sunI: 0.35, fog: '#141a42', fogNear: 14, fogFar: 60, skyTop: '#060a2a', skyHor: '#141a42', sat: 1.1, gain: '#a4b0e4', lift: '#03041a', vig: 0.6, shadowExt: 10, tint: '#9eacdc', noite: 1 },
  // rua_noite (20/11): exterior da fachada à noite, mais aberto que casa_noite (bonecos legíveis no celular)
  rua_noite: { ondas: 0.2, az: 200, el: 40, sky: '#3a4ca8', ground: '#1a2050', hemi: 0.85, sun: '#b0c0ff', sunI: 0.6, fog: '#1a2250', fogNear: 18, fogFar: 80, skyTop: '#070c30', skyHor: '#1e2a66', sat: 1.12, gain: '#c8d0f4', lift: '#04061c', vig: 0.5, shadowExt: 10, tint: '#b8c4ee', noite: 1 },
  // casa_breu (20/11): sala quase preta, só abajur/feixe de lanterna (usar com B.breu=1 e abajur 0)
  casa_breu: { ondas: 0.2, az: 200, el: 40, sky: '#1a2050', ground: '#05061a', hemi: 0.16, sun: '#8090d0', sunI: 0.08, fog: '#05071a', fogNear: 10, fogFar: 40, skyTop: '#02030f', skyHor: '#05071a', sat: 1.05, gain: '#6a76a8', lift: '#010210', vig: 0.72, shadowExt: 10, tint: '#6a78b0', noite: 1 },
  casa_quarto: { ondas: 0.2, az: 160, el: 50, sky: '#5446a8', ground: '#1c1540', hemi: 0.55, sun: '#a8a0ff', sunI: 0.35, fog: '#1e1850', fogNear: 14, fogFar: 60, skyTop: '#0c0730', skyHor: '#1e1850', sat: 1.15, gain: '#b4ace8', lift: '#070418', vig: 0.55, shadowExt: 10, tint: '#b4aae4', noite: 1 },
  casa_tarde: { ondas: 0.2, az: 80, el: 22, sky: '#ffc08a', ground: '#8a5a3a', hemi: 1.2, sun: '#ffb070', sunI: 2.2, fog: '#ffc79a', fogNear: 25, fogFar: 160, skyTop: '#ff9a62', skyHor: '#ffd2a0', sat: 1.2, gain: '#fff0dc', lift: '#150a04', vig: 0.34, shadowExt: 12, tint: '#ffe0c0' },
  // PACOTE PRÉDIOS (20/11): 6 paletas próprias. Exteriores com névoa longe (cidade a 60–115 m abaixo, até ~560 m).
  predio_dia: { ondas: 0.2, az: 130, el: 50, sky: '#cfe2ff', ground: '#8a90b0', hemi: 1.3, sun: '#fff4e0', sunI: 2.4, fog: '#bcd8f6', fogNear: 120, fogFar: 1100,
    skyTop: '#2f6fe0', skyHor: '#bfe0ff', sat: 1.15, gain: '#f6faff', vig: 0.2, shadowExt: 12, tint: '#ffffff' },
  predio_dourado: { ondas: 0.2, az: 70, el: 18, sky: '#e8b0c8', ground: '#5a4a6a', hemi: 1.2, sun: '#ffb878', sunI: 2.3, fog: '#f0a888', fogNear: 120, fogFar: 1000,
    skyTop: '#4a4a9a', skyHor: '#ff9e7a', sunDisc: '#fff0c8', sunSize: 0.004, sat: 1.12, gain: '#fff0e0', lift: '#0c0614', vig: 0.3, shadowExt: 12, tint: '#ffe6d0' },
  predio_poente: { ondas: 0.2, az: 20, el: 10, sky: '#ffb890', ground: '#5a3a5a', hemi: 1.15, sun: '#ffa060', sunI: 2.4, fog: '#ff9a6a', fogNear: 140, fogFar: 1000,
    skyTop: '#5a3a8a', skyHor: '#ff8a4a', sunDisc: '#fff2c0', sunSize: 0.006, sat: 1.18, gain: '#fff0dc', lift: '#120614', vig: 0.32, shadowExt: 12, tint: '#ffdcc0' },
  predio_rua: { ondas: 0.2, az: 110, el: 42, sky: '#fff0d0', ground: '#9a8a7a', hemi: 1.35, sun: '#fff0d0', sunI: 2.3, fog: '#e8ecf0', fogNear: 60, fogFar: 420,
    skyTop: '#5a9ae8', skyHor: '#f4ecd8', sat: 1.12, gain: '#fff8ee', vig: 0.22, shadowExt: 14, tint: '#fff8ee' },
  predio_escritorio: { ondas: 0.2, az: 100, el: 50, sky: '#ffe0b0', ground: '#7a4a2a', hemi: 1.25, sun: '#ffd8a0', sunI: 1.1, fog: '#5a3a2a', fogNear: 30, fogFar: 120,
    skyTop: '#2a1a14', skyHor: '#2a1a14', sat: 1.14, gain: '#fff0dc', lift: '#100804', vig: 0.34, shadowExt: 10, tint: '#ffeedd' },
  predio_redacao: { ondas: 0.2, az: 160, el: 55, sky: '#ffcf90', ground: '#3a2a1a', hemi: 0.85, sun: '#ffc080', sunI: 0.6, fog: '#2a1a12', fogNear: 25, fogFar: 90,
    skyTop: '#1a100a', skyHor: '#1a100a', sat: 1.1, gain: '#ffe4c0', lift: '#0e0804', vig: 0.48, shadowExt: 10, tint: '#ffe2c0' },
  predio_noite: { ondas: 0.2, az: 210, el: 38, sky: '#4a5cc0', ground: '#1a1e4a', hemi: 0.95, sun: '#b8c8ff', sunI: 0.9, fog: '#141a44', fogNear: 160, fogFar: 1100,
    skyTop: '#040824', skyHor: '#1c2a70', sat: 1.12, gain: '#d4dcff', lift: '#03041a', vig: 0.42, shadowExt: 12, tint: '#c8d0f4', noite: 1 },
};
// relâmpago na tempestade: retorna o flash (0..1) do quadro f; somar em C.flash do story
export const relampago = (f, quadros = []) => { let v = 0; for (const q of quadros) { const d = f - q; if (d >= 0 && d < 8) v = Math.max(v, d < 2 ? 0.75 : d === 3 ? 0.5 : Math.max(0, 0.6 - (d - 2) * 0.12)); } return v; };
export const luz = (nome, mods = {}) => ({ ...LIGHTS[nome], ...mods });
// mar por CLIMA do vídeo (independe da batalha): worldAt -> { mar: MAR.tensao }. Sem 'mar', vale o 'ondas' da luz.
export const MAR = { liso: 0.08, calmo: 0.22, brisa: 0.4, tensao: 0.7, agitado: 1.0, tempestade: 1.3 };
// aliases do pacote casa (o auditor do catálogo chama luz(<id do cenário>))
LIGHTS.sala = LIGHTS.casa_dia; LIGHTS.sala_blender = LIGHTS.casa_dia; LIGHTS.quarto = LIGHTS.casa_quarto; LIGHTS.fachada = LIGHTS.casa_dia;
// aliases do PACOTE PRÉDIOS (luz(<id do cenário>)); 'noite' NÃO tem alias (é a noite genérica do kit): use luz('predio_noite') ou luz('topo_noite').
LIGHTS.obra_azul = LIGHTS.predio_dia; LIGHTS.obra_vermelha = LIGHTS.predio_dourado; LIGHTS.escritorio = LIGHTS.predio_escritorio; LIGHTS.skyline = LIGHTS.predio_poente; LIGHTS.rua = LIGHTS.predio_rua; LIGHTS.redacao = LIGHTS.predio_redacao; LIGHTS.topo_noite = LIGHTS.predio_noite;
// 21/11: predio_tarde = pôr do sol quente (mesma paleta do predio_poente); predio_topo de dia por padrão (noite: luz('predio_noite') já liga B.noite pelo L.noite)
LIGHTS.predio_tarde = LIGHTS.predio_poente; LIGHTS.predio_topo = LIGHTS.predio_dia;

// 20/11: PACOTE TREM (cenarios7.js). dia p/ pradaria/estação, nevasca fria, cabine quente, fim_tarde = poente
LIGHTS.pradaria_trilho = LIGHTS.predio_dia; LIGHTS.estacao_trem = LIGHTS.predio_dourado; LIGHTS.fim_tarde = LIGHTS.predio_poente;
LIGHTS.nevasca = { ...LIGHTS.dia, sky: '#d8e4f4', ground: '#f0f4fa', hemi: 1.25, sun: '#e8f0ff', sunI: 1.2, fog: '#dfe8f4', fogNear: 14, fogFar: 140, skyTop: '#b8c8de', skyHor: '#e4ecf6', sat: 0.8, vig: 0.3, tint: '#e6eefb' };
LIGHTS.cabine_locomotiva = { ...LIGHTS.cozinha, sky: '#ffd9a0', hemi: 1.5, sunI: 1.4, fog: '#4a3020', fogNear: 30, fogFar: 120, skyTop: '#79b8ee', skyHor: '#cfe8fa', vig: 0.4, tint: '#ffe8c8' };
