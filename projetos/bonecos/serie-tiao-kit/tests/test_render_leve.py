import os, subprocess, tempfile, unittest
SH = os.path.join(os.path.dirname(__file__), '..', 'render_leve.sh')

def run(*a):
    return subprocess.run(['bash', SH, *a], capture_output=True, text=True)

class TestRenderLeve(unittest.TestCase):
    def test_sem_web_erro(self):
        with tempfile.TemporaryDirectory() as d:
            r = run(d); self.assertEqual(r.returncode, 2); self.assertIn('web', r.stdout)

    def test_dry_usa_nice_ionice_e_total(self):
        with tempfile.TemporaryDirectory() as d:
            os.makedirs(os.path.join(d, 'web'))
            open(os.path.join(d, 'web', 'story.js'), 'w').write('export const FPS = 30, TOTAL = 1800;')
            r = run(d, '--dry'); self.assertEqual(r.returncode, 0)
            for k in ('nice -n 19', 'ionice -c3', '0-1799', ' 2 '):
                self.assertIn(k, r.stdout)

    def test_sem_total_pede_intervalo(self):
        with tempfile.TemporaryDirectory() as d:
            os.makedirs(os.path.join(d, 'web')); open(os.path.join(d, 'web', 'story.js'), 'w').write('x')
            r = run(d, '--dry'); self.assertEqual(r.returncode, 2); self.assertIn('intervalo', r.stdout)

if __name__ == '__main__':
    unittest.main()
