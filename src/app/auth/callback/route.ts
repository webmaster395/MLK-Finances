import { NextResponse, type NextRequest } from "next/server";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { cheminSur } from "@/lib/auth/redirection";

/**
 * Page où mènent les liens reçus par e-mail (confirmation d'inscription, nouveau mot de passe).
 * Supabase ajoute un code à l'adresse : on l'échange contre une session, puis on redirige
 * vers un chemin INTERNE du site uniquement (voir cheminSur).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const suivant = cheminSur(searchParams.get("suivant"));

  if (code) {
    const supabase = await creerClientServeur();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(suivant, request.url));
    }
  }

  return NextResponse.redirect(new URL("/connexion?erreur=lien", request.url));
}
