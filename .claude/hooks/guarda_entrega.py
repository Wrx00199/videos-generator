#!/usr/bin/env python3
"""PreToolUse(SendUserFile): bloqueia envio de final.mp4 de episódio sem REVISAO_FINAL.md com 'VEREDITO: APROVADO' mais novo que o vídeo.
Rascunho só passa se a legenda disser RASCUNHO (honestidade explícita, regras.md 20/11). 0 token."""
import json, os, sys, re
d = json.load(sys.stdin); ti = d.get("tool_input") or {}
files = ti.get("files") or []; cap = (ti.get("caption") or "")
for f in files:
    if not f.lower().endswith(".mp4"): continue
    p = os.path.abspath(f)
    if "/projetos/" not in p or "/prontos/" in p: continue
    rev = os.path.join(os.path.dirname(p), "REVISAO_FINAL.md")
    ok = False
    if os.path.exists(rev) and os.path.getmtime(rev) >= os.path.getmtime(p):
        txt = open(rev, encoding="utf-8", errors="ignore").read()
        ok = bool(re.search(r"^VEREDITO:\s*APROVADO\s*$", txt, re.M))
    if not ok and "RASCUNHO" not in cap.upper():
        print("BLOQUEADO (regras.md 20/11): vídeo sem REVISAO_FINAL.md com 'VEREDITO: APROVADO' mais novo que o MP4. Corrija e peça revisão, ou envie com a palavra RASCUNHO na legenda e diga as falhas conhecidas.", file=sys.stderr)
        sys.exit(2)
