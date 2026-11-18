"""Transforme le livre « Le KCCisme » (JSON déchiffré, jamais enregistré dans le dépôt)
en textes à dire, chapitre par chapitre, pour les voix neuronales.

Usage : python narration.py livre.json sortie.json
sortie.json = [{"id", "titre", "segments": [{"voix": "LUI"|"ELLE", "texte", "pause"}]}]
"""
import json, re, sys

LIVRES = {
    "Ge": "Genèse", "Ex": "Exode", "Lé": "Lévitique", "No": "Nombres", "De": "Deutéronome",
    "1 S": "premier livre de Samuel", "1 R": "premier livre des Rois", "2 R": "deuxième livre des Rois",
    "1 Ch": "premier livre des Chroniques", "2 Ch": "deuxième livre des Chroniques", "2 Chroniques": "deuxième livre des Chroniques", "Jéremie": "Jérémie",
    "Ps": "Psaume", "Pr": "Proverbes", "Ec": "Ecclésiaste", "Es": "Ésaïe", "Jé": "Jérémie",
    "La": "Lamentations", "Ez": "Ézéchiel", "Am": "Amos", "Mal": "Malachie",
}
NOMS = "Isaïe|Genèse|Exode|Lévitique|Nombres|Deutéronome|Psaumes?|Proverbes|Ecclésiaste|Ésaïe|Esaïe|Jérémie|Lamentations|Ézéchiel|Ezéchiel|Amos|Malachie"
REF = re.compile(r"\b((?:[12] ?)?(?:" + NOMS + r"|Ge|Ex|Lé|No|De|S|R|Ch|Ps|Pr|Ec|Es|Jé|La|Ez|Am|Mal))\.?\s*(\d+)\s*[:.]\s*(\d+)(?:\s*-\s*(\d+))?")
# Autres livres écrits en entier, toujours avec « chapitre : verset » (Josué 1 :7, 2 Chroniques 20 :20…).
REF2 = re.compile(r"\b((?:[12] )?[A-ZÉ][a-zéèëï]+)\s+(\d+)\s*:\s*(\d+)(?:\s*-\s*(\d+))?")
SIGLES = {"EBNM", "KCC", "KCCISME", "KCCISTE", "KCCISTES", "SEDEC", "BUNGE"}

# Prononciation : le « u » kikongo se dit « ou » ; KCC se lit « Kasésé » (note du livre).
PRONONCIATION = [
    (r"\bKCCISME\b|\bKCCisme\b", "Kasésisme"),
    (r"\bKCCISTES\b|\bKCCistes\b", "Kasésistes"),
    (r"\bKCCISTE\b|\bKCCiste\b", "Kasésiste"),
    (r"\bKCC\b", "Kasésé"),
    (r"\bEBNM\b", "É B N M"),
    (r"\bO\.C\.C\.", "O C C"),
    (r"\bDIZOLELE\b|\bDizolele\b", "Dizolélé"),
    (r"\bMPUNGU\b|\bMpungu\b", "Mpoungou"),
    (r"\bWAFIDUSWA\b|\bWafiduswa\b", "Wafidouswa"),
    (r"\bW\.I\.", "Wafidouswa Isaac"),
    (r"\bMVUILU\b|\bMvuilu\b", "Mviou-lou"),
    (r"\bNKULUTU\b", "Nkouloutou"),
    (r"\bMANZUKULA\b", "Manzoukoula"),
    (r"\bLUSALA\b", "Lousala"),
    (r"\bLUSUADI\b", "Lousouadi"),
    (r"\bYEKULA\b", "Yékoula"),
    (r"\bMUAKASA\b", "Mouakasa"),
    (r"\bYUNGI\b", "Youngui"),
    (r"\bNLANDU\b|\bNlundu\b", lambda m: "Nlandou" if m.group(0).isupper() else "Nloundou"),
    (r"\bKUNGU\b", "Koungou"),
    (r"\bKUKU\b", "Koukou"),
    (r"\bGBWENDU\b", "Gbwendou"),
    (r"\bMBOTE\b", "Mboté"),
    (r"\bWambote\b", "Wamboté"),
    (r"\bNTETE\b", "Ntété"),
    (r"\bMELA\b", "Méla"),
    (r"\bYELIKO\b", "Yéliko"),
    (r"\bSESE SEKO\b", "Sésé Séko"),
    (r"\bMakaba\b", "Makaba"),
    (r"\bOp\. ?Cit\.", "ouvrage cité"),
    (r"\bp\.\s?(\d+)\s?-\s?(\d+)", r"pages \1 à \2"),
    (r"\bp\.\s?(\d+)", r"page \1"),
    (r"\b1er\b", "premier"),
    (r"\bn°\s?", "numéro "),
    (r"\betc\.", "et cetera."),
    (r"\bcfr?\.", "voir"),
]
# Cantique en kikongo (chapitre III) : orthographe de lecture.
KIKONGO = {
    "kuasololo": "kouassololo", "kua": "koua", "muntu": "mountou", "ludi": "loudi", "mu": "mou",
    "kiadi": "kiadi", "beni": "béni", "Lukaya": "Loukaya", "meso": "méso", "lusambulu": "loussamboulou",
    "Salu": "Salou", "kiena": "kiéna", "Ngeye": "Nguéyé", "solua": "solwa", "kuaku": "kwakou",
    "wasolua": "wasolwa", "Mfumu": "Mfoumou", "waku": "wakou",
}


