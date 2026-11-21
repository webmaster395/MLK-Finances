-- Inscription : civilité (Madame / Monsieur) et tranche d'âge, à des fins de statistiques.
-- Valeurs libres interdites. Les colonnes restent facultatives en base (comptes créés par un
-- administrateur ou par le seed) ; l'obligation est appliquée par le formulaire d'inscription.

-- Civilité : seulement madame ou monsieur
update public.profils set civilite = null where civilite = 'autre';
alter table public.profils drop constraint if exists profils_civilite_check;
alter table public.profils
  add constraint profils_civilite_check check (civilite in ('madame', 'monsieur'));

-- Tranche d'âge
alter table public.profils
  add column tranche_age text
  check (tranche_age in ('moins_18', '18_25', '26_35', '36_45', '46_55', '56_plus'));

-- Le participant peut corriger sa tranche d'âge (comme sa civilité) ; jamais son rôle
grant update (tranche_age) on table public.profils to authenticated;

-- Création du profil à l'inscription : reprend prénom, nom, civilité et tranche d'âge.
-- Toute valeur inattendue est ignorée (null). Le rôle n'est JAMAIS lu : tout compte est « participant ».
create or replace function private.creer_profil() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  civilite_saisie text := lower(trim(coalesce(new.raw_user_meta_data ->> 'civilite', '')));
  tranche_saisie text := trim(coalesce(new.raw_user_meta_data ->> 'tranche_age', ''));
begin
  insert into public.profils (id, prenom, nom, civilite, tranche_age)
  values (
    new.id,
    left(trim(coalesce(new.raw_user_meta_data ->> 'prenom', '')), 100),
    left(trim(coalesce(new.raw_user_meta_data ->> 'nom', '')), 100),
    case when civilite_saisie in ('madame', 'monsieur') then civilite_saisie else null end,
    case when tranche_saisie in ('moins_18', '18_25', '26_35', '36_45', '46_55', '56_plus')
         then tranche_saisie else null end
  );
  return new;
end;
$$;
