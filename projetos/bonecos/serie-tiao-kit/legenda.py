#!/usr/bin/env python3
"""
legenda.py — gerador de legendas dinâmicas palavra a palavra estilo Shorts/TikTok.
Lê palavras.json e gera arquivo .ass estilizado pronto para queimar com ffmpeg.

Uso:
  python3 legenda.py <palavras.json> <saida.ass> [--cor-destaque FFFF00] [--font-size 64]
"""

import json
import sys
import argparse

def format_ass_time(seconds):
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = seconds % 60
    return f"{h:d}:{m:02d}:{s:05.2f}"

def gerar_ass(palavras, saida_ass, font_name="DejaVu Sans", font_size=64, cor_destaque="&H0020F0FF"):
    header = f"""[Script Info]
Title: Legenda Tião Shorts
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: None
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{font_name},{font_size},&H00FFFFFF,{cor_destaque},&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,6,2,2,40,40,360,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    events = []
    
    # Agrupar palavras em blocos curtos (3 a 5 palavras por tela para leitura limpa)
    # Mostrando a palavra atual destacada em amarelo/cor de destaque
    BLOCO_MAX = 4
    i = 0
    while i < len(palavras):
        bloco = palavras[i : i + BLOCO_MAX]
        # Duração total do bloco
        b_ini = bloco[0]["ini"]
        b_fim = bloco[-1]["fim"]
        
        # Para cada palavra dentro do bloco, gera um evento com a palavra em destaque
        for k, p in enumerate(bloco):
            p_ini = p["ini"]
            # Fim é o início da próxima ou o fim do bloco
            p_fim = bloco[k + 1]["ini"] if k + 1 < len(bloco) else p["fim"]
            if p_fim <= p_ini:
                p_fim = p_ini + 0.2
            
            # Montar texto do bloco com a palavra k destacada
            partes = []
            for j, item in enumerate(bloco):
                w_clean = item["w"].strip()
                if j == k:
                    # Palavra ativa: cor de destaque + caixa alta
                    partes.append(f"{{\\c{cor_destaque}\\b1\\fscx110\\fscy110}}{w_clean.upper()}{{\\r}}")
                else:
                    # Palavra inativa: branco
                    partes.append(f"{{\\c&H00FFFFFF&}}{w_clean}")
            
            texto_formatado = " ".join(partes)
            t_start = format_ass_time(p_ini)
            t_end = format_ass_time(p_fim)
            events.append(f"Dialogue: 0,{t_start},{t_end},Default,,0,0,0,,{texto_formatado}")
        
        i += BLOCO_MAX

    with open(saida_ass, "w", encoding="utf-8") as f:
        f.write(header + "\n".join(events) + "\n")
    print(f"Legenda ASS gerada: {len(events)} eventos -> {saida_ass}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Gerador de Legendas ASS para Shorts")
    parser.add_argument("palavras_json", help="Caminho do palavras.json")
    parser.add_argument("saida_ass", help="Caminho de saída .ass")
    parser.add_argument("--font", default="DejaVu Sans", help="Nome da fonte")
    parser.add_argument("--size", type=int, default=68, help="Tamanho da fonte")
    args = parser.parse_args()

    with open(args.palavras_json, encoding="utf-8") as f:
        pw = json.load(f)
        if isinstance(pw, dict) and "palavras" in pw:
            pw = pw["palavras"]
    gerar_ass(pw, args.saida_ass, font_name=args.font, font_size=args.size)
