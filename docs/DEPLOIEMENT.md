# Déploiement de JE SUIS KCCiste

## 1. Supabase (production)
1. Créer un projet **dédié à la production** (un autre pour la préproduction est recommandé).
2. Appliquer les migrations : `supabase link --project-ref <ref>` puis `supabase db push`, puis exécuter `supabase/seed.sql`.
3. Auth :
   - Providers › Email : activer « Confirm email ».
   - URL Configuration : Site URL = `https://votre-domaine`, Redirect URLs = `https://votre-domaine/connexion`, `https://votre-domaine/mot-de-passe-oublie?etape=nouveau`.
   - SMTP personnalisé (Brevo, Postmark, SES…) : obligatoire au-delà de quelques e-mails par heure.
   - Rate limits : conserver les limites par défaut (protection contre les abus).
4. Storage : les buckets sont créés par la migration 3. Vérifier qu’ils apparaissent, et que seuls `public-assets` et `avatars` sont publics.
5. Nommer le premier administrateur central (requête en fin de `seed.sql`).
6. **Sauvegardes** : activer les sauvegardes quotidiennes (offre Pro) et, idéalement, le Point-in-Time Recovery. Tester une restauration sur la préproduction une fois par trimestre.

## 2. Frontend
Le build est un site statique (`npm run build` → `dist/`).

Hébergeurs possibles : Vercel (fichier `vercel.json` fourni), Netlify (`public/_redirects` fourni), Cloudflare Pages.

Variables d’environnement à définir chez l’hébergeur :

| Variable | Valeur |
|---|---|
| `VITE_SUPABASE_URL` | URL du projet |
| `VITE_SUPABASE_ANON_KEY` | clé publique anon |
| `VITE_SITE_URL` | `https://votre-domaine` |

Commande de build : `npm run build`. Dossier publié : `dist`.

## 3. Domaine
1. Ajouter le domaine chez l’hébergeur et créer les enregistrements DNS indiqués (CNAME ou A).
2. HTTPS est fourni automatiquement.
3. Mettre à jour `Site URL` et les Redirect URLs dans Supabase.

## 4. Sécurité de mise en production (liste de contrôle)
- [ ] Aucune clé `service_role` dans le dépôt ni chez l’hébergeur frontend.
- [ ] `select tablename from pg_tables where schemaname='public' and not rowsecurity;` ne renvoie aucune ligne.
- [ ] Tests SQL (`supabase/tests/run-local.sh`) verts sur la préproduction.
- [ ] Comptes administrateurs protégés par des mots de passe forts ; MFA activée pour l’équipe technique Supabase.
- [ ] Logo, photographie et textes officiels validés par les responsables.
- [ ] Mentions légales complétées (éditeur, hébergeur, contact).
- [ ] Sauvegardes activées et restauration testée.

## 5. Paiements mobiles (phase future)
Voir `src/features/solidarity/payments.ts`. Les secrets marchands sont stockés dans les secrets Supabase (`supabase secrets set`) et utilisés uniquement par des Edge Functions. La confirmation se fait par webhook signé, puis par une revérification auprès de l’opérateur.

## 6. Cloudflare Pages en ligne de commande (jesuiskcciste.com)
Avec `CLOUDFLARE_API_TOKEN` (droit « Cloudflare Pages : Modifier ») et `CLOUDFLARE_ACCOUNT_ID` définis :
```bash
npx wrangler@3 pages project create kcc-connect --production-branch main   # une seule fois
npm run deploy
```
Puis, dans Cloudflare : Workers & Pages › kcc-connect › Domaines personnalisés › ajouter `jesuiskcciste.com` (et `www.jesuiskcciste.com`).
Les en-têtes de sécurité sont dans `public/_headers` et la réécriture SPA dans `public/_redirects`.

## 7. Application Android (.apk et .aab)

L'application Android (Capacitor) embarque le site construit. Elle est construite par GitHub Actions (`.github/workflows/android.yml`), car le SDK Android n'est pas installé localement.

1. Poussez le dépôt sur GitHub (`reaganmbumba/jesuiskcciste.com`).
2. Onglet **Actions**, workflow « Application Android », **Run workflow**. Le workflow crée une version GitHub contenant `kcc-connect.apk` et `kcc-connect.aab`.
3. Le site redirige `/app/android.apk` et `/app/android.aab` vers la dernière version GitHub (voir `public/_redirects`).

Signature pour Google Play : sans clé, l'APK est signé en mode debug (installable à la main) et l'AAB n'est pas accepté par Google Play. Pour signer, créez une clé (`keytool -genkeypair -v -keystore kcc.jks -alias kcc -keyalg RSA -keysize 2048 -validity 10000`), gardez-la en lieu sûr, puis ajoutez dans GitHub (Settings, Secrets and variables, Actions) les secrets `KCC_KEYSTORE_BASE64` (contenu de `base64 -w0 kcc.jks`), `KCC_KEYSTORE_PASSWORD`, `KCC_KEY_ALIAS` et `KCC_KEY_PASSWORD`. Ne versionnez jamais la clé.

Pour que l'application utilise les vraies données, ajoutez les variables (pas des secrets) `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans Actions, onglet Variables.
