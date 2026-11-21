"use server";

import { revalidatePath } from "next/cache";
import { cheminPhoto, civiliteValide, trancheAgeValide } from "@/lib/auth/profil";
import { creerClientServeur } from "@/lib/supabase/serveur";

export type EtatProfil = {
  ok?: boolean;
  message?: string;
  /** Dernières valeurs envoyées : le formulaire les réaffiche (après une erreur comme après un succès). */
  valeurs?: { civilite: string; prenom: string; nom: string; tranche_age: string };
};

export type ResultatPhoto = { ok: boolean; message?: string };

function texte(formData: FormData, nom: string) {
  const v = formData.get(nom);
  return typeof v === "string" ? v.trim() : "";
}

/** Le menu (photo) et la page se mettent à jour. */
function actualiser() {
  revalidatePath("/", "layout");
}

/**
 * Modifie les informations de la personne connectée.
 * Seuls prénom, nom, civilité et tranche d'âge sont modifiables : l'adresse e-mail et le rôle ne le sont pas
 * (la base refuse de toute façon de toucher à une autre colonne, ou au profil de quelqu'un d'autre).
 */
export async function modifierProfil(_: EtatProfil, formData: FormData): Promise<EtatProfil> {
  const civilite = texte(formData, "civilite");
  const prenom = texte(formData, "prenom");
  const nom = texte(formData, "nom");
  const trancheAge = texte(formData, "tranche_age");
  const valeurs = { civilite, prenom, nom, tranche_age: trancheAge };

  if (!civiliteValide(civilite)) return { message: "Indiquez votre civilité : Madame ou Monsieur.", valeurs };
  if (prenom.length === 0 || prenom.length > 100 || nom.length === 0 || nom.length > 100) {
    return { message: "Saisissez votre prénom et votre nom (100 caractères au maximum).", valeurs };
  }
  if (!trancheAgeValide(trancheAge)) return { message: "Choisissez votre tranche d'âge.", valeurs };

  const supabase = await creerClientServeur();
  const { data: utilisateur } = await supabase.auth.getUser();
  if (!utilisateur.user) return { message: "Votre session a expiré. Reconnectez-vous.", valeurs };

  const { data, error } = await supabase
    .from("profils")
    .update({ civilite, prenom, nom, tranche_age: trancheAge })
    .eq("id", utilisateur.user.id)
    .select("id");
  if (error || !data?.length) {
    return { message: "Impossible d'enregistrer vos informations. Réessayez dans un instant.", valeurs };
  }

  actualiser();
  return { ok: true, message: "Vos informations sont enregistrées.", valeurs };
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
