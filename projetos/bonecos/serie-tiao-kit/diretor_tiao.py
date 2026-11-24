#!/usr/bin/env python3
"""diretor_tiao.py — Diretor automatizado do Tião 3D (Nexo V8, estilo RicksClips).

Converte um episodio.json (roteiro amarrado 1:1 com ação física + câmera + cenário)
em um MP4 vertical pronto com voz Gemini TTS limpa, animação viva no motor3d (RX 550 Vulkan)
e legenda sincronizada.

Uso:
  python3 projetos/bonecos/serie-tiao-kit/diretor_tiao.py <episodio.json> [--rapido] [--saida out.mp4]
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path

KIT = Path(__file__).resolve().parent
RAIZ = KIT.parent.parent.parent
MOTOR = KIT / "motor3d"
VOZ_MJS = RAIZ / "ferramentas" / "voz.mjs"
LEGENDA_PY = KIT / "legenda.py"
APROVADOS = json.loads((KIT / "catalogo" / "aprovados.json").read_text(encoding="utf-8"))

TRIPULACAO_NAVIO = {
    "cap", "mar1", "mar2", "ruiva", "riv1", "riv2",
    "barbacoral", "coral1", "coral2", "tonho", "dede", "chiquinha",
}
ACOES_VALIDAS = {
    "andar", "correr", "apontar", "susto", "recuar",
    "comemorar", "pensar", "falar", "segurar", "disparar",
}
CAMERAS_VALIDAS = {
    "estab", "medio", "close", "punch_in", "zoom_out", "dramatico", "tremor",
}
EXPRESSOES = {
    "serio":     {"eye": "dot",   "mouth": "flat",     "brow": -0.25},
    "assustado": {"eye": "wide",  "mouth": "o",        "brow": 0.9},
    "feliz":     {"eye": "happy", "mouth": "bigsmile", "brow": 0.3},
    "bravo":     {"eye": "dot",   "mouth": "shout",    "brow": -0.95},
    "pensativo": {"eye": "smug",  "mouth": "flat",     "brow": 0.25},
    "ironico":   {"eye": "smug",  "mouth": "smile",    "brow": 0.4},
}


def ffprobe_dur(arq: Path) -> float:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(arq)],
        capture_output=True, text=True,
    )
    return float(r.stdout.strip())


def validar_episodio(ep: dict) -> list[str]:
    erros = []
    cenas = ep.get("cenas")
    if not isinstance(cenas, list) or len(cenas) < 3:
        return ["episodio.json precisa de pelo menos 3 cenas"]

    protag = ep.get("protagonista", "tiao_jaqueta")
    if protag == "tiao":
        erros.append("Use uma variante livre do Tião (tiao_base, tiao_jaqueta, tiao_terno, tiao_soldado, tiao_astro), não o 'tiao' cozinheiro legado.")
    if protag not in APROVADOS["personagens"]:
        erros.append(f"Protagonista '{protag}' não existe no catálogo.")

    cams = []
    for i, c in enumerate(cenas, 1):
        fala = str(c.get("fala", "")).strip()
        cen = str(c.get("cenario", "")).strip()
        acao = str(c.get("acao", "")).strip()
        cam = str(c.get("camera", "medio")).strip()
        fig = c.get("figurante")
        if not fala:
            erros.append(f"Cena {i}: fala vazia")
        elif len(fala) > 150:
            erros.append(f"Cena {i}: fala longa demais ({len(fala)} > 150 chars)")
        if cen not in APROVADOS["cenarios"]:
            erros.append(f"Cena {i}: cenário '{cen}' não existe no motor3d")
        if acao not in ACOES_VALIDAS:
            erros.append(f"Cena {i}: acao '{acao}' inválida (use: {sorted(ACOES_VALIDAS)})")
        if cam not in CAMERAS_VALIDAS:
            erros.append(f"Cena {i}: camera '{cam}' inválida (use: {sorted(CAMERAS_VALIDAS)})")
        if fig:
            if fig not in APROVADOS["personagens"]:
                erros.append(f"Cena {i}: figurante '{fig}' não existe no catálogo")
            if fig in TRIPULACAO_NAVIO and cen != "navioberm":
                erros.append(f"Cena {i}: figurante '{fig}' é da tripulação do navio — proibido fora de navioberm")
        cams.append(cam)
        if len(cams) >= 3 and cams[-1] == cams[-2] == cams[-3]:
            erros.append(f"Cena {i}: câmera '{cam}' repetida 3x seguidas — varie o enquadramento!")
    return erros


def gerar_vozes(ep: dict, proj_dir: Path) -> tuple[list[list[float]], Path, list[dict]]:
    voz_dir = proj_dir / "voz"
    voz_dir.mkdir(parents=True, exist_ok=True)
    voz_nome = ep.get("voz", "Fenrir")
    estilo_tts = ep.get(
        "estilo_tts",
        "Fale em português do Brasil, tom envolvente, ritmo ágil e natural de contador de histórias no YouTube Shorts:",
    )

    partes_wav = []
    ft = []
    palavras = []
    cursor = 0.0
    pausa_s = 0.14
    sil_wav = voz_dir / "_silencio.wav"
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", f"anullsrc=r=24000:cl=mono", "-t", str(pausa_s), str(sil_wav)],
        check=True,
    )

    for idx, cena in enumerate(ep["cenas"]):
        mp3 = voz_dir / f"c{idx:02d}.mp3"
        wav = voz_dir / f"c{idx:02d}.wav"
        fala = cena["fala"].strip()
        if not mp3.is_file():
            r = subprocess.run(
                ["node", str(VOZ_MJS), "--texto", fala, "--saida", str(mp3), "--voz", voz_nome, "--estilo", estilo_tts],
                cwd=RAIZ, capture_output=True, text=True,
            )
            if r.returncode != 0 or not mp3.is_file():
                raise RuntimeError(f"Gemini TTS falhou na cena {idx+1}: {(r.stderr or r.stdout)[-300:]}")
        # Converte para WAV mono 24kHz removendo silêncio morto das pontas (sem acelerar robótico!)
        subprocess.run(
            [
                "ffmpeg", "-y", "-loglevel", "error", "-i", str(mp3),
                "-af", "silenceremove=start_periods=1:start_silence=0.04:start_threshold=-42dB,areverse,silenceremove=start_periods=1:start_silence=0.05:start_threshold=-42dB,areverse",
                "-ar", "24000", "-ac", "1", str(wav),
            ],
            check=True,
        )
        dur = ffprobe_dur(wav)
        ini = round(cursor, 3)
        fim = round(cursor + dur, 3)
        ft.append([ini, fim])

        # Timing proporcional limpo por palavra dentro do intervalo real da cena
        ws = [w for w in re.split(r"\s+", fala) if w]
        pesos = [max(2, len(re.sub(r"[^\w]", "", w))) for w in ws]
        tot_p = sum(pesos) or 1
        w_cur = ini
        for w, peso in zip(ws, pesos):
            w_dur = dur * (peso / tot_p)
            palavras.append({"w": w, "ini": round(w_cur, 3), "fim": round(w_cur + w_dur, 3)})
            w_cur += w_dur

        partes_wav.append(wav)
        cursor += dur
        if idx < len(ep["cenas"]) - 1:
            partes_wav.append(sil_wav)
            cursor += pausa_s

    lista_txt = voz_dir / "concat.txt"
    lista_txt.write_text("\n".join(f"file '{p.resolve()}'" for p in partes_wav) + "\n", encoding="utf-8")
    dialogo_wav = voz_dir / "dialogo.wav"
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lista_txt), "-c:a", "pcm_s16le", str(dialogo_wav)],
        check=True,
    )
    return ft, dialogo_wav, palavras


def preparar_web(ep: dict, ft: list[list[float]], dur_total: float, fps: int, proj_dir: Path) -> Path:
    web = proj_dir / "web"
    web.mkdir(parents=True, exist_ok=True)
    for item in MOTOR.iterdir():
        if item.name in ("story.js", "tempos.js", "node_modules", "lib"):
            continue
        dst = web / item.name
        if item.is_file():
            shutil.copy2(item, dst)
    for link_name, src in [("lib", MOTOR / "lib"), ("assets", MOTOR / "assets"), ("node_modules", RAIZ / "node_modules")]:
        dst = web / link_name
        if src.exists() and not dst.exists():
            dst.symlink_to(src.resolve())

    (web / "tempos.js").write_text(
        f"export const FT = {json.dumps(ft)};\nexport const DUR = {dur_total:.3f};\n",
        encoding="utf-8",
    )

    cenas_js = json.dumps(ep["cenas"], ensure_ascii=False, indent=2)
    protag = ep.get("protagonista", "tiao_jaqueta")
    story = f"""// Gerado automaticamente por diretor_tiao.py (Nexo V8 — RicksClips-grade)
