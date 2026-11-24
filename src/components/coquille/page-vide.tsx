import type { LucideIcon } from "lucide-react";

type Props = {
  titre: string;
  sousTitre: string;
  icone: LucideIcon;
  /** Ce qui arrivera dans cette page (état vide soigné, avant la vraie page). */
  contenu: string;
  lot: string;
};

/** Page provisoire : titre de la charte + état vide clair. */
export function PageVide({ titre, sousTitre, icone: Icone, contenu, lot }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="titre-charte text-5xl sm:text-6xl">
          <span className="pinceau">{titre}</span>
        </h1>
        <p className="mt-3 font-titre text-2xl font-medium tracking-wide sm:text-3xl">{sousTitre}</p>
      </div>
      <section className="carte flex flex-col items-center gap-3 py-12 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-accent-clair text-noir">
          <Icone aria-hidden className="size-7" />
        </span>
        <h2 className="titre-charte text-2xl">Bientôt disponible</h2>
        <p className="max-w-md font-semibold">{contenu}</p>
        <p className="text-sm">Prévu au {lot}.</p>
      </section>
    </div>
  );
}
