// Test des règles du profil : npm run test:unit
import { test } from "node:test";
import assert from "node:assert/strict";
import { cheminPhoto, civiliteValide, trancheAgeValide, verifierPhoto } from "./auth/profil.ts";

test("la photo doit être une image légère JPG, PNG ou WebP", () => {
  assert.equal(verifierPhoto({ size: 500_000, type: "image/jpeg" }), null);
  assert.equal(verifierPhoto({ size: 2 * 1024 * 1024, type: "image/webp" }), null);
  assert.match(verifierPhoto({ size: 2 * 1024 * 1024 + 1, type: "image/png" }) ?? "", /2 Mo/);
  assert.match(verifierPhoto({ size: 1000, type: "image/gif" }) ?? "", /Format non accepté/);
  assert.match(verifierPhoto({ size: 1000, type: "application/pdf" }) ?? "", /Format non accepté/);
  assert.match(verifierPhoto({ size: 0, type: "image/png" }) ?? "", /vide/);
});

test("la civilité et la tranche d'âge ne prennent que les valeurs prévues", () => {
  assert.equal(civiliteValide("madame"), true);
  assert.equal(civiliteValide("monsieur"), true);
  assert.equal(civiliteValide("autre"), false);
  assert.equal(trancheAgeValide("26_35"), true);
  assert.equal(trancheAgeValide("150_ans"), false);
  assert.equal(trancheAgeValide(""), false);
});

test("la photo est rangée dans le dossier de la personne", () => {
  assert.equal(cheminPhoto("u1"), "u1/avatar");
});
