import os, subprocess, sys, tempfile, unittest
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

def ff(*a):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *a], check=True)

class TestMidia(unittest.TestCase):
    def test_duracao(self):
        import portao
        self.assertTrue(portao.checar_duracao(57.2).ok)
        self.assertFalse(portao.checar_duracao(127.8).ok)
        self.assertTrue(portao.checar_duracao(82).ok)   # reels BR de milhoes: 56-91 s
        self.assertFalse(portao.checar_duracao(49.9).ok)

    def test_ritmo(self):
        import portao
        r = portao.checar_ritmo(0, 10)
        self.assertFalse(r.ok)
        self.assertTrue(portao.checar_ritmo(168, 57.2).ok)
        self.assertFalse(portao.checar_ritmo(10, 0).ok)  # sem divisao por zero

    def test_planos(self):
        import portao
        r = portao.checar_planos([0, 2, 7.5, 9], 9)
        self.assertFalse(r.ok)
        self.assertIn('5.5', r.motivo)

    def test_audio(self):
        import portao
        with tempfile.TemporaryDirectory() as d:
            com = os.path.join(d, 'com.mp4'); sem = os.path.join(d, 'sem.mp4')
            ff('-f', 'lavfi', '-i', 'color=c=black:s=1080x1920:d=3', '-f', 'lavfi',
               '-i', 'sine=frequency=440:duration=3', '-shortest', com)
            ff('-f', 'lavfi', '-i', 'color=c=black:s=1080x1920:d=3', sem)
            self.assertTrue(portao.medir_audio(com)['tem_audio'])
            m = portao.medir_audio(sem)
            self.assertFalse(m['tem_audio'])
            self.assertFalse(portao.checar_audio(m).ok)
            self.assertTrue(portao.checar_formato(com).ok)

    def test_cli_sem_cenas(self):
        with tempfile.TemporaryDirectory() as d:
            r = subprocess.run([sys.executable, os.path.join(os.path.dirname(__file__), '..', 'portao.py'), d, 'final'],
                               capture_output=True, text=True)
            self.assertEqual(r.returncode, 2)
            self.assertIn('falta', r.stdout + r.stderr)

EP27 = os.path.join(os.path.dirname(__file__), '..', '..', '2026-11-17-tiao-trem-fantasma-27')

class TestHud(unittest.TestCase):
    def test_sobrepoe(self):
        import portao
        self.assertEqual(portao.hud_sobrepoe([(0, 3, .05, .15), (1, 2, .08, .18)]), [(0, 1)])
        self.assertEqual(portao.hud_sobrepoe([(0, 1, .05, .15), (2, 3, .05, .15)]), [])
        self.assertEqual(portao.hud_sobrepoe([(0, 3, .05, .15), (1, 2, .5, .6)]), [])

    def test_ep27_reprova(self):
        import portao
        r = portao.checar_hud(EP27)
        self.assertFalse(r.ok)

    def test_sem_contadores_ok(self):
        import portao
        with tempfile.TemporaryDirectory() as d:
            self.assertTrue(portao.checar_hud(d).ok)

    def test_um_contador_ok(self):
        import portao, json
        with tempfile.TemporaryDirectory() as d:
            json.dump([{"t0": 0, "t1": 5, "rotulo": "X", "valor": 1, "y": 215}], open(os.path.join(d, 'contadores.json'), 'w'))
            self.assertTrue(portao.checar_hud(d).ok)

class TestOlhos(unittest.TestCase):
    def test_look_reprova(self):
        import portao
        with tempfile.TemporaryDirectory() as d:
            os.makedirs(os.path.join(d, 'web'))
            open(os.path.join(d, 'web', 'story.js'), 'w').write("boneco(W,'tiao',{ eye: 'look', mouth:'o' })")
            r = portao.checar_olhos(d)
            self.assertFalse(r.ok); self.assertIn('look', r.motivo)
            open(os.path.join(d, 'web', 'story.js'), 'w').write("boneco(W,'tiao',{ eye: 'wide' })")
            self.assertTrue(portao.checar_olhos(d).ok)

    def test_ep27_sem_olho(self):
        import portao
        self.assertFalse(portao.checar_olhos(EP27).ok)

