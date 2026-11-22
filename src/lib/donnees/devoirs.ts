import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { estAFaire, renduEnRetard, statutDevoir, type RenduResume, type StatutDevoir } from "@/lib/devoirs";
import { jourParis } from "@/lib/format";

export type SeanceDevoir = {
  id: string;
  titre: string;
  /** Jour de la séance à Paris, « AAAA-MM-JJ » */
  jour: string;
};

export type DevoirListe = {
  id: string;
  titre: string;
  echeance: string | null;
  /** Jour de l'échéance à Paris, « AAAA-MM-JJ » (null sans échéance) */
  jourEcheance: string | null;
  cours: { id: string; titre: string } | null;
  seance: SeanceDevoir | null;
  rendu: RenduResume;
  /** Vrai si le fichier a été déposé après la date limite */
  enRetard: boolean;
  statut: StatutDevoir;
};

export type DevoirDetail = DevoirListe & { consigne: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const COLONNES_RENDU = "rendus(statut, depose_le, nom_fichier)";
const COLONNES_COURS = "cours(id, titre, sessions(id, titre, debut, fin))";

type LigneRendu = { statut: "depose" | "corrige"; depose_le: string; nom_fichier: string | null };
type LigneSeance = { id: string; titre: string; debut: string; fin: string | null };

function premierRendu(rendus: LigneRendu[]): RenduResume {
  const r = rendus[0];
  return r ? { statut: r.statut, depose_le: r.depose_le, nom_fichier: r.nom_fichier } : null;
}

function choisirSeance(seances: LigneSeance[], maintenant: number): SeanceDevoir | null {
  if (seances.length === 0) return null;
  const triees = [...seances].sort((a, b) => new Date(a.debut).getTime() - new Date(b.debut).getTime());
  const retenue = triees.find((s) => new Date(s.fin ?? s.debut).getTime() >= maintenant) ?? triees[0];
  return {
    id: retenue.id,
    titre: retenue.titre,
    jour: jourParis(retenue.debut),
  };
}

/**
 * Tous les devoirs visibles de la personne avec son rendu éventuel.
 * Les règles de la base ne renvoient que les devoirs publiés et SES rendus.
 * Partagé pendant une même requête (le menu et la page l'utilisent tous les deux).
 */
export const lireDevoirs = cache(async (): Promise<DevoirListe[]> => {
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("devoirs")
    .select(`id, titre, echeance, ${COLONNES_COURS}, ${COLONNES_RENDU}`)
    .order("echeance", { ascending: true, nullsFirst: false });

  const maintenant = Date.now();
  return (data ?? []).map((d) => {
    const rendu = premierRendu(d.rendus);
    return {
      id: d.id,
      titre: d.titre,
      echeance: d.echeance,
      jourEcheance: d.echeance ? jourParis(d.echeance) : null,
      cours: d.cours ? { id: d.cours.id, titre: d.cours.titre } : null,
      seance: choisirSeance(d.cours?.sessions ?? [], maintenant),
      rendu,
      enRetard: renduEnRetard(d.echeance, rendu),
      statut: statutDevoir(d.echeance, rendu, maintenant),
    };
  });
});

/** Nombre de devoirs qui attendent encore un rendu (pastille rouge du menu). */
export async function compterDevoirsAFaire(): Promise<number> {
  const devoirs = await lireDevoirs();
  return devoirs.filter((d) => estAFaire(d.statut)).length;
}

/** Un devoir par son identifiant (null s'il n'existe pas ou n'est pas visible par la personne). */
export async function lireDevoir(id: string): Promise<DevoirDetail | null> {
  if (!UUID.test(id)) return null;
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("devoirs")
    .select(`id, titre, consigne, echeance, ${COLONNES_COURS}, ${COLONNES_RENDU}`)
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;

  const maintenant = Date.now();
  const rendu = premierRendu(data.rendus);
  return {
    id: data.id,
    titre: data.titre,
    consigne: data.consigne,
    echeance: data.echeance,
    jourEcheance: data.echeance ? jourParis(data.echeance) : null,
    cours: data.cours ? { id: data.cours.id, titre: data.cours.titre } : null,
    seance: choisirSeance(data.cours?.sessions ?? [], maintenant),
    rendu,
    enRetard: renduEnRetard(data.echeance, rendu),
    statut: statutDevoir(data.echeance, rendu, maintenant),
  };
}
