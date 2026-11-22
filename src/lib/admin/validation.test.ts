// Test des règles de saisie de l'espace admin : npm run test:unit
import { test } from "node:test";
import assert from "node:assert/strict";
import { estDate, estUuid, validerGroupe } from "./validation.ts";

test("un identifiant doit être un UUID", () => {
  assert.equal(estUuid("aaaaaaaa-0000-4000-8000-000000000001"), true);
  assert.equal(estUuid("1; drop table groupes"), false);
  assert.equal(estUuid(""), false);
});

test("une date doit exister dans le calendrier", () => {
  assert.equal(estDate("2026-09-01"), true);
  assert.equal(estDate("2026-02-31"), false);
  assert.equal(estDate("01/09/2026"), false);
});

test("un groupe a un nom, et des dates facultatives dans le bon ordre", () => {
  assert.deepEqual(validerGroupe({ nom: "  Promo A  ", debut: "", fin: "" }), {
    groupe: { nom: "Promo A", debut: null, fin: null },
  });
  assert.deepEqual(validerGroupe({ nom: "Promo B", debut: "2026-09-01", fin: "2027-06-30" }), {
    groupe: { nom: "Promo B", debut: "2026-09-01", fin: "2027-06-30" },
  });
  assert.ok("message" in validerGroupe({ nom: "   ", debut: "", fin: "" }));
  assert.ok("message" in validerGroupe({ nom: "x".repeat(151), debut: "", fin: "" }));
  assert.ok("message" in validerGroupe({ nom: "Promo C", debut: "2027-01-01", fin: "2026-01-01" }));
  assert.ok("message" in validerGroupe({ nom: "Promo D", debut: "2026-13-01", fin: "" }));
});
