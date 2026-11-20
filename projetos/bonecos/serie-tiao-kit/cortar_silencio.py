#!/usr/bin/env python3
"""
cortar_silencio.py — remove pausas longas do dialogo.wav antes de montar planos.
Uso: python3 cortar_silencio.py <pasta_ep> [--max-pausa 0.3] [--suspense-tags suspense]

Entrada:
  <pasta_ep>/voz/dialogo.wav
  <pasta_ep>/palavras.json   (array de {w, ini, fim} OU objeto com chave "palavras")
  <pasta_ep>/falas.json      (array de {quem, texto, tom, pausa} OU objeto com chave "falas")

Saída:
  <pasta_ep>/voz/dialogo_cortado.wav  (WAV igual ao dialogo.wav mas com pausas > max_pausa removidas)
  <pasta_ep>/voz/ajuste_tempo.json    (array de {t_original, t_novo, delta} — mapeamento de tempos)

Algoritmo:
1. Ler palavras.json; calcular pausas entre palavras (fim[i] → ini[i+1])
2. Pausas > max_pausa (padrão 0.3 s) são candidatas ao corte
3. EXCETO: pausas marcadas como suspense em falas.json (campo `pausa` > 0 nessa fala)
   — essas pausas ficam com max_pausa de 0.6 s em vez de 0.3
4. Para cada pausa a cortar: cortar o WAV nesse trecho (scipy ou ffmpeg)
5. Recalcular todos os tempos de palavras.json e falas_tempos.json com o ajuste
6. Salvar dialogo_cortado.wav + ajuste_tempo.json
7. Imprimir: palavras/s antes, palavras/s depois, pausas removidas (n e duração total)

Dependências: scipy + numpy (preferenciais) ou ffmpeg via subprocess.
IMPORTANTE: NÃO sobrescrever dialogo.wav original. Sempre criar dialogo_cortado.wav.
"""

import argparse
import json
import os
import sys
import subprocess
import tempfile

# ─── Detectar backend disponível ─────────────────────────────────────────────
try:
    import numpy as np
    import scipy.io.wavfile as wavfile
    BACKEND = "scipy"
except ImportError:
    BACKEND = "ffmpeg"

def check_ffmpeg():
    r = subprocess.run(["which", "ffmpeg"], capture_output=True)
    return r.returncode == 0

if BACKEND == "ffmpeg" and not check_ffmpeg():
    print("ERRO: nem scipy/numpy nem ffmpeg disponíveis.", file=sys.stderr)
    sys.exit(1)


# ─── Leitura de arquivos ──────────────────────────────────────────────────────
def load_palavras(pasta):
    path = os.path.join(pasta, "palavras.json")
    with open(path, encoding="utf-8") as f:
        raw = json.load(f)
    # Pode ser lista direta ou objeto com chave "palavras"
    if isinstance(raw, list):
        return raw
    if isinstance(raw, dict):
        if "palavras" in raw:
            return raw["palavras"]
        # Formato alternativo: objeto com chave "segmentos" e "palavras" aninhadas
        raise ValueError(f"palavras.json inesperado: chaves = {list(raw.keys())}")
    raise ValueError("palavras.json: formato não reconhecido")


def load_falas(pasta):
    path = os.path.join(pasta, "falas.json")
    with open(path, encoding="utf-8") as f:
        raw = json.load(f)
    if isinstance(raw, list):
        return raw
    if isinstance(raw, dict) and "falas" in raw:
        return raw["falas"]
    raise ValueError(f"falas.json inesperado: chaves = {list(raw.keys()) if isinstance(raw, dict) else type(raw)}")


def load_falas_tempos(pasta):
    path = os.path.join(pasta, "voz", "falas_tempos.json")
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as f:
        return json.load(f)


# ─── Backend WAV: scipy ───────────────────────────────────────────────────────
def wav_read_scipy(path):
    rate, data = wavfile.read(path)
    return rate, data


def wav_write_scipy(path, rate, data):
    wavfile.write(path, rate, data)


def wav_duration_scipy(rate, data):
    return data.shape[0] / rate


def cortar_wav_scipy(rate, data, cortes):
    """
    cortes: lista de (ini_s, fim_s) a REMOVER do áudio.
    Retorna novo array numpy com esses trechos excluídos.
    """
    if not cortes:
        return data
    keep = []
    prev = 0
    for (ini_s, fim_s) in sorted(cortes):
        ini_f = int(ini_s * rate)
        fim_f = int(fim_s * rate)
        ini_f = max(0, min(ini_f, data.shape[0]))
        fim_f = max(0, min(fim_f, data.shape[0]))
        if ini_f > prev:
            keep.append(data[prev:ini_f])
        prev = fim_f
    if prev < data.shape[0]:
        keep.append(data[prev:])
    if keep:
        return np.concatenate(keep, axis=0)
    return data[:0]


