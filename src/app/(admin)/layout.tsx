import { Suspense } from "react";
import { EnTeteAdmin, EnTeteAdminSquelette, MenuAdmin } from "@/components/admin/coquille-admin";
import { SCRIPT_THEME } from "@/components/coquille/bascule-theme";
import { MenuSquelette } from "@/components/coquille/menu-lateral";

/**
 * Coquille de l'espace administrateur : même structure que l'espace participant (menu + bande du haut).
 * Réservé au rôle « admin » : le proxy filtre, chaque composant appelle exigerAdmin(), et la base applique la RLS.
 */
export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <div id="espace-connecte" suppressHydrationWarning className="flex flex-1 flex-col md:flex-row">
      <script dangerouslySetInnerHTML={{ __html: SCRIPT_THEME }} />
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2"
      >
        Aller au contenu
      </a>
      <Suspense fallback={<MenuSquelette />}>
        <MenuAdmin />
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
