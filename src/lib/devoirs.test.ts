// Test des règles des devoirs : npm run test:unit
import { test } from "node:test";
import assert from "node:assert/strict";
import { cheminRendu, depotPossible, estAFaire, grouperParJourEcheance, renduEnRetard, statutDevoir, verifierFichier } from "./devoirs.ts";

const JOUR = 24 * 60 * 60 * 1000;
const maintenant = new Date("2026-11-21T12:00:00Z").getTime();
const dans = (jours: number) => new Date(maintenant + jours * JOUR).toISOString();
const rendu = (statut: "depose" | "corrige" = "depose", quand = dans(-1)) => ({ statut, depose_le: quand, nom_fichier: "budget.pdf" });

test("sans rendu : à rendre, bientôt dû ou en retard selon l'échéance", () => {
  assert.equal(statutDevoir(dans(10), null, maintenant), "a_rendre");
  assert.equal(statutDevoir(dans(3), null, maintenant), "bientot"); // exactement 3 jours
  assert.equal(statutDevoir(dans(1), null, maintenant), "bientot");
  assert.equal(statutDevoir(dans(-0.01), null, maintenant), "en_retard");
  assert.equal(statutDevoir(dans(-3), null, maintenant), "en_retard");
});

test("sans échéance : toujours à rendre", () => {
  assert.equal(statutDevoir(null, null, maintenant), "a_rendre");
});

test("avec un rendu : rendu ou corrigé, quelle que soit l'échéance", () => {
  assert.equal(statutDevoir(dans(-5), rendu(), maintenant), "rendu");
  assert.equal(statutDevoir(dans(5), rendu("corrige"), maintenant), "corrige");
});

test("seuls les devoirs sans rendu sont « à faire »", () => {
  assert.equal(estAFaire("a_rendre"), true);
  assert.equal(estAFaire("bientot"), true);
  assert.equal(estAFaire("en_retard"), true);
  assert.equal(estAFaire("rendu"), false);
  assert.equal(estAFaire("corrige"), false);
});

test("un rendu déposé après l'échéance est signalé en retard", () => {
  assert.equal(renduEnRetard(dans(-2), rendu("depose", dans(-1))), true);
  assert.equal(renduEnRetard(dans(1), rendu("depose", dans(-1))), false);
  assert.equal(renduEnRetard(null, rendu()), false);
  assert.equal(renduEnRetard(dans(-2), null), false);
});

test("le dépôt n'est plus possible une fois corrigé", () => {
  assert.equal(depotPossible("a_rendre"), true);
  assert.equal(depotPossible("en_retard"), true);
  assert.equal(depotPossible("rendu"), true);
  assert.equal(depotPossible("corrige"), false);
});

test("vérification du fichier : taille et type", () => {
  assert.equal(verifierFichier({ size: 1000, type: "application/pdf" }), null);
  assert.equal(verifierFichier({ size: 10 * 1024 * 1024, type: "application/zip" }), null);
  assert.match(verifierFichier({ size: 10 * 1024 * 1024 + 1, type: "application/pdf" }) ?? "", /10 Mo/);
  assert.match(verifierFichier({ size: 0, type: "application/pdf" }) ?? "", /vide/);
  assert.match(verifierFichier({ size: 1000, type: "application/x-msdownload" }) ?? "", /pas accepté/);
  assert.match(verifierFichier({ size: 1000, type: "" }) ?? "", /pas accepté/);
});

test("le chemin du rendu est dans le dossier de la personne, sans nom de fichier choisi par elle", () => {
  assert.equal(cheminRendu("u1", "d1"), "u1/d1/depot");
});

test("regroupement par jour d'échéance dans l'ordre chronologique", () => {
  const elements = [
    { id: "1", jourEcheance: "2026-11-23" },
    { id: "2", jourEcheance: "2026-11-23" },
    { id: "3", jourEcheance: "2026-12-03" },
    { id: "4", jourEcheance: null },
  ];
  const groupes = grouperParJourEcheance(elements);
  assert.equal(groupes.length, 3);
  assert.equal(groupes[0].jour, "2026-11-23");
  assert.deepEqual(
    groupes[0].devoirs.map((d) => d.id),
    ["1", "2"],
  );
  assert.equal(groupes[1].jour, "2026-12-03");
  assert.equal(groupes[2].jour, null);
});
