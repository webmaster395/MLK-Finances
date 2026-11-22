import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { statutDevoir, type StatutDevoir } from "@/lib/devoirs";
import { joursEntre, jourParis } from "@/lib/format";

/** Une séance telle qu'elle apparaît dans la frise de la journée et dans le calendrier. */
export type Seance = {
  id: string;
  titre: string;
  debut: string;
  fin: string | null;
  /** Jour à Paris, « AAAA-MM-JJ » */
  jour: string;
  lieu: string | null;
  intervenants: string[];
  /** Cours lié (absent si la séance n'a pas de cours ou si le cours n'est pas publié). */
  cours: { id: string; titre: string } | null;
  /** Nombre de devoirs du cours qui attendent encore un rendu. */
  aPreparer: number;
  passee: boolean;
};

export type SeanceDetail = Seance & {
  description: string;
  coursDetail: {
    description: string;
    objectifs: string[];
    supports: { id: string; titre: string; type: "fichier" | "lien"; url: string | null }[];
    devoirs: { id: string; titre: string; echeance: string | null; rendu: boolean; statut: StatutDevoir }[];
  } | null;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Toutes les séances visibles de la personne (publiées et de son groupe : les règles de la base filtrent),
 * de la plus ancienne à la plus récente. Partagé pendant une même requête.
 */
export const lireSeances = cache(async (): Promise<Seance[]> => {
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("sessions")
    .select(
      "id, titre, debut, fin, lieu, intervenants, cours(id, titre, devoirs(id, rendus(id)))",
    )
    .order("debut", { ascending: true });

  const maintenant = Date.now();
  return (data ?? []).map((s) => ({
    id: s.id,
    titre: s.titre,
    debut: s.debut,
    fin: s.fin,
    jour: jourParis(s.debut),
    lieu: s.lieu,
    intervenants: s.intervenants,
    cours: s.cours ? { id: s.cours.id, titre: s.cours.titre } : null,
    aPreparer: (s.cours?.devoirs ?? []).filter((d) => d.rendus.length === 0).length,
    passee: new Date(s.fin ?? s.debut).getTime() < maintenant,
  }));
});

/** La prochaine journée : toutes les séances du premier jour qui n'est pas terminé, dans l'ordre. */
export async function lireProchaineJournee(): Promise<{ jour: string; joursRestants: number; seances: Seance[] } | null> {
  const seances = await lireSeances();
  const prochaine = seances.find((s) => !s.passee);
  if (!prochaine) return null;
  return {
    jour: prochaine.jour,
    joursRestants: joursEntre(jourParis(Date.now()), prochaine.jour),
    seances: seances.filter((s) => s.jour === prochaine.jour),
  };
}

/** Une séance par son identifiant, avec la fiche de son cours (null si introuvable ou non visible). */
export async function lireSeance(id: string): Promise<SeanceDetail | null> {
  if (!UUID.test(id)) return null;
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("sessions")
    .select(
      "id, titre, description, debut, fin, lieu, intervenants, cours(id, titre, description, objectifs, ressources(id, titre, type, url), devoirs(id, titre, echeance, rendus(id)))",
    )
    .eq("id", id)
    .order("cree_le", { referencedTable: "cours.ressources", ascending: true })
    .order("echeance", { referencedTable: "cours.devoirs", ascending: true })
    .maybeSingle();
  if (!data) return null;

  const maintenant = Date.now();
  const devoirs = (data.cours?.devoirs ?? []).map((d) => {
    const rendu = d.rendus.length > 0;
    return {
      id: d.id,
      titre: d.titre,
      echeance: d.echeance,
      rendu,
      // Le détail du rendu (corrigé ou non) n'est pas utile ici : « rendu » suffit
      statut: statutDevoir(d.echeance, rendu ? { statut: "depose", depose_le: "", nom_fichier: null } : null, maintenant),
    };
  });

  return {
    id: data.id,
    titre: data.titre,
    description: data.description,
    debut: data.debut,
    fin: data.fin,
    jour: jourParis(data.debut),
    lieu: data.lieu,
    intervenants: data.intervenants,
    cours: data.cours ? { id: data.cours.id, titre: data.cours.titre } : null,
    aPreparer: devoirs.filter((d) => !d.rendu).length,
    passee: new Date(data.fin ?? data.debut).getTime() < maintenant,
    coursDetail: data.cours
      ? {
          description: data.cours.description,
          objectifs: data.cours.objectifs,
          supports: data.cours.ressources.map((r) => ({
            id: r.id,
            titre: r.titre,
            type: r.type === "lien" ? "lien" : "fichier",
            url: r.url,
          })),
          devoirs,
        }
      : null,
  };
}

/** Aujourd'hui à Paris, « AAAA-MM-JJ » (à appeler au moment de la requête, après la lecture des données). */
export function aujourdhuiParis(): string {
  return jourParis(Date.now());
}
