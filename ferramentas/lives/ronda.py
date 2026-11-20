#!/usr/bin/env python3
"""Ronda leve: imprime só NOVIDADES que valem olhar (estado em projetos/lives/achados/ronda_estado.json).
1) picos fortes (score>=15) do achar.py; 2) clipes de espectadores PT de GTA VI na Twitch (>=40 views, últimas 4 h);
3) clipes Kick dos canais BR com >=12 views (últimas 3 h). Uso: ronda.py [--marcar-tudo]"""
import json, subprocess, sys, datetime as dt
from pathlib import Path
R = Path(__file__).resolve().parents[2] / "projetos/lives/achados"; EST = R / "ronda_estado.json"
vistos = set(json.loads(EST.read_text())) if EST.exists() else set()
novos = []
def curl(*a):
    return subprocess.run(["curl", "-s", "-m", "25", "-A", "Mozilla/5.0", *a], capture_output=True, text=True).stdout
agora = dt.datetime.now(dt.timezone.utc)
def idade_h(iso): return (agora - dt.datetime.fromisoformat(iso.replace("Z", "+00:00"))).total_seconds() / 3600
def hora(iso): return dt.datetime.fromisoformat(iso.replace("Z", "+00:00")).astimezone().strftime("%H:%M")
f = R / "achados.jsonl"
if f.exists():
    for l in f.read_text().splitlines():
        o = json.loads(l); k = f"A|{o['seg']}|{o['pico']}"
        if o["score"] >= 60 and k not in vistos: novos.append((k, f"PICO {o['seg'].split('/')[-2][:8]}/{o['seg'][-10:]} {o['pico']}s score {o['score']}: {o['texto'][:160]}"))
try:
    q = '{"query":"query{game(name:\\"Grand Theft Auto VI\\"){clips(first:50,criteria:{period:LAST_DAY,sort:VIEWS_DESC}){edges{node{slug title viewCount createdAt durationSeconds language broadcaster{login}}}}}}"}'
    for e in json.loads(curl("-H", "Client-ID: kimne78kx3ncx6brgo4mv6wki5h1ko", "-d", q, "https://gql.twitch.tv/gql"))["data"]["game"]["clips"]["edges"]:
        n = e["node"]
        if n["language"].upper().startswith("PT") and n["viewCount"] >= 40 and idade_h(n["createdAt"]) <= 4:
            (f"T|{n['slug']}" in vistos) or novos.append((f"T|{n['slug']}", f"TWITCH {hora(n['createdAt'])} {n['broadcaster']['login']} {n['viewCount']}v {n['durationSeconds']}s '{n['title'][:40]}' https://clips.twitch.tv/{n['slug']}"))
except Exception as ex: print("twitch erro", ex)
for canal in ("coringa", "yuri22", "brabox"):
    try:
        for c in json.loads(curl(f"https://kick.com/api/v2/channels/{canal}/clips?sort=view&time=day")).get("clips", []):
            v = c.get("views") or c.get("view_count") or 0
            if v >= 12 and idade_h(c["created_at"]) <= 3:
                (f"K|{c['id']}" in vistos) or novos.append((f"K|{c['id']}", f"KICK {canal} {hora(c['created_at'])} {v}v {c['duration']}s '{(c.get('title') or '')[:40]}' {c.get('clip_url')}"))
    except Exception as ex: print("kick erro", canal, ex)
marcar = "--marcar-tudo" in sys.argv
for k, t in novos:
    if not marcar: print(t)
    vistos.add(k)
EST.write_text(json.dumps(sorted(vistos)))
print(f"[ronda {dt.datetime.now():%H:%M}] {len(novos)} novidade(s)")
