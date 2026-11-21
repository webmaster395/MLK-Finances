function initiales(nom: string) {
  return nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m[0]?.toUpperCase() ?? "")
    .join("");
}

/** Intervenants d'une séance : pastilles d'initiales (les photos viendront plus tard) et noms. */
export function Intervenants({ noms }: { noms: string[] }) {
  if (noms.length === 0) return null;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span aria-hidden className="flex shrink-0 -space-x-2">
        {noms.map((nom) => (
          <span
            key={nom}
            className="flex size-8 items-center justify-center rounded-full border-2 border-carte bg-black/10 text-[11px] font-semibold text-noir"
          >
            {initiales(nom)}
          </span>
        ))}
      </span>
      <span className="[overflow-wrap:anywhere]">
        <span className="sr-only">Avec </span>
        {noms.join(" · ")}
      </span>
    </div>
  );
}
