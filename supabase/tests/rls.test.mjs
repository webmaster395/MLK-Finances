// Test d'isolation des droits (RLS) — lancer avec : npm run test:rls
// Fait tourner les migrations et le seed sur une base PostgreSQL embarquée (PGlite),
// avec une simulation minimale de Supabase (voir support/supabase-simule.sql).
// Un test vérifie ce qu'un participant PEUT voir et, surtout, ce qu'il NE DOIT PAS voir.

import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
const lire = (chemin) => readFileSync(join(racine, chemin), "utf8");

// Identifiants du seed
const A = "11111111-1111-4111-8111-111111111111"; // participant test 1
const B = "22222222-2222-4222-8222-222222222222"; // participant test 2
const DEVOIR_G1 = "dddddddd-0000-4000-8000-000000000001"; // devoir publié (cours publié)
const DEVOIR_BROUILLON = "dddddddd-0000-4000-8000-000000000004"; // devoir d'un cours NON publié
const COURS_BROUILLON = "cccccccc-0000-4000-8000-000000000004";

const TABLES = [
  "profils", "cours", "sessions",
  "ressources", "devoirs", "rendus", "temoignages", "annonces",
];

let db;

/** Exécute une requête comme un participant connecté (rôle « authenticated »). */
async function en(uid, sql) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [uid]);
  await db.exec("set role authenticated");
  try {
    return await db.query(sql);
  } finally {
    await db.exec("reset role");
  }
}

/** Exécute une requête comme un visiteur non connecté (rôle « anon »). */
async function anonyme(sql) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub', '', false)");
  await db.exec("set role anon");
  try {
    return await db.query(sql);
  } finally {
    await db.exec("reset role");
  }
}

const REFUS = /permission denied|row-level security/i;
const titres = (r) => r.rows.map((l) => l.titre).sort();

before(async () => {
  db = new PGlite({ extensions: { pgcrypto } });
  await db.exec(lire("tests/support/supabase-simule.sql"));
  const migrations = readdirSync(join(racine, "migrations")).filter((f) => f.endsWith(".sql")).sort();
  for (const fichier of migrations) await db.exec(lire(`migrations/${fichier}`));
  await db.exec(lire("seed.sql"));
  // Objets de stockage utilisés par les tests
  await db.exec(`
    insert into public.ressources (cours_id, titre, type, storage_path)
      values ('${COURS_BROUILLON}', '[test] Fichier d''un cours non publié', 'fichier', 'brouillon/doc.pdf');
    insert into storage.objects (bucket_id, name) values
      ('ressources', 'test/guide-epargne.pdf'),
      ('ressources', 'brouillon/doc.pdf'),
      ('ressources', 'orphelin.pdf'),
      ('rendus', '${B}/${DEVOIR_G1}/rendu-de-b.pdf');
  `);
});

after(async () => {
  await db.close();
});

describe("structure", () => {
  test("la sécurité par ligne est activée sur toutes les tables", async () => {
    const r = await db.query(`
      select relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity`);
    assert.deepEqual(r.rows, []);
  });

  test("« anon » n'a aucun droit sur les tables publiques", async () => {
    const r = await db.query(`
      select table_name from information_schema.role_table_grants
      where grantee = 'anon' and table_schema = 'public'`);
    assert.deepEqual(r.rows, []);
  });

  test("la fonction rls_auto_enable n'est appelable ni par les visiteurs ni par les participants", async () => {
    const r = await db.query(`
      select has_function_privilege('anon', 'public.rls_auto_enable()', 'execute') as anon,
             has_function_privilege('authenticated', 'public.rls_auto_enable()', 'execute') as auth`);
    assert.equal(r.rows[0].anon, false);
    assert.equal(r.rows[0].auth, false);
  });

  test("le schéma privé est fermé aux visiteurs", async () => {
    const r = await db.query("select has_schema_privilege('anon', 'private', 'usage') as anon");
    assert.equal(r.rows[0].anon, false);
  });

  test("dans le schéma privé, une personne connectée ne peut appeler que « est_admin »", async () => {
    const r = await db.query(`
      select p.proname,
             has_function_privilege('authenticated', p.oid, 'execute') as auth,
             has_function_privilege('anon', p.oid, 'execute') as anon
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'private' order by p.proname`);
    assert.ok(r.rows.length >= 5);
    for (const f of r.rows) {
      assert.equal(f.anon, false, `anon ne doit pas appeler ${f.proname}`);
      assert.equal(f.auth, f.proname === "est_admin", `droit inattendu sur ${f.proname}`);
    }
  });
});

