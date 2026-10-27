"""Fabrique les voix d'un journal avec les voix neuronales Microsoft (edge-tts).

Usage : python voix.py 2026-10-27.txt  →  voix/2026-10-27/001-elle.mp3, 002-lui.mp3…
Lancé par .github/workflows/journal-radio.yml (le serveur de Claude n'a pas accès à ce service).
"""
import asyncio, os, sys

import edge_tts

from texte import a_dire, lire

VOIX = {
    "ELLE": ["fr-FR-VivienneMultilingualNeural", "fr-FR-DeniseNeural"],
    "LUI": ["fr-FR-RemyMultilingualNeural", "fr-FR-HenriNeural"],
}


async def dire(texte: str, qui: str, sortie: str) -> None:
    for i, voix in enumerate(VOIX[qui]):
        try:
            await edge_tts.Communicate(texte, voix, rate="+4%").save(sortie)
            if os.path.getsize(sortie) > 1000:
                return
        except Exception as e:  # voix indisponible : on passe à la suivante
            print(f"{voix} indisponible ({e})", file=sys.stderr)
    raise RuntimeError(f"Aucune voix pour {qui}")


async def main(chemin: str) -> None:
    dossier = os.path.join(os.path.dirname(os.path.abspath(chemin)), "voix", os.path.splitext(os.path.basename(chemin))[0])
    os.makedirs(dossier, exist_ok=True)
    for e in lire(chemin):
        if e["type"] != "voix":
            continue
        for qui in (["ELLE", "LUI"] if e["qui"] == "ENSEMBLE" else [e["qui"]]):
            sortie = os.path.join(dossier, f"{e['n']:03d}-{qui.lower()}.mp3")
            await dire(a_dire(e["texte"]), qui, sortie)
            print(sortie)


if __name__ == "__main__":
    asyncio.run(main(sys.argv[1]))
