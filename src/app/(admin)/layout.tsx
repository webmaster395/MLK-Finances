import { Suspense } from "react";
import { EnTeteAdmin, EnTeteAdminSquelette } from "@/components/admin/coquille-admin";
import { InitialiserTheme, SCRIPT_THEME } from "@/components/coquille/bascule-theme";
import { MenuSquelette } from "@/components/coquille/menu-lateral";
import { MenuParticipant } from "@/components/coquille/menu-participant";

/**
 * Coquille de l'espace administrateur : exactement la vue des participants (même menu à gauche),
 * avec en haut à droite une liste déroulante pour les pages d'administration.
 * Réservé au rôle « admin » : le proxy filtre, chaque composant appelle exigerAdmin(), et la base applique la RLS.
 */
export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <div id="espace-connecte" suppressHydrationWarning className="flex flex-1 flex-col md:flex-row">
      <script dangerouslySetInnerHTML={{ __html: SCRIPT_THEME }} />
      <InitialiserTheme />
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2"
      >
        Aller au contenu
      </a>
      <Suspense fallback={<MenuSquelette />}>
        <MenuParticipant />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col">
        <Suspense fallback={<EnTeteAdminSquelette />}>
          <EnTeteAdmin />
        </Suspense>
        <main id="contenu" className="flex-1 px-4 pb-10 pt-2 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
