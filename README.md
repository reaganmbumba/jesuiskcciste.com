# JE SUIS KCCiste — La communauté KCCiste

> « Un seul peuple. Une même communauté. »
> Se connecter, apprendre, servir et faire vivre notre communauté partout dans le monde.

Plateforme web communautaire de l’Église Bon Nouveau Message (EBNM/KCC) : membres, paroisses, sections, Académie KCC (formations, examens, certificats), agenda, KCC Music, bibliothèque, solidarité et administration par rôles.

**Stack :** React 18, TypeScript, Vite 5, Tailwind CSS 3, React Router 6, Lucide, React Hook Form et Zod, Supabase (PostgreSQL, Auth, Storage).

---

## Démarrage rapide

```bash
npm install
npm run dev          # http://localhost:5173
```

Sans fichier `.env.local`, l’application démarre en **mode démonstration** :
- un bandeau jaune le signale sur chaque page ;
- toutes les données sont **fictives** et marquées « Exemple » ;
- rien n’est enregistré : les modifications restent dans l’onglet ;
- la page **Connexion** propose des comptes de démonstration par rôle (membre, administrateur central, responsable de paroisse, formateur, gestionnaire de solidarité, responsable musical, modérateur).

| Script | Rôle |
|---|---|
| `npm run dev` | serveur de développement |
| `npm run build` | vérification TypeScript puis build de production (`dist/`) |
| `npm run preview` | aperçu du build |
| `npm run typecheck` | vérification des types |
| `npm test` | tests unitaires et d’intégration (Vitest) |
| `supabase/tests/run-local.sh` | migrations et tests de sécurité SQL sur un PostgreSQL local |

## Brancher Supabase (production)

