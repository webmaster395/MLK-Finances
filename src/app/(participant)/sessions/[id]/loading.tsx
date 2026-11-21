export default function Loading() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-live="polite">
      <span className="sr-only">Chargement de la session…</span>
      <div className="h-6 w-48 rounded-md bg-black/10 motion-safe:animate-pulse" />
      <div className="h-12 w-2/3 max-w-lg rounded-md bg-black/10 motion-safe:animate-pulse" />
      <div className="h-40 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
    </div>
  );
}