class TestTrava(unittest.TestCase):
    def mk(self, d, nome, final=True, aprov=False):
        p = os.path.join(d, 'projetos', 'bonecos', nome); os.makedirs(p)
        if final: open(os.path.join(p, 'final.mp4'), 'w').close()
        if aprov: open(os.path.join(p, 'APROVADO_FILIPPE'), 'w').close()

    def test_trava(self):
        import portao
        with tempfile.TemporaryDirectory() as d:
            self.mk(d, '2026-11-17-tiao-velho-27')           # antigo: nao trava
            self.assertTrue(portao.trava_lote(d, '2026-11-18').ok)
            self.mk(d, '2026-11-19-tiao-novo-31')
            self.assertFalse(portao.trava_lote(d, '2026-11-18').ok)
        with tempfile.TemporaryDirectory() as d:
            self.mk(d, '2026-11-19-tiao-novo-31', aprov=True)
            self.assertTrue(portao.trava_lote(d, '2026-11-18').ok)
        with tempfile.TemporaryDirectory() as d:
            self.mk(d, '2026-11-19-tiao-novo-31', final=False)  # em andamento sem final: nao trava
            self.assertTrue(portao.trava_lote(d, '2026-11-18').ok)

    def test_novo_cria_e_trava(self):
        import portao
        with tempfile.TemporaryDirectory() as d:
            self.mk(d, '2026-11-17-tiao-velho-30')
            p = portao.criar_projeto(d, 'teste', '2026-11-19', '2026-11-18')
            self.assertTrue(os.path.isdir(p)); self.assertTrue(p.endswith('2026-11-19-tiao-teste-31'))
            open(os.path.join(p, 'final.mp4'), 'w').close()
            with self.assertRaises(SystemExit):
                portao.criar_projeto(d, 'outro', '2026-11-19', '2026-11-18')


class TestRoteiroV4(unittest.TestCase):
    def base(self, **kw):
        d = {"formato": "e_se", "virada": 7, "personagens": ["tiao", "narrador"], "cenario": "dojo",
             "falas": [{"quem": "narrador", "texto": "E se o Tião ganhasse um bilhão amanhã?"}] +
                      [{"quem": "narrador", "texto": "Dia %d. Passou mais um." % (i + 1)} for i in range(8)] +
                      [{"quem": "narrador", "texto": "E você, o que faria?"}]}
        d.update(kw)
        return d

    def test_ok(self):
        import portao
        for r in portao.checar_roteiro_v4(self.base()):
            self.assertTrue(r.ok, r)

    def test_sem_formato_reprova(self):
        import portao
        d = self.base(); del d['formato']
        self.assertFalse(all(r.ok for r in portao.checar_roteiro_v4(d)))

    def test_e_se_precisa_abrir_com_e_se(self):
        import portao
        d = self.base(); d['falas'][0]['texto'] = 'O Tião estava na cozinha quando tudo mudou.'
        self.assertFalse(all(r.ok for r in portao.checar_roteiro_v4(d)))

    def test_virada_cedo_reprova(self):
        import portao
        self.assertFalse(all(r.ok for r in portao.checar_roteiro_v4(self.base(virada=2))))
        self.assertFalse(all(r.ok for r in portao.checar_roteiro_v4(self.base(virada=None))))

    def test_vozes_demais_e_sem_tiao(self):
        import portao
        d = self.base(); d['falas'][1]['quem'] = 'cap'; d['falas'][2]['quem'] = 'mar1'
        self.assertFalse(all(r.ok for r in portao.checar_roteiro_v4(d)))
        d = self.base(personagens=['cap'])
        self.assertFalse(all(r.ok for r in portao.checar_roteiro_v4(d)))

    def test_sem_escada_numerada_reprova(self):
        import portao
        d = self.base()
        for f in d['falas'][1:-1]:
            f['texto'] = 'Passou mais um pouco.'
        r = [x for x in portao.checar_roteiro_v4(d) if x.nome == 'escada_numerada'][0]
        self.assertFalse(r.ok)

    def test_fecho_sem_pergunta_reprova(self):
        import portao
        d = self.base(); d['falas'][-1]['texto'] = 'Fim da história.'
        self.assertFalse(all(r.ok for r in portao.checar_roteiro_v4(d)))
        d['falas'][-1]['texto'] = 'Comenta A ou B.'
        self.assertTrue(all(r.ok for r in portao.checar_roteiro_v4(d)))

    def test_formato_se_voce(self):
        import portao
        d = self.base(formato='se_voce'); d['falas'][0]['texto'] = 'Se você ganhar a presidência hoje, descobre a conta.'
        self.assertTrue(all(r.ok for r in portao.checar_roteiro_v4(d)))
        d['falas'][0]['texto'] = 'O Tião estava lá.'
        self.assertFalse(all(r.ok for r in portao.checar_roteiro_v4(d)))

    def test_gancho_longo(self):
        import portao
        d = self.base(); d['falas'][0]['texto'] = 'E se ' + 'blá ' * 20 + '?'
        self.assertFalse(all(r.ok for r in portao.checar_roteiro_v4(d)))