import {{ luz }} from './luzes.js';
import {{ boneco, anda }} from './acoes.js';
import {{ ORIGEM }} from './cenarios.js';
import {{ tremor }} from './efeitos.js';
import {{ Pz }} from './Pz.js';
import {{ FT, DUR }} from './tempos.js';

export const FPS = {fps};
export const TOTAL = Math.max(1, Math.round(DUR * FPS));
const PROTAG = {json.dumps(protag)};
const CENAS = {cenas_js};
const EXP = {json.dumps(EXPRESSOES)};

const sm = (x) => {{ x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }};
const lerp = (a, b, u) => a + (b - a) * u;

export const SHOTS = CENAS.map((c, i) => {{
  const t0 = i === 0 ? 0 : FT[i][0];
  const t1 = i + 1 < CENAS.length ? FT[i + 1][0] : DUR;
  return {{
    ...c,
    idx: i,
    cen: c.cenario,
    t0,
    t1,
    a: Math.round(t0 * FPS),
    b: i + 1 < CENAS.length ? Math.round(t1 * FPS) : TOTAL,
  }};
}});

export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f < s.b) || SHOTS[SHOTS.length - 1];
export const LIGHTS = {{}};
export const lightFor = (S) => luz(S.cen);

function camParams(S, u, f) {{
  const alt = S.idx % 2 === 0 ? 1 : -1;
  const cam = S.camera || 'medio';
  let az = alt * 12, dist = 4.3, h = 1.45, ly = 1.15, fov = 48, trk = 0;
  if (cam === 'estab') {{
    az = alt * 18; dist = lerp(5.9, 5.1, sm(u)); h = 1.85; ly = 1.1; fov = 54;
  }} else if (cam === 'medio') {{
    az = alt * 10; dist = lerp(4.4, 3.85, sm(u)); h = 1.42; ly = 1.15; fov = 48;
  }} else if (cam === 'close') {{
    az = alt * 6; dist = lerp(2.75, 2.48, sm(u)); h = 1.46; ly = 1.38; fov = 42;
  }} else if (cam === 'punch_in') {{
    const p = sm(Math.min(1, u * 3.6));
    az = alt * 8; dist = lerp(4.7, 2.75, p); h = lerp(1.5, 1.44, p); ly = lerp(1.15, 1.36, p); fov = lerp(50, 42, p);
  }} else if (cam === 'zoom_out') {{
    const p = sm(u);
    az = alt * 14; dist = lerp(2.9, 5.6, p); h = lerp(1.42, 1.85, p); ly = lerp(1.32, 1.08, p); fov = lerp(44, 54, p);
  }} else if (cam === 'dramatico') {{
    az = alt * 26; dist = lerp(3.9, 3.3, sm(u)); h = 0.72; ly = 1.36; fov = 48;
  }} else if (cam === 'tremor') {{
    az = alt * 9; dist = lerp(3.8, 3.2, sm(u)); h = 1.38; ly = 1.25; fov = 46; trk = 0.9;
  }}
  const tr = trk > 0 ? tremor(f, trk) : {{ dx: 0, dy: 0 }};
  return {{ az, dist, h, ly, fov, tr }};
}}

