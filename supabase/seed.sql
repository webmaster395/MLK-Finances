-- Données de démonstration — TOUT EST MARQUÉ « test ».
-- Chargées par `supabase db reset` en local. À ne JAMAIS charger en production.
--
-- Comptes de test (adresses en example.com : elles n'existent pas) :
--   participant.test1@example.com   mot de passe : Test-Mlk-2026!   (groupe test 1)
--   participant.test2@example.com   mot de passe : Test-Mlk-2026!   (groupe test 2)
--   admin.test@example.com          mot de passe : Test-Mlk-2026!   (administrateur, sans groupe)
-- Remarque : la création directe des comptes ci-dessous est la méthode habituelle pour les
-- données de démo en local ; elle n'a pu être vérifiée que sur une base simulée (voir PLAN.md).

-- ---------------------------------------------------------------
-- Comptes (le profil est créé automatiquement par le déclencheur)
-- ---------------------------------------------------------------
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new
) values
  ('00000000-0000-0000-0000-000000000000', '11111111-1111-4111-8111-111111111111',
   'authenticated', 'authenticated', 'participant.test1@example.com',
   extensions.crypt('Test-Mlk-2026!', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"prenom":"Alex","nom":"Test Un","civilite":"monsieur","tranche_age":"26_35"}',
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '22222222-2222-4222-8222-222222222222',
   'authenticated', 'authenticated', 'participant.test2@example.com',
   extensions.crypt('Test-Mlk-2026!', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"prenom":"Sam","nom":"Test Deux","civilite":"madame","tranche_age":"18_25"}',
   now(), now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', '99999999-9999-4999-8999-999999999999',
   'authenticated', 'authenticated', 'admin.test@example.com',
   extensions.crypt('Test-Mlk-2026!', extensions.gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"prenom":"Admin","nom":"Test"}',
   now(), now(), '', '', '', '');

insert into auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) values
  (gen_random_uuid(), '11111111-1111-4111-8111-111111111111',
   '{"sub":"11111111-1111-4111-8111-111111111111","email":"participant.test1@example.com"}',
   'email', '11111111-1111-4111-8111-111111111111', now(), now(), now()),
  (gen_random_uuid(), '22222222-2222-4222-8222-222222222222',
   '{"sub":"22222222-2222-4222-8222-222222222222","email":"participant.test2@example.com"}',
   'email', '22222222-2222-4222-8222-222222222222', now(), now(), now()),
  (gen_random_uuid(), '99999999-9999-4999-8999-999999999999',
   '{"sub":"99999999-9999-4999-8999-999999999999","email":"admin.test@example.com"}',
   'email', '99999999-9999-4999-8999-999999999999', now(), now(), now());

-- Premier administrateur (nommé hors du site : maintenance directe dans la base)
update public.profils set role = 'admin' where id = '99999999-9999-4999-8999-999999999999';

-- ---------------------------------------------------------------
-- Groupes et inscriptions
-- ---------------------------------------------------------------
insert into public.groupes (id, nom, debut, fin) values
  ('aaaaaaaa-0000-4000-8000-000000000001', '[test] Groupe 1 — Parcours Finances', current_date - 30, current_date + 150),
  ('aaaaaaaa-0000-4000-8000-000000000002', '[test] Groupe 2 — Parcours Finances', current_date - 10, current_date + 170);

insert into public.inscriptions (participant_id, groupe_id) values
  ('11111111-1111-4111-8111-111111111111', 'aaaaaaaa-0000-4000-8000-000000000001'),
  ('22222222-2222-4222-8222-222222222222', 'aaaaaaaa-0000-4000-8000-000000000002');