# ─── Backend WAV: ffmpeg ──────────────────────────────────────────────────────
def wav_duration_ffmpeg(path):
    r = subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_entries", "format=duration",
         "-of", "csv=p=0", path],
        capture_output=True, text=True
    )
    return float(r.stdout.strip())


def cortar_wav_ffmpeg(src, dst, cortes, duracao_total):
    """
    Usa ffmpeg filtergraph atrimado para remover os trechos em `cortes`.
    cortes: lista de (ini_s, fim_s) a REMOVER.
    """
    if not cortes:
        import shutil
        shutil.copy2(src, dst)
        return

    # Montar lista de segmentos a MANTER
    keep = []
    prev = 0.0
    for (ini_s, fim_s) in sorted(cortes):
        if ini_s > prev:
            keep.append((prev, ini_s))
        prev = fim_s
    if prev < duracao_total:
        keep.append((prev, duracao_total))

    if not keep:
        # Nada a manter
        keep = [(0.0, 0.001)]

    # Construir filtergraph: atrim + asetpts para cada segmento, depois concat
    parts = []
    for idx, (s, e) in enumerate(keep):
        parts.append(f"[0:a]atrim=start={s:.6f}:end={e:.6f},asetpts=PTS-STARTPTS[seg{idx}]")

    concat_inputs = "".join(f"[seg{i}]" for i in range(len(keep)))
    concat_filter = f"{concat_inputs}concat=n={len(keep)}:v=0:a=1[outa]"

    full_filter = ";".join(parts) + ";" + concat_filter

    cmd = [
        "ffmpeg", "-y", "-i", src,
        "-filter_complex", full_filter,
        "-map", "[outa]",
        "-ar", "44100", "-c:a", "pcm_s16le",
        dst
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("ERRO ffmpeg:", r.stderr[-2000:], file=sys.stderr)
        sys.exit(1)


# ─── Lógica principal ─────────────────────────────────────────────────────────
def identificar_pausas_suspense(falas, palavras, max_pausa_normal, max_pausa_suspense):
    """
    Associa cada pausa inter-palavra ao campo `pausa` da fala correspondente.
    Retorna lista de (ini, fim, cortar_ate) onde cortar_ate é o max_pausa aplicável.
    """
    # Montar mapa: para cada fala (com base no texto), quais palavras pertencem a ela?
    # Usamos o índice de início/fim da fala nos tempos das palavras.
    # Como o falas.json não tem timestamps diretamente, usamos a ordem sequencial.
    # Estratégia: para cada pausa entre palavra[i] e palavra[i+1], verificar em qual
    # fala cada palavra está, e se a fala tem pausa > 0.

    # Primeiro: extrair intervalos de cada fala a partir dos tempos das palavras
    # Cada palavra pertence à fala cujo trecho [ini_fala, fim_fala] contém a palavra.
    # Como não temos falas_tempos em palavras.json, usamos a ordem das palavras
    # para associar sequencialmente às falas.
    
    # Abordagem robusta: para cada fala, contar palavras no texto e associar sequencialmente.
    fala_por_palavra = []  # índice de fala para cada palavra
    wi = 0
    for fi, fala in enumerate(falas):
        texto = fala.get("texto", "")
        n_palavras_fala = len(texto.split())
        for _ in range(n_palavras_fala):
            if wi < len(palavras):
                fala_por_palavra.append(fi)
                wi += 1
    # Preencher sobras (erros de alinhamento)
    while len(fala_por_palavra) < len(palavras):
        fala_por_palavra.append(len(falas) - 1)

    # Agora calcular pausas entre palavras consecutivas
    pausas = []
    for i in range(len(palavras) - 1):
        fim_i = palavras[i]["fim"]
        ini_j = palavras[i + 1]["ini"]
        gap = ini_j - fim_i
        if gap <= 0:
            continue
        # A pausa ocorre após a palavra i; verificar fala da palavra i (ou i+1)
        fi = fala_por_palavra[i] if i < len(fala_por_palavra) else len(falas) - 1
        fala_atual = falas[fi]
        pausa_marcada = fala_atual.get("pausa", 0)
        # Se a pausa da fala > 0, considera suspense → max maior
        if pausa_marcada > 0:
            limite = max_pausa_suspense
        else:
            limite = max_pausa_normal
        pausas.append({
            "ini": fim_i,
            "fim": ini_j,
            "gap": round(gap, 4),
            "limite": limite,
            "fala_idx": fi,
            "pausa_marcada": pausa_marcada,
        })

    return pausas


def build_cortes(pausas):
    """Retorna lista de (ini, fim) a remover, e os que ficam mantidos."""
    cortes = []
    mantidos = []
    for p in pausas:
        excesso = p["gap"] - p["limite"]
        if excesso > 0.001:
            # Remover só o excesso: deixar `limite` segundos de pausa
            ini_corte = p["ini"] + p["limite"]
            fim_corte = p["fim"]
            cortes.append((ini_corte, fim_corte))
        else:
            mantidos.append(p)
    return cortes, mantidos


def aplicar_delta(t, cortes_sorted):
    """Dado um tempo t, retorna t_novo após remoção de todos os cortes anteriores."""
    delta = 0.0
    for (ini_c, fim_c) in cortes_sorted:
        if t <= ini_c:
            break
        elif t >= fim_c:
            delta += fim_c - ini_c
        else:
            # t está dentro de um corte — colapsa para o ponto de início
            delta += t - ini_c
    return t - delta


def build_ajuste_tempo(palavras, cortes_sorted):
    """Gera o mapeamento de tempos para ajuste_tempo.json."""
    pontos = set()
    for p in palavras:
        pontos.add(p["ini"])
        pontos.add(p["fim"])
    for (ini_c, fim_c) in cortes_sorted:
        pontos.add(ini_c)
        pontos.add(fim_c)

    ajuste = []
    for t in sorted(pontos):
        t_novo = aplicar_delta(t, cortes_sorted)
        d = round(t - t_novo, 6)
        ajuste.append({"t_original": round(t, 6), "t_novo": round(t_novo, 6), "delta": d})
    return ajuste


def ajustar_palavras(palavras, cortes_sorted):
    novas = []
    for p in palavras:
        novas.append({
            "w": p["w"],
            "ini": round(aplicar_delta(p["ini"], cortes_sorted), 4),
            "fim": round(aplicar_delta(p["fim"], cortes_sorted), 4),
        })
    return novas


def ajustar_falas_tempos(ft, cortes_sorted):
    if ft is None:
        return None
    novos = []
    for seg in ft:
        novo = dict(seg)
        novo["ini"] = round(aplicar_delta(seg["ini"], cortes_sorted), 4)
        novo["fim"] = round(aplicar_delta(seg["fim"], cortes_sorted), 4)
        novos.append(novo)
    return novos


# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser(description="Corta silêncios do dialogo.wav")
    ap.add_argument("pasta_ep", help="Pasta do episódio (contém voz/dialogo.wav, palavras.json, falas.json)")
    ap.add_argument("--max-pausa", type=float, default=0.3,
                    help="Pausa máxima permitida em segundos (padrão: 0.3)")
    ap.add_argument("--max-pausa-suspense", type=float, default=0.6,
                    help="Pausa máxima para falas marcadas com pausa>0 (padrão: 0.6)")
    ap.add_argument("--dry-run", action="store_true",
                    help="Só mostra o que seria cortado, sem gerar arquivos")
    args = ap.parse_args()

    pasta = args.pasta_ep.rstrip("/")
    wav_in = os.path.join(pasta, "voz", "dialogo.wav")
    wav_out = os.path.join(pasta, "voz", "dialogo_cortado.wav")
    ajuste_out = os.path.join(pasta, "voz", "ajuste_tempo.json")

    # Validar entradas
    for f in [wav_in, os.path.join(pasta, "palavras.json"), os.path.join(pasta, "falas.json")]:
        if not os.path.exists(f):
            print(f"ERRO: arquivo não encontrado: {f}", file=sys.stderr)
            sys.exit(1)

    print(f"Backend de áudio: {BACKEND}")
    print(f"Lendo {wav_in} ...")

    # Carregar dados
    palavras = load_palavras(pasta)
    falas = load_falas(pasta)
    falas_tempos = load_falas_tempos(pasta)

    n_palavras = len(palavras)
    if n_palavras < 2:
        print("ERRO: palavras.json tem menos de 2 palavras.", file=sys.stderr)
        sys.exit(1)

    # Duração original
    if BACKEND == "scipy":
        rate, data = wav_read_scipy(wav_in)
        dur_original = wav_duration_scipy(rate, data)
    else:
        dur_original = wav_duration_ffmpeg(wav_in)

    dur_fala = palavras[-1]["fim"] - palavras[0]["ini"]
    wps_antes = n_palavras / dur_original if dur_original > 0 else 0
    print(f"\n--- Análise ---")
    print(f"Palavras: {n_palavras}")
    print(f"Duração WAV original: {dur_original:.2f} s")
    print(f"Duração só fala (pri→últ palavra): {dur_fala:.2f} s")
    print(f"Palavras/s ANTES (baseado em dur. WAV): {wps_antes:.2f}")

    # Identificar pausas
    pausas = identificar_pausas_suspense(falas, palavras, args.max_pausa, args.max_pausa_suspense)
    
    print(f"\nPausas encontradas: {len(pausas)}")
    total_gap = sum(p["gap"] for p in pausas)
    print(f"Tempo total em pausas inter-palavra: {total_gap:.2f} s")

    # Calcular cortes
    cortes, _ = build_cortes(pausas)
    total_cortado = sum(fim - ini for (ini, fim) in cortes)
    n_cortes = len(cortes)

    print(f"\nPausas a cortar (excesso > limite): {n_cortes}")
    for (ini, fim) in sorted(cortes):
        print(f"  [{ini:.3f} → {fim:.3f}] = {fim-ini:.3f} s removidos")
    print(f"Total a remover: {total_cortado:.2f} s")

    dur_nova = dur_original - total_cortado
    wps_depois = n_palavras / dur_nova if dur_nova > 0 else 0
    print(f"\nDuração estimada após corte: {dur_nova:.2f} s")
    print(f"Palavras/s DEPOIS (estimado): {wps_depois:.2f}")

    if args.dry_run:
        print("\n[dry-run] Nenhum arquivo gerado.")
        return

    if n_cortes == 0:
        print("\nNenhum corte necessário. dialogo_cortado.wav = cópia do original.")
        import shutil
        shutil.copy2(wav_in, wav_out)
    else:
        # Cortar WAV
        cortes_sorted = sorted(cortes)
        print(f"\nCortando WAV ({BACKEND})...")
        if BACKEND == "scipy":
            data_novo = cortar_wav_scipy(rate, data, cortes_sorted)
            wav_write_scipy(wav_out, rate, data_novo)
        else:
            cortar_wav_ffmpeg(wav_in, wav_out, cortes_sorted, dur_original)

        # Verificar duração real do arquivo gerado
        if BACKEND == "scipy":
            dur_real = data_novo.shape[0] / rate
        else:
            dur_real = wav_duration_ffmpeg(wav_out)
        print(f"Duração real de dialogo_cortado.wav: {dur_real:.2f} s")

    # Gerar ajuste_tempo.json
    cortes_sorted = sorted(cortes)
    ajuste = build_ajuste_tempo(palavras, cortes_sorted)
    with open(ajuste_out, "w", encoding="utf-8") as f:
        json.dump(ajuste, f, indent=1, ensure_ascii=False)
    print(f"ajuste_tempo.json salvo: {len(ajuste)} entradas → {ajuste_out}")

    # Salvar palavras ajustadas (palavras_cortado.json)
    palavras_adj = ajustar_palavras(palavras, cortes_sorted)
    palavras_adj_out = os.path.join(pasta, "voz", "palavras_cortado.json")
    with open(palavras_adj_out, "w", encoding="utf-8") as f:
        json.dump(palavras_adj, f, indent=1, ensure_ascii=False)
    print(f"palavras_cortado.json salvo → {palavras_adj_out}")

    # Salvar falas_tempos ajustado (falas_tempos_cortado.json) se existir
    if falas_tempos is not None:
        ft_adj = ajustar_falas_tempos(falas_tempos, cortes_sorted)
        ft_adj_out = os.path.join(pasta, "voz", "falas_tempos_cortado.json")
        with open(ft_adj_out, "w", encoding="utf-8") as f:
            json.dump(ft_adj, f, indent=1, ensure_ascii=False)
        print(f"falas_tempos_cortado.json salvo → {ft_adj_out}")

    # Resumo final
    print(f"\n{'='*50}")
    print(f"RESUMO DO CORTE DE SILÊNCIO")
    print(f"{'='*50}")
    print(f"Palavras/s ANTES : {wps_antes:.2f}")
    print(f"Palavras/s DEPOIS: {wps_depois:.2f}  (alvo: ≥ 2.8)")
    print(f"Pausas removidas : {n_cortes} cortes, {total_cortado:.2f} s removidos")
    print(f"Duração WAV antes: {dur_original:.2f} s")
    print(f"Duração WAV depois: {dur_nova:.2f} s (estimado)")
    print(f"Backend usado    : {BACKEND}")
    if wps_depois < 2.8:
        print(f"\n⚠ Palavras/s abaixo de 2.8. Possíveis causas:")
        print(f"  - O material já tinha poucas pausas longas")
        print(f"  - A narração em si é lenta (palavras longas, TTS devagar)")
        print(f"  - Reduzir --max-pausa para 0.15 pode ajudar mais")


if __name__ == "__main__":
    main()
