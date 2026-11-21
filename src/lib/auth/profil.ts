/** Choix proposés à l'inscription (et plus tard dans le profil). Les codes sont ceux de la base. */
export const CIVILITES = [
  { code: "monsieur", libelle: "Monsieur" },
  { code: "madame", libelle: "Madame" },
] as const;

export const TRANCHES_AGE = [
  { code: "moins_18", libelle: "Moins de 18 ans" },
  { code: "18_25", libelle: "18 - 25 ans" },
  { code: "26_35", libelle: "26 - 35 ans" },
  { code: "36_45", libelle: "36 - 45 ans" },
  { code: "46_55", libelle: "46 - 55 ans" },
  { code: "56_plus", libelle: "56 ans et plus" },
] as const;

export function civiliteValide(valeur: string) {
  return CIVILITES.some((c) => c.code === valeur);
}

export function trancheAgeValide(valeur: string) {
  return TRANCHES_AGE.some((t) => t.code === valeur);
}
