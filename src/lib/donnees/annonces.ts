import "server-only";
import { connection } from "next/server";
import { creerClientServeur } from "@/lib/supabase/serveur";

export type Annonce = {
  id: string;
  titre: string;
  message: string;
  cree_le: string;
};

/**
 * Le message le plus récent de l'équipe, pour tous ou pour le groupe de la personne.
 * Les règles de la base ne renvoient que les messages publiés qui la concernent.
 */
export async function lireDernierMessage(): Promise<Annonce | null> {
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("annonces")
    .select("id, titre, message, cree_le")
    .order("cree_le", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}
