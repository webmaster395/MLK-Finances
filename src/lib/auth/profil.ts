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

// --- Photo de profil (mêmes limites que le seau « photos » de la base) ---
export const PHOTO_TAILLE_MAX_OCTETS = 2 * 1024 * 1024; // 2 Mo
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/** Message d'erreur si la photo n'est pas acceptable, sinon null. */
export function verifierPhoto(fichier: { size: number; type: string }): string | null {
  if (fichier.size === 0) return "Ce fichier est vide.";
  if (fichier.size > PHOTO_TAILLE_MAX_OCTETS) return "Cette photo dépasse 2 Mo. Choisissez une image plus légère.";
  if (!(PHOTO_TYPES as readonly string[]).includes(fichier.type)) return "Format non accepté. Utilisez une image JPG, PNG ou WebP.";
  return null;
}

/** Chemin de la photo dans le stockage : un seul fichier par personne, remplacé à chaque changement. */
export function cheminPhoto(participantId: string) {
  return `${participantId}/avatar`;
}