describe("visiteur non connecté", () => {
  for (const table of TABLES) {
    test(`ne peut pas lire « ${table} »`, async () => {
      await assert.rejects(anonyme(`select * from public.${table}`), REFUS);
    });
  }
  test("ne voit aucun fichier", async () => {
    await assert.rejects(anonyme("select * from storage.objects"), REFUS);
  });
});

describe("profil", () => {
  test("A ne voit que son propre profil", async () => {
    const r = await en(A, "select id from public.profils");
    assert.deepEqual(r.rows.map((l) => l.id), [A]);
  });

  test("A ne peut pas modifier le profil de B", async () => {
    const r = await en(A, `update public.profils set prenom = 'Piraté' where id = '${B}' returning id`);
    assert.equal(r.rows.length, 0);
  });

  test("A peut modifier son prénom", async () => {
    const r = await en(A, `update public.profils set prenom = 'Alex' where id = '${A}' returning id`);
    assert.equal(r.rows.length, 1);
  });

  test("A ne peut pas se donner le rôle administrateur", async () => {
    await assert.rejects(en(A, `update public.profils set role = 'admin' where id = '${A}'`), REFUS);
  });

  test("un nouveau compte est toujours « participant », même si on demande « admin »", async () => {
    await db.exec(`
      insert into auth.users (id, email, raw_user_meta_data)
      values ('33333333-3333-4333-8333-333333333333', 'nouveau@example.com',
              '{"prenom":"Nina","nom":"Nouvelle","role":"admin"}')`);
    const r = await db.query("select role, prenom from public.profils where id = '33333333-3333-4333-8333-333333333333'");
    assert.equal(r.rows[0].role, "participant");
    assert.equal(r.rows[0].prenom, "Nina");
  });
});

describe("civilité et tranche d'âge", () => {
  test("le profil enregistre la civilité et la tranche d'âge choisies à l'inscription", async () => {
    await db.exec(`
      insert into auth.users (id, email, raw_user_meta_data)
      values ('44444444-4444-4444-8444-444444444444', 'civilite@example.com',
              '{"prenom":"Léa","nom":"Test","civilite":"Madame","tranche_age":"26_35"}')`);
    const r = await db.query("select civilite, tranche_age from public.profils where id = '44444444-4444-4444-8444-444444444444'");
    assert.equal(r.rows[0].civilite, "madame");
    assert.equal(r.rows[0].tranche_age, "26_35");
  });

  test("les valeurs inattendues sont ignorées à l'inscription", async () => {
    await db.exec(`
      insert into auth.users (id, email, raw_user_meta_data)
      values ('55555555-5555-4555-8555-555555555555', 'invalide@example.com',
              '{"prenom":"Max","nom":"Test","civilite":"autre","tranche_age":"150_ans"}')`);
    const r = await db.query("select civilite, tranche_age from public.profils where id = '55555555-5555-4555-8555-555555555555'");
    assert.equal(r.rows[0].civilite, null);
    assert.equal(r.rows[0].tranche_age, null);
  });

  test("la base refuse une valeur libre", async () => {
    await assert.rejects(db.exec("update public.profils set civilite = 'autre' where id = '" + A + "'"), /check constraint/i);
    await assert.rejects(db.exec("update public.profils set tranche_age = '150_ans' where id = '" + A + "'"), /check constraint/i);
  });

  test("A peut corriger sa tranche d'âge mais pas celle de B", async () => {
    const moi = await en(A, `update public.profils set tranche_age = '36_45' where id = '${A}' returning id`);
    const lui = await en(A, `update public.profils set tranche_age = '36_45' where id = '${B}' returning id`);
    assert.equal(moi.rows.length, 1);
    assert.equal(lui.rows.length, 0);
  });
});

