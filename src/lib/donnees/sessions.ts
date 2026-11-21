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

export type SessionListe = ProchaineSession & {
  /** Titre du cours lié (absent si la session n'a pas de cours ou si le cours n'est pas publié). */
  cours: { id: string; titre: string } | null;
};

export type SessionDetail = SessionListe & { description: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

/** Toutes les sessions visibles de la personne, séparées en « à venir » (les plus proches d'abord) et « passées » (les plus récentes d'abord). */
export async function lireSessions(): Promise<{ aVenir: SessionListe[]; passees: SessionListe[] }> {
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("sessions")
    .select("id, titre, debut, fin, lieu, cours(id, titre)")
    .order("debut", { ascending: true });

  const maintenant = Date.now();
  const toutes = data ?? [];
  // Une session est « à venir » tant qu'elle n'est pas terminée (fin, ou début si pas de fin)
  const estPassee = (s: SessionListe) => new Date(s.fin ?? s.debut).getTime() < maintenant;

  return {
    aVenir: toutes.filter((s) => !estPassee(s)),
    passees: toutes.filter(estPassee).reverse(),
  };
}

/** Une session par son identifiant (null si elle n'existe pas ou n'est pas visible par la personne). */
export async function lireSession(id: string): Promise<SessionDetail | null> {
  if (!UUID.test(id)) return null;
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("sessions")
    .select("id, titre, debut, fin, lieu, description, cours(id, titre)")
    .eq("id", id)
    .maybeSingle();
  return data;
}
