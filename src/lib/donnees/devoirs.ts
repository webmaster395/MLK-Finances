import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { estAFaire, statutDevoir, type RenduResume, type StatutDevoir } from "@/lib/devoirs";

export type DevoirListe = {
  id: string;
  titre: string;
  echeance: string | null;
  cours: { id: string; titre: string } | null;
  rendu: RenduResume;
  statut: StatutDevoir;
};

export type DevoirDetail = DevoirListe & { consigne: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const COLONNES_RENDU = "rendus(statut, depose_le, nom_fichier)";

type LigneRendu = { statut: "depose" | "corrige"; depose_le: string; nom_fichier: string | null };

function premierRendu(rendus: LigneRendu[]): RenduResume {
  const r = rendus[0];
  return r ? { statut: r.statut, depose_le: r.depose_le, nom_fichier: r.nom_fichier } : null;
}

/**
 * Tous les devoirs visibles de la personne avec son rendu éventuel.
 * Les règles de la base ne renvoient que les devoirs publiés de son groupe et SES rendus.
 * Partagé pendant une même requête (le menu et la page l'utilisent tous les deux).
 */
export const lireDevoirs = cache(async (): Promise<DevoirListe[]> => {
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("devoirs")
    .select(`id, titre, echeance, cours(id, titre), ${COLONNES_RENDU}`)
    .order("echeance", { ascending: true, nullsFirst: false });

  const maintenant = Date.now();
  return (data ?? []).map((d) => {
    const rendu = premierRendu(d.rendus);
    return {
      id: d.id,
      titre: d.titre,
      echeance: d.echeance,
      cours: d.cours,
      rendu,
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
    .select(`id, titre, consigne, echeance, cours(id, titre), ${COLONNES_RENDU}`)
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;

  const rendu = premierRendu(data.rendus);
  return {
    id: data.id,
    titre: data.titre,
    consigne: data.consigne,
    echeance: data.echeance,
    cours: data.cours,
    rendu,
    statut: statutDevoir(data.echeance, rendu, Date.now()),
  };
}
