#!/usr/bin/env python3
"""Gera UMA fala por chamada (sem corte por silêncio, que trocou falas de lugar no ep. 10b) e confere com STT.
Uso: python3 voz_fala.py <falas.json> <indice> <saida.wav> [--chaves 4,5,2,3,1]
- usa as MESMAS vozes de catalogo/vozes.json; tenta uma chave por vez e só passa para a próxima no 429; nunca imprime chave
- confere com ferramentas/stt.py (modelo small): se < 70% das palavras do roteiro batem, tenta de novo 1x e avisa."""
import json, sys, os, re, subprocess, base64, urllib.request, urllib.error, difflib, unicodedata
KIT = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(KIT, '..', '..', '..'))
env = dict(l.strip().split('=', 1) for l in open(os.path.join(ROOT, '.env')) if '=' in l and not l.startswith('#'))
falas = json.load(open(sys.argv[1]))['falas']; i = int(sys.argv[2]); dst = sys.argv[3]
chaves = [int(x) for x in (sys.argv[sys.argv.index('--chaves') + 1].split(',') if '--chaves' in sys.argv else '4,5,2,3,1'.split(','))]
V = json.load(open(os.path.join(KIT, 'catalogo', 'vozes.json'))); f = falas[i]; v = V.get(f['quem']) or V['personagens'][f['quem']]
norm = lambda w: re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFD', w.lower()).encode('ascii', 'ignore').decode())
def gerar():
    texto = f"Fale em português do Brasil{', ' + f['tom'] if f.get('tom') else ''}: {f['texto']}"
    body = json.dumps({"contents": [{"parts": [{"text": texto}]}], "generationConfig": {"responseModalities": ["AUDIO"], "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": v['voz']}}}}}).encode()
    models = ['gemini-2.5-flash-preview-tts', 'gemini-3.1-flash-tts-preview', 'gemini-3.8-flash-tts']
    for m in models:
        for n in chaves:
            k = env.get(f'GEMINI_API_KEY_{n}', '').strip()
            if not k: continue
            r = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent", data=body, headers={"x-goog-api-key": k, "Content-Type": "application/json"})
            try:
                j = json.load(urllib.request.urlopen(r, timeout=120))
                cand = j.get('candidates', [{}])[0]
                if 'content' not in cand or not cand['content'].get('parts'):
                    print(f'model {m} chave {n}: sem content ({cand.get("finishReason")}) -> próxima', file=sys.stderr)
                    continue
                b = cand['content']['parts'][0]['inlineData']['data']
                open(dst + '.pcm', 'wb').write(base64.b64decode(b))
                subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 's16le', '-ar', '24000', '-ac', '1', '-i', dst + '.pcm', dst], check=True); os.remove(dst + '.pcm')
                return f"{m}:{n}"
            except urllib.error.HTTPError as e:
                print(f'model {m} chave {n}: HTTP {e.code}' + (' (cota) -> próxima' if e.code == 429 else ''), file=sys.stderr)
    sys.exit('COTA: nenhuma chave respondeu')
def confere():
    out = subprocess.run(['python3', os.path.join(ROOT, 'ferramentas', 'stt.py'), dst, 'pt', 'small'], capture_output=True, text=True).stdout
    ouv = [norm(w) for w in json.loads(out)['texto'].split()]; esp = [norm(w) for w in f['texto'].split()]
    return difflib.SequenceMatcher(None, ouv, esp).ratio(), ' '.join(ouv)
for tent in range(2):
    n = gerar(); r, ouv = confere(); print(f'fala {i} ({f["quem"]}): chave {n}, STT {r:.0%}: "{ouv}"')
    if r >= 0.70: break
