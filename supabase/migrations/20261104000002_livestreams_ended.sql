-- =====================================================================
-- Fin réelle d'un direct, posée par le bouton « Terminer le direct » du
-- studio : la page Direct passe aussitôt en rediffusion, sans attendre la
-- fin prévue. Vide = le direct suit l'horaire programmé.
-- =====================================================================
alter table public.livestreams add column if not exists ended_at timestamptz;
