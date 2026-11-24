import Link from "next/link";
import { ClipboardList, Package } from "lucide-react";
import { lireProchaineSession } from "@/lib/donnees/sessions";

/**
 * « À préparer » : les travaux à faire avant la prochaine session et le matériel à prévoir.
 * Rien n'est à rendre : c'est un rappel. Lit les données de la personne : sous <Suspense>.
 */
export async function TravailAFaire() {
  const prochaine = await lireProchaineSession();
  const session = prochaine?.session ?? null;
  const avant = session?.travauxAvant.trim() ?? "";
  const materiel = session?.materiel.trim() ?? "";

  return (
    <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-travail">
      <h2 id="titre-travail" className="titre-charte flex items-center gap-2.5 text-xl sm:text-2xl">
        <ClipboardList aria-hidden className="size-5 text-accent" />
        À préparer
      </h2>

      {session && (avant || materiel) ? (
        <>
          <p className="mt-1 text-xs">Pour la prochaine session</p>
          {avant ? (
            <div className="mt-3">
              <h3 className="text-sm font-semibold text-noir">Travaux avant la session</h3>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed [overflow-wrap:anywhere]">{avant}</p>
            </div>
          ) : null}
          {materiel ? (
            <div className="mt-3">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-noir">
                <Package aria-hidden className="size-4 text-accent" />
                Matériel à prévoir
              </h3>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed [overflow-wrap:anywhere]">{materiel}</p>
            </div>
          ) : null}
          <Link href={`/sessions/${session.id}`} className="mt-3 inline-block text-sm font-semibold text-noir underline underline-offset-2">
            Voir la session →
          </Link>
        </>
      ) : (
        <p className="mt-3 text-sm font-semibold">Rien à préparer pour la prochaine session.</p>
      )}
    </section>
  );
}

export function TravailAFaireChargement() {
  return (
    <section className="accueil-carte p-5 sm:p-6" role="status" aria-live="polite">
      <span className="sr-only">Chargement du travail à préparer…</span>
      <h2 className="titre-charte flex items-center gap-2.5 text-2xl">
        <ClipboardList aria-hidden className="size-5 text-accent" />
        À préparer
      </h2>
      <div className="mt-3 flex flex-col gap-3 motion-safe:animate-pulse">
        <div className="h-10 w-full rounded bg-black/10" />
        <div className="h-10 w-full rounded bg-black/10" />
      </div>
    </section>
  );
}