export const camAt = (f) => {{
  const S = shotAt(f), o = ORIGEM[S.cen] || {{ x: 0, z: 0 }};
  const u = Math.max(0, Math.min(1, (f - S.a) / Math.max(1, S.b - S.a)));
  const c = camParams(S, u, f);
  const rad = c.az * Math.PI / 180;
  const cx = o.x + Math.sin(rad) * c.dist + c.tr.dx;
  const cz = o.z + Math.cos(rad) * c.dist;
  return {{ pos: [cx, c.h + c.tr.dy, cz], look: [o.x, c.ly, o.z], fov: c.fov }};
}};

export const dofAt = (f) => {{
  const c = camAt(f);
  return {{ focus: Math.hypot(c.pos[0] - c.look[0], c.pos[1] - c.look[1], c.pos[2] - c.look[2]), cinf: 0 }};
}};

export const worldAt = (f) => {{
  const S = shotAt(f);
  return {{ cenario: S.cen, [S.cen]: {{}} }};
}};

function poseDaAcao(acao, exp, prop, u, t, falaPersonagem) {{
  const base = EXP[exp] || EXP.serio;
  // REGRA RICKSCLIPS: narração em 3ª pessoa = boca FECHADA! Só abre boca em fala direta do personagem (fala_personagem: true)
  const boca = falaPersonagem ? 0.25 + 0.75 * Math.abs(Math.sin(t * 14.5)) : 0;
  const mouth = falaPersonagem ? (base.mouth === 'o' ? 'o' : base.mouth === 'shout' ? 'shout' : 'grin') : base.mouth;
  const wave = Math.sin(t * 5.2);
  let p = {{ ...base, mouth, mo: boca, tilt: 0, bob: 0 }};

  if (acao === 'apontar') {{
    const k = sm(Math.min(1, u * 3));
    p = {{ ...p, lean: 0.1 * k, aR: [lerp(0.3, 1.75, k) + wave * 0.06, -0.15], aL: [-0.35, 0.35], apontaR: true }};
  }} else if (acao === 'susto') {{
    const k = sm(Math.min(1, u * 4));
    p = {{ ...p, ...Pz.susto(k), eye: 'wide', mouth: 'o', mo: 0.9 }};
  }} else if (acao === 'recuar') {{
    const k = sm(u);
    p = {{ ...p, ...Pz.recuar(k), eye: 'wide' }};
  }} else if (acao === 'comemorar') {{
    p = {{ ...p, ...Pz.comemorar(t), eye: 'happy', mouth: 'bigsmile' }};
  }} else if (acao === 'pensar') {{
    p = {{ ...p, ...Pz.pensar(), tilt: -0.08 + Math.sin(t * 2) * 0.04 }};
  }} else if (acao === 'segurar') {{
    const k = sm(Math.min(1, u * 2.5));
    const seg = Pz.segurar(prop || 'relogio', {{ lado: 'R', mostra: true, s: 0.78, subir: k }});
    p = {{ ...p, ...seg, lean: 0.06 * k }};
  }} else if (acao === 'disparar') {{
    const flash = Math.sin(u * Math.PI * 6) > 0.65 ? 1 : 0;
    const recoil = flash ? 0.22 : 0;
    p = {{ ...p, lean: -0.08 - recoil * 0.5, aR: [1.35 + recoil, -0.2], aL: [0.95 + recoil, -0.35], hR: {{ k: prop || 'fuzil', a: -1.55, s: 0.85, flash }} }};
  }} else if (acao === 'falar') {{
    p = {{ ...p, lean: 0.04 + wave * 0.03, aR: [0.6 + wave * 0.35, -0.8], aL: [-0.45 - wave * 0.25, 0.7] }};
  }}
  if (prop && acao !== 'segurar' && acao !== 'disparar') {{
    p.hR = {{ k: prop, a: 0.1, s: 1.1 }};
  }}
  return p;
}}