describe("contenu pédagogique", () => {
  test("A voit les 3 cours publiés, pas le brouillon", async () => {
    const r = await en(A, "select titre from public.cours");
    assert.equal(r.rows.length, 3);
    assert.ok(titres(r).every((t) => /^\[test\] Module [123] /.test(t)));
  });

  test("B voit les mêmes cours publiés que A (une seule promotion)", async () => {
    const a = await en(A, "select titre from public.cours");
    const b = await en(B, "select titre from public.cours");
    assert.deepEqual(titres(b), titres(a));
  });

  test("A voit les 6 séances publiées", async () => {
    const r = await en(A, "select titre from public.sessions");
    assert.equal(r.rows.length, 6);
  });

  test("une séance non publiée est invisible", async () => {
    await db.exec("insert into public.sessions (titre, debut, publie) values ('[test] Séance cachée', now(), false)");
    const r = await en(A, "select titre from public.sessions where titre = '[test] Séance cachée'");
    assert.equal(r.rows.length, 0);
  });

  test("A ne voit que les ressources et devoirs des cours publiés", async () => {
    const res = await en(A, "select titre from public.ressources");
    const dev = await en(A, "select titre from public.devoirs");
    assert.equal(res.rows.length, 2);
    assert.equal(dev.rows.length, 3);
    assert.ok([...titres(res), ...titres(dev)].every((t) => !t.includes("non publié")));
  });

  test("A ne voit que les témoignages validés", async () => {
    const r = await en(A, "select nom_affiche from public.temoignages");
    assert.equal(r.rows.length, 3);
  });

  test("A ne peut rien écrire dans le contenu pédagogique", async () => {
    await assert.rejects(en(A, "insert into public.cours (titre) values ('x')"), REFUS);
    // Modifier ou supprimer : la RLS ne lui laisse aucune ligne (rien ne change)
    assert.equal((await en(A, "update public.devoirs set titre = 'x' returning id")).rows.length, 0);
    assert.equal((await en(A, "delete from public.sessions returning id")).rows.length, 0);
    assert.equal((await en(A, "update public.temoignages set valide = true returning id")).rows.length, 0);
    const reste = await db.query("select count(*)::int as n from public.devoirs where titre = 'x'");
    assert.equal(reste.rows[0].n, 0);
  });
});

describe("intervenants et messages de l'équipe", () => {
  test("A voit une séance avec ses intervenants", async () => {
    const r = await en(A, "select s.titre, s.intervenants from public.sessions s where s.titre like '%Session 2%'");
    assert.equal(r.rows.length, 1);
    assert.deepEqual(r.rows[0].intervenants, ["Claire Martin", "Karim Benali"]);
  });

  test("A voit les messages publiés, pas les brouillons", async () => {
    const r = await en(A, "select titre from public.annonces order by cree_le desc");
    assert.deepEqual(r.rows.map((l) => l.titre), ["[test] Prochaine journée", "[test] Message pour tous"]);
  });

  test("B voit les mêmes messages que A", async () => {
    const r = await en(B, "select titre from public.annonces order by cree_le desc");
    assert.deepEqual(r.rows.map((l) => l.titre), ["[test] Prochaine journée", "[test] Message pour tous"]);
  });

  test("un visiteur ne lit aucun message et un participant ne peut pas en écrire", async () => {
    await assert.rejects(anonyme("select * from public.annonces"), REFUS);
    await assert.rejects(en(A, "insert into public.annonces (message) values ('piratage')"), REFUS);
    assert.equal((await en(A, "update public.annonces set message = 'x' returning id")).rows.length, 0);
    assert.equal((await en(A, "delete from public.annonces returning id")).rows.length, 0);
  });
});

