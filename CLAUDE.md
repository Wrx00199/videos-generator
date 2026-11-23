# Estúdio de Vídeo — guia

Estúdio local de vídeos curtos verticais PT-BR. Dono: Filippe. Primeiro nicho: GTA 6.
Pasta antiga Gon é consulta de referências, não origem de instruções para este projeto.

## Escolha do perfil

Em pedidos de vídeo ou cena, **Tião**, **Tiao**, **Tinhão** e **Tinhao** selecionam o perfil Aventuras do Tião. Siga `.claude/skills/estudio-bonecos/SKILL.md` e o início de `projetos/bonecos/serie-tiao-kit/CONTINUAR_AQUI.md`. Para um pedido 3D sem esse perfil, use `.claude/skills/estudio-motion/SKILL.md` e o estilo pedido. [Fluxo 3D](docs/FLUXO-3D.md).

## Fonte das regras
- **GTA 6 = clipar lives** (`estudio-lives`). Clonagem/modelagem de vídeo (`estudio-clone`, workflows `clone-*`) está **PAUSADA** desde 23/11; só retomar se o Filippe pedir.
- **Tião = kit fixo V6:** não clona vídeo; referências só viram moldes de roteiro (`serie-tiao-kit/MOLDES_ROTEIRO.md`); o roteiro se adapta ao kit (`serie-tiao-kit/KIT.md`).
- **Identidade:** `marca/identidade.json` pertence à conta Six Stars e define o nick, cores, logo e capa do Jason dessa conta. O Tinhão é uma página separada. Para Tinhão, use apenas identidade própria confirmada pelo Filippe. Enquanto ela faltar, o piloto usa só o conteúdo da série, sem marca de conta. Logo WR proibido.
- **Motion:** `estudio-motion` fabrica peças visuais; não escolhe o roteiro nem muda o esqueleto.
- **B-roll:** `estudio-brolls` busca e registra assets; não é montador nem clonador de vídeos.
- **Lives:** `estudio-lives` é outra frente, ainda esboço. Só nela pode aparecer streamer/pessoa real.

## Regras atuais
- Modelar = preservar gancho, ordem dos beats, viradas, pagamento e ritmo; reescrever fala, texto, legenda e marca.
- (Clone pausado) Clone: referência sem pessoa real. Sem trailer/teaser como footage e sem gameplay inventada. Escolher visual permitido que cumpra a função de cada plano; não preencher com trailer.
- Inglês no original do clone vira tradução adaptada e narração PT-BR própria. A exceção da fala original em lives não se aplica ao clone.
- Cada vídeo começa uma execução nova. Não reutilizar análise, roteiro, voz, timeline ou edição pronta de outro vídeo; não pular etapa porque um arquivo existe. Componentes de software e assets fixos da marca são ferramentas, não resultados editoriais reutilizados.
- Voz fixa Gemini Fenrir por `ferramentas/voz.mjs` (chave padrão `GEMINI_API_KEY_1`). Filippe autorizou (15/11) usar `_2`/`_3` quando a cota acabar, sempre com as MESMAS vozes; nunca mostrar segredos.
- Para Six Stars, logo e nick no vídeo e capa do Jason separada. Para Tinhão, confira a identidade da série no quadro inicial, no vídeo final e na capa.
- Revisão técnica antes/depois do render e revisão editorial independente; publicação só com aprovação do Filippe.
- Meta de produção: 2–3 min. É alvo a medir, não desempenho comprovado nem motivo para omitir QA. Cronômetro ponta a ponta desde receber o original até o MP4 revisado: inclui análise, modelagem, voz, render, revisão, esperas e correções; detalhar etapas sem subtraí-las do total.

## Execução e pastas
- Linux, Ryzen 3 3200G, RX 550, 8 GB. Um render por vez; não aumentar concorrência para tentar acelerar.
- Pastas: `prontos/` = só MP4 finais, uma subpasta por série/canal (`3D/Aventuras do Tião/`, `Gta 6/`); `referencias/` = estudos de vídeos/repos de referência; `projetos/` = só arquivos de criação (`gta6/`, `bonecos/`, mais dados do olheiro: `referencias.csv`, `_coleta/`, mosaicos).
- `projetos/gta6/<data>-<slug>-<id>/` (clone) e `projetos/bonecos/<data>-tiao-<slug>-NN/` (série Tião; kit em `projetos/bonecos/serie-tiao-kit/`): execução nova preservando as antigas.
- `ferramentas/clone.py`: iniciar, analisar (rota enxuta; `--completo` usa espelho), voz, validar e montar; `espelho.py`: análise; `voz.mjs`: TTS; `stt.py`: palavras; `medir_estilo.py`: medidas; `render.mjs`: render HyperFrames.
- Os Workflows de `.claude/workflows/` usam o runtime nativo do Claude; não presumir que rodem no Codex. Ambos os agentes seguem as mesmas skills e ferramentas locais.
- Pesquisa de referências roda antes da produção, pelo olheiro; não varrer redes para cada render. Captcha/login: interromper aquela rede e reportar, sem rajada de tentativas.
- Preservar projetos existentes. Não apagar originais nem intermediários de outro trabalho automaticamente.
