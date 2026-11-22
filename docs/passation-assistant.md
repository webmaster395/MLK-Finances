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
- **Refaites dans cet esprit par Gemini** (voir le journal §6, lots 1 à 3) : Devoirs, Ressources, Témoignages ; lot 4 : ajustements de la coquille (messages, déconnexion). Tout cela reste **à relire par Claude**.
- **Décision de l'utilisateur sur la photo de la jeune fille** (celle du Canva, avec le panneau « Apprendre aujourd'hui pour demain ») : elle ne revient pas en grand bandeau sur l'accueil (il est devenu un tableau de bord), mais elle ne doit pas disparaître du site → voir la tâche 1 du §5.
- Ce qui reste avant la mise en ligne est dans `PLAN.md` (section « Avant la mise en ligne »).

## 5. Tâches possibles (une à la fois, dans cet ordre, uniquement si l'utilisateur le demande)
1. **(À FAIRE MAINTENANT — lot 5) Remettre la photo de la jeune fille sur les pages publiques** `/connexion`, `/inscription`, `/mot-de-passe-oublie`, `/reinitialiser-mot-de-passe`.
   - L'image existe déjà dans le projet : `public/images/hero.webp` (1952×721, fond clair, la jeune fille et le panneau « Apprendre aujourd'hui pour demain »). `public/images/hero-fond.webp` est le fond texturé d'origine.
   - Où : dans `src/app/(public)/layout.tsx` (et les composants de `src/components/auth/`). Idée : sur ordinateur, la carte de connexion à côté de l'image (deux colonnes) ou l'image en bandeau au-dessus de la carte ; sur téléphone, l'image réduite en bandeau au-dessus de la carte, ou masquée si elle repousse trop le formulaire (le formulaire doit rester visible sans défiler à 375 px).
   - Utiliser `next/image` avec `alt` descriptif (« Une étudiante souriante, à côté d'un panneau “Apprendre aujourd'hui pour demain” »), `priority` seulement si elle est visible dès l'ouverture.
   - Les pages publiques restent **toujours en mode clair** (elles ne sont pas dans `#espace-connecte`) : ne pas ajouter de règle sombre.
   - **Ne PAS toucher** à la logique de connexion (`src/lib/auth/`, `src/proxy.ts`, actions serveur, redirections) ni aux champs et messages des formulaires : changer seulement la mise en page.
   - Vérifier à 1366 px et 375 px, formulaire utilisable, aucun débordement horizontal.
   - **Seulement si l'utilisateur le confirme ensuite** : un bandeau fin avec la même photo au-dessus de la frise de l'accueil (masqué sur téléphone). Ne pas le faire sans accord.
2. Corrections de détails signalées par l'utilisateur.
(Les anciennes tâches Devoirs, Ressources et Témoignages sont faites : voir le journal.)
**Hors périmètre sans accord explicite** : base de données, authentification, dépôt de fichiers, mise en ligne.

**Espace administrateur (phase 2)** : construit par Claude (lots 0 à 8, voir `PLAN.md` et `docs/plan-espace-admin.md`). Il est **réservé à Claude** : ne pas modifier `src/app/(admin)/`, `src/components/admin/`, `src/lib/admin/`, `src/lib/donnees/admin.ts`, ni la sécurité (rôle admin, règles de la base). Deux points communs avec l'espace participant, à connaître si vous touchez à la coquille : le menu latéral `menu-lateral.tsx` sert aux deux espaces (propriété `espace`), et le thème clair / sombre est appliqué par `InitialiserTheme` (arrivée par changement de page) en plus du script du layout (arrivée par chargement).

## 6. Journal (à compléter par l'assistant qui travaille)
Pour chaque lot : date, ce qui a été demandé, fichiers modifiés, commandes de vérification lancées et leur résultat, ce qui n'a pas pu être vérifié, questions en suspens.

