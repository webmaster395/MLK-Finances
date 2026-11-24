import { BasculeTheme } from "@/components/coquille/bascule-theme";
import { exigerAdmin } from "@/lib/auth/personne";
import { ListeAdmin } from "./liste-admin";

/** Affiché le temps que la bande du haut se charge. */
export function EnTeteAdminSquelette() {
  return (
    <header className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
      <div aria-hidden className="h-8 w-44 rounded-md bg-black/10 motion-safe:animate-pulse" />
      <div aria-hidden className="h-11 w-40 rounded-[0.9rem] bg-black/10 motion-safe:animate-pulse" />
    </header>
  );
}

/**
 * Bande du haut de l'espace administrateur : « Bonjour » à gauche, liste déroulante des pages d'administration
 * à droite (le menu des participants reste à gauche). Sous <Suspense>.
 */
export async function EnTeteAdmin() {
  const personne = await exigerAdmin();
  const prenom = personne.prenom || personne.email;

  return (
    <header className="flex items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:px-6 sm:py-3 lg:px-8">
      <p className="min-w-0 truncate text-lg font-semibold text-noir sm:text-2xl">Bonjour {prenom}</p>
      <div className="flex shrink-0 items-center gap-2.5">
        <ListeAdmin />
        <div className="hidden md:block">
          <BasculeTheme />
        </div>
      </div>
    </header>
  );
}
