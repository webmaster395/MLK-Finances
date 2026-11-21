import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, CalendarDays, CircleCheck, Clock, Download, ExternalLink, MapPin } from "lucide-react";
import { BadgeStatut } from "@/components/devoirs/badge-statut";
import { Intervenants } from "@/components/seances/intervenants";
import { PastilleRubrique } from "@/components/seances/pastille-rubrique";
import { formaterCreneau, formaterHoraires, formaterJourIso } from "@/lib/format";
import { lireSeance } from "@/lib/donnees/sessions";

export const metadata: Metadata = { title: "Séance" };

export default function Page({ params }: PageProps<"/sessions/[id]">) {
  // L'identifiant et les données de la séance sont lus à chaque requête : sous <Suspense>.
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<DetailChargement />}>
        <Detail params={params} />
      </Suspense>
    </div>
  );
}

async function Detail({ params }: { params: PageProps<"/sessions/[id]">["params"] }) {
  const { id } = await params;
  const seance = await lireSeance(id);
  if (!seance) notFound();

  const cours = seance.coursDetail;

  return (
    <article className="flex flex-col gap-6">
      <Link
        href={`/sessions?jour=${seance.jour}`}
        className="flex w-fit items-center gap-2 font-semibold text-noir underline-offset-2 hover:underline"
      >
        <ArrowLeft aria-hidden className="size-5" />
        Retour au calendrier
      </Link>

      <div className="flex flex-col gap-3">
        <div>
          <PastilleRubrique rubrique={seance.rubrique} />
        </div>
        <h1 className="titre-charte text-4xl sm:text-5xl">
          <span className="pinceau">{seance.titre}</span>
        </h1>
      </div>

      <section className="accueil-carte flex flex-col gap-4 p-5 sm:p-6" aria-label="Informations pratiques">
        <p className="flex items-start gap-3 font-semibold text-noir">
          <CalendarDays aria-hidden className="mt-0.5 size-5 shrink-0" />
          <span className="first-letter:uppercase">{formaterJourIso(seance.jour, true)}</span>
        </p>
        <p className="flex items-start gap-3 font-semibold text-noir">
          <Clock aria-hidden className="mt-0.5 size-5 shrink-0" />
          {formaterHoraires(seance.debut, seance.fin)} (heure de Paris)
        </p>
        {seance.lieu ? (
          <p className="flex items-start gap-3 font-semibold text-noir">
            <MapPin aria-hidden className="mt-0.5 size-5 shrink-0" />
            {seance.lieu}
          </p>
        ) : null}
        <Intervenants noms={seance.intervenants} />
      </section>

      {seance.description ? (
        <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-description">
          <h2 id="titre-description" className="titre-charte mb-2 text-2xl">
            Cette séance
          </h2>
          <p className="whitespace-pre-line font-semibold">{seance.description}</p>
        </section>
      ) : null}

      {/* Fiche du cours : le cours est fusionné avec la séance */}
      {seance.cours && cours ? (
        <>
          <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-cours">
            <p className="text-sm">Cours</p>
            <h2 id="titre-cours" className="titre-charte mb-2 text-3xl !leading-tight">
              {seance.cours.titre}
            </h2>
            {cours.description ? <p className="whitespace-pre-line font-semibold">{cours.description}</p> : null}
            {cours.objectifs.length > 0 ? (
              <>
                <h3 className="titre-charte mb-3 mt-5 text-xl">Objectifs</h3>
                <ul className="flex flex-col gap-2">
                  {cours.objectifs.map((o) => (
                    <li key={o} className="flex items-start gap-3 font-semibold text-noir">
                      <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-rose" />
                      {o}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>

          <section aria-labelledby="titre-devoirs" className="flex flex-col gap-3">
            <h2 id="titre-devoirs" className="titre-charte text-3xl">
              Travail à préparer
            </h2>
            {cours.devoirs.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {cours.devoirs.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`/devoirs/${d.id}`}
                      className="accueil-carte flex flex-wrap items-center gap-x-3 gap-y-1 p-4 transition-shadow hover:shadow-md"
                    >
                      <span className="min-w-0 flex-1 font-semibold text-noir [overflow-wrap:anywhere]">{d.titre}</span>
                      <BadgeStatut statut={d.statut} />
                      {d.echeance ? (
                        <span className="w-full text-xs sm:w-auto">pour le {formaterCreneau(d.echeance).replace(/^./, (c) => c.toLowerCase())}</span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-semibold">Aucun travail à préparer pour cette séance.</p>
            )}
          </section>

          <section aria-labelledby="titre-supports" className="flex flex-col gap-3">
            <h2 id="titre-supports" className="titre-charte text-3xl">
              Supports
            </h2>
            {cours.supports.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {cours.supports.map((r) => (
                  <li key={r.id} className="accueil-carte flex items-center gap-3 p-4 font-semibold text-noir">
                    {r.type === "lien" && r.url ? (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-w-0 flex-1 items-center gap-3 underline-offset-2 hover:underline"
                      >
                        <ExternalLink aria-hidden className="size-5 shrink-0" />
                        <span className="min-w-0 truncate">{r.titre}</span>
                        <span className="sr-only"> (s&apos;ouvre dans un nouvel onglet)</span>
                      </a>
                    ) : (
                      <a
                        href={`/ressources/${r.id}/telecharger`}
                        className="flex min-w-0 flex-1 items-center gap-3 underline-offset-2 hover:underline"
                      >
                        <Download aria-hidden className="size-5 shrink-0" />
                        <span className="min-w-0 truncate">{r.titre}</span>
                        <span className="sr-only"> (télécharger le fichier)</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-semibold">Aucun support pour ce cours pour le moment.</p>
            )}
          </section>
        </>
      ) : null}
    </article>
  );
}

function DetailChargement() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-live="polite">
      <span className="sr-only">Chargement de la séance…</span>
      <div className="h-6 w-48 rounded-md bg-black/10 motion-safe:animate-pulse" />
      <div className="h-12 w-2/3 max-w-lg rounded-md bg-black/10 motion-safe:animate-pulse" />
      <div className="h-40 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
    </div>
  );
}
