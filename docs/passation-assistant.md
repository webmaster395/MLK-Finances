# Passation à un autre assistant (Antigravity / Gemini)

Ce fichier explique le projet et les règles à suivre. Il sert aussi de **journal** : l'assistant qui travaille
y note ce qu'il a fait, pour que Claude puisse tout vérifier ensuite.

## 1. Le projet en 5 lignes
- **MLK Parcours Finances** : portail pour les participants d'une formation (phase 1). Next.js (App Router) + TypeScript + Tailwind v4 + Supabase.
- Hébergement prévu sur Vercel. **Rien n'est en production.**
- L'utilisateur **n'est pas développeur** : répondre **en français**, expliquer simplement, dire ce qui vient de sa demande et ce qui est une décision de l'assistant.
- À lire d'abord : `CLAUDE.md` (règles), `AGENTS.md` (Next.js), `PLAN.md` (feuille de route et décisions), `README.md`.
- **Next.js est une version récente qui diffère de ce que tu connais** : lire `node_modules/next/dist/docs/` avant de coder (Cache Components activé, `proxy.ts` à la place de `middleware`).

## 2. Règles à ne JAMAIS enfreindre
1. **Branches** : travailler sur `preview`. **Ne jamais toucher `main`**, ne rien fusionner, ne rien pousser en ligne.
2. **Base de données** : ne PAS modifier la base Supabase en ligne. Si une évolution est nécessaire, écrire un **nouveau fichier** dans `supabase/migrations/` (nom `AAAAMMJJHHMMSS_description.sql`), **ajouter les tests de sécurité** dans `supabase/tests/rls.test.mjs`, lancer `npm run test:rls`, puis **s'arrêter et le signaler dans le journal** : c'est Claude (avec l'accord de l'utilisateur) qui l'appliquera. Ne jamais modifier une migration existante.
3. **Sécurité** : aucune clé secrète (`service_role`) dans le code ; la sécurité par ligne (RLS) reste activée partout ; rien pour le rôle `anon` ; ne jamais affaiblir une règle pour « faire marcher » une page.
4. **Aucun secret dans le chat ni dans git** : `.env.local` n'est jamais commité.
5. **Charte graphique** : orange `#e95609`, rose `#d634ba`, rose clair `#ecb6e5`, polices Antonio (titres) et Poppins (texte). Ne jamais copier le style, les icônes ou les textes d'un autre projet (on peut s'inspirer de la structure, jamais de la charte).
6. **Accès aux données** : toujours côté serveur dans `src/lib/donnees/`, après `await connection()`, composant sous `<Suspense>`, et **chaque page a son `loading.tsx`**. Pas d'appel à `Date.now()` dans le rendu d'un composant (voir `CLAUDE.md`).
7. **Mode sombre** : toute nouvelle couleur doit être vérifiée en mode sombre (surcharges à la fin de `src/app/globals.css`).
8. **Petits lots** : une seule page ou un seul sujet à la fois, **un commit par lot**, message de commit en français.

## 3. Vérifications obligatoires avant chaque commit (PowerShell, depuis le dossier du projet)
```
npm run lint
npx tsc --noEmit
npm run build
npm run test:unit
npm run test:rls
```
Tout doit passer. Si quelque chose échoue : corriger, ne pas contourner (pas de `eslint-disable` ni de `@ts-ignore` pour faire taire une alerte).
Pour voir le site : `npm run dev` puis http://localhost:3000 (compte de test : `participant.test1@example.com`, mot de passe en haut de `supabase/seed.sql`). Vérifier chaque page **à 1366 px et à 375 px, en clair et en sombre**.

