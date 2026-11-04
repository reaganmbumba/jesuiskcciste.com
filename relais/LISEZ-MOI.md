# Relais du studio → YouTube, Facebook (RTMP)

Un site internet ne peut pas envoyer lui-même une vidéo à YouTube ou Facebook :
ils n'acceptent que le format RTMP. Ce petit serveur reçoit l'image du studio
(`/studio`, onglet Direct) et l'envoie, avec ffmpeg, à chaque « URL du serveur +
clé de stream » collée dans le studio. Les clés ne sont jamais enregistrées ici.

Seul un administrateur central du site peut s'en servir (vérification par la
base Supabase, comme pour le studio).

## Installer sur Render (le plus simple)

1. Créer un compte sur https://render.com avec le compte GitHub qui gère le site.
2. **New › Web Service**, choisir le dépôt `jesuiskcciste.com`.
3. Réglages :
   - **Root Directory** : `relais`
   - **Language / Runtime** : `Docker`
   - **Instance type** : *Starter* (toujours allumé ; l'offre gratuite s'endort et coupe les directs)
4. **Environment Variables** :
   - `SUPABASE_URL` = `https://anawpwprqvzxgzcpqqwu.supabase.co`
   - `SUPABASE_ANON_KEY` = la clé publique du site (celle de `wrangler.jsonc`)
5. **Create Web Service**. Render donne une adresse du type
   `https://relais-kcc.onrender.com`.
6. Dans le studio, onglet Direct › « Adresse du relais », coller la même adresse en
   remplaçant `https://` par `wss://` : `wss://relais-kcc.onrender.com`.

Vérification : ouvrir `https://…onrender.com/sante` doit afficher `{"ok":true}`.

## Sur un autre hébergeur

N'importe quel serveur avec Docker convient (2 processeurs conseillés pour
l'encodage 720p). `docker build -t relais-kcc . && docker run -p 8080:8080 -e
SUPABASE_URL=… -e SUPABASE_ANON_KEY=… relais-kcc`, derrière une adresse en https
(WebSocket sécurisé `wss://`).

## Essai sans YouTube

`RELAY_TEST_OUTPUT=/tmp/essai.flv node server.mjs` : la vidéo reçue est écrite
dans ce fichier au lieu d'être envoyée (jeton `test` accepté).
