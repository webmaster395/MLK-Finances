import { lireRessources } from "@/lib/donnees/ressources";
import { formaterJourIso } from "@/lib/format";
import { BibliothequeRessources, type ElementBibliotheque } from "./bibliotheque-ressources";

/** Documents des sessions de la personne, présentés en bibliothèque. Lit ses données : à placer sous <Suspense>. */
export async function ListeRessources({ erreurFichier }: { erreurFichier?: boolean }) {
  const ressources = await lireRessources();

  const elements: ElementBibliotheque[] = ressources.map((r) => ({
    id: r.id,
    titre: r.titre,
    type: r.type,
    url: r.url,
    sessionId: r.session.id,
    sessionTitre: r.session.titre,
    sessionLibelle: `Session du ${formaterJourIso(r.session.jour, true)}`,
  }));

  return <BibliothequeRessources elements={elements} erreurFichier={Boolean(erreurFichier)} />;
}

/** Squelette pendant le chargement : le bandeau, la recherche et une grille de cartes en gris. */
export function ListeRessourcesChargement() {
  return (
    <div className="flex flex-col gap-5" role="status" aria-live="polite">
      <span className="sr-only">Chargement des ressources…</span>
      <div className="h-52 rounded-[1.25rem] bg-black/10 motion-safe:animate-pulse sm:h-56" />
      <div className="h-32 rounded-[1.25rem] bg-black/10 motion-safe:animate-pulse" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-52 rounded-[1.25rem] bg-black/10 motion-safe:animate-pulse" />
        ))}
      </div>
    </div>
  );
}
