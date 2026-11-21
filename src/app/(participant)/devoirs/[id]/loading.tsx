export default function Loading() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-live="polite">
      <span className="sr-only">Chargement du devoir…</span>
      <div className="h-6 w-40 rounded-md bg-black/10 motion-safe:animate-pulse" />
      <div className="h-12 w-2/3 max-w-lg rounded-md bg-black/10 motion-safe:animate-pulse" />
      <div className="h-24 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
      <div className="h-48 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
    </div>
  );
}
