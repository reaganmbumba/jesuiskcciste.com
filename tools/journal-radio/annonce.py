"""Bande-annonce d'une émission : indicatif, voix de l'annonce (voix.py) et passages de l'émission.

Usage : python annonce.py annonce-musique-2026-10-28.txt ../../public/audio/emissions/emission-musique-2026-10-27.mp3 \
          ../../public/audio/emissions/annonce-musique-2026-10-28.mp3 10.5-24 300-312
Les passages (début-fin, en secondes dans l'émission) s'intercalent après la 2e et la 3e voix de l'annonce ;
TEMPS=1 python montage.py … donne les repères de l'émission.
"""
import os, subprocess, sys

import numpy as np

from montage import SR, charger, poser
from texte import lire

ICI = os.path.dirname(os.path.abspath(__file__))
FONDU = .4


def passage(chemin, debut, fin):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(debut), "-t", str(fin - debut), "-i", chemin,
                          "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    s = np.frombuffer(pcm, dtype="<f4").astype(np.float64)
    f = int(FONDU * SR)
    s[:f] *= np.linspace(0, 1, f)
    s[-f:] *= np.linspace(1, 0, f)
    return s


def main(texte, emission, sortie, *passages):
    nom = os.path.splitext(os.path.basename(texte))[0]
    voix = [e for e in lire(texte) if e["type"] == "voix"]
    sons = [charger(os.path.join(ICI, "voix", nom, f"{e['n']:03d}-{e['qui'].lower()}.mp3")) for e in voix]
    extraits = [passage(emission, *map(float, p.split("-"))) for p in passages]
    hab = {n: charger(os.path.join(ICI, "habillage", n + ".wav")) for n in ("indicatif", "virgule", "fin")}
    piste, t = np.zeros(SR), .3
    piste = poser(piste, hab["indicatif"], t)
    t += 8.2
    for i, s in enumerate(sons):
        piste = poser(piste, s, t)
        t += len(s) / SR + .35
        if 1 <= i <= len(extraits):  # un passage de l'émission après la 2e, puis la 3e voix
            piste = poser(piste, hab["virgule"], t, .6)
            t += .9
            piste = poser(piste, extraits[i - 1], t, .9)
            t += len(extraits[i - 1]) / SR + .3
    piste = poser(piste, hab["fin"], t)
    t += len(hab["fin"]) / SR
    mix = piste[: int((t + .3) * SR)]
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
         "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", str(SR), "-c:a", "libmp3lame", "-b:a", "96k",
         "-metadata", "title=Bande-annonce, Radio Je suis KCCiste", "-metadata", "artist=Radio Je suis KCCiste", sortie],
        input=mix.astype("<f4").tobytes(), check=True)
    print(f"{sortie} : {t:.0f} s")


if __name__ == "__main__":
    main(*sys.argv[1:])