class TestVariedade(unittest.TestCase):
    def mk(self, cams, cens=('a', 'b', 'c')):
        return [{'ini': i * 2.0, 'fim': i * 2.0 + 2, 'camera': c, 'cenario': cens[i % len(cens)]} for i, c in enumerate(cams)]

    def test_cinco_alternando_ok(self):
        import portao
        c = ['abertura_push', 'close_reacao', 'detalhe_objeto', 'corte_transversal', 'travelling_lateral'] * 6
        self.assertTrue(portao.checar_variedade(self.mk(c)).ok)

    def test_repetida_reprova_com_indice(self):
        import portao
        c = ['abertura_push', 'abertura_push', 'close_reacao', 'detalhe_objeto', 'plongee', 'orbita'] * 5
        r = portao.checar_variedade(self.mk(c))
        self.assertFalse(r.ok); self.assertIn('plano 0', r.motivo)

    def test_quatro_distintas_reprova(self):
        import portao
        c = ['abertura_push', 'close_reacao', 'detalhe_objeto', 'plongee'] * 8
        self.assertFalse(portao.checar_variedade(self.mk(c)).ok)

    def test_poucos_cenarios_reprova(self):
        import portao
        c = ['abertura_push', 'close_reacao', 'detalhe_objeto', 'corte_transversal', 'travelling_lateral'] * 6
        self.assertFalse(portao.checar_variedade(self.mk(c, cens=('a',))).ok)

    def test_camera_desconhecida_e_vazio(self):
        import portao
        self.assertFalse(portao.checar_variedade([]).ok)
        c = ['abertura_push', 'inventada', 'close_reacao', 'detalhe_objeto', 'plongee', 'orbita'] * 5
        self.assertFalse(portao.checar_variedade(self.mk(c)).ok)


class TestRoteiroV5(unittest.TestCase):
    def base(self, **kw):
        d = {"molde": "v5", "formato": "cena", "virada": 7, "pista": 1, "pista_palavra": "reflexo",
             "personagens": ["tiao", "narrador"], "cenario": "dojo",
             "falas": [{"quem": "narrador", "texto": "O Tião não dorme há seis dias."},
                       {"quem": "narrador", "texto": "Dia 1. O reflexo sorri atrasado."}] +
                      [{"quem": "narrador", "texto": "Dia %d. Passou mais um." % (i + 2)} for i in range(5)] +
                      [{"quem": "narrador", "texto": "O reflexo copiava atrasado."},
                       {"quem": "narrador", "texto": "E você, aceitava?"}]}
        d.update(kw)
        return d

    def test_ok(self):
        import portao
        self.assertTrue(all(r.ok for r in portao.checar_roteiro_v4(self.base())))

    def test_gancho_sem_numero_reprova(self):
        import portao
        d = self.base(); d["falas"][0]["texto"] = "O que aconteceria se o Tião ficasse acordado?"; d["formato"] = "o_que_aconteceria"
        self.assertFalse(all(r.ok for r in portao.checar_roteiro_v4(d)))

    def test_pista_nao_paga_reprova(self):
        import portao
        d = self.base(); d["falas"][7]["texto"] = "Era so um sonho."
        self.assertFalse(all(r.ok for r in portao.checar_roteiro_v4(d)))

    def test_enchimento_reprova(self):
        import portao
        d = self.base(); d["falas"][3]["texto"] = "Dia 3. Tudo certo."
        self.assertFalse(all(r.ok for r in portao.checar_roteiro_v4(d)))

if __name__ == '__main__':
    unittest.main()
