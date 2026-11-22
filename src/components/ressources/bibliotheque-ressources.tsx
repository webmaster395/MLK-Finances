"use client";

import { useMemo, useState } from "react";
import { BookOpen, Download, ExternalLink, FileText, FolderOpen, Link2, Search } from "lucide-react";

export type ElementBibliotheque = {
  id: string;
  titre: string;
  type: "fichier" | "lien";
  /** Adresse du lien externe (null pour un fichier : le téléchargement passe par le site). */
  url: string | null;
  coursId: string;
  coursTitre: string;
  /** Ex. « Séance du jeudi 26 novembre 2026 » (vide si le cours n'a pas de séance). */
  seanceLibelle: string;
};

type Format = "tous" | "fichier" | "lien";

const FORMATS: { cle: Format; libelle: string }[] = [
  { cle: "tous", libelle: "Tous les formats" },
  { cle: "fichier", libelle: "Documents" },
  { cle: "lien", libelle: "Liens" },
];

const PASTILLE = "min-h-10 shrink-0 rounded-full px-4 text-xs font-semibold transition";
const ACTIVE = "bg-noir text-white";
const INACTIVE = "border border-black/25 text-noir hover:bg-black/5";

/**
 * Bibliothèque des ressources : bandeau d'introduction, recherche, filtres en pastilles et grille de cartes.
 * Les données arrivent déjà lues par le serveur : ce composant ne fait que filtrer et afficher.
 */
