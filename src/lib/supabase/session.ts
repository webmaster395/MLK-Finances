import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { estEspaceAdmin, estProtegee, PAGES_VISITEUR } from "@/lib/auth/routes";
import type { Database } from "./database.types";

/**
 * Appelé par proxy.ts à chaque requête :
 * 1. rafraîchit la session de connexion (cookies) ;
 * 2. renvoie vers /connexion un visiteur qui ouvre une page de l'espace connecté ;
 * 3. renvoie vers /accueil une personne déjà connectée qui ouvre la connexion ou l'inscription.
 * C'est une première barrière : chaque page vérifie aussi la personne côté serveur,
 * et la base de données applique ses propres règles (RLS).
 */
export async function mettreAJourSession(request: NextRequest) {
  let reponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(aEcrire) {
          aEcrire.forEach(({ name, value }) => request.cookies.set(name, value));
          reponse = NextResponse.next({ request });
          aEcrire.forEach(({ name, value, options }) => reponse.cookies.set(name, value, options));
        },
      },
    },
  );

  // Ne rien exécuter entre la création du client et cet appel : il rafraîchit la session.
  const { data } = await supabase.auth.getClaims();
  const connecte = Boolean(data?.claims);
  const chemin = request.nextUrl.pathname;

  if (!connecte && estProtegee(chemin)) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.search = "";
    url.searchParams.set("suivant", chemin);
    return NextResponse.redirect(url);
  }

  // Espace administrateur : le rôle est lu dans la base (jamais dans ce que la personne envoie)
  if (connecte && estEspaceAdmin(chemin)) {
    const { data: profil } = await supabase
      .from("profils")
      .select("role")
      .eq("id", String(data?.claims?.sub ?? ""))
      .maybeSingle();
    if (profil?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/accueil";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  if (connecte && PAGES_VISITEUR.includes(chemin)) {
    const url = request.nextUrl.clone();
    url.pathname = "/accueil";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return reponse;
}
