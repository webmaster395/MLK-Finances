// Test du format des dates : npm run test:unit
import { test } from "node:test";
import assert from "node:assert/strict";
import { formaterCreneau } from "./format.ts";

test("affiche le créneau à l'heure de Paris (hiver : UTC+1)", () => {
  assert.equal(formaterCreneau("2026-11-24T08:00:00Z", "2026-11-24T11:00:00Z"), "mardi 24 novembre, 09:00 – 12:00");
});

test("affiche l'heure d'été (UTC+2)", () => {
  assert.equal(formaterCreneau("2026-07-07T07:30:00Z"), "mardi 7 juillet, 09:30");
});

test("accepte une session sans heure de fin", () => {
  assert.equal(formaterCreneau("2026-11-24T08:00:00Z", null), "mardi 24 novembre, 09:00");
});