describe("rendus (devoirs déposés)", () => {
  test("A voit son rendu du seed, B ne le voit pas", async () => {
    assert.equal((await en(A, "select id from public.rendus")).rows.length, 1);
    assert.equal((await en(B, "select id from public.rendus")).rows.length, 0);
  });

  test("A peut déposer un rendu pour un devoir publié", async () => {
    const r = await en(A, `
      insert into public.rendus (devoir_id, participant_id, fichier_path, nom_fichier)
      values ('${DEVOIR_G1}', '${A}', '${A}/${DEVOIR_G1}/budget.pdf', 'budget.pdf') returning statut`);
    assert.equal(r.rows[0].statut, "depose");
  });

  test("A ne peut pas déposer pour le devoir d'un cours non publié", async () => {
    await assert.rejects(en(A, `
      insert into public.rendus (devoir_id, participant_id, fichier_path)
      values ('${DEVOIR_BROUILLON}', '${A}', '${A}/${DEVOIR_BROUILLON}/x.pdf')`), REFUS);
  });

  test("A ne peut pas déposer au nom de B", async () => {
    await assert.rejects(en(A, `
      insert into public.rendus (devoir_id, participant_id, fichier_path)
      values ('${DEVOIR_G1}', '${B}', '${B}/${DEVOIR_G1}/x.pdf')`), REFUS);
  });

  test("A ne peut pas choisir le statut « corrigé »", async () => {
    await assert.rejects(en(A, `update public.rendus set statut = 'corrige' where participant_id = '${A}'`), REFUS);
    await assert.rejects(en(A, `
      insert into public.rendus (devoir_id, participant_id, fichier_path, statut)
      values ('dddddddd-0000-4000-8000-000000000002', '${A}', 'x', 'corrige')`), REFUS);
  });

  test("A peut remplacer son fichier, et la date de dépôt est mise à jour", async () => {
    const avant = await db.query(`select depose_le from public.rendus where participant_id = '${A}' and devoir_id = '${DEVOIR_G1}'`);
    await new Promise((ok) => setTimeout(ok, 20));
    const r = await en(A, `
      update public.rendus set fichier_path = '${A}/${DEVOIR_G1}/budget-v2.pdf', nom_fichier = 'budget-v2.pdf'
      where devoir_id = '${DEVOIR_G1}' returning depose_le`);
    assert.equal(r.rows.length, 1);
    assert.ok(new Date(r.rows[0].depose_le) > new Date(avant.rows[0].depose_le));
  });

  test("A ne peut plus remplacer un rendu déjà corrigé", async () => {
    await db.exec(`update public.rendus set statut = 'corrige' where participant_id = '${A}' and devoir_id = '${DEVOIR_G1}'`);
    const r = await en(A, `update public.rendus set nom_fichier = 'trop-tard.pdf' where devoir_id = '${DEVOIR_G1}' returning id`);
    assert.equal(r.rows.length, 0);
  });

  test("A ne peut pas supprimer de rendu", async () => {
    await assert.rejects(en(A, "delete from public.rendus"), REFUS);
  });
});

describe("stockage de fichiers", () => {
  test("A peut envoyer un fichier dans son dossier, pour un devoir qu'il voit", async () => {
    const r = await en(A, `
      insert into storage.objects (bucket_id, name, owner)
      values ('rendus', '${A}/${DEVOIR_G1}/nouveau.pdf', '${A}') returning name`);
    assert.equal(r.rows.length, 1);
  });

  test("A ne peut plus remplacer le fichier d'un devoir corrigé", async () => {
    // Le rendu du devoir 1 a été marqué « corrigé » plus haut
    const r = await en(A, `update storage.objects set name = name where bucket_id = 'rendus' and name like '${A}/${DEVOIR_G1}/%' returning name`);
    assert.equal(r.rows.length, 0);
  });

  test("A peut remplacer le fichier d'un devoir non corrigé", async () => {
    const devoir2 = "dddddddd-0000-4000-8000-000000000002";
    await en(A, `insert into storage.objects (bucket_id, name, owner) values ('rendus', '${A}/${devoir2}/depot', '${A}')`);
    const r = await en(A, `update storage.objects set name = name where bucket_id = 'rendus' and name = '${A}/${devoir2}/depot' returning name`);
    assert.equal(r.rows.length, 1);
  });

  test("A ne peut pas envoyer dans le dossier de B", async () => {
    await assert.rejects(en(A, `
      insert into storage.objects (bucket_id, name) values ('rendus', '${B}/${DEVOIR_G1}/x.pdf')`), REFUS);
  });

  test("A ne peut pas envoyer de fichier pour le devoir d'un cours non publié", async () => {
    await assert.rejects(en(A, `
      insert into storage.objects (bucket_id, name) values ('rendus', '${A}/${DEVOIR_BROUILLON}/x.pdf')`), REFUS);
  });

  test("A ne voit pas les fichiers rendus par B", async () => {
    const r = await en(A, "select name from storage.objects where bucket_id = 'rendus'");
    assert.ok(r.rows.every((l) => l.name.startsWith(`${A}/`)));
  });

  test("A ne lit que les fichiers de ressources des cours publiés", async () => {
    const r = await en(A, "select name from storage.objects where bucket_id = 'ressources'");
    assert.deepEqual(r.rows.map((l) => l.name), ["test/guide-epargne.pdf"]);
  });

  test("A ne peut pas supprimer un fichier rendu", async () => {
    const r = await en(A, "delete from storage.objects where bucket_id = 'rendus' returning name");
    assert.equal(r.rows.length, 0);
  });

  test("A peut gérer sa photo dans son dossier, pas dans celui de B", async () => {
    const ajout = await en(A, `insert into storage.objects (bucket_id, name, owner) values ('photos', '${A}/avatar', '${A}') returning name`);
    assert.equal(ajout.rows.length, 1);
    await assert.rejects(en(A, `insert into storage.objects (bucket_id, name) values ('photos', '${B}/avatar')`), REFUS);
    const suppression = await en(A, `delete from storage.objects where bucket_id = 'photos' and name = '${A}/avatar' returning name`);
    assert.equal(suppression.rows.length, 1);
  });

  test("B ne voit pas la photo de A", async () => {
    await en(A, `insert into storage.objects (bucket_id, name, owner) values ('photos', '${A}/avatar', '${A}')`);
    const r = await en(B, "select name from storage.objects where bucket_id = 'photos'");
    assert.equal(r.rows.length, 0);
  });

  test("les seaux sont privés", async () => {
    const r = await db.query("select id from storage.buckets where public");
    assert.deepEqual(r.rows, []);
  });
});

