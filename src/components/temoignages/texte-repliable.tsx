"use client";

import { useState } from "react";

const LONGUEUR_REPLI = 220;
const LIGNES_REPLI = 5;

/** Texte d'un témoignage : les longs sont repliés sur 5 lignes, avec « Lire la suite » / « Réduire ». */
export function TexteRepliable({ texte, grand = false }: { texte: string; grand?: boolean }) {
  const [deplie, setDeplie] = useState(false);
  const long = texte.length > LONGUEUR_REPLI || texte.split("\n").length > LIGNES_REPLI;

  return (
    <div className="flex flex-col items-start gap-1">
      <p
        className={`whitespace-pre-line font-semibold leading-relaxed text-noir [overflow-wrap:anywhere] ${
          grand ? "text-base sm:text-lg" : "text-sm sm:text-base"
        } ${long && !deplie ? "line-clamp-5" : ""}`}
      >
        « {texte} »
      </p>
      {long ? (
        <button
          type="button"
          onClick={() => setDeplie((v) => !v)}
          aria-expanded={deplie}
          className="min-h-11 text-sm font-semibold text-accent underline underline-offset-4"
        >
          {deplie ? "Réduire" : "Lire la suite"}
        </button>
      ) : null}
    </div>
  );
}
