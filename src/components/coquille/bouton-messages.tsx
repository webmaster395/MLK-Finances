"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Megaphone, X } from "lucide-react";
import type { Annonce } from "@/lib/donnees/annonces";

const formaterDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  timeZone: "Europe/Paris",
});

/**
 * Bouton icône « Messages de l'équipe » (mégaphone + compteur) à côté de la promotion.
 * Un clic ouvre la liste des messages publiés pour la personne.
 */
export function BoutonMessages({ messages = [] }: { messages?: Annonce[] }) {
  const [ouvert, setOuvert] = useState(false);
  const conteneur = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ouvert) return;
    function surTouche(e: KeyboardEvent) {
      if (e.key === "Escape") setOuvert(false);
    }
    function surClicExterieur(e: MouseEvent) {
      if (conteneur.current && !conteneur.current.contains(e.target as Node)) {
        setOuvert(false);
      }
    }
    window.addEventListener("keydown", surTouche);
    window.addEventListener("mousedown", surClicExterieur);
    return () => {
      window.removeEventListener("keydown", surTouche);
      window.removeEventListener("mousedown", surClicExterieur);
    };
  }, [ouvert]);

  const nb = messages.length;
  const libelle = nb > 0 ? `Messages de l'équipe (${nb})` : "Messages de l'équipe";

  return (
    <div ref={conteneur} className="relative">
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        aria-expanded={ouvert}
        aria-label={libelle}
        title={libelle}
        className="relative flex size-11 items-center justify-center rounded-md text-noir transition-colors hover:bg-black/5 md:size-10"
      >
        <Megaphone aria-hidden className="size-5" strokeWidth={1.85} />
        {nb > 0 ? (
          <span
            aria-hidden
            className="absolute -right-0.5 -top-0.5 flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold leading-none text-white"
          >
            {nb}
          </span>
        ) : null}
      </button>

      {ouvert ? (
        <div
          role="dialog"
          aria-label="Messages de l'équipe"
          className="fixed left-3 right-3 top-[4.25rem] z-50 max-h-[75vh] overflow-y-auto rounded-[0.65rem] border border-black/15 bg-carte p-4 shadow-xl sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="titre-charte flex items-center gap-2 text-xl">
              <Megaphone aria-hidden className="size-4 text-accent" />
              Messages de l&apos;équipe
            </h2>
            <button
              type="button"
              onClick={() => setOuvert(false)}
              aria-label="Fermer les messages"
              className="flex size-8 items-center justify-center rounded-md text-noir hover:bg-black/5"
            >
              <X aria-hidden className="size-4" />
            </button>
          </div>

          <hr className="my-3 border-black/10" />

          {nb > 0 ? (
            <>
              <ul className="flex flex-col gap-3">
                {messages.map((m) => (
                  <li key={m.id} className="rounded-lg border border-black/10 bg-white/40 p-3">
                    {m.titre ? <p className="text-sm font-semibold text-noir [overflow-wrap:anywhere]">{m.titre}</p> : null}
                    <p className="mt-1 whitespace-pre-line text-xs font-semibold leading-relaxed [overflow-wrap:anywhere]">
                      {m.message}
                    </p>
                    <p className="mt-1.5 text-[11px]">Publié le {formaterDate.format(new Date(m.cree_le))}</p>
                  </li>
                ))}
              </ul>
              <Link
                href="/messages"
                onClick={() => setOuvert(false)}
                className="mt-3 inline-block text-xs font-semibold text-noir underline underline-offset-2"
              >
                Ouvrir la page Messages →
              </Link>
            </>
          ) : (
            <p className="py-2 text-sm font-semibold">Aucun message de l&apos;équipe pour le moment.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
