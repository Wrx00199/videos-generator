#!/usr/bin/env python3
"""PreToolUse(Agent): exige modelo explícito haiku/sonnet (regras.md). 0 token."""
import json, sys
d = json.load(sys.stdin)
m = ((d.get("tool_input") or {}).get("model") or "").lower()
if m not in ("haiku", "sonnet"):
    print(f"BLOQUEADO (regras.md): subagente precisa de model='haiku' ou 'sonnet' explícito (veio: '{m or 'nenhum'}'). Opus só com ordem do Filippe.", file=sys.stderr)
    sys.exit(2)
