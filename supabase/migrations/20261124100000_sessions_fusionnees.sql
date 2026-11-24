-- Cours et séances fusionnés : une SESSION porte tout son contenu (demande de l'équipe MLK, novembre 2026).
--   - plus d'intervenants ni de lieu : les sessions ont toujours lieu en visioconférence (lien_visio) ;
--   - à la place : travaux à faire avant, travaux à faire après, matériel à prévoir ;
--   - les documents (PDF ou liens, ex. Canva) sont rattachés directement à la session ;
--   - les devoirs ne se rendent plus : ils deviennent les « travaux » de la session, et les rendus disparaissent.
-- Le contenu existant est repris (description et objectifs du cours, consignes des devoirs) avant suppression.

-- ---------------------------------------------------------------
-- 1. Nouvelles colonnes des sessions
-- ---------------------------------------------------------------
alter table public.sessions
  add column objectifs text[] not null default '{}' check (cardinality(objectifs) <= 20),
  add column lien_visio text check (lien_visio is null or (lien_visio ~ '^https://' and char_length(lien_visio) <= 2000)),
  add column travaux_avant text not null default '' check (char_length(travaux_avant) <= 5000),
  add column travaux_apres text not null default '' check (char_length(travaux_apres) <= 5000),
  add column materiel text not null default '' check (char_length(materiel) <= 5000);

-- 2. Reprise du contenu du cours lié (description, objectifs)
update public.sessions s
set
  description = case
    when c.description = '' then s.description
    when s.description = '' then c.description
    else c.description || E'\n\n' || s.description
  end,
  objectifs = c.objectifs
from public.cours c
where c.id = s.cours_id;

-- 3. Les devoirs du cours deviennent les « travaux à faire après » de la session
update public.sessions s
set travaux_apres = t.texte
from (
  select
    d.cours_id,
    string_agg(
      d.titre || case when d.consigne <> '' then E'\n' || d.consigne else '' end,
      E'\n\n' order by d.echeance nulls last, d.cree_le
    ) as texte
  from public.devoirs d
  group by d.cours_id
) t
where t.cours_id = s.cours_id;

-- ---------------------------------------------------------------
-- 4. Documents : rattachés à la session (la première session du cours)
-- ---------------------------------------------------------------
alter table public.ressources
  add column session_id uuid references public.sessions (id) on delete cascade;

update public.ressources r
set session_id = (
  select s.id from public.sessions s where s.cours_id = r.cours_id order by s.debut limit 1
);

-- Un document d'un cours sans aucune session ne pourrait plus être affiché
delete from public.ressources where session_id is null;

alter table public.ressources alter column session_id set not null;
create index ressources_session_idx on public.ressources (session_id);

drop policy "ressources : publiées d'un cours visible" on public.ressources;
create policy "ressources : publiées d'une session visible" on public.ressources
  for select to authenticated
  using (publie and session_id in (select s.id from public.sessions s));

alter table public.ressources drop column cours_id;

-- ---------------------------------------------------------------
-- 5. Plus de dépôt de devoirs : rendus et devoirs supprimés
-- ---------------------------------------------------------------
drop policy "rendus : lire mes fichiers" on storage.objects;
drop policy "rendus : envoyer mes fichiers" on storage.objects;
drop policy "rendus : remplacer mes fichiers" on storage.objects;
drop policy "admin : lire les fichiers rendus" on storage.objects;
-- Le seau « rendus » reste en place mais plus personne n'y a accès (à vider depuis le tableau de bord Supabase).

drop table public.rendus;
drop table public.devoirs;
drop function private.maj_depose_le();
drop type public.statut_rendu;

-- ---------------------------------------------------------------
-- 6. Sessions : plus de cours, de lieu ni d'intervenants
-- ---------------------------------------------------------------
alter table public.sessions
  drop column cours_id,
  drop column lieu,
  drop column intervenants;

drop table public.cours;
