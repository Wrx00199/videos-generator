#!/usr/bin/env python3
"""Pista de momentos: clipes de espectadores da Kick (só horário/título, o render é sempre do nosso recorte).
Uso: dicas_kick.py canal [minutos=90]. Agrupa clipes por fim (janela 90 s); mostra grupos com >=3 clipes e views."""
import sys, json, subprocess, datetime as dt
canal = sys.argv[1]; mins = int(sys.argv[2]) if len(sys.argv) > 2 else 90
out = []
for sort in ("date", "view"):
    r = subprocess.run(["curl", "-s", "-m", "25", "-A", "Mozilla/5.0", f"https://kick.com/api/v2/channels/{canal}/clips?sort={sort}&time=day"], capture_output=True, text=True).stdout
    try: out += json.loads(r).get("clips", [])
    except Exception: pass
vistos = {}
for c in out: vistos[c["id"]] = c
cs = []
agora = dt.datetime.now(dt.timezone.utc)
for c in vistos.values():
    fim = dt.datetime.fromisoformat(c["created_at"].replace("Z", "+00:00"))
    if (agora - fim).total_seconds() > mins * 60: continue
    cs.append((fim, c["duration"], c.get("views") or c.get("view_count") or 0, (c.get("title") or "").strip(), (c.get("category") or {}).get("name", "")))
cs.sort()
g = []
for c in cs:
    if g and (c[0] - g[-1][-1][0]).total_seconds() < 90: g[-1].append(c)
    else: g.append([c])
for grp in g:
    if len(grp) >= 3 or any(x[2] >= 5 for x in grp):
        fim = grp[-1][0].astimezone().strftime("%H:%M:%S")
        print(f"{fim} BRT | {len(grp)} clipes | views {sum(x[2] for x in grp)} | " + " / ".join(x[3][:25] for x in grp[:8]))
