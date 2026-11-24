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
 * Les témoignages validés (publiés). Les règles de la base ne montrent aux autres que les validés ;
 * le filtre « valide » écarte aussi le témoignage en attente de la personne elle-même.
 */
export async function lireTemoignages(): Promise<Temoignage[]> {
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("temoignages")
    .select("id, nom_affiche, texte, photo_path")
    .eq("valide", true)
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

export type TemoignagePublic = { id: string; prenom: string; texte: string };

/**
 * Les témoignages que l'équipe a choisi de montrer au public (validés ET « public »), pour la page /avis.
 * Lu sans connexion : la base ne donne au public que ces témoignages et quatre colonnes
 * (jamais l'auteur ni la photo).
 */
export async function lireTemoignagesPublics(): Promise<TemoignagePublic[]> {
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("temoignages")
    .select("id, nom_affiche, texte")
    .eq("valide", true)
    .eq("visible_public", true)
    .order("cree_le", { ascending: false });
  return (data ?? []).map((t) => ({ id: t.id, prenom: t.nom_affiche, texte: t.texte }));
}

export type MonTemoignage = { id: string; texte: string; valide: boolean; nomAffiche: string };

/** Le témoignage proposé par la personne connectée (null si elle n'en a pas proposé). */
export async function lireMonTemoignage(): Promise<MonTemoignage | null> {
  await connection();
  const supabase = await creerClientServeur();
  const { data: utilisateur } = await supabase.auth.getUser();
  if (!utilisateur.user) return null;
  const { data } = await supabase
    .from("temoignages")
    .select("id, texte, valide, nom_affiche")
    .eq("auteur_id", utilisateur.user.id)
    .maybeSingle();
  return data ? { id: data.id, texte: data.texte, valide: data.valide, nomAffiche: data.nom_affiche } : null;
}
