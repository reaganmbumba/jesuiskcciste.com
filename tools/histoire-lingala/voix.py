"""Fabrique la voix lingala d'un texte avec le modèle libre VITS « Open Bible Lingala »
(multilingual-tts/VITS-OpenBible-Lingala, licence CC BY-SA 4.0, Coqui TTS).

Usage : python voix.py ndai-ya-mosakoli.txt  ->  voix/ndai-ya-mosakoli/NN.wav
Une ligne = une phrase ; « # » = commentaire ; « [PAUSE] » = repère pour montage.py.
Variable VOIX = nom du locuteur (sinon le premier de la liste).
"""
import os, sys, unicodedata

import numpy as np
import scipy.io.wavfile as wav
import torch
from huggingface_hub import hf_hub_download
from TTS.tts.utils.speakers import SpeakerManager
from TTS.utils.synthesizer import Synthesizer

ICI = os.path.dirname(os.path.abspath(__file__))
REPO = "multilingual-tts/VITS-OpenBible-Lingala"


def phrases(chemin):
    for ligne in open(chemin, encoding="utf-8"):
        ligne = ligne.strip()
        if ligne and not ligne.startswith("#") and ligne != "[PAUSE]":
            yield ligne


def main(texte):
    nom = os.path.splitext(os.path.basename(texte))[0]
    sortie = os.path.join(ICI, "voix", nom)
    os.makedirs(sortie, exist_ok=True)
    spk = hf_hub_download(REPO, "speakers.pth")
    synth = Synthesizer(tts_checkpoint=hf_hub_download(REPO, "model_last.pth"),
                        tts_config_path=hf_hub_download(REPO, "config.json"),
                        tts_speakers_file=spk, use_cuda=False)
    if synth.tts_model.speaker_manager is None:
        synth.tts_model.speaker_manager = SpeakerManager(speaker_id_file_path=spk)
    noms = list(synth.tts_model.speaker_manager.name_to_id)
    print("locuteurs :", noms)
    chars = getattr(synth.tts_config, "characters", None)
    print("caractères :", chars)
    voix = os.environ.get("VOIX") or noms[0]
    print("VOIX :", voix)
    sr = synth.output_sample_rate
    for i, p in enumerate(phrases(texte), 1):
        torch.manual_seed(1955 + i)
        onde = np.array(synth.tts(unicodedata.normalize("NFC", p), speaker_name=voix), dtype=np.float64)
        onde = onde / max(1e-6, np.abs(onde).max()) * .9
        wav.write(os.path.join(sortie, f"{i:02d}.wav"), sr, (onde * 32767).astype(np.int16))
        print(f"{i:02d} {len(onde) / sr:.1f}s {p}")


if __name__ == "__main__":
    main(sys.argv[1])
