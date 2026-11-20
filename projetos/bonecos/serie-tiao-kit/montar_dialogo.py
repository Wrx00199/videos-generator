#!/usr/bin/env python3
"""Monta voz/dialogo.wav a partir de voz/_por_personagem/<quem>_<i>.wav (1 arquivo por fala, gerado por voz_fala.py): corta silêncio de borda, acelera (atempo, padrão 1,28), junta com pausas e escreve voz/falas_tempos.json e tempos_ft.js.
Uso: python3 montar_dialogo.py <pasta_ep> [--vel 1.28]"""
import json, subprocess, os, sys, wave
P = sys.argv[1]; SP = float(sys.argv[sys.argv.index('--vel') + 1]) if '--vel' in sys.argv else 1.28; SR = 24000
F = json.load(open(f'{P}/falas.json'))['falas']; os.makedirs(f'{P}/voz/_t', exist_ok=True)
dur = lambda p: (lambda w: w.getnframes() / w.getframerate())(wave.open(p))
t = 0.0; tempos = []; lst = []
for i, f in enumerate(F):
    src = f"{P}/voz/_por_personagem/{f['quem']}_{i}.wav"; dst = f'{P}/voz/_t/{i:02d}.wav'
    sil = 'silenceremove=start_periods=1:start_threshold=-48dB:start_silence=0.03'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', src, '-af', f'{sil},areverse,{sil},areverse,atempo={SP}', '-ar', str(SR), '-ac', '1', dst], check=True)
    d = dur(dst); g = f.get('pausa', 0) + 0.08
    tempos.append({'i': i, 'quem': f['quem'], 'ini': round(t, 3), 'fim': round(t + d, 3), 'texto': f['texto']}); t += d + g
    s = f'{P}/voz/_t/s{i:02d}.wav'; subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'lavfi', '-i', f'anullsrc=r={SR}:cl=mono', '-t', str(g), s], check=True); lst += [dst, s]
open(f'{P}/voz/_t/lista.txt', 'w').write(''.join(f"file '{os.path.abspath(p)}'\n" for p in lst))
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', f'{P}/voz/_t/lista.txt', '-c', 'copy', f'{P}/voz/dialogo.wav'], check=True)
json.dump(tempos, open(f'{P}/voz/falas_tempos.json', 'w'), ensure_ascii=False, indent=1)
T = tempos[-1]['fim']; w = sum(len(f['texto'].split()) for f in F)
open(f'{P}/tempos_ft.js', 'w').write('export const FT = ' + json.dumps([[x['ini'], x['fim']] for x in tempos]) + ';\nexport const DUR = ' + str(round(T + 0.6, 2)) + ';\n')
print(f'{T:.1f} s, {w / T:.2f} pal/s')
