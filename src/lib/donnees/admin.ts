import "server-only";
import { connection } from "next/server";
import { exigerAdmin } from "@/lib/auth/personne";
import { libellePromotion } from "@/lib/format";
import { creerClientServeur } from "@/lib/supabase/serveur";

export type GroupeEffectif = { id: string; nom: string; promotion: string | null; effectif: number };
export type ParticipantSansGroupe = { id: string; nom: string; inscritLe: string };
export type RenduACorriger = { id: string; devoir: string; participant: string; deposeLe: string };

export type TableauDeBord = {
  participants: number;
  groupes: GroupeEffectif[];
  sansGroupe: ParticipantSansGroupe[];
  seancesAVenir: number;
  aCorriger: RenduACorriger[];
  temoignagesAValider: number;
};

const nomAffiche = (p: { prenom: string; nom: string } | null) =>
  p ? `${p.prenom} ${p.nom}`.trim() || "Sans nom" : "Inconnu";

/** Chiffres et listes du tableau de bord admin. Réservé aux admins (vérifié ici, puis par la RLS). */
export async function lireTableauDeBord(): Promise<TableauDeBord> {
  await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  const maintenant = new Date(Date.now()).toISOString();

  const [participants, groupes, seances, rendus, temoignages] = await Promise.all([
    supabase
      .from("profils")
      .select("id, prenom, nom, cree_le, inscriptions(groupe_id)")
      .eq("role", "participant")
      .order("cree_le", { ascending: false }),
    supabase.from("groupes").select("id, nom, debut, fin, inscriptions(count)").order("debut", { ascending: false }),
    supabase.from("sessions").select("id", { count: "exact", head: true }).gte("debut", maintenant),
    supabase
      .from("rendus")
      .select("id, depose_le, devoirs(titre), profils(prenom, nom)")
      .eq("statut", "depose")
      .order("depose_le", { ascending: true }),
    supabase.from("temoignages").select("id", { count: "exact", head: true }).eq("valide", false),
  ]);

  const liste = participants.data ?? [];
  return {
    participants: liste.length,
    groupes: (groupes.data ?? []).map((g) => ({
      id: g.id,
      nom: g.nom,
      promotion: libellePromotion(g) === g.nom ? null : libellePromotion(g),
      effectif: g.inscriptions[0]?.count ?? 0,
    })),
    sansGroupe: liste
      .filter((p) => p.inscriptions.length === 0)
      .map((p) => ({ id: p.id, nom: nomAffiche(p), inscritLe: p.cree_le })),
    seancesAVenir: seances.count ?? 0,
    aCorriger: (rendus.data ?? []).map((r) => ({
      id: r.id,
      devoir: r.devoirs?.titre ?? "Devoir",
      participant: nomAffiche(r.profils),
      deposeLe: r.depose_le,
    })),
    temoignagesAValider: temoignages.count ?? 0,
  };
}

// ---------------------------------------------------------------
// Groupes et participants (lot 2)
// ---------------------------------------------------------------

export type GroupeListe = {
  id: string;
  nom: string;
  debut: string | null;
  fin: string | null;
  promotion: string | null;
  effectif: number;
  cours: number;
  seances: number;
};

export type Membre = { id: string; nom: string };

export type GroupeDetail = GroupeListe & {
  membres: Membre[];
  /** Participants qui ne sont pas encore dans ce groupe (pour les y rattacher). */
  autres: Membre[];
};

export type ParticipantListe = {
  id: string;
  nom: string;
  role: "participant" | "admin";
  inscritLe: string;
  groupes: { id: string; nom: string }[];
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
  groupes: { id: string; nom: string; membre: boolean }[];
};

const UUID_ADMIN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const parNom = (a: { nom: string }, b: { nom: string }) => a.nom.localeCompare(b.nom, "fr");

const promotionDe = (g: { nom: string; debut: string | null; fin: string | null }) =>
  libellePromotion(g) === g.nom ? null : libellePromotion(g);

