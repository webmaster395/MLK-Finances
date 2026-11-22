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

// ---------------------------------------------------------------
// Heure de Paris <-> instant enregistré (timestamptz)
// ---------------------------------------------------------------

const HEURE = /^([01]\d|2[0-3]):[0-5]\d$/;
const PARIS = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Paris",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function partiesParis(instant: number) {
  const p = Object.fromEntries(PARIS.formatToParts(new Date(instant)).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, heure: `${p.hour}:${p.minute}` };
}

export function estHeure(valeur: string) {
  return HEURE.test(valeur);
}

/** « 2026-11-24 » + « 09:30 » à Paris → instant ISO (gère l'heure d'été et d'hiver). */
export function parisVersIso(date: string, heure: string): string {
  const [a, m, j] = date.split("-").map(Number);
  const [h, min] = heure.split(":").map(Number);
  const voulu = Date.UTC(a, m - 1, j, h, min);
  let instant = voulu;
  // Deux passes suffisent : on corrige du décalage de Paris à cet instant
  for (let i = 0; i < 2; i++) {
    const vu = partiesParis(instant);
    const [va, vm, vj] = vu.date.split("-").map(Number);
    const [vh, vmin] = vu.heure.split(":").map(Number);
    instant += voulu - Date.UTC(va, vm - 1, vj, vh, vmin);
  }
  return new Date(instant).toISOString();
}

/** Instant enregistré → { date: « AAAA-MM-JJ », heure: « HH:MM » } à Paris (pour pré-remplir un formulaire). */
export function isoVersParis(iso: string) {
  return partiesParis(new Date(iso).getTime());
}

// ---------------------------------------------------------------
// Séances et rubriques
// ---------------------------------------------------------------

export type SaisieSeance = {
  groupeId: string;
  titre: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  lieu: string;
  description: string;
  rubriqueId: string;
  coursId: string;
  intervenants: string;
  publie: boolean;
};

export type Seance = {
  groupe_id: string;
  titre: string;
  debut: string;
  fin: string | null;
  lieu: string | null;
  description: string;
  rubrique_id: string | null;
  cours_id: string | null;
  intervenants: string[];
  publie: boolean;
};

/** Intervenants saisis un par ligne (ou séparés par des virgules). */
export function lireIntervenants(texte: string): string[] {
  return texte
    .split(/[\n,]/)
    .map((n) => n.trim())
    .filter(Boolean);
}

export function validerSeance(s: SaisieSeance): { seance: Seance } | { message: string } {
  const titre = s.titre.trim();
  if (!estUuid(s.groupeId)) return { message: "Choisissez le groupe de la séance." };
  if (titre.length === 0 || titre.length > 200) return { message: "Donnez un titre à la séance (200 caractères au maximum)." };
  if (!estDate(s.date)) return { message: "Indiquez la date de la séance." };
  if (!estHeure(s.heureDebut)) return { message: "Indiquez l'heure de début." };
  if (s.heureFin && !estHeure(s.heureFin)) return { message: "L'heure de fin n'est pas valide." };
  if (s.heureFin && s.heureFin < s.heureDebut) return { message: "L'heure de fin doit être après l'heure de début." };
  if (s.rubriqueId && !estUuid(s.rubriqueId)) return { message: "Rubrique non valide." };
  if (s.coursId && !estUuid(s.coursId)) return { message: "Cours non valide." };
  if (s.description.length > 5000) return { message: "La description est trop longue (5 000 caractères au maximum)." };
  const intervenants = lireIntervenants(s.intervenants);
  if (intervenants.length > 10) return { message: "10 intervenants au maximum." };
  if (intervenants.some((n) => n.length > 100)) return { message: "Un nom d'intervenant est trop long (100 caractères au maximum)." };
  const lieu = s.lieu.trim();
  if (lieu.length > 200) return { message: "Le lieu est trop long (200 caractères au maximum)." };

  return {
    seance: {
      groupe_id: s.groupeId,
      titre,
      debut: parisVersIso(s.date, s.heureDebut),
      fin: s.heureFin ? parisVersIso(s.date, s.heureFin) : null,
      lieu: lieu || null,
      description: s.description.trim(),
      rubrique_id: s.rubriqueId || null,
      cours_id: s.coursId || null,
      intervenants,
      publie: s.publie,
    },
  };
}

