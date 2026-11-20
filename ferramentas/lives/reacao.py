#!/usr/bin/env python3
"""Clipe de reação: SEG.ts INICIO DUR --gancho "..." --reacao "TEXTO" --t-reacao SEG_DENTRO --nome slug [--sfx boom]
Layout padrão (jogo+câmera inteiros no meio, fundo desfocado), SEM legenda corrida; gancho nos 3,5 s iniciais (acima do jogo)
e TEXTO DA REAÇÃO (abaixo do jogo) no momento t-reacao, com efeito sonoro nosso. ig = logo+@, tiktok = limpo. 1080x1920, crf 18.
Rodar com: nice -n 15 ambiente/bin/python reacao.py ..."""
import argparse, json, subprocess, sys
from pathlib import Path
AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))
import clipador as C

ap = argparse.ArgumentParser()
ap.add_argument("ts"); ap.add_argument("inicio", type=float); ap.add_argument("dur", type=float)
ap.add_argument("--gancho", required=True); ap.add_argument("--reacao", required=True)
ap.add_argument("--t-reacao", type=float, required=True); ap.add_argument("--nome", required=True)
ap.add_argument("--cam", default="19,305,212,125", help="recorte da câmera x,y,w,h (Coringa 1280x720)"); ap.add_argument("--apagar", default="1,268,252,166", help="caixa a apagar do jogo x,y,w,h")
ap.add_argument("--modo", default="jogo", choices=["jogo","irl"], help="irl = sem câmera separada: recorte central 4:3 (tira QR code do canto) sobre fundo desfocado")
ap.add_argument("--jogo", default="", help="recorte do jogo w,h,x,y (padrão: central)")
ap.add_argument("--zoom", default="", help="ZOOM: z,t_ini_rampa,t_fim_teaser ex 0.18,21,3 (punch-in no jogo)")
ap.add_argument("--leg", default="", help="legendinha: t0|t1|texto;...")
ap.add_argument("--sfx", default="boom"); ap.add_argument("--sfx-vol", type=float, default=0.5)
ap.add_argument("--saida", default=str(C.RAIZ / "projetos/lives/clipes"))
a = ap.parse_args(); a.ts = str(Path(a.ts).resolve()); a.saida = str(Path(a.saida).resolve())
pasta = Path(a.saida) / a.nome; pasta.mkdir(parents=True, exist_ok=True)
d = a.dur
def ev(t0, t1, estilo, txt, y, pop=False):
    efeito = "\\fscx70\\fscy70\\t(0,180,\\fscx100\\fscy100)" if pop else ""
    return f"Dialogue: 1,{C.tempo_ass(t0)},{C.tempo_ass(t1)},{estilo},,0,0,0,,{{\\pos(540,{y}){efeito}}}{C.limpo(txt).upper()}"
