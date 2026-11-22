import "server-only";
import { connection } from "next/server";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { jourParis } from "@/lib/format";

export type Ressource = {
  id: string;
  titre: string;
  type: "fichier" | "lien";
  url: string | null;
};

export type SeanceRessource = {
  id: string;
  titre: string;
  /** Jour de la séance à Paris, « AAAA-MM-JJ » */
  jour: string;
};

export type GroupeRessources = {
  cours: { id: string; titre: string; ordre: number };
  seance: SeanceRessource | null;
  ressources: Ressource[];
};

type LigneSeance = { id: string; titre: string; debut: string; fin: string | null };

function choisirSeance(seances: LigneSeance[], maintenant: number): SeanceRessource | null {
  if (seances.length === 0) return null;
  const triees = [...seances].sort((a, b) => new Date(a.debut).getTime() - new Date(b.debut).getTime());
  const retenue = triees.find((s) => new Date(s.fin ?? s.debut).getTime() >= maintenant) ?? triees[0];
  return {
    id: retenue.id,
    titre: retenue.titre,
    jour: jourParis(retenue.debut),
  };
}

/** Les ressources publiées des cours de la personne (les règles de la base filtrent), classées par séance / module. */
export async function lireRessourcesParCours(): Promise<GroupeRessources[]> {
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("ressources")
    .select("id, titre, type, url, cours(id, titre, ordre, sessions(id, titre, debut, fin))")
    .order("cree_le", { ascending: true });

  const maintenant = Date.now();
  const groupes = new Map<string, GroupeRessources>();
  for (const r of data ?? []) {
    if (!r.cours) continue; // une ressource sans cours visible n'est jamais affichée
    const existant = groupes.get(r.cours.id);
    const groupe = existant ?? {
      cours: { id: r.cours.id, titre: r.cours.titre, ordre: r.cours.ordre },
      seance: choisirSeance(r.cours.sessions ?? [], maintenant),
      ressources: [],
    };
    groupe.ressources.push({
      id: r.id,
      titre: r.titre,
      type: r.type === "lien" ? "lien" : "fichier",
      url: r.url,
    });
    groupes.set(r.cours.id, groupe);
  }
  return [...groupes.values()].sort((a, b) => a.cours.ordre - b.cours.ordre || a.cours.titre.localeCompare(b.cours.titre, "fr"));
}
