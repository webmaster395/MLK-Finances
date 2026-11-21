import Link from "next/link";
import { BookOpen, CalendarDays, ChevronRight, Paperclip } from "lucide-react";
import { EtatVide } from "@/components/coquille/etat-vide";
import { lireCours } from "@/lib/donnees/cours";

const pluriel = (n: number, un: string, plusieurs: string) => `${n} ${n > 1 ? plusieurs : un}`;

/** Liste des modules de la personne. Lit ses données : à placer sous <Suspense>. */
export async function ListeCours() {
  const cours = await lireCours();

  if (cours.length === 0) {
    return (
      <EtatVide
        icone={BookOpen}
        titre="Aucun cours pour le moment"
        texte="Les modules de votre parcours apparaîtront ici dès qu'ils seront publiés."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {cours.map((c, i) => (
        <li key={c.id}>
          <Link
            href={`/cours/${c.id}`}
            className="accueil-carte group flex items-center gap-4 p-4 transition-shadow hover:shadow-md sm:gap-5 sm:p-5"
          >
            <span
              aria-hidden
              className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-rose-clair font-titre text-4xl font-bold leading-none text-noir sm:size-[4.5rem]"
            >
              {i + 1}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="titre-charte text-2xl !leading-tight">{c.titre}</span>
              {c.description ? <span className="line-clamp-2 text-sm font-semibold">{c.description}</span> : null}
              <span className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-noir">
                <span className="flex items-center gap-1.5">
                  <CalendarDays aria-hidden className="size-4" />
                  {pluriel(c.nbSeances, "séance", "séances")}
                </span>
                <span className="flex items-center gap-1.5">
                  <Paperclip aria-hidden className="size-4" />
                  {pluriel(c.nbSupports, "support", "supports")}
                </span>
              </span>
            </span>
            <ChevronRight aria-hidden className="size-6 shrink-0 text-noir transition-transform group-hover:translate-x-0.5" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Squelette pendant le chargement de la liste. */
export function ListeCoursChargement() {
  return (
    <div className="flex flex-col gap-2" role="status" aria-live="polite">
      <span className="sr-only">Chargement des cours…</span>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-28 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
      ))}
    </div>
  );
}
