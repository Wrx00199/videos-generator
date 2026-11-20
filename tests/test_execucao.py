import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import sys
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'ferramentas'))
import clone
import espelho

class ExecucaoTests(unittest.TestCase):
    def test_nova_execucao_nao_recupera_saidas_antigas(self):
        with tempfile.TemporaryDirectory() as td:
            raiz=Path(td); src=raiz/'fonte.mp4'; src.write_bytes(b'video')
            a=clone.iniciar(src,'exemplo',raiz/'projetos')
            (a/'fala.json').write_text('resultado antigo')
            b=clone.iniciar(src,'exemplo',raiz/'projetos')
            self.assertNotEqual(a,b)
            self.assertFalse((b/'fala.json').exists())
            self.assertEqual((a/'fala.json').read_text(),'resultado antigo')

    def test_falha_transcricao_impede_medicao(self):
        with tempfile.TemporaryDirectory() as td:
            pasta=Path(td); chamadas=[]
            def rodar(nome,*args,**kwargs):
                chamadas.append(nome)
                return nome,.1,1 if nome=='ouvir' else 0,'falhou'
            tarefas=[('ouvir',['x'],pasta/'fala.json'),('medir',['x'],None)]
            with patch.object(espelho,'rodar',side_effect=rodar):
                with self.assertRaises(RuntimeError): espelho.executar(tarefas,pasta,{})
            self.assertEqual(chamadas,['ouvir'])

    def test_stdout_falho_nao_vira_arquivo_pronto(self):
        with tempfile.TemporaryDirectory() as td:
            pasta=Path(td); alvo=pasta/'fala.json'
            nome,seg,rc,err=espelho.rodar('ouvir',[sys.executable,'-c','print("parcial");raise SystemExit(2)'],pasta,{},alvo)
            self.assertEqual(rc,2)
            self.assertFalse(alvo.exists())

if __name__=='__main__': unittest.main()

class FalhasTests(unittest.TestCase):
    def test_resumo_nao_aceita_evidencias_ausentes(self):
        with tempfile.TemporaryDirectory() as td:
            with self.assertRaises(ValueError):espelho.resumo(Path(td),{})

    def test_timeline_lista_falha_legivel(self):
        with tempfile.TemporaryDirectory() as td:
            p=Path(td);(p/'execucao.json').write_text('{"id":"teste"}');(p/'timeline.json').write_text('[]')
            with self.assertRaises(ValueError):clone.carregar(p)

    def test_tentativa_falha_preservada_sem_reusar_saida(self):
        with tempfile.TemporaryDirectory() as td:
            p=Path(td);(p/'voz').mkdir();(p/'voz/narracao.mp3').write_bytes(b'parcial')
            clone.arquivar_falha(p,'voz')
            self.assertFalse((p/'voz/narracao.mp3').exists())
            self.assertTrue(list((p/'tentativas').glob('*/voz/narracao.mp3')))

class QARegressaoTests(unittest.TestCase):
    def test_qa_nao_confunde_audio_longo_com_video_completo(self):
        from types import SimpleNamespace
        with tempfile.TemporaryDirectory() as td:
            p=Path(td);(p/'final.mp4').write_bytes(b'video')
            info={'format':{'duration':'4'},'streams':[{'codec_type':'video','width':720,'height':1280,'duration':'1'},{'codec_type':'audio','duration':'4'}]}
            with patch.object(clone,'probe',return_value=info), patch.object(clone.subprocess,'run',return_value=SimpleNamespace(returncode=0,stderr='I: -14.0 LUFS\nPeak: -1.0 dBFS')):
                with self.assertRaises(ValueError):clone.verificar_final(p,{'duracao_s':4},720,1280)

    def test_qa_falho_nao_promove_final(self):
        with tempfile.TemporaryDirectory() as td:
            p=Path(td)
            def falhar(pasta):
                (pasta/'final.partial.mp4').write_bytes(b'falhou')
                raise ValueError('QA reprovado')
            with patch.object(clone,'_montar',side_effect=falhar):
                with self.assertRaises(ValueError):clone.montar(p)
            self.assertFalse((p/'final.mp4').exists())
            self.assertFalse((p/'final.partial.mp4').exists())
            self.assertTrue(list((p/'tentativas').glob('*/final.partial.mp4')))

class ConclusaoTests(unittest.TestCase):
    def test_conclusao_exige_revisao_independente_do_arquivo_atual(self):
        with tempfile.TemporaryDirectory() as td:
            p=Path(td);(p/'final.mp4').write_bytes(b'novo')
            clone.gravar(p/'execucao.json',{'id':'teste','inicio_unix':0,'etapas_s':{}})
            clone.gravar(p/'qa-tecnico.json',{'ok':True,'sha256':clone.hash_arq(p/'final.mp4')})
            parecer={'veredito':'APROVADO','revisor':'mesmo','produtor':'mesmo','sha256':clone.hash_arq(p/'final.mp4')}
            clone.gravar(p/'portao.json',parecer)
            with self.assertRaises(ValueError):clone.concluir(p)
            parecer.update(revisor='revisor_independente',sha256='antigo');clone.gravar(p/'portao.json',parecer)
            with self.assertRaises(ValueError):clone.concluir(p)
