import { obtenirPersonne } from "@/lib/auth/personne";
import { lireMessages } from "@/lib/donnees/annonces";
import { PROMOTION } from "@/lib/promotion";
import { BasculeTheme } from "./bascule-theme";
import { BoutonMessages } from "./bouton-messages";

/**
 * Bande du haut : « Bonjour {prénom} » à gauche ; sur ordinateur, l'icône messages, la promotion
 * et le bouton clair / sombre à droite (sur téléphone, ils sont sur la ligne du logo en haut).
 * Lit la session de la personne : toujours sous <Suspense>.
 */
export async function EnTete() {
  const [personne, messages] = await Promise.all([obtenirPersonne(), lireMessages()]);
  const promotion = PROMOTION;
  const prenom = personne.prenom || personne.email;

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:px-6 sm:py-3 lg:px-8">
      <p className="text-lg font-semibold text-noir sm:text-2xl">Bonjour {prenom}</p>
      <div className="hidden flex-wrap items-center justify-end gap-2.5 md:flex">
        <BoutonMessages messages={messages} />
        {promotion ? (
          <span className="rounded-full border border-black/25 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-noir">
            {promotion}
          </span>
        ) : null}
        <BasculeTheme />
      </div>
    </header>
  );
}

/** Affiché le temps que l'en-tête se charge : le salut est remplacé par une barre grisée, les boutons restent actifs. */
export function EnTeteSquelette() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6 lg:px-8">
      <div aria-hidden className="h-8 w-44 rounded-md bg-black/10 motion-safe:animate-pulse" />
      <div className="hidden items-center gap-2.5 md:flex">
        <BoutonMessages />
        <BasculeTheme />
      </div>
    </header>
  );
}