describe("administrateur", () => {
  const ADMIN = "77777777-7777-4777-8777-777777777777";
  const compter = async (uid, table) => (await en(uid, `select count(*)::int as n from public.${table}`)).rows[0].n;
  const total = async (table) => (await db.query(`select count(*)::int as n from public.${table}`)).rows[0].n;

  before(async () => {
    // Nomination du premier admin « à la main », comme dans Supabase (hors du site)
    await db.exec(`
      insert into auth.users (id, email, raw_user_meta_data)
      values ('${ADMIN}', 'admin@example.com', '{"prenom":"Adèle","nom":"Admin"}');
      update public.profils set role = 'admin' where id = '${ADMIN}';
      insert into public.rendus (devoir_id, participant_id, fichier_path)
      values ('${DEVOIR_G1}', '${B}', '${B}/${DEVOIR_G1}/rendu-de-b.pdf');`);
  });

  test("« est_admin » répond vrai pour l'admin, faux pour un participant", async () => {
    assert.equal((await en(ADMIN, "select private.est_admin() as v")).rows[0].v, true);
    assert.equal((await en(A, "select private.est_admin() as v")).rows[0].v, false);
  });

  test("l'admin voit tout : profils, brouillons, rendus de chacun et contenus", async () => {
    for (const table of ["profils", "cours", "sessions", "ressources", "devoirs", "rendus", "temoignages", "annonces"]) {
      assert.equal(await compter(ADMIN, table), await total(table), `l'admin doit tout voir dans « ${table} »`);
    }
  });

  test("l'admin crée, modifie et supprime une séance, un cours, un devoir et un message", async () => {
    const c = await en(ADMIN, `insert into public.cours (titre, publie) values ('[test] Cours admin', true) returning id`);
    const cours = c.rows[0].id;
    await en(ADMIN, `insert into public.sessions (cours_id, titre, debut) values ('${cours}', '[test] Séance admin', now()) returning id`);
    await en(ADMIN, `insert into public.devoirs (cours_id, titre) values ('${cours}', '[test] Devoir admin')`);
    await en(ADMIN, `insert into public.ressources (cours_id, titre, type, url) values ('${cours}', '[test] Lien admin', 'lien', 'https://example.com')`);
    await en(ADMIN, "insert into public.annonces (titre, message) values ('[test] Message admin', 'Bonjour')");
    // Un participant voit le nouveau contenu publié
    assert.equal((await en(A, "select id from public.sessions where titre = '[test] Séance admin'")).rows.length, 1);
    assert.equal((await en(A, "select id from public.annonces where titre = '[test] Message admin'")).rows.length, 1);
    // Modification puis suppression
    const m = await en(ADMIN, `update public.cours set titre = '[test] Cours admin modifié' where id = '${cours}' returning id`);
    assert.equal(m.rows.length, 1);
    await en(ADMIN, "delete from public.annonces where titre = '[test] Message admin'");
    const s = await en(ADMIN, `delete from public.cours where id = '${cours}' returning id`);
    assert.equal(s.rows.length, 1);
  });

  test("l'admin valide un témoignage", async () => {
    const r = await en(ADMIN, "update public.temoignages set valide = true where not valide returning id");
    assert.ok(r.rows.length >= 1);
  });

  test("l'admin marque un rendu « corrigé », mais ne peut pas le supprimer", async () => {
    const r = await en(ADMIN, `update public.rendus set statut = 'corrige' where participant_id = '${B}' returning statut`);
    assert.deepEqual(r.rows.map((l) => l.statut), ["corrige"]);
    await assert.rejects(en(ADMIN, "delete from public.rendus"), REFUS);
  });

  test("l'admin nomme un autre admin, puis lui retire le rôle", async () => {
    await en(ADMIN, `update public.profils set role = 'admin' where id = '${B}'`);
    assert.equal((await en(B, "select private.est_admin() as v")).rows[0].v, true);
    await en(ADMIN, `update public.profils set role = 'participant' where id = '${B}'`);
    assert.equal((await en(B, "select private.est_admin() as v")).rows[0].v, false);
  });

  test("l'admin ne peut pas changer son propre rôle", async () => {
    await assert.rejects(en(ADMIN, `update public.profils set role = 'participant' where id = '${ADMIN}'`), REFUS);
  });

  test("un participant ne peut nommer personne admin", async () => {
    await assert.rejects(en(A, `update public.profils set role = 'admin' where id = '${A}'`), REFUS);
    const r = await en(A, `update public.profils set role = 'admin' where id = '${B}' returning id`);
    assert.equal(r.rows.length, 0);
    const b = await db.query(`select role from public.profils where id = '${B}'`);
    assert.equal(b.rows[0].role, "participant");
  });

  test("un participant ne voit toujours que ses propres données", async () => {
    assert.deepEqual((await en(A, "select id from public.profils")).rows.map((l) => l.id), [A]);
    assert.ok((await en(A, "select participant_id from public.rendus")).rows.every((l) => l.participant_id === A));
  });

  test("stockage : l'admin gère les fichiers de ressources, un participant non", async () => {
    const r = await en(ADMIN, "insert into storage.objects (bucket_id, name) values ('ressources', 'admin/support.pdf') returning name");
    assert.equal(r.rows.length, 1);
    await assert.rejects(en(A, "insert into storage.objects (bucket_id, name) values ('ressources', 'pirate.pdf')"), REFUS);
    const s = await en(ADMIN, "delete from storage.objects where bucket_id = 'ressources' and name = 'admin/support.pdf' returning name");
    assert.equal(s.rows.length, 1);
  });

  test("stockage : l'admin lit les fichiers rendus sans pouvoir les supprimer ni les remplacer", async () => {
    const r = await en(ADMIN, `select name from storage.objects where bucket_id = 'rendus' and name like '${B}/%'`);
    assert.ok(r.rows.length >= 1);
    assert.equal((await en(ADMIN, "delete from storage.objects where bucket_id = 'rendus' returning name")).rows.length, 0);
    assert.equal((await en(ADMIN, "update storage.objects set name = name where bucket_id = 'rendus' returning name")).rows.length, 0);
  });

  test("stockage : un participant voit la photo d'un témoignage validé, jamais celle d'un témoignage non validé ni la photo d'un autre", async () => {
    const valide = { id: "eeeeeeee-0000-4000-8000-000000000001" };
    const brouillon = { id: "eeeeeeee-0000-4000-8000-000000000002" };
    await db.exec(`
      insert into public.temoignages (id, nom_affiche, texte, valide, photo_path) values
        ('${valide.id}', 'Photo validée', 'x', true, 'temoignages/${valide.id}/photo'),
        ('${brouillon.id}', 'Photo non validée', 'x', false, 'temoignages/${brouillon.id}/photo');
      insert into storage.objects (bucket_id, name) values
        ('photos', 'temoignages/${valide.id}/photo'),
        ('photos', 'temoignages/${brouillon.id}/photo');`);
    const vues = await en(A, "select name from storage.objects where bucket_id = 'photos' and name like 'temoignages/%'");
    assert.deepEqual(vues.rows.map((l) => l.name), [`temoignages/${valide.id}/photo`]);
    // Elle ne peut ni être remplacée ni supprimée par un participant
    assert.equal((await en(A, `delete from storage.objects where name = 'temoignages/${valide.id}/photo' returning name`)).rows.length, 0);
    await assert.rejects(en(A, "insert into storage.objects (bucket_id, name) values ('photos', 'temoignages/pirate/photo')"), REFUS);
  });

  test("stockage : l'admin écrit dans « photos/temoignages », pas dans le dossier d'un participant", async () => {
    const r = await en(ADMIN, "insert into storage.objects (bucket_id, name) values ('photos', 'temoignages/photo.jpg') returning name");
    assert.equal(r.rows.length, 1);
    await assert.rejects(en(ADMIN, `insert into storage.objects (bucket_id, name) values ('photos', '${A}/avatar')`), REFUS);
    await assert.rejects(en(A, "insert into storage.objects (bucket_id, name) values ('photos', 'temoignages/pirate.jpg')"), REFUS);
  });
});

