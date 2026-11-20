# Transcrição LOCAL (faster-whisper, CPU). uso: python3 lib/stt.py <audio> [idioma|auto] -> JSON {idioma, texto, segmentos[{ini,fim,texto}], palavras[{w,ini,fim}]}
import sys, json
from faster_whisper import WhisperModel
arq = sys.argv[1]; lang = None if len(sys.argv) < 3 or sys.argv[2] == 'auto' else sys.argv[2]
m = WhisperModel(sys.argv[3] if len(sys.argv) > 3 else 'base', device='cpu', compute_type='int8', cpu_threads=2)
segs, info = m.transcribe(arq, language=lang, word_timestamps=True, vad_filter=False, beam_size=1)
S, P = [], []
for s in segs:
    S.append({'ini': round(s.start, 2), 'fim': round(s.end, 2), 'texto': s.text.strip()})
    for w in (s.words or []): P.append({'w': w.word.strip(), 'ini': round(w.start, 2), 'fim': round(w.end, 2)})
print(json.dumps({'idioma': info.language, 'texto': ' '.join(x['texto'] for x in S).strip(), 'segmentos': S, 'palavras': P}, ensure_ascii=False))
