/** Squelette affiché pendant le chargement d'une page (utilisé par chaque loading.tsx). */
export function Chargement() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-live="polite">
      <span className="sr-only">Chargement…</span>
      <div className="flex flex-col gap-3 motion-safe:animate-pulse">
        <div className="h-12 w-2/3 max-w-md rounded-md bg-black/10" />
        <div className="h-7 w-1/2 max-w-xs rounded-md bg-black/10" />
      </div>
      <div className="carte flex flex-col gap-3 motion-safe:animate-pulse">
        <div className="h-6 w-1/3 rounded-md bg-black/10" />
        <div className="h-4 w-full rounded-md bg-black/10" />
        <div className="h-4 w-5/6 rounded-md bg-black/10" />
      </div>
    </div>
  );
}
