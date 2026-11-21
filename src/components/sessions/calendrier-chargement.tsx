/** Squelette du calendrier pendant le chargement. */
export function CalendrierChargement() {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]" role="status" aria-live="polite">
      <span className="sr-only">Chargement du calendrier…</span>
      <div className="h-[28rem] rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
      <div className="h-80 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
    </div>
  );
}
