-- Données de démonstration du parcours « (Re)prendre le contrôle de mes finances » (Église MLK).
-- Contenu d'après les informations publiques du parcours : 6 samedis matin en visioconférence (09h30–12h00).
-- Les thèmes des séances, les consignes des devoirs et les témoignages sont des PROPOSITIONS fictives :
-- à relire et remplacer par le vrai contenu (depuis l'espace admin) avant la mise en ligne.
-- Aucun compte ni mot de passe ici : les comptes de test sont dans supabase/comptes-test.local.sql
-- (fichier local, ignoré par Git, jamais envoyé sur GitHub).

-- ---------------------------------------------------------------
-- Modules (cours)
-- ---------------------------------------------------------------
insert into public.cours (id, titre, description, objectifs, ordre, publie) values
  ('cccccccc-0000-4000-8000-000000000001',
   'Module 1 — Faire le point sur ma situation',
   'Poser un diagnostic honnête de ses revenus, de ses dépenses et de ses dettes, pour savoir d''où l''on part.',
   array['Lister ses revenus et ses dépenses', 'Mesurer son niveau d''endettement', 'Reprendre le contrôle de son argent'], 1, true),
  ('cccccccc-0000-4000-8000-000000000002',
   'Module 2 — Construire et tenir mon budget',
   'Un budget simple et réaliste, que l''on tient dans la durée.',
   array['Établir un budget mensuel', 'Distinguer l''essentiel du superflu', 'Suivre ses dépenses au quotidien'], 2, true),
  ('cccccccc-0000-4000-8000-000000000003',
   'Module 3 — Sortir des dettes et maîtriser le crédit',
   'Comprendre le crédit, hiérarchiser ses dettes et bâtir un plan de remboursement.',
   array['Comprendre un taux et un coût total', 'Hiérarchiser ses dettes', 'Bâtir un plan de remboursement'], 3, true),
  ('cccccccc-0000-4000-8000-000000000004',
   'Module 4 — Épargner et se protéger',
   'Fonds d''urgence, épargne régulière et protection face aux imprévus.',
   array['Constituer un fonds d''urgence', 'Tirer définitivement un trait sur l''insécurité financière', 'Mettre en place une épargne automatique'], 4, true),
  ('cccccccc-0000-4000-8000-000000000005',
   'Module 5 — Gérer l''argent en bon intendant',
   'Éclairage biblique, avec un pasteur, sur l''argent, la gestion des finances et le contentement.',
   array['Découvrir ce que la Bible dit de l''argent', 'Maîtriser son budget comme un bon intendant des richesses que Dieu permet de posséder', 'Gérer ses finances avec paix et joie'], 5, true),
  ('cccccccc-0000-4000-8000-000000000006',
   'Module 6 — Réaliser mes projets et contribuer à l''Évangile',
   'Fixer ses projets, les financer pas à pas et servir l''avancée de l''Évangile et du Royaume de Dieu.',
   array['Déclencher ses projets les uns après les autres', 'Fixer des priorités et un calendrier', 'Contribuer à l''avancée de l''Évangile et du Royaume de Dieu'], 6, true);

-- ---------------------------------------------------------------
-- Séances : 6 samedis matin en visioconférence, de 09h30 à 12h00 (heure de Paris, hiver = +01)
-- ---------------------------------------------------------------
insert into public.sessions (id, cours_id, intervenants, titre, debut, fin, lieu, description) values
  ('55555555-0000-4000-8000-000000000012', null, '{}',
   'Accueil en visioconférence', '2027-01-09 09:15:00+01', '2027-01-09 09:30:00+01', 'En visioconférence',
   'Connexion des participants et présentation du parcours.'),
  ('55555555-0000-4000-8000-000000000001', 'cccccccc-0000-4000-8000-000000000001', array['Intervenant finances'],
   'Séance 1 — Faire le point sur ma situation', '2027-01-09 09:30:00+01', '2027-01-09 12:00:00+01', 'En visioconférence',
   'Première séance : état des lieux de ses revenus, de ses dépenses et de ses dettes.'),
  ('55555555-0000-4000-8000-000000000002', 'cccccccc-0000-4000-8000-000000000002', array['Intervenant finances'],
   'Séance 2 — Construire et tenir mon budget', '2027-01-16 09:30:00+01', '2027-01-16 12:00:00+01', 'En visioconférence',
   'Bâtir un budget mensuel simple et apprendre à le suivre.'),
  ('55555555-0000-4000-8000-000000000003', 'cccccccc-0000-4000-8000-000000000003', array['Intervenant finances'],
   'Séance 3 — Sortir des dettes et maîtriser le crédit', '2027-01-23 09:30:00+01', '2027-01-23 12:00:00+01', 'En visioconférence',
   'Comprendre le crédit et construire un plan de remboursement.'),
  ('55555555-0000-4000-8000-000000000013', 'cccccccc-0000-4000-8000-000000000004', array['Intervenant finances'],
   'Séance 4 — Épargner et se protéger', '2027-01-30 09:30:00+01', '2027-01-30 12:00:00+01', 'En visioconférence',
   'Fonds d''urgence et épargne régulière pour en finir avec l''insécurité financière.'),
  ('55555555-0000-4000-8000-000000000014', 'cccccccc-0000-4000-8000-000000000005', array['Pasteur'],
   'Séance 5 — Gérer l''argent en bon intendant', '2027-02-06 09:30:00+01', '2027-02-06 12:00:00+01', 'En visioconférence',
   'Éclairage biblique sur l''argent et la gestion des finances, avec un pasteur.'),
  ('55555555-0000-4000-8000-000000000015', 'cccccccc-0000-4000-8000-000000000006', array['Pasteur', 'Intervenant finances'],
   'Séance 6 — Réaliser mes projets et contribuer à l''Évangile', '2027-02-13 09:30:00+01', '2027-02-13 12:00:00+01', 'En visioconférence',
   'Fixer ses projets, les financer pas à pas et servir l''avancée de l''Évangile.');

-- ---------------------------------------------------------------
-- Messages de l'équipe
-- ---------------------------------------------------------------
insert into public.annonces (titre, message, publie, cree_le) values
  ('Rejoindre la visioconférence',
   E'Le lien de la visioconférence vous est envoyé par e-mail avant chaque samedi.\nPensez à préparer vos relevés de compte et votre budget du mois pour avancer concrètement pendant la séance.',
   true, now() - interval '1 day'),
  ('Bienvenue dans le parcours « (Re)prendre le contrôle de mes finances »',
   E'Bienvenue ! Le parcours se déroule en visioconférence, 6 samedis matin de 09h30 à 12h00.\nParticipation aux frais : 15 € (10 € en tarif étudiant).\nRetrouvez ici le calendrier des séances, vos devoirs et les ressources de chaque module.',
   true, now() - interval '9 days');

-- ---------------------------------------------------------------
-- Ressources
-- ---------------------------------------------------------------
insert into public.ressources (id, cours_id, titre, type, url, storage_path) values
  ('66666666-0000-4000-8000-000000000001', 'cccccccc-0000-4000-8000-000000000002',
   'Modèle de budget mensuel', 'lien', 'https://www.mesquestionsdargent.fr/', null),
  ('66666666-0000-4000-8000-000000000002', 'cccccccc-0000-4000-8000-000000000004',
   'Guide de l''épargne', 'fichier', null, 'test/guide-epargne.pdf'),
  ('66666666-0000-4000-8000-000000000003', 'cccccccc-0000-4000-8000-000000000003',
   'Banque de France — crédit et surendettement', 'lien', 'https://www.banque-france.fr/', null);

-- ---------------------------------------------------------------
-- Devoirs (à rendre le jeudi à 18h, avant la séance suivante)
-- ---------------------------------------------------------------
insert into public.devoirs (id, cours_id, titre, consigne, echeance) values
  ('dddddddd-0000-4000-8000-000000000004', 'cccccccc-0000-4000-8000-000000000001',
   'Faire le point sur ma situation financière', 'Listez vos revenus, vos dépenses et vos dettes, puis déposez votre bilan (PDF ou tableur).',
   '2027-01-14 18:00:00+01'),
  ('dddddddd-0000-4000-8000-000000000001', 'cccccccc-0000-4000-8000-000000000002',
   'Établir mon budget mensuel', 'Construisez votre budget du mois (revenus, dépenses fixes et variables) et déposez-le (PDF ou tableur).',
   '2027-01-21 18:00:00+01'),
  ('dddddddd-0000-4000-8000-000000000003', 'cccccccc-0000-4000-8000-000000000003',
   'Analyser mes crédits et mes dettes', 'Comparez vos crédits (taux, coût total, durée) et proposez un ordre de remboursement. Déposez votre analyse.',
   '2027-01-28 18:00:00+01'),
  ('dddddddd-0000-4000-8000-000000000002', 'cccccccc-0000-4000-8000-000000000004',
   'Fixer mon objectif d''épargne', 'Décrivez votre objectif d''épargne, son montant, son échéance et votre plan pour l''atteindre.',
   '2027-02-04 18:00:00+01'),
  ('dddddddd-0000-4000-8000-000000000005', 'cccccccc-0000-4000-8000-000000000005',
   'Ma réflexion : l''argent selon la Bible', 'En quelques lignes, notez ce que la séance change dans votre manière de voir et de gérer l''argent.',
   '2027-02-11 18:00:00+01');

-- ---------------------------------------------------------------
-- Témoignages (fictifs : à remplacer par de vrais retours de participants)
-- ---------------------------------------------------------------
insert into public.temoignages (nom_affiche, texte, valide) values
  ('Léa M.', 'Grâce à ce parcours, j''ai repris le contrôle de mon budget et je gère enfin mon argent avec sérénité.', true),
  ('Sandrine T.', 'L''éclairage biblique m''a aidée à voir l''argent autrement : je suis devenue une meilleure intendante de ce que Dieu me confie.', true),
  ('Karim B.', 'Des intervenants compétents et à l''écoute. En quelques samedis, j''ai posé un vrai plan de remboursement.', true),
  ('Julien R.', 'Les samedis en visioconférence sont bien rythmés : j''ai pu avancer sur mes projets sans me sentir seul.', false);
