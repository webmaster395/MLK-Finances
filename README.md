# MLK Parcours Finances

Portail de formation pour les **participants** (phase 1 terminée). L'espace **administrateur** viendra en phase 2.
Feuille de route, décisions et limites : `PLAN.md`. Règles du projet : `CLAUDE.md`.

## Lancer le projet en local
1. Copier `.env.example` en `.env.local` et remplir l'adresse du projet Supabase et la clé **publique** (Supabase > Project Settings > API). Aucune clé secrète n'est nécessaire.
2. Installer et lancer :
```
npm install
npm run dev
```
3. Ouvrir http://localhost:3000

## Les pages
| Public | Espace participant (connexion obligatoire) |
|---|---|
| `/connexion`, `/inscription`, `/mot-de-passe-oublie`, `/reinitialiser-mot-de-passe` | `/accueil`, `/sessions` (calendrier + cours), `/devoirs`, `/ressources`, `/temoignages`, `/profil` |
| `/charte` (référence visuelle) | détails : `/sessions/[id]` (séance + fiche du cours), `/devoirs/[id]` |

## Vérifier avant d'envoyer
```
npm run lint            # qualité du code
npx tsc --noEmit        # types
npm run build           # compilation complète
npm run test:unit       # règles (dates, devoirs, profil, redirections)
npm run test:rls        # sécurité de la base : chaque participant ne voit que ses données
```

## Dossiers
- `src/app/` : pages (`(public)` et `(participant)`), `src/components/`, `src/lib/` (accès aux données, règles, Supabase)
- `supabase/` : migrations de la base, données de démo `[test]`, tests de sécurité (voir `supabase/README.md`)
- `archive/maquette-html/` : première version HTML du site (référence visuelle, intacte)
- `docs/` : prompt modèle d'origine
