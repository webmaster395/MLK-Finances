-- Témoignages, correction après retour de l'utilisateur (novembre 2026) :
--   1. plus AUCUN accès sans compte (la page publique est retirée) : « public » veut dire « les participants » ;
--   2. chaque participant peut écrire PLUSIEURS témoignages et garde son historique ;
--   3. à l'écriture, il indique s'il souhaite le partager ou s'il est confidentiel (équipe / pasteur) ;
--      c'est une indication : l'administrateur décide ce qui est affiché (colonne « valide »).

-- 1. Retrait de l'accès public
drop policy "témoignages : le public voit les validés choisis par l'équipe" on public.temoignages;
revoke select (id, nom_affiche, texte, cree_le, valide, visible_public) on table public.temoignages from anon;
alter table public.temoignages drop column visible_public;

-- 2. Plusieurs témoignages par personne
drop index public.temoignages_un_par_auteur;
create index temoignages_auteur_idx on public.temoignages (auteur_id, cree_le desc);

-- 3. Confidentialité demandée par l'auteur
alter table public.temoignages
  add column confidentiel boolean not null default false;

-- Le déclencheur impose toujours auteur, prénom, « à valider » et photo ; « confidentiel » vient de la personne.
-- La date d'écriture ne peut pas être choisie ni modifiée par un participant.
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
  new.cree_le := case when tg_op = 'UPDATE' then old.cree_le else now() end;
  new.photo_path := case when tg_op = 'UPDATE' then old.photo_path else null end;
  return new;
end;
$$;
