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
    confidentiel: formData.get("destinataire") === "confidentiel",
  };
}

function actualiser() {
  revalidatePath("/temoignages");
  revalidatePath("/admin", "layout");
}

function messageEnvoi(confidentiel: boolean) {
  return confidentiel
    ? "Merci, votre témoignage est envoyé à l'équipe, avec votre demande de confidentialité. Il n'apparaît pas aux autres participants : ce sont les administrateurs qui choisissent de l'afficher ou non."
    : "Merci, votre témoignage est envoyé. Il n'apparaît pas tout de suite aux autres participants : ce sont les administrateurs qui choisissent de l'afficher ou non.";
}

/**
 * Écrit un nouveau témoignage (une personne peut en avoir plusieurs).
 * La base impose l'auteur, le prénom affiché, la date et l'état « non affiché » : rien de tout cela ne vient du formulaire.
 */
export async function envoyerTemoignage(_: EtatTemoignage, formData: FormData): Promise<EtatTemoignage> {
  const { texte, confidentiel } = lireSaisie(formData);
  if (texte.length === 0 || texte.length > 1000) return { message: "Écrivez votre témoignage (1 000 caractères au maximum)." };

  const supabase = await creerClientServeur();
  const { data: utilisateur } = await supabase.auth.getUser();
  if (!utilisateur.user) return SESSION_EXPIREE;

  // Pour un participant, la base impose l'auteur et le prénom. Pour un compte administrateur, elle laisse
  // les valeurs telles quelles : on les renseigne donc ici (auteur = personne connectée, prénom de son profil).
  const { data: profil } = await supabase.from("profils").select("prenom").eq("id", utilisateur.user.id).maybeSingle();
  const { error } = await supabase.from("temoignages").insert({
    texte,
    confidentiel,
    auteur_id: utilisateur.user.id,
    nom_affiche: profil?.prenom.trim().slice(0, 100) || "Participant",
  });
  if (error) return ECHEC;

  actualiser();
  return { ok: true, message: messageEnvoi(confidentiel) };
}

/** Corrige un témoignage de la personne connectée, tant qu'il n'est pas affiché (la base le vérifie). */
export async function modifierMonTemoignage(_: EtatTemoignage, formData: FormData): Promise<EtatTemoignage> {
  const id = formData.get("id");
  const { texte, confidentiel } = lireSaisie(formData);
  if (typeof id !== "string" || !UUID.test(id)) return ECHEC;
  if (texte.length === 0 || texte.length > 1000) return { message: "Écrivez votre témoignage (1 000 caractères au maximum)." };

  const supabase = await creerClientServeur();
  const { data: utilisateur } = await supabase.auth.getUser();
  if (!utilisateur.user) return SESSION_EXPIREE;

  const { data, error } = await supabase
    .from("temoignages")
    .update({ texte, confidentiel })
    .eq("id", id)
    .eq("auteur_id", utilisateur.user.id)
    .eq("valide", false)
    .select("id");
  if (error || !data?.length) return ECHEC;

  actualiser();
  return { ok: true, message: "Votre témoignage est mis à jour." };
}

/** Retire un témoignage de la personne connectée, tant qu'il n'est pas affiché. */
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
  return { ok: true, message: "Votre témoignage est retiré." };
}
