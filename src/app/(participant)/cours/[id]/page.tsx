import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  CalendarDays,
  ChevronRight,
  CircleCheck,
  ClipboardList,
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
  Link2,
  MapPin,
} from "lucide-react";
import { BadgeStatut, couleurStatut } from "@/components/devoirs/badge-statut";
import { Intervenants } from "@/components/seances/intervenants";
import { COULEUR_SEANCE, couleursSeancesJour } from "@/components/seances/couleur-seance";
import { formaterCreneau, formaterHoraires, formaterJourIso } from "@/lib/format";
import { lireCoursDetail } from "@/lib/donnees/cours";

export const metadata: Metadata = { title: "Cours" };

export default function Page({ params }: PageProps<"/cours/[id]">) {
  // L'identifiant et les données du cours sont lus à chaque requête : sous <Suspense>.
  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/sessions"
        className="flex w-fit items-center gap-2 text-sm font-semibold text-noir underline-offset-2 hover:underline sm:text-base"
      >
        <ArrowLeft aria-hidden className="size-4 sm:size-5" />
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

  const couleursSeances = couleursSeancesJour(cours.seances.map((s) => ({ debut: s.debut, avecCours: true })));
  const couleur = couleursSeances[0] ?? COULEUR_SEANCE;
  const aPreparer = cours.devoirs.filter((d) => !d.rendu).length;

  return (
    <article className="flex flex-col gap-5">
      <header className="accueil-carte border-l-4 p-5 sm:p-7" style={{ borderLeftColor: couleur }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-noir">
              {cours.seances.length} séance{cours.seances.length > 1 ? "s" : ""}
            </span>
          </div>
          <span className="rounded-full bg-black/5 px-3.5 py-1.5 text-xs font-semibold tracking-[0.06em] text-noir">
            {cours.supports.length} support{cours.supports.length > 1 ? "s" : ""}
          </span>
        </div>

        <h1 className="titre-charte mt-3 text-3xl !leading-tight sm:text-5xl">
          <span className="pinceau">{cours.titre}</span>
        </h1>
      </header>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <div className="flex flex-col gap-5">
          <section className="accueil-carte p-5 sm:p-7" aria-labelledby="titre-description">
            <p className="text-xs sm:text-sm">Contenu pédagogique</p>
            <h2 id="titre-description" className="titre-charte mt-1 text-2xl !leading-tight sm:text-3xl">
              À propos de ce cours
            </h2>

            <hr className="my-4 border-black/10" />

            {cours.description ? (
              <p className="whitespace-pre-line text-sm font-semibold leading-relaxed text-noir sm:text-base">
                {cours.description}
              </p>
            ) : (
              <p className="text-sm font-semibold">Aucune description détaillée pour ce cours.</p>
            )}

            {cours.objectifs.length > 0 ? (
              <div className="mt-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-noir">
                  <BookOpen aria-hidden className="size-4 shrink-0 text-rose" />
                  <span>Objectifs ({cours.objectifs.length})</span>
                </h3>
                <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {cours.objectifs.map((o) => (
                    <li
                      key={o}
                      className="flex items-start gap-2.5 rounded-lg border border-black/15 bg-white/40 p-3.5 text-sm font-semibold text-noir"
                    >
                      <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-rose" />
                      <span className="leading-snug">{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          <section className="accueil-carte p-5 sm:p-7" aria-labelledby="titre-supports">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm">Documents et liens</p>
                <h2 id="titre-supports" className="titre-charte mt-1 flex items-center gap-2.5 text-2xl !leading-tight sm:text-3xl">
                  <FolderOpen aria-hidden className="size-5 text-rose" />
                  Supports de cours
                </h2>
              </div>
              <span className="rounded-full bg-black/5 px-3.5 py-1.5 text-xs font-semibold tracking-[0.06em] text-noir">
                {cours.supports.length} support{cours.supports.length > 1 ? "s" : ""}
              </span>
            </div>

            <hr className="my-4 border-black/10" />

            {cours.supports.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {cours.supports.map((r) => {
                  const estLien = r.type === "lien" && r.url;
                  const Icone = estLien ? Link2 : FileText;
                  return (
                    <li
                      key={r.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-l-4 border-black/15 bg-white/40 p-4"
                      style={{ borderLeftColor: couleur }}
                    >
                      <span className="flex min-w-0 flex-1 items-start gap-3">
                        <span
                          aria-hidden
                          className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-black/5 text-noir"
                        >
                          <Icone className="size-4" />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="text-sm font-semibold leading-snug text-noir sm:text-base [overflow-wrap:anywhere]">
                            {r.titre}
                          </span>
                          <span className="text-xs font-semibold">
                            {estLien ? "Lien externe" : "Document à télécharger"}
                          </span>
                        </span>
                      </span>

                      {estLien ? (
                        <a
                          href={r.url!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-orange min-h-10 gap-2 px-4 text-sm"
                        >
                          <ExternalLink aria-hidden className="size-4" />
                          Ouvrir
                          <span className="sr-only"> (s&apos;ouvre dans un nouvel onglet)</span>
                        </a>
                      ) : (
                        <a
                          href={`/ressources/${r.id}/telecharger`}
                          className="btn btn-rose min-h-10 gap-2 px-4 text-sm"
                        >
                          <Download aria-hidden className="size-4" />
                          Télécharger
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="py-1 text-sm font-semibold">Aucun support pour ce module pour le moment.</p>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-5">
          <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-seances">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm">Calendrier</p>
                <h2 id="titre-seances" className="titre-charte mt-1 text-2xl !leading-tight">
                  Séances du cours
                </h2>
              </div>
              <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-noir">
                {cours.seances.length}
              </span>
            </div>

            <hr className="my-4 border-black/10" />

            {cours.seances.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {cours.seances.map((s, idx) => (
                  <li key={s.id}>
                    <Link
                      href={`/sessions/${s.id}`}
                      className={`group flex flex-col gap-2 rounded-lg border border-l-4 border-black/15 bg-white/40 p-3.5 transition hover:shadow-md ${
                        s.passee ? "opacity-75" : ""
                      }`}
                      style={{ borderLeftColor: couleursSeances[idx] ?? couleur }}
                    >
                      <span className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-noir">
                          <span className="first-letter:uppercase">{formaterJourIso(s.jour)}</span> · {formaterHoraires(s.debut, s.fin)}
                        </span>
                      </span>
                      <span className="text-sm font-semibold leading-snug text-noir group-hover:underline sm:text-base [overflow-wrap:anywhere]">
                        {s.titre}
                      </span>
                      <Intervenants noms={s.intervenants} />
                      {s.lieu ? (
                        <span className="flex items-center gap-1.5 text-xs">
                          <MapPin aria-hidden className="size-3.5 shrink-0" />
                          {s.lieu}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="flex items-center gap-2 py-1 text-sm font-semibold">
                <CalendarDays aria-hidden className="size-4" />
                Aucune séance planifiée pour ce cours.
              </p>
            )}
          </section>

          <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-devoirs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm">Devoirs liés</p>
                <h2 id="titre-devoirs" className="titre-charte mt-1 flex items-center gap-2 text-2xl !leading-tight">
                  <ClipboardList aria-hidden className="size-5 text-rose" />
                  Travail à préparer
                </h2>
              </div>
              {aPreparer > 0 ? (
                <span className="rounded-full bg-[#b42318] px-3 py-1 text-xs font-bold text-white">
                  {aPreparer} à faire
                </span>
              ) : (
                <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-noir">
                  À jour
                </span>
              )}
            </div>

            <hr className="my-4 border-black/10" />

            {cours.devoirs.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {cours.devoirs.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`/devoirs/${d.id}`}
                      className="group flex items-center justify-between gap-3 rounded-lg border border-l-4 border-black/15 bg-white/40 p-3.5 transition hover:shadow-md"
                      style={{ borderLeftColor: couleurStatut(d.statut) }}
                    >
                      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <BadgeStatut statut={d.statut} />
                        <span className="text-sm font-semibold leading-snug text-noir group-hover:underline sm:text-base [overflow-wrap:anywhere]">
                          {d.titre}
                        </span>
                        {d.echeance ? (
                          <span className="flex items-center gap-1.5 text-xs font-semibold">
                            <CalendarClock aria-hidden className="size-3.5 shrink-0" />
                            <span>Pour le {formaterCreneau(d.echeance).replace(/^./, (c) => c.toLowerCase())}</span>
                          </span>
                        ) : null}
                      </span>
                      <ChevronRight
                        aria-hidden
                        className="size-4 shrink-0 text-noir transition-transform group-hover:translate-x-0.5"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-1 text-sm font-semibold">Aucun travail à préparer pour ce cours.</p>
            )}
          </section>
        </aside>
      </div>
    </article>
  );
}

function DetailChargement() {
  return (
    <div className="flex flex-col gap-5" role="status" aria-live="polite">
      <span className="sr-only">Chargement du cours…</span>
      <div className="h-36 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <div className="h-72 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
        <div className="h-52 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
      </div>
    </div>
  );
}
