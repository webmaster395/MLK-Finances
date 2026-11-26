-- Données personnelles (demande de l'utilisateur, 26 novembre 2026) :
-- un administrateur ne peut modifier NI la civilité, NI le prénom, NI le nom, NI aucune autre donnée
-- d'une autre personne. Seul son rôle (participant / administrateur) peut être changé par un administrateur.
-- La personne elle-même (et l'équipe directement dans Supabase) garde la possibilité de corriger ces données.

create function private.proteger_donnees_personnelles() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Depuis le site (personne connectée), sur la fiche de quelqu'un d'autre : seul « role » peut changer
  if current_user in ('anon', 'authenticated')
     and old.id is distinct from (select auth.uid())
     and (to_jsonb(new) - 'role' - 'modifie_le') is distinct from (to_jsonb(old) - 'role' - 'modifie_le') then
    raise exception 'Les données personnelles ne sont modifiables que par la personne concernée'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke execute on function private.proteger_donnees_personnelles() from public, anon, authenticated;

create trigger profils_proteger_donnees
  before update on public.profils
  for each row execute function private.proteger_donnees_personnelles();
