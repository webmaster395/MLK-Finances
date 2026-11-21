import { MessageCircle, Quote } from "lucide-react";
import { EtatVide } from "@/components/coquille/etat-vide";
import { lireTemoignages } from "@/lib/donnees/temoignages";

/** Initiales pour l'avatar (le nom affiché peut commencer par un marqueur comme « [test] »). */
function initiales(nom: string) {
  const mots = nom.replace(/\[[^\]]*\]/g, "").trim().split(/\s+/).filter(Boolean);
  const lettres = mots.slice(0, 2).map((m) => m[0]?.toUpperCase() ?? "");
  return lettres.join("") || "?";
}

/** Témoignages des participants (lecture seule). Lit la base : à placer sous <Suspense>. */
export async function ListeTemoignages() {
  const temoignages = await lireTemoignages();

  if (temoignages.length === 0) {
    return (
      <EtatVide
        icone={MessageCircle}
        titre="Aucun témoignage pour le moment"
        texte="Les expériences des participants apparaîtront ici dès qu'elles seront publiées."
      />
    );
  }

  return (
    <ul className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
      {temoignages.map((t) => (
        <li key={t.id} className="accueil-carte flex flex-col gap-4 p-5 sm:p-6">
          <Quote aria-hidden className="size-8 text-rose" />
          <blockquote className="flex-1 text-lg font-semibold text-noir [overflow-wrap:anywhere]">« {t.texte} »</blockquote>
          <footer className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-noir font-titre text-lg text-white"
            >
              {initiales(t.nom_affiche)}
            </span>
            <cite className="min-w-0 font-titre text-2xl font-semibold not-italic leading-tight text-noir [overflow-wrap:anywhere]">
              {t.nom_affiche}
            </cite>
          </footer>
        </li>
      ))}
    </ul>
  );
}

/** Squelette pendant le chargement de la liste. */
export function ListeTemoignagesChargement() {
  return (
    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3" role="status" aria-live="polite">
      <span className="sr-only">Chargement des témoignages…</span>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-48 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
      ))}
    </div>
  );
}
