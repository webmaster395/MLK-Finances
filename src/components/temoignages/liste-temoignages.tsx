import { MessageCircle, Quote } from "lucide-react";
import { EtatVide } from "@/components/coquille/etat-vide";
import { Avatar } from "@/components/profil/avatar";
import { lireTemoignages } from "@/lib/donnees/temoignages";

const COULEURS_BORDURE = ["#d634ba", "#e95609"];

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
    <section className="accueil-carte p-5 sm:p-7" aria-labelledby="titre-temoignages">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs sm:text-sm">Paroles de participants</p>
          <h2 id="titre-temoignages" className="titre-charte mt-1 text-2xl !leading-tight sm:text-3xl lg:text-4xl">
            Retours d&apos;expérience
          </h2>
        </div>
        <span className="rounded-full bg-black/5 px-3.5 py-1.5 text-xs font-semibold tracking-[0.06em] text-noir">
          {temoignages.length} témoignage{temoignages.length > 1 ? "s" : ""}
        </span>
      </div>

      <hr className="my-4 border-black/10" />

      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {temoignages.map((t, index) => (
          <li
            key={t.id}
            className="flex flex-col justify-between gap-4 rounded-lg border border-l-4 border-black/15 bg-white/40 p-5"
            style={{ borderLeftColor: COULEURS_BORDURE[index % COULEURS_BORDURE.length] }}
          >
            <div className="flex flex-col gap-3">
              <Quote aria-hidden className="size-5 text-rose" />
              <blockquote className="text-sm font-semibold leading-relaxed text-noir sm:text-base [overflow-wrap:anywhere]">
                « {t.texte} »
              </blockquote>
            </div>

            <footer className="flex items-center gap-3 border-t border-black/10 pt-3.5">
              {t.photoUrl ? (
                <Avatar photoUrl={t.photoUrl} initiales={initiales(t.nom_affiche)} taille="size-9" texteTaille="text-xs" />
              ) : (
                <span
                  aria-hidden
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rose-clair text-xs font-semibold text-noir"
                >
                  {initiales(t.nom_affiche)}
                </span>
              )}
              <cite className="min-w-0 text-sm font-semibold not-italic leading-snug text-noir [overflow-wrap:anywhere]">
                {t.nom_affiche}
              </cite>
            </footer>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Squelette pendant le chargement de la liste. */
export function ListeTemoignagesChargement() {
  return (
    <section className="accueil-carte p-5 sm:p-7" role="status" aria-live="polite">
      <span className="sr-only">Chargement des témoignages…</span>
      <p className="text-sm">Paroles de participants</p>
      <h2 className="titre-charte mt-1 text-3xl !leading-tight sm:text-4xl">Retours d&apos;expérience</h2>
      <hr className="my-4 border-black/10" />
      <div className="grid gap-4 motion-safe:animate-pulse md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-44 rounded-lg bg-black/10" />
        ))}
      </div>
    </section>
  );
}
