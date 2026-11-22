"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { civiliteValide, trancheAgeValide } from "@/lib/auth/profil";
import { creerClientServeur } from "@/lib/supabase/serveur";
import {
  cheminSupport,
  validerAnnonce,
  estCheminSupport,
  estUuid,
  validerCours,
  validerDevoir,
  validerGroupe,
  validerLien,
  validerRubrique,
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
  // Les pages admin et l'espace participant (groupes, promotion) se mettent à jour
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------
// Groupes
// ---------------------------------------------------------------

export async function creerGroupe(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const v = validerGroupe({ nom: texte(formData, "nom"), debut: texte(formData, "debut"), fin: texte(formData, "fin") });
  if ("message" in v) return v;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;

  const { data, error } = await supabase.from("groupes").insert(v.groupe).select("id").single();
  if (error || !data) return ECHEC;
  actualiser();
  redirect(`/admin/groupes/${data.id}`);
}

export async function modifierGroupe(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const id = texte(formData, "id");
  if (!estUuid(id)) return ECHEC;
  const v = validerGroupe({ nom: texte(formData, "nom"), debut: texte(formData, "debut"), fin: texte(formData, "fin") });
  if ("message" in v) return v;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;

  const { data, error } = await supabase.from("groupes").update(v.groupe).eq("id", id).select("id");
  if (error || !data?.length) return ECHEC;
  actualiser();
  return { ok: true, message: "Le groupe est enregistré." };
}

/** Supprime un groupe VIDE de contenu (sans cours ni séance) : sinon tout son contenu serait effacé. */
export async function supprimerGroupe(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const id = texte(formData, "id");
  if (!estUuid(id)) return ECHEC;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;

  const [cours, seances] = await Promise.all([
    supabase.from("cours").select("id", { count: "exact", head: true }).eq("groupe_id", id),
    supabase.from("sessions").select("id", { count: "exact", head: true }).eq("groupe_id", id),
  ]);
  if ((cours.count ?? 0) > 0 || (seances.count ?? 0) > 0) {
    return { message: "Ce groupe a des cours ou des séances : il ne peut pas être supprimé." };
  }
  const { data, error } = await supabase.from("groupes").delete().eq("id", id).select("id");
  if (error || !data?.length) return ECHEC;
  actualiser();
  redirect("/admin/groupes");
}

// ---------------------------------------------------------------
// Rattachement d'un participant à un groupe
// ---------------------------------------------------------------

export async function rattacher(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const participantId = texte(formData, "participant_id");
  const groupeId = texte(formData, "groupe_id");
  if (!estUuid(participantId) || !estUuid(groupeId)) return { message: "Choisissez un participant et un groupe." };
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;

  const { error } = await supabase
    .from("inscriptions")
    .upsert({ participant_id: participantId, groupe_id: groupeId }, { ignoreDuplicates: true });
  if (error) return ECHEC;
  actualiser();
  return { ok: true, message: "Rattachement enregistré." };
}

export async function detacher(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const participantId = texte(formData, "participant_id");
  const groupeId = texte(formData, "groupe_id");
  if (!estUuid(participantId) || !estUuid(groupeId)) return ECHEC;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;

  const { error } = await supabase
    .from("inscriptions")
    .delete()
    .eq("participant_id", participantId)
    .eq("groupe_id", groupeId);
  if (error) return ECHEC;
  actualiser();
  return { ok: true, message: "Participant retiré du groupe." };
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
// Séances
// ---------------------------------------------------------------

function saisieSeance(formData: FormData) {
  const brut = formData.get("description");
  return {
    groupeId: texte(formData, "groupe_id"),
    titre: texte(formData, "titre"),
    date: texte(formData, "date"),
    heureDebut: texte(formData, "heure_debut"),
    heureFin: texte(formData, "heure_fin"),
    lieu: texte(formData, "lieu"),
    description: typeof brut === "string" ? brut : "",
    rubriqueId: texte(formData, "rubrique_id"),
    coursId: texte(formData, "cours_id"),
    intervenants: (() => {
      const v = formData.get("intervenants");
      return typeof v === "string" ? v : "";
    })(),
    publie: formData.get("publie") === "on",
  };
}

type ClientAdmin = NonNullable<Awaited<ReturnType<typeof clientAdmin>>>;

/** Le cours choisi doit appartenir au groupe de la séance. */
async function coursDuGroupe(supabase: ClientAdmin, coursId: string | null, groupeId: string) {
  if (!coursId) return true;
  const { data } = await supabase.from("cours").select("groupe_id").eq("id", coursId).maybeSingle();
  return data?.groupe_id === groupeId;
}

const COURS_AUTRE_GROUPE: EtatAdmin = { message: "Ce cours appartient à un autre groupe : choisissez un cours du groupe de la séance." };

export async function creerSeance(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const v = validerSeance(saisieSeance(formData));
  if ("message" in v) return v;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;
  if (!(await coursDuGroupe(supabase, v.seance.cours_id, v.seance.groupe_id))) return COURS_AUTRE_GROUPE;

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
  if (!(await coursDuGroupe(supabase, v.seance.cours_id, v.seance.groupe_id))) return COURS_AUTRE_GROUPE;

  const { data, error } = await supabase.from("sessions").update(v.seance).eq("id", id).select("id");
  if (error || !data?.length) return ECHEC;
  actualiser();
  return { ok: true, message: "La séance est enregistrée." };
}

/** Supprime une séance (le cours lié, ses supports et ses devoirs sont conservés). */
export async function supprimerSeance(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const id = texte(formData, "id");
  if (!estUuid(id)) return ECHEC;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;
  const { data, error } = await supabase.from("sessions").delete().eq("id", id).select("id");
  if (error || !data?.length) return ECHEC;
  actualiser();
  redirect("/admin/seances");
}

// ---------------------------------------------------------------
// Rubriques
// ---------------------------------------------------------------

function saisieRubrique(formData: FormData) {
  return { nom: texte(formData, "nom"), couleur: texte(formData, "couleur"), ordre: texte(formData, "ordre") };
}

const NOM_PRIS: EtatAdmin = { message: "Une rubrique porte déjà ce nom." };

export async function creerRubrique(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const v = validerRubrique(saisieRubrique(formData));
  if ("message" in v) return v;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;
  const { error } = await supabase.from("rubriques").insert(v.rubrique);
  if (error?.code === "23505") return NOM_PRIS;
  if (error) return ECHEC;
  actualiser();
  return { ok: true, message: `Rubrique « ${v.rubrique.nom} » créée.` };
}

export async function modifierRubrique(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const id = texte(formData, "id");
  if (!estUuid(id)) return ECHEC;
  const v = validerRubrique(saisieRubrique(formData));
  if ("message" in v) return v;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;
  const { data, error } = await supabase.from("rubriques").update(v.rubrique).eq("id", id).select("id");
  if (error?.code === "23505") return NOM_PRIS;
  if (error || !data?.length) return ECHEC;
  actualiser();
  return { ok: true, message: "Rubrique enregistrée." };
}

/** Supprime une rubrique : les séances qui l'utilisaient restent, sans rubrique. */
export async function supprimerRubrique(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const id = texte(formData, "id");
  if (!estUuid(id)) return ECHEC;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;
  const { data, error } = await supabase.from("rubriques").delete().eq("id", id).select("id");
  if (error || !data?.length) return ECHEC;
  actualiser();
  return { ok: true, message: "Rubrique supprimée." };
}

// ---------------------------------------------------------------
// Cours
// ---------------------------------------------------------------

function saisieCours(formData: FormData) {
  const brut = (nom: string) => {
    const v = formData.get(nom);
    return typeof v === "string" ? v : "";
  };
  return {
    groupeId: texte(formData, "groupe_id"),
    titre: texte(formData, "titre"),
    description: brut("description"),
    objectifs: brut("objectifs"),
    ordre: texte(formData, "ordre"),
    publie: formData.get("publie") === "on",
  };
}

export async function creerCours(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const v = validerCours(saisieCours(formData));
  if ("message" in v) return v;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;
  const { data, error } = await supabase.from("cours").insert(v.cours).select("id").single();
  if (error || !data) return ECHEC;
  actualiser();
  redirect(`/admin/cours/${data.id}?cree=1`);
}

/** Modifie un cours. Changer de groupe n'est possible que si aucune séance ne l'utilise. */
export async function modifierCours(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const id = texte(formData, "id");
  if (!estUuid(id)) return ECHEC;
  const v = validerCours(saisieCours(formData));
  if ("message" in v) return v;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;

  const { data: actuel } = await supabase.from("cours").select("groupe_id").eq("id", id).maybeSingle();
  if (!actuel) return ECHEC;
  if (actuel.groupe_id !== v.cours.groupe_id) {
    const { count } = await supabase.from("sessions").select("id", { count: "exact", head: true }).eq("cours_id", id);
    if ((count ?? 0) > 0) return { message: "Des séances utilisent ce cours : il ne peut pas changer de groupe." };
  }

  const { data, error } = await supabase.from("cours").update(v.cours).eq("id", id).select("id");
  if (error || !data?.length) return ECHEC;
  actualiser();
  return { ok: true, message: "Le cours est enregistré." };
}

/**
 * Supprime un cours SANS séance ni devoir (sinon des dépôts de participants seraient effacés).
 * Ses supports sont supprimés avec lui, fichiers compris.
 */
export async function supprimerCours(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const id = texte(formData, "id");
  if (!estUuid(id)) return ECHEC;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;

  const [seances, devoirs, fichiers] = await Promise.all([
    supabase.from("sessions").select("id", { count: "exact", head: true }).eq("cours_id", id),
    supabase.from("devoirs").select("id", { count: "exact", head: true }).eq("cours_id", id),
    supabase.from("ressources").select("storage_path").eq("cours_id", id).not("storage_path", "is", null),
  ]);
  if ((seances.count ?? 0) > 0 || (devoirs.count ?? 0) > 0) {
    return { message: "Ce cours a des séances ou des devoirs : il ne peut pas être supprimé." };
  }
  const chemins = (fichiers.data ?? []).flatMap((r) => (r.storage_path ? [r.storage_path] : []));
  const { data, error } = await supabase.from("cours").delete().eq("id", id).select("id");
  if (error || !data?.length) return ECHEC;
  if (chemins.length > 0) await supabase.storage.from("ressources").remove(chemins);
  actualiser();
  redirect("/admin/cours");
}

// ---------------------------------------------------------------
// Supports d'un cours (liens et fichiers)
// ---------------------------------------------------------------

export async function ajouterLien(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const coursId = texte(formData, "cours_id");
  if (!estUuid(coursId)) return ECHEC;
  const v = validerLien({ titre: texte(formData, "titre"), url: texte(formData, "url") });
  if ("message" in v) return v;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;
  const { error } = await supabase.from("ressources").insert({ cours_id: coursId, titre: v.titre, type: "lien", url: v.url });
  if (error) return ECHEC;
  actualiser();
  return { ok: true, message: "Lien ajouté." };
}

export type ResultatPreparation = { ok: true; chemin: string } | { ok: false; message: string };

/** Étape 1 d'un envoi de fichier : le serveur choisit le chemin (le navigateur n'en choisit jamais). */
export async function preparerFichierSupport(coursId: string, nomFichier: string): Promise<ResultatPreparation> {
  if (!estUuid(coursId)) return { ok: false, message: "Cours introuvable." };
  const supabase = await clientAdmin();
  if (!supabase) return { ok: false, message: SESSION_EXPIREE.message! };
  return { ok: true, chemin: cheminSupport(coursId, crypto.randomUUID(), nomFichier) };
}

/** Étape 3 : après l'envoi par le navigateur, on vérifie le fichier puis on enregistre le support. */
export async function enregistrerFichierSupport(coursId: string, titre: string, chemin: string): Promise<EtatAdmin> {
  if (!estUuid(coursId) || !estCheminSupport(chemin, coursId)) return ECHEC;
  const t = titre.trim();
  if (t.length === 0 || t.length > 200) return { message: "Donnez un titre au support (200 caractères au maximum)." };
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;

  const dossier = chemin.slice(0, chemin.lastIndexOf("/"));
  const nom = chemin.slice(chemin.lastIndexOf("/") + 1);
  const { data: fichiers } = await supabase.storage.from("ressources").list(dossier);
  if (!fichiers?.some((f) => f.name === nom)) return { message: "Le fichier n'a pas été reçu. Réessayez." };

  const { error } = await supabase.from("ressources").insert({ cours_id: coursId, titre: t, type: "fichier", storage_path: chemin });
  if (error) {
    await supabase.storage.from("ressources").remove([chemin]);
    return ECHEC;
  }
  actualiser();
  return { ok: true, message: "Fichier ajouté." };
}

/** Supprime un support (et son fichier s'il en a un). */
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
  return { ok: true, message: "Support supprimé." };
}

// ---------------------------------------------------------------
// Devoirs et corrections
// ---------------------------------------------------------------

function saisieDevoir(formData: FormData) {
  const v = formData.get("consigne");
  return {
    coursId: texte(formData, "cours_id"),
    titre: texte(formData, "titre"),
    consigne: typeof v === "string" ? v : "",
    date: texte(formData, "date"),
    heure: texte(formData, "heure"),
    publie: formData.get("publie") === "on",
  };
}

export async function creerDevoir(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const v = validerDevoir(saisieDevoir(formData));
  if ("message" in v) return v;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;
  const { data, error } = await supabase.from("devoirs").insert(v.devoir).select("id").single();
  if (error || !data) return ECHEC;
  actualiser();
  redirect(`/admin/devoirs/${data.id}?cree=1`);
}

/** Modifie un devoir. Il ne change pas de cours s'il a déjà des rendus. */
export async function modifierDevoir(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const id = texte(formData, "id");
  if (!estUuid(id)) return ECHEC;
  const v = validerDevoir(saisieDevoir(formData));
  if ("message" in v) return v;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;
  const { data: actuel } = await supabase.from("devoirs").select("cours_id, rendus(count)").eq("id", id).maybeSingle();
  if (!actuel) return ECHEC;
  if (actuel.cours_id !== v.devoir.cours_id && (actuel.rendus[0]?.count ?? 0) > 0) {
    return { message: "Des participants ont déjà rendu ce devoir : il ne peut pas changer de cours." };
  }
  const { data, error } = await supabase.from("devoirs").update(v.devoir).eq("id", id).select("id");
  if (error || !data?.length) return ECHEC;
  actualiser();
  return { ok: true, message: "Le devoir est enregistré." };
}

/** Supprime un devoir SANS rendu (sinon les dépôts des participants seraient effacés). */
export async function supprimerDevoir(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const id = texte(formData, "id");
  if (!estUuid(id)) return ECHEC;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;
  const { count } = await supabase.from("rendus").select("id", { count: "exact", head: true }).eq("devoir_id", id);
  if ((count ?? 0) > 0) return { message: "Des participants ont rendu ce devoir : il ne peut pas être supprimé." };
  const { data, error } = await supabase.from("devoirs").delete().eq("id", id).select("id");
  if (error || !data?.length) return ECHEC;
  actualiser();
  redirect("/admin/devoirs");
}

/** Marque un rendu « corrigé » (le participant ne peut plus le remplacer), ou annule la correction. */
export async function changerStatutRendu(_: EtatAdmin, formData: FormData): Promise<EtatAdmin> {
  const id = texte(formData, "id");
  const statut = texte(formData, "statut");
  if (!estUuid(id) || (statut !== "corrige" && statut !== "depose")) return ECHEC;
  const supabase = await clientAdmin();
  if (!supabase) return SESSION_EXPIREE;
  const { data, error } = await supabase.from("rendus").update({ statut }).eq("id", id).select("id");
  if (error || !data?.length) return ECHEC;
  actualiser();
  return { ok: true };
}

// ---------------------------------------------------------------
// Messages de l'équipe
// ---------------------------------------------------------------

function saisieAnnonce(formData: FormData) {
  const v = formData.get("message");
  return {
    groupeId: texte(formData, "groupe_id"),
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
