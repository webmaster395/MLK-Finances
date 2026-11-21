import Link from "next/link";
import { CalendarClock, ChevronRight, ClipboardList } from "lucide-react";
import { EtatVide } from "@/components/coquille/etat-vide";
import { lireDevoirs, type DevoirListe } from "@/lib/donnees/devoirs";
import { estAFaire } from "@/lib/devoirs";
import { formaterCreneau } from "@/lib/format";
import { BadgeStatut } from "./badge-statut";

function CarteDevoir({ devoir }: { devoir: DevoirListe }) {
  return (
    <li>
      <Link
        href={`/devoirs/${devoir.id}`}
        className="accueil-carte group flex items-center gap-4 p-4 transition-shadow hover:shadow-md sm:p-5"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="titre-charte text-2xl !leading-tight">{devoir.titre}</span>
            <BadgeStatut statut={devoir.statut} />
          </span>
          {devoir.echeance ? (
            <span className="flex items-center gap-2 text-sm font-semibold text-noir">
              <CalendarClock aria-hidden className="size-4 shrink-0" />
              <span>À rendre pour le {formaterCreneau(devoir.echeance).replace(/^./, (c) => c.toLowerCase())}</span>
            </span>
          ) : null}
          {devoir.cours ? <span className="truncate text-sm">{devoir.cours.titre}</span> : null}
        </span>
        <ChevronRight aria-hidden className="size-6 shrink-0 text-noir transition-transform group-hover:translate-x-0.5" />
      </Link>
    </li>
  );
}

/** Devoirs de la personne : à rendre, puis rendus. Lit ses données : à placer sous <Suspense>. */
export async function ListeDevoirs() {
  const devoirs = await lireDevoirs();
  const aFaire = devoirs.filter((d) => estAFaire(d.statut));
  const rendus = devoirs
    .filter((d) => !estAFaire(d.statut))
    .sort((a, b) => new Date(b.rendu?.depose_le ?? 0).getTime() - new Date(a.rendu?.depose_le ?? 0).getTime());

  if (devoirs.length === 0) {
    return (
      <EtatVide
        icone={ClipboardList}
        titre="Aucun devoir pour le moment"
        texte="Vos devoirs, leur date limite et le dépôt de vos fichiers apparaîtront ici dès qu'ils seront publiés."
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="titre-a-rendre" className="flex flex-col gap-3">
        <h2 id="titre-a-rendre" className="titre-charte text-3xl">
          À rendre
        </h2>
        {aFaire.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {aFaire.map((d) => (
              <CarteDevoir key={d.id} devoir={d} />
            ))}
          </ul>
        ) : (
          <p className="font-semibold">Aucun devoir en attente : tout est rendu.</p>
        )}
      </section>

      {rendus.length > 0 ? (
        <section aria-labelledby="titre-rendus" className="flex flex-col gap-3">
          <h2 id="titre-rendus" className="titre-charte text-3xl">
            Rendus
          </h2>
          <ul className="flex flex-col gap-2">
            {rendus.map((d) => (
              <CarteDevoir key={d.id} devoir={d} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

/** Squelette pendant le chargement de la liste. */
export function ListeDevoirsChargement() {
  return (
    <div className="flex flex-col gap-2" role="status" aria-live="polite">
      <span className="sr-only">Chargement des devoirs…</span>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-24 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
      ))}
    </div>
  );
}
