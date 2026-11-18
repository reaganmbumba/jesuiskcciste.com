"""Monte un MP3 par chapitre à partir des voix déchiffrées (echange.py dechiffrer),
écoutable librement par tous sur /kccisme (décision de Reagan, 2026-11-18 : l'audio est
gratuit, avant le code d'accès ; seul le texte écrit reste protégé).

Usage : python montage.py narration.json voix/ ../../public/livres/audio-kccisme/
"""
import json, os, subprocess, sys

import numpy as np

SR = 24000
HAB = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "journal-radio", "habillage")


def charger(chemin, rogner=True):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", chemin, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    s = np.frombuffer(pcm, dtype="<f4").astype(np.float64)
    if not rogner:
        return s
    idx = np.nonzero(np.abs(s) > .01)[0]
    return s[max(0, idx[0] - 200): idx[-1] + 1000] if len(idx) else s


def main(narration, voix, sortie):
    chapitres = json.load(open(narration, encoding="utf-8"))
    virgule = charger(os.path.join(HAB, "virgule.wav"), False) * .55
    indicatif = charger(os.path.join(HAB, "indicatif.wav"), False) * .6
    os.makedirs(sortie, exist_ok=True)
    index = []
    for n, ch in enumerate(chapitres):
        morceaux = [indicatif if n == 0 else virgule, np.zeros(int(.4 * SR))]
        for i, s in enumerate(ch["segments"]):
            morceaux += [charger(os.path.join(voix, ch["id"], f"{i:03d}.mp3")), np.zeros(int(s["pause"] * SR))]
        morceaux.append(virgule)
        son = np.concatenate(morceaux)
        mp3 = os.path.join(sortie, f"{n + 1:02d}-{ch['id']}.mp3")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                        "-af", "loudnorm=I=-17:TP=-1.5:LRA=11", "-ar", str(SR), "-c:a", "libmp3lame", "-b:a", "48k",
                        "-metadata", f"title=Le KCCisme – {ch['titre']}", "-metadata", "artist=Prophète DIZOLELE-MPUNGU WAFIDUSWA Isaac",
                        "-metadata", "album=Le KCCisme (livre audio)", "-metadata", f"track={n + 1}", mp3],
                       input=son.astype("<f4").tobytes(), check=True)
        duree = round(len(son) / SR)
        index.append({"id": ch["id"], "titre": ch["titre"], "fichier": os.path.basename(mp3), "secondes": duree, "octets": os.path.getsize(mp3)})
        print(f"{mp3} : {duree // 60} min {duree % 60:02d}")
    json.dump(index, open(os.path.join(sortie, "index.json"), "w"), indent=1)
    print("total :", sum(c["secondes"] for c in index) // 60, "min")


if __name__ == "__main__":
    main(*sys.argv[1:])
