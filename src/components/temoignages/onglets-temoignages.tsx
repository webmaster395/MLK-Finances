"use client";

import { useState } from "react";
import { PenLine, X } from "lucide-react";
import { FormulaireTemoignage } from "./formulaire-temoignage";

type Onglet = "journal" | "partages";

/**
 * En-tête de la page Témoignages avec ses deux sous-onglets, puis le contenu choisi.
 * Les deux vues restent montées : on ne perd rien (même un texte commencé) en changeant de sous-onglet.
 */
export function OngletsTemoignages({
  prenom,
  nombreJournal,
  nombrePartages,
  journal,
  partages,
}: {
  prenom: string;
  nombreJournal: number;
  nombrePartages: number;
  journal: React.ReactNode;
  partages: React.ReactNode;
}) {
  const [actif, setActif] = useState<Onglet>("journal");
  const [ecriture, setEcriture] = useState(false);
  const formulaireVisible = ecriture && actif === "journal";

  const onglets = [
    { cle: "journal" as const, libelle: `Mon journal (${nombreJournal})` },
    { cle: "partages" as const, libelle: `Partagés par tous (${nombrePartages})` },
  ];

  function basculerEcriture() {
    setEcriture(!formulaireVisible);
    setActif("journal");
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="overflow-hidden rounded-[1.25rem] bg-[#0b0b10] text-white shadow-md" aria-labelledby="titre-temoignages">
        <div className="grid gap-5 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-white/70">PAROLES DE PARTICIPANTS</p>
            <h1 id="titre-temoignages" className="titre-charte mt-2 max-w-2xl text-3xl !leading-[1.05] !text-white sm:text-5xl">
              Les expériences de ceux qui ont suivi le parcours
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
              Les témoignages partagés par les participants et validés par l&apos;équipe. Vous aussi, écrivez ce qui vous a parlé.
            </p>
            <button type="button" onClick={basculerEcriture} aria-expanded={formulaireVisible} className="btn btn-accent mt-5 gap-2">
              {formulaireVisible ? <X aria-hidden className="size-4" /> : <PenLine aria-hidden className="size-4" />}
              {formulaireVisible ? "Fermer" : "Écrire un témoignage"}
            </button>
          </div>
          <p className="hidden rounded-lg bg-white/10 p-4 lg:block">
            <span className="titre-charte block text-4xl !leading-none !text-white">{nombrePartages}</span>
            <span className="mt-1 block text-xs font-semibold text-white/70">
              témoignage{nombrePartages > 1 ? "s" : ""} partagé{nombrePartages > 1 ? "s" : ""}
            </span>
          </p>
        </div>

        {/* Sous-onglets, au bas de l'en-tête */}
        <div role="tablist" aria-label="Témoignages" className="flex border-t border-white/15 px-2 sm:px-6">
          {onglets.map((o) => (
            <button
              key={o.cle}
              type="button"
              role="tab"
              id={`onglet-${o.cle}`}
              aria-selected={actif === o.cle}
              aria-controls={`panneau-${o.cle}`}
              onClick={() => setActif(o.cle)}
              className={`min-h-12 flex-1 border-b-4 px-2 text-sm font-semibold transition sm:flex-none sm:px-5 ${
                actif === o.cle ? "border-[#6b78f5] text-white" : "border-transparent text-white/70 hover:text-white"
              }`}
            >
              {o.libelle}
            </button>
          ))}
        </div>
      </section>

      <div role="tabpanel" id="panneau-journal" aria-labelledby="onglet-journal" hidden={actif !== "journal"}>
        <div className="flex flex-col gap-4">
          <section hidden={!ecriture} className="accueil-carte p-5 sm:p-6" aria-label="Écrire un témoignage">
            <p className="mb-3 text-sm">
              <span className="font-semibold text-noir">Qu&apos;est-ce qui vous a parlé, {prenom} ?</span> Gardez-le comme une note, ou
              partagez-le. S&apos;il est partagé et validé, il apparaît sous votre prénom, avec sa date.
            </p>
            <FormulaireTemoignage />
          </section>
          {journal}
        </div>
      </div>

      <div role="tabpanel" id="panneau-partages" aria-labelledby="onglet-partages" hidden={actif !== "partages"}>
        {partages}
      </div>
    </div>
  );
}
