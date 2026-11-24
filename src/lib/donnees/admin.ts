import "server-only";
import { connection } from "next/server";
import { nettoyerRecherche } from "@/lib/admin/validation";
import { exigerAdmin } from "@/lib/auth/personne";
import { creerClientServeur } from "@/lib/supabase/serveur";

const UUID_ADMIN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const nomAffiche = (p: { prenom: string; nom: string } | null) =>
  p ? `${p.prenom} ${p.nom}`.trim() || "Sans nom" : "Inconnu";

// ---------------------------------------------------------------
// Tableau de bord (lot 1)
// ---------------------------------------------------------------

export type InscritRecent = { id: string; nom: string; inscritLe: string };

export type TableauDeBord = {
  participants: number;
  derniersInscrits: InscritRecent[];
  seancesAVenir: number;
  temoignagesAValider: number;
};

/** Chiffres et listes du tableau de bord admin. Réservé aux admins (vérifié ici, puis par la RLS). */
export async function lireTableauDeBord(): Promise<TableauDeBord> {
  await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  const maintenant = new Date(Date.now()).toISOString();

  const [participants, seances, temoignages] = await Promise.all([
    supabase.from("profils").select("id, prenom, nom, cree_le").eq("role", "participant").order("cree_le", { ascending: false }),
    supabase.from("sessions").select("id", { count: "exact", head: true }).gte("debut", maintenant),
    supabase.from("temoignages").select("id", { count: "exact", head: true }).eq("valide", false).eq("partage", true),
  ]);

  const liste = participants.data ?? [];
  return {
    participants: liste.length,
    derniersInscrits: liste.slice(0, 5).map((p) => ({ id: p.id, nom: nomAffiche(p), inscritLe: p.cree_le })),
    seancesAVenir: seances.count ?? 0,
    temoignagesAValider: temoignages.count ?? 0,
  };
}

// ---------------------------------------------------------------
// Participants (lot 2)
// ---------------------------------------------------------------

export type ParticipantListe = {
  id: string;
  nom: string;
  role: "participant" | "admin";
  inscritLe: string;
  /** Témoignage écrit par cette personne : « valide » (publié) ou « attente » (à valider) ; null s'il n'y en a pas. */
  temoignage: "valide" | "attente" | null;
};

export type PageParticipants = {
  personnes: ParticipantListe[];
  /** Nombre de personnes correspondant à la recherche (toutes pages confondues). */
  total: number;
  page: number;
  pages: number;
  /** Nombre de personnes inscrites ayant écrit un témoignage (toutes pages, hors recherche). */
  ontTemoigne: number;
};

export const PARTICIPANTS_PAR_PAGE = 25;

export type ParticipantDetail = {
  id: string;
  prenom: string;
  nom: string;
  civilite: string | null;
  trancheAge: string | null;
  role: "participant" | "admin";
  inscritLe: string;
  /** La fiche est-elle celle de l'admin connecté ? (il ne peut pas changer son propre rôle) */
  estMoi: boolean;
};

/**
 * Une page de personnes inscrites (participants et admins), par ordre alphabétique,
 * avec recherche sur le prénom et le nom (chaque mot saisi doit se retrouver dans l'un des deux).
 */
