# Boutique KCC Music (Mobile Money)

Vente de titres et d'albums payés par **M-Pesa, Orange Money et Airtel Money** (RD Congo),
via l'agrégateur **FlexPay** (un seul contrat pour les trois opérateurs, CDF et USD).

## Fonctionnement

1. Sur `/musique`, un bouton « Acheter » apparaît sur chaque titre ou album **qui a un prix**
   (admin > KCC Music et médias > Titres / Albums : « Prix de vente » + « Devise »).
2. L'acheteur (connecté) choisit son opérateur et son numéro ; l'Edge Function
   `boutique-musique` lit le prix **en base**, crée la commande (`music_orders`) et demande
   le paiement à FlexPay. Le client reçoit une demande sur son téléphone et confirme avec son PIN.
3. FlexPay rappelle le webhook ; la fonction **re-vérifie** la transaction (`/check/{orderNumber}`)
   avant de passer la commande à `paid`. Le navigateur interroge aussi le statut toutes les 4 s.
4. Une fois payé : liens de téléchargement (1 h) ; l'acheteur les retrouve dans `/espace/achats`.
   Fichier livré : `tracks.sale_file_path` (bucket privé `music`) sinon `audio_url`.
5. Les ventes sont visibles dans l'admin, onglet « Ventes ».

Sécurité : aucune politique RLS d'écriture sur `music_orders` (seule la clé service_role de la
fonction écrit) ; le prix n'est jamais reçu du navigateur ; aucun PIN ni secret dans le frontend.

## Mise en service

1. SQL Editor : exécuter `supabase/migrations/20261020000001_music_shop.sql`.
2. Edge Functions > Deploy a new function > Via editor, nom `boutique-musique`, coller
   `supabase/functions/boutique-musique/index.ts`, **désactiver « Verify JWT »**
   (ou `supabase functions deploy boutique-musique` avec `supabase/config.toml`).
3. Edge Functions > Secrets : `FLEXPAY_MERCHANT`, `FLEXPAY_TOKEN`, `FLEXPAY_ENV` (`dev` pour le
   bac à sable, `prod` ensuite), `CALLBACK_SECRET` (longue chaîne aléatoire).
4. Fixer des prix dans l'admin.

Tests : `supabase/tests/20_music_shop_tests.sql` (RLS), `src/test/shop.test.ts` (numéros, prix).

## Extraits : écouter la moitié, acheter pour la suite

Les chants marqués d'un « fichier vendu » (`sale_file_path`) ne sont lus qu'en extrait sur le site :
`audio_url` pointe vers `/audio/extraits/…`, la première moitié du chant. À la fin de l'extrait,
le lecteur propose l'achat. Le chant entier est rangé dans le bucket **privé** `music` (dossier `chants/`).
L'Edge Function (action `ecoute`) en donne un lien signé de 3 h aux acheteurs du titre ou de son album,
et aux responsables musique (`music.manage`, donc aussi l'administrateur central).

Mise en place (une seule fois) :
1. SQL Editor : coller `supabase/migrations/20261022000001_music_previews.sql` (relançable sans risque).
2. Storage > `music` : créer le dossier `chants` et y déposer les 27 MP3 entiers (même nom de fichier).
3. Edge Functions > `boutique-musique` : coller le nouveau code de `supabase/functions/boutique-musique/index.ts`.

Pour fabriquer un extrait d'un nouveau chant : `ffmpeg -i chant.mp3 -t <moitié en secondes> -af "afade=t=out:st=<moitié-3>:d=3" -b:a 128k extrait.mp3`.
