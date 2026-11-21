import "server-only";
import { connection } from "next/server";
import { creerClientServeur } from "@/lib/supabase/serveur";

export type Temoignage = {
  id: string;
  nom_affiche: string;
  texte: string;
};

/**
 * Les témoignages validés (lecture seule). Les règles de la base (RLS) ne renvoient
 * que ceux dont « valide » est vrai : un témoignage en attente n'est jamais visible.
 */
export async function lireTemoignages(): Promise<Temoignage[]> {
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("temoignages")
    .select("id, nom_affiche, texte")
    .order("cree_le", { ascending: false });
  return data ?? [];
}
