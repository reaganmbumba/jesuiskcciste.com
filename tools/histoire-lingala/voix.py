"""Fabrique la voix lingala (modèle libre Meta MMS-TTS « mms-tts-lin ») d'un texte.

Usage : python voix.py ndai-ya-mosakoli.txt  ->  voix/ndai-ya-mosakoli/NN.wav
Une ligne = une phrase ; « # » = commentaire ; « [PAUSE] » = repère pour montage.py.
"""
import os, sys, unicodedata

import numpy as np
import scipy.io.wavfile as wav
import torch
from transformers import AutoTokenizer, VitsModel

ICI = os.path.dirname(os.path.abspath(__file__))


def phrases(chemin):
    for ligne in open(chemin, encoding="utf-8"):
        ligne = ligne.strip()
        if ligne and not ligne.startswith("#") and ligne != "[PAUSE]":
            yield ligne


def main(texte):
    nom = os.path.splitext(os.path.basename(texte))[0]
    sortie = os.path.join(ICI, "voix", nom)
    os.makedirs(sortie, exist_ok=True)
    tok = AutoTokenizer.from_pretrained("facebook/mms-tts-lin")
    model = VitsModel.from_pretrained("facebook/mms-tts-lin")
    model.speaking_rate = 0.92
    model.noise_scale = 0.6
    vocab = set(tok.get_vocab())
    print("vocab:", "".join(sorted(c for c in vocab if len(c) == 1)))
    for i, p in enumerate(phrases(texte), 1):
        t = unicodedata.normalize("NFC", p.lower())
        absents = sorted({c for c in t if c not in vocab and c != " "})
        if absents:
            print(f"{i:02d} caractères ignorés : {absents}")
        torch.manual_seed(1955 + i)
        with torch.no_grad():
            onde = model(**tok(t, return_tensors="pt")).waveform[0].numpy()
        onde = onde / max(1e-6, np.abs(onde).max()) * .9
        wav.write(os.path.join(sortie, f"{i:02d}.wav"), model.config.sampling_rate, (onde * 32767).astype(np.int16))
        print(f"{i:02d} {len(onde) / model.config.sampling_rate:.1f}s {p}")


if __name__ == "__main__":
    main(sys.argv[1])
