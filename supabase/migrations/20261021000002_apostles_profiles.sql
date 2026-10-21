-- =====================================================================
-- Révérends Apôtres, suite :
--  * statut « non précisé » (la liste officielle 1958-2024 ne dit pas
--    toujours si un apôtre est en vie) ;
--  * date de consécration, pour la page de profil de chaque apôtre ;
--  * les visiteurs peuvent proposer des informations (paroisse, date de
--    consécration, années, présentation), pas seulement une photo. Tout
--    reste invisible jusqu'à la validation par l'administration.
-- =====================================================================

alter table public.apostles drop constraint if exists apostles_status_check;
alter table public.apostles add constraint apostles_status_check check (status in ('living', 'deceased', 'unknown'));
alter table public.apostles alter column status set default 'unknown';
alter table public.apostles add column if not exists consecration_date text check (char_length(consecration_date) <= 60);

alter table public.apostle_photo_submissions alter column photo_path drop not null;
alter table public.apostle_photo_submissions add column if not exists proposed_place text check (char_length(proposed_place) <= 160);
alter table public.apostle_photo_submissions add column if not exists proposed_consecration text check (char_length(proposed_consecration) <= 60);
alter table public.apostle_photo_submissions add column if not exists proposed_birth_year int check (proposed_birth_year between 1850 and 2100);
alter table public.apostle_photo_submissions add column if not exists proposed_death_year int check (proposed_death_year between 1850 and 2100);
alter table public.apostle_photo_submissions add column if not exists proposed_bio text check (char_length(proposed_bio) <= 2000);
alter table public.apostle_photo_submissions drop constraint if exists apostle_submissions_not_empty;
alter table public.apostle_photo_submissions add constraint apostle_submissions_not_empty check (
  photo_path is not null or proposed_place is not null or proposed_consecration is not null
  or proposed_birth_year is not null or proposed_death_year is not null or proposed_bio is not null);
