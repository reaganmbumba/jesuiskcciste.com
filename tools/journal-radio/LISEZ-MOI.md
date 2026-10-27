# Journal parlé de Radio Je suis KCCiste

1. Écrire le texte validé dans `AAAA-MM-JJ.txt` (voir `2026-10-27.txt` : lignes `ELLE:`, `LUI:`, `ENSEMBLE:` et repères `[OUVERTURE]`, `[TAPIS]`, `[FIN TAPIS]`, `[VIRGULE]`, `[TRANSITION]`, `[SILENCE]`, `[FIN]`).
2. Pousser sur une branche `claude/…` : le workflow « Journal radio (voix) » fabrique les voix neuronales Microsoft (Vivienne et Rémy) dans `voix/AAAA-MM-JJ/` et les enregistre sur la branche.
3. `python habillage.py` (une seule fois : indicatif, virgule, transition, tapis, fin), puis
   `python montage.py AAAA-MM-JJ.txt ../../public/audio/journal/journal-AAAA-MM-JJ.mp3`.
4. Ajouter le journal dans `src/content/journaux.ts` (durée affichée par montage.py). Le plus récent ouvre chaque tour de radio pendant 7 jours.
