# Dons en ligne (Solidarité)

Dans l'espace « Faire un don » de `/solidarite`, le donateur peut **payer depuis son téléphone** :
il choisit M-Pesa, Orange Money ou Airtel Money, tape son numéro et le montant, reçoit la demande
de paiement sur son téléphone et confirme avec son code PIN. Pas besoin de compte sur le site.

L'argent arrive sur le **compte marchand FlexPay** de l'initiative (le même que pour la boutique
KCC Music, voir `docs/BOUTIQUE.md`). On le retire ensuite depuis l'espace FlexPay vers le numéro
M-Pesa ou Orange Money de Reagan MBUMBA. Un paiement ne peut pas tomber directement sur un numéro
personnel : il faut obligatoirement passer par un compte marchand.

L'onglet « Envoyer moi-même » (numéros affichés + confirmation WhatsApp) reste disponible.

## Fonctionnement

1. Le site appelle l'Edge Function `dons-solidarite` (action `donate`) ; elle vérifie le numéro,
   l'opérateur et le montant (1 à 2 000 $, ou 1 000 à 5 000 000 FC), enregistre le don dans
   `online_donations` et demande le paiement à FlexPay.
2. FlexPay rappelle le webhook ; la fonction **re-vérifie** la transaction auprès de FlexPay avant
   de passer le don à `paid`. Le navigateur interroge aussi le statut toutes les 4 s.
3. Anti-abus : 3 demandes au plus par numéro en 10 minutes.
4. Les dons ne sont lisibles que par les gestionnaires (permission `contributions.read`) : les numéros
   des donateurs ne sont jamais publics. Pour la liste publique, ajouter le nom et le montant dans
   `src/content/solidarite.ts` (`CONTRIBUTIONS`).

## Mise en service

1. Ouvrir le compte marchand FlexPay (https://flexpay.cd) s'il ne l'est pas déjà.
2. SQL Editor : exécuter `supabase/migrations/20261022000010_online_donations.sql`.
3. Edge Functions > Deploy a new function > Via editor, nom `dons-solidarite`, coller
   `supabase/functions/dons-solidarite/index.ts`, **désactiver « Verify JWT »**.
4. Edge Functions > Secrets : les mêmes que la boutique (`FLEXPAY_MERCHANT`, `FLEXPAY_TOKEN`,
   `FLEXPAY_ENV`, `CALLBACK_SECRET`).
5. Dans `src/content/solidarite.ts`, passer `ONLINE_DONATIONS_OPEN` à `true` et publier.

Tests : `supabase/tests/60_online_donations_tests.sql` (RLS).