/** Tous les groupes, avec leur effectif et leur contenu (cours, séances). */
export async function lireGroupes(): Promise<GroupeListe[]> {
  await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("groupes")
    .select("id, nom, debut, fin, inscriptions(count), cours(count), sessions(count)")
    .order("debut", { ascending: false, nullsFirst: false })
    .order("nom");
  return (data ?? []).map((g) => ({
    id: g.id,
    nom: g.nom,
    debut: g.debut,
    fin: g.fin,
    promotion: promotionDe(g),
    effectif: g.inscriptions[0]?.count ?? 0,
    cours: g.cours[0]?.count ?? 0,
    seances: g.sessions[0]?.count ?? 0,
  }));
}

/** Un groupe, ses membres et les participants qu'on peut y rattacher (null s'il n'existe pas). */
export async function lireGroupe(id: string): Promise<GroupeDetail | null> {
  if (!UUID_ADMIN.test(id)) return null;
  await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  const [groupe, participants] = await Promise.all([
    supabase
      .from("groupes")
      .select("id, nom, debut, fin, inscriptions(participant_id), cours(count), sessions(count)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("profils").select("id, prenom, nom").eq("role", "participant"),
  ]);
  const g = groupe.data;
  if (!g) return null;

  const dansLeGroupe = new Set(g.inscriptions.map((i) => i.participant_id));
  const tous = (participants.data ?? []).map((p) => ({ id: p.id, nom: nomAffiche(p) }));
  // Un admin rattaché au groupe (cas rare) apparaît aussi dans les membres
  const membres = g.inscriptions
    .map((i) => tous.find((p) => p.id === i.participant_id) ?? { id: i.participant_id, nom: "Administrateur" })
    .sort(parNom);

  return {
    id: g.id,
    nom: g.nom,
    debut: g.debut,
    fin: g.fin,
    promotion: promotionDe(g),
    effectif: membres.length,
    cours: g.cours[0]?.count ?? 0,
    seances: g.sessions[0]?.count ?? 0,
    membres,
    autres: tous.filter((p) => !dansLeGroupe.has(p.id)).sort(parNom),
  };
}

/** Toutes les personnes inscrites (participants et admins), les plus récentes d'abord. */
export async function lireParticipants(): Promise<ParticipantListe[]> {
  await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("profils")
    .select("id, prenom, nom, role, cree_le, inscriptions(groupes(id, nom))")
    .order("cree_le", { ascending: false });
  return (data ?? []).map((p) => ({
    id: p.id,
    nom: nomAffiche(p),
    role: p.role,
    inscritLe: p.cree_le,
    groupes: p.inscriptions.flatMap((i) => (i.groupes ? [i.groupes] : [])).sort(parNom),
  }));
}

/** La fiche d'une personne, avec la liste de tous les groupes (null si elle n'existe pas). */
export async function lireParticipant(id: string): Promise<ParticipantDetail | null> {
  if (!UUID_ADMIN.test(id)) return null;
  const admin = await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  const [profil, groupes] = await Promise.all([
    supabase
      .from("profils")
      .select("id, prenom, nom, civilite, tranche_age, role, cree_le, inscriptions(groupe_id)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("groupes").select("id, nom").order("nom"),
  ]);
  const p = profil.data;
  if (!p) return null;
  const membreDe = new Set(p.inscriptions.map((i) => i.groupe_id));
  return {
    id: p.id,
    prenom: p.prenom,
    nom: p.nom,
    civilite: p.civilite,
    trancheAge: p.tranche_age,
    role: p.role,
    inscritLe: p.cree_le,
    estMoi: p.id === admin.id,
    groupes: (groupes.data ?? []).map((g) => ({ id: g.id, nom: g.nom, membre: membreDe.has(g.id) })),
  };
}

// ---------------------------------------------------------------
// Séances et rubriques (lot 3)
// ---------------------------------------------------------------

export type RubriqueAdmin = { id: string; nom: string; couleur: string; ordre: number; seances: number };

export type SeanceListe = {
  id: string;
  titre: string;
  debut: string;
  fin: string | null;
  lieu: string | null;
  publie: boolean;
  passee: boolean;
  groupe: string;
  rubrique: { nom: string; couleur: string } | null;
  cours: string | null;
  intervenants: string[];
};

export type SeanceAdmin = {
  id: string;
  groupeId: string;
  titre: string;
  debut: string;
  fin: string | null;
  lieu: string | null;
  description: string;
  rubriqueId: string | null;
  coursId: string | null;
  intervenants: string[];
  publie: boolean;
};

/** Listes de choix des formulaires de séance : groupes, rubriques, cours (avec leur groupe). */
export type OptionsSeance = {
  groupes: { id: string; nom: string }[];
  rubriques: { id: string; nom: string }[];
  cours: { id: string; titre: string; groupeId: string }[];
};

/** Toutes les rubriques, avec le nombre de séances qui les utilisent. */
export async function lireRubriquesAdmin(): Promise<RubriqueAdmin[]> {
  await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase.from("rubriques").select("id, nom, couleur, ordre, sessions(count)").order("ordre").order("nom");
  return (data ?? []).map((r) => ({ id: r.id, nom: r.nom, couleur: r.couleur, ordre: r.ordre, seances: r.sessions[0]?.count ?? 0 }));
}

/** Les séances (toutes, ou celles d'un groupe), de la plus proche à la plus lointaine. */
export async function lireSeancesAdmin(groupeId?: string): Promise<SeanceListe[]> {
  await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  let requete = supabase
    .from("sessions")
    .select("id, titre, debut, fin, lieu, publie, intervenants, groupes(nom), rubriques(nom, couleur), cours(titre)")
    .order("debut");
  if (groupeId && UUID_ADMIN.test(groupeId)) requete = requete.eq("groupe_id", groupeId);
  const { data } = await requete;
  const maintenant = Date.now();
  return (data ?? []).map((s) => ({
    id: s.id,
    titre: s.titre,
    debut: s.debut,
    fin: s.fin,
    lieu: s.lieu,
    publie: s.publie,
    passee: new Date(s.fin ?? s.debut).getTime() < maintenant,
    groupe: s.groupes?.nom ?? "",
    rubrique: s.rubriques,
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
    .select("id, groupe_id, titre, debut, fin, lieu, description, rubrique_id, cours_id, intervenants, publie")
    .eq("id", id)
    .maybeSingle();
  if (!s) return null;
  return {
    id: s.id,
    groupeId: s.groupe_id,
    titre: s.titre,
    debut: s.debut,
    fin: s.fin,
    lieu: s.lieu,
    description: s.description,
    rubriqueId: s.rubrique_id,
    coursId: s.cours_id,
    intervenants: s.intervenants,
    publie: s.publie,
  };
}

export async function lireOptionsSeance(): Promise<OptionsSeance> {
  await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  const [groupes, rubriques, cours] = await Promise.all([
    supabase.from("groupes").select("id, nom").order("nom"),
    supabase.from("rubriques").select("id, nom").order("ordre").order("nom"),
    supabase.from("cours").select("id, titre, groupe_id").order("ordre").order("titre"),
  ]);
  return {
    groupes: groupes.data ?? [],
    rubriques: rubriques.data ?? [],
    cours: (cours.data ?? []).map((c) => ({ id: c.id, titre: c.titre, groupeId: c.groupe_id })),
  };
}

// ---------------------------------------------------------------
// Cours et supports (lot 4)
// ---------------------------------------------------------------

export type CoursListe = {
  id: string;
  titre: string;
  publie: boolean;
  groupe: string;
  seances: number;
  supports: number;
  devoirs: number;
};

export type SupportAdmin = { id: string; titre: string; type: "fichier" | "lien"; url: string | null; nomFichier: string | null };

export type CoursAdmin = {
  id: string;
  groupeId: string;
  groupe: string;
  titre: string;
  description: string;
  objectifs: string[];
  ordre: number;
  publie: boolean;
  seances: number;
  devoirs: number;
  supports: SupportAdmin[];
};

/** Tous les cours (ou ceux d'un groupe), avec leur contenu. */
export async function lireCoursAdmin(groupeId?: string): Promise<CoursListe[]> {
  await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  let requete = supabase
    .from("cours")
    .select("id, titre, publie, groupes(nom), sessions(count), ressources(count), devoirs(count)")
    .order("ordre")
    .order("titre");
  if (groupeId && UUID_ADMIN.test(groupeId)) requete = requete.eq("groupe_id", groupeId);
  const { data } = await requete;
  return (data ?? []).map((c) => ({
    id: c.id,
    titre: c.titre,
    publie: c.publie,
    groupe: c.groupes?.nom ?? "",
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
      "id, groupe_id, titre, description, objectifs, ordre, publie, groupes(nom), sessions(count), devoirs(count), ressources(id, titre, type, url, storage_path, cree_le)",
    )
    .eq("id", id)
    .order("cree_le", { referencedTable: "ressources", ascending: true })
    .maybeSingle();
  if (!c) return null;
  return {
    id: c.id,
    groupeId: c.groupe_id,
    groupe: c.groupes?.nom ?? "",
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
  groupe: string;
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
  groupe: string;
  titre: string;
  consigne: string;
  echeance: string | null;
  publie: boolean;
  rendus: RenduAdmin[];
  /** Participants du groupe qui n'ont pas encore rendu. */
  manquants: Membre[];
};

export type OptionsDevoir = { groupes: { id: string; nom: string; cours: { id: string; titre: string }[] }[] };

/** Tous les devoirs, les échéances les plus proches d'abord. */
export async function lireDevoirsAdmin(): Promise<DevoirListe[]> {
  await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("devoirs")
    .select("id, titre, echeance, publie, cours(titre, groupes(nom)), rendus(statut)")
    .order("echeance", { ascending: true, nullsFirst: false });
  return (data ?? []).map((d) => ({
    id: d.id,
    titre: d.titre,
    echeance: d.echeance,
    publie: d.publie,
    cours: d.cours?.titre ?? "",
    groupe: d.cours?.groupes?.nom ?? "",
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
  const { data: d } = await supabase
    .from("devoirs")
    .select(
      "id, cours_id, titre, consigne, echeance, publie, cours(titre, groupe_id, groupes(nom, inscriptions(participant_id))), rendus(id, participant_id, nom_fichier, depose_le, statut)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!d) return null;

  const { data: profils } = await supabase.from("profils").select("id, prenom, nom");
  const noms = new Map((profils ?? []).map((p) => [p.id, nomAffiche(p)]));
  const ontRendu = new Set(d.rendus.map((r) => r.participant_id));
  const inscrits = d.cours?.groupes?.inscriptions.map((i) => i.participant_id) ?? [];

  return {
    id: d.id,
    coursId: d.cours_id,
    cours: d.cours?.titre ?? "",
    groupe: d.cours?.groupes?.nom ?? "",
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
    manquants: inscrits
      .filter((p) => !ontRendu.has(p))
      .map((p) => ({ id: p, nom: noms.get(p) ?? "Inconnu" }))
      .sort(parNom),
  };
}

/** Cours rangés par groupe, pour le formulaire d'un devoir. */
export async function lireOptionsDevoir(): Promise<OptionsDevoir> {
  await exigerAdmin();
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase.from("groupes").select("id, nom, cours(id, titre, ordre)").order("nom");
  return {
    groupes: (data ?? [])
      .map((g) => ({
        id: g.id,
        nom: g.nom,
        cours: [...g.cours].sort((a, b) => a.ordre - b.ordre).map((c) => ({ id: c.id, titre: c.titre })),
      }))
      .filter((g) => g.cours.length > 0),
  };
}
