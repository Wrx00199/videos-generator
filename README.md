# Nexus Studio

Local multi-engine vertical video production studio (`1080×1920`, PT-BR), engineered to run smoothly on modest Linux hardware (AMD RX 550 / Mesa Vulkan, 8 GB RAM, no CUDA required).

---

## Architecture

Nexus Studio combines three specialized rendering engines behind a unified local control panel (`http://127.0.0.1:7777`):

| Engine | Location | Output Style | Render Method |
| --- | --- | --- | --- |
| **Tião 3D (`motor3d`)** | `projetos/bonecos/serie-tiao-kit/motor3d/` | 2D toon characters inside stylized 3D worlds (`@RicksClips3000`-inspired, universal adult tone) | Raw Three.js r160 + Playwright + Vulkan (`~0.15s/frame`) |
| **HyperFrames Styles** | `estilos/` | 6 motion-graphic templates (`terminal`, `colagem`, `keynote`, `sticker`, `pixel`, `backrooms`) | HTML/CSS/JS deterministic frame capture |
| **Stickman Mode B** | `ferramentas/nexo-engines/stickman-video-director/` | 2D stickman / illustrated shorts with 887 licensed audio assets & 412 2D props | Local Node/Chromium pipeline |

### Armored `motor3d` Pipeline (Tião 3D)
To eliminate primitive geometry, background clutter, and lighting/animation glitches:
- **CC0 3D Asset Loader (`motor3d/assets3d.js`)**: Loads official Kenney CC0 `.glb` models (`motor3d/assets3d/`) with automatic `twoTone()` toon shading, `#030303` ink outlines, ground alignment, and shadow flags.
- **Clean Stage & Physics (`motor3d/palco_limpo.js`)**: Neutral story-specific stage (`criarPalcoLimpo`), real sun-aligned light beams (`feixeDoSol`), and physical deformation helpers (`animarDerretimento`, `animarQueda`).
- **Pre-Render Visual Gate (`motor3d/revisor_visual.py`)**: Captures 3 frames per scene (`15%`, `50%`, `85%`), detects black/frozen frames, and builds a 3× contact sheet for visual approval **before** running a full 1080p render.
- **Audio & Loudness Standard**: Gemini TTS (`ferramentas/voz.mjs`) or local Kokoro ONNX PT-BR + synced `.ass` captions (`legenda.py`) + licensed BGM/SFX mixed to `-14.1 LUFS` (`LRA 1.6–3.2 LU`), verified with `earshot measure`.

---

## Quick Start

### 1. Prerequisites
- Linux with Node.js 20+, Python 3.11+, `ffmpeg`, `ffprobe`, and Chromium/Playwright.
- Create a local `.env` file in the repository root (never committed to git):
  ```env
  GEMINI_API_KEY_1=your_key_here
  GEMINI_API_KEY_2=optional_backup_key
  ```

### 2. Start the Local Studio Panel
```bash
PORTA_PAINEL=7777 node ferramentas/painel/servidor.mjs
```
Open `http://127.0.0.1:7777/` in your browser. To verify all panel routes and API endpoints:
```bash
node testes-painel/smoke.mjs
```

### 3. Produce a New Tião 3D Episode
1. **Scaffold a new episode workspace:**
   ```bash
   bash projetos/bonecos/serie-tiao-kit/novo_ep.sh projetos/bonecos/YYYY-MM-DD-slug
   ```
2. **Author the story & generate voiceover:**
   - Generate narration/dialogue with `node ferramentas/voz.mjs` (or Kokoro offline).
   - Build `web/story.js` using `criarPalcoLimpo()`, `propGLB()` (Kenney CC0 `.glb` assets), and `twoTone()` shaders.
   - Keep character mouths closed during 3rd-person narration; open only on quoted dialogue or strong silent reactions.
3. **Run the mandatory pre-render visual gate:**
   ```bash
   python3 projetos/bonecos/serie-tiao-kit/motor3d/revisor_visual.py projetos/bonecos/YYYY-MM-DD-slug
   ```
   Inspect `stills_revisao/folha_revisao_3x.jpg` and fix any framing, prop, or lighting issue before rendering.
4. **Render 1080×1920 @ 24 fps (1 render at a time on 8 GB RAM):**
   ```bash
   TIAO_GPU=vulkan node projetos/bonecos/YYYY-MM-DD-slug/web/render.mjs
   ```
5. **Caption, mix & verify:**
   - Generate `.ass` captions (`<= 3 words/block`) with `projetos/bonecos/serie-tiao-kit/legenda.py`.
   - Encode final MP4 with `ffmpeg`, then validate video streams (`ffprobe`) and loudness (`earshot measure` targeting `-14.1 LUFS`).

---

## Repository Layout

```text
.
├── projetos/bonecos/serie-tiao-kit/   # Armored Tião 3D engine (motor3d, rig, shade, assets3d, tests)
├── estilos/                           # 6 validated HyperFrames vertical styles
├── ferramentas/                       # Core CLI tools (nexo.py, voz.mjs, stt.py, painel/servidor.mjs)
├── marca/                             # Channel identity profiles
├── nichos/                            # Niche configurations
├── config/                            # Runtime & pipeline configs
├── docs/                              # Architecture & 3D workflow documentation
├── tests/ & testes-painel/            # Automated Python & Node test suites
├── CLAUDE.md & AGENTS.md              # Project rules & operational guidelines
└── .claude/skills/                    # Modular studio skills
```

> **Note:** Heavy media (`*.mp4`, `*.wav`, `*.mp3`, `*.glb`, `*.png`), local episodes in `projetos/`, final exports in `prontos/`, and `.env` secrets are intentionally excluded from Git via `.gitignore`.

---

## Branch Workflow

This repository uses a clean two-branch model:
- **`main`**: Stable, tested studio code and documentation.
- **`dev`**: Active development branch; merged into `main` once validated.

### Running Tests
```bash
node --test projetos/bonecos/serie-tiao-kit/tests/*.mjs
node testes-painel/smoke.mjs
```
