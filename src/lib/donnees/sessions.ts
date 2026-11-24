import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { joursEntre, jourParis } from "@/lib/format";

/** Une session telle qu'elle apparaît dans le calendrier et sur l'accueil. */
export type Seance = {
  id: string;
  titre: string;
  debut: string;
  fin: string | null;
  /** Jour à Paris, « AAAA-MM-JJ » */
  jour: string;
  /** Lien de la visioconférence (null s'il n'est pas encore donné). */
  lienVisio: string | null;
  /** Vrai s'il y a des travaux à faire avant la session. */
  aPreparer: boolean;
  passee: boolean;
};

export type DocumentSession = { id: string; titre: string; type: "fichier" | "lien"; url: string | null };

export type SeanceDetail = Seance & {
  description: string;
  objectifs: string[];
  travauxAvant: string;
  travauxApres: string;
  materiel: string;
  documents: DocumentSession[];
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Ligne = { id: string; titre: string; debut: string; fin: string | null; lien_visio: string | null; travaux_avant: string };

function versSeance(s: Ligne, maintenant: number): Seance {
  return {
    id: s.id,
    titre: s.titre,
    debut: s.debut,
    fin: s.fin,
    jour: jourParis(s.debut),
    lienVisio: s.lien_visio,
    aPreparer: s.travaux_avant.trim().length > 0,
    passee: new Date(s.fin ?? s.debut).getTime() < maintenant,
  };
}

/**
 * Toutes les sessions visibles de la personne (publiées : les règles de la base filtrent),
 * de la plus ancienne à la plus récente. Partagé pendant une même requête.
 */
export const lireSeances = cache(async (): Promise<Seance[]> => {
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("sessions")
    .select("id, titre, debut, fin, lien_visio, travaux_avant")
    .order("debut", { ascending: true });
  const maintenant = Date.now();
  return (data ?? []).map((s) => versSeance(s, maintenant));
});

/** La prochaine session (la première qui n'est pas terminée), avec ses travaux à préparer. */
export async function lireProchaineSession(): Promise<{ session: SeanceDetail; joursRestants: number } | null> {
  const seances = await lireSeances();
  const prochaine = seances.find((s) => !s.passee);
  if (!prochaine) return null;
  const session = await lireSeance(prochaine.id);
  if (!session) return null;
  return { session, joursRestants: joursEntre(jourParis(Date.now()), session.jour) };
}

/** Une session par son identifiant, avec tout son contenu (null si introuvable ou non visible). */
export const lireSeance = cache(async (id: string): Promise<SeanceDetail | null> => {
  if (!UUID.test(id)) return null;
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("sessions")
    .select(
      "id, titre, description, objectifs, debut, fin, lien_visio, travaux_avant, travaux_apres, materiel, ressources(id, titre, type, url, cree_le)",
    )
    .eq("id", id)
    .order("cree_le", { referencedTable: "ressources", ascending: true })
    .maybeSingle();
  if (!data) return null;

  return {
    ...versSeance(data, Date.now()),
    description: data.description,
    objectifs: data.objectifs,
    travauxAvant: data.travaux_avant,
    travauxApres: data.travaux_apres,
    materiel: data.materiel,
    documents: data.ressources.map((r) => ({
      id: r.id,
      titre: r.titre,
      type: r.type === "lien" ? "lien" : "fichier",
      url: r.url,
    })),
  };
});

/** Aujourd'hui à Paris, « AAAA-MM-JJ » (à appeler au moment de la requête, après la lecture des données). */
export function aujourdhuiParis(): string {
  return jourParis(Date.now());
}
