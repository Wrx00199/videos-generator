"""Espelho de uma referência: desmonta tudo que dá para medir, em paralelo, com tempo por etapa.

Uso (Linux):
  <python do rea-video> ferramentas/espelho.py projetos/<pasta> [--sem-vlm]
    Linux:   ferramentas/rea-video/.venv/bin/python
    Windows: ferramentas\\rea-video\\.venv\\Scripts\\python.exe

Precisa de original.mp4 na pasta. Grava:
  rea/        rea-video decompose (planos, textos da tela com posição/cor/tempo, SFX, movimento, narrativa via VLM)
  fala.json   stt.py (tempo por palavra)
  estilo.json medir_estilo.py
  espelho.json  resumo enxuto para o roteirista (cortes, textos da tela, fala, números, tempos)
VLM = Gemini pela API compatível com OpenAI, conta única GEMINI_API_KEY_1 do .env (nunca imprime a chave).
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
PY = sys.executable  # o python do venv do rea-video (tem OpenCV e as libs)
WIN = os.name == "nt"
import shutil
# stt.py usa faster-whisper, que está no Python do sistema (não no venv do rea-video)
PY_SIS = shutil.which("python3") or shutil.which("python") or "python"
REA = RAIZ / "ferramentas" / "rea-video" / ".venv" / ("Scripts/rea-video.exe" if WIN else "bin/rea-video")


def env_estudio() -> dict:
    e = dict(os.environ)
    p = RAIZ / ".env"
    if p.exists():
        for l in p.read_text(encoding="utf-8").splitlines():
            if "=" in l and not l.lstrip().startswith("#"):
                k, v = l.split("=", 1)
                e.setdefault(k.strip(), v.strip().strip('"').strip("'"))
    chave = e.get("GEMINI_API_KEY") or e.get("GEMINI_API_KEY_1")
    if chave:
        e["REA_VLM_BASE_URL"] = "https://generativelanguage.googleapis.com/v1beta/openai"
        e["REA_VLM_API_KEY"] = chave
        e.setdefault("REA_VLM_MODEL", "gemini-3-flash-preview")  # 2.5 aposentado (14/11)
    e["REA_OCR_LANG"] = "latin"
    e["OPENCV_LOG_LEVEL"] = "ERROR"
    return e


def rodar(nome: str, cmd: list, cwd: Path, env: dict, saida: Path | None = None) -> tuple[str, float, int, str]:
    t = time.monotonic()
    tmp = saida.with_suffix(saida.suffix + ".partial") if saida else None
    try:
        with (open(tmp, "w", encoding="utf-8") if tmp else open(os.devnull, "w")) as out:
            r = subprocess.run(cmd, cwd=cwd, env=env, stdout=out, stderr=subprocess.PIPE, text=True,
                               encoding="utf-8", errors="replace", timeout=600)
        rc, err = r.returncode, (r.stderr or "")[-1200:]
        if rc == 0 and tmp:
            try:
                json.loads(tmp.read_text(encoding="utf-8"))
            except (ValueError, OSError) as e:
                rc, err = 1, f"JSON inválido: {e}"
            if rc == 0: tmp.replace(saida)
        return nome, round(time.monotonic()-t, 2), rc, err
    except (OSError, subprocess.TimeoutExpired) as e:
        return nome, round(time.monotonic()-t, 2), 1, str(e)
    finally:
        if tmp: tmp.unlink(missing_ok=True)


def executar(tarefas, pasta, env):
    """Desmontar em paralelo com ouvir→medir; nenhuma dependência roda após falha."""
    def cadeia(nomes):
        resultados=[]
        for nome in nomes:
            tarefa=next((x for x in tarefas if x[0]==nome),None)
            if tarefa:
                r=rodar(tarefa[0],tarefa[1],pasta,env,tarefa[2])
                resultados.append(r)
                if r[2]: break
        return resultados
    with ThreadPoolExecutor(2) as ex:
        a=ex.submit(cadeia,["desmontar"])
        b=ex.submit(cadeia,["ouvir","medir"])
        resultados=a.result()+b.result()
    erros=[f"{n} ({t}s): {e}" for n,t,rc,e in resultados if rc]
    if erros: raise RuntimeError("; ".join(erros))
    return {n:t for n,t,rc,e in resultados}


def main() -> None:
    pasta = (RAIZ / sys.argv[1]).resolve() if len(sys.argv)>1 else sys.exit(__doc__)
    orig = pasta / "original.mp4"
    if not orig.is_file(): sys.exit(f"sem {orig}")
    antigos=[x for x in ("rea", "fala.wav", "fala.json", "estilo.json", "espelho.json") if (pasta/x).exists()]
    if antigos: sys.exit("Pasta já tem resultados: " + ", ".join(antigos) + ". Crie execução nova com clone.py iniciar; nada será sobrescrito/reaproveitado.")
    env=env_estudio(); t0=time.monotonic()
    try:
        subprocess.run(["ffmpeg","-y","-loglevel","error","-i",str(orig),"-vn","-ac","1","-ar","16000",str(pasta/"fala.wav")],check=True,timeout=60)
        vlm="--sem-vlm" not in sys.argv and bool(env.get("REA_VLM_API_KEY"))
        tarefas=[("desmontar",[str(REA),"decompose","original.mp4","-o","rea","--no-asr","--no-stems","--no-speakers","--ocr-lang","latin","--lang","en","--vlm" if vlm else "--no-vlm"],None),
                 ("ouvir",[PY_SIS,str(RAIZ/"ferramentas/stt.py"),"fala.wav","auto","small"],pasta/"fala.json"),
                 ("medir",[PY,"-I",str(RAIZ/"ferramentas/medir_estilo.py"),"original.mp4","--fala","fala.json","--json","estilo.json"],None)]
        tempos=executar(tarefas,pasta,env)
        tempos["total"]=round(time.monotonic()-t0,2)
        resumo(pasta,tempos)
    except (RuntimeError, OSError, subprocess.SubprocessError, ValueError) as e:
        (pasta/"falha-espelho.json").write_text(json.dumps({"ok":False,"erro":str(e),"total_s":round(time.monotonic()-t0,2)},ensure_ascii=False),encoding="utf-8")
        sys.exit(f"ERRO espelho: {e}")
    print(json.dumps({"ok":True,"pasta":str(pasta),"tempos_s":tempos},ensure_ascii=False))


def resumo(pasta: Path, tempos: dict) -> None:
    """espelho.json: só o que o roteirista precisa, sem o JSON cru gigante."""
    for rel in ("rea/breakdown.json", "fala.json", "estilo.json"):
        if not (pasta/rel).is_file(): raise ValueError(f"evidência obrigatória ausente: {rel}")
    b = json.loads((pasta / "rea" / "breakdown.json").read_text(encoding="utf-8")) if (pasta / "rea" / "breakdown.json").exists() else {}
    fala = json.loads((pasta / "fala.json").read_text(encoding="utf-8")) if (pasta / "fala.json").exists() else {}
    est = json.loads((pasta / "estilo.json").read_text(encoding="utf-8")) if (pasta / "estilo.json").exists() else {}
    if not isinstance(b,dict) or not isinstance(b.get("source"),dict) or not b["source"].get("duration") or not b.get("shots"):
        raise ValueError("breakdown sem duração/planos")
    if not isinstance(fala,dict) or not isinstance(fala.get("segmentos"),list): raise ValueError("fala inválida")
    if not isinstance(est,dict) or not est.get("duracao_s"): raise ValueError("estilo inválido")
    planos = [{"id": s.get("id"), "ini": round(s.get("start", 0), 2), "fim": round(s.get("end", 0), 2),
               "tipo": (s.get("classification") or s.get("made") or {}).get("label") if isinstance(s.get("classification") or s.get("made"), dict) else s.get("label"),
               "camera": (s.get("facts") or {}).get("temporal_family")} for s in b.get("shots", [])]
    textos = [{"ini": c.get("t0"), "fim": c.get("t1"), "texto": c.get("text"), "caixa": c.get("bbox"),
               "cor": (c.get("style") or {}).get("fill"), "contorno": (c.get("style") or {}).get("stroke"), "revela": c.get("reveal")}
              for c in (b.get("packaging") or {}).get("text_cues", [])]
    brutos = (b.get("packaging") or {}).get("sfx") or (b.get("audio") or {}).get("sfx") or []
    sfx = [{"t": round(float(x.get("t", x.get("start", 0)) or 0), 2), "tipo": x.get("label") or x.get("kind")}
           for x in (brutos if isinstance(brutos, list) else []) if isinstance(x, dict)][:40]
    out = {"duracao_s": (b.get("source") or {}).get("duration"), "planos": planos, "textos_tela": textos, "sfx": sfx,
           "narrativa": b.get("narrative") or [], "fala": fala.get("segmentos", []), "idioma_fala": fala.get("idioma"),
           "estilo": est, "tempos_s": tempos}
    (pasta / "espelho.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
