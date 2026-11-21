# MLK Parcours Finances — règles du projet

@AGENTS.md

Portail de formation pour les **participants** (phase 1), puis les **administrateurs** (phase 2).
Feuille de route, schéma de base prévu et avancement : voir `PLAN.md` (le tenir à jour à chaque lot).
Prompt modèle d'origine : `docs/prompt-portail-modele.md`.

## Façon de travailler avec l'utilisateur
- L'utilisateur n'est **pas développeur** : répondre **en français**, expliquer simplement, dire clairement ce qui vient de sa demande et ce qui est une décision de l'assistant.
- Quota limité : recommander le modèle et l'effort les moins coûteux qui suffisent. Sonnet effort moyen par lot ; Opus seulement pour une décision d'architecture ou un bug difficile.
- Travailler par **petits lots utilisables seuls** (un commit par lot) et montrer le résultat avant de passer au suivant.
- Demander avant toute action sensible : données en production, fusion dans `main`, suppression.

## Branches
- `main` = production : **jamais de travail dessus**. Fusion seulement quand l'utilisateur la demande.
- `preview` = travail courant.
- Avant chaque envoi : `npm run lint`, `npx tsc --noEmit`, `npm run build`.

## Technique
- Next.js (App Router) + TypeScript + Tailwind v4 + Supabase. **Lire `node_modules/next/dist/docs/` avant de coder** : la version diffère de ce qu'on connaît.
- **Cache Components activé** : toute lecture de session ou de données par utilisateur se fait dans un composant sous `<Suspense>` ou dans une route avec `loading.tsx`. **Chaque page a son `loading.tsx`.** Un composant client qui lit `usePathname()` ou `useSearchParams()` doit être sous `<Suspense>`, y compris dans le layout racine.
- Supabase : RLS activée sur toutes les tables, droits explicites (rien pour `anon`), jamais de clé `service_role` dans l'espace participant, fonctions internes dans un schéma `private`, migrations versionnées dans `supabase/migrations/`, types régénérés, test d'isolation RLS dans `supabase/tests/`. Dates en `timestamptz`, affichées en `fr-FR`.
- Fichiers déposés : envoyés du navigateur vers Supabase Storage (RLS sur les buckets), puis une action serveur enregistre le chemin. Jamais de fichier dans le corps d'une action serveur. Téléchargement par URL signée de 60 secondes.
- Auth : connexion et déconnexion par actions serveur ; redirections après lien d'e-mail protégées.
- **CSS** : styles de base et classes de charte dans des `@layer` (voir `src/app/globals.css`), rien hors couche.
- Données de démo : clairement marquées « test » dans les titres de cours.
- **Accès aux données** : jamais depuis un composant client. Les lectures passent par `src/lib/donnees/` (côté serveur, après `await connection()`, sous `<Suspense>`). Le seul usage du client Supabase du navigateur est l'envoi de fichiers (devoirs, photo) vers le stockage, suivi d'une action serveur qui enregistre le chemin (calculé côté serveur).
- **Vérifications avant chaque envoi** : `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run test:unit`, `npm run test:rls`.
- Les statuts des devoirs ne sont pas stockés : ils se déduisent (`src/lib/devoirs.ts`).
- **Sessions et cours sont fusionnés** : une séance (`sessions`) porte une rubrique colorée (`rubriques`), des intervenants (noms) et un cours (`cours`). Le menu n'a pas d'entrée « Cours ». Les messages de l'équipe sont dans `annonces`.
- **Inspiration d'un autre projet** : on peut reprendre la structure et le fonctionnement (ex. Ministry School), jamais sa charte graphique, ses icônes, ses logos ni ses textes.
- Lint React : pas d'appel à `Date.now()` dans le rendu d'un composant ; les calculs qui dépendent de l'heure se font dans `src/lib/donnees/` après `await connection()`.

## Charte graphique (issue de la maquette Canva, slide 1)
- Couleurs : orange `#e95609`, rose `#d634ba`, rose clair `#ecb6e5`, noir `#070707`, texte `#333333`, fond `#e9e9e8`, cartes `#ededec`.
- Polices : **Antonio** (titres, condensés, majuscules) et **Poppins** (texte), via `next/font`.
- Éléments : logo MLK / Parcours / Finances avec trait de pinceau rose, boutons orange ou rose à coins légèrement arrondis, cartes gris clair, photos en noir et blanc.
- Ne reprendre **ni style, ni icônes, ni logos, ni textes** d'un autre projet (notamment `Campus-MLK-Portail`). Un logo fourni sous forme de fichier est utilisé tel quel, jamais redessiné.
- Mode sombre : réservé à l'espace connecté, via `data-theme="sombre"` sur le conteneur `#espace-connecte` (bouton lune / soleil en haut à droite, choix mémorisé sur l'appareil). Les surcharges sombres sont dans `@layer utilities` à la fin de `src/app/globals.css` ; toute nouvelle couleur doit y être vérifiée.
- Page de référence visuelle : `/charte`. Ancien site HTML de référence : `archive/maquette-html/`.
