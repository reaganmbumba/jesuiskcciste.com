-- Plateau en mode brouillon : chaque invité est rattaché au lien (jeton) de l'animateur qui l'a invité.
-- Ainsi, un animateur qui enregistre une émission sans la diffuser a ses propres invités,
-- sans mélanger ceux d'un direct en cours (ni lui couper la parole en fermant son plateau).

alter table public.radio_appels add column if not exists plateau_jeton text;

create or replace function public.radio_plateau_rejoindre(p_jeton text, p_nom text, p_session text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_siege smallint; v_id uuid;
begin
  if not exists (select 1 from radio_plateau where jeton = coalesce(p_jeton, '') and expire_le > now()) then
    raise exception 'Ce lien de plateau n''est plus valable. Demandez un nouveau lien à l''animateur.';
  end if;
  if p_nom is null or length(trim(p_nom)) not between 1 and 60 then raise exception 'Nom invalide.'; end if;
  if p_session is null or p_session !~ '^[A-Za-z0-9_-]{8,128}$' then raise exception 'Connexion invalide.'; end if;
  update radio_appels set statut = 'termine', modifie_le = now()
   where genre = 'plateau' and statut = 'antenne' and cree_le < now() - interval '6 hours';
  -- 3 places par plateau (par lien), pas pour toute la radio
  select s into v_siege from generate_series(1, 3) s
   where s not in (select siege from radio_appels where genre = 'plateau' and statut = 'antenne' and siege is not null
                    and coalesce(plateau_jeton, '') = p_jeton)
   order by s limit 1;
  if v_siege is null then raise exception 'Le plateau est complet (3 invités). Réessayez plus tard.'; end if;
  insert into radio_appels (nom, session_id, statut, genre, siege, plateau_jeton) values (trim(p_nom), p_session, 'antenne', 'plateau', v_siege, p_jeton)
  returning id into v_id;
  return jsonb_build_object('id', v_id, 'siege', v_siege);
end $$;

-- Fermer son plateau ne raccroche que ses propres invités.
create or replace function public.radio_plateau_fermer()
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.can_host_radio() then return; end if;
  update radio_appels set statut = 'termine', modifie_le = now()
   where genre = 'plateau' and statut = 'antenne'
     and (plateau_jeton is null or plateau_jeton in (select jeton from radio_plateau where cree_par = auth.uid()));
  delete from radio_plateau where cree_par = auth.uid();
end $$;

revoke all on function public.radio_plateau_fermer() from public;
revoke all on function public.radio_plateau_rejoindre(text, text, text) from public;
grant execute on function public.radio_plateau_fermer() to authenticated;
grant execute on function public.radio_plateau_rejoindre(text, text, text) to anon, authenticated;
