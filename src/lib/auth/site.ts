import "server-only";
import { headers } from "next/headers";

/**
 * Adresse publique du site (sert à construire les liens des e-mails).
 * En production, SITE_URL doit être l'adresse Vercel. Supabase refuse de toute façon
 * les adresses de retour qui ne figurent pas dans sa liste d'adresses autorisées.
 */
export async function adresseSite(): Promise<string> {
  const configuree = process.env.SITE_URL;
  if (configuree) return configuree.replace(/\/+$/, "");

  const h = await headers();
  const hote = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const protocole = h.get("x-forwarded-proto") ?? (hote.startsWith("localhost") ? "http" : "https");
  return `${protocole}://${hote}`;
}
