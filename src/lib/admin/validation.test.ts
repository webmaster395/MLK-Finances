// Test des règles de saisie de l'espace admin : npm run test:unit
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cheminPhotoTemoignage,
  validerTemoignage,
  verifierPhotoTemoignage,
  validerAnnonce,
  cheminSupport,
  estCheminSupport,
  estDate,
  estPdf,
  estUuid,
  isoVersParis,
  nettoyerRecherche,
  nomFichierSur,
  parisVersIso,
  validerLien,
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
  titre: " Session 1 — Faire le point ",
  date: "2026-12-05",
  heureDebut: "09:30",
  heureFin: "12:00",
  lienVisio: " https://zoom.us/j/123 ",
  description: "",
  objectifs: "Lister ses revenus\n\n  Mesurer ses dettes ",
  travauxAvant: " Rassembler ses relevés ",
  travauxApres: "",
  materiel: "Une calculatrice",
  publie: true,
};

test("une session valide est préparée pour la base", () => {
  const r = validerSeance(SEANCE);
  assert.ok("seance" in r);
  assert.equal(r.seance.titre, "Session 1 — Faire le point");
  assert.equal(r.seance.debut, "2026-12-05T08:30:00.000Z");
  assert.equal(r.seance.fin, "2026-12-05T11:00:00.000Z");
  assert.equal(r.seance.lien_visio, "https://zoom.us/j/123");
  assert.deepEqual(r.seance.objectifs, ["Lister ses revenus", "Mesurer ses dettes"]);
  assert.equal(r.seance.travaux_avant, "Rassembler ses relevés");
  assert.equal(r.seance.materiel, "Une calculatrice");
  const sansLien = validerSeance({ ...SEANCE, lienVisio: "" });
  assert.ok("seance" in sansLien && sansLien.seance.lien_visio === null);
});

test("une session incomplète ou incohérente est refusée", () => {
  assert.ok("message" in validerSeance({ ...SEANCE, titre: "  " }));
  assert.ok("message" in validerSeance({ ...SEANCE, heureDebut: "25:00" }));
  assert.ok("message" in validerSeance({ ...SEANCE, heureFin: "08:00" }));
  assert.ok("message" in validerSeance({ ...SEANCE, lienVisio: "http://zoom.us/j/123" }));
  assert.ok("message" in validerSeance({ ...SEANCE, lienVisio: "javascript:alert(1)" }));
  assert.ok("message" in validerSeance({ ...SEANCE, objectifs: Array.from({ length: 21 }, (_, i) => `Objectif ${i}`).join("\n") }));
  assert.ok("message" in validerSeance({ ...SEANCE, travauxAvant: "x".repeat(5001) }));
});

test("un identifiant doit être un UUID", () => {
  assert.equal(estUuid("aaaaaaaa-0000-4000-8000-000000000001"), true);
  assert.equal(estUuid("1; drop table sessions"), false);
  assert.equal(estUuid(""), false);
});

test("une date doit exister dans le calendrier", () => {
  assert.equal(estDate("2026-09-01"), true);
  assert.equal(estDate("2026-02-31"), false);
  assert.equal(estDate("01/09/2026"), false);
});

test("le lien d'un document doit être une adresse web complète", () => {
  assert.deepEqual(validerLien({ titre: "Simulateur", url: " https://example.com/outil " }), {
    titre: "Simulateur",
    url: "https://example.com/outil",
  });
  assert.ok("message" in validerLien({ titre: "X", url: "example.com" }));
  assert.ok("message" in validerLien({ titre: "X", url: "javascript:alert(1)" }));
  assert.ok("message" in validerLien({ titre: "", url: "https://example.com" }));
});

test("un document envoyé doit être un PDF", () => {
  assert.equal(estPdf({ name: "guide.pdf", type: "application/pdf" }), true);
  assert.equal(estPdf({ name: "Guide.PDF", type: "" }), true);
  assert.equal(estPdf({ name: "budget.xlsx", type: "application/vnd.ms-excel" }), false);
});

test("le chemin d'un document est calculé et contrôlé", () => {
  const session = "55555555-0000-4000-8000-000000000001";
  const id = "0b9f2c3e-1d2a-4b5c-8d9e-0f1a2b3c4d5e";
  assert.equal(nomFichierSur("Guide d'épargne (v2).pdf"), "Guide-d-epargne-v2-.pdf");
  assert.equal(nomFichierSur("../../secret"), "secret");
  assert.equal(nomFichierSur("###"), "fichier");
  const chemin = cheminSupport(session, id, "Budget été.pdf");
  assert.equal(chemin, `sessions/${session}/${id}/Budget-ete.pdf`);
  assert.equal(estCheminSupport(chemin, session), true);
  assert.equal(estCheminSupport(chemin, "55555555-0000-4000-8000-000000000002"), false);
  assert.equal(estCheminSupport(`sessions/${session}/pas-un-id/x.pdf`, session), false);
  assert.equal(estCheminSupport(`sessions/${session}/${id}/../x.pdf`, session), false);
  assert.equal(estCheminSupport(`cours/${session}/${id}/x.pdf`, session), false);
});

test("un message de l'équipe a un texte et un titre facultatif", () => {
  assert.deepEqual(validerAnnonce({ titre: " Bienvenue ", message: " Bonjour à tous ", publie: true }), {
    annonce: { titre: "Bienvenue", message: "Bonjour à tous", publie: true },
  });
  assert.ok("message" in validerAnnonce({ titre: "", message: "   ", publie: true }));
  assert.ok("message" in validerAnnonce({ titre: "x".repeat(151), message: "ok", publie: true }));
});

test("un témoignage a un nom affiché et un texte ; la photo est une image légère", () => {
  assert.deepEqual(validerTemoignage({ nom: " Léa ", texte: " Super parcours ", valide: false, public: true }), {
    temoignage: { nom_affiche: "Léa", texte: "Super parcours", valide: false, visible_public: false },
  });
  assert.equal(
    (validerTemoignage({ nom: "Léa", texte: "Super", valide: true, public: true }) as { temoignage: { visible_public: boolean } }).temoignage.visible_public,
    true,
  );
  assert.ok("message" in validerTemoignage({ nom: "", texte: "x", valide: true, public: false }));
  assert.ok("message" in validerTemoignage({ nom: "x", texte: "y".repeat(1001), valide: true, public: false }));
  assert.equal(verifierPhotoTemoignage({ size: 100_000, type: "image/webp" }), null);
  assert.ok(verifierPhotoTemoignage({ size: 3 * 1024 * 1024, type: "image/png" }));
  assert.ok(verifierPhotoTemoignage({ size: 1000, type: "application/pdf" }));
  assert.equal(cheminPhotoTemoignage("abc"), "temoignages/abc/photo");
});

test("la recherche d'un participant ne garde que des caractères sûrs", () => {
  assert.equal(nettoyerRecherche("  Léa   Martin "), "Léa Martin");
  assert.equal(nettoyerRecherche("Jean-Pierre d'Arc"), "Jean-Pierre d'Arc");
  assert.equal(nettoyerRecherche("a%,b(c)_d"), "abcd");
  assert.equal(nettoyerRecherche("x".repeat(100)).length, 60);
});
