# MLK Parcours Finances — règles du projet

@AGENTS.md

Portail de formation pour les **participants** (phase 1), puis les **administrateurs** (phase 2).
Feuille de route, schéma de base prévu et avancement : voir `PLAN.md` (le tenir à jour à chaque lot).

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
- Données de démo : contenu fictif mais présentable du parcours de l'Église MLK (`supabase/seed.sql`), à remplacer par le vrai avant la mise en ligne. Les comptes de test ne sont jamais dans le dépôt : fichier local ignoré `supabase/comptes-test.local.sql`.
- **Accès aux données** : jamais depuis un composant client. Les lectures passent par `src/lib/donnees/` (côté serveur, après `await connection()`, sous `<Suspense>`). Le seul usage du client Supabase du navigateur est l'envoi de fichiers (documents, photos) vers le stockage, suivi d'une action serveur qui enregistre le chemin (calculé côté serveur).
- **Vérifications avant chaque envoi** : `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run test:unit`, `npm run test:rls`.
- **Une session porte tout** (`sessions`) : description, objectifs, lien de visioconférence, travaux avant / après (à faire, jamais à rendre), matériel ; ses documents (PDF ou lien Canva) sont dans `ressources`. Plus de cours, devoirs, rendus, intervenants ni lieu. Messages de l'équipe dans `annonces`. Une seule promotion (`src/lib/promotion.ts`), tout le contenu publié est visible par toute personne inscrite.
- **Témoignages** : « public » veut dire les participants (aucun accès sans compte). Plusieurs par personne, avec historique et date ; l'auteur indique « partage » ou « confidentiel » (équipe / pasteur) ; l'administrateur décide de l'affichage (`valide`). Prénom seul.
- **Inspiration d'un autre projet** : on peut reprendre la structure et le fonctionnement (ex. Ministry School), jamais sa charte graphique, ses icônes, ses logos ni ses textes.
- Lint React : pas d'appel à `Date.now()` dans le rendu d'un composant ; les calculs qui dépendent de l'heure se font dans `src/lib/donnees/` après `await connection()`.

## Charte graphique (nouvelle charte : style épuré d'après l'image des responsables, novembre 2026)
- Couleurs : bleu-violet `#4953d6` (`accent`, assez foncé pour du texte blanc ; `#6b78f5` en mode sombre), bleu-violet clair `#dfe3fd`, noir `#0b0b10`, texte `#3b3d4f`, fond lavande `#eceefa`, cartes blanches. L'orange `#e95609` ne sert plus qu'aux alertes et à « à valider ».
- Polices (retour à l'ancien choix de l'utilisateur) : **Antonio** (titres, condensés, majuscules) et **Poppins** (texte), via `next/font`.
- Lisibilité (demande de l'utilisateur) : le gris ne sert que de fond, jamais de texte pâle ; texte secondaire = `text-doux`. Tout nouveau texte doit rester lisible en mode clair ET sombre.
- Éléments : logo MLK / Parcours / Finances sans trait de pinceau rose (un nouveau logo sera fourni par l'équipe), boutons principaux noirs (`btn-principal`) ou bleu-violet (`btn-accent`) très arrondis, cartes blanches très arrondies, menu blanc.
- Ne reprendre **ni style, ni icônes, ni logos, ni textes** d'un autre projet (notamment `Campus-MLK-Portail`). Un logo fourni sous forme de fichier est utilisé tel quel, jamais redessiné.
- Mode sombre : réservé à l'espace connecté, via `data-theme="sombre"` sur le conteneur `#espace-connecte` (bouton lune / soleil en haut à droite, choix mémorisé sur l'appareil). Les surcharges sombres sont dans `@layer utilities` à la fin de `src/app/globals.css` ; toute nouvelle couleur doit y être vérifiée.
- Page de référence visuelle : `/charte`. Ancien site HTML de référence : `archive/maquette-html/`.
