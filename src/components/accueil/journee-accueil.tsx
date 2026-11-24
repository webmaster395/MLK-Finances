import Link from "next/link";
import { CalendarX, Clock, Video } from "lucide-react";
import { formaterHoraires, formaterJourIso } from "@/lib/format";
import { lireProchaineSession } from "@/lib/donnees/sessions";

/** « Prochaine session » : date, horaires, lien de visioconférence. Lit les données de la personne : sous <Suspense>. */
export async function JourneeAccueil() {
  const prochaine = await lireProchaineSession();

  if (!prochaine) {
    return (
      <section className="accueil-carte flex flex-col items-center gap-3 p-8 text-center" aria-labelledby="titre-journee">
        <span className="flex size-14 items-center justify-center rounded-full bg-accent-clair text-noir">
          <CalendarX aria-hidden className="size-7" />
        </span>
        <h2 id="titre-journee" className="titre-charte text-3xl">
          Prochaine session
        </h2>
        <p className="max-w-md font-semibold">
          Aucune session à venir pour le moment. Elle apparaîtra ici dès qu&apos;elle sera planifiée.
        </p>
      </section>
    );
  }

  const { session, joursRestants: reste } = prochaine;

  return (
    <section className="accueil-carte p-5 sm:p-7" aria-labelledby="titre-journee">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs sm:text-sm">Prochaine session</p>
          <h2 id="titre-journee" className="titre-charte mt-1 text-2xl !leading-tight sm:text-3xl lg:text-4xl [overflow-wrap:anywhere]">
            {session.titre}
          </h2>
        </div>
        <span className="shrink-0 rounded-full bg-black/5 px-3 py-1.5 text-xs font-semibold tracking-[0.08em] text-noir sm:px-3.5 sm:py-2">
          {reste <= 0 ? "Aujourd'hui" : `J-${reste}`}
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-1.5 text-sm font-semibold text-noir sm:text-base">
        <p className="flex items-center gap-2">
          <Clock aria-hidden className="size-4 shrink-0 text-accent" />
          <span>
            <span className="first-letter:uppercase">{formaterJourIso(session.jour)}</span>
            <span className="mx-2">·</span>
            {formaterHoraires(session.debut, session.fin)}
          </span>
        </p>
        <p className="flex items-center gap-2">
          <Video aria-hidden className="size-4 shrink-0 text-accent" />
          En visioconférence
        </p>
      </div>

      {session.description ? (
        <p className="mt-4 line-clamp-3 whitespace-pre-line text-sm leading-relaxed">{session.description}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        {session.lienVisio ? (
          <a href={session.lienVisio} target="_blank" rel="noopener noreferrer" className="btn btn-principal w-full gap-2 sm:w-auto">
            <Video aria-hidden className="size-5" />
            Rejoindre la visioconférence
            <span className="sr-only"> (s&apos;ouvre dans un nouvel onglet)</span>
          </a>
        ) : null}
        <Link
          href={`/sessions/${session.id}`}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-[0.9rem] border border-black/25 px-5 font-semibold text-noir hover:bg-black/5 sm:w-auto"
        >
          Voir la session →
        </Link>
      </div>
    </section>
  );
}

/** Pendant le chargement : le cadre de la carte avec des lignes grisées. */
export function JourneeAccueilChargement() {
  return (
    <section className="accueil-carte p-5 sm:p-7" role="status" aria-live="polite">
      <span className="sr-only">Chargement de la prochaine session…</span>
      <p className="text-sm">Prochaine session</p>
      <div className="mt-2 flex flex-col gap-4 motion-safe:animate-pulse">
        <div className="h-9 w-3/4 rounded bg-black/10" />
        <div className="h-5 w-1/2 rounded bg-black/10" />
        <div className="h-5 w-1/3 rounded bg-black/10" />
        <div className="h-11 w-60 rounded-[0.9rem] bg-black/10" />
      </div>
    </section>
  );
}
