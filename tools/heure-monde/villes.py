"""Jingle de l'heure « autour du monde » de Radio Je suis KCCiste.

À chaque heure pile (heure de la RDC), une voix de femme annonce l'heure en RDC
et dans une ville du monde où vivent des KCCistes. La ville dépend de l'heure :
VILLES[heure % 12], donc chaque ville revient deux fois par jour, à 12 h d'écart.

Les villes à heure d'été (Europe, Amérique du Nord) ont deux fichiers par heure
(hiver et été) : le site choisit le bon en calculant l'heure locale de la ville.
Fichier : public/radio/heure-monde/hHH-LL.mp3 (HH = heure RDC, LL = heure de la ville).
"""
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

# (comment la voix le dit, fuseau horaire). L'ordre alterne Amériques / Europe / Afrique ;
# Los Angeles tombe à 11 h et 23 h (l'exemple de Reagan).
VILLES = [
    ("À Paris, en France", "Europe/Paris"),
    ("À Luanda, en Angola", "Africa/Luanda"),
    ("À New York, aux États-Unis", "America/New_York"),
    ("À Bruxelles, en Belgique", "Europe/Brussels"),
    ("À Johannesburg, en Afrique du Sud", "Africa/Johannesburg"),
    ("À Montréal, au Canada", "America/Toronto"),
    ("À Londres, au Royaume-Uni", "Europe/London"),
    ("À Brazzaville, au Congo", "Africa/Brazzaville"),
    ("À São Paulo, au Brésil", "America/Sao_Paulo"),
    ("À Genève, en Suisse", "Europe/Zurich"),
    ("À Houston, au Texas", "America/Chicago"),
    ("À Los Angeles, en Californie", "America/Los_Angeles"),
]
# Prononciation de la radio (comme le journal parlé).
RADIO = "Radio Je suis Ka-Cé-Ciste"
RDC = ZoneInfo("Africa/Kinshasa")  # UTC+1 toute l'année

NOMBRES = ["zéro", "une", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze",
           "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf", "vingt",
           "vingt et une", "vingt-deux", "vingt-trois"]


def heure_24(h: int) -> str:
    """Heure de la RDC, comme à la radio : « treize heures », « midi », « minuit »."""
    if h == 0:
        return "minuit"
    if h == 12:
        return "midi"
    return f"{NOMBRES[h]} heure" + ("s" if h > 1 else "")


def heure_12(h: int) -> str:
    """Heure d'une autre ville : « deux heures du matin », « cinq heures de l'après-midi »."""
    if h in (0, 12):
        return heure_24(h)
    n = h if h < 12 else h - 12
    mot = f"{NOMBRES[n]} heure" + ("s" if n > 1 else "")
    return mot + (" du matin" if h < 12 else " de l'après-midi" if h < 18 else " du soir")


def il_est(h: int) -> str:
    return f"il est {heure_24(h)}"


def texte(h: int, ville: str, local: int) -> str:
    debut = f"Il est {heure_24(h)}, sur {RADIO}."
    if local == h:
        return f"{debut} {ville}, comme en RDC, il est {heure_24(h)}."
    return f"{debut} {ville}, il est {heure_12(local)}. Et en RDC, il est {heure_24(h)}."


def heures_locales(h: int, tz: str) -> list[int]:
    """Les heures possibles dans la ville quand il est h heures en RDC (hiver et été)."""
    out = set()
    for mois in (1, 7):
        rdc = datetime(2027, mois, 15, h, 0, tzinfo=RDC)
        out.add(rdc.astimezone(ZoneInfo(tz)).hour)
    return sorted(out)


def annonces():
    """Toutes les annonces : (nom de fichier, texte)."""
    for h in range(24):
        ville, tz = VILLES[h % len(VILLES)]
        for local in heures_locales(h, tz):
            yield f"h{h:02d}-{local:02d}", texte(h, ville, local)


if __name__ == "__main__":
    for nom, t in annonces():
        print(nom, t)
