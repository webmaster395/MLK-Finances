# Base de données (Supabase)

Ce dossier contient tout ce qui décrit la base de données du portail.

| Élément | Rôle |
|---|---|
| `migrations/` | Évolutions de la base, appliquées dans l'ordre. **Le nom du fichier est la version enregistrée par Supabase : ne jamais renommer un fichier déjà appliqué.** Une nouvelle évolution = un nouveau fichier. |
| `seed.sql` | Données de démonstration, toutes marquées « [test] ». Local uniquement. |
| `tests/rls.test.mjs` | Test d'isolation des droits : un participant ne voit que ses données. |
| `tests/support/supabase-simule.sql` | Simulation minimale de Supabase, utilisée seulement par le test. |

## Lancer le test des droits (aucune installation à faire)
```
npm run test:rls
```
Il utilise une base PostgreSQL embarquée (PGlite) : pas besoin de Docker ni de compte Supabase.
Il fait tourner les migrations et le seed, puis vérifie ce qu'un participant peut et surtout **ne peut pas** faire.

## Limite connue
Le test tourne sur une **simulation** de Supabase (rôles, `auth.uid()`, stockage). Il valide la logique des droits,
pas l'intégration réelle avec Supabase Auth et Storage. Dès que Docker et la CLI Supabase seront installés :
1. `supabase init` (crée `config.toml`), puis `supabase start`
2. `supabase db reset` (applique migrations et seed sur une vraie base locale)
3. régénérer les types : `supabase gen types typescript --local > src/lib/supabase/database.types.ts`
4. rejouer les vérifications de droits sur la vraie base.

## Règles de conception (voir `CLAUDE.md`)
- Sécurité par ligne (RLS) activée sur toutes les tables ; **rien** pour `anon`.
- Un participant ne voit que son profil, ses rendus et le contenu **publié** de son groupe.
- Le rôle (`participant` / `admin`) ne peut jamais être choisi par la personne : tout nouveau compte est « participant ».
- Fonctions internes dans le schéma `private`, fermé à l'API.
- Fichiers dans trois seaux privés (`rendus`, `photos`, `ressources`), téléchargement par lien signé de 60 secondes.
