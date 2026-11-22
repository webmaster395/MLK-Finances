"use server";

import { revalidatePath } from "next/cache";
import { cheminPhoto } from "@/lib/auth/profil";
import { creerClientServeur } from "@/lib/supabase/serveur";

export type ResultatPhoto = { ok: boolean; message?: string };

/** Le menu (photo) et la page se mettent à jour. */
function actualiser() {
  revalidatePath("/", "layout");
}

/**
 * Enregistre la photo APRÈS son envoi vers le stockage (fait depuis le navigateur).
 * Aucun fichier ne passe par cette action ; le chemin est calculé ici.
 */
export async function enregistrerPhoto(): Promise<ResultatPhoto> {
  const supabase = await creerClientServeur();
  const { data: utilisateur } = await supabase.auth.getUser();
  if (!utilisateur.user) return { ok: false, message: "Votre session a expiré. Reconnectez-vous." };
  const id = utilisateur.user.id;

  const { data: fichiers } = await supabase.storage.from("photos").list(id, { search: "avatar" });
  if (!fichiers?.some((f) => f.name === "avatar")) return { ok: false, message: "La photo n'a pas été reçue. Réessayez." };

  const { error } = await supabase.from("profils").update({ photo_path: cheminPhoto(id) }).eq("id", id);
  if (error) return { ok: false, message: "Impossible d'enregistrer votre photo. Réessayez dans un instant." };

  actualiser();
  return { ok: true };
}

/** Supprime la photo (le fichier et la référence dans le profil). */
export async function supprimerPhoto(): Promise<ResultatPhoto> {
  const supabase = await creerClientServeur();
  const { data: utilisateur } = await supabase.auth.getUser();
  if (!utilisateur.user) return { ok: false, message: "Votre session a expiré. Reconnectez-vous." };
  const id = utilisateur.user.id;

  await supabase.storage.from("photos").remove([cheminPhoto(id)]);
  const { error } = await supabase.from("profils").update({ photo_path: null }).eq("id", id);
  if (error) return { ok: false, message: "Impossible de supprimer votre photo. Réessayez dans un instant." };

  actualiser();
  return { ok: true };
}
