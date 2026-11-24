export default function Loading() {
  return (
    <main className="flex flex-1 flex-col items-center bg-fond px-4 py-8 sm:py-12">
      <div role="status" aria-live="polite" className="flex w-full max-w-5xl flex-col gap-8">
        <span className="sr-only">Chargement des témoignages…</span>
        <div className="h-10 w-48 rounded-md bg-black/10 motion-safe:animate-pulse" />
        <div className="h-12 w-3/4 rounded-md bg-black/10 motion-safe:animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-48 rounded-[1.25rem] bg-black/10 motion-safe:animate-pulse" />
          ))}
        </div>
      </div>
    </main>
  );
}
