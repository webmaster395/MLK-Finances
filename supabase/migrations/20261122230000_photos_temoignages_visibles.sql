-- Espace admin lot 7 — photos des témoignages visibles par les participants.
-- Une personne connectée peut lire la photo d'un témoignage SEULEMENT si ce témoignage est validé
-- (la règle sur la table « temoignages » ne lui montre déjà que les validés). Les photos de profil
-- (dossier de chaque personne) et les photos de témoignages non validés restent invisibles.

create policy "photos : lire celles des témoignages validés" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'photos'
    and exists (
      select 1 from public.temoignages t
      where t.valide and t.photo_path = storage.objects.name
    )
  );
