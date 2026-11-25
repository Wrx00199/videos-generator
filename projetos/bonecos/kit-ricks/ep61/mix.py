# ep61: voz + música (marimba -> cello na virada 28,4 s) + SFX reais + legenda -> MP4 1080
import subprocess, sys, os
B = '/media/wr/HDD/Estudio de video/banco/'
FR = sys.argv[1]; OUT = sys.argv[2]; DUR = 1887 / 30
SHOT = [93, 151, 251, 321, 411, 483, 544, 633, 713, 791, 852, 986, 1147, 1236, 1401, 1521, 1681, 1758]
S = [(f / 30, 'whoosh.wav', -14) for f in SHOT]
S += [(t, 'pop.wav', -14) for t in (0.3, 2.0, 4.1, 8.0, 12.5, 15.2, 17.8, 20.8, 23.2, 29.0, 31.5, 36.0, 38.5, 41.5, 44.0, 47.0, 49.5, 53.0, 55.0, 58.1)]
S += [(1.5, 'real/multidao_murmurando.wav', -24), (14.6, 'real/multidao_aplausos.wav', -18), (27.0, 'real/buzina_caminhao.wav', -16),
      (60.1, 'real/buzina_caminhao.wav', -14), (60.6, 'real/multidao_aplausos.wav', -16), (815 / 30, 'impacto.wav', -12), (1800 / 30, 'impacto.wav', -12),
      (41.5, 'ding.wav', -12), (19.9, 'carimbo.wav', -14), (23.4, 'carimbo.wav', -14), (25.9, 'carimbo.wav', -14), (34.0, 'real/vento_uivando.wav', -26),
      (37.5, 'real/tecla.wav', -16), (58.1, 'real/boing_cartoon.wav', -14), (1.4, 'real/boing_cartoon.wav', -16)]
ins = ['-framerate', '30', '-i', FR + '/f%04d.jpg', '-i', 'voz_tight.wav', '-i', B + 'musica/marimba_alegre_brincalhona.mp3', '-stream_loop', '-1', '-i', B + 'musica/tensa_cello_suspense.mp3']
fl = ['[1:a]acompressor=ratio=3:threshold=-18dB[v]',
      '[2:a]atrim=0:28.6,volume=-22dB,afade=t=out:st=28.0:d=0.6[m1]',
      f'[3:a]atrim=0:{DUR - 28.2:.2f},volume=-22dB,afade=t=in:d=0.4,adelay=28200|28200[m2]']
lab = []
for k, (t, n, db) in enumerate(S):
    ins += ['-i', B + 'sfx/' + n]; d = int(t * 1000); i = k + 4
    fl.append(f'[{i}:a]volume={db}dB,adelay={d}|{d}[s{k}]'); lab.append(f'[s{k}]')
fl.append('[v][m1][m2]' + ''.join(lab) + f'amix=inputs={len(lab) + 3}:normalize=0,atrim=0:{DUR:.3f},loudnorm=I=-14:TP=-2.5,aresample=48000[a]')
fl.append("[0:v]scale=1080:1920:flags=lanczos,ass=work/captions.ass:fontsdir=../ricksclips-style/tools/fonts[vo]")
cmd = ['ffmpeg', '-v', 'error', '-y'] + ins + ['-filter_complex', ';'.join(fl), '-map', '[vo]', '-map', '[a]', '-t', f'{DUR:.3f}',
       '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', OUT]
sys.exit(subprocess.call(cmd))
