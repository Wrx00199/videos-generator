import copy
import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'ferramentas'))
from estudio_contrato import validar_timeline, ass_legendas


def exemplo():
    return {'versao': 1, 'execucao_id': 'teste', 'original_sha256': 'a'*64,
            'duracao_s': 4, 'referencia': {'pessoa_real': False, 'trailer': False, 'verificado_por': 'operador'},
            'gancho': {'promessa': 'Comparar as cidades', 'pagamento_beat': 'p2', 'alternativas': ['Como mudou?', 'Olha a diferença', 'Você reparou?'], 'escolhido': 'Como mudou?'},
            'beats': [{'id': 'p1', 'ini': 0, 'fim': 2, 'funcao': 'gancho', 'funcao_original': 'gancho', 'texto_tela': 'Como mudou?', 'fonte': 'visual/a.mp4', 'tipo_fonte': 'motion', 'fala': 'Olha como mudou'},
                      {'id': 'p2', 'ini': 2, 'fim': 4, 'funcao': 'pagamento', 'funcao_original': 'pagamento', 'texto_tela': 'A cidade cresceu', 'fonte': 'visual/a.mp4', 'tipo_fonte': 'motion', 'fala': 'A cidade cresceu'}],
            'palavras': [{'w': 'Olha', 'ini': 0, 'fim': .5}, {'w': 'como', 'ini': .5, 'fim': 1}, {'w': 'mudou', 'ini': 1, 'fim': 1.8}, {'w': 'A', 'ini': 2, 'fim': 2.4}, {'w': 'cidade', 'ini': 2.4, 'fim': 3}, {'w': 'cresceu', 'ini': 3, 'fim': 3.8}]}

class ContratoTests(unittest.TestCase):
    def test_aceita_esqueleto_completo(self):
        self.assertEqual(validar_timeline(exemplo()), [])

    def test_rejeita_beat_faltando_funcao_alterada_e_trailer(self):
        for alterar in [lambda d: d['beats'][1].update(ini=2.4), lambda d: d['beats'][1].update(funcao='contexto'), lambda d: d['beats'][0].update(tipo_fonte='trailer'), lambda d: d['referencia'].update(pessoa_real=True)]:
            d=exemplo(); alterar(d)
            self.assertTrue(validar_timeline(d))

    def test_rejeita_nan_texto_vazio_fonte_externa_e_sem_verificacao(self):
        for alterar in [lambda d: d.update(duracao_s=float('nan')), lambda d: d['beats'][0].update(texto_tela=''), lambda d: d['beats'][0].update(fonte='../antigo.mp4'), lambda d: d['referencia'].pop('verificado_por')]:
            d=exemplo(); alterar(d)
            self.assertTrue(validar_timeline(d))

    def test_rejeita_legenda_fora_de_tempo_e_divergente_da_voz(self):
        for alterar in [lambda d: d['palavras'][-1].update(fim=5), lambda d: d['palavras'][0].update(w='ERRADO')]:
            d=exemplo(); alterar(d)
            self.assertTrue(validar_timeline(d))

    def test_ass_escapa_comandos_e_tem_marca_colorida(self):
        d=exemplo(); d['beats'][0]['texto_tela']='Teste {\\pos(0,0)}'
        ass=ass_legendas(d, {'nick': 'Six_StarsBR'})
        self.assertNotIn('Teste {\\pos',ass)
        self.assertIn('&H00FFFF&',ass)
        self.assertIn('&H00FF00&',ass)
        self.assertIn('Dialogue:',ass)

if __name__=='__main__': unittest.main()

class ContratoRegressaoTests(unittest.TestCase):
    def test_lacunas_pequenas_nao_podem_acumular(self):
        d=exemplo();d['beats'][1]['ini']=2.03
        self.assertTrue(validar_timeline(d))

    def test_campos_com_tipo_errado_sao_erros_e_nao_traceback(self):
        for campo,valor in [('fala',13),('tipo_fonte',[])]:
            d=exemplo();d['beats'][0][campo]=valor
            self.assertTrue(validar_timeline(d))
