/** Règles de saisie de l'espace admin (sans accès à la base : testées par `npm run test:unit`). */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function estUuid(valeur: string) {
  return UUID.test(valeur);
}

/** Vraie date du calendrier au format « AAAA-MM-JJ » (refuse le 31 février). */
export function estDate(valeur: string) {
  if (!DATE.test(valeur)) return false;
  const d = new Date(`${valeur}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === valeur;
}

export type Groupe = { nom: string; debut: string | null; fin: string | null };

/** Vérifie un groupe saisi : nom obligatoire (150 caractères au plus), dates facultatives, fin après début. */
export function validerGroupe(saisie: { nom: string; debut: string; fin: string }): { groupe: Groupe } | { message: string } {
  const nom = saisie.nom.trim();
  const debut = saisie.debut.trim();
  const fin = saisie.fin.trim();
  if (nom.length === 0 || nom.length > 150) return { message: "Donnez un nom au groupe (150 caractères au maximum)." };
  if (debut && !estDate(debut)) return { message: "La date de début n'est pas valide." };
  if (fin && !estDate(fin)) return { message: "La date de fin n'est pas valide." };
  if (debut && fin && fin < debut) return { message: "La date de fin doit être après la date de début." };
  return { groupe: { nom, debut: debut || null, fin: fin || null } };
}
