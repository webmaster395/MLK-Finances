-- Retrait des groupes (décision de l'utilisateur, 23/11/2026) : il n'y a qu'une promotion à la fois.
-- Le libellé « Promotion 2026–2027 » est désormais écrit dans le code (src/lib/promotion.ts).
-- Accès choisi par l'utilisateur : toute personne inscrite (e-mail confirmé) voit le contenu PUBLIÉ.
-- Le contenu non publié reste invisible pour les participants ; les admins gardent leurs droits.

-- 1. Données de test propres au « groupe 2 » (elles deviendraient visibles par tous)
delete from public.devoirs where id = 'dddddddd-0000-4000-8000-000000000011';
delete from public.ressources where id = '66666666-0000-4000-8000-000000000011';
delete from public.sessions where id = '55555555-0000-4000-8000-000000000011';
delete from public.cours where id = 'cccccccc-0000-4000-8000-000000000011';
delete from public.annonces where groupe_id = 'aaaaaaaa-0000-4000-8000-000000000002';

-- 2. Règles de lecture des participants : « publié », sans condition de groupe
drop policy "cours : publiés de mon groupe" on public.cours;
create policy "cours : publiés" on public.cours
  for select to authenticated
  using (publie);

drop policy "sessions : publiées de mon groupe" on public.sessions;
create policy "sessions : publiées" on public.sessions
  for select to authenticated
  using (publie);

drop policy "annonces : publiées, pour tous ou pour mon groupe" on public.annonces;
create policy "annonces : publiées" on public.annonces
  for select to authenticated
  using (publie);

-- 3. Colonnes et tables des groupes (leurs index et règles partent avec elles)
alter table public.cours drop column groupe_id;
alter table public.sessions drop column groupe_id;
alter table public.annonces drop column groupe_id;
-- Les deux tables partent ensemble : une règle de « groupes » lit « inscriptions »
drop table public.inscriptions, public.groupes;
