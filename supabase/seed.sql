-- Données de démonstration — TOUT EST MARQUÉ « test ».
-- Chargées par `supabase db reset` en local. À ne JAMAIS charger en production.
--
-- Comptes de test (adresses en example.com : elles n'existent pas) :
--   participant.test1@example.com   mot de passe : Test-Mlk-2026!
--   participant.test2@example.com   mot de passe : Test-Mlk-2026!
--   admin.test@example.com          mot de passe : Test-Mlk-2026!   (administrateur)
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
-- Cours
-- Contenu de démonstration présentable (fictif) : à remplacer par le vrai contenu avant la mise en ligne.
-- ---------------------------------------------------------------
insert into public.cours (id, titre, description, objectifs, ordre, publie) values
  ('cccccccc-0000-4000-8000-000000000001',
   'Module 1 — Comprendre son budget',
   'Revenus, dépenses, objectifs : poser les bases de sa gestion au quotidien.',
   array['Lister ses revenus et ses dépenses', 'Distinguer l''essentiel du superflu', 'Fixer un objectif mensuel'], 1, true),
  ('cccccccc-0000-4000-8000-000000000002',
   'Module 2 — Épargner efficacement',
   'Fonds d''urgence et épargne régulière.',
   array['Constituer un fonds d''urgence', 'Mettre en place une épargne automatique'], 2, true),
  ('cccccccc-0000-4000-8000-000000000003',
   'Module 3 — Crédit et endettement',
   'Lire un contrat de crédit et éviter les pièges.',
   array['Comprendre un taux et un coût total', 'Repérer les clauses à surveiller'], 3, true),
  ('cccccccc-0000-4000-8000-000000000004',
   'Module 4 — Investir et préparer l''avenir',
   'Module en préparation : il sera publié prochainement.',
   '{}', 4, false);

-- ---------------------------------------------------------------
-- Séances (dates relatives à aujourd'hui, heures de Paris) : une séance passée, une journée complète
-- (« J+5 », pour l'accueil), une autre journée (« J+19 »).
-- ---------------------------------------------------------------
insert into public.sessions (id, cours_id, intervenants, titre, debut, fin, lieu, description) values
  ('55555555-0000-4000-8000-000000000001',
   'cccccccc-0000-4000-8000-000000000001',
   array['Claire Martin'], 'Séance 1 — Atelier budget',
   ((date_trunc('day', now() at time zone 'Europe/Paris') - interval '14 days' + interval '9 hours') at time zone 'Europe/Paris'),
   ((date_trunc('day', now() at time zone 'Europe/Paris') - interval '14 days' + interval '12 hours') at time zone 'Europe/Paris'), 'Salle A', 'Première séance : on pose les bases du budget et on repère les postes de dépenses.'),
  -- Journée J+5 : accueil, formation, atelier pratique
  ('55555555-0000-4000-8000-000000000012',
   null,
   '{}', 'Accueil des participants',
   ((date_trunc('day', now() at time zone 'Europe/Paris') + interval '5 days' + interval '8 hours 10 minutes') at time zone 'Europe/Paris'),
   ((date_trunc('day', now() at time zone 'Europe/Paris') + interval '5 days' + interval '8 hours 30 minutes') at time zone 'Europe/Paris'), 'Salle A', 'Café, émargement et présentation de la journée.'),
  ('55555555-0000-4000-8000-000000000002',
   'cccccccc-0000-4000-8000-000000000002',
   array['Claire Martin', 'Karim Benali'], 'Séance 2 — Épargner efficacement',
   ((date_trunc('day', now() at time zone 'Europe/Paris') + interval '5 days' + interval '8 hours 30 minutes') at time zone 'Europe/Paris'),
   ((date_trunc('day', now() at time zone 'Europe/Paris') + interval '5 days' + interval '10 hours') at time zone 'Europe/Paris'), 'Salle A', 'Fonds d''urgence, épargne automatique et choix des supports d''épargne.'),
  ('55555555-0000-4000-8000-000000000013',
   'cccccccc-0000-4000-8000-000000000001',
   array['Karim Benali'], 'Atelier pratique — Mon budget',
   ((date_trunc('day', now() at time zone 'Europe/Paris') + interval '5 days' + interval '10 hours 30 minutes') at time zone 'Europe/Paris'),
   ((date_trunc('day', now() at time zone 'Europe/Paris') + interval '5 days' + interval '12 hours') at time zone 'Europe/Paris'), 'Salle A', 'Mise en pratique en petits groupes : chacun construit son budget du mois.'),
  -- Autre journée (J+19) : formation et évaluation
  ('55555555-0000-4000-8000-000000000003',
   'cccccccc-0000-4000-8000-000000000003',
   array['Sophie Laurent'], 'Séance 3 — Crédit et endettement',
   ((date_trunc('day', now() at time zone 'Europe/Paris') + interval '19 days' + interval '9 hours') at time zone 'Europe/Paris'),
   ((date_trunc('day', now() at time zone 'Europe/Paris') + interval '19 days' + interval '11 hours 30 minutes') at time zone 'Europe/Paris'), 'En ligne', 'Séance à distance : lire une offre de crédit et comparer les coûts.'),
  ('55555555-0000-4000-8000-000000000014',
   'cccccccc-0000-4000-8000-000000000003',
   array['Sophie Laurent'], 'Évaluation — Crédit et endettement',
   ((date_trunc('day', now() at time zone 'Europe/Paris') + interval '19 days' + interval '14 hours') at time zone 'Europe/Paris'),
   ((date_trunc('day', now() at time zone 'Europe/Paris') + interval '19 days' + interval '15 hours') at time zone 'Europe/Paris'), 'En ligne', 'Questionnaire de fin de module.');

-- ---------------------------------------------------------------
-- Messages de l'équipe
-- ---------------------------------------------------------------
insert into public.annonces (titre, message, publie, cree_le) values
  ('Prochaine journée de formation',
   E'Bonjour à tous,\nPensez à apporter votre ordinateur et vos relevés de budget du mois. L''accueil commence 10 minutes avant la première séance.',
   true, now() - interval '1 day'),
  ('Bienvenue dans MLK Parcours Finances', 'Bienvenue ! Retrouvez ici le calendrier des séances, vos devoirs et les ressources de chaque module. N''hésitez pas à écrire à l''équipe si vous avez une question.', true, now() - interval '9 days'),
  ('Rappel : atelier pratique (brouillon)', 'Message en préparation : il n''est pas encore publié.', false, now());

-- ---------------------------------------------------------------
-- Ressources
-- ---------------------------------------------------------------
insert into public.ressources (id, cours_id, titre, type, url, storage_path) values
  ('66666666-0000-4000-8000-000000000001', 'cccccccc-0000-4000-8000-000000000001',
   'Modèle de budget mensuel', 'lien', 'https://www.mesquestionsdargent.fr/', null),
  ('66666666-0000-4000-8000-000000000002', 'cccccccc-0000-4000-8000-000000000002',
   'Guide de l''épargne', 'fichier', null, 'test/guide-epargne.pdf'),
  ('66666666-0000-4000-8000-000000000004', 'cccccccc-0000-4000-8000-000000000004',
   'Support du module 4 (cours non publié)', 'lien', 'https://www.economie.gouv.fr/', null);

-- ---------------------------------------------------------------
-- Devoirs et un rendu
-- ---------------------------------------------------------------
insert into public.devoirs (id, cours_id, titre, consigne, echeance) values
  ('dddddddd-0000-4000-8000-000000000001', 'cccccccc-0000-4000-8000-000000000001',
   'Établir mon budget mensuel', 'Listez vos revenus et vos dépenses du mois, puis déposez votre budget (PDF ou tableur).',
   ((date_trunc('day', now() at time zone 'Europe/Paris') + interval '2 days' + interval '18 hours') at time zone 'Europe/Paris')),
  ('dddddddd-0000-4000-8000-000000000002', 'cccccccc-0000-4000-8000-000000000002',
   'Fixer mon objectif d''épargne', 'Décrivez votre objectif d''épargne, son montant, son échéance et votre plan pour l''atteindre.',
   ((date_trunc('day', now() at time zone 'Europe/Paris') + interval '12 days' + interval '18 hours') at time zone 'Europe/Paris')),
  ('dddddddd-0000-4000-8000-000000000003', 'cccccccc-0000-4000-8000-000000000003',
   'Analyser une offre de crédit', 'Comparez deux offres de crédit (taux, coût total, durée, clauses à surveiller) et déposez votre analyse.',
   ((date_trunc('day', now() at time zone 'Europe/Paris') - interval '3 days' + interval '18 hours') at time zone 'Europe/Paris')),
  ('dddddddd-0000-4000-8000-000000000004', 'cccccccc-0000-4000-8000-000000000004',
   'Devoir du module 4 (cours non publié)', 'Devoir en préparation.', ((date_trunc('day', now() at time zone 'Europe/Paris') + interval '9 days' + interval '18 hours') at time zone 'Europe/Paris'));

insert into public.rendus (devoir_id, participant_id, fichier_path, nom_fichier) values
  ('dddddddd-0000-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111',
   '11111111-1111-4111-8111-111111111111/dddddddd-0000-4000-8000-000000000003/analyse-credit.pdf', 'analyse-credit.pdf');

-- ---------------------------------------------------------------
-- Témoignages (fictifs)
-- ---------------------------------------------------------------
insert into public.temoignages (nom_affiche, texte, valide) values
  ('Léa M.', 'Ce parcours m''a aidé à y voir clair dans mon budget : je sais enfin où va mon argent chaque mois.', true),
  ('Sandrine T.', 'Des cours simples et concrets. J''ai mis en place mon plan d''épargne dès la deuxième séance.', true),
  ('Karim B.', 'Un accompagnement motivant du début à la fin, avec des intervenants à l''écoute.', true),
  ('Julien R.', 'Les ateliers pratiques m''ont permis d''analyser mon premier crédit sans stress.', false);
