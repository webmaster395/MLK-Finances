// Vérifie que la fusion cours + séances (migration 20261124154212) reprend bien le contenu existant :
// description et objectifs du cours, devoirs devenus « travaux à faire après », documents rattachés à la session.
// Lancé avec `npm run test:rls`.

import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
const lire = (chemin) => readFileSync(join(racine, chemin), "utf8");
const FUSION = "20261124154212_sessions_fusionnees.sql";

let db;

before(async () => {
  db = new PGlite({ extensions: { pgcrypto } });
  await db.exec(lire("tests/support/supabase-simule.sql"));
  const migrations = readdirSync(join(racine, "migrations")).filter((f) => f.endsWith(".sql")).sort();
  for (const fichier of migrations.filter((f) => f < FUSION)) await db.exec(lire(`migrations/${fichier}`));

  // Contenu « ancien modèle » : un cours avec une séance, deux devoirs, un document ; un cours sans séance
  await db.exec(`
    insert into public.cours (id, titre, description, objectifs, publie) values
      ('cccccccc-0000-4000-8000-000000000001', 'Module 1', 'Description du module', array['Objectif A', 'Objectif B'], true),
      ('cccccccc-0000-4000-8000-000000000002', 'Module sans séance', '', '{}', true);
    insert into public.sessions (id, cours_id, titre, debut, lieu, description, intervenants) values
      ('55555555-0000-4000-8000-000000000001', 'cccccccc-0000-4000-8000-000000000001', 'Séance 1', '2027-01-09 09:30+01', 'En visioconférence', 'Détail de la séance', array['Pasteur']);
    insert into public.devoirs (cours_id, titre, consigne, echeance) values
      ('cccccccc-0000-4000-8000-000000000001', 'Premier devoir', 'Faire le bilan', '2027-01-14 18:00+01'),
      ('cccccccc-0000-4000-8000-000000000001', 'Second devoir', '', '2027-01-15 18:00+01');
    insert into public.ressources (id, cours_id, titre, type, url) values
      ('66666666-0000-4000-8000-000000000001', 'cccccccc-0000-4000-8000-000000000001', 'Lien du module', 'lien', 'https://www.canva.com/'),
      ('66666666-0000-4000-8000-000000000002', 'cccccccc-0000-4000-8000-000000000002', 'Lien orphelin', 'lien', 'https://example.com/');
  `);
  await db.exec(lire(`migrations/${FUSION}`));
});

after(async () => {
  await db.close();
});

test("la session reprend la description et les objectifs du cours", async () => {
  const r = await db.query("select description, objectifs from public.sessions where id = '55555555-0000-4000-8000-000000000001'");
  assert.equal(r.rows[0].description, "Description du module\n\nDétail de la séance");
  assert.deepEqual(r.rows[0].objectifs, ["Objectif A", "Objectif B"]);
});

test("les devoirs deviennent les travaux à faire après la session, dans l'ordre des échéances", async () => {
  const r = await db.query("select travaux_avant, travaux_apres from public.sessions where id = '55555555-0000-4000-8000-000000000001'");
  assert.equal(r.rows[0].travaux_apres, "Premier devoir\nFaire le bilan\n\nSecond devoir");
  assert.equal(r.rows[0].travaux_avant, "");
});

test("le document du cours est rattaché à sa session ; celui d'un cours sans séance est retiré", async () => {
  const r = await db.query("select id, session_id from public.ressources order by id");
  assert.deepEqual(r.rows, [{ id: "66666666-0000-4000-8000-000000000001", session_id: "55555555-0000-4000-8000-000000000001" }]);
});

test("plus de cours, de devoirs, de rendus, de lieu ni d'intervenants", async () => {
  const tables = await db.query("select table_name from information_schema.tables where table_schema = 'public' and table_name in ('cours', 'devoirs', 'rendus')");
  assert.deepEqual(tables.rows, []);
  const colonnes = await db.query("select column_name from information_schema.columns where table_schema = 'public' and table_name = 'sessions' and column_name in ('cours_id', 'lieu', 'intervenants')");
  assert.deepEqual(colonnes.rows, []);
});
