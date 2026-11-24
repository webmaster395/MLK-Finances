"use server";

import { revalidatePath } from "next/cache";
import { creerClientServeur } from "@/lib/supabase/serveur";

export type EtatTemoignage = { ok?: boolean; message?: string };

const ECHEC: EtatTemoignage = { message: "L'envoi a échoué. Réessayez dans un instant." };

/**
 * Propose (ou corrige, tant qu'il n'est pas validé) le témoignage de la personne connectée.
 * La base impose l'auteur, le nom affiché et l'état « à valider » : rien de tout cela ne vient du formulaire.
 */
export async function envoyerTemoignage(_: EtatTemoignage, formData: FormData): Promise<EtatTemoignage> {
  const brut = formData.get("texte");
  const texte = typeof brut === "string" ? brut.trim() : "";
  if (texte.length === 0 || texte.length > 1000) return { message: "Écrivez votre témoignage (1 000 caractères au maximum)." };

  const supabase = await creerClientServeur();
  const { data: utilisateur } = await supabase.auth.getUser();
  if (!utilisateur.user) return { message: "Votre session a expiré. Reconnectez-vous." };

  const { data: existant } = await supabase
    .from("temoignages")
    .select("id, valide")
    .eq("auteur_id", utilisateur.user.id)
    .maybeSingle();

  if (existant?.valide) return { message: "Votre témoignage est déjà publié : contactez l'équipe pour le modifier." };
  const { error } = existant
    ? await supabase.from("temoignages").update({ texte }).eq("id", existant.id)
    : // Le nom affiché est remplacé par la base ((le prénom seul)) : la valeur envoyée ici est ignorée
      await supabase.from("temoignages").insert({ texte, nom_affiche: "-" });
  if (error) return ECHEC;

  revalidatePath("/temoignages");
  revalidatePath("/admin", "layout");
  return { ok: true, message: existant ? "Votre témoignage est mis à jour." : "Merci ! Votre témoignage sera publié après validation par l'équipe." };
}

/** Retire le témoignage de la personne connectée, tant qu'il n'est pas validé. */
export async function retirerMonTemoignage(): Promise<EtatTemoignage> {
  const supabase = await creerClientServeur();
  const { data: utilisateur } = await supabase.auth.getUser();
  if (!utilisateur.user) return { message: "Votre session a expiré. Reconnectez-vous." };
  const { data, error } = await supabase
    .from("temoignages")
    .delete()
    .eq("auteur_id", utilisateur.user.id)
    .eq("valide", false)
    .select("id");
  if (error || !data?.length) return ECHEC;
  revalidatePath("/temoignages");
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Votre témoignage est retiré." };
}
