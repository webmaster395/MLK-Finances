-- Témoignages (demande de l'utilisateur, 26 novembre 2026) : la personne peut indiquer la session concernée.
-- Facultatif : vide = « En général (tout le parcours) ». Supprimer une session conserve le témoignage.
-- Aucun droit ne change : les règles de lecture et d'écriture des témoignages restent les mêmes.

alter table public.temoignages
  add column session_id uuid references public.sessions (id) on delete set null;

create index temoignages_session_idx on public.temoignages (session_id);
