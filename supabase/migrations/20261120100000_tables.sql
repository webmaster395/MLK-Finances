-- Lot 2 — Tables de la phase 1 (espace participant)
-- Les droits d'accès et la sécurité par ligne (RLS) sont dans la migration suivante.

-- Schéma privé : fonctions internes, jamais exposées par l'API.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.role_profil as enum ('participant', 'admin');
create type public.statut_rendu as enum ('depose', 'corrige');

-- ---------------------------------------------------------------
-- Profils : une ligne par compte de connexion
-- ---------------------------------------------------------------
create table public.profils (
  id uuid primary key references auth.users (id) on delete cascade,
  prenom text not null default '' check (char_length(prenom) <= 100),
  nom text not null default '' check (char_length(nom) <= 100),
  civilite text check (civilite in ('madame', 'monsieur', 'autre')),
  photo_path text,
  role public.role_profil not null default 'participant',
  cree_le timestamptz not null default now(),
  modifie_le timestamptz not null default now()
);

-- Groupes : la « promotion » ou le parcours suivi
create table public.groupes (
  id uuid primary key default gen_random_uuid(),
  nom text not null check (char_length(nom) between 1 and 150),
  debut date,
  fin date,
  cree_le timestamptz not null default now(),
  check (fin is null or debut is null or fin >= debut)
);

create table public.inscriptions (
  participant_id uuid not null references public.profils (id) on delete cascade,
  groupe_id uuid not null references public.groupes (id) on delete cascade,
  cree_le timestamptz not null default now(),
  primary key (participant_id, groupe_id)
);
create index inscriptions_groupe_idx on public.inscriptions (groupe_id);

-- Cours : rattachés à un groupe (décision du lot 2 : un cours = un groupe)
create table public.cours (
  id uuid primary key default gen_random_uuid(),
  groupe_id uuid not null references public.groupes (id) on delete cascade,
  titre text not null check (char_length(titre) between 1 and 200),
  description text not null default '',
  objectifs text[] not null default '{}',
  ordre integer not null default 0,
  publie boolean not null default false,
  cree_le timestamptz not null default now()
);
create index cours_groupe_idx on public.cours (groupe_id);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  groupe_id uuid not null references public.groupes (id) on delete cascade,
  cours_id uuid references public.cours (id) on delete set null,
  titre text not null check (char_length(titre) between 1 and 200),
  debut timestamptz not null,
  fin timestamptz,
  lieu text,
  description text not null default '',
  publie boolean not null default true,
  cree_le timestamptz not null default now(),
  check (fin is null or fin >= debut)
);
create index sessions_groupe_idx on public.sessions (groupe_id, debut);
create index sessions_cours_idx on public.sessions (cours_id);

create table public.ressources (
  id uuid primary key default gen_random_uuid(),
  cours_id uuid not null references public.cours (id) on delete cascade,
  titre text not null check (char_length(titre) between 1 and 200),
  type text not null check (type in ('fichier', 'lien')),
  url text check (url is null or url ~ '^https?://'),
  storage_path text,
  publie boolean not null default true,
  cree_le timestamptz not null default now(),
  check (
    (type = 'lien' and url is not null)
    or (type = 'fichier' and storage_path is not null)
  )
);
create index ressources_cours_idx on public.ressources (cours_id);

create table public.devoirs (
  id uuid primary key default gen_random_uuid(),
  cours_id uuid not null references public.cours (id) on delete cascade,
  titre text not null check (char_length(titre) between 1 and 200),
  consigne text not null default '',
  echeance timestamptz,
  publie boolean not null default true,
  cree_le timestamptz not null default now()
);
create index devoirs_cours_idx on public.devoirs (cours_id);

-- Rendus : un dépôt par participant et par devoir (il peut le remplacer tant qu'il n'est pas corrigé)
create table public.rendus (
  id uuid primary key default gen_random_uuid(),
  devoir_id uuid not null references public.devoirs (id) on delete cascade,
  participant_id uuid not null references public.profils (id) on delete cascade,
  fichier_path text not null,
  nom_fichier text,
  statut public.statut_rendu not null default 'depose',
  depose_le timestamptz not null default now(),
  unique (devoir_id, participant_id)
);
create index rendus_participant_idx on public.rendus (participant_id);

create table public.temoignages (
  id uuid primary key default gen_random_uuid(),
  nom_affiche text not null check (char_length(nom_affiche) between 1 and 100),
  texte text not null check (char_length(texte) between 1 and 1000),
  photo_path text,
  valide boolean not null default false,
  cree_le timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Fonctions internes (schéma private)
-- ---------------------------------------------------------------

-- Met à jour la date de modification du profil
create function private.maj_modifie_le() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.modifie_le := now();
  return new;
end;
$$;

create trigger profils_modifie_le
  before update on public.profils
  for each row execute function private.maj_modifie_le();

-- Remet la date de dépôt à jour quand le fichier d'un rendu est remplacé
create function private.maj_depose_le() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.fichier_path is distinct from old.fichier_path then
    new.depose_le := now();
  end if;
  return new;
end;
$$;

create trigger rendus_depose_le
  before update on public.rendus
  for each row execute function private.maj_depose_le();

-- Crée le profil à l'inscription. Le rôle n'est JAMAIS lu depuis les données envoyées
-- par la personne : tout nouveau compte est « participant ».
create function private.creer_profil() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profils (id, prenom, nom)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'prenom', ''), 100),
    left(coalesce(new.raw_user_meta_data ->> 'nom', ''), 100)
  );
  return new;
end;
$$;

revoke all on function private.creer_profil() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.creer_profil();
