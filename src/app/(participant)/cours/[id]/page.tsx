import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, CalendarDays, CircleCheck, Download, ExternalLink, MapPin } from "lucide-react";
import { formaterHoraires, partiesDate } from "@/lib/format";
import { lireCoursDetail } from "@/lib/donnees/cours";

export const metadata: Metadata = { title: "Cours" };

export default function Page({ params }: PageProps<"/cours/[id]">) {
  // L'identifiant et les données du cours sont lus à chaque requête : sous <Suspense>.
  return (
    <div className="flex flex-col gap-6">
      <Link href="/sessions" className="flex w-fit items-center gap-2 font-semibold text-noir underline-offset-2 hover:underline">
        <ArrowLeft aria-hidden className="size-5" />
        Retour au calendrier
      </Link>
      <Suspense fallback={<DetailChargement />}>
        <Detail params={params} />
      </Suspense>
    </div>
  );
}

async function Detail({ params }: { params: PageProps<"/cours/[id]">["params"] }) {
  const { id } = await params;
  const cours = await lireCoursDetail(id);
  if (!cours) notFound();

  return (
    <article className="flex flex-col gap-6">
      <h1 className="titre-charte text-4xl sm:text-5xl">
        <span className="pinceau">{cours.titre}</span>
      </h1>

      {cours.description ? (
        <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-description">
          <h2 id="titre-description" className="titre-charte mb-2 text-2xl">
            Description
          </h2>
          <p className="whitespace-pre-line font-semibold">{cours.description}</p>
        </section>
      ) : null}

      {cours.objectifs.length > 0 ? (
        <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-objectifs">
          <h2 id="titre-objectifs" className="titre-charte mb-3 text-2xl">
            Objectifs
          </h2>
          <ul className="flex flex-col gap-2">
            {cours.objectifs.map((o) => (
              <li key={o} className="flex items-start gap-3 font-semibold text-noir">
                <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-rose" />
                {o}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="titre-seances" className="flex flex-col gap-3">
        <h2 id="titre-seances" className="titre-charte text-3xl">
          Séances
        </h2>
        {cours.seances.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {cours.seances.map((s) => {
              const { jour, mois } = partiesDate(s.debut);
              return (
                <li key={s.id}>
                  <Link
                    href={`/sessions/${s.id}`}
                    className={`accueil-carte flex items-center gap-4 p-3 transition-shadow hover:shadow-md ${
                      s.passee ? "opacity-80" : ""
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`flex size-14 shrink-0 flex-col items-center justify-center rounded-lg font-titre leading-none text-noir ${
                        s.passee ? "bg-black/10" : "bg-rose-clair"
                      }`}
                    >
                      <span className="text-2xl font-bold">{jour}</span>
                      <span className="mt-0.5 text-xs uppercase tracking-wide">{mois}</span>
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5 text-sm font-semibold">
                      <span className="titre-charte text-xl !leading-tight">{s.titre}</span>
                      <span>
                        {formaterHoraires(s.debut, s.fin)}
                        {s.passee ? " · passée" : ""}
                      </span>
                      {s.lieu ? (
                        <span className="flex items-center gap-1.5">
                          <MapPin aria-hidden className="size-3.5" />
                          {s.lieu}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="flex items-center gap-2 font-semibold">
            <CalendarDays aria-hidden className="size-5" />
            Aucune séance n&apos;est encore planifiée pour ce module.
          </p>
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
          <p className="font-semibold">Aucun support pour ce module pour le moment.</p>
        )}
      </section>
    </article>
  );
}

function DetailChargement() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-live="polite">
      <span className="sr-only">Chargement du cours…</span>
      <div className="h-12 w-2/3 max-w-lg rounded-md bg-black/10 motion-safe:animate-pulse" />
      <div className="h-32 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
      <div className="h-40 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
    </div>
  );
}
