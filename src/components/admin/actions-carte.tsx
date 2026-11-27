"use client";

import { useState, type ReactNode } from "react";
import { Pencil, X } from "lucide-react";

/** Bas d'une carte : l'action principale à gauche, modifier et supprimer en icônes à droite, puis la modification. */
export function ActionsCarte({ principale, suppression, children }: { principale: ReactNode; suppression: ReactNode; children: ReactNode }) {
  const [modification, setModification] = useState(false);

  return (
    <div className="mt-3 border-t border-black/10 pt-3">
      <div className="flex items-start gap-1">
        {principale}
        <button
          type="button"
          onClick={() => setModification((v) => !v)}
          aria-expanded={modification}
          aria-label={modification ? "Fermer la modification" : "Modifier le texte ou la photo"}
          title={modification ? "Fermer" : "Modifier"}
          className="ml-auto flex size-11 shrink-0 items-center justify-center rounded-[0.9rem] text-noir hover:bg-black/5"
        >
          {modification ? <X aria-hidden className="size-5" /> : <Pencil aria-hidden className="size-5" />}
        </button>
        {suppression}
      </div>
      {/* Masqué et non retiré : une saisie en cours n'est pas perdue si on referme */}
      <div hidden={!modification} className="mt-4">
        {children}
      </div>
    </div>
  );
}
