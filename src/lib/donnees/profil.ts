import "server-only";
import { connection } from "next/server";
import { obtenirPersonne } from "@/lib/auth/personne";
import { creerClientServeur } from "@/lib/supabase/serveur";

/** Durée de validité du lien de la photo (affichage). Le fichier reste privé, jamais public. */
const DUREE_LIEN_PHOTO_SECONDES = 300;

export type ProfilComplet = {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  civilite: string | null;
  trancheAge: string | null;
  photoUrl: string | null;
};

/** Lien temporaire vers la photo d'une personne (null s'il n'y en a pas ou si le fichier est introuvable). */
export async function lireUrlPhoto(photoPath: string | null): Promise<string | null> {
  if (!photoPath) return null;
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase.storage.from("photos").createSignedUrl(photoPath, DUREE_LIEN_PHOTO_SECONDES);
  return data?.signedUrl ?? null;
}

/** Le profil de la personne connectée. */
export async function lireProfil(): Promise<ProfilComplet> {
  const personne = await obtenirPersonne();
  await connection();
  const supabase = await creerClientServeur();

  const [{ data: profil }, photoUrl] = await Promise.all([
    supabase.from("profils").select("civilite, tranche_age").eq("id", personne.id).maybeSingle(),
    lireUrlPhoto(personne.photoPath),
  ]);

  return {
    id: personne.id,
    email: personne.email,
    prenom: personne.prenom,
    nom: personne.nom,
    civilite: profil?.civilite ?? null,
    trancheAge: profil?.tranche_age ?? null,
    photoUrl,
  };
}
