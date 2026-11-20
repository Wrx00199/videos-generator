#!/usr/bin/env python3
"""Grava o chat da Kick (Pusher público) em jsonl: {t: epoch, u: user, m: texto}. Uso: chat_kick.py canal SAIDA.jsonl [segundos]
Leve (só websocket). Análise: chat_picos.py SAIDA.jsonl"""
import asyncio, json, sys, time, subprocess
import websockets
canal, saida = sys.argv[1], sys.argv[2]; limite = float(sys.argv[3]) if len(sys.argv) > 3 else 1e9
r = subprocess.run(["curl", "-s", "-m", "20", "-A", "Mozilla/5.0", f"https://kick.com/api/v2/channels/{canal}"], capture_output=True, text=True).stdout
cid = json.loads(r)["chatroom"]["id"]
URL = "wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=8.4.0-rc2&flash=false"
async def main():
    t0 = time.time()
    while time.time() - t0 < limite:
        try:
            async with websockets.connect(URL) as ws:
                f = open(saida, "a")
                await ws.send(json.dumps({"event": "pusher:subscribe", "data": {"auth": "", "channel": f"chatrooms.{cid}.v2"}}))
                async for msg in ws:
                    if time.time() - t0 > limite: return
                    m = json.loads(msg)
                    if m.get("event") == "pusher:ping":
                        await ws.send(json.dumps({"event": "pusher:pong", "data": {}}))
                    elif m.get("event", "").endswith("ChatMessageEvent"):
                        d = json.loads(m["data"])
                        f.write(json.dumps({"t": time.time(), "u": d["sender"]["username"], "m": d["content"]}, ensure_ascii=False) + "\n"); f.flush()
        except Exception as e:
            print("reconectando", e, file=sys.stderr); await asyncio.sleep(5)
asyncio.run(main())
