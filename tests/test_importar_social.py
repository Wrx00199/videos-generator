import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import sys

spec = importlib.util.spec_from_file_location('importar_social', Path(__file__).resolve().parents[1] / 'ferramentas/importar_social.py')
M = importlib.util.module_from_spec(spec)
spec.loader.exec_module(M)

class ImportacaoTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        (self.root/'nichos').mkdir(); (self.root/'projetos').mkdir()
        (self.root/'nichos'/'teste.json').write_text(json.dumps({'nome':'teste'}))
        self.csv = self.root/'projetos'/'referencias.csv'
        self.csv.write_text('id,titulo\nantigo,preservar\n')
        self.before = self.csv.read_bytes()
    def write(self, name, value):
        p = self.root/name; p.write_text(json.dumps(value)); return p
    def run_main(self, args):
        with patch.object(M.P,'RAIZ',self.root), patch.object(sys,'argv',['importar_social.py','teste',*map(str,args)]):
            M.main()
    def test_bloqueio_e_erro_nao_reimportam_linhas_antigas(self):
        for estado in ['bloqueado','erro']:
            p = self.write('falha.json',{'plataforma':'tiktok','status':estado,'linhas':[['stale','autor',0,30000,10,0,0,0,1700000000,20,'velho']]})
            self.run_main([p,'--top','0'])
            self.assertEqual(self.csv.read_bytes(),self.before)
    def test_manifesto_importa_so_execucao_atual_e_nao_regrava_csv_vazio(self):
        self.write('antigo.json',{'plataforma':'tiktok','linhas':[['stale','autor',0,30000,10,0,0,0,1700000000,20,'velho']]})
        self.write('atual.json',{'plataforma':'tiktok','execucao':'atual','status':'vazio','linhas':[]})
        p=self.write('manifesto.json',{'execucao':'atual','arquivos':[{'arquivo':'atual.json','status':'vazio'}]})
        self.run_main(['--manifesto',p,'--top','0'])
        self.assertEqual(self.csv.read_bytes(),self.before)
    def test_manifesto_rejeita_arquivo_de_outra_execucao(self):
        self.write('antigo.json',{'execucao':'antiga','plataforma':'tiktok','status':'ok','linhas':[]})
        p=self.write('manifesto.json',{'execucao':'atual','arquivos':[{'arquivo':'antigo.json','status':'ok'}]})
        with self.assertRaises(ValueError): self.run_main(['--manifesto',p])
        self.assertEqual(self.csv.read_bytes(),self.before)
    def test_manifesto_valido_ignora_vizinho_antigo(self):
        self.csv.unlink()
        row=['novo','autor',100,30000,100,2,0,0,1700000000,20,'teste']
        self.write('antigo.json',{'plataforma':'instagram','linhas':[['stale',*row[1:]]]})
        self.write('atual.json',{'execucao':'agora','plataforma':'instagram','status':'ok','linhas':[row]})
        p=self.write('manifesto.json',{'execucao':'agora','arquivos':[{'arquivo':'atual.json','status':'ok'}]})
        self.run_main(['--manifesto',p,'--top','0'])
        self.assertIn('novo',self.csv.read_text())
        self.assertNotIn('stale',self.csv.read_text())
    def test_legado_explicito_ainda_importa_sem_rede(self):
        self.csv.unlink()
        p=self.write('legado.json',json.dumps({'plataforma':'instagram','linhas':[['novo','autor',100,30000,100,2,0,0,1700000000,20,'teste']]}))
        self.run_main([p,'--top','0'])
        self.assertIn('novo',self.csv.read_text())

if __name__=='__main__': unittest.main()
