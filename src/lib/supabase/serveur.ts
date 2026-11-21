import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

/**
 * Accès Supabase côté serveur (composants serveur, actions serveur, routes).
 * Utilise uniquement la clé PUBLIQUE : la sécurité repose sur les règles (RLS) de la base.
 * Ne lit les cookies qu'au moment de l'appel : à utiliser sous <Suspense> (Cache Components).
 */
export async function creerClientServeur() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(aEcrire) {
          try {
            aEcrire.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Appelé depuis un composant serveur (écriture impossible) : sans gravité,
            // le proxy rafraîchit déjà la session à chaque requête.
          }
        },
      },
    },
  );
}
