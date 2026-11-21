import "server-only";
import { connection } from "next/server";
import { creerClientServeur } from "@/lib/supabase/serveur";

export type Ressource = {
  id: string;
  titre: string;
  type: "fichier" | "lien";
  url: string | null;
};

export type GroupeRessources = {
  cours: { id: string; titre: string; ordre: number };
  ressources: Ressource[];
};

/** Les ressources publiées des cours de la personne (les règles de la base filtrent), classées par module. */
export async function lireRessourcesParCours(): Promise<GroupeRessources[]> {
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("ressources")
    .select("id, titre, type, url, cours(id, titre, ordre)")
    .order("cree_le", { ascending: true });

  const groupes = new Map<string, GroupeRessources>();
  for (const r of data ?? []) {
    if (!r.cours) continue; // une ressource sans cours visible n'est jamais affichée
    const groupe = groupes.get(r.cours.id) ?? { cours: r.cours, ressources: [] };
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
