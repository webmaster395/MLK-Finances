-- Lot 8 — Un devoir corrigé ne peut plus être remplacé.
-- La table « rendus » l'interdisait déjà (statut = 'corrige'), mais le FICHIER pouvait encore
-- être écrasé via le stockage. On ferme cette porte : la politique de remplacement vérifie
-- aussi que le rendu correspondant n'est pas corrigé.

drop policy "rendus : remplacer mes fichiers" on storage.objects;

create policy "rendus : remplacer mes fichiers" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'rendus'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and not exists (
      select 1 from public.rendus r
      where r.participant_id = (select auth.uid())
        and r.devoir_id::text = (storage.foldername(name))[2]
        and r.statut = 'corrige'
    )
  )
  with check (
    bucket_id = 'rendus'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (storage.foldername(name))[2] in (select d.id::text from public.devoirs d)
  );
