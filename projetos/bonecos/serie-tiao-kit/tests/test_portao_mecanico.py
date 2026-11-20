"""Casos sinteticos contra docs/tiao/portao.py (o kit tem uma copia propria)."""
import copy, importlib.util, json, pathlib, tempfile, unittest

ARQUIVO = pathlib.Path(__file__).resolve().parents[4] / 'docs/tiao/portao.py'
spec = importlib.util.spec_from_file_location('portao_mecanico', ARQUIVO)
portao = importlib.util.module_from_spec(spec)
import sys
sys.modules[spec.name] = portao
spec.loader.exec_module(portao)


class TestPlanosMecanicos(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.proj = pathlib.Path(self.tmp.name)
        (self.proj / 'web').mkdir()
        self.planos = []
        self.beats = []
        self.ficha = ['Ambientes_ref: 3',
                      '| # | t | Beat | Cenário NOSSO (id do catálogo/novo) | Câmera REF → NOSSO | Ação do Tião | Fala PT-BR |',
                      '|---|---|---|---|---|---|---|']
        for i in range(5):
            self.planos.append(dict(beat=str(i), ini=i*2, fim=i*2+2, camera='close',
                                    cenario='c%d' % (i % 3), luz='l%d' % (i % 3),
                                    props_citados=['ovo'],
                                    verbos=[dict(palavra='quebra', ini=i*2+.2, fim=i*2+.8)]))
            self.beats.append(dict(beat=str(i), ini=i*2, fim=i*2+2, camera='close',
                                   cenario='c%d' % (i % 3), acao='quebra ovo', fala='Tião quebra ovo',
                                   oclusao=.249, props=[dict(id='ovo', bbox=[.1,.1,.6,.4])],
                                   acoes=[dict(verbo='quebra', ini=i*2+.8, fim=i*2+1)]))
            self.ficha.append('| %d | %d–%d | quebra | c%d | ref → close | quebra ovo | Tião quebra ovo |' %
                              (i, i*2, i*2+2, i % 3))

    def gravar(self):
        (self.proj / 'plano.json').write_text(json.dumps(self.planos))
        (self.proj / 'web/story.js').write_text('export const PORTAO_BEATS = ' + json.dumps(self.beats) + ';')
        (self.proj / 'FICHA.md').write_text('\n'.join(self.ficha))

    def resultado(self, nome):
        self.gravar()
        return next(r for r in portao.checar_planos_mecanicos(str(self.proj)) if r.nome == nome)

    def test_limites_inclusivos_e_beats_fora_de_ordem(self):
        self.beats.reverse()
        self.assertTrue(self.resultado('props').ok)
        self.assertTrue(all(r.ok for r in portao.checar_planos_mecanicos(str(self.proj))))
        self.assertTrue(portao.checar_ficha(str(self.proj)).ok)

    def test_oclusao_25_porcento_reprova(self):
        self.beats[2]['oclusao'] = .25
        r = self.resultado('oclusao')
        self.assertFalse(r.ok)
        self.assertIn('beat 2', r.motivo)
        self.assertFalse(portao.checar_ficha(str(self.proj)).ok)

    def test_prop_pequeno_cortado_margem_e_ausente(self):
        for caixa in ([.1,.1,.599,.4], [-.1,.1,.6,.4], [.079,.1,.6,.4], [.4,.1,.93,.5]):
            with self.subTest(caixa=caixa):
                self.beats[0]['props'][0]['bbox'] = caixa
                self.assertFalse(self.resultado('props').ok)
        self.beats[0]['props'] = []
        self.assertFalse(self.resultado('props').ok)

    def test_margem_exata(self):
        self.beats[0]['props'][0]['bbox'] = [.08,.08,.58,.38]
        self.assertTrue(self.resultado('props').ok)

    def test_verbo_tarde_ou_terminado_antes_da_palavra(self):
        for ini, fim in ((.801,1), (0,.19), (2,3)):
            self.beats[0]['acoes'][0].update(ini=ini, fim=fim)
            self.assertFalse(self.resultado('verbos').ok)
        self.beats[0]['acoes'][0].update(ini=.8, fim=1, verbo='olha')
        self.assertFalse(self.resultado('verbos').ok)

    def test_ficha_diverge_em_cada_campo(self):
        for campo in ('cenario', 'camera', 'acao', 'fala', 'ini', 'fim'):
            original = copy.deepcopy(self.beats)
            self.beats[1][campo] = 99 if campo in ('ini','fim') else 'outro'
            self.assertFalse(self.resultado('ficha_story').ok, campo)
            self.beats = original

    def test_beats_ausentes_extras_duplicados(self):
        original = copy.deepcopy(self.beats)
        for beats in (original[:-1], original + [dict(original[0], beat='extra')], original + [original[0]]):
            self.beats = beats
            self.assertFalse(self.resultado('ficha_story').ok)

    def test_dados_ausentes_invalidos_nao_passam(self):
        for valor in (None, '25%', float('nan'), -1, True):
            self.beats[0]['oclusao'] = valor
            self.assertFalse(self.resultado('oclusao').ok)
        self.gravar()
        (self.proj / 'web/story.js').write_text('export const PORTAO_BEATS = executar();')
        self.assertTrue(all(not r.ok for r in portao.checar_planos_mecanicos(str(self.proj))))
        (self.proj / 'plano.json').write_text('{}')
        self.assertTrue(all(not r.ok for r in portao.checar_planos_mecanicos(str(self.proj))))

    def test_entrada_malformada_reprova_sem_excecao(self):
        for campo, valor in (('fala', []), ('acoes', [None]), ('props', [None]), ('ini', True)):
            original = copy.deepcopy(self.beats)
            self.beats[0][campo] = valor
            self.gravar()
            self.assertFalse(all(r.ok for r in portao.checar_planos_mecanicos(str(self.proj))))
            self.beats = original
        for campo in ('cenario', 'luz'):
            original = self.planos[0][campo]
            self.planos[0][campo] = []
            self.gravar()
            self.assertFalse(portao.checar_ficha(str(self.proj)).ok)
            self.planos[0][campo] = original
        self.planos[0]['fim'] = 'invalido'
        self.gravar()
        self.assertFalse(portao.checar_ficha(str(self.proj)).ok)

    def test_lista_vazia_explicita_e_ausencia_de_evidencia(self):
        self.planos[0].update(props_citados=[], verbos=[])
        self.beats[0].update(props=[], acoes=[])
        self.assertTrue(self.resultado('props').ok)
        self.assertTrue(self.resultado('verbos').ok)
        del self.planos[0]['verbos']
        self.assertFalse(self.resultado('verbos').ok)

    def test_ficha_sem_coluna_tempo_invalido_e_celula_vazia(self):
        original = self.ficha[:]
        for antes, depois in (('Fala PT-BR', 'Texto'), ('0–2', 'ontem'), ('quebra ovo', '')):
            self.ficha = [l.replace(antes, depois) for l in original]
            self.assertFalse(self.resultado('ficha_story').ok)
        self.ficha = original

    def test_story_na_raiz_e_falta_de_arquivo(self):
        self.gravar()
        # Um projeto sem web/story.js tambem pode manter story.js na raiz.
        self.proj = self.proj / 'raiz'
        self.proj.mkdir()
        (self.proj / 'story.js').write_text('export const PORTAO_BEATS = ' + json.dumps(self.beats) + ';')
        (self.proj / 'plano.json').write_text(json.dumps(self.planos))
        (self.proj / 'FICHA.md').write_text('\n'.join(self.ficha))
        self.assertTrue(all(r.ok for r in portao.checar_planos_mecanicos(str(self.proj))))
        (self.proj / 'plano.json').write_text('null')
        self.assertTrue(all(not r.ok for r in portao.checar_planos_mecanicos(str(self.proj))))


if __name__ == '__main__':
    unittest.main()
