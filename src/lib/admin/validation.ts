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
// Sessions (cours et séances fusionnés)
// ---------------------------------------------------------------

export type SaisieSeance = {
  titre: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  lienVisio: string;
  description: string;
  objectifs: string;
  travauxAvant: string;
  travauxApres: string;
  materiel: string;
  publie: boolean;
};

export type Seance = {
  titre: string;
  debut: string;
  fin: string | null;
  lien_visio: string | null;
  description: string;
  objectifs: string[];
  travaux_avant: string;
  travaux_apres: string;
  materiel: string;
  publie: boolean;
};

/** Objectifs saisis un par ligne. */
export function lireObjectifs(texte: string): string[] {
  return texte
    .split("\n")
    .map((o) => o.trim())
    .filter(Boolean);
}

/** Adresse web complète en https (lien de visioconférence ou document). */
function estLienHttps(url: string) {
  if (url.length > 2000 || !/^https:\/\//i.test(url)) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validerSeance(s: SaisieSeance): { seance: Seance } | { message: string } {
  const titre = s.titre.trim();
  if (titre.length === 0 || titre.length > 200) return { message: "Donnez un titre à la session (200 caractères au maximum)." };
  if (!estDate(s.date)) return { message: "Indiquez la date de la session." };
  if (!estHeure(s.heureDebut)) return { message: "Indiquez l'heure de début." };
  if (s.heureFin && !estHeure(s.heureFin)) return { message: "L'heure de fin n'est pas valide." };
  if (s.heureFin && s.heureFin < s.heureDebut) return { message: "L'heure de fin doit être après l'heure de début." };
  const lienVisio = s.lienVisio.trim();
  if (lienVisio && !estLienHttps(lienVisio)) {
    return { message: "Le lien de visioconférence doit être une adresse complète, qui commence par https://" };
  }
  if (s.description.length > 5000) return { message: "La description est trop longue (5 000 caractères au maximum)." };
  const objectifs = lireObjectifs(s.objectifs);
  if (objectifs.length > 20) return { message: "20 objectifs au maximum." };
  if (objectifs.some((o) => o.length > 300)) return { message: "Un objectif est trop long (300 caractères au maximum)." };
  for (const [texte, nom] of [
    [s.travauxAvant, "Les travaux avant la session"],
    [s.travauxApres, "Les travaux après la session"],
    [s.materiel, "Le matériel à prévoir"],
  ] as const) {
    if (texte.trim().length > 5000) return { message: `${nom} : texte trop long (5 000 caractères au maximum).` };
  }

  return {
    seance: {
      titre,
      debut: parisVersIso(s.date, s.heureDebut),
      fin: s.heureFin ? parisVersIso(s.date, s.heureFin) : null,
      lien_visio: lienVisio || null,
      description: s.description.trim(),
      objectifs,
      travaux_avant: s.travauxAvant.trim(),
      travaux_apres: s.travauxApres.trim(),
      materiel: s.materiel.trim(),
      publie: s.publie,
    },
  };
}

// ---------------------------------------------------------------
// Documents d'une session (PDF ou lien, par exemple Canva)
// ---------------------------------------------------------------

/** Lien d'un document : titre et adresse web complète (http ou https). */
export function validerLien(s: { titre: string; url: string }): { titre: string; url: string } | { message: string } {
  const titre = s.titre.trim();
  const url = s.url.trim();
  if (titre.length === 0 || titre.length > 200) return { message: "Donnez un titre au document (200 caractères au maximum)." };
  if (url.length > 2000 || !/^https?:\/\//i.test(url)) return { message: "Saisissez une adresse complète, qui commence par https://" };
  try {
    new URL(url);
  } catch {
    return { message: "Cette adresse n'est pas valide." };
  }
  return { titre, url };
}

/** Taille maximale d'un document (limite du seau « ressources »). */
export const SUPPORT_TAILLE_MAX_OCTETS = 50 * 1024 * 1024;

/** Les documents envoyés sont des PDF. */
export function estPdf(f: { name: string; type: string }) {
  return f.type === "application/pdf" || /\.pdf$/i.test(f.name);
}

/** Nom de fichier sans accents ni caractères spéciaux, gardé lisible pour le téléchargement. */
export function nomFichierSur(nom: string): string {
  const propre = nom
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|-+$/g, "")
    .slice(-100);
  return propre || "fichier";
}

/** Chemin d'un document dans le stockage : sessions/{session}/{identifiant unique}/{nom du fichier}. */
export function cheminSupport(sessionId: string, identifiant: string, nomFichier: string) {
  return `sessions/${sessionId}/${identifiant}/${nomFichierSur(nomFichier)}`;
}

/** Vérifie qu'un chemin a bien été préparé pour CETTE session (jamais un chemin libre envoyé par le navigateur). */
export function estCheminSupport(chemin: string, sessionId: string) {
  const parties = chemin.split("/");
  return (
    parties.length === 4 &&
    parties[0] === "sessions" &&
    parties[1] === sessionId &&
    estUuid(parties[2]) &&
    parties[3] === nomFichierSur(parties[3])
  );
}

// ---------------------------------------------------------------
// Messages de l'équipe
// ---------------------------------------------------------------

export type Annonce = { titre: string; message: string; publie: boolean };

/** Message de l'équipe, pour tous les participants. */
export function validerAnnonce(s: { titre: string; message: string; publie: boolean }): { annonce: Annonce } | { message: string } {
  const titre = s.titre.trim();
  const texte = s.message.trim();
  if (titre.length > 150) return { message: "Le titre est trop long (150 caractères au maximum)." };
  if (texte.length === 0 || texte.length > 2000) return { message: "Écrivez le message (2 000 caractères au maximum)." };
  return { annonce: { titre, message: texte, publie: s.publie } };
}

// ---------------------------------------------------------------
// Témoignages
// ---------------------------------------------------------------

export type Temoignage = { nom_affiche: string; texte: string; valide: boolean };

export function validerTemoignage(s: { nom: string; texte: string; valide: boolean }): { temoignage: Temoignage } | { message: string } {
  const nom = s.nom.trim();
  const texte = s.texte.trim();
  if (nom.length === 0 || nom.length > 100) return { message: "Indiquez le prénom affiché (100 caractères au maximum)." };
  if (texte.length === 0 || texte.length > 1000) return { message: "Écrivez le témoignage (1 000 caractères au maximum)." };
  return { temoignage: { nom_affiche: nom, texte, valide: s.valide } };
}

/** Photo d'un témoignage : mêmes limites que le seau « photos ». */
export const PHOTO_TEMOIGNAGE_TAILLE_MAX_OCTETS = 2 * 1024 * 1024;
export const PHOTO_TEMOIGNAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function verifierPhotoTemoignage(f: { size: number; type: string }): string | null {
  if (f.size === 0) return "Ce fichier est vide.";
  if (f.size > PHOTO_TEMOIGNAGE_TAILLE_MAX_OCTETS) return "Cette photo dépasse 2 Mo. Choisissez une image plus légère.";
  if (!(PHOTO_TEMOIGNAGE_TYPES as readonly string[]).includes(f.type)) return "Format non accepté. Utilisez une image JPG, PNG ou WebP.";
  return null;
}

/** Chemin de la photo d'un témoignage : un seul fichier, remplacé à chaque changement. */
export function cheminPhotoTemoignage(temoignageId: string) {
  return `temoignages/${temoignageId}/photo`;
}

// ---------------------------------------------------------------
// Recherche d'un participant
// ---------------------------------------------------------------

/** Garde seulement des lettres, chiffres, espaces, tirets et apostrophes : la recherche ne peut pas casser la requête. */
export function nettoyerRecherche(brut: string): string {
  return brut.replace(/[^\p{L}\p{N} '\-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 60);
}