1. Créer un projet sur [supabase.com](https://supabase.com) (région proche des utilisateurs, par exemple Europe de l’Ouest).
2. Appliquer les migrations, avec la CLI (`supabase link` puis `supabase db push`) ou en exécutant dans l’ordre dans l’éditeur SQL :
   `supabase/migrations/20261012000001_schema.sql`, `…0002_security.sql`, `…0003_storage.sql`, puis `supabase/seed.sql`.
3. Copier `.env.example` en `.env.local` et renseigner `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` (Settings › API). **Jamais la clé `service_role`.**
4. Dans Authentication › URL Configuration : `Site URL` = votre domaine ; ajouter `https://votre-domaine/connexion` et `https://votre-domaine/mot-de-passe-oublie?etape=nouveau` aux redirections autorisées.
5. Activer « Confirm email » (Authentication › Providers › Email) et configurer un SMTP (Authentication › SMTP) pour les e-mails de confirmation et de réinitialisation.
6. Créer votre compte via le site, puis vous nommer administrateur central (requête en fin de `supabase/seed.sql`).
7. Depuis Administration › Paramètres : logo officiel, photo d’accueil, contacts, réseaux sociaux et présentation officielle.

Dès que les variables sont présentes, le mode démonstration disparaît et toutes les lectures et écritures passent par Supabase, sous contrôle des politiques RLS.

## Organisation du code

```
src/
  components/   ui/ (boutons, formulaires, modales, toasts…), layout/ (navigation, pied de page), cards/, common/
  layouts/      PublicLayout, DashboardLayout (espace membre et administration), AuthShell
  pages/        public/, community/, events/, academy/, music/, solidarity/, auth/, member/, admin/
  features/     auth/, academy/ (correction), community/ (confidentialité), solidarity/ (finances, paiements),
                events/, music/ (lecteur), administration/ (CrudTable générique)
  services/     accès aux données : Supabase ou démonstration (repository.ts, index.ts, storage.ts, demo/)
  lib/          supabase.ts (client « anon »), permissions.ts (matrice des rôles pour l’affichage)
  i18n/         fr (défaut), ln, pt, en, textes centralisés
  hooks/ utils/ types/ config/ routes/ test/
supabase/
  migrations/   schéma, sécurité (RLS, RPC, audit), stockage
  seed.sql      rôles et permissions (aucune donnée de personne)
  tests/        tests de sécurité SQL exécutables
docs/           DEPLOIEMENT.md, TESTS.md, SECURITE.md
```

## Pages (34)

Accueil · À propos · Communauté · Annuaire · Profil membre · Paroisses · Détail paroisse · Sections · Actualités · Détail d’annonce · Agenda (liste et calendrier) · Détail d’événement · Académie · Catalogue · Détail de formation · Examen · Vérification de certificat · KCC Music · Artistes et chorales · Bibliothèque · Solidarité · Projets · Détail de projet · Connexion · Inscription (3 étapes) · Mot de passe oublié · Espace membre (tableau de bord, profil, paroisse, formations, activités, certificats, contributions, notifications, paramètres) · Administration (vue d’ensemble, membres, paroisses et sections, annonces, événements, formations, certificats, musique et médias, projets, contributions et dépenses, journaux d’audit, paramètres) · Confidentialité et conditions · Accès refusé · 404.

## État du projet

### Fonctionne aujourd’hui
- Interface complète et responsive (téléphone, tablette, ordinateur), navigation, recherche globale (Ctrl+K), menu mobile et barre de navigation inférieure.
- Mode démonstration complet : parcours membre, examen avec correction et certificat vérifiable, inscriptions aux formations et événements (simulées), déclaration de contribution, administration avec recherche, filtres, pagination, création, modification, confirmation avant suppression, export CSV et journal.
- Code d’authentification Supabase (inscription progressive, confirmation d’e-mail, connexion, déconnexion, réinitialisation, sessions, comptes en attente ou suspendus) et routes protégées.
- Base de données : 33 tables, RLS forcée sur toutes, vue d’annuaire respectant la confidentialité, correction des examens et émission des certificats côté serveur, audit par triggers, anonymisation de compte. **Testé sur PostgreSQL 16** (voir docs/TESTS.md).
- Multilingue : français par défaut, anglais et portugais pour l’interface principale, lingala initial à faire valider ; dates, nombres et devises localisés.

### Nécessite une configuration externe (action humaine)
- Projet Supabase, variables d’environnement, SMTP, URL de redirection (voir ci-dessus).
- Contenus officiels : logo autorisé, photographie communautaire (`public/images/hero-communaute.jpg`), présentation de l’Église, contacts, réseaux sociaux, paroisses, responsables, supports de formation validés, titres musicaux avec autorisation de diffusion.
- Hébergement et nom de domaine (docs/DEPLOIEMENT.md).
- Paiements mobiles M-Pesa, Orange Money, Airtel Money : contrats marchands, clés API et Edge Functions. **Le paiement en ligne est affiché comme indisponible.**
- Envoi d’e-mails et de notifications push.

### Reste à faire (prochaines étapes proposées)
1. Éditeur visuel des modules, leçons et questions d’examen dans l’espace formateur (les tables et la sécurité existent déjà).
2. Téléversement de fichiers depuis l’administration (affiches, PDF, audio, justificatifs) vers les buckets déjà définis.
3. Edge Functions : paiements (initiation, webhook, vérification), envoi d’e-mails de notification, suppression définitive des comptes.
4. Inscription aux événements avec formulaire personnalisé et liste des inscrits pour les responsables.
5. Traductions complètes de toutes les pages et validation du lingala.
6. Service worker et manifeste complet pour une application installable (PWA). Le manifeste minimal est présent ; aucun mode hors connexion n’est revendiqué.
7. Tests de bout en bout (Playwright) contre un projet Supabase de préproduction.

## Principes respectés
- Aucune statistique, aucun dirigeant, aucun communiqué ni contenu doctrinal inventé : champs administrables et données de démonstration explicitement marquées.
- Aucune clé secrète dans le frontend ; la sécurité repose sur la base (RLS et fonctions `SECURITY DEFINER`), pas sur l’interface.
- Une déclaration ou une capture d’écran ne confirme jamais un paiement.
- Pas de croix décorative ; emplacement prévu pour le logo officiel.
