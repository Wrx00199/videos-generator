"""Smoke local sintético: não usa rede, TTS nem vídeo de terceiros."""
import json
import sys
import tempfile
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'ferramentas'))
import clone
from test_clonador import exemplo

class RenderTests(unittest.TestCase):
    def test_pipeline_sintetico_720_com_capa_e_qa(self):
        with tempfile.TemporaryDirectory() as td:
            base=Path(td)
            original=base/'fonte.mp4'
            clone.rodar([clone.FF,'-v','error','-f','lavfi','-i','testsrc2=size=360x640:rate=30:duration=4','-c:v','libx264','-threads','2','-pix_fmt','yuv420p',str(original)])
            pasta=clone.iniciar(original,'smoke',base/'projetos')
            clone.analisar(pasta)
            self.assertTrue((pasta/'quadros.jpg').exists())
            import shutil
            shutil.copy2(original,pasta/'visual/a.mp4')
            # Sinal de teste; palavras são fixture, não transcrição declarada como real.
            clone.rodar([clone.FF,'-v','error','-f','lavfi','-i','sine=frequency=440:duration=3.8','-c:a','libmp3lame',str(pasta/'voz/narracao.mp3')])
            meta=clone.ler(pasta/'execucao.json');d=exemplo();d['beats'][0]['layout']='janela';d['beats'][1]['layout']='tres_faixas';d['execucao_id']=meta['id'];d['original_sha256']=meta['original_sha256'];(pasta/'audio').mkdir();shutil.copy2(pasta/'voz/narracao.mp3',pasta/'audio/teste.mp3');d['musica']={'fonte':'audio/teste.mp3','volume_db':-20};d['sfx']=[{'fonte':'audio/teste.mp3','tempo':1,'volume_db':-10}];clone.gravar(pasta/'timeline.json',d)
            clone.montar(pasta)
            qa=clone.ler(pasta/'qa-tecnico.json')
            self.assertTrue(qa['ok'],qa)
            self.assertIn('PENDENTE',qa['revisao_editorial'])
            info=clone.probe(pasta/'final.mp4');v=next(s for s in info['streams'] if s['codec_type']=='video')
            self.assertEqual((v['width'],v['height']),(720,1280))
            self.assertTrue((pasta/'capa.png').is_file())
            # Disponível para inspeção visual na revisão deste desenvolvimento.
            destino=clone.RAIZ/'_tmp/qa-clonador'
            destino.mkdir(parents=True,exist_ok=True)
            clone.rodar([clone.FF,'-v','error','-i',str(pasta/'final.mp4'),'-vf','scale=360:640','-frames:v','1','-y',str(destino/'frame.png')])
            clone.rodar([clone.FF,'-v','error','-i',str(pasta/'capa.png'),'-vf','scale=360:640','-frames:v','1','-y',str(destino/'capa.png')])
            clone.gravar(destino/'resultado.json',qa)

if __name__=='__main__':unittest.main()
