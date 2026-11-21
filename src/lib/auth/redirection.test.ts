// Test de la redirection sûre : npm run test:redirection
import { test } from "node:test";
import assert from "node:assert/strict";
import { cheminSur } from "./redirection.ts";

test("accepte les chemins internes du site", () => {
  assert.equal(cheminSur("/cours"), "/cours");
  assert.equal(cheminSur("/devoirs?id=12"), "/devoirs?id=12");
  assert.equal(cheminSur("/cours/mon-module"), "/cours/mon-module");
  assert.equal(cheminSur("/reinitialiser-mot-de-passe", "/x"), "/reinitialiser-mot-de-passe");
});

test("refuse les adresses vers un autre site", () => {
  assert.equal(cheminSur("https://faux-site.com"), "/accueil");
  assert.equal(cheminSur("http://faux-site.com/cours"), "/accueil");
  assert.equal(cheminSur("//faux-site.com"), "/accueil");
  assert.equal(cheminSur("/\\faux-site.com"), "/accueil");
  assert.equal(cheminSur("\\\\faux-site.com"), "/accueil");
  assert.equal(cheminSur("javascript:alert(1)"), "/accueil");
  assert.equal(cheminSur("cours"), "/accueil");
});

test("refuse les valeurs vides, trop longues ou inattendues", () => {
  assert.equal(cheminSur(""), "/accueil");
  assert.equal(cheminSur(null), "/accueil");
  assert.equal(cheminSur(undefined), "/accueil");
  assert.equal(cheminSur(["/cours"]), "/accueil");
  assert.equal(cheminSur("/" + "a".repeat(300)), "/accueil");
  assert.equal(cheminSur("/cours\n//faux-site.com"), "/accueil");
  assert.equal(cheminSur("/cours<script>"), "/accueil");
});

test("utilise la valeur par défaut demandée", () => {
  assert.equal(cheminSur("https://faux-site.com", ""), "");
  assert.equal(cheminSur(undefined, "/profil"), "/profil");
});
