# Jingle de l'heure « autour du monde » (Radio Je suis KCCiste)

À chaque heure pile (heure de la RDC), un carillon puis une voix de femme :
« Il est onze heures, sur Radio Je suis KCCiste. À Los Angeles, en Californie, il est deux heures
du matin. Et en RDC, il est onze heures. » On dit toujours « en RDC », jamais « à Kinshasa ».

- `villes.py` : les 12 villes (VILLES[heure RDC % 12]) et les textes. 40 annonces : les villes à
  heure d'été ont une version hiver et une version été (`hHH-LL` = heure RDC, heure de la ville).
- `voix.py` + `.github/workflows/heure-monde.yml` : voix Microsoft (edge-tts) fabriquées sur GitHub
  quand `commande.txt` change sur une branche `claude/**` (« essai » = 4 voix pour choisir ;
  « tout fr-FR-VivienneMultilingualNeural » = les 40 annonces dans `voix/`).
- `montage.py` (ici, avec ffmpeg + numpy) : carillon + voix → `public/radio/heure-monde/` et
  `src/features/radio/heureMondeFichiers.ts`. Ensuite on peut supprimer `voix/`.

Sur le site : `src/features/radio/heureMonde.ts` choisit le fichier (heure locale calculée par le
navigateur) ; `timeAnnouncement` le joue à h00 par-dessus la musique baissée. Les quarts d'heure
gardent l'ancienne annonce. Pendant un direct ou une émission programmée, rien ne passe.

Voix ElevenLabs : possible plus tard (≈ 6 000 caractères) en remplaçant les fichiers de `voix/`.
