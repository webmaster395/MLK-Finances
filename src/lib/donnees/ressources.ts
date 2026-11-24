import "server-only";
import { connection } from "next/server";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { jourParis } from "@/lib/format";

export type Ressource = {
  id: string;
  titre: string;
  type: "fichier" | "lien";
  url: string | null;
  session: {
    id: string;
    titre: string;
    /** Jour de la session à Paris, « AAAA-MM-JJ » */
    jour: string;
  };
};

/**
 * Les documents publiés des sessions de la personne (les règles de la base filtrent),
 * dans l'ordre des sessions puis de leur ajout.
 */
export async function lireRessources(): Promise<Ressource[]> {
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("ressources")
    .select("id, titre, type, url, cree_le, sessions(id, titre, debut)")
    .order("cree_le", { ascending: true });

  return (data ?? [])
    .flatMap((r) =>
      // Un document dont la session n'est pas visible n'est jamais affiché
      r.sessions
        ? [
            {
              id: r.id,
              titre: r.titre,
              type: r.type === "lien" ? ("lien" as const) : ("fichier" as const),
              url: r.url,
              debut: r.sessions.debut,
              session: { id: r.sessions.id, titre: r.sessions.titre, jour: jourParis(r.sessions.debut) },
            },
          ]
        : [],
    )
    .sort((a, b) => a.debut.localeCompare(b.debut))
    .map((r) => ({ id: r.id, titre: r.titre, type: r.type, url: r.url, session: r.session }));
}
