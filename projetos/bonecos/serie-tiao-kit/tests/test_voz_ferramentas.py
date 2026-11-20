import os, subprocess, sys, tempfile, unittest, json
KIT = os.path.join(os.path.dirname(__file__), '..')
sys.path.insert(0, KIT)

def ff(*a):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *a], check=True)

def dur(p):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True)
    return float(r.stdout)

class TestAparar(unittest.TestCase):
    def teste_meio_preservado(self):
        pass

    def test_meio_preservado(self):
        with tempfile.TemporaryDirectory() as d:
            sil = lambda: ['-f', 'lavfi', '-t', '1', '-i', 'anullsrc=r=24000:cl=mono']
            tom = lambda: ['-f', 'lavfi', '-t', '1', '-i', 'sine=frequency=440:sample_rate=24000']
            ent, sai = os.path.join(d, 'in.wav'), os.path.join(d, 'out.wav')
            ff(*sil(), *tom(), *sil(), *tom(), *sil(),
               '-filter_complex', '[0][1][2][3][4]concat=n=5:v=0:a=1', '-ac', '1', ent)
            self.assertAlmostEqual(dur(ent), 5.0, delta=0.05)
            r = subprocess.run([sys.executable, os.path.join(KIT, 'aparar_pontas.py'), ent, sai], capture_output=True, text=True)
            self.assertEqual(r.returncode, 0, r.stderr)
            self.assertAlmostEqual(dur(sai), 3.1, delta=0.15)

    def test_entrada_inexistente(self):
        r = subprocess.run([sys.executable, os.path.join(KIT, 'aparar_pontas.py'), '/nao/existe.wav', '/tmp/x.wav'], capture_output=True, text=True)
        self.assertEqual(r.returncode, 2)

    def test_tudo_silencio_erro(self):
        with tempfile.TemporaryDirectory() as d:
            ent = os.path.join(d, 'in.wav')
            ff('-f', 'lavfi', '-t', '2', '-i', 'anullsrc=r=24000:cl=mono', ent)
            r = subprocess.run([sys.executable, os.path.join(KIT, 'aparar_pontas.py'), ent, os.path.join(d, 'o.wav')], capture_output=True, text=True)
            self.assertEqual(r.returncode, 1)

class TestConferir(unittest.TestCase):
    def test_cobertura(self):
        import conferir_fala as c
        self.assertAlmostEqual(c.cobertura('o tião foi à lua', 'tião foi lua'), 0.6)
        self.assertEqual(c.cobertura('o tião foi à lua', 'o tião foi à lua'), 1.0)
        self.assertEqual(c.cobertura('', 'x'), 0.0)
        self.assertEqual(c.cobertura('Olá, Tião!', 'ola tiao'), 1.0)  # ignora acento e pontuacao

    def test_sobras_tom_lido_em_voz_alta(self):
        import conferir_fala as c
        # 18/11 ep.31: TTS leu o tom ('Sombrio.', 'esterioso') antes da fala
        self.assertEqual(c.sobras('Dia 6. O sujeito diz que vai sair.', 'Sombrio dia 6. O sujeito diz que vai sair.'), ['sombrio'])
        self.assertEqual(c.sobras('Dia 5 aparece um sujeito', 'esterioso dia 5 aparece um sujeito'), ['esterioso'])
        self.assertEqual(c.sobras('Dia 6 o sujeito', 'e dia 6 o sujeito'), [])   # palavra curta de ruido do STT nao reprova
        self.assertEqual(c.sobras('o tião foi à lua', 'o tião foi à lua'), [])

if __name__ == '__main__':
    unittest.main()
