import type { LucideIcon } from "lucide-react";

/** Message affiché quand une liste est vide : une icône, un titre, une phrase d'explication. */
export function EtatVide({ icone: Icone, titre, texte }: { icone: LucideIcon; titre: string; texte: string }) {
  return (
    <section className="carte flex flex-col items-center gap-3 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-accent-clair text-noir">
        <Icone aria-hidden className="size-7" />
      </span>
      <h2 className="titre-charte text-2xl">{titre}</h2>
      <p className="max-w-md font-semibold">{texte}</p>
    </section>
  );
}
