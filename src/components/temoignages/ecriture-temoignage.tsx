"use client";

import { useState } from "react";
import { PenLine, X } from "lucide-react";
import { FormulaireTemoignage } from "./formulaire-temoignage";

/** Barre « Qu'est-ce qui vous a parlé ? » qui s'ouvre en formulaire. */
export function EcritureTemoignage({ prenom }: { prenom: string }) {
  const [ouvert, setOuvert] = useState(false);

  return (
    <section className="accueil-carte p-4 sm:p-5" aria-label="Écrire un témoignage">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="min-w-0 flex-1 text-sm font-semibold text-noir sm:text-base">Qu&apos;est-ce qui vous a parlé, {prenom} ?</p>
        <button type="button" onClick={() => setOuvert((v) => !v)} aria-expanded={ouvert} className="btn btn-principal gap-2">
          {ouvert ? <X aria-hidden className="size-4" /> : <PenLine aria-hidden className="size-4" />}
          {ouvert ? "Fermer" : "Écrire"}
        </button>
      </div>
      {/* Le formulaire reste monté : un texte commencé n'est pas perdu si on referme */}
      <div hidden={!ouvert} className="mt-4 border-t border-black/10 pt-4">
        <p className="mb-3 text-sm">
          Gardez-le comme une note, ou partagez-le. S&apos;il est partagé et validé, il apparaît sous votre prénom, avec sa date.
        </p>
        <FormulaireTemoignage />
      </div>
    </section>
  );
}
