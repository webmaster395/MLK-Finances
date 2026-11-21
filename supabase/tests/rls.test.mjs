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
const A = "11111111-1111-4111-8111-111111111111"; // participant test 1 (groupe 1)
const B = "22222222-2222-4222-8222-222222222222"; // participant test 2 (groupe 2)
const DEVOIR_G1 = "dddddddd-0000-4000-8000-000000000001";
const DEVOIR_G2 = "dddddddd-0000-4000-8000-000000000011";
const COURS_G2 = "cccccccc-0000-4000-8000-000000000011";

const TABLES = [
  "profils", "groupes", "inscriptions", "cours", "sessions",
  "ressources", "devoirs", "rendus", "temoignages", "rubriques", "annonces",
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
      values ('${COURS_G2}', '[test] Fichier du groupe 2', 'fichier', 'groupe2/doc.pdf');
    insert into storage.objects (bucket_id, name) values
      ('ressources', 'test/guide-epargne.pdf'),
      ('ressources', 'groupe2/doc.pdf'),
      ('ressources', 'orphelin.pdf'),
      ('rendus', '${B}/${DEVOIR_G2}/rendu-de-b.pdf');
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

  test("le schéma privé est fermé aux visiteurs et aux participants", async () => {
    const r = await db.query(`
      select has_schema_privilege('anon', 'private', 'usage') as anon,
             has_schema_privilege('authenticated', 'private', 'usage') as auth`);
    assert.equal(r.rows[0].anon, false);
    assert.equal(r.rows[0].auth, false);
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

describe("profil et groupes", () => {
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

  test("A ne voit que son groupe et ses inscriptions", async () => {
    const g = await en(A, "select id from public.groupes");
    const i = await en(A, "select participant_id from public.inscriptions");
    assert.equal(g.rows.length, 1);
    assert.deepEqual(i.rows.map((l) => l.participant_id), [A]);
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
  test("A voit les 3 cours publiés de son groupe, ni le brouillon ni ceux de l'autre groupe", async () => {
    const r = await en(A, "select titre from public.cours");
    assert.equal(r.rows.length, 3);
    assert.ok(titres(r).every((t) => /^\[test\] Module [123] /.test(t)));
  });

  test("B ne voit que le cours de son groupe", async () => {
    const r = await en(B, "select titre from public.cours");
    assert.deepEqual(titres(r), ["[test] Module A — Groupe 2 uniquement"]);
  });

  test("A ne voit que les sessions de son groupe", async () => {
    const r = await en(A, "select titre from public.sessions");
    assert.equal(r.rows.length, 6);
    assert.ok(titres(r).every((t) => !t.includes("Groupe 2")));
  });

  test("A ne voit que les ressources et devoirs de ses cours", async () => {
    const res = await en(A, "select titre from public.ressources");
    const dev = await en(A, "select titre from public.devoirs");
    assert.equal(res.rows.length, 2);
    assert.equal(dev.rows.length, 3);
    assert.ok([...titres(res), ...titres(dev)].every((t) => !t.includes("groupe 2") && !t.includes("Groupe 2")));
  });

  test("A ne voit que les témoignages validés", async () => {
    const r = await en(A, "select nom_affiche from public.temoignages");
    assert.equal(r.rows.length, 3);
  });

  test("A ne peut rien écrire dans le contenu pédagogique", async () => {
    await assert.rejects(en(A, "insert into public.cours (groupe_id, titre) select id, 'x' from public.groupes"), REFUS);
    await assert.rejects(en(A, "update public.devoirs set titre = 'x'"), REFUS);
    await assert.rejects(en(A, "delete from public.sessions"), REFUS);
    await assert.rejects(en(A, "insert into public.temoignages (nom_affiche, texte, valide) values ('x', 'x', true)"), REFUS);
  });
});

describe("rubriques, intervenants et messages de l'équipe", () => {
  test("les rubriques sont lisibles par un participant, pas par un visiteur", async () => {
    const r = await en(A, "select nom from public.rubriques order by ordre");
    assert.deepEqual(r.rows.map((l) => l.nom), ["Accueil", "Formation", "Atelier pratique", "Évaluation"]);
    await assert.rejects(anonyme("select * from public.rubriques"), REFUS);
    await assert.rejects(en(A, "insert into public.rubriques (nom, couleur) values ('Pirate', '#000000')"), REFUS);
  });

  test("la couleur d'une rubrique doit être un code hexadécimal", async () => {
    await assert.rejects(db.exec("insert into public.rubriques (nom, couleur) values ('Mauvaise', 'rouge')"), /check constraint/i);
  });

  test("A voit une séance avec sa rubrique et ses intervenants", async () => {
    const r = await en(A, "select s.titre, s.intervenants, r.nom as rubrique from public.sessions s left join public.rubriques r on r.id = s.rubrique_id where s.titre like '%Session 2%'");
    assert.equal(r.rows.length, 1);
    assert.deepEqual(r.rows[0].intervenants, ["Claire Martin", "Karim Benali"]);
    assert.equal(r.rows[0].rubrique, "Formation");
  });

  test("A voit les messages publiés pour tous ou pour son groupe, pas ceux de l'autre groupe ni les brouillons", async () => {
    const r = await en(A, "select titre from public.annonces order by cree_le desc");
    assert.deepEqual(r.rows.map((l) => l.titre), ["[test] Prochaine journée", "[test] Message pour tous"]);
  });

  test("B ne voit que le message de son groupe et le message général", async () => {
    const r = await en(B, "select titre from public.annonces order by cree_le desc");
    assert.deepEqual(r.rows.map((l) => l.titre), ["[test] Message du groupe 2", "[test] Message pour tous"]);
  });

  test("un visiteur ne lit aucun message et un participant ne peut pas en écrire", async () => {
    await assert.rejects(anonyme("select * from public.annonces"), REFUS);
    await assert.rejects(en(A, "insert into public.annonces (message) values ('piratage')"), REFUS);
    await assert.rejects(en(A, "update public.annonces set message = 'x'"), REFUS);
    await assert.rejects(en(A, "delete from public.annonces"), REFUS);
  });
});

describe("rendus (devoirs déposés)", () => {
  test("A voit son rendu du seed, B ne le voit pas", async () => {
    assert.equal((await en(A, "select id from public.rendus")).rows.length, 1);
    assert.equal((await en(B, "select id from public.rendus")).rows.length, 0);
  });

  test("A peut déposer un rendu pour un devoir de son groupe", async () => {
    const r = await en(A, `
      insert into public.rendus (devoir_id, participant_id, fichier_path, nom_fichier)
      values ('${DEVOIR_G1}', '${A}', '${A}/${DEVOIR_G1}/budget.pdf', 'budget.pdf') returning statut`);
    assert.equal(r.rows[0].statut, "depose");
  });

  test("A ne peut pas déposer pour un devoir de l'autre groupe", async () => {
    await assert.rejects(en(A, `
      insert into public.rendus (devoir_id, participant_id, fichier_path)
      values ('${DEVOIR_G2}', '${A}', '${A}/${DEVOIR_G2}/x.pdf')`), REFUS);
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

  test("A ne peut pas envoyer de fichier pour un devoir de l'autre groupe", async () => {
    await assert.rejects(en(A, `
      insert into storage.objects (bucket_id, name) values ('rendus', '${A}/${DEVOIR_G2}/x.pdf')`), REFUS);
  });

  test("A ne voit pas les fichiers rendus par B", async () => {
    const r = await en(A, "select name from storage.objects where bucket_id = 'rendus'");
    assert.ok(r.rows.every((l) => l.name.startsWith(`${A}/`)));
  });

  test("A ne lit que les fichiers de ressources de ses cours", async () => {
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
