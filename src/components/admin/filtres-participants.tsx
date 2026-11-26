"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { CIVILITES, TRANCHES_AGE } from "@/lib/auth/profil";

type Valeurs = { recherche: string; civilite: string; trancheAge: string; role: string };

const VIDE: Valeurs = { recherche: "", civilite: "", trancheAge: "", role: "" };
const DELAI_SAISIE_MS = 400;
const CLASSE_SELECT = "min-h-11 w-full rounded-md border border-black/25 bg-white px-3 text-sm font-semibold text-noir";

/**
 * Recherche et filtres des participants : la liste se met à jour toute seule (dès le choix dans une liste,
 * ou après une courte pause dans la saisie). L'adresse de la page garde les filtres.
 */
export function FiltresParticipants({ initial, temoignage }: { initial: Valeurs; temoignage: string }) {
  const router = useRouter();
  const [valeurs, setValeurs] = useState(initial);
  const [enCours, demarrer] = useTransition();
  const attente = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(attente.current), []);

  function appliquer(v: Valeurs) {
    window.clearTimeout(attente.current);
    const params = new URLSearchParams();
    if (v.recherche.trim()) params.set("q", v.recherche.trim());
    if (v.civilite) params.set("civilite", v.civilite);
    if (v.trancheAge) params.set("age", v.trancheAge);
    if (v.role) params.set("role", v.role);
    if (temoignage) params.set("temoignage", temoignage);
    const texte = params.toString();
    demarrer(() => router.replace(texte ? `/admin/participants?${texte}` : "/admin/participants", { scroll: false }));
  }

  function choisir(partiel: Partial<Valeurs>) {
    const suivant = { ...valeurs, ...partiel };
    setValeurs(suivant);
    appliquer(suivant);
  }

  function saisir(recherche: string) {
    const suivant = { ...valeurs, recherche };
    setValeurs(suivant);
    window.clearTimeout(attente.current);
    attente.current = window.setTimeout(() => appliquer(suivant), DELAI_SAISIE_MS);
  }

  const actif = Object.values(valeurs).some(Boolean);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        appliquer(valeurs);
      }}
      className="accueil-carte grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]"
    >
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-noir sm:col-span-2 lg:col-span-1">
        Rechercher
        <span className="relative">
          <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-doux" />
          <input
            type="search"
            value={valeurs.recherche}
            onChange={(e) => saisir(e.target.value)}
            maxLength={60}
            placeholder="Prénom ou nom"
            className="min-h-11 w-full rounded-md border border-black/25 bg-white pl-10 pr-3 text-base font-semibold text-noir placeholder:font-normal placeholder:text-doux"
          />
        </span>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-noir">
        Civilité
        <select value={valeurs.civilite} onChange={(e) => choisir({ civilite: e.target.value })} className={CLASSE_SELECT}>
          <option value="">Toutes</option>
          {CIVILITES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.libelle}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-noir">
        Âge
        <select value={valeurs.trancheAge} onChange={(e) => choisir({ trancheAge: e.target.value })} className={CLASSE_SELECT}>
          <option value="">Tous les âges</option>
          {TRANCHES_AGE.map((x) => (
            <option key={x.code} value={x.code}>
              {x.libelle}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-noir">
        Rôle
        <select value={valeurs.role} onChange={(e) => choisir({ role: e.target.value })} className={CLASSE_SELECT}>
          <option value="">Tous les rôles</option>
          <option value="participant">Participants</option>
          <option value="admin">Administrateurs</option>
        </select>
      </label>
      <div className="flex min-h-6 items-center justify-between gap-3 sm:col-span-2 lg:col-span-4">
        <span role="status" className="text-xs font-semibold">
          {enCours ? "Mise à jour…" : ""}
        </span>
        {actif ? (
          <button type="button" onClick={() => choisir(VIDE)} className="min-h-11 text-sm font-semibold text-noir underline underline-offset-4">
            Effacer les filtres
          </button>
        ) : null}
      </div>
    </form>
  );
}
