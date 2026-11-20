-- Lot 2 — Stockage de fichiers (Supabase Storage)
-- Les trois « seaux » sont privés. Les fichiers sont envoyés depuis le navigateur ;
-- le téléchargement se fait par lien signé de courte durée (60 secondes).
--   rendus     : {id du participant}/{id du devoir}/{nom du fichier}
--   photos     : {id du participant}/{nom du fichier}
--   ressources : chemin libre, relié à une ligne de la table « ressources »

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('rendus', 'rendus', false, 10485760,
    array['application/pdf', 'image/jpeg', 'image/png', 'application/zip',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain']),
  ('photos', 'photos', false, 2097152,
    array['image/jpeg', 'image/png', 'image/webp']),
  ('ressources', 'ressources', false, 52428800, null)
on conflict (id) do nothing;

-- Rendus : je ne touche qu'à mon dossier, et seulement pour un devoir que je peux voir
create policy "rendus : lire mes fichiers" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'rendus'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "rendus : envoyer mes fichiers" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'rendus'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (storage.foldername(name))[2] in (select d.id::text from public.devoirs d)
  );

create policy "rendus : remplacer mes fichiers" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'rendus'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'rendus'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (storage.foldername(name))[2] in (select d.id::text from public.devoirs d)
  );

-- Photos de profil : dans mon dossier
create policy "photos : lire mes photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "photos : envoyer mes photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "photos : remplacer mes photos" on storage.objects
  for update to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "photos : supprimer mes photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Ressources : lecture d'un fichier seulement s'il est relié à une ressource que je peux voir
create policy "ressources : lire les fichiers de mes cours" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'ressources'
    and exists (
      select 1 from public.ressources r where r.storage_path = storage.objects.name
    )
  );
