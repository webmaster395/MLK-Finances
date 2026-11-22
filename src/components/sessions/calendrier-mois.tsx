"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, CalendarX, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Intervenants } from "@/components/seances/intervenants";
import { COULEUR_SEANCE } from "@/components/seances/couleur-seance";
import { formaterJourIso } from "@/lib/format";

/** Une séance, prête à afficher (les heures sont déjà écrites à l'heure de Paris par le serveur). */
export type SeanceCalendrier = {
  id: string;
  titre: string;
  /** Jour à Paris, « AAAA-MM-JJ » */
  jour: string;
  horaires: string;
  lieu: string | null;
  intervenants: string[];
  coursTitre: string | null;
  aPreparer: number;
  passee: boolean;
};

const JOURS_SEMAINE = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];
const formaterMois = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });

const iso = (annee: number, mois: number, jour: number) =>
  `${annee}-${String(mois + 1).padStart(2, "0")}-${String(jour).padStart(2, "0")}`;
const enMajuscule = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/** Les semaines d'un mois (lundi en premier) : null pour les cases vides avant le 1er et après le dernier jour. */
function semainesDuMois(annee: number, mois: number): (number | null)[][] {
  const decalage = (new Date(Date.UTC(annee, mois, 1)).getUTCDay() + 6) % 7;
  const nbJours = new Date(Date.UTC(annee, mois + 1, 0)).getUTCDate();
  const cases: (number | null)[] = [...Array(decalage).fill(null), ...Array.from({ length: nbJours }, (_, i) => i + 1)];
  while (cases.length % 7 !== 0) cases.push(null);
  return Array.from({ length: cases.length / 7 }, (_, i) => cases.slice(i * 7, i * 7 + 7));
}

