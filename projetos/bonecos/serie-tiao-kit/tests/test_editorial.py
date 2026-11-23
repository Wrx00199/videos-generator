import json
import tempfile
import unittest
from pathlib import Path

from editorial import fontes, registrar, revisao, selar_final, sha, versao
from previa import selecionar_quadros


class TestParecerV7(unittest.TestCase):
    def test_reprovacao_reapresentacao_e_edicao(self):
        with tempfile.TemporaryDirectory() as pasta:
            projeto = Path(pasta)
            (projeto / 'web').mkdir()
            (projeto / 'web/story.js').write_text('original')
            for nome in ('falas.json', 'plano.json', 'previa.mp4'):
                (projeto / nome).write_text('v1')
            def selar():
                (projeto / 'previa-origem.json').write_text(json.dumps({
                    'fontes': fontes(projeto), 'video': sha(projeto / 'previa.mp4'),
                }))

            selar()
            parecer = dict(revisor='revisor independente', autor='produtor',
                           abertura='descreve a ação', causa='descreve o mecanismo',
                           consequencia='descreve o resultado', pagamento='descreve a reação',
                           graca='reação funcionou', evidencia='00:03 e 00:05')
            primeiro = versao(projeto, 'frio')
            self.assertFalse(revisao(projeto, 'frio').ok)
            registrar(projeto, 'frio', primeiro, {**parecer, 'decisao': 'reprovado'})
            self.assertEqual((projeto / 'pareceres' / f'midia-{primeiro}.mp4').read_text(), 'v1')
            self.assertIn('reprovado', revisao(projeto, 'frio').motivo)
            (projeto / 'previa.mp4').write_text('v2')
            with self.assertRaises(ValueError):
                registrar(projeto, 'frio', primeiro, {**parecer, 'decisao': 'aprovado'})
            selar()
            segundo = versao(projeto, 'frio')
            with self.assertRaises(ValueError):
                registrar(projeto, 'frio', segundo,
                          {**parecer, 'decisao': 'aprovado', 'revisor': ' PRODUTOR '})
            registrar(projeto, 'frio', segundo, {**parecer, 'decisao': 'aprovado'})
            self.assertTrue(revisao(projeto, 'frio').ok)
            self.assertFalse(revisao(projeto, 'montagem').ok)
            temporario = projeto / 'final.tmp.mp4'
            temporario.write_text('montagem final')
            with self.assertRaises(ValueError):
                selar_final(projeto, temporario, primeiro)
            selar_final(projeto, temporario, segundo)
            self.assertTrue(versao(projeto, 'final'))
            (projeto / 'final.mp4').write_text('MP4 anterior')
            with self.assertRaises(ValueError):
                versao(projeto, 'final')
            (projeto / 'web/story.js').write_text('outra encenação')
            self.assertFalse(revisao(projeto, 'frio').ok)
            self.assertEqual(len(list((projeto / 'pareceres').glob('*.json'))), 2)

    def test_previa_pode_mostrar_trechos_distantes_sem_perder_ordem(self):
        self.assertEqual(selecionar_quadros(1800, [(0, 45), (1500, 1560)]), ('0-44,1500-1559', 35))
        with self.assertRaises(ValueError):
            selecionar_quadros(1800, [(0, 90), (45, 120)])
        with self.assertRaises(ValueError):
            selecionar_quadros(1800, None)