-- ---------------------------------------------------------------
-- Cours
-- ---------------------------------------------------------------
insert into public.cours (id, groupe_id, titre, description, objectifs, ordre, publie) values
  ('cccccccc-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000001',
   '[test] Module 1 — Comprendre son budget',
   'Revenus, dépenses, objectifs : poser les bases de sa gestion au quotidien.',
   array['Lister ses revenus et ses dépenses', 'Distinguer l''essentiel du superflu', 'Fixer un objectif mensuel'], 1, true),
  ('cccccccc-0000-4000-8000-000000000002', 'aaaaaaaa-0000-4000-8000-000000000001',
   '[test] Module 2 — Épargner efficacement',
   'Fonds d''urgence et épargne régulière.',
   array['Constituer un fonds d''urgence', 'Mettre en place une épargne automatique'], 2, true),
  ('cccccccc-0000-4000-8000-000000000003', 'aaaaaaaa-0000-4000-8000-000000000001',
   '[test] Module 3 — Crédit et endettement',
   'Lire un contrat de crédit et éviter les pièges.',
   array['Comprendre un taux et un coût total', 'Repérer les clauses à surveiller'], 3, true),
  ('cccccccc-0000-4000-8000-000000000004', 'aaaaaaaa-0000-4000-8000-000000000001',
   '[test] Module 4 — Brouillon non publié',
   'Ce cours n''est pas publié : un participant ne doit pas le voir.',
   '{}', 4, false),
  ('cccccccc-0000-4000-8000-000000000011', 'aaaaaaaa-0000-4000-8000-000000000002',
   '[test] Module A — Groupe 2 uniquement',
   'Ce cours appartient à l''autre groupe : le participant du groupe 1 ne doit pas le voir.',
   array['Objectif réservé au groupe 2'], 1, true);

