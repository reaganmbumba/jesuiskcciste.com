"""Monte l'histoire : indicatif + voix lingala sur tapis musical + fin, en MP3.

Usage : python montage.py ndai-ya-mosakoli.txt sortie.mp3
Réutilise l'habillage de tools/journal-radio/habillage/ (indicatif, tapis, fin).
"""
import os, subprocess, sys

import numpy as np

SR = 44100
ICI = os.path.dirname(os.path.abspath(__file__))
HAB = os.path.join(ICI, "..", "journal-radio", "habillage")


def charger(chemin, rogner=True):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", chemin, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    s = np.frombuffer(pcm, dtype="<f4").astype(np.float64)
    if not rogner:
        return s
    idx = np.nonzero(np.abs(s) > .02)[0]
    return s[max(0, idx[0] - 400): idx[-1] + 1500] if len(idx) else s


def resserrer(s, max_silence=.32, seuil=.02):
    """Raccourcit les silences trop longs à l'intérieur d'une phrase (voix lente)."""
    trame = int(.01 * SR)
    n = len(s) // trame
    fort = np.abs(s[: n * trame]).reshape(n, trame).max(axis=1) > seuil
    garde, run = [], 0
    for i in range(n):
        run = 0 if fort[i] else run + 1
        if run * .01 <= max_silence:
            garde.append(s[i * trame:(i + 1) * trame])
    return np.concatenate(garde + [s[n * trame:]])


def main(texte, sortie):
    nom = os.path.splitext(os.path.basename(texte))[0]
    indicatif = charger(os.path.join(HAB, "indicatif.wav"), False)
    fin = charger(os.path.join(HAB, "fin.wav"), False)
    tapis = charger(os.path.join(HAB, "tapis.wav"), False)
    base = os.path.join(ICI, "voix", nom)
    dossier = os.path.join(base, sorted(os.listdir(base))[0])
    voix = [np.zeros(int(.6 * SR))]
    n = 0
    for ligne in open(texte, encoding="utf-8"):
        ligne = ligne.strip()
        if not ligne or ligne.startswith("#"):
            continue
        if ligne == "[PAUSE]":
            voix.append(np.zeros(int(.9 * SR)))
            continue
        n += 1
        voix.append(resserrer(charger(os.path.join(dossier, f"{n:02d}.wav"))))
        voix.append(np.zeros(int(.55 * SR)))
    voix = np.concatenate(voix + [np.zeros(int(1.2 * SR))])
    # tapis en boucle sous la voix, fondu d'entrée et de sortie
    lit = np.resize(tapis, len(voix)) * .10
    f = int(2 * SR)
    lit[:f] *= np.linspace(0, 1, f)
    lit[-f:] *= np.linspace(1, 0, f)
    corps = voix + lit
    chevauche = int(.8 * SR)
    piste = np.concatenate([indicatif[:-chevauche], np.zeros(len(corps) + len(fin))])
    debut = len(indicatif) - chevauche
    piste[debut - chevauche: debut] += indicatif[-chevauche:]
    piste[debut: debut + len(corps)] += corps
    piste[debut + len(corps) - int(.5 * SR): debut + len(corps) - int(.5 * SR) + len(fin)] += fin
    piste = piste[: debut + len(corps) - int(.5 * SR) + len(fin)]
    piste = piste / np.abs(piste).max() * .95
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "f64le", "-ar", str(SR), "-ac", "1", "-i", "-",
                    "-af", "loudnorm=I=-16:TP=-1.5", "-ar", "44100", "-b:a", "128k", sortie],
                   input=piste.astype("<f8").tobytes(), check=True)
    print(f"{sortie} : {len(piste) / SR / 60:.0f} min {len(piste) / SR % 60:02.0f} s")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
