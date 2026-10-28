# Boutique : pagnes KCC (25 $ le pagne)

Page publique : **/boutique/pagnes** (aussi /pagnes). Menu « Communauté › Boutique : pagnes KCC » et pied de page.

## Ce qui se passe quand un client clique sur « Commander »
1. La commande est enregistrée dans Supabase (table `pagne_orders`) et apparaît dans **Administration › Commandes de pagnes**.
2. Un e-mail récapitulatif part vers l'adresse de contact du site (Administration › Paramètres), via FormSubmit.
3. WhatsApp s'ouvre avec la commande déjà écrite, adressée au numéro de contact du site.

Si la base ou l'e-mail échouent, le client voit un bouton vert « Envoyer sur WhatsApp » : la commande n'est jamais perdue.
Aucun paiement n'est demandé sur le site : le vendeur rappelle le client.

## Mise en service (une seule fois)
1. Supabase › SQL Editor : coller `supabase/migrations/20261029000001_pagne_orders.sql`, puis Run.
2. Passer une commande de test. FormSubmit envoie alors un e-mail « Activate form » à l'adresse de contact : cliquer sur le lien d'activation. Les commandes suivantes arrivent directement.

## Sécurité
Les visiteurs peuvent seulement ajouter une commande (statut « nouvelle »). Lecture, changement de statut et suppression : administration centrale (`settings.manage`) uniquement.

## Modèles
Liste et photos dans `src/features/pagnes/pagnes.ts` (`PAGNE_MODELS`) et `public/images/pagnes/`.
