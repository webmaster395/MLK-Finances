import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { creerClientServeur } from "@/lib/supabase/serveur";

export type Personne = {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  role: "participant" | "admin";
  /** Chemin de la photo dans le stockage (null si aucune). */
  photoPath: string | null;
};

/**
 * Personne connectée (ou renvoi vers /connexion). Vérifie la session auprès de Supabase :
 * à appeler depuis un composant placé sous <Suspense> (la session est lue à chaque requête).
 * Le résultat est partagé pendant une même requête (cache de React), sans être mis en cache entre requêtes.
 */
export const obtenirPersonne = cache(async (): Promise<Personne> => {
  // La vérification de session lit l'heure (expiration du jeton) : on indique à Next.js
  // que ceci se fait au moment de la requête, pas pendant la préparation de la page.
  await connection();
  const supabase = await creerClientServeur();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/connexion");

  const { data: profil } = await supabase
    .from("profils")
    .select("prenom, nom, role, photo_path")
    .eq("id", data.user.id)
    .maybeSingle();

  return {
    id: data.user.id,
    email: data.user.email ?? "",
    prenom: profil?.prenom ?? "",
    nom: profil?.nom ?? "",
    role: profil?.role ?? "participant",
    photoPath: profil?.photo_path ?? null,
  };
});

/** Nombre de groupes auxquels la personne est rattachée (0 = en attente de rattachement). */
export const compterGroupes = cache(async (): Promise<number> => {
  await connection();
  const supabase = await creerClientServeur();
  const { count } = await supabase.from("inscriptions").select("groupe_id", { count: "exact", head: true });
  return count ?? 0;
});
