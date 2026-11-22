import Link from "next/link";
import { CalendarX, MapPin } from "lucide-react";
import { Intervenants } from "@/components/seances/intervenants";
import { couleursSeancesJour } from "@/components/seances/couleur-seance";
import { formaterHoraires, formaterJourIso } from "@/lib/format";
import { lireProchaineJournee } from "@/lib/donnees/sessions";

/** « Prochaine journée » : la frise horaire des séances du prochain jour de formation. Lit les données de la personne : sous <Suspense>. */
export async function JourneeAccueil() {
  const journee = await lireProchaineJournee();

  if (!journee) {
    return (
      <section className="accueil-carte flex flex-col items-center gap-3 p-8 text-center" aria-labelledby="titre-journee">
        <span className="flex size-14 items-center justify-center rounded-full bg-rose-clair text-noir">
          <CalendarX aria-hidden className="size-7" />
        </span>
        <h2 id="titre-journee" className="titre-charte text-3xl">
          Prochaine journée
        </h2>
        <p className="max-w-md font-semibold">
          Aucune journée de formation à venir pour le moment. Elle apparaîtra ici dès qu&apos;elle sera planifiée.
        </p>
      </section>
    );
  }

  const { jour, joursRestants: reste, seances } = journee;
  const premiere = seances[0];
  const derniere = seances[seances.length - 1];
  const couleurs = couleursSeancesJour(seances.map((s) => ({ debut: s.debut, avecCours: Boolean(s.cours) })));

  return (
    <section className="accueil-carte p-5 sm:p-7" aria-labelledby="titre-journee">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs sm:text-sm">Prochaine journée</p>
          <h2 id="titre-journee" className="titre-charte mt-1 text-2xl !leading-tight sm:text-3xl lg:text-4xl">
            Votre prochaine journée de formation
          </h2>
        </div>
        <span className="shrink-0 rounded-full bg-black/5 px-3 py-1.5 text-xs font-semibold tracking-[0.08em] text-noir sm:px-3.5 sm:py-2">
          {reste <= 0 ? "Aujourd'hui" : `J-${reste}`}
        </span>
      </div>

      <p className="mt-3 text-sm font-semibold text-noir sm:text-base">
        <span className="first-letter:uppercase">{formaterJourIso(jour)}</span>
        <span className="mx-2">·</span>
        {formaterHoraires(premiere.debut, derniere.fin ?? derniere.debut)}
      </p>
      {premiere.lieu ? (
        <p className="mt-0.5 flex items-center gap-1.5 text-sm">
          <MapPin aria-hidden className="size-4 shrink-0" />
          {premiere.lieu}
        </p>
      ) : null}

      <ol className="mt-6">
        {seances.map((s, i) => {
          const couleur = couleurs[i];
          const dernierElement = i === seances.length - 1;
          return (
            <li key={s.id}>
              <Link
                href={`/sessions/${s.id}`}
                aria-label={`Ouvrir la séance ${s.titre}`}
                className="group grid grid-cols-[22px_1fr] gap-x-3 rounded-md transition hover:bg-black/5 md:grid-cols-[9.5rem_22px_1fr] md:gap-x-4"
              >
                <p className="col-start-2 row-start-1 text-sm font-semibold text-noir md:col-start-1 md:pt-1 md:text-[0.95rem]">
                  {formaterHoraires(s.debut, s.fin)}
                </p>
                <div className="col-start-1 row-span-2 row-start-1 flex flex-col items-center md:col-start-2 md:row-span-1">
                  <span
                    aria-hidden
                    className="mt-1.5 size-3.5 shrink-0 rounded-full border-[3px] border-carte transition group-hover:scale-110"
                    style={{ background: couleur, boxShadow: `0 0 0 2px ${couleur}` }}
                  />
                  {dernierElement ? null : <span aria-hidden className="w-px flex-1 bg-black/20" />}
                </div>
                <div className="col-start-2 row-start-2 pb-6 pt-1.5 md:col-start-3 md:row-start-1 md:pb-7 md:pt-0">
                  <p className="mt-2 text-sm font-semibold leading-snug text-noir group-hover:underline sm:text-base">
                    {s.cours?.titre ?? s.titre}
                  </p>
                  {s.cours && s.titre !== s.cours.titre ? <p className="mt-0.5 text-sm">{s.titre}</p> : null}
                  {s.intervenants.length > 0 ? (
                    <div className="mt-3">
                      <Intervenants noms={s.intervenants} />
                    </div>
                  ) : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ol>

      <Link href={`/sessions?jour=${jour}`} className="btn btn-orange mt-2 w-full sm:w-auto">
        Voir le programme de la journée →
      </Link>
    </section>
  );
}

/** Pendant le chargement : le cadre de la carte avec des lignes grisées. */
export function JourneeAccueilChargement() {
  return (
    <section className="accueil-carte p-5 sm:p-7" role="status" aria-live="polite">
      <span className="sr-only">Chargement de la prochaine journée…</span>
      <p className="text-sm">Prochaine journée</p>
      <h2 className="titre-charte mt-1 text-3xl !leading-tight sm:text-4xl">Votre prochaine journée de formation</h2>
      <div className="mt-6 flex flex-col gap-5 motion-safe:animate-pulse">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="h-5 w-24 rounded bg-black/10" />
            <div className="flex flex-1 flex-col gap-2">
              <div className="h-5 w-28 rounded-full bg-black/10" />
              <div className="h-5 w-2/3 rounded bg-black/10" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
