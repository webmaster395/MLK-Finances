/**
 * Couleurs d'accent des séances (liseré des cartes, points de la frise et du calendrier).
 * Permet de distinguer visuellement les séances du matin, de l'après-midi / du soir et l'accueil.
 */
export const PALETTE_SEANCES = ["#d634ba", "#e95609", "#5b6fd6"] as const;
export const COULEUR_ACCUEIL = "#6b6560";
export const COULEUR_SEANCE = PALETTE_SEANCES[0];

const formaterHeureParis = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Europe/Paris",
});

/** Extrait l'heure décimale à Paris (ex. 9.5 pour 09:30) depuis une date ISO ou un créneau « 09:30 – 11:00 ». */
function heureDecimaleParis(debutOuHoraires: string): number {
  const matchDirect = /^(\d{1,2}):(\d{2})/.exec(debutOuHoraires.trim());
  if (matchDirect) {
    return Number(matchDirect[1]) + Number(matchDirect[2]) / 60;
  }
  const date = new Date(debutOuHoraires);
  if (Number.isNaN(date.getTime())) return 9;
  const texte = formaterHeureParis.format(date);
  const matchIso = /(\d{1,2}):(\d{2})/.exec(texte);
  if (!matchIso) return 9;
  return Number(matchIso[1]) + Number(matchIso[2]) / 60;
}

/**
 * Couleur d'une séance selon son horaire à Paris (matin en rose, fin de matinée / après-midi en orange,
 * fin d'après-midi / soir en indigo, et séance sans cours en gris taupe).
 */
export function couleurSeance({
  debut,
  avecCours = true,
  rang,
}: {
  debut: string;
  avecCours?: boolean;
  /** Rang optionnel pour alterner si plusieurs éléments se suivent */
  rang?: number;
}): string {
  if (!avecCours) return COULEUR_ACCUEIL;
  const h = heureDecimaleParis(debut);
  let couleur: string = PALETTE_SEANCES[0]; // Matin (< 11h) : rose
  if (h >= 17) {
    couleur = PALETTE_SEANCES[2]; // Soir (>= 17h) : indigo
  } else if (h >= 11) {
    couleur = PALETTE_SEANCES[1]; // Fin de matinée / Après-midi (11h – 17h) : orange
  }
  if (typeof rang === "number" && rang > 0) {
    return couleur;
  }
  return couleur;
}

/**
 * Attribue une couleur à chaque séance d'une même journée en évitant que deux séances
 * consécutives aient la même couleur.
 */
export function couleursSeancesJour<T extends { debut: string; avecCours?: boolean }>(seances: T[]): string[] {
  const resultat: string[] = [];
  for (const s of seances) {
    let c = couleurSeance({ debut: s.debut, avecCours: s.avecCours ?? true });
    const precedente = resultat[resultat.length - 1];
    if (precedente && c === precedente) {
      const idx = PALETTE_SEANCES.indexOf(c as (typeof PALETTE_SEANCES)[number]);
      c = PALETTE_SEANCES[(idx + 1) % PALETTE_SEANCES.length];
    }
    resultat.push(c);
  }
  return resultat;
}
