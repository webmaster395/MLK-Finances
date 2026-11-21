import "server-only";
import { connection } from "next/server";
import { statutDevoir, type StatutDevoir } from "@/lib/devoirs";
import { jourParis } from "@/lib/format";
import { creerClientServeur } from "@/lib/supabase/serveur";
import type { Rubrique } from "./sessions";

export type SeanceDuCours = {
  id: string;
  titre: string;
  debut: string;
  fin: string | null;
  jour: string;
  lieu: string | null;
  rubrique: Rubrique | null;
  intervenants: string[];
  passee: boolean;
};

export type SupportDuCours = {
  id: string;
  titre: string;
  type: "fichier" | "lien";
  url: string | null;
};

export type DevoirDuCours = {
  id: string;
  titre: string;
  echeance: string | null;
  rendu: boolean;
  statut: StatutDevoir;
};

export type CoursDetail = {
  id: string;
  titre: string;
  description: string;
  objectifs: string[];
  seances: SeanceDuCours[];
  supports: SupportDuCours[];
  devoirs: DevoirDuCours[];
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Un module avec ses séances, ses devoirs et ses supports (null s'il n'existe pas ou n'est pas visible). */
export async function lireCoursDetail(id: string): Promise<CoursDetail | null> {
  if (!UUID.test(id)) return null;
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("cours")
    .select(
      "id, titre, description, objectifs, sessions(id, titre, debut, fin, lieu, intervenants, rubriques(nom, couleur)), ressources(id, titre, type, url), devoirs(id, titre, echeance, rendus(id))",
    )
    .eq("id", id)
    .order("debut", { referencedTable: "sessions", ascending: true })
    .order("cree_le", { referencedTable: "ressources", ascending: true })
    .order("echeance", { referencedTable: "devoirs", ascending: true })
    .maybeSingle();
  if (!data) return null;

  const maintenant = Date.now();
  return {
    id: data.id,
    titre: data.titre,
    description: data.description,
    objectifs: data.objectifs,
    seances: data.sessions.map((s) => ({
      id: s.id,
      titre: s.titre,
      debut: s.debut,
      fin: s.fin,
      jour: jourParis(s.debut),
      lieu: s.lieu,
      rubrique: s.rubriques,
      intervenants: s.intervenants,
      passee: new Date(s.fin ?? s.debut).getTime() < maintenant,
    })),
    supports: data.ressources.map((r) => ({
      id: r.id,
      titre: r.titre,
      type: r.type === "lien" ? "lien" : "fichier",
      url: r.url,
    })),
    devoirs: data.devoirs.map((d) => {
      const rendu = d.rendus.length > 0;
      return {
        id: d.id,
        titre: d.titre,
        echeance: d.echeance,
        rendu,
        statut: statutDevoir(d.echeance, rendu ? { statut: "depose", depose_le: "", nom_fichier: null } : null, maintenant),
      };
    }),
  };
}
