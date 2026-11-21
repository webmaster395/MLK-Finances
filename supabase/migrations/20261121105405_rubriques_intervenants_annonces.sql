-- Accueil « journée de formation » et calendrier des séances (inspirés de Ministry School)
--  * rubriques  : types de séances affichés en couleur (Accueil, Formation, Atelier pratique, Évaluation)
--  * sessions   : une rubrique et des intervenants (noms) par séance
--  * annonces   : messages de l'équipe, lus par les participants (écrits en phase 1 depuis Supabase)

-- ---------------------------------------------------------------
-- Rubriques
-- ---------------------------------------------------------------
create table public.rubriques (
  id uuid primary key default gen_random_uuid(),
  nom text not null unique check (char_length(nom) between 1 and 60),
  couleur text not null check (couleur ~ '^#[0-9a-fA-F]{6}$'),
  ordre integer not null default 0
);

insert into public.rubriques (nom, couleur, ordre) values
  ('Accueil', '#6b6560', 1),
  ('Formation', '#d634ba', 2),
  ('Atelier pratique', '#e95609', 3),
  ('Évaluation', '#5b6fd6', 4);

alter table public.sessions
  add column rubrique_id uuid references public.rubriques (id) on delete set null,
  add column intervenants text[] not null default '{}' check (cardinality(intervenants) <= 10);
create index sessions_rubrique_idx on public.sessions (rubrique_id);

-- ---------------------------------------------------------------
-- Messages de l'équipe
-- ---------------------------------------------------------------
create table public.annonces (
  id uuid primary key default gen_random_uuid(),
  -- null = message pour tous les groupes
  groupe_id uuid references public.groupes (id) on delete cascade,
  titre text not null default '' check (char_length(titre) <= 150),
  message text not null check (char_length(message) between 1 and 2000),
  publie boolean not null default true,
  cree_le timestamptz not null default now()
);
create index annonces_groupe_idx on public.annonces (groupe_id, cree_le desc);

-- ---------------------------------------------------------------
-- Droits et sécurité par ligne
-- ---------------------------------------------------------------
alter table public.rubriques enable row level security;
alter table public.annonces enable row level security;

revoke all on table public.rubriques, public.annonces from anon, authenticated;
grant select on table public.rubriques, public.annonces to authenticated;

create policy "rubriques : lecture par les personnes connectées" on public.rubriques
  for select to authenticated
  using (true);

create policy "annonces : publiées, pour tous ou pour mon groupe" on public.annonces
  for select to authenticated
  using (
    publie
    and (
      groupe_id is null
      or groupe_id in (
        select i.groupe_id from public.inscriptions i where i.participant_id = (select auth.uid())
      )
    )
  );
