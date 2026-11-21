/** Squelette pendant le chargement du profil. */
export function ProfilChargement() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-live="polite">
      <span className="sr-only">Chargement de votre profil…</span>
      <div className="h-44 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
      <div className="h-96 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
    </div>
  );
}
