// Catálogo de cenários do Tião: 6 cenários x 3 camadas (far/mid/fg) 1800x1920, SVG procedural determinístico.
// uso: node gen.mjs [id...]   depois ./raster.sh   e   ./previas.sh
import { egitoObra, egitoPalacio } from './sc/egito.mjs';
const all = { egito_obra: egitoObra, egito_palacio: egitoPalacio };
try { Object.assign(all, (await import('./sc/tumba.mjs')).default); } catch (e) { if (e.code !== 'ERR_MODULE_NOT_FOUND') throw e; }
try { Object.assign(all, (await import('./sc/cidade.mjs')).default); } catch (e) { if (e.code !== 'ERR_MODULE_NOT_FOUND') throw e; }
try { Object.assign(all, (await import('./sc/castelo.mjs')).default); } catch (e) { if (e.code !== 'ERR_MODULE_NOT_FOUND') throw e; }
const want = process.argv.slice(2); for (const [k, fn] of Object.entries(all)) if (!want.length || want.includes(k)) { fn(); console.log('gerado', k); }
