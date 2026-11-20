#!/usr/bin/env python3
"""Baixa texto de tweets via api.fxtwitter.com (sem login). Uso: tweets_ref.py <url|user/status/id>... -> referencias/base/tweets.json"""
import json, re, sys, time, urllib.request
from pathlib import Path
SAIDA = Path(__file__).resolve().parent.parent / "referencias" / "base" / "tweets.json"
db = json.loads(SAIDA.read_text()) if SAIDA.exists() else {}
for u in sys.argv[1:]:
    m = re.search(r"([\w]+)/status/(\d+)", u)
    if not m: continue
    try:
        d = json.load(urllib.request.urlopen(urllib.request.Request(f"https://api.fxtwitter.com/{m[1]}/status/{m[2]}", headers={"User-Agent": "estudio-ref"}), timeout=20))
        t = d["tweet"]
        db[m[2]] = {"autor": t["author"]["screen_name"], "texto": t.get("text", ""), "likes": t.get("likes"),
                    "midia": [x.get("type") for x in (t.get("media") or {}).get("all", [])],
                    "citado": (t.get("quote") or {}).get("text"), "resposta_a": t.get("replying_to"), "url": u}
        print("ok", m[2], len(db[m[2]]["texto"]))
    except Exception as e:
        print("PENDENTE", u, str(e)[:60])
    time.sleep(1.5)
SAIDA.write_text(json.dumps(db, ensure_ascii=False, indent=1))
