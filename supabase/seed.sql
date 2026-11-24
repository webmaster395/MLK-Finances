-- Données de démonstration du parcours « (Re)prendre le contrôle de mes finances » (Église MLK).
-- 6 sessions, le samedi matin en visioconférence (09h30–12h00).
-- Les thèmes, travaux, matériel, liens de visioconférence et témoignages sont des PROPOSITIONS fictives :
-- à relire et remplacer par le vrai contenu (depuis l'espace admin) avant la mise en ligne.
-- Aucun compte ni mot de passe ici : les comptes de test sont dans supabase/comptes-test.local.sql
-- (fichier local, ignoré par Git, jamais envoyé sur GitHub).

-- ---------------------------------------------------------------
-- Sessions (heure de Paris, hiver = +01). Le lien de visioconférence est FICTIF.
-- ---------------------------------------------------------------
insert into public.sessions (id, titre, debut, fin, description, objectifs, lien_visio, travaux_avant, travaux_apres, materiel) values
  ('55555555-0000-4000-8000-000000000001',
   'Session 1 — Faire le point sur ma situation', '2027-01-09 09:30:00+01', '2027-01-09 12:00:00+01',
   'Poser un diagnostic honnête de ses revenus, de ses dépenses et de ses dettes, pour savoir d''où l''on part.',
   array['Lister ses revenus et ses dépenses', 'Mesurer son niveau d''endettement', 'Reprendre le contrôle de son argent'],
   'https://zoom.us/j/1234567890?pwd=exemple',
   'Rassembler vos relevés de compte des trois derniers mois.',
   'Lister vos revenus, vos dépenses et vos dettes dans un tableau simple.',
   'Vos relevés de compte, une calculatrice, de quoi écrire.'),
  ('55555555-0000-4000-8000-000000000002',
   'Session 2 — Construire et tenir mon budget', '2027-01-16 09:30:00+01', '2027-01-16 12:00:00+01',
   'Un budget simple et réaliste, que l''on tient dans la durée.',
   array['Établir un budget mensuel', 'Distinguer l''essentiel du superflu', 'Suivre ses dépenses au quotidien'],
   'https://zoom.us/j/1234567890?pwd=exemple',
   'Terminer le bilan de la session 1 (revenus, dépenses, dettes).',
   'Construire votre budget du mois et le suivre pendant une semaine.',
   'Votre bilan de la session 1, un tableur ou un carnet.'),
  ('55555555-0000-4000-8000-000000000003',
   'Session 3 — Sortir des dettes et maîtriser le crédit', '2027-01-23 09:30:00+01', '2027-01-23 12:00:00+01',
   'Comprendre le crédit, hiérarchiser ses dettes et bâtir un plan de remboursement.',
   array['Comprendre un taux et un coût total', 'Hiérarchiser ses dettes', 'Bâtir un plan de remboursement'],
   'https://zoom.us/j/1234567890?pwd=exemple',
   'Repérer vos contrats de crédit en cours (taux, mensualité, durée restante).',
   'Classer vos dettes et proposer un ordre de remboursement.',
   'Vos contrats de crédit et vos derniers tableaux d''amortissement.'),
  ('55555555-0000-4000-8000-000000000004',
   'Session 4 — Épargner et se protéger', '2027-01-30 09:30:00+01', '2027-01-30 12:00:00+01',
   'Fonds d''urgence, épargne régulière et protection face aux imprévus.',
   array['Constituer un fonds d''urgence', 'Tirer définitivement un trait sur l''insécurité financière', 'Mettre en place une épargne automatique'],
   'https://zoom.us/j/1234567890?pwd=exemple',
   'Relire votre budget et repérer une somme à mettre de côté chaque mois.',
   'Fixer votre objectif d''épargne : montant, échéance et plan pour l''atteindre.',
   'Votre budget mis à jour.'),
  ('55555555-0000-4000-8000-000000000005',
   'Session 5 — Gérer l''argent en bon intendant', '2027-02-06 09:30:00+01', '2027-02-06 12:00:00+01',
   'Éclairage biblique sur l''argent, la gestion des finances et le contentement.',
   array['Découvrir ce que la Bible dit de l''argent', 'Maîtriser son budget comme un bon intendant des richesses que Dieu permet de posséder', 'Gérer ses finances avec paix et joie'],
   'https://zoom.us/j/1234567890?pwd=exemple',
   'Lire les passages bibliques proposés dans le document de la session.',
   'Noter en quelques lignes ce que la session change dans votre manière de voir l''argent.',
   'Une Bible, de quoi écrire.'),
  ('55555555-0000-4000-8000-000000000006',
   'Session 6 — Réaliser mes projets et contribuer à l''Évangile', '2027-02-13 09:30:00+01', '2027-02-13 12:00:00+01',
   'Fixer ses projets, les financer pas à pas et servir l''avancée de l''Évangile et du Royaume de Dieu.',
   array['Déclencher ses projets les uns après les autres', 'Fixer des priorités et un calendrier', 'Contribuer à l''avancée de l''Évangile et du Royaume de Dieu'],
   'https://zoom.us/j/1234567890?pwd=exemple',
   'Lister deux ou trois projets qui vous tiennent à cœur.',
   'Établir le calendrier de votre premier projet.',
   'Votre budget et votre objectif d''épargne.');

-- ---------------------------------------------------------------
-- Messages de l'équipe
-- ---------------------------------------------------------------
insert into public.annonces (titre, message, publie, cree_le) values
  ('Bienvenue dans le parcours « (Re)prendre le contrôle de mes finances »',
   E'Bienvenue ! Le parcours se déroule en visioconférence, 6 samedis matin de 09h30 à 12h00.\nParticipation aux frais : 15 € (10 € en tarif étudiant).\nRetrouvez ici le calendrier des sessions, le lien de visioconférence, les travaux et les documents de chaque session.',
   true, now() - interval '9 days');

-- ---------------------------------------------------------------
-- Documents des sessions (PDF ou lien, par exemple Canva)
-- ---------------------------------------------------------------
insert into public.ressources (id, session_id, titre, type, url, storage_path) values
  ('66666666-0000-4000-8000-000000000001', '55555555-0000-4000-8000-000000000001',
   'Présentation de la session 1 (Canva)', 'lien', 'https://www.canva.com/', null),
  ('66666666-0000-4000-8000-000000000002', '55555555-0000-4000-8000-000000000002',
   'Modèle de budget mensuel', 'lien', 'https://www.mesquestionsdargent.fr/', null),
  ('66666666-0000-4000-8000-000000000003', '55555555-0000-4000-8000-000000000003',
   'Banque de France — crédit et surendettement', 'lien', 'https://www.banque-france.fr/', null),
  ('66666666-0000-4000-8000-000000000004', '55555555-0000-4000-8000-000000000004',
   'Guide de l''épargne', 'fichier', null, 'test/guide-epargne.pdf');

-- ---------------------------------------------------------------
-- Témoignages (fictifs : à remplacer par de vrais retours de participants)
-- ---------------------------------------------------------------
insert into public.temoignages (nom_affiche, texte, valide) values
  ('Léa', 'Grâce à ce parcours, j''ai repris le contrôle de mon budget et je gère enfin mon argent avec sérénité.', true),
  ('Sandrine', 'L''éclairage biblique m''a aidée à voir l''argent autrement : je suis devenue une meilleure intendante de ce que Dieu me confie.', true),
  ('Karim', 'Des échanges concrets et bienveillants. En quelques samedis, j''ai posé un vrai plan de remboursement.', true),
  ('Julien', 'Les samedis en visioconférence sont bien rythmés : j''ai pu avancer sur mes projets sans me sentir seul.', false);