def ref(m):
    livre, chap, v1, v2 = m.groups()
    livre = re.sub(r"^([12])(?=\S)", r"\1 ", livre)
    nom = LIVRES.get(livre, {"Esaïe": "Ésaïe", "Isaïe": "Ésaïe", "Ezéchiel": "Ézéchiel", "Psaumes": "Psaume"}.get(livre, livre))
    vers = f"versets {v1} à {v2}" if v2 else f"verset {v1}"
    return f"{nom}, chapitre {chap}, {vers}"


def propre(html: str, kikongo=False) -> str:
    t = re.sub(r"<sup>\s*\(?\s*\d+\s*\)?\s*</sup>|\(\s*<sup>\d+</sup>\s*\)|\(\d+ ?\)", "", html)
    t = re.sub(r"<sup>(er|e|ème)</sup>", r"\1", t)
    t = re.sub(r"<[^>]+>", "", t).replace("\xa0", " ")
    t = re.sub(r"^([B-DF-HJ-NP-TV-XZ]) ([a-zé])", r"\1\2", t)  # lettrine : « C haque » → « Chaque »
    t = re.sub(r"(\d)’", r"\1", t)
    t = REF.sub(ref, t)
    t = REF2.sub(ref, t)
    t = re.sub(r"([;,] )(\d+) ?: ?(\d+)(?: ?- ?(\d+))?", lambda m: m.group(1) + f"chapitre {m.group(2)}, " + (f"versets {m.group(3)} à {m.group(4)}" if m.group(4) else f"verset {m.group(3)}"), t)
    t = t.replace("JE SUIS", "je suis").replace("WA ", "wa ")
    t = re.sub(r"\b([Dd]ans|[Ee]n) (premier|deuxième) livre", r"\1 le \2 livre", t)
    t = re.sub(r"\b[A-ZÉÈ][A-ZÉÈ]{2,}\b", lambda m: m.group(0) if m.group(0) in SIGLES else m.group(0).capitalize(), t)
    for motif, rempl in PRONONCIATION:
        t = re.sub(motif, rempl, t)
    if kikongo:
        t = re.sub(r"[\w]+", lambda m: KIKONGO.get(m.group(0), m.group(0)), t)
    t = re.sub(r"^\s*[-–•]\s*", "", t)
    return re.sub(r"\s+", " ", t).strip()


def titre(t: str) -> str:
    t = re.sub(r"^\s*(\d+\.)+\s*", "", t)  # 6.1.2. Définition → Définition
    return re.sub(r"^[IVX]+\.\s*", "", t)


CHIFFRES = ["un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze"]


def main(src, dst):
    livre = json.load(open(src, encoding="utf-8"))
    sortie = []
    for i, c in enumerate(livre["chapters"]):
        if c["id"] == "abreviations":
            continue  # les références sont lues en entier
        segs = []
        m = re.match(r"^([IVX]+)\.", c["title"])
        annonce = titre(c["title"])
        if m:
            n = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"].index(m.group(1))
            annonce = f"Chapitre {CHIFFRES[n]}. {annonce}"
        if i == 0:
            segs.append({"voix": "ELLE", "texte": "Le Kasésisme. Livre du Prophète Dizolélé Mpoungou Wafidouswa Isaac, fondateur de l’Église Bon Nouveau Message, Kasésé. Version audio du site Je suis Kasésiste.", "pause": 1.6})
        segs.append({"voix": "ELLE", "texte": annonce + ".", "pause": 1.4})
        kik = False
        num = 0
        for typ, html in c["blocks"]:
            if typ in ("h2", "h3"):
                segs.append({"voix": "ELLE", "texte": titre(propre(html)) + ".", "pause": 1.0})
                num = 0
                continue
            if "cantique suivant" in html:
                kik = True
            t = propre(html, kikongo=kik and typ != "note")
            if not t:
                continue
            if typ == "oli":
                num += 1
                t = f"{num}. {t}"
            if typ == "note" and "lire Kasese" in html:
                continue
            if typ == "note":
                t = "Note : " + t
            if kik and "Lukaya" in html and "(2)" in html:
                kik = False
            segs.append({"voix": "LUI", "texte": t, "pause": 0.5 if typ in ("li", "oli") else 0.8})
        if c["id"] == "auteur":
            segs.append({"voix": "ELLE", "texte": "Fin du livre Le Kasésisme. Que la paix de l’Éternel soit avec vous.", "pause": 1.0})
        sortie.append({"id": c["id"], "titre": c["title"], "segments": segs})
    json.dump(sortie, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(sum(len(s["texte"]) for ch in sortie for s in ch["segments"]), "caractères,", sum(len(ch["segments"]) for ch in sortie), "segments")


if __name__ == "__main__":
    main(*sys.argv[1:])
