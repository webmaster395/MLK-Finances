import "server-only";
import { connection } from "next/server";
import { exigerAdmin } from "@/lib/auth/personne";
import { creerClientServeur } from "@/lib/supabase/serveur";

const UUID_ADMIN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const nomAffiche = (p: { prenom: string; nom: string } | null) =>
  p ? `${p.prenom} ${p.nom}`.trim() || "Sans nom" : "Inconnu";

const parNom = (a: { nom: string }, b: { nom: string }) => a.nom.localeCompare(b.nom, "fr");

export type Membre = { id: string; nom: string };

// ---------------------------------------------------------------
// Tableau de bord (lot 1)
// ---------------------------------------------------------------

export type InscritRecent = { id: string; nom: string; inscritLe: string };
export type RenduACorriger = { id: string; devoirId: string; devoir: string; participant: string; deposeLe: string };

export type TableauDeBord = {
  participants: number;
  derniersInscrits: InscritRecent[];
  seancesAVenir: number;
  aCorriger: RenduACorriger[];
  temoignagesAValider: number;
};

/** Chiffres et listes du tableau de bord admin. Réservé aux admins (vérifié ici, puis par la RLS). */
export async function lireTableauDeBord(): Promise<TableauDeBord> {
  await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  const maintenant = new Date(Date.now()).toISOString();

  const [participants, seances, rendus, temoignages] = await Promise.all([
    supabase.from("profils").select("id, prenom, nom, cree_le").eq("role", "participant").order("cree_le", { ascending: false }),
    supabase.from("sessions").select("id", { count: "exact", head: true }).gte("debut", maintenant),
    supabase
      .from("rendus")
      .select("id, devoir_id, depose_le, devoirs(titre), profils(prenom, nom)")
      .eq("statut", "depose")
      .order("depose_le", { ascending: true }),
    supabase.from("temoignages").select("id", { count: "exact", head: true }).eq("valide", false),
  ]);

  const liste = participants.data ?? [];
  return {
    participants: liste.length,
    derniersInscrits: liste.slice(0, 5).map((p) => ({ id: p.id, nom: nomAffiche(p), inscritLe: p.cree_le })),
    seancesAVenir: seances.count ?? 0,
    aCorriger: (rendus.data ?? []).map((r) => ({
      id: r.id,
      devoirId: r.devoir_id,
      devoir: r.devoirs?.titre ?? "Devoir",
      participant: nomAffiche(r.profils),
      deposeLe: r.depose_le,
    })),
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
};

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

/** Toutes les personnes inscrites (participants et admins), les plus récentes d'abord. */
export async function lireParticipants(): Promise<ParticipantListe[]> {
  await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase.from("profils").select("id, prenom, nom, role, cree_le").order("cree_le", { ascending: false });
  return (data ?? []).map((p) => ({ id: p.id, nom: nomAffiche(p), role: p.role, inscritLe: p.cree_le }));
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
// Séances (lot 3)
// ---------------------------------------------------------------

export type SeanceListe = {
  id: string;
  titre: string;
  debut: string;
  fin: string | null;
  lieu: string | null;
  publie: boolean;
  passee: boolean;
  cours: string | null;
  intervenants: string[];
};

export type SeanceAdmin = {
  id: string;
  titre: string;
  debut: string;
  fin: string | null;
  lieu: string | null;
  description: string;
  coursId: string | null;
  intervenants: string[];
  publie: boolean;
};

/** Liste des cours, pour les formulaires de séance et de devoir. */
export type OptionsCours = { cours: { id: string; titre: string }[] };

/** Toutes les séances, de la plus proche à la plus lointaine. */
export async function lireSeancesAdmin(): Promise<SeanceListe[]> {
  await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("sessions")
    .select("id, titre, debut, fin, lieu, publie, intervenants, cours(titre)")
    .order("debut");
  const maintenant = Date.now();
  return (data ?? []).map((s) => ({
    id: s.id,
    titre: s.titre,
    debut: s.debut,
    fin: s.fin,
    lieu: s.lieu,
    publie: s.publie,
    passee: new Date(s.fin ?? s.debut).getTime() < maintenant,
    cours: s.cours?.titre ?? null,
    intervenants: s.intervenants,
  }));
}

/** Une séance à modifier (null si elle n'existe pas). */
export async function lireSeanceAdmin(id: string): Promise<SeanceAdmin | null> {
  if (!UUID_ADMIN.test(id)) return null;
  await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  const { data: s } = await supabase
    .from("sessions")
    .select("id, titre, debut, fin, lieu, description, cours_id, intervenants, publie")
    .eq("id", id)
    .maybeSingle();
  if (!s) return null;
  return {
    id: s.id,
    titre: s.titre,
    debut: s.debut,
    fin: s.fin,
    lieu: s.lieu,
    description: s.description,
    coursId: s.cours_id,
    intervenants: s.intervenants,
    publie: s.publie,
  };
}

/** Tous les cours, dans l'ordre choisi par l'équipe. */
export async function lireOptionsCours(): Promise<OptionsCours> {
  await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase.from("cours").select("id, titre").order("ordre").order("titre");
  return { cours: data ?? [] };
}

// ---------------------------------------------------------------
// Cours et supports (lot 4)
// ---------------------------------------------------------------

export type CoursListe = {
  id: string;
  titre: string;
  publie: boolean;
  seances: number;
  supports: number;
  devoirs: number;
};

export type SupportAdmin = { id: string; titre: string; type: "fichier" | "lien"; url: string | null; nomFichier: string | null };

export type CoursAdmin = {
  id: string;
  titre: string;
  description: string;
  objectifs: string[];
  ordre: number;
  publie: boolean;
  seances: number;
  devoirs: number;
  supports: SupportAdmin[];
};

/** Tous les cours, avec leur contenu. */
export async function lireCoursAdmin(): Promise<CoursListe[]> {
  await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("cours")
    .select("id, titre, publie, sessions(count), ressources(count), devoirs(count)")
    .order("ordre")
    .order("titre");
  return (data ?? []).map((c) => ({
    id: c.id,
    titre: c.titre,
    publie: c.publie,
    seances: c.sessions[0]?.count ?? 0,
    supports: c.ressources[0]?.count ?? 0,
    devoirs: c.devoirs[0]?.count ?? 0,
  }));
}

/** Un cours à modifier, avec ses supports (null s'il n'existe pas). */
export async function lireCoursFiche(id: string): Promise<CoursAdmin | null> {
  if (!UUID_ADMIN.test(id)) return null;
  await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  const { data: c } = await supabase
    .from("cours")
    .select(
      "id, titre, description, objectifs, ordre, publie, sessions(count), devoirs(count), ressources(id, titre, type, url, storage_path, cree_le)",
    )
    .eq("id", id)
    .order("cree_le", { referencedTable: "ressources", ascending: true })
    .maybeSingle();
  if (!c) return null;
  return {
    id: c.id,
    titre: c.titre,
    description: c.description,
    objectifs: c.objectifs,
    ordre: c.ordre,
    publie: c.publie,
    seances: c.sessions[0]?.count ?? 0,
    devoirs: c.devoirs[0]?.count ?? 0,
    supports: c.ressources.map((r) => ({
      id: r.id,
      titre: r.titre,
      type: r.type === "lien" ? "lien" : "fichier",
      url: r.url,
      nomFichier: r.storage_path ? (r.storage_path.split("/").pop() ?? null) : null,
    })),
  };
}

// ---------------------------------------------------------------
// Devoirs et corrections (lot 5)
// ---------------------------------------------------------------

export type DevoirListe = {
  id: string;
  titre: string;
  echeance: string | null;
  publie: boolean;
  cours: string;
  rendus: number;
  aCorriger: number;
};

export type RenduAdmin = {
  id: string;
  participant: string;
  participantId: string;
  nomFichier: string | null;
  deposeLe: string;
  statut: "depose" | "corrige";
};

export type DevoirAdmin = {
  id: string;
  coursId: string;
  cours: string;
  titre: string;
  consigne: string;
  echeance: string | null;
  publie: boolean;
  rendus: RenduAdmin[];
  /** Participants qui n'ont pas encore rendu. */
  manquants: Membre[];
};

/** Tous les devoirs, les échéances les plus proches d'abord. */
export async function lireDevoirsAdmin(): Promise<DevoirListe[]> {
  await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("devoirs")
    .select("id, titre, echeance, publie, cours(titre), rendus(statut)")
    .order("echeance", { ascending: true, nullsFirst: false });
  return (data ?? []).map((d) => ({
    id: d.id,
    titre: d.titre,
    echeance: d.echeance,
    publie: d.publie,
    cours: d.cours?.titre ?? "",
    rendus: d.rendus.length,
    aCorriger: d.rendus.filter((r) => r.statut === "depose").length,
  }));
}

/** Un devoir avec ses rendus et les participants qui n'ont pas rendu (null s'il n'existe pas). */
export async function lireDevoirAdmin(id: string): Promise<DevoirAdmin | null> {
  if (!UUID_ADMIN.test(id)) return null;
  await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  const [{ data: d }, { data: profils }] = await Promise.all([
    supabase
      .from("devoirs")
      .select("id, cours_id, titre, consigne, echeance, publie, cours(titre), rendus(id, participant_id, nom_fichier, depose_le, statut)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("profils").select("id, prenom, nom, role"),
  ]);
  if (!d) return null;

  const noms = new Map((profils ?? []).map((p) => [p.id, nomAffiche(p)]));
  const ontRendu = new Set(d.rendus.map((r) => r.participant_id));

  return {
    id: d.id,
    coursId: d.cours_id,
    cours: d.cours?.titre ?? "",
    titre: d.titre,
    consigne: d.consigne,
    echeance: d.echeance,
    publie: d.publie,
    rendus: d.rendus
      .map((r) => ({
        id: r.id,
        participantId: r.participant_id,
        participant: noms.get(r.participant_id) ?? "Inconnu",
        nomFichier: r.nom_fichier,
        deposeLe: r.depose_le,
        statut: r.statut,
      }))
      .sort((a, b) => (a.statut === b.statut ? a.deposeLe.localeCompare(b.deposeLe) : a.statut === "depose" ? -1 : 1)),
    manquants: (profils ?? [])
      .filter((p) => p.role === "participant" && !ontRendu.has(p.id))
      .map((p) => ({ id: p.id, nom: nomAffiche(p) }))
      .sort(parNom),
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

/** Tous les témoignages : ceux à valider d'abord, puis les validés. */
export async function lireTemoignagesAdmin(): Promise<TemoignageAdmin[]> {
  await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("temoignages")
    .select("id, nom_affiche, texte, valide, photo_path, cree_le")
    .order("valide", { ascending: true })
    .order("cree_le", { ascending: false });
  const liste = data ?? [];
  const chemins = liste.flatMap((t) => (t.photo_path ? [t.photo_path] : []));
  const liens = chemins.length > 0 ? ((await supabase.storage.from("photos").createSignedUrls(chemins, 300)).data ?? []) : [];
  const parChemin = new Map(liens.map((l) => [l.path, l.signedUrl]));
  return liste.map((t) => ({
    id: t.id,
    nom: t.nom_affiche,
    texte: t.texte,
    valide: t.valide,
    photoPath: t.photo_path,
    photoUrl: t.photo_path ? (parChemin.get(t.photo_path) ?? null) : null,
    creeLe: t.cree_le,
  }));
}