export const actorsAt = (f, T, W) => {{
  const S = shotAt(f), t = f / FPS, O = ORIGEM[S.cen] || {{ x: 0, z: 0 }};
  const u = Math.max(0, Math.min(1, (f - S.a) / Math.max(1, S.b - S.a)));
  const tint = luz(S.cen).tint;
  const out = [];
  const temFig = Boolean(S.figurante);
  const pxBase = temFig ? -0.58 : 0.0;

  const falaP = Boolean(S.fala_personagem);
  if (S.acao === 'andar' || S.acao === 'correr') {{
    const dist = S.acao === 'correr' ? 2.2 : 1.35;
    const pPose = poseDaAcao('falar', S.expressao, S.prop, u, t, falaP);
    out.push({{ tint, ...anda(W, PROTAG, pPose, [O.x + pxBase - dist * 0.5, O.z], [O.x + pxBase + dist * 0.4, O.z], u, t) }});
  }} else {{
    const pPose = poseDaAcao(S.acao, S.expressao, S.prop, u, t, falaP);
    out.push({{ tint, ...boneco(W, PROTAG, pPose, O.x + pxBase, O.z, t) }});
  }}

  if (temFig) {{
    const fPose = poseDaAcao(S.figurante_acao || 'pensar', S.figurante_expressao || 'serio', null, u, t, false);
    fPose.f = -1;
    out.push({{ tint, ...boneco(W, S.figurante, fPose, O.x + 0.68, O.z + 0.12, t) }});
  }}
  return out;
}};

