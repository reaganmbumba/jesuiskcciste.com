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
    print("emb :", getattr(synth.tts_model, "emb_g", None), synth.tts_config.model_args.use_speaker_embedding if hasattr(synth.tts_config, "model_args") else "?")
    synth.tts_model.length_scale = float(os.environ.get("LENTEUR", "1.0"))
    chars = getattr(synth.tts_config, "characters", None)
    print("caractères :", chars)
    sr = synth.output_sample_rate
    for voix in noms[:1]:  # les deux noms donnent la même voix
        d = os.path.join(sortie, voix)
        os.makedirs(d, exist_ok=True)
        for i, p in enumerate(phrases(texte), 1):
            torch.manual_seed(1955 + i)
            t = unicodedata.normalize("NFC", p).lower()
            m = synth.tts_model
            ids = torch.LongTensor(m.tokenizer.text_to_ids(t)).unsqueeze(0)
            sid = torch.LongTensor([m.speaker_manager.name_to_id[voix]])
            with torch.no_grad():
                out = m.inference(ids, aux_input={"speaker_ids": sid, "d_vectors": None, "language_ids": None})
            onde = out["model_outputs"].squeeze().cpu().numpy().astype(np.float64)
            onde = onde / max(1e-6, np.abs(onde).max()) * .9
            wav.write(os.path.join(d, f"{i:02d}.wav"), sr, (onde * 32767).astype(np.int16))
            print(f"{voix} {i:02d} {len(onde) / sr:.1f}s {p}")


if __name__ == "__main__":
    main(sys.argv[1])
