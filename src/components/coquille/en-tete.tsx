import { LogOut } from "lucide-react";

// Provisoire : sera remplacé par la vraie personne connectée au lot 3 (connexion).
const personne = { prenom: "Participant", nom: "démo" };

function initiales(prenom: string, nom: string) {
  return `${prenom[0] ?? ""}${nom[0] ?? ""}`.toUpperCase();
}

/** En-tête commun : nom de la personne et déconnexion. */
export function EnTete() {
  return (
    <header className="flex items-center justify-end gap-3 px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="flex size-10 items-center justify-center rounded-full bg-noir font-titre text-lg text-white"
        >
          {initiales(personne.prenom, personne.nom)}
        </span>
        <span className="hidden text-sm font-semibold sm:inline">
          {personne.prenom} {personne.nom}
        </span>
      </div>
      <button
        type="button"
        disabled
        title="Disponible avec la connexion (lot 3)"
        className="btn btn-rose min-h-10 gap-2 px-4 text-sm opacity-60"
      >
        <LogOut aria-hidden className="size-4" />
        Déconnexion
      </button>
    </header>
  );
}
