"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight, LogOut, Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { deconnexion } from "@/lib/auth/actions";
import { GROUPES_MENU, PAGE_PROFIL } from "@/lib/navigation";

export type PersonneMenu = {
  nomComplet: string;
  email: string;
  initiales: string;
};

type Props = {
  personne: PersonneMenu;
  /** Pages qui affichent une pastille rouge (ex. devoirs à rendre). Vide pour l'instant. */
  pastilles?: Record<string, boolean>;
};

const CLE_MEMOIRE = "menu-replie";
const EVENEMENT = "menu-replie-change";

// Mémoire du choix « replié » sur cet appareil (avec une copie en mémoire si le navigateur refuse le stockage)
let copieEnMemoire = false;

function lireReplie() {
  try {
    return localStorage.getItem(CLE_MEMOIRE) === "1";
  } catch {
    return copieEnMemoire;
  }
}

function ecrireReplie(valeur: boolean) {
  copieEnMemoire = valeur;
  try {
    localStorage.setItem(CLE_MEMOIRE, valeur ? "1" : "0");
  } catch {}
  window.dispatchEvent(new Event(EVENEMENT));
}

function abonnerReplie(rappel: () => void) {
  window.addEventListener(EVENEMENT, rappel);
  window.addEventListener("storage", rappel);
  return () => {
    window.removeEventListener(EVENEMENT, rappel);
    window.removeEventListener("storage", rappel);
  };
}

function Separateur() {
  return <div aria-hidden className="border-t border-black/10" />;
}

/**
 * Menu de l'espace participant.
 * - Ordinateur : barre latérale repliable (bouton flèche en haut), pastille de la personne en bas.
 * - Téléphone : barre du haut avec un bouton qui ouvre le menu.
 * Ce composant lit l'adresse de la page : il doit toujours être sous <Suspense>.
 */
