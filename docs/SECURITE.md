# Modèle de sécurité

**Principe :** le navigateur n’utilise que la clé publique `anon`. Toute autorisation est vérifiée dans PostgreSQL par les politiques RLS et des fonctions `SECURITY DEFINER`. Les contrôles de l’interface (`src/lib/permissions.ts`) ne servent qu’à l’affichage.

| Domaine | Règle appliquée en base |
|---|---|
| Profils | lecture de son profil ; responsables : leur périmètre ; champs statut, fonction et e-mail protégés par trigger |
| Annuaire | vue `directory_entries` : membres actifs seulement, champs filtrés selon `privacy` |
| Rôles | attribution par l’administrateur central ; un responsable de paroisse ne nomme que des chefs de section de sa paroisse (`assign_role`) |
| Annonces | lecture selon l’audience ; publication par modération ; épinglage réservé à l’administrateur central |
| Événements | gestion limitée à la paroisse ou section du responsable |
| Formations | formateur limité à ses formations ; publication validée par l’administration |
| Examens | `question_options.is_correct` illisible ; `get_quiz_public` sans réponses ; `submit_quiz_attempt` corrige, limite les tentatives et émet le certificat |
| Certificats | aucune insertion directe ; vérification publique par code ; révocation journalisée |
| Solidarité | contribution visible par son auteur et les gestionnaires ; déclaration uniquement ; confirmation via `confirm_contribution` (espèces ou virement, référence obligatoire) ou webhook opérateur ; montants recalculés par trigger |
| Stockage | buckets séparés : public, avatars (dossier personnel), documents membres, documents privés par paroisse, supports de cours, musique, justificatifs financiers |
| Audit | triggers sur les tables sensibles ; lecture réservée ; aucune écriture directe |
| Comptes | `request_account_deletion` anonymise ; contributions confirmées conservées de façon anonyme |

Les mots de passe sont gérés par Supabase Auth (hachage bcrypt). Aucun code PIN ni identifiant de portefeuille n’est stocké.
