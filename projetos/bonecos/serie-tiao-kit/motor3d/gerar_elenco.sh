#!/usr/bin/env bash
# Regenera elenco.js a partir do rig canônico ../rig.js (rode de dentro de motor3d/ após editar o rig).
set -e; R=../rig.js
{ echo "// elenco.js — GERADO de ../rig.js por gerar_elenco.sh (contexto injetável). Não editar à mão."
  echo "let ctx = null; export function setCtx(g) { ctx = g; }"
  sed -n '5p' $R | sed "s/INK = '#161616'/INK = '#241726'/"
  A=$(grep -n '^// ---------- cenários' $R | cut -d: -f1); B=$(grep -n '^// ---------- ações amarradas' $R | cut -d: -f1)
  C=$(grep -n '^// ---------- céus pintados' $R | cut -d: -f1); D=$(grep -n '^PAL.dusk' $R | cut -d: -f1)
  sed -n "6,$((A-1))p" $R; sed -n "$B,$((C-1))p" $R; sed -n "$((D+1)),\$p" $R
  grep '^function toWorld' ../lib_v3.js
  echo "export { SPEC, TRIPS, tripulacao, DEF, drawChar, auditaPose, toBody, toWorld, hipOf, ik, limb, K, C, L, io, out, inn, back, P, hash, talk, prop, mapAt, pot, bowl, fish, star, steam, leaf, stirPot, walk, laugh, clap, cheer, parrot, hammock, biscuit, poof, burst, SIT, hatAt, ell, fs, rr, line, INK, UA, LA, SHX, SHY };"
} > elenco.js
echo "elenco.js ok"
