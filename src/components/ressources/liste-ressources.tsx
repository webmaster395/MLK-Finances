import { lireRessourcesParCours } from "@/lib/donnees/ressources";
import { formaterJourIso } from "@/lib/format";
import { BibliothequeRessources, type ElementBibliotheque } from "./bibliotheque-ressources";

/** Ressources de la personne, présentées en bibliothèque. Lit ses données : à placer sous <Suspense>. */
export async function ListeRessources({ erreurFichier }: { erreurFichier?: boolean }) {
  const groupes = await lireRessourcesParCours();

  const elements: ElementBibliotheque[] = groupes.flatMap(({ cours, seance, ressources }) =>
    ressources.map((r) => ({
      id: r.id,
      titre: r.titre,
      type: r.type,
      url: r.url,
      coursId: cours.id,
      coursTitre: cours.titre,
      seanceLibelle: seance ? `Séance du ${formaterJourIso(seance.jour, true)}` : "",
    })),
  );

  return <BibliothequeRessources elements={elements} erreurFichier={Boolean(erreurFichier)} />;
}

/** Squelette pendant le chargement : le bandeau, la recherche et une grille de cartes en gris. */
export function ListeRessourcesChargement() {
  return (
    <div className="flex flex-col gap-5" role="status" aria-live="polite">
      <span className="sr-only">Chargement des ressources…</span>
      <div className="h-52 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse sm:h-56" />
      <div className="h-32 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-52 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
        ))}
      </div>
    </div>
  );
}
