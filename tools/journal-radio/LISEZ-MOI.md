# Journal parlé de Radio Je suis KCCiste

1. Écrire le texte validé dans `AAAA-MM-JJ.txt` (voir `2026-10-27.txt` : lignes `ELLE:`, `LUI:`, `ENSEMBLE:` et repères `[OUVERTURE]`, `[TAPIS]`, `[FIN TAPIS]`, `[VIRGULE]`, `[TRANSITION]`, `[SILENCE]`, `[FIN]`).
2. Pousser sur une branche `claude/…` : le workflow « Journal radio (voix) » fabrique les voix neuronales Microsoft (Vivienne et Rémy) dans `voix/AAAA-MM-JJ/` et les enregistre sur la branche.
3. `python habillage.py` (une seule fois : indicatif, virgule, transition, tapis, fin), puis
   `python montage.py AAAA-MM-JJ.txt ../../public/audio/journal/journal-AAAA-MM-JJ.mp3`.
4. Ajouter le journal dans `src/content/journaux.ts` (durée affichée par montage.py). Le plus récent ouvre chaque tour de radio pendant 7 jours.

## Émissions à plusieurs voix

Voir `emission-jeunes-prophete.txt` : voix `ANIMATEUR`, `JONATHAN`, `SAMUEL`, `DANIEL`, `JOSUE`, `ESTHER`, `RUTH`, `DEBORA`, et `TOUS` (toute la table).
Pour que ça sonne comme une vraie conversation : `NOM+:` coupe la parole à la réplique précédente, `NOM++:` parle en même temps (rires, « Allez ! »).
Montage plus vif : `RESPIRATION=.3 python montage.py emission-….txt ../../public/audio/emissions/emission-….mp3`, puis ajouter l'émission dans `src/content/emissions.ts` (heure en UTC).
Les voix déjà fabriquées ne sont pas refaites : supprimer `voix/<nom>/` si le texte change.
