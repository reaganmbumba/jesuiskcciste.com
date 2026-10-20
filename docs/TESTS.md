# Tests de JE SUIS KCCiste

## 1. Tests frontend (Vitest) : `npm test`
29 tests, tous verts :
- **Correction des examens** : score, seuil, questions sans réponse, barème manquant, tentatives limitées ou illimitées, blocage après réussite, format du code de certificat.
- **Confidentialité des profils** : e-mail et téléphone masqués par défaut, respect des choix, accès des responsables, exclusion des comptes non listés, en attente ou suspendus.
- **Rôles** : membre sans accès à l’administration, compte suspendu sans droits, responsable limité à sa paroisse, formateur limité à ses formations, gestionnaire de solidarité sans droits sur les examens ni la musique.
- **Solidarité** : montants déclarés et confirmés distincts ; un paiement mobile n’est jamais confirmé sans vérification opérateur.
- **Protection des routes** : redirection d’un visiteur, accès d’un membre, refus de l’administration, blocage d’un compte en attente, connexion et déconnexion.
- **Examens** : aucune bonne réponse transmise au navigateur, soumission, certificat vérifiable, refus d’une nouvelle tentative.
- **Publications** : annonces réservées invisibles des visiteurs, brouillons jamais listés.
- **Inscription** : robustesse et confirmation du mot de passe, consentement obligatoire.
- **Utilitaires** : protection CSV contre l’injection de formules, conversions de casse, recherche sans accents et pagination.

## 2. Tests de sécurité de la base (SQL) : `supabase/tests/run-local.sh`
Exécutés sur PostgreSQL 16 avec un stub minimal de Supabase (`00_local_supabase_stub.sql`), en se connectant successivement comme visiteur, membre, autre membre, responsable de paroisse, formateur et administrateur central. Ils vérifient notamment :
- un visiteur ne voit que les annonces publiques, aucun profil, aucune réponse d’examen, et ne peut pas lire l’annuaire ;
- un membre ne lit que son propre profil, ne peut ni s’attribuer une fonction, ni changer son statut, ni modifier le profil d’autrui, ni s’attribuer un rôle ;
- l’annuaire respecte « ne pas apparaître » et masque e-mail et téléphone ;
- l’examen n’est accessible qu’après inscription, n’expose jamais `is_correct`, refuse la soumission avant la fin des leçons ; la progression n’est pas falsifiable ; la correction serveur donne le bon score ; le certificat est émis automatiquement et ne peut pas être créé à la main ;
- une contribution peut être déclarée mais pas confirmée par un membre ; seul un gestionnaire confirme, avec référence, et le montant confirmé est recalculé ;
- un membre ne voit ni les contributions, ni les certificats, ni les inscriptions d’autrui ;
- un responsable de paroisse lit et modifie son périmètre, pas celui d’une autre paroisse ;
- un formateur modifie sa formation, pas les autres ;
- le journal d’audit est alimenté et réservé aux administrateurs ;
- la vérification publique d’un certificat fonctionne et refuse les codes inconnus ;
- l’anonymisation d’un compte efface les données personnelles.

Prérequis : `psql` connecté à un PostgreSQL 15 ou plus récent où l’on peut créer une base (variables `PGHOST`, `PGPORT`, `PGUSER`). **Ne pas lancer le stub sur un vrai projet Supabase.**

## 3. Vérifications manuelles effectuées
- Rendu vérifié à 1440 px et 390 px de large (accueil, espace membre, administration, inscription, agenda) : aucun débordement horizontal ni erreur JavaScript.

## 4. Limites restantes
- Pas encore de tests de bout en bout contre un vrai projet Supabase (Auth, e-mails, Storage).
- Les paiements ne sont pas intégrés et ne sont donc pas testés au-delà des règles de confirmation.
- Pas d’audit d’accessibilité automatisé (axe) ; les bonnes pratiques sont appliquées manuellement (labels, focus visible, navigation au clavier, contrastes de la palette).
