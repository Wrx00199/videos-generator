#!/usr/bin/env bash
# Uso: novo_ep.sh <pasta de episodio existente>
set -euo pipefail

if [[ $# != 1 || ! -d ${1:-} ]]; then
  echo "Uso: $0 <pasta de episodio existente>" >&2
  exit 2
fi

projeto=$(cd -- "$1" && pwd -P)
kit=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)
motor="$kit/motor3d"
dependencias=$(cd -- "$kit/../../.." && pwd -P)/node_modules
web="$projeto/web"
arquivos=(main.js shade.js mundo.js acoes.js elenco.js luzes.js motion.js paint.js toon.js
          index.html render.mjs sheet.py package.json cenarios.js cenarios2.js cenarios3.js
          cenarios4.js cenarios5.js cenarios6.js cenarios7.js efeitos.js epi.js planos.js Pz.js cameras.js)
texturas=(sala_fundo.png sala_meio.png sala_frente.png)

if [[ ! -f "$projeto/tempos_ft.js" ]]; then
  echo "Falta $projeto/tempos_ft.js" >&2
  exit 2
fi
if [[ ! -d "$dependencias/playwright" ]]; then
  echo "Falta Playwright em $dependencias. Rode npm ci na raiz do Estúdio." >&2
  exit 2
fi
for arquivo in "${arquivos[@]}" lib/three.module.js "${texturas[@]/#/assets/}"; do
  if [[ ! -f "$motor/$arquivo" ]]; then
    echo "Falta arquivo do motor: $motor/$arquivo" >&2
    exit 2
  fi
done

mkdir -p -- "$web/assets"
for arquivo in "${arquivos[@]}"; do
  cp -- "$motor/$arquivo" "$web/"
done
for textura in "${texturas[@]}"; do
  if [[ ! -e "$web/assets/$textura" ]]; then
    cp -- "$motor/assets/$textura" "$web/assets/$textura"
  fi
done
ln -sfnT -- "$motor/lib" "$web/lib"
ln -sfnT -- "$dependencias" "$web/node_modules"
cp -- "$projeto/tempos_ft.js" "$web/tempos.js"
