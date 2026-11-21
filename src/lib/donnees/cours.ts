import "server-only";
import { connection } from "next/server";
import { creerClientServeur } from "@/lib/supabase/serveur";

export type SeanceDuCours = {
  id: string;
  titre: string;
  debut: string;
  fin: string | null;
  lieu: string | null;
  passee: boolean;
};

export type SupportDuCours = {
  id: string;
  titre: string;
  type: "fichier" | "lien";
  url: string | null;
};

export type CoursDetail = {
  id: string;
  titre: string;
  description: string;
  objectifs: string[];
  seances: SeanceDuCours[];
  supports: SupportDuCours[];
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Un module avec ses séances et ses supports (null s'il n'existe pas ou n'est pas visible). */
export async function lireCoursDetail(id: string): Promise<CoursDetail | null> {
  if (!UUID.test(id)) return null;
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("cours")
    .select(
      "id, titre, description, objectifs, sessions(id, titre, debut, fin, lieu), ressources(id, titre, type, url)",
    )
    .eq("id", id)
    .order("debut", { referencedTable: "sessions", ascending: true })
    .order("cree_le", { referencedTable: "ressources", ascending: true })
    .maybeSingle();
  if (!data) return null;

  const maintenant = Date.now();
  return {
    id: data.id,
    titre: data.titre,
    description: data.description,
    objectifs: data.objectifs,
    seances: data.sessions.map((s) => ({
      ...s,
      passee: new Date(s.fin ?? s.debut).getTime() < maintenant,
    })),
    supports: data.ressources.map((r) => ({
      id: r.id,
      titre: r.titre,
      type: r.type === "lien" ? "lien" : "fichier",
      url: r.url,
    })),
  };
}
