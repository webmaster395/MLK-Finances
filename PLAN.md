# MLK Parcours Finances — PLAN (proposition à valider)

> Statut : **proposition, rien n'est encore construit.** Ce fichier sert aussi de passation si un autre assistant reprend le travail.

## Décisions déjà prises (par l'utilisateur)
- Technologie : **Next.js (App Router) + TypeScript + Tailwind + Supabase**, suivant `Campus-MLK-Portail/docs/prompt-portail-modele.md`.
- Rôles du projet : **participant** et **administrateur** (et non « étudiant »).
- **Phase 1 = participant seul.** L'administration vient en phase 2.
- Pas encore de compte Supabase ni d'hébergement : on travaille **en local** d'abord.
- Le site HTML actuel est **archivé** dans `archive/maquette-html/` (référence visuelle et images).
- La charte vient de la **maquette Canva** (slide 1) : logo MLK + pinceaux roses, titres condensés (Antonio), texte Poppins, orange `#e95609`, rose `#d634ba`, rose clair `#ecb6e5`, cartes gris clair, photos en noir et blanc.
- On ne reprend **rien** (style, icônes, textes) de `Campus-MLK-Portail`, seulement sa méthode de travail.

## Arborescence des pages — phase 1 (espace participant)
Même logique que la maquette : menu latéral + pages.

| Page | Contenu | Vient de |
|---|---|---|
| Connexion / inscription / mot de passe oublié | pages claires, sans défilement sur ordinateur | prompt |
| **Accueil** | salutation, prochaine session, accès cours / devoirs / ressources, aperçu témoignages | maquette Canva |
| **Sessions** | liste, détail d'une session | maquette Canva |
| **Cours** | liste des modules, page de détail (description, objectifs, séances, supports) | maquette + prompt |
| **Devoirs** | statuts (à rendre, bientôt dû, en retard, rendu), dépôt de fichier | maquette + prompt |
| **Ressources** | supports classés par cours | maquette Canva |
| **Témoignages** | lecture des témoignages validés | maquette Canva |
| **Profil** | photo, informations, civilité | prompt |

À décider avec toi plus tard (présents dans le prompt, absents de la maquette) : **Calendrier**, **Notes**, **Messages/annonces**. Proposition : les mettre en lots optionnels après les pages ci-dessus.

Transversal : menu latéral repliable (barre/menu sur téléphone), en-tête avec nom + déconnexion, états vides soignés, `loading.tsx` sur chaque page, mode clair/sombre réservé à l'espace connecté, responsive vérifié à 375 px.

## Arborescence des dossiers prévue
```
MLK Parcours Finances/
├─ archive/maquette-html/     ← ancien site (référence, intact)
├─ docs/                      ← prompt modèle, notes
├─ public/images/             ← images réutilisées depuis l'archive
├─ src/
│  ├─ app/
│  │  ├─ (public)/connexion, inscription, mot-de-passe-oublie
│  │  └─ (participant)/accueil, sessions, cours, devoirs, ressources, temoignages, profil
│  │      (+ loading.tsx dans chaque dossier)
│  ├─ components/             ← menu, en-tête, cartes, boutons
│  ├─ lib/supabase/           ← accès base de données (côté serveur et navigateur)
│  └─ styles/                 ← charte dans des @layer
├─ supabase/migrations/       ← évolutions de la base, versionnées
├─ supabase/tests/            ← test d'isolation des droits (RLS)
├─ PLAN.md  CLAUDE.md
```
La phase 2 ajoutera `src/app/(admin)/…`.

## Base de données prévue (phase 1)
Toutes les tables ont la sécurité par ligne (RLS) activée ; rien n'est accessible sans connexion.

- `profils` : id (= compte), prénom, nom, civilité, photo, **rôle** (`participant` par défaut).
- `groupes` : nom, début, fin (la « promotion » ou le parcours suivi).
- `inscriptions` : participant ↔ groupe.
- `cours` : titre, description, objectifs, ordre, publié.
- `sessions` : groupe, cours (facultatif), titre, début, fin, lieu, description.
- `ressources` : cours, titre, type, fichier ou lien.
- `devoirs` : cours, titre, consigne, échéance.
- `rendus` : devoir, participant, chemin du fichier, date de dépôt, statut.
- `temoignages` : nom affiché, texte, photo, validé (oui/non).

Règles de droits : un participant ne voit que **son** profil, **ses** rendus et le contenu **publié de son groupe**. Dates en `timestamptz`, affichées en `fr-FR`. Fichiers déposés dans Supabase Storage (droits par bucket), téléchargement par lien signé de 60 s. Aucune clé `service_role` dans l'espace participant.

