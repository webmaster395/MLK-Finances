/** Squelette de l'accueil : les mêmes blocs que la page, en gris. */
export default function Loading() {
  return (
    <div className="flex flex-col gap-2" role="status" aria-live="polite">
      <span className="sr-only">Chargement…</span>
      <div className="h-60 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
      <div className="h-44 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
      <div className="grid gap-2 lg:grid-cols-3">
        <div className="h-52 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
        <div className="h-52 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
        <div className="h-52 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
      </div>
      <div className="h-36 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
    </div>
  );
}
