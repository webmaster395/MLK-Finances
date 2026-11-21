import Link from "next/link";
import { ChevronRight, ClipboardList } from "lucide-react";
import { BadgeStatut } from "@/components/devoirs/badge-statut";
import { lireDevoirs } from "@/lib/donnees/devoirs";
import { estAFaire } from "@/lib/devoirs";
import { formaterCreneau } from "@/lib/format";

/** Les devoirs en attente de rendu (travail à faire à la maison). Lit les données de la personne : sous <Suspense>. */
export async function TravailAFaire() {
  const devoirs = await lireDevoirs();
  const aFaire = devoirs.filter((d) => estAFaire(d.statut));

  return (
    <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-travail">
      <div className="flex items-center justify-between gap-3">
        <h2 id="titre-travail" className="titre-charte flex items-center gap-2.5 text-xl sm:text-2xl">
          <ClipboardList aria-hidden className="size-5 text-rose" />
          Travail à faire
        </h2>
        {aFaire.length > 0 ? (
          <span
            className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#b42318] px-2 text-xs font-bold text-white"
            aria-label={`${aFaire.length} devoir${aFaire.length > 1 ? "s" : ""} à rendre`}
          >
            {aFaire.length}
          </span>
        ) : null}
      </div>

      {aFaire.length > 0 ? (
        <>
          <ul className="mt-3 divide-y divide-black/10">
            {aFaire.slice(0, 3).map((d) => (
              <li key={d.id}>
                <Link href={`/devoirs/${d.id}`} className="group flex items-center gap-3 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-noir group-hover:underline [overflow-wrap:anywhere]">{d.titre}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <BadgeStatut statut={d.statut} />
                      {d.echeance ? (
                        <span className="text-xs">pour le {formaterCreneau(d.echeance).replace(/^./, (c) => c.toLowerCase())}</span>
                      ) : null}
                    </span>
                  </span>
                  <ChevronRight aria-hidden className="size-4 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/devoirs" className="mt-2 inline-block text-sm font-semibold text-noir underline underline-offset-2">
            {aFaire.length > 3 ? `Voir les ${aFaire.length} devoirs` : "Voir mes devoirs"} →
          </Link>
        </>
      ) : (
        <p className="mt-3 text-sm font-semibold">Tout est à jour : aucun devoir en attente.</p>
      )}
    </section>
  );
}

export function TravailAFaireChargement() {
  return (
    <section className="accueil-carte p-5 sm:p-6" role="status" aria-live="polite">
      <span className="sr-only">Chargement du travail à faire…</span>
      <h2 className="titre-charte flex items-center gap-2.5 text-2xl">
        <ClipboardList aria-hidden className="size-5 text-rose" />
        Travail à faire
      </h2>
      <div className="mt-3 flex flex-col gap-3 motion-safe:animate-pulse">
        <div className="h-10 w-full rounded bg-black/10" />
        <div className="h-10 w-full rounded bg-black/10" />
      </div>
    </section>
  );
}