export function CalendrierMois({
  seances,
  aujourdhui,
  jourInitial,
  prochainJour,
}: {
  seances: SeanceCalendrier[];
  /** Aujourd'hui à Paris, « AAAA-MM-JJ » */
  aujourdhui: string;
  jourInitial: string;
  /** Premier jour de formation qui n'est pas terminé (null s'il n'y en a plus) */
  prochainJour: string | null;
}) {
  const [choisi, setChoisi] = useState(jourInitial);
  const [affiche, setAffiche] = useState({ annee: +jourInitial.slice(0, 4), mois: +jourInitial.slice(5, 7) - 1 });

  const parJour = new Map<string, SeanceCalendrier[]>();
  for (const s of seances) parJour.set(s.jour, [...(parJour.get(s.jour) ?? []), s]);

  const seancesDuJour = parJour.get(choisi) ?? [];

  function allerAuJour(jour: string) {
    setChoisi(jour);
    setAffiche({ annee: +jour.slice(0, 4), mois: +jour.slice(5, 7) - 1 });
  }

  function changerMois(pas: number) {
    const d = new Date(Date.UTC(affiche.annee, affiche.mois + pas, 1));
    setAffiche({ annee: d.getUTCFullYear(), mois: d.getUTCMonth() });
  }

  const titreMois = enMajuscule(formaterMois.format(new Date(Date.UTC(affiche.annee, affiche.mois, 1, 12))));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => allerAuJour(aujourdhui)}
          className="min-h-10 rounded-full border border-black/25 bg-white px-5 text-sm font-semibold text-noir hover:bg-black/5"
        >
          Aujourd&apos;hui
        </button>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <section className="accueil-carte p-4 sm:p-7" aria-label="Calendrier">
          <div className="flex items-center justify-center gap-3 sm:gap-5">
            <button
              type="button"
              onClick={() => changerMois(-1)}
              aria-label="Mois précédent"
              className="flex size-11 items-center justify-center rounded-lg border border-black/25 bg-white text-noir hover:bg-black/5"
            >
              <ChevronLeft aria-hidden className="size-5" />
            </button>
            <h2 aria-live="polite" className="titre-charte min-w-[9.5rem] text-center text-2xl sm:min-w-[13rem] sm:text-3xl">
              {titreMois}
            </h2>
            <button
              type="button"
              onClick={() => changerMois(1)}
              aria-label="Mois suivant"
              className="flex size-11 items-center justify-center rounded-lg border border-black/25 bg-white text-noir hover:bg-black/5"
            >
              <ChevronRight aria-hidden className="size-5" />
            </button>
          </div>

          <table className="mt-5 w-full table-fixed border-separate border-spacing-0 overflow-hidden rounded-lg border border-black/15">
            <thead>
              <tr>
                {JOURS_SEMAINE.map((j) => (
                  <th key={j} scope="col" className="py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em]">
                    {j}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {semainesDuMois(affiche.annee, affiche.mois).map((semaine, i) => (
                <tr key={i}>
                  {semaine.map((jour, k) => {
                    if (jour === null) return <td key={k} className="h-14 border-t border-black/10 sm:h-[4.75rem]" />;
                    const date = iso(affiche.annee, affiche.mois, jour);
                    const duJour = parJour.get(date) ?? [];
                    const couleurs = duJour.length > 0 ? [COULEUR_SEANCE] : [];
                    const estChoisi = date === choisi;
                    const estAujourdhui = date === aujourdhui;
                    return (
                      <td key={k} className={`border-t border-black/10 p-0 ${k > 0 ? "border-l" : ""} ${estChoisi ? "bg-black/5" : ""}`}>
                        <button
                          type="button"
                          onClick={() => setChoisi(date)}
                          aria-pressed={estChoisi}
                          aria-current={estAujourdhui ? "date" : undefined}
                          aria-label={`${formaterJourIso(date)}${duJour.length ? `, ${duJour.length} séance${duJour.length > 1 ? "s" : ""}` : ""}`}
                          className="flex h-14 w-full flex-col items-center pt-1.5 hover:bg-black/5 sm:h-[4.75rem] sm:pt-3"
                        >
                          <span
                            className={`flex size-8 items-center justify-center rounded-full text-sm font-semibold text-noir ${
                              estChoisi ? "bg-noir !text-carte" : estAujourdhui ? "ring-2 ring-rose" : ""
                            }`}
                          >
                            {jour}
                          </span>
                          <span aria-hidden className="mt-1 flex h-1.5 gap-1">
                            {couleurs.map((c) => (
                              <span key={c} className="size-1.5 rounded-full" style={{ background: c }} />
                            ))}
                          </span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-jour">
          <p className="text-xs sm:text-sm">{choisi === aujourdhui ? "Aujourd'hui" : choisi === prochainJour ? "Prochaine journée" : "Journée"}</p>
          <h2 id="titre-jour" className="titre-charte mt-1 text-2xl !leading-tight first-letter:uppercase sm:text-3xl">
            {formaterJourIso(choisi, true)}
          </h2>
          {seancesDuJour[0]?.lieu ? (
            <p className="mt-1 flex items-center gap-1.5 text-sm">
              <MapPin aria-hidden className="size-4 shrink-0" />
              {seancesDuJour[0].lieu}
            </p>
          ) : null}

          <hr className="my-4 border-black/10" />

          {seancesDuJour.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {seancesDuJour.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/sessions/${s.id}`}
                    className={`group flex flex-col gap-2 rounded-lg border border-l-4 border-black/15 bg-white/40 p-4 transition hover:shadow-md ${
                      s.passee ? "opacity-75" : ""
                    }`}
                    style={{ borderLeftColor: COULEUR_SEANCE }}
                  >
                    <span className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-noir">{s.horaires}</span>
                    </span>
                    <span className="text-base font-semibold leading-snug text-noir group-hover:underline [overflow-wrap:anywhere]">
                      {s.coursTitre ?? s.titre}
                    </span>
                    {s.coursTitre && s.titre !== s.coursTitre ? <span className="-mt-1 text-sm">{s.titre}</span> : null}
                    <Intervenants noms={s.intervenants} />
                    {s.lieu ? (
                      <span className="flex items-center gap-1.5 text-sm">
                        <MapPin aria-hidden className="size-4 shrink-0" />
                        {s.lieu}
                      </span>
                    ) : null}
                    {s.aPreparer > 0 ? (
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-[#b45309]">
                        <BookOpen aria-hidden className="size-4 shrink-0" />
                        {s.aPreparer} {s.aPreparer > 1 ? "travaux" : "travail"} à préparer
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-start gap-3 py-2">
              <p className="flex items-center gap-2 font-semibold">
                <CalendarX aria-hidden className="size-5 shrink-0" />
                Aucune séance ce jour-là.
              </p>
              {prochainJour && prochainJour !== choisi ? (
                <button
                  type="button"
                  onClick={() => allerAuJour(prochainJour)}
                  className="btn btn-orange min-h-10 px-4 text-sm"
                >
                  Voir la prochaine journée
                </button>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
