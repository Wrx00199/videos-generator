import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

KIT = Path(__file__).resolve().parents[1]
sys.path.insert(0, os.fspath(KIT))


class TestContratoV6(unittest.TestCase):
    def roteiro(self):
        return {
            'molde': 'v6',
            'personagens': ['tiao'],
            'cenarios': ['cozinha'],
            'falas': [
                {'quem': 'narrador', 'tipo': 'narracao', 'texto': texto,
                 'visual': dict(ator='tiao', gesto='olhar', cenario='cozinha', prova=texto)}
                for texto in ('Olhou para o chapéu.', 'Viu a marca.', 'Recuou do chapéu.',
                              'Apontou para a marca.', 'Tirou o chapéu.', 'Reconheceu a marca.',
                              'Mostrou a marca para a câmera.')
            ],
            'beats': {'gancho': 0, 'promessa': 1, 'escada': [2, 3, 4],
                      'pista': 1, 'virada': 5, 'pagamento': 6},
        }

    def test_roteiro_aceita_estrutura_sem_cta_ou_dias_numerados(self):
        from portao import checar_roteiro_v6
        self.assertTrue(checar_roteiro_v6(self.roteiro()).ok)

    def test_reprova_gesto_inventado_boca_e_pista_tardia(self):
        from portao import checar_roteiro_v6
        roteiro = self.roteiro()
        roteiro['falas'][0]['visual']['gesto'] = 'falar'
        roteiro['falas'][1]['visual']['gesto'] = 'telepatia'
        roteiro['beats']['pista'] = 5
        resultado = checar_roteiro_v6(roteiro)
        self.assertFalse(resultado.ok)
        for erro in ('falar', 'telepatia', 'pista'):
            self.assertIn(erro, resultado.motivo)

    def test_voz_recusa_antes_da_api(self):
        with tempfile.TemporaryDirectory() as pasta:
            falas = Path(pasta) / 'falas.json'
            falas.write_text(json.dumps({'molde': 'v6', 'falas': []}))
            saida = Path(pasta) / 'fala.wav'
            result = subprocess.run(
                [sys.executable, str(KIT / 'voz_fala.py'), str(falas), '0', str(saida)],
                capture_output=True, text=True,
            )
            self.assertEqual(result.returncode, 1, result.stderr)
            self.assertIn('roteiro_v6', result.stderr)
            self.assertFalse(saida.exists())

    def test_repeticao_excedente_e_repeticao_intencional(self):
        from conferir_fala import repeticoes
        frase = 'O chapéu nunca leu pensamento.'
        repetida = f'{frase} {frase}'
        self.assertTrue(repeticoes(frase, repetida))
        self.assertFalse(repeticoes(repetida, repetida))
        self.assertFalse(repeticoes(frase, frase))
        self.assertTrue(repeticoes('Tião viu a marca', 'Tião viu a marca a marca'))

    def test_prova_aceita_uma_camera_e_reprova_divergencia_do_export(self):
        from portao import checar_prova_v6
        roteiro = self.roteiro()
        planos = [
            dict(ini=i, fim=i + 1, fala=i, cenario='cozinha', camera='close_reacao',
                 luz='casa_dia', motivo='mostrar a ação')
            for i in range(len(roteiro['falas']))
        ]
        with tempfile.TemporaryDirectory() as pasta:
            projeto = Path(pasta)
            (projeto / 'falas.json').write_text(json.dumps(roteiro))
            (projeto / 'voz').mkdir()
            dialogo = projeto / 'voz' / 'dialogo.wav'
            dialogo.touch()
            stt = projeto / 'voz' / 'stt.json'
            esperado = ' '.join(f['texto'] for f in roteiro['falas'])
            stt.write_text(json.dumps({'texto': esperado}))
            (projeto / 'plano.json').write_text(json.dumps(planos))
            cenas = [[p['ini'], p['fim']] for p in planos]
            self.assertTrue(all(r.ok for r in checar_prova_v6(projeto, roteiro, len(planos), cenas)))
            cenas[0][1] += .3
            (projeto / 'cenas.json').write_text(json.dumps(cenas))
            cli = subprocess.run([sys.executable, str(KIT / 'portao.py'), pasta, 'prova'],
                                 capture_output=True, text=True)
            self.assertEqual(cli.returncode, 1, cli.stderr)
            self.assertIn('cenas exportadas', cli.stdout)
            stt.write_text(json.dumps({'texto': esperado + ' ' + roteiro['falas'][-1]['texto']}))
            plano, voz = checar_prova_v6(projeto, roteiro, len(planos), cenas)
            self.assertIn('cenas exportadas', plano.motivo)
            self.assertIn('repetidos', voz.motivo)
            stt.write_text(json.dumps({'texto': ' '.join(esperado.split()[::-1])}))
            self.assertFalse(checar_prova_v6(projeto, roteiro, len(planos), cenas)[1].ok)
            dialogo.unlink()
            stt.write_text(json.dumps({'texto': esperado}))
            self.assertIn('dialogo.wav', checar_prova_v6(projeto, roteiro, len(planos), cenas)[1].motivo)

    def test_prova_ignora_projeto_legado_de_falas_em_lista(self):
        with tempfile.TemporaryDirectory() as pasta:
            (Path(pasta) / 'falas.json').write_text('[]')
            cli = subprocess.run([sys.executable, str(KIT / 'portao.py'), pasta, 'prova'],
                                 capture_output=True, text=True)
            self.assertEqual(cli.returncode, 0, cli.stderr)
