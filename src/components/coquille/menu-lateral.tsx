"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { PAGES_PARTICIPANT } from "@/lib/navigation";

/**
 * Menu de l'espace participant.
 * - Ordinateur : barre latérale à gauche, repliable (icônes seules).
 * - Téléphone : barre du haut avec un bouton qui ouvre le menu.
 * Ce composant lit l'adresse de la page : il doit toujours être sous <Suspense>.
 */
export function MenuLateral() {
  const chemin = usePathname();
  const [replie, setReplie] = useState(false);
  const [ouvert, setOuvert] = useState(false);

  // Échap ferme le menu du téléphone
  useEffect(() => {
    if (!ouvert) return;
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOuvert(false);
    };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [ouvert]);

  const liens = (afficherNoms: boolean, apresClic?: () => void) => (
    <ul className="flex flex-col gap-1">
      {PAGES_PARTICIPANT.map(({ href, nom, icone: Icone }) => {
        const actif = chemin === href || chemin.startsWith(`${href}/`);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={apresClic}
              aria-current={actif ? "page" : undefined}
              title={afficherNoms ? undefined : nom}
              className={`flex min-h-11 items-center gap-3 rounded-[0.6rem] px-3 text-[1.02rem] font-semibold tracking-tight text-texte transition-colors hover:bg-rose-clair/50 ${
                actif ? "bg-rose-clair shadow-sm" : ""
              } ${afficherNoms ? "" : "justify-center"}`}
            >
              <Icone aria-hidden className="size-6 shrink-0 text-noir" strokeWidth={2} />
              <span className={afficherNoms ? "" : "sr-only"}>{nom}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Ordinateur */}
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col gap-6 overflow-y-auto bg-[url('/images/sidebar.webp')] bg-cover bg-top px-3 py-6 transition-[width] duration-200 md:flex ${
          replie ? "w-[4.75rem]" : "w-64"
        }`}
      >
        <div className={replie ? "flex justify-center" : "pl-3"}>
          {replie ? (
            <Link
              href="/accueil"
              aria-label="MLK Parcours Finances — accueil"
              className="titre-charte text-3xl"
            >
              MLK
            </Link>
          ) : (
            <Logo lien="/accueil" />
          )}
        </div>
        <nav aria-label="Menu principal" className="flex-1">
          {liens(!replie)}
        </nav>
        <button
          type="button"
          onClick={() => setReplie((v) => !v)}
          aria-label={replie ? "Déplier le menu" : "Replier le menu"}
          aria-expanded={!replie}
          className={`flex min-h-11 items-center gap-3 rounded-[0.6rem] px-3 font-semibold text-texte hover:bg-rose-clair/50 ${
            replie ? "justify-center" : ""
          }`}
        >
          {replie ? (
            <PanelLeftOpen aria-hidden className="size-6" />
          ) : (
            <>
              <PanelLeftClose aria-hidden className="size-6" />
              Replier
            </>
          )}
        </button>
      </aside>

      {/* Téléphone */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-[url('/images/sidebar.webp')] bg-cover bg-center px-4 py-2 shadow-md md:hidden">
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
          <div className="relative flex h-full w-[82%] max-w-80 flex-col gap-6 overflow-y-auto bg-fond bg-[url('/images/sidebar.webp')] bg-cover bg-top p-4 shadow-2xl">
            <div className="flex items-start justify-between">
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
            <nav aria-label="Menu principal">{liens(true, () => setOuvert(false))}</nav>
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
      <aside className="hidden h-screen w-64 shrink-0 bg-[url('/images/sidebar.webp')] bg-cover bg-top md:block" />
      <div className="h-[3.75rem] bg-[url('/images/sidebar.webp')] bg-cover bg-center md:hidden" />
    </>
  );
}
