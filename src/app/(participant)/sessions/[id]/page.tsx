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
  Clock,
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
  Link2,
  MapPin,
} from "lucide-react";
import { BadgeStatut, couleurStatut } from "@/components/devoirs/badge-statut";
import { Intervenants } from "@/components/seances/intervenants";
import { couleurSeance, PastilleRubrique } from "@/components/seances/pastille-rubrique";
import { formaterCreneau, formaterHoraires, formaterJourIso } from "@/lib/format";
import { lireSeance } from "@/lib/donnees/sessions";

export const metadata: Metadata = { title: "Séance" };

export default function Page({ params }: PageProps<"/sessions/[id]">) {
  // L'identifiant et les données de la séance sont lus à chaque requête : sous <Suspense>.
  return (
    <div className="flex flex-col gap-5">
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
  const couleur = couleurSeance(seance.rubrique);
  const titrePrincipal = seance.cours?.titre ?? seance.titre;
  const sousTitreSeance = seance.cours && seance.titre !== seance.cours.titre ? seance.titre : null;
  const devoirs = cours?.devoirs ?? [];
  const supports = cours?.supports ?? [];
  const objectifs = cours?.objectifs ?? [];

  return (
    <article className="flex flex-col gap-5">
      <Link
        href={`/sessions?jour=${seance.jour}`}
        className="flex w-fit items-center gap-2 text-sm font-semibold text-noir underline-offset-2 hover:underline sm:text-base"
      >
        <ArrowLeft aria-hidden className="size-4 sm:size-5" />
        Retour au calendrier
      </Link>

      {/* En-tête de la séance et du cours */}
      <header
        className="accueil-carte border-l-4 p-5 sm:p-7"
        style={{ borderLeftColor: couleur }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <PastilleRubrique rubrique={seance.rubrique} />
            {sousTitreSeance ? (
              <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-noir">
                {sousTitreSeance}
              </span>
            ) : null}
          </div>
          <span className="rounded-full bg-black/5 px-3.5 py-1.5 text-xs font-semibold tracking-[0.06em] text-noir">
            {seance.passee ? "Séance passée" : formaterHoraires(seance.debut, seance.fin)}
          </span>
        </div>

        <h1 className="titre-charte mt-3 text-3xl !leading-tight sm:text-5xl">
          <span className="pinceau">{titrePrincipal}</span>
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-black/10 pt-4 text-sm font-semibold text-noir">
          <span className="flex items-center gap-2">
            <CalendarDays aria-hidden className="size-4 shrink-0 text-rose" />
            <span className="first-letter:uppercase">{formaterJourIso(seance.jour, true)}</span>
          </span>
          <span className="flex items-center gap-2">
            <Clock aria-hidden className="size-4 shrink-0 text-rose" />
            <span>{formaterHoraires(seance.debut, seance.fin)} (heure de Paris)</span>
          </span>
          {seance.lieu ? (
            <span className="flex items-center gap-2">
              <MapPin aria-hidden className="size-4 shrink-0 text-rose" />
              <span>{seance.lieu}</span>
            </span>
          ) : null}
        </div>

        {seance.intervenants.length > 0 ? (
          <div className="mt-3">
            <Intervenants noms={seance.intervenants} />
          </div>
        ) : null}
      </header>

      {/* Grille 2 colonnes dans l'esprit Ministry School : cours & supports à gauche, travail à préparer à droite */}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <div className="flex flex-col gap-5">
          {/* Présentation et objectifs du cours */}
          <section className="accueil-carte p-5 sm:p-7" aria-labelledby="titre-programme">
            <p className="text-xs sm:text-sm">Contenu pédagogique</p>
            <h2 id="titre-programme" className="titre-charte mt-1 text-2xl !leading-tight sm:text-3xl">
              À propos de ce cours
            </h2>

            <hr className="my-4 border-black/10" />

            <div className="flex flex-col gap-3">
              {cours?.description ? (
                <p className="whitespace-pre-line text-sm font-semibold leading-relaxed text-noir sm:text-base">
                  {cours.description}
                </p>
              ) : null}
              {seance.description ? (
                <p className="whitespace-pre-line text-sm font-semibold leading-relaxed">
                  {seance.description}
                </p>
              ) : null}
              {!cours?.description && !seance.description ? (
                <p className="text-sm font-semibold">Aucune description détaillée pour cette séance.</p>
              ) : null}
            </div>

            {objectifs.length > 0 ? (
              <div className="mt-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-noir">
                  <BookOpen aria-hidden className="size-4 shrink-0 text-rose" />
                  <span>Objectifs de la séance ({objectifs.length})</span>
                </h3>
                <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {objectifs.map((o) => (
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

          {/* Supports de cours */}
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
                {supports.length} support{supports.length > 1 ? "s" : ""}
              </span>
            </div>

            <hr className="my-4 border-black/10" />

            {supports.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {supports.map((r) => {
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
              <p className="py-1 text-sm font-semibold">Aucun support publié pour cette séance pour le moment.</p>
            )}
          </section>
        </div>

        {/* Colonne de droite : Travail à préparer */}
        <aside className="flex flex-col gap-5">
          <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-devoirs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm">Devoirs liés</p>
                <h2 id="titre-devoirs" className="titre-charte mt-1 flex items-center gap-2 text-2xl !leading-tight">
                  <ClipboardList aria-hidden className="size-5 text-rose" />
                  Travail à préparer
                </h2>
              </div>
              {seance.aPreparer > 0 ? (
                <span className="rounded-full bg-[#b42318] px-3 py-1 text-xs font-bold text-white">
                  {seance.aPreparer} à faire
                </span>
              ) : (
                <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-noir">
                  À jour
                </span>
              )}
            </div>

            <hr className="my-4 border-black/10" />

            {devoirs.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {devoirs.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`/devoirs/${d.id}`}
                      className="group flex items-center justify-between gap-3 rounded-lg border border-l-4 border-black/15 bg-white/40 p-3.5 transition hover:shadow-md"
                      style={{ borderLeftColor: couleurStatut(d.statut) }}
                    >
                      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <span className="flex flex-wrap items-center justify-between gap-2">
                          <BadgeStatut statut={d.statut} />
                        </span>
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
              <p className="py-1 text-sm font-semibold">Aucun travail à préparer pour cette séance.</p>
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
      <span className="sr-only">Chargement de la séance…</span>
      <div className="h-6 w-48 rounded-md bg-black/10 motion-safe:animate-pulse" />
      <div className="h-44 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <div className="h-72 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
        <div className="h-52 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
      </div>
    </div>
  );
}
