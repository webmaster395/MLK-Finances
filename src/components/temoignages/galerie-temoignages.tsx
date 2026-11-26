"use client";

import { useState } from "react";
import { Quote } from "lucide-react";
import { Avatar } from "@/components/profil/avatar";
import { TexteRepliable } from "./texte-repliable";

export type CarteGalerie = {
  id: string;
  nom: string;
  texte: string;
  initiales: string;
  photoUrl: string | null;
  /** « mardi 24 novembre 2026 » */
  date: string;
  /** Identifiant de la session (ou « general »), pour filtrer et regrouper */
  groupeCle: string;
  /** Titre complet de la session */
  groupeLibelle: string;
  /** « Session 2 », pour le bouton de filtre */
  groupeCourt: string;
};

const PAR_PAS = 9;
const PASTILLE = "min-h-11 shrink-0 rounded-full px-4 text-xs font-semibold transition first-letter:uppercase";
const ACTIVE = "bg-accent text-white";
const INACTIVE = "border border-black/25 text-noir hover:bg-black/5";

/**
 * Témoignages validés : filtre et regroupement par session,
 * 9 cartes puis « Voir plus ». Les données arrivent déjà lues par le serveur.
 */
export function GalerieTemoignages({ temoignages }: { temoignages: CarteGalerie[] }) {
  const [choisi, setChoisi] = useState("tous");
  const [visibles, setVisibles] = useState(PAR_PAS);

  const sessions = [...new Map(temoignages.map((t) => [t.groupeCle, t])).values()];
  const filtres = choisi === "tous" ? temoignages : temoignages.filter((t) => t.groupeCle === choisi);
  const affiches = filtres.slice(0, visibles);
  const groupes = sessions
    .map((s) => ({ cle: s.groupeCle, libelle: s.groupeLibelle, cartes: affiches.filter((t) => t.groupeCle === s.groupeCle) }))
    .filter((g) => g.cartes.length > 0);

  function choisir(cle: string) {
    setChoisi(cle);
    setVisibles(PAR_PAS);
  }

  return (
    <div className="flex flex-col gap-5">
      {sessions.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrer par session">
          <button type="button" onClick={() => choisir("tous")} aria-pressed={choisi === "tous"} className={`${PASTILLE} ${choisi === "tous" ? ACTIVE : INACTIVE}`}>
            Toutes
          </button>
          {sessions.map((s) => (
            <button
              key={s.groupeCle}
              type="button"
              onClick={() => choisir(s.groupeCle)}
              aria-pressed={choisi === s.groupeCle}
              className={`${PASTILLE} ${choisi === s.groupeCle ? ACTIVE : INACTIVE}`}
            >
              {s.groupeCourt}
            </button>
          ))}
        </div>
      ) : null}

      {groupes.map((g) => (
        <section key={g.cle} className="flex flex-col gap-3" aria-labelledby={`groupe-${g.cle}`}>
          <h2 id={`groupe-${g.cle}`} className="titre-charte text-2xl sm:text-3xl">
            {g.libelle}
          </h2>
          <ul className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
            {g.cartes.map((t) => (
              <li key={t.id}>
                <article className="accueil-carte flex flex-col gap-4 p-5 sm:p-6">
                  <span aria-hidden className="flex size-12 items-center justify-center rounded-[0.9rem] bg-accent-clair text-noir">
                    <Quote className="size-6" strokeWidth={1.75} />
                  </span>
                  <TexteRepliable texte={t.texte} />
                  <footer className="flex items-center gap-3 border-t border-black/10 pt-4">
                    <Avatar photoUrl={t.photoUrl} initiales={t.initiales} taille="size-10" texteTaille="text-xs" />
                    <span className="min-w-0">
                      <cite className="block text-sm font-semibold not-italic leading-snug text-noir [overflow-wrap:anywhere]">{t.nom}</cite>
                      <span className="block text-xs">{t.date}</span>
                    </span>
                  </footer>
                </article>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {filtres.length > visibles ? (
        <button type="button" onClick={() => setVisibles((v) => v + PAR_PAS)} className="btn btn-principal w-full sm:w-fit sm:self-center">
          Voir plus ({filtres.length - visibles} de plus)
        </button>
      ) : null}
    </div>
  );
}