export async function lireParticipants(recherche = "", pageDemandee = 1): Promise<PageParticipants> {
  await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  const q = nettoyerRecherche(recherche);
  const page = Number.isInteger(pageDemandee) && pageDemandee > 0 ? pageDemandee : 1;

  let requete = supabase.from("profils").select("id, prenom, nom, role, cree_le", { count: "exact" });
  for (const mot of q.split(" ").filter(Boolean)) {
    requete = requete.or(`prenom.ilike.%${mot}%,nom.ilike.%${mot}%`);
  }
  const debut = (page - 1) * PARTICIPANTS_PAR_PAGE;
  const [liste, auteurs] = await Promise.all([
    requete
      .order("nom")
      .order("prenom")
      .order("id")
      .range(debut, debut + PARTICIPANTS_PAR_PAGE - 1),
    supabase.from("temoignages").select("auteur_id, valide").eq("partage", true).not("auteur_id", "is", null),
  ]);

  // Une personne peut avoir plusieurs témoignages : un seul en attente suffit à le signaler
  const parAuteur = new Map<string | null, "valide" | "attente">();
  for (const x of auteurs.data ?? []) {
    if (!x.valide) parAuteur.set(x.auteur_id, "attente");
    else if (!parAuteur.has(x.auteur_id)) parAuteur.set(x.auteur_id, "valide");
  }
  const total = liste.count ?? 0;
  return {
    personnes: (liste.data ?? []).map((p) => ({
      id: p.id,
      nom: nomAffiche(p),
      role: p.role,
      inscritLe: p.cree_le,
      temoignage: parAuteur.get(p.id) ?? null,
    })),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / PARTICIPANTS_PAR_PAGE)),
    ontTemoigne: parAuteur.size,
  };
}

/** La fiche d'une personne (null si elle n'existe pas). */
export async function lireParticipant(id: string): Promise<ParticipantDetail | null> {
  if (!UUID_ADMIN.test(id)) return null;
  const admin = await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  const { data: p } = await supabase
    .from("profils")
    .select("id, prenom, nom, civilite, tranche_age, role, cree_le")
    .eq("id", id)
    .maybeSingle();
  if (!p) return null;
  return {
    id: p.id,
    prenom: p.prenom,
    nom: p.nom,
    civilite: p.civilite,
    trancheAge: p.tranche_age,
    role: p.role,
    inscritLe: p.cree_le,
    estMoi: p.id === admin.id,
  };
}

// ---------------------------------------------------------------
// Sessions (cours et séances fusionnés) et leurs documents
// ---------------------------------------------------------------

export type SeanceListe = {
  id: string;
  titre: string;
  debut: string;
  fin: string | null;
  publie: boolean;
  passee: boolean;
  /** Vrai si le lien de visioconférence est renseigné */
  avecLien: boolean;
  documents: number;
};

export type DocumentAdmin = { id: string; titre: string; type: "fichier" | "lien"; url: string | null; nomFichier: string | null };

export type SeanceAdmin = {
  id: string;
  titre: string;
  debut: string;
  fin: string | null;
  description: string;
  objectifs: string[];
  lienVisio: string | null;
  travauxAvant: string;
  travauxApres: string;
  materiel: string;
  publie: boolean;
  documents: DocumentAdmin[];
};

/** Toutes les sessions, dans l'ordre du calendrier. */
export async function lireSeancesAdmin(): Promise<SeanceListe[]> {
  await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("sessions")
    .select("id, titre, debut, fin, publie, lien_visio, ressources(count)")
    .order("debut");
  const maintenant = Date.now();
  return (data ?? []).map((s) => ({
    id: s.id,
    titre: s.titre,
    debut: s.debut,
    fin: s.fin,
    publie: s.publie,
    passee: new Date(s.fin ?? s.debut).getTime() < maintenant,
    avecLien: Boolean(s.lien_visio),
    documents: s.ressources[0]?.count ?? 0,
  }));
}

/** Une session à modifier, avec ses documents (null si elle n'existe pas). */
export async function lireSeanceAdmin(id: string): Promise<SeanceAdmin | null> {
  if (!UUID_ADMIN.test(id)) return null;
  await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  const { data: s } = await supabase
    .from("sessions")
    .select(
      "id, titre, debut, fin, description, objectifs, lien_visio, travaux_avant, travaux_apres, materiel, publie, ressources(id, titre, type, url, storage_path, cree_le)",
    )
    .eq("id", id)
    .order("cree_le", { referencedTable: "ressources", ascending: true })
    .maybeSingle();
  if (!s) return null;
  return {
    id: s.id,
    titre: s.titre,
    debut: s.debut,
    fin: s.fin,
    description: s.description,
    objectifs: s.objectifs,
    lienVisio: s.lien_visio,
    travauxAvant: s.travaux_avant,
    travauxApres: s.travaux_apres,
    materiel: s.materiel,
    publie: s.publie,
    documents: s.ressources.map((r) => ({
      id: r.id,
      titre: r.titre,
      type: r.type === "lien" ? "lien" : "fichier",
      url: r.url,
      nomFichier: r.storage_path ? (r.storage_path.split("/").pop() ?? null) : null,
    })),
  };
}

