/**
 * Règles d'affichage des devoirs (sans accès à la base : testables seules).
 * Les statuts « à rendre / bientôt dû / en retard / rendu » ne sont pas stockés :
 * ils se déduisent de l'échéance et de la présence d'un rendu.
 */

export type StatutDevoir = "a_rendre" | "bientot" | "en_retard" | "rendu" | "corrige";

export type RenduResume = {
  statut: "depose" | "corrige";
  depose_le: string;
  nom_fichier: string | null;
} | null;

/** « Bientôt dû » : l'échéance tombe dans les 3 jours. */
export const DELAI_BIENTOT_MS = 3 * 24 * 60 * 60 * 1000;

export function statutDevoir(echeance: string | null, rendu: RenduResume, maintenant: number): StatutDevoir {
  if (rendu) return rendu.statut === "corrige" ? "corrige" : "rendu";
  if (!echeance) return "a_rendre";
  const limite = new Date(echeance).getTime();
  if (limite < maintenant) return "en_retard";
  if (limite - maintenant <= DELAI_BIENTOT_MS) return "bientot";
  return "a_rendre";
}

/** Un devoir « à faire » n'a pas encore de rendu. */
export function estAFaire(statut: StatutDevoir) {
  return statut === "a_rendre" || statut === "bientot" || statut === "en_retard";
}

/** Le rendu a été déposé après l'échéance. */
export function renduEnRetard(echeance: string | null, rendu: RenduResume): boolean {
  if (!echeance || !rendu) return false;
  return new Date(rendu.depose_le).getTime() > new Date(echeance).getTime();
}

/** Le participant peut déposer ou remplacer son fichier tant que le devoir n'est pas corrigé. */
export function depotPossible(statut: StatutDevoir) {
  return statut !== "corrige";
}

// --- Fichiers acceptés (mêmes limites que le seau « rendus » de la base) ---
export const TAILLE_MAX_OCTETS = 10 * 1024 * 1024; // 10 Mo

export const TYPES_ACCEPTES: Record<string, string> = {
  "application/pdf": "PDF",
  "image/jpeg": "image JPG",
  "image/png": "image PNG",
  "application/zip": "ZIP",
  "application/msword": "Word",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
  "application/vnd.ms-excel": "Excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
  "text/plain": "texte",
};

export const LISTE_TYPES_LISIBLE = "PDF, Word, Excel, image JPG ou PNG, ZIP ou texte";

/** Message d'erreur si le fichier n'est pas acceptable, sinon null. */
export function verifierFichier(fichier: { size: number; type: string }): string | null {
  if (fichier.size === 0) return "Ce fichier est vide.";
  if (fichier.size > TAILLE_MAX_OCTETS) return "Ce fichier dépasse 10 Mo. Choisissez un fichier plus léger.";
  if (!(fichier.type in TYPES_ACCEPTES)) return `Ce type de fichier n'est pas accepté. Formats acceptés : ${LISTE_TYPES_LISIBLE}.`;
  return null;
}

/** Chemin du fichier d'un rendu dans le stockage : un seul fichier par devoir, remplacé à chaque nouveau dépôt. */
export function cheminRendu(participantId: string, devoirId: string) {
  return `${participantId}/${devoirId}/depot`;
}
