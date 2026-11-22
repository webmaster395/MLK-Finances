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