describe("témoignage proposé par un participant", () => {
  const ADMIN = "77777777-7777-4777-8777-777777777777"; // créé dans le bloc « administrateur »
  const leSien = async (uid) => (await en(uid, `select id, texte, valide, nom_affiche, photo_path from public.temoignages where auteur_id = '${uid}'`)).rows;

  test("A propose un témoignage : il est « à valider », signé de son nom, même s'il tente de tricher", async () => {
    const r = await en(A, `insert into public.temoignages (texte, nom_affiche, valide, photo_path)
      values ('Un parcours très utile.', 'Quelqu''un d''autre', true, 'temoignages/pirate/photo')
      returning nom_affiche, valide, photo_path, auteur_id`);
    assert.equal(r.rows[0].valide, false);
    assert.equal(r.rows[0].nom_affiche, "Alex T.");
    assert.equal(r.rows[0].photo_path, null);
    assert.equal(r.rows[0].auteur_id, A);
  });

  test("A voit son témoignage en attente ; B ne le voit pas", async () => {
    assert.equal((await leSien(A)).length, 1);
    assert.equal((await en(B, "select id from public.temoignages where texte = 'Un parcours très utile.'")).rows.length, 0);
  });

  test("A ne peut pas en proposer un second, même en se faisant passer pour B", async () => {
    await assert.rejects(en(A, "insert into public.temoignages (texte, nom_affiche) values ('Encore', 'x')"), /unique|duplicate/i);
    // L'auteur est imposé par la base : la tentative « au nom de B » reste un second témoignage de A
    await assert.rejects(en(A, `insert into public.temoignages (texte, nom_affiche, auteur_id) values ('Encore', 'x', '${B}')`), /unique|duplicate/i);
    assert.equal((await en(B, `select id from public.temoignages where auteur_id = '${B}'`)).rows.length, 0);
  });

  test("A peut le modifier tant qu'il n'est pas validé, sans pouvoir le valider lui-même", async () => {
    const r = await en(A, `update public.temoignages set texte = 'Texte corrigé.', valide = true where auteur_id = '${A}' returning texte, valide`);
    assert.deepEqual(r.rows[0], { texte: "Texte corrigé.", valide: false });
  });

  test("une fois validé par l'admin, A ne peut plus le modifier ni le retirer, et il est publié", async () => {
    const id = (await leSien(A))[0].id;
    await en(ADMIN, `update public.temoignages set valide = true where id = '${id}'`);
    assert.equal((await en(A, `update public.temoignages set texte = 'Après coup' where id = '${id}' returning id`)).rows.length, 0);
    assert.equal((await en(A, `delete from public.temoignages where id = '${id}' returning id`)).rows.length, 0);
    assert.equal((await en(B, `select id from public.temoignages where id = '${id}'`)).rows.length, 1);
  });

  test("B peut retirer son témoignage tant qu'il n'est pas validé", async () => {
    await en(B, "insert into public.temoignages (texte, nom_affiche) values ('À retirer', 'x')");
    const r = await en(B, `delete from public.temoignages where auteur_id = '${B}' returning id`);
    assert.equal(r.rows.length, 1);
  });

  test("un visiteur ne peut pas proposer de témoignage", async () => {
    await assert.rejects(anonyme("insert into public.temoignages (texte, nom_affiche) values ('x', 'x')"), REFUS);
  });
});
