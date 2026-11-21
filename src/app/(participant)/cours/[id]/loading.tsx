export default function Loading() {
  return (
    <div className="flex flex-col gap-5" role="status" aria-live="polite">
      <span className="sr-only">Chargement du cours…</span>
      <div className="h-6 w-40 rounded-md bg-black/10 motion-safe:animate-pulse" />
      <div className="h-36 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <div className="h-72 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
        <div className="h-52 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
      </div>
    </div>
  );
}