| Date | Demande | Fichiers modifiés | Vérifications (résultat) | Reste / à vérifier par Claude |
|---|---|---|---|---|
| 21/11/2026 | Lot 1 — Refonte de la page Devoirs dans l'esprit de l'accueil et du calendrier (cartes sobres à liseré coloré par statut, regroupement par jour d'échéance, liaison avec la séance et sa pastille de rubrique, règles de dépôt inchangées) | `src/app/globals.css`, `src/components/devoirs/badge-statut.tsx`, `src/components/devoirs/liste-devoirs.tsx`, `src/app/(participant)/devoirs/[id]/page.tsx`, `src/lib/devoirs.ts`, `src/lib/devoirs.test.ts`, `src/lib/donnees/devoirs.ts`, `PLAN.md`, `docs/passation-assistant.md` | `npm run lint` (OK), `npx tsc --noEmit` (OK), `npm run build` (OK), `npm run test:unit` (25/25 OK), `npm run test:rls` (57/57 OK) | Vérifier le rendu visuel à l'écran (1366 px et 375 px, clair et sombre) sur `/devoirs` et `/devoirs/[id]`. Aucune modification de base ni des règles de dépôt. |
| 21/11/2026 | Lot 2 — Refonte de la page Ressources (classement par séance / cours, panneaux avec pastille de rubrique, date de séance et compteur de supports, lignes sobres à liseré coloré selon la rubrique, lien signé de 60 s inchangé) | `src/lib/donnees/ressources.ts`, `src/components/ressources/liste-ressources.tsx`, `PLAN.md`, `docs/passation-assistant.md` | `npm run lint` (OK), `npx tsc --noEmit` (OK), `npm run build` (OK), `npm run test:unit` (25/25 OK), `npm run test:rls` (57/57 OK) | Vérifier le rendu visuel à l'écran (1366 px et 375 px, clair et sombre) sur `/ressources`. Téléchargement par lien signé de 60 s inchangé. |
| 21/11/2026 | Lot 3 — Refonte de la mise en page de Témoignages (lecture seule, panneau « Retours d'expérience » avec compteur, grille de cartes sobres à liseré rose/orange de la charte et initiales sobres) | `src/components/temoignages/liste-temoignages.tsx`, `PLAN.md`, `docs/passation-assistant.md` | `npm run lint` (OK), `npx tsc --noEmit` (OK), `npm run build` (OK), `npm run test:unit` (25/25 OK), `npm run test:rls` (57/57 OK) | Vérifier le rendu visuel à l'écran (1366 px et 375 px, clair et sombre) sur `/temoignages`. Lecture seule et règles RLS inchangées. |
| 21/11/2026 | Lot 4 — Ajustements coquille demandés par l'utilisateur : icône messages (mégaphone + compteur avec panneau des messages) à côté de la promotion, bouton icône Déconnexion déplacé en bas du menu à côté de Profil, et alignement en mobile sur la même ligne que le logo MLK Parcours Finances | `src/lib/donnees/annonces.ts`, `src/components/coquille/bouton-messages.tsx`, `src/components/coquille/bascule-theme.tsx`, `src/components/coquille/en-tete.tsx`, `src/components/coquille/menu-participant.tsx`, `src/components/coquille/menu-lateral.tsx`, `src/app/globals.css`, `PLAN.md`, `docs/passation-assistant.md` | `npm run lint` (OK), `npx tsc --noEmit` (OK), `npm run build` (OK), `npm run test:unit` (25/25 OK), `npm run test:rls` (57/57 OK) | Vérifier à l'écran (1366 px et 375 px, clair et sombre) la barre mobile sur une ligne, le panneau des messages au clic sur le mégaphone et le bouton de déconnexion en bas du menu. |
| 21/11/2026 | Lot 5 — Remise en place de la photo de la jeune fille (`public/images/hero.webp`) sur les pages publiques (`/connexion`, `/inscription`, `/mot-de-passe-oublie`, `/reinitialiser-mot-de-passe`) en 2 colonnes sur ordinateur et en bandeau compact sur téléphone | `src/app/(public)/layout.tsx`, `PLAN.md`, `docs/passation-assistant.md` | `npm run lint` (OK), `npx tsc --noEmit` (OK), `npm run build` (OK), `npm run test:unit` (25/25 OK), `npm run test:rls` (57/57 OK) | Vérifier à l'écran (1366 px et 375 px, toujours en clair) les 4 pages publiques. Aucune modification de la logique d'authentification ni des formulaires. |
| 21/11/2026 | Lot 6 — Réduction des tailles de police sur mobile (logo dans le tiroir mobile, barre du haut mobile et titres des pages / panneaux à 375 px) ; le menu latéral sur ordinateur garde son affichage d'origine et la taille du titre MLK Parcours Finances a été augmentée | `src/app/globals.css`, `src/components/coquille/menu-lateral.tsx`, `src/components/coquille/en-tete.tsx`, `src/components/coquille/titre-page.tsx`, `src/components/accueil/journee-accueil.tsx`, `src/components/accueil/message-equipe.tsx`, `src/components/accueil/travail-a-faire.tsx`, `src/components/sessions/calendrier-mois.tsx`, `src/components/devoirs/liste-devoirs.tsx`, `src/components/ressources/liste-ressources.tsx`, `src/components/temoignages/liste-temoignages.tsx`, `src/app/(participant)/sessions/[id]/page.tsx`, `src/app/(participant)/devoirs/[id]/page.tsx`, `PLAN.md`, `docs/passation-assistant.md` | `npm run lint` (OK), `npx tsc --noEmit` (OK), `npm run build` (OK), `npm run test:unit` (25/25 OK), `npm run test:rls` (57/57 OK) | Vérifier à l'écran l'équilibre des tailles de police à 375 px et du logo agrandi. |
| 21/11/2026 | Lot 7 — Refonte du détail d'une séance (`/sessions/[id]`) et d'un cours (`/cours/[id]`) dans l'esprit Ministry School (en-tête structuré à liseré coloré par rubrique avec métadonnées et intervenants, grille 2 colonnes : contenu + objectifs en cartes encadrées + panneau des supports à gauche ; travail à préparer et séances à droite) | `src/lib/donnees/cours.ts`, `src/app/(participant)/sessions/[id]/page.tsx`, `src/app/(participant)/sessions/[id]/loading.tsx`, `src/app/(participant)/cours/[id]/page.tsx`, `src/app/(participant)/cours/[id]/loading.tsx`, `PLAN.md`, `docs/passation-assistant.md` | `npm run lint` (OK), `npx tsc --noEmit` (OK), `npm run build` (OK), `npm run test:unit` (25/25 OK), `npm run test:rls` (57/57 OK) | Vérifier à l'écran (1366 px et 375 px, clair et sombre) `/sessions/[id]` et `/cours/[id]`. |
| 22/11/2026 | Lot 8 — Distinction des couleurs de séances selon le créneau horaire (matin en rose `#d634ba`, fin de matinée / après-midi en orange `#e95609`, soir en indigo `#5b6fd6`, accueil sans cours en gris taupe `#6b6560`, avec alternance pour que deux séances qui se suivent n'aient jamais la même couleur) | `src/components/seances/couleur-seance.ts`, `src/components/accueil/journee-accueil.tsx`, `src/components/sessions/calendrier-mois.tsx`, `src/app/(participant)/sessions/[id]/page.tsx`, `src/app/(participant)/cours/[id]/page.tsx`, `src/components/ressources/liste-ressources.tsx`, `PLAN.md`, `docs/passation-assistant.md` | `npm run lint` (OK), `npx tsc --noEmit` (OK), `npm run build` (OK), `npm run test:unit` (OK), `npm run test:rls` (73/73 OK) | Vérifier à l'écran (Accueil, Calendrier, détail Séance/Cours et Ressources) les couleurs distinctes des séances d'une même journée. |
| 22/11/2026 | Lot 9 — Ajout de l'onglet et de la page « Messages » (`/messages`) dans l'espace participant (lecture seule de tous les messages publiés de l'équipe, tout en conservant le raccourci mégaphone en haut à droite) | `src/lib/navigation.ts`, `src/lib/auth/routes.ts`, `src/components/messages/liste-messages.tsx`, `src/app/(participant)/messages/page.tsx`, `src/app/(participant)/messages/loading.tsx`, `src/components/accueil/message-equipe.tsx`, `src/components/coquille/bouton-messages.tsx`, `PLAN.md`, `docs/passation-assistant.md` | `npm run lint` (OK), `npx tsc --noEmit` (OK), `npm run build` (OK), `npm run test:unit` (OK), `npm run test:rls` (73/73 OK) | Vérifier à l'écran (1366 px et 375 px, clair et sombre) la page `/messages` et l'entrée dans le menu participant. |

## 7. Pour Claude (reprise)
1. Lire ce journal, puis `git log --oneline 89a415b..HEAD` et `git diff 89a415b..HEAD --stat`.
2. Relancer les 5 vérifications du §3.
3. Relire en priorité : toute migration ajoutée, tout fichier de `src/lib/donnees/`, `src/lib/supabase/`, `src/lib/auth/`, `src/proxy.ts`, et les routes `telecharger`.
4. Vérifier à l'écran (1366 px, 375 px, clair et sombre) les pages touchées.
5. Appliquer les migrations en ligne seulement avec l'accord de l'utilisateur, puis contrôler les conseils de sécurité Supabase.
