// Suporte a rotação de chaves quando bater 429: env.CHAVE_TTS ou GEMINI_API_KEY_2, _3, etc.
export function chaveTts(env) {
  const idx = env.KEY_INDEX || process.env.KEY_INDEX;
  if (idx && env[`GEMINI_API_KEY_${idx}`]) return env[`GEMINI_API_KEY_${idx}`].trim();
  return env.GEMINI_API_KEY_2?.trim() || env.GEMINI_API_KEY_3?.trim() || env.GEMINI_API_KEY?.trim() || env.GEMINI_API_KEY_1?.trim() || '';
}

// V4: todas as chaves GEMINI_API_KEY_1.._5 em ordem (vazias ignoradas).
export function chavesTts(env) {
  const out = [];
  for (let i = 1; i <= 5; i++) { const k = env[`GEMINI_API_KEY_${i}`]?.trim(); if (k) out.push(k); }
  return out;
}

const ehCota = (e) => e?.status === 429 || /RESOURCE_EXHAUSTED|quota|\b429\b/i.test(String(e?.message ?? ''));

// Tenta cada chave; cota/429 -> proxima; outro erro propaga. Nunca devolve o texto da chave (so o indice).
export async function girarChaves(chaves, tentar) {
  for (let i = 0; i < chaves.length; i++) {
    try { return { ok: true, valor: await tentar(chaves[i]), usada: i }; }
    catch (e) { if (!ehCota(e)) throw e; }
  }
  return { ok: false, erro: 'cota_esgotada' };
}
