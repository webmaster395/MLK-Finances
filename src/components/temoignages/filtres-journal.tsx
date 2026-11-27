"use client";

import { useState } from "react";

export type EtatEntree = "prive" | "attente" | "visible";

const FILTRES = [
  { cle: "tous", libelle: "Tous" },
  { cle: "prive", libelle: "Pour moi" },
  { cle: "attente", libelle: "En attente" },
  { cle: "visible", libelle: "Visibles par tous" },
] as const;

type Filtre = (typeof FILTRES)[number]["cle"];

const PAR_PAS = 6;
const PASTILLE = "min-h-11 shrink-0 rounded-full px-4 text-xs font-semibold transition";
const ACTIVE = "bg-accent text-white";
const INACTIVE = "border border-black/25 text-noir hover:bg-black/5";

/** Les entrées du journal : filtre par état, deux cartes par ligne sur grand écran, 6 puis « Voir plus ». */
export function FiltresJournal({ entrees }: { entrees: { etat: EtatEntree; carte: React.ReactNode }[] }) {
  const [filtre, setFiltre] = useState<Filtre>("tous");
  const [visibles, setVisibles] = useState(PAR_PAS);
  const dans = (f: Filtre) => (f === "tous" ? entrees : entrees.filter((e) => e.etat === f));
  const choisies = dans(filtre);
  const reste = choisies.length - visibles;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer mon journal">
        {FILTRES.map((f) => (
          <button
            key={f.cle}
            type="button"
            onClick={() => {
              setFiltre(f.cle);
              setVisibles(PAR_PAS);
            }}
            aria-pressed={filtre === f.cle}
            className={`${PASTILLE} ${filtre === f.cle ? ACTIVE : INACTIVE}`}
          >
            {f.libelle} ({dans(f.cle).length})
          </button>
        ))}
      </div>

      {choisies.length > 0 ? (
        <ul className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">{choisies.slice(0, visibles).map((e) => e.carte)}</ul>
      ) : (
        <p className="accueil-carte p-5 text-sm font-semibold text-noir">Aucun témoignage dans cette catégorie.</p>
      )}

      {reste > 0 ? (
        <button
          type="button"
          onClick={() => setVisibles((v) => v + PAR_PAS)}
          className="inline-flex min-h-11 w-fit items-center self-center rounded-[0.9rem] border border-black/25 px-4 text-sm font-semibold text-noir hover:bg-black/5"
        >
          Voir plus ({reste} de plus)
        </button>
      ) : null}
    </div>
  );
}
