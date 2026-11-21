import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, BookOpen, CalendarDays, Clock, MapPin } from "lucide-react";
import { formaterHoraires, formaterJourComplet } from "@/lib/format";
import { lireSession } from "@/lib/donnees/sessions";

export const metadata: Metadata = { title: "Session" };

export default function Page({ params }: PageProps<"/sessions/[id]">) {
  // L'identifiant et les données de la session sont lus à chaque requête : sous <Suspense>.
  return (
    <div className="flex flex-col gap-6">
      <Link href="/sessions" className="flex w-fit items-center gap-2 font-semibold text-noir underline-offset-2 hover:underline">
        <ArrowLeft aria-hidden className="size-5" />
        Toutes les sessions
      </Link>
      <Suspense fallback={<DetailChargement />}>
        <Detail params={params} />
      </Suspense>
    </div>
  );
}

async function Detail({ params }: { params: PageProps<"/sessions/[id]">["params"] }) {
  const { id } = await params;
  const session = await lireSession(id);
  if (!session) notFound();

  return (
    <article className="flex flex-col gap-6">
      <div>
        <h1 className="titre-charte text-4xl sm:text-5xl">
          <span className="pinceau">{session.titre}</span>
        </h1>
      </div>

      <section className="accueil-carte flex flex-col gap-4 p-5 sm:p-6" aria-label="Informations pratiques">
        <p className="flex items-start gap-3 font-semibold text-noir">
          <CalendarDays aria-hidden className="mt-0.5 size-5 shrink-0" />
          <span className="first-letter:uppercase">{formaterJourComplet(session.debut)}</span>
        </p>
        <p className="flex items-start gap-3 font-semibold text-noir">
          <Clock aria-hidden className="mt-0.5 size-5 shrink-0" />
          {formaterHoraires(session.debut, session.fin)} (heure de Paris)
        </p>
        {session.lieu ? (
          <p className="flex items-start gap-3 font-semibold text-noir">
            <MapPin aria-hidden className="mt-0.5 size-5 shrink-0" />
            {session.lieu}
          </p>
        ) : null}
        {session.cours ? (
          <p className="flex items-start gap-3 font-semibold text-noir">
            <BookOpen aria-hidden className="mt-0.5 size-5 shrink-0" />
            <Link href={`/cours/${session.cours.id}`} className="underline underline-offset-2">
              {session.cours.titre}
            </Link>
          </p>
        ) : null}
      </section>

      {session.description ? (
        <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-description">
          <h2 id="titre-description" className="titre-charte mb-2 text-2xl">
            Description
          </h2>
          <p className="whitespace-pre-line font-semibold">{session.description}</p>
        </section>
      ) : null}
    </article>
  );
}

function DetailChargement() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-live="polite">
      <span className="sr-only">Chargement de la session…</span>
      <div className="h-12 w-2/3 max-w-lg rounded-md bg-black/10 motion-safe:animate-pulse" />
      <div className="h-40 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
    </div>
  );
}
