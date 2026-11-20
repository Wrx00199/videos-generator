#!/usr/bin/env python3
"""TTS local com Kokoro ONNX (am_fenrir, pt-br). Substituto do Piper/Gemini.
Uso: python3 voz_kokoro.py <arquivo_texto> <arquivo_saida.wav>
Requer venv: /home/wr/.local/share/kokoro-venv
Modelos: /home/wr/.local/share/kokoro-models/
"""
import subprocess, sys, json, tempfile
from pathlib import Path

VENV_PYTHON = Path.home() / '.local/share/kokoro-venv/bin/python3'
MODEL = Path.home() / '.local/share/kokoro-models/kokoro-v1.0.onnx'
VOICES = Path.home() / '.local/share/kokoro-models/voices-v1.0.bin'
VOICE = 'am_fenrir'
LANG = 'pt-br'
SPEED = 1.0

WORKER_SCRIPT = '''
import numpy as np, wave, json, sys
from kokoro_onnx import Kokoro

texto = open(sys.argv[1], encoding="utf-8").read().strip()
saida = sys.argv[2]
model = sys.argv[3]
voices = sys.argv[4]
voice = sys.argv[5]
lang = sys.argv[6]
speed = float(sys.argv[7])

k = Kokoro(model, voices)
audio, sr = k.create(texto, voice=voice, speed=speed, lang=lang)

with wave.open(saida, "w") as wf:
    wf.setnchannels(1)
    wf.setsampwidth(2)
    wf.setframerate(sr)
    samples = (audio * 32767).astype(np.int16)
    wf.writeframes(samples.tobytes())

dur = len(audio) / sr
print(json.dumps({"ok": True, "duracao_s": round(dur, 3), "arquivo": saida}))
'''

def gerar(texto: str, saida: Path) -> float:
    """Gera áudio com Kokoro via venv isolado. Retorna duração em segundos."""
    if not VENV_PYTHON.exists():
        raise FileNotFoundError(f'Venv Kokoro não encontrado: {VENV_PYTHON}')
    if not MODEL.exists():
        raise FileNotFoundError(f'Modelo Kokoro não encontrado: {MODEL}')

    # Escrever texto e script worker em arquivos temporários (evita problemas de escape)
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as tf:
        tf.write(texto)
        txt_path = tf.name

    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as sf:
        sf.write(WORKER_SCRIPT)
        script_path = sf.name

    try:
        r = subprocess.run(
            [str(VENV_PYTHON), script_path, txt_path, str(saida),
             str(MODEL), str(VOICES), VOICE, LANG, str(SPEED)],
            capture_output=True, text=True, timeout=120
        )
        if r.returncode:
            raise RuntimeError(f'Kokoro falhou: {r.stderr[:500]}')
        out = json.loads(r.stdout.strip().splitlines()[-1])
        return out['duracao_s']
    finally:
        Path(txt_path).unlink(missing_ok=True)
        Path(script_path).unlink(missing_ok=True)


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print(f'Uso: {sys.argv[0]} <texto.txt> <saida.wav>', file=sys.stderr)
        sys.exit(1)
    txt = Path(sys.argv[1]).read_text(encoding='utf-8').strip()
    out = Path(sys.argv[2])
    d = gerar(txt, out)
    print(json.dumps({"ok": True, "duracao_s": d, "arquivo": str(out)}))