## 4. Où en est le projet
- Phase 1 (espace participant) terminée : connexion, accueil, sessions, devoirs, ressources, témoignages, profil.
- **Dernière refonte** (fait par Claude, commit `89a415b`) : accueil « journée de formation » et calendrier des sessions fusionné avec les cours (inspiré de Ministry School, charte MLK conservée).
- **Pas encore refaites dans cet esprit** : Devoirs, Ressources, Témoignages (elles fonctionnent mais gardent l'ancien style en cartes simples).
- Ce qui reste avant la mise en ligne est dans `PLAN.md` (section « Avant la mise en ligne »).

## 5. Tâches possibles (une à la fois, dans cet ordre, uniquement si l'utilisateur le demande)
1. **Devoirs** : reprendre la page dans le même esprit que l'accueil / le calendrier (cartes plus sobres, regroupement par jour ou par séance, statuts bien visibles). Ne pas changer les règles de dépôt de fichier.
2. **Ressources** : classement par séance / rubrique, mêmes principes.
3. **Témoignages** : mise en page seulement (lecture seule).
4. Corrections de détails signalées par l'utilisateur.
**Hors périmètre sans accord explicite** : base de données, authentification, dépôt de fichiers, mise en ligne, espace administrateur (phase 2).

## 6. Journal (à compléter par l'assistant qui travaille)
Pour chaque lot : date, ce qui a été demandé, fichiers modifiés, commandes de vérification lancées et leur résultat, ce qui n'a pas pu être vérifié, questions en suspens.

| Date | Demande | Fichiers modifiés | Vérifications (résultat) | Reste / à vérifier par Claude |
|---|---|---|---|---|
| 21/11/2026 | Lot 1 — Refonte de la page Devoirs dans l'esprit de l'accueil et du calendrier (cartes sobres à liseré coloré par statut, regroupement par jour d'échéance, liaison avec la séance et sa pastille de rubrique, règles de dépôt inchangées) | `src/app/globals.css`, `src/components/devoirs/badge-statut.tsx`, `src/components/devoirs/liste-devoirs.tsx`, `src/app/(participant)/devoirs/[id]/page.tsx`, `src/lib/devoirs.ts`, `src/lib/devoirs.test.ts`, `src/lib/donnees/devoirs.ts`, `PLAN.md`, `docs/passation-assistant.md` | `npm run lint` (OK), `npx tsc --noEmit` (OK), `npm run build` (OK), `npm run test:unit` (25/25 OK), `npm run test:rls` (57/57 OK) | Vérifier le rendu visuel à l'écran (1366 px et 375 px, clair et sombre) sur `/devoirs` et `/devoirs/[id]`. Aucune modification de base ni des règles de dépôt. |
| 21/11/2026 | Lot 2 — Refonte de la page Ressources (classement par séance / cours, panneaux avec pastille de rubrique, date de séance et compteur de supports, lignes sobres à liseré coloré selon la rubrique, lien signé de 60 s inchangé) | `src/lib/donnees/ressources.ts`, `src/components/ressources/liste-ressources.tsx`, `PLAN.md`, `docs/passation-assistant.md` | `npm run lint` (OK), `npx tsc --noEmit` (OK), `npm run build` (OK), `npm run test:unit` (25/25 OK), `npm run test:rls` (57/57 OK) | Vérifier le rendu visuel à l'écran (1366 px et 375 px, clair et sombre) sur `/ressources`. Téléchargement par lien signé de 60 s inchangé. |
| 21/11/2026 | Lot 3 — Refonte de la mise en page de Témoignages (lecture seule, panneau « Retours d'expérience » avec compteur, grille de cartes sobres à liseré rose/orange de la charte et initiales sobres) | `src/components/temoignages/liste-temoignages.tsx`, `PLAN.md`, `docs/passation-assistant.md` | `npm run lint` (OK), `npx tsc --noEmit` (OK), `npm run build` (OK), `npm run test:unit` (25/25 OK), `npm run test:rls` (57/57 OK) | Vérifier le rendu visuel à l'écran (1366 px et 375 px, clair et sombre) sur `/temoignages`. Lecture seule et règles RLS inchangées. |
| 21/11/2026 | Lot 4 — Ajustements coquille demandés par l'utilisateur : icône messages (mégaphone + compteur avec panneau des messages) à côté de la promotion, bouton icône Déconnexion déplacé en bas du menu à côté de Profil, et alignement en mobile sur la même ligne que le logo MLK Parcours Finances | `src/lib/donnees/annonces.ts`, `src/components/coquille/bouton-messages.tsx`, `src/components/coquille/bascule-theme.tsx`, `src/components/coquille/en-tete.tsx`, `src/components/coquille/menu-participant.tsx`, `src/components/coquille/menu-lateral.tsx`, `src/app/globals.css`, `PLAN.md`, `docs/passation-assistant.md` | `npm run lint` (OK), `npx tsc --noEmit` (OK), `npm run build` (OK), `npm run test:unit` (25/25 OK), `npm run test:rls` (57/57 OK) | Vérifier à l'écran (1366 px et 375 px, clair et sombre) la barre mobile sur une ligne, le panneau des messages au clic sur le mégaphone et le bouton de déconnexion en bas du menu. |

## 7. Pour Claude (reprise)
1. Lire ce journal, puis `git log --oneline 89a415b..HEAD` et `git diff 89a415b..HEAD --stat`.
2. Relancer les 5 vérifications du §3.
3. Relire en priorité : toute migration ajoutée, tout fichier de `src/lib/donnees/`, `src/lib/supabase/`, `src/lib/auth/`, `src/proxy.ts`, et les routes `telecharger`.
4. Vérifier à l'écran (1366 px, 375 px, clair et sombre) les pages touchées.
5. Appliquer les migrations en ligne seulement avec l'accord de l'utilisateur, puis contrôler les conseils de sécurité Supabase.
