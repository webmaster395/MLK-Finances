import { NextResponse, type NextRequest } from "next/server";
import { creerClientServeur } from "@/lib/supabase/serveur";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DUREE_LIEN_SECONDES = 60;

/**
 * Télécharger SON PROPRE rendu. La base ne renvoie que les rendus de la personne connectée (RLS),
 * puis on crée un lien signé de 60 secondes. Jamais de lien public.
 */
export async function GET(request: NextRequest, { params }: RouteContext<"/devoirs/[id]/telecharger">) {
  const { id } = await params;
  const retour = (cible: string) => {
    const reponse = NextResponse.redirect(new URL(cible, request.url));
    reponse.headers.set("Cache-Control", "private, no-store");
    return reponse;
  };

  if (!UUID.test(id)) return retour("/devoirs");

  const supabase = await creerClientServeur();
  const { data: utilisateur } = await supabase.auth.getUser();
  if (!utilisateur.user) return retour(`/connexion?suivant=/devoirs/${id}`);

  const { data: rendu } = await supabase
    .from("rendus")
    .select("fichier_path, nom_fichier")
    .eq("devoir_id", id)
    .maybeSingle();
  if (!rendu) return retour(`/devoirs/${id}?erreur=fichier`);

  const { data: lien, error } = await supabase.storage
    .from("rendus")
    .createSignedUrl(rendu.fichier_path, DUREE_LIEN_SECONDES, { download: rendu.nom_fichier ?? "rendu" });
  if (error || !lien?.signedUrl) return retour(`/devoirs/${id}?erreur=fichier`);

  const reponse = NextResponse.redirect(lien.signedUrl);
  reponse.headers.set("Cache-Control", "private, no-store");
  return reponse;
}