export function BibliothequeRessources({ elements, erreurFichier }: { elements: ElementBibliotheque[]; erreurFichier: boolean }) {
  const [recherche, setRecherche] = useState("");
  const [format, setFormat] = useState<Format>("tous");
  const [coursChoisi, setCoursChoisi] = useState<string>("tous");

  const cours = useMemo(() => {
    const vus = new Map<string, string>();
    for (const e of elements) vus.set(e.coursId, e.coursTitre);
    return [...vus.entries()].map(([id, titre]) => ({ id, titre }));
  }, [elements]);

  const requete = recherche.trim().toLocaleLowerCase("fr-FR");
  const filtres = useMemo(
    () =>
      elements.filter((e) => {
        if (format !== "tous" && e.type !== format) return false;
        if (coursChoisi !== "tous" && e.coursId !== coursChoisi) return false;
        if (!requete) return true;
        return `${e.titre} ${e.coursTitre}`.toLocaleLowerCase("fr-FR").includes(requete);
      }),
    [elements, format, coursChoisi, requete],
  );
  const filtreActif = Boolean(requete) || format !== "tous" || coursChoisi !== "tous";

  return (
    <div className="flex flex-col gap-5">
      {/* Bandeau d'introduction */}
      <section className="overflow-hidden rounded-[0.65rem] bg-noir text-white shadow-md" aria-labelledby="titre-bibliotheque">
        <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-end">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-white/70">MA BIBLIOTHÈQUE</p>
            <h1 id="titre-bibliotheque" className="titre-charte mt-2 max-w-2xl text-3xl !leading-[1.05] text-white sm:text-5xl">
              Tout ce qui vous aide à aller plus loin
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
              Retrouvez ici les supports de vos séances : documents à télécharger et liens utiles, classés par cours.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-3">
            <Compteur valeur={elements.length} libelle={elements.length > 1 ? "ressources" : "ressource"} />
            <Compteur valeur={cours.length} libelle={cours.length > 1 ? "cours" : "cours"} />
          </dl>
        </div>
      </section>

      {erreurFichier ? (
        <p role="alert" className="rounded-md bg-orange/15 px-4 py-3 font-semibold text-[#8f3306]">
          Ce fichier n&apos;est pas disponible pour le moment. Réessayez plus tard ou prévenez l&apos;équipe.
        </p>
      ) : null}

      {elements.length === 0 ? (
        <section className="carte flex flex-col items-center gap-3 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-rose-clair text-noir">
            <FolderOpen aria-hidden className="size-7" />
          </span>
          <h2 className="titre-charte text-2xl">Aucune ressource pour le moment</h2>
          <p className="max-w-md font-semibold">Les supports de vos séances (documents et liens utiles) apparaîtront ici dès qu&apos;ils seront publiés.</p>
        </section>
      ) : (
        <>
          {/* Recherche et filtres */}
          <section className="accueil-carte p-4 sm:p-5" aria-label="Rechercher et filtrer">
            <label className="relative block">
              <span className="sr-only">Rechercher une ressource</span>
              <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-texte" />
              <input
                type="search"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher une ressource…"
                className="min-h-12 w-full rounded-md border border-black/25 bg-white pl-11 pr-4 text-sm font-semibold text-noir placeholder:font-normal placeholder:text-black/45"
              />
            </label>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filtrer par format">
              {FORMATS.map((f) => (
                <button key={f.cle} type="button" onClick={() => setFormat(f.cle)} aria-pressed={format === f.cle} className={`${PASTILLE} ${format === f.cle ? ACTIVE : INACTIVE}`}>
                  {f.libelle}
                </button>
              ))}
            </div>
            {cours.length > 1 ? (
              <div className="mt-3 flex gap-2 overflow-x-auto border-t border-black/10 pt-3 pb-1" role="group" aria-label="Filtrer par cours">
                <button type="button" onClick={() => setCoursChoisi("tous")} aria-pressed={coursChoisi === "tous"} className={`${PASTILLE} ${coursChoisi === "tous" ? ACTIVE : INACTIVE}`}>
                  Tous les cours
                </button>
                {cours.map((c) => (
                  <button key={c.id} type="button" onClick={() => setCoursChoisi(c.id)} aria-pressed={coursChoisi === c.id} className={`${PASTILLE} max-w-[16rem] truncate ${coursChoisi === c.id ? ACTIVE : INACTIVE}`}>
                    {c.titre}
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          <div className="flex items-center justify-between gap-3">
            <h2 className="titre-charte text-2xl sm:text-3xl" aria-live="polite">
              {filtres.length} ressource{filtres.length > 1 ? "s" : ""}
            </h2>
            {filtreActif ? (
              <button
                type="button"
                onClick={() => {
                  setRecherche("");
                  setFormat("tous");
                  setCoursChoisi("tous");
                }}
                className="text-sm font-semibold text-noir underline underline-offset-4"
              >
                Réinitialiser
              </button>
            ) : null}
          </div>

          {filtres.length > 0 ? (
            // La clé change avec les filtres : les cartes rejouent leur animation d'entrée
            <ul key={`${format}|${coursChoisi}|${requete}`} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtres.map((e, i) => (
                <li key={e.id} className="entree-cascade" style={{ "--i": Math.min(i, 12) } as React.CSSProperties}>
                  <CarteRessource element={e} />
                </li>
              ))}
            </ul>
          ) : (
            <section className="carte flex flex-col items-center gap-3 py-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-rose-clair text-noir">
                <Search aria-hidden className="size-7" />
              </span>
              <h2 className="titre-charte text-2xl">Aucune ressource trouvée</h2>
              <p className="max-w-md font-semibold">Modifiez votre recherche ou vos filtres.</p>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function Compteur({ valeur, libelle }: { valeur: number; libelle: string }) {
  return (
    <div className="rounded-lg bg-white/10 p-4">
      <dd className="titre-charte text-4xl !leading-none text-white">{valeur}</dd>
      <dt className="mt-1 text-xs font-semibold text-white/70">{libelle}</dt>
    </div>
  );
}

function CarteRessource({ element: e }: { element: ElementBibliotheque }) {
  const estLien = e.type === "lien" && Boolean(e.url);
  const Icone = estLien ? Link2 : FileText;
  // Lien simple, sans préchargement : le téléchargement crée un lien signé de 60 secondes à chaque clic
  const href = estLien ? e.url! : `/ressources/${e.id}/telecharger`;

  return (
    <a
      href={href}
      target={estLien ? "_blank" : undefined}
      rel={estLien ? "noopener noreferrer" : undefined}
      className="carte-survol accueil-carte group flex h-full min-h-[13.5rem] flex-col p-5"
    >
      <span className="flex items-start justify-between gap-3">
        <span
          aria-hidden
          className={`flex size-12 items-center justify-center rounded-[0.6rem] text-noir ${estLien ? "bg-orange/20" : "bg-rose-clair"}`}
        >
          <Icone className="size-6" strokeWidth={1.75} />
        </span>
        {estLien ? (
          <ExternalLink aria-hidden className="carte-fleche size-4 text-texte" />
        ) : (
          <Download aria-hidden className="carte-fleche size-4 text-texte" />
        )}
      </span>

      <span className="mt-6 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.16em]">{estLien ? "Lien externe" : "Document à télécharger"}</span>
        <span className="titre-charte mt-2 block text-xl !leading-tight sm:text-2xl [overflow-wrap:anywhere]">{e.titre}</span>
        {estLien ? <span className="sr-only"> (s&apos;ouvre dans un nouvel onglet)</span> : null}
      </span>

      <span className="mt-5 flex items-start gap-2 border-t border-black/10 pt-3 text-xs font-semibold">
        <BookOpen aria-hidden className="mt-0.5 size-3.5 shrink-0" />
        <span className="min-w-0">
          <span className="block truncate">{e.coursTitre}</span>
          {e.seanceLibelle ? <span className="block truncate font-normal">{e.seanceLibelle}</span> : null}
        </span>
      </span>
    </a>
  );
}
