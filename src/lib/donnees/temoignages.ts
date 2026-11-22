import "server-only";
import { connection } from "next/server";
import { creerClientServeur } from "@/lib/supabase/serveur";

export type Temoignage = {
  id: string;
  nom_affiche: string;
  texte: string;
  /** Lien temporaire (5 minutes) vers la photo ; null s'il n'y en a pas. */
  photoUrl: string | null;
};

/**
 * Les témoignages validés (lecture seule). Les règles de la base (RLS) ne renvoient
 * que ceux dont « valide » est vrai : un témoignage en attente n'est jamais visible,
 * ni sa photo (le stockage applique la même règle).
 */
export async function lireTemoignages(): Promise<Temoignage[]> {
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("temoignages")
    .select("id, nom_affiche, texte, photo_path")
    .order("cree_le", { ascending: false });
  const liste = data ?? [];

  const chemins = liste.flatMap((t) => (t.photo_path ? [t.photo_path] : []));
  const liens = chemins.length > 0 ? ((await supabase.storage.from("photos").createSignedUrls(chemins, 300)).data ?? []) : [];
  const parChemin = new Map(liens.map((l) => [l.path, l.signedUrl]));

  return liste.map((t) => ({
    id: t.id,
    nom_affiche: t.nom_affiche,
    texte: t.texte,
    photoUrl: t.photo_path ? (parChemin.get(t.photo_path) ?? null) : null,
  }));
}
