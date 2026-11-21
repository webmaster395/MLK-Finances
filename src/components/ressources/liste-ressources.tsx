import Link from "next/link";
import { Download, ExternalLink, FileText, FolderOpen, Link2, TriangleAlert } from "lucide-react";
import { EtatVide } from "@/components/coquille/etat-vide";
import { lireRessourcesParCours, type Ressource } from "@/lib/donnees/ressources";

function LigneRessource({ ressource }: { ressource: Ressource }) {
  const estLien = ressource.type === "lien" && ressource.url;
  const Icone = estLien ? Link2 : FileText;

  return (
    <li className="accueil-carte flex flex-wrap items-center gap-3 p-4 sm:gap-4">
      <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full bg-rose-clair text-noir">
        <Icone className="size-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-semibold text-noir [overflow-wrap:anywhere]">{ressource.titre}</span>
        <span className="text-sm">{estLien ? "Lien" : "Fichier"}</span>
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

/** Ressources de la personne, par module. Lit ses données : à placer sous <Suspense>. */
export async function ListeRessources({ erreurFichier }: { erreurFichier?: boolean }) {
  const groupes = await lireRessourcesParCours();

  return (
    <div className="flex flex-col gap-8">
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
          texte="Les supports de vos cours (documents et liens utiles) apparaîtront ici dès qu'ils seront publiés."
        />
      ) : (
        groupes.map(({ cours, ressources }) => (
          <section key={cours.id} aria-labelledby={`cours-${cours.id}`} className="flex flex-col gap-3">
            <h2 id={`cours-${cours.id}`} className="titre-charte text-3xl">
              <Link href={`/cours/${cours.id}`} className="underline-offset-4 hover:underline">
                {cours.titre}
              </Link>
            </h2>
            <ul className="flex flex-col gap-2">
              {ressources.map((r) => (
                <LigneRessource key={r.id} ressource={r} />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}

/** Squelette pendant le chargement de la liste. */
export function ListeRessourcesChargement() {
  return (
    <div className="flex flex-col gap-3" role="status" aria-live="polite">
      <span className="sr-only">Chargement des ressources…</span>
      <div className="h-9 w-2/3 max-w-md rounded-md bg-black/10 motion-safe:animate-pulse" />
      {[0, 1].map((i) => (
        <div key={i} className="h-20 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
      ))}
    </div>
  );
}
