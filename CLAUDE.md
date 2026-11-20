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

## Charte graphique (issue de la maquette Canva, slide 1)
- Couleurs : orange `#e95609`, rose `#d634ba`, rose clair `#ecb6e5`, noir `#070707`, texte `#333333`, fond `#e9e9e8`, cartes `#ededec`.
- Polices : **Antonio** (titres, condensés, majuscules) et **Poppins** (texte), via `next/font`.
- Éléments : logo MLK / Parcours / Finances avec trait de pinceau rose, boutons orange ou rose à coins légèrement arrondis, cartes gris clair, photos en noir et blanc.
- Ne reprendre **ni style, ni icônes, ni logos, ni textes** d'un autre projet (notamment `Campus-MLK-Portail`). Un logo fourni sous forme de fichier est utilisé tel quel, jamais redessiné.
- Mode sombre : réservé à l'espace connecté, via `data-theme="sombre"`.
- Page de référence visuelle : `/charte`. Ancien site HTML de référence : `archive/maquette-html/`.
