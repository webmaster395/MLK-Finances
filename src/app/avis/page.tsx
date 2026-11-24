import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Quote } from "lucide-react";
import { Logo } from "@/components/logo";
import { lireTemoignagesPublics } from "@/lib/donnees/temoignages";

export const metadata: Metadata = { title: "Ils ont suivi le parcours" };

/**
 * Page publique (sans compte) : les témoignages que l'équipe a choisi de montrer à tout le monde.
 * Seul le prénom est affiché. Lit la base : le contenu est sous <Suspense>.
 */
export default function Page() {
  return (
    <main id="contenu" className="flex flex-1 flex-col items-center bg-fond px-4 py-8 sm:py-12">
      <div className="flex w-full max-w-5xl flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Logo lien="/connexion" compact />
          <Link href="/connexion" className="btn btn-principal min-h-11">
            Se connecter
          </Link>
        </div>

        <header>
          <h1 className="titre-charte text-3xl sm:text-5xl">Ils ont suivi le parcours</h1>
          <p className="mt-2 font-titre text-xl font-medium tracking-wide text-doux sm:text-3xl">
            (Re)prendre le contrôle de mes finances
          </p>
        </header>

        <Suspense fallback={<Chargement />}>
          <Liste />
        </Suspense>
      </div>
    </main>
  );
}

async function Liste() {
  const temoignages = await lireTemoignagesPublics();

  if (temoignages.length === 0) {
    return (
      <p className="accueil-carte p-6 font-semibold">
        Les témoignages des participants apparaîtront ici très bientôt.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {temoignages.map((t) => (
        <li key={t.id}>
          <article className="accueil-carte flex h-full flex-col justify-between gap-5 p-5 sm:p-6">
            <div className="flex flex-col gap-4">
              <span aria-hidden className="flex size-12 items-center justify-center rounded-[0.9rem] bg-accent-clair text-noir">
                <Quote className="size-6" strokeWidth={1.75} />
              </span>
              <blockquote className="whitespace-pre-line text-sm font-semibold leading-relaxed text-noir sm:text-base [overflow-wrap:anywhere]">
                « {t.texte} »
              </blockquote>
            </div>
            <footer className="border-t border-black/10 pt-4">
              <cite className="text-sm font-semibold not-italic text-noir [overflow-wrap:anywhere]">{t.prenom}</cite>
            </footer>
          </article>
        </li>
      ))}
    </ul>
  );
}

function Chargement() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" role="status" aria-live="polite">
      <span className="sr-only">Chargement des témoignages…</span>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-48 rounded-[1.25rem] bg-black/10 motion-safe:animate-pulse" />
      ))}
    </div>
  );
}
