-- Témoignages (demande de l'équipe MLK, novembre 2026) :
--   1. seul le PRÉNOM est affiché (plus l'initiale du nom de famille) ;
--   2. deux sortes de témoignages : ceux que l'équipe choisit de montrer AU PUBLIC (page publique /avis)
--      et les autres, visibles seulement par les personnes inscrites (une fois validés).
-- Le public (visiteur non connecté) ne voit que : validé ET choisi par l'équipe, et seulement quatre colonnes
-- (jamais l'auteur ni la photo).

-- 1. Colonne « visible par le public » : décidée par l'équipe seulement (voir le déclencheur plus bas)
alter table public.temoignages
  add column visible_public boolean not null default false;

-- 2. Les noms déjà enregistrés perdent leur initiale finale (« Léa M. » devient « Léa »)
update public.temoignages
set nom_affiche = regexp_replace(nom_affiche, '\s+\S\.$', '')
where nom_affiche ~ '\s+\S\.$';

-- 3. Le déclencheur impose maintenant le prénom seul, et empêche un participant de se rendre « public »
create or replace function private.temoignage_du_participant() returns trigger
language plpgsql
set search_path = ''
as $$
declare
  p record;
begin
  -- L'équipe (admin) et les opérations hors site gardent la main sur tous les champs
  if current_user not in ('anon', 'authenticated') or private.est_admin() then
    return new;
  end if;
  select prenom into p from public.profils where id = (select auth.uid());
  new.auteur_id := (select auth.uid());
  new.nom_affiche := left(coalesce(nullif(trim(p.prenom), ''), 'Participant'), 100);
  new.valide := false;
  new.visible_public := false;
  new.photo_path := case when tg_op = 'UPDATE' then old.photo_path else null end;
  return new;
end;
$$;

-- 4. Le public : lecture des témoignages validés ET choisis, quatre colonnes seulement
grant select (id, nom_affiche, texte, cree_le, valide, visible_public) on table public.temoignages to anon;

create policy "témoignages : le public voit les validés choisis par l'équipe" on public.temoignages
  for select to anon
  using (valide and visible_public);
