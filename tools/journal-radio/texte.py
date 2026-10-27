"""Lecture d'un texte de journal : lignes « ELLE: … », « LUI: … », « ENSEMBLE: … » et repères « [TAPIS] »."""
import re

# Corrections de prononciation pour la voix de synthèse (le texte reste lisible tel quel).
PRONONCIATION = [
    (r"jesuiskcciste\.com", "je suis Ka-Cé-Ciste point com"),
    (r"KCCistes", "Ka-Cé-Cistes"),
    (r"KCCiste", "Ka-Cé-Ciste"),
    (r"\bKCC\b", "Ka-Cé-Cé"),
    (r"08 40 23 85 92", "zéro huit, quarante, vingt-trois, quatre-vingt-cinq, quatre-vingt-douze"),
]

VOIX = ("ELLE", "LUI", "ENSEMBLE")
REPERES = ("OUVERTURE", "TAPIS", "FIN TAPIS", "VIRGULE", "TRANSITION", "SILENCE", "FIN")


def a_dire(texte: str) -> str:
    for motif, remplacement in PRONONCIATION:
        texte = re.sub(motif, remplacement, texte)
    return texte


def lire(chemin: str) -> list[dict]:
    """Liste ordonnée de {"type": "voix", "qui", "texte", "n"} et {"type": "repere", "nom"}."""
    elements, n = [], 0
    for ligne in open(chemin, encoding="utf-8"):
        ligne = ligne.strip()
        if not ligne or ligne.startswith("#"):
            continue
        if ligne.startswith("["):
            nom = ligne.strip("[]").strip().upper()
            if nom not in REPERES:
                raise ValueError(f"Repère inconnu : {ligne}")
            elements.append({"type": "repere", "nom": nom})
            continue
        qui, _, texte = ligne.partition(":")
        if qui.strip() not in VOIX:
            raise ValueError(f"Ligne sans voix : {ligne}")
        n += 1
        elements.append({"type": "voix", "qui": qui.strip(), "texte": texte.strip(), "n": n})
    return elements
