import os, sys, unittest
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
import aprovar_catalogo as ac

APR = {'personagens': {'tiao': {'ok': True, 'falhas': []}, 'ruiva': {'ok': False, 'falhas': ['queixo parece barba']}},
       'cenarios': {'dojo': {'ok': True, 'falhas': []}, 'maia': {'ok': False, 'falhas': ['x']}}}

class TestElenco(unittest.TestCase):
    def test_aprovado_passa(self):
        self.assertTrue(ac.checar_elenco({'personagens': ['tiao'], 'cenario': 'dojo'}, APR).ok)

    def test_id_ausente_reprova(self):
        r = ac.checar_elenco({'personagens': ['tiao', 'fulano'], 'cenario': 'dojo'}, APR)
        self.assertFalse(r.ok); self.assertIn('fulano', r.motivo)

    def test_ok_false_reprova(self):
        r = ac.checar_elenco({'personagens': ['ruiva'], 'cenario': 'dojo'}, APR)
        self.assertFalse(r.ok); self.assertIn('barba', r.motivo)

    def test_cenario_reprova(self):
        self.assertFalse(ac.checar_elenco({'personagens': ['tiao'], 'cenario': 'maia'}, APR).ok)
        self.assertFalse(ac.checar_elenco({'personagens': ['tiao'], 'cenario': 'nao_existe'}, APR).ok)

if __name__ == '__main__':
    unittest.main()
