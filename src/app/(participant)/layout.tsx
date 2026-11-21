import { Suspense } from "react";
import { BandeauSansGroupe, EnTete, EnTeteSquelette } from "@/components/coquille/en-tete";
import { MenuLateral, MenuSquelette } from "@/components/coquille/menu-lateral";

/** Coquille de l'espace participant : menu + en-tête + contenu de la page. */
export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2"
      >
        Aller au contenu
      </a>
      {/* Le menu lit l'adresse de la page : il est sous <Suspense> (Cache Components). */}
      <Suspense fallback={<MenuSquelette />}>
        <MenuLateral />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col">
        {/* L'en-tête lit la session de la personne : sous <Suspense> également. */}
        <Suspense fallback={<EnTeteSquelette />}>
          <EnTete />
        </Suspense>
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
