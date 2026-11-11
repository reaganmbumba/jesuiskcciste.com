# Journal parlé de Radio Je suis KCCiste

1. Écrire le texte validé dans `AAAA-MM-JJ.txt` (voir `2026-10-27.txt` : lignes `ELLE:`, `LUI:`, `ENSEMBLE:` et repères `[OUVERTURE]`, `[TAPIS]`, `[FIN TAPIS]`, `[VIRGULE]`, `[TRANSITION]`, `[SILENCE]`, `[FIN]`).
2. Pousser sur une branche `claude/…` : le workflow « Journal radio (voix) » fabrique les voix neuronales Microsoft (Vivienne et Rémy) dans `voix/AAAA-MM-JJ/` et les enregistre sur la branche.
3. `python habillage.py` (une seule fois : indicatif, virgule, transition, tapis, fin), puis
   `python montage.py AAAA-MM-JJ.txt ../../public/audio/journal/journal-AAAA-MM-JJ.mp3`.
4. Ajouter le journal dans `src/content/journaux.ts` (durée affichée par montage.py). Le plus récent ouvre chaque tour de radio pendant 7 jours.

## Bande-annonce d'une émission

1. Texte court `annonce-….txt` (lignes `ELLE:`/`LUI:`), poussé comme un journal pour fabriquer les voix.
2. `TEMPS=1 python montage.py emission-….txt …` affiche l'heure de chaque réplique dans l'émission : choisir deux passages.
3. `python annonce.py annonce-….txt <émission.mp3> <annonce.mp3> 414.0-435.9 262-274`.
4. Dans `src/content/emissions.ts`, ajouter `teaserUrl` et `teaserSeconds` : la bande-annonce passe entre les chants dans les 24 h qui précèdent l'émission, jusqu'à son début.
