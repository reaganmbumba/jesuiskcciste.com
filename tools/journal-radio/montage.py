"""Monte le journal : voix (voix.py) + habillage (habillage.py), puis MP3 normalisé.

Usage : python montage.py 2026-10-27.txt public/audio/journal/journal-2026-10-27.mp3
"""
import os, subprocess, sys

import numpy as np

from texte import lire

SR = 44100
ICI = os.path.dirname(os.path.abspath(__file__))
TAPIS_GAIN = .16  # tapis musical bien en dessous des voix


def charger(chemin):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", chemin, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    s = np.frombuffer(pcm, dtype="<f4").astype(np.float64)
    # retire les silences de début et de fin de chaque voix
    idx = np.nonzero(np.abs(s) > .01)[0]
    return s[max(0, idx[0] - 400): idx[-1] + 2000] if len(idx) else s


def poser(piste, son, debut, gain=1.0):
    i = max(0, int(debut * SR))
    fin = i + len(son)
    if fin > len(piste):
        piste = np.concatenate([piste, np.zeros(fin - len(piste) + SR)])
    piste[i:fin] += son * gain
    return piste


def main(texte, sortie):
    nom = os.path.splitext(os.path.basename(texte))[0]
    voix_dir = os.path.join(ICI, "voix", nom)
    hab = {n: charger(os.path.join(ICI, "habillage", n + ".wav")) for n in ("indicatif", "virgule", "transition", "fin", "tapis")}
    piste, tapis = np.zeros(SR), np.zeros(SR)
    t, precedent, tapis_debut = .3, None, None
    for e in lire(texte):
        if e["type"] == "voix":
            if precedent == "voix":
                t += .45  # respiration entre deux phrases
            fichiers = ["elle", "lui"] if e["qui"] == "ENSEMBLE" else [e["qui"].lower()]
            sons = [charger(os.path.join(voix_dir, f"{e['n']:03d}-{q}.mp3")) for q in fichiers]
            for s in sons:
                piste = poser(piste, s, t, 1 / len(sons) ** .5)
            t += max(len(s) for s in sons) / SR
            precedent = "voix"
            continue
        r = e["nom"]
        if r == "OUVERTURE":
            piste = poser(piste, hab["indicatif"], t)
            t += 2.6  # la voix entre sur la traîne de l'indicatif
        elif r in ("VIRGULE", "TRANSITION"):
            son = hab["virgule" if r == "VIRGULE" else "transition"]
            t += .35
            piste = poser(piste, son, t, .7 if r == "VIRGULE" else .85)
            t += (.9 if r == "VIRGULE" else 1.9)
        elif r == "SILENCE":
            t += 1.6
        elif r == "TAPIS":
            tapis_debut = t - .2
        elif r == "FIN TAPIS" and tapis_debut is not None:
            fin = t + .8
            n = int((fin - tapis_debut) * SR)
            boucle = np.tile(hab["tapis"], n // len(hab["tapis"]) + 1)[:n]
            f = min(n // 3, int(1.2 * SR))
            boucle[:f] *= np.linspace(0, 1, f)
            boucle[-f:] *= np.linspace(1, 0, f)
            tapis = poser(tapis, boucle, tapis_debut, TAPIS_GAIN)
            tapis_debut = None
        elif r == "FIN":
            t += .2
            piste = poser(piste, hab["fin"], t)
            t += len(hab["fin"]) / SR
        precedent = "repere"
    n = max(len(piste), len(tapis))
    mix = np.pad(piste, (0, n - len(piste))) + np.pad(tapis, (0, n - len(tapis)))
    mix = mix[: int((t + .5) * SR)]
    os.makedirs(os.path.dirname(os.path.abspath(sortie)), exist_ok=True)
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
         "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", str(SR), "-c:a", "libmp3lame", "-b:a", "96k",
         "-metadata", f"title=Journal de Radio Je suis KCCiste ({nom})", "-metadata", "artist=Radio Je suis KCCiste", sortie],
        input=mix.astype("<f4").tobytes(), check=True)
    print(f"{sortie} : {t / 60:.1f} min")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
