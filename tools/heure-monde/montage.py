"""Habille chaque annonce : carillon doux (3 notes montantes, style « hôtesse d'aéroport »),
la voix, puis une note finale qui s'éteint. Sortie : public/radio/heure-monde/*.mp3 (+ manifeste TS).

Usage : python montage.py            (toutes les voix/hHH-LL.mp3)
        python montage.py essai      (voix/essai-*.mp3 → essais/)
"""
import glob, json, os, subprocess, sys, tempfile

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from villes import VILLES

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.abspath(os.path.join(ICI, "..", ".."))
SR = 44100


def cloche(freq: float, dur: float, amp: float) -> np.ndarray:
    t = np.arange(int(SR * dur)) / SR
    env = np.exp(-t * 3.2) * np.minimum(1, t / 0.006)
    son = (np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * 2 * freq * t) * np.exp(-t * 6)
           + 0.12 * np.sin(2 * np.pi * 3.01 * freq * t) * np.exp(-t * 9))
    return amp * env * son


def carillon(notes, ecart=0.32, queue=1.6) -> np.ndarray:
    out = np.zeros(int(SR * (ecart * len(notes) + queue)))
    for i, f in enumerate(notes):
        c = cloche(f, queue, 0.28)
        d = int(SR * ecart * i)
        out[d:d + len(c)] += c[: len(out) - d]
    return out


def wav(chemin: str, x: np.ndarray) -> None:
    import wave
    st = np.stack([x, x], 1)
    with wave.open(chemin, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(st, -1, 1) * 32767).astype("<i2").tobytes())


def habiller(voix: str, sortie: str, tmp: str) -> None:
    debut, fin = os.path.join(tmp, "debut.wav"), os.path.join(tmp, "fin.wav")
    if not os.path.exists(debut):
        wav(debut, carillon([587.33, 739.99, 880.0]))       # ré – fa# – la
        wav(fin, carillon([1174.66], queue=1.8) * 0.7)      # ré aigu
    # carillon, voix 0,9 s après la 1re note (pendant que la cloche s'éteint), note finale après la voix
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", debut, "-i", voix, "-i", fin, "-filter_complex",
                    "[1:a]aresample=44100,aformat=channel_layouts=stereo,loudnorm=I=-16:TP=-1.5,adelay=900|900,apad=pad_dur=0.25[v];"
                    "[0:a][v]amix=inputs=2:duration=longest:normalize=0[a];"
                    "[a][2:a]concat=n=2:v=0:a=1[o]",
                    "-map", "[o]", "-ac", "2", "-b:a", "128k", sortie], check=True)


def main() -> None:
    essai = sys.argv[1:] == ["essai"]
    sources = sorted(glob.glob(os.path.join(ICI, "voix", "essai-*.mp3" if essai else "h??-??.mp3")))
    dest = os.path.join(ICI, "essais") if essai else os.path.join(RACINE, "public", "radio", "heure-monde")
    os.makedirs(dest, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        for s in sources:
            habiller(s, os.path.join(dest, os.path.basename(s)), tmp)
            print(os.path.basename(s))
    if not essai:
        noms = [os.path.basename(s)[:-4] for s in sources]
        ts = os.path.join(RACINE, "src", "features", "radio", "heureMondeFichiers.ts")
        with open(ts, "w", encoding="utf-8") as f:
            f.write("// Fabriqué par tools/heure-monde/montage.py : annonces disponibles dans public/radio/heure-monde/.\n")
            f.write(f"export const HEURE_MONDE_FICHIERS: readonly string[] = {json.dumps(noms)};\n")
            f.write("/** Fuseau de la ville annoncée : VILLES[heure RDC % 12] (même ordre que tools/heure-monde/villes.py). */\n")
            f.write(f"export const HEURE_MONDE_FUSEAUX: readonly string[] = {json.dumps([tz for _, tz in VILLES], ensure_ascii=False)};\n")


if __name__ == "__main__":
    main()