export type Rubrique = { nom: string; couleur: string; ordre: number };

export function validerRubrique(s: { nom: string; couleur: string; ordre: string }): { rubrique: Rubrique } | { message: string } {
  const nom = s.nom.trim();
  const couleur = s.couleur.trim().toLowerCase();
  if (nom.length === 0 || nom.length > 60) return { message: "Donnez un nom à la rubrique (60 caractères au maximum)." };
  if (!/^#[0-9a-f]{6}$/.test(couleur)) return { message: "Choisissez une couleur." };
  const ordre = s.ordre.trim() === "" ? 0 : Number(s.ordre);
  if (!Number.isInteger(ordre) || ordre < 0 || ordre > 999) return { message: "L'ordre doit être un nombre entier entre 0 et 999." };
  return { rubrique: { nom, couleur, ordre } };
}

// ---------------------------------------------------------------
// Cours et supports
// ---------------------------------------------------------------

export type Cours = {
  groupe_id: string;
  titre: string;
  description: string;
  objectifs: string[];
  ordre: number;
  publie: boolean;
};

/** Objectifs saisis un par ligne. */
export function lireObjectifs(texte: string): string[] {
  return texte
    .split("\n")
    .map((o) => o.trim())
    .filter(Boolean);
}

export function validerCours(s: {
  groupeId: string;
  titre: string;
  description: string;
  objectifs: string;
  ordre: string;
  publie: boolean;
}): { cours: Cours } | { message: string } {
  const titre = s.titre.trim();
  if (!estUuid(s.groupeId)) return { message: "Choisissez le groupe du cours." };
  if (titre.length === 0 || titre.length > 200) return { message: "Donnez un titre au cours (200 caractères au maximum)." };
  if (s.description.length > 5000) return { message: "La description est trop longue (5 000 caractères au maximum)." };
  const objectifs = lireObjectifs(s.objectifs);
  if (objectifs.length > 20) return { message: "20 objectifs au maximum." };
  if (objectifs.some((o) => o.length > 300)) return { message: "Un objectif est trop long (300 caractères au maximum)." };
  const ordre = s.ordre.trim() === "" ? 0 : Number(s.ordre);
  if (!Number.isInteger(ordre) || ordre < 0 || ordre > 999) return { message: "L'ordre doit être un nombre entier entre 0 et 999." };
  return { cours: { groupe_id: s.groupeId, titre, description: s.description.trim(), objectifs, ordre, publie: s.publie } };
}

/** Lien d'un support : titre et adresse web complète (http ou https). */
export function validerLien(s: { titre: string; url: string }): { titre: string; url: string } | { message: string } {
  const titre = s.titre.trim();
  const url = s.url.trim();
  if (titre.length === 0 || titre.length > 200) return { message: "Donnez un titre au support (200 caractères au maximum)." };
  if (url.length > 2000 || !/^https?:\/\//i.test(url)) return { message: "Saisissez une adresse complète, qui commence par https://" };
  try {
    new URL(url);
  } catch {
    return { message: "Cette adresse n'est pas valide." };
  }
  return { titre, url };
}

/** Taille maximale d'un fichier de support (limite du seau « ressources »). */
export const SUPPORT_TAILLE_MAX_OCTETS = 50 * 1024 * 1024;

/** Nom de fichier sans accents ni caractères spéciaux, gardé lisible pour le téléchargement. */
export function nomFichierSur(nom: string): string {
  const propre = nom
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|-+$/g, "")
    .slice(-100);
  return propre || "fichier";
}

/** Chemin d'un support dans le stockage : cours/{cours}/{identifiant unique}/{nom du fichier}. */
export function cheminSupport(coursId: string, identifiant: string, nomFichier: string) {
  return `cours/${coursId}/${identifiant}/${nomFichierSur(nomFichier)}`;
}

/** Vérifie qu'un chemin a bien été préparé pour CE cours (jamais un chemin libre envoyé par le navigateur). */
export function estCheminSupport(chemin: string, coursId: string) {
  const parties = chemin.split("/");
  return (
    parties.length === 4 &&
    parties[0] === "cours" &&
    parties[1] === coursId &&
    estUuid(parties[2]) &&
    parties[3] === nomFichierSur(parties[3])
  );
}
