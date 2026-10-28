"""Lecture d'un texte de journal : lignes « ELLE: … », « LUI: … », « ENSEMBLE: … », repères « [TAPIS] » et « [EXTRAIT Titre] »."""
import re

# Corrections de prononciation pour la voix de synthèse (le texte reste lisible tel quel).
PRONONCIATION = [
    (r"jesuiskcciste\.com", "je suis Ka-Cé-Ciste point com"),
    (r"KCCistes", "Ka-Cé-Cistes"),
    (r"KCCiste", "Ka-Cé-Ciste"),
    (r"\bKCC\b", "Ka-Cé-Cé"),
    # Noms propres, tels que les prononce le Prédicateur Reagan MBUMBA (le « u » congolais se dit « ou »).
    (r"\bBarumbu\b", "Baroumbou"),
    (r"\bMuanda\b", "Mouanda"),
    (r"\bPika Pende\b", "Pikapèndé"),
    (r"\bMvuilu\b", "Mviou-lou"),
    (r"\bLuanika\b", "Louanika"),
    (r"\bNgidinga\b", "Nguidinnga"),
    (r"\bDizolele\b", "Dizolélé"),
    (r"\bMpungu\b", "Mpoungou"),
    (r"\bWafidu[sz]wa\b", "Wafidouzwa"),
    (r"\bKinuani\b", "Kinouani"),
    (r"\bMunganga\b", "Moungannga"),
    (r"\bTryphon\b", "Triphon"),
    (r"\bLemba\b", "Lèmba"),
    (r"\bMvuezolo\b", "Mvouézolo"),
    (r"\bBavangila\b", "Bavanguila"),
    (r"\bZeba\b", "Zéba"),
    (r"\bBuamano\b", "Bouamano"),
    (r"\bLufu\b", "Loufou"),
    # Émission « La jeunesse parle du Prophète » : lieux et paroles en kikongo
    (r"\bK, C, C\b", "Ka, Cé, Cé"),
    (r"\bNlemba\b", "Nlèmba"),
    (r"\bNlundu\b", "Nloundou"),
    (r"\bLuozi\b", "Louozi"),
    (r"\bLuangu\b", "Louanngou"),
    (r"\bKinkenge\b", "Kinnkènnguè"),
    (r"\bSeke-Banza\b", "Sékè-Bannza"),
    (r"\bKinzao-Mvuete\b", "Kinnzao-Mvouétè"),
    (r"\bKimbuandi\b", "Kimmbouanndi"),
    (r"\bTeli\b", "Téli"),
    (r"\bMupepe\b", "Moupépé"),
    (r"\bUnkeba\b", "Ounnkéba"),
    (r"\bBukavu\b", "Boukavou"),
    (r"\bLubumbashi\b", "Loubboumbachi"),
    (r"Ngeye wena bamvela tadi", "Nguéyé wéna bamvéla tadi"),
    (r"Ngeye kuasololo kua mutu ko", "Nguéyé kouassololo koua moutou ko"),
    (r"Salu ka kiena kia muntu ko", "Salou ka kiéna kia mounntou ko"),
    (r"Nkanda Wambote Wampa", "Nkannda Wammboté Wammpa"),
    (r"« Nkanda »", "« Nkannda »"), (r"« Wambote »", "« Wammboté »"), (r"« Wampa »", "« Wammpa »"),
    (r"Mena mu bibila, mena mu kia", "Ména mou bibila, ména mou kia"),
    (r"Yawhe Libanga", "Yawé Libannga"),
    (r"Simba ngai makasi", "Simmba ngaï makassi"),
    (r"ordonnance 128-80", "ordonnance cent vingt-huit, quatre-vingts"),
    (r"08 40 23 85 92", "zéro huit, quarante, vingt-trois, quatre-vingt-cinq, quatre-vingt-douze"),
]

VOIX = ("ELLE", "LUI", "ENSEMBLE",
        # émission « La jeunesse parle du Prophète » : un animateur, quatre jeunes hommes, trois jeunes femmes
        "ANIMATEUR", "JONATHAN", "SAMUEL", "DANIEL", "JOSUE", "ESTHER", "RUTH", "DEBORA", "TOUS")
GROUPES = {"ENSEMBLE": ["ELLE", "LUI"], "TOUS": ["ANIMATEUR", "JONATHAN", "SAMUEL", "DANIEL", "JOSUE", "ESTHER", "RUTH", "DEBORA"]}


def voix_de(qui: str) -> list[str]:
    """Voix à fabriquer pour une ligne : « ENSEMBLE » et « TOUS » parlent à plusieurs."""
    return GROUPES.get(qui, [qui])
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
            if ligne[1:].upper().startswith("EXTRAIT "):  # [EXTRAIT Titre du chant] : passage d'un chant du site
                elements.append({"type": "repere", "nom": "EXTRAIT", "chant": ligne.strip("[]")[8:].strip()})
                continue
            nom = ligne.strip("[]").strip().upper()
            if nom not in REPERES:
                raise ValueError(f"Repère inconnu : {ligne}")
            elements.append({"type": "repere", "nom": nom})
            continue
        qui, _, texte = ligne.partition(":")
        # « NOM+: » coupe la parole à la ligne précédente ; « NOM++: » parle en même temps qu'elle
        qui = qui.strip()
        chevauche = len(qui) - len(qui.rstrip("+"))
        qui = qui.rstrip("+")
        if qui not in VOIX:
            raise ValueError(f"Ligne sans voix : {ligne}")
        n += 1
        elements.append({"type": "voix", "qui": qui, "texte": texte.strip(), "n": n, "chevauche": chevauche})
    return elements
