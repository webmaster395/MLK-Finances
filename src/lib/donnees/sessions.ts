import "server-only";
import { connection } from "next/server";
import { creerClientServeur } from "@/lib/supabase/serveur";

export type ProchaineSession = {
  id: string;
  titre: string;
  debut: string;
  fin: string | null;
  lieu: string | null;
};

/**
 * Prochaine session à venir du groupe de la personne.
 * Les règles de la base (RLS) ne renvoient que les sessions publiées de ses groupes.
 */
export async function lireProchaineSession(): Promise<ProchaineSession | null> {
  await connection(); // dépend de l'heure et de la personne : au moment de la requête
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("sessions")
    .select("id, titre, debut, fin, lieu")
    .gte("debut", new Date().toISOString())
    .order("debut", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data;
}
