import { Suspense } from "react";
import { InitialiserTheme, SCRIPT_THEME } from "@/components/coquille/bascule-theme";
import { EnTete, EnTeteSquelette } from "@/components/coquille/en-tete";
import { MenuSquelette } from "@/components/coquille/menu-lateral";
import { MenuParticipant } from "@/components/coquille/menu-participant";

/** Coquille de l'espace participant : menu (lien du profil en bas) + bande du haut + contenu de la page. */
export default function Layout({ children }: LayoutProps<"/">) {
  return (
    // Le thème (clair / sombre) est posé sur ce conteneur par le script ci-dessous : React ne touche pas à cet attribut
    <div id="espace-connecte" suppressHydrationWarning className="flex flex-1 flex-col md:flex-row">
      <script dangerouslySetInnerHTML={{ __html: SCRIPT_THEME }} />
      <InitialiserTheme />
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2"
      >
        Aller au contenu
      </a>
      {/* Le menu et la bande du haut lisent la session de la personne : sous <Suspense> (Cache Components). */}
      <Suspense fallback={<MenuSquelette />}>
        <MenuParticipant />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col">
        <Suspense fallback={<EnTeteSquelette />}>
          <EnTete />
        </Suspense>
        <main id="contenu" className="flex-1 px-4 pb-10 pt-2 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
