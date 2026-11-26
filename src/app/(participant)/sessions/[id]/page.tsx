import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CircleCheck,
  ClipboardList,
  Clock,
  Download,
  ExternalLink,
  FileText,
  FolderOpen,
  Link2,
  Package,
  Video,
  type LucideIcon,
} from "lucide-react";
import { couleurSeance } from "@/components/seances/couleur-seance";
import { formaterHoraires, formaterJourIso } from "@/lib/format";
import { lireSeance } from "@/lib/donnees/sessions";

export const metadata: Metadata = { title: "Session" };

export default function Page({ params }: PageProps<"/sessions/[id]">) {
  // L'identifiant et les données de la session sont lus à chaque requête : sous <Suspense>.
  return (
    <div className="flex flex-col gap-5">
      <Suspense fallback={<DetailChargement />}>
        <Detail params={params} />
      </Suspense>
    </div>
  );
}

/** Un bloc de texte libre de la session (travaux avant, après, matériel). */
function BlocTexte({ id, icone: Icone, surTitre, titre, texte, vide }: {
  id: string;
  icone: LucideIcon;
  surTitre: string;
  titre: string;
  texte: string;
  vide: string;
}) {
  return (
    <section className="accueil-carte p-5 sm:p-6" aria-labelledby={id}>
      <p className="text-xs sm:text-sm">{surTitre}</p>
      <h2 id={id} className="titre-charte mt-1 flex items-center gap-2 text-xl !leading-tight sm:text-2xl">
        <Icone aria-hidden className="size-5 shrink-0 text-accent" />
        {titre}
      </h2>
      <hr className="my-4 border-black/10" />
      {texte.trim() ? (
        <p className="whitespace-pre-line text-sm font-semibold leading-relaxed text-noir [overflow-wrap:anywhere] sm:text-base">{texte}</p>
      ) : (
        <p className="text-sm font-semibold">{vide}</p>
      )}
    </section>
  );
}

