import Link from "next/link";
import { CalendarDays, Download, ExternalLink, FileText, FolderOpen, Link2, TriangleAlert } from "lucide-react";
import { EtatVide } from "@/components/coquille/etat-vide";
import { couleurSeance, PastilleRubrique } from "@/components/seances/pastille-rubrique";
import { lireRessourcesParCours, type Ressource } from "@/lib/donnees/ressources";
import type { Rubrique } from "@/lib/donnees/sessions";
import { formaterJourIso } from "@/lib/format";

function LigneRessource({ ressource, rubrique }: { ressource: Ressource; rubrique: Rubrique | null }) {
  const estLien = ressource.type === "lien" && ressource.url;
  const Icone = estLien ? Link2 : FileText;

  return (
    <li
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-l-4 border-black/15 bg-white/40 p-4 sm:gap-4"
      style={{ borderLeftColor: couleurSeance(rubrique) }}
    >
      <span className="flex min-w-0 flex-1 items-start gap-3">
        <span aria-hidden className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-black/5 text-noir">
          <Icone className="size-4" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-base font-semibold leading-snug text-noir [overflow-wrap:anywhere]">{ressource.titre}</span>
          <span className="text-xs font-semibold">{estLien ? "Lien externe" : "Document à télécharger"}</span>
        </span>
      </span>

      {/* Lien simple (pas de préchargement) : le téléchargement crée un lien signé de 60 secondes à chaque clic */}
      {estLien ? (
        <a href={ressource.url!} target="_blank" rel="noopener noreferrer" className="btn btn-orange min-h-10 gap-2 px-4 text-sm">
          <ExternalLink aria-hidden className="size-4" />
          Ouvrir
          <span className="sr-only"> (s&apos;ouvre dans un nouvel onglet)</span>
        </a>
      ) : (
        <a href={`/ressources/${ressource.id}/telecharger`} className="btn btn-rose min-h-10 gap-2 px-4 text-sm">
          <Download aria-hidden className="size-4" />
          Télécharger
        </a>
      )}
    </li>
  );
}

/** Ressources de la personne, classées par séance / cours. Lit ses données : à placer sous <Suspense>. */
export async function ListeRessources({ erreurFichier }: { erreurFichier?: boolean }) {
  const groupes = await lireRessourcesParCours();

  return (
    <div className="flex flex-col gap-6">
      {erreurFichier ? (
        <p role="alert" className="flex items-start gap-3 rounded-md bg-orange/15 px-4 py-3 font-semibold text-[#8f3306]">
          <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
          Ce fichier n&apos;est pas disponible pour le moment. Réessayez plus tard ou prévenez l&apos;équipe.
        </p>
      ) : null}

      {groupes.length === 0 ? (
        <EtatVide
          icone={FolderOpen}
          titre="Aucune ressource pour le moment"
          texte="Les supports de vos séances (documents et liens utiles) apparaîtront ici dès qu'ils seront publiés."
        />
      ) : (
        groupes.map(({ cours, seance, ressources }) => {
          const cible = seance ? `/sessions/${seance.id}` : `/cours/${cours.id}`;
          return (
            <section key={cours.id} aria-labelledby={`cours-${cours.id}`} className="accueil-carte p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {seance?.rubrique ? <PastilleRubrique rubrique={seance.rubrique} /> : null}
                    {seance ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold">
                        <CalendarDays aria-hidden className="size-3.5 shrink-0" />
                        <span>Séance du {formaterJourIso(seance.jour, true)}</span>
                      </span>
                    ) : (
                      <span className="text-xs font-semibold">Cours</span>
                    )}
                  </div>
                  <h2 id={`cours-${cours.id}`} className="titre-charte text-3xl !leading-tight sm:text-4xl">
                    <Link href={cible} className="underline-offset-4 hover:underline">
                      {cours.titre}
                    </Link>
                  </h2>
                  {seance && seance.titre !== cours.titre ? <p className="text-sm font-semibold">{seance.titre}</p> : null}
                </div>

                <span className="rounded-full bg-black/5 px-3.5 py-1.5 text-xs font-semibold tracking-[0.06em] text-noir">
                  {ressources.length} support{ressources.length > 1 ? "s" : ""}
                </span>
              </div>

              <hr className="my-4 border-black/10" />

              <ul className="flex flex-col gap-3">
                {ressources.map((r) => (
                  <LigneRessource key={r.id} ressource={r} rubrique={seance?.rubrique ?? null} />
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}

/** Squelette pendant le chargement de la liste. */
export function ListeRessourcesChargement() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-live="polite">
      <span className="sr-only">Chargement des ressources…</span>
      {[0, 1].map((i) => (
        <section key={i} className="accueil-carte p-5 sm:p-7">
          <div className="flex flex-col gap-2 motion-safe:animate-pulse">
            <div className="h-5 w-36 rounded-full bg-black/10" />
            <div className="h-9 w-2/3 max-w-md rounded-md bg-black/10" />
          </div>
          <hr className="my-4 border-black/10" />
          <div className="flex flex-col gap-3 motion-safe:animate-pulse">
            <div className="h-20 rounded-lg bg-black/10" />
          </div>
        </section>
      ))}
    </div>
  );
}