## Lots (un commit chacun, résultat montré avant le suivant)
0. Mise en place : projet Next.js, charte (couleurs, polices, logo), `CLAUDE.md`, branches `main` / `preview`.
1. Coquille : menu latéral + en-tête + pages vides avec `loading.tsx`.
2. Base de données locale + migrations + test d'isolation RLS + données de démo marquées « test ».
3. Connexion / inscription / mot de passe oublié.
4. Accueil.
5. Sessions.
6. Cours (liste + détail).
7. Ressources.
8. Devoirs + dépôt de fichier.
9. Témoignages.
10. Profil.
11. Finitions : états vides, mode sombre, vérification à 375 px, lint / types / build.
Phase 2 (plus tard) : espace administrateur.

## Façon de travailler
- Deux branches : `main` = production (jamais de travail dessus), `preview` = travail courant. Fusion seulement sur demande.
- Avant chaque envoi : `npm run lint`, `npx tsc --noEmit`, `npm run build`.
- Actions sensibles (production, fusion, suppression) : demander d'abord.
- Modèle conseillé : Opus ponctuellement pour valider ce plan et le schéma de base ; ensuite Sonnet, effort moyen, par lot.

## Avancement
- [x] Questions de cadrage répondues
- [x] Ancien site HTML archivé
- [x] Plan validé par l'utilisateur
- [x] Lot 0 : projet Next.js, charte (couleurs, polices, logo), CLAUDE.md, branches main / preview
- [x] Lot 1 : coquille (menu latéral repliable, barre du haut sur téléphone, en-tête, 7 pages vides avec loading.tsx)
- [x] Lot 2 : 3 migrations (tables, droits + RLS, stockage), seed « test », test d'isolation RLS (`npm run test:rls`, 45 vérifications)
- [x] Base appliquée sur le projet Supabase en ligne `mlk-parcours-finances` (organisation MLK, région Irlande eu-west-1, id `wfsbdlyksvxjgwogamsn`) : 3 migrations, 9 tables avec RLS, 3 seaux privés. Sans données de démo.
- [x] Lot 3 : connexion, inscription, mot de passe oublié, nouveau mot de passe, retour des e-mails, déconnexion, protection des pages (proxy), en-tête avec la vraie personne, (le message « Inscription enregistrée » affiché tant qu'il n'y a pas de groupe a été retiré à la demande de l'utilisateur ; `compterGroupes` reste disponible dans `src/lib/auth/personne.ts`). Types de la base générés. **Reste à tester par l'utilisateur : une vraie inscription avec e-mail de confirmation, puis connexion et déconnexion.**
- [x] Menu remodelé d'après les images de l'utilisateur : bouton flèche en haut pour replier / déplier (choix mémorisé), icônes séparées en groupes, pastille de la personne en bas (nom seulement, sans adresse e-mail ; lien vers la page Profil). Bouton « Déconnexion » en haut à droite de chaque page (demande de l'utilisateur). Photo de profil : pas encore (initiales ; photo au lot 10). Pastille rouge de notification prête dans le code (aucune page ne l'utilise encore ; prévue pour « Devoirs » au lot 8).
- [x] Lot 4 : accueil d'après la maquette Canva (bandeau, prochaine session lue en base, 3 tuiles cours / devoirs / ressources, aperçu des témoignages). Testé : `npm run test:unit` (dates à l'heure de Paris). Vérifié à l'écran à 1366, 900 et 375 px. **Non vérifié avec de vraies données** : la carte « Prochaine session » affiche le texte d'attente de la maquette tant qu'il n'y a pas de session dans la base.
- [x] Lot 5 : page Sessions (à venir, puis passées ; petite carte jour / mois, horaires et lieu à l'heure de Paris, cours lié) et page de détail `/sessions/[id]` (date, horaires, lieu, cours, description, session introuvable). Vérifié à l'écran : état vide et session introuvable. Vérifié ensuite avec les données de démo : liste (3 sessions du groupe 1, aucune du groupe 2), détail, session d'un autre groupe = « introuvable », carte « Prochaine session » de l'accueil. Pas de vue calendrier mois / semaine (prévue dans le prompt, absente de la maquette : lot optionnel).
- [x] Lot 6 : page Cours (modules numérotés, nombre de séances et de supports) et détail `/cours/[id]` (description, objectifs, séances liées avec lien vers chaque session, supports). Le détail d'une session renvoie vers son cours. Vérifié à l'écran avec les données de démo : 3 modules visibles, brouillon et cours du groupe 2 = « introuvable », affichage téléphone. Les supports de type lien s'ouvrent dans un nouvel onglet ; ceux de type fichier ne se téléchargent pas encore (lot 7).
- [x] Lot 7 : page Ressources classées par module (liens : « Ouvrir » dans un nouvel onglet ; fichiers : « Télécharger » par lien signé de 60 secondes créé à chaque clic, route `/ressources/[id]/telecharger`, jamais de lien public) et téléchargement depuis le détail d'un cours. Vérifié à l'écran : liste, ressource d'un autre groupe refusée, fichier absent = message d'erreur, téléphone. **Non vérifié : un vrai téléchargement** (aucun fichier n'est encore déposé dans le seau `ressources` ; voir ci-dessous).
- [x] Lot 8 : page Devoirs (À rendre / Rendus ; statuts à rendre, bientôt dû (≤ 3 jours), en retard, rendu, corrigé déduits de l'échéance et du rendu) et détail `/devoirs/[id]` (consigne, échéance, mon dépôt, téléchargement de son rendu par lien signé de 60 s). **Dépôt : le fichier part du navigateur directement vers le stockage Supabase** (chemin `{participant}/{devoir}/depot`, un seul fichier par devoir, remplacé à chaque dépôt, 10 Mo max, types contrôlés), puis une action serveur enregistre le rendu (le chemin est calculé côté serveur). Pastille rouge sur « Devoirs » dans le menu tant qu'un devoir attend un rendu. Migration `20261121102836` : un devoir corrigé ne peut plus être remplacé, **même au niveau du fichier** (faille trouvée et corrigée, avec test). Vérifié en réel : dépôt (fichier + ligne en base + type), téléchargement, devoir corrigé verrouillé (fichier et ligne), devoir d'un autre groupe introuvable, téléphone. Tests : `npm run test:unit` (17) et `npm run test:rls` (47).
- [ ] Lot 9 : témoignages

## Décisions et limites du lot 2
- **Un cours est rattaché à un seul groupe** (`cours.groupe_id`) ; ressources et devoirs héritent de la visibilité du cours. Si un même cours doit servir plusieurs groupes, il faudra une table de liaison (migration future).
- **Docker n'est pas utilisé** (l'hébergement se fait sur Vercel, la base sur Supabase en ligne). Les migrations sont testées sur une base PostgreSQL embarquée (PGlite) avec une simulation de Supabase, puis appliquées sur le projet en ligne.
- Les fichiers de migration ont été renommés avec les versions enregistrées par Supabase (20261121093400, ...09, ...18).
- Alerte Supabase traitée : la fonction `public.rls_auto_enable()` (créée par l'option « RLS automatique », pas par nous) n'est plus exécutable par `anon` ni `authenticated` (migration 20261121093547). Plus aucune alerte de sécurité.
- **Types TypeScript de la base : pas encore générés.** À faire au lot 3 avant d'écrire les accès aux données, soit via l'outil Supabase connecté (génération des types du projet en ligne), soit à la main si besoin.
- Création des comptes de démo dans `seed.sql` : méthode habituelle mais non vérifiée contre le vrai Supabase Auth.
- Le projet Supabase en ligne existe (voir Avancement). **Pas encore d'hébergement Vercel** : rien n'est en production.
- Les statuts « à rendre / bientôt dû / en retard / rendu » s'affichent à partir de l'échéance et de la présence d'un rendu ; seul `rendus.statut` (`depose` / `corrige`) est stocké.

## Lot 3 : ce qui est prévu (à valider avant de coder)
**Pages publiques** (sans défilement sur ordinateur, charte MLK) : `/connexion`, `/inscription`, `/mot-de-passe-oublie`, et `/reinitialiser-mot-de-passe` (page où mène le lien reçu par e-mail).
**Fonctionnement :**
- Connexion et déconnexion par **actions serveur** ; session lue côté serveur dans un composant sous `<Suspense>` (Cache Components).
- Un visiteur non connecté qui ouvre une page du portail est renvoyé vers `/connexion` ; `/` envoie vers `/connexion` ou `/accueil` selon la session.
- Redirections après lien d'e-mail **protégées** (adresse de retour limitée au site).
- L'en-tête affiche la vraie personne (prénom, nom) et le bouton « Déconnexion » devient actif.
- Le profil est créé automatiquement à l'inscription (déclencheur déjà en base) ; le rôle est toujours « participant ».
**À régler dans Supabase (tableau de bord) :** adresse du site et adresses de retour autorisées, confirmation d'e-mail, modèles d'e-mails en français. Les e-mails d'envoi par défaut de Supabase sont limités en nombre : suffisant pour les essais, à remplacer par un vrai service d'envoi avant la mise en production.
**Variables locales** (`.env.local`, jamais enregistré dans git) : adresse du projet et clé publique (« publishable / anon »). Aucune clé secrète.
**Décisions prises (par l'utilisateur) :** inscription **ouverte**, avec **confirmation d'e-mail obligatoire** ; rattachement à un groupe **manuel** en phase 1 (ajout dans la table `inscriptions` depuis Supabase). Tant qu'il n'est pas rattaché, il n'y a pas de contenu à afficher (le message d'attente a été retiré). L'espace administrateur automatisera cela en phase 2.
**Hors périmètre du lot 3 :** pages accueil, sessions, etc. (lots suivants), espace administrateur (phase 2).

## Décisions et limites du lot 3
- Testé automatiquement : redirections protégées (`npm run test:redirection`). Testé à la main sur Supabase en ligne : page protégée → connexion, messages d'erreur, mauvais identifiants, lien d'e-mail piégé refusé.
- **Non testé** (nécessite une vraie adresse e-mail) : inscription réelle + e-mail de confirmation + lien de retour, mot de passe oublié réel, connexion réussie, déconnexion, en-tête avec la vraie personne.
- Fichiers : `.env.local` (adresse du projet et clé publique, non enregistré dans git), `.env.example` (modèle), `src/proxy.ts`, `src/lib/auth/`, `src/lib/supabase/`, `src/components/auth/`, `src/app/(public)/`, `src/app/auth/callback/`.
- Mot de passe : 8 caractères minimum, avec au moins une lettre et un chiffre (règle de l'application).
- L'inscription demande aussi la **civilité (Madame / Monsieur)** et la **tranche d'âge** (moins de 18, 18-25, 26-35, 36-45, 46-55, 56 et plus), tous deux obligatoires (décision de l'utilisateur) ; stockés dans `profils.civilite` et `profils.tranche_age` (migration 20261121095152, appliquée en ligne). Les valeurs libres sont refusées par la base.
- Les réponses d'inscription et de mot de passe oublié sont identiques que l'adresse existe ou non (on ne révèle pas quels comptes existent).
- **À régler dans le tableau de bord Supabase avant la mise en production :** Authentication > URL Configuration (Site URL = adresse Vercel, Redirect URLs = `<adresse Vercel>/auth/callback`), modèles d'e-mails en français, et un vrai service d'envoi d'e-mails (le service par défaut est très limité). Variables à ajouter sur Vercel : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SITE_URL`.
- Le contrôle de connexion du proxy lit la session sans appel réseau ; chaque page de l'espace connecté revérifie la personne auprès de Supabase (`obtenirPersonne`).
- Correction : la vérification de session lit l'heure ; `await connection()` ajouté avant, pour que Next.js ne la fasse pas pendant la préparation des pages (erreur « Date.now() » sur /accueil).

## Données de démo en ligne (ajoutées avec l'accord de l'utilisateur)
- Projet `mlk-parcours-finances` : 2 groupes, 5 cours (dont 1 non publié et 1 du groupe 2), 4 sessions, 3 ressources, 4 devoirs, 4 témoignages (dont 1 non validé), tous titrés « [test] ». Compte de test `participant.test1@example.com` rattaché au groupe 1. Le second compte du seed (`participant.test2`) n'a **pas** été créé en ligne ; le groupe 2 n'a donc aucun membre.
- Les dates des sessions et devoirs sont relatives au jour de l'ajout (21/11/2026) : elles vieilliront ; à régénérer si besoin.
- La ressource « Guide de l'épargne (fichier) » pointe vers un fichier `test/guide-epargne.pdf` qui n'existe pas dans le stockage (téléchargement impossible tant qu'on n'a pas déposé un fichier test, lot 7).
- Pour tout supprimer : supprimer les lignes dont le titre commence par « [test] » (groupes, cours, sessions, ressources, devoirs, témoignages ; les suppressions en cascade s'occupent du reste).

## À faire par l'utilisateur pour vérifier le téléchargement (lot 7)
Dans le tableau de bord Supabase du projet `mlk-parcours-finances` : Storage > seau `ressources` > créer le dossier `test` > y déposer un petit PDF nommé exactement `guide-epargne.pdf`. Ensuite, sur la page Ressources (compte de test), cliquer sur « Télécharger » du « Guide de l'épargne ».

## Notes du lot 8
- Le seed contient un rendu pour le devoir 3 mais il n'a pas été ajouté en ligne ; le rendu en ligne est celui déposé pendant la vérification (devoir 1, fichier texte de test).
- Réglage Supabase signalé par l'outil de sécurité (non traité) : « Leaked password protection » (refus des mots de passe déjà piratés) est désactivé ; c'est un réglage du tableau de bord (Authentication), qui peut dépendre de l'offre Supabase. À regarder avant la mise en production.
- Pas de suppression de rendu par le participant (pas de droit de suppression en base) ; la correction et la gestion des rendus viendront avec l'espace administrateur (phase 2).
