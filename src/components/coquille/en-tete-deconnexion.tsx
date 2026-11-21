import { LogOut } from "lucide-react";
import { deconnexion } from "@/lib/auth/actions";

/** Bande du haut : bouton de déconnexion à droite. Ne lit pas la session (rien à mettre sous <Suspense>). */
export function EnTeteDeconnexion() {
  return (
    <header className="flex items-center justify-end px-4 py-3 sm:px-6">
      <form action={deconnexion}>
        <button type="submit" className="btn btn-rose min-h-10 gap-2 px-4 text-sm">
          <LogOut aria-hidden className="size-4" />
          Déconnexion
        </button>
      </form>
    </header>
  );
}
