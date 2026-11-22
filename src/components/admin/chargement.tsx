/** Squelettes de chargement de l'espace admin. */
export function ChargementListe() {
  return (
    <div className="flex flex-col gap-3" role="status" aria-live="polite">
      <span className="sr-only">Chargement…</span>
      <div className="h-72 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
    </div>
  );
}

export function ChargementPage() {
  return (
    <div className="flex flex-col gap-5" role="status" aria-live="polite">
      <span className="sr-only">Chargement…</span>
      <div className="h-14 w-64 rounded-md bg-black/10 motion-safe:animate-pulse" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="h-72 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
        <div className="h-72 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
      </div>
    </div>
  );
}