async function Detail({ params }: { params: PageProps<"/sessions/[id]">["params"] }) {
  const { id } = await params;
  const seance = await lireSeance(id);
  if (!seance) notFound();

  const couleur = couleurSeance({ debut: seance.debut });
  const { documents, objectifs } = seance;

  return (
    <article className="flex flex-col gap-5">
      <Link
        href={`/sessions?jour=${seance.jour}`}
        className="flex w-fit items-center gap-2 text-sm font-semibold text-noir underline-offset-2 hover:underline sm:text-base"
      >
        <ArrowLeft aria-hidden className="size-4 sm:size-5" />
        Retour au calendrier
      </Link>

      {/* En-tête : titre, date, visioconférence */}
      <header className="rounded-[1.25rem] bg-[#0b0b10] p-5 text-white shadow-md sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-white/70">SESSION</p>
          <span className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-semibold tracking-[0.06em] text-white">
            {seance.passee ? "Session passée" : formaterHoraires(seance.debut, seance.fin)}
          </span>
        </div>

        <h1 className="titre-charte mt-3 text-3xl !leading-[1.05] !text-white sm:text-5xl [overflow-wrap:anywhere]">{seance.titre}</h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/15 pt-4 text-sm font-semibold text-white/90">
          <span className="flex items-center gap-2">
            <CalendarDays aria-hidden className="size-4 shrink-0" />
            <span className="first-letter:uppercase">{formaterJourIso(seance.jour, true)}</span>
          </span>
          <span className="flex items-center gap-2">
            <Clock aria-hidden className="size-4 shrink-0" />
            <span>{formaterHoraires(seance.debut, seance.fin)} (heure de Paris)</span>
          </span>
          <span className="flex items-center gap-2">
            <Video aria-hidden className="size-4 shrink-0" />
            <span>En visioconférence</span>
          </span>
        </div>

        {seance.lienVisio && !seance.passee ? (
          <a
            href={seance.lienVisio}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-accent mt-5 w-full gap-2 sm:w-auto"
          >
            <Video aria-hidden className="size-5" />
            Rejoindre la visioconférence
            <span className="sr-only"> (s&apos;ouvre dans un nouvel onglet)</span>
          </a>
        ) : !seance.passee ? (
          <p className="mt-4 text-sm font-semibold">Le lien de la visioconférence sera communiqué avant la session.</p>
        ) : null}
      </header>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <div className="flex flex-col gap-5">
          {/* Présentation et objectifs */}
          <section className="accueil-carte p-5 sm:p-7" aria-labelledby="titre-programme">
            <p className="text-xs sm:text-sm">Contenu de la session</p>
            <h2 id="titre-programme" className="titre-charte mt-1 text-2xl !leading-tight sm:text-3xl">
              À propos de cette session
            </h2>

            <hr className="my-4 border-black/10" />

            {seance.description ? (
              <p className="whitespace-pre-line text-sm font-semibold leading-relaxed text-noir sm:text-base">{seance.description}</p>
            ) : (
              <p className="text-sm font-semibold">Aucune description détaillée pour cette session.</p>
            )}

            {objectifs.length > 0 ? (
              <div className="mt-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-noir">
                  <BookOpen aria-hidden className="size-4 shrink-0 text-accent" />
                  <span>Objectifs de la session ({objectifs.length})</span>
                </h3>
                <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {objectifs.map((o) => (
                    <li
                      key={o}
                      className="flex items-start gap-2.5 rounded-lg border border-black/15 bg-white/40 p-3.5 text-sm font-semibold text-noir"
                    >
                      <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
                      <span className="leading-snug">{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          {/* Documents : PDF à télécharger ou liens (Canva…) */}
          <section className="accueil-carte p-5 sm:p-7" aria-labelledby="titre-documents">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm">PDF et liens</p>
                <h2 id="titre-documents" className="titre-charte mt-1 flex items-center gap-2.5 text-2xl !leading-tight sm:text-3xl">
                  <FolderOpen aria-hidden className="size-5 text-accent" />
                  Documents
                </h2>
              </div>
              <span className="rounded-full bg-black/5 px-3.5 py-1.5 text-xs font-semibold tracking-[0.06em] text-noir">
                {documents.length} document{documents.length > 1 ? "s" : ""}
              </span>
            </div>

            <hr className="my-4 border-black/10" />

            {documents.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {documents.map((r) => {
                  const estLien = r.type === "lien" && r.url;
                  const Icone = estLien ? Link2 : FileText;
                  return (
                    <li
                      key={r.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-l-4 border-black/15 bg-white/40 p-4"
                      style={{ borderLeftColor: couleur }}
                    >
                      <span className="flex min-w-0 flex-1 items-start gap-3">
                        <span aria-hidden className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-black/5 text-noir">
                          <Icone className="size-4" />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="text-sm font-semibold leading-snug text-noir sm:text-base [overflow-wrap:anywhere]">{r.titre}</span>
                          <span className="text-xs font-semibold">{estLien ? "Lien (Canva…)" : "PDF à télécharger"}</span>
                        </span>
                      </span>

                      {estLien ? (
                        <a href={r.url!} target="_blank" rel="noopener noreferrer" className="btn btn-principal min-h-10 gap-2 px-4 text-sm">
                          <ExternalLink aria-hidden className="size-4" />
                          Ouvrir
                          <span className="sr-only"> (s&apos;ouvre dans un nouvel onglet)</span>
                        </a>
                      ) : (
                        <a href={`/ressources/${r.id}/telecharger`} className="btn btn-accent min-h-10 gap-2 px-4 text-sm">
                          <Download aria-hidden className="size-4" />
                          Télécharger
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="py-1 text-sm font-semibold">Aucun document publié pour cette session pour le moment.</p>
            )}
          </section>
        </div>

        {/* Colonne de droite : travaux et matériel */}
        <aside className="flex flex-col gap-5">
          <BlocTexte
            id="titre-avant"
            icone={ClipboardList}
            surTitre="À faire avant la session"
            titre="Travaux avant"
            texte={seance.travauxAvant}
            vide="Rien à préparer avant cette session."
          />
          <BlocTexte
            id="titre-apres"
            icone={CalendarCheck}
            surTitre="À faire après la session"
            titre="Travaux après"
            texte={seance.travauxApres}
            vide="Rien à faire après cette session."
          />
          <BlocTexte
            id="titre-materiel"
            icone={Package}
            surTitre="Pour la session"
            titre="Matériel à prévoir"
            texte={seance.materiel}
            vide="Aucun matériel particulier."
          />
        </aside>
      </div>
    </article>
  );
}

function DetailChargement() {
  return (
    <div className="flex flex-col gap-5" role="status" aria-live="polite">
      <span className="sr-only">Chargement de la session…</span>
      <div className="h-6 w-48 rounded-md bg-black/10 motion-safe:animate-pulse" />
      <div className="h-44 rounded-[1.25rem] bg-black/10 motion-safe:animate-pulse" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <div className="h-72 rounded-[1.25rem] bg-black/10 motion-safe:animate-pulse" />
        <div className="h-52 rounded-[1.25rem] bg-black/10 motion-safe:animate-pulse" />
      </div>
    </div>
  );
}
