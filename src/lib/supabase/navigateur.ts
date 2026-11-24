import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

/**
 * Accès Supabase depuis le navigateur. Sert UNIQUEMENT à envoyer les fichiers (photo de profil,
 * documents et photos de l'administration) directement vers le stockage, sans les faire passer par le serveur du site.
 * Clé publique seulement : le stockage applique ses propres règles (RLS).
 */
export function creerClientNavigateur() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
