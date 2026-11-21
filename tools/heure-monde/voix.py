"""Fabrique les voix du jingle de l'heure avec les voix neuronales Microsoft (edge-tts).

Lancé par .github/workflows/heure-monde.yml (le serveur de Claude n'a pas accès à ce service).
- commande.txt contient « essai » : une même annonce (11 h) dite par plusieurs voix, pour choisir ;
- commande.txt contient « tout VOIX » : les 40 annonces avec la voix choisie → voix/hHH-LL.mp3.
"""
import asyncio, os, sys

import edge_tts

from villes import annonces

ICI = os.path.dirname(os.path.abspath(__file__))
ESSAI = ["fr-FR-VivienneMultilingualNeural", "fr-FR-DeniseNeural", "fr-BE-CharlineNeural", "fr-CA-SylvieNeural"]
VITESSE = "-4%"


async def dire(texte: str, voix: str, sortie: str) -> None:
    await edge_tts.Communicate(texte, voix, rate=VITESSE).save(sortie)
    if os.path.getsize(sortie) < 1000:
        raise RuntimeError(f"{voix} : fichier vide")
    print(sortie)


async def main() -> None:
    cmd = open(os.path.join(ICI, "commande.txt"), encoding="utf-8").read().split()
    dossier = os.path.join(ICI, "voix")
    os.makedirs(dossier, exist_ok=True)
    tout = dict(annonces())
    if cmd[0] == "essai":
        for v in ESSAI:
            await dire(tout["h11-02"], v, os.path.join(dossier, f"essai-{v}.mp3"))
    else:
        for nom, texte in tout.items():
            await dire(texte, cmd[1], os.path.join(dossier, f"{nom}.mp3"))


if __name__ == "__main__":
    asyncio.run(main())
