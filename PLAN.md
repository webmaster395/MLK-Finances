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
- [ ] Plan et schéma validés par l'utilisateur
- [ ] Lot 0
