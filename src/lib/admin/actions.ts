"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { civiliteValide, trancheAgeValide } from "@/lib/auth/profil";
import { creerClientServeur } from "@/lib/supabase/serveur";
import {
  cheminPhotoTemoignage,
  cheminSupport,
  validerTemoignage,
  validerAnnonce,
  estCheminSupport,
  estPdf,
  estUuid,
  validerLien,
  validerSeance,
} from "./validation";

/** Résultat affiché sous un formulaire de l'espace admin. */
export type EtatAdmin = { ok?: boolean; message?: string };

const SESSION_EXPIREE: EtatAdmin = { message: "Votre session a expiré, ou ce compte n'est pas administrateur." };
const ECHEC: EtatAdmin = { message: "L'enregistrement a échoué. Réessayez dans un instant." };

function texte(formData: FormData, nom: string) {
  const v = formData.get(nom);
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Client Supabase de la personne connectée, seulement si elle est admin (rôle lu en base).
 * La base vérifie de toute façon chaque écriture (règles RLS « admin »).
 */
async function clientAdmin() {
  const supabase = await creerClientServeur();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profil } = await supabase.from("profils").select("role").eq("id", data.user.id).maybeSingle();
  return profil?.role === "admin" ? supabase : null;
}

function actualiser() {
  // Les pages admin et l'espace participant se mettent à jour
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------
// Fiche d'un participant
// ---------------------------------------------------------------

export async function modifierParticipant(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const id = texte(formData, "id");
  const civilite = texte(formData, "civilite");
  const prenom = texte(formData, "prenom");
  const nom = texte(formData, "nom");
  const trancheAge = texte(formData, "tranche_age");
  if (!estUuid(id)) return ECHEC;
  if (prenom.length === 0 || prenom.length > 100 || nom.length === 0 || nom.length > 100) {
    return { message: "Saisissez le prénom et le nom (100 caractères au maximum)." };
  }
  if (civilite && !civiliteValide(civilite)) return { message: "Civilité non valide." };
  if (trancheAge && !trancheAgeValide(trancheAge)) return { message: "Tranche d'âge non valide." };
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;

  const { data, error } = await supabase
    .from("profils")
    .update({ prenom, nom, civilite: civilite || null, tranche_age: trancheAge || null })
    .eq("id", id)
    .select("id");
  if (error || !data?.length) return ECHEC;
  actualiser();
  return { ok: true, message: "La fiche est enregistrée." };
}

/** Nomme ou retire un administrateur. La base refuse qu'un admin change son propre rôle. */
export async function changerRole(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const id = texte(formData, "id");
  const role = texte(formData, "role");
  if (!estUuid(id) || (role !== "admin" && role !== "participant")) return ECHEC;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;

  const { data, error } = await supabase.from("profils").update({ role }).eq("id", id).select("id");
  if (error?.code === "42501") return { message: "Vous ne pouvez pas changer votre propre rôle." };
  if (error || !data?.length) return ECHEC;
  actualiser();
  return {
    ok: true,
    message: role === "admin" ? "Cette personne est maintenant administratrice." : "Le rôle d'administrateur est retiré.",
  };
}

// ---------------------------------------------------------------
// Sessions (cours et séances fusionnés)
// ---------------------------------------------------------------

function saisieSeance(formData: FormData) {
  const brut = (nom: string) => {
    const v = formData.get(nom);
    return typeof v === "string" ? v : "";
  };
  return {
    titre: texte(formData, "titre"),
    date: texte(formData, "date"),
    heureDebut: texte(formData, "heure_debut"),
    heureFin: texte(formData, "heure_fin"),
    lienVisio: texte(formData, "lien_visio"),
    description: brut("description"),
    objectifs: brut("objectifs"),
    travauxAvant: brut("travaux_avant"),
    travauxApres: brut("travaux_apres"),
    materiel: brut("materiel"),
    publie: formData.get("publie") === "on",
  };
}

export async function creerSeance(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const v = validerSeance(saisieSeance(formData));
  if ("message" in v) return v;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;

  const { data, error } = await supabase.from("sessions").insert(v.seance).select("id").single();
  if (error || !data) return ECHEC;
  actualiser();
  redirect(`/admin/seances/${data.id}?cree=1`);
}

export async function modifierSeance(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const id = texte(formData, "id");
  if (!estUuid(id)) return ECHEC;
  const v = validerSeance(saisieSeance(formData));
  if ("message" in v) return v;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;

  const { data, error } = await supabase.from("sessions").update(v.seance).eq("id", id).select("id");
  if (error || !data?.length) return ECHEC;
  actualiser();
  return { ok: true, message: "La session est enregistrée." };
}

/** Supprime une session et ses documents (fichiers compris). */
export async function supprimerSeance(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const id = texte(formData, "id");
  if (!estUuid(id)) return ECHEC;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;
  const { data: fichiers } = await supabase.from("ressources").select("storage_path").eq("session_id", id).not("storage_path", "is", null);
  const { data, error } = await supabase.from("sessions").delete().eq("id", id).select("id");
  if (error || !data?.length) return ECHEC;
  const chemins = (fichiers ?? []).flatMap((r) => (r.storage_path ? [r.storage_path] : []));
  if (chemins.length > 0) await supabase.storage.from("ressources").remove(chemins);
  actualiser();
  redirect("/admin/seances");
}

// ---------------------------------------------------------------
// Documents d'une session (PDF ou lien, par exemple Canva)
// ---------------------------------------------------------------

export async function ajouterLien(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const sessionId = texte(formData, "session_id");
  if (!estUuid(sessionId)) return ECHEC;
  const v = validerLien({ titre: texte(formData, "titre"), url: texte(formData, "url") });
  if ("message" in v) return v;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;
  const { error } = await supabase.from("ressources").insert({ session_id: sessionId, titre: v.titre, type: "lien", url: v.url });
  if (error) return ECHEC;
  actualiser();
  return { ok: true, message: "Lien ajouté." };
}

export type ResultatPreparation = { ok: true; chemin: string } | { ok: false; message: string };

/** Étape 1 d'un envoi de fichier : le serveur choisit le chemin (le navigateur n'en choisit jamais). */
export async function preparerFichierSupport(sessionId: string, nomFichier: string, typeFichier: string): Promise<ResultatPreparation> {
  if (!estUuid(sessionId)) return { ok: false, message: "Session introuvable." };
  if (!estPdf({ name: nomFichier, type: typeFichier })) return { ok: false, message: "Seuls les documents PDF sont acceptés." };
  const supabase = await clientAdmin();
  if (!supabase) return { ok: false, message: SESSION_EXPIREE.message! };
  return { ok: true, chemin: cheminSupport(sessionId, crypto.randomUUID(), nomFichier) };
}

/** Étape 3 : après l'envoi par le navigateur, on vérifie le fichier puis on enregistre le document. */
export async function enregistrerFichierSupport(sessionId: string, titre: string, chemin: string): Promise<EtatAdmin> {
  if (!estUuid(sessionId) || !estCheminSupport(chemin, sessionId)) return ECHEC;
  const t = titre.trim();
  if (t.length === 0 || t.length > 200) return { message: "Donnez un titre au document (200 caractères au maximum)." };
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;

  const dossier = chemin.slice(0, chemin.lastIndexOf("/"));
  const nom = chemin.slice(chemin.lastIndexOf("/") + 1);
  const { data: fichiers } = await supabase.storage.from("ressources").list(dossier);
  if (!fichiers?.some((f) => f.name === nom)) return { message: "Le fichier n'a pas été reçu. Réessayez." };

  const { error } = await supabase.from("ressources").insert({ session_id: sessionId, titre: t, type: "fichier", storage_path: chemin });
  if (error) {
    await supabase.storage.from("ressources").remove([chemin]);
    return ECHEC;
  }
  actualiser();
  return { ok: true, message: "Document ajouté." };
}

/** Supprime un document (et son fichier s'il en a un). */
export async function supprimerSupport(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const id = texte(formData, "id");
  if (!estUuid(id)) return ECHEC;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;
  const { data, error } = await supabase.from("ressources").delete().eq("id", id).select("storage_path");
  if (error || !data?.length) return ECHEC;
  const chemin = data[0].storage_path;
  if (chemin) await supabase.storage.from("ressources").remove([chemin]);
  actualiser();
  return { ok: true, message: "Document supprimé." };
}

// ---------------------------------------------------------------
// Messages de l'équipe
// ---------------------------------------------------------------

function saisieAnnonce(formData: FormData) {
  const v = formData.get("message");
  return {
    titre: texte(formData, "titre"),
    message: typeof v === "string" ? v : "",
    publie: formData.get("publie") === "on",
  };
}

export async function creerAnnonce(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const v = validerAnnonce(saisieAnnonce(formData));
  if ("message" in v) return v;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;
  const { error } = await supabase.from("annonces").insert(v.annonce);
  if (error) return ECHEC;
  actualiser();
  return { ok: true, message: v.annonce.publie ? "Message publié." : "Message enregistré (non publié)." };
}

export async function modifierAnnonce(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const id = texte(formData, "id");
  if (!estUuid(id)) return ECHEC;
  const v = validerAnnonce(saisieAnnonce(formData));
  if ("message" in v) return v;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;
  const { data, error } = await supabase.from("annonces").update(v.annonce).eq("id", id).select("id");
  if (error || !data?.length) return ECHEC;
  actualiser();
  return { ok: true, message: "Message enregistré." };
}

export async function supprimerAnnonce(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const id = texte(formData, "id");
  if (!estUuid(id)) return ECHEC;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;
  const { data, error } = await supabase.from("annonces").delete().eq("id", id).select("id");
  if (error || !data?.length) return ECHEC;
  actualiser();
  return { ok: true };
}

// ---------------------------------------------------------------
// Témoignages
// ---------------------------------------------------------------

function saisieTemoignage(formData: FormData) {
  const v = formData.get("texte");
  return { nom: texte(formData, "nom"), texte: typeof v === "string" ? v : "", valide: formData.get("valide") === "on" };
}

export async function creerTemoignage(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const v = validerTemoignage(saisieTemoignage(formData));
  if ("message" in v) return v;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;
  const { error } = await supabase.from("temoignages").insert(v.temoignage);
  if (error) return ECHEC;
  actualiser();
  return { ok: true, message: v.temoignage.valide ? "Témoignage publié." : "Témoignage enregistré (à valider)." };
}

export async function modifierTemoignage(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const id = texte(formData, "id");
  if (!estUuid(id)) return ECHEC;
  const v = validerTemoignage(saisieTemoignage(formData));
  if ("message" in v) return v;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;
  const { data, error } = await supabase.from("temoignages").update(v.temoignage).eq("id", id).select("id");
  if (error || !data?.length) return ECHEC;
  actualiser();
  return { ok: true, message: "Témoignage enregistré." };
}

/** Valide (publie) ou retire un témoignage de la publication. */
export async function changerValidation(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const id = texte(formData, "id");
  const valide = texte(formData, "valide");
  if (!estUuid(id) || (valide !== "oui" && valide !== "non")) return ECHEC;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;
  const { data, error } = await supabase.from("temoignages").update({ valide: valide === "oui" }).eq("id", id).select("id");
  if (error || !data?.length) return ECHEC;
  actualiser();
  return { ok: true };
}

/** Supprime un témoignage (refus définitif) et sa photo. */
export async function supprimerTemoignage(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const id = texte(formData, "id");
  if (!estUuid(id)) return ECHEC;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;
  const { data, error } = await supabase.from("temoignages").delete().eq("id", id).select("photo_path");
  if (error || !data?.length) return ECHEC;
  if (data[0].photo_path) await supabase.storage.from("photos").remove([data[0].photo_path]);
  actualiser();
  return { ok: true };
}

/**
 * Enregistre la photo APRÈS son envoi vers le stockage (fait depuis le navigateur).
 * Le chemin est calculé ici ; on vérifie que le fichier est bien arrivé.
 */
export async function enregistrerPhotoTemoignage(temoignageId: string): Promise<EtatAdmin> {
  if (!estUuid(temoignageId)) return ECHEC;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;
  const chemin = cheminPhotoTemoignage(temoignageId);
  const { data: fichiers } = await supabase.storage.from("photos").list(`temoignages/${temoignageId}`, { search: "photo" });
  if (!fichiers?.some((f) => f.name === "photo")) return { message: "La photo n'a pas été reçue. Réessayez." };
  const { data, error } = await supabase.from("temoignages").update({ photo_path: chemin }).eq("id", temoignageId).select("id");
  if (error || !data?.length) return ECHEC;
  actualiser();
  return { ok: true, message: "Photo enregistrée." };
}

export async function supprimerPhotoTemoignage(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const id = texte(formData, "id");
  if (!estUuid(id)) return ECHEC;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;
  await supabase.storage.from("photos").remove([cheminPhotoTemoignage(id)]);
  const { data, error } = await supabase.from("temoignages").update({ photo_path: null }).eq("id", id).select("id");
  if (error || !data?.length) return ECHEC;
  actualiser();
  return { ok: true };
}