export const fxAt = () => [];
"""
    (web / "story.js").write_text(story, encoding="utf-8")
    return web


def produzir(ep_path: Path, rapido: bool = True, saida_extra: str | None = None) -> int:
    t0 = time.monotonic()
    ep = json.loads(ep_path.read_text(encoding="utf-8"))
    erros = validar_episodio(ep)
    if erros:
        print("REPROVADO NA VALIDAÇÃO:", file=sys.stderr)
        for e in erros:
            print("  -", e, file=sys.stderr)
        return 1

    slug = re.sub(r"[^a-z0-9-]+", "-", ep.get("slug", ep_path.stem).lower()).strip("-") or "piloto"
    ts = datetime.now().strftime("%Y%m%d-%H%M%S")
    proj_dir = RAIZ / "projetos" / "bonecos" / f"{ts}-tiao-{slug}"
    proj_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ep_path, proj_dir / "episodio.json")

    print(f"[1/5] Gerando vozes Gemini TTS ({len(ep['cenas'])} cenas)...")
    t_v = time.monotonic()
    ft, dialogo_wav, palavras = gerar_vozes(ep, proj_dir)
    dur_total = round(ffprobe_dur(dialogo_wav) + 0.25, 3)
    print(f"      Voz ok: {dur_total:.2f}s em {time.monotonic() - t_v:.1f}s")

    print("[2/5] Gerando legenda sincronizada (.ass)...")
    pal_json = proj_dir / "voz" / "palavras.json"
    pal_json.write_text(json.dumps(palavras, ensure_ascii=False, indent=2), encoding="utf-8")
    leg_ass = proj_dir / "legenda.ass"
    subprocess.run([sys.executable, str(LEGENDA_PY), str(pal_json), str(leg_ass)], check=True)

    fps = 24 if rapido else 30
    print(f"[3/5] Montando cena dinâmica no motor3d ({fps} fps)...")
    web = preparar_web(ep, ft, dur_total, fps, proj_dir)
    total_frames = max(1, round(dur_total * fps))

    quadros_dir = proj_dir / "quadros"
    quadros_dir.mkdir(parents=True, exist_ok=True)
    print(f"[4/5] Renderizando {total_frames} quadros no motor3d (TIAO_GPU=vulkan)...")
    t_r = time.monotonic()
    env = {**os.environ, "TIAO_GPU": "vulkan", "WEB": str(web.resolve())}
    r_ren = subprocess.run(
        ["node", str(web / "render.mjs"), str(quadros_dir.resolve()), f"0-{total_frames - 1}", "1", "84" if rapido else "92"],
        cwd=web, env=env, text=True,
    )
    if r_ren.returncode != 0:
        print("ERRO no render motor3d", file=sys.stderr)
        return 1
    print(f"      Render ok em {time.monotonic() - t_r:.1f}s")

    print("[5/5] Encodando MP4 final com áudio -14 LUFS + legenda...")
    out_mp4 = proj_dir / f"{slug}.mp4"
    scale = "scale=720:1280:flags=lanczos," if rapido else ""
    ass_esc = str(leg_ass.resolve()).replace("\\", "/").replace(":", "\\:")
    subprocess.run(
        [
            "ffmpeg", "-y", "-loglevel", "error",
            "-framerate", str(fps),
            "-i", str(quadros_dir / "f%04d.jpg"),
            "-i", str(dialogo_wav),
            "-vf", f"{scale}ass='{ass_esc}'",
            "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "192k",
            "-shortest", "-movflags", "+faststart",
            str(out_mp4),
        ],
        check=True,
    )

    if saida_extra:
        dest = Path(saida_extra)
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(out_mp4, dest)
        out_mp4 = dest

    print(json.dumps({
        "ok": True,
        "arquivo": str(out_mp4),
        "duracao_s": round(ffprobe_dur(out_mp4), 2),
        "quadros": total_frames,
        "tempo_total_s": round(time.monotonic() - t0, 1),
    }, ensure_ascii=False))
    return 0


def main() -> int:
    p = argparse.ArgumentParser(description="Diretor automatizado do Tião 3D (Nexo V8)")
    p.add_argument("episodio", help="Caminho para episodio.json")
    p.add_argument("--rapido", action="store_true", help="720p 24fps rápido para revisão")
    p.add_argument("--saida", default=None, help="Caminho opcional de cópia do MP4 final")
    args = p.parse_args()
    return produzir(Path(args.episodio), rapido=args.rapido, saida_extra=args.saida)


if __name__ == "__main__":
    sys.exit(main())
