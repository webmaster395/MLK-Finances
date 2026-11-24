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
const SESSION_BROUILLON = "55555555-0000-4000-8000-0000000000b1"; // session NON publiée (créée par le test)

const TABLES = ["profils", "sessions", "ressources", "temoignages", "annonces"];

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
  // Comptes des tests : créés ici, sans mot de passe (aucun compte réel n'est dans le dépôt)
  await db.exec(`
    insert into auth.users (instance_id, id, aud, role, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    values
      ('00000000-0000-0000-0000-000000000000', '${A}', 'authenticated', 'authenticated', 'a@example.com', now(),
       '{"provider":"email","providers":["email"]}', '{"prenom":"Alex","nom":"Test Un","civilite":"monsieur","tranche_age":"26_35"}', now(), now()),
      ('00000000-0000-0000-0000-000000000000', '${B}', 'authenticated', 'authenticated', 'b@example.com', now(),
       '{"provider":"email","providers":["email"]}', '{"prenom":"Sam","nom":"Test Deux","civilite":"madame","tranche_age":"18_25"}', now(), now());`);
  await db.exec(lire("seed.sql"));
  // Cas particuliers créés par le test (indépendants du contenu du seed) : une session non publiée et son document
  await db.exec(`
    insert into public.sessions (id, titre, debut, publie) values ('${SESSION_BROUILLON}', 'Session en préparation', now(), false);
    insert into public.annonces (titre, message, publie) values ('Message en préparation', 'Brouillon', false);
    insert into public.ressources (session_id, titre, type, storage_path)
      values ('${SESSION_BROUILLON}', 'Fichier de la session en préparation', 'fichier', 'brouillon/doc.pdf');
    insert into storage.objects (bucket_id, name) values
      ('ressources', 'test/guide-epargne.pdf'),
      ('ressources', 'brouillon/doc.pdf'),
      ('ressources', 'orphelin.pdf');
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

describe("sessions et documents", () => {
  test("A voit exactement les sessions publiées, pas le brouillon", async () => {
    const vus = await en(A, "select id from public.sessions order by id");
    const publiees = await db.query("select id from public.sessions where publie order by id");
    assert.ok(publiees.rows.length >= 1);
    assert.deepEqual(vus.rows, publiees.rows);
    assert.ok(!vus.rows.some((l) => l.id === SESSION_BROUILLON));
  });
  test("B voit les mêmes sessions que A (une seule promotion)", async () => {
    const a = await en(A, "select titre from public.sessions");
    const b = await en(B, "select titre from public.sessions");
    assert.deepEqual(titres(b), titres(a));
  });
  test("A lit le lien de visioconférence, les travaux et le matériel d'une session", async () => {
    const r = await en(A, "select lien_visio, travaux_avant, travaux_apres, materiel from public.sessions where publie and lien_visio is not null limit 1");
    assert.equal(r.rows.length, 1);
    assert.match(r.rows[0].lien_visio, /^https:\/\//);
  });
  test("la base refuse un lien de visioconférence qui n'est pas en https", async () => {
    await assert.rejects(db.exec("insert into public.sessions (titre, debut, lien_visio) values ('x', now(), 'javascript:alert(1)')"), /check constraint/i);
  });

  test("A ne voit que les documents publiés des sessions publiées", async () => {
    const res = await en(A, "select id from public.ressources order by id");
    const attendues = await db.query("select r.id from public.ressources r join public.sessions s on s.id = r.session_id where r.publie and s.publie order by r.id");
    assert.ok(attendues.rows.length >= 1);
    assert.deepEqual(res.rows, attendues.rows);
  });
  test("A ne voit que les témoignages validés", async () => {
    const r = await en(A, "select valide from public.temoignages");
    assert.ok(r.rows.length >= 1);
    assert.ok(r.rows.every((l) => l.valide === true));
  });
  test("A ne peut rien écrire dans les sessions ni les documents", async () => {
    await assert.rejects(en(A, "insert into public.sessions (titre, debut) values ('x', now())"), REFUS);
    await assert.rejects(en(A, "insert into public.ressources (session_id, titre, type, url) values ('55555555-0000-4000-8000-000000000001', 'x', 'lien', 'https://x.fr')"), REFUS);
    // Modifier ou supprimer : la RLS ne lui laisse aucune ligne (rien ne change)
    assert.equal((await en(A, "update public.sessions set titre = 'x' returning id")).rows.length, 0);
    assert.equal((await en(A, "delete from public.sessions returning id")).rows.length, 0);
    assert.equal((await en(A, "update public.temoignages set valide = true returning id")).rows.length, 0);
    const reste = await db.query("select count(*)::int as n from public.sessions where titre = 'x'");
    assert.equal(reste.rows[0].n, 0);
  });
  test("cours, devoirs et rendus n'existent plus", async () => {
    const r = await db.query("select table_name from information_schema.tables where table_schema = 'public' and table_name in ('cours', 'devoirs', 'rendus')");
    assert.deepEqual(r.rows, []);
  });
});

describe("messages de l'équipe", () => {
  test("A voit les messages publiés, pas les brouillons", async () => {
    const vus = await en(A, "select titre from public.annonces order by cree_le desc");
    const publies = await db.query("select titre from public.annonces where publie order by cree_le desc");
    assert.ok(publies.rows.length >= 1);
    assert.deepEqual(vus.rows, publies.rows);
    assert.ok(!vus.rows.some((l) => l.titre === "Message en préparation"));
  });
  test("B voit les mêmes messages que A", async () => {
    const a = await en(A, "select titre from public.annonces order by cree_le desc");
    const b = await en(B, "select titre from public.annonces order by cree_le desc");
    assert.deepEqual(b.rows, a.rows);
  });
  test("un visiteur ne lit aucun message et un participant ne peut pas en écrire", async () => {
    await assert.rejects(anonyme("select * from public.annonces"), REFUS);
    await assert.rejects(en(A, "insert into public.annonces (message) values ('piratage')"), REFUS);
    assert.equal((await en(A, "update public.annonces set message = 'x' returning id")).rows.length, 0);
    assert.equal((await en(A, "delete from public.annonces returning id")).rows.length, 0);
  });
});

describe("stockage de fichiers", () => {
  test("plus personne ne peut envoyer de fichier dans l'ancien seau des rendus", async () => {
    await assert.rejects(en(A, `insert into storage.objects (bucket_id, name) values ('rendus', '${A}/x/x.pdf')`), REFUS);
  });

  test("A ne lit que les fichiers des documents des sessions publiées", async () => {
    const r = await en(A, "select name from storage.objects where bucket_id = 'ressources'");
    assert.deepEqual(r.rows.map((l) => l.name), ["test/guide-epargne.pdf"]);
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
      update public.profils set role = 'admin' where id = '${ADMIN}';`);
  });

  test("« est_admin » répond vrai pour l'admin, faux pour un participant", async () => {
    assert.equal((await en(ADMIN, "select private.est_admin() as v")).rows[0].v, true);
    assert.equal((await en(A, "select private.est_admin() as v")).rows[0].v, false);
  });

  test("l'admin voit tout : profils, brouillons et contenus", async () => {
    for (const table of TABLES) {
      assert.equal(await compter(ADMIN, table), await total(table), `l'admin doit tout voir dans « ${table} »`);
    }
  });

  test("l'admin crée, modifie et supprime une session, un document et un message", async () => {
    const s = await en(ADMIN, "insert into public.sessions (titre, debut, lien_visio) values ('[test] Session admin', now(), 'https://zoom.us/j/1') returning id");
    const session = s.rows[0].id;
    await en(ADMIN, `insert into public.ressources (session_id, titre, type, url) values ('${session}', '[test] Lien admin', 'lien', 'https://www.canva.com/')`);
    await en(ADMIN, "insert into public.annonces (titre, message) values ('[test] Message admin', 'Bonjour')");
    // Un participant voit le nouveau contenu publié
    assert.equal((await en(A, `select id from public.sessions where id = '${session}'`)).rows.length, 1);
    assert.equal((await en(A, `select id from public.ressources where session_id = '${session}'`)).rows.length, 1);
    assert.equal((await en(A, "select id from public.annonces where titre = '[test] Message admin'")).rows.length, 1);
    // Modification puis suppression (le document part avec la session)
    const m = await en(ADMIN, `update public.sessions set travaux_avant = 'Lire le guide' where id = '${session}' returning id`);
    assert.equal(m.rows.length, 1);
    await en(ADMIN, "delete from public.annonces where titre = '[test] Message admin'");
    const d = await en(ADMIN, `delete from public.sessions where id = '${session}' returning id`);
    assert.equal(d.rows.length, 1);
    assert.equal((await db.query(`select id from public.ressources where session_id = '${session}'`)).rows.length, 0);
  });

  test("l'admin valide un témoignage", async () => {
    const r = await en(ADMIN, "update public.temoignages set valide = true where not valide returning id");
    assert.ok(r.rows.length >= 1);
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
  });

  test("stockage : l'admin gère les fichiers de ressources, un participant non", async () => {
    const r = await en(ADMIN, "insert into storage.objects (bucket_id, name) values ('ressources', 'admin/support.pdf') returning name");
    assert.equal(r.rows.length, 1);
    await assert.rejects(en(A, "insert into storage.objects (bucket_id, name) values ('ressources', 'pirate.pdf')"), REFUS);
    const s = await en(ADMIN, "delete from storage.objects where bucket_id = 'ressources' and name = 'admin/support.pdf' returning name");
    assert.equal(s.rows.length, 1);
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
