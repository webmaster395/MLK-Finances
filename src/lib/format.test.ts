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

test("sépare le jour et le mois pour le petit calendrier", async () => {
  const { partiesDate, formaterHoraires, formaterJourComplet } = await import("./format.ts");
  assert.deepEqual(partiesDate("2026-11-24T08:00:00Z"), { jour: "24", mois: "nov." });
  assert.equal(formaterHoraires("2026-11-24T08:00:00Z", "2026-11-24T11:00:00Z"), "09:00 – 12:00");
  assert.equal(formaterJourComplet("2026-11-24T08:00:00Z"), "mardi 24 novembre 2026");
});

test("un horaire proche de minuit reste dans le bon jour à Paris", async () => {
  const { partiesDate } = await import("./format.ts");
  // 23:30 UTC le 24 = 00:30 le 25 à Paris (hiver)
  assert.equal(partiesDate("2026-11-24T23:30:00Z").jour, "25");
});

test("le jour calendaire est celui de Paris, pas celui de l'UTC", async () => {
  const { jourParis } = await import("./format.ts");
  assert.equal(jourParis("2026-11-24T23:30:00Z"), "2026-11-25"); // 00:30 à Paris
  assert.equal(jourParis("2026-11-24T08:00:00Z"), "2026-11-24");
});

test("nombre de jours entre deux jours (J-14)", async () => {
  const { joursEntre } = await import("./format.ts");
  assert.equal(joursEntre("2026-11-21", "2026-12-05"), 14);
  assert.equal(joursEntre("2026-12-05", "2026-12-05"), 0);
  assert.equal(joursEntre("2026-12-05", "2026-12-01"), -4);
  assert.equal(joursEntre("2026-10-24", "2026-10-26"), 2); // passage à l'heure d'hiver
});

test("jour écrit en lettres sans décalage horaire", async () => {
  const { formaterJourIso } = await import("./format.ts");
  assert.equal(formaterJourIso("2026-12-05"), "samedi 5 décembre");
  assert.equal(formaterJourIso("2026-12-05", true), "samedi 5 décembre 2026");
});