-- ---------------------------------------------------------------
-- Sessions (dates relatives à aujourd'hui) — une journée complète (« J+5 ») pour l'accueil,
-- plus d'autres dates pour le calendrier. Heures données en UTC (Paris = UTC+1 en hiver).
-- ---------------------------------------------------------------
insert into public.sessions (id, groupe_id, cours_id, intervenants, titre, debut, fin, lieu, description) values
  ('55555555-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000001',
   'cccccccc-0000-4000-8000-000000000001',
   array['Claire Martin'], '[test] Session 1 — Atelier budget',
   date_trunc('day', now()) - interval '14 days' + interval '9 hours',
   date_trunc('day', now()) - interval '14 days' + interval '12 hours', 'Salle test A', 'Séance passée.'),
  -- Journée J+5 : accueil, formation, atelier pratique
  ('55555555-0000-4000-8000-000000000012', 'aaaaaaaa-0000-4000-8000-000000000001',
   null,
   '{}', '[test] Accueil des participants',
   date_trunc('day', now()) + interval '5 days' + interval '8 hours 10 minutes',
   date_trunc('day', now()) + interval '5 days' + interval '8 hours 30 minutes', 'Salle test A', 'Café et émargement.'),
  ('55555555-0000-4000-8000-000000000002', 'aaaaaaaa-0000-4000-8000-000000000001',
   'cccccccc-0000-4000-8000-000000000002',
   array['Claire Martin', 'Karim Benali'], '[test] Session 2 — Atelier épargne',
   date_trunc('day', now()) + interval '5 days' + interval '8 hours 30 minutes',
   date_trunc('day', now()) + interval '5 days' + interval '10 hours', 'Salle test A', 'Prochaine séance.'),
  ('55555555-0000-4000-8000-000000000013', 'aaaaaaaa-0000-4000-8000-000000000001',
   'cccccccc-0000-4000-8000-000000000001',
   array['Karim Benali'], '[test] Atelier pratique — Mon budget',
   date_trunc('day', now()) + interval '5 days' + interval '10 hours 30 minutes',
   date_trunc('day', now()) + interval '5 days' + interval '12 hours', 'Salle test A', 'Mise en pratique en petits groupes.'),
  -- Autre journée (J+19) : formation et évaluation
  ('55555555-0000-4000-8000-000000000003', 'aaaaaaaa-0000-4000-8000-000000000001',
   'cccccccc-0000-4000-8000-000000000003',
   array['Sophie Laurent'], '[test] Session 3 — Atelier crédit',
   date_trunc('day', now()) + interval '19 days' + interval '8 hours 30 minutes',
   date_trunc('day', now()) + interval '19 days' + interval '11 hours', 'En ligne', 'Séance à distance.'),
  ('55555555-0000-4000-8000-000000000014', 'aaaaaaaa-0000-4000-8000-000000000001',
   'cccccccc-0000-4000-8000-000000000003',
   array['Sophie Laurent'], '[test] Évaluation — Crédit et endettement',
   date_trunc('day', now()) + interval '19 days' + interval '13 hours',
   date_trunc('day', now()) + interval '19 days' + interval '14 hours', 'En ligne', 'Questionnaire de fin de module.'),
  ('55555555-0000-4000-8000-000000000011', 'aaaaaaaa-0000-4000-8000-000000000002',
   'cccccccc-0000-4000-8000-000000000011',
   array['Intervenant du groupe 2'], '[test] Session A — Groupe 2 uniquement',
   date_trunc('day', now()) + interval '7 days' + interval '9 hours',
   date_trunc('day', now()) + interval '7 days' + interval '12 hours', 'Salle test B', 'Session de l''autre groupe.');

-- ---------------------------------------------------------------
-- Messages de l'équipe
-- ---------------------------------------------------------------
insert into public.annonces (groupe_id, titre, message, publie, cree_le) values
  ('aaaaaaaa-0000-4000-8000-000000000001', '[test] Prochaine journée',
   E'Bonjour à tous,\nPensez à apporter votre ordinateur et vos relevés de budget du mois. L''accueil commence 10 minutes avant la première séance.',
   true, now() - interval '1 day'),
  (null, '[test] Message pour tous', 'Ancien message général (plus ancien : ne doit pas passer devant celui du groupe).', true, now() - interval '9 days'),
  ('aaaaaaaa-0000-4000-8000-000000000001', '[test] Brouillon non publié', 'Ne doit pas être visible.', false, now()),
  ('aaaaaaaa-0000-4000-8000-000000000002', '[test] Message du groupe 2', 'Réservé au groupe 2 : ne doit pas être visible pour le groupe 1.', true, now());

-- ---------------------------------------------------------------
-- Ressources
-- ---------------------------------------------------------------
insert into public.ressources (id, cours_id, titre, type, url, storage_path) values
  ('66666666-0000-4000-8000-000000000001', 'cccccccc-0000-4000-8000-000000000001',
   '[test] Modèle de budget (lien)', 'lien', 'https://example.com/modele-budget', null),
  ('66666666-0000-4000-8000-000000000002', 'cccccccc-0000-4000-8000-000000000002',
   '[test] Guide de l''épargne (fichier)', 'fichier', null, 'test/guide-epargne.pdf'),
  ('66666666-0000-4000-8000-000000000011', 'cccccccc-0000-4000-8000-000000000011',
   '[test] Ressource du groupe 2', 'lien', 'https://example.com/groupe-2', null);

-- ---------------------------------------------------------------
-- Devoirs et un rendu
-- ---------------------------------------------------------------
insert into public.devoirs (id, cours_id, titre, consigne, echeance) values
  ('dddddddd-0000-4000-8000-000000000001', 'cccccccc-0000-4000-8000-000000000001',
   '[test] Établir mon budget mensuel', 'Déposez votre budget du mois (PDF ou tableur).',
   date_trunc('day', now()) + interval '2 days' + interval '18 hours'),
  ('dddddddd-0000-4000-8000-000000000002', 'cccccccc-0000-4000-8000-000000000002',
   '[test] Fixer mon objectif d''épargne', 'Décrivez votre objectif et votre plan.',
   date_trunc('day', now()) + interval '12 days' + interval '18 hours'),
  ('dddddddd-0000-4000-8000-000000000003', 'cccccccc-0000-4000-8000-000000000003',
   '[test] Analyser une offre de crédit (en retard)', 'Devoir dont la date limite est dépassée.',
   date_trunc('day', now()) - interval '3 days' + interval '18 hours'),
  ('dddddddd-0000-4000-8000-000000000011', 'cccccccc-0000-4000-8000-000000000011',
   '[test] Devoir du groupe 2', 'Réservé au groupe 2.', date_trunc('day', now()) + interval '9 days');

insert into public.rendus (devoir_id, participant_id, fichier_path, nom_fichier) values
  ('dddddddd-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111',
   '11111111-1111-4111-8111-111111111111/dddddddd-0000-4000-8000-000000000003/credit-test.pdf', 'credit-test.pdf');

-- ---------------------------------------------------------------
-- Témoignages
-- ---------------------------------------------------------------
insert into public.temoignages (nom_affiche, texte, valide) values
  ('[test] Participant 1', 'Ce parcours m''a aidé à y voir clair dans mon budget.', true),
  ('[test] Participante 2', 'Des cours simples et concrets, j''ai enfin un plan d''épargne.', true),
  ('[test] Participant 3', 'Un accompagnement motivant du début à la fin.', true),
  ('[test] Participant 4', 'Témoignage en attente de validation : ne doit pas être visible.', false);
