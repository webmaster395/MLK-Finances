import { Suspense } from "react";
import { BandeauSansGroupe } from "@/components/coquille/bandeau-sans-groupe";
import { MenuSquelette } from "@/components/coquille/menu-lateral";
import { EnTeteDeconnexion } from "@/components/coquille/en-tete-deconnexion";
import { MenuParticipant } from "@/components/coquille/menu-participant";

/** Coquille de l'espace participant : menu (lien du profil en bas) + bouton de déconnexion en haut à droite + contenu de la page. */
export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2"
      >
        Aller au contenu
      </a>
      {/* Le menu lit la session et l'adresse de la page : il est sous <Suspense> (Cache Components). */}
      <Suspense fallback={<MenuSquelette />}>
        <MenuParticipant />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col">
        <EnTeteDeconnexion />
        <main id="contenu" className="flex-1 px-4 pb-10 pt-2 sm:px-6 lg:px-8">
          <Suspense fallback={null}>
            <BandeauSansGroupe />
          </Suspense>
          {children}
        </main>
      </div>
    </div>
  );
}
