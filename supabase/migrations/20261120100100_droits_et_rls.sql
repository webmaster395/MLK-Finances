-- Lot 2 — Droits explicites et sécurité par ligne (RLS)
-- Principe : rien pour « anon ». Un participant connecté ne voit que son profil, ses dépôts
-- et le contenu PUBLIÉ de son groupe. Aucune écriture sur le contenu pédagogique en phase 1.

-- 1. Sécurité par ligne activée partout
alter table public.profils enable row level security;
alter table public.groupes enable row level security;
alter table public.inscriptions enable row level security;
alter table public.cours enable row level security;
alter table public.sessions enable row level security;
alter table public.ressources enable row level security;
alter table public.devoirs enable row level security;
alter table public.rendus enable row level security;
alter table public.temoignages enable row level security;

-- 2. On retire tous les droits par défaut, puis on accorde uniquement le nécessaire
revoke all on table
  public.profils, public.groupes, public.inscriptions, public.cours, public.sessions,
  public.ressources, public.devoirs, public.rendus, public.temoignages
from anon, authenticated;

grant select on table
  public.groupes, public.inscriptions, public.cours, public.sessions,
  public.ressources, public.devoirs, public.temoignages
to authenticated;

-- Profil : lecture, et modification de quelques colonnes seulement (jamais le rôle ni l'identifiant)
grant select on table public.profils to authenticated;
grant update (prenom, nom, civilite, photo_path) on table public.profils to authenticated;

-- Rendus : lecture, dépôt et remplacement du fichier (jamais le statut)
grant select on table public.rendus to authenticated;
grant insert (devoir_id, participant_id, fichier_path, nom_fichier) on table public.rendus to authenticated;
grant update (fichier_path, nom_fichier) on table public.rendus to authenticated;

-- 3. Politiques

-- Profils : seulement le sien
create policy "profils : lire le sien" on public.profils
  for select to authenticated
  using (id = (select auth.uid()));

create policy "profils : modifier le sien" on public.profils
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Inscriptions et groupes : seulement les siens
create policy "inscriptions : lire les siennes" on public.inscriptions
  for select to authenticated
  using (participant_id = (select auth.uid()));

create policy "groupes : lire ceux où je suis inscrit" on public.groupes
  for select to authenticated
  using (id in (
    select i.groupe_id from public.inscriptions i where i.participant_id = (select auth.uid())
  ));

-- Contenu pédagogique : publié et dans mon groupe
create policy "cours : publiés de mon groupe" on public.cours
  for select to authenticated
  using (
    publie
    and groupe_id in (
      select i.groupe_id from public.inscriptions i where i.participant_id = (select auth.uid())
    )
  );

create policy "sessions : publiées de mon groupe" on public.sessions
  for select to authenticated
  using (
    publie
    and groupe_id in (
      select i.groupe_id from public.inscriptions i where i.participant_id = (select auth.uid())
    )
  );

-- Ressources et devoirs : héritent de la visibilité du cours (la sous-requête applique la RLS de « cours »)
create policy "ressources : publiées d'un cours visible" on public.ressources
  for select to authenticated
  using (publie and cours_id in (select c.id from public.cours c));

create policy "devoirs : publiés d'un cours visible" on public.devoirs
  for select to authenticated
  using (publie and cours_id in (select c.id from public.cours c));

-- Rendus : seulement les siens, sur un devoir que je peux voir
create policy "rendus : lire les siens" on public.rendus
  for select to authenticated
  using (participant_id = (select auth.uid()));

create policy "rendus : déposer le sien" on public.rendus
  for insert to authenticated
  with check (
    participant_id = (select auth.uid())
    and devoir_id in (select d.id from public.devoirs d)
  );

create policy "rendus : remplacer le sien tant qu'il n'est pas corrigé" on public.rendus
  for update to authenticated
  using (participant_id = (select auth.uid()) and statut = 'depose')
  with check (participant_id = (select auth.uid()) and statut = 'depose');

-- Témoignages : seulement ceux qui sont validés
create policy "témoignages : lire les validés" on public.temoignages
  for select to authenticated
  using (valide);
