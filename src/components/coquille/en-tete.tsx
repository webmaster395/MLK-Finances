import { LogOut } from "lucide-react";
import { deconnexion } from "@/lib/auth/actions";
import { obtenirPersonne } from "@/lib/auth/personne";
import { lirePromotion } from "@/lib/donnees/profil";
import { BasculeTheme } from "./bascule-theme";

/** Boutons de droite (clair / sombre, déconnexion) : ne lisent rien, donc toujours affichés. */
function Actions() {
  return (
    <div className="flex items-center gap-2">
      <BasculeTheme />
      <form action={deconnexion}>
        <button type="submit" className="btn btn-rose min-h-10 gap-2 px-4 text-sm">
          <LogOut aria-hidden className="size-4" />
          Déconnexion
        </button>
      </form>
    </div>
  );
}

/**
 * Bande du haut : « Bonjour {prénom} » à gauche ; la promotion, le bouton clair / sombre et la
 * déconnexion à droite. Lit la session de la personne : toujours sous <Suspense>.
 */
export async function EnTete() {
  const [personne, promotion] = await Promise.all([obtenirPersonne(), lirePromotion()]);
  const prenom = personne.prenom || personne.email;

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
      <p className="text-xl font-semibold text-noir sm:text-2xl">Bonjour {prenom}</p>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {promotion ? (
          <span className="rounded-full border border-black/25 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-noir">
            {promotion}
          </span>
        ) : null}
        <Actions />
      </div>
    </header>
  );
}

/** Affiché le temps que l'en-tête se charge : le salut est remplacé par une barre grisée, les boutons restent actifs. */
export function EnTeteSquelette() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
      <div aria-hidden className="h-8 w-44 rounded-md bg-black/10 motion-safe:animate-pulse" />
      <Actions />
    </header>
  );
}
