import { NextResponse, type NextRequest } from "next/server";
import { creerClientServeur } from "@/lib/supabase/serveur";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DUREE_LIEN_SECONDES = 60;

/**
 * Téléchargement d'une ressource de type « fichier ».
 * 1. La personne doit être connectée ; la base ne renvoie la ressource que si elle est publiée
 *    et appartient à un cours publié (règles RLS).
 * 2. On crée un lien signé qui ne dure que 60 secondes, et on y redirige. Le fichier n'est
 *    jamais public, et ce lien n'est jamais enregistré ni affiché dans la page.
 * Les droits de lecture du fichier lui-même sont aussi vérifiés par le stockage (RLS sur le seau).
 */
export async function GET(request: NextRequest, { params }: RouteContext<"/ressources/[id]/telecharger">) {
  const { id } = await params;
  const retour = (cible: string) => {
    const reponse = NextResponse.redirect(new URL(cible, request.url));
    reponse.headers.set("Cache-Control", "private, no-store");
    return reponse;
  };

  if (!UUID.test(id)) return retour("/ressources?erreur=fichier");

  const supabase = await creerClientServeur();
  const { data: utilisateur } = await supabase.auth.getUser();
  if (!utilisateur.user) return retour("/connexion?suivant=/ressources");

  const { data: ressource } = await supabase
    .from("ressources")
    .select("type, url, storage_path")
    .eq("id", id)
    .maybeSingle();
  if (!ressource) return retour("/ressources?erreur=fichier");

  // Une ressource de type « lien » n'a pas de fichier : on renvoie vers son adresse
  if (ressource.type === "lien" && ressource.url) {
    const reponse = NextResponse.redirect(ressource.url);
    reponse.headers.set("Cache-Control", "private, no-store");
    return reponse;
  }
  if (!ressource.storage_path) return retour("/ressources?erreur=fichier");

  const nomFichier = ressource.storage_path.split("/").pop() ?? "fichier";
  const { data: lien, error } = await supabase.storage
    .from("ressources")
    .createSignedUrl(ressource.storage_path, DUREE_LIEN_SECONDES, { download: nomFichier });
  if (error || !lien?.signedUrl) return retour("/ressources?erreur=fichier");

  const reponse = NextResponse.redirect(lien.signedUrl);
  reponse.headers.set("Cache-Control", "private, no-store");
  return reponse;
}
