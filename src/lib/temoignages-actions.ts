"use server";

import { revalidatePath } from "next/cache";
import { creerClientServeur } from "@/lib/supabase/serveur";

export type EtatTemoignage = { ok?: boolean; message?: string };

const ECHEC: EtatTemoignage = { message: "L'envoi a échoué. Réessayez dans un instant." };
const SESSION_EXPIREE: EtatTemoignage = { message: "Votre session a expiré. Reconnectez-vous." };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function lireSaisie(formData: FormData) {
  const brut = formData.get("texte");
  return {
    texte: typeof brut === "string" ? brut.trim() : "",
    // Sans choix explicite, le témoignage reste privé
    partage: formData.get("visibilite") === "partage",
  };
}

function actualiser() {
  revalidatePath("/temoignages");
  revalidatePath("/admin", "layout");
}

function messageEnvoi(partage: boolean) {
  return partage
    ? "Merci ! Votre témoignage est envoyé à l'équipe MLK Parcours Finances. Il n'apparaît pas tout de suite : l'équipe le valide avant qu'il soit visible par tous les participants."
    : "Votre note est enregistrée. Vous seul pouvez la voir.";
}

/**
 * Écrit un nouveau témoignage (une personne peut en avoir plusieurs) : note privée, ou partagé avec validation de l'équipe.
 * La base impose l'auteur, le prénom affiché, la date et l'état « non validé » : rien de tout cela ne vient du formulaire.
 */
export async function envoyerTemoignage(_: EtatTemoignage, formData: FormData): Promise<EtatTemoignage> {
  const { texte, partage } = lireSaisie(formData);
  if (texte.length === 0 || texte.length > 1000) return { message: "Écrivez votre témoignage (1 000 caractères au maximum)." };

  const supabase = await creerClientServeur();
  const { data: utilisateur } = await supabase.auth.getUser();
  if (!utilisateur.user) return SESSION_EXPIREE;

  // Pour un participant, la base impose l'auteur et le prénom. Pour un compte administrateur, elle laisse
  // les valeurs telles quelles : on les renseigne donc ici (auteur = personne connectée, prénom de son profil).
  const { data: profil } = await supabase.from("profils").select("prenom").eq("id", utilisateur.user.id).maybeSingle();
  const { error } = await supabase.from("temoignages").insert({
    texte,
    partage,
    auteur_id: utilisateur.user.id,
    nom_affiche: profil?.prenom.trim().slice(0, 100) || "Participant",
  });
  if (error) return ECHEC;

  actualiser();
  return { ok: true, message: messageEnvoi(partage) };
}

/** Corrige un témoignage de la personne connectée (ou le partage / le reprend en privé), tant qu'il n'est pas validé. */
export async function modifierMonTemoignage(_: EtatTemoignage, formData: FormData): Promise<EtatTemoignage> {
  const id = formData.get("id");
  const { texte, partage } = lireSaisie(formData);
  if (typeof id !== "string" || !UUID.test(id)) return ECHEC;
  if (texte.length === 0 || texte.length > 1000) return { message: "Écrivez votre témoignage (1 000 caractères au maximum)." };

  const supabase = await creerClientServeur();
  const { data: utilisateur } = await supabase.auth.getUser();
  if (!utilisateur.user) return SESSION_EXPIREE;

  const { data, error } = await supabase
    .from("temoignages")
    .update({ texte, partage })
    .eq("id", id)
    .eq("auteur_id", utilisateur.user.id)
    .eq("valide", false)
    .select("id");
  if (error || !data?.length) return ECHEC;

  actualiser();
  return { ok: true, message: partage ? messageEnvoi(true) : "Votre note est mise à jour. Vous seul pouvez la voir." };
}

/** Supprime un témoignage de la personne connectée, tant qu'il n'est pas validé. */
export async function retirerMonTemoignage(id: string): Promise<EtatTemoignage> {
  if (!UUID.test(id)) return ECHEC;
  const supabase = await creerClientServeur();
  const { data: utilisateur } = await supabase.auth.getUser();
  if (!utilisateur.user) return SESSION_EXPIREE;
  const { data, error } = await supabase
    .from("temoignages")
    .delete()
    .eq("id", id)
    .eq("auteur_id", utilisateur.user.id)
    .eq("valide", false)
    .select("id");
  if (error || !data?.length) return ECHEC;
  actualiser();
  return { ok: true, message: "Votre témoignage est supprimé." };
}
