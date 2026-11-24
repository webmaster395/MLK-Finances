"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { PAGES_ADMIN } from "@/lib/navigation";

/**
 * Liste déroulante de l'administration, en haut à droite : tableau de bord, participants, séances, etc.
 * Elle remplace un second menu : l'administrateur garde le menu des participants à gauche.
 * Lit l'adresse de la page : toujours sous <Suspense>.
 */
export function ListeAdmin() {
  const chemin = usePathname();
  const [ouvert, setOuvert] = useState(false);
  const conteneur = useRef<HTMLDivElement>(null);

  // Se referme quand la page change
  const [pageVue, setPageVue] = useState(chemin);
  if (pageVue !== chemin) {
    setPageVue(chemin);
    if (ouvert) setOuvert(false);
  }

  useEffect(() => {
    if (!ouvert) return;
    function surTouche(e: KeyboardEvent) {
      if (e.key === "Escape") setOuvert(false);
    }
    function surClicExterieur(e: PointerEvent) {
      if (conteneur.current && !conteneur.current.contains(e.target as Node)) setOuvert(false);
    }
    window.addEventListener("keydown", surTouche);
    window.addEventListener("pointerdown", surClicExterieur);
    return () => {
      window.removeEventListener("keydown", surTouche);
      window.removeEventListener("pointerdown", surClicExterieur);
    };
  }, [ouvert]);

  const sur = (href: string) => (href === "/admin" ? chemin === href : chemin === href || chemin.startsWith(`${href}/`));
  const actuelle = PAGES_ADMIN.find((p) => sur(p.href));

  return (
    <div ref={conteneur} className="relative">
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        aria-expanded={ouvert}
        aria-label="Pages de l'administration"
        className="flex min-h-11 touch-manipulation items-center gap-2 rounded-[0.9rem] bg-accent px-3.5 text-sm font-semibold text-white shadow-sm transition-[filter] hover:brightness-110 sm:min-h-10"
      >
        <ShieldCheck aria-hidden className="size-4 shrink-0" />
        <span className="max-w-[9rem] truncate">{actuelle?.nom ?? "Administration"}</span>
        <ChevronDown aria-hidden className={`size-4 shrink-0 transition-transform ${ouvert ? "rotate-180" : ""}`} />
      </button>

      {ouvert ? (
        <ul className="absolute right-0 top-full z-50 mt-2 w-60 rounded-[1rem] border border-black/10 bg-carte p-1.5 shadow-xl">
          {PAGES_ADMIN.map(({ href, nom, icone: Icone }) => {
            const actif = sur(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={actif ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-[0.7rem] px-3 text-sm font-semibold text-texte transition-colors hover:bg-black/5 ${
                    actif ? "bg-accent/15" : ""
                  }`}
                >
                  <Icone aria-hidden className="size-5 shrink-0 text-noir" strokeWidth={1.75} />
                  {nom}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
