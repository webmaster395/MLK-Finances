"use server";

import { revalidatePath } from "next/cache";
import { cheminRendu } from "@/lib/devoirs";
import { creerClientServeur } from "@/lib/supabase/serveur";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ResultatDepot = { ok: boolean; message?: string };

/**
 * Enregistre le rendu APRÈS l'envoi du fichier vers le stockage (fait depuis le navigateur).
 * Aucun fichier ne passe par cette action : elle ne reçoit que l'identifiant du devoir et le nom
 * d'origine du fichier. Le chemin dans le stockage est calculé ici, jamais fourni par le navigateur.
 */
export async function enregistrerRendu(devoirId: string, nomFichier: string): Promise<ResultatDepot> {
  if (!UUID.test(devoirId)) return { ok: false, message: "Devoir introuvable." };
  const nom = nomFichier.trim().slice(0, 200);
  if (!nom) return { ok: false, message: "Nom de fichier manquant." };

  const supabase = await creerClientServeur();
  const { data: utilisateur } = await supabase.auth.getUser();
  if (!utilisateur.user) return { ok: false, message: "Votre session a expiré. Reconnectez-vous." };
  const participantId = utilisateur.user.id;
  const chemin = cheminRendu(participantId, devoirId);

  // Le fichier doit bien exister dans le dossier de la personne (le stockage ne le montre qu'à elle)
  const { data: fichiers } = await supabase.storage.from("rendus").list(`${participantId}/${devoirId}`, { search: "depot" });
  if (!fichiers?.some((f) => f.name === "depot")) {
    return { ok: false, message: "Le fichier n'a pas été reçu. Réessayez." };
  }

  // Un rendu par devoir : on le met à jour s'il existe (jamais s'il est corrigé), sinon on le crée.
  // Les règles de la base refusent aussi un devoir invisible, un autre participant ou un rendu corrigé.
  const { data: existant } = await supabase
    .from("rendus")
    .select("id, statut")
    .eq("devoir_id", devoirId)
    .maybeSingle();

  if (existant) {
    if (existant.statut === "corrige") return { ok: false, message: "Ce devoir a été corrigé : il ne peut plus être remplacé." };
    const { error } = await supabase
      .from("rendus")
      .update({ fichier_path: chemin, nom_fichier: nom })
      .eq("id", existant.id);
    if (error) return { ok: false, message: "Impossible d'enregistrer votre dépôt. Réessayez dans un instant." };
  } else {
    const { error } = await supabase
      .from("rendus")
      .insert({ devoir_id: devoirId, participant_id: participantId, fichier_path: chemin, nom_fichier: nom });
    if (error) return { ok: false, message: "Impossible d'enregistrer votre dépôt. Ce devoir n'est peut-être plus ouvert." };
  }

  revalidatePath("/devoirs");
  return { ok: true };
}
