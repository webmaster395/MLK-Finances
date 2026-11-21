import { LogOut } from "lucide-react";
import { deconnexion } from "@/lib/auth/actions";
import { compterGroupes, obtenirPersonne } from "@/lib/auth/personne";

function initiales(prenom: string, nom: string, email: string) {
  const i = `${prenom[0] ?? ""}${nom[0] ?? ""}`.toUpperCase();
  return i || (email[0] ?? "?").toUpperCase();
}

/** En-tête commun : la personne connectée et la déconnexion. Lit la session : toujours sous <Suspense>. */
export async function EnTete() {
  const personne = await obtenirPersonne();
  const nomComplet = `${personne.prenom} ${personne.nom}`.trim() || personne.email;

  return (
    <header className="flex items-center justify-end gap-3 px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-10 items-center justify-center rounded-full bg-noir font-titre text-lg text-white"
        >
          {initiales(personne.prenom, personne.nom, personne.email)}
        </span>
        <span className="hidden max-w-48 truncate text-sm font-semibold sm:inline">{nomComplet}</span>
      </div>
      <form action={deconnexion}>
        <button type="submit" className="btn btn-rose min-h-10 gap-2 px-4 text-sm">
          <LogOut aria-hidden className="size-4" />
          Déconnexion
        </button>
      </form>
    </header>
  );
}

/** Affiché le temps que l'en-tête se charge. */
export function EnTeteSquelette() {
  return (
    <div className="flex h-16 items-center justify-end gap-3 px-4 sm:px-6" aria-hidden>
      <div className="size-10 rounded-full bg-black/10 motion-safe:animate-pulse" />
      <div className="h-10 w-32 rounded-md bg-black/10 motion-safe:animate-pulse" />
    </div>
  );
}

/** Message affiché tant que la personne n'est rattachée à aucun groupe (rattachement manuel en phase 1). */
export async function BandeauSansGroupe() {
  const nombre = await compterGroupes();
  if (nombre > 0) return null;

  return (
    <section role="status" className="carte mb-6 flex flex-col gap-1 border-l-4 border-rose">
      <h2 className="titre-charte text-2xl">Inscription enregistrée</h2>
      <p className="font-semibold">
        Votre compte est bien créé. Vous serez rattaché(e) à votre groupe prochainement : vos sessions, cours et devoirs
        apparaîtront ici dès que ce sera fait.
      </p>
    </section>
  );
}
