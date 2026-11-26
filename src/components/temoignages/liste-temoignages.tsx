import { MessageCircle } from "lucide-react";
import { EtatVide } from "@/components/coquille/etat-vide";
import { obtenirPersonne } from "@/lib/auth/personne";
import { lireMesTemoignages, lireTemoignages } from "@/lib/donnees/temoignages";
import { formaterJourComplet, formaterMois, jourParis } from "@/lib/format";
import { GalerieTemoignages } from "./galerie-temoignages";
import { MonJournal } from "./mon-temoignage";
import { OngletsTemoignages } from "./onglets-temoignages";

/** Initiales pour l'avatar (le nom affiché peut commencer par un marqueur comme « [test] »). */
function initiales(nom: string) {
  const mots = nom.replace(/\[[^\]]*\]/g, "").trim().split(/\s+/).filter(Boolean);
  const lettres = mots.slice(0, 2).map((m) => m[0]?.toUpperCase() ?? "");
  return lettres.join("") || "?";
}

/** Page Témoignages : « Mon journal » et « Partagés par tous ». Lit la base : à placer sous <Suspense>. */
export async function ListeTemoignages() {
  const [personne, miens, partages] = await Promise.all([obtenirPersonne(), lireMesTemoignages(), lireTemoignages()]);

  const galerie =
    partages.length === 0 ? (
      <EtatVide icone={MessageCircle} titre="Aucun témoignage pour le moment" texte="Les témoignages partagés et validés par l'équipe apparaîtront ici." />
    ) : (
      <GalerieTemoignages
        temoignages={partages.map((t) => ({
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
    );

  return (
    <OngletsTemoignages
      onglets={[
        { cle: "journal", libelle: `Mon journal (${miens.length})`, contenu: <MonJournal prenom={personne.prenom.trim() || "vous"} temoignages={miens} /> },
        { cle: "partages", libelle: `Partagés par tous (${partages.length})`, contenu: galerie },
      ]}
    />
  );
}

/** Squelette pendant le chargement : les onglets, la barre d'écriture et deux entrées en gris. */
export function ListeTemoignagesChargement() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-live="polite">
      <span className="sr-only">Chargement des témoignages…</span>
      <div className="h-11 w-72 max-w-full rounded-full bg-black/10 motion-safe:animate-pulse" />
      <div className="h-20 rounded-[1.25rem] bg-black/10 motion-safe:animate-pulse" />
      {[0, 1].map((i) => (
        <div key={i} className="h-36 rounded-[1.25rem] bg-black/10 motion-safe:animate-pulse" />
      ))}
    </div>
  );
}
