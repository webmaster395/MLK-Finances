// Test des règles de saisie de l'espace admin : npm run test:unit
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  validerAnnonce,
  cheminSupport,
  estCheminSupport,
  estDate,
  estUuid,
  isoVersParis,
  nomFichierSur,
  parisVersIso,
  validerCours,
  validerDevoir,
  validerGroupe,
  validerLien,
  validerRubrique,
  validerSeance,
} from "./validation.ts";

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

const COURS = {
  groupeId: "aaaaaaaa-0000-4000-8000-000000000001",
  titre: " Module 5 ",
  description: "Les bases.",
  objectifs: "Comprendre le taux\n\n  Comparer deux offres ",
  ordre: "5",
  publie: false,
};

test("un cours valide est préparé pour la base (objectifs un par ligne)", () => {
  const r = validerCours(COURS);
  assert.ok("cours" in r);
  assert.equal(r.cours.titre, "Module 5");
  assert.deepEqual(r.cours.objectifs, ["Comprendre le taux", "Comparer deux offres"]);
  assert.equal(r.cours.ordre, 5);
  assert.ok("message" in validerCours({ ...COURS, titre: "" }));
  assert.ok("message" in validerCours({ ...COURS, groupeId: "x" }));
  assert.ok("message" in validerCours({ ...COURS, ordre: "-1" }));
});

test("le lien d'un support doit être une adresse web complète", () => {
  assert.deepEqual(validerLien({ titre: "Simulateur", url: " https://example.com/outil " }), {
    titre: "Simulateur",
    url: "https://example.com/outil",
  });
  assert.ok("message" in validerLien({ titre: "X", url: "example.com" }));
  assert.ok("message" in validerLien({ titre: "X", url: "javascript:alert(1)" }));
  assert.ok("message" in validerLien({ titre: "", url: "https://example.com" }));
});

test("le chemin d'un fichier de support est calculé et contrôlé", () => {
  const cours = "cccccccc-0000-4000-8000-000000000001";
  const id = "0b9f2c3e-1d2a-4b5c-8d9e-0f1a2b3c4d5e";
  assert.equal(nomFichierSur("Guide d'épargne (v2).pdf"), "Guide-d-epargne-v2-.pdf");
  assert.equal(nomFichierSur("../../secret"), "secret");
  assert.equal(nomFichierSur("###"), "fichier");
  const chemin = cheminSupport(cours, id, "Budget été.xlsx");
  assert.equal(chemin, `cours/${cours}/${id}/Budget-ete.xlsx`);
  assert.equal(estCheminSupport(chemin, cours), true);
  assert.equal(estCheminSupport(chemin, "cccccccc-0000-4000-8000-000000000002"), false);
  assert.equal(estCheminSupport(`cours/${cours}/pas-un-id/x.pdf`, cours), false);
  assert.equal(estCheminSupport(`cours/${cours}/${id}/../x.pdf`, cours), false);
  assert.equal(estCheminSupport(`autre/${cours}/${id}/x.pdf`, cours), false);
});

test("un devoir a un cours, un titre et une échéance facultative (23:59 par défaut)", () => {
  const base = { coursId: "cccccccc-0000-4000-8000-000000000001", titre: " Budget ", consigne: "", date: "2026-12-10", heure: "", publie: true };
  const r = validerDevoir(base);
  assert.ok("devoir" in r);
  assert.equal(r.devoir.titre, "Budget");
  assert.equal(r.devoir.echeance, "2026-12-10T22:59:00.000Z");
  const sansDate = validerDevoir({ ...base, date: "" });
  assert.ok("devoir" in sansDate && sansDate.devoir.echeance === null);
  assert.ok("message" in validerDevoir({ ...base, coursId: "" }));
  assert.ok("message" in validerDevoir({ ...base, date: "", heure: "10:00" }));
  assert.ok("message" in validerDevoir({ ...base, heure: "7h" }));
});

test("un message de l'équipe a un texte, un titre facultatif, et vise tous les groupes ou un seul", () => {
  const tous = validerAnnonce({ groupeId: "", titre: " Bienvenue ", message: " Bonjour à tous ", publie: true });
  assert.deepEqual(tous, { annonce: { groupe_id: null, titre: "Bienvenue", message: "Bonjour à tous", publie: true } });
  const un = validerAnnonce({ groupeId: "aaaaaaaa-0000-4000-8000-000000000001", titre: "", message: "Salle B", publie: false });
  assert.ok("annonce" in un && un.annonce.groupe_id === "aaaaaaaa-0000-4000-8000-000000000001");
  assert.ok("message" in validerAnnonce({ groupeId: "", titre: "", message: "   ", publie: true }));
  assert.ok("message" in validerAnnonce({ groupeId: "x", titre: "", message: "ok", publie: true }));
  assert.ok("message" in validerAnnonce({ groupeId: "", titre: "x".repeat(151), message: "ok", publie: true }));
});
