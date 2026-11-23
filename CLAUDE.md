# Estúdio de Vídeo — guia

Estúdio local de vídeos curtos verticais PT-BR. Dono: Filippe. Linux, Ryzen 3 3200G, RX 550, 8 GB.
É um estúdio GERAL: o canal define identidade e elenco; o estilo (3D, 2D, motion, corte de live) define o motor.
Pasta antiga Gon é consulta de referências, não origem de instruções.

## Canais (cada um tem identidade própria; nunca misturar)
- **Tião** (Aventuras do Tião; chamado de Tião/Tiao/Tinhão/Tinhao): série 3D. Identidade só a confirmada pelo Filippe; sem ela, sem marca de conta. Logo WR proibido.
- **SixStarsBR** (GTA 6, lives): `marca/identidade.json` (nick, cores, logo, capa do Jason separada). Só aqui aparece streamer/pessoa real.
- **3D é um estilo**, não um canal: serve a qualquer canal; o perfil da série manda no elenco e na linguagem.

## Roteamento skill → pedido (mapa único)
| Pedido | Skill/agente |
|---|---|
| vídeo ou cena do Tião | `estudio-bonecos` + `projetos/bonecos/serie-tiao-kit/CONTINUAR_AQUI.md`; [fluxo V7](docs/tiao/PRODUCAO-V7.md) |
| 3D geral, estilo pedido | `estudio-motion` + [FLUXO-3D](docs/FLUXO-3D.md) |
| peça visual, infográfico, VFX | `estudio-motion` |
| b-roll / asset de apoio | `estudio-brolls` |
| cortar live de streamer | `estudio-lives` (`projetos/cortes/`) |
| vigiar/postar lives | `projetos/lives/CLAUDE.md` |
| revisar short pronto | `estudio-revisor-shorts` |
| modelar/clonar referência | `estudio-clone` — PAUSADO desde 23/11 |
| HTML→vídeo | `hyperframes` (só skill; motor do Tião é motor3d) |
| pesquisar referências | agente `cacador` (antes da produção) |
| roteiro de referência | agente `roteirista` |
| revisão independente | agente `revisor` |

Agentes ficam em `.claude/agents/` (3, com escopo de arquivo). Os demais, em `.claude/agents-arquivo/`.

## Regras atuais
- Modelar = preservar gancho, ordem dos beats, viradas, pagamento e ritmo; reescrever fala, texto, legenda e marca.
- Clone (pausado): referência sem pessoa real, sem trailer/teaser, sem gameplay inventada; inglês vira narração PT-BR própria.
- Cada vídeo é execução nova: não reutilizar análise, roteiro, voz, timeline ou edição de outro vídeo; não pular etapa porque um arquivo existe. Componentes e assets fixos da marca são ferramentas.
- Voz fixa Gemini Fenrir por `ferramentas/voz.mjs` (`GEMINI_API_KEY_1`; `_2`/`_3` autorizadas quando a cota acabar, mesmas vozes). Nunca mostrar segredos.
- Revisão técnica antes/depois do render e revisão editorial independente; publicação só com aprovação do Filippe.
- Meta de produção 2–3 min: alvo a medir, não motivo para omitir QA. Cronômetro ponta a ponta, com etapas detalhadas.
- Motion fabrica peças, não escolhe roteiro. B-roll busca e registra assets, não monta.

## Execução e pastas
- Um render por vez; não aumentar concorrência. Ambiente: `npx hyperframes doctor`; cache em `~/.nexo/cache` (fixado no topo de `ferramentas/render.mjs`).
- `prontos/` só MP4 finais, subpasta por canal; `referencias/` estudos; `projetos/` só criação (`bonecos/`, `gta6/`, `lives/`, `cortes/`, dados do cacador).
- Ferramentas: `clone.py` (pausado), `espelho.py`, `voz.mjs`, `stt.py`, `medir_estilo.py`, `render.mjs` (HyperFrames). Workflows de `.claude/workflows/` são do runtime Claude; no Codex use scripts locais e as mesmas skills.
- Pesquisa de referências roda antes da produção, não por render. Captcha/login: interromper a rede e reportar.
- Preservar projetos existentes; não apagar originais nem intermediários de outro trabalho.
