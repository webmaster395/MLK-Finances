"use client";

import { useState } from "react";

/** Les deux vues de la page Témoignages. Les deux restent montées : on ne perd rien en changeant d'onglet. */
export function OngletsTemoignages({ onglets }: { onglets: { cle: string; libelle: string; contenu: React.ReactNode }[] }) {
  const [actif, setActif] = useState(onglets[0].cle);

  return (
    <div className="flex flex-col gap-4">
      <div role="tablist" aria-label="Témoignages" className="flex flex-wrap gap-2">
        {onglets.map((o) => (
          <button
            key={o.cle}
            type="button"
            role="tab"
            id={`onglet-${o.cle}`}
            aria-selected={actif === o.cle}
            aria-controls={`panneau-${o.cle}`}
            onClick={() => setActif(o.cle)}
            className={`min-h-11 rounded-full px-5 text-sm font-semibold transition ${
              actif === o.cle ? "bg-accent text-white" : "border border-black/25 text-noir hover:bg-black/5"
            }`}
          >
            {o.libelle}
          </button>
        ))}
      </div>
      {onglets.map((o) => (
        <div key={o.cle} role="tabpanel" id={`panneau-${o.cle}`} aria-labelledby={`onglet-${o.cle}`} hidden={actif !== o.cle}>
          {o.contenu}
        </div>
      ))}
    </div>
  );
}