// ---------------------------------------------------------------
// Messages de l'équipe (lot 6)
// ---------------------------------------------------------------

export type AnnonceAdmin = {
  id: string;
  titre: string;
  message: string;
  publie: boolean;
  creeLe: string;
};

/** Tous les messages de l'équipe, les plus récents d'abord. */
export async function lireAnnoncesAdmin(): Promise<AnnonceAdmin[]> {
  await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("annonces")
    .select("id, titre, message, publie, cree_le")
    .order("cree_le", { ascending: false });
  return (data ?? []).map((a) => ({ id: a.id, titre: a.titre, message: a.message, publie: a.publie, creeLe: a.cree_le }));
}

// ---------------------------------------------------------------
// Témoignages (lot 7)
// ---------------------------------------------------------------

export type TemoignageAdmin = {
  id: string;
  nom: string;
  texte: string;
  valide: boolean;
  photoPath: string | null;
  /** Lien temporaire pour afficher la photo (null s'il n'y en a pas). */
  photoUrl: string | null;
  creeLe: string;
};

export type OngletTemoignages = "a-valider" | "affiches";

export type PageTemoignages = {
  temoignages: TemoignageAdmin[];
  onglet: OngletTemoignages;
  aValider: number;
  affiches: number;
  page: number;
  pages: number;
};

export const TEMOIGNAGES_PAR_PAGE = 20;

/**
 * Une page de témoignages partagés (jamais les notes privées), du plus récent au plus ancien,
 * dans l'onglet « à valider » ou « affichés ».
 */
export async function lireTemoignagesAdmin(onglet: OngletTemoignages = "a-valider", pageDemandee = 1): Promise<PageTemoignages> {
  await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  // Les notes privées ne concernent que leur auteur (la base les cache déjà ; on écarte aussi les siennes)
  const compter = (valide: boolean) =>
    supabase.from("temoignages").select("id", { count: "exact", head: true }).eq("partage", true).eq("valide", valide);
  const [attente, publies] = await Promise.all([compter(false), compter(true)]);
  const aValider = attente.count ?? 0;
  const affiches = publies.count ?? 0;
  const total = onglet === "affiches" ? affiches : aValider;
  const pages = Math.max(1, Math.ceil(total / TEMOIGNAGES_PAR_PAGE));
  const page = Math.min(Math.max(1, pageDemandee), pages);
  const debut = (page - 1) * TEMOIGNAGES_PAR_PAGE;

  const { data } = await supabase
    .from("temoignages")
    .select("id, nom_affiche, texte, valide, photo_path, cree_le")
    .eq("partage", true)
    .eq("valide", onglet === "affiches")
    .order("cree_le", { ascending: false })
    .order("id")
    .range(debut, debut + TEMOIGNAGES_PAR_PAGE - 1);
  const liste = data ?? [];
  const chemins = liste.flatMap((t) => (t.photo_path ? [t.photo_path] : []));
  const liens = chemins.length > 0 ? ((await supabase.storage.from("photos").createSignedUrls(chemins, 300)).data ?? []) : [];
  const parChemin = new Map(liens.map((l) => [l.path, l.signedUrl]));
  return {
    onglet,
    aValider,
    affiches,
    page,
    pages,
    temoignages: liste.map((t) => ({
      id: t.id,
      nom: t.nom_affiche,
      texte: t.texte,
      valide: t.valide,
      photoPath: t.photo_path,
      photoUrl: t.photo_path ? (parChemin.get(t.photo_path) ?? null) : null,
      creeLe: t.cree_le,
    })),
  };
}
