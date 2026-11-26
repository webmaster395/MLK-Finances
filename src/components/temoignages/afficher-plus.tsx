"use client";

import { useState } from "react";

/** Affiche les premiers éléments d'une liste, puis « Voir plus » pour les suivants. */
export function AfficherPlus({ elements, pas = 5 }: { elements: React.ReactNode[]; pas?: number }) {
  const [visibles, setVisibles] = useState(pas);
  const reste = elements.length - visibles;

  return (
    <>
      <ul className="flex flex-col gap-4">{elements.slice(0, visibles)}</ul>
      {reste > 0 ? (
        <button
          type="button"
          onClick={() => setVisibles((v) => v + pas)}
          className="inline-flex min-h-11 w-fit items-center self-center rounded-[0.9rem] border border-black/25 px-4 text-sm font-semibold text-noir hover:bg-black/5"
        >
          Voir plus ({reste} de plus)
        </button>
      ) : null}
    </>
  );
}
