# Plan — Espace administrateur (phase 2) — PROPOSITION À VALIDER PAR L'UTILISATEUR

Ce plan **n'a pas encore été validé**. Il rassemble ce que `PLAN.md` annonce pour la phase 2 et ce que les lots 1 à 11
laissent à la main dans Supabase. Ne rien construire avant l'accord de l'utilisateur sur ce document.

## 1. Objectif
Les administrateurs gèrent tout le contenu depuis le site, au lieu d'écrire dans le tableau de bord Supabase.
Les participants ne voient aucun changement (espace `(participant)` intact).

## 2. Ce qui est fait à la main aujourd'hui (et que l'admin doit remplacer)
- Créer les **groupes** (promotions) et **rattacher** les participants (table `inscriptions`).
- Créer les **séances** (date, heures, lieu, rubrique, intervenants, cours), les **rubriques** colorées, les **cours** (description, objectifs), les **ressources** (liens, fichiers), les **devoirs** (échéance).
- Écrire les **messages de l'équipe** (`annonces`) et valider les **témoignages** (`temoignages.valide`).
- **Corriger** les devoirs rendus (passer `rendus.statut` à « corrigé »).
- Plus tard : photos des intervenants et des témoignages, comptes de test à nettoyer.

## 3. Règles d'architecture (obligatoires)
- Pages sous `src/app/(admin)/admin/...`, **réservées au rôle `admin`** (`profils.role`) : vérifier côté serveur dans chaque page et dans `src/proxy.ts`, jamais seulement dans le menu.
- **Aucune clé `service_role`.** Toutes les écritures passent par la session de la personne connectée et par des **règles RLS réservées aux admins** (fonction `private.est_admin()` en `security definer`, schéma fermé à l'API).
- **Personne ne peut se donner le rôle admin** (le rôle n'est modifiable que par un autre admin, via une fonction contrôlée). Ne jamais lire le rôle depuis ce que la personne envoie.
- **Chaque évolution de la base = un nouveau fichier de migration + tests de sécurité** (`supabase/tests/rls.test.mjs`) : un participant ne doit **jamais** pouvoir lire ni écrire ce que fait l'admin. L'application en ligne des migrations est faite par Claude, avec l'accord de l'utilisateur.
- Mêmes règles que le reste du projet : charte MLK, mode sombre, `loading.tsx` partout, accès aux données dans `src/lib/donnees/`, vérifications du §3 de `docs/passation-assistant.md`.
- Fichiers (supports, photos) : envoyés du navigateur vers Supabase Storage (règles dédiées aux admins), puis une action serveur enregistre le chemin ; jamais de fichier dans une action serveur.

## 4. Lots proposés (un commit par lot, résultat montré avant le suivant)
0. **Fondations (Claude)** : fonction `est_admin`, règles RLS admin sur chaque table, règles de stockage admin, tests (un participant refusé partout), création d'un premier compte admin (à la main, par l'utilisateur).
1. **Coquille admin** : `/admin` protégé, menu latéral admin (même style), tableau de bord simple (effectifs, devoirs à corriger).
2. **Groupes et participants** : liste, création de groupe (nom, dates → alimente « Promotion 2026–2027 »), rattacher / détacher un participant, fiche participant (civilité, tranche d'âge, groupe).
3. **Séances et rubriques** : calendrier admin, créer / modifier / dépublier une séance (date, heures, lieu, rubrique, intervenants, cours), gérer les rubriques et leurs couleurs.
4. **Cours et supports** : créer / modifier / publier un cours (description, objectifs), ajouter des ressources (lien ou fichier).
5. **Devoirs et corrections** : créer un devoir (cours, consigne, échéance), voir les rendus par devoir, télécharger, marquer « corrigé ».
6. **Messages de l'équipe** : écrire, programmer, publier / dépublier un message (tous les groupes ou un groupe).
7. **Témoignages** : valider ou refuser, ajouter une photo.
8. **Finitions admin** : contrôles à 375 px, mode sombre, journal des actions (qui a modifié quoi, à décider).

## 5. Questions à trancher avec l'utilisateur avant de commencer
1. Les **formateurs / intervenants** ont-ils un compte ? (Ministry School avait enseignant + admin ; ici on n'a pour l'instant que participant + admin.)
2. **Qui crée les comptes admin**, et comment (invitation par e-mail ou à la main dans Supabase) ?
3. Les participants s'inscrivent librement : l'admin doit-il **valider** chaque inscription avant l'accès au contenu ?
4. Faut-il un **journal des actions** admin (audit) ?
5. Gestion du **paiement / accès à la formation** : hors périmètre de ce plan sauf demande contraire.

## 6. Hors périmètre
Mise en ligne (voir `PLAN.md`, « Avant la mise en ligne »), paiements, e-mails de masse, synchronisation d'agenda.
