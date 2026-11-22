-- Espace administrateur — lot 0 : fondations de sécurité
-- Principe : aucune clé « service_role ». Un administrateur écrit avec SA session, et ce sont
-- des règles RLS réservées aux admins qui l'autorisent. Le rôle est lu dans la base
-- (profils.role), jamais dans ce que la personne envoie.
-- Décisions (22/11/2026) : pas de compte formateur ; un admin peut nommer un autre admin ;
-- un admin ne peut pas changer son propre rôle (il reste donc toujours au moins un admin).

-- ---------------------------------------------------------------
-- 1. Fonction « est_admin » (schéma privé, jamais exposé par l'API)
-- ---------------------------------------------------------------
create function private.est_admin() returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profils p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

-- Les règles RLS appellent cette fonction au nom de la personne connectée : elle doit pouvoir
-- entrer dans le schéma privé et appeler CETTE fonction seulement. Le schéma n'est pas exposé
-- par l'API (seul « public » l'est), et la fonction ne révèle que le statut de la personne elle-même.
revoke execute on all functions in schema private from public, anon, authenticated;
alter default privileges in schema private revoke execute on functions from public;
grant usage on schema private to authenticated;
grant execute on function private.est_admin() to authenticated;

-- ---------------------------------------------------------------
-- 2. Le rôle ne change que par un autre administrateur
-- ---------------------------------------------------------------
create function private.proteger_role() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Les règles s'appliquent aux personnes connectées par le site. La maintenance faite
  -- directement dans Supabase (nomination du premier admin) n'est pas concernée.
  if new.role is distinct from old.role and current_user in ('anon', 'authenticated') then
    if not private.est_admin() then
      raise exception 'permission denied: seul un administrateur peut changer un rôle'
        using errcode = '42501';
    end if;
    if new.id = (select auth.uid()) then
      raise exception 'permission denied: un administrateur ne peut pas changer son propre rôle'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

revoke execute on function private.proteger_role() from public, anon, authenticated;

create trigger profils_proteger_role
  before update on public.profils
  for each row execute function private.proteger_role();

-- ---------------------------------------------------------------
-- 3. Droits sur les tables
-- Les participants n'ont toujours AUCUNE règle d'écriture sur le contenu : la RLS les bloque.
-- ---------------------------------------------------------------
grant insert, update, delete on table
  public.groupes, public.inscriptions, public.cours, public.sessions, public.ressources,
  public.devoirs, public.temoignages, public.rubriques, public.annonces
to authenticated;

-- Profils : le rôle devient modifiable (protégé par le déclencheur ci-dessus)
grant update (role) on table public.profils to authenticated;

-- Rendus : le statut devient modifiable (un participant reste bloqué par sa règle « statut = depose »)
grant update (statut) on table public.rendus to authenticated;

-- ---------------------------------------------------------------
-- 4. Règles RLS réservées aux administrateurs
-- ---------------------------------------------------------------
create policy "admin : tout sur les groupes" on public.groupes
  for all to authenticated
  using ((select private.est_admin())) with check ((select private.est_admin()));

create policy "admin : tout sur les inscriptions" on public.inscriptions
  for all to authenticated
  using ((select private.est_admin())) with check ((select private.est_admin()));

create policy "admin : tout sur les cours" on public.cours
  for all to authenticated
  using ((select private.est_admin())) with check ((select private.est_admin()));

create policy "admin : tout sur les séances" on public.sessions
  for all to authenticated
  using ((select private.est_admin())) with check ((select private.est_admin()));

create policy "admin : tout sur les ressources" on public.ressources
  for all to authenticated
  using ((select private.est_admin())) with check ((select private.est_admin()));

create policy "admin : tout sur les devoirs" on public.devoirs
  for all to authenticated
  using ((select private.est_admin())) with check ((select private.est_admin()));

create policy "admin : tout sur les témoignages" on public.temoignages
  for all to authenticated
  using ((select private.est_admin())) with check ((select private.est_admin()));

create policy "admin : tout sur les rubriques" on public.rubriques
  for all to authenticated
  using ((select private.est_admin())) with check ((select private.est_admin()));

create policy "admin : tout sur les messages" on public.annonces
  for all to authenticated
  using ((select private.est_admin())) with check ((select private.est_admin()));

-- Profils : lire et modifier tous les profils (pas de suppression : elle passe par le compte)
create policy "admin : lire les profils" on public.profils
  for select to authenticated
  using ((select private.est_admin()));

create policy "admin : modifier les profils" on public.profils
  for update to authenticated
  using ((select private.est_admin())) with check ((select private.est_admin()));

-- Rendus : lire tous les dépôts et les marquer corrigés (pas de suppression)
create policy "admin : lire les rendus" on public.rendus
  for select to authenticated
  using ((select private.est_admin()));

create policy "admin : corriger les rendus" on public.rendus
  for update to authenticated
  using ((select private.est_admin())) with check ((select private.est_admin()));

-- ---------------------------------------------------------------
-- 5. Stockage
-- ---------------------------------------------------------------
-- Fichiers des ressources (supports de cours) : gérés par les admins
create policy "admin : tout sur les fichiers de ressources" on storage.objects
  for all to authenticated
  using (bucket_id = 'ressources' and (select private.est_admin()))
  with check (bucket_id = 'ressources' and (select private.est_admin()));

-- Devoirs rendus : lecture pour la correction (ni remplacement ni suppression)
create policy "admin : lire les fichiers rendus" on storage.objects
  for select to authenticated
  using (bucket_id = 'rendus' and (select private.est_admin()));

-- Photos : lecture de toutes les photos ; écriture seulement dans le dossier « temoignages »
create policy "admin : lire les photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'photos' and (select private.est_admin()));

create policy "admin : gérer les photos de témoignages" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'photos' and (storage.foldername(name))[1] = 'temoignages'
    and (select private.est_admin())
  )
  with check (
    bucket_id = 'photos' and (storage.foldername(name))[1] = 'temoignages'
    and (select private.est_admin())
  );
