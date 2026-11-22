-- Témoignages écrits par les participants (demande de l'utilisateur, 23/11/2026).
-- Un participant peut proposer UN témoignage ; il reste « à valider » jusqu'à ce qu'un admin le publie.
-- Tant qu'il n'est pas validé, son auteur peut le modifier ou le retirer. Le nom affiché est calculé
-- par la base à partir du profil (« Prénom N. ») : personne ne peut témoigner au nom d'un autre.

alter table public.temoignages
  add column auteur_id uuid references public.profils (id) on delete cascade;

-- Un seul témoignage par participant (ceux saisis par l'équipe n'ont pas d'auteur)
create unique index temoignages_un_par_auteur on public.temoignages (auteur_id) where auteur_id is not null;

-- Pour un participant, la base impose l'auteur, le nom affiché, « à valider » et l'absence de photo.
-- Un admin n'est pas concerné (il saisit, corrige et valide librement).
-- Exécutée avec les droits de la personne connectée (pas « security definer ») : c'est ce qui permet
-- de savoir qu'un participant écrit. Elle ne lit que le profil de cette personne.
create function private.temoignage_du_participant() returns trigger
language plpgsql
set search_path = ''
as $$
declare
  p record;
begin
  if current_user not in ('anon', 'authenticated') or private.est_admin() then
    return new;
  end if;
  select prenom, nom into p from public.profils where id = (select auth.uid());
  new.auteur_id := (select auth.uid());
  new.nom_affiche := left(
    coalesce(nullif(trim(trim(p.prenom) || ' ' || coalesce(left(trim(p.nom), 1) || '.', '')), ''), 'Participant'),
    100);
  new.valide := false;
  new.photo_path := case when tg_op = 'UPDATE' then old.photo_path else null end;
  return new;
end;
$$;

revoke execute on function private.temoignage_du_participant() from public, anon, authenticated;

create trigger temoignages_du_participant
  before insert or update on public.temoignages
  for each row execute function private.temoignage_du_participant();

-- Règles RLS du participant (s'ajoutent à « lire les validés » et aux règles admin)
create policy "témoignages : lire le sien" on public.temoignages
  for select to authenticated
  using (auteur_id = (select auth.uid()));

create policy "témoignages : proposer le sien" on public.temoignages
  for insert to authenticated
  with check (auteur_id = (select auth.uid()) and not valide);

create policy "témoignages : modifier le sien tant qu'il n'est pas validé" on public.temoignages
  for update to authenticated
  using (auteur_id = (select auth.uid()) and not valide)
  with check (auteur_id = (select auth.uid()) and not valide);

create policy "témoignages : retirer le sien tant qu'il n'est pas validé" on public.temoignages
  for delete to authenticated
  using (auteur_id = (select auth.uid()) and not valide);
