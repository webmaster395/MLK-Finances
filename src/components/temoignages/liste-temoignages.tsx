import { MessageCircle, PenLine, Quote } from "lucide-react";
import { EtatVide } from "@/components/coquille/etat-vide";
import { Avatar } from "@/components/profil/avatar";
import { lireTemoignages } from "@/lib/donnees/temoignages";
import { formaterJourComplet } from "@/lib/format";

/** Initiales pour l'avatar (le nom affiché peut commencer par un marqueur comme « [test] »). */
function initiales(nom: string) {
  const mots = nom.replace(/\[[^\]]*\]/g, "").trim().split(/\s+/).filter(Boolean);
  const lettres = mots.slice(0, 2).map((m) => m[0]?.toUpperCase() ?? "");
  return lettres.join("") || "?";
}

/** Bandeau d'introduction (même style que la page Ressources). */
function Bandeau({ nombre }: { nombre: number }) {
  return (
    <section className="overflow-hidden rounded-[0.65rem] bg-noir text-white shadow-md" aria-labelledby="titre-temoignages">
      <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-end">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-white/70">PAROLES DE PARTICIPANTS</p>
          <h1 id="titre-temoignages" className="titre-charte mt-2 max-w-2xl text-3xl !leading-[1.05] text-white sm:text-5xl">
            Les expériences de ceux qui ont suivi le parcours
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
            Les témoignages partagés par les participants et validés par l&apos;équipe. Vous aussi, écrivez ce qui vous a parlé.
          </p>
          <a href="#mon-temoignage" className="btn btn-accent mt-5 w-fit gap-2">
            <PenLine aria-hidden className="size-4" />
            Écrire un témoignage
          </a>
        </div>
        <dl className="grid grid-cols-1 gap-3">
          <div className="rounded-lg bg-white/10 p-4">
            <dd className="titre-charte text-4xl !leading-none text-white">{nombre}</dd>
            <dt className="mt-1 text-xs font-semibold text-white/70">témoignage{nombre > 1 ? "s" : ""} partagé{nombre > 1 ? "s" : ""}</dt>
          </div>
        </dl>
      </div>
    </section>
  );
}

/** Témoignages publiés : bandeau puis grille de cartes. Lit la base : à placer sous <Suspense>. */
export async function ListeTemoignages() {
  const temoignages = await lireTemoignages();

  return (
    <div className="flex flex-col gap-5">
      <Bandeau nombre={temoignages.length} />

      {temoignages.length === 0 ? (
        <EtatVide
          icone={MessageCircle}
          titre="Aucun témoignage pour le moment"
          texte="Les témoignages partagés par l'équipe apparaîtront ici."
        />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {temoignages.map((t, i) => (
            <li key={t.id} className="entree-cascade" style={{ "--i": Math.min(i, 12) } as React.CSSProperties}>
              <article className="carte-survol accueil-carte flex h-full flex-col justify-between gap-5 p-5 sm:p-6">
                <div className="flex flex-col gap-4">
                  <span aria-hidden className="flex size-12 items-center justify-center rounded-[0.6rem] bg-accent-clair text-noir">
                    <Quote className="size-6" strokeWidth={1.75} />
                  </span>
                  <blockquote className="whitespace-pre-line text-sm font-semibold leading-relaxed text-noir sm:text-base [overflow-wrap:anywhere]">
                    « {t.texte} »
                  </blockquote>
                </div>
                <footer className="flex items-center gap-3 border-t border-black/10 pt-4">
                  {t.photoUrl ? (
                    <Avatar photoUrl={t.photoUrl} initiales={initiales(t.nom_affiche)} taille="size-10" texteTaille="text-xs" />
                  ) : (
                    <span
                      aria-hidden
                      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-clair text-xs font-semibold text-noir"
                    >
                      {initiales(t.nom_affiche)}
                    </span>
                  )}
                  <span className="min-w-0">
                    <cite className="block text-sm font-semibold not-italic leading-snug text-noir [overflow-wrap:anywhere]">
                      {t.nom_affiche}
                    </cite>
                    <span className="block text-xs">{formaterJourComplet(t.creeLe)}</span>
                  </span>
                </footer>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Squelette pendant le chargement : le bandeau et trois cartes en gris. */
export function ListeTemoignagesChargement() {
  return (
    <div className="flex flex-col gap-5" role="status" aria-live="polite">
      <span className="sr-only">Chargement des témoignages…</span>
      <div className="h-60 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse sm:h-64" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-52 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
        ))}
      </div>
    </div>
  );
}
