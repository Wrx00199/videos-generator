#!/usr/bin/env python3
"""PreToolUse(Bash): bloqueia render/ffmpeg se já houver outro rodando. 0 token."""
import json, os, re, subprocess, sys
d = json.load(sys.stdin)
cmd = (d.get("tool_input") or {}).get("command", "")
if not re.search(r"(^|[\s;&|(])(ffmpeg|render\.mjs|hyperframes\s+render|blender)\b", cmd) or re.search(r"\b(git|grep|rg|ls|cat|echo|pgrep|pkill)\b\s", cmd.split("\n")[0][:12]):
    sys.exit(0)
ps = subprocess.run(["ps", "-eo", "pid=,comm=,args="], capture_output=True, text=True).stdout.splitlines()
busy = []
for l in ps:
    pid, comm, args = (l.split(None, 2) + ["", ""])[:3]
    if pid in (str(os.getpid()), str(os.getppid())):
        continue
    if comm in ("ffmpeg", "blender") or (comm == "node" and "render.mjs" in args) or (comm == "node" and "hyperframes" in args and " render" in args):
        busy.append(l)
if busy:
    print("BLOQUEADO (regras.md: 1 render/ffmpeg por vez). Já rodando:\n" + "\n".join(x[:140] for x in busy[:3]) +
          "\nEspere terminar (ou pkill se travou) e tente de novo.", file=sys.stderr)
    sys.exit(2)