cab = ["[Script Info]", "ScriptType: v4.00+", f"PlayResX: {C.L}", f"PlayResY: {C.A}", "WrapStyle: 0", "", "[V4+ Styles]",
 "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
 "Style: Gancho,Montserrat ExtraBold,54,&H00302A28,&H00FFFFFF,&H00E6F0F5,&H00000000,0,0,0,0,100,100,0,0,3,16,0,5,60,60,0,1",
 "Style: Reacao,Montserrat ExtraBold,92,&H00E6F0F5,&H00FFFFFF,&H00282320,&H80000000,0,0,0,0,100,100,0,0,1,10,5,5,50,50,0,1",
 "Style: Leg,Montserrat ExtraBold,56,&H00FFFFFF,&H00FFFFFF,&H00202020,&H80000000,0,0,0,0,100,100,0,0,1,8,3,5,50,50,0,1",
 "", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
tr = a.t_reacao
evs = [ev(0.2, min(d, 3.7), "Gancho", a.gancho, 1440),
       ev(tr, min(d, tr + 3.6), "Reacao", a.reacao.replace("\\n", "\\N"), 1620, pop=True)]
for item in [x for x in a.leg.split(";") if x.strip()]:
    t0, t1, tx = item.split("|"); evs.append(ev(float(t0), float(t1), "Leg", tx, 1500))
ass = pasta / "texto.ass"; ass.write_text("\n".join(cab + evs) + "\n", encoding="utf-8")
W, H = 1280, 720
cam = [int(v) for v in a.cam.split(",")]; apagar = [int(v) for v in a.apagar.split(",")]; rosto = cam
def filtro_rapido(W, H, rosto, ass):
    """Mesmo layout do clipador (câmera em cima 1080x640, jogo embaixo 1080x700), mas leve: delogo no lugar do geq, fundo desfocado em baixa resolução."""
    L, A, CH, JH = C.L, C.A, C.CAM_H, C.JOGO_H
    cx, cy, cw, ch = cam
    dx, dy, dw, dh = apagar
    p = lambda v: int(v) // 2 * 2
    gwc = min(W, H * L / JH); gxc = (W - gwc) / 2
    sai = "unsharp=5:5:0.7:5:5:0.0,eq=contrast=1.05:saturation=1.10"
    delogo = f"delogo=x={dx}:y={dy}:w={dw}:h={dh}," if dw > 8 else ""
    jc = a.jogo if a.jogo else f"{p(gwc)}:{H}:{p(gxc)}:0"
    jc = jc.replace(",", ":")
    zoomf = ""
    if a.zoom:
        zz, zt, zk = [float(v) for v in a.zoom.split(",")]
        Z = f"if(lt(t\\,{zk})\\,{zz}\\,clip((t-{zt})/1.5\\,0\\,1)*{zz})"
        zoomf = f"scale=w='trunc({L}*(1+{Z})/2)*2':h='trunc({JH}*(1+{Z})/2)*2':eval=frame:flags=bicubic,crop={L}:{JH},"
    base = (f"[0:v]split=3[a][b][c];[a]crop={p(cw)}:{p(ch)}:{p(cx)}:{p(cy)},scale={L}:{CH}:flags=bicubic,hqdn3d=1:1:2:2,{sai},setsar=1[cam];"
            f"[b]{delogo}crop={jc},scale={L}:{JH}:flags=bicubic,{zoomf}{sai},setsar=1[jogo];"
            f"[c]scale=135:240:force_original_aspect_ratio=increase,crop=135:240,boxblur=3:1,scale={L}:{A}:flags=bicubic,eq=brightness=-0.08[bg];"
            f"[bg][cam]overlay=0:0[t1];[t1][jogo]overlay=0:{CH},setsar=1,format=yuv420p[base];[base]ass={ass}:fontsdir={C.FONTE_DIR}[tk];")
    nick = "@" + C.IDENT["nick"].lstrip("@")
    logo = C.RAIZ / C.IDENT["logo"]
    return (base + f"[tk]split=2[tk1][tk2];[2:v]scale=130:-1[l];[tk2][l]overlay=W-w-40:70[ig0];"
            f"[ig0]drawtext=fontfile={C.FONTE}:text='{nick}':fontsize=38:fontcolor=white:borderw=4:bordercolor=black:x=W-tw-40:y=70+130+10[ig]"), logo
def filtro_irl(ass):
    L, A = C.L, C.A
    sai = "unsharp=5:5:0.7:5:5:0.0,eq=contrast=1.05:saturation=1.10"
    base = (f"[0:v]split=2[b][c];[b]crop=960:720:160:0,scale={L}:810:flags=bicubic,hqdn3d=1:1:2:2,{sai},setsar=1[fg];"
            f"[c]scale=135:240:force_original_aspect_ratio=increase,crop=135:240,boxblur=3:1,scale={L}:{A}:flags=bicubic,eq=brightness=-0.08[bg];"
            f"[bg][fg]overlay=0:(H-h)/2-120,setsar=1,format=yuv420p[base];[base]ass={ass}:fontsdir={C.FONTE_DIR}[tk];")
    nick = "@" + C.IDENT["nick"].lstrip("@"); logo = C.RAIZ / C.IDENT["logo"]
    return (base + f"[tk]split=2[tk1][tk2];[2:v]scale=130:-1[l];[tk2][l]overlay=W-w-40:70[ig0];"
            f"[ig0]drawtext=fontfile={C.FONTE}:text='{nick}':fontsize=38:fontcolor=white:borderw=4:bordercolor=black:x=W-tw-40:y=70+130+10[ig]"), logo
fcg, logo = filtro_irl(ass.name) if a.modo == "irl" else filtro_rapido(W, H, rosto, ass.name)
sfx = AQUI / "sfx" / f"{a.sfx}.wav"; ms = int(tr * 1000)
af = (f"[0:a]loudnorm=I=-16:TP=-1.5:LRA=11[va];[3:a]adelay={ms}|{ms},volume={a.sfx_vol}[sx];"
      f"[va][sx]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.95[aout]")
enc = ["-c:v", "libx264", "-preset", "veryfast", "-crf", "19", "-maxrate", "5M", "-bufsize", "10M", "-r", "30", "-c:a", "aac", "-b:a", "192k",
       "-t", f"{d:.2f}", "-movflags", "+faststart"]
ss = ["-ss", f"{a.inicio:.2f}"]
cmd = ["ionice", "-c3", "nice", "-n", "15", "ffmpeg", "-nostdin", "-y", "-loglevel", "error", *ss, "-i", a.ts, *ss, "-i", a.ts, "-i", str(logo), "-i", str(sfx),
       "-filter_complex", fcg + ";" + af,
       "-map", "[tk1]", "-map", "[aout]", *enc, f"{a.nome}_tiktok.mp4",
       "-map", "[ig]", "-map", "[aout]", *enc, f"{a.nome}_ig.mp4"]
# amix usado em duas saídas: precisa de asplit
cmd[cmd.index("-filter_complex") + 1] = fcg + ";" + af.replace("alimiter=limit=0.95[aout]", "alimiter=limit=0.95,asplit=2[a1][a2]")
cmd[cmd.index("[aout]")] = "[a1]"; cmd[len(cmd) - 1 - cmd[::-1].index("[aout]")] = "[a2]"
subprocess.run([str(c) for c in cmd], cwd=pasta, check=True)
(pasta / "meta.json").write_text(json.dumps({"id": a.nome, "origem": a.ts, "inicio": a.inicio, "dur": d, "gancho": a.gancho,
    "reacao": a.reacao, "t_reacao": tr, "sfx": a.sfx, "camera": rosto is not None, "status": "gerado (aguarda revisor)"}, ensure_ascii=False, indent=1))
print("OK", pasta)
