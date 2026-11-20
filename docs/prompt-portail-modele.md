# Prompt modèle : portail connecté (espace apprenants)

À copier-coller en début de projet. Remplacer tout ce qui est entre [crochets].

---

Tu vas construire **[NOM DU PROJET]**, un portail connecté pour [type d'utilisateurs : apprentis, élèves, membres…]
de [NOM DE L'ORGANISATION]. Je ne suis pas développeur : explique simplement, réponds en français,
et dis clairement ce qui vient de ma demande et ce que tu décides toi-même.

## 1. Ce qu'on reprend, et ce qu'on ne reprend pas

On s'inspire uniquement de la **structure et du fonctionnement** d'un portail d'apprentissage
(menu latéral, pages, parcours). On ne reprend **ni la charte graphique, ni les icônes, ni les logos,
ni les textes** d'un autre projet. La charte de ce projet est la suivante :
[couleurs, polices, logo (fichiers fournis), ton, forme des boutons et des cartes]. Les logos sont
toujours utilisés tels quels, jamais redessinés.

## 2. Périmètre de la phase 1

Un seul rôle : **[étudiant]**. Pas d'espace formateur ni d'administration, pas d'abstraction de rôles
anticipée. Ces espaces viendront en phase 2.

## 3. Pages à construire (maquette de présentation)

Une coquille commune : menu latéral repliable sur ordinateur, barre du bas ou menu sur téléphone,
en-tête avec nom de la personne, accès messages et déconnexion.

1. **Connexion / inscription / mot de passe oublié** : pages claires, sans défilement sur ordinateur.
2. **Accueil** : salutation, prochaines séances, devoirs à rendre, dernières notes, annonces.
3. **Calendrier** : vues mois et semaine, distinction visuelle entre présence au centre et période en
   entreprise, clic sur un jour pour voir le détail.
4. **Mes cours** : liste des modules, page de détail (description, objectifs, séances, supports).
5. **Mes ressources** : supports classés par module.
6. **Travail à rendre** : liste avec statuts (à rendre, bientôt dû, en retard, rendu) et dépôt de fichier.
7. **Notes** : résultats par module, type d'évaluation, coefficient, moyenne indicative.
8. **Messages / annonces** : lecture seule en phase 1.
9. **Profil** : photo, informations, civilité, formation.
10. États vides soignés partout, mode clair et sombre (réservé à l'espace connecté), responsive vérifié à 375 px.

## 4. Choix techniques (acquis sur un projet précédent)

- **Next.js** (dernière version, App Router) + TypeScript + Tailwind + **Supabase**.
  Lire `node_modules/next/dist/docs/` avant de coder : la version peut différer de ce que tu connais.
- **Cache Components activé** : toute lecture de session ou de données par utilisateur est dans un
  composant sous `<Suspense>` ou une route avec `loading.tsx`. Chaque page a son `loading.tsx`.
  Un composant client qui lit `usePathname()` ou `useSearchParams()` doit être sous `<Suspense>`,
  y compris dans le layout racine.
- **Supabase** : RLS activée sur toutes les tables, droits explicites (rien pour `anon`), jamais de
  clé `service_role` dans le code de l'espace étudiant, fonctions internes dans un schéma `private`,
  migrations versionnées dans `supabase/migrations/` (nom de fichier = version enregistrée),
  types régénérés, test d'isolation RLS dans `supabase/tests/`. Dates en `timestamptz`, affichées en `fr-FR`.
- **Fichiers déposés** : envoyés du navigateur vers Supabase Storage (RLS sur les buckets), puis une
  action serveur enregistre le chemin. Jamais de fichier dans le corps d'une action serveur.
  Téléchargements par URL signées de 60 secondes.
- **Auth** : connexion et déconnexion par actions serveur, redirections après lien d'e-mail protégées.
- **CSS** : styles de base et classes de charte dans des `@layer`, rien hors couche (sinon les
  utilitaires Tailwind sont battus).
- Données de démo (seed) clairement marquées « test » dans les titres de cours.

## 5. Façon de travailler

- Commence par écrire un `PLAN.md` (feuille de route, schéma de base prévu, avancement) et un
  `CLAUDE.md` (règles du projet) : ils servent de passation si un autre assistant reprend le travail.
- **Deux branches** : `main` = production, jamais de travail dessus ; `preview` = travail courant.
  Fusion dans `main` seulement quand je la demande.
- Avant chaque envoi : `npm run lint`, `npx tsc --noEmit`, `npm run build`.
- Découpe en petits lots utilisables seuls (un commit par lot). Pour chaque lot, montre-moi le
  résultat avant de passer au suivant.
- Avant de coder, recommande-moi le modèle et le niveau d'effort adaptés.
- Les actions sensibles (données en production, fusion dans `main`, suppression) : demande-moi d'abord.

## 6. Pour commencer

1. Pose-moi au plus 5 questions sur ce qui manque (charte, rôles, données de démo, hébergement).
2. Propose le plan et le schéma de base de données, puis attends mon accord.
3. Construis la coquille (menu, en-tête, pages vides avec `loading.tsx`), puis les pages une par une.
