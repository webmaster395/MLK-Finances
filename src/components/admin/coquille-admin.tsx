import { BasculeTheme } from "@/components/coquille/bascule-theme";
import { MenuLateral } from "@/components/coquille/menu-lateral";
import { initiales } from "@/lib/auth/initiales";
import { exigerAdmin } from "@/lib/auth/personne";
import { lireUrlPhoto } from "@/lib/donnees/profil";

const LIBELLE = "Administration";

/** Menu de l'espace administrateur (même menu que les participants, entrées admin). Sous <Suspense>. */
export async function MenuAdmin() {
  const personne = await exigerAdmin();
  const photoUrl = await lireUrlPhoto(personne.photoPath);
  const nomComplet = `${personne.prenom} ${personne.nom}`.trim() || personne.email;

  return (
    <MenuLateral
      espace="admin"
      promotion={LIBELLE}
      personne={{
        nomComplet,
        initiales: initiales(personne.prenom, personne.nom, personne.email),
        photoUrl,
      }}
    />
  );
}

/** Affiché le temps que la bande du haut se charge. */
export function EnTeteAdminSquelette() {
  return (
    <header className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
      <div aria-hidden className="h-8 w-44 rounded-md bg-black/10 motion-safe:animate-pulse" />
      <div className="hidden md:flex">
        <BasculeTheme />
      </div>
    </header>
  );
}

/** Bande du haut de l'espace administrateur. Sous <Suspense>. */
export async function EnTeteAdmin() {
  const personne = await exigerAdmin();
  const prenom = personne.prenom || personne.email;

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 sm:px-6 sm:py-3 lg:px-8">
      <p className="text-lg font-semibold text-noir sm:text-2xl">Bonjour {prenom}</p>
      <div className="hidden items-center gap-2.5 md:flex">
        <span className="rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-noir">
          {LIBELLE}
        </span>
        <BasculeTheme />
      </div>
    </header>
  );
}
