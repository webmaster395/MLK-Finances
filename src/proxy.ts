import type { NextRequest } from "next/server";
import { mettreAJourSession } from "@/lib/supabase/session";

export async function proxy(request: NextRequest) {
  return mettreAJourSession(request);
}

export const config = {
  // Toutes les pages, sauf les fichiers statiques (images, polices, icône du site)
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
