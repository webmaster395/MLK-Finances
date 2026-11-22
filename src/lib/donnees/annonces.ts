import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { creerClientServeur } from "@/lib/supabase/serveur";

export type Annonce = {
  id: string;
  titre: string;
  message: string;
  cree_le: string;
};

/**
 * Tous les messages publiés de l'équipe visibles par la personne,
 * du plus récent au plus ancien. Partagé pendant une même requête.
 */
export const lireMessages = cache(async (): Promise<Annonce[]> => {
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("annonces")
    .select("id, titre, message, cree_le")
    .order("cree_le", { ascending: false });
  return data ?? [];
});

/**
 * Le message le plus récent de l'équipe.
 * Les règles de la base ne renvoient que les messages publiés qui la concernent.
 */
export async function lireDernierMessage(): Promise<Annonce | null> {
  const messages = await lireMessages();
  return messages[0] ?? null;
}
