import { NextResponse, type NextRequest } from "next/server";
import { creerClientServeur } from "@/lib/supabase/serveur";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Téléchargement d'un devoir rendu, pour la correction. Réservé aux admins :
 * le rôle est relu en base, et la base comme le stockage appliquent leurs règles « admin ».
 * Redirige vers un lien signé de 60 secondes, jamais enregistré ni affiché.
 */
export async function GET(request: NextRequest, { params }: RouteContext<"/admin/rendus/[id]/telecharger">) {
  const { id } = await params;
  const retour = (cible: string) => {
    const r = NextResponse.redirect(new URL(cible, request.url));
    r.headers.set("Cache-Control", "private, no-store");
    return r;
  };
  if (!UUID.test(id)) return retour("/admin/devoirs");

  const supabase = await creerClientServeur();
  const { data: utilisateur } = await supabase.auth.getUser();
  if (!utilisateur.user) return retour("/connexion?suivant=/admin/devoirs");
  const { data: profil } = await supabase.from("profils").select("role").eq("id", utilisateur.user.id).maybeSingle();
  if (profil?.role !== "admin") return retour("/accueil");

  const { data: rendu } = await supabase.from("rendus").select("devoir_id, fichier_path, nom_fichier").eq("id", id).maybeSingle();
  if (!rendu) return retour("/admin/devoirs");

  const { data: lien, error } = await supabase.storage
    .from("rendus")
    .createSignedUrl(rendu.fichier_path, 60, { download: rendu.nom_fichier ?? "devoir" });
  if (error || !lien?.signedUrl) return retour(`/admin/devoirs/${rendu.devoir_id}?erreur=fichier`);

  const r = NextResponse.redirect(lien.signedUrl);
  r.headers.set("Cache-Control", "private, no-store");
  return r;
}
