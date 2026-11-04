-- =====================================================================
-- Direct diffusé par le studio du site (sans YouTube) : identifiant de la
-- session du relais vidéo (Cloudflare Realtime) que les spectateurs de la
-- page Direct reçoivent. Vide = direct YouTube.
-- =====================================================================
alter table public.livestreams add column if not exists rtc_session text
  check (rtc_session is null or rtc_session ~ '^[A-Za-z0-9_-]{8,128}$');
alter table public.livestreams add column if not exists ended_at timestamptz;
