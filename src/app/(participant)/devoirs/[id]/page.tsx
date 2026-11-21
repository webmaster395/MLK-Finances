import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, BookOpen, CalendarClock, CalendarDays, Download, FileText, TriangleAlert } from "lucide-react";
import { BadgeStatut } from "@/components/devoirs/badge-statut";
import { FormulaireDepot } from "@/components/devoirs/formulaire-depot";
import { PastilleRubrique } from "@/components/seances/pastille-rubrique";
import { obtenirPersonne } from "@/lib/auth/personne";
import { lireDevoir } from "@/lib/donnees/devoirs";
import { depotPossible } from "@/lib/devoirs";
import { formaterCreneau, formaterJourIso } from "@/lib/format";

export const metadata: Metadata = { title: "Devoir" };

export default function Page({ params, searchParams }: PageProps<"/devoirs/[id]">) {
  // L'identifiant, l'adresse et les données de la personne sont lus à chaque requête : sous <Suspense>.
  return (
    <div className="flex flex-col gap-6">
      <Link href="/devoirs" className="flex w-fit items-center gap-2 font-semibold text-noir underline-offset-2 hover:underline">
        <ArrowLeft aria-hidden className="size-5" />
        Tous les devoirs
      </Link>
      <Suspense fallback={<DetailChargement />}>
        <Detail params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Detail({
  params,
  searchParams,
}: {
  params: PageProps<"/devoirs/[id]">["params"];
  searchParams: PageProps<"/devoirs/[id]">["searchParams"];
}) {
  const { id } = await params;
  const { erreur } = await searchParams;
  const [devoir, personne] = await Promise.all([lireDevoir(id), obtenirPersonne()]);
  if (!devoir) notFound();

  return (
    <article className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <BadgeStatut statut={devoir.statut} />
          {devoir.seance?.rubrique ? <PastilleRubrique rubrique={devoir.seance.rubrique} /> : null}
        </div>
        <h1 className="titre-charte text-4xl sm:text-5xl">
          <span className="pinceau">{devoir.titre}</span>
        </h1>
      </div>

      {erreur === "fichier" ? (
        <p role="alert" className="flex items-start gap-3 rounded-md bg-orange/15 px-4 py-3 font-semibold text-[#8f3306]">
          <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
          Votre fichier n&apos;est pas disponible pour le moment. Réessayez ou déposez-le à nouveau.
        </p>
      ) : null}

      <section className="accueil-carte flex flex-col gap-3 p-5 sm:p-6" aria-label="Informations">
        {devoir.echeance ? (
          <p className="flex items-start gap-3 font-semibold text-noir">
            <CalendarClock aria-hidden className="mt-0.5 size-5 shrink-0" />
            <span>À rendre pour le {formaterCreneau(devoir.echeance).replace(/^./, (c) => c.toLowerCase())} (heure de Paris)</span>
          </p>
        ) : null}
        {devoir.seance ? (
          <p className="flex items-start gap-3 font-semibold text-noir">
            <CalendarDays aria-hidden className="mt-0.5 size-5 shrink-0" />
            <span>
              <Link href={`/sessions/${devoir.seance.id}`} className="underline underline-offset-2">
                {devoir.cours?.titre ?? devoir.seance.titre}
              </Link>
              <span> — séance du {formaterJourIso(devoir.seance.jour, true)}</span>
            </span>
          </p>
        ) : devoir.cours ? (
          <p className="flex items-start gap-3 font-semibold text-noir">
            <BookOpen aria-hidden className="mt-0.5 size-5 shrink-0" />
            <Link href={`/cours/${devoir.cours.id}`} className="underline underline-offset-2">
              {devoir.cours.titre}
            </Link>
          </p>
        ) : null}
      </section>

      {devoir.consigne ? (
        <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-consigne">
          <h2 id="titre-consigne" className="titre-charte mb-2 text-2xl">
            Consigne
          </h2>
          <p className="whitespace-pre-line font-semibold">{devoir.consigne}</p>
        </section>
      ) : null}

      <section className="accueil-carte flex flex-col gap-4 p-5 sm:p-6" aria-labelledby="titre-depot">
        <h2 id="titre-depot" className="titre-charte text-2xl">
          Mon dépôt
        </h2>

        {devoir.rendu ? (
          <div className="flex flex-wrap items-center gap-3 rounded-lg bg-black/5 p-3">
            <FileText aria-hidden className="size-6 shrink-0 text-noir" />
            <div className="min-w-0 flex-1 text-sm font-semibold text-noir">
              <p className="[overflow-wrap:anywhere]">{devoir.rendu.nom_fichier ?? "Fichier déposé"}</p>
              <p className="font-normal">
                Déposé le {formaterCreneau(devoir.rendu.depose_le).replace(/^./, (c) => c.toLowerCase())}
                {devoir.enRetard ? " — après la date limite" : ""}
              </p>
            </div>
            <a href={`/devoirs/${devoir.id}/telecharger`} className="btn btn-rose min-h-10 gap-2 px-4 text-sm">
              <Download aria-hidden className="size-4" />
              Télécharger
            </a>
          </div>
        ) : (
          <p className="font-semibold">Vous n&apos;avez pas encore déposé de fichier pour ce devoir.</p>
        )}

        {depotPossible(devoir.statut) ? (
          <FormulaireDepot devoirId={devoir.id} participantId={personne.id} remplacement={Boolean(devoir.rendu)} />
        ) : (
          <p className="font-semibold">Ce devoir a été corrigé : votre dépôt ne peut plus être modifié.</p>
        )}
      </section>
    </article>
  );
}

function DetailChargement() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-live="polite">
      <span className="sr-only">Chargement du devoir…</span>
      <div className="h-12 w-2/3 max-w-lg rounded-md bg-black/10 motion-safe:animate-pulse" />
      <div className="h-24 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
      <div className="h-48 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
    </div>
  );
}
