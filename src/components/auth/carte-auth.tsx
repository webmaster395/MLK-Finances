import type { ReactNode } from "react";

/** Carte centrale des pages publiques (connexion, inscription, mot de passe). */
export function CarteAuth({ titre, sousTitre, children }: { titre: string; sousTitre?: string; children: ReactNode }) {
  return (
    <section className="carte w-full max-w-md">
      <h1 className="titre-charte text-4xl">
        <span className="pinceau">{titre}</span>
      </h1>
      {sousTitre ? <p className="mt-3 font-titre text-xl font-medium tracking-wide">{sousTitre}</p> : null}
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** Squelette pendant le chargement d'une page publique. */
export function CarteAuthChargement() {
  return (
    <div className="carte w-full max-w-md" role="status" aria-live="polite">
      <span className="sr-only">Chargement…</span>
      <div className="flex flex-col gap-4 motion-safe:animate-pulse">
        <div className="h-10 w-3/4 rounded-md bg-black/10" />
        <div className="h-11 w-full rounded-md bg-black/10" />
        <div className="h-11 w-full rounded-md bg-black/10" />
        <div className="h-11 w-full rounded-md bg-black/10" />
      </div>
    </div>
  );
}
