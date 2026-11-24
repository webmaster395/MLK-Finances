-- Témoignages (précision de l'utilisateur, novembre 2026) : deux sortes.
--   1. NOTE PRIVÉE : visible par son auteur seulement. Les administrateurs ne la voient pas
--      (seule une personne ayant accès directement à la base de données le pourrait).
--   2. PARTAGÉ : envoyé à l'équipe, qui le valide avant qu'il soit visible par tous les participants.
-- L'auteur peut passer d'une note privée au partage (et revenir en arrière tant que ce n'est pas validé).
-- La précision « pour un pasteur » s'écrit dans le texte : il n'y a plus de case « confidentiel ».

alter table public.temoignages
  add column partage boolean not null default false;

-- Reprise : déjà affichés, créés par l'équipe ou non confidentiels = partagés ; confidentiels = notes privées
update public.temoignages
set partage = (valide or auteur_id is null or not confidentiel);

alter table public.temoignages
  drop column confidentiel,
  -- Une note privée ne peut jamais être affichée
  add constraint temoignages_prive_jamais_affiche check (partage or not valide);

-- Les administrateurs voient et gèrent les témoignages partagés (et les leurs), jamais les notes privées des autres
drop policy "admin : tout sur les témoignages" on public.temoignages;
create policy "admin : gérer les témoignages partagés" on public.temoignages
  for all to authenticated
  using ((select private.est_admin()) and (partage or auteur_id = (select auth.uid())))
  with check ((select private.est_admin()) and (partage or auteur_id = (select auth.uid())));
