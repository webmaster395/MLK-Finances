import type { Rubrique } from "@/lib/donnees/sessions";

/** Pastille de rubrique (Accueil, Formation…) : sa couleur est reprise en fond léger. */
export function PastilleRubrique({ rubrique }: { rubrique: Rubrique | null }) {
  if (!rubrique) return null;
  return (
    <span
      className="inline-block rounded-2xl px-3 py-1 text-[11px] font-semibold uppercase leading-snug tracking-[0.1em] text-noir"
      style={{ background: `color-mix(in srgb, ${rubrique.couleur} 30%, transparent)` }}
    >
      {rubrique.nom}
    </span>
  );
}

/** Couleur d'une séance : celle de sa rubrique, sinon un gris neutre. */
export function couleurSeance(rubrique: Rubrique | null) {
  return rubrique?.couleur ?? "#6b6560";
}
