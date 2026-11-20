-- Simulation minimale de Supabase pour tester les migrations sans Docker (base PGlite).
-- Sur un vrai Supabase, tout ceci existe déjà : ce fichier ne sert QU'AUX TESTS.

create role anon nologin;
create role authenticated nologin;

create schema extensions;
create extension pgcrypto schema extensions;

-- Schéma d'authentification (colonnes utilisées par la migration et le seed)
create schema auth;
create table auth.users (
  instance_id uuid,
  id uuid primary key,
  aud text,
  role text,
  email text,
  encrypted_password text,
  email_confirmed_at timestamptz,
  raw_app_meta_data jsonb,
  raw_user_meta_data jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  confirmation_token text,
  recovery_token text,
  email_change text,
  email_change_token_new text
);
create table auth.identities (
  id uuid primary key,
  user_id uuid references auth.users (id) on delete cascade,
  identity_data jsonb,
  provider text,
  provider_id text,
  last_sign_in_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
);
create function auth.uid() returns uuid
language sql stable
as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to authenticated;
grant execute on function auth.uid() to authenticated;

-- Stockage
create schema storage;
create table storage.buckets (
  id text primary key,
  name text not null,
  public boolean default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);
create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name text,
  owner uuid,
  created_at timestamptz default now()
);
alter table storage.objects enable row level security;
create function storage.foldername(name text) returns text[]
language plpgsql immutable
as $$
declare _parts text[];
begin
  _parts := string_to_array(name, '/');
  return _parts[1:array_length(_parts, 1) - 1];
end;
$$;
-- Comme sur Supabase : droits larges sur la table, c'est la RLS qui filtre
grant usage on schema storage to authenticated, anon;
grant select, insert, update, delete on storage.objects to authenticated;
grant select on storage.buckets to authenticated;
grant execute on function storage.foldername(text) to authenticated, anon;
