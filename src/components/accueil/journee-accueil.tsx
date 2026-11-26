import Link from "next/link";
import { Clock, Video } from "lucide-react";
import { formaterHoraires, formaterJourIso } from "@/lib/format";
import { lireProchaineSession } from "@/lib/donnees/sessions";

const CADRE = "rounded-[1.25rem] bg-[#0b0b10] p-5 text-white shadow-md sm:p-8";
const SURTITRE = "text-[11px] font-semibold tracking-[0.18em] text-white/70";

/** En-tête de l'accueil : la prochaine session (date, visioconférence). Lit les données de la personne : sous <Suspense>. */
export async function JourneeAccueil() {
  const prochaine = await lireProchaineSession();

  if (!prochaine) {
    return (
      <section className={CADRE} aria-labelledby="titre-journee">
        <p className={SURTITRE}>PROCHAINE SESSION</p>
        <h2 id="titre-journee" className="titre-charte mt-2 text-3xl !text-white sm:text-5xl">
          Aucune session à venir
        </h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-white/80">Elle apparaîtra ici dès qu&apos;elle sera planifiée.</p>
      </section>
    );
  }

  const { session, joursRestants: reste } = prochaine;

  return (
    <section className={CADRE} aria-labelledby="titre-journee">
      <div className="flex items-center justify-between gap-4">
        <p className={SURTITRE}>PROCHAINE SESSION</p>
        <span className="shrink-0 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-[0.08em] text-white">
          {reste <= 0 ? "Aujourd'hui" : `J-${reste}`}
        </span>
      </div>
      <h2 id="titre-journee" className="titre-charte mt-2 max-w-3xl text-3xl !leading-[1.05] !text-white sm:text-5xl [overflow-wrap:anywhere]">
        {session.titre}
      </h2>

      <div className="mt-4 flex flex-col gap-1.5 text-sm font-semibold text-white/90 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:text-base">
        <p className="flex items-center gap-2">
          <Clock aria-hidden className="size-4 shrink-0" />
          <span>
            <span className="first-letter:uppercase">{formaterJourIso(session.jour)}</span>
            <span className="mx-2">·</span>
            {formaterHoraires(session.debut, session.fin)}
          </span>
        </p>
        <p className="flex items-center gap-2">
          <Video aria-hidden className="size-4 shrink-0" />
          En visioconférence
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {session.lienVisio ? (
          <a href={session.lienVisio} target="_blank" rel="noopener noreferrer" className="btn btn-accent w-full gap-2 sm:w-auto">
            <Video aria-hidden className="size-5" />
            Rejoindre la visioconférence
            <span className="sr-only"> (s&apos;ouvre dans un nouvel onglet)</span>
          </a>
        ) : null}
        <Link
          href={`/sessions/${session.id}`}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-[0.9rem] border border-white/35 px-5 font-semibold text-white hover:bg-white/10 sm:w-auto"
        >
          Voir la session →
        </Link>
      </div>
    </section>
  );
}

/** Pendant le chargement : le cadre de l'en-tête avec des lignes grisées. */
export function JourneeAccueilChargement() {
  return (
    <section className={CADRE} role="status" aria-live="polite">
      <span className="sr-only">Chargement de la prochaine session…</span>
      <p className={SURTITRE}>PROCHAINE SESSION</p>
      <div className="mt-3 flex flex-col gap-4 motion-safe:animate-pulse">
        <div className="h-9 w-3/4 rounded bg-white/15" />
        <div className="h-5 w-1/2 rounded bg-white/15" />
        <div className="h-11 w-60 rounded-[0.9rem] bg-white/15" />
      </div>
    </section>
  );
}
