import { MessageCircle, PenLine } from "lucide-react";
import { EtatVide } from "@/components/coquille/etat-vide";
import { lireTemoignages } from "@/lib/donnees/temoignages";
import { formaterJourComplet, formaterMois, jourParis } from "@/lib/format";
import { GalerieTemoignages } from "./galerie-temoignages";

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

/** Témoignages validés : bandeau puis galerie par mois. Lit la base : à placer sous <Suspense>. */
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
        <GalerieTemoignages
          temoignages={temoignages.map((t) => ({
            id: t.id,
            nom: t.nom_affiche,
            texte: t.texte,
            initiales: initiales(t.nom_affiche),
            photoUrl: t.photoUrl,
            date: formaterJourComplet(t.creeLe),
            moisCle: jourParis(t.creeLe).slice(0, 7),
            moisLibelle: formaterMois(t.creeLe),
          }))}
        />
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
