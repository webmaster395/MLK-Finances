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
