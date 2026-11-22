// Test des règles de saisie de l'espace admin : npm run test:unit
import { test } from "node:test";
import assert from "node:assert/strict";
import { estDate, estUuid, isoVersParis, parisVersIso, validerGroupe, validerRubrique, validerSeance } from "./validation.ts";

test("l'heure de Paris est convertie en tenant compte de l'heure d'été et d'hiver", () => {
  // Hiver : Paris = UTC+1 ; été : Paris = UTC+2
  assert.equal(parisVersIso("2026-11-24", "09:30"), "2026-11-24T08:30:00.000Z");
  assert.equal(parisVersIso("2026-07-01", "09:30"), "2026-07-01T07:30:00.000Z");
  // Jour du changement d'heure (29 mars 2026), après le passage à l'heure d'été
  assert.equal(parisVersIso("2026-03-29", "10:00"), "2026-03-29T08:00:00.000Z");
  assert.deepEqual(isoVersParis("2026-11-24T08:30:00.000Z"), { date: "2026-11-24", heure: "09:30" });
  assert.deepEqual(isoVersParis(parisVersIso("2026-07-14", "18:05")), { date: "2026-07-14", heure: "18:05" });
});

const SEANCE = {
  groupeId: "aaaaaaaa-0000-4000-8000-000000000001",
  titre: " Atelier budget ",
  date: "2026-12-05",
  heureDebut: "09:00",
  heureFin: "12:00",
  lieu: "",
  description: "",
  rubriqueId: "",
  coursId: "",
  intervenants: "Claire Martin\nKarim Benali, ",
  publie: true,
};

test("une séance valide est préparée pour la base", () => {
  const r = validerSeance(SEANCE);
  assert.ok("seance" in r);
  assert.equal(r.seance.titre, "Atelier budget");
  assert.equal(r.seance.debut, "2026-12-05T08:00:00.000Z");
  assert.equal(r.seance.fin, "2026-12-05T11:00:00.000Z");
  assert.deepEqual(r.seance.intervenants, ["Claire Martin", "Karim Benali"]);
  assert.equal(r.seance.lieu, null);
  assert.equal(r.seance.rubrique_id, null);
});

test("une séance incomplète ou incohérente est refusée", () => {
  assert.ok("message" in validerSeance({ ...SEANCE, groupeId: "" }));
  assert.ok("message" in validerSeance({ ...SEANCE, titre: "  " }));
  assert.ok("message" in validerSeance({ ...SEANCE, heureDebut: "25:00" }));
  assert.ok("message" in validerSeance({ ...SEANCE, heureFin: "08:00" }));
  assert.ok("message" in validerSeance({ ...SEANCE, intervenants: Array.from({ length: 11 }, (_, i) => `Nom ${i}`).join("\n") }));
});

test("une rubrique a un nom, une couleur hexadécimale et un ordre entier", () => {
  assert.deepEqual(validerRubrique({ nom: "Atelier", couleur: "#E95609", ordre: "3" }), {
    rubrique: { nom: "Atelier", couleur: "#e95609", ordre: 3 },
  });
  assert.ok("message" in validerRubrique({ nom: "", couleur: "#e95609", ordre: "" }));
  assert.ok("message" in validerRubrique({ nom: "X", couleur: "rouge", ordre: "" }));
  assert.ok("message" in validerRubrique({ nom: "X", couleur: "#e95609", ordre: "1.5" }));
});

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