export function MenuLateral({ personne, pastilles = {} }: Props) {
  const chemin = usePathname();
  // Côté serveur et au premier affichage : déplié ; ensuite on applique le choix mémorisé
  const replie = useSyncExternalStore(abonnerReplie, lireReplie, () => false);
  const [ouvert, setOuvert] = useState(false); // menu du téléphone
  const [profilOuvert, setProfilOuvert] = useState(false);
  const zoneProfil = useRef<HTMLDivElement>(null);

  function basculer() {
    ecrireReplie(!replie);
    setProfilOuvert(false);
  }

  // Échap ferme les menus ; un clic à côté ferme le menu du profil
  useEffect(() => {
    if (!ouvert && !profilOuvert) return;
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOuvert(false);
        setProfilOuvert(false);
      }
    };
    const surClic = (e: MouseEvent) => {
      if (profilOuvert && zoneProfil.current && !zoneProfil.current.contains(e.target as Node)) {
        setProfilOuvert(false);
      }
    };
    window.addEventListener("keydown", surTouche);
    window.addEventListener("mousedown", surClic);
    return () => {
      window.removeEventListener("keydown", surTouche);
      window.removeEventListener("mousedown", surClic);
    };
  }, [ouvert, profilOuvert]);

  const sur = (href: string) => chemin === href || chemin.startsWith(`${href}/`);

  const groupes = (afficherNoms: boolean, apresClic?: () => void) => (
    <>
      {GROUPES_MENU.map((groupe, i) => (
        <Fragment key={i}>
          {i > 0 ? <Separateur /> : null}
          <ul className="flex flex-col gap-1">
            {groupe.map(({ href, nom, icone: Icone }) => {
              const actif = sur(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={apresClic}
                    aria-current={actif ? "page" : undefined}
                    title={afficherNoms ? undefined : nom}
                    className={`relative flex min-h-11 items-center gap-3 rounded-[0.6rem] px-3 text-[1.02rem] font-semibold tracking-tight text-texte transition-colors hover:bg-black/5 ${
                      actif ? "bg-black/10 shadow-sm" : ""
                    } ${afficherNoms ? "" : "justify-center"}`}
                  >
                    <span className="relative">
                      <Icone aria-hidden className="size-6 shrink-0 text-noir" strokeWidth={1.75} />
                      {pastilles[href] ? (
                        <span
                          aria-hidden
                          className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-[#d62d2d] ring-2 ring-[#f1efec]"
                        />
                      ) : null}
                    </span>
                    <span className={afficherNoms ? "" : "sr-only"}>
                      {nom}
                      {pastilles[href] ? <span className="sr-only"> (nouveau)</span> : null}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Fragment>
      ))}
    </>
  );

  const avatar = (
    <span
      aria-hidden
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-noir font-titre text-lg text-white"
    >
      {personne.initiales}
    </span>
  );

  const actionsProfil = (apresClic?: () => void) => (
    <>
      <Link
        href={PAGE_PROFIL.href}
        role="menuitem"
        onClick={apresClic}
        className="flex min-h-11 items-center gap-3 rounded-lg px-3 font-semibold text-noir hover:bg-black/5"
      >
        <PAGE_PROFIL.icone aria-hidden className="size-5" />
        {PAGE_PROFIL.nom}
      </Link>
      <form action={deconnexion}>
        <button
          type="submit"
          role="menuitem"
          className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left font-semibold text-noir hover:bg-black/5"
        >
          <LogOut aria-hidden className="size-5" />
          Déconnexion
        </button>
      </form>
    </>
  );

  return (
    <>
      {/* Ordinateur */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col bg-[#f4f2ef] bg-[url('/images/sidebar.webp')] bg-cover bg-top transition-[width] duration-200 md:flex ${
          replie ? "w-[4.75rem]" : "w-64"
        }`}
      >
        <div className={`flex items-center px-3 py-3 ${replie ? "justify-center" : "justify-between pl-6"}`}>
          {replie ? null : <Logo lien="/accueil" />}
          <button
            type="button"
            onClick={basculer}
            aria-label={replie ? "Déplier le menu" : "Replier le menu"}
            aria-expanded={!replie}
            title={replie ? "Déplier le menu" : "Replier le menu"}
            className="flex size-11 shrink-0 items-center justify-center rounded-[0.6rem] text-texte hover:bg-black/5"
          >
            {replie ? <ChevronRight aria-hidden className="size-6" /> : <ChevronLeft aria-hidden className="size-6" />}
          </button>
        </div>
        <Separateur />

        <nav aria-label="Menu principal" className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-3">
          {groupes(!replie)}
        </nav>

        {/* Pastille de la personne, en bas */}
        <div ref={zoneProfil} className="relative border-t border-black/10 p-3">
          <button
            type="button"
            onClick={() => setProfilOuvert((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={profilOuvert}
            aria-label={`Menu de ${personne.nomComplet}`}
            title={replie ? personne.nomComplet : undefined}
            className={`flex w-full items-center gap-3 rounded-[0.6rem] p-1.5 text-left hover:bg-black/5 ${
              sur(PAGE_PROFIL.href) ? "bg-black/10" : ""
            } ${replie ? "justify-center" : ""}`}
          >
            {avatar}
            {replie ? null : (
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-noir">{personne.nomComplet}</span>
                <span className="block truncate text-xs">{personne.email}</span>
              </span>
            )}
          </button>
          {profilOuvert ? (
            <div
              role="menu"
              aria-label="Mon compte"
              className={`absolute z-50 w-56 rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/10 ${
                replie ? "bottom-3 left-full ml-2" : "bottom-full left-3 mb-2"
              }`}
            >
              {actionsProfil(() => setProfilOuvert(false))}
            </div>
          ) : null}
        </div>
      </aside>

      {/* Téléphone */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-[#f4f2ef] bg-[url('/images/sidebar.webp')] bg-cover bg-center px-4 py-2 shadow-md md:hidden">
        <Logo lien="/accueil" compact />
        <button
          type="button"
          onClick={() => setOuvert(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={ouvert}
          className="flex size-11 items-center justify-center rounded-[0.6rem] bg-rose-clair text-noir"
        >
          <Menu aria-hidden className="size-7" />
        </button>
      </div>

      {ouvert && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setOuvert(false)}
            className="absolute inset-0 bg-noir/50"
          />
          <div className="relative flex h-full w-[82%] max-w-80 flex-col bg-[#f4f2ef] bg-[url('/images/sidebar.webp')] bg-cover bg-top shadow-2xl">
            <div className="flex items-start justify-between p-4">
              <Logo lien="/accueil" />
              <button
                type="button"
                onClick={() => setOuvert(false)}
                aria-label="Fermer le menu"
                className="flex size-11 items-center justify-center rounded-[0.6rem] bg-rose-clair text-noir"
              >
                <X aria-hidden className="size-7" />
              </button>
            </div>
            <nav aria-label="Menu principal" className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3">
              {groupes(true, () => setOuvert(false))}
            </nav>
            <div className="border-t border-black/10 p-3">
              <div className="mb-1 flex items-center gap-3 p-1.5">
                {avatar}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-noir">{personne.nomComplet}</span>
                  <span className="block truncate text-xs">{personne.email}</span>
                </span>
              </div>
              <div role="menu" aria-label="Mon compte">
                {actionsProfil(() => setOuvert(false))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Affiché le temps que le menu se charge (évite un saut de mise en page). */
export function MenuSquelette() {
  return (
    <>
      <aside className="hidden h-screen w-64 shrink-0 bg-[#f4f2ef] bg-[url('/images/sidebar.webp')] bg-cover bg-top md:block" />
      <div className="h-[3.75rem] bg-[#f4f2ef] bg-[url('/images/sidebar.webp')] bg-cover bg-center md:hidden" />
    </>
  );
}
